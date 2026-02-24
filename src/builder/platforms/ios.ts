import type { PlatformConfig, File } from 'style-dictionary/types';
import { type PlatformsConfig, prefix } from '../globals';

export default function ios({ brand, buildPath, modeConfig }: PlatformsConfig): PlatformConfig {
    const hasModes = modeConfig?.hasModes || false;
    const isLegacyBrand = brand === 'apollo';

    const files: File[] = [];

    // Legacy files only for Apollo brand (backwards compatibility)
    if (isLegacyBrand) {
        files.push(
            // Legacy Color file
            {
                destination: 'StyleDictionaryColor.swift',
                format: hasModes ? 'ios-swift/enum-with-modes-legacy' : 'ios-swift/enum.swift',
                options: {
                    className: 'StyleDictionaryColor',
                    outputReferences: true,
                },
                filter: {
                    type: 'color',
                },
            },
            // Legacy Size/Font file
            // Includes: fontSize, dimension (spacing, radii, borders), fontWeight
            {
                destination: 'StyleDictionaryFont.swift',
                format: hasModes ? 'ios-swift/enum-with-modes-legacy' : 'ios-swift/enum.swift',
                options: {
                    className: 'StyleDictionarySize',
                    outputReferences: true,
                },
                filter: (token) => ['fontSize', 'dimension', 'fontWeight'].includes(token.type || ''),
            },
        );
    }

    // Modern nested structure (for all brands)
    files.push({
        destination: 'Theme.swift',
        format: 'ios-swift/enum-with-modes',
        options: {
            className: 'Theme',
            outputReferences: true,
        },
        // Include all tokens
        filter: () => true,
    });

    return {
        // Custom transforms instead of transformGroup: "ios-swift-separate"
        // Using custom 'size/pxToCGFloat' that doesn't scale (source values are in pixels)
        transforms: [
            'attribute/cti',
            'name/camel',
            'color/UIColorSwift',
            'content/swift/literal',
            'asset/swift/literal',
            'size/pxToCGFloat',
        ],
        buildPath: `${buildPath}/${brand}/ios/`,
        prefix,
        files,
    };
}
