import {readFileSync,writeFileSync} from 'node:fs';
import {parseData} from '../src/schema.ts';
const d=parseData(JSON.parse(readFileSync('src/cues.json','utf8'))),words=d.cues.flatMap(c=>c.ru),raw=readFileSync('analysis/vocals16.f32'),pcm=new Float32Array(raw.buffer,raw.byteOffset,raw.byteLength/4);
const selected=['VE-019-s02','VE-020-s03','VE-021-s01','VE-035-s02','VE-036-s03','VE-037-s01','VE-043-s01','VE-049-s01'];
const ledger=JSON.parse(readFileSync('analysis/boundary-ledger.json','utf8')) as {id:string;candidates:{method:string;start:number;end:number}[]}[];
function feature(t:number){const center=Math.round(t*16000),n=640,a=center-n/2;let power=0;for(let i=0;i<n;i++)power+=(pcm[a+i]??0)**2;let periodicity=0;for(let lag=22;lag<=213;lag++){let cross=0,left=0,right=0;for(let i=0;i<n-lag;i++){const x=pcm[a+i]??0,y=pcm[a+i+lag]??0;cross+=x*y;left+=x*x;right+=y*y;}periodicity=Math.max(periodicity,cross/Math.sqrt(Math.max(1e-18,left*right)));}return {rms:Math.sqrt(power/n),periodicity};}
const output=selected.map(id=>{const index=words.findIndex(w=>w.id===id),word=words[index],next=words[index+1],original=ledger.find(w=>w.id===id)?.candidates.find(c=>c.method==='MMS vocal stem');if(!word||!next||!original)throw Error('Held-vowel selection missing');const start=original.start,end=original.end,limit=next.startSample/d.sampleRate;
 const reference=feature(Math.max(start+.025,end-.045)),threshold=Math.max(.004,reference.rms*.16),trace=[];let last=end,quiet=0;
 for(let t=end-.02;t<limit-.015;t+=.01){const f=feature(t),voiced=f.rms>=threshold&&f.periodicity>=.58;trace.push({time:+t.toFixed(4),...f,voiced});if(voiced){quiet=0;last=t;}else quiet++;if(quiet>=5)break;}
 const proposedEnd=Math.max(end,Math.min(limit,last+.015));return {id,text:word.text,originalEnd:end,nextOnset:limit,proposedEnd,threshold,trace,note:'Provisional held-vowel continuation from vocal-stem periodicity and energy, within this performance only. Not a listening attestation; consonants, reverb and stem bleed remain review limitations.'};});
writeFileSync('analysis/held-vowel-candidates.json',JSON.stringify(output,null,2)+'\n');console.log(output.map(({trace,...x})=>x));
