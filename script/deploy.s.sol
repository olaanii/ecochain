// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Script.sol";
import "forge-std/console2.sol";
import "../src/EcoReward.sol";
import "../src/EcoVerifier.sol";
import "../src/Staking.sol";

/**
 * @title DeployEcochain
 * @dev Deploy EcoReward → EcoVerifier → Staking, wire roles, seed tasks.
 *
 * Required env vars:
 *   PRIVATE_KEY    — deployer private key (hex, no 0x prefix)
 *   ORACLE_ADDRESS — off-chain oracle signer address; granted ORACLE_ROLE
 *
 * Run:
 *   forge script script/deploy.s.sol:DeployEcochain \
 *     --rpc-url $RPC_URL --broadcast --verify -vvvv
 *
 * Addresses are written to stdout in JSON so the CI job can parse them
 * into src/lib/contracts/addresses.json.
 *
 * NOTE: UUPS proxy upgrade (C-2) is tracked as follow-on work.
 *       Today contracts are deployed directly; proxy wrapper to be added
 *       once OZ Upgrades plugin is integrated.
 */
contract DeployEcochain is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address oracle = vm.envAddress("ORACLE_ADDRESS");
        address deployer = vm.addr(deployerPrivateKey);

        vm.startBroadcast(deployerPrivateKey);

        // ── 1. EcoReward ────────────────────────────────────────────────────
        EcoReward ecoToken = new EcoReward();

        // ── 2. EcoVerifier ──────────────────────────────────────────────────
        EcoVerifier verifier = new EcoVerifier(address(ecoToken));

        // ── 3. Staking ──────────────────────────────────────────────────────
        Staking staking = new Staking(address(ecoToken));

        // ── 4. Wire roles ───────────────────────────────────────────────────
        // EcoVerifier and Staking both need MINTER_ROLE to mint rewards.
        ecoToken.grantRole(ecoToken.MINTER_ROLE(), address(verifier));
        ecoToken.grantRole(ecoToken.MINTER_ROLE(), address(staking));

        // Grant the off-chain oracle ORACLE_ROLE on EcoVerifier so its
        // EIP-712 signatures are accepted by submitAttestedProof().
        verifier.grantRole(verifier.ORACLE_ROLE(), oracle);

        // ── 5. Seed initial tasks ────────────────────────────────────────────
        verifier.setTask("low_impact_commute", 20 ether);
        verifier.setTask("recycling_pickup",   5 ether);
        verifier.setTask("energy_saving_goal", 50 ether);
        verifier.setTask("plant_a_tree",       30 ether);
        verifier.setTask("public_transit_day", 10 ether);

        vm.stopBroadcast();

        // ── 6. Emit address registry as JSON ─────────────────────────────────
        console2.log("=== DEPLOYED ADDRESSES ===");
        console2.log("{");
        console2.log('  "deployer":   "%s",', deployer);
        console2.log('  "oracle":     "%s",', oracle);
        console2.log('  "EcoReward":  "%s",', address(ecoToken));
        console2.log('  "EcoVerifier":"%s",', address(verifier));
        console2.log('  "Staking":    "%s"',  address(staking));
        console2.log("}");
    }
}
