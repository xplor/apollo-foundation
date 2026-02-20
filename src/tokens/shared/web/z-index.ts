const zIndexArr = [100, 200, 300, 400, 500, 600, 700, 800, 900];
const zIndexes = zIndexArr.reduce((acc, zIndex) => ({
    ...acc,
    [`${zIndex}`]: {
        value: zIndex,
        type: 'other',
    },
}), {});

export default {
    'z-index': zIndexes,
};
