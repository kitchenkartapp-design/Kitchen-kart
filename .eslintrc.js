module.exports = {
  root: true,
  extends: '@react-native-community',
  parser: '@babel/eslint-parser',
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
    },
  },
  env: {
    react: true,
    'react-native': true,
    browser: true,
    es2020: true,
    node: true,
  },
  rules: {
    'react/react-in-jsx-scope': 'off',
    'react-native/no-raw-text': 'off',
  },
};
