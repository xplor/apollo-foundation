import type { Format, FormatFn } from 'style-dictionary/types';

// Create the format function with the nested property
// This allows you to see exactly what attributes and paths
// your tokens have after preprocessors/parsers run
const formatFn: FormatFn = ({ dictionary }) => JSON.stringify(dictionary.tokens, null, 2);

// Mark as nested to avoid name collision warnings
// (this format outputs the raw nested token tree, not flattened tokens)
formatFn.nested = true;

// Register a format that exports the raw dictionary for inspection
export const debug = {
    name: 'json/debug',
    format: formatFn,
} satisfies Format;
