module.exports = {
  ignorePatterns: ['node_modules', 'veracode'],
  env: {
    jest: true,
    es6: true,
  },
  extends: ['prettier'],
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
  },
  overrides: [
    {
      files: ['**/*.ts', '**/*.tsx'],
      parser: '@typescript-eslint/parser',
      plugins: ['@typescript-eslint'],
      extends: ['./node_modules/gts'],
      parserOptions: {
        jsxPragma: 'h',
      },
      rules: {
        '@typescript-eslint/no-unused-vars': [
          'warn',
          {ignoreRestSiblings: true, argsIgnorePattern: '^_'},
        ],
        '@typescript-eslint/explicit-module-boundary-types': 'off',
        '@typescript-eslint/ban-types': 'off',
        '@typescript-eslint/no-empty-interface': [
          'error',
          {allowSingleExtends: true},
        ],
      },
    },
    {
      files: ['**/*.js', '**/*.jsx'],
      extends: ['eslint:recommended'],
      rules: {
        'no-unused-vars': ['error', {argsIgnorePattern: '^_'}],
      },
      env: {
        node: true,
      },
    },
    {
      files: ['**/*.test.ts'],
      rules: {
        '@typescript-eslint/no-explicit-any': 'off',
      },
    },
  ],
  root: true,
};
