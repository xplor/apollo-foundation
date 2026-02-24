import type { PlatformConfig } from 'style-dictionary/types';
import { type PlatformsConfig, prefix } from '../globals';

function css({ brand, buildPath, modeConfig }: PlatformsConfig): PlatformConfig {
    const hasModes = modeConfig?.hasModes || false;

    return {
        transforms: [
            'attribute/cti',
            'name/kebab',
            'time/seconds',
            'html/icon',
            'size/pxToRem',
            'color/hex6',
        ],
        buildPath: `${buildPath}/${brand}/css/`,
        prefix,
        files: hasModes ? [
            {
                destination: 'variables.css',
                format: 'css/variables-class-mode',
                options: {
                    showFileHeader: false,
                    outputReferences: true,
                },
            },
            {
                destination: 'variables-media.css',
                format: 'css/variables-media-mode',
                options: {
                    showFileHeader: false,
                    outputReferences: true,
                },
            },
        ] : [{
            destination: 'variables.css',
            format: 'css/variables',
            options: {
                showFileHeader: false,
                outputReferences: true,
            },
        }],
    };
}

function scss({ brand, buildPath, modeConfig }: PlatformsConfig): PlatformConfig {
    const hasModes = modeConfig?.hasModes || false;

    return {
        transforms: [
            'attribute/cti',
            'name/kebab',
            'time/seconds',
            'html/icon',
            'size/pxToRem',
            'color/css',
            'asset/url',
            'fontFamily/css',
            'cubicBezier/css',
            'strokeStyle/css/shorthand',
            'border/css/shorthand',
            'typography/css/shorthand',
            'transition/css/shorthand',
            'shadow/css/shorthand',
        ],
        buildPath: `${buildPath}/${brand}/scss/`,
        prefix,
        files: hasModes ? [
            {
                destination: '_variables.scss',
                format: 'scss/variables-class-mode',
                options: {
                    showFileHeader: true,
                    outputReferences: true,
                },
            },
            {
                destination: '_variables-media.scss',
                format: 'scss/variables-media-mode',
                options: {
                    showFileHeader: true,
                    outputReferences: true,
                },
            },
        ] : [{
            destination: '_variables.scss',
            format: 'scss/variables',
            options: {
                showFileHeader: true,
                outputReferences: true,
            },
        }],
    };
}

function js({ brand, buildPath, modeConfig }: PlatformsConfig): PlatformConfig {
    const hasModes = modeConfig?.hasModes || false;

    return {
        buildPath: `${buildPath}/${brand}/js/`,
        transforms: [
            'attribute/cti',
            'name/pascal',
            'size/pxToRem',
            'color/hex',
        ],
        files: [
            // Main tokens file with mode support
            {
                destination: 'colors.js',
                format: hasModes ? 'javascript/umd-with-modes' : 'javascript/umd',
                filter: {
                    attributes: {
                        category: 'color',
                    },
                },
                options: {
                    outputReferences: true,
                },
            },
            // TypeScript declarations for colors
            {
                destination: 'colors.d.ts',
                format: 'typescript/declarations',
                filter: {
                    attributes: {
                        category: 'color',
                    },
                },
                options: {
                    outputReferences: true,
                },
            },
            // Font tokens
            {
                destination: 'font.js',
                format: 'javascript/umd',
                filter: {
                    attributes: {
                        category: 'font',
                    },
                },
                options: {
                    outputReferences: true,
                },
            },
            // TypeScript declarations for font
            {
                destination: 'font.d.ts',
                format: 'typescript/declarations',
                filter: {
                    attributes: {
                        category: 'font',
                    },
                },
                options: {
                    outputReferences: true,
                },
            },
        ],
    };
}

export default function web(config: PlatformsConfig): Record<string, PlatformConfig> {
    return {
        css: css(config),
        scss: scss(config),
        js: js(config),
    };
}
