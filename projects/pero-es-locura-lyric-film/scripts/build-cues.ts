import {readFileSync,writeFileSync,readdirSync} from 'node:fs';
import {createHash} from 'node:crypto';
import type {Cue,SourceWord,TargetWord,ProductionData} from '../src/schema.ts';
type Word={word:string;start:number;end:number;probability?:number;acousticSpans?:{start:number;end:number;score:number}[]};
type Segment={id:string;words:Word[]};
type Alignment={segments:Segment[]};
type Template={id:string;es:string;en:string;targets:{text:string;sourceIndices:number[]}[];note:string};
type Performance={id:string;section:string;start:number;end:number;text:string;displayGroups:string[][]};
const read=(p:string)=>JSON.parse(readFileSync(p,'utf8'));
const templates=read('source/translation-templates.json') as Template[],performances=read('source/performed-sequence.json') as Performance[];
const methods=['mms-vocals','mms-mix','whisper-mix'];
const sets=methods.map(method=>{
 const rows=(read('analysis/'+method+'-lines.json') as Alignment).segments;
 const path='analysis/'+method+'-corrections.json';
 try{for(const updated of (read(path) as Alignment).segments){const idx=rows.findIndex(r=>r.id===updated.id);if(idx>=0)rows[idx]=updated;else rows.push(updated);}}catch(e){if(!String(e).includes('ENOENT'))throw e;}
 return {method,rows};
});
const sr=44100,manifest=read('source/manifest.json'),samples=manifest.audio.decodedPaddedSampleCount as number;
const normal=(s:string)=>s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z]/g,'');
const median=(values:number[])=>{const s=[...values].sort((a,b)=>a-b),m=Math.floor(s.length/2);return s.length%2?s[m]??0:((s[m-1]??0)+(s[m]??0))/2;};
const ledger:{id:string;text:string;performance:string;startSample:number;endSample:number;candidates:{method:string;start:number;end:number;probability:number|null}[];selection:string;candidateSpreadMs:number}[]=[];
const cues:Cue[]=[];
for(const perf of performances){
 const textWords=perf.text.split(/\s+/),rows=sets.map(s=>({method:s.method,words:s.rows.find(r=>r.id===perf.id)?.words})).filter((r):r is {method:string;words:Word[]}=>!!r.words);
 if(rows.length!==3)throw Error('Need three alignment observations: '+perf.id);
 for(const r of rows)if(r.words.length!==textWords.length||r.words.some((w,i)=>normal(w.word)!==normal(textWords[i]??'')))throw Error('Alignment text mismatch '+perf.id+' '+r.method);
 const selected:SourceWord[]=textWords.map((text,i)=>{
  const candidates=rows.map(r=>{const w=r.words[i];if(!w)throw Error('Word missing');return {method:r.method,start:w.start,end:w.end,probability:w.probability??null};});
  const mms=candidates.filter(c=>c.method.startsWith('mms')),whisper=candidates.find(c=>c.method==='whisper-mix');if(!whisper)throw Error('Whisper missing');
  const ms=median(mms.map(c=>c.start)),me=median(mms.map(c=>c.end));
  let start=ms,end=median(candidates.map(c=>c.end));
  let selection='MMS agreement supplies the core; bounded Whisper onset is selected when within 180 ms and not pinned to the window edge; median release.';
  if(Math.abs(whisper.start-ms)<=.18&&whisper.start>perf.start+.015)start=whisper.start;
  else if(Math.abs((mms[0]?.start??0)-(mms[1]?.start??0))>.18&&whisper.start>perf.start+.015){start=median(candidates.map(c=>c.start));selection+=' Disagreeing MMS onsets use the three-observation median rather than the later stem outlier.';}
  const detachedTail=rows.filter(r=>r.method.startsWith('mms')).some(r=>{const spans=r.words[i]?.acousticSpans,tail=spans?.at(-1),prior=spans?.at(-2);return tail&&prior&&tail.start-prior.end>.35&&whisper.end<tail.start-.2&&Math.abs(whisper.end-prior.end)<.3;});
  if(detachedTail){end=whisper.end;selection+=' Reject detached final-character alignment across a silence/word gap; use the independently supported Whisper release near the preceding phonetic span.';}
  // Closing held vowel: the recognizer sees the vowel before MMS finds its late consonant.
  if(perf.id==='P054'&&i===1){start=261.12;selection='Held aún: select the earlier sustained-vowel entrance supported by original-mix and bounded vocal recognition; MMS anchors near the late /n/. Actual-audio review remains pending.';}
  if(end<=start+.012)end=Math.max(start+.02,me);
  const id=perf.id+'-s'+String(i+1).padStart(2,'0'),startSample=Math.round(Math.max(0,start)*sr),endSample=Math.min(samples,Math.round(end*sr));
  const spread=1000*Math.max(Math.max(...candidates.map(c=>c.start))-Math.min(...candidates.map(c=>c.start)),Math.max(...candidates.map(c=>c.end))-Math.min(...candidates.map(c=>c.end)));
  ledger.push({id,text,performance:perf.id,startSample,endSample,candidates,selection,candidateSpreadMs:spread});
  return {id,text,startSample,endSample,candidateSpreadMs:Math.round(spread*10)/10,reviewRequired:true};
 });
 for(let i=0;i<selected.length-1;i++){const w=selected[i],next=selected[i+1];if(w&&next&&w.endSample>next.startSample){if(next.startSample<=w.startSample)throw Error('Nonmonotone selected words '+w.id);w.endSample=next.startSample;const row=ledger.find(r=>r.id===w.id);if(row){row.endSample=w.endSample;row.selection+=' Overlap ends at the following selected onset.';}}}
 let offset=0;
 for(const group of perf.displayGroups){
  const cueId='C'+String(cues.length+1).padStart(3,'0'),es:SourceWord[]=[],en:TargetWord[]=[];
  for(const templateId of group){
   const template=templates.find(t=>t.id===templateId);if(!template)throw Error(templateId);
   const words=selected.slice(offset,offset+template.es.split(/\s+/).length);es.push(...words);
   for(const target of template.targets)en.push({id:cueId+'-e'+String(en.length+1).padStart(2,'0'),text:target.text,sourceIds:target.sourceIndices.map(index=>{const w=words[index-1];if(!w)throw Error('Unknown mapping');return w.id;})});
   offset+=words.length;
  }
  if(en[0])en[0].text=en[0].text.replace(/^\p{L}/u,c=>c.toLocaleUpperCase('en'));
  const startSample=Math.min(...es.map(w=>w.startSample)),endSample=Math.max(...es.map(w=>w.endSample));
  cues.push({id:cueId,section:perf.section,es,en,startSample,endSample,visibleFrom:Math.max(0,startSample-Math.round(.22*sr)),visibleUntil:Math.min(samples,endSample+Math.round(.25*sr))});
 }
}
for(let i=1;i<cues.length;i++){
 const prior=cues[i-1],cue=cues[i];if(!prior||!cue)throw Error('Cue missing');
 if(prior.endSample>cue.startSample){const last=prior.es.at(-1);if(last&&last.startSample<cue.startSample){last.endSample=cue.startSample;prior.endSample=cue.startSample;const row=ledger.find(r=>r.id===last.id);if(row){row.endSample=last.endSample;row.selection+=' Cross-window overlap ends at the next cue onset.';}}else throw Error('Cross cue collision');}
 if(prior.visibleUntil>cue.visibleFrom){const handoff=Math.round((prior.endSample+cue.startSample)/2);prior.visibleUntil=handoff;cue.visibleFrom=handoff;}
}
const data:ProductionData={sampleRate:sr,sampleCount:samples,duration:samples/sr,fps:60,frames:Math.ceil(samples/sr*60),audioSha256:manifest.audio.sha256 as string,cues};
writeFileSync('src/cues.json',JSON.stringify(data,null,2)+'\n');
writeFileSync('analysis/boundary-ledger.json',JSON.stringify(ledger,null,2)+'\n');
writeFileSync('source/lyrics-performed-es.txt',cues.map(c=>c.es.map(w=>w.text).join(' ')).join('\n')+'\n');
writeFileSync('source/lyrics-translated-en.txt',cues.map(c=>c.en.map(w=>w.text).join(' ')).join('\n')+'\n');
writeFileSync('evidence/alignment-summary.json',JSON.stringify({cues:cues.length,words:ledger.length,targetWords:cues.reduce((n,c)=>n+c.en.length,0),methods,disagreementsOver25ms:ledger.filter(x=>x.candidateSpreadMs>25).length,allWordsRequireListeningReview:true,scope:'Three model/signal observations; waveform and spectrogram are review aids. No actual-audio signoff is inferred.',inputHashes:Object.fromEntries(['source/performed-sequence.json','source/translation-templates.json',...readdirSync('analysis').filter(f=>/^(mms|whisper)-(mix|vocals)-(lines|corrections)\.json$/.test(f)).map(f=>'analysis/'+f)].map(f=>[f,createHash('sha256').update(readFileSync(f)).digest('hex')]))},null,2)+'\n');
console.log({cues:cues.length,words:ledger.length,targetWords:cues.reduce((n,c)=>n+c.en.length,0)});
console.log(ledger.filter(w=>w.candidateSpreadMs>400).map(w=>({id:w.id,text:w.text,selected:[w.startSample/sr,w.endSample/sr],candidates:w.candidates})));
