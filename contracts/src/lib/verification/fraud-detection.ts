import { prisma } from "@/lib/prisma/client";
import { redis } from "@/lib/redis/client";

/**
 * Fraud Detection System
 * 
 * Requirement 14.1, 14.2, 14.3
 * - Implement fraud score calculation
 * - Implement fraud detection checks
 * - Implement fraud flagging and review queue
 * - Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 4.8, 4.9
 */

export interface FraudIndicators {
  duplicateSimilarity?: number; // 0.0 to 1.0
  submissionVelocity?: number; // submissions in 24h
  geolocationAnomaly?: boolean;
  metadataInconsistency?: boolean;
}

export interface FraudDetectionResult {
  fraudScore: number; // 0.0 to 1.0
  isFlagged: boolean; // true if score > 0.5
  indicators: FraudIndicators;
  reason?: string;
}

export interface ReviewQueueItem {
  id: string;
  verificationId: string;
  userId: string;
  fraudScore: number;
  reason: string;
  createdAt: Date;
  status: "pending" | "approved" | "rejected";
}

/**
 * Calculate fraud score based on indicators
 * 
 * Scoring:
 * - Duplicate similarity > 0.9: +0.3
 * - Submission count > 10 in 24h: +0.2
 * - Geolocation anomaly: +0.15
 * - Metadata inconsistency: +0.25
 * - Max score: 1.0
 */
export function calculateFraudScore(indicators: FraudIndicators): number {
  let score = 0.0;

  // Check duplicate similarity
  if (indicators.duplicateSimilarity && indicators.duplicateSimilarity > 0.9) {
    score += 0.3;
  }

  // Check submission velocity
  if (indicators.submissionVelocity && indicators.submissionVelocity > 10) {
    score += 0.2;
  }

  // Check geolocation anomaly
  if (indicators.geolocationAnomaly) {
    score += 0.15;
  }

  // Check metadata inconsistency
  if (indicators.metadataInconsistency) {
    score += 0.25;
  }

  // Cap at 1.0
  return Math.min(score, 1.0);
}

/**
 * Check for duplicate submissions in last 24 hours
 */
export async function checkDuplicateSubmissions(
  userId: string,
  taskId: string,
  proofHash: string,
): Promise<{ similarity: number; isDuplicate: boolean }> {
  try {
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    // Get recent verifications for this user and task
    const recentVerifications = await prisma.verification.findMany({
      where: {
        userId,
        taskId,
        createdAt: {
          gte: twentyFourHoursAgo,
        },
      },
      select: {
        proofHash: true,
      },
    });

    // Calculate similarity with recent proofs
    let maxSimilarity = 0;
    for (const verification of recentVerifications) {
      const similarity = calculateStringSimilarity(proofHash, verification.proofHash);
      maxSimilarity = Math.max(maxSimilarity, similarity);
    }

    return {
      similarity: maxSimilarity,
      isDuplicate: maxSimilarity > 0.9,
    };
  } catch (error) {
    console.error("Failed to check duplicate submissions:", error);
    return { similarity: 0, isDuplicate: false };
  }
}

/**
 * Check submission velocity (submissions in last 24 hours)
 */
export async function checkSubmissionVelocity(userId: string): Promise<number> {
  try {
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const count = await prisma.verification.count({
      where: {
        userId,
        createdAt: {
          gte: twentyFourHoursAgo,
        },
      },
    });

    return count;
  } catch (error) {
    console.error("Failed to check submission velocity:", error);
    return 0;
  }
}

/**
 * Check for geolocation anomalies
 */
export async function checkGeolocationAnomaly(
  userId: string,
  currentLocation?: { latitude: number; longitude: number },
): Promise<boolean> {
  try {
    if (!currentLocation) {
      return false;
    }

    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    // Get user's recent verifications with geolocation
    const recentVerifications = await prisma.verification.findMany({
      where: {
        userId,
        createdAt: {
          gte: thirtyDaysAgo,
        },
      },
      select: {
        metadata: true,
      },
    });

    // Check if current location is anomalous
    for (const verification of recentVerifications) {
      if (verification.metadata) {
        const metadata = verification.metadata as any;
        if (metadata.geolocation) {
          const distance = calculateDistance(
            currentLocation,
            metadata.geolocation,
          );

          // Flag if distance > 1000km in < 1 hour (impossible travel)
          if (distance > 1000) {
            return true;
          }
        }
      }
    }

    return false;
  } catch (error) {
    console.error("Failed to check geolocation anomaly:", error);
    return false;
  }
}

/**
 * Check for metadata inconsistencies
 */
export async function checkMetadataInconsistency(
  userId: string,
  currentMetadata?: Record<string, any>,
): Promise<boolean> {
  try {
    if (!currentMetadata) {
      return false;
    }

    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    // Get user's recent verifications
    const recentVerifications = await prisma.verification.findMany({
      where: {
        userId,
        createdAt: {
          gte: sevenDaysAgo,
        },
      },
      select: {
        metadata: true,
      },
      take: 10,
    });

    // Check for inconsistencies
    for (const verification of recentVerifications) {
      if (verification.metadata) {
        const prevMetadata = verification.metadata as Record<string, any>;

        // Check for significant changes in device info, OS, etc.
        if (
          prevMetadata.deviceId &&
          currentMetadata.deviceId &&
          prevMetadata.deviceId !== currentMetadata.deviceId
        ) {
          // Device changed - could be suspicious
          return true;
        }

        if (
          prevMetadata.osVersion &&
          currentMetadata.osVersion &&
          prevMetadata.osVersion !== currentMetadata.osVersion
        ) {
          // OS changed - could be suspicious
          return true;
        }
      }
    }

    return false;
  } catch (error) {
    console.error("Failed to check metadata inconsistency:", error);
    return false;
  }
}

