import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

export default defineConfig({
    test: {
        include: ['src/builder/**/*.test.ts'],
        coverage: {
            provider: 'v8',
            reporter: ['text', 'html'],
            include: ['src/builder/**/*.ts'],
            exclude: ['src/builder/**/*.test.ts', 'src/builder/index.ts'],
        },
        globals: false,
    },
    resolve: {
        alias: {
            src: resolve(__dirname, 'src'),
        },
    },
});
