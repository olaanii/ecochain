// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {Script, console} from "forge-std/Script.sol";
import {Upgrades} from "openzeppelin-foundry-upgrades/Upgrades.sol";
import {TimelockController} from "@openzeppelin/contracts/governance/TimelockController.sol";
import {UUPSUpgradeable} from "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";

// Import the V2 implementation contracts
import {StakingV2} from "../src/StakingV2.sol";
import {EcoVerifierV2} from "../src/EcoVerifierV2.sol";

// Upgrade: Deployment and upgrade script for UUPS upgradeable contracts
//
// Usage:
// 1. First run: Deploy proxies and implementations
//    forge script script/Upgrade.s.sol:Deploy --rpc-url $RPC_URL --broadcast
//
// 2. Upgrade: Propose upgrade through TimelockController
//    forge script script/Upgrade.s.sol:ProposeUpgrade --rpc-url $RPC_URL --broadcast
//
// 3. Execute scheduled upgrade after timelock delay
//    forge script script/Upgrade.s.sol:ExecuteUpgrade --rpc-url $RPC_URL --broadcast

// ============================================================================
// Configuration Constants
// ============================================================================

// Timelock settings
uint256 constant TIMELOCK_DELAY = 2 days;  // Minimum delay for operations
uint256 constant EXECUTION_WINDOW = 30 days;  // Max time to execute after scheduling

// Role identifiers
bytes32 constant PROPOSER_ROLE = keccak256("PROPOSER_ROLE");
bytes32 constant EXECUTOR_ROLE = keccak256("EXECUTOR_ROLE");
bytes32 constant CANCELLER_ROLE = keccak256("CANCELLER_ROLE");

// ============================================================================
// Initial Deployment - Deploys proxies, implementations, and TimelockController
// ============================================================================

contract Deploy is Script {
    // Deployed contract addresses (populated after deployment)
    struct Deployment {
        address timelock;
        address stakingProxy;
        address verifierProxy;
    }
    
    Deployment public deployment;
    
    function run() external returns (Deployment memory) {
        vm.startBroadcast();
        
        // Get environment variables
        address ecoToken = vm.envAddress("ECO_TOKEN");
        address admin = vm.envAddress("ADMIN_ADDRESS");
        
        require(ecoToken != address(0), "ECO_TOKEN not set");
        require(admin != address(0), "ADMIN_ADDRESS not set");
        
        console.log("=== EcoChain Contract Deployment ===");
        console.log("ECO Token:", ecoToken);
        console.log("Admin:", admin);
        
        // Deploy TimelockController
        address[] memory proposers = new address[](1);
        proposers[0] = admin;
        
        address[] memory executors = new address[](1);
        executors[0] = admin;
        
        TimelockController timelock = new TimelockController(
            TIMELOCK_DELAY,
            proposers,
            executors,
            admin  // admin will be renounced after setup
        );
        deployment.timelock = address(timelock);
        console.log("TimelockController deployed:", address(timelock));
        console.log("  - Delay:", TIMELOCK_DELAY);
        
        // Deploy StakingV2 proxy using OpenZeppelin Foundry Upgrades plugin
        bytes memory stakingInit = abi.encodeCall(
            StakingV2.initialize, 
            (ecoToken, address(timelock))  // Timelock owns the proxy
        );
        
        address stakingProxy = Upgrades.deployUUPSProxy(
            "StakingV2.sol:StakingV2", 
            stakingInit
        );
        deployment.stakingProxy = stakingProxy;
        console.log("Staking proxy deployed:", stakingProxy);
        console.log("  Implementation:", Upgrades.getImplementationAddress(stakingProxy));
        
        // Deploy EcoVerifierV2 proxy
        // Note: EcoVerifierV2.initialize expects (admin, oracle, token)
        // We use timelock as admin and need a separate oracle address
        address oracle = vm.envAddress("ORACLE_ADDRESS");
        require(oracle != address(0), "ORACLE_ADDRESS not set");
        
        bytes memory verifierInit = abi.encodeCall(
            EcoVerifierV2.initialize,
            (address(timelock), oracle, ecoToken)
        );
        
        address verifierProxy = Upgrades.deployUUPSProxy(
            "EcoVerifierV2.sol:EcoVerifierV2", 
            verifierInit
        );
        deployment.verifierProxy = verifierProxy;
        console.log("Verifier proxy deployed:", verifierProxy);
        console.log("  Implementation:", Upgrades.getImplementationAddress(verifierProxy));
        
        // Setup roles
        timelock.grantRole(PROPOSER_ROLE, admin);
        timelock.grantRole(EXECUTOR_ROLE, admin);
        timelock.grantRole(CANCELLER_ROLE, admin);
        
        console.log("Roles granted to admin");
        
        vm.stopBroadcast();
        
        return deployment;
    }
}

