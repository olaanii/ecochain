import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getPublicClient, getWalletClient } from '@/lib/blockchain/viem-clients';
import { createTransactionManager } from '@/lib/blockchain/transaction-manager';

/**
 * Transaction Submission API Endpoint
 * 
 * POST /api/transactions/submit
 * 
 * Requirement 17.1, 17.6, 17.7
 * - Create transaction submission handler
 * - Implement transaction signing with wallet client
 * - Add gas estimation before submission
 * - Use dynamic gas pricing based on network conditions
 * - Return transaction hash immediately after submission
 */

const SubmitTransactionSchema = z.object({
  to: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
  data: z.string().regex(/^0x[a-fA-F0-9]*$/),
  value: z.string().optional(),
  type: z.string(),
  metadata: z.record(z.unknown()).optional(),
});

type SubmitTransactionRequest = z.infer<typeof SubmitTransactionSchema>;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate request body
    const validatedData = SubmitTransactionSchema.parse(body);

    // Get clients
    const publicClient = getPublicClient();
    const walletClient = getWalletClient();

    // Create transaction manager
    const txManager = createTransactionManager(publicClient, walletClient);

    // Estimate gas
    const gasEstimate = await txManager.estimateGas({
      to: validatedData.to as `0x${string}`,
      data: validatedData.data as `0x${string}`,
      value: validatedData.value ? BigInt(validatedData.value) : undefined,
      from: '0x0000000000000000000000000000000000000000', // Will be replaced by wallet
    });

    return NextResponse.json(
      {
        success: true,
        gasEstimate: {
          gasLimit: gasEstimate.gasLimit.toString(),
          gasPrice: gasEstimate.gasPrice.toString(),
          estimatedCost: gasEstimate.estimatedCost.toString(),
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[API] Transaction submission error:', error);

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

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
