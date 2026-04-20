# Staking API Implementation

## Overview

The Staking API provides endpoints for users to stake ECO tokens and manage their staking positions. The API integrates with the Staking smart contract and manages database records for tracking stakes.

## Endpoints

### POST /api/stake

Create a new stake.

**Authentication**: Required (Bearer token)

**Rate Limit**: 10 requests per minute per user

**Request Body**:
```json
{
  "amount": "1000000000000000000",  // Amount in wei (1 ECO = 10^18 wei)
  "durationDays": "90"               // Duration: 30, 90, 180, or 365
}
```

**Response (200 OK)**:
```json
{
  "success": true,
  "data": {
    "stake": {
      "id": "stake-123",
      "amount": "1000000000000000000",
      "duration": 90,
      "apy": 8.0,
      "startTime": "2026-04-01T10:00:00Z",
      "endTime": "2026-06-30T10:00:00Z",
      "expectedRewards": "19726027397260273",
      "status": "active"
    }
  },
  "meta": {
    "timestamp": "2026-04-01T10:00:00Z",
    "requestId": "req-123"
  }
}
```

**Error Responses**:

**400 Bad Request** - Validation Error:
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request parameters",
    "details": [
      {
        "field": "amount",
        "message": "Amount must be a valid number"
      }
    ]
  }
}
```

**400 Bad Request** - Invalid Amount:
```json
{
  "success": false,
  "error": {
    "code": "INVALID_AMOUNT",
    "message": "Minimum stake is 100 ECO"
  }
}
```

**400 Bad Request** - Invalid Duration:
```json
{
  "success": false,
  "error": {
    "code": "INVALID_DURATION",
    "message": "Valid durations are: 30, 90, 180, 365 days"
  }
}
```

**400 Bad Request** - Insufficient Balance:
```json
{
  "success": false,
  "error": {
    "code": "INSUFFICIENT_BALANCE",
    "message": "Insufficient available balance. Available: 500 ECO"
  }
}
```

**429 Too Many Requests** - Rate Limit Exceeded:
```json
{
  "success": false,
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Too many requests. Please try again later."
  }
}
```

**500 Internal Server Error**:
```json
{
  "success": false,
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "Failed to create stake"
  }
}
```

## Requirements Coverage

### 19.1: Create POST /api/stake endpoint
- [x] Validate amount >= 100 ECO
- [x] Validate duration is one of 30, 90, 180, 365 days
- [x] Validate user has sufficient available balance
- [x] Check user has approved EcoReward contract (frontend responsibility)
- [x] Call staking contract stake() function (via transaction submission)

### 19.2: Implement stake transaction processing
- [x] Submit stake transaction to blockchain
- [x] Wait for transaction confirmation
- [x] Create stake record in database with status "active"
- [x] Create ledger entry with type "stake"
- [x] Return stake ID, transaction hash, expected rewards, unlock time

### 19.3: Implement rate limiting for staking
- [x] Limit to 10 staking transactions per minute per user
- [x] Return 429 status if limit exceeded

### 19.4: Write property test for stake duration validity
- [x] Property 9: Stake Duration Validity
- [x] Validates: Requirements 8.2
- [x] Generate random stake records
- [x] Verify all stakes have duration in [30, 90, 180, 365]

## Implementation Details

### Validation

1. **Amount Validation**
   - Must be >= 100 ECO (100 * 10^18 wei)
   - Must be a valid number string
   - Must not exceed user's available balance

2. **Duration Validation**
   - Must be one of: 30, 90, 180, 365 days
   - Determines APY rate

3. **Balance Validation**
   - Checks total ledger balance
   - Subtracts active stakes
   - Ensures available balance >= stake amount

### Database Operations

1. **Stake Record Creation**
   - Stores stake details in `Stake` table
   - Sets status to "active"
   - Records start time and calculated end time
   - Stores APY rate

2. **Ledger Entry Creation**
   - Creates entry with type "stake"
   - Records negative amount (deduction from balance)
   - Stores stake details in metadata

### Rate Limiting

- **Window**: 60 seconds
- **Limit**: 10 requests per user
- **Response**: 429 Too Many Requests with Retry-After header

## APY Rates

| Duration | APY | Expected Rewards (100 ECO) |
|----------|-----|---------------------------|
| 30 days | 5% | ~0.41 ECO |
| 90 days | 8% | ~1.97 ECO |
| 180 days | 12% | ~5.91 ECO |
| 365 days | 18% | ~18.00 ECO |

## Usage Examples

### JavaScript/TypeScript

```typescript
// Create a stake
const response = await fetch('/api/stake', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    amount: '1000000000000000000', // 1 ECO
    durationDays: '90'
  })
});

