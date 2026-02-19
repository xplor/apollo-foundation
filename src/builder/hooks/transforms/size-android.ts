import type { Transform, TransformedToken } from 'style-dictionary/types';
import { formatNumericValue } from './utils';

/**
 * Transforms dimension values to dp format for Android.
 * Does NOT scale the value (assumes source is already in pixels).
 *
 * Example: 16 -> 16.00dp
 */
export const sizePxToDp = {
    name: 'size/pxToDp',
    type: 'value',
    filter: (token: TransformedToken) => token.type === 'dimension',
    transform: ({ value }: TransformedToken) =>
        formatNumericValue(value, (n) => `${n.toFixed(2)}dp`),
} satisfies Transform;

/**
 * Transforms fontSize values to sp format for Android.
 * Does NOT scale the value (assumes source is already in pixels).
 *
 * Example: 16 -> 16.00sp
 */
export const sizePxToSp = {
    name: 'size/pxToSp',
    type: 'value',
    filter: (token: TransformedToken) => token.type === 'fontSize',
    transform: ({ value }: TransformedToken) =>
        formatNumericValue(value, (n) => `${n.toFixed(2)}sp`),
} satisfies Transform;
