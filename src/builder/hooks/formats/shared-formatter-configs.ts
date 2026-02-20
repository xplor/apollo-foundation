import type { FormattingOptions } from 'style-dictionary/types';

type FormatterConfig = {
    darkFormatting?: FormattingOptions;
    darkWrapPrefix: string;
    darkWrapSuffix: string;
    format: 'css' | 'sass';
    lightFormatting?: FormattingOptions;
    lightWrapPrefix: string;
    lightWrapSuffix: string;
};

export const classModeConfig: FormatterConfig = {
    darkFormatting: { indentation: '  ' },
    darkWrapPrefix: '.dark {\n',
    darkWrapSuffix: '\n}',
    format: 'css',
    lightFormatting: { indentation: '  ' },
    lightWrapPrefix: ':root {\n',
    lightWrapSuffix: '\n}\n\n',
};

export const mediaModeConfig: FormatterConfig = {
    darkFormatting: { indentation: '    ' },
    darkWrapPrefix: '@media (prefers-color-scheme: dark) {\n  :root {\n',
    darkWrapSuffix: '\n  }\n}\n',
    format: 'css',
    lightFormatting: { indentation: '  ' },
    lightWrapPrefix: ':root {\n',
    lightWrapSuffix: '\n}\n\n',
};
