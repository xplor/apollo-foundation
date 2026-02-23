import type { Dictionary, TransformedToken } from 'style-dictionary/types';
import { describe, it, expect } from 'vitest';
import { scssVariablesClassMode, scssVariablesMediaMode } from '../scss';

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
const file = { destination: '_variables.scss' };
const options = { outputReferences: false };
const platform = {};

describe('scss formats', () => {
    it('scssVariablesClassMode produces :root, .dark, and CSS custom properties', async () => {
        const result = await scssVariablesClassMode.format!({
            dictionary, file, options, platform,
        });
        expect(result).toContain(':root {');
        expect(result).toContain('.dark {');
        expect(result).toContain('--xpl-color-primary');
        expect(result).not.toContain('$xpl-color-primary');
    });

    it('scssVariablesMediaMode produces :root and media query with CSS custom properties', async () => {
        const result = await scssVariablesMediaMode.format!({
            dictionary, file, options, platform,
        });
        expect(result).toContain(':root {');
        expect(result).toContain('@media (prefers-color-scheme: dark)');
        expect(result).toContain('--xpl-color-primary');
        expect(result).not.toContain('$xpl-color-primary');
    });
});
