import { access, constants } from 'fs/promises';
import path from 'path';

export interface ModeConfig {
    hasModes: boolean;
    lightPath?: string;
    darkPath?: string;
}

// Cache to avoid repeated filesystem checks
const modeCache = new Map<string, ModeConfig>();

/**
 * Detects if a brand supports dark/light color modes by checking for
 * dark/ and light/ subdirectories in the brand's color folder
 */
export async function detectColorModes(brand: string, tokensDir: string): Promise<ModeConfig> {
    const cacheKey = `${brand}:${tokensDir}`;

    // Return cached result if available
    if (modeCache.has(cacheKey)) {
        return modeCache.get(cacheKey)!;
    }

    const colorPath = path.join(tokensDir, 'brands', brand, 'color');
    const lightPath = path.join(colorPath, 'light');
    const darkPath = path.join(colorPath, 'dark');

    try {
        // Check if both light and dark directories exist
        await Promise.all([
            access(lightPath, constants.R_OK),
            access(darkPath, constants.R_OK),
        ]);

        const config: ModeConfig = {
            hasModes: true,
            lightPath: `${brand}/color/light`,
            darkPath: `${brand}/color/dark`,
        };

        modeCache.set(cacheKey, config);
        return config;
    } catch {
        // If either directory doesn't exist, no mode support
        const config: ModeConfig = {
            hasModes: false,
        };

        modeCache.set(cacheKey, config);
        return config;
    }
}

/**
 * Clears the mode detection cache (useful for testing)
 */
export function clearModeCache(): void {
    modeCache.clear();
}
