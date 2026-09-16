import {readFileSync,writeFileSync,existsSync} from 'node:fs';
import {inputHashes,projectId} from './sync-gate.ts';
import {parseData} from '../src/schema.ts';
if(existsSync('evidence/listener-review-progress.json'))throw Error('Preserve listener progress; do not reset an active review.');
const data=parseData(JSON.parse(readFileSync('src/cues.json','utf8'))),hashes=inputHashes();
const write=(p:string,value:unknown)=>writeFileSync(p,JSON.stringify(value,null,2)+'\n');
write('evidence/preview-identity.json',{projectId,revision:'preview-v1',hashes});
write('evidence/render-authorization.json',{projectId,status:'preview-only',previewRevision:'preview-v1',fullRenderAuthorized:false,evidenceBasis:'Only review preview preparation is authorized.',hashes:{}});
write('evidence/cross-language-sync-review.json',{status:'incomplete',reviewer:{role:'pending listener',method:'model-assisted draft with programmatic timing, mapping and layout checks',actualListening:false},requirements:{translation:true,targetSpans:true,fullTrackAudio:false,highRiskSlowAudio:false,introGapsRepeatsTail:false,allFormatsAudiovisual:false,noKnownDefects:false},hashes,cues:data.cues.map(c=>({id:c.id,sourceMeaning:true,targetMeaning:true,fullTargetSpan:true,normalAudio:false,slowAudio:false,landscape:false,portrait:false})),unresolved:['Complete actual-audio review of all cues and both layouts.','Resolve model disagreements and sustained-vowel releases.','Confirm supplied wording sleeve versus model recognition sleep in both choruses.','Confirm bridge normalization then one to the one.','Review overlapping post-chorus transcription, repetitions and source-word boundaries independently.']});
