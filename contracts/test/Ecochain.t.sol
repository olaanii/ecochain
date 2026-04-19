// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Test} from "forge-std/Test.sol";
import {EcoReward} from "../src/EcoReward.sol";
import {EcoVerifier} from "../src/EcoVerifier.sol";

/**
 * Post-hardening integration tests for EcoReward + EcoVerifier.
 *
 * Covers:
 *  - Happy path: oracle-signed attestation → mint.
 *  - Replay protection: proofHash uniqueness and per-user nonce monotonicity.
 *  - Authentication: signatures from non-ORACLE_ROLE signers are rejected.
 *  - Task lifecycle: inactive tasks reject claims.
 *  - Reward cap: oracle cannot quote above `task.maxReward`.
 *  - Deadline: expired signatures rejected.
 *  - Pause: halts minting.
 *  - Access control: MINTER_ROLE required to mint directly on token.
 *  - Supply cap: token enforces its immutable cap.
 */
contract EcochainTest is Test {
    EcoReward internal token;
    EcoVerifier internal verifier;

    address internal admin = address(0xA11CE);
    address internal user  = address(0xBEEF);
    uint256 internal oraclePk = 0xA11CE0DE;
    address internal oracle;

    uint256 internal constant CAP = 1_000_000e18;
    bytes32 internal constant TASK = keccak256("test_task");

    function setUp() public {
        vm.warp(1_700_000_000);
        oracle = vm.addr(oraclePk);

        vm.startPrank(admin);
        token = new EcoReward(admin, CAP);
        verifier = new EcoVerifier(admin, oracle, address(token));
        token.grantRole(token.MINTER_ROLE(), address(verifier));
        verifier.setTask(TASK, 10e18, 20e18, true);
        vm.stopPrank();
    }

    // ----------------------- helpers -----------------------

    function _sign(
        address forUser,
        bytes32 taskId,
        bytes32 proofHash,
        uint256 reward,
        uint256 nonce,
        uint256 deadline,
        uint256 signerPk
    ) internal view returns (bytes memory) {
        bytes32 digest = verifier.hashAttestation(forUser, taskId, proofHash, reward, nonce, deadline);
        (uint8 v, bytes32 r, bytes32 s) = vm.sign(signerPk, digest);
        return abi.encodePacked(r, s, v);
    }

    // ----------------------- happy path -----------------------

    function test_SubmitProof_HappyPath() public {
        bytes32 proofHash = keccak256("proof-1");
        uint256 deadline = block.timestamp + 1 hours;
        bytes memory sig = _sign(user, TASK, proofHash, 10e18, 0, deadline, oraclePk);

        vm.prank(user);
        verifier.submitProof(TASK, proofHash, 10e18, 0, deadline, sig);

        assertEq(token.balanceOf(user), 10e18);
        assertEq(verifier.nonces(user), 1);
        assertTrue(verifier.usedProofHashes(proofHash));
    }

    // ----------------------- authentication -----------------------

    function test_RejectsBadSigner() public {
        uint256 attackerPk = 0xBADBAD;
        bytes32 proofHash = keccak256("forged");
        uint256 deadline = block.timestamp + 1 hours;
        bytes memory sig = _sign(user, TASK, proofHash, 10e18, 0, deadline, attackerPk);

        vm.prank(user);
        vm.expectRevert(abi.encodeWithSelector(EcoVerifier.BadSigner.selector, vm.addr(attackerPk)));
        verifier.submitProof(TASK, proofHash, 10e18, 0, deadline, sig);
    }

    function test_RejectsSignatureForDifferentUser() public {
        address otherUser = address(0xCAFE);
        bytes32 proofHash = keccak256("cross-user");
        uint256 deadline = block.timestamp + 1 hours;
        // Signature was issued for `otherUser` but `user` tries to consume it.
        bytes memory sig = _sign(otherUser, TASK, proofHash, 10e18, 0, deadline, oraclePk);

        vm.prank(user);
        vm.expectRevert();
        verifier.submitProof(TASK, proofHash, 10e18, 0, deadline, sig);
    }

    // ----------------------- replay & nonce -----------------------

    function test_RejectsReplayedProofHash() public {
        bytes32 proofHash = keccak256("dup");
        uint256 deadline = block.timestamp + 1 hours;
        bytes memory sig = _sign(user, TASK, proofHash, 10e18, 0, deadline, oraclePk);

        vm.prank(user);
        verifier.submitProof(TASK, proofHash, 10e18, 0, deadline, sig);

        // Second attempt with same proof but a fresh (nonce=1) attestation.
        bytes memory sig2 = _sign(user, TASK, proofHash, 10e18, 1, deadline, oraclePk);
        vm.prank(user);
        vm.expectRevert(abi.encodeWithSelector(EcoVerifier.ProofReused.selector, proofHash));
        verifier.submitProof(TASK, proofHash, 10e18, 1, deadline, sig2);
    }

    function test_RejectsOutOfOrderNonce() public {
        bytes32 proofHash = keccak256("nonce-mismatch");
        uint256 deadline = block.timestamp + 1 hours;
        // Oracle signed nonce=5 but user's current nonce is 0.
        bytes memory sig = _sign(user, TASK, proofHash, 10e18, 5, deadline, oraclePk);

        vm.prank(user);
        vm.expectRevert(abi.encodeWithSelector(EcoVerifier.InvalidNonce.selector, 0, 5));
        verifier.submitProof(TASK, proofHash, 10e18, 5, deadline, sig);
    }

    // ----------------------- task lifecycle -----------------------

    function test_RejectsInactiveTask() public {
        vm.prank(admin);
        verifier.setTaskActive(TASK, false);

        bytes32 proofHash = keccak256("inactive");
        uint256 deadline = block.timestamp + 1 hours;
        bytes memory sig = _sign(user, TASK, proofHash, 10e18, 0, deadline, oraclePk);

        vm.prank(user);
        vm.expectRevert(abi.encodeWithSelector(EcoVerifier.TaskInactive.selector, TASK));
        verifier.submitProof(TASK, proofHash, 10e18, 0, deadline, sig);
    }

    function test_RejectsUnknownTask() public {
        bytes32 unknown = keccak256("no_such_task");
        bytes32 proofHash = keccak256("x");
        uint256 deadline = block.timestamp + 1 hours;
        bytes memory sig = _sign(user, unknown, proofHash, 10e18, 0, deadline, oraclePk);

        vm.prank(user);
        vm.expectRevert(abi.encodeWithSelector(EcoVerifier.TaskUnknown.selector, unknown));
        verifier.submitProof(unknown, proofHash, 10e18, 0, deadline, sig);
    }

    // ----------------------- reward cap & deadline -----------------------

    function test_RejectsRewardAboveCap() public {
        bytes32 proofHash = keccak256("too-generous");
        uint256 deadline = block.timestamp + 1 hours;
        uint256 over = 25e18; // > task.maxReward (20e18)
        bytes memory sig = _sign(user, TASK, proofHash, over, 0, deadline, oraclePk);

        vm.prank(user);
        vm.expectRevert(abi.encodeWithSelector(EcoVerifier.RewardTooHigh.selector, over, 20e18));
        verifier.submitProof(TASK, proofHash, over, 0, deadline, sig);
    }

    function test_RejectsExpiredSignature() public {
        bytes32 proofHash = keccak256("stale");
        uint256 deadline = block.timestamp - 1;
        bytes memory sig = _sign(user, TASK, proofHash, 10e18, 0, deadline, oraclePk);

        vm.prank(user);
        vm.expectRevert();
        verifier.submitProof(TASK, proofHash, 10e18, 0, deadline, sig);
    }

    // ----------------------- pause -----------------------

    function test_PauseHaltsClaims() public {
        vm.prank(admin);
        verifier.pause();

        bytes32 proofHash = keccak256("paused");
        uint256 deadline = block.timestamp + 1 hours;
        bytes memory sig = _sign(user, TASK, proofHash, 10e18, 0, deadline, oraclePk);

        vm.prank(user);
        vm.expectRevert(); // Pausable: EnforcedPause()
        verifier.submitProof(TASK, proofHash, 10e18, 0, deadline, sig);
    }

    // ----------------------- EcoReward access control & cap -----------------------

    function test_NonMinter_CannotMint() public {
        vm.prank(user);
        vm.expectRevert(); // AccessControlUnauthorizedAccount
        token.mint(user, 1e18);
    }

    function test_SupplyCap_Enforced() public {
        // Grant user MINTER_ROLE so we can probe the cap directly.
        vm.prank(admin);
        token.grantRole(token.MINTER_ROLE(), user);

        vm.prank(user);
        vm.expectRevert(abi.encodeWithSelector(EcoReward.CapExceeded.selector, CAP + 1, CAP));
        token.mint(user, CAP + 1);
    }

    function test_TokenPause_BlocksTransfers() public {
        // Mint some tokens first.
        bytes32 proofHash = keccak256("pre-pause");
        uint256 deadline = block.timestamp + 1 hours;
        bytes memory sig = _sign(user, TASK, proofHash, 10e18, 0, deadline, oraclePk);
        vm.prank(user);
        verifier.submitProof(TASK, proofHash, 10e18, 0, deadline, sig);

        vm.prank(admin);
        token.pause();

        vm.prank(user);
        vm.expectRevert();
        token.transfer(address(0xDEAD), 1);
    }
}
