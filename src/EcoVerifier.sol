// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/cryptography/EIP712.sol";
import "./EcoReward.sol";

/**
 * @title EcoVerifier
 * @dev Verifies eco-task proofs and mints ECO rewards.
 *
 * Two proof paths:
 *  1. Legacy `submitProof`  — timestamp + proofHash uniqueness (no oracle sig).
 *  2. `submitAttestedProof` — EIP-712 oracle signature with per-user nonce +
 *                             deadline to prevent replay and restrict minting to
 *                             oracle-approved amounts.
 *
 * Access control:
 *  - DEFAULT_ADMIN_ROLE — full admin.
 *  - ORACLE_ROLE        — addresses whose EIP-712 signatures are accepted.
 *  - PAUSER_ROLE        — may pause / unpause.
 *
 * Requires: OZ ≥ 4.9 (non-draft EIP712).
 */
contract EcoVerifier is AccessControl, ReentrancyGuard, Pausable, EIP712 {
    using ECDSA for bytes32;

    bytes32 public constant ORACLE_ROLE = keccak256("ORACLE_ROLE");
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");

    /// EIP-712 typehash for oracle attestation structs.
    bytes32 private constant ATTESTATION_TYPEHASH = keccak256(
        "Attestation(address user,string taskId,uint256 reward,uint256 nonce,uint256 deadline)"
    );

    EcoReward public ecoToken;

    struct Task {
        uint256 baseReward;
        bool exists;
    }

    mapping(string => Task) public tasks;
    mapping(string => bool) public usedProofHashes;
    /// @dev Per-user nonce for oracle attestations; monotonically increasing.
    mapping(address => uint256) public nonces;

    event TaskSet(string indexed taskId, uint256 baseReward);
    event ProofSubmitted(address indexed user, string taskId, string proofHash, uint256 rewardMinted);
    event AttestedProofSubmitted(address indexed user, string indexed taskId, uint256 reward, uint256 nonce);

    constructor(address _ecoToken)
        EIP712("EcoVerifier", "1")
    {
        require(_ecoToken != address(0), "EcoVerifier: Zero address token");
        ecoToken = EcoReward(_ecoToken);
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(PAUSER_ROLE, msg.sender);
    }

    // ─── Admin ────────────────────────────────────────────────────────────────

    function setTask(string calldata taskId, uint256 baseReward)
        external
        onlyRole(DEFAULT_ADMIN_ROLE)
    {
        tasks[taskId] = Task({ baseReward: baseReward, exists: true });
        emit TaskSet(taskId, baseReward);
    }

    function setEcoToken(address _ecoToken) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(_ecoToken != address(0), "EcoVerifier: Zero address");
        ecoToken = EcoReward(_ecoToken);
    }

    function pause() external onlyRole(PAUSER_ROLE) { _pause(); }
    function unpause() external onlyRole(PAUSER_ROLE) { _unpause(); }

    // ─── Legacy proof path ────────────────────────────────────────────────────

    /**
     * @dev Submit a proof by timestamp + unique hash (no oracle signature).
     *      Kept for backward compatibility; prefer `submitAttestedProof`.
     */
    function submitProof(
        string calldata taskId,
        string calldata proofHash,
        uint256 timestamp
    ) external nonReentrant whenNotPaused {
        Task storage task = tasks[taskId];
        require(task.exists, "EcoVerifier: Task not found");
        require(timestamp <= block.timestamp, "EcoVerifier: Proof in the future");
        require(block.timestamp - timestamp < 48 hours, "EcoVerifier: Proof expired (>48h)");
        require(!usedProofHashes[proofHash], "EcoVerifier: Proof already used");

        usedProofHashes[proofHash] = true;

        uint256 rewardAmount = task.baseReward;
        ecoToken.mint(msg.sender, rewardAmount);

        emit ProofSubmitted(msg.sender, taskId, proofHash, rewardAmount);
    }

    // ─── Oracle-attested proof path ───────────────────────────────────────────

    /**
     * @dev Submit an oracle-attested proof.
     *
     *      The off-chain oracle signs an `Attestation` struct with EIP-712.
     *      The contract verifies the signature, checks the nonce and deadline,
     *      increments the nonce, then mints `reward` tokens to the caller.
     *
     * @param taskId   Task being claimed (must exist).
     * @param reward   ECO amount to mint (oracle-determined).
     * @param nonce    Must equal `nonces[msg.sender]` exactly.
     * @param deadline Unix timestamp; reverts if `block.timestamp > deadline`.
     * @param sig      Oracle's EIP-712 signature over the Attestation struct.
     */
    function submitAttestedProof(
        string calldata taskId,
        uint256 reward,
        uint256 nonce,
        uint256 deadline,
        bytes calldata sig
    ) external nonReentrant whenNotPaused {
        require(block.timestamp <= deadline, "EcoVerifier: Attestation expired");
        require(nonces[msg.sender] == nonce, "EcoVerifier: Invalid nonce");

        Task storage task = tasks[taskId];
        require(task.exists, "EcoVerifier: Task not found");

        bytes32 structHash = keccak256(
            abi.encode(
                ATTESTATION_TYPEHASH,
                msg.sender,
                keccak256(bytes(taskId)),
                reward,
                nonce,
                deadline
            )
        );
        bytes32 digest = _hashTypedDataV4(structHash);
        address signer = ECDSA.recover(digest, sig);
        require(hasRole(ORACLE_ROLE, signer), "EcoVerifier: Invalid oracle signature");

        // Increment nonce before external call (CEI).
        nonces[msg.sender]++;

        ecoToken.mint(msg.sender, reward);

        emit AttestedProofSubmitted(msg.sender, taskId, reward, nonce);
    }

    // ─── View helpers ─────────────────────────────────────────────────────────

    function getNonce(address user) external view returns (uint256) {
        return nonces[user];
    }

    function domainSeparator() external view returns (bytes32) {
        return _domainSeparatorV4();
    }
}
