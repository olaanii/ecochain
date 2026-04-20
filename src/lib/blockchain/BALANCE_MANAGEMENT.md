# Token Balance Management

This document describes the token balance management system for the Eco Rewards Platform, including balance queries, caching, and reconciliation.

## Overview

The balance management system provides:
- **Balance Queries**: Fetch token balances from smart contracts
- **Balance Calculation**: Calculate available, staked, and pending balances
- **Caching**: Cache balance data with 30-second TTL for performance
- **Reconciliation**: Daily reconciliation of blockchain vs. database balances
- **UI Components**: Display balances in various formats

## Requirements Met

- **Requirement 7.1**: Balance fetching from EcoReward contract
- **Requirement 7.2**: Return total balance, available balance, staked balance, pending balance
- **Requirement 7.3**: Calculate available balance as total - staked - pending
- **Requirement 7.4**: Cache balance data for 30 seconds
- **Requirement 7.5**: Invalidate cache on mint, burn, stake, unstake operations
- **Requirement 7.7**: Daily reconciliation job comparing blockchain vs. ledger

## Architecture

### Core Components

#### BalanceManager Class
Located in `src/lib/blockchain/balance-manager.ts`

Handles all balance operations:
- `getBalance()`: Fetch balance for single address
- `getBalances()`: Fetch balances for multiple addresses
- `invalidateBalance()`: Invalidate cache for address
- `invalidateBalances()`: Invalidate cache for multiple addresses
- `reconcileBalance()`: Compare blockchain vs. ledger balance
- `runDailyReconciliation()`: Run reconciliation for all users
- `getBalanceStatistics()`: Get aggregate statistics

#### useBalance Hook
Located in `src/hooks/useBalance.ts`

React hook for component integration:
- `useBalance()`: Hook for single address balance
- `useBalances()`: Hook for multiple addresses
- Auto-refresh every 30 seconds
- Cache invalidation support

#### UI Components
Located in `src/components/blockchain/balance-display.tsx`

- `BalanceDisplay`: Full balance display with breakdown
- `BalanceCompact`: Compact balance display
- `BalanceCard`: Card-style balance display

### API Routes

#### GET /api/balance?address=0x...
Get balance for an address.

**Response:**
```json
{
  "success": true,
  "address": "0x...",
  "balance": {
    "total": "1000000000000000000",
    "available": "500000000000000000",
    "staked": "500000000000000000",
    "pending": "0"
  },
  "latency": 45,
  "cached": true
}
```

#### GET /api/balance/reconcile?address=0x...
Reconcile balance for an address.

**Response:**
```json
{
  "success": true,
  "reconciliation": {
    "address": "0x...",
    "blockchainBalance": "1000000000000000000",
    "ledgerBalance": "1000000000000000000",
    "discrepancy": "0",
    "discrepancyPercentage": 0,
    "status": "matched",
    "timestamp": 1234567890
  }
}
```

#### POST /api/balance/reconcile
Run daily reconciliation for all users.

**Response:**
```json
{
  "success": true,
  "reconciliations": [...],
  "summary": {
    "totalReconciled": 100,
    "matched": 98,
    "mismatches": 2,
    "alerts": 0
  }
}
```

#### GET /api/balance/statistics
Get aggregate balance statistics.

**Response:**
```json
{
  "success": true,
  "statistics": {
    "totalUsers": 100,
    "totalBalance": "100000000000000000000",
    "totalStaked": "50000000000000000000",
    "averageBalance": "1000000000000000000",
    "timestamp": 1234567890
  }
}
```

## Usage Examples

### In React Components

```typescript
'use client';

import { useBalance } from '@/hooks/useBalance';
import { BalanceCard } from '@/components/blockchain/balance-display';

export function BalanceSection() {
  const { balance, isLoading, error, refresh } = useBalance();

  return (
    <div>
      <BalanceCard />
      
      <button onClick={refresh} disabled={isLoading}>
        {isLoading ? 'Refreshing...' : 'Refresh Balance'}
      </button>
    </div>
  );
}
```

