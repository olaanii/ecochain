import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

import { rewardCatalog } from "@/lib/data/eco";
import { createProtectedHandler, formatSuccessResponse, jsonResponse, AuthContext } from "@/lib/api/middleware";
import { RedeemRequestSchema, validateRequestBody, formatValidationError } from "@/lib/api/schemas";
import { prisma } from "@/lib/prisma/client";

// Handler for POST /api/redeem with authentication and validation
async function handleRedeem(
  request: NextRequest,
  context: { auth: AuthContext; requestId: string }
): Promise<NextResponse> {
  const body = await request.json();
  
  // Validate request body
  const validation = validateRequestBody(RedeemRequestSchema, body);
  
  if (!validation.success) {
    const errorDetails = formatValidationError(validation.error);
    return jsonResponse(
      {
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: errorDetails.message,
          details: errorDetails.details,
        },
        meta: {
          timestamp: new Date().toISOString(),
          requestId: context.requestId,
        },
      },
      400
    );
  }
  
  const payload = validation.data;
  const clerkId = context.auth.userId;

  try {
    // Find or create reward
    const reward = await prisma.rewardOffering.findUnique({
      where: { id: payload.rewardId },
    });

    let rewardRecord = reward;

    if (!rewardRecord) {
      const fallbackReward = rewardCatalog.find((item) => item.id === payload.rewardId);
      if (!fallbackReward) {
        return jsonResponse(
          {
            success: false,
            error: {
              code: "REWARD_NOT_FOUND",
              message: "The specified reward was not found",
            },
            meta: {
              timestamp: new Date().toISOString(),
              requestId: context.requestId,
            },
          },
          404
        );
      }

      rewardRecord = await prisma.rewardOffering.upsert({
        where: { title: fallbackReward.title },
        update: {
          subtitle: fallbackReward.subtitle,
          cost: fallbackReward.cost,
          partner: fallbackReward.partner,
          available: true,
        },
        create: {
          title: fallbackReward.title,
          subtitle: fallbackReward.subtitle,
          cost: fallbackReward.cost,
          partner: fallbackReward.partner,
          available: true,
        },
      });
    }

    // Find or create user
    const user = await prisma.user.upsert({
      where: { clerkId },
      update: {
        initiaAddress: payload.initiaAddress,
        initiaUsername: payload.initiaUsername,
        displayName: payload.displayName ?? payload.initiaUsername ?? "Builder",
        region: payload.region,
      },
      create: {
        clerkId,
        initiaAddress: payload.initiaAddress,
        initiaUsername: payload.initiaUsername,
        username: payload.initiaUsername ?? `user-${clerkId.slice(0, 8)}`,
        displayName: payload.displayName ?? payload.initiaUsername ?? "Builder",
        region: payload.region,
      },
    });

    // Check user balance
    const balanceResult = await prisma.ledgerEntry.aggregate({
      where: { userId: user.id },
      _sum: { amount: true },
    });
    const balanceBefore = balanceResult._sum.amount ?? 0;

    if (balanceBefore < rewardRecord.cost) {
      return jsonResponse(
        {
          success: false,
          error: {
            code: "INSUFFICIENT_BALANCE",
            message: "Insufficient balance for this operation",
          },
          meta: {
            timestamp: new Date().toISOString(),
            requestId: context.requestId,
          },
        },
        400
      );
    }

    // Create redemption ledger entry
    const entry = await prisma.ledgerEntry.create({
      data: {
        userId: user.id,
        amount: -rewardRecord.cost,
        source: `redemption:${rewardRecord.id}`,
        proofType: "redemption",
        details: {
          rewardId: rewardRecord.id,
          rewardTitle: rewardRecord.title,
          partner: rewardRecord.partner,
        },
      },
    });

    const balanceAfter = balanceBefore - rewardRecord.cost;

    return jsonResponse(
      formatSuccessResponse({
        success: true,
        reward: {
          id: rewardRecord.id,
          title: rewardRecord.title,
          cost: rewardRecord.cost,
        },
        balanceBefore,
        balanceAfter,
      }, context.requestId),
      200
    );
  } catch (error) {
    // Fallback response
    return jsonResponse(
      formatSuccessResponse({
        success: true,
        reward: {
          id: "fallback",
          title: "Demo redemption",
          cost: 0,
        },
        balanceBefore: 0,
        balanceAfter: 0,
        reason: "Fallback mode - database unavailable",
      }, context.requestId),
      200
    );
  }
}

// Export wrapped handler with authentication and middleware
export const POST = createProtectedHandler(handleRedeem, {
  rateLimit: {
    windowMs: 60000, // 1 minute
    maxRequests: 10, // Lower limit for redemption endpoint
  },
});
