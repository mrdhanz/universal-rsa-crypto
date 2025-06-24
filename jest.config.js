// jest.config.js
module.exports = {
  // Use ts-jest as the preset
  preset: 'ts-jest',
  
  // The environment in which the tests will be run
  testEnvironment: 'node',
  
  // A glob pattern to find test files
  testMatch: ['**/__tests__/**/*.test.ts'],
  
  // Automatically clear mock calls and instances between every test
  clearMocks: true,
};