/**
 * Task Management API
 * 
 * GET /api/tasks - Get list of tasks with filters and pagination
 * 
 * Requirements: 1.1, 1.2, 1.3, 1.4, 1.6, 1.7
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma/client';
import { redis } from '@/lib/redis/client';
import { z } from 'zod';

// Validation schema for query parameters
const TaskQuerySchema = z.object({
  category: z.string().optional(),
  minReward: z.coerce.number().int().min(0).optional(),
  maxReward: z.coerce.number().int().min(0).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});

type TaskQuery = z.infer<typeof TaskQuerySchema>;

/**
 * GET /api/tasks
 * Get list of tasks with filters and pagination
 * 
 * Query Parameters:
 * - category: Filter by category (transit, recycling, energy, community)
 * - minReward: Minimum reward amount
 * - maxReward: Maximum reward amount
 * - page: Page number (default: 1)
 * - limit: Items per page (default: 20, max: 50)
 * 
 * Requirements: 1.1, 1.2, 1.3, 1.4, 1.6, 1.7
 */
export async function GET(request: NextRequest) {
  const startTime = Date.now();

  try {
    // Parse and validate query parameters
    const searchParams = request.nextUrl.searchParams;
    const queryParams = {
      category: searchParams.get('category') || undefined,
      minReward: searchParams.get('minReward') ? parseInt(searchParams.get('minReward')!) : undefined,
      maxReward: searchParams.get('maxReward') ? parseInt(searchParams.get('maxReward')!) : undefined,
      page: searchParams.get('page') ? parseInt(searchParams.get('page')!) : 1,
      limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 20,
    };

    const query = TaskQuerySchema.parse(queryParams);

    // Generate cache key
    const cacheKey = `tasks:list:${JSON.stringify(query)}`;

    // Try to get from cache
    const cached = await redis.get(cacheKey);
    if (cached) {
      const result = JSON.parse(cached);
      const responseTime = Date.now() - startTime;

      return NextResponse.json({
        success: true,
        data: result.tasks,
        pagination: result.pagination,
        cached: true,
        responseTime,
      });
    }

    // Build filter conditions
    const where: any = {
      active: true,
    };

    if (query.category) {
      where.category = query.category;
    }

    if (query.minReward !== undefined || query.maxReward !== undefined) {
      where.baseReward = {};
      if (query.minReward !== undefined) {
        where.baseReward.gte = query.minReward;
      }
      if (query.maxReward !== undefined) {
        where.baseReward.lte = query.maxReward;
      }
    }

    // Get total count for pagination
    const total = await prisma.task.count({ where });

    // Get tasks with pagination
    const skip = (query.page - 1) * query.limit;
    const tasks = await prisma.task.findMany({
      where,
      skip,
      take: query.limit,
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
        createdAt: true,
      },
      orderBy: {
        baseReward: 'desc',
      },
    });

    // Format response
    const formattedTasks = tasks.map((task) => ({
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
    }));

    const pagination = {
      page: query.page,
      limit: query.limit,
      total,
      pages: Math.ceil(total / query.limit),
    };

    const result = {
      tasks: formattedTasks,
      pagination,
    };

    // Cache for 5 minutes
    await redis.setex(cacheKey, 300, JSON.stringify(result));

    const responseTime = Date.now() - startTime;

    // Requirement 1.7: Execute queries within 100ms
    if (responseTime > 100) {
      console.warn(`[API] Task list query took ${responseTime}ms (target: <100ms)`);
    }

    return NextResponse.json({
      success: true,
      data: formattedTasks,
      pagination,
      cached: false,
      responseTime,
    });
  } catch (error) {
    console.error('[API] Error fetching tasks:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid query parameters',
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
