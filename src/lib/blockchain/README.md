# Blockchain Integration

This directory contains the blockchain integration layer for the Eco Rewards Platform, including wagmi and viem configuration for interacting with the Initia appchain.

## Overview

The blockchain layer provides:
- **wagmi Configuration**: Wallet connection and state management
- **viem Clients**: Public client for reads, wallet client for writes
- **Contract Configuration**: ABI and address management for smart contracts
- **Chain Configuration**: Initia appchain parameters and RPC endpoints

## Files

### `wagmi-config.ts`
Configures wagmi with the Initia appchain as a custom chain.

**Exports:**
- `initiaAppchain`: Chain definition for Initia Ecochain
- `wagmiConfig`: wagmi configuration instance
- `CHAIN_CONFIG`: Chain constants (chainId, RPC URLs, etc.)

**Requirements Met:**
- Requirement 16.1: wagmi config with Initia appchain parameters
- Requirement 16.2: Chain validation
- Requirement 16.3: Chain configuration

### `viem-clients.ts`
Creates viem public and wallet clients for contract interactions.

**Exports:**
- `publicClient`: For reading contract state and calling view functions
- `walletClient`: For writing to contracts and signing transactions
- `getPublicClient()`: Get public client instance
- `getWalletClient()`: Get wallet client instance

**Requirements Met:**
- Requirement 16.1: viem public client for contract reads
- Requirement 16.2: viem wallet client for contract writes
- Requirement 16.3: Chain configuration

### `contracts.ts`
Manages smart contract ABIs and addresses.

**Exports:**
- `EcoRewardContract`: ERC20 token contract configuration
- `EcoVerifierContract`: Task verification contract configuration
- `CONTRACTS`: Contract configuration object
- `getContractAddress()`: Get contract address by name
- `getContractABI()`: Get contract ABI by name

**Requirements Met:**
- Requirement 6.1: Export contract ABIs
- Requirement 6.1: Contract address configuration by environment
- Requirement 6.1: Contract address validation

## Usage

### In React Components

```typescript
'use client';

import { useBlockchainClients } from '@/hooks/useBlockchainClients';
import { EcoRewardContract } from '@/lib/blockchain/contracts';

export function MyComponent() {
  const { publicClient, walletClient, account } = useBlockchainClients();

  // Read contract state
  const balance = await publicClient.readContract({
    address: EcoRewardContract.address,
    abi: EcoRewardContract.abi,
    functionName: 'balanceOf',
    args: [account.address],
  });

  // Write to contract
  const hash = await walletClient.writeContract({
    address: EcoRewardContract.address,
    abi: EcoRewardContract.abi,
    functionName: 'approve',
    args: [spenderAddress, amount],
    account: account.address,
  });

  return <div>Balance: {balance.toString()}</div>;
}
```

### In API Routes

```typescript
import { getPublicClient } from '@/lib/blockchain/viem-clients';
import { EcoRewardContract } from '@/lib/blockchain/contracts';

export async function GET(request: Request) {
  const publicClient = getPublicClient();

  const balance = await publicClient.readContract({
    address: EcoRewardContract.address,
    abi: EcoRewardContract.abi,
    functionName: 'totalSupply',
  });

  return Response.json({ totalSupply: balance.toString() });
}
```

## Environment Variables

Required environment variables (see `.env.example`):

```env
# Chain Configuration
NEXT_PUBLIC_INITIA_CHAIN_ID=ecochain105
NEXT_PUBLIC_INITIA_RPC=http://localhost:26657
NEXT_PUBLIC_INITIA_REST=http://localhost:1317
NEXT_PUBLIC_INITIA_JSON_RPC=http://localhost:8545
NEXT_PUBLIC_INITIA_EXPLORER_URL=https://explorer.initia.xyz

# Smart Contracts
NEXT_PUBLIC_ECO_TOKEN_ADDR=0x1E794b01C5Dc3CAc1C5b5edb475aCdD6EDf9C23D
NEXT_PUBLIC_ECO_VERIFIER_ADDR=0x72320C21aE361FCC0b479E18dd528F7872E8450C
```

## Chain Configuration

The Initia Ecochain is configured with:
- **Chain ID**: 105 (extracted from `NEXT_PUBLIC_INITIA_CHAIN_ID`)
- **Native Currency**: ECO (18 decimals)
- **RPC URL**: JSON-RPC endpoint for EVM calls
- **REST URL**: Cosmos REST endpoint
- **Tendermint RPC**: Tendermint RPC endpoint
- **Block Explorer**: Initia Explorer

## Contract Addresses

### EcoReward (ERC20 Token)
- **Address**: `0x1E794b01C5Dc3CAc1C5b5edb475aCdD6EDf9C23D`
- **Symbol**: ECO
- **Decimals**: 18
- **Functions**: balanceOf, approve, transfer, transferFrom, mint, burn

### EcoVerifier (Task Verification)
- **Address**: `0x72320C21aE361FCC0b479E18dd528F7872E8450C`
- **Functions**: submitProof, tasks, usedProofHashes

## Hooks

### `useBlockchainClients()`
Hook for accessing blockchain clients and chain information.

**Returns:**
```typescript
{
  publicClient: PublicClient;
  walletClient: WalletClient;
  account: {
    address?: Address;
    isConnected: boolean;
    chainId?: number;
    isCorrectChain: boolean;
  };
  chainConfig: ChainConfig;
}
```

## Error Handling

All contract interactions should handle errors:

```typescript
try {
  const hash = await walletClient.writeContract({
    // ...
  });
} catch (error) {
  if (error instanceof Error) {
    if (error.message.includes('insufficient balance')) {
      // Handle insufficient balance
    } else if (error.message.includes('user rejected')) {
      // Handle user rejection
    }
  }
}
```

## Testing

To test the blockchain configuration:

```bash
# Check chain configuration
curl http://localhost:8545 -X POST -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"eth_chainId","params":[],"id":1}'

# Check contract address
curl http://localhost:8545 -X POST -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"eth_getCode","params":["0x1E794b01C5Dc3CAc1C5b5edb475aCdD6EDf9C23D","latest"],"id":1}'
```

## References

- [wagmi Documentation](https://wagmi.sh/)
- [viem Documentation](https://viem.sh/)
- [Initia Documentation](https://docs.initia.xyz/)
- [EVM RPC Specification](https://ethereum.org/en/developers/docs/apis/json-rpc/)
