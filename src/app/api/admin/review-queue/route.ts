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
import { requireCurrentDbUser, requireRole } from '@/lib/auth/current-user';
import { rateLimitMiddleware } from '@/lib/api/middleware/rate-limit';
import { paginationFor } from '@/lib/api/pagination';
import { prisma } from '@/lib/prisma/client';

/**
 * GET /api/admin/review-queue
 * Get pending fraud reviews
 */
export async function GET(request: NextRequest) {
  const rl = await rateLimitMiddleware(request);
  if (!rl.allowed) return rl.response!;

  const actor = await requireCurrentDbUser();
  if ('error' in actor) return actor.error;
  const roleErr = requireRole(actor, ['admin', 'owner']);
  if (roleErr) return roleErr;

  const { searchParams } = request.nextUrl;
  const statusFilter = searchParams.get('status') ?? 'pending';
  const { prismaArgs, respond } = paginationFor(searchParams);

  const where = {
    fraudScore: { gt: 0.5 },
    status: statusFilter,
  };

  const [rows, total] = await Promise.all([
    prisma.verification.findMany({
      where,
      include: {
        user: { select: { id: true, displayName: true, initiaAddress: true } },
        task: { select: { id: true, name: true, category: true } },
      },
      orderBy: { fraudScore: 'desc' },
      ...prismaArgs,
    }),
    prisma.verification.count({ where }),
  ]);

  const page = respond(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    rows.map((v: any) => ({
      ...v,
      userName: v.user.displayName,
      userAddress: v.user.initiaAddress,
      taskName: v.task.name,
      taskCategory: v.task.category,
    })),
    total,
  );

  return NextResponse.json({ success: true, ...page });
}
