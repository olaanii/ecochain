# EcoChain Security Checklist
## OWASP ASVS L1 + SCSVS (Smart Contract Security Verification Standard)

Legend: ✅ Done · ⚠️ Partial · ❌ Pending · N/A Not applicable

---

## OWASP ASVS L1 — Application Security Verification Standard

### V1 Architecture, Design and Threat Modelling
| # | Requirement | Status | Notes |
|---|---|---|---|
| 1.1.1 | Secure SDLC documented | ⚠️ | `plan.md` roadmap exists; formal SDLC doc pending |
| 1.2.1 | All app components identified and needed | ✅ | Next.js, Prisma, Clerk, Redis, Foundry contracts |
| 1.4.1 | Trusted enforcement points (server-side) | ✅ | All mutations in API routes; no client-only guards |

### V2 Authentication
| # | Requirement | Status | Notes |
|---|---|---|---|
| 2.1.1 | Passwords/secrets ≥12 chars | ✅ | Clerk handles auth; no app-managed passwords |
| 2.5.1 | Password reset secure | ✅ | Clerk magic link/OTP |
| 2.7.1 | OTP/magic link expire | ✅ | Clerk default 10-min expiry |
| 2.8.1 | Stateless tokens (JWT) verified server-side | ✅ | `clerkMiddleware` + `auth()` on every API route |
| 2.10.1 | Service creds not in code | ✅ | All secrets in Vercel env vars / `.env` (gitignored) |

### V3 Session Management
| # | Requirement | Status | Notes |
|---|---|---|---|
| 3.2.1 | Session token random, ≥64 bits entropy | ✅ | Clerk JWT |
| 3.3.1 | Session logout invalidates server-side | ✅ | Clerk session revocation |
| 3.4.2 | Secure + SameSite=Strict cookies | ✅ | Clerk cookie defaults |

### V4 Access Control
| # | Requirement | Status | Notes |
|---|---|---|---|
| 4.1.1 | AC enforced server-side | ✅ | `middleware.ts` role guard + API `auth()` |
| 4.1.2 | All user/data attributes verified server-side | ✅ | Prisma row-level ownership on key routes |
| 4.1.3 | Principle of least privilege | ⚠️ | Admin routes guarded; some API routes lack role checks |
| 4.2.1 | Sensitive data accessible only to owners | ⚠️ | Partial — leaderboard public; wallet data gated |
| 4.3.1 | Admin UIs protected | ✅ | `/admin` → requires `admin\|owner` role via middleware |

### V5 Validation, Sanitization and Encoding
| # | Requirement | Status | Notes |
|---|---|---|---|
| 5.1.1 | HTTP parameter pollution prevented | ✅ | Next.js route handlers parse typed params |
| 5.1.3 | Input validated server-side | ⚠️ | Zod on most routes; gap-fill sweep (B-1) pending |
| 5.3.1 | Output encoding prevents XSS | ✅ | React auto-escapes; `dangerouslySetInnerHTML` not used |
| 5.4.1 | Memory-safe language | N/A | TypeScript/Solidity |

### V7 Error Handling and Logging
| # | Requirement | Status | Notes |
|---|---|---|---|
| 7.1.1 | No sensitive data in logs | ⚠️ | Sentry configured; PII scrubbing not verified end-to-end |
| 7.1.2 | Logs contain user ID + action | ⚠️ | `AuditLog` model implemented; not yet wired everywhere |
| 7.3.1 | Security logging for auth events | ⚠️ | Clerk webhooks → `AuditLog` (webhook verification pending) |
| 7.4.1 | Generic error messages to users | ✅ | API routes return structured error codes; no stack traces |

### V9 Communications
| # | Requirement | Status | Notes |
|---|---|---|---|
| 9.1.1 | TLS 1.2+ enforced | ✅ | Vercel terminates TLS; HSTS in `next.config.ts` |
| 9.1.2 | TLS cert valid, pinning not broken | ✅ | Vercel managed certs |
| 9.2.2 | Internal connections TLS | ⚠️ | Prisma over TLS to Prisma Postgres ✅; Redis TLS depends on provider |

### V10 Malicious Code
| # | Requirement | Status | Notes |
|---|---|---|---|
| 10.2.1 | Source integrity (no malicious deps) | ⚠️ | `pnpm audit` not automated; Dependabot pending (S-6) |
| 10.3.1 | No auto-update mechanisms | ✅ | pnpm lockfile committed |

### V11 Business Logic
| # | Requirement | Status | Notes |
|---|---|---|---|
| 11.1.1 | Business logic flows in sequence | ✅ | Proof submission → mint enforces task existence + nonce |
| 11.1.3 | Time limits on sensitive actions | ✅ | 48h proof window; EIP-712 deadline on attestations |
| 11.1.5 | Unusual automation detected | ❌ | Rate limiting present but bot detection not implemented |

### V12 Files and Resources
| # | Requirement | Status | Notes |
|---|---|---|---|
| 12.3.1 | No user-controlled file paths | ✅ | No file upload endpoints |
| 12.5.1 | Untrusted resources not served | ✅ | CSP `default-src 'self'` prevents external resource load |

