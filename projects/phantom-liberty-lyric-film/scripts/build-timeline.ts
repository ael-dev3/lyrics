import {readFileSync,writeFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {validateTimeline,type Timeline,type Cue,type Word} from '../src/model.ts';
const root=fileURLToPath(new URL('..',import.meta.url));
type Candidate={revision:string;sourceHash:string;sampleRate:number;cues:{id:string;text:string;vocalTrack:'lead'|'backing';eventKind?:'lexical'|'nonlexical-vocalization';words:(Word&{decision?:string;uncertainty?:string})[]}[]};
const input=process.argv[2]??'source/selected-words.json';
const raw:unknown=JSON.parse(readFileSync(resolve(root,input),'utf8'));
if(!raw||typeof raw!=='object'||!('cues'in raw)||!Array.isArray(raw.cues))throw Error('Invalid reconciled candidate');
const candidate=raw as Candidate;
const recording=JSON.parse(readFileSync(resolve(root,'source/recording.json'),'utf8')) as {sampleRate:number;sourceSha256:string;sourceDuration:number};
if(candidate.sourceHash!==recording.sourceSha256||candidate.sampleRate!==recording.sampleRate)throw Error('Candidate belongs to a different recording or clock');
if(!candidate.revision||candidate.revision==='phantom-liberty-preview-v1')throw Error('The rejected provisional timing map cannot become a review timeline');
const t:Timeline={schemaVersion:2,revision:process.env.TIMELINE_REVISION??candidate.revision,sampleRate:recording.sampleRate,sourceSha256:recording.sourceSha256,sourceDuration:recording.sourceDuration,cues:[]};
for(const draft of candidate.cues){
 if(!draft.words?.length)throw Error(`Missing acoustic words ${draft.id}`);
 const first=draft.words[0],last=draft.words.at(-1);if(!first||!last)throw Error('Empty candidate');
 const start=first.startSample/t.sampleRate,end=last.endSample/t.sampleRate;
 const words:Word[]=draft.words.map(w=>({id:w.id,text:w.text,sourceIndex:w.sourceIndex,startSample:w.startSample,endSample:w.endSample,...w.confidence!==undefined?{confidence:w.confidence}:{},...w.method!==undefined?{method:w.method}:{}}));
 const rationale=draft.eventKind==='nonlexical-vocalization'?'Transcribed wordless vocalization candidate; direct body, label and onset uncertainty stay in the selected-event record.':'Individually performed English word; source and reading language are identical.';
 const cue:Cue={id:draft.id,label:draft.text,sourceLanguage:'en',vocalTrack:draft.vocalTrack,start,end,visibleStart:Math.max(0,start-.23),fullOpacityEnd:end,visibleEnd:end,words,lanes:[{language:'en',tokens:words.map(w=>({id:`${w.id}-en`,text:w.text.replace(/'/g,'’'),sourceIndices:[w.sourceIndex],rationale}))}]};
 t.cues.push(cue);
}
t.cues.sort((a,b)=>a.start-b.start||a.id.localeCompare(b.id));
// Reading holds are an editorial property. They never alter acoustic events.
for(const track of ['lead','backing'] as const){const cues=t.cues.filter(c=>c.vocalTrack===track);
 for(const [i,c]of cues.entries()){
  const prior=cues[i-1],next=cues[i+1];
  if(prior&&c.start<prior.end)throw Error(`Acoustic overlap in one voice must be reconciled: ${prior.id}/${c.id}`);
  c.visibleStart=Math.max(prior?.visibleEnd??0,c.start-.23);
  const room=(next?.start??t.sourceDuration)-c.end;
  if(room>=1.05){c.fullOpacityEnd=Math.min(c.end+.34,t.sourceDuration);c.visibleEnd=Math.min(c.fullOpacityEnd+.38,(next?.start??t.sourceDuration)-.23);}
  else{c.fullOpacityEnd=next?.start??Math.min(t.sourceDuration,c.end+.34);c.visibleEnd=c.fullOpacityEnd;}
 }
}
validateTimeline(t);
writeFileSync(resolve(root,'public/timeline.json'),JSON.stringify(t,null,2)+'\n');
console.log(JSON.stringify({revision:t.revision,cues:t.cues.length,words:t.cues.reduce((n,c)=>n+c.words.length,0),tracks:{lead:t.cues.filter(c=>c.vocalTrack==='lead').length,backing:t.cues.filter(c=>c.vocalTrack==='backing').length},input}));
