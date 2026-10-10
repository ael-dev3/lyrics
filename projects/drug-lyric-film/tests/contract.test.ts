import {test} from 'node:test';import {strict as assert} from 'node:assert';import {readFileSync} from 'node:fs';
import {validateTimeline,sourceActive,targetActive,readingWindow,type Timeline} from '../src/model.ts';
import {productionAllowed,type Review} from '../src/review-gate.ts';
const timeline=JSON.parse(readFileSync(new URL('../public/timeline.json',import.meta.url),'utf8')) as Timeline;
test('All source events have complete mapped meaning; source endpoints are exclusive',()=>{
 validateTimeline(timeline);
 for(const c of timeline.cues)for(const w of c.words){assert.ok(sourceActive(w,w.startSample/44100));assert.ok(!sourceActive(w,w.endSample/44100));assert.ok(!sourceActive(w,(w.startSample-.1)/44100));assert.ok(c.targets.some(t=>targetActive(t,c.words,(w.startSample+w.endSample)/2/44100)));}
});
test('Small grammar words and future expansions preserve individual source events',()=>{
 const c=timeline.cues.find(c=>c.id==='v1-c')!;
 const meanings=(i:number)=>c.targets.filter(t=>t.focusSourceIndices.includes(i)).map(t=>t.text);
 assert.deepEqual(meanings(0),["you'll",'be']);assert.deepEqual(meanings(1),['Now']);assert.deepEqual(meanings(2),['my']);assert.deepEqual(meanings(3),['substitute','for']);assert.deepEqual(meanings(4),['glycine']);
 const f=timeline.cues.find(c=>c.id==='v1-f')!;assert.deepEqual(f.targets.filter(t=>t.focusSourceIndices.includes(2)).map(t=>t.text),['I','want','to']);
 const h=timeline.cues.find(c=>c.id==='v1-h')!;assert.deepEqual(h.targets.filter(t=>t.focusSourceIndices.includes(3)).map(t=>t.text),['a','sick',"person's"]);
});
test('Repeated filtered words are independently represented without broad instrumental focus',()=>{
 const repeats=timeline.cues.filter(c=>c.templateId==='repeat');assert.equal(repeats.reduce((n,c)=>n+c.words.length,0),15);
 assert.ok(!timeline.cues.some(c=>c.words.some(w=>sourceActive(w,49)||sourceActive(w,120)||sourceActive(w,149))));
});
test('Continuous vocal handoff avoids compressed fades and invisible incoming words',()=>{
 const r=readingWindow(1,2,8,undefined,2.1,2);assert.equal(r.exitMode,'vocal-handoff');assert.equal(r.fullOpacityEnd,2.1);assert.equal(r.visibleEnd,2.1);
});
test('Production rejects pending, stale and incomplete review scopes',()=>{
 const identity={revision:'r',sourceSha256:'source',timelineSha256:'timeline',sceneSha256:'scene'};
 const complete:Review={...identity,synchronization:{status:'complete',normalSpeedFullRecording:true,uncertainWordsAndHeldEndingsAtReducedSpeed:true,layouts:['landscape','portrait'],languages:['ru','en']},renderApproval:{approved:true}};
 assert.ok(productionAllowed(complete,identity));assert.ok(!productionAllowed({...complete,renderApproval:{approved:false}},identity));assert.ok(!productionAllowed(complete,{...identity,sceneSha256:'changed'}));assert.ok(!productionAllowed({...complete,synchronization:{...complete.synchronization,layouts:['landscape']}},identity));assert.ok(!productionAllowed({...complete,synchronization:{...complete.synchronization,uncertainWordsAndHeldEndingsAtReducedSpeed:false}},identity));
});
