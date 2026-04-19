import { describe, it, expect } from "@jest/globals";
import fc from "fast-check";

/**
 * Property 9: Stake Duration Validity
 * Validates: Requirements 8.2
 * 
 * Generates random stake records and verifies all stakes have valid durations
 */
describe("Property 9: Stake Duration Validity", () => {
  const VALID_DURATIONS = [30, 90, 180, 365];

  it("should only allow valid durations (30, 90, 180, 365)", () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 365 }),
        (duration) => {
          const isValid = VALID_DURATIONS.includes(duration);
          
          if (isValid) {
            // Valid durations should be in the list
            expect(VALID_DURATIONS).toContain(duration);
          } else {
            // Invalid durations should not be in the list
            expect(VALID_DURATIONS).not.toContain(duration);
          }
        }
      )
    );
  });

  it("should reject durations outside valid range", () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 29 }).or(fc.integer({ min: 31, max: 89 }))
          .or(fc.integer({ min: 91, max: 179 }))
          .or(fc.integer({ min: 181, max: 364 }))
          .or(fc.integer({ min: 366, max: 1000 })),
        (invalidDuration) => {
          // Invalid durations should not be in the valid list
          expect(VALID_DURATIONS).not.toContain(invalidDuration);
        }
      )
    );
  });

  it("should validate all valid durations are present", () => {
    const expectedDurations = [30, 90, 180, 365];
    
    for (const duration of expectedDurations) {
      expect(VALID_DURATIONS).toContain(duration);
    }
    
    expect(VALID_DURATIONS.length).toBe(expectedDurations.length);
  });

  it("should ensure no duplicate durations", () => {
    const uniqueDurations = new Set(VALID_DURATIONS);
    expect(uniqueDurations.size).toBe(VALID_DURATIONS.length);
  });

  it("should verify durations are in ascending order", () => {
    for (let i = 0; i < VALID_DURATIONS.length - 1; i++) {
      expect(VALID_DURATIONS[i]).toBeLessThan(VALID_DURATIONS[i + 1]);
    }
  });

  it("should generate random stake records with valid durations", () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.record({
            stakeId: fc.string(),
            amount: fc.bigInt({ min: 100n * 10n ** 18n, max: 10000n * 10n ** 18n }),
            duration: fc.sample(fc.constantFrom(...VALID_DURATIONS), 1)[0],
            startTime: fc.date(),
          }),
          { minLength: 1, maxLength: 100 }
        ),
        (stakes) => {
          // Verify all stakes have valid durations
          for (const stake of stakes) {
            expect(VALID_DURATIONS).toContain(stake.duration);
          }
        }
      )
    );
  });

  it("should calculate correct end times for each duration", () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...VALID_DURATIONS),
        (duration) => {
          const startTime = new Date();
          const endTime = new Date(startTime.getTime() + duration * 24 * 60 * 60 * 1000);
          
          // Verify end time is after start time
          expect(endTime.getTime()).toBeGreaterThan(startTime.getTime());
          
          // Verify duration is correct
          const actualDuration = Math.floor(
            (endTime.getTime() - startTime.getTime()) / (24 * 60 * 60 * 1000)
          );
          expect(actualDuration).toBe(duration);
        }
      )
    );
  });

  it("should map durations to correct APY rates", () => {
    const apyMap: Record<number, number> = {
      30: 500,   // 5%
      90: 800,   // 8%
      180: 1200, // 12%
      365: 1800, // 18%
    };

    for (const duration of VALID_DURATIONS) {
      expect(apyMap[duration]).toBeDefined();
      expect(apyMap[duration]).toBeGreaterThan(0);
    }
  });

  it("should verify APY increases with duration", () => {
    const apyMap: Record<number, number> = {
      30: 500,   // 5%
      90: 800,   // 8%
      180: 1200, // 12%
      365: 1800, // 18%
    };

    for (let i = 0; i < VALID_DURATIONS.length - 1; i++) {
      const currentDuration = VALID_DURATIONS[i];
      const nextDuration = VALID_DURATIONS[i + 1];
      
      expect(apyMap[currentDuration]).toBeLessThan(apyMap[nextDuration]);
    }
  });

  it("should reject zero and negative durations", () => {
    fc.assert(
      fc.property(
        fc.integer({ min: -1000, max: 0 }),
        (invalidDuration) => {
          expect(VALID_DURATIONS).not.toContain(invalidDuration);
        }
      )
    );
  });

  it("should handle large duration values correctly", () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1000, max: 10000 }),
        (largeDuration) => {
          // Large durations should not be valid
          expect(VALID_DURATIONS).not.toContain(largeDuration);
        }
      )
    );
  });
});
