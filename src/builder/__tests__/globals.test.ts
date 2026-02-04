import { describe, it, expect } from 'vitest';
import { prefix } from '../globals';

describe('globals', () => {
    it('exports prefix as xpl', () => {
        expect(prefix).toBe('xpl');
    });
});
