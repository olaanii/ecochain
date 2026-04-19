# Real-Time Updates System

This module provides WebSocket-based real-time updates for balance, verification status, stake rewards, and transaction tracking.

## Architecture

### WebSocket Manager (`websocket-manager.ts`)

Core WebSocket connection management with automatic reconnection, heartbeat, and message queuing.

**Features:**
- Automatic reconnection with exponential backoff (up to 5 attempts)
- Heartbeat mechanism (30-second interval)
- Message queue for offline scenarios
- Event-based architecture using Node.js EventEmitter
- Singleton pattern for global access

**Usage:**

```typescript
import { getWebSocketManager } from '@/lib/realtime';

const wsManager = getWebSocketManager();

// Connect
await wsManager.connect();

// Subscribe to channels
wsManager.subscribe('balance', userId);
wsManager.subscribe('verification', userId);
wsManager.subscribe('stake', userId);
wsManager.subscribe('transaction', userId);

// Listen for updates
wsManager.on('balance', (balance: BalanceUpdate) => {
  console.log('Balance updated:', balance);
});

wsManager.on('transaction', (tx: TransactionUpdate) => {
  console.log('Transaction status:', tx);
});

// Disconnect
wsManager.disconnect();
```

### Message Types

#### BalanceUpdate
```typescript
{
  total: string;        // Total balance in ECO
  available: string;    // Available balance (not staked/pending)
  staked: string;       // Staked balance
  pending: string;      // Pending balance (rewards, etc.)
}
```

#### VerificationUpdate
```typescript
{
  verificationId: string;
  status: 'pending' | 'approved' | 'rejected';
  oracleConfidence?: number;  // 0.0-1.0
  transactionHash?: string;
}
```

#### StakeUpdate
```typescript
{
  stakeId: string;
  accruedRewards: string;
  status: 'active' | 'withdrawn' | 'penalized';
}
```

#### TransactionUpdate
```typescript
{
  transactionHash: string;
  status: 'pending' | 'confirmed' | 'failed';
  confirmations?: number;
  blockNumber?: number;
  error?: string;
}
```

## Hooks

### useRealtimeUpdates

Main hook for subscribing to real-time updates.

**Usage:**

```typescript
import { useRealtimeUpdates } from '@/hooks/useRealtimeUpdates';

function MyComponent() {
  const { isConnected } = useRealtimeUpdates({
    onBalanceUpdate: (balance) => {
      console.log('Balance:', balance);
    },
    onVerificationUpdate: (verification) => {
      console.log('Verification:', verification);
    },
    onStakeUpdate: (stake) => {
      console.log('Stake:', stake);
    },
    onTransactionUpdate: (transaction) => {
      console.log('Transaction:', transaction);
    },
    onConnected: () => {
      console.log('Connected to real-time updates');
    },
    onDisconnected: () => {
      console.log('Disconnected from real-time updates');
    },
    onError: (error) => {
      console.error('Real-time error:', error);
    },
  });

  return (
    <div>
      Status: {isConnected ? 'Connected' : 'Disconnected'}
    </div>
  );
}
```

### useTransactionTracking

Specialized hook for tracking transaction status with retry logic.

**Usage:**

```typescript
import { useTransactionTracking } from '@/hooks/useTransactionTracking';

function TransactionComponent() {
  const {
    transactions,
    isConnected,
    trackTransaction,
    retryTransaction,
    removeTransaction,
    getTransaction,
    getPendingTransactions,
    getRecentTransactions,
  } = useTransactionTracking({
    onConfirmed: (tx) => {
      console.log('Transaction confirmed:', tx);
    },
    onFailed: (tx) => {
      console.log('Transaction failed:', tx);
    },
    onRetry: (tx) => {
      console.log('Retrying transaction:', tx);
    },
  });

  const handleSubmitTransaction = async () => {
    const hash = await submitTransaction();
    trackTransaction(hash);
  };

  const handleRetry = (hash: string) => {
    retryTransaction(hash);
  };

  return (
    <div>
      {transactions.map((tx) => (
        <div key={tx.id}>
          {tx.transactionHash}: {tx.status}
          {tx.status === 'failed' && (
            <button onClick={() => handleRetry(tx.transactionHash)}>
              Retry
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
```

## Components

### TransactionTracker

Displays pending/confirmed/failed transactions in a toast-like notification.

**Usage:**

```typescript
import { TransactionTracker } from '@/components/realtime/TransactionTracker';

export default function Layout() {
  return (
    <>
      <main>...</main>
      <TransactionTracker />
    </>
  );
}
```

### RealtimeBalanceDisplay

Shows real-time balance with breakdown (total, available, staked, pending).

**Usage:**

```typescript
import { RealtimeBalanceDisplay } from '@/components/realtime/RealtimeBalanceDisplay';

export default function Dashboard() {
  return (
    <RealtimeBalanceDisplay
      initialBalance={{
        total: '1000',
        available: '500',
        staked: '400',
        pending: '100',
      }}
      className="mb-4"
    />
  );
}
```

### VerificationStatusLive

Shows real-time verification status with oracle confidence and transaction link.

**Usage:**

