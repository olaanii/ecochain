/**
 * Approve Fraud Review
 * 
 * POST /api/admin/review-queue/:reviewId/approve
 * 
 * Requirements: 33.4, 33.5
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma/client';
import { redis } from '@/lib/redis/client';

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

    const { reviewId } = await params;

    // Get verification from review ID (extract verification ID from review ID)
    const verificationId = reviewId.replace('review-', '').split('-').slice(0, -1).join('-');

    // Update verification status
    const verification = await prisma.verification.update({
      where: { id: verificationId },
      data: {
        status: 'verified',
        reviewedBy: admin.id,
      },
      include: {
        user: { select: { id: true, displayName: true } },
        task: { select: { id: true, name: true } },
      },
    });

    // Create ledger entry for approved reward
    if (verification.reward > 0) {
      await prisma.ledgerEntry.create({
        data: {
          userId: verification.userId,
          amount: verification.reward,
          type: 'mint',
          source: verification.taskId,
          transactionHash: verification.transactionHash || undefined,
          metadata: {
            verificationId: verification.id,
            approvedBy: admin.id,
            approvedAt: new Date().toISOString(),
          },
        },
      });

      // Update user total rewards
      await prisma.user.update({
        where: { id: verification.userId },
        data: {
          totalRewards: {
            increment: verification.reward,
          },
        },
      });

      // Invalidate cache
      await redis.del(`user:balance:${verification.userId}`);
      await redis.del(`user:stats:${verification.userId}`);
    }

    // Create notification
    await prisma.notification.create({
      data: {
        userId: verification.userId,
        type: 'verification_approved',
        title: 'Verification Approved',
        message: `Your submission for "${verification.task.name}" has been approved. You earned ${verification.reward} ECO!`,
        data: {
          verificationId: verification.id,
          reward: verification.reward,
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Verification approved',
      data: {
        verificationId: verification.id,
        userId: verification.userId,
        reward: verification.reward,
      },
    });
  } catch (error) {
    console.error('[API] Error approving review:', error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
