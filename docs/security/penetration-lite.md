# Penetration-Lite Checklist

OWASP ASVS L1-aligned security verification checklist for EcoChain.

## Authentication & Session Management

- [x] JWT tokens use secure signing (RS256)
- [x] Tokens expire after reasonable time (1 hour access, 7 day refresh)
- [x] Session IDs are cryptographically random
- [x] Sessions invalidated on logout
- [x] Password policy enforced (Clerk default: 8+ chars)
- [x] Account lockout after failed attempts (Clerk handles)
- [x] Secure session storage (httpOnly cookies for refresh)

## Authorization

- [x] RBAC implemented (user, sponsor, admin, owner)
- [x] Admin routes protected by role middleware
- [x] Resource-level access control (user can only access own data)
- [x] API keys scoped to specific permissions
- [x] No privilege escalation via parameter tampering

## Input Validation

- [x] Zod schemas validate all API inputs
- [x] SQL injection prevention via Prisma ORM
- [x] NoSQL injection prevention (MongoDB not used)
- [x] XSS prevention (React auto-escapes, CSP headers)
- [x] Command injection prevention (no shell exec)
- [x] File upload validation (type, size limits)
- [x] Path traversal prevention (no user-controlled paths)

## Cryptography

- [x] AES-256-GCM for data encryption
- [x] RSA-2048 or EC P-256 for signatures
- [x] SHA-256 for hashing
- [x] Bcrypt/Argon2 for passwords (Clerk handles)
- [x] Secure random number generation
- [x] No hardcoded keys in source
- [x] Key rotation procedure documented

## Error Handling & Logging

- [x] Generic error messages to users (no stack traces)
- [x] Security events logged (auth failures, access denied)
- [x] Sensitive data not logged
- [x] Centralized logging with integrity checks
- [x] Audit log immutability

## API Security

- [x] Rate limiting implemented (per IP, per user)
- [x] Idempotency keys for mutation operations
- [x] API versioning strategy
- [x] CORS properly configured
- [x] Content-Type validation
- [x] Request size limits
- [x] Timeout handling

## Web Security Headers

- [x] Content-Security-Policy configured
- [x] X-Frame-Options: DENY
- [x] X-Content-Type-Options: nosniff
- [x] Referrer-Policy: strict-origin-when-cross-origin
- [x] Permissions-Policy set
- [x] HSTS enabled (production)
- [x] CSRF protection for state-changing ops

## Dependency Security

- [x] npm audit in CI/CD
- [x] Automated dependency updates (Dependabot)
- [x] License compliance check
- [x] SBOM generated
- [x] No known vulnerable dependencies in production

## Infrastructure Security

- [x] TLS 1.2+ required
- [x] Secure ciphers only
- [x] HSTS preload ready
- [x] DDoS protection (Cloudflare/Vercel Edge)
- [x] WAF rules configured
- [x] Database encrypted at rest
- [x] Network segmentation (DB not publicly accessible)

## Blockchain Security

- [x] Smart contracts audited
- [x] Oracle data signed and verified
- [x] Replay protection on chain
- [x] Access controls on contract functions
- [x] Emergency pause functionality
- [x] Upgrade mechanism (proxy pattern)

## Testing Checklist

Run these before each release:

```bash
# SAST
npx eslint --ext .ts,.tsx src/ --rule 'security/*: error'
npx semgrep --config=auto src/

# Dependency audit
npm audit --audit-level=moderate

# Secret scanning
gitleaks detect --source . --verbose

# Test authentication bypass
curl -X POST https://api.ecochain.io/api/admin/users \
  -H "Content-Type: application/json" \
  -d '{}' # Should 401

# Test rate limiting
for i in {1..150}; do
  curl -s -o /dev/null -w "%{http_code}" https://api.ecochain.io/api/health
done | grep -c "429" # Should see 429s

# Test SQL injection
curl "https://api.ecochain.io/api/tasks?category=' OR '1'='1"
# Should not return all tasks

# Test XSS
curl -X POST https://api.ecochain.io/api/verify \
  -H "Content-Type: application/json" \
  -d '{"taskId": "<script>alert(1)</script>"}'
# Should sanitize or reject
```

## Sign-off

| Role | Name | Date | Signature |
|------|------|------|-----------|
| Security Lead | | | |
| Engineering Lead | | | |
| DevOps Lead | | | |

## Review Schedule

- **Weekly**: Automated scans (SAST, dependency audit)
- **Monthly**: Manual penetration-lite review
- **Quarterly**: Full penetration test by external firm
- **Annual**: Comprehensive security audit
