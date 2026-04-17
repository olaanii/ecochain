import { NextRequest, NextResponse } from "next/server";

import { createProtectedHandler, formatSuccessResponse, jsonResponse, AuthContext } from "@/lib/api/middleware";
import { initiaSubmission } from "@/lib/initia/submission";
import { prisma } from "@/lib/prisma/client";

// Handler for GET /api/bridge/history with authentication
async function handleGetBridgeHistory(
  request: NextRequest,
  context: { auth: AuthContext; requestId: string }
): Promise<NextResponse> {
  const clerkId = context.auth.userId;
  
  try {
    // Find user
    const user = await prisma.user.findUnique({
      where: { clerkId },
    });
    
    if (!user) {
      return jsonResponse(
        formatSuccessResponse({
          transactions: [],
        }, context.requestId),
        200
      );
    }
    
    // Fetch user's bridge transaction history
    const history = await prisma.bridgeRequest.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    return jsonResponse(
      formatSuccessResponse({
        transactions: history.map((entry: any) => ({
          id: entry.id,
          amount: entry.amount,
          denom: entry.denom,
          status: entry.status,
          sourceChain: entry.sourceChain ?? "ecochain",
          targetChain: entry.targetChain,
          timestamp: entry.createdAt.toISOString(),
          transactionLink: entry.transactionLink ?? initiaSubmission.txnEvidence,
        })),
      }, context.requestId),
      200
    );
  } catch (error) {
    // Return empty history on error
    return jsonResponse(
      formatSuccessResponse({
        transactions: [],
      }, context.requestId),
      200
    );
  }
}

// Export wrapped handler with authentication and middleware
export const GET = createProtectedHandler(handleGetBridgeHistory, {
  rateLimit: {
    windowMs: 60000, // 1 minute
    maxRequests: 30,
  },
});
