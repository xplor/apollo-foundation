import type { Format } from 'style-dictionary/types';
import { genFormatter } from 'src/builder/utils/gen-formatter';

/**
 * SCSS Variables format with class-based dark mode (.dark selector)
 */
export const scssVariablesClassMode = {
    name: 'scss/variables-class-mode',
    format: genFormatter({
        darkFormatting: { indentation: '  ' },
        darkWrapPrefix: '.dark {\n',
        darkWrapSuffix: '\n}',
        format: 'sass',
        lightWrapPrefix: '',
        lightWrapSuffix: '\n\n',
    }),
} satisfies Format;

/**
 * sass Variables format with media query dark mode (@media prefers-color-scheme)
 */
export const scssVariablesMediaMode = {
    name: 'scss/variables-media-mode',
    format: genFormatter({
        darkFormatting: { indentation: '    ' },
        darkWrapPrefix: '@media (prefers-color-scheme: dark) {\n  :root {\n',
        darkWrapSuffix: '\n  }\n}\n',
        format: 'sass',
        lightFormatting: { indentation: '  ' },
        lightWrapPrefix: '',
        lightWrapSuffix: '\n\n',
    }),
} satisfies Format;
