module.exports = {
  env: {
    browser: true,
    es2021: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'plugin:jsx-a11y/recommended',
    'airbnb',
    'airbnb-typescript',
    'plugin:import/recommended',
    'plugin:import/typescript',
    'turbo',
    'plugin:prettier/recommended',
  ],
  plugins: ['jsx-a11y', 'prettier'],
  settings: {
    'import/parsers': {
      '@typescript-eslint/parser': ['.ts', '.tsx'],
    },
    'import/resolver': {
      typescript: {
        alwaysTryTypes: true,
        project: ['./tsconfig.json', 'apps/*/tsconfig.json'],
      },
    },
  },
  ignorePatterns: [
    '**/*.json',
    'node_modules',
    '.turbo',
    'dist',
    'public',
    'eslintrc.js',
    'vite.config.ts',
    'cypress.config.js',
    'postcss.config.js',
    'tailwind.config.js',
  ],
  rules: {
    'react/react-in-jsx-scope': 0,
    'react/require-default-props': 0,
    'react/jsx-props-no-spreading': 0,
    'react/prop-types': 0,
    'react/jsx-no-constructed-context-values': 0,
    'react/no-array-index-key': 0,
    'jsx-a11y/no-noninteractive-element-to-interactive-role': 0,
    'import/prefer-default-export': 0,
    '@typescript-eslint/no-use-before-define': 0,
    '@typescript-eslint/no-shadow': 0,
    '@typescript-eslint/no-empty-interface': 0,
    '@typescript-eslint/no-empty-function': 0,
    'import/no-named-as-default': 0,
    'default-case': 0,
    'consistent-return': 0,
    'prefer-destructuring': 0,
  },
};