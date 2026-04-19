import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { createProtectedHandler, formatSuccessResponse, jsonResponse, AuthContext } from "@/lib/api/middleware";
import { prisma } from "@/lib/prisma/client";

// Query schema for history endpoint
const HistoryQuerySchema = z.object({
  status: z.enum(["pending", "verified", "rejected", "fraud"]).optional(),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  offset: z.coerce.number().int().min(0).default(0),
});

/**
 * GET /api/verify/history
 * Get paginated verification history for user
 * 
 * Requirements: 1.4
 */
async function handleGetHistory(
  request: NextRequest,
  context: { auth: AuthContext; requestId: string }
): Promise<NextResponse> {
  const clerkId = context.auth.userId;
  const searchParams = request.nextUrl.searchParams;

  try {
    // Parse and validate query parameters
    const queryData = {
      status: searchParams.get("status") || undefined,
      limit: searchParams.get("limit") || "20",
      offset: searchParams.get("offset") || "0",
    };

    const validation = HistoryQuerySchema.safeParse(queryData);
    if (!validation.success) {
      return jsonResponse(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Invalid query parameters",
            details: validation.error.errors,
          },
          meta: {
            timestamp: new Date().toISOString(),
            requestId: context.requestId,
          },
        },
        400
      );
    }

    const { status, limit, offset } = validation.data;

    // Find user
    const user = await prisma.user.findUnique({
      where: { clerkId },
    });

    if (!user) {
      return jsonResponse(
        {
          success: false,
          error: {
            code: "USER_NOT_FOUND",
            message: "User not found",
          },
          meta: {
            timestamp: new Date().toISOString(),
            requestId: context.requestId,
          },
        },
        404
      );
    }

    // Build where clause
    const where: any = { userId: user.id };
    if (status) {
      where.status = status;
    }

    // Get total count
    const total = await prisma.verification.count({ where });

    // Get paginated verifications
    const verifications = await prisma.verification.findMany({
      where,
      include: {
        task: {
          select: {
            id: true,
            slug: true,
            name: true,
            category: true,
            baseReward: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: limit,
      skip: offset,
    });

    return jsonResponse(
      formatSuccessResponse({
        verifications: verifications.map((verification: any) => ({
          id: verification.id,
          taskId: verification.task.slug,
          taskName: verification.task.name,
          taskCategory: verification.task.category,
          status: verification.status,
          reward: verification.reward,
          proofHash: verification.proofHash,
          transactionHash: verification.transactionHash,
          createdAt: verification.createdAt.toISOString(),
        })),
        pagination: {
          total,
          limit,
          offset,
          hasMore: offset + limit < total,
        },
      }, context.requestId),
      200
    );
  } catch (error) {
    console.error("Error fetching verification history:", error);
    return jsonResponse(
      {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "Failed to fetch verification history",
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

export const GET = createProtectedHandler(handleGetHistory, {
  rateLimit: {
    windowMs: 60000,
    maxRequests: 100,
  },
});
