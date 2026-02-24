import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import type { TransformedToken } from 'style-dictionary/types';
import { genFormatter } from '../gen-formatter';
import { makeTestDict } from '../make-test-dict';

const FIXTURE_PATH = resolve(__dirname, '../../__tests__/fixtures/tokens-formatter.json');

type FixtureItem = { path: string[]; name: string; value: string; comment?: string };

function loadFixtureTokens(): TransformedToken[] {
    const raw = readFileSync(FIXTURE_PATH, 'utf-8');
    const items = JSON.parse(raw) as Array<FixtureItem>;

    return items.map<TransformedToken>((item) => ({
        path: item.path,
        name: item.name,
        value: item.value,
        original: { value: item.value, key: item.name },
        attributes: { category: 'color' },
        comment: item.comment,
        filePath: '',
        isSource: false,
    }));
}

describe('genFormatter', () => {
    const platform = { prefix: 'xpl' };

    it('produces :root and .dark blocks with real fixture file', async () => {
        const allTokens = loadFixtureTokens();
        const formatFn = genFormatter({
            darkWrapPrefix: '.dark {\n',
            darkWrapSuffix: '\n}',
            format: 'css',
            lightFormatting: { indentation: '  ' },
            lightWrapPrefix: ':root {\n',
            lightWrapSuffix: '\n}\n\n',
        });

        const result = await formatFn({
            dictionary: makeTestDict(allTokens, {}, { unfilteredTokens: [] }),
            file: { destination: 'variables.css' },
            options: { outputReferences: false },
            platform,
        });

        expect(result).toContain(':root {');
        expect(result).toContain('.dark {');
        expect(result).toContain('--xpl-color-background-primary');
        expect(result).toContain('#ffffff');
        expect(result).toContain('#111111');
        expect(result).toContain('--xpl-color-transparent-0');
        expect(result).toContain('--xpl-color-transparent: var(--xpl-color-transparent-0)');
    });

    it('produces media query variant when configured', async () => {
        const allTokens = loadFixtureTokens();
        const formatFn = genFormatter({
            darkFormatting: { indentation: '    ' },
            darkWrapPrefix: '@media (prefers-color-scheme: dark) {\n  :root {\n',
            darkWrapSuffix: '\n  }\n}\n',
            format: 'css',
            lightWrapPrefix: ':root {\n',
            lightWrapSuffix: '\n}\n\n',
        });

        const result = await formatFn({
            dictionary: makeTestDict(allTokens, {}, { unfilteredTokens: [] }),
            file: { destination: 'variables-media.css' },
            options: { outputReferences: false },
            platform,
        });

        expect(result).toContain('@media (prefers-color-scheme: dark)');
        expect(result).toContain(':root {');
    });
});
