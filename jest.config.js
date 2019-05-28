const { defaults } = require("jest-config");

module.exports = {
  transform: {
    "^.+\\.ts?$": "ts-jest",
  },
  testMatch: ["<rootDir>/src/**/*.test.{js,ts}"],
  collectCoverageFrom: [
    "src/**/*.ts",
    "!src/index.ts",
    "!src/ProviderClient.ts",
  ],
  moduleFileExtensions: [...defaults.moduleFileExtensions, "ts"],
  testEnvironment: "node",
  clearMocks: true,
  collectCoverage: true,
  coverageThreshold: {
    global: {
      statements: 96,
      branches: 91,
      functions: 96,
      lines: 96,
    },
    "./src/invocationValidator.ts": {
      statements: 78.57,
      branches: 87.5,
      functions: 100,
      lines: 78.57,
    },
  },
};
