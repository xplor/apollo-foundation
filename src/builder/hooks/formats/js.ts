import type { Format, TransformedToken } from 'style-dictionary/types';
import { fileHeader } from 'style-dictionary/utils';
import { commentStyles } from 'style-dictionary/enums';

interface TokenLike {
    comment?: string;
    deprecated?: boolean | string;
    deprecated_comment?: string;
    value?: unknown;
    $value?: unknown;
    type?: string;
}

/**
 * Helper to generate JSDoc comment for a token
 */
function generateJsDoc(token: TokenLike): string {
    const lines = [];

    if (token.comment) lines.push(token.comment);

    if (token.deprecated) {
        let depLine = '@deprecated';
        if (token.deprecated_comment) {
            depLine += ` ${token.deprecated_comment}`;
        }
        lines.push(depLine);
    }

    switch (lines.length) {
        case 0:
            return '';
        case 1:
            return `/** ${lines[0]} */\n`;
        default:
            return `/**\n${lines.map((line) => ` * ${line}`).join('\n')}\n */\n`;
    }
}

/**
 * Helper to stringify nested tokens with JSDoc
 */
function stringifyNested(obj: Record<string, unknown>, indent: string = ''): string {
    const nextIndent = `${indent}  `;

    // Check if it's a token
    if ('value' in obj || '$value' in obj) {
        return JSON.stringify(obj, null, 2).replace(/\n/g, `\n${indent}`);
    }

    // Otherwise it's a nesting level
    const entries = Object.entries(obj);
    if (entries.length === 0) return '{}';

    const parts = entries.map(([key, value]) => {
        const isToken = value !== null && typeof value === 'object'
            && ('value' in value || '$value' in value);
        const jsDoc = isToken ? generateJsDoc(value as TokenLike) : '';
        const indentedJsDoc = jsDoc ? `${jsDoc.split('\n')
            .filter((l) => l.length > 0)
            .map((l) => `${nextIndent}${l}`)
            .join('\n')}\n` : '';

        return `${indentedJsDoc}${nextIndent}${JSON.stringify(key)}: ${stringifyNested(value as Record<string, unknown>, nextIndent)}`;
    });

    return `{\n${parts.join(',\n')}\n${indent}}`;
}

/**
 * Helper to build nested token structure with mode support
 * For tokens with both light/dark modes, creates { value: { light: value, dark: value }, ... }
 */
function buildTokenTreeWithModes(tokens: TransformedToken[]): Record<string, unknown> {
    const tree: Record<string, unknown> = {};
    type PathEntry = { path: string[], light?: TransformedToken, dark?: TransformedToken };
    const tokensByPath = new Map<string, PathEntry>();

    // First, organize tokens by canonical path (removing the mode 'dark' segment)
    // The dark-mode convention places 'dark' at the penultimate path position:
    //   light: ['color', 'primary']
    //   dark:  ['color', 'dark', 'primary']
    // We only recognize the segment as a mode marker when it sits at index (length - 2),
    // so a token whose path ends in 'dark' (e.g. ['color', 'dark']) or has 'dark' deeper
    // in the hierarchy is left untouched rather than being silently merged/discarded.
    tokens.forEach((token) => {
        const darkIdx = token.path.length - 2;
        const isDark = darkIdx >= 0 && token.path[darkIdx] === 'dark';
        // Remove only the specific penultimate 'dark' segment, not all occurrences
        const canonicalPath = isDark
            ? [...token.path.slice(0, darkIdx), ...token.path.slice(darkIdx + 1)]
            : token.path;
        // Use JSON.stringify as the Map key to avoid lossy join/split round-trips
        // when path segments contain literal dots (e.g. '1.5rem', '2.5xl')
        const pathKey = JSON.stringify(canonicalPath);

        const entry = tokensByPath.get(pathKey) || { path: canonicalPath };
        if (isDark) {
            entry.dark = token;
        } else {
            entry.light = token;
        }
        tokensByPath.set(pathKey, entry);
    });

    // Build the tree structure
    tokensByPath.forEach(({ path, ...entries }) => {
        let current: Record<string, unknown> = tree;

        // Navigate to the correct nesting level
        for (let i = 0; i < path.length - 1; i += 1) {
            if (!current[path[i]]) {
                current[path[i]] = {};
            }
            current = current[path[i]] as Record<string, unknown>;
        }

        const key = path[path.length - 1];

        // Merge logic
        if (entries.light && entries.dark) {
            // Both modes exist - create combined token
            current[key] = {
                ...entries.light,
                value: {
                    light: entries.light.value,
                    dark: entries.dark.value,
                },
            };
        } else if (entries.light) {
            // Only light (or default)
            current[key] = entries.light;
        } else if (entries.dark) {
            // Only dark - treat as dark-specific
            current[key] = {
                ...entries.dark,
                value: {
                    dark: entries.dark.value,
                },
            };
        }
    });

    return tree;
}

