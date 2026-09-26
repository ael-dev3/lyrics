import {readFileSync, writeFileSync} from 'node:fs';
import {record,array,str,num,parseTimeline} from '../src/model.ts';
import type {Cue,Word} from '../src/model.ts';
type Candidate = {word:string;start:number;end:number;evidence?:string};
type Segment = {id:string;words:Candidate[]};
function read(path:string):unknown{return JSON.parse(readFileSync(path,'utf8'));}
function segments(path:string):Segment[]{return array(record(read(path)).segments).map(item=>{const s=record(item);return {id:str(s.id),words:array(s.words).map(item=>{const w=record(item);return {word:str(w.word),start:num(w.start),end:num(w.end)};})};});}
const base='analysis/transcription-pass-a/';
const mix=segments(base+'mms-mix.json'),vocals=segments(base+'mms-vocals.json'),local=segments(base+'mms-local-hooks-mix.json'),editorial=segments(base+'mms-editorial-vocals.json'),calibration=segments(base+'mms-calibration-vocals.json');
const gapMix=segments(base+'mms-gap-candidates-mix.json'),gapVocals=segments(base+'mms-gap-candidates-vocals.json');
const recurrence=array(record(read('analysis/repetition-evidence.json')).corroboratedLeadRestarts).map(item=>{const x=record(item);return {start:num(x.fullPhraseStart),body:num(x.templateBodyStart)};});
const cues:Cue[]=[],decisions:unknown[]=[];
const snap=(x:number)=>Math.round(x*44100)/44100;
function segment(list:Segment[],id:string):Segment{const s=list.find(x=>x.id===id);if(!s)throw Error(`Missing ${id}`);return s;}
function add(id:string,kind:'hook'|'phrase',items:Candidate[],evidence:string,review:string):void{
 const words:Word[]=items.map((w,i)=>({id:`${id}-W${String(i+1).padStart(2,'0')}`,text:w.word,start:snap(w.start),end:snap(w.end),evidence:w.evidence??evidence}));
 for(let i=0;i<words.length-1;i++){const w=words[i],n=words[i+1];if(w&&n&&w.end>n.start)w.end=n.start;}
 if(words.some(w=>w.end<=w.start))throw Error(`Invalid selected word ${id}`);
 const first=words[0],last=words.at(-1);if(!first||!last)throw Error(`Empty cue ${id}`);
 cues.push({id,kind,start:first.start,end:last.end,words,review});
}
function clause(id:string,split?:number):void{
 const s=segment(vocals,id),m=segment(mix,id);
 const selected:Candidate[]=s.words.map((w,i)=>{
  const other=m.words[i];if(!other||other.word!==w.word)throw Error('Candidate text disagreement');
  // Independent CTC observations define the initial version. Keep confidence
  // disagreements visible in evidence; do not claim the average is phonetic truth.
  const start=Math.min(w.start,other.start),end=Math.max(w.end,other.end);
  decisions.push({clause:id,word:w.word,stem:[w.start,w.end],mix:[other.start,other.end],selected:[start,end],status:'pending listening'});
  return {word:w.word,start,end};
 });
 // Whisper's similar early boundaries on mix and stem were not independent
 // phonetic corroboration: the decoder absorbed pauses/reverb into these words.
 // Retract those overrides after a separate English CTC model identifies the
 // consonants near the original MMS candidates. Preserve the failed assumption.
 const retractedOnsets=[
  {clause:'verse-one-a',index:3,word:'far',previousStart:18.12,characterStart:19.087,probability:.942},
  {clause:'verse-one-a',index:7,word:'room',previousStart:20.65,characterStart:21.053,probability:.850},
  {clause:'verse-one-b',index:4,word:'anywhere',previousStart:26.04,characterStart:26.929,probability:.939},
  {clause:'anywhere',index:4,word:'anywhere',previousStart:87.02,characterStart:87.876,probability:.982},
 ];
 for(const correction of retractedOnsets){
  if(correction.clause!==id)continue;
  const word=selected[correction.index];
  if(!word||word.word.toLowerCase()!==correction.word)throw Error(`Retracted onset no longer matches ${id}`);
  word.evidence='MMS candidate onset corroborated by separate English CTC consonant evidence; prior early Whisper-only onset retracted; listening pending';
  decisions.push({...correction,correction:'retract early Whisper-only onset',selectedStart:word.start,sources:[base+'english-ctc-comparison.json',base+'mms-verse-review-vocals.json',base+'mms-vocals.json'],status:'independent phonetic evidence supports later onset; pending listening'});
 }
 type PhoneticCorrection={clause:string;index:number;word:string;start?:number;end?:number;reason:string};
 const phoneticCorrections:PhoneticCorrection[]=[
  {clause:'verse-one-a',index:2,word:'go',end:18.12,reason:'English CTC O18.044–18.064 p.996 and separator18.144; normal/slow ASR GO releases18.076–18.120. Later GO-like spectrum decays by over20dB and does not prove continued lead articulation.'},
  {clause:'verse-two-a',index:8,word:'room',start:66.83313953488371,reason:'MMS stem66.833 and independent English CTC R66.853 p.701 reject mix-only66.091; retain the rest after the preceding article.'},
  {clause:'verse-two-b',index:9,word:"I'm",end:75.23653846153846,reason:'MMS stem release75.237 precedes independently corroborated WITH75.277; reject the mix interval that spills across that consonant.'},
  {clause:'verse-two-b',index:10,word:'with',start:75.277,reason:'Independent English CTC greedy W75.277/forced p.458 agrees with mix/stem ASR75.280/75.300 and separate pass75.320.'},
  {clause:'verse-two-b',index:11,word:'you',end:76.14,reason:'Independent English CTC stem O76.099–76.119 p.717 and mix ASR release76.140 justify only this minimum vowel extension.'},
  {clause:'with-me',index:6,word:'me',end:91.30,reason:'Independent English CTC E91.257–91.277 stem p.823 and91.277–91.297 mix p.599 establish a vowel beyond the old91.216 release.'},
 ];
 for(const correction of phoneticCorrections){
  if(correction.clause!==id)continue;
  const word=selected[correction.index];
  if(!word||word.word.toLowerCase()!==correction.word.toLowerCase())throw Error(`Phonetic correction no longer matches ${id}`);
  const previous=[word.start,word.end];
  if(correction.start!==undefined)word.start=correction.start;
  if(correction.end!==undefined)word.end=correction.end;
  word.evidence='Word-specific independent English CTC, MMS and ASR review; no automatic silence filling; listening pending';
  decisions.push({...correction,correction:'independently corroborated phonetic boundary',previous,selected:[word.start,word.end],sources:[base+'english-ctc-comparison.json',base+'mms-vocals.json'],status:'model-supported boundary; pending listening'});
 }
 // Retain short grammatical words for the independently observed sung release.
 // Every extension is specific to an ASR-supported vowel; the following word's
 // selected onset remains a hard boundary. No minimum word length is imposed.
 const articleReleases=[
  {clause:'verse-one-a',index:6,end:20.65,observations:[20.66,20.64,20.66],sources:['large-v3-turbo-mix.json','large-v3-turbo-vocals.json','large-v3-turbo-vocals-first-verse.json']},
  {clause:'verse-one-a',index:9,end:22.4,observations:[22.4,22.4],sources:['large-v3-turbo-vocals.json','large-v3-turbo-vocals-first-verse.json']},
  {clause:'verse-two-a',index:7,end:66.32,observations:[66.32],sources:['large-v3-turbo-vocals.json']},
  {clause:'verse-two-a',index:10,end:68.16,observations:[68.16],sources:['large-v3-turbo-vocals.json']},
  {clause:'world',index:1,end:81.5,observations:[81.5,81.5,81.52],sources:['large-v3-turbo-mix.json','large-v3-turbo-vocals.json','large-v3-turbo-vocals-life.json']},
 ];
 for(const correction of articleReleases){
  if(correction.clause!==id)continue;
  const word=selected[correction.index],next=selected[correction.index+1];
  if(!word||word.word.toLowerCase()!=='a'||!next)throw Error(`Article release correction no longer matches ${id}`);
  const previousEnd=word.end,selectedEnd=Math.min(correction.end,next.start);
  const changed=selectedEnd>previousEnd+1/44100;
  if(changed){word.end=selectedEnd;word.evidence='Independent unprompted ASR vowel-release support; MMS candidate onset; release capped before next word; listening pending';}
  decisions.push({clause:id,word:word.word,wordIndex:correction.index,correction:'short article release review',previousEnd,proposedEnd:correction.end,selectedEnd:word.end,asrReleases:correction.observations,sources:correction.sources.map(file=>base+file),status:changed?'model-supported release extension; pending listening':'extension blocked by next selected word onset; unresolved'});
 }
 for(let i=0;i<selected.length-1;i++){const w=selected[i],next=selected[i+1];if(w&&next&&w.end>next.start){decisions.push({clause:id,word:w.word,releaseCappedAtNextOnset:next.start,previousEnd:w.end});w.end=next.start;}}
 if(split){add(id+'-a','phrase',selected.slice(0,split),'MMS mix/stem independent candidates','Word boundaries and held release pending listening');add(id+'-b','phrase',selected.slice(split),'MMS mix/stem independent candidates','Word boundaries and held release pending listening');}
 else add(id,'phrase',selected,'MMS mix/stem independent candidates',id==='life'?'Leave/Live unresolved; supplied Leave retained':'Word boundaries and held release pending listening');
}
// Hook restarts are measured waveform matches, not a generated musical grid.
// Inner lead events use an explicitly provisional consensus of opening CTC,
// Whisper and acoustic envelope observations. Echoes retain bounded CTC data.
const offsets=[{word:'Take',start:0,end:.495},{word:'me',start:.505,end:.928},{word:'there',start:1.033,end:1.435}];
decisions.push({correction:'delay calibrated lead THERE focus by95ms',previousInitialOnset:1.430,selectedInitialOnset:1.525,evidence:{mmsMixOnset:1.5044303797468355,mmsStemOnset:1.5246835443037976,englishStemTH:[1.545,1.565],englishStemProbabilities:[.619,.657]},sources:[base+'mms-calibration-mix.json',base+'mms-calibration-vocals.json',base+'english-ctc-comparison.json'],scope:'Measured repeated lead templates only; recovered45-second cue keeps its local MMS onset. Existing lead release and intervening gap retained.',status:'independent phonetic candidate; repeat transfer and exact releases pending listening'});
for(let i=0;i<recurrence.length;i++){
 const r=recurrence[i];if(!r)continue;let start=i===0?.492:r.body-.048;
 if(i>=15)continue; // The changed/chopped phrase is authored separately below.
 if(i===7){
  // Full stem ASR and supplied text support the phrase-ending ANYWHERE here.
  const words=segment(vocals,'middle-hooks').words;
  const idx=words.findIndex(w=>w.word.toLowerCase()==='anywhere');if(idx<2)throw Error('Missing supplied anywhere candidate');
  const q=words.slice(idx-2,idx+1);if(q[0])q[0].start=start;
  add('hook-anywhere','phrase',q,'Supplied phrase; full-stem ASR + MMS stem candidate; restart correlation','ANYWHERE location and release need listening review');
  // This arrangement inserts another lead halfway through the usual repeat
  // cycle. The strict recurrence threshold excluded it, leaving audible vocals
  // around 45 seconds without a cue. Mixed ASR independently detects Take/me;
  // short Take/me/there templates and bounded CTC support the local sequence.
  // Retain the supplied refrain's there, not ASR's inconsistent back/day guesses.
  const leadStart=44.28775,thereMix=segment(gapMix,'forty-four-there').words[2],thereVocals=segment(gapVocals,'forty-four-there').words[2];
  if(!thereMix||!thereVocals||thereMix.word!=='there'||thereVocals.word!=='there')throw Error('Missing 45-second gap evidence');
  const inserted:Candidate[]=[
   {word:'Take',start:leadStart,end:leadStart+.495},
   {word:'me',start:leadStart+.505,end:leadStart+.928},
   {word:'there',start:Math.min(thereMix.start,thereVocals.start),end:Math.max(thereMix.end,thereVocals.end)},
  ];
  add('middle-extra-lead','hook',inserted,'Supplied refrain; bounded unprompted ASR Take/me; local waveform matches; bounded mix/stem MMS there','Recovered omitted lead; final word and exact syllable transitions remain listening candidates');
  decisions.push({clause:'middle-extra-lead',correction:'restore omitted intermediate lead around 45 seconds',sourceGap:[q.at(-1)?.end,46.2185],leadWaveformStart:leadStart,leadWaveformCorrelation:.230209,takeBodyMatch:[44.3225,.415754],meNucleusMatch:[44.99525,.739326],thereBodyMatch:[45.33175,.393606],sourceASR:base+'large-v3-turbo-mix-gap-forty-five.json',sourceCTC:[base+'mms-gap-candidates-mix.json',base+'mms-gap-candidates-vocals.json'],status:'independently supported vocal sequence; supplied refrain word retained; exact boundaries pending listening'});
  continue;
 }
 const lead=offsets.map(w=>({word:w.word,start:start+w.start,end:start+w.end}));
 if(i===3){add('intro-4','hook',lead,'Waveform restart + provisional initial word-boundary transfer','Final intro lead and tail pending listening');continue;}
 const key=i<3?`intro-${i+1}`:i<12?`middle-${i-3}`:`final-${i-11}`;
 const observed=segment(local,key+'-echoes-6').words.slice(3);
 const selected:Candidate[]=[...lead];
 for(const w of observed){const previous=selected.at(-1);if(!previous)continue;const s=Math.max(w.start,previous.end),clipped=s>w.start+1/44100;if(w.end-s<.025||(clipped&&w.end-s<.08)){decisions.push({hook:key,omittedUnresolvedCandidate:w,remainingDuration:w.end-s,reason:clipped?'Overlap with calibrated event leaves an unsupported sub-80ms fragment; do not manufacture a new echo onset':'Candidate has no usable distinct interval'});continue;}selected.push({word:'there',start:s,end:w.end});}
 add(key,'hook',selected,'Measured lead recurrence; initial phonetic consensus; bounded mix MMS echo candidates','Echo count and individual releases uncertain; supplied six-echo hypothesis remains provisional');
}
clause('verse-one-a',5);clause('verse-one-b',5);clause('verse-two-a',6);clause('verse-two-b',5);clause('life');clause('world');clause('anywhere');clause('with-me');
const chop=segment(editorial,'chops-three').words;
for(let i=0;i<3;i++)add(`chop-${i+1}`,'phrase',chop.slice(i*2,i*2+2),'Supplied three chopped pairs; local stem MMS candidates corroborated by short-template repeats','Chop count and short-word boundaries pending listening');
add('last-hook','hook',segment(editorial,'last-hook').words,'Supplied text; local stem MMS and measured restart107.253s','Release and later echoed fragments unresolved');
add('late-echoes','hook',segment(editorial,'late-echoes').words,'Supplied echo hypothesis; bounded stem MMS candidates','High uncertainty: delayed vowels do not independently establish six lexical words');
add('last-lead-uncertain','hook',segment(editorial,'last-lead-uncertain').words,'Supplied final lead hypothesis; bounded MMS candidate','High uncertainty: no strong whole-phrase recurrence; verify117.65–121.20s');
for(const id of ['closing-one','closing-two','closing-three']){
 const selected=segment(calibration,id).words.map(word=>({...word}));
 if(id==='closing-two'){
  const trueWord=selected[2],withWord=selected[3];
  if(trueWord?.word!=='true'||withWord?.word!=='with')throw Error('Closing correction no longer matches');
  const previous={true:[trueWord.start,trueWord.end],with:[withWord.start,withWord.end]};
  trueWord.end=126.732;withWord.start=126.833;
  trueWord.evidence=withWord.evidence='English CTC separator/W; corresponding W in waveform-correlated third refrain; listening pending';
  decisions.push({clause:id,correction:'separate TRUE release and earlier WITH consonant',previous,selected:{true:[trueWord.start,trueWord.end],with:[withWord.start,withWord.end]},evidence:{englishMixW:126.792,englishStemW:126.812,englishStemSeparator:126.732,thirdGreedyW:130.653,thirdRepeatShift:-3.820},sources:[base+'english-ctc-comparison.json','analysis/repetition-evidence.json'],status:'cross-reprise phonetic evidence; second W alone is weak; pending listening'});
 }
 add(id,'phrase',selected,'Independent bounded MMS + waveform-recurrence corroboration + targeted unprompted ASR','Text corroborated; internal word focus and held release pending listening');
}
cues.sort((a,b)=>a.start-b.start);
const result=parseTimeline({song:'CPznmfSbAiE',revision:'source-integrated-preview-v2',duration:134.93115646258502,cues});
writeFileSync('public/timeline.json',JSON.stringify(result,null,2)+'\n');
writeFileSync('evidence/timing-decisions.json',JSON.stringify({status:'provisional; not production approved',method:'Source observations and supplied text; no uniformly divided phrase timings',decisions},null,2)+'\n');
const stamp=(s:number)=>{const ms=Math.round(s*1000);return `${String(Math.floor(ms/3600000)).padStart(2,'0')}:${String(Math.floor(ms/60000)%60).padStart(2,'0')}:${String(Math.floor(ms/1000)%60).padStart(2,'0')},${String(ms%1000).padStart(3,'0')}`;};
writeFileSync('source/lyrics-preview-draft.txt',cues.map(q=>`${q.start.toFixed(3)}–${q.end.toFixed(3)}  ${q.words.map(w=>w.text).join(' ')}`).join('\n')+'\n');
writeFileSync('source/lyrics-preview-draft.srt',cues.map((q,i)=>`${i+1}\n${stamp(q.start)} --> ${stamp(q.end)}\n${q.words.map(w=>w.text).join(' ')}\n`).join('\n'));
console.log(`${cues.length} provisional cues, ${cues.reduce((n,q)=>n+q.words.length,0)} words; listening review remains pending.`);
