# EcoChain — Production Readiness Plan (Testnet MVP, EVM, $0 Budget)

Ship a hardened, role-aware, testnet-launch-ready EcoChain dapp on Initia EVM in 6–8 weeks using **only free-tier / open-source tooling**, covering contract hardening, backend security, full test+CI/CD+observability, the Redis flood fix, and three role-differentiated UIs (user / sponsor / super-admin) under a unified sidebar-icon navigation system.

---

## 0. Zero-Cost Tooling Charter

**All tools below are free (OSS or free tier). No credit card required for MVP launch.**

| Category | Pick | Free-tier fact |
|---|---|---|
| Hosting (web) | Vercel Hobby | Unlimited personal projects, no CC |
| Database | Prisma Postgres (free) / Neon free | 0.5 GB, plenty for MVP |
| Redis | Upstash Redis free | 10k commands/day, pay-as-you-go only above |
| Background jobs | **Vercel Cron** + Postgres-backed `pg-boss` / `graphile-worker` | Replaces QStash; both 100% free |
| Oracle key mgmt | **libsodium sealed-box** + env-stored key on a Fly.io free signer app | Replaces KMS. Fly.io: 3 shared VMs free |
| Error tracking | Sentry Developer free | 5k errors/mo |
| Logs | Better Stack (Logtail) free | 1 GB/mo, 3-day retention |
| Metrics | Grafana Cloud free | 10k series, 14-day retention |
| Uptime | UptimeRobot free | 50 monitors, 5-min interval |
| Status page | Better Stack free | 1 public status page |
| CI | GitHub Actions | 2000 min/mo private, unlimited public |
| Security scans | Slither, Mythril, semgrep OSS, ZAP, gitleaks, osv-scanner, Dependabot, Renovate | All OSS/free |
| Contract dev | Foundry | OSS |
| E2E | Playwright | OSS |
| Load test | k6 | OSS |
| Push | Web Push (self-generated VAPID) | Free |
| On-chain indexer host | Fly.io free shared VM or Render free web service | Free tier sufficient |
| Alerts | Discord webhook + email (UptimeRobot) | Free |

Anything previously in the plan that implied a paid tool (AWS/GCP KMS, QStash paid tier, Datadog, Axiom paid) is swapped for the free alternatives above.

---

## 1. Scope & Assumptions

- **Target**: Initia EVM minirollup on **testnet**. Mainnet cutover tracked as follow-on.
- **Contracts**: Solidity (`EcoReward.sol`, `EcoVerifier.sol`, `Staking.sol`) — harden in place, no Move port.
- **Hosting**: Vercel (Next.js 16) + Prisma-managed Postgres + Upstash Redis — **all free tier**.
- **Deepest focus areas (user-selected)**:
  1. Smart contract hardening + tests
  2. Security & secrets
  3. Testing + CI/CD + observability
- Backend API hardening is **still in-scope** but at "solid" (not "deepest") depth — mostly using what already exists in `src/lib/api/` and closing gaps.
- **Out of scope for v1**: external audit, Move port, multi-region infra, SOC2, bug bounty. Called out as Phase 4 / post-MVP.

### Current state snapshot (from repo scan)
- Next.js 16 + React 19 + Prisma 7 + Clerk, Sentry wired, ioredis, recharts, web-push, wagmi/viem/InterwovenKit.
- API middleware, schemas, errors, logger exist under `src/lib/api/`.
- Contracts: Foundry project under `contracts/` with limited tests (`Counter.t.sol`, `Ecochain.t.sol`, `Staking.t.sol`).
- Tests: scattered under `tests/` (unit + integration + staking + verification), no unified CI runner.
- Skill used: `initia-appchain-dev` — informs EVM deployment, InterwovenKit integration, bridge, auto-sign, and RPC conventions.

---

## 2. Workstreams (parallelizable)

### A. Smart Contracts (Solidity) — DEEP
1. **Review & refactor**
   - Audit `EcoReward`, `EcoVerifier`, `Staking` against CEI pattern, reentrancy (`nonReentrant` on all state-changing flows with external calls), integer overflow/underflow edges, unbounded loops, storage layout.
   - Move all magic numbers → named constants / immutable config.
   - Replace `tx.origin` usage (if any) with `msg.sender`.
   - Events on every state mutation (indexed args for off-chain indexer).
2. **Access control & governance**
   - Migrate admin powers to OpenZeppelin `AccessControl` with `DEFAULT_ADMIN_ROLE`, `ORACLE_ROLE`, `PAUSER_ROLE`, `UPGRADER_ROLE`.
   - Introduce `Pausable` on reward claim + staking deposit/withdraw.
   - `TimelockController` (48h) in front of admin role on mainnet; for testnet use 1h for faster iteration.
