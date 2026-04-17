// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../src/EcoReward.sol";
import "../src/EcoVerifier.sol";

contract DeployEcochain is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(deployerPrivateKey);

        // 1. Deploy the EcoReward Token
        EcoReward ecoToken = new EcoReward();
        console.log("EcoReward deployed at:", address(ecoToken));

        // 2. Deploy the EcoVerifier
        EcoVerifier verifier = new EcoVerifier(address(ecoToken));
        console.log("EcoVerifier deployed at:", address(verifier));

        // 3. Authorize the Verifier to mint tokens
        ecoToken.setVerifier(address(verifier), true);
        console.log("Verifier authorized to mint ECO tokens.");

        // 4. Set some initial tasks
        verifier.setTask("low_impact_commute", 20 * 10**18); // 20 ECO
        verifier.setTask("recycling_pickup", 5 * 10**18);     // 5 ECO
        verifier.setTask("energy_saving_goal", 50 * 10**18); // 50 ECO
        console.log("Initial tasks configured.");

        vm.stopBroadcast();
    }
}
