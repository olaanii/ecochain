// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Test.sol";
import "../src/EcoReward.sol";
import "../src/EcoVerifier.sol";

/**
 * @title EcoRewardVerifierTest
 * @dev Coverage tests for EcoReward + EcoVerifier (C-5, C-6).
 */
contract EcoRewardVerifierTest is Test {
    EcoReward internal token;
    EcoVerifier internal verifier;

    address internal minter = address(0x10);
    address internal pauser = address(0x11);
    address internal user1  = address(0x20);
    address internal user2  = address(0x21);
    address internal nobody = address(0x30);

    uint256 internal oracleKey = 0xABC123;
    address internal oracle;

    function setUp() public {
        vm.warp(100 hours);

        token    = new EcoReward();
        verifier = new EcoVerifier(address(token));
        oracle   = vm.addr(oracleKey);

        token.grantRole(token.MINTER_ROLE(),  address(verifier));
        token.grantRole(token.MINTER_ROLE(),  minter);
        token.grantRole(token.PAUSER_ROLE(),  pauser);
        verifier.grantRole(verifier.ORACLE_ROLE(), oracle);

        verifier.setTask("task_a", 100e18);
        verifier.setTask("task_b",  50e18);
    }

    // ── EcoReward: metadata ───────────────────────────────────────────────────

    function test_Eco_NameSymbol() public view {
        assertEq(token.name(),   "Ecochain Token");
        assertEq(token.symbol(), "ECO");
    }

    function test_Eco_Mint() public {
        vm.prank(minter);
        token.mint(user1, 1000e18);
        assertEq(token.balanceOf(user1), 1000e18);
        assertEq(token.totalSupply(),    1000e18);
    }

    function test_Eco_MintNonMinterReverts() public {
        vm.prank(nobody);
        vm.expectRevert();
        token.mint(user1, 1e18);
    }

    function test_Eco_Transfer() public {
        vm.prank(minter);
        token.mint(user1, 500e18);
        vm.prank(user1);
        token.transfer(user2, 200e18);
        assertEq(token.balanceOf(user1), 300e18);
        assertEq(token.balanceOf(user2), 200e18);
    }

    // ── EcoReward: pause ──────────────────────────────────────────────────────

    function test_Eco_PauseBlocksTransfer() public {
        vm.prank(minter); token.mint(user1, 500e18);
        vm.prank(pauser); token.pause();

        vm.prank(user1);
        vm.expectRevert(abi.encodeWithSelector(bytes4(keccak256("EnforcedPause()"))));
        token.transfer(user2, 100e18);
    }

    function test_Eco_PauseBlocksMint() public {
        vm.prank(pauser); token.pause();
        vm.prank(minter);
        vm.expectRevert(abi.encodeWithSelector(bytes4(keccak256("EnforcedPause()"))));
        token.mint(user1, 1e18);
    }

    function test_Eco_UnpauseResumesTransfers() public {
        vm.prank(minter); token.mint(user1, 500e18);
        vm.prank(pauser); token.pause();
        vm.prank(pauser); token.unpause();
        vm.prank(user1);  token.transfer(user2, 100e18);
        assertEq(token.balanceOf(user2), 100e18);
    }

    function test_Eco_PauseNonPauserReverts() public {
        vm.prank(nobody);
        vm.expectRevert();
        token.pause();
    }

    function test_Eco_UnpauseNonPauserReverts() public {
        vm.prank(pauser); token.pause();
        vm.prank(nobody);
        vm.expectRevert();
        token.unpause();
    }

    function test_Eco_GrantRevokeMinterRole() public {
        address newMinter = address(0x99);
        token.grantRole(token.MINTER_ROLE(), newMinter);
        vm.prank(newMinter); token.mint(user1, 1e18);
        assertEq(token.balanceOf(user1), 1e18);

        token.revokeRole(token.MINTER_ROLE(), newMinter);
        vm.prank(newMinter);
        vm.expectRevert();
        token.mint(user1, 1e18);
    }

    // ── EcoVerifier: admin ────────────────────────────────────────────────────

    function test_Verifier_SetTaskUnauthorized() public {
        vm.prank(nobody);
        vm.expectRevert();
        verifier.setTask("bad", 1e18);
    }

    function test_Verifier_SetTaskUpdatesReward() public {
        verifier.setTask("task_a", 200e18);
        (uint256 reward, bool exists) = verifier.tasks("task_a");
        assertEq(reward, 200e18);
        assertTrue(exists);
    }

    function test_Verifier_SetEcoTokenZeroReverts() public {
        vm.expectRevert("EcoVerifier: Zero address");
        verifier.setEcoToken(address(0));
    }

    function test_Verifier_SetEcoTokenUnauthorized() public {
        vm.prank(nobody);
        vm.expectRevert();
        verifier.setEcoToken(address(0x1));
    }

    // ── EcoVerifier: legacy submitProof ──────────────────────────────────────

    function test_Verifier_ProofUnknownTask() public {
        vm.prank(user1);
        vm.expectRevert("EcoVerifier: Task not found");
        verifier.submitProof("no_task", "h", block.timestamp);
    }

    function test_Verifier_ProofFutureTimestamp() public {
        vm.prank(user1);
        vm.expectRevert("EcoVerifier: Proof in the future");
        verifier.submitProof("task_a", "h", block.timestamp + 1);
    }

    function test_Verifier_ProofExpired() public {
        vm.prank(user1);
        vm.expectRevert("EcoVerifier: Proof expired (>48h)");
        verifier.submitProof("task_a", "oldhash", block.timestamp - 49 hours);
    }

    function test_Verifier_ProofSuccess() public {
        vm.prank(user1);
        verifier.submitProof("task_a", "uniquehash", block.timestamp);
        assertEq(token.balanceOf(user1), 100e18);
    }

    function test_Verifier_ProofDuplicateReverts() public {
        vm.prank(user1); verifier.submitProof("task_a", "dupehash", block.timestamp);
        vm.prank(user2);
        vm.expectRevert("EcoVerifier: Proof already used");
        verifier.submitProof("task_a", "dupehash", block.timestamp);
    }

    // ── EcoVerifier: pause ────────────────────────────────────────────────────

    function test_Verifier_PauseBlocksProof() public {
        verifier.pause();
        vm.prank(user1);
        vm.expectRevert(abi.encodeWithSelector(bytes4(keccak256("EnforcedPause()"))));
        verifier.submitProof("task_a", "ph", block.timestamp);
    }

    function test_Verifier_PauseBlocksAttested() public {
        verifier.pause();
        bytes memory sig = _sign(user1, "task_a", 10e18, 0, block.timestamp + 1 hours);
        vm.prank(user1);
        vm.expectRevert(abi.encodeWithSelector(bytes4(keccak256("EnforcedPause()"))));
        verifier.submitAttestedProof("task_a", 10e18, 0, block.timestamp + 1 hours, sig);
    }

    function test_Verifier_UnpauseResumes() public {
        verifier.pause();
        verifier.unpause();
        vm.prank(user1);
        verifier.submitProof("task_a", "resumehash", block.timestamp);
        assertEq(token.balanceOf(user1), 100e18);
    }

    // ── EcoVerifier: EIP-712 oracle attestation ───────────────────────────────

    function test_Attested_Success() public {
        uint256 reward   = 75e18;
        uint256 deadline = block.timestamp + 1 hours;
        bytes memory sig = _sign(user1, "task_a", reward, 0, deadline);

        vm.prank(user1);
        verifier.submitAttestedProof("task_a", reward, 0, deadline, sig);

        assertEq(token.balanceOf(user1), reward);
        assertEq(verifier.getNonce(user1), 1);
    }

    function test_Attested_ReplayReverts() public {
        uint256 reward   = 75e18;
        uint256 deadline = block.timestamp + 1 hours;
        bytes memory sig = _sign(user1, "task_a", reward, 0, deadline);

        vm.startPrank(user1);
        verifier.submitAttestedProof("task_a", reward, 0, deadline, sig);
        vm.expectRevert("EcoVerifier: Invalid nonce");
        verifier.submitAttestedProof("task_a", reward, 0, deadline, sig);
        vm.stopPrank();
    }

    function test_Attested_ExpiredDeadline() public {
        uint256 deadline = block.timestamp - 1;
        bytes memory sig = _sign(user1, "task_a", 10e18, 0, deadline);
        vm.prank(user1);
        vm.expectRevert("EcoVerifier: Attestation expired");
        verifier.submitAttestedProof("task_a", 10e18, 0, deadline, sig);
    }

    function test_Attested_WrongNonce() public {
        uint256 deadline = block.timestamp + 1 hours;
        bytes memory sig = _sign(user1, "task_a", 10e18, 99, deadline);
        vm.prank(user1);
        vm.expectRevert("EcoVerifier: Invalid nonce");
        verifier.submitAttestedProof("task_a", 10e18, 99, deadline, sig);
    }

    function test_Attested_UnknownTask() public {
        uint256 deadline = block.timestamp + 1 hours;
        bytes memory sig = _sign(user1, "no_task", 10e18, 0, deadline);
        vm.prank(user1);
        vm.expectRevert("EcoVerifier: Task not found");
        verifier.submitAttestedProof("no_task", 10e18, 0, deadline, sig);
    }

    function test_Attested_WrongSignerReverts() public {
        uint256 wrongKey = 0xDEAD;
        uint256 deadline = block.timestamp + 1 hours;

        // sign with a key that does NOT have ORACLE_ROLE
        bytes32 structHash = keccak256(abi.encode(
            keccak256("Attestation(address user,string taskId,uint256 reward,uint256 nonce,uint256 deadline)"),
            user1,
            keccak256(bytes("task_a")),
            uint256(10e18),
            uint256(0),
            deadline
        ));
        bytes32 digest = keccak256(
            abi.encodePacked("\x19\x01", verifier.domainSeparator(), structHash)
        );
        (uint8 v, bytes32 r, bytes32 s) = vm.sign(wrongKey, digest);
        bytes memory badSig = abi.encodePacked(r, s, v);

        vm.prank(user1);
        vm.expectRevert("EcoVerifier: Invalid oracle signature");
        verifier.submitAttestedProof("task_a", 10e18, 0, deadline, badSig);
    }

    function test_Attested_SequentialNonces() public {
        uint256 deadline = block.timestamp + 2 hours;

        bytes memory sig0 = _sign(user1, "task_a", 100e18, 0, deadline);
        bytes memory sig1 = _sign(user1, "task_b",  50e18, 1, deadline);

        vm.startPrank(user1);
        verifier.submitAttestedProof("task_a", 100e18, 0, deadline, sig0);
        verifier.submitAttestedProof("task_b",  50e18, 1, deadline, sig1);
        vm.stopPrank();

        assertEq(token.balanceOf(user1), 150e18);
        assertEq(verifier.getNonce(user1), 2);
    }

    function test_Verifier_GetNonce() public view {
        assertEq(verifier.getNonce(user1), 0);
        assertEq(verifier.getNonce(user2), 0);
    }

    function test_Verifier_DomainSeparatorNonZero() public view {
        assertTrue(verifier.domainSeparator() != bytes32(0));
    }

    // ── Fuzz ──────────────────────────────────────────────────────────────────

    function testFuzz_Eco_Mint(address to, uint128 amount) public {
        vm.assume(to != address(0));
        vm.prank(minter);
        token.mint(to, amount);
        assertEq(token.balanceOf(to), amount);
    }

    function testFuzz_Verifier_ProofBoundary(uint256 secsOld) public {
        secsOld = bound(secsOld, 0, 47 hours);
        vm.prank(user1);
        verifier.submitProof("task_a", string(abi.encodePacked(secsOld)), block.timestamp - secsOld);
        assertEq(token.balanceOf(user1), 100e18);
    }

    // ── Internal helpers ──────────────────────────────────────────────────────

    function _sign(
        address user,
        string memory taskId,
        uint256 reward,
        uint256 nonce,
        uint256 deadline
    ) internal view returns (bytes memory) {
        bytes32 structHash = keccak256(abi.encode(
            keccak256("Attestation(address user,string taskId,uint256 reward,uint256 nonce,uint256 deadline)"),
            user,
            keccak256(bytes(taskId)),
            reward,
            nonce,
            deadline
        ));
        bytes32 digest = keccak256(
            abi.encodePacked("\x19\x01", verifier.domainSeparator(), structHash)
        );
        (uint8 v, bytes32 r, bytes32 s) = vm.sign(oracleKey, digest);
        return abi.encodePacked(r, s, v);
    }
}
