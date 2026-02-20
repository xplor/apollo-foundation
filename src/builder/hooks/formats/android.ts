import type { Format, TransformedToken, Dictionary } from 'style-dictionary/types';
import { fileHeader, usesReferences, getReferences } from 'style-dictionary/utils';
import { commentStyles } from 'style-dictionary/enums';

/**
 * Helper to convert token path to Android resource name (snake_case)
 */
function toAndroidResourceName(path: string[], prefix?: string): string {
    const name = path.join('_').toLowerCase().replace(/[^a-z0-9_]/g, '_');
    return prefix ? `${prefix}_${name}` : name;
}

/**
 * Helper to get Android color reference or raw value
 */
function getAndroidColorValue(
    token: TransformedToken,
    dictionary: Dictionary,
    outputReferences: boolean,
    prefix?: string,
): string {
    if (outputReferences && usesReferences(token.original.value)) {
        const refs = getReferences(token.original.value, dictionary.tokens);
        if (refs.length > 0) {
            const refPath = refs[0].path.filter((p: string) => p !== 'dark');
            if (refPath.length === 0) return token.value;
            const refName = toAndroidResourceName(refPath, prefix);
            return `@color/${refName}`;
        }
    }
    return token.value;
}

/**
 * Helper to convert token path to Kotlin property name (camelCase)
 */
function toKotlinPropertyName(path: string[]): string {
    return path.map((segment, index) => {
        const cleaned = (segment ?? '').replace(/[^a-zA-Z0-9]/g, '') || 'unknown';
        if (index === 0) {
            return cleaned.toLowerCase();
        }
        return cleaned.charAt(0).toUpperCase() + cleaned.slice(1).toLowerCase();
    }).join('');
}

/**
 * Sanitizes a string for safe embedding inside an XML comment.
 * XML forbids "--" inside comments and "-->" prematurely closes them.
 * A lookbehind replaces every dash that immediately follows another dash with
 * " -", inserting a space between each consecutive pair in a single pass.
 * This handles runs of 3+ dashes correctly (e.g. "---" → "- - -"),
 * unlike a plain /--/g replace which leaves "- --" for odd-length runs.
 */
function sanitizeXmlComment(comment: string): string {
    return comment.replace(/(?<=-)-/g, ' -');
}

/**
 * Sanitizes a string for safe embedding inside a Kotlin/KDoc block comment.
 * The sequence "*\/" prematurely closes the comment block, so every "*\/"
 * is replaced with "* /".
 */
function sanitizeKotlinDocComment(comment: string): string {
    return comment.replace(/\*\//g, '* /');
}

/**
 * Escapes a value for safe embedding inside a Kotlin double-quoted string literal.
 * Backslashes, double quotes, and dollar signs must be escaped: backslashes and
 * double quotes to prevent broken string syntax, and "$" because Kotlin treats it
 * as the start of a string template expression in double-quoted strings.
 */
function escapeKotlinStringLiteral(value: string): string {
    return value.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\$/g, '\\$');
}

/**
 * Groups a flat token list by canonical path (with "dark" segments stripped),
 * recording each token as either the light or dark variant of its group.
 * Returns a Map whose keys are JSON-serialised canonical paths.
 */
function groupTokensByCanonicalPath(
    tokens: TransformedToken[],
): Map<string, { light?: TransformedToken; dark?: TransformedToken }> {
    const tokensByPath = new Map<string, { light?: TransformedToken; dark?: TransformedToken }>();

    tokens.forEach((token) => {
        const isDark = token.path.includes('dark');
        const canonicalPath = token.path.filter((p) => p !== 'dark');
        const key = JSON.stringify(canonicalPath);

        if (!tokensByPath.has(key)) tokensByPath.set(key, {});
        const group = tokensByPath.get(key)!;
        if (isDark) {
            group.dark = token;
        } else {
            group.light = token;
        }
    });

    return tokensByPath;
}

/**
 * Helper to convert token path to PascalCase for Kotlin object names
 */
function toKotlinObjectName(segment: string): string {
    const cleaned = segment.replace(/[^a-zA-Z0-9]/g, '') || 'Unknown';
    return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
}

/**
 * Android XML resources format with mode support (legacy)
 * Outputs all tokens in a single file with _lm/_dm suffixes
 */
