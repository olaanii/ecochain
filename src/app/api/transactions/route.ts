import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma/client';
import { getCurrentDbUser } from '@/lib/auth/current-user';

/**
 * GET /api/transactions
 * List user's ledger entries (transactions)
 * 
 * Query params:
 * - type: Filter by transaction type (mint, burn, stake, unstake, reward, redemption)
 * - limit: Number of results (default 50, max 100)
 * - offset: Pagination offset (default 0)
 */

const QuerySchema = z.object({
  type: z.enum(['mint', 'burn', 'stake', 'unstake', 'reward', 'redemption']).optional(),
  limit: z.coerce.number().int().min(1).max(100).default(50),
  offset: z.coerce.number().int().min(0).default(0),
});

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentDbUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'unauthorized' },
        { status: 401 }
      );
    }

    const params = QuerySchema.parse(Object.fromEntries(request.nextUrl.searchParams));

    const where: Record<string, unknown> = { userId: user.id };
    if (params.type) {
      where.type = params.type;
    }

    const [total, transactions] = await Promise.all([
      prisma.ledgerEntry.count({ where }),
      prisma.ledgerEntry.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: params.limit,
        skip: params.offset,
      }),
    ]);

    return NextResponse.json({
      success: true,
      data: transactions.map((tx: { id: any; amount: any; type: any; source: any; transactionHash: any; metadata: any; createdAt: { toISOString: () => any; }; }) => ({
        id: tx.id,
        amount: tx.amount,
        type: tx.type,
        source: tx.source,
        transactionHash: tx.transactionHash,
        metadata: tx.metadata,
        createdAt: tx.createdAt.toISOString(),
      })),
      pagination: {
        limit: params.limit,
        offset: params.offset,
        total,
      },
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'invalid_params', details: err.errors },
        { status: 400 }
      );
    }
    console.error('[API] Transactions list error', err);
    return NextResponse.json(
      { success: false, error: 'internal' },
      { status: 500 }
    );
  }
}
