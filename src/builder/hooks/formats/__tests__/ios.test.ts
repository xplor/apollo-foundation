import { describe, it, expect } from 'vitest';
import type { TransformedToken } from 'style-dictionary/types';
import { makeTestDict } from 'src/builder/utils/make-test-dict';
import { iosSwiftEnumWithModesLegacy, iosSwiftEnumWithModes } from '../ios';

const colorTokens = [
    {
        path: ['color', 'background', 'primary'],
        name: 'xplColorBackgroundPrimary',
        value: '.init(red: 1, green: 1, blue: 1, alpha: 1)',
        type: 'color',
        original: { value: '#ffffff', key: 'xplColorBackgroundPrimary' },
        attributes: { category: 'color' },
        filePath: '',
        isSource: true,
    },
    {
        path: ['color', 'dark', 'background', 'primary'],
        name: 'xplColorBackgroundPrimaryDark',
        value: '.init(red: 0, green: 0, blue: 0, alpha: 1)',
        type: 'color',
        original: { value: '#000000', key: 'xplColorBackgroundPrimaryDark' },
        attributes: { category: 'color' },
        filePath: '',
        isSource: true,
    },
];

const dictionary = makeTestDict(colorTokens);
const file = { destination: 'StyleDictionaryColor.swift' };
const platform = { prefix: 'xpl' };

describe('ios formats', () => {
    it('iosSwiftEnumWithModesLegacy outputs UIColor with traitCollection', async () => {
        const result = await iosSwiftEnumWithModesLegacy.format!({
            dictionary,
            file,
            options: { className: 'StyleDictionaryColor', outputReferences: false },
            platform,
        });
        expect(result).toContain('import UIKit');
        expect(result).toContain('public enum StyleDictionaryColor');
        expect(result).toContain('traitCollection.userInterfaceStyle == .dark');
    });

    it('iosSwiftEnumWithModes outputs nested enum structure', async () => {
        const result = await iosSwiftEnumWithModes.format!({
            dictionary,
            file: { destination: 'Theme.swift' },
            options: { className: 'Theme', outputReferences: false },
            platform,
        });
        expect(result).toContain('public enum Theme');
        expect(result).toContain('traitCollection.userInterfaceStyle == .dark');
    });

    it('iosSwiftEnumWithModesLegacy emits flat token name as reference when outputReferences is true', async () => {
        const baseToken = {
            path: ['color', 'red', '500'],
            name: 'xplColorRed500',
            value: '.init(red: 1, green: 0, blue: 0, alpha: 1)',
            type: 'color',
            original: { value: '#ff0000' },
            attributes: { category: 'color' },
            filePath: '',
            isSource: true,
        };
        const semanticToken = {
            path: ['color', 'background', 'primary'],
            name: 'xplColorBackgroundPrimary',
            value: '.init(red: 1, green: 0, blue: 0, alpha: 1)',
            type: 'color',
            original: { value: '{color.red.500}' },
            attributes: { category: 'color' },
            filePath: '',
            isSource: true,
        };
        const allTokens = [baseToken, semanticToken];
        const refDictionary = makeTestDict(
            allTokens,
            { color: { red: { 500: baseToken } } },
            { unfilteredTokens: [] },
        );

        const result = await iosSwiftEnumWithModesLegacy.format!({
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
            filePath: '',
            isSource: true,
        };
        const semanticToken = {
            path: ['color', 'background', 'primary'],
            name: 'xplColorBackgroundPrimary',
            value: '.init(red: 1, green: 0, blue: 0, alpha: 1)',
            type: 'color',
            original: { value: '{color.red.500}' },
            attributes: { category: 'color' },
            filePath: '',
            isSource: true,
        };
        const allTokens = [baseToken, semanticToken];
        const refDictionary = makeTestDict(
            allTokens,
            { color: { red: { 500: baseToken } } },
            { unfilteredTokens: [] },
        );

        const result = await iosSwiftEnumWithModes.format!({
            dictionary: refDictionary,
            file: { destination: 'Theme.swift' },
            options: { className: 'Theme', outputReferences: true },
            platform,
        });

        // Must emit a nested Swift path, not the flat SD token name (which is out of scope)
        expect(result).not.toContain('= xplColorRed500');
        expect(result).toContain('Theme.Color.Red._500');
    });

    it('escapes double-quotes and newlines in deprecated_comment for both formats', async () => {
        const deprecatedToken = {
            path: ['color', 'background', 'primary'],
            name: 'xplColorBackgroundPrimary',
            value: '.init(red: 1, green: 1, blue: 1, alpha: 1)',
            type: 'color',
            original: { value: '#ffffff' },
            attributes: { category: 'color' },
            filePath: '',
            isSource: true,
            deprecated: true,
            deprecated_comment: 'Use "newToken" instead.\nSee docs.',
        } as TransformedToken;

        const dict = makeTestDict([deprecatedToken]);

        const legacyResult = await iosSwiftEnumWithModesLegacy.format!({
            dictionary: dict,
            file,
            options: { className: 'StyleDictionaryColor', outputReferences: false },
            platform,
        });
        // Quotes must be escaped as \" and newlines as \n (two-char sequence) inside Swift strings.
        // \\"newToken\\" in JS source = \"newToken\" in the generated file.
        expect(legacyResult).toContain('\\"newToken\\"');
        // '\\n' in JS = backslash + n, the two-character Swift escape sequence.
        expect(legacyResult).toContain('\\n');
        // No raw newline character should appear inside an @available(...) attribute.
        legacyResult.split('\n').forEach((line) => {
            if (line.includes('@available') && line.includes('message:')) {
                expect(line.endsWith(')')).toBe(true);
            }
        });

        const modernResult = await iosSwiftEnumWithModes.format!({
            dictionary: dict,
            file: { destination: 'Theme.swift' },
            options: { className: 'Theme', outputReferences: false },
            platform,
        });
        expect(modernResult).toContain('\\"newToken\\"');
        expect(modernResult).toContain('\\n');
        modernResult.split('\n').forEach((line) => {
            if (line.includes('@available') && line.includes('message:')) {
                expect(line.endsWith(')')).toBe(true);
            }
        });
    });

    it('escapes block-comment terminator in token comment for iosSwiftEnumWithModes', async () => {
        const commentToken = {
            path: ['color', 'background', 'primary'],
            name: 'xplColorBackgroundPrimary',
            value: '.init(red: 1, green: 1, blue: 1, alpha: 1)',
            type: 'color',
            original: { value: '#ffffff' },
            attributes: { category: 'color' },
            filePath: '',
            isSource: true,
            comment: 'Closes comment early */ and injects code',
        } as TransformedToken;

        const dict = makeTestDict([commentToken]);

        const result = await iosSwiftEnumWithModes.format!({
            dictionary: dict,
            file: { destination: 'Theme.swift' },
            options: { className: 'Theme', outputReferences: false },
            platform,
        });
        // The raw terminator from the token comment must be escaped to "* /".
        // The closing delimiter of the block comment itself (*/) is fine; we target the specific
        // sequence that came from the token's comment field.
        expect(result).not.toContain('early */');
        expect(result).toContain('early * /');
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
                filePath: '',
                isSource: true,
            },
        ];
        const numericDictionary = makeTestDict(numericTokens, {}, { unfilteredTokens: [] });

        const result = await iosSwiftEnumWithModes.format!({
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
