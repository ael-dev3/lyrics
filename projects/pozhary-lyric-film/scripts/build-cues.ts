import {readFileSync,writeFileSync,existsSync} from 'node:fs';
import assert from 'node:assert/strict';
import {definitions} from '../src/lyrics.ts';
import type {Cue} from '../src/schema.ts';
type Observation={word:string;start:number;end:number;probability:number};
type Segment={id:string;words:Observation[]};
function observations(path:string){const j=JSON.parse(readFileSync(path,'utf8')) as {segments:Segment[]};assert(Array.isArray(j.segments));for(const s of j.segments){assert(typeof s.id==='string'&&Array.isArray(s.words));for(const w of s.words)assert(Number.isFinite(w.start)&&Number.isFinite(w.end)&&w.end>=w.start);}return new Map(j.segments.map(s=>[s.id,s.words]));}
const mms=observations('analysis/mms-vocals16.json'),vocals=observations('analysis/bounded-vocals16.json'),mix=observations('analysis/bounded-audio16.json');
for(const [name,map] of [['mms',mms],['bounded',vocals]] as const){const p=`analysis/${name}-vocals16-tail.json`;if(existsSync(p))for(const [id,w] of observations(p))map.set(id,w);}
const audit:{id:string;source:string;words:unknown[];note:string}[]=[];
const cues:Cue[]=definitions.map(d=>{
 let measured=mms.get(d.id)!;assert.equal(measured.length,d.text.split(' ').length);
 let source='independently windowed MMS-FA vocal alignment';
 if(['chorus3-6','chorus3-7'].includes(d.id)){
  const reference=d.id.replace('chorus3','chorus2');measured=mms.get(reference)!.map(w=>({...w,start:w.start+48,end:w.end+48}));
  source='reviewed C2 vocal alignment transferred +48.000s after independent signed waveform correlation (0.810/0.753 for these phrases) and bounded Whisper onset checks; low-confidence C3 CTC path rejected';
 }
 const words=measured.map((w,i)=>({text:d.text.split(' ')[i]!,startSample:Math.round(w.start*48000),endSample:Math.round((w.end+.025)*48000)}));
 if(d.id==='chorus1-1')words[0]!.startSample=Math.round(.26*48000);
 if(d.id==='chorus3-3')words.at(-1)!.endSample=Math.round(119.84*48000);
 for(let i=0;i<words.length-1;i++){words[i]!.endSample=Math.min(words[i]!.endSample,words[i+1]!.startSample);if(words[i]!.endSample<=words[i]!.startSample)words[i]!.endSample=words[i]!.startSample+800;}
 let groups=words.map((_,i)=>[i]);
 if(d.section.startsWith('chorus')){
  const i=Number(d.id.split('-')[1]);
  groups=({1:[[0,1],[2]],2:[[0,1]],3:[[0,1],[2,3]],4:[[0],[1,2]],5:[[0,1],[2],[3,4]],6:[[0,1],[2],[3]],7:[[0],[1],[2]]} as Record<number,number[][]>)[i]!;
 }
 if(d.id==='verse1-1')groups=[[0],[1],[2,3]];
 if(d.id==='verse1-4')groups=[[0],[1,2],[3]];
 if(d.id==='verse1-6')groups=[[0],[1,2]];
 if(d.id==='verse1-8')groups=[[0,1],[2],[3]];
 if(d.id==='verse2-2')groups=[[0,1]];
 if(d.id==='verse2-3')groups=[[0],[1],[2,3]];
 audit.push({id:d.id,source,note:'Short particles and uncertain internal contacts use meaning-linked groups. CTC and attention timestamps are estimates; reverb and stylized vocals retain uncertainty.',words:measured.map((w,i)=>({text:words[i]!.text,selected:{startSample:words[i]!.startSample,endSample:words[i]!.endSample},ctc:mms.get(d.id)![i],attentionVocals:vocals.get(d.id)![i],attentionMix:mix.get(d.id)![i],candidateSpreadMs:Math.round(1000*Math.max(Math.abs(w.start-vocals.get(d.id)![i]!.start),Math.abs(w.end-vocals.get(d.id)![i]!.end)))}))});
 return {id:d.id,section:d.section,words,groups,en:d.en,startSample:words[0]!.startSample,endSample:words.at(-1)!.endSample};
});
cues.push({id:'echo-fire',section:'bridge',echo:true,words:[{text:'Пожар',startSample:Math.round(99.30*48000),endSample:Math.round(111.14*48000)}],groups:[[0]],en:[{text:'Fire',words:[0]}],startSample:Math.round(99.30*48000),endSample:Math.round(111.14*48000)});
cues.sort((a,b)=>a.startSample-b.startSample);
const overlaps=[];
for(let i=0;i<cues.length-1;i++){const c=cues[i]!,next=cues[i+1]!;if(c.endSample>next.startSample){overlaps.push({cue:c.id,next:next.id,trimmedMs:(c.endSample-next.startSample)/48});c.endSample=next.startSample;c.words.at(-1)!.endSample=next.startSample;}}
for(const c of cues){assert(c.endSample>c.startSample);for(const w of c.words)assert(w.endSample>w.startSample);const covered=new Set(c.groups.flat());assert.equal(covered.size,c.words.length);for(const e of c.en)for(const i of e.words)assert(covered.has(i));}
for(const row of audit){const c=cues.find(c=>c.id===row.id)!;row.words=row.words.map((entry,i)=>({...entry as object,tokenId:`${row.id}-w${i+1}`,selected:{startSample:c.words[i]!.startSample,endSample:c.words[i]!.endSample}}));}
writeFileSync('src/cues.json',JSON.stringify(cues,null,2));
writeFileSync('analysis/alignment-decisions.json',JSON.stringify({audit,overlaps,echo:'99.30–111.14s is one persistent bilingual word for the repeated/chopped vocal motif, with isolated-vocal RMS emphasis. Individual echo copies are not claimed as separately aligned words.',limits:'Nearest-frame quantization is at most 8.333ms; this does not certify acoustic word-boundary accuracy. Full-track attention paths drifted across the instrumental break and are rejected.'},null,2));
const bytes=readFileSync('analysis/vocals.f32'),pcm=new Float32Array(bytes.buffer,bytes.byteOffset,bytes.byteLength/4),data=[];
for(let f=0;f<9001;f++){const p=Math.round(f/60*16000);let sum=0,count=0;for(let i=Math.max(0,p-160);i<Math.min(pcm.length,p+160);i++){sum+=(pcm[i]??0)**2;count++;}data.push(Math.round(1000*10*Math.log10(Math.max(1e-12,sum/Math.max(1,count))))/1000);}
writeFileSync('public/vocal-envelope.json',JSON.stringify(data));
console.log({cues:cues.length,words:cues.reduce((n,c)=>n+c.words.length,0),groups:cues.reduce((n,c)=>n+c.groups.length,0),overlaps});
