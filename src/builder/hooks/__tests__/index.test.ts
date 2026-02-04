import { describe, it, expect } from 'vitest';
import hooks from '../index';

describe('hooks', () => {
    it('exports formats, parsers, transforms', () => {
        expect(hooks).toHaveProperty('formats');
        expect(hooks).toHaveProperty('parsers');
        expect(hooks).toHaveProperty('transforms');
    });

    it('includes expected format names', () => {
        expect(hooks.formats).toHaveProperty('css/variables-class-mode');
        expect(hooks.formats).toHaveProperty('css/variables-media-mode');
        expect(hooks.formats).toHaveProperty('scss/variables-class-mode');
        expect(hooks.formats).toHaveProperty('android/resources-with-modes');
        expect(hooks.formats).toHaveProperty('android/kotlin-theme');
        expect(hooks.formats).toHaveProperty('ios-swift/enum-with-modes');
        expect(hooks.formats).toHaveProperty('javascript/umd-with-modes');
        expect(hooks.formats).toHaveProperty('typescript/declarations');
        expect(hooks.formats).toHaveProperty('json/debug');
    });

    it('includes expected transform names', () => {
        expect(hooks.transforms).toHaveProperty('color/hex6');
        expect(hooks.transforms).toHaveProperty('size/pxToCGFloat');
        expect(hooks.transforms).toHaveProperty('size/pxToDp');
        expect(hooks.transforms).toHaveProperty('size/pxToSp');
    });

    it('includes dark-mode parser', () => {
        expect(hooks.parsers).toHaveProperty('dark-mode-nest');
        // @ts-expect-error: TODO - figure out why type isn't properly recognized by test
        expect(hooks.parsers['dark-mode-nest']).toHaveProperty('pattern');
        // @ts-expect-error: TODO - figure out why type isn't properly recognized by test
        expect(hooks.parsers['dark-mode-nest']).toHaveProperty('parser');
    });
});
