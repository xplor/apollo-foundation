import { describe, it, expect } from 'vitest';
import web from '../web';

describe('web platform', () => {
    it('css with hasModes outputs two files (class + media)', () => {
        const config = web({ brand: 'apollo', buildPath: '/build', modeConfig: { hasModes: true } });
        expect(config.css.files).toHaveLength(2);
        expect(config.css.files!.map((f) => f.destination)).toContain('variables.css');
        expect(config.css.files!.map((f) => f.destination)).toContain('variables-media.css');
        expect(config.css.files!.some((f) => f.format === 'css/variables-class-mode')).toBe(true);
        expect(config.css.files!.some((f) => f.format === 'css/variables-media-mode')).toBe(true);
    });

    it('css without hasModes outputs single variables.css', () => {
        const config = web({ brand: 'apollo', buildPath: '/build', modeConfig: { hasModes: false } });
        expect(config.css.files).toHaveLength(1);
        expect(config.css.files![0].destination).toBe('variables.css');
        expect(config.css.files![0].format).toBe('css/variables');
    });

    it('scss with hasModes outputs class and media formats', () => {
        const config = web({ brand: 'apollo', buildPath: '/build', modeConfig: { hasModes: true } });
        expect(config.scss.files!.some((f) => f.format === 'scss/variables-class-mode')).toBe(true);
        expect(config.scss.files!.some((f) => f.format === 'scss/variables-media-mode')).toBe(true);
    });

    it('js with hasModes uses umd-with-modes for colors', () => {
        const config = web({ brand: 'apollo', buildPath: '/build', modeConfig: { hasModes: true } });
        const colorsFile = config.js.files!.find((f) => f.destination === 'colors.js');
        expect(colorsFile?.format).toBe('javascript/umd-with-modes');
    });
});
