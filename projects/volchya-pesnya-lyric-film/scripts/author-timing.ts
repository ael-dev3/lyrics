import {readFileSync,writeFileSync,existsSync} from 'node:fs';
import assert from 'node:assert/strict';
const root=new URL('../',import.meta.url),read=(p:string)=>JSON.parse(readFileSync(new URL(p,root),'utf8'));
if(existsSync(new URL('source/selected-boundaries.json',root)))throw Error('Selections already exist; edit the canonical data instead of replacing reviewed work.');
const recording=read('source/recording.json'),editorial=read('source/editorial-templates.json'),plan=read('source/acoustic-crop-plan.json');
const bytes=readFileSync(new URL('analysis/vocals16.wav',root));let dataOffset=0,dataBytes=0;
for(let at=12;at+8<=bytes.length;){const id=bytes.toString('ascii',at,at+4),length=bytes.readUInt32LE(at+4);if(id==='data'){dataOffset=at+8;dataBytes=Math.min(length,bytes.length-dataOffset);break}at+=8+length+(length%2)}
assert.ok(dataOffset&&dataBytes%4===0);const vocal=new Float32Array(bytes.buffer,bytes.byteOffset+dataOffset,dataBytes/4),rate=16000;
function rms(t:number){let sum=0,n=0;for(let i=Math.max(0,Math.round((t-.012)*rate));i<Math.min(vocal.length,Math.round((t+.012)*rate));i++){sum+=vocal[i]!**2;n++}return Math.sqrt(sum/Math.max(1,n))}
function supportedRenewal(core:number){
 const threshold=Math.max(.0015,rms(core+.035)*.085);let lastLow:number|undefined;
 for(let t=core-.28;t<core;t+=.002)if(rms(t)<threshold)lastLow=t;
 if(lastLow===undefined)return undefined;
 for(let t=lastLow;t<=core;t+=.002)if(rms(t)>=threshold&&rms(t+.008)>=threshold&&rms(t+.018)>=threshold)return t;
 return undefined;
}
const norm=(s:string)=>s.toLowerCase().replaceAll('ё','е').replace(/[^а-я]/g,'');
type Selected={text:string;startSample:number;endSample:number;phraseId:string;phraseWordIndex:number;method:string;uncertainty:string;observations:unknown};
const selected:Record<string,Selected[]>={},observations:unknown[]=[],changes:unknown[]=[];
// Explicit paired handoff/release selections, including quiet core entrances
// and performed vowel support that character paths omit. These are preview
// proposals backed by original/stem/signal evidence, not a listening log.
const onsets:Record<string,number>={
 'P01:0':11.982,'P01:7':21.612,'P02:0':31.282,'P02:5':33.614,'P03:0':40.772,'P03:6':43.214,
 'P04:0':49.718,'P04:9':59.310,'P04:19':64.790,'P04:20':67.146,
 'P05:0':79.216,'P05:10':88.776,'P05:15':92.334,'P05:16':92.520,
 'P06:0':98.388,'P06:8':108.098,'P06:10':110.432,'P06:11':112.036,
 'P07:0':116.816,'P07:9':126.488,'P07:19':131.962,'P07:20':134.332,
 'P08:0':145.688,'P08:2':147.060,
 'P09:0':174.402,'P09:9':184.090,'P09:19':189.802,'P09:20':190.722,'P09:21':192.140,'P09:22':193.098,
 'P10:0':203.216,'P10:10':208.760,'P10:11':211.116,'P10:22':218.214,'P10:23':220.638,
};
const releases:Record<string,number>={
 'P01:6':19.780,'P01:10':23.852,'P01:14':27.196,
 'P02:4':33.564,'P02:8':36.764,'P03:5':43.174,'P03:9':46.368,
 'P04:8':57.092,'P04:19':66.574,'P04:20':69.026,
 'P05:9':86.168,'P05:17':96.130,'P06:7':106.264,'P06:12':113.476,
 'P07:8':124.252,'P07:19':133.826,'P07:20':136.878,
 'P09:8':181.006,'P09:19':190.472,'P09:20':191.514,'P09:21':192.872,'P09:22':194.392,
 'P10:10':210.668,'P10:11':212.840,'P10:22':220.326,'P10:23':223.324,
};
for(const phrase of plan.phrases){
 if(phrase.id==='P11')continue;
 const original=read(`analysis/mms-original/mms-${phrase.id}.json`),estimate=read(`analysis/mms-vocal/mms-${phrase.id}.json`),whisper=read(`analysis/whisper-${phrase.id}.json`),ws=whisper.segments.flatMap((s:any)=>s.words);
 assert.equal(original.words.length,phrase.units.length);assert.equal(estimate.words.length,phrase.units.length);assert.equal(ws.length,phrase.units.length);
 const rows:Selected[]=phrase.units.map((text:string,i:number)=>{
  const m=original.words[i],v=estimate.words[i],w=ws[i];assert.equal(norm(text),norm(w.word));
  const core=Math.min(m.startSeconds,v.startSeconds),supportEdge=core-.01246875,delta=supportEdge-w.start;
  let start=supportEdge,method='MMS first-character receptive-support edge; unresolved acoustic tolerance retained.';
  if(delta>=0&&delta<=.16&&w.start>phrase.crop[0]+.12){start=w.start;method='Connected original-mix attention entrance within the character-support neighborhood; original/stem cores retained.'}
  else if(delta>.16){const renewal=supportedRenewal(core);if(renewal!==undefined&&renewal>=core-.27){start=renewal;method='Source-clocked diagnostic vocal renewal supports a quieter pre-core entrance; long attention silence allocation rejected.'}}
  const key=`${phrase.id}:${i}`;
  if(onsets[key]!==undefined){start=onsets[key]!;method='Explicit quiet/connected entrance selection from original/stem character, attention and source-aligned signal candidates; listener review pending.'}
  const coreEnd=Math.max(m.endSeconds,v.endSeconds)+.01246875;
  let end=Math.max(coreEnd,w.end<=coreEnd+.24?w.end:coreEnd+.045);
  if(releases[key]!==undefined)end=releases[key]!;
  const record={text,startSample:Math.round(start*44100),endSample:Math.round(end*44100),phraseId:phrase.id,phraseWordIndex:i,method,uncertainty:'Preview candidate; model/signal support is not millisecond phonetic certification or direct assistant audition.',observations:{originalMms:{start:m.startSeconds,end:m.endSeconds,score:m.score},vocalMms:{start:v.startSeconds,end:v.endSeconds,score:v.score},originalAttention:{start:w.start,end:w.end},originalStemDisagreementSeconds:Math.abs(m.startSeconds-v.startSeconds)}};
  observations.push({id:key,text,...record.observations});if(onsets[key]!==undefined||releases[key]!==undefined)changes.push({id:key,text,onsetSeconds:start,releaseSeconds:end,reason:releases[key]!==undefined?'Independent direct-body/renewal release selection; character endpoint or broad allocation cannot define a held ending.':'Quiet entrance and attention overhang audit.'});
  return record;
 });
 // Never steal the next event. Linked handoffs are selected once from the
 // actual next onset, preserving real quiet gaps rather than filling them.
 for(let i=0;i<rows.length-1;i++){const current=rows[i]!,next=rows[i+1]!;if(current.endSample>next.startSample)current.endSample=next.startSample;assert.ok(current.endSample>current.startSample,`Invalid selected ownership ${phrase.id}/${i}`)}
 selected[phrase.id]=rows;
}
// Preserve source-conditioned original alternatives and separately selected
// lexical corrections. Timeline text follows the editorial wording.
const finalText=editorial.sequence.find((s:any)=>s.phrase==='P11').templates.flatMap((id:string)=>editorial.entries.find((t:any)=>t.id===id).sourceUnits);
const finalRanges=[[231.966,232.068],[232.068,232.506],[232.506,234.370],[234.370,235.786],[237.484,238.004],[238.004,239.204],[239.838,240.342],[240.342,245.602],[247.006,248.736],[249.394,255.594]];
assert.equal(finalText.length,finalRanges.length);
selected.P11=finalText.map((text:string,i:number)=>({text,startSample:Math.round(finalRanges[i]![0]!*44100),endSample:Math.round(finalRanges[i]![1]!*44100),phraseId:'P11',phraseWordIndex:i,method:'Narrow original/vocal refinement plus source-aligned held-body/renewal selection. Broad original CTC collapse and attention overhang rejected.',uncertainty:i===0?'Quiet preposition inferred consistently by unconstrained original/stem recognition; direct audition pending.':'Ending word ownership/held vowel needs owner listening review; passive final decay excluded.',observations:{refinement:'source/acoustic-refinement-plan.json',rejectedBroadMms:'source/acoustic-observations.json'}}));
const output={schemaVersion:1,revision:'volchya-pesnya-preview-v1',sourceSha256:recording.sourceSha256,sampleRate:44100,status:'Selected preview boundaries; complete listening review remains pending.',selectionScope:'Explicit sample events retain independent diagnostics. No assistant direct audition was available; audio playback input was unsupported. No production authorization is implied.',phrases:selected};
writeFileSync(new URL('source/selected-boundaries.json',root),JSON.stringify(output,null,2)+'\n');
writeFileSync(new URL('source/acoustic-observations.json',root),JSON.stringify({schemaVersion:1,sourceSha256:recording.sourceSha256,originalInput:'Original mix 16 kHz derivative, source zero preserved',vocalInput:'HTDemucs diagnostic estimate with identical native sample count and six zero-lag checks',models:['stable-whisper large-v3-turbo attention','torchaudio MMS_FA original mix','torchaudio MMS_FA diagnostic vocal','Whisper small unconstrained coverage'],independenceLimit:'Whisper checkpoints, crops and source/stem variants are correlated observations, not listening votes. MMS is a separate conditioned model family, not independent lexical truth.',observations,explicitSelections:changes,rejectedExamples:[{area:'Prelude and phrase gaps',failure:'Attention/recognition assigns preceding music or previous held vowels to a later first word; crop starts are not vocal onsets.'},{area:'Broad outro original CTC',failure:'Serdtse through begi collapses onto 232–241 s with scores 0.008–0.184; narrower crops and original/vocal comparison retained instead.'},{area:'Closing naperegonki',failure:'Attention assigns the preceding held begi from 243.4 s to naperegonki. Character cores at 247.2/249.6 s omit long direct vowel support through 255.6 s.'},{area:'259 s',failure:'Unprompted original recognition invents a closing continuation caption; supplied birds/source tail is retained without a lyric cue.'}]},null,2)+'\n');
console.log(JSON.stringify({phrases:Object.keys(selected).length,selectedWords:Object.values(selected).reduce((n,a)=>n+a.length,0),explicitSelections:changes.length,lastLexicalEnd:255.594}));
