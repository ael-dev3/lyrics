import {readFileSync,writeFileSync} from 'node:fs';
import {validateTimeline,type Timeline,type Cue,type Lane,type Word,vocalTrack} from '../src/model.ts';
const read=(path:string)=>JSON.parse(readFileSync(path,'utf8'));
const SR=44100,sha=read('source/recording.json').sourceSha256 ?? '8563f6b817c9b1cc39649363a52486214c691c0d98ae7bb82263021ac7363523';
const reason='Original editorial translation: complete indicated lexical/grammatical meaning, focused on the union of its source events; no invented target-language timestamps.';
const lane=(language:Lane['language'],tokens:[string,number[]][]):Lane=>({language,tokens:tokens.map(([text,sourceIndices],i)=>({id:`${language}-${i}`,text,sourceIndices,rationale:reason}))});
const russian=read('source/russian-editorial.json');
for(const template of russian){
 const en=template.lanes.find((l:Lane)=>l.language==='en');
 if(template.templateId==='last'){en.tokens[0].sourceIndices=[0,2];en.tokens[0].rationale='The article belongs to the temporal preposition and time noun; last follows последний independently.';}
 if(template.templateId==='night'||template.templateId==='night2'){en.tokens.find((t:any)=>t.text==='the').sourceIndices=[2];}
 if(template.templateId==='watch')template.lanes[1]=lane('en',[['To',[2]],['gaze',[2]],['endlessly',[0,1]],['at',[3]],['the',[4]],['moon',[4]]]);
}
writeFileSync('source/russian-editorial.json',JSON.stringify(russian,null,2)+'\n');
const ruTemplates=new Map(russian.map((t:any)=>[t.templateId,t]));
const jpTemplates=[
 {templateId:'JP59-sleep',sourceText:'やすらはで寝なましものを',units:['やすらはで','寝なまし','ものを'],lanes:[lane('ja',[['やすらはで',[0]],['寝なまし',[1]],['ものを',[2]]]),lane('ru',[['Без',[0]],['промедления',[0]],['стоило',[1]],['бы',[1]],['уснуть,',[1]],['но…',[2]]]),lane('en',[['I',[1]],['should',[1]],['have',[1]],['slept',[1]],['without',[0]],['delay,',[0]],['but…',[2]]])]},
 {templateId:'JP59-night',sourceText:'小夜更けて',units:['小夜','更けて'],lanes:[lane('ja',[['小夜',[0]],['更けて',[1]]]),lane('ru',[['Ночь',[0]],['стала',[1]],['глубокой;',[1]]]),lane('en',[['The',[0]],['night',[0]],['grew',[1]],['late;',[1]]])]},
 {templateId:'JP59-moon',sourceText:'傾くまでの月を見しかな',units:['傾く','までの','月を','見し','かな'],lanes:[lane('ja',[['傾く',[0]],['までの',[1]],['月を',[2]],['見し',[3]],['かな',[4]]]),lane('ru',[['Ах,',[4]],['перед',[3]],['глазами',[3]],['была',[3]],['луна,',[2]],['пока',[1]],['она',[0,2]],['не',[1]],['склонилась',[0]],['низко.',[0]]]),lane('en',[['Ah,',[4]],['I',[3]],['watched',[3]],['the',[2]],['moon',[2]],['until',[1]],['it',[0,2]],['sank',[0]],['low.',[0]]])]},
 {templateId:'JP30-loop',sourceText:'憂きものはなし暁ばかり',units:['憂き','もの','は','なし','暁','ばかり'],lanes:[lane('ja',[['憂き',[0]],['もの',[1]],['は',[2]],['なし',[3]],['暁',[4]],['ばかり',[5]]]),lane('ru',[['Нет',[3]],['ничего',[1,2,3]],['горестнее',[0,5]],['рассвета.',[4,5]]]),lane('en',[['Nothing',[1,2,3]],['is',[0,2]],['more',[5]],['sorrowful',[0]],['than',[5]],['dawn.',[4]]])]},
];
writeFileSync('source/japanese-selected-editorial.json',JSON.stringify({status:'Selected preview editorial mappings; all Japanese inflections preserve complete translated meanings.',notes:['寝なまし is one counterfactual verb, including perfective な; ものを preserves the regretful but continuation.','The moon pair is one stable sentence with a gender-neutral Russian perceptual paraphrase; past seeing is preserved without inventing speaker gender.','The performed poem-30 order reverses its two source fragments; comparison belongs to ばかり. The unsung upper stanza is not displayed.','Internal kana preprocessing is acoustic-model input only. No phonetic or pronunciation lane is part of the scene.'],templates:jpTemplates},null,2)+'\n');
const cues:Cue[]=[],decisionEvents:any[]=[];
const report=read('evidence/independent-acoustic-review.json');
for(const proposal of report.russianPerWordProposals){
 const template:any=ruTemplates.get(proposal.templateId);
 const words:Word[]=proposal.units.map((u:any,i:number)=>({id:`${proposal.phraseId}-${i+1}`,text:template.units[i],sourceIndex:i,startSample:u.proposedOnsetSample44100,endSample:u.proposedReleaseSample44100,confidence:u.uncertainty,method:'Independently inspected original mix + clock-verified vocal estimate + bounded Whisper/CTC candidates; reviewed occurrence, not a copied repeat.'}));
 const cue:Cue={id:proposal.phraseId,label:template.sourceText,sourceLanguage:'ru',start:words[0]!.startSample/SR,end:words.at(-1)!.endSample/SR,visibleStart:0,fullOpacityEnd:0,visibleEnd:0,words,lanes:template.lanes.map((l:Lane)=>({...l,tokens:l.tokens.map((t,i)=>({...t,id:`${proposal.phraseId}-${l.language}-${i}`}))}))};
 cues.push(cue);decisionEvents.push(...proposal.units.map((u:any,i:number)=>({wordId:words[i]!.id,language:'ru',selectedStartSample:words[i]!.startSample,selectedEndSample:words[i]!.endSample,onsetRangeSeconds:u.onsetRangeSeconds,releaseRangeSeconds:u.releaseRangeSeconds,rationale:u.rationale,rawObservations:u.observations,humanListening:false})));
}
const overlap=read('source/japanese-overlap-selected.json');
const jpOccurrences:{id:string;template:string;times:[number,number][];note:string;closing?:boolean;upper?:boolean}[]=[
 {id:'JP30-001',template:'JP30-loop',times:[[20.53,21.66],[21.66,22.82],[22.82,23.38],[23.38,24.28],[25.07,27.45],[27.45,29.02]],note:'Opening fragment independently visible in bounded multilingual transcription and native-kana CTC; quiet initial vowel/body from original/stem panel; direct tails beyond CTC character cores.'},
 {id:'JP30-002',template:'JP30-loop',times:[[29.69,30.78],[30.78,32.0],[32.0,32.56],[32.56,33.43],[34.25,36.59],[36.59,38.07]],note:'Second opening repeat reviewed independently: 暁 has a new direct onset after a real gap, not the earlier mixed-model allocation in the prior なし body.'},
 {id:'JP59-001',template:'JP59-sleep',times:[[49.39,51.57],[51.57,52.83],[52.83,53.77]],note:'Quiet source entry precedes clear vowel core. Continuous native inflections grouped for complete counterfactual focus; adversative ものを remains separate.'},
 {id:'JP59-002',template:'JP59-night',times:[[54.95,55.7],[55.7,58.28]],note:'Quiet 小夜 prefix and complete late-night predicate; independent continuation panel supports the low same-note body into58.28. Direct-vowel versus room-decay distinction remains a listening question, not solved by the te core.'},
 {id:'JP59-003-004',template:'JP59-moon',times:[[58.495,59.56],[59.56,61.30],[61.32,62.65],[64.2,65.0],[65.02,65.66]],note:'Joined natural moon sentence retains individual source inflections and the real pre-watch pause. Quiet tsu frication precedes moon vowel. Exclamation is not a question.'},
 {id:'JP59-005',template:'JP59-sleep',times:[[67.69,69.94],[69.94,71.18],[71.18,72.17]],note:'Second complete poem performance inspected independently; continuous counterfactual and separate regret event.'},
 {id:'JP59-006',template:'JP59-night',times:[[73.27,73.94],[73.94,76.50]],note:'Quiet independent second-night prefix; same-note low harmonic/wave pulses continue towards76.4. Provisional76.50 release protects the possible held e-vowel; direct-body versus room-decay needs listening.'},
 {id:'JP59-007-008',template:'JP59-moon',times:[[76.75,77.86],[77.86,79.62],[79.63,81.16],[82.47,83.62],[83.64,86.12]],note:'Original moon crop began too late; widened native-kana CTC verifies 79.66 core and earlier frication. Long final かな body stays lit into the Russian entrance; no cue fade truncates it.'},
 {id:overlap.cueId,template:overlap.templateId,times:overlap.units.map((u:any)=>[u.start,u.end]),note:overlap.basis,upper:true},
 {id:'JP30-003',template:'JP30-loop',times:[[221.8,222.84],[222.84,224.03],[224.03,224.53],[224.53,225.36],[226.3,228.50],[228.50,229.96]],note:'Provisional overlapping initial Japanese vowel: physical changed vocal body and consonant sequence support ~221.8 with broad 221.65–222.12 range. Widened forced u at220.78 is rejected as borrowed Russian night. Russian body remains until222.24.',closing:true,upper:true},
 {id:'JP30-004',template:'JP30-loop',times:[[230.55,231.97],[231.97,233.10],[233.10,233.60],[233.60,234.47],[235.35,237.58],[237.58,239.04]],note:'Independently measured final loop, not offset-copy. Renewed original/stem vowel body at230.55 corrects the materially late230.79 proposal; CTC u230.91 is a core, not the entrance. Final direct body/room decay split retained as uncertainty.',closing:true,upper:true},
];
for(const occurrence of jpOccurrences){
 const template=jpTemplates.find(t=>t.templateId===occurrence.template)!;
 const words:Word[]=occurrence.times.map(([start,end],i)=>({id:`${occurrence.id}-${i+1}`,text:template.units[i]!,sourceIndex:i,startSample:Math.round(start*SR),endSample:Math.round(end*SR),confidence:occurrence.id===overlap.cueId?'provisional layered vocal: broad uncertainty; perceptual review pending':occurrence.id==='JP30-003'&&i===0?'high uncertainty: mixed vocal entry':'signal/model agreement with direct-body release review; not listening approval',method:'Native-kana conditioned acoustic input + original/stem spectral inspection; original Japanese orthography on screen.'}));
 const cue:Cue={id:occurrence.id,label:template.sourceText,sourceLanguage:'ja',start:words[0]!.startSample/SR,end:words.at(-1)!.endSample/SR,visibleStart:0,fullOpacityEnd:0,visibleEnd:0,words,lanes:template.lanes.map(l=>({...l,tokens:l.tokens.map((t,i)=>({...t,id:`${occurrence.id}-${l.language}-${i}`}))}))};
 if(occurrence.closing)cue.readingPlacement='closing';
 if(occurrence.upper)cue.vocalTrack='japanese-upper';
 cues.push(cue);decisionEvents.push(...words.map((w,i)=>({wordId:w.id,language:'ja',selectedStartSample:w.startSample,selectedEndSample:w.endSample,onsetRangeSeconds:occurrence.id===overlap.cueId?overlap.units[i].onsetRange:occurrence.id==='JP30-003'&&i===0?[221.65,222.12]:occurrence.id==='JP30-004'&&i===0?[230.50,230.80]:[Math.max(0,w.startSample/SR-.12),w.startSample/SR+.12],releaseRangeSeconds:occurrence.id===overlap.cueId?overlap.units[i].releaseRange:occurrence.id==='JP59-002'&&i===1?[57.90,58.42]:occurrence.id==='JP59-006'&&i===1?[76.25,76.70]:[w.endSample/SR-.15,w.endSample/SR+.15],rationale:occurrence.note,rangeMeaning:'Explicit review bounds; not a calibrated confidence interval or a millisecond accuracy claim.',humanListening:false})));
}
cues.sort((a,b)=>a.start-b.start);
for(const track of ['lead','japanese-upper'] as const){
 const trackCues=cues.filter(c=>vocalTrack(c)===track);
 for(const [index,cue] of trackCues.entries()){
  const previous=trackCues[index-1],next=trackCues[index+1];
  cue.visibleStart=Math.max(previous?.visibleEnd??0,cue.start-.22);
  const gap=(next?.start??255.0944217687075)-cue.end;
  if(gap<=.62){cue.fullOpacityEnd=next?.start??cue.end;cue.visibleEnd=cue.fullOpacityEnd;}
  else {cue.fullOpacityEnd=cue.end+Math.min(.75,gap-.54);cue.visibleEnd=Math.min(cue.fullOpacityEnd+.5,(next?.start??255.0944217687075)-.22);}
 }
}
// Concurrent voices own complete cues on independent reading tracks. Neither
// language borrows another voice's timing, truncates its body or reassigns a tail.
const timeline:Timeline={schemaVersion:2,revision:'prizrak-preview-v2',sampleRate:44100,sourceSha256:sha,sourceDuration:255.0944217687075,cues};
validateTimeline(timeline);
writeFileSync('public/timeline.json',JSON.stringify(timeline,null,2)+'\n');
writeFileSync('evidence/timing-decisions.json',JSON.stringify({revision:timeline.revision,sourceSha256:sha,status:'Selected preview events; human full-speed/reduced-speed review remains pending.',sampleClock:'Original unchanged AAC decoded at44100Hz; half-open sample intervals; no global anticipation/lag compensation.',evidenceLimits:'CTC emissions ~20ms, spectral support23.22ms. Integer sample storage is precise scheduling, not guaranteed perceptual boundary accuracy. Stems are clock verified, not source authority.',wordCount:decisionEvents.length,cueCount:cues.length,events:decisionEvents},null,2)+'\n');
console.log(`${cues.length} performed cues; ${decisionEvents.length} independently scheduled source events; independent simultaneous vocal tracks preserved.`);
