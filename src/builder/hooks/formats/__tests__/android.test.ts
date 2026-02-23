import { describe, it, expect } from 'vitest';
import type { Dictionary, TransformedToken } from 'style-dictionary/types';
import {
    androidResourcesWithModes,
    androidResourcesLight,
    androidResourcesDark,
    androidDimens,
    androidKotlinTheme,
} from '../android';

function makeDict(allTokens: TransformedToken[]): Dictionary {
    return {
        allTokens,
        tokens: {},
        tokenMap: new Map(allTokens.map((t) => [t.name, t])),
    };
}

const colorTokens: TransformedToken[] = [
    {
        path: ['color', 'background', 'primary'],
        name: 'xpl_color_background_primary',
        value: '#ffffff',
        type: 'color',
        original: { value: '#ffffff', key: 'xpl_color_background_primary' },
        attributes: { category: 'color' },
        filePath: '',
        isSource: true,
    },
    {
        path: ['color', 'dark', 'background', 'primary'],
        name: 'xpl_color_background_primary_dark',
        value: '#111111',
        type: 'color',
        original: { value: '#111111', key: 'xpl_color_background_primary_dark' },
        attributes: { category: 'color' },
        filePath: '',
        isSource: true,
    },
];

const dictionary = makeDict(colorTokens);
const file = { destination: 'colors.xml' };
const platform = { prefix: 'xpl' };

