# Blockchain Event Listener

Monitors blockchain events and processes them to update application state. Handles ProofSubmitted, TokensMinted, and Transfer events with automatic retry logic and error handling.

## Overview

The event listener system consists of:

1. **EventListener** - Polls blockchain for new events
2. **EventQueue** - Manages event processing with retry logic
3. **EventHandlers** - Processes specific event types
4. **API Endpoints** - Manage listener lifecycle
5. **React Hook** - Frontend integration

## Architecture

```
Blockchain Events
       ↓
EventListener (polls every 12 seconds)
       ↓
EventQueue (processes in batches)
       ↓
EventHandlers (type-specific processing)
       ↓
Database Updates + Cache Invalidation
```

## Requirements

- **18.1**: Create event listener service for ProofSubmitted, TokensMinted, Transfer events
- **18.2**: Implement event processing handlers
- **18.5**: Update database within 1 second of event detection
- **18.6**: Create ledger entries for all token operations
- **18.7**: Implement retry logic (up to 3 times with exponential backoff)
- **18.8**: Implement event processing queue for high volume
- **18.9**: Alert on repeated processing failures

## Components

### EventListener

Polls blockchain for new events every 12 seconds (1 block on Initia).

```typescript
import { getEventListener, startEventListener, stopEventListener } from '@/lib/blockchain/event-listener';

// Start listening
await startEventListener();

// Get status
const listener = getEventListener();
const status = listener.getStatus();
// { isListening: true, lastBlockProcessed: 12345n, queueSize: 5 }

// Stop listening
await stopEventListener();
```

**Monitored Events:**
- `ProofSubmitted` - Task verification completed
- `TokensMinted` - Tokens minted to user
- `Transfer` - Token transfers between addresses

### EventQueue

Manages event processing with retry logic and error handling.

```typescript
import { EventQueue } from '@/lib/blockchain/event-queue';

const queue = new EventQueue();

// Start processing
queue.startProcessing();

// Get failed events
const failed = await queue.getFailedEvents(50);

// Get recent alerts
const alerts = await queue.getRecentAlerts(50);

// Clear failed events
await queue.clearFailedEvents();

// Stop processing
await queue.stopProcessing();
```

**Features:**
- Batch processing (10 events per batch)
- Automatic retry (up to 3 times)
- Exponential backoff (5 second base delay)
- Failed event tracking
- Alert generation on max retries

### EventHandlers

Process specific event types and update database.

```typescript
import {
  processProofSubmittedEvent,
  processTokensMintedEvent,
  processTransferEvent,
} from '@/lib/blockchain/event-handlers';

// Each handler returns EventProcessingResult
const result = await processProofSubmittedEvent(event);
// { success: true, eventId: '...', error?: '...' }
```

**ProofSubmitted Handler:**
- Updates verification status to "verified"
- Stores transaction hash
- Creates ledger entry for minted tokens
- Updates user total rewards
- Invalidates user cache

**TokensMinted Handler:**
- Finds user by wallet address
- Creates ledger entry
- Updates user total rewards
- Invalidates cache

**Transfer Handler:**
- Creates ledger entries for both users
- Tracks direction (in/out)
- Invalidates cache for both users

## API Endpoints

### GET /api/blockchain/events

Get event listener status.

```bash
curl http://localhost:3000/api/blockchain/events
```

Response:
```json
{
  "success": true,
  "status": {
    "isListening": true,
    "lastBlockProcessed": "12345",
    "queueSize": 5
  }
}
```

### GET /api/blockchain/events?action=failed

Get failed events for manual review.

```bash
curl http://localhost:3000/api/blockchain/events?action=failed
```

Response:
```json
{
  "success": true,
  "failedEvents": [
    {
      "id": "proof-0x123...-0",
      "type": "ProofSubmitted",
      "status": "failed",
      "error": "Verification not found",
      "failedAt": "2024-01-01T12:00:00Z"
    }
  ],
  "count": 1
}
```

### GET /api/blockchain/events?action=alerts

Get recent processing alerts.

```bash
curl http://localhost:3000/api/blockchain/events?action=alerts
```

Response:
```json
{
  "success": true,
  "alerts": [
    {
      "eventId": "proof-0x123...-0",
      "eventType": "ProofSubmitted",
      "error": "Max retries exceeded",
      "timestamp": "2024-01-01T12:00:00Z"
    }
  ],
  "count": 1
}
```

### POST /api/blockchain/events

Manage event listener lifecycle.

**Start listener:**
```bash
curl -X POST http://localhost:3000/api/blockchain/events \
  -H "Content-Type: application/json" \
  -d '{"action": "start"}'
```

**Stop listener:**
```bash
curl -X POST http://localhost:3000/api/blockchain/events \
  -H "Content-Type: application/json" \
  -d '{"action": "stop"}'
```

**Clear failed events:**
```bash
curl -X POST http://localhost:3000/api/blockchain/events \
  -H "Content-Type: application/json" \
  -d '{"action": "clear-failed"}'
```

## React Hook

Use the `useEventListener` hook in components.

