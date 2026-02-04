import type { Transform } from 'style-dictionary/types';

/**
 * Transforms dimension values to CGFloat format for iOS/Swift.
 * Does NOT scale the value (assumes source is already in pixels/points).
 *
 * Example: 16 -> CGFloat(16.00)
 */
export const sizeCGFloat = {
    name: 'size/pxToCGFloat',
    type: 'value',
    filter: (token) => token.type === 'dimension' || token.type === 'fontSize',
    transform: ({ value }) => {
        const numValue = parseFloat(value);
        if (isNaN(numValue)) return value;
        return `CGFloat(${numValue.toFixed(2)})`;
    }
} satisfies Transform;
