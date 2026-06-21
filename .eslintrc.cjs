module.exports = {
  root: true,
  env: {
    browser: true,
    es2021: true,
  },
  extends: 'eslint:recommended',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  rules: {
    'no-unused-vars': 'warn',
    'no-console': 'off',
    // Correctness
    eqeqeq: ['error', 'smart'],
    'no-var': 'error',
    'prefer-const': 'error',
    'no-implicit-globals': 'error',
    'no-throw-literal': 'error',
    'no-return-assign': 'error',
    'no-promise-executor-return': 'error',
    'no-unneeded-ternary': 'error',
    // Style consistency (kept light; Prettier owns formatting)
    'prefer-template': 'error',
    'object-shorthand': ['error', 'properties'],
    'dot-notation': 'error',
  },
};
