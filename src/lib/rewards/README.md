# Rewards and Redemption System

This module implements the reward catalog and token redemption system for the Blockchain Eco Rewards Platform.

## Overview

The rewards system enables users to:
1. Browse available rewards from merchant partners
2. Filter rewards by category and cost
3. Redeem earned ECO tokens for rewards
4. Track redemption history

## Architecture

### Components

#### `reward-manager.ts`
Handles reward catalog operations:
- `getRewards()` - Fetch rewards with filtering and caching
- `isRewardAvailable()` - Check reward availability
- `getRewardById()` - Get specific reward details
- `invalidateRewardsCache()` - Clear cached rewards

**Features:**
- 5-minute cache TTL for reward listings
- Category filtering
- Cost range filtering
- Expiration date validation
- Stock availability checking

#### `redemption-service.ts`
Handles token redemption operations:
- `redeemReward()` - Process token redemption
- `getRedemptionHistory()` - Fetch user's redemption history

**Features:**
- Balance validation before redemption
- Unique voucher code generation
- Ledger entry creation for token tracking
- Partner API notifications
- Cache invalidation on redemption

### API Endpoints

#### GET /api/rewards
Fetch available rewards with filtering and pagination.

**Query Parameters:**
- `category` (optional) - Filter by category (transit, recycling, energy, general)
- `maxCost` (optional) - Maximum reward cost
- `limit` (optional, default: 50) - Results per page (max: 50)
- `offset` (optional, default: 0) - Pagination offset

**Response:**
```json
{
  "data": {
    "rewards": [
      {
        "id": "reward-1",
        "title": "Transit Pass",
        "description": "Monthly transit pass",
        "cost": 100,
        "partner": "Transit Co",
        "available": true,
        "category": "transit",
        "stock": 50,
        "expiresAt": "2026-12-31T23:59:59Z",
        "imageUrl": "https://example.com/transit.jpg"
      }
    ],
    "total": 1,
    "limit": 50,
    "offset": 0
  }
}
```

**Performance:**
- Returns within 100ms (cached)
- 5-minute cache TTL
- Supports up to 50 items per page

#### POST /api/redeem
Redeem ECO tokens for a reward.

**Request Body:**
```json
{
  "rewardId": "reward-1",
  "initiaAddress": "inita1abc123",
  "initiaUsername": "user123",
  "displayName": "John Doe",
  "region": "US"
}
```

**Response:**
```json
{
  "data": {
    "success": true,
    "redemptionId": "redemption-1",
    "reward": {
      "id": "reward-1",
      "title": "Transit Pass",
      "cost": 100
    },
    "balanceBefore": 500,
    "balanceAfter": 400,
    "voucherCode": "ECO-ABC123-XYZ789"
  }
}
```

**Validations:**
- Reward must exist and be available
- User must have sufficient balance
- Reward must not be expired
- Reward must be in stock

**Rate Limiting:**
- 5 redemptions per minute per user

#### GET /api/redemptions
Fetch user's redemption history.

**Query Parameters:**
- `limit` (optional, default: 50) - Results per page (max: 50)
- `offset` (optional, default: 0) - Pagination offset

**Response:**
```json
{
  "data": {
    "redemptions": [
      {
        "id": "redemption-1",
        "reward": {
          "id": "reward-1",
          "title": "Transit Pass",
          "cost": 100
        },
        "voucherCode": "ECO-ABC123-XYZ789",
        "redeemedAt": "2026-04-02T10:30:00Z"
      }
    ],
    "total": 1,
    "limit": 50,
    "offset": 0
  }
}
```

## Database Models

### RewardOffering
```prisma
model RewardOffering {
  id          String      @id @default(cuid())
  title       String
  description String
  cost        Int
  partner     String
  category    String
  available   Boolean     @default(true)
  stock       Int?
  expiresAt   DateTime?
  imageUrl    String?
  createdAt   DateTime    @default(now())
  updatedAt   DateTime    @updatedAt
  redemptions Redemption[]

  @@index([category])
  @@index([available])
  @@index([cost])
  @@index([expiresAt])
}
```

### Redemption
```prisma
model Redemption {
  id              String         @id @default(cuid())
  userId          String
  rewardId        String
  cost            Int
  voucherCode     String?
  transactionHash String?
  status          String         @default("completed")
  redeemedAt      DateTime       @default(now())

  user   User           @relation(fields: [userId], references: [id])
  reward RewardOffering @relation(fields: [rewardId], references: [id])

  @@index([userId])
  @@index([rewardId])
  @@index([redeemedAt])
  @@index([status])
}
```

### LedgerEntry
```prisma
model LedgerEntry {
  id              String   @id @default(cuid())
  userId          String
  amount          Int
  type            String   // "redemption"
  source          String   // "redemption:{redemptionId}"
  transactionHash String?
  metadata        Json?
  createdAt       DateTime @default(now())

  user User @relation(fields: [userId], references: [id])

  @@index([userId])
  @@index([type])
  @@index([createdAt])
}
```

