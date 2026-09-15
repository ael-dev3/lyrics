import {createHash} from 'node:crypto';
import {readFileSync,existsSync} from 'node:fs';
import {resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {array,object,str,parseData} from '../src/schema.ts';
export const reviewedPaths=['public/soundtrack.m4a','public/footage.mp4','public/CormorantGaramond-Semibold.ttf','source/original.txt','source/text-and-mapping.json','src/cues.json','src/layout.json','src/focus.ts','src/scene.ts','src/Film.tsx','public/science.json','package-lock.json'];
export function inputHashes(){return Object.fromEntries(reviewedPaths.map(path=>[path,createHash('sha256').update(readFileSync(path)).digest('hex')]));}
export function assertReview(review:unknown,hashes:Record<string,string>,cueIds:string[]):void{
 const r=object(review);if(r.status!=='complete')throw Error('SYNC GATE: complete actual-audio and audiovisual review required');
 const reviewer=object(r.reviewer);str(reviewer.role);str(reviewer.method);if(reviewer.actualListening!==true)throw Error('SYNC GATE: listening evidence absent');
 const attested=r.reviewMode==='user-attested';
 if(attested){
  const authorization=object(r.authorization);
  if(authorization.reviewCompleted!==true||authorization.fullRenderAuthorized!==true||authorization.noMistakesReported!==true)throw Error('SYNC GATE: incomplete user sign-off');
  str(authorization.evidenceBasis);str(authorization.coverageLimit);
 }
 for(const requirement of attested?['translation','targetSpans','noKnownDefects']:['translation','targetSpans','fullTrackAudio','highRiskSlowAudio','introGapsRepeatsTail','allFormatsAudiovisual','noKnownDefects'])if(object(r.requirements)[requirement]!==true)throw Error('SYNC GATE: incomplete '+requirement);
 const reviewed=object(r.hashes);for(const [path,hash] of Object.entries(hashes))if(reviewed[path]!==hash)throw Error('SYNC GATE: stale reviewed input '+path);
 const rows=array(r.cues).map(object);if(rows.length!==cueIds.length)throw Error('SYNC GATE: incomplete cue inventory');
 for(const id of cueIds){const matches=rows.filter(c=>c.id===id);if(matches.length!==1)throw Error('SYNC GATE: missing/duplicate '+id);const row=matches[0];if(!row)throw Error('Missing row');for(const key of attested?['ruMeaning','enMeaning','fullTargetSpan']:['ruMeaning','enMeaning','fullTargetSpan','normalAudio','slowAudio','landscape','portrait'])if(row[key]!==true)throw Error('SYNC GATE: '+id+' '+key+' not reviewed');}
 if(array(r.unresolved).length)throw Error('SYNC GATE: unresolved defects');
}
export function assertSyncGate(){const path='evidence/cross-language-sync-review.json';if(!existsSync(path))throw Error('SYNC GATE: review record missing');const data=parseData(JSON.parse(readFileSync('src/cues.json','utf8')));assertReview(JSON.parse(readFileSync(path,'utf8')),inputHashes(),data.cues.map(c=>c.id));}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){try{assertSyncGate();console.log('Synchronization gate passed for current inputs');}catch(e){console.error(String(e));process.exitCode=1;}}
