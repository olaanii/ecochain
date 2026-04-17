/**
 * Staking Contract Interface
 * 
 * TypeScript interface and utilities for interacting with the Staking smart contract
 * Requirements: 8.1, 8.2, 8.3, 8.4, 8.6, 8.8, 9.1, 9.3, 10.1, 10.2, 10.3, 10.4
 */

import { Address, PublicClient, WalletClient } from "viem";

// ============ Types ============

export interface StakeDetails {
  stakeId: bigint;
  staker: Address;
  amount: bigint;
  startTime: bigint;
  duration: bigint; // in days
  endTime: bigint;
  apy: bigint; // in basis points (e.g., 500 = 5%)
  accruedRewards: bigint;
  withdrawn: boolean;
  withdrawalTime: bigint;
  withdrawalAmount: bigint;
}

export interface StakeRequest {
  amount: bigint;
  durationDays: 30 | 90 | 180 | 365;
}

export interface UnstakeRequest {
  stakeId: bigint;
}

export interface StakeResponse {
  stakeId: bigint;
  transactionHash: string;
  amount: bigint;
  duration: number;
  apy: number;
  endTime: bigint;
}

export interface UnstakeResponse {
  stakeId: bigint;
  transactionHash: string;
  principal: bigint;
  rewards: bigint;
  penalty: bigint;
  totalAmount: bigint;
  earlyWithdrawal: boolean;
}

// ============ Constants ============

export const STAKING_CONSTANTS = {
  MINIMUM_STAKE: BigInt(100) * BigInt(10) ** BigInt(18), // 100 ECO
  EARLY_WITHDRAWAL_PENALTY: 10, // 10%
  PENALTY_DENOMINATOR: 100,
  DAYS_PER_YEAR: 365,
  
  // APY rates in basis points
  APY_30_DAYS: 500,   // 5%
  APY_90_DAYS: 800,   // 8%
  APY_180_DAYS: 1200, // 12%
  APY_365_DAYS: 1800, // 18%
} as const;

export const VALID_DURATIONS = [30, 90, 180, 365] as const;

// ============ ABI ============

