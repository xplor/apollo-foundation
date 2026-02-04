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
});