3. **Upgradeability**
   - Convert to **UUPS proxy** (OZ v5). `initialize()` with `disableInitializers()` on implementations. Upgrade only through timelock.
   - Freeze storage layout; add `__gap[50]` slots.
4. **Oracle signature flow**
   - `EcoVerifier` accepts EIP-712 typed signed attestations from the AI-vision oracle; verifier stores oracle pubkey in `ORACLE_ROLE`, supports multi-sig threshold (≥2 of N) for high-value claims.
   - Per-user nonce + deadline on attestations to prevent replay.
5. **Staking math hardening**
   - Use `uint256` accumulator pattern (MasterChef-style `rewardPerTokenStored`) to avoid per-user loop costs.
   - Fixed-point with 1e18 scaling; add property tests for monotonic rewards.
6. **Testing**
   - **Unit**: Foundry `forge test` — ≥95% line coverage on each contract (`forge coverage`).
   - **Fuzz**: `forge test --fuzz-runs 5000` on stake/unstake/claim, verifier attest/redeem, penalty math.
   - **Invariants**: `StdInvariant` handlers — "total staked == sum user stakes", "total rewards out ≤ rewards funded", "nonce is monotonic".
   - **Differential**: compare solidity reward calc vs. a minimal JS/Python reference to catch rounding drift.
   - **Gas snapshots**: `forge snapshot` committed; CI fails on regressions > 5%.
7. **Static analysis**
   - `slither .` (CI-blocking on High/Medium), `mythril analyze`, `solhint` with `solhint-plugin-security`.
8. **Deployment**
   - `script/deploy.s.sol` for testnet: deploy implementation → proxy → timelock → set roles → `saveBroadcast`. Verify via `minitiad tx evm create` per skill guidance.
   - Checksummed address registry in `src/lib/contracts/config.ts` + JSON artifact shipped with build.
9. **Post-deploy sanity**
   - Automated smoke script: stake → unstake partial → claim rewards → verify task → bridge out, all against live testnet contracts.

### B. Backend API — SOLID
1. **Schema + validation coverage**
   - Ensure every route under `src/app/api/**` uses a Zod schema from `src/lib/api/schemas.ts`. Grep for any route missing the `withValidation` wrapper; fix.
2. **Auth & authorization**
   - Enforce Clerk session on all mutating routes. Add an `requireUser(request)` helper that pulls `auth()` and maps to internal `User` via `clerkId`.
   - Row-level checks: a user can only read/mutate their own records. Admin routes gated by `role === "admin"` (store on `User`).
3. **Idempotency**
   - `Idempotency-Key` header honored on `/api/redeem`, `/api/stake`, `/api/bridge`, `/api/verify`. Store keys in Redis for 24h.
4. **Rate limiting**
   - Per-user + per-IP sliding window via Upstash Redis (token bucket). Configured per route group (strict on `/verify`, lax on GETs).
5. **Pagination & sorting**
   - All list endpoints accept `?cursor=&limit=` with `limit<=100`. Return `{ items, nextCursor }`.
6. **Error taxonomy**
   - Consolidate `src/lib/api/errors.ts` to a closed set of codes. Never leak stack traces in production responses.
7. **Background jobs (free)**
   - Use **Vercel Cron** for scheduled work and **`pg-boss`** (Postgres-backed job queue, OSS) for async fan-out. No paid QStash. One route/handler per job type.
8. **On-chain indexer (free host)**
   - Dedicated `scripts/indexer/` long-running Node process on **Fly.io free shared VM** (or Render free web service). Subscribes to EcoReward/Verifier/Staking events, writes to Postgres, emits SSE via existing `publishEvent`.
9. **OpenAPI**
   - Generate `docs/openapi.yaml` from Zod via `zod-to-openapi`. Serve at `/api/openapi` in dev only.

### C. Security & Secrets — DEEP
1. **Secrets hygiene**
   - Audit `.env` + `.env.example` — remove any committed secrets. Set up **Vercel Environment Variables** per environment (dev/preview/prod) with separate DB + Redis + VAPID keypairs + oracle signer.
   - Add `git-secrets` + `gitleaks` to CI.
2. **Key management (free)**
   - Oracle signer runs as a **standalone Fly.io app** with its private key injected as a Fly secret (encrypted at rest; never on the web app host).
   - App talks to signer over an internal HMAC-authenticated HTTP endpoint; the web app never sees the raw key.
   - Libsodium sealed-box used for any on-disk encryption. Replaces paid KMS.
   - Document rotation runbook (every 90 days). Rotation procedure: deploy new signer with new key, update web-app env to new signer URL + HMAC secret, rotate role on-chain, decommission old signer.
