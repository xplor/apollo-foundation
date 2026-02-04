import { describe, it, expect } from 'vitest';
import { cssVariablesClassMode, cssVariablesMediaMode } from '../css';

const minimalTokens = [
    {
        path: ['color', 'primary'],
        name: 'xpl-color-primary',
        value: '#333',
        original: { value: '#333', key: 'xpl-color-primary' },
        attributes: { category: 'color' },
    },
    {
        path: ['color', 'dark', 'primary'],
        name: 'xpl-color-primary-dark',
        value: '#eee',
        original: { value: '#eee', key: 'xpl-color-primary-dark' },
        attributes: { category: 'color' },
    },
];

const dictionary = { allTokens: minimalTokens, tokens: {}, unfilteredTokens: [] };
const file = { destination: 'variables.css' };
const options = { outputReferences: false };

describe('css formats', () => {
    it('cssVariablesClassMode produces :root and .dark', async () => {
        const result = await cssVariablesClassMode.format!({ dictionary, file, options });
        expect(result).toContain(':root {');
        expect(result).toContain('.dark {');
        expect(result).toContain('--xpl-color-primary');
    });

    it('cssVariablesMediaMode produces media query', async () => {
        const result = await cssVariablesMediaMode.format!({ dictionary, file, options });
        expect(result).toContain('@media (prefers-color-scheme: dark)');
        expect(result).toContain(':root {');
    });
});
