import {readFileSync,realpathSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {pathToFileURL} from 'node:url';
import {resolve,sep,isAbsolute} from 'node:path';
import {object,array,str,parseData} from '../src/schema.ts';

export const requiredInputPaths=[
 'public/soundtrack.m4a','public/artwork.png','public/fonts/Oswald-Medium.ttf','public/science.json',
 'src/cues.json','src/layout.json','src/scene.ts','src/preview-painter.ts','src/focus.ts','src/schema.ts',
 'src/review-client.ts','review/index.html','review/client.js'
] as const;

function inputPath(path:string){
 if(isAbsolute(path)||path.includes('\\')||path.includes('\0')||path.split('/').some(part=>!part||part==='.'||part==='..'))throw Error('Production blocked: unsafe input path');
 return path;
}

export function validateIdentityHashes(value:unknown){
 const hashes=object(value);
 for(const path of requiredInputPaths)if(!(path in hashes))throw Error('Production blocked: required identity input missing: '+path);
 for(const [path,hash] of Object.entries(hashes)){inputPath(path);if(typeof hash!=='string'||!/^[a-f0-9]{64}$/.test(hash))throw Error('Production blocked: invalid input hash: '+path);}
 return hashes as Record<string,string>;
}

export function checkGate(review:unknown,identity:unknown,current:Record<string,string>,cueIds:string[]){
 const r=object(review),i=object(identity),approval=object(r.authorization);
 const expected=validateIdentityHashes(i.hashes),bound=object(r.inputHashes);
 if(i.song!=='DBGCHjBSNzo'||r.song!==i.song||r.revision!==i.revision||!str(i.revision))throw Error('Production blocked: wrong song or revision');
 if(!Object.keys(expected).length)throw Error('Production blocked: empty input identity');
 for(const [path,hash] of Object.entries(expected))if(typeof hash!=='string'||!hash||current[path]!==hash||bound[path]!==hash)throw Error('Production blocked: stale input '+path);
 if(array(r.unresolvedDefects).length)throw Error('Production blocked: unresolved synchronization defects');
 if(!cueIds.length||new Set(cueIds).size!==cueIds.length)throw Error('Production blocked: invalid cue inventory');
 const rows=array(r.cues).map(object);
 if(rows.length!==cueIds.length||new Set(rows.map(x=>x.id)).size!==cueIds.length)throw Error('Production blocked: incomplete cue inventory');
 for(const flag of ['actualAudioReviewComplete','translationReviewComplete','allCuesAllFormatsComplete'])if(r[flag]!==true)throw Error('Production blocked: incomplete '+flag);
 for(const id of cueIds)if(!rows.some(x=>x.id===id&&['meaning','normalAudio','slowAudio','landscape','portrait'].every(k=>x[k]===true)))throw Error('Production blocked: incomplete cue '+id);
 if(approval.approved!==true||approval.song!==i.song||approval.revision!==i.revision||approval.scope!=='full-song-production'||typeof approval.evidence!=='string'||!approval.evidence.trim())throw Error('Production blocked: explicit current render approval required');
 const authorized=object(approval.inputHashes);
 for(const [path,hash] of Object.entries(expected))if(authorized[path]!==hash)throw Error('Production blocked: stale approval input '+path);
 return true;
}

export function assertProductionGate(projectRoot='.'){
 const root=realpathSync(resolve(projectRoot));
 const locate=(relative:string)=>{const path=realpathSync(resolve(root,inputPath(relative)));if(!path.startsWith(root+sep))throw Error('Production blocked: input resolves outside project');return path;};
 const read=(p:string):unknown=>JSON.parse(readFileSync(locate(p),'utf8'));
 const identity=read('evidence/preview-identity.json');
 const hashes=validateIdentityHashes(object(identity).hashes);
 const current=Object.fromEntries(Object.keys(hashes).map(p=>[p,createHash('sha256').update(readFileSync(locate(p))).digest('hex')]));
 return checkGate(read('evidence/cross-language-sync-review.json'),identity,current,parseData(read('src/cues.json')).cues.map(c=>c.id));
}

if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){
 assertProductionGate();
 if(process.argv.includes('--production'))throw Error('This preview edition has no production renderer. No film was captured or encoded.');
 console.log('Current synchronization review and production authorization verified.');
}
