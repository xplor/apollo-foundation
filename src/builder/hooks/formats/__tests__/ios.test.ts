import { describe, it, expect } from 'vitest';
import { iosSwiftEnumWithModesLegacy, iosSwiftEnumWithModes } from '../ios';

const colorTokens = [
    {
        path: ['color', 'background', 'primary'],
        name: 'xplColorBackgroundPrimary',
        value: '.init(red: 1, green: 1, blue: 1, alpha: 1)',
        type: 'color',
        original: { value: '#ffffff', key: 'xplColorBackgroundPrimary' },
        attributes: { category: 'color' },
    },
    {
        path: ['color', 'dark', 'background', 'primary'],
        name: 'xplColorBackgroundPrimaryDark',
        value: '.init(red: 0, green: 0, blue: 0, alpha: 1)',
        type: 'color',
        original: { value: '#000000', key: 'xplColorBackgroundPrimaryDark' },
        attributes: { category: 'color' },
    },
];

const dictionary = { allTokens: colorTokens, tokens: {}, unfilteredTokens: [] };
const file = { destination: 'StyleDictionaryColor.swift' };
const platform = { prefix: 'xpl' };

describe('ios formats', () => {
    it('iosSwiftEnumWithModesLegacy outputs UIColor with traitCollection', async () => {
        const result = await iosSwiftEnumWithModesLegacy.format!({
            // @ts-expect-error: no need for a complete object in test
            dictionary,
            file,
            options: { className: 'StyleDictionaryColor', outputReferences: false },
            platform,
        });
        expect(result).toContain('import UIKit');
        expect(result).toContain('public enum StyleDictionaryColor');
        expect(result).toContain('traitCollection.userInterfaceStyle === .dark');
    });

    it('iosSwiftEnumWithModes outputs nested enum structure', async () => {
        const result = await iosSwiftEnumWithModes.format!({
            // @ts-expect-error: no need for a complete object in test
            dictionary,
            file: { destination: 'Theme.swift' },
            options: { className: 'Theme', outputReferences: false },
            platform,
        });
        expect(result).toContain('public enum Theme');
        expect(result).toContain('traitCollection.userInterfaceStyle === .dark');
    });
});
