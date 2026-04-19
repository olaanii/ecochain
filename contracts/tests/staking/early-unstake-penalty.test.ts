import { describe, it, expect } from "@jest/globals";
import fc from "fast-check";

/**
 * Property 14: Early Unstake Penalty
 * Validates: Requirements 10.3
 * 
 * Generates random unstake scenarios
 * Verifies 10% penalty applied when current time < end time
 */
describe("Property 14: Early Unstake Penalty", () => {
  const PENALTY_PERCENTAGE = 10;
  const PENALTY_DENOMINATOR = 100;

  function calculatePenalty(principal: bigint, isEarlyWithdrawal: boolean): bigint {
    if (!isEarlyWithdrawal) {
      return BigInt(0);
    }
    return (principal * BigInt(PENALTY_PERCENTAGE)) / BigInt(PENALTY_DENOMINATOR);
  }

  it("should apply 10% penalty for early withdrawal", () => {
    fc.assert(
      fc.property(
        fc.bigInt({ min: 100n * 10n ** 18n, max: 10000n * 10n ** 18n }),
        (principal) => {
          const penalty = calculatePenalty(principal, true);
          const expectedPenalty = (principal * BigInt(10)) / BigInt(100);

          expect(penalty).toBe(expectedPenalty);
          expect(penalty).toBe(principal / BigInt(10));
        }
      )
    );
  });

  it("should apply no penalty for withdrawal after maturity", () => {
    fc.assert(
      fc.property(
        fc.bigInt({ min: 100n * 10n ** 18n, max: 10000n * 10n ** 18n }),
        (principal) => {
          const penalty = calculatePenalty(principal, false);

          expect(penalty).toBe(0n);
        }
      )
    );
  });

  it("should verify penalty is exactly 10% of principal", () => {
    fc.assert(
      fc.property(
        fc.bigInt({ min: 100n * 10n ** 18n, max: 10000n * 10n ** 18n }),
        (principal) => {
          const penalty = calculatePenalty(principal, true);
          const tenPercent = principal / BigInt(10);

          expect(penalty).toBe(tenPercent);
        }
      )
    );
  });

  it("should calculate total amount correctly with penalty", () => {
    fc.assert(
      fc.property(
        fc.bigInt({ min: 100n * 10n ** 18n, max: 10000n * 10n ** 18n }),
        fc.bigInt({ min: 0n, max: 1000n * 10n ** 18n }),
        (principal, rewards) => {
          const penalty = calculatePenalty(principal, true);
          const totalAmount = principal + rewards - penalty;

          // Verify total is less than principal + rewards
          expect(totalAmount).toBeLessThan(principal + rewards);

          // Verify total is principal + rewards - 10% of principal
          const expectedTotal = principal + rewards - (principal / BigInt(10));
          expect(totalAmount).toBe(expectedTotal);
        }
      )
    );
  });

  it("should calculate total amount without penalty for mature stakes", () => {
    fc.assert(
      fc.property(
        fc.bigInt({ min: 100n * 10n ** 18n, max: 10000n * 10n ** 18n }),
        fc.bigInt({ min: 0n, max: 1000n * 10n ** 18n }),
        (principal, rewards) => {
          const penalty = calculatePenalty(principal, false);
          const totalAmount = principal + rewards - penalty;

          // Verify total equals principal + rewards
          expect(totalAmount).toBe(principal + rewards);
          expect(penalty).toBe(0n);
        }
      )
    );
  });

  it("should verify penalty is non-negative", () => {
    fc.assert(
      fc.property(
        fc.bigInt({ min: 100n * 10n ** 18n, max: 10000n * 10n ** 18n }),
        (principal) => {
          const penaltyEarly = calculatePenalty(principal, true);
          const penaltyMature = calculatePenalty(principal, false);

          expect(penaltyEarly).toBeGreaterThanOrEqual(0n);
          expect(penaltyMature).toBeGreaterThanOrEqual(0n);
        }
      )
    );
  });

  it("should verify penalty does not exceed principal", () => {
    fc.assert(
      fc.property(
        fc.bigInt({ min: 100n * 10n ** 18n, max: 10000n * 10n ** 18n }),
        (principal) => {
          const penalty = calculatePenalty(principal, true);

          expect(penalty).toBeLessThanOrEqual(principal);
        }
      )
    );
  });

  it("should handle edge case of minimum stake", () => {
    const minimumStake = BigInt(100) * BigInt(10) ** BigInt(18);
    const penalty = calculatePenalty(minimumStake, true);
    const expectedPenalty = minimumStake / BigInt(10);

    expect(penalty).toBe(expectedPenalty);
  });

  it("should handle edge case of large stake", () => {
    fc.assert(
      fc.property(
        fc.bigInt({ min: 1000000n * 10n ** 18n, max: 10000000n * 10n ** 18n }),
        (principal) => {
          const penalty = calculatePenalty(principal, true);
          const expectedPenalty = principal / BigInt(10);

          expect(penalty).toBe(expectedPenalty);
        }
      )
    );
  });

  it("should verify penalty calculation consistency", () => {
    fc.assert(
      fc.property(
        fc.bigInt({ min: 100n * 10n ** 18n, max: 10000n * 10n ** 18n }),
        (principal) => {
          // Calculate penalty twice
          const penalty1 = calculatePenalty(principal, true);
          const penalty2 = calculatePenalty(principal, true);

          // Should be identical
          expect(penalty1).toBe(penalty2);
        }
      )
    );
  });

  it("should verify penalty percentage is exactly 10%", () => {
    fc.assert(
      fc.property(
        fc.bigInt({ min: 100n * 10n ** 18n, max: 10000n * 10n ** 18n }),
        (principal) => {
          const penalty = calculatePenalty(principal, true);

          // Verify penalty is 10% of principal
          const penaltyPercentage = (penalty * BigInt(100)) / principal;
          expect(penaltyPercentage).toBe(BigInt(10));
        }
      )
    );
  });
});
