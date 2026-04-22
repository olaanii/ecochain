import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

import { ecoTasks } from "@/lib/data/eco";
import { createProtectedHandler, formatSuccessResponse, jsonResponse, AuthContext } from "@/lib/api/middleware";
import { VerifyRequestSchema, validateRequestBody, formatValidationError } from "@/lib/api/schemas";
import { prisma } from "@/lib/prisma/client";
import { verifyProof } from "@/lib/verification";
import { validateCsrfToken } from "@/lib/security/csrf";

// Handler for POST /api/verify with authentication, CSRF, and validation
async function handleVerify(
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
  const validation = validateRequestBody(VerifyRequestSchema, body);
  
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
    // Find or create task
    const task = await prisma.task.findUnique({ where: { slug: payload.taskId } });
    const fallbackTask = ecoTasks.find((entry) => entry.id === payload.taskId);
    const taskRecord =
      task ??
      (fallbackTask
        ? await prisma.task.upsert({
            where: { slug: fallbackTask.id },
            update: {
              name: fallbackTask.name,
              description: fallbackTask.description,
              verificationHint: fallbackTask.verificationHint,
              category: fallbackTask.category,
              baseReward: fallbackTask.baseReward,
              bonusFactor: fallbackTask.bonusMultiplier,
            },
            create: {
              slug: fallbackTask.id,
              name: fallbackTask.name,
              description: fallbackTask.description,
              verificationHint: fallbackTask.verificationHint,
              category: fallbackTask.category,
              baseReward: fallbackTask.baseReward,
              bonusFactor: fallbackTask.bonusMultiplier,
            },
          })
        : null);
    
    if (!taskRecord) {
      return jsonResponse(
        {
          success: false,
          error: {
            code: "TASK_NOT_FOUND",
            message: "The specified task was not found",
          },
          meta: {
            timestamp: new Date().toISOString(),
            requestId: context.requestId,
          },
        },
        404
      );
    }
    
    const taskContext = {
      slug: taskRecord.slug,
      name: taskRecord.name,
      baseReward: taskRecord.baseReward,
      bonusFactor: taskRecord.bonusFactor,
    };
    
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
    
    // Verify proof with oracle integration if provided
    const metadata = {
      proofType: payload.proofType,
      oracleSource: payload.oracleSource ?? "client",
      oracleConfidence: payload.oracleConfidence ?? 0.78,
      proofDetails: payload.proofDetails,
    };
    
    const result = verifyProof(taskContext, {
      taskId: payload.taskId,
      proofHash: payload.proofHash,
      submittedAt: payload.submittedAt,
      geoHash: payload.geoHash,
    }, metadata);
    
    // If verification succeeds, create records and mint rewards
    if (result.verified && typeof result.rewardDelta === "number") {
      await prisma.verification.create({
        data: {
          taskId: taskRecord.id,
          userId: user.id,
          proofHash: payload.proofHash,
          geoHash: payload.geoHash,
          status: "verified",
          reward: result.rewardDelta,
          proofType: metadata.proofType,
          oracleSource: metadata.oracleSource,
          oracleConfidence: metadata.oracleConfidence,
          proofMetadata: metadata.proofDetails ?? {},
        },
      });
      
      await prisma.ledgerEntry.create({
        data: {
          userId: user.id,
          amount: result.rewardDelta,
          source: "verification",
          proofType: metadata.proofType,
          details: {
            taskId: taskRecord.slug,
            oracleSource: metadata.oracleSource,
          },
        },
      });
    }
    
    // Fetch user's ledger history
    const ledgerEntries = await prisma.ledgerEntry.findMany({
      where: { userId: user.id },
      orderBy: { mintedAt: "desc" },
      take: 5,
    });
    
    return jsonResponse(
      formatSuccessResponse({
        result,
        ledger: ledgerEntries.map((entry: any) => ({
          id: entry.id,
          taskId: entry.details?.taskId ?? "global",
          reward: entry.amount,
          mintedAt: entry.mintedAt.toISOString(),
        })),
      }, context.requestId),
      200
    );
  } catch (error) {
    // Fallback to in-memory verification
    const fallbackTask = ecoTasks.find((entry) => entry.id === payload.taskId);
    
    if (!fallbackTask) {
      return jsonResponse(
        {
          success: false,
          error: {
            code: "TASK_NOT_FOUND",
            message: "The specified task was not found",
          },
          meta: {
            timestamp: new Date().toISOString(),
            requestId: context.requestId,
          },
        },
        404
      );
    }
    
    const result = verifyProof(
      {
        slug: fallbackTask.id,
        name: fallbackTask.name,
        baseReward: fallbackTask.baseReward,
        bonusFactor: fallbackTask.bonusMultiplier,
      },
      {
        taskId: payload.taskId,
        proofHash: payload.proofHash,
        submittedAt: payload.submittedAt,
        geoHash: payload.geoHash,
      },
      {
        proofType: payload.proofType,
        oracleSource: payload.oracleSource ?? "client",
        oracleConfidence: payload.oracleConfidence ?? 0.78,
        proofDetails: payload.proofDetails,
      }
    );
    
    return jsonResponse(
      formatSuccessResponse({
        result,
        ledger: [],
      }, context.requestId),
      200
    );
  }
}

// Export wrapped handler with authentication and middleware
export const POST = createProtectedHandler(handleVerify, {
  rateLimit: {
    windowMs: 60000, // 1 minute
    maxRequests: 20, // Lower limit for verification endpoint
  },
});
