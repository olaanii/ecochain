// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {Script, console} from "forge-std/Script.sol";
import {Staking} from "../src/Staking.sol";
import {EcoReward} from "../src/EcoReward.sol";

/// @title Health Check Script
/// @notice Run with: forge script script/check-health.s.sol --rpc-url $RPC_URL
contract HealthCheckScript is Script {
    // Thresholds
    uint256 constant MIN_STAKING_BALANCE = 1000e18; // 1000 ECO
    uint256 constant MAX_PAUSED_DURATION = 1 days;
    
    struct HealthStatus {
        bool stakingPaused;
        bool rewardPaused;
        uint256 stakingBalance;
        uint256 totalStaked;
        uint256 activeStakes;
        bool healthy;
        string[5] warnings; // Fixed size array
        uint8 warningCount;
    }
    
    function run() external {
        address stakingAddr = vm.envAddress("STAKING_CONTRACT");
        address rewardAddr = vm.envAddress("REWARD_CONTRACT");
        
        require(stakingAddr != address(0), "STAKING_CONTRACT not set");
        require(rewardAddr != address(0), "REWARD_CONTRACT not set");
        
        Staking staking = Staking(stakingAddr);
        EcoReward reward = EcoReward(rewardAddr);
        
        HealthStatus memory status = checkHealth(staking, reward);
        
        // Output report
        console.log("=================================");
        console.log("     CONTRACT HEALTH REPORT");
        console.log("=================================");
        console.log("");
        console.log("Staking Contract:", stakingAddr);
        console.log("Reward Contract:", rewardAddr);
        console.log("");
        console.log("--- Status ---");
        console.log("Staking Paused: ", status.stakingPaused);
        console.log("Reward Paused:  ", status.rewardPaused);
        console.log("Staking Balance:", status.stakingBalance / 1e18, "ECO");
        console.log("Total Staked:  ", status.totalStaked / 1e18, "ECO");
        console.log("");
        
        if (status.warningCount > 0) {
            console.log("--- WARNINGS ---");
            for (uint i = 0; i < status.warningCount; i++) {
                console.log("[!]", status.warnings[i]);
            }
            console.log("");
        }
        
        console.log("--- Health Check ---");
        console.log(status.healthy ? "[PASS] All checks passed" : "[FAIL] Issues detected");
        
        // Exit with error if unhealthy
        require(status.healthy, "Health check failed");
    }
    
    function checkHealth(Staking staking, EcoReward reward) 
        internal 
        view 
        returns (HealthStatus memory status) 
    {
        status.stakingPaused = staking.paused();
        status.rewardPaused = reward.paused();
        status.stakingBalance = reward.balanceOf(address(staking));
        // Sum total staked for all users (simplified - checks contract's perspective)
        status.totalStaked = staking.getTotalStaked(address(staking));
        
        // Check 1: Staking contract has sufficient rewards
        if (status.stakingBalance < MIN_STAKING_BALANCE) {
            status.warnings[status.warningCount] = string.concat(
                "Staking balance low: ", 
                _toString(status.stakingBalance / 1e18),
                " ECO (min: ",
                _toString(MIN_STAKING_BALANCE / 1e18),
                " ECO)"
            );
            status.warningCount++;
            status.healthy = false;
        }
        
        // Check 2: Contracts not unexpectedly paused
        if (status.stakingPaused || status.rewardPaused) {
            status.warnings[status.warningCount] = "Contract(s) are paused";
            status.warningCount++;
            status.healthy = false;
        }
        
        // Check 3: Total staked is reasonable
        if (status.totalStaked > status.stakingBalance) {
            status.warnings[status.warningCount] = "Total staked exceeds available rewards!";
            status.warningCount++;
            status.healthy = false;
        }
        
        // If no warnings, mark healthy
        if (status.warningCount == 0) {
            status.healthy = true;
        }
        
        return status;
    }
    
    function _toString(uint256 value) internal pure returns (string memory) {
        if (value == 0) return "0";
        
        uint256 temp = value;
        uint256 digits;
        
        while (temp != 0) {
            digits++;
            temp /= 10;
        }
        
        bytes memory buffer = new bytes(digits);
        
        while (value != 0) {
            digits -= 1;
            buffer[digits] = bytes1(uint8(48 + uint256(value % 10)));
            value /= 10;
        }
        
        return string(buffer);
    }
}
