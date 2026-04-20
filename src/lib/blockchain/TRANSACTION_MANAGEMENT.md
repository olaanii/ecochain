# Transaction Management System

This document describes the transaction management system for the Eco Rewards Platform, including transaction submission, monitoring, and retry logic.

## Overview

The transaction management system provides:
- **Transaction Submission**: Sign and submit transactions with gas estimation
- **Transaction Monitoring**: Poll blockchain for transaction status and confirmations
- **Retry Logic**: Automatically retry failed transactions with exponential backoff
- **Error Handling**: Parse revert reasons and provide user-friendly error messages
- **UI Components**: Display transaction status, pending indicators, and notifications

## Requirements Met

- **Requirement 17.1**: Transaction submission handler with wallet client signing
- **Requirement 17.2**: Transaction status polling mechanism
- **Requirement 17.3**: Monitor transaction confirmations
- **Requirement 17.4**: Handle transaction failures with revert reason parsing
- **Requirement 17.5**: Transaction UI components (pending, success, failure)
- **Requirement 17.6**: Gas estimation before submission
- **Requirement 17.7**: Dynamic gas pricing based on network conditions
- **Requirement 17.8**: Exponential backoff for failed transactions
- **Requirement 17.9**: Retry with higher gas limit, max 3 attempts

## Architecture

### Core Components

#### TransactionManager Class
Located in `src/lib/blockchain/transaction-manager.ts`

Handles all transaction operations:
- `estimateGas()`: Estimate gas with dynamic pricing
- `submitTransaction()`: Submit transaction with signing
- `monitorTransaction()`: Poll for transaction status
- `retryTransaction()`: Retry with exponential backoff
- `getTransactionStatus()`: Get cached or blockchain status

#### useTransactionManager Hook
Located in `src/hooks/useTransactionManager.ts`

React hook for component integration:
- `submitTransaction()`: Submit transaction from component
- `monitorTransaction()`: Monitor transaction status
- `retryTransaction()`: Retry failed transaction
- `getStatus()`: Get transaction status
- `reset()`: Reset transaction state

#### UI Components
Located in `src/components/blockchain/transaction-status.tsx`

- `TransactionStatusIndicator`: Display transaction status
- `TransactionPendingIndicator`: Show pending animation
- `TransactionSuccess`: Success notification
- `TransactionError`: Error notification with retry option

### API Routes

#### POST /api/transactions/submit
Submit a transaction and get gas estimate.

**Request:**
```json
{
  "to": "0x...",
  "data": "0x...",
  "value": "1000000000000000000",
  "type": "stake",
  "metadata": { "stakeId": "123" }
}
```

**Response:**
```json
{
  "success": true,
  "gasEstimate": {
    "gasLimit": "100000",
    "gasPrice": "20000000000",
    "estimatedCost": "2000000000000000"
  }
}
```

#### GET /api/transactions/status?hash=0x...
Get transaction status.

**Response:**
```json
{
  "success": true,
  "hash": "0x...",
  "status": "confirmed",
  "receipt": {
    "blockNumber": 12345,
    "gasUsed": "50000",
    "transactionHash": "0x...",
    "status": "success"
  }
}
```

#### POST /api/transactions/retry
Retry a failed transaction.

**Request:**
```json
{
  "to": "0x...",
  "data": "0x...",
  "type": "stake",
  "previousHash": "0x...",
  "retryCount": 1
}
```

**Response:**
```json
{
  "success": true,
  "hash": "0x...",
  "retryCount": 2,
  "gasEstimate": {
    "gasLimit": "150000",
    "gasPrice": "30000000000",
    "estimatedCost": "4500000000000000"
  }
}
```

## Usage Examples

### In React Components

```typescript
'use client';

import { useTransactionManager } from '@/hooks/useTransactionManager';
import { TransactionStatusIndicator } from '@/components/blockchain/transaction-status';
import { EcoRewardContract } from '@/lib/blockchain/contracts';

export function StakeComponent() {
  const { submitTransaction, monitorTransaction, status, hash, error, isLoading } =
    useTransactionManager();

  const handleStake = async () => {
    try {
      // Prepare transaction data
      const data = encodeFunctionData({
        abi: EcoRewardContract.abi,
        functionName: 'approve',
        args: [stakingContractAddress, amount],
      });

      // Submit transaction
      const txHash = await submitTransaction({
        to: EcoRewardContract.address,
        data,
        type: 'stake',
        metadata: { amount: amount.toString() },
      });

      // Monitor transaction
      await monitorTransaction(txHash);
    } catch (error) {
      console.error('Staking failed:', error);
    }
  };

  return (
    <div>
      <button onClick={handleStake} disabled={isLoading}>
        {isLoading ? 'Processing...' : 'Stake Tokens'}
      </button>
      <TransactionStatusIndicator status={status} hash={hash} error={error} />
    </div>
  );
}
```

### In API Routes

