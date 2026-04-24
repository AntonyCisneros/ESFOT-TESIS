// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');

module.exports = defineConfig([
  expoConfig,
  {
    files: ['src/shared/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': ['error', {
        patterns: [
          {
            group: ['@entities/**', '@features/**', '@widgets/**', '@pages/**', '@/app/**'],
            message: 'La capa shared no puede depender de capas superiores (entities/features/widgets/pages/app).',
          },
        ],
      }],
    },
  },
  {
    files: ['src/entities/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': ['error', {
        patterns: [
          {
            group: ['@features/**', '@widgets/**', '@pages/**', '@/app/**'],
            message: 'La capa entities solo puede depender de shared y de su propia capa.',
          },
        ],
      }],
    },
  },
  {
    files: ['src/features/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': ['error', {
        patterns: [
          {
            group: ['@widgets/**', '@pages/**', '@/app/**'],
            message: 'La capa features no puede depender de widgets/pages/app.',
          },
        ],
      }],
    },
  },
  {
    files: ['src/widgets/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': ['error', {
        patterns: [
          {
            group: ['@pages/**', '@/app/**'],
            message: 'La capa widgets no puede depender de pages/app.',
          },
        ],
      }],
    },
  },
  {
    files: ['src/pages/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': ['error', {
        patterns: [
          {
            group: ['@/app/**'],
            message: 'La capa pages no puede depender de app.',
          },
        ],
      }],
    },
  },
  {
    ignores: ['dist/*'],
  },
]);
