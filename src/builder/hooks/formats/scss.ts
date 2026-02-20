import type { Format } from 'style-dictionary/types';
import { cssVariablesClassMode, cssVariablesMediaMode } from './css';

/**
 * SCSS file format with CSS custom property dark mode via .dark selector.
 * Uses CSS custom properties (--var) rather than SCSS variables ($var) for dark
 * tokens because $variables are compile-time and lexically scoped — declaring
 * them inside .dark {} would make them inaccessible outside that block.
 */
export const scssVariablesClassMode = {
    name: 'scss/variables-class-mode',
    format: cssVariablesClassMode.format,
} satisfies Format;

/**
 * SCSS file format with CSS custom property dark mode via @media prefers-color-scheme.
 * Uses CSS custom properties (--var) rather than SCSS variables ($var) for dark
 * tokens because $variables are compile-time and lexically scoped — declaring
 * them inside a media block would make them inaccessible outside that block.
 */
export const scssVariablesMediaMode = {
    name: 'scss/variables-media-mode',
    format: cssVariablesMediaMode.format,
} satisfies Format;
