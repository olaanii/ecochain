"use client";

import { useEffect, useState } from "react";
import {
  getUserStreakData,
  updateUserStreak,
  getTimeUntilStreakExpires,
  formatTimeUntilStreakExpires,
  StreakData,
} from "@/lib/tasks/streak-manager";

/**
 * Hook for managing user streak data
 * 
 * Requirement 6.1, 6.2, 6.3, 6.4, 6.5, 6.6
 */

export interface UseStreakResult {
  streakData: StreakData | null;
  timeUntilExpiry: string;
  loading: boolean;
  error: string | null;
  refreshStreak: () => Promise<void>;
  updateStreak: () => Promise<void>;
}

export function useStreak(userId: string): UseStreakResult {
  const [streakData, setStreakData] = useState<StreakData | null>(null);
  const [timeUntilExpiry, setTimeUntilExpiry] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadStreakData = async () => {
    try {
      setLoading(true);
      const data = await getUserStreakData(userId);
      setStreakData(data);
      setError(null);

      // Update time until expiry
      if (data.lastTaskCompletedAt) {
        const ms = getTimeUntilStreakExpires(data.lastTaskCompletedAt);
        setTimeUntilExpiry(formatTimeUntilStreakExpires(ms));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load streak data");
    } finally {
      setLoading(false);
    }
  };

  const updateStreak = async () => {
    try {
      const data = await updateUserStreak(userId);
      setStreakData(data);
      setError(null);

      // Update time until expiry
      if (data.lastTaskCompletedAt) {
        const ms = getTimeUntilStreakExpires(data.lastTaskCompletedAt);
        setTimeUntilExpiry(formatTimeUntilStreakExpires(ms));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update streak");
    }
  };

  useEffect(() => {
    loadStreakData();

    // Update time until expiry every minute
    const interval = setInterval(() => {
      if (streakData?.lastTaskCompletedAt) {
        const ms = getTimeUntilStreakExpires(streakData.lastTaskCompletedAt);
        setTimeUntilExpiry(formatTimeUntilStreakExpires(ms));
      }
    }, 60000);

    return () => clearInterval(interval);
  }, [userId]);

  return {
    streakData,
    timeUntilExpiry,
    loading,
    error,
    refreshStreak: loadStreakData,
    updateStreak,
  };
}
