# Database Restore Runbook

Covers Prisma Postgres (free tier) point-in-time recovery.
Run this drill **quarterly** and after any data-incident.

## Backup verification (weekly)
Prisma Postgres free tier retains 7-day PITR.
Check retention status in the Prisma Data Platform console.

## Restore procedure (Prisma Postgres)

### 1. Identify restore point
From Prisma console, note the timestamp of last known-good state.

### 2. Create restore (Prisma Data Platform UI)
1. Open project → Database → Point-in-Time Recovery.
2. Select target timestamp.
3. Restore to a **new** database (never overwrite production directly).
4. Copy the new `DATABASE_URL`.

### 3. Run migrations on restored DB
```bash
DATABASE_URL=<restored-db-url> prisma migrate deploy
```

### 4. Smoke-test restored DB
```bash
DATABASE_URL=<restored-db-url> node -e "
const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient({ datasources: { db: { url: process.env.DATABASE_URL } } });
p.user.count().then(n => console.log('users:', n)).finally(() => p.\$disconnect());
"
```

### 5. Swap to restored DB
1. In Vercel, update `DATABASE_URL` env var to the restored DB URL.
2. Trigger a new deployment (or `vercel --prod` from CLI).
3. Monitor Sentry + `/api/health` for 15 min.

### 6. Decommission old DB
Only after confirming restored DB is healthy and no data gaps.

## Emergency: DB completely unavailable
1. Set `DATABASE_URL` to a read-replica if available.
2. Put site in maintenance mode (set `NEXT_PUBLIC_MAINTENANCE=1` env var + redeploy).
3. Restore as above.
4. Remove maintenance mode once restored.
