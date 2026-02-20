import { describe, it, expect } from 'vitest';
import type { TransformedToken } from 'style-dictionary/types';
import { hex6 } from '../hex6';

describe('hex6 transform', () => {
    it('has correct name and type', () => {
        expect(hex6.name).toBe('color/hex6');
        expect(hex6.type).toBe('value');
    });

    it('filters only color type', () => {
        expect(hex6.filter!({ type: 'color' } as TransformedToken)).toBe(true);
        expect(hex6.filter!({ type: 'dimension' } as TransformedToken)).toBe(false);
        expect(hex6.filter!({ type: 'fontSize' } as TransformedToken)).toBe(false);
        expect(hex6.filter!({} as TransformedToken)).toBe(false);
    });

    it('strips alpha from 8-digit hex', () => {
        expect(hex6.transform({ value: '#aabbccdd' } as TransformedToken)).toBe('#aabbcc');
        expect(hex6.transform({ value: '#000000ff' } as TransformedToken)).toBe('#000000');
        expect(hex6.transform({ value: '#ABCDEF99' } as TransformedToken)).toBe('#ABCDEF');
    });

    it('leaves 6-digit hex unchanged', () => {
        expect(hex6.transform({ value: '#aabbcc' } as TransformedToken)).toBe('#aabbcc');
        expect(hex6.transform({ value: '#000000' } as TransformedToken)).toBe('#000000');
    });

    it('leaves non-matching values unchanged', () => {
        expect(hex6.transform({ value: '#abc' } as TransformedToken)).toBe('#abc');
        expect(hex6.transform({ value: '#12345' } as TransformedToken)).toBe('#12345');
        expect(hex6.transform({ value: 'rgb(0,0,0)' } as TransformedToken)).toBe('rgb(0,0,0)');
        expect(hex6.transform({ value: 123 } as TransformedToken)).toBe(123);
    });
});
