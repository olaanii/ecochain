'use client';

import { useCallback, useState } from 'react';
import { Hash } from 'viem';
import { useBlockchainClients } from './useBlockchainClients';
import { createTransactionManager, TransactionStatus } from '@/lib/blockchain/transaction-manager';

/**
 * Hook for managing blockchain transactions
 * 
 * Requirement 17.1, 17.2, 17.3, 17.4, 17.5, 17.6, 17.7, 17.8, 17.9
 */

export interface TransactionState {
  hash?: Hash;
  status: TransactionStatus | null;
  error?: string;
  isLoading: boolean;
  gasEstimate?: {
    gasLimit: bigint;
    gasPrice: bigint;
    estimatedCost: bigint;
  };
}

export function useTransactionManager() {
  const { publicClient, walletClient, account } = useBlockchainClients();
  const [transactionState, setTransactionState] = useState<TransactionState>({
    status: null,
    isLoading: false,
  });

  const manager = useCallback(() => {
    return createTransactionManager(publicClient, walletClient);
  }, [publicClient, walletClient]);

  /**
   * Submit a transaction
   */
  const submitTransaction = useCallback(
    async (params: {
      to: `0x${string}`;
      data: `0x${string}`;
      value?: bigint;
      type: string;
      metadata?: Record<string, unknown>;
    }) => {
      if (!account.address) {
        setTransactionState((prev) => ({
          ...prev,
          error: 'Wallet not connected',
        }));
        throw new Error('Wallet not connected');
      }

      setTransactionState((prev) => ({
        ...prev,
        isLoading: true,
        error: undefined,
      }));

      try {
        const txManager = manager();
        const { hash, gasEstimate } = await txManager.submitTransaction({
          to: params.to,
          data: params.data,
          value: params.value,
          from: account.address,
          userId: account.address, // Use wallet address as user ID for now
          type: params.type,
          metadata: params.metadata,
        });

        setTransactionState((prev) => ({
          ...prev,
          hash,
          status: TransactionStatus.PENDING,
          gasEstimate,
        }));

        return hash;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        setTransactionState((prev) => ({
          ...prev,
          error: errorMessage,
          isLoading: false,
        }));
        throw error;
      }
    },
    [account.address, manager]
  );

  /**
   * Monitor transaction status
   */
  const monitorTransaction = useCallback(
    async (hash: Hash) => {
      setTransactionState((prev) => ({
        ...prev,
        hash,
        status: TransactionStatus.PENDING,
        isLoading: true,
      }));

      try {
        const txManager = manager();
        const receipt = await txManager.monitorTransaction(hash, account.address || '');

        if (receipt) {
          const status =
            receipt.status === 'success' ? TransactionStatus.CONFIRMED : TransactionStatus.REVERTED;
          setTransactionState((prev) => ({
            ...prev,
            status,
            isLoading: false,
          }));
          return receipt;
        } else {
          setTransactionState((prev) => ({
            ...prev,
            status: TransactionStatus.FAILED,
            error: 'Transaction not confirmed',
            isLoading: false,
          }));
          return null;
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        setTransactionState((prev) => ({
          ...prev,
          error: errorMessage,
          isLoading: false,
        }));
        throw error;
      }
    },
    [account.address, manager]
  );

  /**
   * Retry a failed transaction
   */
  const retryTransaction = useCallback(
    async (params: {
      to: `0x${string}`;
      data: `0x${string}`;
      value?: bigint;
      type: string;
      previousHash?: Hash;
      retryCount?: number;
    }) => {
      if (!account.address) {
        throw new Error('Wallet not connected');
      }

      setTransactionState((prev) => ({
        ...prev,
        isLoading: true,
        error: undefined,
      }));

      try {
        const txManager = manager();
        const { hash, gasEstimate } = await txManager.retryTransaction({
          to: params.to,
          data: params.data,
          value: params.value,
          from: account.address,
          userId: account.address,
          type: params.type,
          previousHash: params.previousHash,
          retryCount: params.retryCount,
        });

        setTransactionState((prev) => ({
          ...prev,
          hash,
          status: TransactionStatus.PENDING,
          gasEstimate,
        }));

        return hash;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        setTransactionState((prev) => ({
          ...prev,
          error: errorMessage,
          isLoading: false,
        }));
        throw error;
      }
    },
    [account.address, manager]
  );

  /**
   * Get transaction status
   */
  const getStatus = useCallback(
    async (hash: Hash) => {
      try {
        const txManager = manager();
        return await txManager.getTransactionStatus(hash);
      } catch (error) {
        console.error('Error getting transaction status:', error);
        return null;
      }
    },
    [manager]
  );

  /**
   * Reset transaction state
   */
  const reset = useCallback(() => {
    setTransactionState({
      status: null,
      isLoading: false,
    });
  }, []);

  return {
    ...transactionState,
    submitTransaction,
    monitorTransaction,
    retryTransaction,
    getStatus,
    reset,
  };
}
