import {readFileSync,writeFileSync} from 'node:fs';
import assert from 'node:assert/strict';
import type {Cue,Word} from '../src/schema.ts';
import {SR} from '../src/config.ts';
type Observation={word:string;start:number;end:number;probability?:number};
type Segment={id:string;text:string;words:Observation[]};
const read=(name:string)=>(JSON.parse(readFileSync(`analysis/${name}.json`,'utf8')) as {segments:Segment[]}).segments;
const vocal=read('mms-vocals16'),mix=read('mms-audio16'),english=read('wav2vec-vocals16'),attention=read('bounded-vocals16');
type Edit={start?:number;end?:number;fromMix?:boolean;reason:string};
const edits:Record<string,Record<number,Edit>>={
 L01:{0:{start:15.99,reason:'Attention onset and isolated-vocal rise precede the CTC vowel spike; paired with know.'}},
 L05:{0:{start:32.02,reason:'Attention agrees with the CTC contact; paired with know.'},5:{end:33.94,reason:'Mix CTC and independent English encoder release before the following You; avoids a vocal-stem window-edge hold.'}},
 L06:{0:{start:34.112,reason:'Independent English encoder and mix CTC agree on the earlier contact.'}},
 L09:{0:{start:42.12,reason:'Distinct vocal-envelope rise just after 42.1 s; the CTC I spike lands inside that vowel. Paired I/can’t focus.'}},
 L12:{0:{start:58.96,reason:'Vocal-envelope rise preceding the short CTC I token; paired I/swear focus.'}},
 L14:{0:{start:66.94,reason:'Vocal-envelope contact; paired I/swear focus.'},1:{fromMix:true,reason:'Vocal CTC incorrectly extends swear across the rest of the phrase; mix CTC, English encoder and attention agree on a short word.'},2:{start:67.55,end:67.83,reason:'Bounded attention plus mix CTC and English encoder support this interval; reject late low-confidence vocal CTC path.'},3:{start:68.02,end:70.2,reason:'Mix CTC and independent English encoder place mine near 68 s; retain the held vowel through the visible envelope decay. Release remains approximate.'}},
 L15:{0:{start:72.5,reason:'Bounded attention and vocal onset; short I is grouped with hope.'}},
 L19:{0:{start:80.1,reason:'English encoder detects the initial Able vowel at 80.081 s; MMS anchors later on its consonants. Attention also places the word before 80.744 s.'}},
 L23:{0:{start:90.68,reason:'Clear stem onset near 90.68 s, supported by mix CTC 90.766 s; do not wait for the vowel spike at 91.027 s.'}},
 L25:{0:{start:105.56,end:105.60,reason:'Reject zero-confidence vocal CTC start in the preceding sustained phrase. This ambiguous In/this transition is presented as one group with onset uncertainty retained.'}},
 L26:{0:{start:107.48,reason:'Vocal-envelope attack precedes the very short CTC I spike; paired with swear.'}},
 L28:{0:{start:115.46,reason:'Stem energy contact and MMS agree near 115.49 s; reject the isolated English-encoder token at 115.05 s.'},3:{end:119.28,reason:'Held vowel begins near 116.49 s in both acoustic encoders. Review envelope rolloff near 119.3 s; do not treat the reverberant tail as an exact word end.'}},
 L29:{0:{start:136.65,reason:'Clear vocal attack from silence near 136.65 s, also supported by full/bounded attention. The CTC I spike is late inside the vowel; paired I/can’t focus.'}},
 L31:{0:{start:144.64,reason:'Visible vocal-energy rise near 144.64 s and mix CTC at 144.735 s; paired I/keep focus.'}},
};
const groupMap:Record<string,number[][]>={L01:[[0,1],[2,3],[4],[5]],L05:[[0,1],[2,3],[4],[5]],L07:[[0,1],[2],[3],[4]],L08:[[0],[1],[2],[3,4]],L09:[[0,1],[2],[3],[4],[5]],L11:[[0,1],[2]],L12:[[0,1],[2],[3]],L14:[[0,1],[2],[3]],L15:[[0,1],[2,3],[4],[5]],L21:[[0,1],[2],[3]],L23:[[0,1],[2],[3],[4],[5]],L25:[[0,1],[2]],L26:[[0,1],[2],[3]],L28:[[0,1],[2],[3]],L29:[[0,1],[2],[3],[4],[5]],L31:[[0,1],[2],[3],[4],[5]]};
const audit:unknown[]=[];
const cues:Cue[]=vocal.map((s,i)=>{
 const words:Word[]=s.words.map((v,k)=>{
  const m=mix[i]?.words[k],e=english[i]?.words[k],a=attention[i]?.words[k];assert(m&&e&&a);
  assert.equal(v.word.toLowerCase(),m.word.toLowerCase());assert.equal(v.word.toLowerCase(),e.word.toLowerCase());
  const edit=edits[s.id]?.[k],base=edit?.fromMix?m:v;
  const start=edit?.start??base.start,end=edit?.end??base.end;
  audit.push({cue:s.id,word:v.word,selected:{start,end},selection:edit?.reason??'Vocal-stem MMS CTC primary; independent mix CTC, English acoustic encoder and attention retained for review.',candidates:{vocalMMS:v,mixMMS:m,englishCTC:e,boundedAttention:a},candidateOnsetSpreadMs:1000*(Math.max(v.start,m.start,e.start,a.start)-Math.min(v.start,m.start,e.start,a.start)),reviewNote:'Model scores are not calibrated acoustic accuracy; attention often absorbs preceding gaps and CTC often collapses sustained vowels.'});
  return {text:v.word,startSample:Math.round(start*SR),endSample:Math.round(end*SR),confidence:base.probability??0};
 });
 for(let k=0;k<words.length-1;k++){const w=words[k],next=words[k+1];assert(w&&next);w.endSample=Math.min(w.endSample,next.startSample);assert(w.endSample>w.startSample,s.id+' '+w.text);}
 const first=words[0],last=words.at(-1);assert(first&&last);
 return {id:s.id,section:i<8?'verse 1':i<14?'chorus 1':i<22?'verse 2':i<28?'chorus 2':'closing verse',words,groups:groupMap[s.id]??words.map((_,k)=>[k]),startSample:first.startSample,endSample:last.endSample};
});
const overlapClamps:unknown[]=[];
for(let i=0;i<cues.length-1;i++){const c=cues[i],n=cues[i+1];assert(c&&n);if(c.endSample>n.startSample){const last=c.words.at(-1);assert(last);overlapClamps.push({cue:c.id,oldEndSample:c.endSample,newEndSample:n.startSample});last.endSample=n.startSample;c.endSample=n.startSample;}}
writeFileSync('src/cues.json',JSON.stringify(cues,null,2));
writeFileSync('analysis/alignment-decisions.json',JSON.stringify({authority:'Supplied English text; 48 kHz integer sample clock',primary:'MMS-FA on separated vocal stem',independent:'MMS-FA mix; wav2vec2 BASE 960h English encoder; bounded Whisper large-v3-turbo attention',manualSelectionEdits:edits,grouping:'Short I/function tokens and ambiguous connected words share explicit focus groups; no arbitrary evenly-spaced word timings.',repeatTransfer:'None: independently searched waveform correlations were too low to justify copying choruses.',overlapClamps,words:audit,limits:'Acoustic boundaries remain inferred, especially short vowels, In/this in chorus 2 and sustained/reverberant endings. Evidence includes models and visible waveforms; no native-listener audition is claimed.'},null,2));
console.log({cues:cues.length,words:cues.reduce((n,c)=>n+c.words.length,0),groups:cues.reduce((n,c)=>n+c.groups.length,0),overlapClamps});
