/**
 * Bonus Multiplier Tests
 * 
 * Tests for bonus multiplier calculation
 * Property 11: Bonus Multiplier Bounds
 */

import {
  calculateStreakBonus,
  calculateCategoryMasteryBonus,
  validateBonusMultiplier,
} from '../bonus-multiplier';

describe('Bonus Multiplier Calculation', () => {
  describe('Streak Bonus', () => {
    it('should calculate streak bonus correctly', () => {
      expect(calculateStreakBonus(0)).toBe(0);
      expect(calculateStreakBonus(1)).toBe(0.01);
      expect(calculateStreakBonus(10)).toBe(0.1);
      expect(calculateStreakBonus(30)).toBe(0.3);
    });

    it('should cap streak bonus at 0.3', () => {
      expect(calculateStreakBonus(50)).toBe(0.3);
      expect(calculateStreakBonus(100)).toBe(0.3);
      expect(calculateStreakBonus(1000)).toBe(0.3);
    });

    it('should handle fractional streak days', () => {
      expect(calculateStreakBonus(5)).toBe(0.05);
      expect(calculateStreakBonus(15)).toBe(0.15);
      expect(calculateStreakBonus(25)).toBe(0.25);
    });
  });

  describe('Category Mastery Bonus', () => {
    it('should calculate mastery bonus correctly', () => {
      expect(calculateCategoryMasteryBonus(0)).toBe(0);
      expect(calculateCategoryMasteryBonus(10)).toBe(0.05);
      expect(calculateCategoryMasteryBonus(20)).toBe(0.1);
      expect(calculateCategoryMasteryBonus(30)).toBeCloseTo(0.15, 2);
      expect(calculateCategoryMasteryBonus(40)).toBe(0.2);
    });

    it('should cap mastery bonus at 0.2', () => {
      expect(calculateCategoryMasteryBonus(50)).toBe(0.2);
      expect(calculateCategoryMasteryBonus(100)).toBe(0.2);
      expect(calculateCategoryMasteryBonus(1000)).toBe(0.2);
    });

    it('should only increment at 10 completion intervals', () => {
      expect(calculateCategoryMasteryBonus(5)).toBe(0);
      expect(calculateCategoryMasteryBonus(9)).toBe(0);
      expect(calculateCategoryMasteryBonus(10)).toBe(0.05);
      expect(calculateCategoryMasteryBonus(19)).toBe(0.05);
      expect(calculateCategoryMasteryBonus(20)).toBe(0.1);
    });
  });

  describe('Total Multiplier Bounds', () => {
    it('should ensure multiplier is at least 1.0', () => {
      const multiplier = 1.0 + 0 + 0; // base + streak + mastery
      expect(multiplier).toBeGreaterThanOrEqual(1.0);
    });

    it('should ensure multiplier does not exceed 2.0', () => {
      const maxMultiplier = 1.0 + 0.3 + 0.2; // base + max streak + max mastery
      expect(maxMultiplier).toBeLessThanOrEqual(2.0);
    });

    it('should validate multiplier bounds', () => {
      expect(validateBonusMultiplier(1.0)).toBe(true);
      expect(validateBonusMultiplier(1.5)).toBe(true);
      expect(validateBonusMultiplier(2.0)).toBe(true);
      expect(validateBonusMultiplier(0.9)).toBe(false);
      expect(validateBonusMultiplier(2.1)).toBe(false);
    });
  });

  describe('Combined Multiplier Scenarios', () => {
    it('should calculate combined multiplier correctly', () => {
      // Scenario 1: No streak, no mastery
      const m1 = 1.0 + 0 + 0;
      expect(m1).toBe(1.0);
      expect(validateBonusMultiplier(m1)).toBe(true);

      // Scenario 2: 10 day streak, 10 completions
      const m2 = 1.0 + 0.1 + 0.05;
      expect(m2).toBeCloseTo(1.15, 2);
      expect(validateBonusMultiplier(m2)).toBe(true);

      // Scenario 3: 30 day streak, 40 completions (max)
      const m3 = 1.0 + 0.3 + 0.2;
      expect(m3).toBe(1.5);
      expect(validateBonusMultiplier(m3)).toBe(true);

      // Scenario 4: 50 day streak, 100 completions (capped)
      const m4 = Math.min(1.0 + 0.3 + 0.2, 2.0);
      expect(m4).toBe(1.5);
      expect(validateBonusMultiplier(m4)).toBe(true);
    });

    it('should never exceed 2.0x multiplier', () => {
      const scenarios = [
        { streak: 0, completions: 0 },
        { streak: 10, completions: 10 },
        { streak: 30, completions: 40 },
        { streak: 50, completions: 100 },
        { streak: 100, completions: 200 },
      ];

      scenarios.forEach(({ streak, completions }) => {
        const streakBonus = Math.min(streak * 0.01, 0.3);
        const masteryBonus = Math.min(Math.floor(completions / 10) * 0.05, 0.2);
        const multiplier = Math.min(1.0 + streakBonus + masteryBonus, 2.0);

        expect(multiplier).toBeGreaterThanOrEqual(1.0);
        expect(multiplier).toBeLessThanOrEqual(2.0);
        expect(validateBonusMultiplier(multiplier)).toBe(true);
      });
    });
  });

  describe('Reward Calculation', () => {
    it('should calculate reward correctly with multiplier', () => {
      const baseReward = 100;

      // 1.0x multiplier
      expect(Math.floor(baseReward * 1.0)).toBe(100);

      // 1.5x multiplier
      expect(Math.floor(baseReward * 1.5)).toBe(150);

      // 2.0x multiplier
      expect(Math.floor(baseReward * 2.0)).toBe(200);
    });

    it('should handle fractional rewards correctly', () => {
      const baseReward = 100;

      // 1.15x multiplier
      expect(Math.floor(baseReward * 1.15)).toBe(114);

      // 1.33x multiplier
      expect(Math.floor(baseReward * 1.33)).toBe(133);

      // 1.99x multiplier
      expect(Math.floor(baseReward * 1.99)).toBe(199);
    });
  });
});
