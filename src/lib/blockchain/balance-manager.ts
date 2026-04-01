import { Address, PublicClient } from 'viem';
import { redis } from '@/lib/redis/client';
import { prisma } from '@/lib/prisma/client';
import { EcoRewardContract } from './contracts';

/**
 * Token Balance Management System
 * 
 * Requirement 7.1, 7.2, 7.3, 7.4, 7.5, 7.7
 * - Implement balance fetching from EcoReward contract
 * - Calculate available balance (total - staked - pending)
 * - Cache balance data with 30-second TTL
 * - Invalidate cache on mint, burn, stake, unstake operations
 * - Create daily reconciliation job
 * - Compare blockchain balance with database ledger entries
 */

export interface TokenBalance {
  total: bigint;
  available: bigint;
  staked: bigint;
  pending: bigint;
  timestamp: number;
}

export interface BalanceReconciliation {
  address: string;
  blockchainBalance: bigint;
  ledgerBalance: bigint;
  discrepancy: bigint;
  discrepancyPercentage: number;
  timestamp: number;
  status: 'matched' | 'mismatch' | 'alert';
}

const BALANCE_CACHE_TTL = 30; // 30 seconds
const BALANCE_CACHE_KEY_PREFIX = 'balance:';

/**
 * Balance Manager Class
 * Handles balance queries, caching, and reconciliation
 */
export class BalanceManager {
  private publicClient: PublicClient;

  constructor(publicClient: PublicClient) {
    this.publicClient = publicClient;
  }

