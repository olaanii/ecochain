# Initia Auto-sign Implementation

**Requirement 16.8**: Support Initia Auto-sign for seamless transaction signing

## Overview

This implementation provides session-based transaction signing with Initia Auto-sign, including:

- **Session-based signing**: Auto-sign sessions with configurable duration (default 30 minutes)
- **Session expiration handling**: Automatic detection and handling of expired sessions
- **Fallback to manual signing**: Seamless fallback when auto-sign is unavailable
- **Session refresh**: Ability to extend active sessions
- **User consent flow**: Clear UI for enabling/disabling auto-sign
- **Error handling**: Graceful error handling with user-friendly messages

## Architecture

### Components

#### 1. AutosignContext (`src/contexts/autosign-context.tsx`)

Manages auto-sign session lifecycle:

```typescript
export type AutosignContextType = {
  isAutoSignEnabled: boolean;
  autoSignSessionExpiry?: Date;
  isSessionExpired: boolean;
  isSessionExpiring: boolean; // True when within 5 minutes of expiry
  enableAutoSign: (durationMinutes?: number) => Promise<void>;
  disableAutoSign: () => Promise<void>;
  refreshSession: (durationMinutes?: number) => Promise<void>;
  shouldFallbackToManualSign: () => boolean;
  error?: Error;
};
```

**Key Features:**
- Session storage in `sessionStorage` with expiry tracking
- Periodic checks (every 30 seconds) for session expiration
- Automatic cleanup on wallet disconnection
- Session restoration on page reload
- Address validation to prevent session hijacking

#### 2. AutosignToggle Component (`src/components/wallet/autosign-toggle.tsx`)

UI component for managing auto-sign:

```tsx
<AutosignToggle />
```

**Features:**
- Enable/disable auto-sign button
- Session expiry countdown
- Session refresh button
- Expiry warning when session is expiring soon
- Error display
- Manual signing fallback indicator

#### 3. useAutoSignTransaction Hook (`src/hooks/useAutoSignTransaction.ts`)

Hook for transaction signing with auto-sign support:

```typescript
const {
  canUseAutoSign,
  shouldFallbackToManual,
  signingMethod,
  handleSignTransaction,
  refreshSession,
} = useAutoSignTransaction({
  onManualSignRequired: () => console.log("Manual signing needed"),
  onSessionExpiring: () => console.log("Session expiring soon"),
});
```

#### 4. Auto-sign Manager (`src/lib/wallet/auto-sign-manager.ts`)

Utility functions for auto-sign logic:

```typescript
shouldUseAutoSign(isAutoSignEnabled, isSessionExpired, isSessionExpiring)
getSigningMethodDescription(isAutoSignEnabled, isSessionExpired, isSessionExpiring)
```

## Session Lifecycle

### 1. Enabling Auto-sign

```typescript
const { enableAutoSign } = useAutosign();

// Enable with 30-minute session
await enableAutoSign(30);
```

**What happens:**
1. Validates wallet is connected
2. Calculates expiry time (now + duration)
3. Stores session data in `sessionStorage`:
   ```json
   {
     "address": "init1...",
     "enabledAt": "2024-01-01T12:00:00Z",
     "expiresAt": "2024-01-01T12:30:00Z",
     "durationMinutes": 30
   }
   ```
4. Sets `isAutoSignEnabled = true`
5. Starts periodic expiry checks

### 2. Active Session

While session is active:
- Auto-sign is available for transactions
- Periodic checks (every 30 seconds) verify expiry status
- When within 5 minutes of expiry, `isSessionExpiring = true`
- UI shows countdown timer

### 3. Session Expiration

When session expires:
1. `isSessionExpired = true`
2. `isAutoSignEnabled = false`
3. Session data cleared from `sessionStorage`
4. Transactions fall back to manual signing
5. UI shows "Session expired" message

### 4. Session Refresh

```typescript
const { refreshSession } = useAutosign();

// Extend session by 30 minutes
await refreshSession(30);
```

**What happens:**
1. Validates auto-sign is currently enabled
2. Calculates new expiry time
3. Updates session data in `sessionStorage`
4. Resets expiry warnings
5. Continues auto-sign

### 5. Disabling Auto-sign

```typescript
const { disableAutoSign } = useAutosign();

await disableAutoSign();
```

**What happens:**
1. Clears session data from `sessionStorage`
2. Sets `isAutoSignEnabled = false`
3. Stops periodic checks
4. Transactions require manual signing

## Fallback to Manual Signing

Auto-sign automatically falls back to manual signing when:

1. **Auto-sign disabled**: User explicitly disabled auto-sign
2. **Session expired**: Session duration has elapsed
3. **Session expiring soon**: Within 5 minutes of expiration
4. **Auto-sign failure**: Auto-sign transaction fails (graceful fallback)

### Fallback Logic

```typescript
const shouldFallback = !isAutoSignEnabled || isSessionExpired || isSessionExpiring;

if (shouldFallback) {
  // Use manual signing
  await signTransaction(false);
} else {
  // Use auto-sign
  await signTransaction(true);
}
```

## Usage Examples

### Basic Usage

```tsx
import { useAutosign } from "@/contexts/autosign-context";

function MyComponent() {
  const { isAutoSignEnabled, enableAutoSign, disableAutoSign } = useAutosign();

  return (
    <div>
      <button onClick={() => enableAutoSign(30)}>
        Enable Auto-sign
      </button>
      <button onClick={disableAutoSign}>
        Disable Auto-sign
      </button>
      <p>Auto-sign: {isAutoSignEnabled ? "Enabled" : "Disabled"}</p>
    </div>
  );
}
```

