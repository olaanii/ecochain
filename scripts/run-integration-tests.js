#!/usr/bin/env node

/**
 * Integration Test Runner Script
 * 
 * This script runs comprehensive integration tests for the Figma screens
 * and provides detailed reporting on test results
 */

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

console.log('🧪 Starting Integration Tests for EcoChain UI Implementation\n');
console.log('=' .repeat(70));
console.log('Test Suite: Figma Screens Integration Tests');
console.log('Coverage: Navigation, Forms, User Flows, Data Persistence');
console.log('Requirements: 5.1, 6.4, 6.5');
console.log('=' .repeat(70));
console.log('');

// Test configuration
const testSuites = [
  {
    name: 'Navigation Tests',
    file: 'figma-screens-navigation.test.tsx',
    description: 'Tests navigation flows across all 10 screens',
  },
  {
    name: 'Form Interaction Tests',
    file: 'figma-screens-forms.test.tsx',
    description: 'Tests form submissions and validation',
  },
  {
    name: 'User Flow Tests',
    file: 'figma-screens-user-flows.test.tsx',
    description: 'Tests end-to-end user journeys',
  },
  {
    name: 'Data Persistence Tests',
    file: 'figma-screens-data-persistence.test.tsx',
    description: 'Tests data persistence across screens',
  },
];

// Check if specific test suite is requested
const args = process.argv.slice(2);
const specificTest = args[0];

if (specificTest) {
  const suite = testSuites.find(s => s.file.includes(specificTest));
  if (suite) {
    console.log(`Running specific test suite: ${suite.name}`);
    console.log(`Description: ${suite.description}\n`);
  }
}

// Run tests
const jestArgs = [
  '--experimental-vm-modules',
  'node_modules/jest/bin/jest.js',
  'tests/integration',
  '--config=jest.config.integration.js',
  '--testTimeout=10000',
  '--verbose',
];

if (specificTest) {
  jestArgs.push(`--testPathPattern=${specificTest}`);
}

if (args.includes('--watch')) {
  jestArgs.push('--watch');
}

if (args.includes('--coverage')) {
  jestArgs.push('--coverage');
}

const jest = spawn('node', jestArgs, {
  cwd: rootDir,
  stdio: 'inherit',
  shell: true,
});

jest.on('error', (error) => {
  console.error('❌ Failed to start test runner:', error);
  process.exit(1);
});

jest.on('close', (code) => {
  console.log('');
  console.log('=' .repeat(70));
  
  if (code === 0) {
    console.log('✅ All integration tests passed successfully!');
    console.log('');
    console.log('Test Coverage Summary:');
    console.log('  ✓ Navigation across all 10 screens');
    console.log('  ✓ Form submissions and validation');
    console.log('  ✓ End-to-end user flows');
    console.log('  ✓ Data persistence and state management');
    console.log('');
    console.log('Requirements Validated: 5.1, 6.4, 6.5');
  } else {
    console.log('❌ Some integration tests failed');
    console.log('');
    console.log('Please review the test output above for details.');
    console.log('Common issues:');
    console.log('  - Development server not running (npm run dev)');
    console.log('  - Missing test dependencies');
    console.log('  - Network connectivity issues');
  }
  
  console.log('=' .repeat(70));
  process.exit(code);
});

// Handle script termination
process.on('SIGINT', () => {
  console.log('\n\n⚠️  Test execution interrupted by user');
  jest.kill('SIGINT');
  process.exit(130);
});

process.on('SIGTERM', () => {
  console.log('\n\n⚠️  Test execution terminated');
  jest.kill('SIGTERM');
  process.exit(143);
});
