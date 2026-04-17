/**
 * Proof Hash Generation and Validation
 * 
 * Generates unique SHA-256 hashes from proof data and timestamps
 * Validates proof hash uniqueness in database
 * 
 * Requirements: 2.4, 2.5, 29.8
 */

import crypto from 'crypto';
import { prisma } from '@/lib/prisma/client';

/**
 * Generate SHA-256 hash from proof data and timestamp
 * 
 * Requirements: 2.4, 2.5
 * 
 * @param proofData The proof data (image, transit data, etc.)
 * @param timestamp The timestamp when proof was created
 * @returns SHA-256 hash as hex string (64 characters)
 */
export function generateProofHash(proofData: string, timestamp: number): string {
  const combined = `${proofData}:${timestamp}`;
  return crypto.createHash('sha256').update(combined).digest('hex');
}

/**
 * Check if proof hash already exists in database
 * 
 * Requirements: 2.4, 2.5
 * 
 * @param proofHash The proof hash to check
 * @returns True if hash exists, false otherwise
 */
export async function checkProofHashExists(proofHash: string): Promise<boolean> {
  const existing = await prisma.verification.findUnique({
    where: { proofHash },
    select: { id: true },
  });

  return !!existing;
}

/**
 * Validate proof hash format
 * SHA-256 produces 64 hexadecimal characters
 * 
 * @param hash The hash to validate
 * @returns True if valid SHA-256 hash format
 */
export function validateProofHashFormat(hash: string): boolean {
  if (!hash || typeof hash !== 'string') {
    return false;
  }

  // SHA-256 produces 64 hex characters
  const sha256Regex = /^[a-f0-9]{64}$/i;
  return sha256Regex.test(hash);
}

/**
 * Generate and validate proof hash
 * Ensures hash is unique and properly formatted
 * 
 * Requirements: 2.4, 2.5, 29.8
 * 
 * @param proofData The proof data
 * @param timestamp The timestamp
 * @returns Object with hash and validation result
 */
export async function generateAndValidateProofHash(
  proofData: string,
  timestamp: number
): Promise<{
  hash: string;
  isValid: boolean;
  isDuplicate: boolean;
  error?: string;
}> {
  try {
    // Generate hash
    const hash = generateProofHash(proofData, timestamp);

    // Validate format
    if (!validateProofHashFormat(hash)) {
      return {
        hash,
        isValid: false,
        isDuplicate: false,
        error: 'Invalid proof hash format',
      };
    }

    // Check uniqueness
    const isDuplicate = await checkProofHashExists(hash);

    return {
      hash,
      isValid: !isDuplicate,
      isDuplicate,
      error: isDuplicate ? 'Proof hash already exists' : undefined,
    };
  } catch (error) {
    return {
      hash: '',
      isValid: false,
      isDuplicate: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
