// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";
import {Pausable} from "@openzeppelin/contracts/utils/Pausable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {EIP712} from "@openzeppelin/contracts/utils/cryptography/EIP712.sol";
import {ECDSA} from "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import {EcoReward} from "./EcoReward.sol";

/**
 * @title EcoVerifier
 * @notice Claims ECO rewards against off-chain oracle-signed attestations.
 *
 * Critical hardening vs the previous revision
 * -------------------------------------------
 * The old `submitProof()` was fully UNAUTHENTICATED — any address could pass
 * any (taskId, proofHash, timestamp) and mint `baseReward` tokens to itself.
 * This revision requires every claim to be accompanied by an EIP-712 typed
 * signature from an address holding `ORACLE_ROLE`, binding:
 *
 *   Attestation(
 *     address user,           // claimant — must match msg.sender
 *     bytes32 taskId,         // keccak256 of the task slug
 *     bytes32 proofHash,      // opaque proof identifier (IPFS CID, AI hash, ...)
 *     uint256 reward,         // explicit reward amount, oracle-priced
 *     uint256 nonce,          // strictly monotonic per user
 *     uint256 deadline        // unix seconds; signature expires after
 *   )
 *
 * Additional protections:
 * - ReentrancyGuard on claim path (external mint call).
 * - Pausable for emergency halt (e.g. oracle key leak).
 * - AccessControl roles: DEFAULT_ADMIN, ORACLE_ROLE, PAUSER_ROLE, TASK_MANAGER_ROLE.
 * - Per-user nonce mapping (prevents replay and enforces oracle sequencing).
 * - Per-task activation flag (admin can disable without deleting history).
 * - Per-task reward cap (oracle can price dynamically, but can't exceed cap).
 * - Zero-address / zero-value guards.
 */
