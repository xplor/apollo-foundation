import { describe, it, expect } from 'vitest';
import { darkMode } from '../dark-mode';

describe('darkMode parser', () => {
    it('has correct name and pattern', () => {
        expect(darkMode.name).toBe('dark-mode-nest');
        expect(darkMode.pattern).toEqual(/\.json$/);
        expect(darkMode.pattern.test('tokens.json')).toBe(true);
        expect(darkMode.pattern.test('tokens.txt')).toBe(false);
    });

    it('nests tokens under dark when filePath contains /dark/', () => {
        const contents = JSON.stringify({ color: { background: { value: '#000' } } });
        const result = darkMode.parser!({ contents, filePath: '/some/brands/apollo/color/dark/background.json' });
        expect(result).toEqual({ dark: { color: { background: { value: '#000' } } } });
    });

    it('returns tokens as-is when filePath does not contain /dark/', () => {
        const tokens = { color: { background: { value: '#fff' } } };
        const contents = JSON.stringify(tokens);
        const result = darkMode.parser!({ contents, filePath: '/some/brands/apollo/color/light/background.json' });
        expect(result).toEqual(tokens);
    });

    it('handles filePath without /dark/ in path', () => {
        const tokens = { spacing: { small: { value: '8px' } } };
        const result = darkMode.parser!({ contents: JSON.stringify(tokens), filePath: 'global/size/spacing.json' });
        expect(result).toEqual(tokens);
    });

    it('handles undefined filePath by returning tokens as-is', () => {
        const tokens = { foo: 'bar' };
        const result = darkMode.parser!({ contents: JSON.stringify(tokens), filePath: undefined });
        expect(result).toEqual(tokens);
    });
});
