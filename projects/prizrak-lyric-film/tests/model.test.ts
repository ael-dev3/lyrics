import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {sourceActive,tokenActive,validateTimeline,visibleCue,type Timeline} from '../src/model.ts';
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
test('closing language handoff preserves both voices with unchanged original intervals',()=>{
 const prior=timeline.cues.find(c=>c.id==='RU-027')!;
 const next=timeline.cues.find(c=>c.id==='JP30-003')!;
 const original=prior.words.at(-1)!;
 assert.ok(next.start<prior.end);
 assert.equal(prior.visibleEnd,next.visibleStart);
 assert.equal(next.carry!.words[0]!.startSample,original.startSample);
 assert.equal(next.carry!.words[0]!.endSample,original.endSample);
 const time=(original.endSample-1)/44100;
 assert.equal(visibleCue(timeline,time)!.id,next.id);
 assert.equal(sourceActive(next.words[0]!,time),true);
 assert.equal(sourceActive(next.carry!.words[0]!,time),true);
 for(const l of next.carry!.lanes)assert.equal(tokenActive(l.tokens[0]!,next.carry!.words,time),true);
 assert.equal(sourceActive(next.carry!.words[0]!,original.endSample/44100),false);
 const damaged=structuredClone(timeline);damaged.cues.find(c=>c.id===next.id)!.carry!.words[0]!.endSample--;
 assert.throws(()=>validateTimeline(damaged),/Changed carried voice/);
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