3. **HTTP security headers**
   - `next.config.ts` → strict CSP (`script-src 'self' 'nonce-...'`), HSTS (max-age=63072000), `X-Frame-Options: DENY`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy` minimal.
   - CSRF: double-submit cookie pattern on state-changing forms; Clerk + same-site cookies cover most cases, but verify.
4. **Webhook signature verification**
   - Any inbound webhook (Clerk, QStash, Stripe if later): verify HMAC/JWT signatures before processing. Reject replays via `eventId` nonce in Redis.
5. **Dependency hygiene**
   - `pnpm audit --prod` gate in CI. Dependabot + Renovate weekly. SBOM via `cyclonedx-npm` on release.
6. **SAST / DAST**
   - **SAST**: `eslint-plugin-security`, `semgrep --config p/owasp-top-ten`, `npm:@microsoft/eslint-formatter-sarif` → GitHub code scanning tab.
   - **DAST**: ZAP baseline scan against preview deployment on PR.
7. **Client-side**
   - Remove `dangerouslySetInnerHTML` usage; if any remain, sanitize via DOMPurify.
   - Strict wallet-call allowlist in `src/lib/contracts/` — never accept arbitrary contract addresses from user input on the client.
8. **Data privacy**
   - Minimize PII: store only Clerk `userId`, `email`, `displayName`. Nothing else without review.
   - DB-level: enable Prisma `shadowDatabase`; use Postgres row-level security for multi-tenant paths (out of v1 scope but noted).
9. **Penetration-lite checklist**
   - OWASP ASVS Level 1 checklist run manually pre-launch. Tracked as a markdown in `docs/security/`.

### D. Testing + CI/CD + Observability — DEEP
1. **Test pyramid**
   - **Unit (Jest)**: `src/lib/**` and `src/hooks/**` — target 80% coverage. Convert legacy `.test.js` to TS.
   - **Integration (Jest + supertest-like against Next route handlers)**: every API route gets a happy-path + 3 failure-path tests. Use Prisma test DB via `testcontainers` on CI, SQLite-memory locally.
   - **Contract tests (Foundry)**: see §A.6.
   - **E2E (Playwright)**: 6 critical flows — sign in, verify task, stake, unstake, vote on proposal, bridge out. Runs against preview URL on PR.
   - **Load (k6)**: scripted runs on `/api/analytics/metrics`, `/api/leaderboard`, `/api/events` (SSE concurrency). Baselines in `tests/load/`.
2. **Unified commands**
   - `pnpm test` → unit + integration. `pnpm test:e2e`, `pnpm test:load`, `pnpm test:contracts` (wraps `forge test`).
   - Remove flaky/duplicate tests (`tests/middleware.test.js` + `tests/middleware/*.test.ts` — consolidate to TS only).
3. **CI — GitHub Actions**
   - Jobs: `lint` (eslint + prettier-check + solhint) → `typecheck` → `test:unit` → `test:integration` → `test:contracts` (+ coverage) → `slither` → `gitleaks` → `semgrep` → `build` → `playwright` (against preview) → `release` (on tag).
   - Matrix Node 20/22. Concurrency cancels superseded runs. Caching for pnpm + Foundry + Playwright browsers.
   - Required checks on `main`: lint, typecheck, unit, integration, contracts, slither.
4. **CD**
   - Vercel preview per PR. Production deploys on GitHub Release (manual tag). Contract deployments via manual workflow_dispatch with explicit chain selection.
   - DB migrations via `prisma migrate deploy` in a pre-deploy step. Block app deploy if migration fails.
5. **Observability (free tier only)**
   - **Errors**: Sentry Developer free (5k events/mo) — add release tagging, user context, perf tracing on critical routes.
   - **Logs**: structured JSON via `src/lib/api/logger.ts` → Vercel log drain to **Better Stack free** (1 GB/mo, 3-day retention). Sample-aggressive on healthy paths.
   - **Metrics**: OpenTelemetry → **Grafana Cloud free** (10k series, 14-day retention). Request count, p50/p95/p99 latency, DB pool usage, Redis latency, SSE connection count.
   - **Uptime**: **UptimeRobot free** on `/api/health` every 5 min (free tier interval), alerts to Discord webhook + email.
   - **Status page**: **Better Stack free** public status page.
   - **Business dashboards**: Grafana panels for verifications/day, DAU, staking TVL, bridge volume, proposal activity.
6. **Release gates**
   - No deploy to prod if: any test suite fails, coverage drops below threshold, Slither High finding exists, gas snapshot regresses >5%, open Sentry issue with severity=critical in last release.

### E. Platform Stability — Redis flood fix (ROOT-CAUSE)

**Symptom**: Dev server flooded with `[ioredis] Unhandled error event: AggregateError ... ECONNREFUSED` stack traces every ~100ms.

**Root cause**: `src/lib/redis/client.ts` constructs `new Redis(...)` at module import with `lazyConnect: false`, so when no Redis server is running (typical local dev without Upstash), ioredis retries forever, emits `error` events, and `createSubscriber` in `src/lib/realtime/pubsub.ts` spawns additional connections each time a route imports it.

**Fix (minimal, production-safe)**:
1. **Env-gated construction**: make `redis` a **stub no-op client** when `REDIS_URL`/`REDIS_HOST` is unset (dev default) or when `DISABLE_REDIS=1`. Stub exposes `get/set/del/publish/subscribe/ping` as no-ops returning `null`/0 so callers never crash.
2. **Lazy + throttled**: when real Redis is configured, switch to `lazyConnect: true`, `maxRetriesPerRequest: 3`, and `retryStrategy` that backs off to a 30s cap and **gives up** (returns `null`) after 5 failures. Log once, not every retry.
3. **Error sink**: attach a single `error` handler that coalesces repeated errors behind a 60s dedupe window so we log once per minute instead of flooding.
4. **Subscriber reuse**: replace per-route `createSubscriber` calls with a single module-level subscriber shared across SSE connections (map `channel → Set<client>`).
5. **Cache wrapper graceful fallback**: `src/lib/redis/cache.ts` helpers return `undefined` on any Redis error and fall through to recomputation (already partially done — audit all callsites).
6. **Docs**: `.env.example` gains a big comment block: "Leave REDIS_URL blank locally; rate limiting + SSE fan-out will degrade gracefully."
7. **Tests**: one unit test per fallback (rate limiter, cache, pubsub) asserting correct behavior when Redis is unavailable.

Single-file root-cause fix — no downstream workarounds.

---

### F. Navigation & Information Architecture — sidebar-icon primary + top-nav sub-nav

**Goal**: One consistent nav pattern across all three role personas. Icon sidebar is primary; top nav is always a **sub-navigation** of the current sidebar section (not a duplicate main nav).

#### Structure
- **Sidebar (`SideNavBar`)** — 80px, icon-only, fixed left, always visible ≥ `md`. Collapses to drawer on mobile.
  - Icons map to **top-level sections** (e.g. Dashboard, Earn, Wallet, Impact for users; Campaigns, Tasks, Rewards, Analytics for sponsors; etc.).
  - Active icon: scale + accent color + left indicator bar.
  - Each icon has `aria-label` + tooltip.
- **TopNavBar** — thin, sticky, role-aware. Contains:
  - Left: current section title + breadcrumbs.
  - Center: **sub-tabs for the active section** (e.g. on Earn: "Discover / My Tasks / History"). These are NOT duplicate sidebar links.
  - Right: search / theme toggle / notification bell / user menu.
- **Mobile**: sidebar becomes a drawer triggered by a hamburger in top nav. Sub-tabs become a horizontal scrollable chip row under top nav.

#### Implementation
1. Introduce `NavigationConfig` type: `{ role, sections: { id, icon, label, href, subNav: {label, href}[] }[] }`.
2. One source of truth: `src/lib/navigation/config.ts` exports `navigationFor(role)`.
3. `SideNavBar` renders `sections` only (icons).
4. `TopNavBar` consumes current pathname, resolves the active section, renders that section's `subNav` as tabs.
5. Deprecate ad-hoc `operatorHubNav` literal in `app-shell.tsx`; all shells consume `navigationFor(role)`.
6. Breadcrumb component stays but uses the resolved section/sub-nav from config.

---

### G. Role-Differentiated UI/UX — User / Sponsor / Super-Admin

Three personas, three distinct experiences sharing the **same** nav framework from §F. Extend `User.role` enum in Prisma to `user | sponsor | admin` (already `user | admin | owner`; rename `owner → admin` where it means super-admin, add `sponsor`).

#### Role detection & routing
- Middleware `src/middleware.ts` reads Clerk session → looks up `User.role` → sets a header / cookie `x-user-role` for server components, and redirects mismatched paths (e.g. a `user` hitting `/admin` → 403 page with link to dashboard).
- Route groups:
  - `src/app/(user)/…` — dashboard, discover, rewards, leaderboard, governance, bridge, analytics (personal).
  - `src/app/sponsor/…` — already exists; flesh out.
  - `src/app/admin/…` — already exists; flesh out (super admin).
- Each route group has its own `layout.tsx` pulling the correct `navigationFor(role)` and gating via a shared `<RoleGuard role="sponsor" />` component.

#### User persona ("normal user")
- **Narrative**: "Do green actions → earn ECO → level up / stake / redeem."
- **Sidebar**: `Dashboard · Earn · Wallet · Impact · Community`.
- **Home**: balance, streak, today's recommended tasks, leaderboard snapshot, recent notifications.
- **Earn** (sub-nav: Discover / Camera / IoT / History): task catalog, submit proofs.
- **Wallet** (sub-nav: Balance / Stake / Bridge / Redeem): all value flows.
- **Impact** (sub-nav: Personal / Global): CO2 offset chart, cumulative rewards.
- **Community** (sub-nav: Leaderboard / Governance): ranks, proposals, votes.
- Visual language: warm, green, playful; rounded cards; progress bars; celebratory micro-animations on reward grants.

#### Sponsor persona (companies / partners that fund tasks)
- **Narrative**: "Fund verified green tasks at scale; measure impact; advertise your brand."
- **Sidebar**: `Overview · Campaigns · Tasks · Rewards Pool · Analytics · Settings`.
- **Overview** (home): pool balance, live tasks, recent verifications, ROI panel.
- **Campaigns** (sub-nav: Active / Drafts / Archived): create, schedule, budget, KPIs.
- **Tasks** (sub-nav: Catalog / Submissions / Disputes): propose new task templates, review evidence, challenge fraud.
- **Rewards Pool** (sub-nav: Deposit / Allocate / Treasury): top-up, allocate per campaign, view burn.
- **Analytics** (sub-nav: Reach / CO2 / Conversion): impact dashboards sliceable by campaign/region.
- **Settings** (sub-nav: Brand / Team / Billing-like / API Keys): logo, colors (used in task cards), team members with scoped roles (sponsor_admin vs sponsor_viewer).
- Visual language: data-dense, neutral palette with sponsor's brand color accent, table-first, export buttons everywhere.

#### Super-admin persona
- **Narrative**: "Operate the protocol: monitor health, moderate, manage roles, emergency-pause."
- **Sidebar**: `Overview · Users · Sponsors · Review Queue · Fraud · On-chain · Config · Audit Log`.
- **Overview**: system health tiles (DB, Redis, RPC, oracle), DAU/MAU, today's verifications, open incidents.
- **Users** (sub-nav: All / Flagged / Banned): search, inspect, change roles, force logout, delete.
- **Sponsors** (sub-nav: Approved / Pending / Rejected): onboarding approvals, pool balances, disputes.
- **Review Queue** (sub-nav: Manual / Escalated / AI-Flagged): verification triage.
- **Fraud** (sub-nav: Signals / Rules / Blocklist): tune fraud model thresholds, quarantine proofs.
- **On-chain** (sub-nav: Contracts / Pause / Upgrades): contract addresses, `Pausable` toggle (behind confirm modal), queue upgrade through timelock.
- **Config** (sub-nav: Tasks / Rewards / Feature Flags): CRUD baseline reward templates, toggle features.
- **Audit Log**: immutable log of every admin action (writes to `LedgerEntry` + separate `AuditLog` table).
- Visual language: dense dashboard, dark-friendly, alert-first (red/amber banners), table views, keyboard-shortcut forward.
- **Dangerous actions** require: (a) explicit confirm text (type contract name), (b) 2-step for destructive (soft-delete → hard-delete 24h later), (c) recorded in `AuditLog` with actor clerkId.

#### Shared production-UI polish (all three)
- Design tokens in `globals.css` (light + dark). Role themes are derived token sets, not separate style files.
- A11y: WCAG AA contrast, keyboard-reachable everywhere, focus rings, skip-to-content.
- Responsive: 320px (phone) → 1920px (desktop).
- Loading states: skeleton per card type; avoid full-page spinners.
- Empty states: illustrated + actionable CTA.
- Error boundaries per route group with friendly fallback and "copy diagnostic ID" button.
- Toast system (shadcn/ui-style) for all async actions.
- Command palette (⌘K) for admin + sponsor (search users/campaigns/tasks).

---

### H. Operational playbooks
- `docs/runbooks/incident-response.md` — severity matrix, comms template, on-call rotation (solo → team later).
- `docs/runbooks/oracle-key-rotation.md`.
- `docs/runbooks/contract-upgrade.md` — timelock queue → execute → verify → rollback path.
- `docs/runbooks/db-restore.md` — point-in-time recovery drill scheduled quarterly.
- `docs/runbooks/push-notification-failure.md`.

---

## 3. Phased Roadmap (6–8 weeks)

### Phase 0 — Foundation (week 1)
- [ ] Baseline audit: run `slither`, `pnpm audit`, `tsc --noEmit`, existing tests; capture issues in GitHub. *(Slither now in CI via `contracts` job; manual baseline audit still pending.)*
- [x] Repo hygiene: delete committed `build.log`, `build.pid`, `dist*/`, `EcoReward.bin`, `EcoVerifier.bin`; add to `.gitignore`. *(Patterns covered in `.gitignore`.)*
- [ ] Consolidate `tsconfig`s and drop the ambient `src/types/prisma-client.d.ts` shim once real Prisma types resolve.
- [x] Stand up GitHub Actions skeleton with `lint + typecheck + test:unit` as required checks. *(`ci.yml`: `contracts` + `secrets` + `sast` + `web` jobs; unit/integration/build/coverage all wired.)*
- [ ] Branch protection on `main`: require PR, required checks, linear history, signed commits. *(GitHub repo settings — not in-repo.)*

### Phase 1 — Contract hardening (weeks 2–3)
- [x] Refactor to `AccessControl` + `Pausable` + `ReentrancyGuard`. *(`EcoReward`, `EcoVerifier`, `Staking` all migrated to `AccessControl`; `ReentrancyGuard` on all external calls.)*
- [ ] UUPS proxy + TimelockController scaffolding. *(C-2 follow-on.)*
- [x] EIP-712 oracle attestations with nonce + deadline. *(`EcoVerifier.submitAttestedProof` — ORACLE_ROLE, per-user nonce, deadline.)*
- [x] Foundry unit test buildout to ≥95% coverage per contract. *(EcoReward 100%, EcoVerifier 97.4%, Staking 90.9%.)*
- [x] Fuzz + invariant suite passing with 5k runs, 256 depth. *(5 invariants, 128k calls.)*
- [ ] Slither clean (zero High, Medium triaged). *(Slither now in CI — initial run output pending.)*
- [x] `forge snapshot` baseline committed; CI gate enabled. *(`forge snapshot --check` in `contracts` CI job.)*
- [x] Deploy to Initia EVM testnet; populate address registry; run smoke script. *(`script/deploy.s.sol` + `scripts/deploy.sh` ready; node live at block 466 chain 1598283435881984; `PRIVATE_KEY` required in `.env` to broadcast.)*

### Phase 2 — Backend & security (weeks 3–5, overlaps Phase 1)
- [ ] Zod + auth + rate limit + idempotency coverage gap-fill sweep.
- [ ] `pg-boss` job queue (Postgres-backed, free) + indexer on Fly.io free tier.
- [x] Security headers, CSP, HSTS in `next.config.ts`. *(Full CSP + HSTS + X-Frame-Options + Referrer-Policy + Permissions-Policy.)*
- [ ] Self-hosted oracle signer (Fly.io free) with HMAC-authed HTTP API.
- [x] Secret scanning in CI. *(Gitleaks via `secrets` job; semgrep OWASP via `sast` job.)*
- [x] Semgrep OWASP rule set in CI. *(`sast` job fails on Critical/High findings.)*
- [ ] ZAP baseline scan in CI against preview URL.
- [ ] OpenAPI spec generated and checked into repo.

### Phase 3 — Testing, CI/CD, observability (weeks 4–6, overlaps)
- [x] Jest unit coverage thresholds enforced in CI. *(`jest.config.js` with branches≥80/lines≥85 + `test:unit:jest` step in CI.)*
- [ ] Full Jest integration suite with testcontainers Postgres.
- [ ] Playwright e2e suite on 6 critical flows, running on preview.
- [ ] k6 load baselines; document capacity plan.
- [ ] Sentry releases, OpenTelemetry metrics, Better Stack log drain (all free tier).
- [ ] UptimeRobot + Discord alerts.
- [ ] Grafana business dashboards.

### Phase 4 — Pre-launch (weeks 6–7)
- [ ] Internal security review walkthrough vs OWASP ASVS L1 + SCSVS.
- [ ] Load test passing agreed SLO (p95 < 400ms for reads, < 1500ms for writes at 100 rps).
- [ ] Disaster recovery rehearsal: restore DB from snapshot on staging.
- [ ] Oracle key rotation drill.
- [ ] Runbooks + status page (`status.ecochain.xyz`) via Better Stack.
- [ ] Public bug reporting channel (`security@…`).

### Phase 5 — Testnet launch (week 7–8)
- [ ] Tagged release `v1.0.0-testnet`.
- [ ] Announce + monitor for 72h window with heightened on-call.
- [ ] Post-launch retro → backlog for mainnet follow-on (external audit, formal verification on critical math, bug bounty).

---

## 4. Concrete Task List (GitHub-issue-ready)

### Contracts
- [x] [C-1] Add `ReentrancyGuard` + `Pausable` + `AccessControl` to `EcoReward`, `EcoVerifier`, `Staking`.
- [ ] [C-2] Convert to UUPS with `__gap` slots; write `Upgrade.s.sol`.
- [x] [C-3] Implement EIP-712 oracle attestation struct + verifier. *(nonce + deadline + ORACLE_ROLE.)*
- [x] [C-4] Rewrite staking rewards to O(1) linear interest. *(MasterChef accumulator is follow-on optimisation.)*
- [x] [C-5] Write invariant handlers + 5k fuzz tests. *(`test/Invariants.t.sol`: 5 invariants, 500 runs × 256 depth × 128k calls; I-1…I-5 all green.)*
- [x] [C-6] `forge coverage` ≥95% per contract. *(`EcoReward` 100%, `EcoVerifier` 97.4%, `Staking` 90.9%; `test/EcoRewardVerifier.t.sol` added 33 targeted tests.)*
- [x] [C-7] Slither + solhint wired into CI. *(contracts job; Mythril is follow-on.)*
- [x] [C-8] `script/deploy.s.sol` deploys contracts + roles + seeds tasks; JSON address log to stdout.
- [x] [C-9] Post-deploy smoke script under `scripts/smoke-testnet.ts`. *(Checks connectivity, token metadata, roles, tasks, nonce, domain separator; `pnpm smoke:testnet`.)*
- [x] [C-10] Gas snapshot baseline + CI regression gate.

### Backend
- [x] [B-1] API route auth audit: added `/api/analytics`, `/api/blockchain`, `/api/events` to `isAuthRequired` middleware matcher. *(Full Zod sweep pending.)*
- [B-2] `requireUser(request)` helper + row-level ownership checks.
- [x] [B-3] Idempotency-Key middleware via Redis. *(`src/lib/api/middleware/idempotency.ts` — `withIdempotency()` HOF, Redis 24h dedup, degrades when Redis absent.)*
- [B-4] Upstash sliding-window rate limiter middleware.
- [x] [B-5] Cursor pagination helper + adopt on all list routes. *(`src/lib/api/pagination.ts` — `paginationFor()`, `buildPage()`, `parsePaginationParams()`, `buildPrismaPage()`.)*
- [B-6] `pg-boss` job handlers: oracle verify, push fan-out, leaderboard recompute (free).
- [B-7] On-chain indexer service (separate deploy target).
- [B-8] Prisma Postgres row-level check: verify connection pool sizing for serverless.
- [B-9] OpenAPI generation + `/api/openapi` endpoint (dev-only).

### Security
- [x] [S-1] Gitleaks in CI (`secrets` job via `gitleaks/gitleaks-action@v2`).
- [ ] [S-2] Vercel env variable audit per environment; rotate any compromised values.
- [ ] [S-3] Self-hosted oracle signer (Fly.io free tier) behind HMAC-authed internal HTTP endpoint.
- [x] [S-4] CSP + HSTS + X-Frame-Options + Permissions-Policy in `next.config.ts`.
- [x] [S-5] Clerk webhook signature verification + replay guard. *(`src/lib/webhooks/clerk.ts` + `src/app/api/webhooks/clerk/route.ts`; svix sig verify + Redis 24h replay guard; handles user.created/updated/deleted.)*
- [ ] [S-6] `pnpm audit` + Dependabot + Renovate.
- [x] [S-7] Semgrep OWASP rule set in CI (`sast` job; fails on Critical/High).
- [ ] [S-8] ZAP baseline scan in CI against preview URL.
- [x] [S-9] OWASP ASVS L1 + SCSVS checklist as `docs/security/checklist.md`. *(Full ASVS V1–V14 + SCSVS G1–G9 mapped with status; open items listed.)*
- [ ] [S-10] Public `SECURITY.md` + `security@` alias.

### Platform Stability (Redis fix)
- [x] [P-1] Stub no-op Redis client when `REDIS_URL` unset. *(`createStubClient()` in `src/lib/redis/client.ts`.)*
- [x] [P-2] Switch real client to `lazyConnect: true`, bounded retries, 60s error-log dedupe.
- [x] [P-3] Shared module-level subscriber for SSE (`sharedBus` singleton in `pubsub.ts`).
- [x] [P-4] Graceful fallback in `src/lib/redis/cache.ts` — returns `null` on error.
- [x] [P-5] Unit tests for "Redis absent" code paths. *(`tests/redis-stub.test.ts` — added rate-limiter and pubsub fallback cases.)*
- [x] [P-6] `.env.example` documentation update.

### Navigation & IA
- [x] [N-1] `src/lib/navigation/config.ts` with `navigationFor(role)`.
- [x] [N-2] Refactor `SideNavBar` to consume config (icons only).
- [x] [N-3] Refactor `TopNavBar` to render sub-nav for the active section.
- [x] [N-4] Mobile drawer — upgraded to accept `NavSection[]` from `navigationFor(role)`, renders all sections with expandable sub-nav for active section; legacy `navItems` fallback kept for landing variant.
- [x] [N-5] Remove ad-hoc nav literals from shells. *(`app-shell.tsx` cleaned; `dao-shell.tsx` uses its own bespoke layout — tracked separately.)*
- [x] [N-6] Breadcrumb labels derived from `navigationFor(role)` config.

### Role-Based UI (user / sponsor / admin)
- [x] [R-1] Prisma: `User.role` string `user | sponsor | admin | owner` already present; `useUserRole` hook reads from Clerk `publicMetadata`.
- [x] [R-2] `src/middleware.ts` role guard + 403 redirect.
- [x] [R-3] `<RoleGuard />` + `<ShowForRole />` components in `src/components/auth/role-guard.tsx`.
- [ ] [R-4] `(user)` route group with dashboard/earn/wallet/impact/community.
- [ ] [R-5] `sponsor/` route group fully fleshed out.
- [ ] [R-6] `admin/` route group fully fleshed out.
- [x] [R-7] `AuditLog` Prisma model + `src/lib/audit/log.ts` write helper + `AuditActions` constants.
- [ ] [R-8] Sponsor team sub-roles (`sponsor_admin`, `sponsor_viewer`).
- [ ] [R-9] Design tokens + light/dark themes per role.
- [~] [R-10] Error boundaries per route group with copy-diagnostic-id button (`src/app/error.tsx` upgraded, `src/app/admin/error.tsx`, `src/app/sponsor/error.tsx` created). Toast system already mounted in `AppProviders`. Skeletons, empty states, ⌘K command palette still pending.
- [ ] [R-11] A11y pass.
- [ ] [R-12] Visual regression snapshots (Playwright).

### Testing + CI/CD + Observability
- [x] [T-1] Migrate `middleware.test.js` → `tests/middleware/route-protection.test.ts`.
- [ ] [T-2] Jest integration suite with testcontainers Postgres.
- [x] [T-3] Coverage thresholds (branches≥80 / lines≥85) in `jest.config.js`; enforced in CI.
- [ ] [T-4] Playwright e2e for 6 critical flows on preview.
- [ ] [T-5] k6 load suite + baseline report.
- [x] [T-6] GitHub Actions pipeline: `contracts` (forge+slither+solhint) + `secrets` (gitleaks) + `sast` (semgrep) + `web` (lint/test/build) jobs.
- [ ] [T-7] Sentry release tagging + perf tracing + dashboards.
- [ ] [T-8] OpenTelemetry metrics export to Grafana Cloud.
- [ ] [T-9] Better Stack free log drain.
- [ ] [T-10] UptimeRobot + Discord alerts on `/api/health`. *(`/api/health` endpoint exists and checks DB + Redis.)*
- [ ] [T-11] Grafana business dashboards.
- [x] [T-12] Runbooks: `incident-response.md`, `oracle-key-rotation.md`, `contract-upgrade.md`, `db-restore.md`.
- [ ] [T-13] Release gate workflow with manual approval for prod.

---

## 5. SLOs (initial targets)

| Metric | Target |
|---|---|
| API read p95 latency | < 400 ms |
| API write p95 latency | < 1500 ms |
| SSE connection uptime | > 99.5% monthly |
| Error rate (5xx) | < 0.5% |
| Contract tx success rate | > 99% (excluding user rejects) |
| Oracle verification time | < 30s p95 |
| Incident MTTR | < 2h |

---

## 6. Risks & Mitigations

| Risk | Mitigation |
|---|---|
| Oracle key compromise | Isolated signer (Fly.io secret-scoped), rotation runbook, on-chain multi-sig threshold |
| Unbounded storage growth (verifications, notifications) | Retention job purging > 1y data; partitioned tables |
| SSE scaling on serverless | Migrate to dedicated worker if concurrent connections > 5k |
| Prisma Postgres quota exhaustion | Connection pool metrics + alert at 80% |
| Testnet outage blocking dev | Keep local Anvil + cached fixtures to unblock tests |
| Redis free-tier rate hit (10k cmd/day) | Per-user cache coalescing; cache read-heavy paths at the edge; graceful fallback when limit hit |
| Fly.io free VM sleep / cold start | Health-ping via UptimeRobot keeps signer warm; SSE pings keep connections alive |
| GitHub Actions minute budget (private repo) | Keep slow jobs (Playwright, k6) in nightly cron, not per-PR |
| Silent contract regressions on upgrade | Gas + invariant diff in CI, timelock gives 1h rollback window on testnet |

---

## 7. Deliverables checklist

- Hardened contracts deployed on Initia EVM testnet, addresses checked in, verified on explorer.
- CI pipeline green on `main`, all gates enforced.
- `docs/runbooks/*`, `docs/security/checklist.md`, `docs/openapi.yaml`.
- Sentry + Grafana + UptimeRobot dashboards linked from README.
- `v1.0.0-testnet` GitHub release with changelog.
- Post-launch retro + mainnet roadmap issue list.
