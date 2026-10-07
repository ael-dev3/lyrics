import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {sourceActive,targetActive,validateTimeline,type Timeline} from '../src/model.ts';
import {cueOpacity} from '../src/scene.ts';
const timeline=JSON.parse(readFileSync(new URL('../public/timeline.json',import.meta.url),'utf8')) as Timeline;
test('every source word has inclusive onset / exclusive release, without half-sample anticipation',()=>{
 validateTimeline(timeline);
 for(const c of timeline.cues)for(const w of c.words){
  assert.equal(sourceActive(w,(w.startSample-.49)/timeline.sampleRate),false,w.id);
  assert.equal(sourceActive(w,w.startSample/timeline.sampleRate),true,w.id);
  assert.equal(sourceActive(w,(w.endSample-.49)/timeline.sampleRate),true,w.id);
  assert.equal(sourceActive(w,w.endSample/timeline.sampleRate),false,w.id);
 }
});
test('English focus covers complete required grammar and uses actual source-event unions',()=>{
 for(const c of timeline.cues)for(const w of c.words){
  const t=(w.startSample+w.endSample)/2/timeline.sampleRate;
  const expected=c.targets.filter(e=>e.focusSourceIndices.includes(w.sourceIndex));
  assert.ok(expected.length>0,w.id);
  assert.deepEqual(c.targets.filter(e=>targetActive(e,c.words,t)).map(e=>e.id),expected.map(e=>e.id),w.id);
 }
 const c=timeline.cues[6]!,any=c.targets.filter(e=>e.focusSourceIndices.length===2);
 assert.equal(any.length,3); // any / more / than
 const gap=(c.words[4]!.endSample+c.words[5]!.startSample)/2/timeline.sampleRate;
 assert.ok(any.every(e=>!targetActive(e,c.words,gap)),'A semantic union must not light the gap');
 const chest=timeline.cues[8]!;
 assert.deepEqual(chest.targets.filter(e=>targetActive(e,chest.words,(chest.words[4]!.startSample+1)/44100)).map(e=>e.text),['my','chest']);
});
test('all words are fully readable for their complete vocal body and adjacent handoffs',()=>{
 for(const c of timeline.cues)for(const w of c.words){
  assert.equal(cueOpacity(c,w.startSample/44100),1,w.id);
  assert.equal(cueOpacity(c,(w.endSample-.49)/44100),1,w.id);
 }
 for(let i=1;i<timeline.cues.length;i++){
  const previous=timeline.cues[i-1]!,next=timeline.cues[i]!;
  if(previous.exitMode==='vocal-handoff'){assert.equal(previous.visibleEnd,next.start);assert.equal(cueOpacity(next,next.start),1);}
 }
});
test('the changing refrains and final audible inflection remain separate',()=>{
 assert.match(timeline.cues[8]!.sourceText,/бьётся/);assert.match(timeline.cues[20]!.sourceText,/рвётся/);assert.match(timeline.cues[24]!.sourceText,/нету сердца/);
 assert.match(timeline.cues[9]!.targetText,/gentle death/);assert.match(timeline.cues[21]!.targetText,/certain death/);
 assert.match(timeline.cues[10]!.targetText,/for us/);assert.match(timeline.cues[22]!.targetText,/your place/);assert.match(timeline.cues[26]!.targetText,/for me/);
});