```typescript
import { useEventListener } from '@/hooks/useEventListener';

export function EventListenerStatus() {
  const {
    status,
    failedEvents,
    alerts,
    loading,
    error,
    start,
    stop,
    clearFailed,
    refresh,
  } = useEventListener();

  return (
    <div>
      <h2>Event Listener Status</h2>
      {status && (
        <>
          <p>Listening: {status.isListening ? 'Yes' : 'No'}</p>
          <p>Last Block: {status.lastBlockProcessed.toString()}</p>
          <p>Queue Size: {status.queueSize}</p>
        </>
      )}

      <button onClick={start} disabled={loading}>
        Start
      </button>
      <button onClick={stop} disabled={loading}>
        Stop
      </button>
      <button onClick={refresh} disabled={loading}>
        Refresh
      </button>

      {failedEvents.length > 0 && (
        <>
          <h3>Failed Events ({failedEvents.length})</h3>
          <button onClick={clearFailed}>Clear Failed</button>
          <ul>
            {failedEvents.map((event) => (
              <li key={event.id}>
                {event.type}: {event.error}
              </li>
            ))}
          </ul>
        </>
      )}

      {error && <p style={{ color: 'red' }}>Error: {error}</p>}
    </div>
  );
}
```

## Configuration

### Polling Interval

Events are polled every 12 seconds (1 block on Initia).

To change:
```typescript
// In event-listener.ts
this.pollInterval = setInterval(async () => {
  await this.pollForEvents();
}, 12000); // Change this value
```

### Batch Size

Events are processed in batches of 10.

To change:
```typescript
// In event-queue.ts
const BATCH_SIZE = 10; // Change this value
```

### Max Retries

Failed events are retried up to 3 times.

To change:
```typescript
// In event-queue.ts
const MAX_RETRIES = 3; // Change this value
```

### Retry Delay

Base retry delay is 5 seconds with exponential backoff.

To change:
```typescript
// In event-queue.ts
const RETRY_DELAY_MS = 5000; // Change this value
```

## Database Schema

Events are tracked in Redis for deduplication:

```
event:{eventId} -> "processed" (24 hour TTL)
event:processed:{eventType} -> set of event IDs
blockchain:event:queue -> list of pending events
blockchain:event:processing -> current processing event
blockchain:event:failed -> list of failed events
blockchain:event:alerts -> list of recent alerts
```

## Error Handling

### Retryable Errors

Errors that trigger automatic retry:
- Network timeouts
- Temporary database issues
- Rate limiting

### Non-Retryable Errors

Errors that don't trigger retry:
- Event not found
- Invalid data format
- Unauthorized access

### Failed Event Handling

When max retries exceeded:
1. Event moved to failed queue
2. Alert generated
3. Logged for manual review
4. Can be manually cleared via API

## Monitoring

### Health Check

```bash
curl http://localhost:3000/api/blockchain/events
```

### Failed Events

```bash
curl http://localhost:3000/api/blockchain/events?action=failed
```

### Recent Alerts

```bash
curl http://localhost:3000/api/blockchain/events?action=alerts
```

## Performance

- **Event Detection**: < 12 seconds (1 block)
- **Database Update**: < 1 second (requirement 18.5)
- **Batch Processing**: 10 events per batch
- **Retry Backoff**: Exponential (5s, 10s, 20s)

## Troubleshooting

### Events Not Processing

1. Check listener status: `GET /api/blockchain/events`
2. Verify listener is running: `status.isListening === true`
3. Check failed events: `GET /api/blockchain/events?action=failed`
4. Check recent alerts: `GET /api/blockchain/events?action=alerts`

### High Failed Event Count

1. Review error messages in failed events
2. Check database connectivity
3. Verify contract addresses are correct
4. Check Redis connectivity

### Slow Event Processing

1. Check batch size (default: 10)
2. Check database query performance
3. Monitor Redis latency
4. Check blockchain RPC latency

## Integration

### Starting Event Listener

In your application initialization:

```typescript
// In app.ts or main initialization
import { startEventListener } from '@/lib/blockchain/event-listener';

// Start listening when app starts
await startEventListener();
```

### Stopping Event Listener

On application shutdown:

```typescript
import { stopEventListener } from '@/lib/blockchain/event-listener';

// Stop listening on shutdown
process.on('SIGTERM', async () => {
  await stopEventListener();
  process.exit(0);
});
```

## Testing

### Mock Events

```typescript
import { EventQueue } from '@/lib/blockchain/event-queue';

const queue = new EventQueue();

const mockEvent = {
  id: 'test-event-1',
  type: 'ProofSubmitted' as const,
  contractAddress: '0x...',
  transactionHash: '0x...',
  blockNumber: 12345n,
  logIndex: 0,
  data: {
    user: '0x...',
    taskId: 'task-1',
    proofHash: 'hash-1',
    rewardMinted: '1000',
  },
  retryCount: 0,
  status: 'pending' as const,
};

await queue.enqueue(mockEvent);
```

## Related Files

- `src/lib/blockchain/event-listener.ts` - Main listener
- `src/lib/blockchain/event-queue.ts` - Event queue
- `src/lib/blockchain/event-handlers.ts` - Event handlers
- `src/app/api/blockchain/events/route.ts` - API endpoints
- `src/hooks/useEventListener.ts` - React hook
