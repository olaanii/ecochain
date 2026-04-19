/**
 * Bonus Multiplier Calculation
 * 
 * Calculates user bonus multipliers based on:
 * - Streak bonus: +0.01 per day, max +0.3
 * - Category mastery bonus: +0.05 per 10 completions, max +0.2
 * - Cap multiplier at 2.0x
 * 
 * Requirements: 1.5, 5.1, 5.2, 5.3, 5.4
 */

import { prisma } from '@/lib/prisma/client';

export interface BonusMultiplierBreakdown {
  baseMultiplier: number;
  streakBonus: number;
  streakDays: number;
  categoryMasteryBonus: number;
  completionCount: number;
  totalMultiplier: number;
}

/**
 * Calculate streak bonus
 * +0.01 per day, max +0.3
 * 
 * Requirement: 5.1, 5.2
 */
export function calculateStreakBonus(streakDays: number): number {
  const streakBonus = Math.min(streakDays * 0.01, 0.3);
  return streakBonus;
}

/**
 * Calculate category mastery bonus
 * +0.05 per 10 completions, max +0.2
 * 
 * Requirement: 5.3, 5.4
 */
export function calculateCategoryMasteryBonus(completionCount: number): number {
  const masteryBonus = Math.min(Math.floor(completionCount / 10) * 0.05, 0.2);
  return masteryBonus;
}

/**
 * Calculate total bonus multiplier for a user on a specific task
 * 
 * Requirement: 1.5, 5.1, 5.2, 5.3, 5.4
 */
export async function calculateBonusMultiplier(
  userId: string,
  taskId: string,
  category: string
): Promise<BonusMultiplierBreakdown> {
  try {
    // Get user streak days
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { streakDays: true },
    });

    const streakDays = user?.streakDays || 0;
    const streakBonus = calculateStreakBonus(streakDays);

    // Get completion count for this category
    const completionCount = await prisma.verification.count({
      where: {
        userId,
        task: { category },
        status: 'verified',
      },
    });

    const categoryMasteryBonus = calculateCategoryMasteryBonus(completionCount);

    // Calculate total multiplier
    const baseMultiplier = 1.0;
    let totalMultiplier = baseMultiplier + streakBonus + categoryMasteryBonus;

    // Cap at 2.0x
    totalMultiplier = Math.min(totalMultiplier, 2.0);

    return {
      baseMultiplier,
      streakBonus,
      streakDays,
      categoryMasteryBonus,
      completionCount,
      totalMultiplier,
    };
  } catch (error) {
    console.error('[BonusMultiplier] Error calculating bonus:', error);

    // Return default multiplier on error
    return {
      baseMultiplier: 1.0,
      streakBonus: 0,
      streakDays: 0,
      categoryMasteryBonus: 0,
      completionCount: 0,
      totalMultiplier: 1.0,
    };
  }
}

/**
 * Calculate potential reward for a user on a task
 */
export async function calculatePotentialReward(
  userId: string,
  taskId: string,
  baseReward: number,
  category: string
): Promise<{
  baseReward: number;
  multiplier: BonusMultiplierBreakdown;
  potentialReward: number;
}> {
  const multiplier = await calculateBonusMultiplier(userId, taskId, category);
  const potentialReward = Math.floor(baseReward * multiplier.totalMultiplier);

  return {
    baseReward,
    multiplier,
    potentialReward,
  };
}

/**
 * Validate bonus multiplier is within bounds
 * Requirement: 5.2
 */
export function validateBonusMultiplier(multiplier: number): boolean {
  return multiplier >= 1.0 && multiplier <= 2.0;
}
