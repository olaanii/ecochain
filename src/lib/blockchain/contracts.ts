import { getAddress } from 'viem';
import EcoRewardABI from '@/lib/initia/EcoReward_abi.json';
import EcoVerifierABI from '@/lib/initia/EcoVerifier_abi.json';

/**
 * Smart Contract Configuration
 * 
 * Requirement 6.1
 * - Export EcoReward.sol ABI from compiled contracts
 * - Export EcoVerifier.sol ABI from compiled contracts
 * - Create contract address configuration by environment (dev, staging, prod)
 * - Add contract address validation
 */

/**
 * Contract addresses by environment
 */
const CONTRACT_ADDRESSES = {
  ecoReward: process.env.NEXT_PUBLIC_ECO_TOKEN_ADDR || '0x1E794b01C5Dc3CAc1C5b5edb475aCdD6EDf9C23D',
  ecoVerifier: process.env.NEXT_PUBLIC_ECO_VERIFIER_ADDR || '0x72320C21aE361FCC0b479E18dd528F7872E8450C',
} as const;

/**
 * Validate contract address format
 * @param address - Address to validate
 * @returns Validated address
 * @throws Error if address is invalid
 */
function validateAddress(address: string): `0x${string}` {
  try {
    return getAddress(address);
  } catch (error) {
    throw new Error(`Invalid contract address: ${address}`);
  }
}

/**
 * EcoReward Contract Configuration
 * ERC20 token contract for ECO token
 */
export const EcoRewardContract = {
  address: validateAddress(CONTRACT_ADDRESSES.ecoReward),
  abi: EcoRewardABI,
  name: 'EcoReward',
  symbol: 'ECO',
  decimals: 18,
};

/**
 * EcoVerifier Contract Configuration
 * Task verification and reward minting contract
 */
export const EcoVerifierContract = {
  address: validateAddress(CONTRACT_ADDRESSES.ecoVerifier),
  abi: EcoVerifierABI,
  name: 'EcoVerifier',
};

/**
 * Get contract address by name
 * @param contractName - Name of the contract
 * @returns Contract address
 */
export function getContractAddress(contractName: 'ecoReward' | 'ecoVerifier'): `0x${string}` {
  const address = CONTRACT_ADDRESSES[contractName];
  return validateAddress(address);
}

/**
 * Get contract ABI by name
 * @param contractName - Name of the contract
 * @returns Contract ABI
 */
export function getContractABI(contractName: 'ecoReward' | 'ecoVerifier') {
  if (contractName === 'ecoReward') {
    return EcoRewardContract.abi;
  } else if (contractName === 'ecoVerifier') {
    return EcoVerifierContract.abi;
  }
  throw new Error(`Unknown contract: ${contractName}`);
}

/**
 * Contract configuration object for easy access
 */
export const CONTRACTS = {
  ecoReward: EcoRewardContract,
  ecoVerifier: EcoVerifierContract,
} as const;

/**
 * Type for contract names
 */
export type ContractName = keyof typeof CONTRACTS;
