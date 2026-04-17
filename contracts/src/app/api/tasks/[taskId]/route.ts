/**
 * Task Detail API
 * 
 * GET /api/tasks/:taskId - Get single task details
 * 
 * Requirements: 1.1, 1.4
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma/client';
import { redis } from '@/lib/redis/client';

/**
 * GET /api/tasks/:taskId
 * Get single task details with verification requirements
 * 
 * Requirements: 1.1, 1.4
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { taskId: string } }
) {
  const startTime = Date.now();

  try {
    const { taskId } = params;

    // Validate taskId format
    if (!taskId || typeof taskId !== 'string') {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid task ID',
        },
        { status: 400 }
      );
    }

    // Generate cache key
    const cacheKey = `task:${taskId}`;

    // Try to get from cache
    const cached = await redis.get(cacheKey);
    if (cached) {
      const task = JSON.parse(cached);
      const responseTime = Date.now() - startTime;

      return NextResponse.json({
        success: true,
        data: task,
        cached: true,
        responseTime,
      });
    }

    // Get task from database
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      select: {
        id: true,
        slug: true,
        name: true,
        description: true,
        verificationHint: true,
        category: true,
        baseReward: true,
        bonusFactor: true,
        verificationMethod: true,
        requirements: true,
        active: true,
        createdAt: true,
        updatedAt: true,
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

    // Format response
    const formattedTask = {
      id: task.id,
      slug: task.slug,
      name: task.name,
      description: task.description,
      verificationHint: task.verificationHint,
      category: task.category,
      baseReward: task.baseReward,
      bonusFactor: task.bonusFactor,
      verificationMethod: task.verificationMethod,
      requirements: task.requirements,
      active: task.active,
    };

    // Cache for 5 minutes
    await redis.setex(cacheKey, 300, JSON.stringify(formattedTask));

    const responseTime = Date.now() - startTime;

    return NextResponse.json({
      success: true,
      data: formattedTask,
      cached: false,
      responseTime,
    });
  } catch (error) {
    console.error('[API] Error fetching task:', error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