/**
 * JavaScript UMD format with nested light/dark mode support
 */
export const javascriptUmdWithModes = {
    name: 'javascript/umd-with-modes',
    format: async ({ dictionary, file }) => {
        const header = await fileHeader({ file, commentStyle: commentStyles.long });

        // We always try to build the tree with modes if using this format
        // This handles merging dark/light tokens based on path
        const tokens = buildTokenTreeWithModes(dictionary.allTokens);
        const tokensString = stringifyNested(tokens);

        return `${header}(function (root, factory) {
    if (typeof module === "object" && module.exports) {
        module.exports = factory();
    } else if (typeof exports === "object") {
        exports["_styleDictionary"] = factory();
    } else if (typeof define === "function" && define.amd) {
        define([], factory);
    } else {
        root["_styleDictionary"] = factory();
    }
})(this, function () {
    return ${tokensString};
});
`;
    },
} satisfies Format;

/**
 * Helper to generate TypeScript type for a value.
 *
 * Handles primitives, the synthetic { light, dark } mode shape (members are
 * resolved recursively), arrays, and generic composite objects so that the
 * emitted .d.ts accurately reflects the runtime token value shape.
 */
function getTsType(value: unknown): string {
    if (value === null) return 'null';

    switch (typeof value) {
        case 'string': return 'string';
        case 'number': return 'number';
        case 'boolean': return 'boolean';
        case 'object': {
            if (Array.isArray(value)) {
                if (value.length === 0) return 'unknown[]';
                return `${getTsType(value[0])}[]`;
            }

            const obj = value as Record<string, unknown>;
            const hasLight = 'light' in obj;
            const hasDark = 'dark' in obj;

            // Synthetic mode shape produced by buildTokenTreeWithModes
            if (hasLight || hasDark) {
                const parts = [
                    hasLight ? `light: ${getTsType(obj.light)}` : null,
                    hasDark ? `dark: ${getTsType(obj.dark)}` : null,
                ].filter((p): p is string => p !== null);
                return `{ ${parts.join('; ')} }`;
            }

            // Generic composite token value (e.g. shadow, typography)
            const entries = Object.entries(obj);
            if (entries.length === 0) return 'Record<string, never>';
            const parts = entries.map(([k, v]) => `${JSON.stringify(k)}: ${getTsType(v)}`);
            return `{ ${parts.join('; ')} }`;
        }
        default:
            return 'unknown';
    }
}

/**
 * Helper to build TypeScript declaration from nested structure
 */
function buildTypeDeclaration(obj: Record<string, unknown>, indent: string = ''): string {
    const nextIndent = `${indent}  `;
    const lines: string[] = [];

    for (const [key, value] of Object.entries(obj)) {
        const safeKey = /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(key) ? key : JSON.stringify(key);

        // Check if this is a token (has value property)
        const isToken = value !== null && typeof value === 'object'
            && ('value' in value || '$value' in value);

        if (isToken) {
            const token = value as TokenLike;
            const valueType = getTsType(token.value);

            // Add JSDoc comment if available
            if (token.comment || token.deprecated) {
                lines.push(`${nextIndent}/**`);
                if (token.comment) {
                    lines.push(`${nextIndent} * ${token.comment}`);
                }
                if (token.deprecated) {
                    const depMsg = token.deprecated_comment || '';
                    lines.push(`${nextIndent} * @deprecated ${depMsg}`);
                }
                lines.push(`${nextIndent} */`);
            }

            lines.push(`${nextIndent}readonly ${safeKey}: {`);
            lines.push(`${nextIndent}  readonly value: ${valueType};`);
            if (token.type) {
                lines.push(`${nextIndent}  readonly type: ${JSON.stringify(token.type)};`);
            }
            lines.push(`${nextIndent}};`);
        } else if (value !== null && typeof value === 'object') {
            // Nested namespace
            lines.push(`${nextIndent}readonly ${safeKey}: {`);
            lines.push(buildTypeDeclaration(value as Record<string, unknown>, nextIndent));
            lines.push(`${nextIndent}};`);
        }
    }

    return lines.join('\n');
}

/**
 * TypeScript declaration file format for UMD modules
 */
export const typescriptDeclarations = {
    name: 'typescript/declarations',
    format: async ({ dictionary, file }) => {
        const header = await fileHeader({ file, commentStyle: commentStyles.long });

        const tokens = buildTokenTreeWithModes(dictionary.allTokens);
        const typeDeclaration = buildTypeDeclaration(tokens);

        return `${header}
declare const _styleDictionary: {
${typeDeclaration}
};

export = _styleDictionary;
export as namespace StyleDictionary;
`;
    },
} satisfies Format;
