import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {identityPaths,song,revision} from '../src/identity.ts';
import {parseData,object,str} from '../src/schema.ts';
import {checkGate} from '../src/production-gate.ts';
export const productionPaths=[...identityPaths,'src/Film.tsx','src/production-gate.ts','scripts/production-contract.ts','scripts/production-gate.ts','scripts/render.ts','evidence/final-sync-audit.json','evidence/production-adapter-equivalence.json','src/raster-inventory.ts','src/RasterCache.tsx','scripts/raster-cache.ts','scripts/raster-compose.ts','scripts/raster-contract.ts','scripts/render-raster.ts','scripts/raster-proof.ts','scripts/adopt-raster.ts','evidence/raster-adoption.json','evidence/celestial-audit.json'] as const;
export const inputHashes=()=>Object.fromEntries(productionPaths.map(path=>[path,createHash('sha256').update(readFileSync(path)).digest('hex')]));
export function assertProductionGate(){
 const read=(p:string):unknown=>JSON.parse(readFileSync(p,'utf8'));
 const identity=object(read('evidence/preview-identity.json')),current=inputHashes(),authorization=object(read('evidence/render-authorization.json'));
 if(identity.song!==song||identity.revision!==revision||authorization.song!==song||authorization.previewRevision!==revision||authorization.fullRenderAuthorized!==true)throw Error('Missing current-song production authorization');
 str(authorization.evidenceBasis);
 const hashes=object(authorization.productionHashes);for(const [path,hash] of Object.entries(current))if(hashes[path]!==hash)throw Error('Changed production input: '+path);
 const audit=object(read('evidence/final-sync-audit.json')),adapter=object(read('evidence/production-adapter-equivalence.json'));if(audit.revision!==revision||audit.status!=='passed technical and editorial audit'||adapter.status!=='PASS')throw Error('Required pre-render audit missing');
 const celestial=object(read('evidence/celestial-audit.json'));if(celestial.revision!==revision||celestial.status!=='PASS')throw Error('Current celestial audit required');
 const data=parseData(read('src/cues.json'));
 checkGate(read('evidence/sync-review.json'),identity,current,data.cues.map(c=>c.id),authorization);
 return {identity,current};
}
