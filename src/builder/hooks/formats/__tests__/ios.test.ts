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

    it('iosSwiftEnumWithModesLegacy emits flat token name as reference when outputReferences is true', async () => {
        const baseToken = {
            path: ['color', 'red', '500'],
            name: 'xplColorRed500',
            value: '.init(red: 1, green: 0, blue: 0, alpha: 1)',
            type: 'color',
            original: { value: '#ff0000' },
            attributes: { category: 'color' },
        };
        const semanticToken = {
            path: ['color', 'background', 'primary'],
            name: 'xplColorBackgroundPrimary',
            value: '.init(red: 1, green: 0, blue: 0, alpha: 1)',
            type: 'color',
            original: { value: '{color.red.500}' },
            attributes: { category: 'color' },
        };
        const refDictionary = {
            allTokens: [baseToken, semanticToken],
            tokens: { color: { red: { 500: baseToken } } },
            unfilteredTokens: [],
        };

        const result = await iosSwiftEnumWithModesLegacy.format!({
            // @ts-expect-error: no need for a complete object in test
            dictionary: refDictionary,
            file,
            options: { className: 'StyleDictionaryColor', outputReferences: true },
            platform,
        });

        // Flat format: the reference value should be the flat SD token name, valid in scope
        expect(result).toContain('xplColorRed500');
    });

    it('iosSwiftEnumWithModes emits fully-qualified nested Swift path as reference when outputReferences is true', async () => {
        const baseToken = {
            path: ['color', 'red', '500'],
            name: 'xplColorRed500',
            value: '.init(red: 1, green: 0, blue: 0, alpha: 1)',
            type: 'color',
            original: { value: '#ff0000' },
            attributes: { category: 'color' },
        };
        const semanticToken = {
            path: ['color', 'background', 'primary'],
            name: 'xplColorBackgroundPrimary',
            value: '.init(red: 1, green: 0, blue: 0, alpha: 1)',
            type: 'color',
            original: { value: '{color.red.500}' },
            attributes: { category: 'color' },
        };
        const refDictionary = {
            allTokens: [baseToken, semanticToken],
            tokens: { color: { red: { 500: baseToken } } },
            unfilteredTokens: [],
        };

        const result = await iosSwiftEnumWithModes.format!({
            // @ts-expect-error: no need for a complete object in test
            dictionary: refDictionary,
            file: { destination: 'Theme.swift' },
            options: { className: 'Theme', outputReferences: true },
            platform,
        });

        // Must emit a nested Swift path, not the flat SD token name (which is out of scope)
        expect(result).not.toContain('= xplColorRed500');
        expect(result).toContain('Theme.Color.Red._500');
    });

    it('iosSwiftEnumWithModes produces valid Swift identifiers for numeric path segments', async () => {
        const numericTokens = [
            {
                path: ['color', 'background', 'transparent', '0'],
                name: 'xplColorBackgroundTransparent0',
                value: '.init(red: 0, green: 0, blue: 0, alpha: 0)',
                type: 'color',
                original: { value: 'rgba(0,0,0,0)', key: 'xplColorBackgroundTransparent0' },
                attributes: { category: 'color' },
            },
        ];
        const numericDictionary = { allTokens: numericTokens, tokens: {}, unfilteredTokens: [] };

        const result = await iosSwiftEnumWithModes.format!({
            // @ts-expect-error: no need for a complete object in test
            dictionary: numericDictionary,
            file: { destination: 'Theme.swift' },
            options: { className: 'Theme', outputReferences: false },
            platform,
        });

        // "0" path segment must be emitted as "_0", not "0" (invalid Swift identifier)
        expect(result).not.toContain('public static let 0 ');
        expect(result).toContain('public static let _0 ');
    });
});