// ============================================================================
// Upgrade Proposals - Schedule upgrades through TimelockController
// ============================================================================

contract ProposeUpgrade is Script {
    struct UpgradeProposal {
        address proxy;
        address newImplementation;
        bytes32 operationId;
    }
    
    function run() external {
        vm.startBroadcast();
        
        address timelock = vm.envAddress("TIMELOCK_ADDRESS");
        address stakingProxy = vm.envAddress("STAKING_PROXY");
        address verifierProxy = vm.envAddress("VERIFIER_PROXY");
        
        require(timelock != address(0), "TIMELOCK_ADDRESS not set");
        require(stakingProxy != address(0), "STAKING_PROXY not set");
        require(verifierProxy != address(0), "VERIFIER_PROXY not set");
        
        TimelockController controller = TimelockController(payable(timelock));
        
        console.log("=== Scheduling Upgrades ===");
        console.log("Timelock:", timelock);
        console.log("Staking Proxy:", stakingProxy);
        console.log("Verifier Proxy:", verifierProxy);
        
        // Deploy new implementations
        StakingV2 newStakingImpl = new StakingV2();
        EcoVerifierV2 newVerifierImpl = new EcoVerifierV2();
        
        console.log("New Staking implementation:", address(newStakingImpl));
        console.log("New Verifier implementation:", address(newVerifierImpl));
        
        // Prepare upgrade calls (via proxy's upgradeToAndCall)
        bytes memory stakingUpgradeCall = abi.encodeCall(
            UUPSUpgradeable.upgradeToAndCall,
            (address(newStakingImpl), "")  // No post-upgrade call needed
        );
        
        bytes memory verifierUpgradeCall = abi.encodeCall(
            UUPSUpgradeable.upgradeToAndCall,
            (address(newVerifierImpl), "")
        );
        
        // Schedule upgrades through timelock
        bytes32 stakingOpId = scheduleUpgrade(
            controller, 
            stakingProxy, 
            stakingUpgradeCall
        );
        console.log("Staking upgrade scheduled, operationId:");
        console.logBytes32(stakingOpId);
        
        bytes32 verifierOpId = scheduleUpgrade(
            controller,
            verifierProxy,
            verifierUpgradeCall
        );
        console.log("Verifier upgrade scheduled, operationId:");
        console.logBytes32(verifierOpId);
        
        console.log("Execute after", TIMELOCK_DELAY, "seconds using ExecuteUpgrade");
        
        vm.stopBroadcast();
    }
    
    function scheduleUpgrade(
        TimelockController timelock,
        address proxy,
        bytes memory data
    ) internal returns (bytes32) {
        // Timelock schedule parameters
        address target = proxy;
        uint256 value = 0;
        bytes32 predecessor = bytes32(0);
        bytes32 salt = keccak256(abi.encodePacked(block.timestamp, proxy));
        uint256 delay = TIMELOCK_DELAY;
        
        // Schedule the operation
        timelock.schedule(
            target,
            value,
            data,
            predecessor,
            salt,
            delay
        );
        
        // Calculate operation ID for reference
        return timelock.hashOperation(target, value, data, predecessor, salt);
    }
}

// ============================================================================
// Execute Upgrades - Execute scheduled upgrades after timelock delay
// ============================================================================

contract ExecuteUpgrade is Script {
    function run() external {
        vm.startBroadcast();
        
        address timelock = vm.envAddress("TIMELOCK_ADDRESS");
        address proxy = vm.envAddress("PROXY_ADDRESS");
        bytes32 salt = vm.envBytes32("OPERATION_SALT");
        
        require(timelock != address(0), "TIMELOCK_ADDRESS not set");
        require(proxy != address(0), "PROXY_ADDRESS not set");
        require(salt != bytes32(0), "OPERATION_SALT not set");
        
        TimelockController controller = TimelockController(payable(timelock));
        
        console.log("=== Executing Upgrade ===");
        console.log("Proxy:", proxy);
        console.log("Salt:");
        console.logBytes32(salt);
        
        // The upgrade call data (must match what was scheduled)
        address newImplementation = vm.envAddress("NEW_IMPLEMENTATION");
        bytes memory data = abi.encodeCall(
            UUPSUpgradeable.upgradeToAndCall,
            (newImplementation, "")
        );
        
        // Execute the scheduled operation
        controller.execute(
            proxy,
            0,
            data,
            bytes32(0),  // predecessor
            salt
        );
        
        console.log("Upgrade executed successfully");
        console.log("New implementation address:", newImplementation);
        
        vm.stopBroadcast();
    }
}
