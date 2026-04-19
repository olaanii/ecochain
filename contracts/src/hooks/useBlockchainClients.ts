'use client';

import { useCallback } from 'react';
import { useAccount, usePublicClient, useWalletClient } from 'wagmi';
import { getPublicClient, getWalletClient } from '@/lib/blockchain/viem-clients';
import { CHAIN_CONFIG } from '@/lib/blockchain/wagmi-config';

/**
 * Hook for accessing blockchain clients and chain information
 * 
 * Requirement 16.1, 16.2, 16.3
 * 
 * Provides:
 * - Public client for contract reads
 * - Wallet client for contract writes
 * - Current account information
 * - Chain configuration
 */

export function useBlockchainClients() {
  const account = useAccount();
  const publicClient = usePublicClient();
  const walletClient = useWalletClient();

  /**
   * Get the public client for contract reads
   */
  const getPublic = useCallback(() => {
    return publicClient || getPublicClient();
  }, [publicClient]);

  /**
   * Get the wallet client for contract writes
   */
  const getWallet = useCallback(() => {
    return walletClient?.data || getWalletClient();
  }, [walletClient]);

  /**
   * Check if wallet is connected
   */
  const isConnected = account.isConnected;

  /**
   * Get current account address
   */
  const address = account.address;

  /**
   * Get current chain ID
   */
  const chainId = account.chainId;

  /**
   * Check if on correct chain
   */
  const isCorrectChain = chainId === CHAIN_CONFIG.chainId;

  return {
    publicClient: getPublic(),
    walletClient: getWallet(),
    account: {
      address,
      isConnected,
      chainId,
      isCorrectChain,
    },
    chainConfig: CHAIN_CONFIG,
  };
}
