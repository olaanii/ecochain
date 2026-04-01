import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getPublicClient } from '@/lib/blockchain/viem-clients';
import { createBalanceManager } from '@/lib/blockchain/balance-manager';

/**
 * Balance Query API Endpoint
 * 
 * GET /api/balance?address=0x...
 * 
 * Requirement 7.1, 7.2, 7.3, 7.4, 7.5
 * - Implement balance fetching from EcoReward contract
 * - Calculate available balance (total - staked - pending)
 * - Cache balance data with 30-second TTL
 * - Return balance queries within 50 milliseconds when cached
 */

const QuerySchema = z.object({
  address: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
});

export async function GET(request: NextRequest) {
  const startTime = Date.now();

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

    // Get balance
    const balance = await manager.getBalance(validatedData.address as `0x${string}`);

    const latency = Date.now() - startTime;

    return NextResponse.json(
      {
        success: true,
        address: validatedData.address,
        balance: {
          total: balance.total.toString(),
          available: balance.available.toString(),
          staked: balance.staked.toString(),
          pending: balance.pending.toString(),
        },
        latency,
        cached: latency < 50, // Likely cached if under 50ms
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[API] Balance query error:', error);

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
