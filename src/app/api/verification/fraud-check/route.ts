import { NextRequest, NextResponse } from "next/server";
import {
  authMiddleware,
  validationMiddleware,
  rateLimitMiddleware,
  withErrorHandling,
  ApiErrors,
} from "@/lib/api/middleware";
import { detectFraud, addToReviewQueue } from "@/lib/verification/fraud-detection";
import { z } from "zod";

/**
 * POST /api/verification/fraud-check
 * 
 * Check proof submission for fraud indicators
 * Returns fraud score and flagging status
 * 
 * Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 4.8, 4.9
 */

const FraudCheckSchema = z.object({
  taskId: z.string().min(1),
  proofHash: z.string().regex(/^0x[a-f0-9]{64}$/i),
  metadata: z
    .object({
      geolocation: z
        .object({
          latitude: z.number().min(-90).max(90),
          longitude: z.number().min(-180).max(180),
        })
        .optional(),
      deviceId: z.string().optional(),
      osVersion: z.string().optional(),
    })
    .optional(),
});

export const POST = withErrorHandling(async (request: NextRequest) => {
  // 1. Authenticate
  const { auth, error: authError } = await authMiddleware(request);
  if (authError) return authError;

  // 2. Rate limit
  const { allowed, response: rateLimitResponse } = await rateLimitMiddleware(
    request,
    auth!.userId,
  );
  if (!allowed) return rateLimitResponse;

  // 3. Validate input
  const { data, error: validationError } = await validationMiddleware(
    request,
    FraudCheckSchema,
  );
  if (validationError) return validationError;

  // 4. Perform fraud detection
  const fraudResult = await detectFraud(
    auth!.userId,
    data.taskId,
    data.proofHash,
    data.metadata,
  );

  // 5. Add to review queue if flagged
  if (fraudResult.isFlagged) {
    try {
      const reviewItem = await addToReviewQueue(
        `verification-${Date.now()}`,
        auth!.userId,
        fraudResult.fraudScore,
        fraudResult.reason || "Fraud indicators detected",
      );

      return NextResponse.json(
        {
          fraudScore: fraudResult.fraudScore,
          isFlagged: true,
          indicators: fraudResult.indicators,
          reason: fraudResult.reason,
          reviewId: reviewItem.id,
          message: "Submission flagged for manual review",
        },
        { status: 202 }, // Accepted but pending review
      );
    } catch (error) {
      console.error("Failed to add to review queue:", error);
      // Continue anyway, just don't return review ID
    }
  }

  return NextResponse.json({
    fraudScore: fraudResult.fraudScore,
    isFlagged: false,
    indicators: fraudResult.indicators,
    message: "Submission passed fraud checks",
  });
});