### V13 API and Web Services
| # | Requirement | Status | Notes |
|---|---|---|---|
| 13.1.1 | REST API uses HTTP verbs correctly | ✅ | GET=read, POST/PATCH=mutate, DELETE=remove |
| 13.1.3 | API docs/schema available | ❌ | OpenAPI spec pending (B-1 follow-on) |
| 13.2.1 | Enabled HTTP methods only | ✅ | Next.js route handlers only export named method handlers |
| 13.3.1 | JSON schema validated on input | ⚠️ | Zod on most routes; full sweep (B-1) pending |

### V14 Configuration
| # | Requirement | Status | Notes |
|---|---|---|---|
| 14.1.1 | Build pipeline uses dependency pinning | ✅ | pnpm-lock.yaml + foundry.lock |
| 14.2.1 | Components up to date | ⚠️ | Renovate/Dependabot not yet active (S-6) |
| 14.4.1 | HTTP security headers | ✅ | Full set in `next.config.ts` |
| 14.4.2 | CSP policy | ✅ | Strict CSP with `frame-ancestors 'none'` |
| 14.4.3 | X-Content-Type-Options: nosniff | ✅ | |
| 14.4.4 | X-Frame-Options: SAMEORIGIN | ✅ | |
| 14.4.5 | Strict-Transport-Security | ✅ | |
| 14.5.1 | CORS policy | ⚠️ | Next.js defaults; explicit CORS header review pending |

---

## SCSVS — Smart Contract Security Verification Standard

### G1 Architecture, Design and Threat Modelling
| # | Requirement | Status | Notes |
|---|---|---|---|
| G1.1 | Access control model documented | ✅ | `DEFAULT_ADMIN`, `MINTER`, `PAUSER`, `ORACLE`, `RECOVERY` roles |
| G1.2 | External dependencies minimised | ✅ | Only OZ v5; no oracles beyond our own signer |
| G1.3 | Upgrade path defined | ⚠️ | UUPS proxy (C-2) planned; current contracts non-upgradeable |

### G2 Policies
| # | Requirement | Status | Notes |
|---|---|---|---|
| G2.1 | Contract can be paused | ✅ | `EcoReward`, `EcoVerifier`, `Staking` all have `Pausable` |
| G2.2 | Pause is role-gated | ✅ | `PAUSER_ROLE` required |
| G2.3 | No unconditional self-destruct | ✅ | No `selfdestruct` in codebase |

### G3 Upgradeability
| # | Requirement | Status | Notes |
|---|---|---|---|
| G3.1 | Upgrade mechanism secure | ⚠️ | UUPS pending (C-2) |
| G3.2 | `__gap` slots reserved for storage | ❌ | Pending UUPS implementation |

### G4 Business Logic
| # | Requirement | Status | Notes |
|---|---|---|---|
| G4.1 | Integer overflow/underflow | ✅ | Solidity 0.8+ built-in checked arithmetic |
| G4.2 | Token amounts validated | ✅ | `MINIMUM_STAKE`, `whenNotPaused`, require checks |
| G4.3 | Reward formula correct and tested | ✅ | O(1) linear interest; 28 unit tests + 5 invariants |
| G4.4 | No unbounded loops | ✅ | Previous compound-interest loop replaced |

### G5 Access Control
| # | Requirement | Status | Notes |
|---|---|---|---|
| G5.1 | No `tx.origin` for auth | ✅ | Only `msg.sender` used |
| G5.2 | Role separation (minter ≠ pauser ≠ admin) | ✅ | Three distinct roles on each contract |
| G5.3 | Admin key is multi-sig or timelocked | ❌ | Currently single-key deployer; TimelockController (C-2) pending |

### G6 Communications / Oracle
| # | Requirement | Status | Notes |
|---|---|---|---|
| G6.1 | Off-chain data via oracle with replay guard | ✅ | EIP-712 attestation + per-user nonce + deadline |
| G6.2 | Oracle role revocable | ✅ | `revokeRole(ORACLE_ROLE, addr)` via `DEFAULT_ADMIN` |
| G6.3 | Oracle signature verified on-chain | ✅ | `ECDSA.recover` + `hasRole(ORACLE_ROLE, signer)` |

### G7 Arithmetic and Logic
| # | Requirement | Status | Notes |
|---|---|---|---|
| G7.1 | No division before multiplication | ✅ | Reward formula multiplies first, divides last |
| G7.2 | Rounding direction explicit | ✅ | Intentional floor rounding favours protocol |

### G8 Denial of Service
| # | Requirement | Status | Notes |
|---|---|---|---|
| G8.1 | No unbounded iterations on user-supplied arrays | ✅ | Staking storage per user; no global iteration |
| G8.2 | External calls follow CEI | ✅ | State updated before `ecoToken.mint()` / `transfer()` |
| G8.3 | ReentrancyGuard on all state-changing external | ✅ | `nonReentrant` on `stake`, `unstake`, `submitProof`, `submitAttestedProof` |

### G9 Blockchain Data
| # | Requirement | Status | Notes |
|---|---|---|---|
| G9.1 | No sensitive data on-chain | ✅ | Only proof hashes stored; no PII |
| G9.2 | `block.timestamp` not used as sole randomness | ✅ | Timestamp only for expiry checks (48h window, not for randomness) |

---

## Next Steps (open items above)
1. **S-6** — Enable Dependabot for npm + GitHub Actions.
2. **S-5** — Clerk webhook signature verification + replay guard.
3. **C-2** — UUPS proxy + TimelockController (`__gap` slots).
4. **B-1** — Full Zod + auth sweep across all API routes.
5. **G5.3** — Move admin key to Gnosis Safe or add TimelockController on testnet.
