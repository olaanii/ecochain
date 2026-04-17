import { NextRequest, NextResponse } from "next/server";

import { rewardCatalog } from "@/lib/data/eco";
import { createPublicHandler, formatSuccessResponse, jsonResponse } from "@/lib/api/middleware";
import { prisma } from "@/lib/prisma/client";

// Handler for GET /api/rewards
async function handleGetRewards(request: NextRequest): Promise<NextResponse> {
  try {
    const offerings = await prisma.rewardOffering.findMany({
      where: { available: true },
      orderBy: { cost: "desc" },
    });

    return jsonResponse(
      formatSuccessResponse({
        rewards: offerings.map((reward: any) => ({
          id: reward.id,
          title: reward.title,
          subtitle: reward.subtitle,
          cost: reward.cost,
          partner: reward.partner,
          available: reward.available,
          category: reward.category ?? "general",
        })),
      }),
      200,
      {
        "Cache-Control": "public, max-age=300, s-maxage=600",
      }
    );
  } catch {
    // Fallback to static data
    return jsonResponse(
      formatSuccessResponse({
        rewards: rewardCatalog.map((reward) => ({
          id: reward.id,
          title: reward.title,
          subtitle: reward.subtitle,
          cost: reward.cost,
          partner: reward.partner,
          available: true,
          category: "general",
        })),
      }),
      200,
      {
        "Cache-Control": "public, max-age=300, s-maxage=600",
      }
    );
  }
}

// Export wrapped handler with middleware
export const GET = createPublicHandler(handleGetRewards, {
  rateLimit: {
    windowMs: 60000, // 1 minute
    maxRequests: 100,
  },
});
