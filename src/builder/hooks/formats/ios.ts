import { Format, TransformedToken, Dictionary } from 'style-dictionary/types';
import { fileHeader, usesReferences, getReferences } from 'style-dictionary/utils';
import { commentStyles } from 'style-dictionary/enums';

function getValue(
    token: TransformedToken,
    dictionary: Dictionary,
    outputReferences: boolean,
): string {
    if (outputReferences && usesReferences(token.original.value)) {
        const refs = getReferences(token.original.value, dictionary.tokens);

        if (refs.length > 0) return refs[0].name;
    }

    return token.value;
}

/**
 * Generates legacy names for backwards compatibility.
 * Removes "Color" from the token name after the prefix.
 * e.g., "xplColorRed500" -> "xplRed500"
 *
 * Also handles special cases like "xplColorTransparent0" -> ["xplTransparent0", "xplTransparent"]
 */
function getColorLegacyNames(name: string, prefix: string): string[] {
    const legacyNames: string[] = [];

    // Pattern: {prefix}Color{Rest} -> {prefix}{Rest}
    const colorPattern = new RegExp(`^(${prefix})(Color)(.+)$`, 'i');
    const match = name.match(colorPattern);

    if (match) {
        const legacyName = `${match[1]}${match[3]}`;
        // Only add if it's different from the original
        if (legacyName !== name) {
            legacyNames.push(legacyName);

            // Special case: xplTransparent0 -> also add xplTransparent (without the 0)
            // This handles old code that used xplTransparent instead of xplTransparent0
            if (legacyName === `${prefix}Transparent0`) {
                legacyNames.push(`${prefix}Transparent`);
            }
        }
    }

    return legacyNames;
}

/**
 * Generates legacy names for Size/Font tokens.
 * Removes "Size" from the token name after the prefix.
 * e.g., "xplSizeSpacing16" -> "xplSpacing16"
 * e.g., "xplSizeFontTitle1" -> "xplFontTitle1"
 * e.g., "xplSizeRadiusDefault" -> "xplRadiusDefault"
 */
function getSizeLegacyNames(name: string, prefix: string): string[] {
    const legacyNames: string[] = [];

    // Pattern: {prefix}Size{Rest} -> {prefix}{Rest}
    const sizePattern = new RegExp(`^(${prefix})(Size)(.+)$`, 'i');
    const match = name.match(sizePattern);

    if (match) {
        const legacyName = `${match[1]}${match[3]}`;
        // Only add if it's different from the original
        if (legacyName !== name) {
            legacyNames.push(legacyName);
        }
    }

    return legacyNames;
}

/**
 * Legacy iOS Swift enum format with flat structure.
 * Maintains backwards compatibility with older token naming.
 * Colors: xplColorRed500, xplBackgroundPrimary, etc.
 * Sizes: xplSizeSpacing16, xplSizeFontTitle1, etc.
 */
