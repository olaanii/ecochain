/**
 * Blockchain Event Listener Service
 * 
 * Monitors blockchain events and processes them:
 * - ProofSubmitted events from EcoVerifier contract
 * - TokensMinted events from EcoReward contract
 * - Transfer events for balance tracking
 * 
 * Requirements: 18.1, 18.2, 18.8
 */

import { PublicClient, Hash, Log, parseEventLogs } from 'viem';
import { getPublicClient } from './viem-clients';
import { EcoRewardContract, EcoVerifierContract } from './contracts';
import { prisma } from '@/lib/prisma/client';
import { redis } from '@/lib/redis/client';
import { EventQueue } from './event-queue';

export interface BlockchainEvent {
  id: string;
  type: 'ProofSubmitted' | 'TokensMinted' | 'Transfer';
  contractAddress: string;
  transactionHash: Hash;
  blockNumber: bigint;
  logIndex: number;
  data: Record<string, any>;
  processedAt?: Date;
  retryCount: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
}

export interface EventProcessingResult {
  success: boolean;
  eventId: string;
  error?: string;
  retryable: boolean;
}

/**
 * Event Listener Service
 * Watches for blockchain events and queues them for processing
 */
export class EventListener {
  private publicClient: PublicClient;
  private eventQueue: EventQueue;
  private isListening: boolean = false;
  private lastBlockProcessed: bigint = BigInt(0);
  private pollInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.publicClient = getPublicClient();
    this.eventQueue = new EventQueue();
  }

  /**
   * Start listening for blockchain events
   * Polls for new events every 12 seconds (1 block on Initia)
   */
  async startListening(): Promise<void> {
    if (this.isListening) {
      console.warn('[EventListener] Already listening for events');
      return;
    }

    this.isListening = true;
    console.log('[EventListener] Starting event listener');

    // Get initial block number
    this.lastBlockProcessed = await this.publicClient.getBlockNumber();

    // Poll for events every 12 seconds
    this.pollInterval = setInterval(async () => {
      try {
        await this.pollForEvents();
      } catch (error) {
        console.error('[EventListener] Error polling for events:', error);
      }
    }, 12000); // 12 seconds

    // Also process any pending events from the queue
    this.eventQueue.startProcessing();
  }

  /**
   * Stop listening for blockchain events
   */
  async stopListening(): Promise<void> {
    if (!this.isListening) {
      return;
    }

    this.isListening = false;
    if (this.pollInterval) {
      clearInterval(this.pollInterval);
      this.pollInterval = null;
    }

    await this.eventQueue.stopProcessing();
    console.log('[EventListener] Event listener stopped');
  }

  /**
   * Poll for new blockchain events
   * Requirement: 18.1, 18.2
   */
  private async pollForEvents(): Promise<void> {
    try {
      const currentBlock = await this.publicClient.getBlockNumber();

      if (currentBlock <= this.lastBlockProcessed) {
        return; // No new blocks
      }

      // Get logs for ProofSubmitted events
      await this.pollProofSubmittedEvents(this.lastBlockProcessed + BigInt(1), currentBlock);

      // Get logs for TokensMinted events
      await this.pollTokensMintedEvents(this.lastBlockProcessed + BigInt(1), currentBlock);

      // Get logs for Transfer events
      await this.pollTransferEvents(this.lastBlockProcessed + BigInt(1), currentBlock);

      this.lastBlockProcessed = currentBlock;
    } catch (error) {
      console.error('[EventListener] Error in pollForEvents:', error);
    }
  }

  /**
   * Poll for ProofSubmitted events from EcoVerifier contract
   * Requirement: 18.1
   */
  private async pollProofSubmittedEvents(fromBlock: bigint, toBlock: bigint): Promise<void> {
    try {
      const logs = await this.publicClient.getLogs({
        address: EcoVerifierContract.address,
        event: {
          name: 'ProofSubmitted',
          type: 'event',
          inputs: [
            { type: 'address', name: 'user', indexed: true },
            { type: 'string', name: 'taskId', indexed: false },
            { type: 'string', name: 'proofHash', indexed: false },
            { type: 'uint256', name: 'rewardMinted', indexed: false },
          ],
        },
        fromBlock,
        toBlock,
      });

      for (const log of logs) {
        await this.queueProofSubmittedEvent(log);
      }
    } catch (error) {
      console.error('[EventListener] Error polling ProofSubmitted events:', error);
    }
  }

  /**
   * Poll for TokensMinted events from EcoReward contract
   * Requirement: 18.2
   */
  private async pollTokensMintedEvents(fromBlock: bigint, toBlock: bigint): Promise<void> {
    try {
      const logs = await this.publicClient.getLogs({
        address: EcoRewardContract.address,
        event: {
          name: 'Transfer',
          type: 'event',
          inputs: [
            { type: 'address', name: 'from', indexed: true },
            { type: 'address', name: 'to', indexed: true },
            { type: 'uint256', name: 'value', indexed: false },
          ],
        },
        fromBlock,
        toBlock,
        args: {
          from: '0x0000000000000000000000000000000000000000', // Mint events have from = 0x0
        },
      });

      for (const log of logs) {
        await this.queueTokensMintedEvent(log);
      }
    } catch (error) {
      console.error('[EventListener] Error polling TokensMinted events:', error);
    }
  }

  /**
   * Poll for Transfer events from EcoReward contract
   * Requirement: 18.2
   */
  private async pollTransferEvents(fromBlock: bigint, toBlock: bigint): Promise<void> {
    try {
      const logs = await this.publicClient.getLogs({
        address: EcoRewardContract.address,
        event: {
          name: 'Transfer',
          type: 'event',
          inputs: [
            { type: 'address', name: 'from', indexed: true },
            { type: 'address', name: 'to', indexed: true },
            { type: 'uint256', name: 'value', indexed: false },
          ],
        },
        fromBlock,
        toBlock,
      });

      for (const log of logs) {
        // Skip mint events (from = 0x0)
        const logWithArgs = log as any;
        if (logWithArgs.args?.from === '0x0000000000000000000000000000000000000000') {
          continue;
        }
        await this.queueTransferEvent(log);
      }
    } catch (error) {
      console.error('[EventListener] Error polling Transfer events:', error);
    }
  }

  /**
   * Queue ProofSubmitted event for processing
   */
  private async queueProofSubmittedEvent(log: Log): Promise<void> {
    const eventId = `proof-${log.transactionHash}-${log.logIndex}`;

    // Check if already processed
    const cached = await redis.get(`event:${eventId}`);
    if (cached) {
      return;
    }

    const logWithArgs = log as any;
    const event: BlockchainEvent = {
      id: eventId,
      type: 'ProofSubmitted',
      contractAddress: log.address,
      transactionHash: log.transactionHash!,
      blockNumber: log.blockNumber!,
      logIndex: log.logIndex!,
      data: {
        user: logWithArgs.args?.user,
        taskId: logWithArgs.args?.taskId,
        proofHash: logWithArgs.args?.proofHash,
        rewardMinted: logWithArgs.args?.rewardMinted?.toString(),
      },
      retryCount: 0,
      status: 'pending',
    };

    await this.eventQueue.enqueue(event);
  }

  /**
   * Queue TokensMinted event for processing
   */
  private async queueTokensMintedEvent(log: Log): Promise<void> {
    const eventId = `mint-${log.transactionHash}-${log.logIndex}`;

    // Check if already processed
    const cached = await redis.get(`event:${eventId}`);
    if (cached) {
      return;
    }

    const logWithArgs = log as any;
    const event: BlockchainEvent = {
      id: eventId,
      type: 'TokensMinted',
      contractAddress: log.address,
      transactionHash: log.transactionHash!,
      blockNumber: log.blockNumber!,
      logIndex: log.logIndex!,
      data: {
        to: logWithArgs.args?.to,
        value: logWithArgs.args?.value?.toString(),
      },
      retryCount: 0,
      status: 'pending',
    };

    await this.eventQueue.enqueue(event);
  }

  /**
   * Queue Transfer event for processing
   */
  private async queueTransferEvent(log: Log): Promise<void> {
    const eventId = `transfer-${log.transactionHash}-${log.logIndex}`;

    // Check if already processed
    const cached = await redis.get(`event:${eventId}`);
    if (cached) {
      return;
    }

    const logWithArgs = log as any;
    const event: BlockchainEvent = {
      id: eventId,
      type: 'Transfer',
      contractAddress: log.address,
      transactionHash: log.transactionHash!,
      blockNumber: log.blockNumber!,
      logIndex: log.logIndex!,
      data: {
        from: logWithArgs.args?.from,
        to: logWithArgs.args?.to,
        value: logWithArgs.args?.value?.toString(),
      },
      retryCount: 0,
      status: 'pending',
    };

    await this.eventQueue.enqueue(event);
  }

  /**
   * Get listener status
   */
  getStatus(): {
    isListening: boolean;
    lastBlockProcessed: bigint;
    queueSize: number;
  } {
    return {
      isListening: this.isListening,
      lastBlockProcessed: this.lastBlockProcessed,
      queueSize: this.eventQueue.getQueueSize(),
    };
  }
}

/**
 * Global event listener instance
 */
let eventListenerInstance: EventListener | null = null;

/**
 * Get or create event listener instance
 */
export function getEventListener(): EventListener {
  if (!eventListenerInstance) {
    eventListenerInstance = new EventListener();
  }
  return eventListenerInstance;
}

/**
 * Start the global event listener
 */
export async function startEventListener(): Promise<void> {
  const listener = getEventListener();
  await listener.startListening();
}

/**
 * Stop the global event listener
 */
export async function stopEventListener(): Promise<void> {
  if (eventListenerInstance) {
    await eventListenerInstance.stopListening();
  }
}
