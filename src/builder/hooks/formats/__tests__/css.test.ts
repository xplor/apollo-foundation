import type { Dictionary, TransformedToken } from 'style-dictionary/types';
import { describe, it, expect } from 'vitest';
import { cssVariablesClassMode, cssVariablesMediaMode } from '../css';

const minimalTokens: TransformedToken[] = [
    {
        path: ['color', 'primary'],
        name: 'xpl-color-primary',
        value: '#333',
        original: { value: '#333', key: 'xpl-color-primary' },
        attributes: { category: 'color' },
        filePath: '',
        isSource: true,
    },
    {
        path: ['color', 'dark', 'primary'],
        name: 'xpl-color-primary-dark',
        value: '#eee',
        original: { value: '#eee', key: 'xpl-color-primary-dark' },
        attributes: { category: 'color' },
        filePath: '',
        isSource: true,
    },
];

const dictionary: Dictionary = {
    allTokens: minimalTokens,
    tokens: {},
    tokenMap: new Map(minimalTokens.map((t) => [t.name, t])),
};
const file = { destination: 'variables.css' };
const options = { outputReferences: false };
const platform = {};

describe('css formats', () => {
    it('cssVariablesClassMode produces :root and .dark', async () => {
        const result = await cssVariablesClassMode.format!({
            dictionary, file, options, platform,
        });
        expect(result).toContain(':root {');
        expect(result).toContain('.dark {');
        expect(result).toContain('--xpl-color-primary');
    });

    it('cssVariablesMediaMode produces media query', async () => {
        const result = await cssVariablesMediaMode.format!({
            dictionary, file, options, platform,
        });
        expect(result).toContain('@media (prefers-color-scheme: dark)');
        expect(result).toContain(':root {');
    });
});
