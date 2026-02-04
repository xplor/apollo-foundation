import type { Hooks } from 'style-dictionary/types';
import Formats from './formats';
import Transforms from './transforms';
import Parser from './parser';

const transforms = Transforms.reduce((acc, { name, ...props }) => ({ ...acc, [name]: { ...props }}), {});
const formats = Formats.reduce((acc, { name, format }) => ({ ...acc, [name]: format }), {});
const parsers = Parser.reduce((acc, { name, ...props }) => ({ ...acc, [name]: props }), {});

export default { formats, parsers, transforms } satisfies Hooks;
