# Wallet Integration Guide

## Overview

Complete wallet integration for the EcoChain platform using wagmi, viem, and Initia's InterwovenKit. Supports wallet connection, Auto-sign sessions, and chain validation.

## Components

### 1. Wallet Context (`src/contexts/wallet-context.tsx`)

Manages wallet connection state and provides wallet operations.

**Features:**
- JWT token validation using Clerk
- Wallet address management
- Chain validation (ensures Initia appchain)
- Connection/disconnection handling
- Error handling

**Usage:**
```typescript
import { useWallet } from "@/contexts/wallet-context";

function MyComponent() {
  const {
    address,
    chainId,
    isConnected,
    isConnecting,
    isCorrectChain,
    error,
    connect,
    disconnect,
    switchChain,
  } = useWallet();

  return (
    <div>
      {isConnected ? (
        <p>Connected: {address}</p>
      ) : (
        <button onClick={() => connect()}>Connect</button>
      )}
    </div>
  );
}
```

### 2. Auto-sign Context (`src/contexts/autosign-context.tsx`)

Manages Auto-sign session state and lifecycle.

**Features:**
- Session-based transaction signing
- Configurable session duration (default: 30 minutes)
- Automatic session expiry detection
- Session persistence in sessionStorage
- Fallback to manual signing when expired

**Usage:**
```typescript
import { useAutosign } from "@/contexts/autosign-context";

function MyComponent() {
  const {
    isAutoSignEnabled,
    autoSignSessionExpiry,
    isSessionExpired,
    enableAutoSign,
    disableAutoSign,
    refreshSession,
    error,
  } = useAutosign();

  return (
    <div>
      {isAutoSignEnabled ? (
        <button onClick={() => disableAutoSign()}>Disable Auto-sign</button>
      ) : (
        <button onClick={() => enableAutoSign(30)}>Enable Auto-sign</button>
      )}
    </div>
  );
}
```

### 3. Wallet Connect Button (`src/components/wallet/wallet-connect-button.tsx`)

UI component for wallet connection with provider selection.

**Features:**
- Provider selection dropdown
- Loading state
- Error display
- Responsive design

**Usage:**
```typescript
import { WalletConnectButton } from "@/components/wallet";

export default function Header() {
  return (
    <header>
      <WalletConnectButton />
    </header>
  );
}
```

### 4. Wallet Status (`src/components/wallet/wallet-status.tsx`)

Displays connected wallet information and controls.

**Features:**
- Wallet address display (shortened)
- Copy address to clipboard
- Chain validation indicator
- Disconnect button
- Error display

**Usage:**
```typescript
import { WalletStatus } from "@/components/wallet";

export default function Header() {
  return (
    <header>
      <WalletStatus />
    </header>
  );
}
```

### 5. Auto-sign Toggle (`src/components/wallet/autosign-toggle.tsx`)

UI component for enabling/disabling Auto-sign.

**Features:**
- Enable/disable toggle
- Session expiry countdown
- Refresh button
- Error display
- Loading state

**Usage:**
```typescript
import { AutosignToggle } from "@/components/wallet";

export default function Settings() {
  return (
    <div>
      <AutosignToggle />
    </div>
  );
}
```

## Setup Instructions

### 1. Install Dependencies

```bash
npm install wagmi viem @initia/interwovenkit-react
```

### 2. Configure Environment Variables

```env
# Initia Chain Configuration
NEXT_PUBLIC_INITIA_CHAIN_ID=105
NEXT_PUBLIC_INITIA_JSON_RPC=http://localhost:8545
NEXT_PUBLIC_INITIA_REST=http://localhost:1317
NEXT_PUBLIC_INITIA_RPC=http://localhost:26657
NEXT_PUBLIC_INITIA_EXPLORER_URL=https://explorer.initia.xyz
```

### 3. Wrap Application with Providers

```typescript
// app/layout.tsx
import { WagmiProvider } from "wagmi";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import { WalletProvider } from "@/contexts/wallet-context";
import { AutosignProvider } from "@/contexts/autosign-context";
import { wagmiConfig } from "@/lib/blockchain/wagmi-config";

const queryClient = new QueryClient();

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html>
      <body>
        <WagmiProvider config={wagmiConfig}>
          <QueryClientProvider client={queryClient}>
            <WalletProvider>
              <AutosignProvider>
                {children}
              </AutosignProvider>
            </WalletProvider>
          </QueryClientProvider>
        </WagmiProvider>
      </body>
    </html>
  );
}
```

