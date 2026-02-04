import { describe, it, expect } from 'vitest';
import buildPlatformsConfig from '../index';

describe('buildPlatformsConfig', () => {
    const baseConfig = { brand: 'apollo', buildPath: '/build', modeConfig: { hasModes: true } };

    it('returns all platform keys', () => {
        const platforms = buildPlatformsConfig(baseConfig);
        expect(platforms).toHaveProperty('android');
        expect(platforms).toHaveProperty('ios');
        expect(platforms).toHaveProperty('css');
        expect(platforms).toHaveProperty('scss');
        expect(platforms).toHaveProperty('js');
        expect(platforms).toHaveProperty('debug');
    });

    it('each platform has buildPath and files', () => {
        const platforms = buildPlatformsConfig(baseConfig);
        expect(platforms?.android.buildPath).toContain('apollo');
        expect(platforms?.android.files).toBeDefined();
        expect(platforms?.css.buildPath).toContain('apollo');
        expect(platforms?.css.files).toBeDefined();
        expect(platforms?.debug.buildPath).toBe('/build/apollo/debug/');
        expect(platforms?.debug.files).toHaveLength(1);
        expect(platforms?.debug.files![0].destination).toBe('tokens.json');
    });
});
