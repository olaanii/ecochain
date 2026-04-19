/**
 * Proof Submission API
 * 
 * POST /api/tasks/:taskId/submit - Submit proof for task verification
 * 
 * Requirements: 2.1, 2.2, 2.3, 2.6, 2.8
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma/client';
import { redis } from '@/lib/redis/client';
import { z } from 'zod';
import { auth } from '@clerk/nextjs/server';
import {
  validateTaskId,
  validateTimestamp,
  validateFileSize,
  validateGeolocation,
} from '@/lib/api/validation';
import { generateAndValidateProofHash } from '@/lib/verification/proof-hash';

// Validation schema for proof submission
const ProofSubmissionSchema = z.object({
  proofType: z.enum(['photo', 'transit', 'weight', 'sensor', 'api']),
  proofData: z.string().min(1, 'Proof data cannot be empty'),
  timestamp: z.number().int(),
  geolocation: z.object({
    latitude: z.number(),
    longitude: z.number(),
  }).optional(),
  metadata: z.record(z.unknown()).optional(),
});

type ProofSubmission = z.infer<typeof ProofSubmissionSchema>;

/**
 * POST /api/tasks/:taskId/submit
 * Submit proof for task verification
 * 
 * Requirements: 2.1, 2.2, 2.3, 2.6, 2.8
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { taskId: string } }
) {
  const startTime = Date.now();

  try {
    // Authenticate user
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Unauthorized',
        },
        { status: 401 }
      );
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: 'User not found',
        },
        { status: 404 }
      );
    }

    const { taskId } = params;

    // Requirement 2.1: Validate task exists and is active
    if (!validateTaskId(taskId)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid task ID format',
        },
        { status: 400 }
      );
    }

    const task = await prisma.task.findUnique({
      where: { id: taskId },
      select: {
        id: true,
        active: true,
        requirements: true,
      },
    });

    if (!task) {
      return NextResponse.json(
        {
          success: false,
          error: 'Task not found',
        },
        { status: 404 }
      );
    }

    if (!task.active) {
      return NextResponse.json(
        {
          success: false,
          error: 'Task is not active',
        },
        { status: 400 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const submission = ProofSubmissionSchema.parse(body);

    // Requirement 2.2: Validate proof data is non-empty and properly formatted
    if (!submission.proofData || submission.proofData.trim().length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Proof data cannot be empty',
        },
        { status: 400 }
      );
    }

    // Validate file size does not exceed 10MB
    const proofDataSizeInBytes = Buffer.byteLength(submission.proofData, 'utf8');
    if (!validateFileSize(proofDataSizeInBytes, 10)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Proof data exceeds 10MB limit',
        },
        { status: 400 }
      );
    }

    // Requirement 2.3: Validate timestamp within 48 hours
    if (!validateTimestamp(submission.timestamp)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Timestamp must be within 48 hours and not in the future',
        },
        { status: 400 }
      );
    }

    // Requirement 2.8: Validate geolocation if required by task
    const taskRequirements = task.requirements as Record<string, unknown>;
    if (taskRequirements?.requiresGeolocation && submission.geolocation) {
      const { latitude, longitude } = submission.geolocation;
      if (!validateGeolocation(latitude, longitude)) {
        return NextResponse.json(
          {
            success: false,
            error: 'Invalid geolocation coordinates',
          },
          { status: 400 }
        );
      }
    } else if (taskRequirements?.requiresGeolocation && !submission.geolocation) {
      return NextResponse.json(
        {
          success: false,
          error: 'Geolocation is required for this task',
        },
        { status: 400 }
      );
    }

    // Requirement 2.4, 2.5: Generate proof hash and check uniqueness
    const hashResult = await generateAndValidateProofHash(
      submission.proofData,
      submission.timestamp
    );

    if (!hashResult.isValid) {
      return NextResponse.json(
        {
          success: false,
          error: hashResult.error || 'Invalid proof hash',
        },
        { status: 400 }
      );
    }

    const proofHash = hashResult.hash;

    // Create verification record with pending status
    const verification = await prisma.verification.create({
      data: {
        taskId,
        userId: user.id,
        proofHash,
        proofType: submission.proofType,
        proofData: submission.proofData,
        status: 'pending',
        metadata: {
          submittedAt: new Date().toISOString(),
          ...submission.metadata,
        },
        geoHash: submission.geolocation
          ? `${submission.geolocation.latitude},${submission.geolocation.longitude}`
          : null,
      },
      select: {
        id: true,
        proofHash: true,
        status: true,
        createdAt: true,
      },
    });

    // Invalidate task cache
    await redis.del(`task:${taskId}`);

    const responseTime = Date.now() - startTime;

    return NextResponse.json(
      {
        success: true,
        data: {
          verificationId: verification.id,
          proofHash: verification.proofHash,
          status: verification.status,
          createdAt: verification.createdAt,
        },
        responseTime,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('[API] Error submitting proof:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid request body',
          details: error.errors,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