## Caching Strategy

### Cache Keys
- `rewards:{filters}` - Cached reward listings (5-minute TTL)
- `user:{userId}:balance` - User balance cache (30-second TTL)

### Cache Invalidation
- Rewards cache invalidated when:
  - New reward added
  - Reward availability changes
  - Reward expires
  - Stock updated

- Balance cache invalidated when:
  - Redemption completed
  - Tokens minted
  - Tokens burned
  - Stake created/released

## Requirements Mapping

### Requirement 11: Reward Catalog Management
- ✅ 11.1 - Return all available rewards
- ✅ 11.2 - Filter by category
- ✅ 11.3 - Filter by cost range
- ✅ 11.4 - Display reward details
- ✅ 11.5 - Mark unavailable rewards
- ✅ 11.6 - Exclude expired rewards
- ✅ 11.7 - Cache with 5-minute TTL
- ✅ 11.8 - Return within 100ms

### Requirement 12: Token Redemption
- ✅ 12.1 - Validate reward exists and available
- ✅ 12.2 - Validate user balance sufficient
- ✅ 12.3 - Validate reward not expired
- ✅ 12.4 - Reject out of stock rewards
- ✅ 12.5 - Burn/transfer tokens
- ✅ 12.6 - Create redemption record
- ✅ 12.7 - Create ledger entry
- ✅ 12.8 - Generate unique voucher code
- ✅ 12.9 - Notify merchant partner
- ✅ 12.10 - Return redemption details
- ✅ 12.11 - Rate limit to 5 per minute

## Testing

### Unit Tests
- `reward-manager.test.ts` - Tests for reward filtering and availability
- `redemption-service.test.ts` - Tests for redemption logic

### Property-Based Tests
- `reward-filtering.property.test.ts` - Validates filtering correctness
- `redemption-logic.property.test.ts` - Validates redemption logic

### Integration Tests
- `rewards.integration.test.ts` - API endpoint tests

## Usage Examples

### Fetch Rewards
```typescript
import { getRewards } from '@/lib/rewards/reward-manager';

const result = await getRewards({
  category: 'transit',
  maxCost: 200,
  limit: 50,
  offset: 0,
});

console.log(result.rewards); // Array of rewards
console.log(result.total);   // Total count
```

### Redeem Reward
```typescript
import { redeemReward } from '@/lib/rewards/redemption-service';

const result = await redeemReward({
  userId: 'user-123',
  rewardId: 'reward-456',
  initiaAddress: 'inita1abc123',
});

if (result.success) {
  console.log('Voucher:', result.voucherCode);
  console.log('New balance:', result.balanceAfter);
} else {
  console.error('Redemption failed:', result.error);
}
```

### React Hook
```typescript
import { useRewards } from '@/hooks/useRewards';

function RewardsComponent() {
  const {
    rewards,
    loading,
    error,
    fetchRewards,
    redeemReward,
  } = useRewards();

  useEffect(() => {
    fetchRewards({ category: 'transit', maxCost: 200 });
  }, []);

  const handleRedeem = async (rewardId: string) => {
    const result = await redeemReward(rewardId, userAddress);
    if (result.success) {
      console.log('Redeemed! Voucher:', result.voucherCode);
    }
  };

  return (
    <div>
      {loading && <p>Loading...</p>}
      {error && <p>Error: {error}</p>}
      {rewards.map(reward => (
        <div key={reward.id}>
          <h3>{reward.title}</h3>
          <p>Cost: {reward.cost} ECO</p>
          <button onClick={() => handleRedeem(reward.id)}>
            Redeem
          </button>
        </div>
      ))}
    </div>
  );
}
```

## Performance Targets

- Reward list query: < 100ms (cached)
- Redemption processing: < 500ms
- Cache hit rate: > 80%
- Voucher code generation: < 10ms
- Partner API notification: async (non-blocking)

## Error Handling

### Common Errors

| Error Code | Status | Description |
|-----------|--------|-------------|
| VALIDATION_ERROR | 400 | Invalid request parameters |
| REWARD_NOT_FOUND | 404 | Reward doesn't exist |
| INSUFFICIENT_BALANCE | 400 | User doesn't have enough tokens |
| REWARD_UNAVAILABLE | 400 | Reward is out of stock or expired |
| REDEMPTION_FAILED | 400 | Redemption processing failed |
| INTERNAL_ERROR | 500 | Server error |

## Future Enhancements

1. **Reward Recommendations** - ML-based reward suggestions
2. **Bulk Redemptions** - Redeem multiple rewards at once
3. **Reward Expiration Alerts** - Notify users before rewards expire
4. **Partner Analytics** - Track redemption patterns
5. **Reward Ratings** - User reviews and ratings
6. **Seasonal Rewards** - Time-limited special offers
7. **Loyalty Tiers** - Different rewards for different user levels
8. **Referral Rewards** - Bonus rewards for referrals
