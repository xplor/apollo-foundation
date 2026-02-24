import type { PlatformConfig } from 'style-dictionary/types';
import type { PlatformsConfig } from '../globals';

export default function debug({ brand, buildPath }: PlatformsConfig): PlatformConfig {
    return {
        buildPath: `${buildPath}/${brand}/debug/`,
        files: [
            {
                destination: 'tokens.json',
                format: 'json/debug',
            },
        ],
    };
}
