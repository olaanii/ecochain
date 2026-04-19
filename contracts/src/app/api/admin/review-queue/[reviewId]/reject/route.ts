/**
 * Reject Fraud Review
 * 
 * POST /api/admin/review-queue/:reviewId/reject
 * 
 * Requirements: 33.4, 33.5
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma/client';
import { redis } from '@/lib/redis/client';
import { z } from 'zod';

const RejectSchema = z.object({
  reason: z.string().min(1).max(500),
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ reviewId: string }> }
) {
  try {
    const { userId } = auth();

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if user is admin
    const admin = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: { role: true, id: true },
    });

    if (!admin || admin.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Forbidden' },
        { status: 403 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { reason } = RejectSchema.parse(body);

    const { reviewId } = await params;

    // Get verification from review ID
    const verificationId = reviewId.replace('review-', '').split('-').slice(0, -1).join('-');

    // Update verification status
    const verification = await prisma.verification.update({
      where: { id: verificationId },
      data: {
        status: 'rejected',
        rejectionReason: reason,
        reviewedBy: admin.id,
      },
      include: {
        user: { select: { id: true, displayName: true } },
        task: { select: { id: true, name: true } },
      },
    });

    // Create notification
    await prisma.notification.create({
      data: {
        userId: verification.userId,
        type: 'verification_rejected',
        title: 'Verification Rejected',
        message: `Your submission for "${verification.task.name}" was rejected. Reason: ${reason}`,
        data: {
          verificationId: verification.id,
          reason,
        },
      },
    });

    // Set cooldown for this task
    const cooldownKey = `cooldown:${verification.userId}:${verification.taskId}`;
    await redis.setex(cooldownKey, 24 * 60 * 60, '1'); // 24 hour cooldown

    return NextResponse.json({
      success: true,
      message: 'Verification rejected',
      data: {
        verificationId: verification.id,
        userId: verification.userId,
        reason,
      },
    });
  } catch (error) {
    console.error('[API] Error rejecting review:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid request',
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