export const STAKING_ABI = [
  {
    type: "function",
    name: "stake",
    inputs: [
      { name: "amount", type: "uint256" },
      { name: "durationDays", type: "uint256" },
    ],
    outputs: [{ name: "stakeId", type: "uint256" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "unstake",
    inputs: [{ name: "stakeId", type: "uint256" }],
    outputs: [{ name: "totalAmount", type: "uint256" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "calculateAccruedRewards",
    inputs: [{ name: "stakeId", type: "uint256" }],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getAPYForDuration",
    inputs: [{ name: "durationDays", type: "uint256" }],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "pure",
  },
  {
    type: "function",
    name: "getUserStakes",
    inputs: [{ name: "user", type: "address" }],
    outputs: [{ name: "", type: "uint256[]" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getStakeDetails",
    inputs: [{ name: "stakeId", type: "uint256" }],
    outputs: [
      {
        name: "",
        type: "tuple",
        components: [
          { name: "stakeId", type: "uint256" },
          { name: "staker", type: "address" },
          { name: "amount", type: "uint256" },
          { name: "startTime", type: "uint256" },
          { name: "duration", type: "uint256" },
          { name: "endTime", type: "uint256" },
          { name: "apy", type: "uint256" },
          { name: "accruedRewards", type: "uint256" },
          { name: "withdrawn", type: "bool" },
          { name: "withdrawalTime", type: "uint256" },
          { name: "withdrawalAmount", type: "uint256" },
        ],
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getAccruedRewards",
    inputs: [{ name: "stakeId", type: "uint256" }],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getTotalStaked",
    inputs: [{ name: "user", type: "address" }],
    outputs: [{ name: "total", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "emergencyPause",
    inputs: [],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "emergencyUnpause",
    inputs: [],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "event",
    name: "Staked",
    inputs: [
      { name: "stakeId", type: "uint256", indexed: true },
      { name: "staker", type: "address", indexed: true },
      { name: "amount", type: "uint256" },
      { name: "duration", type: "uint256" },
      { name: "apy", type: "uint256" },
      { name: "endTime", type: "uint256" },
    ],
  },
  {
    type: "event",
    name: "Unstaked",
    inputs: [
      { name: "stakeId", type: "uint256", indexed: true },
      { name: "staker", type: "address", indexed: true },
      { name: "principal", type: "uint256" },
      { name: "rewards", type: "uint256" },
      { name: "penalty", type: "uint256" },
      { name: "totalAmount", type: "uint256" },
      { name: "earlyWithdrawal", type: "bool" },
    ],
  },
] as const;

// ============ Utility Functions ============

/**
 * Validate stake request
 */
export function validateStakeRequest(request: StakeRequest): {
  valid: boolean;
  error?: string;
} {
  if (request.amount < STAKING_CONSTANTS.MINIMUM_STAKE) {
    return {
      valid: false,
      error: `Minimum stake is ${STAKING_CONSTANTS.MINIMUM_STAKE / BigInt(10) ** BigInt(18)} ECO`,
    };
  }

  if (!VALID_DURATIONS.includes(request.durationDays)) {
    return {
      valid: false,
      error: `Valid durations are: ${VALID_DURATIONS.join(", ")} days`,
    };
  }

  return { valid: true };
}

/**
 * Get APY percentage for a duration
 */
export function getAPYPercentage(durationDays: number): number {
  switch (durationDays) {
    case 30:
      return STAKING_CONSTANTS.APY_30_DAYS / 100;
    case 90:
      return STAKING_CONSTANTS.APY_90_DAYS / 100;
    case 180:
      return STAKING_CONSTANTS.APY_180_DAYS / 100;
    case 365:
      return STAKING_CONSTANTS.APY_365_DAYS / 100;
    default:
      throw new Error("Invalid duration");
  }
}

/**
 * Calculate expected rewards (simplified, for UI estimation)
 * Note: Actual rewards are calculated on-chain with compound interest
 */
export function estimateRewards(
  principal: bigint,
  durationDays: number,
  apyBasisPoints: number
): bigint {
  const apy = BigInt(apyBasisPoints);
  const days = BigInt(durationDays);
  const yearDays = BigInt(365);

  // Simplified calculation: principal * (apy / 10000) * (days / 365)
  const rewards = (principal * apy * days) / (BigInt(10000) * yearDays);
  return rewards;
}

/**
 * Calculate early withdrawal penalty
 */
export function calculatePenalty(amount: bigint): bigint {
  return (amount * BigInt(STAKING_CONSTANTS.EARLY_WITHDRAWAL_PENALTY)) /
    BigInt(STAKING_CONSTANTS.PENALTY_DENOMINATOR);
}

/**
 * Format stake details for display
 */
export function formatStakeDetails(details: StakeDetails) {
  return {
    stakeId: details.stakeId.toString(),
    staker: details.staker,
    amount: details.amount.toString(),
    startTime: new Date(Number(details.startTime) * 1000),
    duration: Number(details.duration),
    endTime: new Date(Number(details.endTime) * 1000),
    apy: Number(details.apy) / 100, // Convert basis points to percentage
    accruedRewards: details.accruedRewards.toString(),
    withdrawn: details.withdrawn,
    withdrawalTime: details.withdrawalTime > 0n
      ? new Date(Number(details.withdrawalTime) * 1000)
      : null,
    withdrawalAmount: details.withdrawalAmount.toString(),
  };
}

/**
 * Check if stake is mature
 */
export function isStakeMature(endTime: bigint): boolean {
  return BigInt(Math.floor(Date.now() / 1000)) >= endTime;
}

/**
 * Get days remaining until maturity
 */
export function getDaysRemaining(endTime: bigint): number {
  const now = BigInt(Math.floor(Date.now() / 1000));
  if (now >= endTime) return 0;

  const secondsRemaining = endTime - now;
  return Number(secondsRemaining / BigInt(86400)); // 86400 seconds per day
}
