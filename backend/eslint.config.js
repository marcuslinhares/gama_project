const typescriptPlugin = require('@typescript-eslint/eslint-plugin');
const typescriptParser = require('@typescript-eslint/parser');

module.exports = [
  ...typescriptPlugin.configs['flat/recommended'],
  {
    files: ['**/*.ts'],
    languageOptions: {
      parser: typescriptParser,
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },
];
