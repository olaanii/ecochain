import { describe, it, expect, beforeEach } from "vitest";
import {
  generateProofHash,
  validateProofHashFormat,
  validateTimestampRange,
  createProofSubmission,
} from "@/lib/contracts/eco-verifier";

describe("EcoVerifier Contract", () => {
  describe("Proof Hash Generation", () => {
    it("should generate consistent hash for same data", () => {
      const data = "test-proof-data";
      const hash1 = generateProofHash(data);
      const hash2 = generateProofHash(data);

      expect(hash1).toBe(hash2);
    });

    it("should generate different hashes for different data", () => {
      const hash1 = generateProofHash("data1");
      const hash2 = generateProofHash("data2");

      expect(hash1).not.toBe(hash2);
    });

    it("should generate valid hex hash", () => {
      const hash = generateProofHash("test-data");
      expect(/^0x[a-f0-9]{64}$/i.test(hash)).toBe(true);
    });

    it("should handle buffer input", () => {
      const buffer = Buffer.from("test-data");
      const hash = generateProofHash(buffer);
      expect(/^0x[a-f0-9]{64}$/i.test(hash)).toBe(true);
    });

    it("should handle empty string", () => {
      const hash = generateProofHash("");
      expect(/^0x[a-f0-9]{64}$/i.test(hash)).toBe(true);
    });

    it("should handle long data", () => {
      const longData = "x".repeat(10000);
      const hash = generateProofHash(longData);
      expect(/^0x[a-f0-9]{64}$/i.test(hash)).toBe(true);
    });
  });

  describe("Proof Hash Validation", () => {
    it("should validate correct hash format", () => {
      const validHash = "0x" + "a".repeat(64);
      expect(validateProofHashFormat(validHash)).toBe(true);
    });

    it("should reject hash without 0x prefix", () => {
      const invalidHash = "a".repeat(64);
      expect(() => validateProofHashFormat(invalidHash)).toThrow();
    });

    it("should reject hash with wrong length", () => {
      const invalidHash = "0x" + "a".repeat(63);
      expect(() => validateProofHashFormat(invalidHash)).toThrow();
    });

    it("should reject hash with invalid characters", () => {
      const invalidHash = "0x" + "g".repeat(64);
      expect(() => validateProofHashFormat(invalidHash)).toThrow();
    });

    it("should accept uppercase hex", () => {
      const validHash = "0x" + "A".repeat(64);
      expect(validateProofHashFormat(validHash)).toBe(true);
    });

    it("should accept mixed case hex", () => {
      const validHash = "0xAbCdEf" + "0".repeat(58);
      expect(validateProofHashFormat(validHash)).toBe(true);
    });
  });

  describe("Timestamp Validation", () => {
    it("should accept current timestamp", () => {
      const now = Math.floor(Date.now() / 1000);
      expect(validateTimestampRange(now)).toBe(true);
    });

    it("should accept timestamp within 48 hours", () => {
      const now = Math.floor(Date.now() / 1000);
      const oneHourAgo = now - 60 * 60;
      expect(validateTimestampRange(oneHourAgo)).toBe(true);
    });

    it("should accept timestamp 48 hours ago", () => {
      const now = Math.floor(Date.now() / 1000);
      const fortyEightHoursAgo = now - 48 * 60 * 60;
      expect(validateTimestampRange(fortyEightHoursAgo)).toBe(true);
    });

    it("should reject future timestamp", () => {
      const now = Math.floor(Date.now() / 1000);
      const future = now + 60 * 60;
      expect(() => validateTimestampRange(future)).toThrow(
        "Timestamp cannot be in the future",
      );
    });

    it("should reject timestamp older than 48 hours", () => {
      const now = Math.floor(Date.now() / 1000);
      const tooOld = now - 49 * 60 * 60;
      expect(() => validateTimestampRange(tooOld)).toThrow(
        "Timestamp must be within 48 hours",
      );
    });

    it("should handle bigint timestamps", () => {
      const now = BigInt(Math.floor(Date.now() / 1000));
      expect(validateTimestampRange(now)).toBe(true);
    });
  });

  describe("Proof Submission Creation", () => {
    it("should create valid proof submission", () => {
      const taskId = BigInt(1);
      const proofData = "test-proof";

      const submission = createProofSubmission(taskId, proofData);

      expect(submission.taskId).toBe(taskId);
      expect(/^0x[a-f0-9]{64}$/i.test(submission.proofHash)).toBe(true);
      expect(submission.timestamp > BigInt(0)).toBe(true);
    });

    it("should generate consistent hash for same proof data", () => {
      const taskId = BigInt(1);
      const proofData = "test-proof";

      const submission1 = createProofSubmission(taskId, proofData);
      const submission2 = createProofSubmission(taskId, proofData);

      expect(submission1.proofHash).toBe(submission2.proofHash);
    });

    it("should generate different hashes for different proof data", () => {
      const taskId = BigInt(1);

      const submission1 = createProofSubmission(taskId, "proof1");
      const submission2 = createProofSubmission(taskId, "proof2");

      expect(submission1.proofHash).not.toBe(submission2.proofHash);
    });

    it("should set timestamp to current time", () => {
      const taskId = BigInt(1);
      const proofData = "test-proof";
      const now = BigInt(Math.floor(Date.now() / 1000));

      const submission = createProofSubmission(taskId, proofData);

      // Timestamp should be within 1 second of now
      expect(submission.timestamp >= now - BigInt(1)).toBe(true);
      expect(submission.timestamp <= now + BigInt(1)).toBe(true);
    });

    it("should handle buffer input", () => {
      const taskId = BigInt(1);
      const proofData = Buffer.from("test-proof");

      const submission = createProofSubmission(taskId, proofData);

      expect(/^0x[a-f0-9]{64}$/i.test(submission.proofHash)).toBe(true);
    });
  });

  describe("Property Tests", () => {
    it("Property 2: Proof Uniqueness - Same data produces same hash", () => {
      // Generate random proof data
      const proofData = Math.random().toString(36).substring(7);

      const hash1 = generateProofHash(proofData);
      const hash2 = generateProofHash(proofData);

      // Same data should always produce same hash
      expect(hash1).toBe(hash2);
    });

    it("Property 2: Proof Uniqueness - Different data produces different hashes", () => {
      // Generate multiple random proof data
      const proofs = Array.from({ length: 10 }, () =>
        Math.random().toString(36).substring(7),
      );

      const hashes = proofs.map(generateProofHash);

      // All hashes should be unique
      const uniqueHashes = new Set(hashes);
      expect(uniqueHashes.size).toBe(hashes.length);
    });

    it("Property 5: Temporal Validity - Timestamp within 48 hours is valid", () => {
      const now = Math.floor(Date.now() / 1000);

      // Test various timestamps within 48 hours
      const validTimestamps = [
        now, // Current
        now - 60, // 1 minute ago
        now - 60 * 60, // 1 hour ago
        now - 24 * 60 * 60, // 1 day ago
        now - 48 * 60 * 60, // 48 hours ago
      ];

      validTimestamps.forEach((timestamp) => {
        expect(validateTimestampRange(timestamp)).toBe(true);
      });
    });

    it("Property 5: Temporal Validity - Timestamp outside 48 hours is invalid", () => {
      const now = Math.floor(Date.now() / 1000);

      // Test invalid timestamps
      const invalidTimestamps = [
        now + 60, // 1 minute in future
        now - 49 * 60 * 60, // 49 hours ago
        now - 100 * 60 * 60, // 100 hours ago
      ];

      invalidTimestamps.forEach((timestamp) => {
        expect(() => validateTimestampRange(timestamp)).toThrow();
      });
    });
  });
});
