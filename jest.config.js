module.exports = {
  preset: 'jest-expo',
  testEnvironment: 'node',
  transform: {
    '^.+\\.jsx?$': 'babel-jest',
  },
  testMatch: [
    '**/__tests__/**/*.(test|spec).js',
    '**/?(*.)+(spec|test).js',
  ],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  transformIgnorePatterns: [
    'node_modules/(?!(expo|expo-modules-core|react-native|@react-navigation|@react-native|firebase|@firebase)/)',
  ],
};
