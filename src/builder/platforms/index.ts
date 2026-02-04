import { Config } from 'style-dictionary/types';
import type { PlatformsConfig } from '../globals';
import web from './web';
import android from './android';
import debug from './debug';
import ios from './ios';

export default function buildPlatformsConfig(config: PlatformsConfig): Config['platforms'] {
    return {
        android: android(config),
        ios: ios(config),
        ...web(config),
        debug: debug(config),
    };
}
