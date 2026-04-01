/**
 * Health Check Endpoint Tests
 * 
 * Tests for database health check endpoint
 * Requirements: 27.6
 */

import { checkDatabaseHealth } from "../src/lib/prisma/client";

describe("Database Health Check", () => {
  it("should return health status", async () => {
    const health = await checkDatabaseHealth();
    
    expect(health).toBeDefined();
    expect(typeof health.healthy).toBe("boolean");
    
    if (health.healthy) {
      expect(health.latency).toBeDefined();
      expect(typeof health.latency).toBe("number");
      expect(health.latency).toBeGreaterThanOrEqual(0);
    } else {
      expect(health.error).toBeDefined();
      expect(typeof health.error).toBe("string");
    }
  });

  it("should measure database latency", async () => {
    const health = await checkDatabaseHealth();
    
    if (health.healthy) {
      expect(health.latency).toBeDefined();
      // Latency should be reasonable (less than 5 seconds)
      expect(health.latency!).toBeLessThan(5000);
    }
  });
});
