import { describe, it, expect } from 'vitest';
import type { TransformedToken } from 'style-dictionary/types';
import { sizeCGFloat } from '../size-cgfloat';

describe('sizeCGFloat transform', () => {
    it('has correct name and type', () => {
        expect(sizeCGFloat.name).toBe('size/pxToCGFloat');
        expect(sizeCGFloat.type).toBe('value');
    });

    it('filters dimension and fontSize only', () => {
        expect(sizeCGFloat.filter!({ type: 'dimension' } as TransformedToken)).toBe(true);
        expect(sizeCGFloat.filter!({ type: 'fontSize' } as TransformedToken)).toBe(true);
        expect(sizeCGFloat.filter!({ type: 'color' } as TransformedToken)).toBe(false);
        expect(sizeCGFloat.filter!({ type: 'fontWeight' } as TransformedToken)).toBe(false);
    });

    it('transforms numeric values to CGFloat', () => {
        expect(sizeCGFloat.transform({ value: '16' } as TransformedToken)).toBe('CGFloat(16.00)');
        expect(sizeCGFloat.transform({ value: '0' } as TransformedToken)).toBe('CGFloat(0.00)');
        expect(sizeCGFloat.transform({ value: '1.5' } as TransformedToken)).toBe('CGFloat(1.50)');
    });

    it('leaves non-numeric values unchanged', () => {
        expect(sizeCGFloat.transform({ value: 'auto' } as TransformedToken)).toBe('auto');
        expect(sizeCGFloat.transform({ value: 'inherit' } as TransformedToken)).toBe('inherit');
        expect(sizeCGFloat.transform({ value: '' } as TransformedToken)).toBe('');
    });
});
