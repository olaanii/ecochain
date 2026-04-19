import { NextRequest, NextResponse } from 'next/server';
import { getPublicClient } from '@/lib/blockchain/viem-clients';
import { createBalanceManager } from '@/lib/blockchain/balance-manager';

/**
 * Balance Statistics API Endpoint
 * 
 * GET /api/balance/statistics
 * 
 * Returns aggregate balance statistics for analytics
 */

export async function GET(request: NextRequest) {
  try {
    // Get public client
    const publicClient = getPublicClient();

    // Create balance manager
    const manager = createBalanceManager(publicClient);

    // Get balance statistics
    const stats = await manager.getBalanceStatistics();

    return NextResponse.json(
      {
        success: true,
        statistics: {
          totalUsers: stats.totalUsers,
          totalBalance: stats.totalBalance.toString(),
          totalStaked: stats.totalStaked.toString(),
          averageBalance: stats.averageBalance.toString(),
          timestamp: Date.now(),
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[API] Balance statistics error:', error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