export const iosSwiftEnumWithModesLegacy = {
    name: 'ios-swift/enum-with-modes-legacy',
    format: async ({
        dictionary, file, options, platform,
    }) => {
        const { outputReferences } = options;
        const header = await fileHeader({ file, commentStyle: commentStyles.short });
        const prefix = platform.prefix || 'xpl';

        const tokensByPath = new Map<
            string, { light?: TransformedToken, dark?: TransformedToken }
        >();

        dictionary.allTokens.forEach((token) => {
            const isDark = token.path.includes('dark');
            const canonicalPath = token.path.filter((p) => p !== 'dark');
            const key = canonicalPath.join('.');

            if (!tokensByPath.has(key)) tokensByPath.set(key, {});

            const group = tokensByPath.get(key)!;
            if (isDark) {
                group.dark = token;
            } else {
                group.light = token;
            }
        });

        const sortedKeys = Array.from(tokensByPath.keys()).sort();

        let output = header;
        output += 'import UIKit\n';
        output += 'import SwiftUI\n\n';

        const className = options.className || 'StyleDictionaryColor';
        const isColorFile = className.toLowerCase().includes('color');
        output += `public enum ${className} {\n`;

        // Track legacy aliases to generate at the end
        const legacyAliases: { legacyName: string; newName: string }[] = [];

        sortedKeys.forEach((key) => {
            const group = tokensByPath.get(key)!;
            const { dark, light } = group;
            const primary = light || dark!;
            const { name } = primary;
            const deprecated = light?.deprecated || dark?.deprecated;
            const deprecatedComment = light?.deprecated_comment || dark?.deprecated_comment || 'This token is deprecated.';

            if (deprecated) {
                output += `    @available(*, deprecated, message: "${deprecatedComment}")\n`;
            }

            if (light && dark) {
                const lightVal = getValue(light, dictionary, !!outputReferences);
                const darkVal = getValue(dark, dictionary, !!outputReferences);

                output += `    public static let ${name} = UIColor { traitCollection in\n`;
                output += `        return traitCollection.userInterfaceStyle === .dark ? ${darkVal} : ${lightVal}\n`;
                output += '    }\n';
            } else {
                const val = getValue(primary, dictionary, !!outputReferences);
                output += `    public static let ${name} = ${val}\n`;
            }

            // Check for legacy name aliases based on file type
            const legacyNames = isColorFile
                ? getColorLegacyNames(name, prefix)
                : getSizeLegacyNames(name, prefix);
            legacyNames.forEach((legacyName) => {
                legacyAliases.push({ legacyName, newName: name });
            });
        });

        // Generate backwards-compatibility aliases
        if (legacyAliases.length > 0) {
            output += '\n    // MARK: - Backwards Compatibility Aliases\n';
            output += '    // These aliases maintain compatibility with older token names.\n';
            output += '    // They will be removed in a future major version.\n\n';

            legacyAliases.forEach(({ legacyName, newName }) => {
                output += `    @available(*, deprecated, renamed: "${newName}")\n`;
                output += `    public static let ${legacyName} = ${newName}\n`;
            });
        }

        output += '}\n\n';

        // Generate SwiftUI Color extension only for color files
        if (isColorFile) {
            output += 'extension Color {\n';
            sortedKeys.forEach((key) => {
                const group = tokensByPath.get(key)!;
                const primary = group.light || group.dark!;
                const { name } = primary;
                const deprecated = group.light?.deprecated || group.dark?.deprecated;
                const deprecatedComment = group.light?.deprecated_comment || group.dark?.deprecated_comment || 'This token is deprecated.';

                if (deprecated) {
                    output += `    @available(*, deprecated, message: "${deprecatedComment}")\n`;
                }
                output += `    public static let ${name} = Color(${className}.${name})\n`;
            });

            // Generate SwiftUI backwards-compatibility aliases
            if (legacyAliases.length > 0) {
                output += '\n    // MARK: - Backwards Compatibility Aliases\n\n';

                legacyAliases.forEach(({ legacyName, newName }) => {
                    output += `    @available(*, deprecated, renamed: "${newName}")\n`;
                    output += `    public static let ${legacyName} = Color(${className}.${legacyName})\n`;
                });
            }

            output += '}\n';
        }

        return output;
    },
} satisfies Format;

/**
 * Helper to convert token path to PascalCase for nested enum names
 */
function toPascalCase(str: string): string {
    return str
        .replace(/[-_\s]+(.)?/g, (_, c) => (c ? c.toUpperCase() : ''))
        .replace(/^./, (c) => c.toUpperCase());
}

/**
 * Helper to convert token name to camelCase for property names
 */
function toCamelCase(str: string): string {
    const pascal = toPascalCase(str);
    return pascal.charAt(0).toLowerCase() + pascal.slice(1);
}

/**
 * Builds a nested structure from flat tokens based on their paths
 */
interface NestedNode {
    tokens: TransformedToken[];
    children: Map<string, NestedNode>;
}

function buildNestedStructure(tokens: TransformedToken[]): NestedNode {
    const root: NestedNode = { tokens: [], children: new Map() };

    tokens.forEach((token) => {
        // Skip 'dark' from path for canonical structure
        const path = token.path.filter((p) => p !== 'dark');

        let current = root;
        // Navigate to the parent node (all but last segment)
        for (let i = 0; i < path.length - 1; i += 1) {
            const segment = path[i];
            if (!current.children.has(segment)) {
                current.children.set(segment, { tokens: [], children: new Map() });
            }
            current = current.children.get(segment)!;
        }

        // Add token to the leaf node
        current.tokens.push(token);
    });

    return root;
}

