// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {AccessControlUpgradeable} from "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import {ECDSA} from "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import {IERC20Mintable} from "./interfaces/IERC20Mintable.sol";

// UUPS upgradeable imports
import {Initializable} from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import {UUPSUpgradeable} from "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {PausableUpgradeable} from "@openzeppelin/contracts-upgradeable/utils/PausableUpgradeable.sol";
import {EIP712Upgradeable} from "@openzeppelin/contracts-upgradeable/utils/cryptography/EIP712Upgradeable.sol";

/**
 * @title EcoVerifierV2
 * @notice UUPS upgradeable contract for claims ECO rewards against oracle-signed attestations
 * 
 * Critical hardening vs the previous revision
 * -------------------------------------------
 * - Requires EIP-712 typed signature from address holding ORACLE_ROLE
 * - ReentrancyGuard on claim path (external mint call)
 * - Pausable for emergency halt
 * - UUPS upgradeable pattern with TimelockController governance
 * - __gap[50] slots for future upgrades
 * 
 * UUPS Migration Notes:
 * - Constructor disabled (uses Initializable pattern)
 * - Authorization via _authorizeUpgrade() enforced by owner (TimelockController)
 * - __gap[50] slots reserved for future storage layout
 */
contract EcoVerifierV2 is 
    Initializable,
    AccessControlUpgradeable,
    PausableUpgradeable,
    ReentrancyGuard,
    EIP712Upgradeable,
    UUPSUpgradeable
{
    using ECDSA for bytes32;

    bytes32 public constant ORACLE_ROLE = keccak256("ORACLE_ROLE");
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");
    bytes32 public constant TASK_MANAGER_ROLE = keccak256("TASK_MANAGER_ROLE");

    bytes32 private constant _ATTESTATION_TYPEHASH = keccak256(
        "Attestation(address user,bytes32 taskId,bytes32 proofHash,uint256 reward,uint256 nonce,uint256 deadline)"
    );

    // NOTE: Changed from immutable (not supported in upgradeable contracts)
    IERC20Mintable public ecoToken;

    struct Task {
        uint256 baseReward;
        uint256 maxReward;
        bool active;
        bool exists;
    }

    mapping(bytes32 => Task) public tasks;
    mapping(bytes32 => bool) public usedProofHashes;
    mapping(address => uint256) public nonces;

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
    event Upgraded(address indexed implementation);
    event OracleUpdated(address indexed oldOracle, address indexed newOracle);

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
    error UnauthorizedUpgrade();

    // ============ Initializer (replaces constructor) ============

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    /**
     * @dev Initialize the upgradeable verifier contract
     * @param admin Address receiving DEFAULT_ADMIN_ROLE + PAUSER_ROLE + TASK_MANAGER_ROLE
     *        (typically TimelockController for governance)
     * @param oracle Address holding ORACLE_ROLE for signing attestations
     * @param token Address of the ECO token contract
     */
    function initialize(
        address admin,
        address oracle,
        address token
    ) public initializer {
        if (admin == address(0) || oracle == address(0) || token == address(0)) {
            revert ZeroAddress();
        }

        __AccessControl_init();
        __Pausable_init();
        __EIP712_init("EcoVerifier", "2");

        ecoToken = IERC20Mintable(token);

        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(PAUSER_ROLE, admin);
        _grantRole(TASK_MANAGER_ROLE, admin);
        _grantRole(ORACLE_ROLE, oracle);
    }

    // ============ UUPS Authorization ============

    /**
     * @dev Authorize upgrade - only callable by owner (TimelockController)
     * Ensures all upgrades go through the 2-day timelock governance process
     */
    function _authorizeUpgrade(address newImplementation) internal override onlyRole(DEFAULT_ADMIN_ROLE) {
        emit Upgraded(newImplementation);
    }

    // ============ Task management ============

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

        usedProofHashes[proofHash] = true;
        unchecked {
            nonces[msg.sender] = expectedNonce + 1;
        }

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

    /**
     * @dev Update the oracle address
     * Only callable through TimelockController
     */
    function updateOracle(address oldOracle, address newOracle) 
        external 
        onlyRole(DEFAULT_ADMIN_ROLE) 
    {
        if (newOracle == address(0)) revert ZeroAddress();
        
        _revokeRole(ORACLE_ROLE, oldOracle);
        _grantRole(ORACLE_ROLE, newOracle);
        
        emit OracleUpdated(oldOracle, newOracle);
    }

    // ============ Views ============

    function domainSeparator() external view returns (bytes32) {
        return _domainSeparatorV4();
    }

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

    // ============ Upgrade Gap ============

    /**
     * @dev Reserved storage slots for future upgrades
     * 50 slots = 50 * 32 bytes = 1600 bytes reserved
     * This ensures storage layout compatibility across upgrades
     */
    uint256[50] private __gap;
}
