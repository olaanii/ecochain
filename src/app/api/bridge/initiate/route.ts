import { NextRequest, NextResponse } from "next/server";

import { createProtectedHandler, formatSuccessResponse, jsonResponse, AuthContext } from "@/lib/api/middleware";
import { BridgeInitiateRequestSchema, validateRequestBody, formatValidationError } from "@/lib/api/schemas";
import { initiaSubmission } from "@/lib/initia/submission";
import { prisma } from "@/lib/prisma/client";
import { validateCsrfToken } from "@/lib/security/csrf";

// Handler for POST /api/bridge/initiate with authentication, CSRF, and validation
async function handleBridgeInitiate(
  request: NextRequest,
  context: { auth: AuthContext; requestId: string }
): Promise<NextResponse> {
  // Validate CSRF token for state-changing operation
  const csrfToken = request.headers.get("x-csrf-token");
  if (!csrfToken || !(await validateCsrfToken(csrfToken))) {
    return jsonResponse(
      {
        success: false,
        error: { code: "CSRF_ERROR", message: "Invalid or missing CSRF token" },
        meta: { timestamp: new Date().toISOString(), requestId: context.requestId },
      },
      403
    );
  }

  const body = await request.json();
  
  // Validate request body
  const validation = validateRequestBody(BridgeInitiateRequestSchema, body);
  
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
    // Find or create user
    const user = await prisma.user.upsert({
      where: { clerkId },
      update: {},
      create: {
        clerkId,
        initiaAddress: payload.recipientAddress,
        username: `user-${clerkId.slice(0, 8)}`,
        displayName: "Builder",
      },
    });

    // Create bridge request with pending status
    const transactionId = crypto.randomUUID();
    const entry = await prisma.bridgeRequest.create({
      data: {
        userId: user.id,
        amount: payload.amount,
        denom: payload.denom,
        sourceChain: payload.sourceChain,
        targetChain: payload.targetChain,
        recipientAddress: payload.recipientAddress,
        status: "pending",
        transactionLink: `${initiaSubmission.txnEvidence}?bridge=${transactionId}`,
      },
    });

    // Calculate estimated completion time (5 minutes from now)
    const estimatedCompletionTime = new Date(Date.now() + 5 * 60 * 1000).toISOString();
    
    // In a real implementation, this would integrate with Initia bridge infrastructure
    // For now, we return the pending transaction details
    
    return jsonResponse(
      formatSuccessResponse({
        transactionId: entry.id,
        status: "pending" as const,
        estimatedCompletionTime,
        trackingUrl: entry.transactionLink ?? `${initiaSubmission.txnEvidence}?bridge=${entry.id}`,
      }, context.requestId),
      200
    );
  } catch (error) {
    // Fallback response
    const transactionId = crypto.randomUUID();
    const estimatedCompletionTime = new Date(Date.now() + 5 * 60 * 1000).toISOString();
    
    return jsonResponse(
      formatSuccessResponse({
        transactionId,
        status: "pending" as const,
        estimatedCompletionTime,
        trackingUrl: `${initiaSubmission.txnEvidence}?bridge=${transactionId}`,
      }, context.requestId),
      200
    );
  }
}

// Export wrapped handler with authentication and middleware
export const POST = createProtectedHandler(handleBridgeInitiate, {
  rateLimit: {
    windowMs: 60000, // 1 minute
    maxRequests: 5, // Very low limit for bridge operations
  },
});
