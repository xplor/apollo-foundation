import { describe, it, expect } from 'vitest';
import {
    androidResourcesWithModes,
    androidResourcesLight,
    androidResourcesDark,
    androidDimens,
    androidKotlinTheme,
} from '../android';

const colorTokens = [
    {
        path: ['color', 'background', 'primary'],
        name: 'xpl_color_background_primary',
        value: '#ffffff',
        type: 'color',
        original: { value: '#ffffff', key: 'xpl_color_background_primary' },
        attributes: { category: 'color' },
    },
    {
        path: ['color', 'dark', 'background', 'primary'],
        name: 'xpl_color_background_primary_dark',
        value: '#111111',
        type: 'color',
        original: { value: '#111111', key: 'xpl_color_background_primary_dark' },
        attributes: { category: 'color' },
    },
];

const dictionary = { allTokens: colorTokens, tokens: {}, unfilteredTokens: [] };
const file = { destination: 'colors.xml' };
const platform = { prefix: 'xpl' };

describe('android formats', () => {
    it('androidResourcesWithModes outputs XML with light/dark suffixes', async () => {
        const result = await androidResourcesWithModes.format!({
            dictionary,
            file,
            options: { prefix: 'xpl' },
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
            platform: platform as any,
        });
        expect(result).toContain('<color name="xpl_color_background_primary">');
    });

    it('androidResourcesDark outputs dark values', async () => {
        const result = await androidResourcesDark.format!({
            dictionary,
            file,
            options: { outputReferences: false },
            platform: platform as any,
        });
        expect(result).toContain('<color name="xpl_color_background_primary">');
        expect(result).toContain('#111111');
    });

    it('androidDimens outputs dp/sp/string by type', async () => {
        const dimTokens = [
            { path: ['size', 'spacing', 'm'], name: 'xpl_size_spacing_m', value: '16.00dp', type: 'dimension', original: {}, attributes: { category: 'size' } },
            { path: ['font', 'size', 'body'], name: 'xpl_font_size_body', value: '14', type: 'fontSize', original: {}, attributes: {} },
        ];
        const result = await androidDimens.format!({
            dictionary: { allTokens: dimTokens, tokens: {}, unfilteredTokens: [] },
            file,
            platform: platform as any,
        });
        expect(result).toContain('<dimen name="xpl_size_spacing_m">16.00dp</dimen>');
        expect(result).toContain('sp');
    });

    it('androidKotlinTheme outputs Kotlin object with nested structure', async () => {
        const result = await androidKotlinTheme.format!({
            dictionary,
            file: { destination: 'Theme.kt' },
            options: { className: 'Theme', packageName: 'com.xplor.design' },
            platform: platform as any,
        });
        expect(result).toContain('package com.xplor.design');
        expect(result).toContain('object Theme');
        expect(result).toContain('isSystemInDarkTheme');
        expect(result).toContain('Color');
    });
});
