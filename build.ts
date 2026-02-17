import StyleDictionary from 'style-dictionary';

// Import config (which registers the transform override)
import config from './config.ts';

const sd = new StyleDictionary(config);
sd.buildAllPlatforms();

