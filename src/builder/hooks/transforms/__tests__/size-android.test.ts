import { describe, it, expect } from 'vitest';
import { sizePxToDp, sizePxToSp } from '../size-android';

describe('sizePxToDp transform', () => {
    it('has correct name and type', () => {
        expect(sizePxToDp.name).toBe('size/pxToDp');
        expect(sizePxToDp.type).toBe('value');
    });

    it('filters dimension only', () => {
        expect(sizePxToDp.filter!({ type: 'dimension' } as any)).toBe(true);
        expect(sizePxToDp.filter!({ type: 'fontSize' } as any)).toBe(false);
    });

    it('transforms numeric values to dp', () => {
        expect(sizePxToDp.transform({ value: '16' } as any)).toBe('16.00dp');
        expect(sizePxToDp.transform({ value: '1.5' } as any)).toBe('1.50dp');
    });

    it('leaves non-numeric values unchanged', () => {
        expect(sizePxToDp.transform({ value: 'auto' } as any)).toBe('auto');
    });
});

describe('sizePxToSp transform', () => {
    it('has correct name and type', () => {
        expect(sizePxToSp.name).toBe('size/pxToSp');
        expect(sizePxToSp.type).toBe('value');
    });

    it('filters fontSize only', () => {
        expect(sizePxToSp.filter!({ type: 'fontSize' } as any)).toBe(true);
        expect(sizePxToSp.filter!({ type: 'dimension' } as any)).toBe(false);
    });

    it('transforms numeric values to sp', () => {
        expect(sizePxToSp.transform({ value: '16' } as any)).toBe('16.00sp');
        expect(sizePxToSp.transform({ value: '14' } as any)).toBe('14.00sp');
    });

    it('leaves non-numeric values unchanged', () => {
        expect(sizePxToSp.transform({ value: 'inherit' } as any)).toBe('inherit');
    });
});
