import {readFileSync} from 'node:fs';import {createHash} from 'node:crypto';import {identityPaths} from '../src/identity.ts';import {checkGate} from '../src/production-gate.ts';import {parseData} from '../src/schema.ts';
const json=(p:string):unknown=>JSON.parse(readFileSync(p,'utf8'));
const data=parseData(json('src/cues.json'));
checkGate(json('evidence/sync-review.json'),json('evidence/preview-identity.json'),Object.fromEntries(identityPaths.map(p=>[p,createHash('sha256').update(readFileSync(p)).digest('hex')])),data.cues.map(c=>c.id));
console.log('Review and authorization gate passed; no production capture is implemented in this preview edition.');
