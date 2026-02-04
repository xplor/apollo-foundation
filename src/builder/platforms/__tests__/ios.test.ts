import { describe, it, expect } from 'vitest';
import ios from '../ios';

describe('ios platform', () => {
    it('apollo includes legacy Swift files and Theme.swift', () => {
        const config = ios({
            brand: 'apollo',
            buildPath: '/build',
            modeConfig: { hasModes: true },
        });
        const destinations = config.files!.map((f) => f.destination);
        expect(destinations).toContain('StyleDictionaryColor.swift');
        expect(destinations).toContain('StyleDictionaryFont.swift');
        expect(destinations).toContain('Theme.swift');
        expect(config.files!.find((f) => f.destination === 'StyleDictionaryColor.swift')?.format).toBe('ios-swift/enum-with-modes-legacy');
    });

    it('apollo without hasModes uses ios-swift/enum.swift for colors', () => {
        const config = ios({
            brand: 'apollo',
            buildPath: '/build',
            modeConfig: { hasModes: false },
        });
        expect(config.files!.find((f) => f.destination === 'StyleDictionaryColor.swift')?.format).toBe('ios-swift/enum.swift');
    });

    it('all brands get Theme.swift', () => {
        const config = ios({
            brand: 'field-edge',
            buildPath: '/build',
            modeConfig: { hasModes: false },
        });
        expect(config.files!.some((f) => f.destination === 'Theme.swift')).toBe(true);
        expect(config.files!.some((f) => f.destination === 'StyleDictionaryColor.swift')).toBe(false);
    });

    it('buildPath includes brand', () => {
        const config = ios({
            brand: 'apollo',
            buildPath: '/build',
            // @ts-expect-error: Typescript is overzealous in this instance
            modeConfig: {},
        });
        expect(config.buildPath).toBe('/build/apollo/ios/');
    });
});
