import type { Dictionary, TransformedToken } from 'style-dictionary/types';

function genDefaultTokenMap(allTokens: TransformedToken[]) {
    return new Map(allTokens.map((t) => [t.name, t]));
}

export function makeTestDict(
    allTokens: TransformedToken[],
    tokens = {},
    additionalOpts = {},
): Dictionary {
    const tokenMap = genDefaultTokenMap(allTokens);

    return {
        allTokens,
        tokens,
        tokenMap,
        ...additionalOpts,
    };
}
