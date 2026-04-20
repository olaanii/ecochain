/**
 * Smart Contract Configuration
 * Environment-based contract addresses and settings
 */

export type Environment = 'dev' | 'staging' | 'prod';

export interface ContractAddresses {
  ecoReward: string;
  ecoVerifier: string;
  staking: string;
}

export interface ContractConfig {
  addresses: ContractAddresses;
  environment: Environment;
  rpcUrl: string;
  chainId: number;
}

// Contract addresses by environment
const CONTRACT_ADDRESSES: Record<Environment, ContractAddresses> = {
  dev: {
    ecoReward:   process.env.NEXT_PUBLIC_ECO_REWARD_ADDRESS_DEV   || process.env.NEXT_PUBLIC_ECO_TOKEN_ADDR    || '0x0000000000000000000000000000000000000000',
    ecoVerifier: process.env.NEXT_PUBLIC_ECO_VERIFIER_ADDRESS_DEV || process.env.NEXT_PUBLIC_ECO_VERIFIER_ADDR || '0x0000000000000000000000000000000000000000',
    staking:     process.env.NEXT_PUBLIC_ECO_STAKING_ADDRESS_DEV  || process.env.NEXT_PUBLIC_ECO_STAKING_ADDR  || '0x0000000000000000000000000000000000000000',
  },
  staging: {
    ecoReward:   process.env.NEXT_PUBLIC_ECO_REWARD_ADDRESS_STAGING   || '0x0000000000000000000000000000000000000000',
    ecoVerifier: process.env.NEXT_PUBLIC_ECO_VERIFIER_ADDRESS_STAGING || '0x0000000000000000000000000000000000000000',
    staking:     process.env.NEXT_PUBLIC_ECO_STAKING_ADDRESS_STAGING  || '0x0000000000000000000000000000000000000000',
  },
  prod: {
    ecoReward:   process.env.NEXT_PUBLIC_ECO_REWARD_ADDRESS_PROD   || '0x0000000000000000000000000000000000000000',
    ecoVerifier: process.env.NEXT_PUBLIC_ECO_VERIFIER_ADDRESS_PROD || '0x0000000000000000000000000000000000000000',
    staking:     process.env.NEXT_PUBLIC_ECO_STAKING_ADDRESS_PROD  || '0x0000000000000000000000000000000000000000',
  },
};

// RPC URLs by environment
const RPC_URLS: Record<Environment, string> = {
  dev: process.env.NEXT_PUBLIC_RPC_URL_DEV || 'http://localhost:8545',
  staging: process.env.NEXT_PUBLIC_RPC_URL_STAGING || 'https://staging-rpc.example.com',
  prod: process.env.NEXT_PUBLIC_RPC_URL_PROD || 'https://mainnet-rpc.example.com',
};

// Chain IDs by environment
const CHAIN_IDS: Record<Environment, number> = {
  dev: parseInt(process.env.NEXT_PUBLIC_CHAIN_ID_DEV || '31337', 10),
  staging: parseInt(process.env.NEXT_PUBLIC_CHAIN_ID_STAGING || '11155111', 10),
  prod: parseInt(process.env.NEXT_PUBLIC_CHAIN_ID_PROD || '1', 10),
};

/**
 * Get the current environment
 */
function getCurrentEnvironment(): Environment {
  const env = process.env.NEXT_PUBLIC_ENVIRONMENT || process.env.NODE_ENV;
  
  if (env === 'production') return 'prod';
  if (env === 'staging') return 'staging';
  return 'dev';
}

/**
 * Get contract configuration for the current environment
 */
export function getContractConfig(): ContractConfig {
  const environment = getCurrentEnvironment();
  
  return {
    addresses: CONTRACT_ADDRESSES[environment],
    environment,
    rpcUrl: RPC_URLS[environment],
    chainId: CHAIN_IDS[environment],
  };
}

/**
 * Get contract configuration for a specific environment
 */
export function getContractConfigForEnvironment(env: Environment): ContractConfig {
  return {
    addresses: CONTRACT_ADDRESSES[env],
    environment: env,
    rpcUrl: RPC_URLS[env],
    chainId: CHAIN_IDS[env],
  };
}

/**
 * Get contract addresses for the current environment
 */
export function getContractAddresses(): ContractAddresses {
  const environment = getCurrentEnvironment();
  return CONTRACT_ADDRESSES[environment];
}

/**
 * Get a specific contract address
 */
export function getContractAddress(contract: keyof ContractAddresses): string {
  const addresses = getContractAddresses();
  return addresses[contract];
}
