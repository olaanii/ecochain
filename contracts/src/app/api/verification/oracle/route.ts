/**
 * Oracle Verification API Endpoint
 * 
 * Requirement 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.8, 3.9
 * POST /api/verification/oracle - Verify proof using oracle
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { logger } from "@/lib/api/middleware/logging";
import { validateRequest } from "@/lib/api/middleware/validation";
import { requireAuth } from "@/lib/api/middleware/auth";
import { verifyProofWithOracle } from "@/lib/verification/oracle-verifier";
import { prisma } from "@/lib/prisma/client";

const OracleVerificationSchema = z.object({
  verificationId: z.string().uuid(),
  taskId: z.string().uuid(),
  proofType: z.enum(["photo", "transit_card", "iot_sensor", "api"]),
  proofData: z.object({
    imageUrl: z.string().url().optional(),
    transitCardId: z.string().optional(),
    sensorData: z.record(z.unknown()).optional(),
    apiResponse: z.record(z.unknown()).optional(),
  }),
  taskContext: z.string().min(1).max(500),
});

type OracleVerificationRequest = z.infer<typeof OracleVerificationSchema>;

/**
 * POST /api/verification/oracle
 * Verify proof using appropriate oracle
 */
export async function POST(request: NextRequest) {
  const requestId = crypto.randomUUID();
  const startTime = Date.now();

  try {
    // Authenticate request
    const user = await requireAuth(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse and validate request body
    const body = await request.json();
    const validation = validateRequest(body, OracleVerificationSchema);

    if (!validation.success) {
      logger.warn("Invalid oracle verification request", {
        requestId,
        errors: validation.errors,
      });
      return NextResponse.json(
        { error: "Invalid request", details: validation.errors },
        { status: 400 }
      );
    }

    const data: OracleVerificationRequest = validation.data;

    // Verify that verification exists and belongs to user
    const verification = await prisma.verification.findUnique({
      where: { id: data.verificationId },
      include: { task: true },
    });

    if (!verification) {
      logger.warn("Verification not found", {
        requestId,
        verificationId: data.verificationId,
      });
      return NextResponse.json({ error: "Verification not found" }, { status: 404 });
    }

    if (verification.userId !== user.id) {
      logger.warn("Unauthorized verification access", {
        requestId,
        verificationId: data.verificationId,
        userId: user.id,
      });
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Call oracle verification
    logger.info("Starting oracle verification", {
      requestId,
      verificationId: data.verificationId,
      proofType: data.proofType,
    });

    const result = await verifyProofWithOracle({
      verificationId: data.verificationId,
      taskId: data.taskId,
      userId: user.id,
      proofType: data.proofType as any,
      proofData: data.proofData,
      taskContext: data.taskContext,
    });

    // Update verification with oracle result
    const updatedVerification = await prisma.verification.update({
      where: { id: data.verificationId },
      data: {
        status: result.status as any,
        metadata: {
          ...verification.metadata,
          ...result.metadata,
          oracleVerifiedAt: new Date().toISOString(),
        },
      },
    });

    logger.info("Oracle verification completed", {
      requestId,
      verificationId: data.verificationId,
      status: result.status,
      confidence: result.confidence,
      timeMs: Date.now() - startTime,
    });

    return NextResponse.json(
      {
        success: true,
        verification: {
          id: updatedVerification.id,
          status: updatedVerification.status,
          oracleResult: {
            confidence: result.confidence,
            description: result.description,
            labels: result.labels,
            rejectionReason: result.rejectionReason,
          },
        },
      },
      { status: 200 }
    );
  } catch (error) {
    logger.error("Oracle verification error", {
      requestId,
      error: error instanceof Error ? error.message : String(error),
      timeMs: Date.now() - startTime,
    });

    return NextResponse.json(
      { error: "Oracle verification failed" },
      { status: 500 }
    );
  }
}