  /**
   * Get token balance for an address
   * 
   * Requirement 7.1, 7.2, 7.3, 7.4, 7.5
   */
  async getBalance(address: Address): Promise<TokenBalance> {
    // Check cache first
    const cached = await this.getCachedBalance(address);
    if (cached) {
      return cached;
    }

    try {
      // Fetch total balance from contract
      const total = await this.publicClient.readContract({
        address: EcoRewardContract.address,
        abi: EcoRewardContract.abi,
        functionName: 'balanceOf',
        args: [address],
      });

      // Fetch staked balance from database
      const stakedRecords = await prisma.stake.findMany({
        where: {
          user: {
            initiaAddress: address,
          },
          status: 'active',
        },
      });

      const staked = stakedRecords.reduce((sum: bigint, stake: any) => sum + BigInt(stake.amount), 0n as bigint);

      // Fetch pending balance (unconfirmed transactions)
      const pendingRecords = await prisma.ledgerEntry.findMany({
        where: {
          user: {
            initiaAddress: address,
          },
          type: 'mint',
          // Only count recent pending entries (within last 5 minutes)
          createdAt: {
            gte: new Date(Date.now() - 5 * 60 * 1000),
          },
        },
      });

      const pending = pendingRecords.reduce((sum: bigint, entry: any) => sum + BigInt(entry.amount), 0n as bigint);

      // Calculate available balance
      const totalBigInt = BigInt(total as unknown as string);
      const available = totalBigInt - staked - pending;

      const balance: TokenBalance = {
        total: totalBigInt,
        available: available >= 0n ? available : 0n,
        staked,
        pending,
        timestamp: Date.now(),
      };

      // Cache the balance
      await this.cacheBalance(address, balance);

      return balance;
    } catch (error) {
      console.error('[BalanceManager] Error fetching balance:', error);
      throw new Error(`Failed to fetch balance: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get balance for multiple addresses
   * Useful for batch operations
   */
  async getBalances(addresses: Address[]): Promise<Map<Address, TokenBalance>> {
    const balances = new Map<Address, TokenBalance>();

    for (const address of addresses) {
      try {
        const balance = await this.getBalance(address);
        balances.set(address, balance);
      } catch (error) {
        console.error(`[BalanceManager] Error fetching balance for ${address}:`, error);
      }
    }

    return balances;
  }

  /**
   * Invalidate balance cache for an address
   * Called when balance changes (mint, burn, stake, unstake)
   * 
   * Requirement 7.5
   */
  async invalidateBalance(address: Address): Promise<void> {
    try {
      const key = `${BALANCE_CACHE_KEY_PREFIX}${address}`;
      await redis.del(key);
      console.log(`[BalanceManager] Invalidated balance cache for ${address}`);
    } catch (error) {
      console.error('[BalanceManager] Error invalidating balance cache:', error);
    }
  }

  /**
   * Invalidate balance cache for multiple addresses
   */
  async invalidateBalances(addresses: Address[]): Promise<void> {
    try {
      const keys = addresses.map((addr) => `${BALANCE_CACHE_KEY_PREFIX}${addr}`);
      if (keys.length > 0) {
        await redis.del(...keys);
        console.log(`[BalanceManager] Invalidated balance cache for ${addresses.length} addresses`);
      }
    } catch (error) {
      console.error('[BalanceManager] Error invalidating balance caches:', error);
    }
  }

  /**
   * Get cached balance
   */
  private async getCachedBalance(address: Address): Promise<TokenBalance | null> {
    try {
      const key = `${BALANCE_CACHE_KEY_PREFIX}${address}`;
      const cached = await redis.get(key);
      if (cached) {
        return JSON.parse(cached);
      }
    } catch (error) {
      console.error('[BalanceManager] Error getting cached balance:', error);
    }
    return null;
  }

  /**
   * Cache balance data
   */
  private async cacheBalance(address: Address, balance: TokenBalance): Promise<void> {
    try {
      const key = `${BALANCE_CACHE_KEY_PREFIX}${address}`;
      await redis.setex(key, BALANCE_CACHE_TTL, JSON.stringify(balance));
    } catch (error) {
      console.error('[BalanceManager] Error caching balance:', error);
    }
  }

  /**
   * Reconcile blockchain balance with database ledger
   * 
   * Requirement 7.7
   */
  async reconcileBalance(address: Address): Promise<BalanceReconciliation> {
    try {
      // Get blockchain balance
      const blockchainBalance = await this.publicClient.readContract({
        address: EcoRewardContract.address,
        abi: EcoRewardContract.abi,
        functionName: 'balanceOf',
        args: [address],
      });

      // Get ledger balance from database
      const ledgerEntries = await prisma.ledgerEntry.findMany({
        where: {
          user: {
            initiaAddress: address,
          },
        },
      });

      let ledgerBalance = 0n;
      for (const entry of ledgerEntries) {
        if (entry.type === 'mint' || entry.type === 'reward') {
          ledgerBalance += BigInt(entry.amount);
        } else if (entry.type === 'burn' || entry.type === 'redemption') {
          ledgerBalance -= BigInt(entry.amount);
        }
        // Stake/unstake don't affect total balance, only distribution
      }

      const blockchainBal = BigInt(blockchainBalance as unknown as string);
      const discrepancy = blockchainBal > ledgerBalance ? blockchainBal - ledgerBalance : ledgerBalance - blockchainBal;
      const discrepancyPercentage = ledgerBalance > 0n ? Number((discrepancy * 100n) / ledgerBalance) : 0;

      // Determine status
      let status: 'matched' | 'mismatch' | 'alert' = 'matched';
      if (discrepancy > 0n) {
        status = discrepancyPercentage > 5 ? 'alert' : 'mismatch';
      }

      const reconciliation: BalanceReconciliation = {
        address,
        blockchainBalance: blockchainBal,
        ledgerBalance,
        discrepancy,
        discrepancyPercentage,
        timestamp: Date.now(),
        status,
      };

      // Log reconciliation
      if (status !== 'matched') {
        console.warn('[BalanceManager] Balance reconciliation mismatch:', reconciliation);
      }

      return reconciliation;
    } catch (error) {
      console.error('[BalanceManager] Error reconciling balance:', error);
      throw new Error(`Failed to reconcile balance: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Run daily reconciliation job
   * Should be called by a cron job or scheduler
   * 
   * Requirement 7.7
   */
  async runDailyReconciliation(): Promise<BalanceReconciliation[]> {
    try {
      console.log('[BalanceManager] Starting daily reconciliation job');

      // Get all users with balances
      const users = await prisma.user.findMany({
        where: {
          initiaAddress: {
            not: null,
          },
        },
      });

      const reconciliations: BalanceReconciliation[] = [];

      for (const user of users) {
        if (!user.initiaAddress) continue;

        try {
          const reconciliation = await this.reconcileBalance(user.initiaAddress as Address);
          reconciliations.push(reconciliation);

          // Alert on significant mismatches
          if (reconciliation.status === 'alert') {
            console.error('[BalanceManager] ALERT: Significant balance mismatch detected', reconciliation);
            // TODO: Send alert to admin
          }
        } catch (error) {
          console.error(`[BalanceManager] Error reconciling balance for user ${user.id}:`, error);
        }
      }

      console.log(`[BalanceManager] Daily reconciliation completed for ${reconciliations.length} users`);
      return reconciliations;
    } catch (error) {
      console.error('[BalanceManager] Error running daily reconciliation:', error);
      throw error;
    }
  }

  /**
   * Get balance statistics for analytics
   */
  async getBalanceStatistics(): Promise<{
    totalUsers: number;
    totalBalance: bigint;
    totalStaked: bigint;
    averageBalance: bigint;
  }> {
    try {
      const users = await prisma.user.findMany({
        where: {
          initiaAddress: {
            not: null,
          },
        },
      });

      let totalBalance = 0n;
      let totalStaked = 0n;

      for (const user of users) {
        if (!user.initiaAddress) continue;

        try {
          const balance = await this.getBalance(user.initiaAddress as Address);
          totalBalance += balance.total;
          totalStaked += balance.staked;
        } catch (error) {
          console.error(`[BalanceManager] Error getting balance for user ${user.id}:`, error);
        }
      }

      const averageBalance = users.length > 0 ? totalBalance / BigInt(users.length) : 0n;

      return {
        totalUsers: users.length,
        totalBalance,
        totalStaked,
        averageBalance,
      };
    } catch (error) {
      console.error('[BalanceManager] Error getting balance statistics:', error);
      throw error;
    }
  }
}

/**
 * Create a balance manager instance
 */
export function createBalanceManager(publicClient: PublicClient): BalanceManager {
  return new BalanceManager(publicClient);
}
