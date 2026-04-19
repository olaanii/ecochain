import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

import { formatSuccessResponse, jsonResponse } from "@/lib/api/middleware";
import { prisma } from "@/lib/prisma/client";

/**
 * GET /api/verify/:verificationId
 * Get verification status and details
 * 
 * Requirements: 17.2
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { verificationId: string } }
): Promise<NextResponse> {
  const { verificationId } = params;
  const requestId = request.headers.get("x-request-id") || `req-${Date.now()}`;

  try {
    // Check authentication
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return jsonResponse(
        {
          success: false,
          error: {
            code: "UNAUTHORIZED",
            message: "Authentication required",
          },
          meta: {
            timestamp: new Date().toISOString(),
            requestId,
          },
        },
        401
      );
    }

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
            requestId,
          },
        },
        404
      );
    }

    // Find verification
    const verification = await prisma.verification.findUnique({
      where: { id: verificationId },
      include: {
        task: {
          select: {
            id: true,
            slug: true,
            name: true,
            description: true,
            category: true,
            baseReward: true,
          },
        },
      },
    });

    if (!verification) {
      return jsonResponse(
        {
          success: false,
          error: {
            code: "VERIFICATION_NOT_FOUND",
            message: "Verification not found",
          },
          meta: {
            timestamp: new Date().toISOString(),
            requestId,
          },
        },
        404
      );
    }

    // Validate user can only access own verifications
    if (verification.userId !== user.id) {
      return jsonResponse(
        {
          success: false,
          error: {
            code: "UNAUTHORIZED",
            message: "You do not have access to this verification",
          },
          meta: {
            timestamp: new Date().toISOString(),
            requestId,
          },
        },
        403
      );
    }

    return jsonResponse(
      formatSuccessResponse({
        verification: {
          id: verification.id,
          taskId: verification.task.slug,
          taskName: verification.task.name,
          taskCategory: verification.task.category,
          status: verification.status,
          reward: verification.reward,
          proofHash: verification.proofHash,
          transactionHash: verification.transactionHash,
          oracleSource: verification.oracleSource,
          oracleConfidence: verification.oracleConfidence,
          createdAt: verification.createdAt.toISOString(),
          updatedAt: verification.updatedAt.toISOString(),
        },
      }, requestId),
      200
    );
  } catch (error) {
    console.error("Error fetching verification:", error);
    return jsonResponse(
      {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "Failed to fetch verification",
        },
        meta: {
          timestamp: new Date().toISOString(),
          requestId,
        },
      },
      500
    );
  }
}
