'use client';

import { useCallback, useEffect, useState } from 'react';
import { Address } from 'viem';
import { useBlockchainClients } from './useBlockchainClients';
import { createBalanceManager, TokenBalance } from '@/lib/blockchain/balance-manager';

/**
 * Hook for managing token balances
 * 
 * Requirement 7.1, 7.2, 7.3, 7.4, 7.5
 */

export interface UseBalanceState {
  balance: TokenBalance | null;
  isLoading: boolean;
  error?: string;
  lastUpdated?: number;
}

export function useBalance(address?: Address, autoRefresh = true) {
  const { publicClient, account } = useBlockchainClients();
  const [state, setState] = useState<UseBalanceState>({
    balance: null,
    isLoading: false,
  });

  const targetAddress = address || account.address;

  /**
   * Fetch balance
   */
  const fetchBalance = useCallback(async () => {
    if (!targetAddress) {
      setState({
        balance: null,
        isLoading: false,
        error: 'No address provided',
      });
      return;
    }

    setState((prev) => ({
      ...prev,
      isLoading: true,
      error: undefined,
    }));

    try {
      const manager = createBalanceManager(publicClient);
      const balance = await manager.getBalance(targetAddress);

      setState({
        balance,
        isLoading: false,
        lastUpdated: Date.now(),
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setState({
        balance: null,
        isLoading: false,
        error: errorMessage,
      });
    }
  }, [targetAddress, publicClient]);

  /**
   * Invalidate balance cache
   */
  const invalidate = useCallback(async () => {
    if (!targetAddress) return;

    try {
      const manager = createBalanceManager(publicClient);
      await manager.invalidateBalance(targetAddress);
      // Refetch after invalidation
      await fetchBalance();
    } catch (error) {
      console.error('Error invalidating balance:', error);
    }
  }, [targetAddress, publicClient, fetchBalance]);

  /**
   * Refresh balance
   */
  const refresh = useCallback(async () => {
    await fetchBalance();
  }, [fetchBalance]);

  /**
   * Auto-refresh balance on mount and when address changes
   */
  useEffect(() => {
    if (autoRefresh && targetAddress) {
      fetchBalance();

      // Set up auto-refresh interval (every 30 seconds)
      const interval = setInterval(fetchBalance, 30000);

      return () => clearInterval(interval);
    }
  }, [targetAddress, autoRefresh, fetchBalance]);

  return {
    ...state,
    refresh,
    invalidate,
  };
}

/**
 * Hook for managing multiple balances
 */
export function useBalances(addresses: Address[], autoRefresh = true) {
  const { publicClient } = useBlockchainClients();
  const [state, setState] = useState<{
    balances: Map<Address, TokenBalance>;
    isLoading: boolean;
    error?: string;
    lastUpdated?: number;
  }>({
    balances: new Map(),
    isLoading: false,
  });

  /**
   * Fetch balances
   */
  const fetchBalances = useCallback(async () => {
    if (addresses.length === 0) {
      setState({
        balances: new Map(),
        isLoading: false,
        error: 'No addresses provided',
      });
      return;
    }

    setState((prev) => ({
      ...prev,
      isLoading: true,
      error: undefined,
    }));

    try {
      const manager = createBalanceManager(publicClient);
      const balances = await manager.getBalances(addresses);

      setState({
        balances,
        isLoading: false,
        lastUpdated: Date.now(),
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setState({
        balances: new Map(),
        isLoading: false,
        error: errorMessage,
      });
    }
  }, [addresses, publicClient]);

  /**
   * Invalidate all balances
   */
  const invalidate = useCallback(async () => {
    if (addresses.length === 0) return;

    try {
      const manager = createBalanceManager(publicClient);
      await manager.invalidateBalances(addresses);
      // Refetch after invalidation
      await fetchBalances();
    } catch (error) {
      console.error('Error invalidating balances:', error);
    }
  }, [addresses, publicClient, fetchBalances]);

  /**
   * Refresh balances
   */
  const refresh = useCallback(async () => {
    await fetchBalances();
  }, [fetchBalances]);

  /**
   * Auto-refresh balances on mount and when addresses change
   */
  useEffect(() => {
    if (autoRefresh && addresses.length > 0) {
      fetchBalances();

      // Set up auto-refresh interval (every 30 seconds)
      const interval = setInterval(fetchBalances, 30000);

      return () => clearInterval(interval);
    }
  }, [addresses, autoRefresh, fetchBalances]);

  return {
    ...state,
    refresh,
    invalidate,
  };
}
