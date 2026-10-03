import {readFileSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {validateTimeline,visibleCues,vocalTrack,sourceActive,tokenActive,type Timeline} from '../../src/model.ts';
import {initScene,cueOpacity} from '../../src/scene.ts';

const read=(path:string)=>JSON.parse(readFileSync(path,'utf8'));
const hash=(path:string)=>createHash('sha256').update(readFileSync(path)).digest('hex');
const timeline:Timeline=read('public/timeline.json'),report=read('evidence/overlap-acoustic-v2.json');
const old=read('evidence/v1-event-identity.json'),russian=read('evidence/independent-acoustic-review.json');
const errors:string[]=[];const check=(yes:boolean,detail:string)=>{if(!yes)errors.push(detail);};
validateTimeline(timeline);initScene(timeline,read('public/audio-features.json'));
check(timeline.revision==='prizrak-preview-v2','Expected regenerated v2');
check(timeline.sourceSha256===report.sourceSha256 && old.sourceSha256===timeline.sourceSha256,'Source identity mismatch');
const all=timeline.cues.flatMap(c=>c.words.map(w=>({cue:c,word:w})));
const byId=new Map(all.map(x=>[x.word.id,x]));
let unchanged=0;
for(const prior of old.events){
 const current=byId.get(prior.wordId);
 const same=current?.cue.id===prior.cueId && current.word.text===prior.text && current.word.startSample===prior.startSample && current.word.endSample===prior.endSample;
 check(same,`Historical event changed: ${prior.wordId}`);if(same)unchanged++;
}
let russianAgreement=0;
for(const proposal of russian.russianPerWordProposals){
 const cue=timeline.cues.find(c=>c.id===proposal.phraseId);
 for(const u of proposal.units){const w=cue?.words[u.sourceIndex];const yes=w?.text===u.text && w?.startSample===u.proposedOnsetSample44100 && w?.endSample===u.proposedReleaseSample44100;check(yes,`Russian proposal mismatch ${proposal.phraseId}/${u.sourceIndex}`);if(yes)russianAgreement++;}
}
const newCue=timeline.cues.find(c=>c.id==='JP30-OVERLAP-001');check(!!newCue,'Missing new Japanese occurrence');
check(!!newCue && vocalTrack(newCue)==='japanese-upper','New voice must retain independent upper ownership');
const newComparisons=report.perWordProposals.map((u:any)=>{const w=newCue?.words[u.sourceIndex];const same=w?.text===u.text && w?.startSample===u.startSample && w?.endSample===u.endSample;check(same,`New proposal mismatch ${u.sourceIndex}`);return {sourceIndex:u.sourceIndex,text:u.text,startSample:w?.startSample,endSample:w?.endSample,proposalExactAgreement:same,onsetRange:u.onsetRange,releaseRange:u.releaseRange};});
check(timeline.cues.every(c=>!c.carry),'v2 independent tracks should not reassign a voice into carry');
let activeBodyChecks=0,languageContributorChecks=0,releaseChecks=0,newBodyChecks=0;
for(const {cue,word} of all){
 const times=new Set<number>([word.startSample/44100,(word.endSample-1)/44100]);
 for(let frame=Math.ceil(word.startSample/44100*60);frame/60<word.endSample/44100;frame++)times.add(frame/60);
 for(const t of times){
  activeBodyChecks++;if(cue===newCue)newBodyChecks++;
  check(sourceActive(word,t),`Inactive selected word ${word.id}@${t}`);
  check(visibleCues(timeline,t).includes(cue),`Lost independent owner ${word.id}@${t}`);
  check(cueOpacity(cue,t)===1,`Partial opacity during selected body ${word.id}@${t}`);
  for(const lane of cue.lanes){languageContributorChecks++;check(lane.tokens.some(token=>token.sourceIndices.includes(word.sourceIndex)&&tokenActive(token,cue.words,t)),`Missing ${lane.language} focus ${word.id}@${t}`);}
 }
 releaseChecks++;check(!sourceActive(word,word.endSample/44100),`Release stays active ${word.id}`);
}

const checkpoints=new Set<number>();for(let f=211*60;f<223.5*60;f++)checkpoints.add(f/60);
for(const cue of timeline.cues){
 for(const t of [cue.start,cue.end,cue.visibleStart,cue.visibleEnd])if(t>=211&&t<223.5)checkpoints.add(t);
 for(const w of cue.words)for(const t of [w.startSample/44100,(w.endSample-1)/44100,w.endSample/44100])if(t>=211&&t<223.5)checkpoints.add(t);
}
let windowUnionChecks=0,simultaneousSelectedVoiceCheckpoints=0;
for(const t of [...checkpoints].sort((a,b)=>a-b)){
 const visible=visibleCues(timeline,t);
 const expectedVoices=timeline.cues.filter(c=>c.words.some(w=>t>=w.startSample/44100 && t<w.endSample/44100));
 if(new Set(expectedVoices.map(vocalTrack)).size===2)simultaneousSelectedVoiceCheckpoints++;
 for(const c of expectedVoices)check(visible.includes(c),`Missing simultaneous voice ${c.id}@${t}`);
 for(const c of visible)for(const lane of c.lanes)for(const token of lane.tokens){
  const expected=token.sourceIndices.some(i=>{const w=c.words[i];return t>=w.startSample/44100 && t<w.endSample/44100;});
  windowUnionChecks++;check(tokenActive(token,c.words,t)===expected,`Contributor union/gap mismatch ${token.id}@${t}`);
 }
}
const night=byId.get('RU-027-4')!,nightChecks:number[]=[];
check(night.word.text==='ночь' && night.word.startSample===Math.round(221.39*44100) && night.word.endSample===Math.round(222.24*44100),'Closing Russian night body changed');
for(let f=Math.ceil(221.8*60);f/60<222.24;f++)nightChecks.push(f/60);
nightChecks.push(221.8,(night.word.endSample-1)/44100);
for(const t of nightChecks){
 const visible=visibleCues(timeline,t);
 check(visible.includes(night.cue)&&visible.some(c=>c.id==='JP30-003'),'Closing overlap loses independent voice');
 check(sourceActive(night.word,t)&&cueOpacity(night.cue,t)===1,'Closing Russian body loses full focus/opacity');
}
const files=['public/timeline.json','scripts/build-timeline.ts','src/model.ts','src/scene.ts','public/audio-features.json','source/japanese-overlap-selected.json','evidence/overlap-acoustic-v2.json','evidence/v1-event-identity.json','evidence/independent-acoustic-review.json','analysis/overlap-v2/audit-selected.ts'];
const out={schemaVersion:1,status:errors.length?'failed':'passed',timelineRevision:timeline.revision,timelineSha256:hash('public/timeline.json'),sourceSha256:timeline.sourceSha256,
 scope:'Selected-event identity, independent track ownership, contributor unions and scene-opacity functions. No acoustic hearing, decoded pixel or real browser playback attestation.',
 counts:{cues:timeline.cues.length,sourceEvents:all.length,historicalEventIdentitiesUnchanged:unchanged,russianProposalExactAgreements:russianAgreement,newJapaneseEvents:newComparisons.length,activeBodyExactBoundaryAnd60fpsChecks:activeBodyChecks,newJapaneseBodyChecks:newBodyChecks,languageContributorChecks,exactReleaseChecks:releaseChecks,overlapWindowCheckpoints:checkpoints.size,overlapWindowUnionChecks:windowUnionChecks,simultaneousSelectedVoiceCheckpoints,closingNightOverlapChecks:nightChecks.length},
 newJapaneseProposals:newComparisons,closingOverlap:{russianWordId:night.word.id,startSeconds:221.39,endSeconds:222.24,japaneseOnsetSeconds:221.8,independentFullCueOwnership:true,carryReassignment:false},
 artifactIdentities:files.map(file=>({file,sha256:hash(file)})),
 limits:{humanListening:false,humanApproval:false,canonicalTimingModified:false,newAsrDuringThisSelectedAudit:false,scenePixelsAudited:false,realBrowserClockAudited:false,sampleSchedulingIsNotPerceptualCertainty:true},remainingListeningJudgments:['Quiet initial Japanese vowel212.2–212.6 and nasal handoff213.32–213.92.','Direct low vowel versus room decay in the layered releases.','Foreground/background perceptual alignment while both voices sing.'],errors};
writeFileSync('evidence/overlap-selected-audit-v2.json',JSON.stringify(out,null,2)+'\n');
writeFileSync('evidence/overlap-selected-audit-v2.md',`# Independent selected-overlap audit — призрак v2\n\n**Status: ${out.status}.** Timeline SHA256 \`${out.timelineSha256}\`.\n\nAll ${unchanged} historical source events remain unchanged; all ${russianAgreement} Russian word intervals match the independent proposals exactly. The six added Japanese events match the final proposals, including the revised213.70 s handoff. Both voices own complete cues on separate tracks; no Russian event is clipped or reassigned into a carry.\n\nThe source-event checkpoint audit covers ${activeBodyChecks} exact-boundary/60 fps body checkpoints, ${releaseChecks} exact releases and ${languageContributorChecks} language-contributor checks. In211–223.5 s, ${checkpoints.size} checkpoints and ${windowUnionChecks} target union checks retain separate simultaneous ownership and real contributor gaps. Primary cue opacity is1 throughout each selected active body. The unchanged Russian **ночь221.39–222.24** remains active beneath Japanese221.8.\n\nThis is a read-only scheduling/model/scene-function audit. It does not attest listening, exact perceptual timing, real browser clocks or decoded glyph pixels. The masked initial vowel, nasal handoff and body/room-decay split keep explicit review ranges. No source, canonical timing, scene, player, production media or remote state was edited.\n\n[Exact evidence and bound artifacts](overlap-selected-audit-v2.json).\n`);
console.log(JSON.stringify({status:out.status,timelineSha256:out.timelineSha256,counts:out.counts,errors},null,2));
if(errors.length)process.exitCode=1;
