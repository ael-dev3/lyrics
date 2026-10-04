import {checkCurrentProductionGate} from './render-gate.ts';
checkCurrentProductionGate();
throw Error('Production export is a later approved stage. Prepare and verify the encoder against this exact preview before full capture.');
