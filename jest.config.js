const { defaults } = require("jest-config");

module.exports = {
  globalSetup: "./jest.globalSetup.js",
  transform: {
    "^.+\\.ts?$": "ts-jest",
  },
  testMatch: ["<rootDir>/src/**/*.test.{js,ts}"],
  collectCoverageFrom: [
    "src/**/*.ts",
    "!src/index.ts",
    "!src/ProviderClient.ts",
    "!src/util/*",
  ],
  moduleFileExtensions: [...defaults.moduleFileExtensions, "ts"],
  testEnvironment: "node",
  clearMocks: true,
  collectCoverage: true,
  coverageThreshold: {
    global: {
      statements: 100,
      branches: 100,
      functions: 100,
      lines: 100,
    },
    "./src/invocationValidator.ts": {
      statements: 78.57,
      branches: 87.5,
      functions: 100,
      lines: 78.57,
    },
    "./src/converters.ts": {
      statements: 93.07,
      branches: 77.27,
      functions: 88,
      lines: 92.86,
    },
  },
};