```typescript
import { getPublicClient, getWalletClient } from '@/lib/blockchain/viem-clients';
import { createTransactionManager } from '@/lib/blockchain/transaction-manager';

export async function POST(request: Request) {
  const { to, data, value } = await request.json();

  const publicClient = getPublicClient();
  const walletClient = getWalletClient();
  const txManager = createTransactionManager(publicClient, walletClient);

  // Estimate gas
  const gasEstimate = await txManager.estimateGas({
    to,
    data,
    value,
    from: userAddress,
  });

  // Submit transaction
  const { hash } = await txManager.submitTransaction({
    to,
    data,
    value,
    from: userAddress,
    userId: userId,
    type: 'verify',
  });

  return Response.json({ hash, gasEstimate });
}
```

## Transaction Flow

### Successful Transaction

```
1. User initiates action (stake, redeem, verify)
2. Component calls submitTransaction()
3. TransactionManager estimates gas
4. Transaction signed and submitted
5. Hash returned immediately
6. Component calls monitorTransaction()
7. TransactionManager polls blockchain
8. Transaction confirmed
9. UI shows success notification
10. Database updated with transaction hash
```

### Failed Transaction with Retry

```
1. User initiates action
2. Transaction submitted
3. Transaction fails (insufficient gas, network error, etc.)
4. UI shows error notification with retry option
5. User clicks retry
6. Component calls retryTransaction()
7. TransactionManager increases gas limit by 50%
8. New transaction submitted
9. Retry count incremented (max 3)
10. If successful, UI shows success
11. If failed again, show error and disable retry
```

## Gas Estimation

The system uses dynamic gas pricing:

1. **Base Gas Estimation**: viem estimates gas for the transaction
2. **Safety Buffer**: Add 20% to estimated gas limit
3. **Dynamic Pricing**: Get current gas price from network
4. **Retry Multiplier**: Increase gas by 50% per retry attempt

Example:
```
Initial estimate: 100,000 gas
With 20% buffer: 120,000 gas
Gas price: 20 Gwei
Estimated cost: 2.4 ETH

Retry 1: 180,000 gas (50% increase)
Retry 2: 270,000 gas (50% increase)
Retry 3: 405,000 gas (50% increase)
```

## Error Handling

### Common Errors

| Error | Cause | Solution |
|-------|-------|----------|
| Insufficient balance | User doesn't have enough tokens | Show balance and required amount |
| Insufficient gas | Gas limit too low | Retry with higher gas limit |
| User rejected | User cancelled transaction | Allow user to retry |
| Network error | RPC endpoint unavailable | Retry with exponential backoff |
| Revert reason | Contract logic failed | Parse and display revert reason |

### Revert Reason Parsing

The system attempts to parse revert reasons from failed transactions:

```typescript
// Standard revert: Error(string)
// Decoded from transaction input data
// Example: "Insufficient balance"

// Custom errors
// Parsed from contract ABI
// Example: "InsufficientBalance()"
```

## Caching Strategy

Transactions are cached in Redis for quick lookup:

- **Key**: `tx:{hash}`
- **TTL**: 1 hour
- **Data**: Transaction status, user ID, type

Retry attempts are also cached:

- **Key**: `tx:retry:{originalHash}`
- **TTL**: 24 hours
- **Data**: List of retry hashes with timestamps

## Monitoring and Logging

All transactions are logged with:
- Transaction hash
- User ID
- Transaction type
- Gas estimate
- Submission timestamp
- Confirmation timestamp
- Retry attempts
- Error messages

Logs are stored in:
- Console (development)
- Sentry (production)
- Database (audit trail)

## Testing

### Unit Tests

```bash
npm run test:unit -- transaction-manager.test.ts
```

### Integration Tests

```bash
npm run test:integration -- transactions.test.ts
```

### Manual Testing

1. **Submit Transaction**:
   ```bash
   curl -X POST http://localhost:3000/api/transactions/submit \
     -H "Content-Type: application/json" \
     -d '{"to":"0x...","data":"0x...","type":"stake"}'
   ```

2. **Check Status**:
   ```bash
   curl http://localhost:3000/api/transactions/status?hash=0x...
   ```

3. **Retry Transaction**:
   ```bash
   curl -X POST http://localhost:3000/api/transactions/retry \
     -H "Content-Type: application/json" \
     -d '{"to":"0x...","data":"0x...","type":"stake","retryCount":1}'
   ```

## Performance Considerations

- **Gas Estimation**: ~500ms per transaction
- **Transaction Submission**: ~1s per transaction
- **Polling Interval**: 2 seconds (configurable)
- **Max Poll Attempts**: 150 (5 minutes total)
- **Cache Hit Rate**: ~80% for repeated queries

## Security Considerations

- **Private Keys**: Never stored or logged
- **Sensitive Data**: Redacted from logs
- **Rate Limiting**: 10 transactions per minute per user
- **Input Validation**: All inputs validated with Zod
- **Error Messages**: User-friendly, no sensitive details

## Future Enhancements

- [ ] WebSocket support for real-time updates
- [ ] Transaction batching for multiple operations
- [ ] MEV protection with private RPC
- [ ] Transaction simulation before submission
- [ ] Custom gas price strategies
- [ ] Transaction history and analytics
- [ ] Multi-signature transaction support
