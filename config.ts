import {
    Config,
} from 'style-dictionary';

const config: Config = {
    hooks: {
        transforms: {
            'color/hex6': {
                type: 'value',
                filter: (token) => token.attributes?.category === 'color',
                transform: (token) => {
                    const value = token.value as string;
                    // Strip alpha channel if it's an 8-digit hex
                    if (value && typeof value === 'string') {
                        const match = value.match(/^#([0-9a-fA-F]{6})([0-9a-fA-F]{2})$/i);
                        if (match) {
                            return `#${match[1]}`; // Return 6-digit hex without alpha
                        }
                    }
                    return value;
                },
            },
        },
    },
    source: ['tokens/**/*.json'],
    platforms: {
        css: {
            transforms: [
                'attribute/cti',
                'name/kebab',
                'time/seconds',
                'html/icon',
                'size/rem',
                'color/hex6',
            ],
            buildPath: 'build/css/',
            prefix: 'xpl',
            files: [{
                destination: 'variables.css',
                format: 'css/variables',
                // fileHeader: "myFileHeader", // Removed as it was undefined and hidden
                options: {
                    showFileHeader: false,
                    outputReferences: true,
                },
            }],
        },
        scss: {
            transformGroup: 'scss',
            buildPath: 'build/scss/',
            prefix: 'xpl',
            files: [{
                destination: '_variables.scss',
                format: 'scss/variables',
                options: {
                    showFileHeader: true,
                    outputReferences: true,
                },
            }],
        },
        js: {
            buildPath: 'build/js/',
            transformGroup: 'js',
            files: [{
                destination: 'colors.js',
                format: 'javascript/umd',
                filter: {
                    attributes: {
                        category: 'color',
                    },
                },
                options: {
                    outputReferences: true,
                },
            },
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
            ],
        },
        android: {
            transformGroup: 'android',
            buildPath: 'build/android/',
            prefix: 'xpl',
            files: [{
                destination: 'font_dimens.xml',
                format: 'android/resources',
                filter: {
                    attributes: {
                        category: 'size',
                    },
                },
            },
            {
                destination: 'colors.xml',
                format: 'android/resources',
                options: {
                    outputReferences: true,
                },
                filter: {
                    attributes: {
                        category: 'color',
                    },
                },
            },
            ],
        },
        'ios-swift-separate-enums': {
            transformGroup: 'ios-swift-separate',
            buildPath: 'build/ios/',
            prefix: 'xpl',
            files: [{
                destination: 'StyleDictionaryColor.swift',
                format: 'ios-swift/enum.swift',
                // @ts-expect-error - className is a valid iOS Swift format, not in the File type
                className: 'StyleDictionaryColor',
                options: {
                    outputReferences: true,
                },
                filter: {
                    attributes: {
                        category: 'color',
                    },
                },
            },
            {
                destination: 'StyleDictionaryFont.swift',
                format: 'ios-swift/enum.swift',
                // @ts-expect-error - className is a valid iOS Swift format, not in the File type
                className: 'StyleDictionaryFont',
                type: 'float',
                options: {
                    outputReferences: true,
                },
                filter: {
                    attributes: {
                        category: 'size',
                    },
                },
            },
            ],
        },
    },
};

export default config;
