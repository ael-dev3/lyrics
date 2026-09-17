import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {identityPaths} from '../src/identity.ts';
import type {PreviewIdentity} from '../src/identity.ts';
import {checkProductionReview} from '../src/production-gate.ts';
import {parseData} from '../src/schema.ts';
try{
 const identity=JSON.parse(readFileSync('evidence/preview-identity.json','utf8')) as PreviewIdentity;
 const current=Object.fromEntries(identityPaths.map(p=>[p,createHash('sha256').update(readFileSync(p)).digest('hex')]));
 const data=parseData(JSON.parse(readFileSync('src/cues.json','utf8')));
 checkProductionReview(JSON.parse(readFileSync('evidence/sync-review.json','utf8')),identity,current,data.cues.map(c=>c.id));
 console.log('Synchronization and approval checks passed. Production renderer is not installed in this preview-only revision.');
}catch(e){console.error('PRODUCTION BLOCKED: '+(e instanceof Error?e.message:String(e)));process.exitCode=1;}
