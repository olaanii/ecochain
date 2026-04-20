# Initia Wallet Integration

## Overview

This document describes the Initia wallet integration for the EcoLoop platform. The integration uses `@initia/interwovenkit-react` to provide seamless wallet connection, state management, and session persistence.

## Requirements Met

- **Requirement 16.2**: Wallet Connection - Support Initia wallet via @initia/interwovenkit-react
- **Requirement 16.3**: Provider Configuration - Validate that the chain ID matches the Initia appchain
- **Requirement 16.4**: Wallet State Management - Implement wallet state management (address, chainId, isConnected)
- **Requirement 16.5**: Session Storage - Store wallet address in user session

## Architecture

### Components

#### 1. WalletProvider Context (`src/contexts/wallet-context.tsx`)

The main context provider that manages wallet state and integrates with InterwovenKit.

**Features:**
- Connects to Initia wallet via `useInterwovenKit` hook
- Validates chain ID matches expected Initia appchain
- Stores wallet address in session storage
- Provides connect/disconnect functionality
- Maintains wallet state across page navigation

**Usage:**
```tsx
import { useWallet } from "@/contexts/wallet-context";

function MyComponent() {
  const { initiaAddress, isConnected, connect, disconnect } = useWallet();
  
  return (
    <div>
      {isConnected ? (
        <button onClick={disconnect}>Disconnect</button>
      ) : (
        <button onClick={connect}>Connect Wallet</button>
      )}
    </div>
  );
}
```

#### 2. WalletConnectButton Component (`src/components/wallet/wallet-connect-button.tsx`)

A ready-to-use button component for wallet connection.

**Features:**
- Displays connect button when wallet is disconnected
- Shows shortened wallet address when connected
- Copy-to-clipboard functionality
- Error display
- Loading state during connection

**Usage:**
```tsx
import { WalletConnectButton } from "@/components/wallet/wallet-connect-button";

export function Header() {
  return (
    <header>
      <WalletConnectButton />
    </header>
  );
}
```

#### 3. WalletStatus Component (`src/components/wallet/wallet-status.tsx`)

Displays detailed wallet connection status.

**Features:**
- Shows connection status with visual indicator
- Displays wallet address and username
- Shows chain validation status
- Warns if connected to wrong chain

**Usage:**
```tsx
import { WalletStatus } from "@/components/wallet/wallet-status";

export function Dashboard() {
  return (
    <div>
      <WalletStatus />
    </div>
  );
}
```

### Session Storage Utilities (`src/lib/wallet/session-storage.ts`)

Provides utilities for persisting wallet information in session storage.

**Functions:**
- `storeWalletAddress(address: string)` - Store wallet address
- `getStoredWalletAddress()` - Retrieve wallet address
- `clearWalletAddress()` - Clear all wallet data
- `storeWalletChainId(chainId: string)` - Store chain ID
- `getStoredWalletChainId()` - Retrieve chain ID
- `storeWalletUsername(username: string)` - Store username
- `getStoredWalletUsername()` - Retrieve username

## Configuration

### Environment Variables

The wallet integration uses the following environment variables:

```env
# Initia Chain Configuration
NEXT_PUBLIC_INITIA_CHAIN_ID=ecochain105
NEXT_PUBLIC_INITIA_JSON_RPC=http://localhost:8545
NEXT_PUBLIC_INITIA_RPC=http://localhost:26657
NEXT_PUBLIC_INITIA_REST=http://localhost:1317
NEXT_PUBLIC_INITIA_ROUTER_API_URL=https://router.initia.xyz
NEXT_PUBLIC_INITIA_REGISTRY_URL=https://registry.initia.xyz
NEXT_PUBLIC_INITIA_GLYPH_URL=https://glyph.initia.xyz
NEXT_PUBLIC_INITIA_USERNAMES_MODULE=initia1usernamesmodule000000000000
NEXT_PUBLIC_INITIA_LOCK_STAKE_MODULE=initia1lockstake0000000000000
NEXT_PUBLIC_INITIA_MINITY_URL=https://minity.initia.xyz
NEXT_PUBLIC_INITIA_DEX_URL=https://dex.initia.xyz
NEXT_PUBLIC_INITIA_VIP_URL=https://vip.initia.xyz
```

