import { GenericContainer, StartedTestContainer } from 'testcontainers';
import { Client } from 'pg';
import { execSync } from 'child_process';

/**
 * Testcontainers Setup for Integration Tests
 * 
 * Provides:
 * - PostgreSQL container for database tests
 * - Redis container for cache tests
 * - Anvil (Foundry) container for blockchain tests
 * 
 * Usage:
 * ```ts
 * import { setupPostgres, teardownPostgres } from './testcontainers-setup';
 * 
 * beforeAll(async () => {
 *   const { container, connectionString } = await setupPostgres();
 *   process.env.DATABASE_URL = connectionString;
 * });
 * 
 * afterAll(async () => {
 *   await teardownPostgres();
 * });
 * ```
 */

/**
 * Check if Docker is available on the system
 */
export function isDockerAvailable(): boolean {
  try {
    execSync('docker info', { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

interface PostgresSetup {
  container: StartedTestContainer;
  connectionString: string;
  client: Client;
}

interface RedisSetup {
  container: StartedTestContainer;
  host: string;
  port: number;
}

// Container instances (kept for teardown)
let postgresContainer: StartedTestContainer | null = null;
let redisContainer: StartedTestContainer | null = null;

/**
 * Start PostgreSQL container with Prisma-compatible schema
 */
export async function setupPostgres(): Promise<PostgresSetup> {
  if (!isDockerAvailable()) {
    throw new Error(
      'Docker is not available. ' +
      'Please install Docker Desktop or ensure Docker daemon is running. ' +
      'Alternatively, set SKIP_DOCKER_TESTS=1 to skip these tests.'
    );
  }

  const container = await new GenericContainer('postgres:16-alpine')
    .withExposedPorts(5432)
    .withEnvironment({
      POSTGRES_USER: 'test',
      POSTGRES_PASSWORD: 'test',
      POSTGRES_DB: 'ecochain_test',
    })
    .withTmpFs({ '/var/lib/postgresql/data': 'rw,noexec,nosuid,size=100m' })
    .start();

  postgresContainer = container;

  const host = container.getHost();
  const port = container.getMappedPort(5432);
  const connectionString = `postgresql://test:test@${host}:${port}/ecochain_test`;

  const client = new Client({ connectionString });
  await client.connect();

  // Verify connection
  await client.query('SELECT 1');

  return { container, connectionString, client };
}

/**
 * Start Redis container
 */
export async function setupRedis(): Promise<RedisSetup> {
  const container = await new GenericContainer('redis:7-alpine')
    .withExposedPorts(6379)
    .start();

  redisContainer = container;

  return {
    container,
    host: container.getHost(),
    port: container.getMappedPort(6379),
  };
}

/**
 * Teardown PostgreSQL container
 */
export async function teardownPostgres(): Promise<void> {
  if (postgresContainer) {
    await postgresContainer.stop();
    postgresContainer = null;
  }
}

/**
 * Teardown Redis container
 */
export async function teardownRedis(): Promise<void> {
  if (redisContainer) {
    await redisContainer.stop();
    redisContainer = null;
  }
}

/**
 * Teardown all containers
 */
export async function teardownAll(): Promise<void> {
  await teardownPostgres();
  await teardownRedis();
}

/**
 * Run Prisma migrations against test database
 */
export async function runPrismaMigrations(connectionString: string): Promise<void> {
  const { execSync } = require('child_process');
  
  execSync('npx prisma migrate deploy', {
    env: {
      ...process.env,
      DATABASE_URL: connectionString,
    },
    stdio: 'inherit',
  });
}

/**
 * Seed test database with fixtures
 */
export async function seedTestDatabase(client: Client): Promise<void> {
  // Insert test users
  await client.query(`
    INSERT INTO "User" (id, email, name, role, "createdAt", "updatedAt")
    VALUES 
      ('test-user-1', 'test1@example.com', 'Test User 1', 'user', NOW(), NOW()),
      ('test-user-2', 'test2@example.com', 'Test User 2', 'admin', NOW(), NOW())
    ON CONFLICT DO NOTHING
  `);

  // Insert test tasks
  await client.query(`
    INSERT INTO "Task" (id, title, description, status, reward, "createdAt", "updatedAt")
    VALUES 
      ('test-task-1', 'Test Task 1', 'Description 1', 'active', 100, NOW(), NOW()),
      ('test-task-2', 'Test Task 2', 'Description 2', 'pending', 200, NOW(), NOW())
    ON CONFLICT DO NOTHING
  `);
}
