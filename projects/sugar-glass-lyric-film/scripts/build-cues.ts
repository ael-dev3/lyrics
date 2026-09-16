import {readFileSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {parseData,object,array,str,num} from '../src/schema.ts';
import type {Cue,SourceWord} from '../src/schema.ts';
const read=(p:string):unknown=>JSON.parse(readFileSync(p,'utf8'));
const plan=object(read('source/text-and-mapping.json'));
const methods=[['mms-vocals','analysis/mms-vocals-revised.json'],['wav2vec-vocals','analysis/wav2vec-vocals16.json'],['whisper-vocals','analysis/whisper-vocals-lines.json'],['mms-mix','analysis/mms-mix-lines.json']] as const;
const corrected=array(object(read('analysis/whisper-vocals-corrected.json')).segments).map(object);
const candidates=methods.map(([method,path])=>({method,segments:array(object(read(path)).segments).map(object).map(seg=>method==='whisper-vocals'?(corrected.find(c=>c.id===seg.id)??seg):seg)}));
const sr=44100,sampleCount=10202112,duration=sampleCount/sr;
const median=(v:number[])=>{const a=[...v].sort((x,y)=>x-y);return a[Math.floor(a.length/2)]??0;};
const ledger:unknown[]=[];
const cues:Cue[]=array(plan.rows).map(value=>{
 const row=object(value),id=str(row.id),tokens=str(row.text).split(/\s+/),a=num(row.start),b=num(row.end);
 const layer=row.layer==='backing'?'backing':'main';
 const source:SourceWord[]=tokens.map((text,i)=>{
  const options=candidates.flatMap(({method,segments})=>{const seg=segments.find(s=>s.id===id);if(!seg)return[];const raw=array(seg.words)[i];if(!raw)return[];const word=object(raw),start=num(word.start),end=num(word.end);return [{method,start,end,probability:typeof word.probability==='number'?word.probability:null,usable:end>start&&start>=a-.025&&end<=b+.025}];});
  const ctc=options.filter(o=>o.usable&&(o.method==='mms-vocals'||o.method==='wav2vec-vocals'));
  const first=ctc[0];if(!first)throw Error('No independent CTC boundary '+id+' '+text);
  // Local phonetic activity avoids attention onsets stretched over silent gaps.
  // All candidate disagreements remain visible and require listening review.
  const start=ctc.length===2?Math.min(...ctc.map(o=>o.start)):first.start;
  const near=options.filter(o=>o.usable&&Math.abs(o.start-start)<.2&&o.end-o.start<1.8);
  const end=Math.max(start+1/sr,median((near.length?near:ctc).map(o=>o.end)));
  const spread=1000*Math.max(Math.max(...options.map(o=>o.start))-Math.min(...options.map(o=>o.start)),Math.max(...options.map(o=>o.end))-Math.min(...options.map(o=>o.end)));
  const word={id:`${id}-s${String(i+1).padStart(2,'0')}`,text,startSample:Math.round(start*sr),endSample:Math.round(end*sr),candidateSpreadMs:Math.round(spread*1000)/1000,reviewRequired:spread>25||layer==='backing'||row.section==='Post-chorus'};
  ledger.push({...word,candidates:options,selection:'Provisional local CTC onset; robust release from nearby candidates. Not a completed listening review.'});return word;
 });
 for(let i=0;i<source.length-1;i++){const word=source[i],next=source[i+1];if(!word||!next)throw Error('Word missing');if(word.startSample>=next.startSample)throw Error('Reversed candidate '+word.id);word.endSample=Math.min(word.endSample,next.startSample);}
 const target=array(row.targets).flatMap((value,j)=>{const t=object(value),ids=array(t.sourceIndices).map(num).map(i=>{const w=source[i];if(!w)throw Error('Target source missing');return w.id;});return str(t.text).split(/\s+/).map((text,k)=>({id:`${id}-t${j+1}-${k+1}`,text,sourceIds:ids}));});
 const startSample=Math.min(...source.map(w=>w.startSample)),endSample=Math.max(...source.map(w=>w.endSample));
 return {id,section:str(row.section),layer,source,target,startSample,endSample,visibleFrom:Math.max(0,startSample-Math.round(.20*sr)),visibleUntil:Math.min(sampleCount,endSample+Math.round(.22*sr))};
});
for(const layer of ['main','backing']){
 const sequence=cues.filter(c=>c.layer===layer).sort((a,b)=>a.startSample-b.startSample);
 for(let i=1;i<sequence.length;i++){const prev=sequence[i-1],cur=sequence[i];if(!prev||!cur)throw Error('Missing cue');if(prev.endSample>cur.startSample)throw Error('Same-layer vocal overlap '+prev.id+' '+cur.id);
  if(prev.visibleUntil>cur.visibleFrom){const handoff=Math.round((prev.endSample+cur.startSample)/2);prev.visibleUntil=handoff;cur.visibleFrom=handoff;}
 }
}
cues.sort((a,b)=>a.startSample-b.startSample);
const data=parseData({sampleRate:sr,sampleCount,duration,fps:60,frames:Math.ceil(duration*60),audioSha256:createHash('sha256').update(readFileSync('public/soundtrack.m4a')).digest('hex'),cues});
for(const raw of ledger){const item=object(raw);const selected=cues.flatMap(c=>c.source).find(w=>w.id===item.id);Object.assign(item,selected);}
writeFileSync('src/cues.json',JSON.stringify(data,null,2)+'\n');
writeFileSync('analysis/boundary-ledger.json',JSON.stringify(ledger,null,2)+'\n');
console.log({cues:cues.length,words:cues.reduce((n,c)=>n+c.source.length,0),russianWords:cues.reduce((n,c)=>n+c.target.length,0),reviewRequired:cues.flatMap(c=>c.source).filter(w=>w.reviewRequired).length});
