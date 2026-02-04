import type { Format, FormatFn, TransformedToken } from 'style-dictionary/types';
import { genFormatter } from 'src/builder/utils/gen-formater';

/**
 * CSS Variables format with class-based dark mode (.dark selector)
 */
export const cssVariablesClassMode = {
    name: 'css/variables-class-mode',
    format: genFormatter({
        darkWrapPrefix: '.dark {\n',
        darkWrapSuffix: '\n}',
        format: 'css',
        lightFormatting: { indentation: '  ' },
        lightWrapPrefix: ':root {\n',
        lightWrapSuffix: '\n}\n\n',
    }),
} satisfies Format;

/**
 * CSS Variables format with media query dark mode (@media prefers-color-scheme)
 */
export const cssVariablesMediaMode = {
    name: 'css/variables-media-mode',
    format: genFormatter({
        darkFormatting: { indentation: '    ' },
        darkWrapPrefix: '@media (prefers-color-scheme: dark) {\n  :root {\n',
        darkWrapSuffix: '\n  }\n}\n',
        format: 'css',
        lightWrapPrefix: ':root {\n',
        lightWrapSuffix: '\n}\n\n',
    }),
} satisfies Format;
