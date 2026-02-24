import { describe, it, expect } from 'vitest';
import android from '../android';

describe('android platform', () => {
    it('apollo with hasModes includes colors.xml, values-night/colors.xml, dimens, Theme.kt', () => {
        const config = android({
            brand: 'apollo',
            buildPath: '/build',
            modeConfig: { hasModes: true },
        });
        const destinations = config.files!.map((f) => f.destination);
        expect(destinations).toContain('colors.xml');
        expect(destinations).toContain('values-night/colors.xml');
        expect(destinations).toContain('dimens.xml');
        expect(destinations).toContain('Theme.kt');
        expect(config.files!.find((f) => f.destination === 'colors.xml')?.format).toBe('android/resources-light');
    });

    it('apollo without hasModes uses android/resources for colors', () => {
        const config = android({
            brand: 'apollo',
            buildPath: '/build',
            modeConfig: { hasModes: false },
        });
        expect(config.files!.find((f) => f.destination === 'colors.xml')?.format).toBe('android/resources');
        expect(config.files!.some((f) => f.destination?.includes('values-night'))).toBe(false);
    });

    it('non-apollo brand has no legacy files', () => {
        const config = android({
            brand: 'field-edge',
            buildPath: '/build',
            modeConfig: { hasModes: true },
        });
        expect(config.files).toHaveLength(0);
    });

    it('buildPath includes brand', () => {
        const config = android({
            brand: 'apollo',
            buildPath: '/build',
            modeConfig: { hasModes: true },
        });
        expect(config.buildPath).toBe('/build/apollo/android/');
    });
});
