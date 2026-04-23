/**
 * Jest Configuration for Integration Tests
 * 
 * This configuration is specifically for integration tests
 * that test end-to-end user flows across Figma screens
 */

export default {
  preset: 'ts-jest/presets/default-esm',
  testEnvironment: 'node',
  testMatch: ['**/tests/integration/**/*.integration.test.{ts,tsx}'],
  extensionsToTreatAsEsm: ['.ts', '.tsx'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        useESM: true,
        tsconfig: {
          jsx: 'react',
          esModuleInterop: true,
          allowSyntheticDefaultImports: true,
        },
      },
    ],
  },
  testTimeout: 120000,
  verbose: true,
  setupFilesAfterEnv: ['<rootDir>/tests/integration/setup.ts'],
  collectCoverage: false,
  coverageDirectory: 'coverage/integration',
  coveragePathIgnorePatterns: [
    '/node_modules/',
    '/tests/',
    '/.next/',
    '/contracts/',
  ],
  testPathIgnorePatterns: [
    '/node_modules/',
    '/.next/',
    '/contracts/',
    '/tests/verification/',
    '<rootDir>/contracts/',
    '<rootDir>/lib/forge-std/',
    '<rootDir>/lib/openzeppelin-contracts/',
  ],
  modulePathIgnorePatterns: [
    '<rootDir>/contracts/',
    '<rootDir>/lib/forge-std/',
    '<rootDir>/lib/openzeppelin-contracts/',
  ],
};
