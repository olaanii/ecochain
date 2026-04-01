/**
 * Confidence Threshold Validator
 * 
 * Requirement 3.5
 * Validates oracle confidence scores against thresholds
 */

import { logger } from "@/lib/api/middleware/logging";
import { prisma } from "@/lib/prisma/client";

export interface ConfidenceValidationResult {
  isValid: boolean;
  confidence: number;
  threshold: number;
  rejectionReason?: string;
}

/**
 * Validate confidence score against threshold
 * Requirement 3.5
 */
export function validateConfidenceThreshold(
  confidence: number,
  threshold: number = 0.7
): ConfidenceValidationResult {
  if (confidence < 0 || confidence > 1) {
    return {
      isValid: false,
      confidence,
      threshold,
      rejectionReason: "Invalid confidence score (must be between 0.0 and 1.0)",
    };
  }

  if (confidence < threshold) {
    return {
      isValid: false,
      confidence,
      threshold,
      rejectionReason: `Confidence score ${confidence.toFixed(2)} is below threshold ${threshold.toFixed(2)}`,
    };
  }

  return {
    isValid: true,
    confidence,
    threshold,
  };
}

/**
 * Reject verification with low confidence
 * Requirement 3.5
 */
export async function rejectLowConfidenceVerification(
  verificationId: string,
  confidence: number,
  threshold: number = 0.7
): Promise<void> {
  const rejectionReason = `Oracle confidence ${confidence.toFixed(2)} below threshold ${threshold.toFixed(2)}`;

  try {
    await prisma.verification.update({
      where: { id: verificationId },
      data: {
        status: "rejected",
        metadata: {
          rejectionReason,
          oracleConfidence: confidence,
          confidenceThreshold: threshold,
          rejectedAt: new Date().toISOString(),
        },
      },
    });

    logger.info("Verification rejected due to low confidence", {
      verificationId,
      confidence,
      threshold,
      rejectionReason,
    });
  } catch (error) {
    logger.error("Failed to reject verification", {
      verificationId,
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
}

/**
 * Log low-confidence submission for analysis
 * Requirement 3.5
 */
export async function logLowConfidenceSubmission(
  verificationId: string,
  confidence: number,
  taskId: string,
  userId: string,
  metadata: Record<string, unknown> = {}
): Promise<void> {
  try {
    logger.warn("Low confidence submission detected", {
      verificationId,
      taskId,
      userId,
      confidence,
      metadata,
    });

    // In a production system, this could be stored in a separate analytics table
    // for trend analysis and model improvement
  } catch (error) {
    logger.error("Failed to log low-confidence submission", {
      verificationId,
      error: error instanceof Error ? error.message : String(error),
    });
  }
}

/**
 * Get confidence statistics for analysis
 */
export async function getConfidenceStatistics(
  timeWindowHours: number = 24
): Promise<{
  totalVerifications: number;
  averageConfidence: number;
  lowConfidenceCount: number;
  lowConfidencePercentage: number;
  threshold: number;
}> {
  try {
    const since = new Date(Date.now() - timeWindowHours * 60 * 60 * 1000);

    const verifications = await prisma.verification.findMany({
      where: {
        createdAt: {
          gte: since,
        },
      },
      select: {
        metadata: true,
      },
    });

    const confidenceScores = verifications
      .map((v) => {
        const metadata = v.metadata as Record<string, unknown>;
        return typeof metadata?.oracleConfidence === "number"
          ? metadata.oracleConfidence
          : null;
      })
      .filter((score): score is number => score !== null);

    const threshold = 0.7;
    const lowConfidenceCount = confidenceScores.filter((score) => score < threshold).length;
    const averageConfidence =
      confidenceScores.length > 0
        ? confidenceScores.reduce((a, b) => a + b, 0) / confidenceScores.length
        : 0;

    return {
      totalVerifications: verifications.length,
      averageConfidence,
      lowConfidenceCount,
      lowConfidencePercentage:
        verifications.length > 0 ? (lowConfidenceCount / verifications.length) * 100 : 0,
      threshold,
    };
  } catch (error) {
    logger.error("Failed to get confidence statistics", {
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
}
