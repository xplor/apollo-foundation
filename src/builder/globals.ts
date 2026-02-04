import type {
    Dictionary,
    TransformedToken,
    Config,
    LocalOptions,
    File,
} from 'style-dictionary/types';
import type { ModeConfig } from './utils/mode-detection';

export interface PlatformsConfig {
    brand: string;
    buildPath: string;
    modeConfig?: ModeConfig;
}

export interface TemplatesConfig {
    allTokens: TransformedToken[],
    dictionary: Dictionary;
    options: Config & LocalOptions;
    file: File;
    header: string;
}

export const prefix = 'xpl';
