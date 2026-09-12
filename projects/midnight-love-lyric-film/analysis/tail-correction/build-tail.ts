import {readFileSync, writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
import {parseCues, type Cue, type Word} from '../../src/schema.ts';
const root = 'analysis/tail-correction/', sr = 48000, retainedSamples = 9304968;
type Observation = {word:string;start:number;end:number;probability?:number};
type Segment = {id:string;text:string;words:Observation[]};
const read = (name:string):Segment[] => (JSON.parse(readFileSync(root+name+'.json','utf8')) as {segments:Segment[]}).segments;
const vocal=read('mms-vocals16'),mix=read('mms-audio16'),english=read('wav2vec-vocals16'),attention=read('whisper-vocals16'),firstEnglish=read('first-pass/wav2vec-vocals16');
type Edit = {start?:number;end?:number;reason:string};
const edits:Record<string,Record<number,Edit>>={
  L33:{
    0:{start:154.65,reason:'Vocal-envelope rise near154.68s and first-pass mix MMS contact154.644s precede the weak refined CTC vowel spike. Group I/can’t so a short vowel does not flash separately.'},
    4:{end:firstEnglish[0]?.words[5]?.start??157.51467625899278,reason:'Wide-window CTC absorbs the sustained following word into midnight. First bounded English encoder and both blind transcriptions support the earlier midnight/love division; both words share focus because the division remains uncertain.'},
    5:{start:firstEnglish[0]?.words[5]?.start??157.51467625899278,end:english[0]?.words[5]?.end??161.97959697732998,reason:'Use first bounded English-encoder contact and wider-window English-encoder release. Wider CTC paths incorrectly delay the word onset into its sustained vowel. Midnight/love share one focus group; the held-vowel release near162s is approximate.'},
  },
  L35:{0:{start:168.66,reason:'Visible vocal attack near168.66s, supported by blind vocal transcription168.70s; the acoustic encoders identify a later point inside the short I vowel. Group I/can’t.'}},
  L37:{0:{start:176.65,reason:'Mix MMS onset176.631s and the vocal-envelope rise support an earlier contact than the short vocal-only CTC spike. Group I/keep.'}},
  L38:{4:{end:185.4,reason:'Both mix/vocal MMS locate before near182.97s, but shorten its sustained ending. The vocal spectrogram and 5ms RMS show the sung vowel through~185.4s before clear decay. A blind184s crop emits only Oh/oh for this held vowel; do not invent additional words or a new lyric cue.'}},
};
const groupMap:Record<string,number[][]>={L33:[[0,1],[2],[3],[4,5]],L34:[[0],[1],[2],[3],[4],[5]],L35:[[0,1],[2],[3],[4],[5]],L36:[[0],[1,2],[3],[4]],L37:[[0,1],[2],[3],[4],[5]],L38:[[0],[1],[2],[3],[4]]};
const audit:unknown[]=[];
const proposed:Cue[]=vocal.map((segment,index)=>{
  const words:Word[]=segment.words.map((observation,wordIndex)=>{
    const m=mix[index]?.words[wordIndex],e=english[index]?.words[wordIndex],a=attention[index]?.words[wordIndex],edit=edits[segment.id]?.[wordIndex];
    assert(m&&e&&a);
    assert.equal(observation.word.toLowerCase(),m.word.toLowerCase());assert.equal(observation.word.toLowerCase(),e.word.toLowerCase());assert.equal(observation.word.toLowerCase(),a.word.trim().toLowerCase());
    const start=edit?.start??observation.start,end=edit?.end??observation.end;
    audit.push({cue:segment.id,word:observation.word,selected:{start,end},reason:edit?.reason??'Vocal MMS is the primary contact; independent mix MMS, English wav2vec and bounded attention retained. This is an independently aligned performance.',candidates:{vocalMMS:observation,mixMMS:m,englishCTC:e,attention:a},candidateOnsetSpreadMs:1000*(Math.max(observation.start,m.start,e.start,a.start)-Math.min(observation.start,m.start,e.start,a.start))});
    return {text:observation.word,startSample:Math.round(start*sr),endSample:Math.round(end*sr),confidence:observation.probability??0};
  });
  for(let i=0;i<words.length-1;i++){const word=words[i],next=words[i+1];assert(word&&next);word.endSample=Math.min(word.endSample,next.startSample);}
  const first=words[0],last=words.at(-1),groups=groupMap[segment.id];assert(first&&last&&groups);
  return {id:segment.id,section:index<2?'final chorus':'closing reprise',words,groups,startSample:first.startSample,endSample:last.endSample};
});
const originalBytes=readFileSync('src/cues.json'),existing=parseCues(JSON.parse(originalBytes.toString()));
assert.equal(existing.length,32,'Integrate the proposal into the unmodified32-cue source');
const sourceLines=new Set(existing.map(c=>c.words.map(w=>w.text.toLowerCase()).join(' ')));
let previous=existing.at(-1)?.endSample??0;
for(const cue of proposed){
  assert(sourceLines.has(cue.words.map(w=>w.text.toLowerCase()).join(' ')), 'Tail text must be a repetition of user-supplied wording');
  assert(cue.startSample>=previous&&cue.endSample>cue.startSample&&cue.endSample<=retainedSamples);previous=cue.endSample;
  let prior=cue.startSample;
  for(const word of cue.words){assert(Number.isInteger(word.startSample)&&Number.isInteger(word.endSample)&&word.startSample>=prior&&word.endSample>word.startSample);prior=word.endSample;}
  assert.deepEqual(cue.groups.flat().sort((a,b)=>a-b),cue.words.map((_,i)=>i));
  for(const group of cue.groups){const selected=group.map(i=>cue.words[i]);assert(selected.every(w=>w!==undefined));assert(Math.round(Math.max(...selected.map(w=>w?.endSample??0))/800)>Math.round(Math.min(...selected.map(w=>w?.startSample??Infinity))/800));}
}
parseCues(proposed);
writeFileSync(root+'tail-cues.json',JSON.stringify(proposed,null,2));
const all=[...existing,...proposed];
writeFileSync(root+'tail-lyrics.txt',proposed.map(c=>c.words.map(w=>w.text).join(' ')).join('\n')+'\n');
writeFileSync(root+'corrected-full-lyrics.txt',all.map(c=>c.words.map(w=>w.text).join(' ')).join('\n')+'\n');
const firstProposed=proposed[0],lastProposed=proposed.at(-1);assert(firstProposed&&lastProposed);
const report={status:'Proposed correction; existing source and media remain untouched',sourceCueSha256:createHash('sha256').update(originalBytes).digest('hex'),retainedAudioSamples:retainedSamples,sampleRate:sr,tailAnalysisWindow:[150,retainedSamples/sr],sourceFramesUnchanged:11632,addedCues:proposed.length,addedWords:proposed.reduce((n,c)=>n+c.words.length,0),addedFocusGroups:proposed.reduce((n,c)=>n+c.groups.length,0),correctedTotals:{cues:all.length,words:all.reduce((n,c)=>n+c.words.length,0),groups:all.reduce((n,c)=>n+c.groups.length,0)},firstNewContactSeconds:firstProposed.startSample/sr,lastNewEndSeconds:lastProposed.endSample/sr,earliestRequiredPatchFrame:9000,textAuthority:'Six repeated lines, all words already supplied by the user; blind ASR on the mix and separated vocal stem independently confirms the text/order.',captions:'YouTube auto-captions provide [Music] only in this region and cannot establish lyric absence.',repeatTransfer:'None. Signed waveform correlations0.085–0.165 are too low to justify copying timestamps.',grouping:'I/can’t and I/keep share focus; ambiguous sustained midnight/love share focus; connected but/not share focus.',limits:'No human/native-listener audition is claimed. ASR attention absorbs gaps and CTC can slide into held vowels. The midnight/love division and sustained releases near162s and185.4s remain approximate, explicitly grouped/documented rather than described as exact acoustic boundaries.',edits,words:audit};
writeFileSync(root+'tail-correction-evidence.json',JSON.stringify(report,null,2));
console.log(JSON.stringify({addedCues:report.addedCues,addedWords:report.addedWords,addedFocusGroups:report.addedFocusGroups,correctedTotals:report.correctedTotals,firstNewContactSeconds:report.firstNewContactSeconds,lastNewEndSeconds:report.lastNewEndSeconds},null,2));
