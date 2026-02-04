import { describe, it, expect } from 'vitest';
import debug from '../debug';

describe('debug platform', () => {
    it('returns single file tokens.json with json/debug format', () => {
        const config = debug({ brand: 'apollo', buildPath: '/build' });
        expect(config.files).toHaveLength(1);
        expect(config.files![0].destination).toBe('tokens.json');
        expect(config.files![0].format).toBe('json/debug');
    });

    it('buildPath includes brand', () => {
        const config = debug({ brand: 'apollo', buildPath: '/build' });
        expect(config.buildPath).toBe('/build/apollo/debug/');
    });
});
