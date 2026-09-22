import {readFileSync,writeFileSync,statSync} from 'node:fs';
import {parseData} from '../src/schema.ts';
import type {TargetWord,Cue} from '../src/schema.ts';
type Word={word:string;start:number;end:number;probability?:number;acousticSpans?:{start:number;end:number;score:number}[]};
type Segment={id:string;words:Word[]};
const read=(p:string)=>JSON.parse(readFileSync(p,'utf8'));
const text=read('source/text-and-mapping.json') as {id:string;section:string;ru:{id:string;text:string}[];en:TargetWord[];mappingRationale:string}[];
const sections=read('source/sections.json') as {id:string;cueIds:string[]}[];
const byLines=(file:string)=>new Map((read(file).segments as Segment[]).map(s=>[s.id,s.words]));
const bySections=(file:string)=>{const rows=read(file).segments as Segment[],out=new Map<string,Word[]>();for(const s of sections){const source=rows.find(r=>r.id===s.id)!;let offset=0;for(const id of s.cueIds){const length=text.find(c=>c.id===id)!.ru.length;out.set(id,source.words.slice(offset,offset+length));offset+=length;}if(offset!==source.words.length)throw Error('Section token mismatch '+s.id);}return out;};
const methods=[{name:'MMS vocal bounded line',data:byLines('analysis/mms-vocals-lines.json')},{name:'MMS mix bounded line',data:byLines('analysis/mms-mix-lines.json')},{name:'Whisper vocal bounded line',data:byLines('analysis/whisper-vocals-lines.json')},{name:'MMS vocal independent section',data:bySections('analysis/mms-vocals-sections.json')},{name:'MMS mix independent section',data:bySections('analysis/mms-mix-sections.json')}];
const corrections=read('source/timing-corrections.json') as {id:string;start:number;end:number;rationale:string}[];
const correctionIds=new Set<string>(),sourceIds=new Set(text.flatMap(c=>c.ru.map(w=>w.id)));
for(const row of corrections){if(correctionIds.has(row.id)||!sourceIds.has(row.id))throw Error('Duplicate or unknown timing correction '+row.id);if(!Number.isFinite(row.start)||!Number.isFinite(row.end)||row.start<0||row.end<=row.start||!row.rationale.trim())throw Error('Invalid timing correction '+row.id);correctionIds.add(row.id);}
const media=read('source/media-manifest.json') as {audio:{decodedSampleCount:number;presentedDuration:number;sha256:string}};
const sampleRate=44100,sampleCount=statSync('analysis/audio-delivery.f32').size/8;if(!Number.isSafeInteger(sampleCount)||sampleCount!==media.audio.decodedSampleCount)throw Error('Decoded PCM clock mismatch');
const clean=(s:string)=>s.trim().toLowerCase().replace(/ё/g,'е').replace(/[^\p{L}\p{N}]/gu,'');
const ledger:Record<string,unknown>[]=[];
const cues:Cue[]=text.map(c=>{
 const ru=c.ru.map((w,i)=>{
  const candidates=methods.map(m=>{const row=m.data.get(c.id);if(!row||row.length!==c.ru.length)throw Error('Candidate token count '+m.name+'/'+c.id);const v=row[i]!;if(clean(v.word)!==clean(w.text))throw Error('Candidate text mismatch '+w.id+'/'+m.name);return {method:m.name,...v};});
  const primary=candidates[0]!,correction=corrections.find(q=>q.id===w.id),startSample=Math.round((correction?.start??primary.start)*sampleRate),endSample=Math.round((correction?.end??primary.end)*sampleRate);
  const onsetSpread=Math.max(...candidates.map(v=>v.start))-Math.min(...candidates.map(v=>v.start)),releaseSpread=Math.max(...candidates.map(v=>v.end))-Math.min(...candidates.map(v=>v.end)),candidateSpreadMs=1000*Math.max(onsetSpread,releaseSpread);
  ledger.push({id:w.id,cueId:c.id,text:w.text,startSample,endSample,confidence:primary.probability??null,uncertaintySamples:Math.ceil(Math.max(onsetSpread,releaseSpread)*sampleRate),candidateSpreadMs,reviewRequired:true,candidates,...(correction?{correction}:{}),rationale:'Bounded-line vocal MMS phonetic-core candidate; repeated performances aligned independently. Mix, section and Whisper observations remain separate. Whisper often includes leading context/gaps and MMS can shorten held vowels; no global offset or copied chorus transform is applied. All actual-audio listening and perceptual releases remain pending.'});
  return {...w,startSample,endSample,candidateSpreadMs,reviewRequired:true};
 });
 return {id:c.id,section:c.section,ru,en:c.en,startSample:ru[0]!.startSample,endSample:ru.at(-1)!.endSample,visibleFrom:0,visibleUntil:0};
});
for(let i=0;i<cues.length;i++){
 const c=cues[i]!,p=cues[i-1],n=cues[i+1];for(let j=1;j<c.ru.length;j++)if(c.ru[j]!.startSample<c.ru[j-1]!.endSample)throw Error('Overlapping source tokens '+c.ru[j]!.id);
 if(p&&c.startSample<p.endSample)throw Error('Overlapping cues '+c.id);
 c.visibleFrom=Math.max(0,c.startSample-Math.round(.24*sampleRate),p?Math.round((p.endSample+c.startSample)/2):0);
 c.visibleUntil=Math.min(sampleCount,c.endSample+Math.round(.32*sampleRate),n?Math.round((c.endSample+n.startSample)/2):sampleCount);
}
const data=parseData({sampleRate,sampleCount,duration:media.audio.presentedDuration,fps:60,frames:Math.ceil(media.audio.presentedDuration*60),audioSha256:media.audio.sha256,cues});
writeFileSync('src/cues.json',JSON.stringify(data,null,2)+'\n');writeFileSync('analysis/boundary-ledger.json',JSON.stringify(ledger,null,2)+'\n');
writeFileSync('evidence/candidate-summary.json',JSON.stringify({cues:cues.length,words:ledger.length,explicitCorrectionCount:corrections.length,over25ms:ledger.filter(w=>Number(w.candidateSpreadMs)>25).length,allListeningPending:true,primary:'MMS vocal bounded line; all repeated performances aligned independently',candidateMethods:methods.map(m=>m.name),clock:{sampleRate,sampleCount,decodedDuration:sampleCount/sampleRate,presentedDuration:media.audio.presentedDuration},warning:'Force alignment presumes supplied text; recording coverage separately corroborated by full and bounded stem transcription. Core estimates are provisional; whisper/stem agreement and mathematical frame placement are not listening approval.'},null,2)+'\n');
console.log({cues:cues.length,words:ledger.length,first:cues[0]!.startSample/sampleRate,last:cues.at(-1)!.endSample/sampleRate});
