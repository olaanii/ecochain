/**
 * GET /api/analytics/metrics
 * Real-time platform metrics aggregated from Prisma.
 * Cached briefly in Redis to protect the DB when multiple dashboards poll.
 */

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma/client";
import { redis } from "@/lib/redis/client";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const CACHE_KEY = "analytics:metrics:v1";
const CACHE_TTL_SECONDS = 30;

interface MetricsResponse {
  totals: {
    co2OffsetKg: number;
    /** Total registered users across all time. */
    totalUsers: number;
    /** Distinct users with a verified submission in the last 30 days. */
    activeUsers30d: number;
    verificationsThisMonth: number;
    treasuryBalance: number;
    /** Tasks currently marked `active: true`. */
    activeTasks: number;
  };
  trends: {
    co2Offset: { label: string; value: number }[]; // last 30 days cumulative
    userGrowth: { label: string; value: number }[]; // last 12 weeks
    categoryBreakdown: { label: string; value: number }[];
    dailyActivity: { label: string; value: number }[]; // last 14 days
  };
  updatedAt: string;
}

async function computeMetrics(): Promise<MetricsResponse> {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
  const twelveWeeksAgo = new Date(now.getTime() - 12 * 7 * 24 * 60 * 60 * 1000);

  const [
    verifiedAgg,
    totalUsers,
    verificationsThisMonth,
    treasuryAgg,
    activeTasks,
    recentVerifications,
    recentUsers,
    categoryGroup,
    activeUsers30dGroup,
  ] = await Promise.all([
    prisma.verification.aggregate({
      where: { status: "verified" },
      _sum: { reward: true },
      _count: true,
    }),
    prisma.user.count(),
    prisma.verification.count({
      where: { status: "verified", verifiedAt: { gte: monthStart } },
    }),
    prisma.ledgerEntry.aggregate({
      where: { type: { in: ["mint", "reward"] } },
      _sum: { amount: true },
    }),
    prisma.task.count({ where: { active: true } }),
    prisma.verification.findMany({
      where: { status: "verified", verifiedAt: { gte: thirtyDaysAgo } },
      select: { verifiedAt: true, reward: true, task: { select: { category: true } } },
      orderBy: { verifiedAt: "asc" },
    }),
    prisma.user.findMany({
      where: { createdAt: { gte: twelveWeeksAgo } },
      select: { createdAt: true },
      orderBy: { createdAt: "asc" },
    }),
    prisma.verification.groupBy({
      by: ["taskId"],
      where: { status: "verified", verifiedAt: { gte: thirtyDaysAgo } },
      _count: true,
    }),
    prisma.verification.groupBy({
      by: ["userId"],
      where: { status: "verified", verifiedAt: { gte: thirtyDaysAgo } },
      _count: true,
    }),
  ]);
  const activeUsers30d = activeUsers30dGroup.length;

  type VerificationRow = { verifiedAt: Date; reward: number; task: { category: string } | null };
  type UserRow = { createdAt: Date };
  const verifRows = recentVerifications as VerificationRow[];
  const userRows = recentUsers as UserRow[];

  // Build CO2 cumulative over last 30 days (reward used as proxy kg offset).
  const co2Offset: { label: string; value: number }[] = [];
  let cumulative = 0;
  for (let i = 29; i >= 0; i--) {
    const day = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    const key = day.toISOString().slice(0, 10);
    const dayTotal = verifRows
      .filter((v) => v.verifiedAt.toISOString().slice(0, 10) === key)
      .reduce((s, v) => s + v.reward, 0);
    cumulative += dayTotal;
    co2Offset.push({ label: key.slice(5), value: cumulative });
  }

  // User growth per week
  const userGrowth: { label: string; value: number }[] = [];
  let running = Math.max(0, totalUsers - userRows.length);
  for (let w = 11; w >= 0; w--) {
    const wkStart = new Date(now.getTime() - (w + 1) * 7 * 24 * 60 * 60 * 1000);
    const wkEnd = new Date(now.getTime() - w * 7 * 24 * 60 * 60 * 1000);
    const added = userRows.filter((u) => u.createdAt >= wkStart && u.createdAt < wkEnd).length;
    running += added;
    userGrowth.push({ label: `W${12 - w}`, value: running });
  }

  // Daily activity: verifications per day for last 14 days
  const dailyActivity: { label: string; value: number }[] = [];
  for (let i = 13; i >= 0; i--) {
    const day = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    const key = day.toISOString().slice(0, 10);
    const count = verifRows.filter(
      (v) => v.verifiedAt.toISOString().slice(0, 10) === key && v.verifiedAt >= fourteenDaysAgo,
    ).length;
    dailyActivity.push({ label: key.slice(5), value: count });
  }

  // Category breakdown
  const categoryMap = new Map<string, number>();
  for (const v of verifRows) {
    const cat = v.task?.category ?? "other";
    categoryMap.set(cat, (categoryMap.get(cat) ?? 0) + 1);
  }
  const categoryBreakdown = Array.from(categoryMap.entries())
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value);

  return {
    totals: {
      co2OffsetKg: verifiedAgg._sum.reward ?? 0,
      totalUsers,
      activeUsers30d,
      verificationsThisMonth,
      treasuryBalance: treasuryAgg._sum.amount ?? 0,
      activeTasks,
    },
    trends: {
      co2Offset,
      userGrowth,
      categoryBreakdown,
      dailyActivity,
    },
    updatedAt: now.toISOString(),
  };
}

export async function GET() {
  try {
    const cached = await redis.get(CACHE_KEY).catch(() => null);
    if (cached) {
      return NextResponse.json({ success: true, data: JSON.parse(cached), cached: true });
    }

    const metrics = await computeMetrics();
    await redis.setex(CACHE_KEY, CACHE_TTL_SECONDS, JSON.stringify(metrics)).catch(() => undefined);
    return NextResponse.json({ success: true, data: metrics, cached: false });
  } catch (err) {
    console.error("[analytics] metrics error", err);
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : "unknown" },
      { status: 500 },
    );
  }
}