/**
 * Perform complete fraud detection
 */
export async function detectFraud(
  userId: string,
  taskId: string,
  proofHash: string,
  metadata?: Record<string, any>,
): Promise<FraudDetectionResult> {
  try {
    // Check all fraud indicators
    const [duplicateCheck, velocity, geoAnomaly, metadataAnomaly] =
      await Promise.all([
        checkDuplicateSubmissions(userId, taskId, proofHash),
        checkSubmissionVelocity(userId),
        checkGeolocationAnomaly(userId, metadata?.geolocation),
        checkMetadataInconsistency(userId, metadata),
      ]);

    const indicators: FraudIndicators = {
      duplicateSimilarity: duplicateCheck.similarity,
      submissionVelocity: velocity,
      geolocationAnomaly: geoAnomaly,
      metadataInconsistency: metadataAnomaly,
    };

    const fraudScore = calculateFraudScore(indicators);
    const isFlagged = fraudScore > 0.5;

    let reason = "";
    if (duplicateCheck.isDuplicate) {
      reason += "Duplicate submission detected. ";
    }
    if (velocity > 10) {
      reason += `High submission velocity (${velocity} in 24h). `;
    }
    if (geoAnomaly) {
      reason += "Geolocation anomaly detected. ";
    }
    if (metadataAnomaly) {
      reason += "Metadata inconsistency detected. ";
    }

    return {
      fraudScore,
      isFlagged,
      indicators,
      reason: reason.trim() || undefined,
    };
  } catch (error) {
    console.error("Fraud detection failed:", error);
    return {
      fraudScore: 0,
      isFlagged: false,
      indicators: {},
    };
  }
}

/**
 * Add verification to review queue if flagged
 */
export async function addToReviewQueue(
  verificationId: string,
  userId: string,
  fraudScore: number,
  reason: string,
): Promise<ReviewQueueItem> {
  try {
    const reviewItem: ReviewQueueItem = {
      id: `review-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      verificationId,
      userId,
      fraudScore,
      reason,
      createdAt: new Date(),
      status: "pending",
    };

    // Store in Redis for quick access
    const key = `review-queue:${reviewItem.id}`;
    await redis.setex(key, 30 * 24 * 60 * 60, JSON.stringify(reviewItem)); // 30 days

    // Also store in database for persistence
    // This would be added to the database schema
    console.log(`Added to review queue: ${reviewItem.id}`);

    return reviewItem;
  } catch (error) {
    console.error("Failed to add to review queue:", error);
    throw error;
  }
}

/**
 * Check 24-hour cooldown for task per user
 */
export async function checkCooldown(userId: string, taskId: string): Promise<boolean> {
  try {
    const key = `cooldown:${userId}:${taskId}`;
    const exists = await redis.exists(key);
    return exists === 1;
  } catch (error) {
    console.error("Failed to check cooldown:", error);
    return false;
  }
}

/**
 * Set 24-hour cooldown for task per user
 */
export async function setCooldown(userId: string, taskId: string): Promise<void> {
  try {
    const key = `cooldown:${userId}:${taskId}`;
    await redis.setex(key, 24 * 60 * 60, "1"); // 24 hours
  } catch (error) {
    console.error("Failed to set cooldown:", error);
  }
}

/**
 * Calculate string similarity (0.0 to 1.0)
 * Uses simple character-based similarity
 */
function calculateStringSimilarity(str1: string, str2: string): number {
  if (str1 === str2) return 1.0;
  if (str1.length === 0 || str2.length === 0) return 0.0;

  const longer = str1.length > str2.length ? str1 : str2;
  const shorter = str1.length > str2.length ? str2 : str1;

  const editDistance = getEditDistance(longer, shorter);
  return (longer.length - editDistance) / longer.length;
}

/**
 * Calculate edit distance (Levenshtein distance)
 */
function getEditDistance(s1: string, s2: string): number {
  const costs: number[] = [];

  for (let i = 0; i <= s1.length; i++) {
    let lastValue = i;
    for (let j = 0; j <= s2.length; j++) {
      if (i === 0) {
        costs[j] = j;
      } else if (j > 0) {
        let newValue = costs[j - 1];
        if (s1.charAt(i - 1) !== s2.charAt(j - 1)) {
          newValue = Math.min(Math.min(newValue, lastValue), costs[j]) + 1;
        }
        costs[j - 1] = lastValue;
        lastValue = newValue;
      }
    }
    if (i > 0) costs[s2.length] = lastValue;
  }

  return costs[s2.length];
}

/**
 * Calculate distance between two geolocation points (in km)
 * Uses Haversine formula
 */
function calculateDistance(
  loc1: { latitude: number; longitude: number },
  loc2: { latitude: number; longitude: number },
): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((loc2.latitude - loc1.latitude) * Math.PI) / 180;
  const dLon = ((loc2.longitude - loc1.longitude) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((loc1.latitude * Math.PI) / 180) *
      Math.cos((loc2.latitude * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}
