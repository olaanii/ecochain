# Smart Contract Integration Layer

This directory contains the smart contract integration layer for the EcoChain rewards system. It provides configuration, validation, and client utilities for interacting with the EcoReward and EcoVerifier contracts.

## Structure

```
contracts/
├── abis/                    # Contract ABIs (Application Binary Interfaces)
│   ├── EcoReward.abi.json
│   └── EcoVerifier.abi.json
├── config.ts               # Environment-based contract configuration
├── validation.ts           # Address validation utilities
├── client.ts               # Contract client initialization
├── index.ts                # Main export file
└── README.md               # This file
```

## Configuration

### Environment Variables

Contract addresses and RPC URLs are configured via environment variables. The system supports three environments: `dev`, `staging`, and `prod`.

```env
# Environment selection
NEXT_PUBLIC_ENVIRONMENT=dev

# Development Environment
NEXT_PUBLIC_ECO_REWARD_ADDRESS_DEV=0x...
NEXT_PUBLIC_ECO_VERIFIER_ADDRESS_DEV=0x...
NEXT_PUBLIC_RPC_URL_DEV=http://localhost:8545
NEXT_PUBLIC_CHAIN_ID_DEV=31337

# Staging Environment
NEXT_PUBLIC_ECO_REWARD_ADDRESS_STAGING=0x...
NEXT_PUBLIC_ECO_VERIFIER_ADDRESS_STAGING=0x...
NEXT_PUBLIC_RPC_URL_STAGING=https://staging-rpc.example.com
NEXT_PUBLIC_CHAIN_ID_STAGING=11155111

# Production Environment
NEXT_PUBLIC_ECO_REWARD_ADDRESS_PROD=0x...
NEXT_PUBLIC_ECO_VERIFIER_ADDRESS_PROD=0x...
NEXT_PUBLIC_RPC_URL_PROD=https://mainnet-rpc.example.com
NEXT_PUBLIC_CHAIN_ID_PROD=1
```

### Getting Configuration

```typescript
import { getContractConfig, getContractAddresses } from '@/lib/contracts';

// Get full configuration for current environment
const config = getContractConfig();
// {
//   addresses: { ecoReward: '0x...', ecoVerifier: '0x...' },
//   environment: 'dev',
//   rpcUrl: 'http://localhost:8545',
//   chainId: 31337
// }

// Get just the addresses
const addresses = getContractAddresses();
// { ecoReward: '0x...', ecoVerifier: '0x...' }

// Get a specific address
const ecoRewardAddr = getContractAddress('ecoReward');
```

## Validation

The validation module provides utilities to ensure contract addresses are valid and properly configured.

### Validation Functions

```typescript
import {
  isValidAddress,
  isNotZeroAddress,
  validateContractAddresses,
  assertValidContractAddresses,
} from '@/lib/contracts';

// Check if address format is valid
isValidAddress('0x1234567890123456789012345678901234567890'); // true
isValidAddress('invalid'); // false

// Check if address is not the zero address
isNotZeroAddress('0x1234567890123456789012345678901234567890'); // true
isNotZeroAddress('0x0000000000000000000000000000000000000000'); // false

// Validate all contract addresses
const validation = validateContractAddresses({
  ecoReward: '0x...',
  ecoVerifier: '0x...',
});
// { valid: true, errors: [] }

// Assert addresses are valid (throws on error)
assertValidContractAddresses({
  ecoReward: '0x...',
  ecoVerifier: '0x...',
});
```

## Contract Client

The contract client provides initialized contract instances with ABIs and addresses.

