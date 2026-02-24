import type { Format, FormatFnArguments } from 'style-dictionary/types';
import { genFormatter } from 'src/builder/utils/gen-formatter';
import { LEGACY_ALIASES } from 'src/builder/utils/legacy-aliases';
import { classModeConfig, mediaModeConfig } from './shared-formatter-configs';

/**
 * Appends globally-scoped SCSS variable aliases for each non-dark token.
 * Each alias compiles to a var() call, so the variable is globally accessible
 * while the underlying CSS custom property handles dark mode switching at runtime.
 *
 * Example output:
 *   $xpl-color-background-primary: var(--xpl-color-background-primary);
 */
function generateScssAliases({ dictionary }: FormatFnArguments): string {
    const lightTokens = dictionary.allTokens.filter((t) => !t.path.includes('dark'));
    const lines = lightTokens.map((t) => `$${t.name}: var(--${t.name});`);

    // Keep legacy SCSS aliases aligned with CSS aliases for compatibility.
    LEGACY_ALIASES.forEach(({ legacy }) => {
        lines.push(`$${legacy}: var(--${legacy});`);
    });

    if (lines.length === 0) return '';
    return `\n${lines.join('\n')}\n`;
}

const classModeFormatter = genFormatter(classModeConfig);
const mediaModeFormatter = genFormatter(mediaModeConfig);

/**
 * SCSS file format with class-based dark mode (.dark selector).
 *
 * Outputs CSS custom properties in :root and .dark blocks (for runtime dark mode
 * switching), followed by globally-scoped $xpl-* SCSS variable aliases that each
 * compile to var(--xpl-*). This gives consumers the ergonomics of $-variables
 * without the scoping issue that comes from declaring them inside a selector block.
 */
export const scssVariablesClassMode = {
    name: 'scss/variables-class-mode',
    format: async (args: FormatFnArguments) => {
        const cssBlocks = await classModeFormatter(args);
        const scssAliases = generateScssAliases(args);
        return `${cssBlocks}${scssAliases}`;
    },
} satisfies Format;

/**
 * SCSS file format with media-query dark mode (@media prefers-color-scheme: dark).
 *
 * Same approach as scssVariablesClassMode but uses prefers-color-scheme instead
 * of the .dark class for dark mode detection.
 */
export const scssVariablesMediaMode = {
    name: 'scss/variables-media-mode',
    format: async (args: FormatFnArguments) => {
        const cssBlocks = await mediaModeFormatter(args);
        const scssAliases = generateScssAliases(args);
        return `${cssBlocks}${scssAliases}`;
    },
} satisfies Format;
