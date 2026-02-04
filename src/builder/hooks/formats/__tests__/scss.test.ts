import { describe, it, expect } from 'vitest';
import { scssVariablesClassMode, scssVariablesMediaMode } from '../scss';

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
const file = { destination: '_variables.scss' };
const options = { outputReferences: false };

describe('scss formats', () => {
    it('scssVariablesClassMode produces .dark and SCSS variables', async () => {
        const result = await scssVariablesClassMode.format!({ dictionary, file, options });
        expect(result).toContain('.dark {');
        expect(result).toContain('$xpl-color-primary');
    });

    it('scssVariablesMediaMode produces media query', async () => {
        const result = await scssVariablesMediaMode.format!({ dictionary, file, options });
        expect(result).toContain('@media (prefers-color-scheme: dark)');
    });
});
