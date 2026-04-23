# Contract Upgrade Runbook

All upgrades go through a manual workflow dispatch — never auto-deployed.
Contracts are **UUPS upgradeable** (StakingV3, EcoVerifierV2) with TimelockController governance.

## Pre-upgrade checklist
- [ ] Forge tests pass (`forge test --fuzz-runs 5000`)
- [ ] Slither clean (`slither . --config-file slither.config.json`)
- [ ] Gas snapshot compared (`forge snapshot --check`)
- [ ] Coverage >= 95% (`forge coverage`)
- [ ] Invariant tests pass (`forge test --match-contract Invariant`)
- [ ] New contract audited locally against SCSVS
- [ ] TimelockController holds DEFAULT_ADMIN_ROLE (2-day delay enforced)

## Upgrade steps (UUPS proxy pattern)

### 1. Deploy new implementation (no proxy yet)
```bash
# Deploy new StakingV3 implementation
forge script script/Upgrade.s.sol:Deploy \
  --rpc-url $RPC_URL \
  --broadcast \
  --verify \
  -vvvv
```
Note the new implementation address from stdout.

### 2. Schedule upgrade through TimelockController
```bash
# Set implementation address and schedule upgrade
export NEW_STAKING_IMPL=0x...
export STAKING_PROXY=0x...  # UUPS proxy address

forge script script/Upgrade.s.sol:ProposeUpgrade \
  --rpc-url $RPC_URL \
  --broadcast \
  -vvvv
```
This schedules the upgrade with 2-day timelock delay.

### 3. Wait for timelock delay (2 days)
Check status:
```bash
cast call $TIMELOCK_CONTROLLER "getOperationState(bytes32)" $OPERATION_HASH --rpc-url $RPC_URL
```

### 4. Execute upgrade after timelock delay
```bash
forge script script/Upgrade.s.sol:ExecuteUpgrade \
  --rpc-url $RPC_URL \
  --broadcast \
  -vvvv
```

### 5. Verify upgrade
```bash
# Check implementation address changed
cast call $STAKING_PROXY "implementation()" --rpc-url $RPC_URL

# Run health check
forge script script/check-health.s.sol:HealthCheck \
  --rpc-url $RPC_URL \
  -vvvv
```

### 6. Emergency rollback (if needed within 24h)
If critical issue detected:
```bash
# Schedule downgrade to previous implementation through Timelock
forge script script/Upgrade.s.sol:ProposeRollback \
  --rpc-url $RPC_URL \
  --broadcast
# Wait 2 days, then execute
```

### 7. Post-upgrade verification
- [ ] All stakes accessible (`staking.getStakeDetails(id)`)
- [ ] Total staked amount correct
- [ ] Users can unstake normally
- [ ] New stakes work correctly
- [ ] Events emitted properly