export const androidResourcesWithModes = {
    name: 'android/resources-with-modes',
    format: async ({ dictionary, file, options }) => {
        const header = await fileHeader({ file, commentStyle: commentStyles.long });
        const { prefix } = options || {};

        let output = header;
        output += '<?xml version="1.0" encoding="UTF-8"?>\n';
        output += '<resources>\n';

        dictionary.allTokens.forEach((token) => {
            const isDark = token.path.includes('dark');
            const canonicalPath = token.path.filter((part) => part !== 'dark');

            if (canonicalPath.length === 0) return;

            const virtualToken = { ...token, path: canonicalPath };
            let namePrefix = prefix;
            if (isDark) {
                namePrefix = prefix ? `${prefix}_dark` : 'dark';
            }

            const name = toAndroidResourceName(virtualToken.path, namePrefix);
            const { value } = token;

            if (token.comment) {
                output += `  <!-- ${sanitizeXmlComment(token.comment)} -->\n`;
            }

            if (token.type === 'color' || token.attributes?.category === 'color') {
                output += `  <color name="${name}">${value}</color>\n`;
            } else if (token.type === 'dimension' || token.attributes?.category === 'size') {
                output += `  <dimen name="${name}">${value}</dimen>\n`;
            } else {
                output += `  <item name="${name}" type="string">${value}</item>\n`;
            }
        });

        output += '</resources>\n';
        return output;
    },
} satisfies Format;

/**
 * Shared implementation for light/dark XML resource formats.
 * `preferDark` controls which token variant takes priority when both exist.
 */
async function formatAndroidResourcesForMode(
    {
        dictionary,
        file,
        options,
        platform,
    }: Parameters<NonNullable<Format['format']>>[0],
    preferDark: boolean,
): Promise<string> {
    const header = await fileHeader({ file, commentStyle: commentStyles.long });
    const prefix = (platform as { prefix?: string }).prefix || 'xpl';
    const { outputReferences } = options || {};

    const tokensByPath = groupTokensByCanonicalPath(dictionary.allTokens);

    let output = header;
    output += '<?xml version="1.0" encoding="UTF-8"?>\n';
    output += '<resources>\n';

    const sortedKeys = Array.from(tokensByPath.keys()).sort();

    sortedKeys.forEach((key) => {
        const group = tokensByPath.get(key)!;
        const token = preferDark
            ? (group.dark || group.light)
            : (group.light || group.dark);
        if (!token) return;

        const canonicalPath = token.path.filter((p) => p !== 'dark');
        if (canonicalPath.length === 0) return;

        const name = toAndroidResourceName(canonicalPath, prefix);
        const value = getAndroidColorValue(token, dictionary, !!outputReferences, prefix);

        if (token.comment) {
            output += `  <!-- ${sanitizeXmlComment(token.comment)} -->\n`;
        }

        if (token.type === 'color' || token.attributes?.category === 'color') {
            output += `  <color name="${name}">${value}</color>\n`;
        } else if (token.type === 'dimension' || token.attributes?.category === 'size') {
            output += `  <dimen name="${name}">${token.value}</dimen>\n`;
        }
    });

    output += '</resources>\n';
    return output;
}

/**
 * Android XML resources format - Light mode only
 * For use in values/ folder
 */
export const androidResourcesLight = {
    name: 'android/resources-light',
    format: (args) => formatAndroidResourcesForMode(args, false),
} satisfies Format;

/**
 * Android XML resources format - Dark mode only
 * For use in values-night/ folder
 */
export const androidResourcesDark = {
    name: 'android/resources-dark',
    format: (args) => formatAndroidResourcesForMode(args, true),
} satisfies Format;

/**
 * Builds a nested structure from flat tokens based on their paths
 */
interface NestedNode {
    tokens: Array<{ token: TransformedToken; light?: TransformedToken; dark?: TransformedToken }>;
    children: Map<string, NestedNode>;
}

function buildNestedStructure(
    tokensByPath: Map<string, { light?: TransformedToken, dark?: TransformedToken }>,
): NestedNode {
    const root: NestedNode = { tokens: [], children: new Map() };

    tokensByPath.forEach((group, pathKey) => {
        const path = JSON.parse(pathKey) as string[];
        const primary = group.light || group.dark!;

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
        current.tokens.push({
            token: primary,
            light: group.light,
            dark: group.dark,
        });
    });

    return root;
}

/**
 * Android Kotlin Compose theme format
 * Generates a modern Kotlin theme object with nested structure
 */
