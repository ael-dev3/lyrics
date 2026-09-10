import {readFileSync,writeFileSync} from 'node:fs';
import assert from 'node:assert/strict';
type W={word:string;start:number;end:number;score?:number};
type Cue={id:string;part:number;line:number;startSample:number;endSample:number;words:{text:string;startSample:number;endSample:number;uncertaintyMs:number;evidence:string}[];en:{text:string;words:number[]}[];groups?:number[][]};
const cues=JSON.parse(readFileSync('src/cues.json','utf8')) as Cue[];
const offsets=[0,45,60.15,106.5,121.75],sr=48000;
const firstStarts=[.941,45.981,60.931,107.781,122.792];
// Reviewed soft entrances: consonantal onset is earlier than CTC's high-confidence vowel.
const socialStarts=[3.82,48.84,63.87,110.54],cancelStarts=[9.50,54.52,69.51,116.35];
const groupMap=[[[0],[1,2]],[[0,1],[2],[3]],[[0],[1,2]],[[0],[1]],[[0,1,2],[3],[4]]];
const records:unknown[]=[];
for(let p=0;p<5;p++){
 const offset=offsets[p]!;
 const stem=(JSON.parse(readFileSync(`../prygay-source/aligned-window-${p}.json`,'utf8')) as {segments:{words:W[]}[]}).segments;
 const mix=(JSON.parse(readFileSync(`../prygay-source/aligned-mix-${p}.json`,'utf8')) as {segments:{words:W[]}[]}).segments;
 const ctc=JSON.parse(readFileSync(`../prygay-source/mms-${p}.json`,'utf8')) as W[];
 let wi=0;
 for(const c of cues.filter(c=>c.part===p+1)){
  const l=c.line-1,ss=stem[l]!.words,mm=mix[l]!.words;
  const groups=groupMap[l];assert(groups);c.groups=groups;
  c.words.forEach((w,j)=>{
   const a=ss[j]!,b=mm[j]!,d=ctc[wi++]!;
   const cand=[offset+a.start,offset+b.start,offset+d.start];
   let start=(cand[0]!+cand[1]!)/2,end=offset+d.end;
   if(l===0){start=j===0?firstStarts[p]!:j===1?offset+a.start:(offset+a.start+offset+d.start)/2;}
   if(l===1){start=j===0?socialStarts[p]!:j===1?offset+a.start:j===2?offset+a.start:offset+d.start;}
   if(l===2){start=j===0?offset+d.start:j===1?offset+d.start-.035:offset+d.start;}
   if(l===3){start=j===0?cancelStarts[p]!:offset+d.start;}
   if(l===4){start=offset+d.start;}
   if(end<=start+.045)end=Math.max(start+.06,offset+a.end);
   w.startSample=Math.round(start*sr);w.endSample=Math.round(end*sr);
   w.uncertaintyMs=Math.max(25,Math.round((Math.max(...cand)-Math.min(...cand))*1000/2));
   w.evidence='Windowed stable-whisper on separated vocal and mix; independent MMS-FA CTC; waveform/spectrogram review. Grouped short/ambiguous units.';
   records.push({cue:c.id,word:w.text,candidates:{stem:offset+a.start,mix:offset+b.start,mms:offset+d.start,mmsEnd:offset+d.end,mmsScore:d.score},selectedStart:start,selectedEnd:end,spreadMs:Math.round((Math.max(...cand)-Math.min(...cand))*1000),review:l===1&&j===0?'retain early fricative; group compound with following noun':l===3&&j===0?'retain soft entrance; CTC may select later vowel':p===4&&j===0?'reject aligner crop-edge placement; use isolated-vocal CTC onset':l===4?'CTC phoneme evidence preferred over early Whisper boundaries':'reviewed model candidates and vocal evidence'});
  });
  for(let j=0;j<c.words.length-1;j++){const a=c.words[j]!,b=c.words[j+1]!;a.endSample=Math.min(a.endSample,b.startSample);assert(a.endSample>a.startSample,c.id+' word order');}
  // Each compound highlights as one performed meaning unit, avoiding dubious internal contacts.
  c.startSample=c.words[0]!.startSample;c.endSample=c.words.at(-1)!.endSample;
 }
}
assert.equal(cues.length,21);assert.equal(cues.flatMap(c=>c.words).length,71);
writeFileSync('src/cues.json',JSON.stringify(cues,null,2));
writeFileSync('analysis/alignment-evidence.json',JSON.stringify({sampleRate:sr,method:'Independent windowed Whisper and multilingual CTC alignment, waveform/spectrogram inspection, meaning-group reconciliation',words:records,limitations:'Candidate spread is disagreement, not a calibrated confidence interval. Musical vocals and fricatives retain uncertainty. No human-listening or ground-truth sample-accuracy certification. Whisper probability-refinement collapsed words and was rejected; whisper.cpp DTW timestamps returned -1 and were excluded.'},null,2));
console.log({cues:21,sourceWords:71,highlightUnits:cues.reduce((n,c)=>n+(c.groups?.length??0),0)});
