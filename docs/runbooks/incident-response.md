# Incident Response Runbook

## Severity Matrix

| Severity | Definition | Response SLA | Communication |
|---|---|---|---|
| P0 — Critical | Protocol funds at risk / contracts paused / all users blocked | 15 min | Discord + email immediately |
| P1 — High | >20% error rate, oracle offline >5 min, DB unavailable | 30 min | Discord |
| P2 — Medium | Degraded feature (SSE drops, push broken), elevated latency | 2 h | Discord thread |
| P3 — Low | Minor UI glitch, single-user issue | Next business day | GitHub issue |

## Escalation Path

1. **On-call** (solo MVP): you. Check UptimeRobot alert → Discord `#incidents`.
2. Diagnose with Sentry + Grafana + Better Stack logs.
3. If P0/P1: pause contracts first, communicate second, fix third.

## Response Steps

### 1. Triage
```bash
# Check health
curl https://your-app.vercel.app/api/health

# Check Sentry for spike
# Open Grafana dashboard: EcoChain / Overview
```

### 2. Contract emergency pause (P0 only)
Requires `PAUSER_ROLE` on EcoReward, EcoVerifier, Staking.
```bash
# Via cast (Foundry)
cast send $ECO_REWARD_ADDR "pause()" --private-key $PAUSER_KEY --rpc-url $RPC_URL
cast send $ECO_VERIFIER_ADDR "pause()" --private-key $PAUSER_KEY --rpc-url $RPC_URL
cast send $STAKING_ADDR "emergencyPause()" --private-key $PAUSER_KEY --rpc-url $RPC_URL
```

### 3. Revert a bad deploy
```bash
# Vercel: roll back via dashboard or CLI
vercel rollback [deployment-url]

# Prisma: if migration shipped, restore from snapshot (see db-restore.md)
```

### 4. Post-incident
- Write post-mortem in `docs/post-mortems/YYYY-MM-DD-title.md`.
- File GitHub issue with `incident` label.
- Update this runbook if gaps found.

## Comms Template

> **[INCIDENT P1] EcoChain — {summary}**
> Started: {time UTC}
> Impact: {what users see}
> Status: Investigating / Identified / Mitigated / Resolved
> Next update: {time}
