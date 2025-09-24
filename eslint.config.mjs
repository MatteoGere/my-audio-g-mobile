import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { FlatCompat } from '@eslint/eslintrc';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends('next/core-web-vitals', 'next/typescript'),
  {
    ignores: ['node_modules/**', '.next/**', 'out/**', 'build/**', 'next-env.d.ts'],
  },
  {
    rules: {
      // Warning per l'uso di 'any'
      '@typescript-eslint/no-explicit-any': 'off',
      // Warning per l'uso di <img> invece di next/image
      'next/no-img-element': 'off',
      // Allow unescaped entities in JSX strings (we control content)
      'react/no-unescaped-entities': 'off',
      // Allow ts-ignore/ts-nocheck pragmas in project files
      '@typescript-eslint/ban-ts-comment': 'off',
      // Allow using Function type in a few middleware utilities
      '@typescript-eslint/no-unsafe-function-type': 'off',
    },
  },
];

export default eslintConfig;
