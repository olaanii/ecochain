# Contract Upgrade Runbook

All upgrades go through a manual workflow dispatch — never auto-deployed.
Current contracts are **non-upgradeable** (UUPS proxy is C-2, follow-on work).
Until proxy is added, upgrades = redeploy + role migration.

## Pre-upgrade checklist
- [ ] Forge tests pass (`forge test --fuzz-runs 5000`)
- [ ] Slither clean (`slither . --config-file slither.config.json`)
- [ ] Gas snapshot compared (`forge snapshot --check`)
- [ ] New contract audited locally against SCSVS
- [ ] `DEFAULT_ADMIN_ROLE` holder available (hardware wallet / Fly.io signer)

## Upgrade steps (redeploy path, pre-UUPS)

### 1. Deploy new implementation
```bash
forge script script/deploy.s.sol:DeployEcochain \
  --rpc-url $RPC_URL \
  --broadcast \
  --verify \
  -vvvv \
  --slow
```
Note the new addresses from stdout JSON.

### 2. Grant roles on new contracts
```bash
# Grant MINTER_ROLE to new verifier and staking on new EcoReward
cast send $NEW_ECO_REWARD "grantRole(bytes32,address)" $(cast keccak "MINTER_ROLE") $NEW_VERIFIER --private-key $ADMIN_KEY --rpc-url $RPC_URL
cast send $NEW_ECO_REWARD "grantRole(bytes32,address)" $(cast keccak "MINTER_ROLE") $NEW_STAKING  --private-key $ADMIN_KEY --rpc-url $RPC_URL
cast send $NEW_VERIFIER  "grantRole(bytes32,address)" $(cast keccak "ORACLE_ROLE") $ORACLE_ADDR  --private-key $ADMIN_KEY --rpc-url $RPC_URL
```

### 3. Update address registry
Edit `src/lib/contracts/addresses.json` with new addresses, open PR, merge.
CI redeploys web app pointing to new contracts.

### 4. Migrate open stakes / balances (if EcoReward changes)
Write a migration script under `scripts/migrate-*.ts` and run it
before pointing the web app at the new contracts.

### 5. Pause old contracts
```bash
cast send $OLD_ECO_REWARD "pause()"    --private-key $PAUSER_KEY --rpc-url $RPC_URL
cast send $OLD_VERIFIER   "pause()"    --private-key $PAUSER_KEY --rpc-url $RPC_URL
cast send $OLD_STAKING    "emergencyPause()" --private-key $PAUSER_KEY --rpc-url $RPC_URL
```

### 6. Rollback window (1 hour on testnet)
If any issue is found within 1 hour:
1. Revert `addresses.json` to old addresses and redeploy web app.
2. Unpause old contracts.
3. File post-mortem.

### 7. Verification
```bash
# Verify new contracts on explorer
forge verify-contract $NEW_ECO_REWARD EcoReward \
  --chain-id $CHAIN_ID --rpc-url $RPC_URL
```