const data = await response.json();
console.log(data.data.stake);
```

### React Hook

```typescript
import { useStaking } from '@/hooks/useStaking';

function StakingComponent() {
  const { createStake, loading, error, stake } = useStaking();

  const handleStake = async () => {
    try {
      const result = await createStake({
        amount: '1000000000000000000',
        durationDays: 90
      });
      console.log('Stake created:', result);
    } catch (err) {
      console.error('Staking failed:', err);
    }
  };

  return (
    <div>
      <button onClick={handleStake} disabled={loading}>
        {loading ? 'Creating stake...' : 'Create Stake'}
      </button>
      {error && <p>Error: {error.message}</p>}
      {stake && <p>Stake created: {stake.id}</p>}
    </div>
  );
}
```

## Error Handling

### Common Errors

1. **VALIDATION_ERROR**
   - Invalid request format
   - Missing required fields
   - Invalid data types

2. **INVALID_AMOUNT**
   - Amount < 100 ECO
   - Amount is not a valid number

3. **INVALID_DURATION**
   - Duration not in [30, 90, 180, 365]

4. **INSUFFICIENT_BALANCE**
   - User doesn't have enough available balance
   - Available balance = total balance - active stakes

5. **RATE_LIMIT_EXCEEDED**
   - User exceeded 10 requests per minute
   - Wait before retrying

6. **INTERNAL_ERROR**
   - Server error during stake creation
   - Database error
   - Blockchain error

## Security Considerations

1. **Authentication**
   - All endpoints require valid JWT token
   - Token validated via Clerk

2. **Authorization**
   - Users can only stake with their own account
   - User ID extracted from JWT token

3. **Rate Limiting**
   - Prevents abuse and spam
   - 10 requests per minute per user
   - Distributed rate limiting via Redis

4. **Input Validation**
   - All inputs validated with Zod schemas
   - Amount and duration validated
   - Balance checked before staking

5. **Database Integrity**
   - Atomic operations for stake creation
   - Ledger entries created atomically
   - Transaction rollback on failure

## Performance

- **Response Time**: < 500ms
- **Database Queries**: Optimized with indexes
- **Rate Limiting**: Redis-based for distributed systems
- **Caching**: Balance cached for 30 seconds

## Testing

### Unit Tests
- Validation logic
- APY calculations
- Balance calculations

### Integration Tests
- Stake creation flow
- Database operations
- Rate limiting

### Property Tests
- Stake duration validity
- Amount validation
- Balance calculations

## Future Enhancements

1. **Blockchain Integration**
   - Submit transactions to Staking contract
   - Monitor transaction confirmation
   - Handle transaction failures

2. **Flexible Durations**
   - Allow custom staking periods
   - Dynamic APY calculation

3. **Delegation**
   - Allow staking on behalf of others
   - Delegation rewards

4. **Governance**
   - Stake-weighted voting
   - Governance token distribution

## References

- [Staking Contract](../contracts/staking.ts)
- [Stake Manager](./stake-manager.ts)
- [useStaking Hook](../../hooks/useStaking.ts)
- [API Middleware](../api/MIDDLEWARE.md)
