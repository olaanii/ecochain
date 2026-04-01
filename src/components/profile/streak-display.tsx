"use client";

import React, { useEffect, useState } from "react";
import { Flame, Clock } from "lucide-react";
import {
  getUserStreakData,
  formatTimeUntilStreakExpires,
  getTimeUntilStreakExpires,
  getStreakMilestone,
  StreakData,
} from "@/lib/tasks/streak-manager";

/**
 * Streak Display Component
 * 
 * Requirement 6.5, 6.6
 * - Show current streak days
 * - Display streak bonus contribution to multiplier
 */

interface StreakDisplayProps {
  userId: string;
  compact?: boolean;
}

export function StreakDisplay({ userId, compact = false }: StreakDisplayProps) {
  const [streakData, setStreakData] = useState<StreakData | null>(null);
  const [timeUntilExpiry, setTimeUntilExpiry] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
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

  if (loading) {
    return <div className="text-sm text-slate-400">Loading streak...</div>;
  }

  if (error) {
    return <div className="text-sm text-red-500">{error}</div>;
  }

  if (!streakData) {
    return null;
  }

  const milestone = getStreakMilestone(streakData.currentStreak);
  const bonusPercentage = Math.round(streakData.streakBonusMultiplier * 100);

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <Flame className="h-4 w-4 text-orange-500" />
        <span className="text-sm font-semibold text-orange-500">
          {streakData.currentStreak} day{streakData.currentStreak !== 1 ? "s" : ""}
        </span>
        {streakData.isStreakActive && (
          <span className="text-xs text-slate-400">({timeUntilExpiry})</span>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4 p-4 bg-gradient-to-br from-orange-50 to-red-50 rounded-lg border border-orange-200">
      {/* Streak Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-orange-100 rounded-lg">
            <Flame className="h-6 w-6 text-orange-500" />
          </div>
          <div>
            <div className="text-3xl font-bold text-orange-600">
              {streakData.currentStreak}
            </div>
            <div className="text-sm text-slate-600">
              day{streakData.currentStreak !== 1 ? "s" : ""} streak
            </div>
          </div>
        </div>

        {streakData.isStreakActive && (
          <div className="text-right">
            <div className="flex items-center gap-1 text-sm text-slate-600">
              <Clock className="h-4 w-4" />
              {timeUntilExpiry}
            </div>
            <div className="text-xs text-slate-500">until expiry</div>
          </div>
        )}
      </div>

      {/* Bonus Multiplier */}
      <div className="bg-white rounded-lg p-3 space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-slate-700">Streak Bonus</span>
          <span className="text-sm font-semibold text-orange-600">
            +{bonusPercentage}%
          </span>
        </div>
        <div className="w-full bg-slate-200 rounded-full h-2">
          <div
            className="bg-gradient-to-r from-orange-400 to-red-500 h-2 rounded-full transition-all"
            style={{ width: `${Math.min(streakData.streakBonusMultiplier * 100, 100)}%` }}
          />
        </div>
        <div className="text-xs text-slate-500">
          Multiplier: 1.0x + {streakData.streakBonusMultiplier.toFixed(2)}x
        </div>
      </div>

      {/* Milestone Progress */}
      <div className="bg-white rounded-lg p-3 space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-slate-700">Next Milestone</span>
          <span className="text-sm font-semibold text-slate-600">
            {milestone.nextMilestone} days
          </span>
        </div>
        <div className="w-full bg-slate-200 rounded-full h-2">
          <div
            className="bg-blue-500 h-2 rounded-full transition-all"
            style={{ width: `${milestone.progress}%` }}
          />
        </div>
        <div className="text-xs text-slate-500">
          {milestone.progress}% progress to {milestone.nextMilestone} day milestone
        </div>
      </div>

      {/* Status */}
      {!streakData.isStreakActive && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
          <div className="text-sm text-yellow-800">
            ⚠️ Streak expired. Complete a task within 24 hours to restart.
          </div>
        </div>
      )}
    </div>
  );
}
