/**
 * Jest Setup for Integration Tests
 * 
 * Global configuration for testcontainers-based tests.
 * Ensures Docker is available and containers can be started.
 */

import { execSync } from 'child_process';

// Check Docker availability
let dockerAvailable = false;
try {
  execSync('docker info', { stdio: 'ignore' });
  dockerAvailable = true;
} catch {
  dockerAvailable = false;
}

// Increase default timeout for container operations
jest.setTimeout(120000);

// Log test start
console.log('🔧 Integration test setup loaded');

if (dockerAvailable) {
  console.log('✅ Docker is available - Testcontainers will spin up PostgreSQL and Redis');
} else {
  console.log('⚠️  Docker not available - Set SKIP_DOCKER_TESTS=1 to skip testcontainer tests');
}
