import { describe, it, expect } from 'vitest';
import { javascriptUmdWithModes, typescriptDeclarations } from '../js';

const tokensWithModes = [
    {
        path: ['color', 'primary'],
        name: 'primary',
        value: '#333',
        type: 'color',
        original: { value: '#333', key: 'primary' },
    },
    {
        path: ['color', 'dark', 'primary'],
        name: 'primaryDark',
        value: '#eee',
        type: 'color',
        original: { value: '#eee', key: 'primaryDark' },
    },
];

const dictionary = { allTokens: tokensWithModes, tokens: {}, unfilteredTokens: [] };
const file = { destination: 'colors.js' };

describe('js formats', () => {
    it('javascriptUmdWithModes outputs UMD with light/dark value shape', async () => {
        const result = await javascriptUmdWithModes.format!({
            // @ts-expect-error: Typescript is overzealous in this instance
            dictionary,
            file,
            options: {},
        });
        expect(result).toContain('(function (root, factory)');
        expect(result).toContain('module.exports');
        expect(result).toContain('_styleDictionary');
        expect(result).toContain('"light"');
        expect(result).toContain('"dark"');
    });

    it('typescriptDeclarations outputs .d.ts with readonly value', async () => {
        const result = await typescriptDeclarations.format!({
            // @ts-expect-error: Typescript is overzealous in this instance
            dictionary,
            file,
            options: {},
        });
        expect(result).toContain('declare const _styleDictionary');
        expect(result).toContain('readonly value:');
        expect(result).toContain('export = _styleDictionary');
    });

    it('handles path segments containing literal dots without splitting them', async () => {
        const dottedTokens = [
            {
                path: ['size', '1.5rem'],
                name: '1.5rem',
                value: '24px',
                type: 'dimension',
                original: { value: '24px', key: '1.5rem' },
            },
            {
                path: ['size', 'dark', '1.5rem'],
                name: '1.5remDark',
                value: '20px',
                type: 'dimension',
                original: { value: '20px', key: '1.5remDark' },
            },
        ];
        const dottedDictionary = { allTokens: dottedTokens, tokens: {}, unfilteredTokens: [] };

        const result = await javascriptUmdWithModes.format!({
            // @ts-expect-error: Typescript is overzealous in this instance
            dictionary: dottedDictionary,
            file,
            options: {},
        });

        // The dotted segment should appear as a single key, not be split into nested objects
        expect(result).toContain('"1.5rem"');
        // The value should be the combined light/dark shape, not a flat string
        expect(result).toContain('"light"');
        expect(result).toContain('"dark"');
        // There should be only two levels of nesting: size -> 1.5rem, not size -> 1 -> 5rem
        expect(result).not.toContain('"5rem"');
    });
});
