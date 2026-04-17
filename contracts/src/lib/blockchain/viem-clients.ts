import { createPublicClient, createWalletClient, http } from 'viem';
import { initiaAppchain } from './wagmi-config';

/**
 * Viem Clients for Initia Appchain
 * 
 * Requirement 16.1, 16.2, 16.3
 * - Configure viem public client for contract reads
 * - Configure viem wallet client for contract writes
 * - Add chain configuration (chainId, RPC URLs, block explorer)
 */

/**
 * Public client for reading contract state and calling view functions
 * Used for:
 * - Reading token balances
 * - Querying contract state
 * - Estimating gas
 * - Simulating transactions
 */
export const publicClient = createPublicClient({
  chain: initiaAppchain,
  transport: http(process.env.NEXT_PUBLIC_INITIA_JSON_RPC || 'http://localhost:8545'),
  batch: {
    multicall: true,
  },
});

/**
 * Wallet client for writing to contracts and signing transactions
 * Used for:
 * - Submitting transactions
 * - Signing messages
 * - Approving token transfers
 * - Staking tokens
 * - Redeeming rewards
 * 
 * Note: Account is injected at runtime via wagmi hooks
 */
export const walletClient = createWalletClient({
  chain: initiaAppchain,
  transport: http(process.env.NEXT_PUBLIC_INITIA_JSON_RPC || 'http://localhost:8545'),
});

/**
 * Get public client instance
 * @returns Public client for contract reads
 */
export function getPublicClient() {
  return publicClient;
}

/**
 * Get wallet client instance
 * @returns Wallet client for contract writes
 */
export function getWalletClient() {
  return walletClient;
}

/**
 * Type exports for use in other modules
 */
export type PublicClient = typeof publicClient;
export type WalletClient = typeof walletClient;
