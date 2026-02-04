import type { PlatformConfig, File } from 'style-dictionary/types';
import { type PlatformsConfig, prefix } from '../globals';

export default function android({ brand, buildPath, modeConfig }: PlatformsConfig): PlatformConfig {
    const isLegacyBrand = brand === 'apollo';
    const hasModes = modeConfig?.hasModes || false;

    const files: File[] = [];

    // Legacy files only for Apollo brand (backwards compatibility)
    if (isLegacyBrand) {
        // Light mode colors (values/)
        files.push({
            destination: "colors.xml",
            format: hasModes ? "android/resources-light" : "android/resources",
            options: {
                outputReferences: true
            },
            filter: {
                type: "color"
            }
        });

        // Dark mode colors (values-night/)
        if (hasModes) {
            files.push({
                destination: "values-night/colors.xml",
                format: "android/resources-dark",
                options: {
                    outputReferences: true
                },
                filter: {
                    type: "color"
                }
            });
        }

        // Dimensions (shared, no dark mode)
        files.push({
            destination: "dimens.xml",
            format: "android/dimens",
            filter: (token) => ['fontSize', 'dimension', 'fontWeight'].includes(token.type || '')
        });

        // Modern Kotlin theme
        files.push({
            destination: "Theme.kt",
            format: "android/kotlin-theme",
            options: {
                className: "ApolloTheme",
                packageName: "com.xplor.apollo.design"
            },
            filter: () => true
        });
    }

    // Field Edge and other new brands: Skip Android output (they use React Native)
    // If needed in the future, they would only get the modern Kotlin theme

    return {
        // Custom transforms instead of transformGroup: "android"
        // Using custom 'size/pxToDp' and 'size/pxToSp' that don't scale (source values are in pixels)
        transforms: [
            'attribute/cti',
            'name/snake',
            'color/hex8android',
            'size/pxToDp',
            'size/pxToSp',
        ],
        buildPath: `${buildPath}/${brand}/android/`,
        prefix,
        files
    };
}