### In API Routes

```typescript
import { getPublicClient } from '@/lib/blockchain/viem-clients';
import { createBalanceManager } from '@/lib/blockchain/balance-manager';

export async function GET(request: Request) {
  const publicClient = getPublicClient();
  const manager = createBalanceManager(publicClient);

  const balance = await manager.getBalance('0x...');

  return Response.json({
    total: balance.total.toString(),
    available: balance.available.toString(),
    staked: balance.staked.toString(),
    pending: balance.pending.toString(),
  });
}
```

## Balance Calculation

### Total Balance
Fetched directly from EcoReward contract using `balanceOf()`.

### Staked Balance
Sum of all active stakes from database:
```
staked = SUM(stake.amount WHERE status = 'active')
```

### Pending Balance
Sum of recent unconfirmed mint transactions (within 5 minutes):
```
pending = SUM(ledger.amount WHERE type = 'mint' AND createdAt > now - 5min)
```

### Available Balance
```
available = total - staked - pending
```

## Caching Strategy

### Cache Configuration
- **Key**: `balance:{address}`
- **TTL**: 30 seconds
- **Storage**: Redis

### Cache Invalidation
Cache is invalidated when:
- User mints tokens
- User burns tokens
- User stakes tokens
- User unstakes tokens
- User redeems rewards
- Manual invalidation via API

### Cache Hit Rate
Expected cache hit rate: ~80% for active users

## Reconciliation

### Daily Reconciliation Job
Runs once per day (configurable):
1. Fetch all users with addresses
2. For each user:
   - Get blockchain balance
   - Calculate ledger balance from database
   - Compare and log discrepancies
   - Alert if mismatch > 5%

### Reconciliation Status
- **matched**: Blockchain and ledger balances match
- **mismatch**: Discrepancy detected (< 5%)
- **alert**: Significant discrepancy (> 5%)

### Discrepancy Causes
- Pending transactions not yet confirmed
- Failed transactions not properly handled
- Database corruption or sync issues
- Contract bugs or exploits

## Performance

### Query Performance
- **Cached query**: ~45ms (Redis lookup)
- **Uncached query**: ~500ms (contract read + database queries)
- **Target**: < 50ms for cached queries

### Reconciliation Performance
- **Per user**: ~100ms
- **All users (100)**: ~10 seconds
- **Recommended frequency**: Daily (off-peak hours)

## Security Considerations

- **Read-Only**: Balance queries don't modify state
- **No Private Keys**: Never stored or transmitted
- **Rate Limiting**: 100 requests per minute per IP
- **Input Validation**: All addresses validated with regex
- **Error Messages**: No sensitive data exposed

## Monitoring and Alerts

### Metrics to Monitor
- Cache hit rate
- Query latency
- Reconciliation discrepancies
- Failed balance queries

### Alerts
- Reconciliation mismatch > 5%
- Query latency > 1 second
- Cache miss rate > 20%
- Database connection errors

## Testing

### Unit Tests
```bash
npm run test:unit -- balance-manager.test.ts
```

### Integration Tests
```bash
npm run test:integration -- balance.test.ts
```

### Manual Testing

1. **Get Balance**:
   ```bash
   curl http://localhost:3000/api/balance?address=0x...
   ```

2. **Reconcile Balance**:
   ```bash
   curl http://localhost:3000/api/balance/reconcile?address=0x...
   ```

3. **Run Daily Reconciliation**:
   ```bash
   curl -X POST http://localhost:3000/api/balance/reconcile
   ```

4. **Get Statistics**:
   ```bash
   curl http://localhost:3000/api/balance/statistics
   ```

## Future Enhancements

- [ ] Real-time balance updates via WebSocket
- [ ] Balance history and analytics
- [ ] Multi-token balance support
- [ ] Balance alerts and notifications
- [ ] Advanced reconciliation with transaction tracing
- [ ] Balance prediction based on pending transactions
- [ ] Batch balance queries with pagination
