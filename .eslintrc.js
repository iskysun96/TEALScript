module.exports = {
  ignorePatterns: ['*_client.ts'],
  env: {
    browser: true,
    es2021: true,
  },
  extends: [
    'airbnb-base',
    'plugin:import/errors',
    'plugin:import/warnings',
    'plugin:import/typescript',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  plugins: [
    '@typescript-eslint',
  ],
  rules: {
    '@typescript-eslint/no-explicit-any': 'error',
    '@typescript-eslint/ban-ts-comment': 'warn',
    'import/prefer-default-export': 'off',
    'import/extensions': [
      'error',
      'ignorePackages',
      {
        js: 'never',
        jsx: 'never',
        ts: 'never',
        tsx: 'never',
      },
    ],
  },
  overrides: [
    {
      files: ['*.algo.ts'],
      rules: {
        'object-shorthand': 'off',
        'class-methods-use-this': 'off',
        'no-undef': 'off',
        'max-classes-per-file': 'off',
        'no-bitwise': 'off',
        'operator-assignment': 'off',
        'prefer-template': 'off',
        'prefer-destructuring': 'off',
      },
    },
    {
      files: ['examples/**/*.ts'],
      rules: {
        'import/no-extraneous-dependencies': 'off',
      },
    },
  ],
};
