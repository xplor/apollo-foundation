import {
    androidResourcesWithModes,
    androidResourcesLight,
    androidResourcesDark,
    androidKotlinTheme,
    androidDimens,
} from './android';
import { cssVariablesClassMode, cssVariablesMediaMode } from './css';
import { debug } from './debug';
import { javascriptUmdWithModes, typescriptDeclarations } from './js';
import { iosSwiftEnumWithModes, iosSwiftEnumWithModesLegacy } from './ios';
import { scssVariablesClassMode, scssVariablesMediaMode } from './scss';

export default [
    androidDimens,
    androidKotlinTheme,
    androidResourcesDark,
    androidResourcesLight,
    androidResourcesWithModes,
    cssVariablesClassMode,
    cssVariablesMediaMode,
    debug,
    iosSwiftEnumWithModes,
    iosSwiftEnumWithModesLegacy,
    javascriptUmdWithModes,
    scssVariablesClassMode,
    scssVariablesMediaMode,
    typescriptDeclarations,
];
