# Better Stack Configuration

## Better Stack for Error Tracking & Logging

Better Stack provides error tracking, uptime monitoring, and log management. Use it alongside UptimeRobot for comprehensive observability.

## Setup Steps

### 1. Create Account
Sign up at https://betterstack.com

### 2. Create Project
- Project name: "EcoChain"
- Environment: "production"

### 3. Install SDK

```bash
pnpm add @better-stack/errors
```

### 4. Configure Error Tracking

Create `src/lib/better-stack.ts`:

```typescript
import { BetterStack } from '@better-stack/errors';

const betterStack = new BetterStack({
  apiKey: process.env.BETTER_STACK_API_KEY,
  environment: process.env.NODE_ENV || 'development',
  release: process.env.NEXT_PUBLIC_VERSION || '1.0.0',
});

export function captureError(error: Error, context?: Record<string, any>) {
  betterStack.captureException(error, context);
}

export function captureMessage(message: string, level: 'info' | 'warning' | 'error') {
  betterStack.captureMessage(message, level);
}
```

### 5. Add to Sentry Integration

Modify `sentry.server.config.ts` to also send errors to Better Stack:

```typescript
import { captureError } from '@/lib/better-stack';

Sentry.init({
  // ... existing config
  beforeSend(event) {
    // Send to Better Stack
    if (event.exception) {
      captureError(new Error(event.message || 'Unknown error'), {
        sentryEvent: event,
      });
    }
    return event;
  },
});
```

### 6. Environment Variables

Add to `.env.example`:

```env
BETTER_STACK_API_KEY=your-better-stack-api-key
```

### 7. Log Forwarding

Better Stack can also receive logs. Configure log forwarding:

```typescript
// src/lib/logger.ts
import { captureMessage } from './better-stack';

export function log(level: 'info' | 'warn' | 'error', message: string, meta?: any) {
  console[level](message, meta);
  
  if (level === 'error') {
    captureMessage(message, 'error');
  }
}
```

## Monitors

Create the following monitors in Better Stack:

1. **API Response Time**
   - Threshold: > 2s
   - Alert: Slack + Email

2. **Error Rate**
   - Threshold: > 1% of requests
   - Alert: Slack + Email

3. **Database Query Time**
   - Threshold: > 500ms
   - Alert: Email

## Dashboards

Create dashboards in Better Stack:

1. **Error Overview**
   - Error rate over time
   - Top errors
   - Error by endpoint

2. **Performance**
   - Response time percentiles
   - Throughput
   - Slowest endpoints

3. **User Impact**
   - Errors by user
   - Affected sessions
   - Browser distribution
