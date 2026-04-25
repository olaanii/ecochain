/**
 * Jest unit-test configuration.
 * Covers src/lib/** and src/hooks/** with enforced thresholds.
 * Run via: pnpm jest (or `pnpm test:unit:jest`)
 */
export default {
  testEnvironment: 'node',
  testMatch: [
    "<rootDir>/src/**/__tests__/**/*.test.{ts,tsx}",
    "<rootDir>/tests/middleware/*.test.ts",
    "<rootDir>/tests/api-*.test.ts",
    "<rootDir>/tests/*.test.{ts,js}",
  ],
  testPathIgnorePatterns: [
    "tests/.*\\.test\\.tsx$",
    "src/components/.*__tests__/.*\\.test\\.tsx$",
    "src/lib/blockchain/__tests__/event-listener\\.test\\.ts$",
    "src/hooks/__tests__/useAutoSignTransaction\\.test\\.ts$",
    "src/contexts/__tests__/autosign-context\\.test\\.ts$",
    "tests/health-check\\.test\\.ts$",
    "tests/verification\\.test\\.js$",
  ],
  preset: "ts-jest/presets/default-esm",
  extensionsToTreatAsEsm: [".ts", ".tsx"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
    "^(\\.{1,2}/.*)\\.js$": "$1",
  },
  transformIgnorePatterns: [
    "node_modules/(?!(wagmi|viem|@tanstack|@wagmi|@walletconnect)/)",
  ],
  transform: {
    "^.+\\.tsx?$": [
      "ts-jest",
      {
        useESM: true,
        tsconfig: {
          jsx: "react",
          esModuleInterop: true,
          allowSyntheticDefaultImports: true,
        },
      },
    ],
  },
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
  collectCoverage: true,
  coverageDirectory: "coverage/unit",
  collectCoverageFrom: [
    "src/lib/**/*.{ts,tsx}",
    "src/hooks/**/*.{ts,tsx}",
    "!src/**/*.d.ts",
    "!src/**/__tests__/**",
  ],
  coverageReporters: ["text", "lcov", "json-summary"],
  testTimeout: 10000,
  verbose: true,
};
