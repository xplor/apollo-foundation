import StyleDictionary from 'style-dictionary';
import path from 'path';
import { readdir } from 'fs/promises';
import { Config } from 'style-dictionary/types';
import {
    logWarningLevels,
    logVerbosityLevels,
    logBrokenReferenceLevels,
} from 'style-dictionary/enums';
import hooks from './hooks/index';
import buildPlatformsConfig from './platforms/index';
import { PlatformsConfig } from './globals';
import { detectColorModes } from './utils/mode-detection';

const __dirname = import.meta.dirname;
const fullPath = path.join(__dirname, '../../');
const __rootDir = fullPath.substring(0, fullPath.length - 1);
const tokensDir = `${__rootDir}/src/tokens`;
const isDebug = process.argv.find((arg) => arg === '--debug');

async function getSDConfig(brand: PlatformsConfig['brand'], platform: string): Promise<Config> {
    const modeConfig = await detectColorModes(brand, tokensDir);
    const include = [
        'global/**/*.json',
        `platforms/${platform}/**/*.{ts,json}`,
    ].reduce<string[]>((acc, glob) => ([...acc, `${tokensDir}/${glob}`]), []);

    const source = [
        `brands/${brand}/**/*.json`,
    ].reduce<string[]>((acc, glob) => ([...acc, `${tokensDir}/${glob}`]), []);

    return {
        include,
        source,
        hooks,
        platforms: buildPlatformsConfig({
            brand,
            buildPath: `${__rootDir}/build`,
            modeConfig,
        }),
        log: {
            warnings: logWarningLevels.error,
            verbosity: logVerbosityLevels.verbose,
            errors: {
                brokenReferences: logBrokenReferenceLevels.console,
            },
        },
    };
}

async function generateBrandDictionaries() {
    const brandsDir = await readdir(
        path.resolve(`${__rootDir}/src/tokens/brands`),
        { withFileTypes: true },
    );
    const brands = brandsDir
        .filter((dir) => dir.isDirectory())
        .map((dir) => dir.name);
    const platformsDir = await readdir(
        path.resolve(`${__rootDir}/src/tokens/platforms`),
        { withFileTypes: true },
    );
    const platforms = platformsDir
        .filter((dir) => dir.isDirectory())
        .map(({ name }) => (!isDebug && name === 'debug' ? false : name))
        .filter(Boolean) as string[];

    // eslint-disable-next-line no-console
    console.log('🔁 Building tokens...');

    for (const brand of brands) {
        for (const platform of platforms) {
            const config = await getSDConfig(brand, platform);
            const sd = new StyleDictionary(config);
            await sd.buildPlatform(platform);
        }
    }

    // eslint-disable-next-line no-console
    console.log('✅ Tokens Successfully Built!');
}

await generateBrandDictionaries();
