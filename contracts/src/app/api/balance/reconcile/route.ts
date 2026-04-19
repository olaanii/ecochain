import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getPublicClient } from '@/lib/blockchain/viem-clients';
import { createBalanceManager } from '@/lib/blockchain/balance-manager';

/**
 * Balance Reconciliation API Endpoint
 * 
 * GET /api/balance/reconcile?address=0x...
 * POST /api/balance/reconcile (run daily reconciliation for all users)
 * 
 * Requirement 7.7
 * - Create daily reconciliation job
 * - Compare blockchain balance with database ledger entries
 * - Log discrepancies for investigation
 * - Alert on significant balance mismatches
 */

const QuerySchema = z.object({
  address: z.string().regex(/^0x[a-fA-F0-9]{40}$/).optional(),
});

/**
 * GET - Reconcile a specific address
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const address = searchParams.get('address');

    if (!address) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing address parameter',
        },
        { status: 400 }
      );
    }

    // Validate address format
    const validatedData = QuerySchema.parse({ address });

    // Get public client
    const publicClient = getPublicClient();

    // Create balance manager
    const manager = createBalanceManager(publicClient);

    // Reconcile balance
    const reconciliation = await manager.reconcileBalance(validatedData.address as `0x${string}`);

    return NextResponse.json(
      {
        success: true,
        reconciliation: {
          address: reconciliation.address,
          blockchainBalance: reconciliation.blockchainBalance.toString(),
          ledgerBalance: reconciliation.ledgerBalance.toString(),
          discrepancy: reconciliation.discrepancy.toString(),
          discrepancyPercentage: reconciliation.discrepancyPercentage,
          status: reconciliation.status,
          timestamp: reconciliation.timestamp,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[API] Balance reconciliation error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid address format',
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

/**
 * POST - Run daily reconciliation for all users
 * Should be protected by authentication and rate limiting
 */
export async function POST(request: NextRequest) {
  try {
    // TODO: Add authentication check to ensure only admin can trigger this
    // const user = await getAuthenticatedUser(request);
    // if (!user || user.role !== 'admin') {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // }

    // Get public client
    const publicClient = getPublicClient();

    // Create balance manager
    const manager = createBalanceManager(publicClient);

    // Run daily reconciliation
    const reconciliations = await manager.runDailyReconciliation();

    // Count mismatches and alerts
    const mismatches = reconciliations.filter((r) => r.status === 'mismatch').length;
    const alerts = reconciliations.filter((r) => r.status === 'alert').length;

    return NextResponse.json(
      {
        success: true,
        reconciliations: reconciliations.map((r) => ({
          address: r.address,
          blockchainBalance: r.blockchainBalance.toString(),
          ledgerBalance: r.ledgerBalance.toString(),
          discrepancy: r.discrepancy.toString(),
          discrepancyPercentage: r.discrepancyPercentage,
          status: r.status,
          timestamp: r.timestamp,
        })),
        summary: {
          totalReconciled: reconciliations.length,
          matched: reconciliations.length - mismatches - alerts,
          mismatches,
          alerts,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[API] Daily reconciliation error:', error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
