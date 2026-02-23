import type { FormatFn, FormattingOptions, TransformedToken } from 'style-dictionary/types';
import { formattedVariables } from 'style-dictionary/utils';

/**
 * Generates backwards-compatible alias declarations for legacy token names.
 * Returns a string of alias variable declarations.
 */
function generateLegacyAliases(format: 'css' | 'sass', indentation: string = '  '): string {
    // Map of legacy name -> new name (reference)
    const legacyAliases: Array<{ legacy: string; current: string; comment?: string }> = [
        {
            legacy: 'xpl-color-transparent',
            current: 'xpl-color-transparent-0',
            comment: 'Backwards-compatible alias. Use --xpl-color-transparent-0 instead.',
        },
    ];

    if (legacyAliases.length === 0) return '';

    const lines = legacyAliases.map(({ legacy, current, comment }) => {
        if (format === 'css') {
            const commentStr = comment ? ` /** ${comment} */` : '';
            return `${indentation}--${legacy}: var(--${current});${commentStr}`;
        }
        // SCSS format
        const commentStr = comment ? ` // ${comment}` : '';
        return `${indentation}$${legacy}: $${current};${commentStr}`;
    });

    return `\n${lines.join('\n')}`;
}

export function genFormatter({
    darkFormatting,
    darkWrapPrefix,
    darkWrapSuffix,
    format,
    lightFormatting,
    lightWrapPrefix,
    lightWrapSuffix,
}: {
    darkFormatting?: FormattingOptions,
    darkWrapPrefix: string,
    darkWrapSuffix: string,
    format: 'css' | 'sass',
    lightFormatting?: FormattingOptions,
    lightWrapPrefix: string,
    lightWrapSuffix: string,
}): FormatFn {
    return async ({ dictionary, options }) => {
        const { outputReferences } = options;
        const lightTokens = dictionary.allTokens.filter((t) => !t.path.includes('dark'));
        const lightTokensStr = formattedVariables({
            format,
            dictionary: { ...dictionary, allTokens: lightTokens },
            outputReferences,
            formatting: lightFormatting,
        });

        // Generate legacy aliases for backwards compatibility
        const legacyAliasesStr = generateLegacyAliases(format, lightFormatting?.indentation);

        // 2. Get tokens that ARE under the 'dark' namespace
        const darkTokens = dictionary.allTokens.filter((t) => t.path.includes('dark'));
        const darkTokensStr = formattedVariables({
            format,
            dictionary: {
                ...dictionary,
                allTokens: darkTokens.map(({
                    key = '',
                    original: { key: oKey = '', value: oVal, ...oRest },
                    name,
                    attributes = {},
                    path,
                    ...rest
                }): TransformedToken => {
                    const {
                        type: aType,
                        item: aItem,
                        subitem: aSubitem,
                    } = attributes as {
                        category?: string; type?: string; item?: string; subitem?: string
                    };

                    return {
                        key: key.replace('dark.', ''),
                        original: {
                            value: oVal.replace('dark.', ''),
                            key: oKey.replace('dark.', ''),
                            ...oRest,
                        },
                        name: name.replace('-dark', ''),
                        attributes: {
                            category: aType,
                            type: aItem,
                            item: aSubitem,
                        },
                        path: path.filter((seg) => seg !== 'dark'),
                        ...rest,
                    } as TransformedToken;
                }),
            },
            outputReferences,
            formatting: darkFormatting,
        });

        const lightModeCSS = `${lightWrapPrefix}${lightTokensStr}${legacyAliasesStr}${lightWrapSuffix}`;
        const darkModeCSS = `${darkWrapPrefix}${darkTokensStr}${darkWrapSuffix}`;

        return `${lightModeCSS}${darkModeCSS}`;
    };
}
