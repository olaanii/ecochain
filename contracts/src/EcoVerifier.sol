// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./EcoReward.sol";

/**
 * @title EcoVerifier
 * @dev The core logic for verifying eco-tasks and minting ECO rewards.
 */
contract EcoVerifier is Ownable {
    EcoReward public ecoToken;

    struct Task {
        uint256 baseReward;
        bool exists;
    }

    mapping(string => Task) public tasks;
    mapping(string => bool) public usedProofHashes;

    event TaskSet(string taskId, uint256 baseReward);
    event ProofSubmitted(address indexed user, string taskId, string proofHash, uint256 rewardMinted);

    /**
     * @dev Constructor initialization.
     * @param _ecoToken The address of the EcoReward token contract.
     */
    constructor(address _ecoToken) Ownable(msg.sender) {
        require(_ecoToken != address(0), "EcoVerifier: Zero address token");
        ecoToken = EcoReward(_ecoToken);
    }

    /**
     * @dev Configure or add a new task.
     * @param taskId The ID of the task.
     * @param baseReward The base ECO reward for the task.
     */
    function setTask(string calldata taskId, uint256 baseReward) external onlyOwner {
        tasks[taskId] = Task({
            baseReward: baseReward,
            exists: true
        });
        emit TaskSet(taskId, baseReward);
    }

    /**
     * @dev Submit a proof for verification and reward claim.
     * @param taskId The task ID to claim for.
     * @param proofHash A unique hash of the proof (e.g. from the client's local verification).
     * @param timestamp The original timestamp of the proof's generation (must be recently generated).
     */
    function submitProof(string calldata taskId, string calldata proofHash, uint256 timestamp) external {
        Task storage task = tasks[taskId];
        require(task.exists, "EcoVerifier: Task not found");

        // Validate timestamp: proof must be < 48 hours old.
        // Assuming block.timestamp and proof.timestamp are in seconds (standard Unix seconds).
        require(timestamp <= block.timestamp, "EcoVerifier: Proof in the future");
        require(block.timestamp - timestamp < 48 hours, "EcoVerifier: Proof expired (>48h)");

        // Validate uniqueness: proof hash must not have been used already.
        require(!usedProofHashes[proofHash], "EcoVerifier: Proof already used");

        // Store proof hash to prevent replay.
        usedProofHashes[proofHash] = true;

        // Reward the user.
        uint256 rewardAmount = task.baseReward;
        ecoToken.mint(msg.sender, rewardAmount);

        emit ProofSubmitted(msg.sender, taskId, proofHash, rewardAmount);
    }

    /**
     * @dev Allow the contract owner to change the ECO token.
     * @param _ecoToken The new token address.
     */
    function setEcoToken(address _ecoToken) external onlyOwner {
        require(_ecoToken != address(0), "EcoVerifier: Zero address");
        ecoToken = EcoReward(_ecoToken);
    }
}