```typescript
import { VerificationStatusLive } from '@/components/realtime/VerificationStatusLive';

export default function VerificationPage() {
  return (
    <VerificationStatusLive
      verificationId="verification-123"
      className="mb-4"
    />
  );
}
```

### StakeRewardsLive

Displays real-time accrued rewards for a stake.

**Usage:**

```typescript
import { StakeRewardsLive } from '@/components/realtime/StakeRewardsLive';

export default function StakingPage() {
  return (
    <StakeRewardsLive
      stakeId="stake-123"
      className="mb-4"
    />
  );
}
```

### TransactionHistory

Shows recent transactions with status and confirmation count.

**Usage:**

```typescript
import { TransactionHistory } from '@/components/realtime/TransactionHistory';

export default function Dashboard() {
  return (
    <TransactionHistory
      limit={10}
      className="mb-4"
    />
  );
}
```

## Integration with Existing Components

### Dashboard Integration

```typescript
import { RealtimeBalanceDisplay } from '@/components/realtime/RealtimeBalanceDisplay';
import { TransactionHistory } from '@/components/realtime/TransactionHistory';

export function DynamicDashboard() {
  return (
    <div className="space-y-4">
      <RealtimeBalanceDisplay />
      <TransactionHistory limit={5} />
    </div>
  );
}
```

### Verification Status Integration

```typescript
import { VerificationStatusLive } from '@/components/realtime/VerificationStatusLive';

export function DynamicVerificationStatus() {
  return (
    <div>
      <VerificationStatusLive verificationId={verificationId} />
    </div>
  );
}
```

### Staking Interface Integration

```typescript
import { StakeRewardsLive } from '@/components/realtime/StakeRewardsLive';

export function DynamicStakingInterface() {
  return (
    <div>
      {stakes.map((stake) => (
        <StakeRewardsLive key={stake.id} stakeId={stake.id} />
      ))}
    </div>
  );
}
```

## Server-Side Implementation

To fully implement real-time updates, you need a WebSocket server. Options:

### Option 1: Socket.io (Recommended)

```bash
npm install socket.io
```

```typescript
// server.ts
import { Server } from 'socket.io';
import { createServer } from 'http';

const httpServer = createServer();
const io = new Server(httpServer, {
  cors: { origin: '*' },
});

io.on('connection', (socket) => {
  socket.on('subscribe', ({ channel, userId }) => {
    socket.join(`${channel}:${userId}`);
  });

  socket.on('unsubscribe', ({ channel, userId }) => {
    socket.leave(`${channel}:${userId}`);
  });
});

// Emit updates
io.to(`balance:${userId}`).emit('balance', balanceUpdate);
io.to(`transaction:${userId}`).emit('transaction', txUpdate);
```

### Option 2: ws (Lightweight)

```bash
npm install ws
```

```typescript
// server.ts
import WebSocket from 'ws';
import { createServer } from 'http';

const server = createServer();
const wss = new WebSocket.Server({ server });

wss.on('connection', (ws) => {
  ws.on('message', (data) => {
    const message = JSON.parse(data);
    if (message.type === 'subscribe') {
      // Handle subscription
    }
  });
});
```

### Option 3: Next.js API Routes with Polling (Fallback)

If WebSocket is not available, the system falls back to polling:

```typescript
// src/app/api/realtime/updates/route.ts
export async function GET(request: NextRequest) {
  const { userId, lastUpdate } = request.nextUrl.searchParams;

  // Fetch updates since lastUpdate
  const updates = await getUpdates(userId, lastUpdate);

  return Response.json(updates);
}
```

## Performance Considerations

1. **Message Batching**: Group multiple updates into single messages
2. **Throttling**: Limit update frequency (e.g., max 1 update per second)
3. **Selective Subscriptions**: Only subscribe to needed channels
4. **Memory Management**: Clean up old transactions after 5 seconds
5. **Connection Pooling**: Reuse WebSocket connections

## Error Handling

The system handles:
- Connection failures with automatic reconnection
- Message parsing errors
- Offline scenarios with message queuing
- Subscription failures
- Server-side errors

## Testing

```typescript
import { WebSocketManager } from '@/lib/realtime';

describe('WebSocketManager', () => {
  it('should connect and emit events', async () => {
    const manager = new WebSocketManager('ws://localhost:8080');
    const connected = jest.fn();
    manager.on('connected', connected);

    await manager.connect();
    expect(connected).toHaveBeenCalled();
  });

  it('should handle reconnection', async () => {
    const manager = new WebSocketManager('ws://localhost:8080');
    await manager.connect();
    manager.disconnect();
    // Should attempt reconnection
  });
});
```

## Troubleshooting

### WebSocket Connection Fails
- Check CORS configuration
- Verify WebSocket server is running
- Check firewall/proxy settings
- Look for mixed content warnings (HTTPS → WS)

### Updates Not Received
- Verify subscription was successful
- Check browser console for errors
- Verify server is emitting updates
- Check network tab for WebSocket frames

### High Memory Usage
- Reduce message queue size
- Implement message expiration
- Clean up old transactions
- Monitor connection count

## Future Enhancements

- [ ] Message compression
- [ ] Binary protocol support
- [ ] Selective field updates
- [ ] Batch update support
- [ ] Offline-first sync
- [ ] End-to-end encryption
- [ ] Rate limiting per user
- [ ] Message persistence
