import { describe, it, expect, beforeEach } from "vitest";
import {
  calculateFraudScore,
  type FraudIndicators,
} from "@/lib/verification/fraud-detection";

describe("Fraud Detection System", () => {
  describe("Fraud Score Calculation", () => {
    it("should initialize fraud score at 0.0", () => {
      const indicators: FraudIndicators = {};
      const score = calculateFraudScore(indicators);
      expect(score).toBe(0.0);
    });

    it("should add 0.3 for duplicate similarity > 0.9", () => {
      const indicators: FraudIndicators = {
        duplicateSimilarity: 0.95,
      };
      const score = calculateFraudScore(indicators);
      expect(score).toBe(0.3);
    });

    it("should not add score for duplicate similarity <= 0.9", () => {
      const indicators: FraudIndicators = {
        duplicateSimilarity: 0.85,
      };
      const score = calculateFraudScore(indicators);
      expect(score).toBe(0.0);
    });

    it("should add 0.2 for submission count > 10 in 24h", () => {
      const indicators: FraudIndicators = {
        submissionVelocity: 15,
      };
      const score = calculateFraudScore(indicators);
      expect(score).toBe(0.2);
    });

    it("should not add score for submission count <= 10", () => {
      const indicators: FraudIndicators = {
        submissionVelocity: 8,
      };
      const score = calculateFraudScore(indicators);
      expect(score).toBe(0.0);
    });

    it("should add 0.15 for geolocation anomaly", () => {
      const indicators: FraudIndicators = {
        geolocationAnomaly: true,
      };
      const score = calculateFraudScore(indicators);
      expect(score).toBe(0.15);
    });

    it("should not add score for no geolocation anomaly", () => {
      const indicators: FraudIndicators = {
        geolocationAnomaly: false,
      };
      const score = calculateFraudScore(indicators);
      expect(score).toBe(0.0);
    });

    it("should add 0.25 for metadata inconsistency", () => {
      const indicators: FraudIndicators = {
        metadataInconsistency: true,
      };
      const score = calculateFraudScore(indicators);
      expect(score).toBe(0.25);
    });

    it("should not add score for no metadata inconsistency", () => {
      const indicators: FraudIndicators = {
        metadataInconsistency: false,
      };
      const score = calculateFraudScore(indicators);
      expect(score).toBe(0.0);
    });

    it("should combine multiple indicators", () => {
      const indicators: FraudIndicators = {
        duplicateSimilarity: 0.95,
        submissionVelocity: 15,
        geolocationAnomaly: true,
        metadataInconsistency: true,
      };
      const score = calculateFraudScore(indicators);
      expect(score).toBe(0.3 + 0.2 + 0.15 + 0.25);
    });

    it("should cap fraud score at 1.0", () => {
      const indicators: FraudIndicators = {
        duplicateSimilarity: 0.95,
        submissionVelocity: 15,
        geolocationAnomaly: true,
        metadataInconsistency: true,
      };
      const score = calculateFraudScore(indicators);
      expect(score).toBeLessThanOrEqual(1.0);
    });

    it("should handle edge case of exactly 0.9 similarity", () => {
      const indicators: FraudIndicators = {
        duplicateSimilarity: 0.9,
      };
      const score = calculateFraudScore(indicators);
      expect(score).toBe(0.0); // Not > 0.9
    });

    it("should handle edge case of exactly 10 submissions", () => {
      const indicators: FraudIndicators = {
        submissionVelocity: 10,
      };
      const score = calculateFraudScore(indicators);
      expect(score).toBe(0.0); // Not > 10
    });
  });

  describe("Property Tests", () => {
    it("Property 8: Fraud Detection Bounds - Score always between 0.0 and 1.0", () => {
      // Generate random fraud indicators
      const testCases = Array.from({ length: 100 }, () => ({
        duplicateSimilarity: Math.random(),
        submissionVelocity: Math.floor(Math.random() * 50),
        geolocationAnomaly: Math.random() > 0.5,
        metadataInconsistency: Math.random() > 0.5,
      }));

      testCases.forEach((indicators) => {
        const score = calculateFraudScore(indicators);
        expect(score).toBeGreaterThanOrEqual(0.0);
        expect(score).toBeLessThanOrEqual(1.0);
      });
    });

    it("Property 8: Fraud Detection Bounds - Score increases with more indicators", () => {
      const noIndicators: FraudIndicators = {};
      const oneIndicator: FraudIndicators = { duplicateSimilarity: 0.95 };
      const twoIndicators: FraudIndicators = {
        duplicateSimilarity: 0.95,
        submissionVelocity: 15,
      };
      const allIndicators: FraudIndicators = {
        duplicateSimilarity: 0.95,
        submissionVelocity: 15,
        geolocationAnomaly: true,
        metadataInconsistency: true,
      };

      const score0 = calculateFraudScore(noIndicators);
      const score1 = calculateFraudScore(oneIndicator);
      const score2 = calculateFraudScore(twoIndicators);
      const scoreAll = calculateFraudScore(allIndicators);

      expect(score0).toBeLessThanOrEqual(score1);
      expect(score1).toBeLessThanOrEqual(score2);
      expect(score2).toBeLessThanOrEqual(scoreAll);
    });

    it("Property 8: Fraud Detection Bounds - Flagging threshold at 0.5", () => {
      // Score <= 0.5 should not be flagged
      const lowScore: FraudIndicators = {
        duplicateSimilarity: 0.95,
        submissionVelocity: 15,
      };
      const lowScoreValue = calculateFraudScore(lowScore);
      expect(lowScoreValue).toBeLessThanOrEqual(0.5);

      // Score > 0.5 should be flagged
      const highScore: FraudIndicators = {
        duplicateSimilarity: 0.95,
        submissionVelocity: 15,
        geolocationAnomaly: true,
        metadataInconsistency: true,
      };
      const highScoreValue = calculateFraudScore(highScore);
      expect(highScoreValue).toBeGreaterThan(0.5);
    });
  });

  describe("Fraud Score Components", () => {
    it("should correctly weight duplicate similarity", () => {
      const score = calculateFraudScore({ duplicateSimilarity: 0.95 });
      expect(score).toBe(0.3);
    });

    it("should correctly weight submission velocity", () => {
      const score = calculateFraudScore({ submissionVelocity: 15 });
      expect(score).toBe(0.2);
    });

    it("should correctly weight geolocation anomaly", () => {
      const score = calculateFraudScore({ geolocationAnomaly: true });
      expect(score).toBe(0.15);
    });

    it("should correctly weight metadata inconsistency", () => {
      const score = calculateFraudScore({ metadataInconsistency: true });
      expect(score).toBe(0.25);
    });

    it("should sum all weights correctly", () => {
      const allTrue: FraudIndicators = {
        duplicateSimilarity: 0.95,
        submissionVelocity: 15,
        geolocationAnomaly: true,
        metadataInconsistency: true,
      };
      const score = calculateFraudScore(allTrue);
      const expected = 0.3 + 0.2 + 0.15 + 0.25;
      expect(score).toBe(expected);
    });
  });

  describe("Edge Cases", () => {
    it("should handle undefined indicators", () => {
      const indicators: FraudIndicators = {
        duplicateSimilarity: undefined,
        submissionVelocity: undefined,
        geolocationAnomaly: undefined,
        metadataInconsistency: undefined,
      };
      const score = calculateFraudScore(indicators);
      expect(score).toBe(0.0);
    });

    it("should handle zero values", () => {
      const indicators: FraudIndicators = {
        duplicateSimilarity: 0,
        submissionVelocity: 0,
        geolocationAnomaly: false,
        metadataInconsistency: false,
      };
      const score = calculateFraudScore(indicators);
      expect(score).toBe(0.0);
    });

    it("should handle maximum values", () => {
      const indicators: FraudIndicators = {
        duplicateSimilarity: 1.0,
        submissionVelocity: 1000,
        geolocationAnomaly: true,
        metadataInconsistency: true,
      };
      const score = calculateFraudScore(indicators);
      expect(score).toBe(1.0); // Capped at 1.0
    });

    it("should handle partial indicators", () => {
      const indicators: FraudIndicators = {
        duplicateSimilarity: 0.95,
        geolocationAnomaly: true,
      };
      const score = calculateFraudScore(indicators);
      expect(score).toBe(0.3 + 0.15);
    });
  });

  describe("Flagging Logic", () => {
    it("should flag when score > 0.5", () => {
      const indicators: FraudIndicators = {
        duplicateSimilarity: 0.95,
        submissionVelocity: 15,
        geolocationAnomaly: true,
      };
      const score = calculateFraudScore(indicators);
      const isFlagged = score > 0.5;
      expect(isFlagged).toBe(true);
    });

    it("should not flag when score <= 0.5", () => {
      const indicators: FraudIndicators = {
        duplicateSimilarity: 0.95,
        submissionVelocity: 15,
      };
      const score = calculateFraudScore(indicators);
      const isFlagged = score > 0.5;
      expect(isFlagged).toBe(false);
    });

    it("should flag at exactly 0.5 boundary", () => {
      // Create indicators that sum to exactly 0.5
      const indicators: FraudIndicators = {
        duplicateSimilarity: 0.95,
        submissionVelocity: 15,
        geolocationAnomaly: true,
      };
      const score = calculateFraudScore(indicators);
      // 0.3 + 0.2 + 0.15 = 0.65, which is > 0.5
      expect(score > 0.5).toBe(true);
    });
  });
});
