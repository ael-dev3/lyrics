import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {identityPaths} from '../src/identity.ts';
import type {PreviewIdentity} from '../src/identity.ts';
import {parseData,object,str} from '../src/schema.ts';
import {checkProductionReview} from '../src/production-gate.ts';
export const productionPaths=[...identityPaths,'src/Still.tsx','src/Film.tsx','src/production-gate.ts','scripts/production-contract.ts','scripts/production-gate.ts','scripts/render.ts'] as const;
export const inputHashes=()=>Object.fromEntries(productionPaths.map(path=>[path,createHash('sha256').update(readFileSync(path)).digest('hex')]));
export function assertProductionGate(){
 const read=(p:string)=>JSON.parse(readFileSync(p,'utf8')) as unknown;
 const identity=read('evidence/preview-identity.json') as PreviewIdentity,current=inputHashes(),authorization=object(read('evidence/render-authorization.json'));
 if(authorization.song!==identity.song||authorization.previewRevision!==identity.revision||authorization.fullRenderAuthorized!==true)throw Error('Missing current-song production authorization');
 str(authorization.evidenceBasis);
 const hashes=object(authorization.productionHashes);for(const [path,hash] of Object.entries(current))if(hashes[path]!==hash)throw Error('Changed production input: '+path);
 const data=parseData(read('src/cues.json'));
 checkProductionReview(read('evidence/sync-review.json'),identity,current,data.cues.map(c=>c.id),authorization);
 return {identity,current};
}
