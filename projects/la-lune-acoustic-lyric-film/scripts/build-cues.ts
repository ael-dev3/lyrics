import {readFileSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {parseData} from '../src/schema.ts';
import type {SourceWord,Cue} from '../src/schema.ts';
const json=(p:string)=>JSON.parse(readFileSync(p,'utf8'));
type Candidate={word:string;start:number;end:number};
type Segment={id:string;words:Candidate[]};
const lines=json('source/lyrics-fr.json') as string[],translations=json('source/translation.json') as {en:string;map:number[][]}[];
const primary=(json('analysis/mms-vocals-lines.json') as {segments:Segment[]}).segments;
const secondary=(json('analysis/whisper-vocals-lines.json') as {segments:Segment[]}).segments;
const broad=(json('analysis/mms-vocals-sections.json') as {segments:Segment[]}).segments.flatMap(x=>x.words);
const mix=(json('analysis/mms-mix-sections.json') as {segments:Segment[]}).segments.flatMap(x=>x.words);
const pcm=readFileSync('analysis/audio-delivery.f32'),sampleRate=44100,sampleCount=pcm.length/8,duration=sampleCount/sampleRate;
const hash=(p:string)=>createHash('sha256').update(readFileSync(p)).digest('hex');
// Selected preview endpoints from model comparison and the retained vocal spectrogram.
// These are not a completed listening review.
const overrides:Record<string,{start?:number;end?:number;reason:string}>={
 '0:2':{end:28.82,reason:'Resolve bounded-window overlap before the next phrase.'},
 '1:3':{end:31.72,reason:'Retain the harmonic sustain; decline into diffuse tail around 31.7–31.9.'},
 '2:2':{end:37.08,reason:'Voiced structure continues past the short Whisper core; tail thins near 37.1.'},
 '3:2':{end:40.40,reason:'Keep the observed final vocal energy; later energy is diffuse.'},
 '4:0':{end:44.49,reason:'Two independent Whisper observations place the following word near 44.5.'},
 '4:1':{start:44.49,reason:'Bounded Whisper and small free recognition agree; MMS onset appears late.'},
 '4:5':{end:47.36,reason:'Conservative handoff within conflicting candidate intervals.'},
 '4:6':{start:47.36,end:47.82,reason:'Bounded Whisper and small recognition support an earlier consonant contact than MMS.'},
 '4:7':{start:47.82,end:49.02,reason:'Preserve restriction and final vowel, with harmonic decay near 49.0.'},
 '5:0':{end:51.31,reason:'Whisper observations agree on the early following pronoun.'},
 '5:1':{start:51.31,end:51.75,reason:'Connected delivery: model comparison supports the pronoun before the MMS phonetic core.'},
 '5:5':{end:55.38,reason:'Harmonic sustain is visible through 55.3; neither short model core includes the full note.'},
 '6:1':{end:58.45,reason:'Harmonic sustain remains strong until about 58.4 before rapid decay.'},
 '7:1':{end:85.64,reason:'Remove window-edge overlap with the following line.'},
 '8:1':{end:88.43,reason:'Retain vocal energy to the decay around 88.4.'},
 '9:2':{start:92.40,end:94.08,reason:'MMS and small free recognition support contact near 92.4; retain the sung tail.'},
 '10:1':{end:97.20,reason:'Harmonic support decays into diffuse energy after 97.2.'},
 '11:1':{end:103.08,reason:'Whisper observes the full connected vowel beyond the short MMS core.'},
 '11:4':{end:105.78,reason:'Retain the sustained note through the strong harmonic decay.'},
 '12:3':{end:112.84,reason:'Voiced sustain ends before the next title phrase; diffuse tail remains uncertain.'},
 '13:1':{end:115.10,reason:'Final harmonic decay becomes weak and diffuse after 115.1.'}
};
const ledger:unknown[]=[];let globalIndex=0;
const cues:Cue[]=lines.map((line,ci)=>{
 const id='LL-'+String(ci+1).padStart(2,'0'),p=primary[ci],q=secondary[ci],tr=translations[ci];
 if(!p||!q||!tr)throw Error('Missing alignment');
 const fr:SourceWord[]=line.split(/\s+/).map((text,wi)=>{
  const core=p.words[wi],alt=q.words[wi],wide=broad[globalIndex],mixed=mix[globalIndex++];if(!core||!alt||!wide||!mixed)throw Error('Missing word candidate');
  const override=overrides[ci+':'+wi],start=override?.start??core.start,end=override?.end??core.end;
  const candidates=[['bounded MMS vocal',core],['bounded Whisper vocal',alt],['section MMS vocal',wide],['section MMS mix',mixed]].map(([method,w])=>({method:String(method),start:(w as Candidate).start,end:(w as Candidate).end}));
  const spread=1000*Math.max(Math.max(...candidates.map(c=>c.start))-Math.min(...candidates.map(c=>c.start)),Math.max(...candidates.map(c=>c.end))-Math.min(...candidates.map(c=>c.end)));
  const word={id:id+'-f'+String(wi+1).padStart(2,'0'),text,startSample:Math.round(start*sampleRate),endSample:Math.round(end*sampleRate),candidateSpreadMs:Math.round(spread),reviewRequired:true};
  ledger.push({id:word.id,text,candidates,selected:{start,end},reason:override?.reason??'Bounded MMS candidate; compare with waveform/spectrogram and original audio during preview review.',actualAudioReviewed:false});
  return word;
 });
 const en=tr.en.split(/\s+/).map((text,wi)=>({id:id+'-e'+String(wi+1).padStart(2,'0'),text,sourceIds:(tr.map[wi]??[]).map(i=>{const w=fr[i];if(!w)throw Error('Unknown mapping');return w.id;})}));
 return {id,section:ci<7?'Verse 1':'Verse 2',fr,en,startSample:Math.min(...fr.map(w=>w.startSample)),endSample:Math.max(...fr.map(w=>w.endSample)),visibleFrom:0,visibleUntil:0};
});
for(let i=0;i<cues.length;i++){const c=cues[i]!,prev=cues[i-1],next=cues[i+1];c.visibleFrom=Math.max(0,c.startSample-Math.round(.20*sampleRate),prev?Math.round((prev.endSample+c.startSample)/2):0);c.visibleUntil=Math.min(sampleCount,c.endSample+Math.round(.45*sampleRate),next?Math.round((c.endSample+next.startSample)/2):sampleCount);}
const data=parseData({sampleRate,sampleCount,duration,fps:60,frames:Math.ceil(duration*60),audioSha256:hash('public/soundtrack.m4a'),cues});
writeFileSync('src/cues.json',JSON.stringify(data,null,2)+'\n');
writeFileSync('analysis/boundary-ledger.json',JSON.stringify(ledger,null,2)+'\n');
writeFileSync('analysis/selected-boundary-decisions.json',JSON.stringify({status:'preview candidates; actual-audio review pending',overrides,methods:['MMS forced alignment on bounded vocal windows','Whisper forced alignment on bounded vocal windows','MMS section alignment on original mix and stem','Independent small-model free recognition on six full-recording windows','Visual waveform and spectrogram inspection of 12 detailed windows'],limits:'Soft legato vocals and separated-stem reverberation create uncertain onsets and releases. Window-edge forced alignments and ASR hallucinations were rejected as lyric authority; no full listening review is claimed.'},null,2)+'\n');
console.log({cues:cues.length,sourceWords:cues.flatMap(c=>c.fr).length,targetWords:cues.flatMap(c=>c.en).length,duration,frames:data.frames});
