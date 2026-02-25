import type { Transform } from 'style-dictionary/types';

export const hex6 = {
    name: 'color/hex6',
    type: 'value',
    filter: (token) => token.type === 'color',
    transform: ({ value }) => {
        if (typeof value === 'string') {
            const match = value.match(/^#([0-9a-fA-F]{6})([0-9a-fA-F]{2})$/i);

            if (match) {
                const rgbHex = match[1];
                const alpha = Number((parseInt(match[2], 16) / 255).toFixed(2));

                if (alpha === 1) return `#${rgbHex}`;

                const red = parseInt(rgbHex.slice(0, 2), 16);
                const green = parseInt(rgbHex.slice(2, 4), 16);
                const blue = parseInt(rgbHex.slice(4, 6), 16);

                return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
            }
        }

        return value;
    },
} satisfies Transform;
