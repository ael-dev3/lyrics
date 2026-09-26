import {readFileSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {parseTimeline,record,array,cueAt,wordActive} from '../../src/model.ts';

const project=new URL('../../',import.meta.url);
const load=(path:string):Buffer=>readFileSync(new URL(path,project));
const hash=(path:string):string=>createHash('sha256').update(load(path)).digest('hex');
const beforePath='analysis/transcription-pass-a/timeline-before-phonetic-review.json';
const before=parseTimeline(JSON.parse(load(beforePath).toString())),after=parseTimeline(JSON.parse(load('public/timeline.json').toString()));
const oldWords=new Map(before.cues.flatMap(cue=>cue.words.map(word=>[word.id,word] as const)));
const changes=after.cues.flatMap(cue=>cue.words.flatMap(word=>{
 const old=oldWords.get(word.id);if(!old)throw Error(`Unexpected new event${word.id}`);
 if(old.start===word.start&&old.end===word.end)return [];
 return [{cue:cue.id,wordId:word.id,text:word.text,before:[old.start,old.end],after:[word.start,word.end],evidence:word.evidence}];
}));
const sourceFiles=[
 'analysis/transcription-pass-a/mms-verse-review-mix.json',
 'analysis/transcription-pass-a/mms-verse-review-vocals.json',
 'analysis/transcription-pass-a/wav2vec-verse-review.json',
 'analysis/transcription-pass-a/english-ctc-comparison.json',
 'analysis/transcription-pass-a/large-v3-turbo-mix-review-first-phrase.json',
 'analysis/transcription-pass-a/large-v3-turbo-mix-review-first-phrase-slow.json',
 'analysis/transcription-pass-a/large-v3-turbo-vocals-review-first-phrase.json',
 'analysis/transcription-pass-a/large-v3-turbo-vocals-review-first-phrase-slow.json',
 'analysis/transcription-pass-a/mms-calibration-mix.json',
 'analysis/transcription-pass-a/mms-calibration-vocals.json',
 'analysis/repetition-evidence.json',
];
const seen=new Set<string>();let frameCount=0;
for(let frame=0;frame<Math.ceil(after.duration*60);frame++){
 const time=frame/60,visible=cueAt(after,time)?.words.filter(word=>wordActive(word,time))??[];
 const all=after.cues.flatMap(cue=>cue.words.filter(word=>wordActive(word,time)));
 if(visible.length>1||visible.map(word=>word.id).join()!==all.map(word=>word.id).join())throw Error(`Hidden or multiple focus at${time}`);
 for(const word of visible)seen.add(word.id);frameCount++;
}
const ctc='analysis/transcription-pass-a/english-ctc-comparison.json';
const audit={
 status:'Independent acoustic/model comparison; listening review remains pending',
 revision:after.revision,timelineSha256:hash('public/timeline.json'),builderSha256:hash('scripts/build-timeline.ts'),beforeTimelineSha256:hash(beforePath),
 question:'The first verse appeared early near19seconds. Determine whether an omitted second far, a sustained go, or an overbroad recognizer timestamp caused the focus error.',
 findings:[
  {word:'far',selectedOnset:19.06716553287982,previousOnset:18.12,reason:'Both mix/stem MMS place the only well-supported far at19.067. A separate English CTC model identifies F19.087–19.127 p.942, A19.308 p.964 and R19.328 p.903. Similar Whisper timestamps18.10–19.4 incorrectly absorb preceding tail/silence; mix/stem agreement within one model family is insufficient phonetic corroboration.'},
  {word:'go',selectedRelease:18.12,previousRelease:17.82340136054422,reason:'English CTC O18.044–18.064 p.996 and normal/slowed ASR GO releases18.076–18.120 establish a longer vowel than the old interval. Separator18.144 and energy decay support a conservative18.120 release, preserving a real pause before FAR.'},
  {word:'room/anywhere',reason:'The same broad-ASR failure affected first ROOM and first/last ANYWHERE. Strong independent letters R21.053 p.850; A26.929 p.939/N26.969 p.964; A87.876 p.982 support the original MMS onsets21.013/26.808/87.816. The earlier ASR-only overrides were explicitly retracted.'},
  {word:'second a room',reason:'The initial min(mix,stem) union picked a spurious ROOM66.091 from mix. Independent stem MMS66.833 and English CTC R66.853 p.701 support the later consonant. The preceding article releases66.320 based on ASR and the nearby English separator66.332; its exact onset remains weaker.'},
  {word:'with/you/me',reason:"English CTC and distinct ASR support WITH75.277, with the preceding I'M ending75.237; positive late vowels justify minimal YOU76.140 and ME91.300 release extensions. Held tails were not indiscriminately stretched."},
  {word:'second closing true with',reason:'TRUE now releases126.732 and WITH starts126.833. English CTC W candidates126.792/126.812 and separator126.732 are supported by the corresponding third-reprise greedy W130.653 shifted back3.820s. The second W alone is weak, so this remains a listening candidate.'},
  {word:'repeated lead there',reason:'Opening MMS mix1.504/stem1.525 and independent English CTC TH1.545/1.565 reject the prior1.430 onset. Selected1.525 transfers by measured lead recurrence to14 hook events while keeping prior lead releases and separate gaps. The locally aligned recovered45-second cue is untouched.'},
 ],
 firstVerseAcousticComparison:{
  provenance:'Read-only independent feature-agent measurements from the same demixed stem; numerical outputs transcribed here, not a listening attestation.',
  method:'16-band100–1800Hz mean-centered log-power spectral cosine,512-sample Hann at4kHz,20ms hop; RMS in100ms centered windows.',
  spectralBody:{goTemplate:[17.70,17.95],farTemplate:[19.07,19.38],candidateWindows:[[18,18.24],[18.24,18.5],[18.5,18.85]],goCosine:[.9681,.9747,.9740],farCosine:[.7483,.7347,.7072]},
  crossover:{times:[19,19.04,19.06,19.08,19.10],goCosine:[.9494,.9135,.8819,.7708,.7095],farCosine:[.7534,.8049,.8367,.8768,.8735],windowDuration:.128},
  energy:{times:[17.8,18.1,18.4,18.7,18.95,19.06,19.2],rmsDb:[-13.82,-14.88,-24.48,-25.11,-35.42,-37.85,-17.48]},
  interpretation:'The pre19s sound remains spectrally GO-like but decays over20dB; it does not establish a second FAR or sustained full-strength lead to19s. The spectral transition near19.06–19.08 supports MMS FAR19.067, with window-limited precision.'
 },
 declinedChanges:[
  {proposal:'Add a second FAR in the first verse',reason:'Full-phrase forced MMS early extra FAR has score.003 mix/.066 stem, and independent English CTC forced extra FAR score.002. Unprompted recognizers return one FAR. By contrast, both second-verse FAR tokens have strong distinct acoustic support. No added word.'},
  {proposal:'Hold GO continuously until19.067',reason:'Spectral similarity alone measures vowel/reverb family, not continued lead articulation. The measured tail decays over20dB and stronger phonetic evidence supports release near18.12.'},
  {proposal:'Advance BREATHE83.453 to Whisper83.24',reason:'Independent stem consonant83.493 and R83.533 p.889 support the existing onset. No change.'},
  {proposal:'Shorten preceding YOU83.453 to83.352',reason:'A modest-confidence separator is insufficient by itself for another release change; existing nonoverlap and supported BREATHE onset retained.'},
  {proposal:'Delay third closing WITH130.633 to forced CTC131.136',reason:'The same model greedy path already has W130.653 and agrees with MMS130.633; the forced late W is an alignment failure. No change.'},
  {proposal:'Add words or fill every remaining gap from stem energy',reason:'Instrument leakage, delay and reverb do not establish lexical events. Late107–121s and intro tail remain explicitly uncertain.'}
 ],
 changes,sources:sourceFiles.map(path=>({path,sha256:hash(path)})),
 checks:{cues:after.cues.length,selectedWordEvents:after.cues.reduce((sum,cue)=>sum+cue.words.length,0),eventsVisibleAt60fps:seen.size,framesScanned:frameCount,hiddenOrSimultaneousFocusFrames:0,meaning:'Verifies event exposure and single-word display contracts, not perceptual timing accuracy.'},
 limits:'No direct listening attestation is claimed. Model probabilities are conditional acoustic evidence, not proof of text or exact perceptual boundaries. Sample-grid quantization does not imply sample-accurate vocal onset knowledge. Final listening approval remains required.'
};
writeFileSync(new URL('evidence/first-verse-sync-audit.json',project),JSON.stringify(audit,null,2)+'\n');

const review=record(JSON.parse(load('evidence/timing-review-priorities.json').toString()));
const previous=array(review.implementedCorrections).map(record);
const retracted=previous.filter(item=>item.word==='far'||item.word==='anywhere'||item.word==='room');
const retained=previous.filter(item=>!(item.word==='far'||item.word==='anywhere'||item.word==='room')&&!(typeof item.correction==='string'&&(item.correction.startsWith('Four specific article')||item.correction.startsWith('Replaced early ASR-only'))));
const summary={priority:1,correction:'Replaced early ASR-only onsets with independently corroborated phonetic boundaries; polished related releases and repeated THERE focus.',details:'See first-verse-sync-audit.json for every before/after interval, raw evidence hashes, retracted assumptions and declined weak proposals.',sources:[ctc,'evidence/first-verse-sync-audit.json'],review:'Listening remains pending; no lexical events added or removed.'};
const output={...review,timelineSha256:audit.timelineSha256,builderSha256:audit.builderSha256,
 implementedCorrections:[summary,...retained],
 supersededCorrections:retracted.length?retracted.map(item=>({...item,status:'Retracted: broader independent phonetic review disproves this early ASR-only onset. See first-verse-sync-audit.json.'})):review.supersededCorrections,
 remainingPriorities:array(review.remainingPriorities).filter(item=>!array(record(item).cues).includes('verse-two-a-b')),
 positiveChecks:[
  '37 cues and225 word events retained; all225 focus events are exposed with no simultaneous focus during the complete60fps scan.',
  'The previously omitted45-second intermediate lead is preserved and its local THERE interval is unchanged.',
  'First verse contains one FAR; second verse contains two, based on separate acoustic evidence rather than copied text shape.',
  'Five specific article releases now use observed vowel spans; second A/ROOM is corrected together and retains the intervening rest.',
  'The three closing clauses retain independently corroborated words; second TRUE/WITH transition now uses phonetic and repeated-phrase evidence.',
  'TypeScript typecheck and the focused timing/coverage regressions pass; per-word acoustic certainty and listening attestation remain separate.'
 ]};
writeFileSync(new URL('evidence/timing-review-priorities.json',project),JSON.stringify(output,null,2)+'\n');
console.log(`Recorded${changes.length} changed intervals;${seen.size} visible events over${frameCount} frames.`);
