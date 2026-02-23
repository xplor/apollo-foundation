import { describe, it, expect } from 'vitest';
import { makeTestDict } from 'src/builder/utils/make-test-dict';
import { debug } from '../debug';

describe('debug format', () => {
    it('has correct name', () => {
        expect(debug.name).toBe('json/debug');
    });

    it('outputs stringified dictionary.tokens', async () => {
        const allTokens = [
            {
                path: ['color', 'background', 'primary'],
                name: 'xplColorBackgroundPrimary',
                value: '.init(red: 1, green: 1, blue: 1, alpha: 1)',
                type: 'color',
                original: { value: '#ffffff', key: 'xplColorBackgroundPrimary' },
                attributes: { category: 'color' },
                filePath: '',
                isSource: true,
            },
            {
                path: ['color', 'dark', 'background', 'primary'],
                name: 'xplColorBackgroundPrimaryDark',
                value: '.init(red: 0, green: 0, blue: 0, alpha: 1)',
                type: 'color',
                original: { value: '#000000', key: 'xplColorBackgroundPrimaryDark' },
                attributes: { category: 'color' },
                filePath: '',
                isSource: true,
            },
        ];
        const tokens = { color: { background: { value: '#fff' } } };
        const platform = { prefix: 'xpl' };
        const result = await debug.format!({
            dictionary: makeTestDict(allTokens, tokens, { unfilteredTokens: [] }),
            file: {},
            options: {},
            platform,
        }) as string;
        expect(() => JSON.parse(result)).not.toThrow();
        expect(JSON.parse(result)).toEqual(tokens);
    });

    it('format has nested property', () => {
        expect((debug.format).nested).toBe(true);
    });
});
