/**
 * Oracle Retry and Timeout Handler
 * 
 * Requirement 3.6, 3.8, 3.9
 * Handles oracle timeouts and retries with exponential backoff
 */

import { logger } from "@/lib/api/middleware/logging";
import { prisma } from "@/lib/prisma/client";

export interface RetryConfig {
  maxRetries: number;
  initialDelayMs: number;
  backoffMultiplier: number;
  maxDelayMs: number;
}

export interface RetryResult<T> {
  success: boolean;
  data?: T;
  error?: Error;
  retryCount: number;
  totalTimeMs: number;
}

/**
 * Execute oracle call with retry logic
 * Requirement 3.6, 3.8, 3.9
 */
export async function executeWithRetry<T>(
  oracleCall: () => Promise<T>,
  verificationId: string,
  config: RetryConfig = {
    maxRetries: 3,
    initialDelayMs: 1000,
    backoffMultiplier: 2,
    maxDelayMs: 30000,
  }
): Promise<RetryResult<T>> {
  let lastError: Error | null = null;
  let retryCount = 0;
  const startTime = Date.now();

  for (let attempt = 0; attempt <= config.maxRetries; attempt++) {
    try {
      logger.info(`Oracle call attempt ${attempt + 1}/${config.maxRetries + 1}`, {
        verificationId,
      });

      const result = await oracleCall();

      logger.info("Oracle call succeeded", {
        verificationId,
        attempt: attempt + 1,
        timeMs: Date.now() - startTime,
      });

      return {
        success: true,
        data: result,
        retryCount: attempt,
        totalTimeMs: Date.now() - startTime,
      };
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      retryCount = attempt;

      // If this was the last attempt, mark for manual review
      if (attempt === config.maxRetries) {
        logger.error("Oracle call failed after all retries", {
          verificationId,
          attempts: attempt + 1,
          error: lastError.message,
          timeMs: Date.now() - startTime,
        });

        // Mark verification for manual review
        await markVerificationForManualReview(verificationId, lastError.message);

        return {
          success: false,
          error: lastError,
          retryCount: attempt,
          totalTimeMs: Date.now() - startTime,
        };
      }

      // Calculate delay for next retry with exponential backoff
      const delayMs = Math.min(
        config.initialDelayMs * Math.pow(config.backoffMultiplier, attempt),
        config.maxDelayMs
      );

      logger.warn("Oracle call failed, retrying", {
        verificationId,
        attempt: attempt + 1,
        error: lastError.message,
        delayMs,
      });

      // Mark verification as pending on timeout
      if (lastError.message.includes("timeout")) {
        await markVerificationAsPending(verificationId);
      }

      // Wait before retry
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }

  // Should not reach here, but return error just in case
  return {
    success: false,
    error: lastError || new Error("Unknown error"),
    retryCount,
    totalTimeMs: Date.now() - startTime,
  };
}

/**
 * Mark verification as pending on timeout
 * Requirement 3.6, 3.8
 */
async function markVerificationAsPending(verificationId: string): Promise<void> {
  try {
    await prisma.verification.update({
      where: { id: verificationId },
      data: {
        status: "pending",
        metadata: {
          retryQueued: true,
          queuedAt: new Date().toISOString(),
        },
      },
    });

    logger.info("Verification marked as pending", { verificationId });
  } catch (error) {
    logger.error("Failed to mark verification as pending", {
      verificationId,
      error: error instanceof Error ? error.message : String(error),
    });
  }
}

/**
 * Mark verification for manual review
 * Requirement 3.9
 */
async function markVerificationForManualReview(
  verificationId: string,
  reason: string
): Promise<void> {
  try {
    await prisma.verification.update({
      where: { id: verificationId },
      data: {
        status: "manual_review",
        metadata: {
          manualReviewReason: reason,
          markedForReviewAt: new Date().toISOString(),
          allRetriesFailed: true,
        },
      },
    });

    logger.info("Verification marked for manual review", {
      verificationId,
      reason,
    });
  } catch (error) {
    logger.error("Failed to mark verification for manual review", {
      verificationId,
      error: error instanceof Error ? error.message : String(error),
    });
  }
}

/**
 * Queue verification for retry
 * Requirement 3.8
 */
export async function queueVerificationForRetry(
  verificationId: string,
  delayMs: number = 5000
): Promise<void> {
  try {
    // In a production system, this would queue to a job queue (e.g., Bull, RabbitMQ)
    // For now, we'll use a simple timeout
    setTimeout(async () => {
      logger.info("Retrying verification from queue", { verificationId });
      // Retry logic would be called here
    }, delayMs);

    logger.info("Verification queued for retry", {
      verificationId,
      delayMs,
    });
  } catch (error) {
    logger.error("Failed to queue verification for retry", {
      verificationId,
      error: error instanceof Error ? error.message : String(error),
    });
  }
}
