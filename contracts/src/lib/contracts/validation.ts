/**
 * Contract Address Validation Utilities
 */

/**
 * Validate if a string is a valid Ethereum address
 */
export function isValidAddress(address: string): boolean {
  if (!address || typeof address !== 'string') {
    return false;
  }

  // Check if it's a valid hex string with 0x prefix and 40 hex characters
  const addressRegex = /^0x[a-fA-F0-9]{40}$/;
  return addressRegex.test(address);
}

/**
 * Validate if an address is not the zero address
 */
export function isNotZeroAddress(address: string): boolean {
  if (!isValidAddress(address)) {
    return false;
  }

  const zeroAddress = '0x0000000000000000000000000000000000000000';
  return address.toLowerCase() !== zeroAddress.toLowerCase();
}

/**
 * Normalize an address to lowercase
 */
export function normalizeAddress(address: string): string {
  if (!isValidAddress(address)) {
    throw new Error(`Invalid address: ${address}`);
  }

  return address.toLowerCase();
}

/**
 * Validate contract addresses configuration
 */
export function validateContractAddresses(addresses: {
  ecoReward: string;
  ecoVerifier: string;
}): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Validate ecoReward address
  if (!isValidAddress(addresses.ecoReward)) {
    errors.push('Invalid EcoReward contract address format');
  } else if (!isNotZeroAddress(addresses.ecoReward)) {
    errors.push('EcoReward contract address cannot be zero address');
  }

  // Validate ecoVerifier address
  if (!isValidAddress(addresses.ecoVerifier)) {
    errors.push('Invalid EcoVerifier contract address format');
  } else if (!isNotZeroAddress(addresses.ecoVerifier)) {
    errors.push('EcoVerifier contract address cannot be zero address');
  }

  // Check for duplicate addresses
  if (
    isValidAddress(addresses.ecoReward) &&
    isValidAddress(addresses.ecoVerifier) &&
    addresses.ecoReward.toLowerCase() === addresses.ecoVerifier.toLowerCase()
  ) {
    errors.push('EcoReward and EcoVerifier addresses cannot be the same');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Validate a single contract address with context
 */
export function validateContractAddress(
  address: string,
  contractName: string
): { valid: boolean; error?: string } {
  if (!isValidAddress(address)) {
    return {
      valid: false,
      error: `Invalid ${contractName} address format. Expected 0x followed by 40 hex characters.`,
    };
  }

  if (!isNotZeroAddress(address)) {
    return {
      valid: false,
      error: `${contractName} address cannot be zero address (0x0000000000000000000000000000000000000000)`,
    };
  }

  return { valid: true };
}

/**
 * Assert that an address is valid, throw if not
 */
export function assertValidAddress(address: string, contractName: string = 'Contract'): void {
  const validation = validateContractAddress(address, contractName);
  if (!validation.valid) {
    throw new Error(validation.error);
  }
}

/**
 * Assert that contract addresses are valid, throw if not
 */
export function assertValidContractAddresses(addresses: {
  ecoReward: string;
  ecoVerifier: string;
}): void {
  const validation = validateContractAddresses(addresses);
  if (!validation.valid) {
    throw new Error(`Contract address validation failed: ${validation.errors.join(', ')}`);
  }
}
