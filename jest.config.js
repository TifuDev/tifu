module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  setupFiles: ['dotenv/config'],
  globalSetup: './scripts/jest/globalSetup.js',
  verbose: true,
  collectCoverage: true,
};
