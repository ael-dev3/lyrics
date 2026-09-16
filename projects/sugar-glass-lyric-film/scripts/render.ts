import {assertProductionGate} from './sync-gate.ts';
// Must fail before any capture, output-directory creation or encoder invocation.
assertProductionGate();
throw Error('This preview-only edition contains no production encoder. Add the reviewed production adapter only after explicit authorization.');
