import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {sourceActive,tokenActive,validateTimeline,visibleCues,vocalTrack,type Timeline} from '../src/model.ts';
const timeline=JSON.parse(readFileSync('public/timeline.json','utf8')) as Timeline;
test('complete three-language performance inventory and canonical event order',()=>{
 validateTimeline(timeline);
 assert.ok(timeline.cues.some(c=>c.sourceLanguage==='ja' && c.start<40),'Opening Japanese fragment missing');
 assert.ok(timeline.cues.some(c=>c.sourceLanguage==='ja' && c.start>220),'Japanese closing responses missing');
 assert.ok(timeline.cues.some(c=>c.sourceLanguage==='ru' && c.start>130 && c.start<175));
 for(const c of timeline.cues)for(const w of c.words){
  assert.equal(sourceActive(w,(w.startSample-1)/44100),false,`${w.id}: anticipation`);
  assert.equal(sourceActive(w,w.startSample/44100),true,`${w.id}: first sample missing`);
  assert.equal(sourceActive(w,(w.endSample-1)/44100),true,`${w.id}: final sample missing`);
  assert.equal(sourceActive(w,w.endSample/44100),false,`${w.id}: exclusive end`);
 }
});
test('simultaneous full cues preserve Russian events and independent Japanese ownership',()=>{
 const old=JSON.parse(readFileSync('evidence/v1-event-identity.json','utf8'));
 const current=timeline.cues.filter(c=>c.id!=='JP30-OVERLAP-001').flatMap(c=>c.words.map(w=>({cueId:c.id,wordId:w.id,text:w.text,startSample:w.startSample,endSample:w.endSample})));
 assert.deepEqual(current,old.events,'Adding a new voice must not move or shorten any previously selected vocal body');
 const newCue=timeline.cues.find(c=>c.id==='JP30-OVERLAP-001')!;
 assert.equal(vocalTrack(newCue),'japanese-upper');
 assert.deepEqual(newCue.words.map(w=>w.text),['憂き','もの','は','なし','暁','ばかり']);
 for(const time of [212.5,213.5,215.5,217.5,220,222]){
  const visible=visibleCues(timeline,time);
  assert.ok(visible.some(c=>vocalTrack(c)==='lead' && c.sourceLanguage==='ru'));
  assert.ok(visible.some(c=>vocalTrack(c)==='japanese-upper' && c.sourceLanguage==='ja'));
  for(const cue of visible)for(const lane of cue.lanes){
   if(cue.words.some(w=>sourceActive(w,time)))assert.ok(lane.tokens.some(t=>tokenActive(t,cue.words,time)),`${cue.id}/${lane.language}: active voice lost`);
  }
 }
 const russian=timeline.cues.find(c=>c.id==='RU-027')!,end=russian.words.at(-1)!.endSample/44100;
 assert.ok(russian.visibleEnd>=end,'Japanese entrance must not truncate Russian cue');
 assert.ok(visibleCues(timeline,end-1/44100).some(c=>c.id===russian.id));
 const damaged=structuredClone(timeline);damaged.cues.find(c=>c.id==='RU-027')!.visibleEnd=end-.1;
 assert.throws(()=>validateTimeline(damaged),/Invalid reading interval|Truncated performed voice/);
});
test('Japanese counterfactual keeps the entire translated verb meaning focused',()=>{
 for(const c of timeline.cues.filter(c=>c.label.includes('寝なまし'))){
  assert.equal(c.words[1]!.text,'寝なまし');
  const en=c.lanes.find(l=>l.language==='en')!;
  for(const t of ['I','should','have','slept'])assert.deepEqual(en.tokens.find(w=>w.text===t)!.sourceIndices,[1]);
  const ru=c.lanes.find(l=>l.language==='ru')!;
  for(const t of ['стоило','бы','уснуть,'])assert.deepEqual(ru.tokens.find(w=>w.text===t)!.sourceIndices,[1]);
 }
});
test('translations keep negation, short grammar and complete inflected meanings',()=>{
 for(const c of timeline.cues.filter(c=>c.label.startsWith('Мой сон'))){
  const lane=c.lanes.find(l=>l.language==='en')!;
  const not=lane.tokens.find(t=>t.text==='not')!;assert.deepEqual(not.sourceIndices,[2]);
  for(const token of ['was','troubled'])assert.deepEqual(lane.tokens.find(t=>t.text===token)!.sourceIndices,[3]);
  for(const token of ['by','thoughts'])assert.deepEqual(lane.tokens.find(t=>t.text===token)!.sourceIndices,[4]);
 }
 for(const c of timeline.cues.filter(c=>c.label.startsWith('Что я исчез'))){
  const en=c.lanes.find(l=>l.language==='en')!;
  assert.deepEqual(en.tokens.find(t=>t.text==='I')!.sourceIndices,[1]);
  for(const token of ['have','vanished'])assert.deepEqual(en.tokens.find(t=>t.text===token)!.sourceIndices,[2]);
 }
});
test('multi-event meaning uses participating intervals rather than bounding envelope',()=>{
 const words=[{id:'a',text:'a',sourceIndex:0,startSample:100,endSample:200,confidence:'fixture',method:'fixture'},{id:'x',text:'x',sourceIndex:1,startSample:250,endSample:300,confidence:'fixture',method:'fixture'},{id:'b',text:'b',sourceIndex:2,startSample:350,endSample:400,confidence:'fixture',method:'fixture'}];
 const token={id:'meaning',text:'complete meaning',sourceIndices:[0,2],rationale:'Independent non-contiguous regression fixture'};
 assert.equal(tokenActive(token,words,150/44100),true);
 assert.equal(tokenActive(token,words,275/44100),false);
 assert.equal(tokenActive(token,words,325/44100),false);
 assert.equal(tokenActive(token,words,375/44100),true);
});
