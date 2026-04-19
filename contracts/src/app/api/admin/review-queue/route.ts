/**
 * Admin Review Queue API
 * 
 * GET /api/admin/review-queue - Get pending reviews
 * POST /api/admin/review-queue/:reviewId/approve - Approve review
 * POST /api/admin/review-queue/:reviewId/reject - Reject review
 * 
 * Requirements: 4.8, 4.9, 33.2, 33.3, 33.4, 33.5
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma/client';
import { redis } from '@/lib/redis/client';

/**
 * GET /api/admin/review-queue
 * Get pending fraud reviews
 */
export async function GET(request: NextRequest) {
  try {
    const { userId } = auth();

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: { role: true },
    });

    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Forbidden' },
        { status: 403 }
      );
    }

    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status') || 'pending';
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Get verifications flagged for review
    const flaggedVerifications = await prisma.verification.findMany({
      where: {
        fraudScore: { gt: 0.5 },
        status: 'pending',
      },
      include: {
        user: {
          select: {
            id: true,
            displayName: true,
            initiaAddress: true,
          },
        },
        task: {
          select: {
            id: true,
            name: true,
            category: true,
          },
        },
      },
      orderBy: { fraudScore: 'desc' },
      take: limit,
      skip: offset,
    });

    // Get total count
    const total = await prisma.verification.count({
      where: {
        fraudScore: { gt: 0.5 },
        status: 'pending',
      },
    });

    return NextResponse.json({
      success: true,
      data: flaggedVerifications.map((v) => ({
        id: v.id,
        userId: v.userId,
        userName: v.user.displayName,
        userAddress: v.user.initiaAddress,
        taskId: v.taskId,
        taskName: v.task.name,
        taskCategory: v.task.category,
        fraudScore: v.fraudScore,
        proofHash: v.proofHash,
        metadata: v.metadata,
        createdAt: v.createdAt,
      })),
      pagination: {
        limit,
        offset,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('[API] Error fetching review queue:', error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
