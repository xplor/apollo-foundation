import type { Transform } from 'style-dictionary/types';

export const hex6 = {
    name: 'color/hex6',
    type: 'value',
    filter: ({ attributes }) => attributes?.category === 'color',
    transform: ({ value }) => {
        // Strip alpha channel if it's an 8-digit hex
        if (value && typeof value === 'string') {
            const match = value.match(/^#([0-9a-fA-F]{6})([0-9a-fA-F]{2})$/i);
            if (match) return `#${match[1]}`; // Return 6-digit hex without alpha
        }

        return value;
    }
} satisfies Transform;
