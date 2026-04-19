/**
 * Contract Validation Tests
 */

import {
  isValidAddress,
  isNotZeroAddress,
  normalizeAddress,
  validateContractAddresses,
  validateContractAddress,
} from '../validation';

describe('Contract Address Validation', () => {
  const validAddress = '0x1234567890123456789012345678901234567890';
  const zeroAddress = '0x0000000000000000000000000000000000000000';
  const invalidAddress = 'not-an-address';

  describe('isValidAddress', () => {
    it('should validate correct address format', () => {
      expect(isValidAddress(validAddress)).toBe(true);
    });

    it('should reject invalid address format', () => {
      expect(isValidAddress(invalidAddress)).toBe(false);
      expect(isValidAddress('')).toBe(false);
      expect(isValidAddress('0x123')).toBe(false);
    });

    it('should accept zero address as valid format', () => {
      expect(isValidAddress(zeroAddress)).toBe(true);
    });
  });

  describe('isNotZeroAddress', () => {
    it('should accept non-zero addresses', () => {
      expect(isNotZeroAddress(validAddress)).toBe(true);
    });

    it('should reject zero address', () => {
      expect(isNotZeroAddress(zeroAddress)).toBe(false);
    });

    it('should reject invalid addresses', () => {
      expect(isNotZeroAddress(invalidAddress)).toBe(false);
    });
  });

  describe('normalizeAddress', () => {
    it('should convert address to lowercase', () => {
      const mixedCase = '0xABCDEF1234567890ABCDEF1234567890ABCDEF12';
      expect(normalizeAddress(mixedCase)).toBe(mixedCase.toLowerCase());
    });

    it('should throw on invalid address', () => {
      expect(() => normalizeAddress(invalidAddress)).toThrow();
    });
  });

  describe('validateContractAddresses', () => {
    it('should validate correct addresses', () => {
      const result = validateContractAddresses({
        ecoReward: validAddress,
        ecoVerifier: '0xABCDEF1234567890ABCDEF1234567890ABCDEF12',
      });

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject zero addresses', () => {
      const result = validateContractAddresses({
        ecoReward: zeroAddress,
        ecoVerifier: validAddress,
      });

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('EcoReward contract address cannot be zero address');
    });

    it('should reject duplicate addresses', () => {
      const result = validateContractAddresses({
        ecoReward: validAddress,
        ecoVerifier: validAddress,
      });

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('EcoReward and EcoVerifier addresses cannot be the same');
    });

    it('should reject invalid address formats', () => {
      const result = validateContractAddresses({
        ecoReward: invalidAddress,
        ecoVerifier: validAddress,
      });

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Invalid EcoReward contract address format');
    });
  });

  describe('validateContractAddress', () => {
    it('should validate single address', () => {
      const result = validateContractAddress(validAddress, 'TestContract');
      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should provide error message for invalid address', () => {
      const result = validateContractAddress(invalidAddress, 'TestContract');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Invalid TestContract address format');
    });

    it('should provide error message for zero address', () => {
      const result = validateContractAddress(zeroAddress, 'TestContract');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('TestContract address cannot be zero address');
    });
  });
});
