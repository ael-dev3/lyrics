import alignmentJson from '../../alignment/tanisea-word-alignment-v3.json';
import type {AlignmentManifest} from './alignment-types.js';
import {validateAlignmentManifest} from './validate-alignment';

const loadedAlignment: unknown = alignmentJson;
validateAlignmentManifest(loadedAlignment);

export const taniseaAlignment: AlignmentManifest = loadedAlignment;
