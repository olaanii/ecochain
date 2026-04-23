import { describe, beforeAll, afterAll, it, expect } from '@jest/globals';
import { Client } from 'pg';
import { setupPostgres, teardownPostgres, seedTestDatabase, isDockerAvailable } from './testcontainers-setup';

/**
 * Integration Test: Database Operations with Testcontainers
 * 
 * These tests verify:
 * - PostgreSQL container spins up correctly
 * - Prisma migrations run successfully
 * - Database queries work as expected
 * - Data seeding produces expected results
 * 
 * Run: pnpm run test:integration
 * 
 * Skip: Set SKIP_DOCKER_TESTS=1 if Docker is not available
 */
const dockerAvailable = isDockerAvailable();
const skipDocker = process.env.SKIP_DOCKER_TESTS === '1' || !dockerAvailable;

(skipDocker ? describe.skip : describe)('Database Integration Tests', () => {
  let client: Client;
  let connectionString: string;

  beforeAll(async () => {
    if (skipDocker) {
      console.log('Skipping Docker tests - Docker not available or SKIP_DOCKER_TESTS=1');
      return;
    }
    
    // Setup PostgreSQL container
    const setup = await setupPostgres();
    client = setup.client;
    connectionString = setup.connectionString;

    // Seed test data
    await seedTestDatabase(client);
  }, 60000); // 60s timeout for container startup

  afterAll(async () => {
    if (!skipDocker) {
      await client?.end();
      await teardownPostgres();
    }
  }, 30000);

  describe('Connection', () => {
    it('should connect to PostgreSQL container', async () => {
      const result = await client.query('SELECT version()');
      expect(result.rows[0].version).toContain('PostgreSQL');
    });

    it('should have correct database name', async () => {
      const result = await client.query('SELECT current_database()');
      expect(result.rows[0].current_database).toBe('ecochain_test');
    });
  });

  describe('Seeded Data', () => {
    it('should have test users', async () => {
      const result = await client.query('SELECT * FROM "User"');
      expect(result.rows.length).toBeGreaterThanOrEqual(2);
      expect(result.rows[0]).toHaveProperty('email');
      expect(result.rows[0]).toHaveProperty('role');
    });

    it('should have test tasks', async () => {
      const result = await client.query('SELECT * FROM "Task"');
      expect(result.rows.length).toBeGreaterThanOrEqual(2);
      expect(result.rows[0]).toHaveProperty('title');
      expect(result.rows[0]).toHaveProperty('reward');
    });

    it('should find user by email', async () => {
      const result = await client.query(
        'SELECT * FROM "User" WHERE email = $1',
        ['test1@example.com']
      );
      expect(result.rows.length).toBe(1);
      expect(result.rows[0].name).toBe('Test User 1');
    });
  });

  describe('Transactions', () => {
    it('should support transactions', async () => {
      await client.query('BEGIN');
      
      await client.query(`
        INSERT INTO "User" (id, email, name, role, "createdAt", "updatedAt")
        VALUES ('tx-test', 'tx@example.com', 'Tx User', 'user', NOW(), NOW())
      `);
      
      await client.query('ROLLBACK');
      
      // Verify row was not inserted
      const result = await client.query('SELECT * FROM "User" WHERE id = $1', ['tx-test']);
      expect(result.rows.length).toBe(0);
    });

    it('should commit transactions successfully', async () => {
      await client.query('BEGIN');
      
      await client.query(`
        INSERT INTO "User" (id, email, name, role, "createdAt", "updatedAt")
        VALUES ('commit-test', 'commit@example.com', 'Commit User', 'user', NOW(), NOW())
      `);
      
      await client.query('COMMIT');
      
      // Verify row was inserted
      const result = await client.query('SELECT * FROM "User" WHERE id = $1', ['commit-test']);
      expect(result.rows.length).toBe(1);
      expect(result.rows[0].email).toBe('commit@example.com');
      
      // Cleanup
      await client.query('DELETE FROM "User" WHERE id = $1', ['commit-test']);
    });
  });

  describe('Connection String', () => {
    it('should have valid connection string', () => {
      expect(connectionString).toMatch(/^postgresql:\/\//);
      expect(connectionString).toContain('ecochain_test');
    });
  });
});

/**
 * Integration Test: Redis Cache with Testcontainers
 * 
 * Note: This test requires Redis client setup.
 * The actual Redis integration is stubbed here for demonstration.
 */
describe('Redis Integration Tests (Stub)', () => {
  it('should have Redis stub available', () => {
    // This is a placeholder for Redis testcontainer tests
    // Actual implementation would:
    // 1. Start Redis container
    // 2. Connect Redis client
    // 3. Test cache operations
    // 4. Verify TTL behavior
    expect(true).toBe(true);
  });
});