describe('android formats', () => {
    it('androidResourcesWithModes outputs XML with light/dark suffixes', async () => {
        const result = await androidResourcesWithModes.format!({
            dictionary,
            file,
            options: { prefix: 'xpl' },
            platform,
        });
        expect(result).toContain('<resources>');
        expect(result).toContain('<color name="xpl_color_background_primary">#ffffff</color>');
        expect(result).toContain('xpl_dark_color_background_primary');
        expect(result).toContain('</resources>');
    });

    it('androidResourcesLight outputs light values only', async () => {
        const result = await androidResourcesLight.format!({
            dictionary,
            file,
            options: { outputReferences: false },
            platform,
        });
        expect(result).toContain('<color name="xpl_color_background_primary">');
    });

    it('androidResourcesDark outputs dark values', async () => {
        const result = await androidResourcesDark.format!({
            dictionary,
            file,
            options: { outputReferences: false },
            platform,
        });
        expect(result).toContain('<color name="xpl_color_background_primary">');
        expect(result).toContain('#111111');
    });

    it('androidDimens outputs dp/sp/string by type', async () => {
        const dimTokens: TransformedToken[] = [
            {
                path: ['size', 'spacing', 'm'], name: 'xpl_size_spacing_m', value: '16.00dp', type: 'dimension', original: {}, attributes: { category: 'size' }, filePath: '', isSource: true,
            },
            {
                path: ['font', 'size', 'body'], name: 'xpl_font_size_body', value: '14', type: 'fontSize', original: {}, attributes: {}, filePath: '', isSource: true,
            },
        ];
        const result = await androidDimens.format!({
            dictionary: makeDict(dimTokens),
            file,
            options: {},
            platform,
        });
        expect(result).toContain('<dimen name="xpl_size_spacing_m">16.00dp</dimen>');
        expect(result).toContain('sp');
    });

    it('sanitizes "--" in token comments to prevent invalid XML', async () => {
        const tokenWithDashComment: TransformedToken[] = [
            {
                path: ['color', 'brand'],
                name: 'xpl_color_brand',
                value: '#ff0000',
                type: 'color',
                comment: 'Updated for version 2.0--latest',
                original: { value: '#ff0000', key: 'xpl_color_brand' },
                attributes: { category: 'color' },
                filePath: '',
                isSource: true,
            },
        ];
        const dict = makeDict(tokenWithDashComment);

        for (
            const format of [
                androidResourcesWithModes,
                androidResourcesLight,
                androidResourcesDark,
                androidDimens,
            ]
        ) {
            const result = await format.format!({
                dictionary: dict,
                file,
                options: {},
                platform,
            });
            expect(result).not.toContain('--latest');
            expect(result).toContain('- -latest');
        }
    });

    it('sanitizes runs of 3+ consecutive dashes in XML comments', async () => {
        const formats = [
            androidResourcesWithModes,
            androidResourcesLight,
            androidResourcesDark,
            androidDimens,
        ] as const;

        const cases = [
            { comment: 'triple---dash', expected: 'triple- - -dash' },
            { comment: 'quad----dash', expected: 'quad- - - -dash' },
        ];

        for (const { comment, expected } of cases) {
            const dict = makeDict([{
                path: ['color', 'brand'],
                name: 'xpl_color_brand',
                value: '#ff0000',
                type: 'color',
                comment,
                original: { value: '#ff0000', key: 'xpl_color_brand' },
                attributes: { category: 'color' },
                filePath: '',
                isSource: true,
            }]);

            for (const format of formats) {
                const result = await format.format!({
                    dictionary: dict,
                    file,
                    options: {},
                    platform,
                });
                expect(result).not.toContain('---');
                expect(result).toContain(expected);
            }
        }
    });

    it('sanitizes "*/" in Kotlin doc comments to prevent premature block closure', async () => {
        const tokenWithClosingComment: TransformedToken[] = [
            {
                path: ['color', 'brand'],
                name: 'xpl_color_brand',
                value: '#ff0000',
                type: 'color',
                comment: 'Note: close with */',
                original: { value: '#ff0000', key: 'xpl_color_brand' },
                attributes: { category: 'color' },
                filePath: '',
                isSource: true,
            },
        ];
        const dict = makeDict(tokenWithClosingComment);

        const result = await androidKotlinTheme.format!({
            dictionary: dict,
            file: { destination: 'Theme.kt' },
            options: { className: 'Theme', packageName: 'com.xplor.design' },
            platform,
        });
        expect(result).not.toContain('*/\n */');
        expect(result).toContain('* /');
    });

    it('escapes dollar signs in Kotlin color string literals to prevent template interpolation', async () => {
        const dollarTokens: TransformedToken[] = [
            {
                path: ['color', 'weird'],
                name: 'xpl_color_weird',
                value: '#$ff0000',
                type: 'color',
                original: { value: '#$ff0000', key: 'xpl_color_weird' },
                attributes: { category: 'color' },
                filePath: '',
                isSource: true,
            },
        ];
        const dict = makeDict(dollarTokens);

        const result = await androidKotlinTheme.format!({
            dictionary: dict,
            file: { destination: 'Theme.kt' },
            options: { className: 'Theme', packageName: 'com.xplor.design' },
            platform,
        });
        // Unescaped "$" must not appear inside the string literal
        expect(result).not.toMatch(/"#\$ff0000"/);
        // Dollar sign must be escaped as \$
        expect(result).toContain('\\$');
    });

    it('escapes double quotes and backslashes in Kotlin color string literals', async () => {
        const malformedTokens: TransformedToken[] = [
            {
                path: ['color', 'weird'],
                name: 'xpl_color_weird',
                value: '#ff"00\\00',
                type: 'color',
                original: { value: '#ff"00\\00', key: 'xpl_color_weird' },
                attributes: { category: 'color' },
                filePath: '',
                isSource: true,
            },
        ];
        const dict = makeDict(malformedTokens);

        const result = await androidKotlinTheme.format!({
            dictionary: dict,
            file: { destination: 'Theme.kt' },
            options: { className: 'Theme', packageName: 'com.xplor.design' },
            platform,
        });
        // Raw unescaped quote must not appear inside the string literal
        expect(result).not.toMatch(/"#ff"00/);
        // Both special chars must be properly escaped
        expect(result).toContain('\\"');
        expect(result).toContain('\\\\');
    });

    it('androidKotlinTheme does not crash for tokens whose path is only "dark"', async () => {
        const darkOnlyToken: TransformedToken[] = [
            {
                path: ['dark'],
                name: 'xpl_dark',
                value: '#000000',
                type: 'color',
                original: { value: '#000000', key: 'xpl_dark' },
                attributes: { category: 'color' },
                filePath: '',
                isSource: true,
            },
        ];
        const dict = makeDict(darkOnlyToken);

        await expect(androidKotlinTheme.format!({
            dictionary: dict,
            file: { destination: 'Theme.kt' },
            options: { className: 'Theme', packageName: 'com.xplor.design' },
            platform,
        })).resolves.not.toThrow();
    });

    it('androidKotlinTheme prefixes digit-leading identifiers with _ to produce valid Kotlin', async () => {
        const numericTokens: TransformedToken[] = [
            {
                path: ['color', 'gray', '0'],
                name: 'xpl_color_gray_0',
                value: '#ffffff',
                type: 'color',
                original: { value: '#ffffff', key: 'xpl_color_gray_0' },
                attributes: { category: 'color' },
                filePath: '',
                isSource: true,
            },
            {
                path: ['color', 'gray', '50'],
                name: 'xpl_color_gray_50',
                value: '#f8f9fa',
                type: 'color',
                original: { value: '#f8f9fa', key: 'xpl_color_gray_50' },
                attributes: { category: 'color' },
                filePath: '',
                isSource: true,
            },
        ];
        const dict = makeDict(numericTokens);

        const result = await androidKotlinTheme.format!({
            dictionary: dict,
            file: { destination: 'Theme.kt' },
            options: { className: 'Theme', packageName: 'com.xplor.design' },
            platform,
        });
        // Must not contain bare digit-leading identifiers
        expect(result).not.toMatch(/val 0\b/);
        expect(result).not.toMatch(/val 50\b/);
        expect(result).not.toMatch(/object 0\b/);
        expect(result).not.toMatch(/object 50\b/);
        // Must contain underscore-prefixed variants instead
        expect(result).toContain('val _0');
        expect(result).toContain('val _50');
    });

    it('androidKotlinTheme outputs Kotlin object with nested structure', async () => {
        const result = await androidKotlinTheme.format!({
            dictionary,
            file: { destination: 'Theme.kt' },
            options: { className: 'Theme', packageName: 'com.xplor.design' },
            platform,
        });
        expect(result).toContain('package com.xplor.design');
        expect(result).toContain('object Theme');
        expect(result).toContain('isSystemInDarkTheme');
        expect(result).toContain('Color');
    });
});
