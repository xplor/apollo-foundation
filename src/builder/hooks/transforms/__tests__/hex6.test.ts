import { describe, it, expect } from 'vitest';
import { hex6 } from '../hex6';

describe('hex6 transform', () => {
    it('has correct name and type', () => {
        expect(hex6.name).toBe('color/hex6');
        expect(hex6.type).toBe('value');
    });

    it('filters only color category', () => {
        expect(hex6.filter!({ attributes: { category: 'color' } } as any)).toBe(true);
        expect(hex6.filter!({ attributes: { category: 'size' } } as any)).toBe(false);
        expect(hex6.filter!({ attributes: {} } as any)).toBe(false);
        expect(hex6.filter!({ attributes: undefined } as any)).toBe(false);
    });

    it('strips alpha from 8-digit hex', () => {
        expect(hex6.transform({ value: '#aabbccdd' } as any)).toBe('#aabbcc');
        expect(hex6.transform({ value: '#000000ff' } as any)).toBe('#000000');
        expect(hex6.transform({ value: '#ABCDEF99' } as any)).toBe('#ABCDEF');
    });

    it('leaves 6-digit hex unchanged', () => {
        expect(hex6.transform({ value: '#aabbcc' } as any)).toBe('#aabbcc');
        expect(hex6.transform({ value: '#000000' } as any)).toBe('#000000');
    });

    it('leaves non-matching values unchanged', () => {
        expect(hex6.transform({ value: '#abc' } as any)).toBe('#abc');
        expect(hex6.transform({ value: '#12345' } as any)).toBe('#12345');
        expect(hex6.transform({ value: 'rgb(0,0,0)' } as any)).toBe('rgb(0,0,0)');
        expect(hex6.transform({ value: 123 } as any)).toBe(123);
    });
});
