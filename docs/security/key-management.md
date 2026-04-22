# Key Management Runbook

Secure key lifecycle management for EcoChain production systems.

## Overview

This document defines procedures for generating, rotating, and retiring cryptographic keys and API secrets.

## Key Inventory

| Key Type | Location | Rotation Frequency | Owner |
|----------|----------|-------------------|-------|
| Clerk Secret Key | Vercel env | Annual | Security Team |
| Clerk Webhook Secret | Vercel env | Quarterly | Security Team |
| Database URL | Vercel env | On breach | DBA + Security |
| Redis Token | Vercel env | Annual | DevOps |
| VAPID Keys (Push) | Vercel env | Annual | DevOps |
| Oracle Signer Key | Fly.io secrets | Quarterly | Security |
| NextAuth Secret | Vercel env | Annual | DevOps |
| JWT Signing Key | Vercel env | Annual | Security |

## Rotation Procedures

### 1. Clerk Secret Key Rotation

```bash
# 1. Generate new key in Clerk Dashboard
# 2. Add to Vercel with preview deployment
echo "NEW_KEY" | vercel env add CLERK_SECRET_KEY preview

# 3. Deploy to preview, verify auth works
vercel --pre

# 4. Promote to production
echo "NEW_KEY" | vercel env add CLERK_SECRET_KEY production
vercel --prod

# 5. Revoke old key in Clerk Dashboard (wait 24h)
```

### 2. Database Credentials Rotation

```bash
# 1. Create new database user
psql $DATABASE_URL -c "CREATE USER ecochain_new WITH PASSWORD '$(openssl rand -base64 32)';"

# 2. Grant permissions
psql $DATABASE_URL -c "GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO ecochain_new;"

# 3. Update connection poolers (PgBouncer/Supabase)

# 4. Update Vercel env
vercel env add DATABASE_URL production < new_connection_string.txt

# 5. Deploy and verify
vercel --prod

# 6. Revoke old user (after 48h monitoring)
psql $DATABASE_URL -c "REVOKE ALL PRIVILEGES ON ALL TABLES IN SCHEMA public FROM ecochain_old;"
```

### 3. VAPID Keys (Web Push) Rotation

```bash
# Generate new VAPID key pair
npx web-push generate-vapid-keys

# Update Vercel envs
echo "NEW_PUBLIC_KEY" | vercel env add NEXT_PUBLIC_VAPID_PUBLIC_KEY production
echo "NEW_PRIVATE_KEY" | vercel env add VAPID_PRIVATE_KEY production

# Deploy
vercel --prod

# Clients will receive new keys on next session
# No immediate action needed - old keys valid for 30 days
```

### 4. Oracle Signer Key Rotation

```bash
# Oracle keys are in Fly.io secrets for VM-based signer

# 1. Generate new key
openssl ecparam -genkey -name secp256k1 -out new_oracle.key

# 2. Update Fly.io secret
fly secrets set ORACLE_PRIVATE_KEY="$(cat new_oracle.key)" --app ecochain-oracle

# 3. Rolling restart (zero downtime)
fly deploy --strategy rolling --app ecochain-oracle

# 4. Update contract with new signer address
# (requires multi-sig governance action)
```

## Emergency Key Revocation

If a key is compromised:

1. **Immediate (0-15 min)**
   - Revoke key at provider (Clerk/Supabase/etc)
   - Enable maintenance mode if needed
   - Alert security team

2. **Short-term (15-60 min)**
   - Generate new key
   - Update production env
   - Deploy hotfix

3. **Recovery (1-4 hours)**
   - Verify all services operational
   - Review audit logs for abuse
   - Post-incident review

## Key Storage Requirements

- **Production**: Vercel env vars (encrypted) + Fly.io secrets
- **Development**: `.env.local` (gitignored, never committed)
- **CI/CD**: GitHub Secrets (encrypted, audit-logged)
- **Local dev**: Use `.env.local.example` as template only

## Audit Trail

All key rotations must be logged:

```
Date: 2026-04-22
Key: CLERK_SECRET_KEY
Action: Rotation
Ticket: SEC-123
Owner: security@ecochain.io
Verification: Auth tested on preview env xyz.vercel.app
```

Store in: `docs/security/key-rotations/YYYY-MM-TYPE.md`
