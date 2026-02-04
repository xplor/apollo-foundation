import { cssVariablesClassMode, cssVariablesMediaMode } from './css';
import { debug } from './debug';
import { scssVariablesClassMode, scssVariablesMediaMode } from './scss';
import { javascriptUmdWithModes, typescriptDeclarations } from './js';

export default [
    cssVariablesClassMode,
    cssVariablesMediaMode,
    debug,
    scssVariablesClassMode,
    scssVariablesMediaMode,
    javascriptUmdWithModes,
    typescriptDeclarations,
];