/**
 * Modern iOS Swift format with nested enum structure.
 * Provides better discoverability and organization.
 * e.g., Apollo.Color.Background.primary, Apollo.Spacing.medium
 */
export const iosSwiftEnumWithModes = {
    name: 'ios-swift/enum-with-modes',
    format: async ({
        dictionary, file, options,
    }) => {
        const { outputReferences } = options;
        const header = await fileHeader({ file, commentStyle: commentStyles.short });

        // Group tokens by light/dark mode
        const tokensByPath = new Map<
            string, { light?: TransformedToken, dark?: TransformedToken }
        >();

        dictionary.allTokens.forEach((token) => {
            const isDark = token.path.includes('dark');
            const canonicalPath = token.path.filter((p) => p !== 'dark');
            const key = canonicalPath.join('.');

            if (!tokensByPath.has(key)) tokensByPath.set(key, {});

            const group = tokensByPath.get(key)!;
            if (isDark) {
                group.dark = token;
            } else {
                group.light = token;
            }
        });

        // Build nested structure from the grouped tokens
        const mergedTokens: TransformedToken[] = [];
        tokensByPath.forEach((group) => {
            const primary = group.light || group.dark!;
            // Create a virtual merged token for structure building
            mergedTokens.push({
                ...primary,
                _lightToken: group.light,
                _darkToken: group.dark,
            } as TransformedToken & {
                _lightToken?: TransformedToken,
                _darkToken?: TransformedToken,
            });
        });

        const nestedRoot = buildNestedStructure(mergedTokens);

        let output = header;
        output += 'import UIKit\n';
        output += 'import SwiftUI\n\n';

        const className = options.className || 'Theme';

        // Recursive function to generate nested enums
        function generateNestedEnum(node: NestedNode, enumName: string, indent: string = ''): string {
            let result = `${indent}public enum ${enumName} {\n`;

            // Generate child enums first
            const sortedChildren = Array
                .from(node.children.entries())
                .sort((a, b) => a[0].localeCompare(b[0]));
            sortedChildren.forEach(([childName, childNode]) => {
                result += generateNestedEnum(childNode, toPascalCase(childName), `${indent}    `);
            });

            // Generate token properties
            const sortedTokens = [...node.tokens].sort((a, b) => a.name.localeCompare(b.name));
            sortedTokens.forEach((token) => {
                const extToken = token as TransformedToken & {
                    _lightToken?: TransformedToken,
                    _darkToken?: TransformedToken,
                };
                // eslint-disable-next-line no-underscore-dangle
                const light = extToken._lightToken;
                // eslint-disable-next-line no-underscore-dangle
                const dark = extToken._darkToken;
                const primary = light || dark!;

                // Use the last path segment as the property name
                const path = primary.path.filter((p) => p !== 'dark');
                const propName = toCamelCase(path[path.length - 1]);

                const deprecated = light?.deprecated || dark?.deprecated;
                const deprecatedComment = light?.deprecated_comment || dark?.deprecated_comment || 'This token is deprecated.';
                const { comment } = primary;

                if (deprecated) {
                    result += `${indent}    @available(*, deprecated, message: "${deprecatedComment}")\n`;
                }

                const isColor = primary.type === 'color';

                if (light && dark && isColor) {
                    const lightVal = getValue(light, dictionary, !!outputReferences);
                    const darkVal = getValue(dark, dictionary, !!outputReferences);

                    result += `${indent}    public static let ${propName} = UIColor { traitCollection in\n`;
                    result += `${indent}        return traitCollection.userInterfaceStyle === .dark ? ${darkVal} : ${lightVal}\n`;
                    result += `${indent}    }`;
                } else {
                    const val = getValue(primary, dictionary, !!outputReferences);
                    result += `${indent}    public static let ${propName} = ${val}`;
                }

                if (comment) {
                    result += ` /** ${comment} */`;
                }
                result += '\n';
            });

            result += `${indent}}\n`;
            return result;
        }

        output += generateNestedEnum(nestedRoot, className, '');

        return output;
    },
} satisfies Format;
