/**
 * Smart Contract Integration Layer
 * Exports all contract-related utilities and configurations
 */

// Configuration
export {
  getContractConfig,
  getContractConfigForEnvironment,
  getContractAddresses,
  getContractAddress,
  type Environment,
  type ContractAddresses,
  type ContractConfig,
} from './config';

// Validation
export {
  isValidAddress,
  isNotZeroAddress,
  normalizeAddress,
  validateContractAddresses,
  validateContractAddress,
  assertValidAddress,
  assertValidContractAddresses,
} from './validation';

// Client
export {
  initializeContractClient,
  getEcoRewardAddress,
  getEcoVerifierAddress,
  getEcoRewardABI,
  getEcoVerifierABI,
  getContractDetails,
  type ContractClient,
} from './client';

// EcoReward Contract Interface
export {
  createEcoRewardInterface,
  toContractUnits,
  fromContractUnits,
  type EcoRewardInterface,
} from './eco-reward';

// EcoVerifier Contract Interface
export {
  createEcoVerifierInterface,
  generateProofHash,
  validateProofHashFormat,
  validateTimestampRange,
  createProofSubmission,
  type EcoVerifierInterface,
  type TaskData,
  type ProofSubmissionData,
} from './eco-verifier';

// ABIs
export { default as EcoRewardABI } from './abis/EcoReward.abi.json';
export { default as EcoVerifierABI } from './abis/EcoVerifier.abi.json';
