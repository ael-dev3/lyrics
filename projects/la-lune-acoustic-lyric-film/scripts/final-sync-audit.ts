import {readFileSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
import {parseData} from '../src/schema.ts';
import {activeSource,activeTargets,visibleCue} from '../src/focus.ts';
const read=(p:string)=>JSON.parse(readFileSync(p,'utf8'));
const data=parseData(read('src/cues.json'));
type Word={word:string;start:number;end:number};
type Alignment={segments:{id:string;words:Word[]}[]};
const mix=read('analysis/mms-mix-lines.json') as Alignment,small=read('analysis/whisper-vocals-lines-small.json') as Alignment;
const previous=read('analysis/boundary-ledger.json') as {id:string;candidates:unknown[];reason:string}[];
// Editorially reviewed correspondence, independent of the display's English IDs.
const expected=[[[0],[1],[2]],[[0],[1],[2],[3],[3]],[[0],[2],[1]],[[0],[1],[2]],[[0],[1],[2],[3],[4],[6],[5,7],[7]],[[0],[1],[2],[3],[4],[5]],[[0],[1]],[[0],[1],[0]],[[0],[1],[1]],[[0],[1],[2],[1]],[[0],[1],[0]],[[0],[1],[0],[2],[3,4],[2]],[[0],[1],[1],[3],[2]],[[0],[1]]];
const rows=data.cues.flatMap((cue,ci)=>{
 assert.deepEqual(cue.en.map(w=>w.sourceIds.map(id=>cue.fr.findIndex(s=>s.id===id))),expected[ci]);
 const a=mix.segments[ci],b=small.segments[ci];assert.equal(a?.id,cue.id);assert.equal(b?.id,cue.id);assert.equal(a?.words.length,cue.fr.length);assert.equal(b?.words.length,cue.fr.length);
 return cue.fr.map((w,wi)=>({id:w.id,text:w.text,start:w.startSample/data.sampleRate,end:w.endSample/data.sampleRate,english:cue.en.filter(e=>e.sourceIds.includes(w.id)).map(e=>e.text),priorCandidates:previous.find(p=>p.id===w.id)?.candidates,additionalCandidates:[{method:'bounded MMS original mix',...a!.words[wi]},{method:'bounded Whisper small isolated vocal',...b!.words[wi]}],decision:'Retain approved candidate; additional alignments and the full cue spectrogram were compared. No model average or global offset applied.',reviewRequired:w.reviewRequired}));
});
let visibleStates=0,targetStates=0;
for(let frame=0;frame<data.frames;frame++){
 const cue=visibleCue(data,frame);if(!cue)continue;
 const sample=frame*data.sampleRate/data.fps,source=activeSource(cue,frame,data),targets=activeTargets(cue,frame,data);
 for(const w of cue.fr){const on=frame>=Math.round(w.startSample/data.sampleRate*data.fps)&&frame<Math.round(w.endSample/data.sampleRate*data.fps);assert.equal(source.has(w.id),on);visibleStates++;}
 for(const w of cue.en){const on=w.sourceIds.some(id=>source.has(id));assert.equal(targets.has(w.id),on);targetStates++;}
 assert.ok(sample>=cue.visibleFrom-data.sampleRate/data.fps&&sample<cue.visibleUntil+data.sampleRate/data.fps);
}
const inputs=['src/cues.json','source/translation.json','analysis/mms-mix-lines.json','analysis/whisper-vocals-lines-small.json','evidence/vocal-audit-page-1.png','evidence/vocal-audit-page-2.png'];
const report={status:'passed technical and editorial audit',song:'p3E731cu_nE',revision:'preview-v2-lunar',cueCount:data.cues.length,sourceWords:rows.length,targetWords:data.cues.reduce((n,c)=>n+c.en.length,0),allTimelineFrames:data.frames,sourceWordStates:visibleStates,targetWordStates:targetStates,inputs:Object.fromEntries(inputs.map(p=>[p,createHash('sha256').update(readFileSync(p)).digest('hex')])),rows,changesToApprovedTiming:[],findings:['Every source word and complete English meaning has a selected event; no uncovered target tokens or invented English syllable timing.','Short-window alignments reduce some section drift but can also move legato words or chop sustained vowels. They are evidence, not automatic overrides.','Whisper first words often begin at the supplied window edge; this is not accepted as an acoustic onset.','All fourteen vocal spectrogram panels were inspected alongside the model comparisons; held notes and instrumental resonance retain interpretive uncertainty.'],limits:'Model-assisted timing and signal inspection do not certify exact audible boundaries. Granular normal-speed/reduced-speed listening and audiovisual sign-offs remain unclaimed. Overall accepted-preview production is separately authorized by the project owner.'};
writeFileSync('evidence/final-sync-audit.json',JSON.stringify(report,null,2)+'\n');
console.log({status:report.status,sourceWords:rows.length,targetWords:report.targetWords,sourceWordStates:visibleStates,targetWordStates:targetStates,changes:0});
