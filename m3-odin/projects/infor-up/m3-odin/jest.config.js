/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: "jsdom",
  collectCoverage: false,
  collectCoverageFrom: ['**/*.ts', '!./dist/**'],
  coverageThreshold: {
    global: {
      branches: 82,
      functions: 95,
      lines: 93,
      statements: 93,
    },
  },
};