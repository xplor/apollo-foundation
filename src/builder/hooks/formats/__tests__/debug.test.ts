import { describe, it, expect } from 'vitest';
import { debug } from '../debug';

describe('debug format', () => {
    it('has correct name', () => {
        expect(debug.name).toBe('json/debug');
    });

    it('outputs stringified dictionary.tokens', async () => {
        const tokens = { color: { background: { value: '#fff' } } };
        const result = await debug.format!({
            // @ts-expect-error: TS thinks this fixture doesn't meet reqs for formatFn but its fine
            dictionary: { tokens, allTokens: [], unfilteredTokens: [] },
            file: {},
            options: {},
        }) as string;
        expect(() => JSON.parse(result)).not.toThrow();
        expect(JSON.parse(result)).toEqual(tokens);
    });

    it('format has nested property', () => {
        expect((debug.format).nested).toBe(true);
    });
});
