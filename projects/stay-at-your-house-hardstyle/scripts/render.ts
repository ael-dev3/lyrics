// No capture/encoding imports occur before the gate. This preview edition has no
// full-film renderer; an approved production implementation is a separate step.
import {readFileSync} from 'node:fs';
import {currentIdentity} from './identity.ts';
import {assertProductionReady} from '../src/gate.ts';
const status=JSON.parse(readFileSync('evidence/production-status.json','utf8'));
assertProductionReady(status.review,status.authorization,currentIdentity().identity);
throw Error('Preview edition only: full-film renderer has not been commissioned for this revision.');
