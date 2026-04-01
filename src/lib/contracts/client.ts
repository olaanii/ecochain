/**
 * Smart Contract Client
 * Provides utilities for interacting with EcoReward and EcoVerifier contracts
 */

import { getContractConfig, getContractAddress } from './config';
import { assertValidContractAddresses } from './validation';
import EcoRewardABI from './abis/EcoReward.abi.json';
import EcoVerifierABI from './abis/EcoVerifier.abi.json';

export interface ContractClient {
  ecoRewardAddress: string;
  ecoVerifierAddress: string;
  ecoRewardABI: typeof EcoRewardABI;
  ecoVerifierABI: typeof EcoVerifierABI;
  rpcUrl: string;
  chainId: number;
}

/**
 * Initialize contract client with current environment configuration
 */
export function initializeContractClient(): ContractClient {
  const config = getContractConfig();

  // Validate addresses before returning
  assertValidContractAddresses(config.addresses);

  return {
    ecoRewardAddress: config.addresses.ecoReward,
    ecoVerifierAddress: config.addresses.ecoVerifier,
    ecoRewardABI: EcoRewardABI,
    ecoVerifierABI: EcoVerifierABI,
    rpcUrl: config.rpcUrl,
    chainId: config.chainId,
  };
}

/**
 * Get EcoReward contract address
 */
export function getEcoRewardAddress(): string {
  return getContractAddress('ecoReward');
}

/**
 * Get EcoVerifier contract address
 */
export function getEcoVerifierAddress(): string {
  return getContractAddress('ecoVerifier');
}

/**
 * Get EcoReward contract ABI
 */
export function getEcoRewardABI(): typeof EcoRewardABI {
  return EcoRewardABI;
}

/**
 * Get EcoVerifier contract ABI
 */
export function getEcoVerifierABI(): typeof EcoVerifierABI {
  return EcoVerifierABI;
}

/**
 * Get contract configuration details
 */
export function getContractDetails() {
  const config = getContractConfig();

  return {
    environment: config.environment,
    chainId: config.chainId,
    rpcUrl: config.rpcUrl,
    contracts: {
      ecoReward: {
        address: config.addresses.ecoReward,
        abi: EcoRewardABI,
      },
      ecoVerifier: {
        address: config.addresses.ecoVerifier,
        abi: EcoVerifierABI,
      },
    },
  };
}