contract EcoVerifier is AccessControl, Pausable, ReentrancyGuard, EIP712 {
    using ECDSA for bytes32;

    bytes32 public constant ORACLE_ROLE = keccak256("ORACLE_ROLE");
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");
    bytes32 public constant TASK_MANAGER_ROLE = keccak256("TASK_MANAGER_ROLE");

    bytes32 private constant _ATTESTATION_TYPEHASH = keccak256(
        "Attestation(address user,bytes32 taskId,bytes32 proofHash,uint256 reward,uint256 nonce,uint256 deadline)"
    );

    EcoReward public immutable ecoToken;

    struct Task {
        uint256 baseReward;   // default reward oracle may quote (may also quote lower)
        uint256 maxReward;    // hard ceiling; any oracle-quoted reward above this is rejected
        bool active;
        bool exists;
    }

    mapping(bytes32 => Task) public tasks;
    mapping(bytes32 => bool) public usedProofHashes;
    mapping(address => uint256) public nonces; // strictly monotonic per user

    // ============ Events ============

    event TaskSet(bytes32 indexed taskId, uint256 baseReward, uint256 maxReward, bool active);
    event TaskStatusChanged(bytes32 indexed taskId, bool active);
    event ProofSubmitted(
        address indexed user,
        bytes32 indexed taskId,
        bytes32 indexed proofHash,
        uint256 reward,
        uint256 nonce
    );

    // ============ Errors ============

    error ZeroAddress();
    error TaskUnknown(bytes32 taskId);
    error TaskInactive(bytes32 taskId);
    error ProofReused(bytes32 proofHash);
    error SignatureExpired(uint256 deadline, uint256 nowTs);
    error InvalidNonce(uint256 expected, uint256 provided);
    error RewardTooHigh(uint256 requested, uint256 cap);
    error UserMismatch(address expected, address got);
    error BadSigner(address signer);
    error ZeroReward();

    /**
     * @param admin Address receiving DEFAULT_ADMIN_ROLE + PAUSER_ROLE +
     *              TASK_MANAGER_ROLE. On testnet, admin is a multisig EOA; on
     *              mainnet this must be a TimelockController.
     * @param oracle Address holding ORACLE_ROLE. The private key lives in an
     *               isolated signer service (see docs/runbooks/oracle-key-rotation.md).
     * @param token Address of the EcoReward contract whose MINTER_ROLE is
     *              granted to this contract after deployment.
     */
    constructor(address admin, address oracle, address token)
        EIP712("EcoVerifier", "1")
    {
        if (admin == address(0) || oracle == address(0) || token == address(0)) {
            revert ZeroAddress();
        }
        ecoToken = EcoReward(token);
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(PAUSER_ROLE, admin);
        _grantRole(TASK_MANAGER_ROLE, admin);
        _grantRole(ORACLE_ROLE, oracle);
    }

    // ============ Task management ============

    /**
     * @notice Create or overwrite a task's reward parameters.
     * @param taskId Keccak256 of the task slug (off-chain registry key).
     * @param baseReward Default display reward (informational; oracle may quote).
     * @param maxReward Hard upper bound on reward per submission (`reward <= maxReward`).
     * @param active Whether new submissions are accepted.
     */
    function setTask(
        bytes32 taskId,
        uint256 baseReward,
        uint256 maxReward,
        bool active
    ) external onlyRole(TASK_MANAGER_ROLE) {
        require(maxReward >= baseReward, "EcoVerifier: maxReward < baseReward");
        tasks[taskId] = Task({
            baseReward: baseReward,
            maxReward: maxReward,
            active: active,
            exists: true
        });
        emit TaskSet(taskId, baseReward, maxReward, active);
    }

    function setTaskActive(bytes32 taskId, bool active) external onlyRole(TASK_MANAGER_ROLE) {
        Task storage task = tasks[taskId];
        if (!task.exists) revert TaskUnknown(taskId);
        task.active = active;
        emit TaskStatusChanged(taskId, active);
    }

    // ============ Claim path ============

    /**
     * @notice Submit an oracle-signed attestation and mint the quoted reward.
     *
     * Replay protection: each `proofHash` may only be consumed once globally,
     * AND `nonce` must equal `nonces[msg.sender]` then increments.
     *
     * @param taskId keccak256 of task slug — must exist and be active.
     * @param proofHash Globally-unique identifier for the off-chain evidence.
     * @param reward Oracle-quoted reward amount; must be > 0 and <= task.maxReward.
     * @param nonce Must equal caller's current nonce (enforced monotonicity).
     * @param deadline Unix seconds past which the signature is invalid.
     * @param signature 65-byte ECDSA sig over the EIP-712 typed attestation.
     */
    function submitProof(
        bytes32 taskId,
        bytes32 proofHash,
        uint256 reward,
        uint256 nonce,
        uint256 deadline,
        bytes calldata signature
    ) external nonReentrant whenNotPaused {
        if (block.timestamp > deadline) revert SignatureExpired(deadline, block.timestamp);
        if (reward == 0) revert ZeroReward();

        Task storage task = tasks[taskId];
        if (!task.exists) revert TaskUnknown(taskId);
        if (!task.active) revert TaskInactive(taskId);
        if (reward > task.maxReward) revert RewardTooHigh(reward, task.maxReward);
        if (usedProofHashes[proofHash]) revert ProofReused(proofHash);

        uint256 expectedNonce = nonces[msg.sender];
        if (nonce != expectedNonce) revert InvalidNonce(expectedNonce, nonce);

        // Build the EIP-712 digest. Note `user` is bound to msg.sender so a
        // signature issued for Alice can't be replayed by Bob.
        bytes32 structHash = keccak256(
            abi.encode(
                _ATTESTATION_TYPEHASH,
                msg.sender,
                taskId,
                proofHash,
                reward,
                nonce,
                deadline
            )
        );
        bytes32 digest = _hashTypedDataV4(structHash);
        address signer = digest.recover(signature);
        if (!hasRole(ORACLE_ROLE, signer)) revert BadSigner(signer);

        // Effects before interactions.
        usedProofHashes[proofHash] = true;
        unchecked {
            nonces[msg.sender] = expectedNonce + 1;
        }

        // Interaction: mint to claimant.
        ecoToken.mint(msg.sender, reward);

        emit ProofSubmitted(msg.sender, taskId, proofHash, reward, nonce);
    }

    // ============ Admin / pause ============

    function pause() external onlyRole(PAUSER_ROLE) {
        _pause();
    }

    function unpause() external onlyRole(PAUSER_ROLE) {
        _unpause();
    }

    // ============ Views ============

    /// @notice Expose the EIP-712 domain separator for off-chain signers.
    function domainSeparator() external view returns (bytes32) {
        return _domainSeparatorV4();
    }

    /// @notice Convenience view computing the digest a signer should sign.
    function hashAttestation(
        address user,
        bytes32 taskId,
        bytes32 proofHash,
        uint256 reward,
        uint256 nonce,
        uint256 deadline
    ) external view returns (bytes32) {
        bytes32 structHash = keccak256(
            abi.encode(_ATTESTATION_TYPEHASH, user, taskId, proofHash, reward, nonce, deadline)
        );
        return _hashTypedDataV4(structHash);
    }
}
