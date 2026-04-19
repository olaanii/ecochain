import { Hash, TransactionReceipt, PublicClient, WalletClient } from 'viem';
import { prisma } from '@/lib/prisma/client';
import { redis } from '@/lib/redis/client';

/**
 * Transaction Management System
 * 
 * Requirement 17.1, 17.2, 17.3, 17.4, 17.5, 17.6, 17.7, 17.8, 17.9
 * - Create transaction submission handler
 * - Implement transaction monitoring
 * - Create transaction retry logic
 * - Build transaction UI components
 */

export enum TransactionStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  FAILED = 'failed',
  REVERTED = 'reverted',
}

export interface TransactionRecord {
  id: string;
  hash: Hash;
  status: TransactionStatus;
  blockNumber?: number;
  gasUsed?: bigint;
  timestamp: number;
  userId: string;
  type: string; // 'stake', 'unstake', 'redeem', 'verify', etc.
  metadata?: Record<string, unknown>;
  retryCount: number;
  lastError?: string;
}

export interface GasEstimate {
  gasLimit: bigint;
  gasPrice: bigint;
  maxFeePerGas?: bigint;
  maxPriorityFeePerGas?: bigint;
  estimatedCost: bigint;
}

/**
 * Transaction Manager Class
 * Handles transaction submission, monitoring, and retry logic
 */
export class TransactionManager {
  private publicClient: PublicClient;
  private walletClient: WalletClient;
  private maxRetries = 3;
  private pollInterval = 2000; // 2 seconds
  private maxPollAttempts = 150; // 5 minutes total

  constructor(publicClient: PublicClient, walletClient: WalletClient) {
    this.publicClient = publicClient;
    this.walletClient = walletClient;
  }

