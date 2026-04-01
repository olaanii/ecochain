import { prisma } from "@/lib/prisma/client";

/**
 * User Streak Tracking
 * 
 * Requirement 6.1, 6.2, 6.3, 6.4, 6.5, 6.6
 * - Check if last task was within 24 hours
 * - Increment streak if within 24 hours
 * - Reset streak to 1 if more than 24 hours
 * - Update user streak immediately after verification
 * - Display streak in user profile
 * - Display streak bonus contribution to multiplier
 */

const TWENTY_FOUR_HOURS_MS = 24 * 60 * 60 * 1000;

export interface StreakData {
  currentStreak: number;
  lastTaskCompletedAt: Date | null;
  streakBonusMultiplier: number;
  isStreakActive: boolean;
}

/**
 * Get user's current streak data
 * @param userId - User ID
 * @returns Streak data including current streak, last task time, and bonus multiplier
 */
export async function getUserStreakData(userId: string): Promise<StreakData> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      streakDays: true,
      verifications: {
        where: { status: "verified" },
        orderBy: { verifiedAt: "desc" },
        take: 1,
        select: { verifiedAt: true },
      },
    },
  });

  if (!user) {
    throw new Error("User not found");
  }

  const lastTaskCompletedAt = user.verifications[0]?.verifiedAt || null;
  const currentStreak = user.streakDays || 0;
  const isStreakActive = isStreakStillActive(lastTaskCompletedAt);
  const streakBonusMultiplier = calculateStreakBonus(currentStreak);

  return {
    currentStreak,
    lastTaskCompletedAt,
    streakBonusMultiplier,
    isStreakActive,
  };
}

/**
 * Update user streak after task completion
 * @param userId - User ID
 * @param verificationTime - Time of verification completion
 * @returns Updated streak data
 */
export async function updateUserStreak(
  userId: string,
  verificationTime: Date = new Date(),
): Promise<StreakData> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      streakDays: true,
      verifications: {
        where: { status: "verified" },
        orderBy: { verifiedAt: "desc" },
        take: 2,
        select: { verifiedAt: true },
      },
    },
  });

  if (!user) {
    throw new Error("User not found");
  }

  let newStreak = 1;

  // Check if there's a previous verification
  if (user.verifications.length > 0) {
    const lastVerification = user.verifications[0];
    const timeSinceLastTask = verificationTime.getTime() - lastVerification.verifiedAt.getTime();

    // If last task was within 24 hours, increment streak
    if (timeSinceLastTask <= TWENTY_FOUR_HOURS_MS) {
      newStreak = (user.streakDays || 0) + 1;
    } else {
      // Reset streak to 1 if more than 24 hours
      newStreak = 1;
    }
  }

  // Update user streak in database
  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: { streakDays: newStreak },
    select: {
      streakDays: true,
      verifications: {
        where: { status: "verified" },
        orderBy: { verifiedAt: "desc" },
        take: 1,
        select: { verifiedAt: true },
      },
    },
  });

  const lastTaskCompletedAt = updatedUser.verifications[0]?.verifiedAt || null;
  const streakBonusMultiplier = calculateStreakBonus(newStreak);
  const isStreakActive = isStreakStillActive(lastTaskCompletedAt);

  return {
    currentStreak: newStreak,
    lastTaskCompletedAt,
    streakBonusMultiplier,
    isStreakActive,
  };
}

/**
 * Calculate streak bonus multiplier
 * Requirement 6.5: Show current streak days
 * Requirement 6.6: Display streak bonus contribution to multiplier
 * 
 * Formula: +0.01 per day, max +0.3
 * @param streakDays - Number of consecutive days
 * @returns Bonus multiplier contribution (0.0 to 0.3)
 */
export function calculateStreakBonus(streakDays: number): number {
  if (streakDays <= 0) return 0;
  
  // +0.01 per day, max +0.3 (30 days)
  const bonus = Math.min(streakDays * 0.01, 0.3);
  return bonus;
}

/**
 * Check if streak is still active (last task within 24 hours)
 * @param lastTaskCompletedAt - Timestamp of last completed task
 * @returns True if streak is active, false otherwise
 */
export function isStreakStillActive(lastTaskCompletedAt: Date | null): boolean {
  if (!lastTaskCompletedAt) return false;

  const now = new Date();
  const timeSinceLastTask = now.getTime() - lastTaskCompletedAt.getTime();

  return timeSinceLastTask <= TWENTY_FOUR_HOURS_MS;
}

/**
 * Get time until streak expires
 * @param lastTaskCompletedAt - Timestamp of last completed task
 * @returns Milliseconds until streak expires, or 0 if already expired
 */
export function getTimeUntilStreakExpires(lastTaskCompletedAt: Date | null): number {
  if (!lastTaskCompletedAt) return 0;

  const now = new Date();
  const timeSinceLastTask = now.getTime() - lastTaskCompletedAt.getTime();
  const timeUntilExpiry = TWENTY_FOUR_HOURS_MS - timeSinceLastTask;

  return Math.max(0, timeUntilExpiry);
}

/**
 * Format time until streak expires as human-readable string
 * @param milliseconds - Milliseconds until expiry
 * @returns Formatted string (e.g., "23h 45m")
 */
export function formatTimeUntilStreakExpires(milliseconds: number): string {
  if (milliseconds <= 0) return "Expired";

  const hours = Math.floor(milliseconds / (60 * 60 * 1000));
  const minutes = Math.floor((milliseconds % (60 * 60 * 1000)) / (60 * 1000));

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
}

/**
 * Get streak milestone information
 * @param streakDays - Current streak days
 * @returns Milestone information
 */
export function getStreakMilestone(streakDays: number): {
  milestone: number;
  nextMilestone: number;
  progress: number;
} {
  const milestones = [7, 14, 30, 60, 100];
  
  let currentMilestone = 0;
  let nextMilestone = milestones[0];

  for (const milestone of milestones) {
    if (streakDays >= milestone) {
      currentMilestone = milestone;
    } else {
      nextMilestone = milestone;
      break;
    }
  }

  const progress = currentMilestone > 0 
    ? Math.round(((streakDays - currentMilestone) / (nextMilestone - currentMilestone)) * 100)
    : Math.round((streakDays / nextMilestone) * 100);

  return {
    milestone: currentMilestone,
    nextMilestone,
    progress: Math.min(progress, 100),
  };
}
