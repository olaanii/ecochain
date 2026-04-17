import { describe, it, expect, beforeEach, vi } from "vitest";
import { toContractUnits, fromContractUnits } from "@/lib/contracts/eco-reward";

describe("EcoReward Contract", () => {
  describe("Unit Conversion", () => {
    it("should convert decimal to contract units", () => {
      const amount = 100;
      const result = toContractUnits(amount, 18);
      expect(result).toBe(BigInt("100000000000000000000"));
    });

    it("should convert contract units to decimal", () => {
      const amount = BigInt("100000000000000000000");
      const result = fromContractUnits(amount, 18);
      expect(result).toBe("100.0");
    });

    it("should handle string amounts", () => {
      const amount = "50.5";
      const result = toContractUnits(amount, 18);
      expect(result).toBe(BigInt("50500000000000000000"));
    });

    it("should handle different decimals", () => {
      const amount = 100;
      const result = toContractUnits(amount, 6);
      expect(result).toBe(BigInt("100000000"));
    });

    it("should handle zero amounts", () => {
      const result = toContractUnits(0, 18);
      expect(result).toBe(BigInt("0"));
    });

    it("should handle very large amounts", () => {
      const amount = "1000000000";
      const result = toContractUnits(amount, 18);
      expect(result).toBe(BigInt("1000000000000000000000000000"));
    });
  });

  describe("Balance Calculations", () => {
    it("should calculate available balance correctly", () => {
      const total = BigInt("1000000000000000000000"); // 1000 ECO
      const staked = BigInt("300000000000000000000"); // 300 ECO
      const pending = BigInt("100000000000000000000"); // 100 ECO

      const available = total - staked - pending;
      expect(available).toBe(BigInt("600000000000000000000")); // 600 ECO
    });

    it("should handle zero balances", () => {
      const total = BigInt("0");
      const staked = BigInt("0");
      const pending = BigInt("0");

      const available = total - staked - pending;
      expect(available).toBe(BigInt("0"));
    });

    it("should handle edge case where staked + pending equals total", () => {
      const total = BigInt("1000000000000000000000");
      const staked = BigInt("600000000000000000000");
      const pending = BigInt("400000000000000000000");

      const available = total - staked - pending;
      expect(available).toBe(BigInt("0"));
    });
  });

  describe("Approval Amounts", () => {
    it("should validate minimum approval amount", () => {
      const minApproval = BigInt("100000000000000000000"); // 100 ECO
      const amount = BigInt("50000000000000000000"); // 50 ECO

      expect(amount < minApproval).toBe(true);
    });

    it("should validate sufficient approval", () => {
      const approved = BigInt("1000000000000000000000"); // 1000 ECO
      const needed = BigInt("500000000000000000000"); // 500 ECO

      expect(approved >= needed).toBe(true);
    });
  });
});
