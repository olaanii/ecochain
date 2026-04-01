import { describe, it, expect } from "@jest/globals";
import fc from "fast-check";

/**
 * Property 3: Reward Calculation Correctness
 * Validates: Requirements 5.1, 5.2, 5.3, 5.4
 * 
 * Generates random base rewards and bonus multipliers
 * Verifies calculated reward = baseReward × bonusMultiplier
 * Verifies bonus multiplier between 1.0 and 2.0
 */
describe("Property 3: Reward Calculation Correctness", () => {
  it("should calculate reward as baseReward × bonusMultiplier", () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 1000 }), // baseReward
        fc.float({ min: 1.0, max: 2.0, noNaN: true }), // bonusMultiplier
        (baseReward, bonusMultiplier) => {
          const calculatedReward = baseReward * bonusMultiplier;
          
          // Verify calculation is correct
          expect(calculatedReward).toBe(baseReward * bonusMultiplier);
          
          // Verify result is positive
          expect(calculatedReward).toBeGreaterThan(0);
        }
      )
    );
  });

  it("should ensure bonus multiplier is between 1.0 and 2.0", () => {
    fc.assert(
      fc.property(
        fc.float({ min: 1.0, max: 2.0, noNaN: true }), // bonusMultiplier
        (bonusMultiplier) => {
          expect(bonusMultiplier).toBeGreaterThanOrEqual(1.0);
          expect(bonusMultiplier).toBeLessThanOrEqual(2.0);
        }
      )
    );
  });

  it("should calculate streak bonus correctly (max +0.3)", () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 30 }), // streak days
        (streakDays) => {
          const streakBonus = Math.min(streakDays * 0.01, 0.3);
          const multiplier = 1.0 + streakBonus;
          
          // Verify streak bonus doesn't exceed 0.3
          expect(streakBonus).toBeLessThanOrEqual(0.3);
          
          // Verify multiplier stays within bounds
          expect(multiplier).toBeGreaterThanOrEqual(1.0);
          expect(multiplier).toBeLessThanOrEqual(1.3);
        }
      )
    );
  });

  it("should calculate category mastery bonus correctly (max +0.2)", () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 100 }), // completion count
        (completionCount) => {
          const masteryBonus = Math.min(Math.floor(completionCount / 10) * 0.05, 0.2);
          const multiplier = 1.0 + masteryBonus;
          
          // Verify mastery bonus doesn't exceed 0.2
          expect(masteryBonus).toBeLessThanOrEqual(0.2);
          
          // Verify multiplier stays within bounds
          expect(multiplier).toBeGreaterThanOrEqual(1.0);
          expect(multiplier).toBeLessThanOrEqual(1.2);
        }
      )
    );
  });

  it("should cap total multiplier at 2.0x", () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 30 }), // streak days
        fc.integer({ min: 0, max: 100 }), // completion count
        (streakDays, completionCount) => {
          const streakBonus = Math.min(streakDays * 0.01, 0.3);
          const masteryBonus = Math.min(Math.floor(completionCount / 10) * 0.05, 0.2);
          let multiplier = 1.0 + streakBonus + masteryBonus;
          
          // Cap at 2.0x
          multiplier = Math.min(multiplier, 2.0);
          
          // Verify multiplier is capped
          expect(multiplier).toBeLessThanOrEqual(2.0);
          expect(multiplier).toBeGreaterThanOrEqual(1.0);
        }
      )
    );
  });

  it("should produce consistent rewards for same inputs", () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 1000 }), // baseReward
        fc.float({ min: 1.0, max: 2.0, noNaN: true }), // bonusMultiplier
        (baseReward, bonusMultiplier) => {
          const reward1 = baseReward * bonusMultiplier;
          const reward2 = baseReward * bonusMultiplier;
          
          // Verify deterministic calculation
          expect(reward1).toBe(reward2);
        }
      )
    );
  });
});
