// Refuse incomplete/stale review before importing or starting the production pipeline.
import {readFileSync} from 'node:fs';
import {currentIdentity} from './identity.ts';
import {assertProductionReady} from '../src/gate.ts';
const status=JSON.parse(readFileSync('evidence/production-status.json','utf8'));
assertProductionReady(status.review,status.authorization,currentIdentity().identity);
await import('./render-production.ts');
