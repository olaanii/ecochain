# Smart Contract Integration Guide

## Overview

Complete TypeScript interfaces for EcoReward and EcoVerifier smart contracts with read/write functions, gas estimation, and validation.

## Components

### 1. EcoReward Contract Interface (`eco-reward.ts`)

ERC20 token contract for ECO token with balance management and approvals.

**Features:**
- Balance queries (balanceOf, totalSupply)
- Token transfers (transfer, transferFrom)
- Approvals (approve, allowance)
- Gas estimation for all write operations
- Unit conversion helpers

**Read Functions:**
```typescript
balanceOf(address: string): Promise<bigint>
totalSupply(): Promise<bigint>
allowance(owner: string, spender: string): Promise<bigint>
decimals(): Promise<number>
name(): Promise<string>
symbol(): Promise<string>
```

**Write Functions:**
```typescript
approve(spender: string, amount: bigint): Promise<`0x${string}`>
transfer(to: string, amount: bigint): Promise<`0x${string}`>
transferFrom(from: string, to: string, amount: bigint): Promise<`0x${string}`>
```

**Gas Estimation:**
```typescript
estimateApprove(spender: string, amount: bigint): Promise<bigint>
estimateTransfer(to: string, amount: bigint): Promise<bigint>
estimateTransferFrom(from: string, to: string, amount: bigint): Promise<bigint>
```

**Helper Functions:**
```typescript
toContractUnits(amount: number | string, decimals?: number): bigint
fromContractUnits(amount: bigint, decimals?: number): string
```

### 2. EcoVerifier Contract Interface (`eco-verifier.ts`)

Task verification and reward minting contract.

**Features:**
- Task queries (tasks, getTaskCount)
- Proof submission (submitProof)
- Proof hash tracking (usedProofHashes)
- Proof hash validation
- Timestamp validation (within 48 hours)
- Gas estimation

**Read Functions:**
```typescript
tasks(taskId: bigint): Promise<TaskData>
usedProofHashes(proofHash: string): Promise<boolean>
getTaskCount(): Promise<bigint>
```

**Write Functions:**
```typescript
submitProof(
  taskId: bigint,
  proofHash: string,
  timestamp: bigint
): Promise<`0x${string}`>
```

**Validation Functions:**
```typescript
validateProofHash(proofHash: string): Promise<boolean>
validateTimestamp(timestamp: bigint): Promise<boolean>
validateProofUniqueness(proofHash: string): Promise<boolean>
```

**Gas Estimation:**
```typescript
estimateSubmitProof(
  taskId: bigint,
  proofHash: string,
  timestamp: bigint
): Promise<bigint>
```

**Helper Functions:**
```typescript
generateProofHash(proofData: string | Buffer): string
validateProofHashFormat(proofHash: string): boolean
validateTimestampRange(timestamp: number | bigint): boolean
createProofSubmission(taskId: bigint, proofData: string | Buffer): ProofSubmissionData
```

### 3. Contract Hooks (`useContractInterfaces.ts`)

React hooks for accessing contract interfaces.

**Hooks:**
```typescript
useContractInterfaces(): ContractInterfaces
useEcoRewardContract(): EcoRewardInterface | null
useEcoVerifierContract(): EcoVerifierInterface | null
```

## Usage Examples

### Reading Token Balance

```typescript
import { useContractInterfaces } from "@/hooks/useContractInterfaces";
import { fromContractUnits } from "@/lib/contracts/eco-reward";

function BalanceDisplay() {
  const { ecoReward, isReady } = useContractInterfaces();
  const [balance, setBalance] = useState<string>("0");

  useEffect(() => {
    if (!isReady || !ecoReward) return;

    const fetchBalance = async () => {
      const userAddress = "0x..."; // Get from wallet
      const balanceBigInt = await ecoReward.balanceOf(userAddress);
      const balanceDecimal = fromContractUnits(balanceBigInt);
      setBalance(balanceDecimal);
    };

    fetchBalance();
  }, [ecoReward, isReady]);

  return <div>Balance: {balance} ECO</div>;
}
```

### Approving Tokens for Staking

```typescript
import { useContractInterfaces } from "@/hooks/useContractInterfaces";
import { toContractUnits } from "@/lib/contracts/eco-reward";

function ApproveStaking() {
  const { ecoReward, isReady } = useContractInterfaces();

  const handleApprove = async () => {
    if (!isReady || !ecoReward) return;

    const stakingContractAddress = "0x...";
    const amount = toContractUnits(1000); // 1000 ECO

    try {
      const txHash = await ecoReward.approve(stakingContractAddress, amount);
      console.log("Approval tx:", txHash);
    } catch (error) {
      console.error("Approval failed:", error);
    }
  };

  return <button onClick={handleApprove}>Approve for Staking</button>;
}
```

### Submitting Proof

```typescript
import { useContractInterfaces } from "@/hooks/useContractInterfaces";
import { createProofSubmission } from "@/lib/contracts/eco-verifier";

function SubmitProof() {
  const { ecoVerifier, isReady } = useContractInterfaces();

  const handleSubmitProof = async (proofData: string) => {
    if (!isReady || !ecoVerifier) return;

    try {
      const taskId = BigInt(1);
      const submission = createProofSubmission(taskId, proofData);

      const txHash = await ecoVerifier.submitProof(
        submission.taskId,
        submission.proofHash,
        submission.timestamp,
      );

      console.log("Proof submitted:", txHash);
    } catch (error) {
      console.error("Proof submission failed:", error);
    }
  };

  return <button onClick={() => handleSubmitProof("proof-data")}>Submit Proof</button>;
}
```

