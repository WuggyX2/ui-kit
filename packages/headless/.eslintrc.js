module.exports = {
  extends: ['../../.eslintrc.js'],
  ignorePatterns: ['dist', 'temp'],
  rules: {
    'node/no-unpublished-import': [
      'error',
      {
        allowModules: ['redux-mock-store'],
      },
    ],
    '@typescript-eslint/no-namespace': 'off',
  },
  globals: {
    fetch: true,
  },
};
