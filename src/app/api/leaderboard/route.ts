/**
 * GET /api/leaderboard
 *
 * Query: ?scope=all|weekly|monthly&page=1&limit=50&region=eu
 * Returns ranked users and, if `userId` is supplied, the caller's rank.
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma/client";
import { redis } from "@/lib/redis/client";
import { z } from "zod";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const QuerySchema = z.object({
  scope: z.enum(["all", "weekly", "monthly"]).default("all"),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(50),
  region: z.string().optional(),
  userId: z.string().optional(),
});

interface LeaderRow {
  rank: number;
  userId: string;
  name: string;
  score: number;
  level: number;
  streakDays: number;
  region: string | null;
}

export async function GET(request: NextRequest) {
  try {
    const params = QuerySchema.parse(Object.fromEntries(request.nextUrl.searchParams));
    const cacheKey = `leaderboard:${params.scope}:${params.region ?? "all"}:${params.page}:${params.limit}`;
    const cached = await redis.get(cacheKey).catch(() => null);
    if (cached) {
      const parsed = JSON.parse(cached);
      // still compute user rank live if requested
      if (params.userId) {
        parsed.userRank = await resolveUserRank(params);
      }
      return NextResponse.json({ success: true, data: parsed, cached: true });
    }

    const rows = await loadLeaderboard(params);
    const totalPayload = {
      scope: params.scope,
      region: params.region ?? null,
      page: params.page,
      limit: params.limit,
      rows,
    };

    await redis.setex(cacheKey, 15, JSON.stringify(totalPayload)).catch(() => undefined);

    const data = params.userId
      ? { ...totalPayload, userRank: await resolveUserRank(params) }
      : totalPayload;

    return NextResponse.json({ success: true, data, cached: false });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: "invalid_params", details: err.errors }, { status: 400 });
    }
    console.error("[leaderboard] error", err);
    return NextResponse.json({ success: false, error: "internal" }, { status: 500 });
  }
}

type UserLite = {
  id: string;
  displayName: string | null;
  username: string | null;
  totalRewards: number;
  level: number;
  streakDays: number;
  region: string | null;
};

type GroupAgg = { userId: string; _sum: { reward: number | null } };

async function loadLeaderboard(params: z.infer<typeof QuerySchema>): Promise<LeaderRow[]> {
  const skip = (params.page - 1) * params.limit;

  if (params.scope === "all") {
    const users = (await prisma.user.findMany({
      where: params.region ? { region: params.region } : undefined,
      orderBy: [{ totalRewards: "desc" }, { level: "desc" }],
      skip,
      take: params.limit,
      select: {
        id: true,
        displayName: true,
        username: true,
        totalRewards: true,
        level: true,
        streakDays: true,
        region: true,
      },
    })) as UserLite[];
    return users.map((u: UserLite, i: number) => ({
      rank: skip + i + 1,
      userId: u.id,
      name: u.displayName || u.username || u.id.slice(0, 6),
      score: u.totalRewards,
      level: u.level,
      streakDays: u.streakDays,
      region: u.region,
    }));
  }

  // Weekly / monthly — aggregate reward from Verification within window.
  const windowDays = params.scope === "weekly" ? 7 : 30;
  const since = new Date(Date.now() - windowDays * 24 * 60 * 60 * 1000);

  const grouped = (await prisma.verification.groupBy({
    by: ["userId"],
    where: { status: "verified", verifiedAt: { gte: since } },
    _sum: { reward: true },
    orderBy: { _sum: { reward: "desc" } },
    skip,
    take: params.limit,
  })) as GroupAgg[];

  if (!grouped.length) return [];
  const userIds = grouped.map((g: GroupAgg) => g.userId);
  const users = (await prisma.user.findMany({
    where: {
      id: { in: userIds },
      ...(params.region ? { region: params.region } : {}),
    },
    select: {
      id: true,
      displayName: true,
      username: true,
      level: true,
      streakDays: true,
      region: true,
      totalRewards: true,
    },
  })) as UserLite[];
  const byId = new Map<string, UserLite>(users.map((u: UserLite) => [u.id, u]));

  return grouped
    .map((g: GroupAgg, i: number) => {
      const u = byId.get(g.userId);
      if (!u) return null;
      return {
        rank: skip + i + 1,
        userId: u.id,
        name: u.displayName || u.username || u.id.slice(0, 6),
        score: g._sum.reward ?? 0,
        level: u.level,
        streakDays: u.streakDays,
        region: u.region,
      } satisfies LeaderRow;
    })
    .filter((r: LeaderRow | null): r is LeaderRow => !!r);
}

async function resolveUserRank(params: z.infer<typeof QuerySchema>): Promise<LeaderRow | null> {
  if (!params.userId) return null;
  const user = await prisma.user.findUnique({
    where: { id: params.userId },
    select: {
      id: true,
      displayName: true,
      username: true,
      totalRewards: true,
      level: true,
      streakDays: true,
      region: true,
    },
  });
  if (!user) return null;

  const higher = await prisma.user.count({
    where: {
      totalRewards: { gt: user.totalRewards },
      ...(params.region ? { region: params.region } : {}),
    },
  });

  return {
    rank: higher + 1,
    userId: user.id,
    name: user.displayName || user.username || "You",
    score: user.totalRewards,
    level: user.level,
    streakDays: user.streakDays,
    region: user.region,
  };
}
