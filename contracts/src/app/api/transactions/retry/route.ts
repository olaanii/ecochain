import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getPublicClient, getWalletClient } from '@/lib/blockchain/viem-clients';
import { createTransactionManager } from '@/lib/blockchain/transaction-manager';

/**
 * Transaction Retry API Endpoint
 * 
 * POST /api/transactions/retry
 * 
 * Requirement 17.8, 17.9
 * - Implement exponential backoff for failed transactions
 * - Retry with higher gas limit on gas estimation failures
 * - Limit retries to 3 attempts
 * - Log all retry attempts
 */

const RetryTransactionSchema = z.object({
  to: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
  data: z.string().regex(/^0x[a-fA-F0-9]*$/),
  value: z.string().optional(),
  type: z.string(),
  previousHash: z.string().regex(/^0x[a-fA-F0-9]{64}$/).optional(),
  retryCount: z.number().int().min(0).max(2).optional(),
});

type RetryTransactionRequest = z.infer<typeof RetryTransactionSchema>;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate request body
    const validatedData = RetryTransactionSchema.parse(body);

    // Get clients
    const publicClient = getPublicClient();
    const walletClient = getWalletClient();

    // Create transaction manager
    const txManager = createTransactionManager(publicClient, walletClient);

    // Retry transaction with higher gas limit
    const { hash, gasEstimate } = await txManager.retryTransaction({
      to: validatedData.to as `0x${string}`,
      data: validatedData.data as `0x${string}`,
      value: validatedData.value ? BigInt(validatedData.value) : undefined,
      from: '0x0000000000000000000000000000000000000000', // Will be replaced by wallet
      userId: 'api-user', // Will be replaced with actual user ID
      type: validatedData.type,
      previousHash: validatedData.previousHash as `0x${string}` | undefined,
      retryCount: validatedData.retryCount,
    });

    return NextResponse.json(
      {
        success: true,
        hash,
        retryCount: (validatedData.retryCount || 0) + 1,
        gasEstimate: {
          gasLimit: gasEstimate.gasLimit.toString(),
          gasPrice: gasEstimate.gasPrice.toString(),
          estimatedCost: gasEstimate.estimatedCost.toString(),
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[API] Transaction retry error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid request body',
          details: error.errors,
        },
        { status: 400 }
      );
    }

    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    // Check if max retries exceeded
    if (errorMessage.includes('Max retries')) {
      return NextResponse.json(
        {
          success: false,
          error: 'Maximum retry attempts exceeded',
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
      },
      { status: 500 }
    );
  }
}
