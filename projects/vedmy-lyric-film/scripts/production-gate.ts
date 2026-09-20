import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {checkGate} from '../src/production-gate.ts';
import {parseData} from '../src/schema.ts';
import {identityPaths} from '../src/identity.ts';
const read=(p:string):unknown=>JSON.parse(readFileSync(p,'utf8'));
export function assertProductionGate(){return checkGate(read('evidence/cross-language-sync-review.json'),read('evidence/preview-identity.json'),Object.fromEntries(identityPaths.map(p=>[p,createHash('sha256').update(readFileSync(p)).digest('hex')])),parseData(read('src/cues.json')).cues.map(c=>c.id));}
assertProductionGate();