export const androidKotlinTheme = {
    name: 'android/kotlin-theme',
    format: async ({
        dictionary, file, options,
    }) => {
        const header = await fileHeader({ file, commentStyle: commentStyles.long });
        const className = options.className || 'Theme';
        const packageName = options.packageName || 'com.xplor.design';

        const tokensByPath = groupTokensByCanonicalPath(dictionary.allTokens);
        const nestedRoot = buildNestedStructure(tokensByPath);

        let output = header;
        output += `package ${packageName}\n\n`;
        output += 'import androidx.compose.foundation.isSystemInDarkTheme\n';
        output += 'import androidx.compose.runtime.Composable\n';
        output += 'import androidx.compose.ui.graphics.Color\n';
        output += 'import androidx.compose.ui.unit.dp\n';
        output += 'import androidx.compose.ui.unit.sp\n\n';

        // Helper function to parse hex color to Kotlin Color
        output += '/** Converts hex string to Compose Color */\n';
        output += 'private fun String.toColor(): Color {\n';
        output += '    val hex = this.removePrefix("#").removePrefix("0x")\n';
        output += '    return when (hex.length) {\n';
        output += '        6 -> Color(android.graphics.Color.parseColor("#$hex"))\n';
        output += '        8 -> Color(android.graphics.Color.parseColor("#$hex"))\n';
        output += '        else -> Color.Unspecified\n';
        output += '    }\n';
        output += '}\n\n';

        // Recursive function to generate nested objects
        function generateNestedObject(node: NestedNode, objectName: string, indent: string = ''): string {
            let result = `${indent}object ${objectName} {\n`;

            // Generate child objects first
            const sortedChildren = Array
                .from(node.children.entries())
                .sort((a, b) => a[0].localeCompare(b[0]));
            sortedChildren.forEach(([childName, childNode]) => {
                result += generateNestedObject(childNode, toKotlinObjectName(childName), `${indent}    `);
            });

            // Generate token properties
            const sortedTokens = [...node.tokens]
                .sort((a, b) => {
                    const aPath = a.token.path.filter((p) => p !== 'dark');
                    const bPath = b.token.path.filter((p) => p !== 'dark');
                    const aLast = aPath[aPath.length - 1] ?? a.token.name ?? 'unknown';
                    const bLast = bPath[bPath.length - 1] ?? b.token.name ?? 'unknown';
                    return aLast.localeCompare(bLast);
                });

            sortedTokens.forEach(({ token, light, dark }) => {
                const path = token.path.filter((p) => p !== 'dark');
                const lastSegment = path[path.length - 1] ?? token.name ?? 'unknown';
                const propName = toKotlinPropertyName([lastSegment]);
                const isColor = token.type === 'color' || token.attributes?.category === 'color';
                const isDimension = token.type === 'dimension' || token.type === 'fontSize' || token.attributes?.category === 'size';

                if (token.comment) {
                    result += `${indent}    /** ${sanitizeKotlinDocComment(token.comment)} */\n`;
                }

                if (isColor) {
                    if (light && dark) {
                        // Dynamic color based on theme
                        result += `${indent}    val ${propName}: Color\n`;
                        result += `${indent}        @Composable get() = if (isSystemInDarkTheme()) "${escapeKotlinStringLiteral(dark.value)}".toColor() else "${escapeKotlinStringLiteral(light.value)}".toColor()\n`;
                    } else {
                        // Static color
                        result += `${indent}    val ${propName}: Color = "${escapeKotlinStringLiteral(token.value)}".toColor()\n`;
                    }
                } else if (isDimension) {
                    const numValue = parseFloat(token.value);
                    if (token.type === 'fontSize') {
                        const spValue = Number.isNaN(numValue) ? token.value : `${numValue}.sp`;
                        result += `${indent}    val ${propName} = ${spValue}\n`;
                    } else {
                        const dpValue = Number.isNaN(numValue) ? token.value : `${numValue}.dp`;
                        result += `${indent}    val ${propName} = ${dpValue}\n`;
                    }
                } else {
                    // Generic value
                    result += `${indent}    val ${propName} = ${JSON.stringify(token.value)}\n`;
                }
            });

            result += `${indent}}\n`;
            return result;
        }

        output += generateNestedObject(nestedRoot, className, '');

        return output;
    },
} satisfies Format;

/**
 * Android XML resources format for dimensions
 * Correctly handles fontSize (sp) vs dimension (dp) tokens
 */
export const androidDimens = {
    name: 'android/dimens',
    format: async ({ dictionary, file, platform }) => {
        const header = await fileHeader({ file, commentStyle: commentStyles.long });
        const prefix = platform.prefix || 'xpl';

        let output = header;
        output += '<?xml version="1.0" encoding="UTF-8"?>\n';
        output += '<resources>\n';

        dictionary.allTokens.forEach((token) => {
            if (token.path.length === 0) return;

            const name = toAndroidResourceName(token.path, prefix);

            if (token.comment) {
                output += `  <!-- ${sanitizeXmlComment(token.comment)} -->\n`;
            }

            // fontWeight should be a string, not a dimen
            if (token.type === 'fontWeight') {
                output += `  <string name="${name}">${token.value}</string>\n`;
            } else if (token.type === 'fontSize') {
                // Font sizes use sp (scale-independent pixels) for accessibility
                const numValue = parseFloat(token.value);
                const spValue = Number.isNaN(numValue) ? token.value : `${numValue.toFixed(2)}sp`;
                output += `  <dimen name="${name}">${spValue}</dimen>\n`;
            } else {
                // Dimensions use dp (density-independent pixels)
                const numValue = parseFloat(token.value);
                const dpValue = Number.isNaN(numValue) ? token.value : `${numValue.toFixed(2)}dp`;
                output += `  <dimen name="${name}">${dpValue}</dimen>\n`;
            }
        });

        output += '</resources>\n';
        return output;
    },
} satisfies Format;