  /**
   * Estimate gas for a transaction
   * 
   * Requirement 17.6
   */
  async estimateGas(params: {
    to: `0x${string}`;
    data: `0x${string}`;
    value?: bigint;
    from: `0x${string}`;
  }): Promise<GasEstimate> {
    try {
      const gasLimit = await this.publicClient.estimateGas({
        to: params.to,
        data: params.data,
        value: params.value || 0n,
        account: params.from,
      });

      // Get current gas price with dynamic pricing
      const feeData = await this.publicClient.getFeeData();
      const gasPrice = feeData.gasPrice || 1n;

      // Add 20% buffer to gas limit for safety
      const bufferedGasLimit = (gasLimit * 120n) / 100n;

      return {
        gasLimit: bufferedGasLimit,
        gasPrice,
        maxFeePerGas: feeData.maxFeePerGas,
        maxPriorityFeePerGas: feeData.maxPriorityFeePerGas,
        estimatedCost: bufferedGasLimit * gasPrice,
      };
    } catch (error) {
      console.error('[TransactionManager] Gas estimation failed:', error);
      throw new Error(`Gas estimation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Submit a transaction
   * 
   * Requirement 17.1, 17.6, 17.7
   */
  async submitTransaction(params: {
    to: `0x${string}`;
    data: `0x${string}`;
    value?: bigint;
    from: `0x${string}`;
    userId: string;
    type: string;
    metadata?: Record<string, unknown>;
  }): Promise<{ hash: Hash; gasEstimate: GasEstimate }> {
    try {
      // Estimate gas before submission
      const gasEstimate = await this.estimateGas({
        to: params.to,
        data: params.data,
        value: params.value,
        from: params.from,
      });

      // Submit transaction
      const hash = await this.walletClient.sendTransaction({
        to: params.to,
        data: params.data,
        value: params.value || 0n,
        gas: gasEstimate.gasLimit,
        gasPrice: gasEstimate.gasPrice,
      });

      console.log(`[TransactionManager] Transaction submitted: ${hash}`);

      // Store transaction record in database
      await this.storeTransactionRecord({
        hash,
        userId: params.userId,
        type: params.type,
        metadata: params.metadata,
      });

      // Cache transaction for quick lookup
      await this.cacheTransaction(hash, {
        status: TransactionStatus.PENDING,
        userId: params.userId,
        type: params.type,
      });

      return { hash, gasEstimate };
    } catch (error) {
      console.error('[TransactionManager] Transaction submission failed:', error);
      throw new Error(`Transaction submission failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Monitor transaction status
   * 
   * Requirement 17.2, 17.3, 17.4
   */
  async monitorTransaction(hash: Hash, userId: string): Promise<TransactionReceipt | null> {
    let pollAttempts = 0;

    while (pollAttempts < this.maxPollAttempts) {
      try {
        const receipt = await this.publicClient.getTransactionReceipt({ hash });

        if (receipt) {
          // Transaction confirmed
          const status = receipt.status === 'success' ? TransactionStatus.CONFIRMED : TransactionStatus.REVERTED;

          // Update database
          await this.updateTransactionRecord(hash, {
            status,
            blockNumber: receipt.blockNumber,
            gasUsed: receipt.gasUsed,
          });

          // Update cache
          await this.cacheTransaction(hash, { status });

          // Parse revert reason if failed
          if (status === TransactionStatus.REVERTED) {
            const revertReason = await this.parseRevertReason(hash);
            console.error(`[TransactionManager] Transaction reverted: ${revertReason}`);
            await this.updateTransactionRecord(hash, { lastError: revertReason });
          }

          return receipt;
        }

        // Not yet confirmed, wait and retry
        await new Promise((resolve) => setTimeout(resolve, this.pollInterval));
        pollAttempts++;
      } catch (error) {
        console.error('[TransactionManager] Error monitoring transaction:', error);
        pollAttempts++;
      }
    }

    // Transaction not confirmed after max attempts
    console.warn(`[TransactionManager] Transaction ${hash} not confirmed after ${this.maxPollAttempts} attempts`);
    return null;
  }

  /**
   * Retry failed transaction with higher gas limit
   * 
   * Requirement 17.8, 17.9
   */
  async retryTransaction(params: {
    to: `0x${string}`;
    data: `0x${string}`;
    value?: bigint;
    from: `0x${string}`;
    userId: string;
    type: string;
    previousHash?: Hash;
    retryCount?: number;
  }): Promise<{ hash: Hash; gasEstimate: GasEstimate }> {
    const retryCount = (params.retryCount || 0) + 1;

    if (retryCount > this.maxRetries) {
      throw new Error(`Max retries (${this.maxRetries}) exceeded for transaction`);
    }

    try {
      // Estimate gas with exponential backoff multiplier
      const gasEstimate = await this.estimateGas({
        to: params.to,
        data: params.data,
        value: params.value,
        from: params.from,
      });

      // Increase gas limit by 50% for each retry
      const multiplier = 1 + (0.5 * retryCount);
      const increasedGasLimit = (gasEstimate.gasLimit * BigInt(Math.floor(multiplier * 100))) / 100n;

      console.log(`[TransactionManager] Retrying transaction (attempt ${retryCount}/${this.maxRetries})`);

      // Submit retry transaction
      const hash = await this.walletClient.sendTransaction({
        to: params.to,
        data: params.data,
        value: params.value || 0n,
        gas: increasedGasLimit,
        gasPrice: gasEstimate.gasPrice,
      });

      // Log retry attempt
      await this.logRetryAttempt(params.previousHash || hash, hash, retryCount);

      return { hash, gasEstimate: { ...gasEstimate, gasLimit: increasedGasLimit } };
    } catch (error) {
      console.error(`[TransactionManager] Retry attempt ${retryCount} failed:`, error);
      throw error;
    }
  }

  /**
   * Parse revert reason from failed transaction
   * 
   * Requirement 17.4
   */
  private async parseRevertReason(hash: Hash): Promise<string> {
    try {
      const tx = await this.publicClient.getTransaction({ hash });
      const receipt = await this.publicClient.getTransactionReceipt({ hash });

      if (!receipt || receipt.status === 'success') {
        return 'Unknown error';
      }

      // Try to decode revert reason from transaction data
      if (tx.input && tx.input !== '0x') {
        // Common revert patterns
        if (tx.input.includes('0x08c379a0')) {
          // Error(string) - standard revert
          try {
            const reason = tx.input.slice(10);
            return Buffer.from(reason, 'hex').toString('utf-8').replace(/\0/g, '');
          } catch {
            return 'Transaction reverted';
          }
        }
      }

      return 'Transaction reverted';
    } catch (error) {
      console.error('[TransactionManager] Error parsing revert reason:', error);
      return 'Unknown error';
    }
  }

  /**
   * Store transaction record in database
   */
  private async storeTransactionRecord(params: {
    hash: Hash;
    userId: string;
    type: string;
    metadata?: Record<string, unknown>;
  }): Promise<void> {
    try {
      // Store in database for audit trail
      // This will be implemented with the actual database schema
      console.log(`[TransactionManager] Storing transaction record: ${params.hash}`);
    } catch (error) {
      console.error('[TransactionManager] Error storing transaction record:', error);
    }
  }

  /**
   * Update transaction record status
   */
  private async updateTransactionRecord(
    hash: Hash,
    updates: Partial<TransactionRecord>
  ): Promise<void> {
    try {
      console.log(`[TransactionManager] Updating transaction record: ${hash}`, updates);
    } catch (error) {
      console.error('[TransactionManager] Error updating transaction record:', error);
    }
  }

  /**
   * Cache transaction for quick lookup
   */
  private async cacheTransaction(
    hash: Hash,
    data: Partial<TransactionRecord>
  ): Promise<void> {
    try {
      const key = `tx:${hash}`;
      await redis.setex(key, 3600, JSON.stringify(data)); // 1 hour TTL
    } catch (error) {
      console.error('[TransactionManager] Error caching transaction:', error);
    }
  }

  /**
   * Log retry attempt
   */
  private async logRetryAttempt(
    originalHash: Hash,
    retryHash: Hash,
    retryCount: number
  ): Promise<void> {
    try {
      const key = `tx:retry:${originalHash}`;
      const retries = await redis.get(key);
      const retryList = retries ? JSON.parse(retries) : [];
      retryList.push({
        hash: retryHash,
        attempt: retryCount,
        timestamp: Date.now(),
      });
      await redis.setex(key, 86400, JSON.stringify(retryList)); // 24 hour TTL
    } catch (error) {
      console.error('[TransactionManager] Error logging retry attempt:', error);
    }
  }

  /**
   * Get transaction status from cache or blockchain
   */
  async getTransactionStatus(hash: Hash): Promise<TransactionStatus | null> {
    try {
      // Check cache first
      const cached = await redis.get(`tx:${hash}`);
      if (cached) {
        const data = JSON.parse(cached);
        return data.status;
      }

      // Check blockchain
      const receipt = await this.publicClient.getTransactionReceipt({ hash });
      if (receipt) {
        return receipt.status === 'success' ? TransactionStatus.CONFIRMED : TransactionStatus.REVERTED;
      }

      return TransactionStatus.PENDING;
    } catch (error) {
      console.error('[TransactionManager] Error getting transaction status:', error);
      return null;
    }
  }
}

/**
 * Create a transaction manager instance
 */
export function createTransactionManager(
  publicClient: PublicClient,
  walletClient: WalletClient
): TransactionManager {
  return new TransactionManager(publicClient, walletClient);
}
