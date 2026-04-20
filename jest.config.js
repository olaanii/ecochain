/**
 * Jest unit-test configuration.
 * Covers src/lib/** and src/hooks/** with enforced thresholds.
 * Run via: pnpm jest (or `pnpm test:unit:jest`)
 */
export default {
  preset: "ts-jest/presets/default-esm",
  testEnvironment: "node",
  testMatch: [
    "<rootDir>/src/**/__tests__/**/*.test.{ts,tsx}",
    "<rootDir>/tests/middleware/*.test.ts",
    "<rootDir>/tests/api-*.test.ts",
  ],
  extensionsToTreatAsEsm: [".ts", ".tsx"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
    "^(\\.{1,2}/.*)\\.js$": "$1",
  },
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
  collectCoverage: true,
  coverageDirectory: "coverage/unit",
  collectCoverageFrom: [
    "src/lib/**/*.{ts,tsx}",
    "src/hooks/**/*.{ts,tsx}",
    "!src/**/*.d.ts",
    "!src/**/__tests__/**",
  ],
  coverageThresholds: {
    global: {
      branches: 80,
      lines: 85,
      functions: 80,
      statements: 85,
    },
  },
  coverageReporters: ["text", "lcov", "json-summary"],
  testTimeout: 10000,
  verbose: true,
};
