import { http, createConfig } from 'wagmi';
import { defineChain } from 'viem';

/**
 * Initia Appchain Configuration for wagmi
 * 
 * Requirement 16.1, 16.2, 16.3
 * - Set up wagmi config with Initia appchain parameters
 * - Configure viem public client for contract reads
 * - Configure viem wallet client for contract writes
 * - Add chain configuration (chainId, RPC URLs, block explorer)
 */

const INITIA_EVM_CHAIN_ID = Number(
  process.env.NEXT_PUBLIC_INITIA_EVM_CHAIN_ID ?? '1598283435881984'
);

// Define the Initia Appchain (Ecochain) as a custom chain
export const initiaAppchain = defineChain({
  id: INITIA_EVM_CHAIN_ID,
  name: 'Initia Ecochain',
  nativeCurrency: {
    decimals: 18,
    name: 'ECO',
    symbol: 'ECO',
  },
  rpcUrls: {
    default: {
      http: [process.env.NEXT_PUBLIC_INITIA_JSON_RPC || 'http://localhost:8545'],
    },
    public: {
      http: [process.env.NEXT_PUBLIC_INITIA_JSON_RPC || 'http://localhost:8545'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Initia Explorer',
      url: process.env.NEXT_PUBLIC_INITIA_EXPLORER_URL || 'https://explorer.initia.xyz',
    },
  },
  testnet: true,
});

/**
 * Create wagmi configuration with Initia appchain
 * 
 * Features:
 * - HTTP transport for JSON-RPC calls
 * - Automatic chain switching
 * - Built-in error handling
 */
export const wagmiConfig = createConfig({
  chains: [initiaAppchain],
  transports: {
    [initiaAppchain.id]: http(process.env.NEXT_PUBLIC_INITIA_JSON_RPC || 'http://localhost:8545'),
  },
  ssr: true, // Enable server-side rendering support
});

/**
 * Chain configuration constants
 */
export const CHAIN_CONFIG = {
  chainId: initiaAppchain.id,
  chainName: initiaAppchain.name,
  rpcUrl: process.env.NEXT_PUBLIC_INITIA_JSON_RPC || 'http://localhost:8545',
  restUrl: process.env.NEXT_PUBLIC_INITIA_REST || 'http://localhost:1317',
  rpcTendermint: process.env.NEXT_PUBLIC_INITIA_RPC || 'http://localhost:26657',
  blockExplorerUrl: process.env.NEXT_PUBLIC_INITIA_EXPLORER_URL || 'https://explorer.initia.xyz',
  nativeCurrency: {
    name: 'ECO',
    symbol: 'ECO',
    decimals: 18,
  },
} as const;

export type WagmiConfig = typeof wagmiConfig;
