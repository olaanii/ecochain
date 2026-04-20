# Smart Contract Integration - Quick Start Guide

## Installation & Setup

### 1. Environment Configuration

Add these variables to your `.env.local` file:

```env
NEXT_PUBLIC_ENVIRONMENT=dev

# For Development
NEXT_PUBLIC_ECO_REWARD_ADDRESS_DEV=0x1234567890123456789012345678901234567890
NEXT_PUBLIC_ECO_VERIFIER_ADDRESS_DEV=0x0987654321098765432109876543210987654321
NEXT_PUBLIC_RPC_URL_DEV=http://localhost:8545
NEXT_PUBLIC_CHAIN_ID_DEV=31337
```

### 2. Basic Usage

```typescript
import { initializeContractClient } from '@/lib/contracts';

// Initialize the contract client
const client = initializeContractClient();

// Use in your component or API route
console.log(client.ecoRewardAddress);
console.log(client.ecoVerifierAddress);
console.log(client.rpcUrl);
```

## Common Tasks

### Get Contract Addresses

```typescript
import { getContractAddresses } from '@/lib/contracts';

const { ecoReward, ecoVerifier } = getContractAddresses();
```

### Get Contract ABIs

```typescript
import { getEcoRewardABI, getEcoVerifierABI } from '@/lib/contracts';

const ecoRewardABI = getEcoRewardABI();
const ecoVerifierABI = getEcoVerifierABI();
```

### Validate Addresses

```typescript
import { validateContractAddresses } from '@/lib/contracts';

const validation = validateContractAddresses({
  ecoReward: '0x...',
  ecoVerifier: '0x...',
});

if (!validation.valid) {
  console.error('Validation errors:', validation.errors);
}
```

### Assert Valid Addresses (Throws on Error)

```typescript
import { assertValidContractAddresses } from '@/lib/contracts';

try {
  assertValidContractAddresses({
    ecoReward: '0x...',
    ecoVerifier: '0x...',
  });
  // Addresses are valid
} catch (error) {
  console.error('Invalid addresses:', error.message);
}
```

## Integration with ethers.js

```typescript
import { ethers } from 'ethers';
import { initializeContractClient } from '@/lib/contracts';

const client = initializeContractClient();

// Create provider
const provider = new ethers.JsonRpcProvider(client.rpcUrl);

// Create contract instance
const ecoRewardContract = new ethers.Contract(
  client.ecoRewardAddress,
  client.ecoRewardABI,
  provider
);

// Read from contract
const balance = await ecoRewardContract.balanceOf(userAddress);
console.log('Balance:', balance.toString());
```

## Integration with viem

```typescript
import { createPublicClient, http } from 'viem';
import { initializeContractClient } from '@/lib/contracts';

const client = initializeContractClient();

// Create public client
const publicClient = createPublicClient({
  transport: http(client.rpcUrl),
});

// Read from contract
const balance = await publicClient.readContract({
  address: client.ecoRewardAddress,
  abi: client.ecoRewardABI,
  functionName: 'balanceOf',
  args: [userAddress],
});
```

## Environment Switching

### Development
```env
NEXT_PUBLIC_ENVIRONMENT=dev
```

### Staging
```env
NEXT_PUBLIC_ENVIRONMENT=staging
```

### Production
```env
NEXT_PUBLIC_ENVIRONMENT=prod
```

## Troubleshooting

### "Invalid address format" Error

**Problem**: Address doesn't match Ethereum format
**Solution**: Ensure address is 0x followed by 40 hex characters

```typescript
// ❌ Wrong
'0x123'  // Too short
'123456789012345678901234567890123456789'  // Missing 0x

// ✅ Correct
'0x1234567890123456789012345678901234567890'
```

### "Zero address" Error

**Problem**: Address is the zero address
**Solution**: Update environment variables with actual deployed contract addresses

```typescript
// ❌ Wrong
'0x0000000000000000000000000000000000000000'

// ✅ Correct
'0x1234567890123456789012345678901234567890'
```

### "Contract address validation failed" Error

**Problem**: Multiple validation errors
**Solution**: Check all contract addresses are valid and different

```typescript
import { validateContractAddresses } from '@/lib/contracts';

const validation = validateContractAddresses({
  ecoReward: '0x...',
  ecoVerifier: '0x...',
});

validation.errors.forEach(error => console.log(error));
```

## Next Steps

1. Deploy EcoReward and EcoVerifier contracts
2. Update environment variables with deployed addresses
3. Test contract client with actual contracts
4. Implement contract interfaces (see Task 6.2, 6.3)
5. Integrate with wallet connection (see Task 5)

## Related Documentation

- [Full Documentation](./README.md)
- [Configuration Guide](./README.md#configuration)
- [Validation Guide](./README.md#validation)
- [Usage Examples](./README.md#usage-examples)
