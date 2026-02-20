import { defineConfig } from 'eslint/config';
import { FlatCompat } from '@eslint/eslintrc';
import { fixupConfigRules } from '@eslint/compat';
import { fileURLToPath } from 'url';
import path from 'path';
import tseslint from 'typescript-eslint';


const __dirname = path.dirname(fileURLToPath(import.meta.url));
const compat = new FlatCompat({ baseDirectory: __dirname });

export default defineConfig(
    {
        ignores: ['build/**', 'coverage/**', 'eslint.config.js'],
    },
    // AirBnB base JS rules via compat shim
    ...fixupConfigRules(compat.extends('airbnb-base')),
    // TypeScript rules on top, scoped to .ts files
    {
        files: ['**/*.ts'],
        extends: ['@typescript-eslint/recommended'],
        settings: {
            'import/resolver': { typescript: true, node: true },
        },
        plugins: {
            '@typescript-eslint': tseslint.plugin,
        },
        rules: {
            '@typescript-eslint/no-explicit-any': 'error',
            '@typescript-eslint/no-unused-vars': ['error', {
                argsIgnorePattern: '^_',
                varsIgnorePattern: '^_',
            }],

            // Disable JS rules superseded by their TS equivalents
            'no-unused-vars': 'off',
            'no-use-before-define': 'off',
            '@typescript-eslint/no-use-before-define': 'error',
            'no-shadow': 'off',
            '@typescript-eslint/no-shadow': 'error',

            // Project uses 4-space indentation
            indent: ['error', 4, { SwitchCase: 1 }],

            // Named exports are idiomatic TypeScript (better tree-shaking and tooling support)
            'import/prefer-default-export': 'off',

            // devDependencies are intentional for build and test tooling
            // (this entire project is a build pipeline — no runtime JS is published)
            'import/no-extraneous-dependencies': ['error', {
                devDependencies: [
                    '**/*.test.ts',
                    'vitest.config.ts',
                    'build.ts',
                    'config.ts',
                    'src/builder/**/*.ts',
                ],
            }],

            // for...of and await-in-loop are idiomatic in sequential async Node.js pipelines
            'no-restricted-syntax': [
                'error',
                { selector: 'ForInStatement', message: 'for..in iterates over the prototype chain. Use Object.{keys,values,entries} instead.' },
                { selector: 'LabeledStatement', message: 'Labels are a form of GOTO. Use break/continue with descriptive names instead.' },
                { selector: 'WithStatement', message: '`with` is disallowed in strict mode.' },
            ],
            'no-await-in-loop': 'off',

            // __dirname and __rootDir are conventional Node.js ESM module patterns
            'no-underscore-dangle': ['error', { allow: ['__dirname', '__rootDir'] }],

            // .ts extensions are never required in imports (resolver handles them)
            'import/extensions': ['error', 'ignorePackages', { ts: 'never' }],
        },
    },
);
