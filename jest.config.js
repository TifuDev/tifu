const { pathsToModuleNameMapper } = require('ts-jest')
const { compilerOptions } = require('./tsconfig.json')

/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  setupFiles: ['dotenv/config'],
  globalSetup: './scripts/jest/globalSetup.js',
  verbose: true,
  collectCoverage: true,
  moduleNameMapper: {
    '^@api/(.*)$': './src/api/$1',
    '^@utils/(.*)$': './src/utils/$1',
  },
};