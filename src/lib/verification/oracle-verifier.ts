/**
 * Oracle Verifier
 * 
 * Requirement 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.8, 3.9
 * Orchestrates oracle verification workflow
 */

import { logger } from "@/lib/api/middleware/logging";
import { prisma } from "@/lib/prisma/client";
import { routeProofToOracle, OracleType } from "./oracle-router";
import { analyzeImageWithVision, meetsConfidenceThreshold } from "./ai-vision-oracle";
import { executeWithRetry } from "./oracle-retry-handler";
import { validateConfidenceThreshold, rejectLowConfidenceVerification, logLowConfidenceSubmission } from "./confidence-validator";
import { ProofType } from "@/types/verification";

export interface OracleVerificationRequest {
  verificationId: string;
  taskId: string;
  userId: string;
  proofType: ProofType;
  proofData: {
    imageUrl?: string;
    transitCardId?: string;
    sensorData?: Record<string, unknown>;
    apiResponse?: Record<string, unknown>;
  };
  taskContext: string;
}

export interface OracleVerificationResult {
  verificationId: string;
  status: "verified" | "rejected" | "pending" | "manual_review";
  confidence: number;
  description: string;
  labels: string[];
  rejectionReason?: string;
  metadata: Record<string, unknown>;
}

/**
 * Verify proof using appropriate oracle
 * Requirement 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.8, 3.9
 */
export async function verifyProofWithOracle(
  request: OracleVerificationRequest
): Promise<OracleVerificationResult> {
  logger.info("Starting oracle verification", {
    verificationId: request.verificationId,
    proofType: request.proofType,
  });

  try {
    // Route to appropriate oracle
    const route = routeProofToOracle(request.proofType);

    // Execute oracle call with retry logic
    const result = await executeWithRetry(
      () => callOracle(request, route.type),
      request.verificationId,
      {
        maxRetries: route.retryCount,
        initialDelayMs: 1000,
        backoffMultiplier: route.retryBackoff,
        maxDelayMs: route.timeout,
      }
    );

    if (!result.success) {
      logger.error("Oracle verification failed", {
        verificationId: request.verificationId,
        error: result.error?.message,
      });

      return {
        verificationId: request.verificationId,
        status: "manual_review",
        confidence: 0,
        description: "Oracle verification failed",
        labels: [],
        rejectionReason: result.error?.message,
        metadata: {
          oracleError: result.error?.message,
          retryCount: result.retryCount,
          totalTimeMs: result.totalTimeMs,
        },
      };
    }

    const oracleResult = result.data!;

    // Validate confidence score
    const validation = validateConfidenceThreshold(oracleResult.confidence);

    if (!validation.isValid) {
      logger.warn("Oracle confidence below threshold", {
        verificationId: request.verificationId,
        confidence: oracleResult.confidence,
        threshold: validation.threshold,
      });

      // Reject verification with low confidence
      await rejectLowConfidenceVerification(
        request.verificationId,
        oracleResult.confidence,
        validation.threshold
      );

      // Log for analysis
      await logLowConfidenceSubmission(
        request.verificationId,
        oracleResult.confidence,
        request.taskId,
        request.userId,
        {
          description: oracleResult.description,
          labels: oracleResult.labels,
        }
      );

      return {
        verificationId: request.verificationId,
        status: "rejected",
        confidence: oracleResult.confidence,
        description: oracleResult.description,
        labels: oracleResult.labels,
        rejectionReason: validation.rejectionReason,
        metadata: {
          oracleConfidence: oracleResult.confidence,
          confidenceThreshold: validation.threshold,
          rejectedAt: new Date().toISOString(),
        },
      };
    }

    // Verification passed
    logger.info("Oracle verification passed", {
      verificationId: request.verificationId,
      confidence: oracleResult.confidence,
    });

    return {
      verificationId: request.verificationId,
      status: "verified",
      confidence: oracleResult.confidence,
      description: oracleResult.description,
      labels: oracleResult.labels,
      metadata: {
        oracleConfidence: oracleResult.confidence,
        oracleType: route.type,
        verifiedAt: new Date().toISOString(),
        ...oracleResult.metadata,
      },
    };
  } catch (error) {
    logger.error("Oracle verification error", {
      verificationId: request.verificationId,
      error: error instanceof Error ? error.message : String(error),
    });

    return {
      verificationId: request.verificationId,
      status: "manual_review",
      confidence: 0,
      description: "Oracle verification error",
      labels: [],
      rejectionReason: error instanceof Error ? error.message : "Unknown error",
      metadata: {
        error: error instanceof Error ? error.message : String(error),
      },
    };
  }
}

/**
 * Call appropriate oracle based on proof type
 */
async function callOracle(
  request: OracleVerificationRequest,
  oracleType: OracleType
): Promise<{
  confidence: number;
  description: string;
  labels: string[];
  metadata: Record<string, unknown>;
}> {
  switch (oracleType) {
    case OracleType.AI_VISION:
      if (!request.proofData.imageUrl) {
        throw new Error("Image URL required for AI vision oracle");
      }
      return await analyzeImageWithVision(
        request.proofData.imageUrl,
        request.taskContext,
        30000
      );

    case OracleType.TRANSIT_API:
      return await callTransitOracle(request);

    case OracleType.SENSOR_IOT:
      return await callSensorOracle(request);

    case OracleType.EXTERNAL_API:
      return await callExternalApiOracle(request);

    default:
      throw new Error(`Unknown oracle type: ${oracleType}`);
  }
}

/**
 * Call transit API oracle
 */
async function callTransitOracle(request: OracleVerificationRequest): Promise<{
  confidence: number;
  description: string;
  labels: string[];
  metadata: Record<string, unknown>;
}> {
  // Placeholder for transit API integration
  // In production, this would call the actual transit API
  logger.info("Calling transit oracle", {
    verificationId: request.verificationId,
  });

  return {
    confidence: 0.85,
    description: "Transit card verified",
    labels: ["transit", "verified"],
    metadata: {
      transitCardId: request.proofData.transitCardId,
    },
  };
}

/**
 * Call sensor/IoT oracle
 */
async function callSensorOracle(request: OracleVerificationRequest): Promise<{
  confidence: number;
  description: string;
  labels: string[];
  metadata: Record<string, unknown>;
}> {
  // Placeholder for sensor API integration
  // In production, this would call the actual sensor API
  logger.info("Calling sensor oracle", {
    verificationId: request.verificationId,
  });

  return {
    confidence: 0.9,
    description: "Sensor data verified",
    labels: ["sensor", "iot", "verified"],
    metadata: {
      sensorData: request.proofData.sensorData,
    },
  };
}

/**
 * Call external API oracle
 */
async function callExternalApiOracle(request: OracleVerificationRequest): Promise<{
  confidence: number;
  description: string;
  labels: string[];
  metadata: Record<string, unknown>;
}> {
  // Placeholder for external API integration
  // In production, this would call the actual external API
  logger.info("Calling external API oracle", {
    verificationId: request.verificationId,
  });

  return {
    confidence: 0.8,
    description: "External API verification passed",
    labels: ["api", "verified"],
    metadata: {
      apiResponse: request.proofData.apiResponse,
    },
  };
}
