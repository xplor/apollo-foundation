import type { Parser } from 'style-dictionary/types';

export const darkMode: Parser = {
    name: 'dark-mode-nest',
    pattern: /\.json$/,
    parser: ({ contents, filePath }) => {
        const tokens = JSON.parse(contents);

        // If the file path contains '/dark/', nest the tokens under a 'dark' key
        return filePath?.includes('/dark/')
            ? { dark: tokens }
            : tokens;
    },
};
