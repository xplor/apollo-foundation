import { describe, it, expect } from 'vitest';
import { sizeCGFloat } from '../size-cgfloat';

describe('sizeCGFloat transform', () => {
    it('has correct name and type', () => {
        expect(sizeCGFloat.name).toBe('size/pxToCGFloat');
        expect(sizeCGFloat.type).toBe('value');
    });

    it('filters dimension and fontSize only', () => {
        expect(sizeCGFloat.filter!({ type: 'dimension' } as any)).toBe(true);
        expect(sizeCGFloat.filter!({ type: 'fontSize' } as any)).toBe(true);
        expect(sizeCGFloat.filter!({ type: 'color' } as any)).toBe(false);
        expect(sizeCGFloat.filter!({ type: 'fontWeight' } as any)).toBe(false);
    });

    it('transforms numeric values to CGFloat', () => {
        expect(sizeCGFloat.transform({ value: '16' } as any)).toBe('CGFloat(16.00)');
        expect(sizeCGFloat.transform({ value: '0' } as any)).toBe('CGFloat(0.00)');
        expect(sizeCGFloat.transform({ value: '1.5' } as any)).toBe('CGFloat(1.50)');
    });

    it('leaves non-numeric values unchanged', () => {
        expect(sizeCGFloat.transform({ value: 'auto' } as any)).toBe('auto');
        expect(sizeCGFloat.transform({ value: 'inherit' } as any)).toBe('inherit');
        expect(sizeCGFloat.transform({ value: '' } as any)).toBe('');
    });
});