### Transaction Signing

```tsx
import { useAutoSignTransaction } from "@/hooks/useAutoSignTransaction";

function TransactionComponent() {
  const {
    canUseAutoSign,
    shouldFallbackToManual,
    signingMethod,
    handleSignTransaction,
  } = useAutoSignTransaction({
    onManualSignRequired: () => {
      console.log("Manual signing required");
    },
    onSessionExpiring: () => {
      console.log("Session expiring soon - consider refreshing");
    },
  });

  const handleSubmit = async () => {
    try {
      const result = await handleSignTransaction(async (useAutoSign) => {
        // Sign transaction
        return await signTx(useAutoSign);
      });
      console.log("Transaction signed:", result);
    } catch (error) {
      console.error("Signing failed:", error);
    }
  };

  return (
    <div>
      <p>Signing method: {signingMethod}</p>
      <button onClick={handleSubmit}>Submit Transaction</button>
    </div>
  );
}
```

### Session Management

```tsx
import { useAutosign } from "@/contexts/autosign-context";

function SessionManager() {
  const {
    isAutoSignEnabled,
    autoSignSessionExpiry,
    isSessionExpiring,
    refreshSession,
  } = useAutosign();

  const timeUntilExpiry = autoSignSessionExpiry
    ? Math.floor((autoSignSessionExpiry.getTime() - Date.now()) / 60000)
    : 0;

  return (
    <div>
      {isAutoSignEnabled && (
        <>
          <p>Session expires in {timeUntilExpiry} minutes</p>
          {isSessionExpiring && (
            <button onClick={() => refreshSession(30)}>
              Refresh Session
            </button>
          )}
        </>
      )}
    </div>
  );
}
```

## Session Storage

Auto-sign sessions are stored in browser `sessionStorage`:

**Key**: `autosign_session`

**Value**:
```json
{
  "address": "init1...",
  "enabledAt": "2024-01-01T12:00:00Z",
  "expiresAt": "2024-01-01T12:30:00Z",
  "durationMinutes": 30
}
```

**Lifecycle:**
- Created when auto-sign is enabled
- Updated when session is refreshed
- Deleted when auto-sign is disabled or session expires
- Cleared when wallet disconnects
- Cleared on page reload if expired

## Configuration

### Session Duration

Default: 30 minutes

Supported durations: 15, 30, 60, 120 minutes (configurable)

```typescript
// Enable with custom duration
await enableAutoSign(60); // 60 minute session
```

### Expiry Warning Threshold

Default: 5 minutes before expiration

When session is within 5 minutes of expiry:
- `isSessionExpiring = true`
- UI shows warning
- Callback `onSessionExpiring` is triggered
- Transactions fall back to manual signing

### Session Check Interval

Default: 30 seconds

Periodic checks verify session expiration status.

## Error Handling

### Common Errors

1. **"Wallet not connected"**
   - Cause: Attempting to enable auto-sign without connected wallet
   - Solution: Connect wallet first

2. **"Auto-sign not enabled"**
   - Cause: Attempting to refresh session when auto-sign is disabled
   - Solution: Enable auto-sign first

3. **"Failed to store auto-sign session"**
   - Cause: `sessionStorage` quota exceeded or unavailable
   - Solution: Clear browser storage or use private browsing

### Error Recovery

- Session storage errors are logged but don't crash the app
- Transactions automatically fall back to manual signing on errors
- Users can retry operations

## Security Considerations

1. **Session Storage**: Sessions are stored in `sessionStorage` (cleared on tab close)
2. **Address Validation**: Session is invalidated if wallet address changes
3. **Expiry Enforcement**: Sessions automatically expire after configured duration
4. **No Sensitive Data**: Session storage contains only address and timestamps
5. **Wallet Disconnection**: Sessions are cleared when wallet disconnects

## Testing

### Unit Tests

Located in:
- `src/contexts/__tests__/autosign-context.test.ts`
- `src/hooks/__tests__/useAutoSignTransaction.test.ts`

**Test Coverage:**
- Session storage and retrieval
- Session expiration detection
- Session refresh functionality
- Address validation
- Fallback to manual signing
- Error handling
- Session duration validation

### Running Tests

```bash
npm run test
```

## Troubleshooting

### Auto-sign not working

1. Check if wallet is connected
2. Verify `enableAutoSign` was called
3. Check browser console for errors
4. Verify `sessionStorage` is available

### Session expires too quickly

1. Check session duration setting
2. Verify system clock is correct
3. Check for browser storage quota issues

### Manual signing fallback not working

1. Verify wallet is still connected
2. Check transaction signing implementation
3. Review error messages in console

## Future Enhancements

1. **Persistent Sessions**: Option to persist sessions across browser restarts
2. **Biometric Authentication**: Require biometric confirmation for auto-sign
3. **Transaction Limits**: Set spending limits for auto-signed transactions
4. **Session Analytics**: Track auto-sign usage and effectiveness
5. **Multi-device Support**: Sync sessions across devices

## References

- Requirement 16.8: Wallet Connection and Authentication
- InterwovenKit Documentation: https://docs.initia.xyz/interwovenkit
- Session Storage API: https://developer.mozilla.org/en-US/docs/Web/API/Window/sessionStorage
