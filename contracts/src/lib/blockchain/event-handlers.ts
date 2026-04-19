/**
 * Blockchain Event Handlers
 * 
 * Processes blockchain events and updates database records
 * 
 * Requirements: 18.2, 18.5, 18.6
 */

import { prisma } from '@/lib/prisma/client';
import { redis } from '@/lib/redis/client';
import { BlockchainEvent, EventProcessingResult } from './event-listener';

/**
 * Process ProofSubmitted event
 * Updates verification records and creates ledger entries
 * 
 * Requirement: 18.2, 18.5, 18.6
 */
export async function processProofSubmittedEvent(event: BlockchainEvent): Promise<EventProcessingResult> {
  try {
    const { user, taskId, proofHash, rewardMinted } = event.data;

    if (!user || !taskId || !proofHash || !rewardMinted) {
      return {
        success: false,
        eventId: event.id,
        error: 'Missing required event data',
        retryable: false,
      };
    }

    // Find verification by proof hash
    const verification = await prisma.verification.findUnique({
      where: { proofHash },
      include: { user: true, task: true },
    });

    if (!verification) {
      return {
        success: false,
        eventId: event.id,
        error: `Verification not found for proof hash: ${proofHash}`,
        retryable: false,
      };
    }

    // Update verification with transaction hash and status
    await prisma.verification.update({
      where: { id: verification.id },
      data: {
        status: 'verified',
        transactionHash: event.transactionHash,
        reward: parseInt(rewardMinted),
        metadata: {
          ...verification.metadata,
          blockNumber: event.blockNumber.toString(),
          logIndex: event.logIndex,
          processedAt: new Date().toISOString(),
        },
      },
    });

    // Create ledger entry for minted tokens
    await prisma.ledgerEntry.create({
      data: {
        userId: verification.userId,
        amount: parseInt(rewardMinted),
        type: 'mint',
        source: verification.taskId,
        transactionHash: event.transactionHash,
        metadata: {
          verificationId: verification.id,
          taskId,
          proofHash,
        },
      },
    });

    // Update user total rewards
    await prisma.user.update({
      where: { id: verification.userId },
      data: {
        totalRewards: {
          increment: parseInt(rewardMinted),
        },
      },
    });

    // Invalidate user balance cache
    await redis.del(`user:balance:${verification.userId}`);
    await redis.del(`user:stats:${verification.userId}`);

    console.log(
      `[EventHandler] Processed ProofSubmitted event: ${event.id}, user: ${user}, reward: ${rewardMinted}`
    );

    return {
      success: true,
      eventId: event.id,
      retryable: false,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    console.error('[EventHandler] Error processing ProofSubmitted event:', error);

    return {
      success: false,
      eventId: event.id,
      error: errorMessage,
      retryable: true,
    };
  }
}

/**
 * Process TokensMinted event
 * Creates ledger entries for minted tokens
 * 
 * Requirement: 18.2, 18.5, 18.6
 */
export async function processTokensMintedEvent(event: BlockchainEvent): Promise<EventProcessingResult> {
  try {
    const { to, value } = event.data;

    if (!to || !value) {
      return {
        success: false,
        eventId: event.id,
        error: 'Missing required event data',
        retryable: false,
      };
    }

    // Find user by wallet address
    const user = await prisma.user.findUnique({
      where: { initiaAddress: to },
    });

    if (!user) {
      // User not found - this might be a mint to a contract or unknown address
      console.warn(`[EventHandler] User not found for address: ${to}`);

      return {
        success: true, // Don't retry - user just doesn't exist in our system
        eventId: event.id,
        retryable: false,
      };
    }

    // Create ledger entry
    await prisma.ledgerEntry.create({
      data: {
        userId: user.id,
        amount: parseInt(value),
        type: 'mint',
        source: 'blockchain',
        transactionHash: event.transactionHash,
        metadata: {
          blockNumber: event.blockNumber.toString(),
          logIndex: event.logIndex,
        },
      },
    });

    // Update user total rewards
    await prisma.user.update({
      where: { id: user.id },
      data: {
        totalRewards: {
          increment: parseInt(value),
        },
      },
    });

    // Invalidate cache
    await redis.del(`user:balance:${user.id}`);
    await redis.del(`user:stats:${user.id}`);

    console.log(
      `[EventHandler] Processed TokensMinted event: ${event.id}, user: ${user.id}, amount: ${value}`
    );

    return {
      success: true,
      eventId: event.id,
      retryable: false,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    console.error('[EventHandler] Error processing TokensMinted event:', error);

    return {
      success: false,
      eventId: event.id,
      error: errorMessage,
      retryable: true,
    };
  }
}

/**
 * Process Transfer event
 * Tracks token transfers for balance updates
 * 
 * Requirement: 18.2, 18.5, 18.6
 */
export async function processTransferEvent(event: BlockchainEvent): Promise<EventProcessingResult> {
  try {
    const { from, to, value } = event.data;

    if (!from || !to || !value) {
      return {
        success: false,
        eventId: event.id,
        error: 'Missing required event data',
        retryable: false,
      };
    }

    // Find users
    const [fromUser, toUser] = await Promise.all([
      prisma.user.findUnique({ where: { initiaAddress: from } }),
      prisma.user.findUnique({ where: { initiaAddress: to } }),
    ]);

    // Create ledger entries for both users if they exist
    const ledgerEntries = [];

    if (fromUser) {
      ledgerEntries.push(
        prisma.ledgerEntry.create({
          data: {
            userId: fromUser.id,
            amount: -parseInt(value), // Negative for outgoing
            type: 'transfer',
            source: to,
            transactionHash: event.transactionHash,
            metadata: {
              direction: 'out',
              recipient: to,
              blockNumber: event.blockNumber.toString(),
              logIndex: event.logIndex,
            },
          },
        })
      );
    }

    if (toUser) {
      ledgerEntries.push(
        prisma.ledgerEntry.create({
          data: {
            userId: toUser.id,
            amount: parseInt(value), // Positive for incoming
            type: 'transfer',
            source: from,
            transactionHash: event.transactionHash,
            metadata: {
              direction: 'in',
              sender: from,
              blockNumber: event.blockNumber.toString(),
              logIndex: event.logIndex,
            },
          },
        })
      );
    }

    // Execute all ledger entries
    if (ledgerEntries.length > 0) {
      await Promise.all(ledgerEntries);
    }

    // Invalidate cache for both users
    if (fromUser) {
      await redis.del(`user:balance:${fromUser.id}`);
    }
    if (toUser) {
      await redis.del(`user:balance:${toUser.id}`);
    }

    console.log(
      `[EventHandler] Processed Transfer event: ${event.id}, from: ${from}, to: ${to}, amount: ${value}`
    );

    return {
      success: true,
      eventId: event.id,
      retryable: false,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    console.error('[EventHandler] Error processing Transfer event:', error);

    return {
      success: false,
      eventId: event.id,
      error: errorMessage,
      retryable: true,
    };
  }
}