### 4. Use Wallet Components

```typescript
// app/page.tsx
import { WalletConnectButton, WalletStatus, AutosignToggle } from "@/components/wallet";

export default function Home() {
  return (
    <main>
      <header className="flex justify-between items-center p-4">
        <h1>EcoChain</h1>
        <div className="flex gap-4">
          <WalletConnectButton />
          <WalletStatus />
        </div>
      </header>

      <section className="p-4">
        <AutosignToggle />
      </section>
    </main>
  );
}
```

## Wallet Connection Flow

```
User clicks "Connect Wallet"
    ↓
Provider selection (if multiple)
    ↓
Wallet extension opens
    ↓
User approves connection
    ↓
Wallet address retrieved
    ↓
Chain validation
    ↓
Address stored in session
    ↓
Connected state updated
    ↓
WalletStatus component displayed
```

## Auto-sign Flow

```
User clicks "Enable Auto-sign"
    ↓
Session created with expiry time
    ↓
Session stored in sessionStorage
    ↓
Auto-sign enabled for transactions
    ↓
Countdown timer starts
    ↓
On transaction: Auto-sign if session valid
    ↓
On session expiry: Fallback to manual signing
    ↓
User can refresh session
```

## Chain Validation

The wallet context automatically validates that the connected wallet is on the Initia appchain.

**Validation Logic:**
```typescript
const isCorrectChain = chainId === initiaAppchain.id;

if (!isCorrectChain) {
  // Show warning to user
  // Suggest switching chain
}
```

**Chain Details:**
- Chain ID: 105 (configurable)
- Native Currency: ECO
- RPC URL: Configurable via environment
- Block Explorer: Initia Explorer

## Error Handling

### Connection Errors

```typescript
const { error, connect } = useWallet();

if (error) {
  console.error("Connection failed:", error.message);
  // Display user-friendly error message
}
```

### Auto-sign Errors

```typescript
const { error, enableAutoSign } = useAutosign();

try {
  await enableAutoSign(30);
} catch (err) {
  console.error("Auto-sign failed:", err);
  // Fallback to manual signing
}
```

## Session Management

### Session Storage

Auto-sign sessions are stored in `sessionStorage`:

```json
{
  "address": "initia1...",
  "enabledAt": "2024-04-01T12:00:00Z",
  "expiresAt": "2024-04-01T12:30:00Z"
}
```

### Session Validation

Sessions are validated on:
- Component mount
- Every minute (automatic check)
- Before transaction signing

### Session Expiry

When a session expires:
1. `isSessionExpired` flag is set to true
2. `isAutoSignEnabled` is set to false
3. Transactions require manual signing
4. User can refresh session

## Transaction Signing

### With Auto-sign Enabled

```typescript
import { useWallet } from "@/contexts/wallet-context";
import { useAutosign } from "@/contexts/autosign-context";

function SubmitProof() {
  const { address } = useWallet();
  const { isAutoSignEnabled, isSessionExpired } = useAutosign();

  const handleSubmit = async () => {
    if (isAutoSignEnabled && !isSessionExpired) {
      // Auto-sign transaction
      const tx = await submitProofWithAutoSign(address);
    } else {
      // Manual signing required
      const tx = await submitProofWithManualSign(address);
    }
  };

  return <button onClick={handleSubmit}>Submit Proof</button>;
}
```

## Best Practices

1. **Always check chain** - Validate `isCorrectChain` before operations
2. **Handle disconnection** - Clear user data when wallet disconnects
3. **Validate address** - Ensure address is valid Bech32 format
4. **Session timeout** - Implement reasonable session durations
5. **Error messages** - Provide clear, actionable error messages
6. **Fallback signing** - Always have manual signing as fallback
7. **Session persistence** - Restore sessions on page reload
8. **User consent** - Always ask before enabling Auto-sign

## Troubleshooting

### Wallet Not Connecting

1. Check browser wallet extension is installed
2. Verify chain configuration
3. Check console for error messages
4. Try different wallet provider

