import type { Format } from 'style-dictionary/types';
import { genFormatter } from 'src/builder/utils/gen-formatter';
import { classModeConfig, mediaModeConfig } from './shared-formatter-configs';

/**
 * CSS Variables format with class-based dark mode (.dark selector)
 */
export const cssVariablesClassMode = {
    name: 'css/variables-class-mode',
    format: genFormatter(classModeConfig),
} satisfies Format;

/**
 * CSS Variables format with media query dark mode (@media prefers-color-scheme)
 */
export const cssVariablesMediaMode = {
    name: 'css/variables-media-mode',
    format: genFormatter(mediaModeConfig),
} satisfies Format;
