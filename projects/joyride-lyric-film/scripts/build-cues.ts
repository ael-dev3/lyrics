import {readFileSync,writeFileSync} from 'node:fs';
import assert from 'node:assert/strict';
import {SR} from '../src/config.ts';
import type {Cue,Word} from '../src/schema.ts';
type W={word:string;start:number;end:number;probability?:number};type S={id:string;text:string;words:W[]};
const read=(name:string)=>(JSON.parse(readFileSync(`analysis/${name}.json`,'utf8')) as {segments:S[]}).segments;
const v=read('mms-vocals16'),m=read('mms-audio16'),e=read('wav2vec-vocals16'),a=read('attention-by-line'),b=read('bounded-vocals16');
const text=readFileSync('analysis/lyrics-user-en.txt','utf8').trim().split('\n');
const selected=v.map(s=>s.words.map(w=>({...w}))),edits:{line:string;word:number;field:string;before:unknown;after:unknown;reason:string}[]=[];
const edit=(line:number,k:number,field:'start'|'end',value:number,reason:string)=>{const w=selected[line-1]?.[k];assert(w);edits.push({line:`L${String(line).padStart(2,'0')}`,word:k,field,before:w[field],after:value,reason});w[field]=value;};
const choose=(line:number,k:number,source:'mix'|'english',reason:string)=>{const w=(source==='mix'?m:e)[line-1]?.words[k];assert(w);edit(line,k,'start',w.start,reason);edit(line,k,'end',w.end,reason);};
// Independently inspected 5 ms vocal-envelope panels; these are estimates,
// not a transferred chorus grid or certified acoustic boundaries.
const onset:Record<number,number>={1:12.44,2:15.41,3:18.105,4:21.07,5:23.96,7:29.435,8:32.36,17:57.64,18:60.60,19:63.295,20:66.22,21:69.15,22:71.95,23:74.605,24:77.54,26:83.025,27:84.45,30:90.11,33:95.74,35:99.92,37:102.82,38:105.765,39:108.45,40:111.39,41:114.31,42:117.14,43:119.805,44:122.715};
for(const [line,value] of Object.entries(onset))edit(Number(line),0,'start',value,'Reviewed vocal-envelope onset; reject alignment into preceding tail/silence. Short opening tokens are grouped; onset uncertainty remains explicit.');
for(const line of [3,19,39]){const w=selected[line-1]![0]!;edit(line,0,'end',Math.min(selected[line-1]![1]!.end,w.start+.10),'Short opening I; intra-group token split is representational, focus uses the connected I/don\'t group.');edit(line,1,'start',w.end,'Connected opening group; do not claim a separately resolved short-token consonant boundary.');}
for(const line of [2,4,5,7,8,17,18,20,21,23,26,27,30,33,35,37,38,40,41,43,44]){const w=selected[line-1]![0]!,next=selected[line-1]![1]!;if(w.end<=w.start)edit(line,0,'end',Math.min(next.end,Math.max(w.start+.04,next.start)),'Opening boundary repair within a connected group; preserve positive interval.');}
for(const line of [22,42]){choose(line,1,'english','MMS absorbed previous guarantee vowel; English encoder and local envelope locate the distinct girl onset.');choose(line,2,'english','Connected you after girl: English encoder avoids the preceding held vowel.');edit(line,0,'end',selected[line-1]![1]!.start,'But is released into the independently supported girl contact.');}
choose(11,4,'mix','Stem path absorbed the following that; mix and English encoder agree on like.');choose(11,5,'mix','Mix and English encoder agree near 42.43 s; reject stem drift near 42.97 s.');choose(11,6,'mix','Mix opening I is supported by independent English timing.');
for(const k of [1,2,3,4,5,6])choose(24,k,'mix','Local stem path drifts through take/you/for/a/ride; mix follows the independent English and attention phrase sequence.');
for(const k of [1,2,3,4,5])choose(38,k,'mix','Stem first-half drift; mix timing follows English encoder and bounded phrase evidence.');
choose(40,3,'mix','Longer for interval supported by mix and English encoder.');choose(40,4,'mix','Article placement follows mix within the grouped for/a/ride phrase.');
choose(40,5,'mix','Mix ride begins after its article; retain the observed source sequence.');
choose(44,2,'english','Independent English encoder separates you before for; both MMS paths drift together in this short sequence.');choose(44,3,'english','Independent English encoder places for at the earlier articulation.');
choose(10,2,'mix','Two independent encoders agree on the end of bad before the following I.');
for(const line of [24,38])edit(line,0,'end',selected[line-1]![1]!.start,'Connected opening: representational split at selected take; the entire I\'ll/take group shares one focus.');
edit(27,1,'start',selected[26]![0]!.end,'Connected I/don\'t group has an unresolved internal split; avoid overlapping token metadata.');
edit(44,1,'end',selected[43]![2]!.start,'Resolve the 20 ms cross-model overlap at the independently selected you contact.');
// Keep the final held vowel until the later plausible observation where the
// bounded-attention estimate extends a short terminal CTC label by <=350 ms.
for(let i=0;i<selected.length;i++){const last=selected[i]!.at(-1)!,att=b[i]!.words.at(-1)!;if(att.end>last.end&&att.end-last.end<=.35)edit(i+1,selected[i]!.length-1,'end',att.end,'Held terminal vowel: bounded-attention release extends the short CTC label; estimate retained with uncertainty.');}
const divisions:Record<number,number>={};
for(const base of [0,16,36])for(const [rel,cut] of [[2,6],[4,6],[5,6],[6,5],[8,6]])divisions[base+rel!]=cut!;
for(const [line,cut] of [[9,5],[10,3],[11,6],[12,5],[13,7],[14,5],[15,4],[25,4],[28,4],[31,4],[34,4]])divisions[line!]=cut!;
// Release a previous line at a reviewed next vocal onset when its alignment
// includes that attack. Preserve and record the pre-trim candidate.
for(let i=0;i<selected.length-1;i++){const last=selected[i]!.at(-1)!,next=selected[i+1]![0]!;if(last.end>next.start)edit(i+1,selected[i]!.length-1,'end',next.start,'Exclude the reviewed next phrase attack from the preceding held-word tail.');}
const cueList:Cue[]=[],decisions=[];
const norm=(s:string)=>s.toLowerCase().replace(/[^a-z']/g,'');
for(let i=0;i<selected.length;i++){
 const words=selected[i]!,original=text[i]!.split(/\s+/);assert.equal(words.length,original.length);
 const ranges=divisions[i+1]?[0,divisions[i+1]!,words.length]:[0,words.length];
 for(let part=0;part<ranges.length-1;part++){
  const lo=ranges[part]!,hi=ranges[part+1]!,slice=words.slice(lo,hi);
  const out:Word[]=slice.map((w,k)=>({text:original[lo+k]!,startSample:Math.round(w.start*SR),endSample:Math.round(w.end*SR),confidence:w.probability??0}));
  // Joined short tokens use stable semantic focus, avoiding 20 ms flashes.
  const groups:number[][]=[];
  for(let k=0;k<out.length;k++){
   const word=norm(out[k]!.text),next=norm(out[k+1]?.text??'');
   if(k+1<out.length&&((['i',"i'll"].includes(word))||(word==='in'&&next==='love')||(word==='for'&&next==='a')||(word==='if'&&next==='you')||(word==='a'&&['ride','guarantee'].includes(next))||(word==='and'&&next==="that's")||(word==='to'&&next==='you'))){groups.push([k,k+1]);k++;}else groups.push([k]);
  }
  const id=`L${String(i+1).padStart(2,'0')}${ranges.length>2?String.fromCharCode(97+part):''}`;
  cueList.push({id,section:i<8?'CHORUS 1':i<16?'VERSE':i<24?'CHORUS 2':i<36?'BRIDGE':'CHORUS 3',words:out,groups,startSample:out[0]!.startSample,endSample:out.at(-1)!.endSample});
 }
 decisions.push({id:v[i]!.id,text:text[i],selected:words,candidates:{vocalMMS:v[i]!.words,mixMMS:m[i]!.words,englishCTC:e[i]!.words,fullAttention:a[i]!.words,boundedAttention:b[i]!.words}});
}
assert.equal(cueList.flatMap(c=>c.words).length,395);assert.equal(cueList.length,70);
writeFileSync('src/cues.json',JSON.stringify(cueList,null,2));
writeFileSync('analysis/alignment-decisions.json',JSON.stringify({authority:'Supplied text; locked source samples at 48000 Hz',default:'Vocal MMS contacts, with independently reviewed source-specific edits. Candidate confidences are model scores, not calibrated timing probabilities.',onsetReview:'Vocal-onsets pages 1–4 visually inspected; 5 ms envelope supports phrase attacks, not separate consonant truth.',limits:'Connected initial tokens and held vowels retain uncertainty, commonly tens of milliseconds or more. No human/native-listener audition is claimed. Sample/frame precision is not acoustic accuracy.',edits,lines:decisions},null,2));
console.log({cues:cueList.length,words:395,groups:cueList.reduce((n,c)=>n+c.groups.length,0),edits:edits.length});
