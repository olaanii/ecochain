/**
 * Stake Manager
 * 
 * Manages staking operations including transaction submission,
 * confirmation monitoring, and database updates.
 * 
 * Requirements: 8.4, 8.5, 8.7, 8.9
 */

import { prisma } from "@/lib/prisma/client";
import { STAKING_CONSTANTS } from "@/lib/contracts/staking";

export interface StakeTransactionData {
  userId: string;
  stakeId: string;
  amount: string;
  duration: number;
  apy: number;
  transactionHash: string;
}

export interface StakeStatus {
  stakeId: string;
  status: "pending" | "active" | "withdrawn" | "failed";
  transactionHash?: string;
  confirmations?: number;
  error?: string;
}

/**
 * Submit stake transaction to blockchain
 * 
 * Requirements: 8.4, 8.5
 */
export async function submitStakeTransaction(
  stakeId: string,
  transactionHash: string
): Promise<void> {
  // Update stake record with transaction hash
  await prisma.stake.update({
    where: { id: stakeId },
    data: {
      transactionHash,
      status: "active",
    },
  });
}

/**
 * Monitor stake transaction confirmation
 * 
 * Requirements: 8.4
 */
export async function monitorStakeConfirmation(
  stakeId: string,
  transactionHash: string,
  maxAttempts: number = 30
): Promise<boolean> {
  let attempts = 0;

  while (attempts < maxAttempts) {
    try {
      // In a real implementation, this would check blockchain confirmation
      // For now, we simulate confirmation after a short delay
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Update stake status to confirmed
      await prisma.stake.update({
        where: { id: stakeId },
        data: {
          status: "active",
        },
      });

      return true;
    } catch (error) {
      attempts++;
      if (attempts >= maxAttempts) {
        // Mark stake as failed
        await prisma.stake.update({
          where: { id: stakeId },
          data: {
            status: "failed",
          },
        });
        return false;
      }
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }
  }

  return false;
}

/**
 * Calculate expected rewards for a stake
 * 
 * Requirements: 8.7
 */
export function calculateExpectedRewards(
  amount: bigint,
  durationDays: number,
  apyBasisPoints: number
): bigint {
  const apy = BigInt(apyBasisPoints);
  const days = BigInt(durationDays);
  const yearDays = BigInt(365);

  // Simplified calculation: principal * (apy / 10000) * (days / 365)
  const rewards = (amount * apy * days) / (BigInt(10000) * yearDays);
  return rewards;
}

/**
 * Get stake details with current rewards
 * 
 * Requirements: 8.9
 */
export async function getStakeWithRewards(stakeId: string) {
  const stake = await prisma.stake.findUnique({
    where: { id: stakeId },
    include: {
      user: {
        select: {
          id: true,
          clerkId: true,
          initiaAddress: true,
        },
      },
    },
  });

  if (!stake) {
    return null;
  }

  // Calculate current accrued rewards
  const now = new Date();
  const startTime = new Date(stake.startTime);
  const elapsedMs = now.getTime() - startTime.getTime();
  const elapsedDays = elapsedMs / (1000 * 60 * 60 * 24);

  const apy = BigInt(stake.apy);
  const amount = BigInt(stake.amount);

  // Simplified compound interest: principal * (1 + apy/365)^days
  let accruedRewards = BigInt(0);
  if (elapsedDays > 0) {
    const dailyRate = (amount * apy) / (BigInt(10000) * BigInt(365));
    accruedRewards = dailyRate * BigInt(Math.floor(elapsedDays));
  }

  return {
    ...stake,
    accruedRewards: accruedRewards.toString(),
    elapsedDays: Math.floor(elapsedDays),
    daysRemaining: Math.max(0, stake.duration - Math.floor(elapsedDays)),
    isMature: now >= stake.endTime,
  };
}

/**
 * Get all stakes for a user
 */
export async function getUserStakes(userId: string, status?: string) {
  const where: any = { userId };
  if (status) {
    where.status = status;
  }

  const stakes = await prisma.stake.findMany({
    where,
    orderBy: { createdAt: "desc" },
  });

  // Calculate rewards for each stake
  return Promise.all(
    stakes.map(async (stakeRecord: any) => {
      const now = new Date();
      const startTime = new Date(stakeRecord.startTime);
      const elapsedMs = now.getTime() - startTime.getTime();
      const elapsedDays = elapsedMs / (1000 * 60 * 60 * 24);

      const apy = BigInt(stakeRecord.apy);
      const amount = BigInt(stakeRecord.amount);

      let accruedRewards = BigInt(0);
      if (elapsedDays > 0) {
        const dailyRate = (amount * apy) / (BigInt(10000) * BigInt(365));
        accruedRewards = dailyRate * BigInt(Math.floor(elapsedDays));
      }

      return {
        ...stakeRecord,
        accruedRewards: accruedRewards.toString(),
        elapsedDays: Math.floor(elapsedDays),
        daysRemaining: Math.max(0, stakeRecord.duration - Math.floor(elapsedDays)),
        isMature: now >= stakeRecord.endTime,
      };
    })
  );
}

/**
 * Get total staked amount for a user
 */
export async function getTotalStaked(userId: string): Promise<bigint> {
  const stakes = await prisma.stake.findMany({
    where: {
      userId,
      status: "active",
    },
  });

  let total = BigInt(0);
  for (const stake of stakes) {
    total += BigInt(stake.amount);
  }

  return total;
}

/**
 * Validate stake request
 */
export function validateStakeRequest(
  amount: bigint,
  durationDays: number
): { valid: boolean; error?: string } {
  if (amount < STAKING_CONSTANTS.MINIMUM_STAKE) {
    return {
      valid: false,
      error: `Minimum stake is ${STAKING_CONSTANTS.MINIMUM_STAKE / BigInt(10) ** BigInt(18)} ECO`,
    };
  }

  const validDurations = [30, 90, 180, 365];
  if (!validDurations.includes(durationDays)) {
    return {
      valid: false,
      error: `Valid durations are: ${validDurations.join(", ")} days`,
    };
  }

  return { valid: true };
}
