import globals from 'globals';
import js from '@eslint/js';

export default [
  js.configs.recommended,
  {
    files: ['src/**/*.js'],
    languageOptions: {ecmaVersion: 2023, sourceType: 'module', globals: {...globals.browser}},
    rules: {'no-undef': 'error', 'no-useless-assignment': 'off', 'no-empty': ['error', {allowEmptyCatch: true}], 'no-unused-vars': ['warn', {args: 'none', caughtErrors: 'none'}]}
  },
  {
    files: ['tests/**/*.js'],
    languageOptions: {ecmaVersion: 2023, sourceType: 'module', globals: {...globals.node, ...globals.browser}}
  }
];
