/**
 * Proof Submission Service
 * 
 * Orchestrates the complete proof submission workflow:
 * 1. Validate proof data
 * 2. Generate proof hash
 * 3. Upload to IPFS
 * 4. Create verification record
 * 
 * Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.8, 3.7, 29.8, 29.9
 */

import { prisma } from '@/lib/prisma/client';
import { redis } from '@/lib/redis/client';
import { generateAndValidateProofHash } from './proof-hash';
import { uploadProofToIPFS } from './ipfs-uploader';

/**
 * Proof submission request
 */
export interface ProofSubmissionRequest {
  taskId: string;
  userId: string;
  proofType: 'photo' | 'transit' | 'weight' | 'sensor' | 'api';
  proofData: string;
  timestamp: number;
  geolocation?: {
    latitude: number;
    longitude: number;
  };
  metadata?: Record<string, unknown>;
}

/**
 * Proof submission result
 */
export interface ProofSubmissionResult {
  success: boolean;
  verificationId?: string;
  proofHash?: string;
  ipfsHash?: string;
  status?: string;
  error?: string;
  details?: Record<string, unknown>;
}

/**
 * Proof Submission Service
 */
export class ProofSubmissionService {
  /**
   * Submit proof for task verification
   * 
   * Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.8, 3.7, 29.8, 29.9
   */
  async submitProof(request: ProofSubmissionRequest): Promise<ProofSubmissionResult> {
    try {
      // Step 1: Validate task exists and is active
      const task = await prisma.task.findUnique({
        where: { id: request.taskId },
        select: {
          id: true,
          active: true,
          requirements: true,
        },
      });

      if (!task) {
        return {
          success: false,
          error: 'Task not found',
        };
      }

      if (!task.active) {
        return {
          success: false,
          error: 'Task is not active',
        };
      }

      // Step 2: Validate proof data
      if (!request.proofData || request.proofData.trim().length === 0) {
        return {
          success: false,
          error: 'Proof data cannot be empty',
        };
      }

      // Validate file size (10MB max)
      const proofDataSizeInBytes = Buffer.byteLength(request.proofData, 'utf8');
      if (proofDataSizeInBytes > 10 * 1024 * 1024) {
        return {
          success: false,
          error: 'Proof data exceeds 10MB limit',
        };
      }

      // Step 3: Validate timestamp
      const now = Date.now();
      const timestampMs = request.timestamp * 1000; // Convert to milliseconds if needed
      const timeDiff = now - timestampMs;

      if (timeDiff < 0) {
        return {
          success: false,
          error: 'Timestamp cannot be in the future',
        };
      }

      if (timeDiff > 48 * 60 * 60 * 1000) {
        return {
          success: false,
          error: 'Proof timestamp is older than 48 hours',
        };
      }

      // Step 4: Validate geolocation if required
      const taskRequirements = task.requirements as Record<string, unknown>;
      if (taskRequirements?.requiresGeolocation) {
        if (!request.geolocation) {
          return {
            success: false,
            error: 'Geolocation is required for this task',
          };
        }

        const { latitude, longitude } = request.geolocation;
        if (
          typeof latitude !== 'number' ||
          typeof longitude !== 'number' ||
          latitude < -90 ||
          latitude > 90 ||
          longitude < -180 ||
          longitude > 180
        ) {
          return {
            success: false,
            error: 'Invalid geolocation coordinates',
          };
        }
      }

      // Step 5: Generate and validate proof hash
      const hashResult = await generateAndValidateProofHash(
        request.proofData,
        request.timestamp
      );

      if (!hashResult.isValid) {
        return {
          success: false,
          error: hashResult.error || 'Invalid proof hash',
          details: {
            isDuplicate: hashResult.isDuplicate,
          },
        };
      }

      const proofHash = hashResult.hash;

      // Step 6: Upload proof to IPFS
      let ipfsHash: string | undefined;
      try {
        const uploadResult = await uploadProofToIPFS(
          request.proofData,
          `proof-${proofHash.slice(0, 8)}`
        );

        if (uploadResult.success && uploadResult.ipfsHash) {
          ipfsHash = uploadResult.ipfsHash;
        } else {
          console.warn('[ProofSubmission] IPFS upload failed:', uploadResult.error);
          // Continue without IPFS hash - it's not critical
        }
      } catch (error) {
        console.error('[ProofSubmission] Error uploading to IPFS:', error);
        // Continue without IPFS hash
      }

      // Step 7: Create verification record
      const verification = await prisma.verification.create({
        data: {
          taskId: request.taskId,
          userId: request.userId,
          proofHash,
          proofType: request.proofType,
          proofData: request.proofData,
          status: 'pending',
          ipfsHash: ipfsHash || null,
          metadata: {
            submittedAt: new Date().toISOString(),
            ...request.metadata,
          },
          geoHash: request.geolocation
            ? `${request.geolocation.latitude},${request.geolocation.longitude}`
            : null,
        },
        select: {
          id: true,
          proofHash: true,
          status: true,
          ipfsHash: true,
          createdAt: true,
        },
      });

      // Step 8: Invalidate caches
      await redis.del(`task:${request.taskId}`);
      await redis.del(`user:${request.userId}:verifications`);

      return {
        success: true,
        verificationId: verification.id,
        proofHash: verification.proofHash,
        ipfsHash: verification.ipfsHash || undefined,
        status: verification.status,
      };
    } catch (error) {
      console.error('[ProofSubmission] Error submitting proof:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Get proof submission status
   */
  async getSubmissionStatus(verificationId: string) {
    try {
      const verification = await prisma.verification.findUnique({
        where: { id: verificationId },
        select: {
          id: true,
          status: true,
          proofHash: true,
          ipfsHash: true,
          reward: true,
          oracleConfidence: true,
          createdAt: true,
          verifiedAt: true,
        },
      });

      if (!verification) {
        return {
          success: false,
          error: 'Verification not found',
        };
      }

      return {
        success: true,
        data: verification,
      };
    } catch (error) {
      console.error('[ProofSubmission] Error getting submission status:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Get user's submission history
   */
  async getUserSubmissionHistory(userId: string, limit = 50, offset = 0) {
    try {
      const verifications = await prisma.verification.findMany({
        where: { userId },
        select: {
          id: true,
          taskId: true,
          status: true,
          reward: true,
          createdAt: true,
          verifiedAt: true,
          task: {
            select: {
              name: true,
              category: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      });

      const total = await prisma.verification.count({
        where: { userId },
      });

      return {
        success: true,
        data: {
          verifications,
          total,
          limit,
          offset,
        },
      };
    } catch (error) {
      console.error('[ProofSubmission] Error getting submission history:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
}

/**
 * Create proof submission service instance
 */
export function createProofSubmissionService(): ProofSubmissionService {
  return new ProofSubmissionService();
}
