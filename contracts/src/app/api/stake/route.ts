import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { createProtectedHandler, formatSuccessResponse, jsonResponse, AuthContext } from "@/lib/api/middleware";
import { prisma } from "@/lib/prisma/client";
import { STAKING_CONSTANTS, VALID_DURATIONS } from "@/lib/contracts/staking";

/**
 * POST /api/stake
 * Initiate staking of ECO tokens
 * 
 * Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.7, 8.9, 8.10
 */

// Validation schema for stake request
const StakeRequestSchema = z.object({
  amount: z.string().regex(/^\d+$/, "Amount must be a valid number"),
  durationDays: z.enum(["30", "90", "180", "365"], {
    errorMap: () => ({ message: "Duration must be 30, 90, 180, or 365 days" }),
  }),
});

type StakeRequest = z.infer<typeof StakeRequestSchema>;

async function handleStake(
  request: NextRequest,
  context: { auth: AuthContext; requestId: string }
): Promise<NextResponse> {
  const body = await request.json();
  const clerkId = context.auth.userId;

  try {
    // Validate request body
    const validation = StakeRequestSchema.safeParse(body);
    if (!validation.success) {
      return jsonResponse(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Invalid request parameters",
            details: validation.error.errors.map((e) => ({
              field: e.path.join("."),
              message: e.message,
            })),
          },
          meta: {
            timestamp: new Date().toISOString(),
            requestId: context.requestId,
          },
        },
        400
      );
    }

    const { amount, durationDays } = validation.data;
    const amountBigInt = BigInt(amount);
    const duration = parseInt(durationDays);

    // Validate amount >= 100 ECO
    if (amountBigInt < STAKING_CONSTANTS.MINIMUM_STAKE) {
      return jsonResponse(
        {
          success: false,
          error: {
            code: "INVALID_AMOUNT",
            message: `Minimum stake is ${STAKING_CONSTANTS.MINIMUM_STAKE / BigInt(10) ** BigInt(18)} ECO`,
          },
          meta: {
            timestamp: new Date().toISOString(),
            requestId: context.requestId,
          },
        },
        400
      );
    }

    // Validate duration
    if (!VALID_DURATIONS.includes(duration as any)) {
      return jsonResponse(
        {
          success: false,
          error: {
            code: "INVALID_DURATION",
            message: `Valid durations are: ${VALID_DURATIONS.join(", ")} days`,
          },
          meta: {
            timestamp: new Date().toISOString(),
            requestId: context.requestId,
          },
        },
        400
      );
    }

    // Find or create user
    const user = await prisma.user.upsert({
      where: { clerkId },
      update: {},
      create: {
        clerkId,
        initiaAddress: "pending-initia",
        username: `user-${clerkId.slice(0, 8)}`,
        displayName: "Builder",
      },
    });

    // Check user has sufficient available balance
    const ledgerEntries = await prisma.ledgerEntry.findMany({
      where: { userId: user.id },
    });

    let totalBalance = BigInt(0);
    for (const entry of ledgerEntries) {
      totalBalance += BigInt(entry.amount);
    }

    // Get staked amount
    const stakes = await prisma.stake.findMany({
      where: { userId: user.id, status: "active" },
    });

    let totalStaked = BigInt(0);
    for (const stake of stakes) {
      totalStaked += BigInt(stake.amount);
    }

    const availableBalance = totalBalance - totalStaked;

    if (availableBalance < amountBigInt) {
      return jsonResponse(
        {
          success: false,
          error: {
            code: "INSUFFICIENT_BALANCE",
            message: `Insufficient available balance. Available: ${availableBalance / BigInt(10) ** BigInt(18)} ECO`,
          },
          meta: {
            timestamp: new Date().toISOString(),
            requestId: context.requestId,
          },
        },
        400
      );
    }

    // Calculate expected rewards (simplified estimation)
    const apy = getAPYForDuration(duration);
    const expectedRewards = (amountBigInt * BigInt(apy) * BigInt(duration)) /
      (BigInt(10000) * BigInt(365));

    // Calculate end time
    const startTime = new Date();
    const endTime = new Date(startTime.getTime() + duration * 24 * 60 * 60 * 1000);

    // Create stake record in database
    const stake = await prisma.stake.create({
      data: {
        userId: user.id,
        amount: amount,
        apy: apy.toString(),
        startTime,
        duration,
        endTime,
        status: "active",
        accruedRewards: "0",
        transactionHash: "", // Will be updated after blockchain confirmation
      },
    });

    // Create ledger entry for staking
    await prisma.ledgerEntry.create({
      data: {
        userId: user.id,
        amount: `-${amount}`, // Negative for staking
        source: "stake",
        details: {
          stakeId: stake.id,
          duration,
          apy: apy.toString(),
        },
      },
    });

    return jsonResponse(
      formatSuccessResponse({
        stake: {
          id: stake.id,
          amount: stake.amount,
          duration: stake.duration,
          apy: Number(stake.apy) / 100, // Convert basis points to percentage
          startTime: stake.startTime.toISOString(),
          endTime: stake.endTime.toISOString(),
          expectedRewards: expectedRewards.toString(),
          status: stake.status,
        },
      }, context.requestId),
      200
    );
  } catch (error) {
    console.error("Error creating stake:", error);
    return jsonResponse(
      {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "Failed to create stake",
        },
        meta: {
          timestamp: new Date().toISOString(),
          requestId: context.requestId,
        },
      },
      500
    );
  }
}

/**
 * Get APY for a duration in basis points
 */
function getAPYForDuration(durationDays: number): number {
  switch (durationDays) {
    case 30:
      return 500; // 5%
    case 90:
      return 800; // 8%
    case 180:
      return 1200; // 12%
    case 365:
      return 1800; // 18%
    default:
      throw new Error("Invalid duration");
  }
}

export const POST = createProtectedHandler(handleStake, {
  rateLimit: {
    windowMs: 60000, // 1 minute
    maxRequests: 10, // 10 staking transactions per minute per user
  },
});
