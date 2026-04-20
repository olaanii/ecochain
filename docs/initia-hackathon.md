# Initia EcoLoop Hackathon Guide

## Core mission

EcoLoop shows how an appchain can keep revenue, UX, and governance close to the product while using Initia for the chain and wallet flows.

## MVP loop

1. Verify an eco task from proof metadata.
2. Mint INITIA rewards to the user ledger.
3. Redeem rewards from the catalog.
4. Bridge value in and out through InterwovenKit.

## Initia integration

- `InterwovenKitProvider` powers wallet connect, Auto-sign, and session UX.
- The bridge widget is exposed directly in the dashboard for demo clicks.
- `.init` username awareness is preserved in user records for civic and merchant onboarding.
- Chain status, txn evidence, and bridge history are surfaced publicly for transparency.
- Oracle-proof evaluation is stubbed in the app and ready for real image, transit, and weight feeds.

## Backend shape

- Prisma stores users, tasks, verifications, ledger entries, reward offerings, bridge requests, and DAO proposals.
- API routes expose tasks, verification, reward redemption, rewards catalog, and bridge logging.
- When the database is unavailable, the routes fall back to demo data so the UI still works.

## Running locally

1. Copy `.env.example` to `.env.local`.
2. Run `npm run prisma:generate`.
3. Run `npm run db:push`.
4. Run `npm run db:seed`.
5. Start `npm run dev`.

## Troubleshooting

- If `weave` panics with `duplicated address created` while recovering `gas-station`, run `bash scripts/reset-gas-station-key.sh` to clear the stale local test keyring entry, then rerun `weave rollup launch --with-config ~/.weave/data/minitia.config.json --vm evm`. If `~/.minitia` already exists from a partial run, add `--force` or `-f`.
- If you want repo-driven transactions off the reserved system account, set `INITIA_OPERATOR_KEY` before running `finalize-contracts.sh`.

## Roadmap

- MVP: task catalog, verification proofs, staking/rebates, leaderboard, merchant redemption catalog, guided onboarding.
- Mid-hackathon: live testnet demo, chain ID / txn evidence, bridge, usernames, and Auto-sign.
- Post-hackathon: DAO governance, analytics portal, AI coach, partner retail integrations, and oracle feeds.
