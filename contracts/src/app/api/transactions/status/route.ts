import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getPublicClient, getWalletClient } from '@/lib/blockchain/viem-clients';
import { createTransactionManager, TransactionStatus } from '@/lib/blockchain/transaction-manager';

/**
 * Transaction Status API Endpoint
 * 
 * GET /api/transactions/status?hash=0x...
 * 
 * Requirement 17.2, 17.3, 17.4
 * - Create transaction status polling mechanism
 * - Monitor transaction confirmations
 * - Update database records when transaction confirms
 * - Handle transaction failures with revert reason parsing
 */

const QuerySchema = z.object({
  hash: z.string().regex(/^0x[a-fA-F0-9]{64}$/),
});

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const hash = searchParams.get('hash');

    if (!hash) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing hash parameter',
        },
        { status: 400 }
      );
    }

    // Validate hash format
    const validatedData = QuerySchema.parse({ hash });

    // Get clients
    const publicClient = getPublicClient();
    const walletClient = getWalletClient();

    // Create transaction manager
    const txManager = createTransactionManager(publicClient, walletClient);

    // Get transaction status
    const status = await txManager.getTransactionStatus(validatedData.hash as `0x${string}`);

    // Get transaction receipt if confirmed
    let receipt = null;
    if (status === TransactionStatus.CONFIRMED || status === TransactionStatus.REVERTED) {
      receipt = await publicClient.getTransactionReceipt({
        hash: validatedData.hash as `0x${string}`,
      });
    }

    return NextResponse.json(
      {
        success: true,
        hash: validatedData.hash,
        status,
        receipt: receipt
          ? {
              blockNumber: receipt.blockNumber,
              gasUsed: receipt.gasUsed?.toString(),
              transactionHash: receipt.transactionHash,
              status: receipt.status,
            }
          : null,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[API] Transaction status error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid hash format',
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
