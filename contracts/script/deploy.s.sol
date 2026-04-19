// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Script, console} from "forge-std/Script.sol";
import {EcoReward} from "../src/EcoReward.sol";
import {EcoVerifier} from "../src/EcoVerifier.sol";

/**
 * Deployment flow (post-hardening)
 * --------------------------------
 *  env:
 *    PRIVATE_KEY        deployer EOA (granted admin on both contracts)
 *    ADMIN_ADDRESS      optional — multisig/timelock. Defaults to deployer.
 *    ORACLE_ADDRESS     hot signing address held by the off-chain oracle service.
 *    ECO_SUPPLY_CAP     optional — defaults to 1,000,000,000 ECO.
 *
 * Post-deploy steps (handled by this script):
 *   1. Deploy EcoReward(admin, cap)
 *   2. Deploy EcoVerifier(admin, oracle, token)
 *   3. Grant MINTER_ROLE on EcoReward to the EcoVerifier
 *   4. Seed a few initial tasks (keccak256 slug => maxReward)
 */
contract DeployEcochain is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);

        address admin = _envOr("ADMIN_ADDRESS", deployer);
        address oracle = vm.envAddress("ORACLE_ADDRESS");
        uint256 supplyCap = _envOrUint("ECO_SUPPLY_CAP", 1_000_000_000 * 1e18);

        vm.startBroadcast(deployerPrivateKey);

        // 1. Deploy the EcoReward Token with a hard supply cap.
        EcoReward ecoToken = new EcoReward(admin, supplyCap);
        console.log("EcoReward deployed at:", address(ecoToken));
        console.log("  admin:", admin);
        console.log("  cap  :", supplyCap);

        // 2. Deploy the EcoVerifier bound to the token.
        EcoVerifier verifier = new EcoVerifier(admin, oracle, address(ecoToken));
        console.log("EcoVerifier deployed at:", address(verifier));
        console.log("  oracle:", oracle);

        // 3. Authorize the Verifier to mint.
        //    If admin != deployer, this step must be re-run by the admin.
        if (admin == deployer) {
            ecoToken.grantRole(ecoToken.MINTER_ROLE(), address(verifier));
            console.log("Granted MINTER_ROLE on EcoReward to EcoVerifier.");
        } else {
            console.log("WARN: admin is not deployer. Admin must grant MINTER_ROLE manually.");
        }

        // 4. Seed initial tasks — (taskSlug => baseReward, maxReward).
        if (admin == deployer) {
            verifier.setTask(keccak256("low_impact_commute"), 20e18, 40e18, true);
            verifier.setTask(keccak256("recycling_pickup"),   5e18,  15e18, true);
            verifier.setTask(keccak256("energy_saving_goal"), 50e18, 100e18, true);
            console.log("Initial tasks configured.");
        } else {
            console.log("WARN: admin is not deployer. Admin must seed tasks manually.");
        }

        vm.stopBroadcast();
    }

    function _envOr(string memory key, address fallback_) internal view returns (address) {
        try vm.envAddress(key) returns (address v) {
            return v == address(0) ? fallback_ : v;
        } catch {
            return fallback_;
        }
    }

    function _envOrUint(string memory key, uint256 fallback_) internal view returns (uint256) {
        try vm.envUint(key) returns (uint256 v) {
            return v == 0 ? fallback_ : v;
        } catch {
            return fallback_;
        }
    }
}
