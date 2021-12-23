const { pathsToModuleNameMapper } = require('ts-jest/utils')
const { compilerOptions } = require('./tsconfig.json')

module.exports = {
  roots: ['./src'],
  modulePaths: [compilerOptions.baseUrl],
  preset: 'ts-jest',
  testEnvironment: 'node',
  setupFiles: ['dotenv/config'],
  globalSetup: './scripts/jest/globalSetup.js',
  verbose: true,
  collectCoverage: true,
  moduleNameMapper: pathsToModuleNameMapper(compilerOptions.paths),
};