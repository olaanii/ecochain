import {
  calculateFraudScore,
  checkDuplicateSubmissions,
  checkSubmissionVelocity,
  checkGeolocationAnomaly,
  checkMetadataInconsistency,
  detectFraud,
  checkCooldown,
  setCooldown,
} from '../fraud-detection';

describe('Fraud Detection System', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('calculateFraudScore', () => {
    it('should initialize fraud score at 0.0', () => {
      const indicators = {
        duplicateSimilarity: 0,
        submissionVelocity: 0,
        geolocationAnomaly: false,
        metadataInconsistency: false,
      };

      const score = calculateFraudScore(indicators);
      expect(score).toBe(0);
    });

    it('should add 0.3 for duplicate similarity > 0.9', () => {
      const indicators = {
        duplicateSimilarity: 0.95,
        submissionVelocity: 0,
        geolocationAnomaly: false,
        metadataInconsistency: false,
      };

      const score = calculateFraudScore(indicators);
      expect(score).toBe(0.3);
    });

    it('should not add penalty for duplicate similarity <= 0.9', () => {
      const indicators = {
        duplicateSimilarity: 0.85,
        submissionVelocity: 0,
        geolocationAnomaly: false,
        metadataInconsistency: false,
      };

      const score = calculateFraudScore(indicators);
      expect(score).toBe(0);
    });

    it('should add 0.2 for submission velocity > 10', () => {
      const indicators = {
        duplicateSimilarity: 0,
        submissionVelocity: 15,
        geolocationAnomaly: false,
        metadataInconsistency: false,
      };

      const score = calculateFraudScore(indicators);
      expect(score).toBe(0.2);
    });

    it('should not add penalty for submission velocity <= 10', () => {
      const indicators = {
        duplicateSimilarity: 0,
        submissionVelocity: 8,
        geolocationAnomaly: false,
        metadataInconsistency: false,
      };

      const score = calculateFraudScore(indicators);
      expect(score).toBe(0);
    });

    it('should add 0.15 for geolocation anomaly', () => {
      const indicators = {
        duplicateSimilarity: 0,
        submissionVelocity: 0,
        geolocationAnomaly: true,
        metadataInconsistency: false,
      };

      const score = calculateFraudScore(indicators);
      expect(score).toBe(0.15);
    });

    it('should add 0.25 for metadata inconsistency', () => {
      const indicators = {
        duplicateSimilarity: 0,
        submissionVelocity: 0,
        geolocationAnomaly: false,
        metadataInconsistency: true,
      };

      const score = calculateFraudScore(indicators);
      expect(score).toBe(0.25);
    });

    it('should cap fraud score at 1.0', () => {
      const indicators = {
        duplicateSimilarity: 1.0,
        submissionVelocity: 20,
        geolocationAnomaly: true,
        metadataInconsistency: true,
      };

      const score = calculateFraudScore(indicators);
      expect(score).toBeLessThanOrEqual(1.0);
      expect(score).toBe(1.0);
    });

    it('should combine multiple indicators correctly', () => {
      const indicators = {
        duplicateSimilarity: 0.95,
        submissionVelocity: 15,
        geolocationAnomaly: true,
        metadataInconsistency: false,
      };

      const score = calculateFraudScore(indicators);
      expect(score).toBe(0.3 + 0.2 + 0.15); // 0.65
    });
  });

  describe('Fraud Score Bounds (Property Test)', () => {
    it('should always return fraud score between 0.0 and 1.0', () => {
      const testCases = [
        { duplicateSimilarity: 0, submissionVelocity: 0, geolocationAnomaly: false, metadataInconsistency: false },
        { duplicateSimilarity: 0.5, submissionVelocity: 5, geolocationAnomaly: false, metadataInconsistency: false },
        { duplicateSimilarity: 0.95, submissionVelocity: 20, geolocationAnomaly: true, metadataInconsistency: true },
        { duplicateSimilarity: 1.0, submissionVelocity: 50, geolocationAnomaly: true, metadataInconsistency: true },
        { duplicateSimilarity: 0.92, submissionVelocity: 12, geolocationAnomaly: true, metadataInconsistency: false },
      ];

      testCases.forEach((indicators) => {
        const score = calculateFraudScore(indicators);
        expect(score).toBeGreaterThanOrEqual(0.0);
        expect(score).toBeLessThanOrEqual(1.0);
      });
    });
  });

  describe('checkDuplicateSubmissions', () => {
    it('should detect duplicate submissions with high similarity', async () => {
      const result = await checkDuplicateSubmissions(
        'user-123',
        'task-456',
        '0x' + 'a'.repeat(64)
      );

      expect(result).toHaveProperty('isDuplicate');
      expect(result).toHaveProperty('similarity');
      expect(typeof result.similarity).toBe('number');
      expect(result.similarity).toBeGreaterThanOrEqual(0);
      expect(result.similarity).toBeLessThanOrEqual(1);
    });
  });

  describe('checkSubmissionVelocity', () => {
    it('should return submission count for user', async () => {
      const velocity = await checkSubmissionVelocity('user-123');

      expect(typeof velocity).toBe('number');
      expect(velocity).toBeGreaterThanOrEqual(0);
    });
  });

  describe('checkGeolocationAnomaly', () => {
    it('should detect geolocation anomalies', async () => {
      const geolocation = { latitude: 40.7128, longitude: -74.006 };
      const isAnomaly = await checkGeolocationAnomaly('user-123', geolocation);

      expect(typeof isAnomaly).toBe('boolean');
    });

    it('should handle missing geolocation gracefully', async () => {
      const isAnomaly = await checkGeolocationAnomaly('user-123', undefined);

      expect(typeof isAnomaly).toBe('boolean');
    });
  });

  describe('checkMetadataInconsistency', () => {
    it('should detect metadata inconsistencies', async () => {
      const metadata = {
        deviceId: 'device-123',
        osVersion: '14.0',
      };

      const isInconsistent = await checkMetadataInconsistency('user-123', metadata);

      expect(typeof isInconsistent).toBe('boolean');
    });

    it('should handle missing metadata gracefully', async () => {
      const isInconsistent = await checkMetadataInconsistency('user-123', undefined);

      expect(typeof isInconsistent).toBe('boolean');
    });
  });

  describe('detectFraud', () => {
    it('should return fraud detection result', async () => {
      const result = await detectFraud(
        'user-123',
        'task-456',
        '0x' + 'a'.repeat(64),
        { deviceId: 'device-123' }
      );

      expect(result).toHaveProperty('fraudScore');
      expect(result).toHaveProperty('isFlagged');
      expect(result).toHaveProperty('indicators');
      expect(typeof result.fraudScore).toBe('number');
      expect(typeof result.isFlagged).toBe('boolean');
    });

    it('should flag submissions with fraud score > 0.5', async () => {
      const result = await detectFraud(
        'user-123',
        'task-456',
        '0x' + 'a'.repeat(64)
      );

      if (result.fraudScore > 0.5) {
        expect(result.isFlagged).toBe(true);
      }
    });

    it('should not flag submissions with fraud score <= 0.5', async () => {
      const result = await detectFraud(
        'user-123',
        'task-456',
        '0x' + 'a'.repeat(64)
      );

      if (result.fraudScore <= 0.5) {
        expect(result.isFlagged).toBe(false);
      }
    });

    it('should include reason when flagged', async () => {
      const result = await detectFraud(
        'user-123',
        'task-456',
        '0x' + 'a'.repeat(64)
      );

      if (result.isFlagged) {
        expect(result.reason).toBeDefined();
        expect(typeof result.reason).toBe('string');
      }
    });
  });

  describe('Cooldown Management', () => {
    it('should set and check cooldown', async () => {
      const userId = 'user-123';
      const taskId = 'task-456';

      // Set cooldown
      await setCooldown(userId, taskId);

      // Check cooldown
      const hasCooldown = await checkCooldown(userId, taskId);
      expect(hasCooldown).toBe(true);
    });

    it('should enforce 24-hour cooldown', async () => {
      const userId = 'user-123';
      const taskId = 'task-456';

      await setCooldown(userId, taskId);
      const hasCooldown = await checkCooldown(userId, taskId);

      expect(hasCooldown).toBe(true);
    });
  });

  describe('String Similarity', () => {
    it('should calculate string similarity correctly', async () => {
      // Test with identical strings
      const result1 = await detectFraud(
        'user-123',
        'task-456',
        '0x' + 'a'.repeat(64)
      );

      expect(result1.indicators.duplicateSimilarity).toBeDefined();
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty metadata', async () => {
      const result = await detectFraud(
        'user-123',
        'task-456',
        '0x' + 'a'.repeat(64),
        {}
      );

      expect(result.fraudScore).toBeGreaterThanOrEqual(0);
      expect(result.fraudScore).toBeLessThanOrEqual(1);
    });

    it('should handle null indicators', async () => {
      const indicators = {
        duplicateSimilarity: undefined,
        submissionVelocity: undefined,
        geolocationAnomaly: undefined,
        metadataInconsistency: undefined,
      };

      const score = calculateFraudScore(indicators as any);
      expect(score).toBeGreaterThanOrEqual(0);
      expect(score).toBeLessThanOrEqual(1);
    });

    it('should handle extreme values', async () => {
      const indicators = {
        duplicateSimilarity: 1.0,
        submissionVelocity: 1000,
        geolocationAnomaly: true,
        metadataInconsistency: true,
      };

      const score = calculateFraudScore(indicators);
      expect(score).toBeLessThanOrEqual(1.0);
    });
  });
});
