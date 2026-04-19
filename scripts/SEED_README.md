# Database Seeding Guide

This directory contains seed scripts for populating the EcoChain database with initial data.

## Available Seed Scripts

### 1. `seed-tasks.ts` - Eco Tasks Seeding
Seeds the database with eco-friendly tasks across four categories:

**Categories:**
- **Transit** (Transport): Low-impact commute verification
- **Recycling**: Curbside recycling tracking
- **Energy**: Energy savings documentation
- **Community**: Community volunteer activities

**Tasks Included:**
- Low-impact commute (40 base reward)
- Curbside recycling (55 base reward)
- Energy savings (65 base reward)
- Community garden shift (70 base reward)

**Run:**
```bash
pnpm run db:seed:tasks
```

### 2. `seed-rewards.ts` - Reward Offerings Seeding
Seeds the database with merchant partner reward offerings that users can redeem.

**Rewards Included:**
- Green Labs credits (120 cost)
- Monthly transit pass (90 cost)
- Eco-market voucher (75 cost)

**Run:**
```bash
pnpm run db:seed:rewards
```

### 3. `seed.ts` - Full Database Seeding
Complete seed script that includes:
- All eco tasks
- All reward offerings
- DAO proposals
- Sample users with verifications
- Ledger entries
- Bridge requests

**Run:**
```bash
pnpm run db:seed
```

## Prerequisites

1. **Environment Setup**
   - Copy `.env.example` to `.env.local`
   - Set `DATABASE_URL` to your Postgres instance
   - Ensure database is accessible

2. **Dependencies**
   - Node.js 18+
   - pnpm package manager
   - Prisma client installed

3. **Database**
   - Run migrations: `pnpm run db:push`
   - Ensure all tables exist

## Usage

### Seed Individual Components
```bash
# Seed only tasks
pnpm run db:seed:tasks

# Seed only rewards
pnpm run db:seed:rewards
```

### Seed Everything
```bash
# Full seed with sample users
pnpm run db:seed
```

### Regenerate Prisma Client
```bash
pnpm run prisma:generate
```

## Data Structure

### Task Schema
```typescript
{
  id: string;           // Unique identifier
  slug: string;         // URL-friendly identifier
  name: string;         // Display name
  description: string;  // Task description
  verificationHint: string; // How to verify
  category: string;     // transit, recycling, energy, community
  baseReward: number;   // Base reward amount
  bonusFactor: number;  // Bonus multiplier
  verificationMethod: string; // photo, api, iot, etc.
  active: boolean;      // Is task active
}
```

### Reward Offering Schema
```typescript
{
  id: string;           // Unique identifier
  title: string;        // Reward name
  description: string;  // Reward description
  cost: number;         // Cost in tokens
  partner: string;      // Partner name
  category: string;     // Reward category
  available: boolean;   // Is reward available
}
```

## Troubleshooting

### "DATABASE_URL is required"
- Ensure `.env.local` or `.env` file exists
- Set `DATABASE_URL` environment variable
- Example: `postgresql://user:password@localhost:5432/ecochain`

### "Property does not exist on type 'PrismaClient'"
- Run: `pnpm run prisma:generate`
- This regenerates the Prisma client with latest schema

### Foreign Key Constraint Errors
- Ensure migrations are applied: `pnpm run db:push`
- Check deletion order in seed scripts respects foreign keys

### Connection Refused
- Verify database is running
- Check DATABASE_URL is correct
- Ensure network access to database

## Development Workflow

1. **Update Schema**
   ```bash
   # Edit prisma/schema.prisma
   pnpm run db:push
   pnpm run prisma:generate
   ```

2. **Add New Tasks/Rewards**
   - Edit `src/lib/data/eco.ts`
   - Run appropriate seed script

3. **Test Locally**
   ```bash
   pnpm run db:seed:tasks
   pnpm run db:seed:rewards
   pnpm run prisma:studio  # View data in UI
   ```

## Notes

- Seed scripts use `upsert` operations to avoid duplicates
- Existing records are updated if they already exist
- All scripts properly disconnect from database after completion
- Environment variables are loaded from `.env.local` and `.env`
