import {readFileSync,writeFileSync,existsSync} from 'node:fs';
import {parseData} from '../src/schema.ts';
import type {TargetWord,Cue} from '../src/schema.ts';
type Word={word:string;start:number;end:number;probability?:number};
type Segment={id:string;words:Word[]};
const read=(p:string)=>JSON.parse(readFileSync(p,'utf8'));
const text=read('source/text-and-mapping.json') as {id:string;section:string;ru:{id:string;text:string}[];en:TargetWord[];mappingRationale:string}[];
const sections=read('source/sections.json') as {id:string;cueIds:string[]}[];
const separate=(name:string)=>{const rows=(read('analysis/'+name+'.json') as {segments:Segment[]}).segments,map=new Map<string,Word[]>();for(const section of sections){const words=rows.find(s=>s.id===section.id)!.words;let offset=0;for(const id of section.cueIds){const n=text.find(c=>c.id===id)!.ru.length;map.set(id,words.slice(offset,offset+n));offset+=n;}if(offset!==words.length)throw Error('Section length mismatch');}return map;};
const stem=separate('mms-vocals-sections'),mix=separate('mms-mix-sections');
const fullStem=separate('whisper-full-vocals-large-v3'),fullMix=separate('whisper-full-mix-large-v3');
const extendedStem=separate('mms-vocals-extended'),extendedMix=separate('mms-mix-extended');
const whisper=new Map((read('analysis/whisper-vocals-lines.json') as {segments:Segment[]}).segments.map(s=>[s.id,s.words]));
const media=read('source/media-manifest.json') as {audio:{decodedSampleCount:number;presentedDuration:number;sha256:string}};
const sampleRate=44100,sampleCount=media.audio.decodedSampleCount,ledger:unknown[]=[];
const corrections=read('source/timing-corrections.json') as {id:string;start:number;end:number;rationale:string}[];
const held=existsSync('analysis/held-vowel-candidates.json')?read('analysis/held-vowel-candidates.json') as {id:string;proposedEnd:number;note:string}[]:[];
const cues:Cue[]=text.map(c=>{
 const primary=stem.get(c.id)!;
 if(primary.length!==c.ru.length||mix.get(c.id)!.length!==c.ru.length||whisper.get(c.id)!.length!==c.ru.length)throw Error('Token correspondence: '+c.id);
 const ru=c.ru.map((w,i)=>{
  const candidates=[['MMS vocal stem',primary[i]],['MMS original mix',mix.get(c.id)![i]],['Whisper bounded vocal line',whisper.get(c.id)![i]],['Whisper large-v3 vocal section',fullStem.get(c.id)![i]],['Whisper large-v3 original section',fullMix.get(c.id)![i]],['MMS extended vocal section',extendedStem.get(c.id)![i]],['MMS extended original section',extendedMix.get(c.id)![i]]].map(([method,word])=>({method:method as string,...word as Word}));
  for(const candidate of candidates)if(candidate.word.trim().toLowerCase()!==w.text.toLowerCase())throw Error('Candidate token mismatch: '+w.id+'/'+candidate.method);
  const p=primary[i]!,spread=Math.max(...['start','end'].map(key=>{const v=candidates.map(x=>x[key as 'start'|'end']);return (Math.max(...v)-Math.min(...v))*1000;}));
  const continuation=held.find(row=>row.id===w.id);
  const correction=corrections.find(row=>row.id===w.id);
  const startSample=Math.round((correction?.start??p.start)*sampleRate),endSample=Math.round((correction?.end??continuation?.proposedEnd??p.end)*sampleRate);
  ledger.push({id:w.id,text:w.text,startSample,endSample,candidateSpreadMs:spread,reviewRequired:true,candidates,...(continuation?{heldVowel:continuation}:{}),...(correction?{correction}:{}),rationale:'Provisional vocal-stem MMS boundaries with explicit reviewed-candidate corrections. Independent original-mix, vocal-stem, larger Whisper and expanded-context estimates remain separate; their disagreement is not averaged into a global offset. Eight sustained releases additionally follow documented stem periodicity. No model agreement is treated as listening approval. Vocal tails, short function words and >25 ms disagreements remain explicit review targets.'});
  return {...w,startSample,endSample,candidateSpreadMs:spread,reviewRequired:true};
 });
 return {id:c.id,section:c.section,ru,en:c.en,startSample:ru[0]!.startSample,endSample:ru.at(-1)!.endSample,visibleFrom:0,visibleUntil:0};
});
for(let i=0;i<cues.length;i++){
 const c=cues[i]!,prev=cues[i-1],next=cues[i+1];
 c.visibleFrom=Math.max(0,c.startSample-Math.round(.24*sampleRate),prev?Math.round((prev.endSample+c.startSample)/2):0);
 c.visibleUntil=Math.min(sampleCount,c.endSample+Math.round(.32*sampleRate),next?Math.round((c.endSample+next.startSample)/2):sampleCount);
}
const data=parseData({sampleRate,sampleCount,duration:media.audio.presentedDuration,fps:60,frames:Math.ceil(media.audio.presentedDuration*60),audioSha256:media.audio.sha256,cues});
writeFileSync('src/cues.json',JSON.stringify(data,null,2)+'\n');
writeFileSync('analysis/boundary-ledger.json',JSON.stringify(ledger,null,2)+'\n');
writeFileSync('evidence/candidate-summary.json',JSON.stringify({words:ledger.length,over25ms:cues.flatMap(c=>c.ru).filter(w=>w.candidateSpreadMs>25).length,allListeningPending:true,primary:'MMS vocal stem; independent performance windows, no copied chorus offsets',warning:'Forced alignment assumes the supplied text. Full-song ASR is unsuitable as timing truth: introductory hallucinations and a false subtitle credit in the outro are rejected.'},null,2)+'\n');
console.log({cues:cues.length,frames:data.frames,first:cues[0]!.startSample/sampleRate,last:cues.at(-1)!.endSample/sampleRate});
