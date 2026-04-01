/**
 * Task Bonus Multiplier API
 * 
 * GET /api/tasks/:taskId/bonus - Get bonus multiplier for current user
 * 
 * Requirements: 1.5, 5.1, 5.2, 5.3, 5.4
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma/client';
import { calculateBonusMultiplier, calculatePotentialReward } from '@/lib/tasks/bonus-multiplier';
import { auth } from '@clerk/nextjs/server';

/**
 * GET /api/tasks/:taskId/bonus
 * Get bonus multiplier and potential reward for current user
 * 
 * Requirements: 1.5, 5.1, 5.2, 5.3, 5.4
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { taskId: string } }
) {
  try {
    const { userId } = auth();

    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Unauthorized',
        },
        { status: 401 }
      );
    }

    const { taskId } = params;

    // Get task details
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      select: {
        id: true,
        name: true,
        baseReward: true,
        category: true,
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

    // Get user
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

    // Calculate bonus multiplier and potential reward
    const reward = await calculatePotentialReward(
      user.id,
      taskId,
      task.baseReward,
      task.category
    );

    return NextResponse.json({
      success: true,
      data: {
        taskId: task.id,
        taskName: task.name,
        baseReward: reward.baseReward,
        multiplier: reward.multiplier,
        potentialReward: reward.potentialReward,
      },
    });
  } catch (error) {
    console.error('[API] Error calculating bonus:', error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
