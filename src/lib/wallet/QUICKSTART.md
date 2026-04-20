# Wallet Integration Quick Start

## For Developers

### Using the Wallet Hook

The simplest way to access wallet information in any component:

```tsx
import { useWallet } from "@/contexts/wallet-context";

export function MyComponent() {
  const { isConnected, initiaAddress, connect, disconnect } = useWallet();

  if (!isConnected) {
    return <button onClick={connect}>Connect Wallet</button>;
  }

  return (
    <div>
      <p>Address: {initiaAddress}</p>
      <button onClick={disconnect}>Disconnect</button>
    </div>
  );
}
```

### Using Pre-built Components

For quick UI integration, use the provided components:

```tsx
import { WalletConnectButton } from "@/components/wallet/wallet-connect-button";
import { WalletStatus } from "@/components/wallet/wallet-status";

export function Header() {
  return (
    <header>
      <WalletConnectButton />
      <WalletStatus />
    </header>
  );
}
```

### Checking Connection Status

```tsx
import { useWallet } from "@/contexts/wallet-context";

export function ProtectedFeature() {
  const { isConnected, isCorrectChain } = useWallet();

  if (!isConnected) {
    return <div>Please connect your wallet</div>;
  }

  if (!isCorrectChain) {
    return <div>Please switch to the Initia appchain</div>;
  }

  return <div>Protected content</div>;
}
```

### Accessing Wallet Address

```tsx
import { useWallet } from "@/contexts/wallet-context";

export function UserProfile() {
  const { initiaAddress, username } = useWallet();

  return (
    <div>
      <h1>{username || initiaAddress}</h1>
    </div>
  );
}
```

### Handling Connection Errors

```tsx
import { useWallet } from "@/contexts/wallet-context";

export function WalletManager() {
  const { error, connect } = useWallet();

  return (
    <div>
      <button onClick={connect}>Connect Wallet</button>
      {error && <div className="error">{error.message}</div>}
    </div>
  );
}
```

## Common Patterns

### Pattern 1: Conditional Rendering Based on Connection

```tsx
const { isConnected } = useWallet();

return isConnected ? <ConnectedUI /> : <DisconnectedUI />;
```

### Pattern 2: Require Wallet Connection

```tsx
const { isConnected, connect } = useWallet();

if (!isConnected) {
  return <button onClick={connect}>Connect to continue</button>;
}

return <ProtectedContent />;
```

### Pattern 3: Display Wallet Info

```tsx
const { initiaAddress, username, isCorrectChain } = useWallet();

return (
  <div>
    <p>Address: {initiaAddress}</p>
    {username && <p>Username: {username}</p>}
    {!isCorrectChain && <p className="warning">Wrong chain</p>}
  </div>
);
```

### Pattern 4: Transaction Preparation

```tsx
const { isConnected, isCorrectChain, initiaAddress } = useWallet();

const canSubmitTransaction = isConnected && isCorrectChain;

return (
  <button disabled={!canSubmitTransaction} onClick={submitTransaction}>
    Submit Transaction
  </button>
);
```

## Environment Setup

Ensure these environment variables are set:

```env
NEXT_PUBLIC_INITIA_CHAIN_ID=ecochain105
NEXT_PUBLIC_INITIA_JSON_RPC=http://localhost:8545
NEXT_PUBLIC_INITIA_RPC=http://localhost:26657
NEXT_PUBLIC_INITIA_REST=http://localhost:1317
```

## Troubleshooting

### Wallet Not Connecting

1. Check that Initia wallet extension is installed
2. Verify environment variables are set correctly
3. Check browser console for errors

### Session Storage Not Working

1. Ensure session storage is enabled in browser
2. Check that application is running in secure context (HTTPS or localhost)
3. Look for QuotaExceededError in console

### Chain Validation Failing

1. Verify `NEXT_PUBLIC_INITIA_CHAIN_ID` matches connected chain
2. Check that wallet is connected to correct chain
3. Ensure chain configuration is correct in `src/lib/initia/config.ts`

## API Reference

### useWallet Hook

```typescript
interface WalletContextType {
  address?: string;                    // EVM address (if available)
  initiaAddress?: string;              // Initia wallet address
  chainId?: string;                    // Current chain ID
  isConnected: boolean;                // Connection status
  isConnecting: boolean;               // Connection in progress
  error?: Error;                       // Connection error
  connect: () => Promise<void>;        // Connect wallet
  disconnect: () => Promise<void>;     // Disconnect wallet
  isCorrectChain: boolean;             // Chain validation
  username?: string;                   // Wallet username
}
```

### Session Storage Functions

```typescript
storeWalletAddress(address: string): void
getStoredWalletAddress(): string | null
clearWalletAddress(): void
storeWalletChainId(chainId: string): void
getStoredWalletChainId(): string | null
storeWalletUsername(username: string): void
getStoredWalletUsername(): string | null
```

## Next Steps

1. Use `WalletConnectButton` in your header/navigation
2. Protect features with `isConnected` check
3. Validate chain with `isCorrectChain` check
4. Access wallet address with `initiaAddress`
5. Handle errors with `error` state

## Related Documentation

- [Full Integration Guide](./INITIA_WALLET_INTEGRATION.md)
- [Component Documentation](../../components/wallet/)
- [Session Storage Utilities](./session-storage.ts)