### Provider Setup

The wallet integration is set up in `src/components/providers.tsx`:

```tsx
import { WalletProvider } from "@/contexts/wallet-context";

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <WagmiProvider config={wagmiConfig}>
        <InterwovenKitProvider {...initiaConfig}>
          <WalletProvider>
            <NavigationProvider>{children}</NavigationProvider>
          </WalletProvider>
        </InterwovenKitProvider>
      </WagmiProvider>
    </QueryClientProvider>
  );
}
```

## Features

### 1. Wallet Connection

Users can connect their Initia wallet using the `WalletConnectButton` component. The connection is handled by InterwovenKit's `openConnect()` function.

### 2. Chain Validation

The wallet context validates that the connected wallet is on the correct Initia appchain. If the chain is incorrect, the `isCorrectChain` flag is set to false.

### 3. Session Persistence

Wallet address, chain ID, and username are stored in session storage, allowing the wallet connection to persist across page navigation.

### 4. Error Handling

Connection errors are captured and displayed to the user through the error state in the context.

## Usage Examples

### Basic Connection Flow

```tsx
import { useWallet } from "@/contexts/wallet-context";

export function WalletManager() {
  const { isConnected, initiaAddress, connect, disconnect, isCorrectChain } = useWallet();

  if (!isConnected) {
    return <button onClick={connect}>Connect Wallet</button>;
  }

  if (!isCorrectChain) {
    return <div>Please switch to the Initia appchain</div>;
  }

  return (
    <div>
      <p>Connected: {initiaAddress}</p>
      <button onClick={disconnect}>Disconnect</button>
    </div>
  );
}
```

### Accessing Wallet Address in Components

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

### Checking Connection Status

```tsx
import { useWallet } from "@/contexts/wallet-context";

export function ProtectedComponent() {
  const { isConnected, isCorrectChain } = useWallet();

  if (!isConnected) {
    return <div>Please connect your wallet</div>;
  }

  if (!isCorrectChain) {
    return <div>Please switch to the correct chain</div>;
  }

  return <div>Protected content</div>;
}
```

## Session Storage

Wallet information is stored in the browser's session storage with the following keys:

- `wallet_address` - The connected wallet address
- `wallet_chain_id` - The current chain ID
- `wallet_username` - The wallet username (if available)

Session storage is cleared when:
- The user disconnects their wallet
- The user closes the browser tab/window

## Auto-Sign Support

The Initia wallet integration includes support for Auto-sign, which is configured in the `InterwovenKitProvider` with `enableAutoSign={true}`. This allows for seamless transaction signing without manual confirmation for each transaction.

## Troubleshooting

### Wallet Not Connecting

1. Ensure the Initia wallet extension is installed
2. Check that the chain ID in environment variables matches the connected chain
3. Verify that the RPC and REST endpoints are accessible

### Chain Validation Failing

1. Check the `NEXT_PUBLIC_INITIA_CHAIN_ID` environment variable
2. Ensure the wallet is connected to the correct chain
3. Verify the chain configuration in `src/lib/initia/config.ts`

### Session Storage Not Working

1. Check browser console for session storage errors
2. Ensure session storage is not disabled in browser settings
3. Verify that the application is running in a secure context (HTTPS or localhost)

## Related Files

- `src/contexts/wallet-context.tsx` - Main wallet context provider
- `src/components/wallet/wallet-connect-button.tsx` - Connect button component
- `src/components/wallet/wallet-status.tsx` - Status display component
- `src/lib/wallet/session-storage.ts` - Session storage utilities
- `src/components/providers.tsx` - Provider setup
- `src/lib/initia/config.ts` - Initia configuration