```typescript
import {
  initializeContractClient,
  getEcoRewardAddress,
  getEcoVerifierAddress,
  getEcoRewardABI,
  getEcoVerifierABI,
} from '@/lib/contracts';

// Initialize client with current environment
const client = initializeContractClient();
// {
//   ecoRewardAddress: '0x...',
//   ecoVerifierAddress: '0x...',
//   ecoRewardABI: [...],
//   ecoVerifierABI: [...],
//   rpcUrl: 'http://localhost:8545',
//   chainId: 31337
// }

// Get individual contract details
const ecoRewardAddr = getEcoRewardAddress();
const ecoVerifierAddr = getEcoVerifierAddress();
const ecoRewardABI = getEcoRewardABI();
const ecoVerifierABI = getEcoVerifierABI();
```

## Contract ABIs

### EcoReward Contract

The EcoReward contract is an ERC20 token with minting capabilities restricted to authorized verifiers.

**Key Functions:**
- `mint(to: address, amount: uint256)` - Mint new ECO tokens (only authorized)
- `setVerifier(verifier: address, authorized: bool)` - Authorize/revoke verifier
- `balanceOf(account: address)` - Get token balance
- `transfer(to: address, amount: uint256)` - Transfer tokens
- `approve(spender: address, amount: uint256)` - Approve spending

**Events:**
- `VerifierSet(verifier: address, authorized: bool)`
- `Transfer(from: address, to: address, value: uint256)`
- `Approval(owner: address, spender: address, value: uint256)`

### EcoVerifier Contract

The EcoVerifier contract handles task verification and reward distribution.

**Key Functions:**
- `setTask(taskId: string, baseReward: uint256)` - Configure a task (only owner)
- `submitProof(taskId: string, proofHash: string, timestamp: uint256)` - Submit proof and claim reward
- `setEcoToken(ecoToken: address)` - Update token address (only owner)

**Events:**
- `TaskSet(taskId: string, baseReward: uint256)`
- `ProofSubmitted(user: address, taskId: string, proofHash: string, rewardMinted: uint256)`

## Usage Examples

### Basic Setup

```typescript
import { initializeContractClient } from '@/lib/contracts';

// In your component or API route
const client = initializeContractClient();

// Use with ethers.js or web3.js
import { ethers } from 'ethers';

const provider = new ethers.JsonRpcProvider(client.rpcUrl);
const ecoRewardContract = new ethers.Contract(
  client.ecoRewardAddress,
  client.ecoRewardABI,
  provider
);

// Get token balance
const balance = await ecoRewardContract.balanceOf(userAddress);
```

### Validation in API Routes

```typescript
import { assertValidContractAddresses, getContractAddresses } from '@/lib/contracts';

export async function GET() {
  try {
    const addresses = getContractAddresses();
    assertValidContractAddresses(addresses);
    
    return Response.json({ addresses });
  } catch (error) {
    return Response.json(
      { error: error.message },
      { status: 400 }
    );
  }
}
```

## Environment-Specific Deployment

To deploy to different environments:

1. **Development**: Use local addresses and RPC endpoint
2. **Staging**: Deploy contracts to testnet, update staging addresses
3. **Production**: Deploy contracts to mainnet, update production addresses

Update the corresponding environment variables in your deployment configuration.

## Security Considerations

- Always validate contract addresses before use
- Never hardcode addresses in code; use environment variables
- Ensure RPC URLs are from trusted sources
- Validate all user inputs before contract interaction
- Use appropriate gas limits and error handling
- Keep ABIs in sync with deployed contract versions

## Troubleshooting

### Invalid Address Error

```
Error: Invalid EcoReward contract address format
```

**Solution**: Ensure the address is a valid Ethereum address (0x followed by 40 hex characters).

### Zero Address Error

```
Error: EcoReward contract address cannot be zero address
```

**Solution**: Update environment variables with actual deployed contract addresses.

### Contract Not Found

```
Error: Contract address validation failed
```

**Solution**: Verify the contract has been deployed to the configured address on the specified network.

## Related Files

- `.env.example` - Environment variable template
- `contracts/src/EcoReward.sol` - EcoReward contract source
- `contracts/src/EcoVerifier.sol` - EcoVerifier contract source
