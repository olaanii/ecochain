/**
 * Reject Fraud Review
 * 
 * POST /api/admin/review-queue/:reviewId/reject
 * 
 * Requirements: 33.4, 33.5
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireCurrentDbUser, requireRole } from '@/lib/auth/current-user';
import { rateLimitMiddleware } from '@/lib/api/middleware/rate-limit';
import { writeAuditLog, AuditActions } from '@/lib/audit/log';
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
  const rl = await rateLimitMiddleware(request);
  if (!rl.allowed) return rl.response!;

  const actor = await requireCurrentDbUser();
  if ('error' in actor) return actor.error;
  const roleErr = requireRole(actor, ['admin', 'owner']);
  if (roleErr) return roleErr;

  try {
    // Parse request body
    const body = await request.json();
    const { reason } = RejectSchema.parse(body);

    const { reviewId } = await params;

    // Look up the review queue entry from Redis to get the real verification ID
    const reviewRaw = await redis.get(`review-queue:${reviewId}`);
    if (!reviewRaw) {
      return NextResponse.json(
        { success: false, error: 'Review item not found or expired' },
        { status: 404 }
      );
    }
    let verificationId: string;
    try {
      const parsed = JSON.parse(reviewRaw) as { verificationId?: string };
      if (!parsed.verificationId) throw new Error('missing_verificationId');
      verificationId = parsed.verificationId;
    } catch {
      return NextResponse.json(
        { success: false, error: 'Malformed review item' },
        { status: 500 }
      );
    }

    // Update verification status
    const verification = await prisma.verification.update({
      where: { id: verificationId },
      data: {
        status: 'rejected',
        rejectionReason: reason,
        reviewedBy: actor.id,
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

    // Set cooldown for this task and drop the review entry from the queue
    const cooldownKey = `cooldown:${verification.userId}:${verification.taskId}`;
    await redis.setex(cooldownKey, 24 * 60 * 60, '1'); // 24 hour cooldown
    await redis.del(`review-queue:${reviewId}`);

    await writeAuditLog({
      actorId: actor.clerkId,
      action: AuditActions.VERIFICATION_REJECTED,
      resource: 'Verification',
      resourceId: verification.id,
      payload: { reason, reviewId },
      req: request,
    });

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