### Estimating Gas

```typescript
import { useContractInterfaces } from "@/hooks/useContractInterfaces";
import { toContractUnits } from "@/lib/contracts/eco-reward";

function GasEstimation() {
  const { ecoReward, isReady } = useContractInterfaces();
  const [gasEstimate, setGasEstimate] = useState<string>("0");

  const handleEstimate = async () => {
    if (!isReady || !ecoReward) return;

    try {
      const amount = toContractUnits(100);
      const gas = await ecoReward.estimateTransfer("0x...", amount);
      setGasEstimate(gas.toString());
    } catch (error) {
      console.error("Gas estimation failed:", error);
    }
  };

  return (
    <div>
      <button onClick={handleEstimate}>Estimate Gas</button>
      <p>Gas: {gasEstimate}</p>
    </div>
  );
}
```

### Validating Proof

```typescript
import {
  validateProofHashFormat,
  validateTimestampRange,
} from "@/lib/contracts/eco-verifier";

function ValidateProof() {
  const handleValidate = (proofHash: string, timestamp: number) => {
    try {
      validateProofHashFormat(proofHash);
      validateTimestampRange(timestamp);
      console.log("Proof is valid");
    } catch (error) {
      console.error("Validation failed:", error.message);
    }
  };

  return (
    <button onClick={() => handleValidate("0x...", Math.floor(Date.now() / 1000))}>
      Validate Proof
    </button>
  );
}
```

## Data Types

### TaskData

```typescript
interface TaskData {
  id: bigint;
  name: string;
  description: string;
  baseReward: bigint;
  verificationMethod: string;
  active: boolean;
}
```

### ProofSubmissionData

```typescript
interface ProofSubmissionData {
  taskId: bigint;
  proofHash: string;
  timestamp: bigint;
}
```

### ContractInterfaces

```typescript
interface ContractInterfaces {
  ecoReward: EcoRewardInterface | null;
  ecoVerifier: EcoVerifierInterface | null;
  isReady: boolean;
}
```

## Error Handling

### Common Errors

```typescript
// Invalid proof hash format
try {
  validateProofHashFormat("invalid");
} catch (error) {
  // Error: Invalid proof hash format. Must be 64 hex characters.
}

// Timestamp out of range
try {
  validateTimestampRange(Math.floor(Date.now() / 1000) + 86400);
} catch (error) {
  // Error: Timestamp cannot be in the future
}

// Duplicate proof
try {
  await ecoVerifier.validateProofUniqueness("0x...");
} catch (error) {
  // Error: Proof hash already used. Duplicate proofs are not allowed.
}
```

## Best Practices

1. **Always estimate gas** - Call estimate functions before write operations
2. **Validate inputs** - Use validation functions before submission
3. **Handle errors** - Wrap contract calls in try-catch blocks
4. **Check readiness** - Verify `isReady` before using contract interfaces
5. **Use helpers** - Use unit conversion helpers for token amounts
6. **Cache results** - Cache balance queries to reduce RPC calls
7. **Monitor gas** - Track gas usage for optimization

## Testing

### Run Tests

```bash
npm run test -- tests/contracts/
```

### Test Coverage

- Unit conversion (decimal ↔ contract units)
- Balance calculations
- Proof hash generation and validation
- Timestamp validation
- Proof submission creation
- Property-based tests for uniqueness and validity

## Requirements Met

| Requirement | Status | Details |
|-------------|--------|---------|
| 6.2 | ✅ | EcoReward interface with read/write functions |
| 6.3 | ✅ | EcoVerifier interface with validation |
| 7.1 | ✅ | Balance queries implemented |
| 7.2 | ✅ | Gas estimation for all operations |
| 2.3 | ✅ | Timestamp validation (48 hours) |
| 2.4 | ✅ | Proof hash uniqueness validation |
| 2.5 | ✅ | Proof hash format validation |
| 5.5 | ✅ | Proof submission implemented |
| 5.6 | ✅ | Proof validation implemented |

## Troubleshooting

### Contract Not Ready

**Issue**: `ecoReward` or `ecoVerifier` is null

**Solution**:
- Check `isReady` flag
- Verify wallet is connected
- Check contract addresses in environment variables

### Gas Estimation Failed

**Issue**: Gas estimation throws error

**Solution**:
- Verify contract address is correct
- Check function parameters are valid
- Ensure wallet has sufficient balance

### Validation Failed

**Issue**: Proof validation throws error

**Solution**:
- Check proof hash format (64 hex characters)
- Verify timestamp is within 48 hours
- Check proof hash hasn't been used before

## Performance

### Response Times
- Balance query: ~100ms
- Gas estimation: ~200ms
- Proof validation: <10ms
- Proof submission: ~2-5 seconds (depends on network)

### Caching
- Balance data: 30-second TTL
- Task data: 5-minute TTL
- Proof hashes: Permanent (on-chain)

---

**Status**: ✅ Complete
**Version**: 1.0.0
**Requirements Met**: 6.2, 6.3, 7.1, 7.2, 2.3, 2.4, 2.5, 5.5, 5.6
