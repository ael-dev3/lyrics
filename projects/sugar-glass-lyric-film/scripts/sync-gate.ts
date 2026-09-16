import {createHash} from 'node:crypto';
import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {object,array,str,parseData} from '../src/schema.ts';
export const projectId='sugar-glass-en-ru';
export const reviewedPaths=['public/soundtrack.m4a','public/footage.mp4','public/review-source.mp4','public/CormorantGaramond-Semibold.ttf','source/supplied-lyrics.txt','source/original.txt','source/text-and-mapping.json','src/cues.json','src/layout.json','src/schema.ts','src/layout-types.ts','src/focus.ts','src/scene.ts','src/Film.tsx','src/review-client.ts','review/index.html','public/science.json','package.json','package-lock.json'];
export function inputHashes(){return Object.fromEntries(reviewedPaths.map(path=>[path,createHash('sha256').update(readFileSync(path)).digest('hex')]));}
export function assertAuthorization(value:unknown,hashes:Record<string,string>,revision:string){
 const auth=object(value);if(auth.projectId!==projectId||auth.status!=='authorized'||auth.fullRenderAuthorized!==true)throw Error('PRODUCTION BLOCKED: this song has preview-only authorization');
 if(auth.previewRevision!==revision)throw Error('PRODUCTION BLOCKED: approval belongs to another revision');
 str(auth.evidenceBasis);const approved=object(auth.hashes);for(const [path,hash] of Object.entries(hashes))if(approved[path]!==hash)throw Error('PRODUCTION BLOCKED: stale approval '+path);
}
export function assertReview(value:unknown,hashes:Record<string,string>,cueIds:string[]){
 const review=object(value);if(review.status!=='complete'||object(review.reviewer).actualListening!==true)throw Error('SYNC BLOCKED: full actual-audio review remains incomplete');
 for(const key of ['translation','targetSpans','fullTrackAudio','highRiskSlowAudio','introGapsRepeatsTail','allFormatsAudiovisual','noKnownDefects'])if(object(review.requirements)[key]!==true)throw Error('SYNC BLOCKED: '+key);
 const approved=object(review.hashes);for(const [path,hash] of Object.entries(hashes))if(approved[path]!==hash)throw Error('SYNC BLOCKED: stale review '+path);
 const rows=array(review.cues).map(object);if(rows.length!==cueIds.length)throw Error('SYNC BLOCKED: cue coverage');
 for(const id of cueIds){const matches=rows.filter(r=>r.id===id);if(matches.length!==1)throw Error('SYNC BLOCKED: missing/duplicate '+id);const row=matches[0];if(!row)throw Error('Missing review');for(const key of ['sourceMeaning','targetMeaning','fullTargetSpan','normalAudio','slowAudio','landscape','portrait'])if(row[key]!==true)throw Error('SYNC BLOCKED: '+id+' '+key);}
 if(array(review.unresolved).length)throw Error('SYNC BLOCKED: unresolved review questions');
}
export function assertProductionGate(){
 const read=(p:string):unknown=>JSON.parse(readFileSync(p,'utf8')),hashes=inputHashes(),identity=object(read('evidence/preview-identity.json'));
 assertAuthorization(read('evidence/render-authorization.json'),hashes,str(identity.revision));
 const data=parseData(read('src/cues.json'));assertReview(read('evidence/cross-language-sync-review.json'),hashes,data.cues.map(c=>c.id));
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){try{assertProductionGate();console.log('Current revision reviewed and authorized');}catch(e){console.error(String(e));process.exitCode=1;}}
