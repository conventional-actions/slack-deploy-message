/** @type {import('jest').Config} */
module.exports = {
  clearMocks: true,
  moduleFileExtensions: ['js', 'ts'],
  testMatch: ['**/*.test.ts'],
  preset: 'ts-jest',
  testEnvironment: 'node',
  verbose: true
}
