import {
    androidResourcesWithModes,
    androidResourcesLight,
    androidResourcesDark,
    androidKotlinTheme,
    androidDimens,
} from './android';
import { cssVariablesClassMode, cssVariablesMediaMode } from './css';
import { debug } from './debug';
import { scssVariablesClassMode, scssVariablesMediaMode } from './scss';
import { javascriptUmdWithModes, typescriptDeclarations } from './js';

export default [
    androidResourcesWithModes,
    androidResourcesLight,
    androidResourcesDark,
    androidKotlinTheme,
    androidDimens,
    cssVariablesClassMode,
    cssVariablesMediaMode,
    debug,
    scssVariablesClassMode,
    scssVariablesMediaMode,
    javascriptUmdWithModes,
    typescriptDeclarations,
];