### Wrong Chain Error

1. Switch wallet to Initia appchain
2. Verify chain ID in environment variables
3. Check RPC URL is accessible

### Auto-sign Not Working

1. Verify wallet is connected
2. Check session hasn't expired
3. Verify Auto-sign is enabled
4. Check browser sessionStorage

### Address Not Displaying

1. Verify wallet is connected
2. Check address is valid Bech32 format
3. Verify context providers are set up

## Security Considerations

1. **Session Storage** - Auto-sign sessions stored in sessionStorage (cleared on tab close)
2. **No Private Keys** - Private keys never leave wallet extension
3. **User Consent** - All operations require user approval
4. **Chain Validation** - Prevents transactions on wrong chain
5. **Session Expiry** - Automatic session timeout for security

## API Reference

### useWallet()

```typescript
interface WalletContextType {
  address?: string;                    // Connected wallet address
  chainId?: number;                    // Current chain ID
  isConnected: boolean;                // Connection status
  isConnecting: boolean;               // Connection in progress
  isDisconnecting: boolean;            // Disconnection in progress
  error?: Error;                       // Connection error
  connect: (connectorId?: string) => Promise<void>;  // Connect wallet
  disconnect: () => Promise<void>;     // Disconnect wallet
  switchChain: () => Promise<void>;    // Switch chain
  isCorrectChain: boolean;             // Is on Initia appchain
}
```

### useAutosign()

```typescript
interface AutosignContextType {
  isAutoSignEnabled: boolean;          // Auto-sign status
  autoSignSessionExpiry?: Date;        // Session expiry time
  isSessionExpired: boolean;           // Session expired status
  enableAutoSign: (durationMinutes?: number) => Promise<void>;  // Enable
  disableAutoSign: () => Promise<void>;                         // Disable
  refreshSession: (durationMinutes?: number) => Promise<void>;  // Refresh
  error?: Error;                       // Error state
}
```

## Examples

### Complete Wallet Setup

```typescript
// app/layout.tsx
import { WagmiProvider } from "wagmi";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import { WalletProvider } from "@/contexts/wallet-context";
import { AutosignProvider } from "@/contexts/autosign-context";
import { wagmiConfig } from "@/lib/blockchain/wagmi-config";

const queryClient = new QueryClient();

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <WagmiProvider config={wagmiConfig}>
          <QueryClientProvider client={queryClient}>
            <WalletProvider>
              <AutosignProvider>
                {children}
              </AutosignProvider>
            </WalletProvider>
          </QueryClientProvider>
        </WagmiProvider>
      </body>
    </html>
  );
}
```

### Using Wallet in Component

```typescript
import { useWallet } from "@/contexts/wallet-context";
import { WalletConnectButton, WalletStatus } from "@/components/wallet";

export function Header() {
  const { isConnected } = useWallet();

  return (
    <header className="flex justify-between items-center p-4">
      <h1>EcoChain</h1>
      <div className="flex gap-4">
        {isConnected ? <WalletStatus /> : <WalletConnectButton />}
      </div>
    </header>
  );
}
```

### Using Auto-sign in Transaction

```typescript
import { useWallet } from "@/contexts/wallet-context";
import { useAutosign } from "@/contexts/autosign-context";

export function ProofSubmission() {
  const { address, isConnected } = useWallet();
  const { isAutoSignEnabled, isSessionExpired } = useAutosign();

  const handleSubmit = async (proofData) => {
    if (!isConnected) {
      alert("Please connect wallet");
      return;
    }

    try {
      const result = await submitProof({
        address,
        proofData,
        autoSign: isAutoSignEnabled && !isSessionExpired,
      });

      alert("Proof submitted successfully!");
    } catch (error) {
      alert(`Error: ${error.message}`);
    }
  };

  return (
    <form onSubmit={(e) => {
      e.preventDefault();
      handleSubmit(new FormData(e.currentTarget));
    }}>
      {/* Form fields */}
      <button type="submit">Submit Proof</button>
    </form>
  );
}
```

---

**Status**: ✅ Complete
**Version**: 1.0.0
**Requirements Met**: 16.2, 16.3, 16.4, 16.5, 16.8
