import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {parseData} from '../src/schema.ts';
import {activeSource,activeTargets,frameAt} from '../src/focus.ts';
import {assertReview} from '../scripts/sync-gate.ts';
const data=parseData(JSON.parse(readFileSync('src/cues.json','utf8')));
test('every Russian event highlights its complete mapped English span at every frame',()=>{for(const c of data.cues){for(let f=frameAt(c.startSample,data.sampleRate,60);f<=frameAt(c.endSample,data.sampleRate,60);f++){const ru=activeSource(c,f,data),en=activeTargets(c,f,data);for(const w of c.en)assert.equal(en.has(w.id),w.sourceIds.some(id=>ru.has(id)),c.id+' '+w.text+' '+f);}}});
test('individual small words and complete grammatical expansions stay linked',()=>{
 const find=(id:string)=>{const c=data.cues.find(c=>c.id===id);assert.ok(c);return c;};
 const target=(id:string,sourceIndex:number)=>{const c=find(id),w=c.ru[sourceIndex];assert.ok(w);return c.en.filter(t=>t.sourceIds.includes(w.id)).map(t=>t.text).join(' ');};
 assert.equal(target('L17',1),'will learn');assert.equal(target('L17',3),'to love');assert.equal(target('L17',2),'you');
 assert.equal(target('L11',0),'Just');assert.equal(target('L11',4),'for');assert.equal(target('L11',5),'the last');assert.equal(target('L11',6),'time');
 assert.equal(target('L18',3),'cannot');assert.equal(target('L20',1),'was the one who');assert.equal(target('L20',2),'myself');
 assert.equal(target('L26',2),'will turn into');assert.equal(target('L26',1),'the sun');
});
test('focus releases at exclusive ends and display quantization is within half a frame',()=>{for(const c of data.cues)for(const w of c.ru){for(const s of [w.startSample,w.endSample])assert.ok(Math.abs(frameAt(s,data.sampleRate,60)/60-s/data.sampleRate)<=1/120+1e-10);assert.equal(activeSource(c,frameAt(w.endSample,data.sampleRate,60),data).has(w.id),false);}});
test('English word order can differ from acoustic source order',()=>{const c=data.cues.find(c=>c.id==='L26');assert.ok(c);const sun=c.en.findIndex(t=>t.text==='sun'),turn=c.en.findIndex(t=>t.text==='turn');assert.ok(turn<sun);const sourceSun=c.ru[1],sourceTurn=c.ru[2];assert.ok(sourceSun&&sourceTurn);assert.ok(sourceSun.startSample<sourceTurn.startSample);});
test('missing, incomplete and stale listening evidence cannot unlock production',()=>{
 assert.throws(()=>assertReview(undefined,{},[]));assert.throws(()=>assertReview({status:'incomplete'},{},[]),/actual-audio/);
 const base={status:'complete',reviewer:{role:'test fixture only',method:'synthetic test, not real review',actualListening:true},requirements:Object.fromEntries(['translation','targetSpans','fullTrackAudio','highRiskSlowAudio','introGapsRepeatsTail','allFormatsAudiovisual','noKnownDefects'].map(k=>[k,true])),hashes:{audio:'old'},cues:[],unresolved:[]};
 assert.throws(()=>assertReview(base,{audio:'changed'},[]),/stale/);
 assert.throws(()=>assertReview(base,{audio:'old'},['L01']),/inventory/);
 assert.throws(()=>assertReview({...base,reviewer:{...base.reviewer,actualListening:false}},{audio:'old'},[]),/listening evidence/);
});
test('owner-attested review needs explicit authorization and still rejects changed inputs',()=>{
 const r=JSON.parse(readFileSync('evidence/cross-language-sync-review.json','utf8'));
 assert.equal(r.reviewMode,'user-attested');
 assert.doesNotThrow(()=>assertReview(r,r.hashes,data.cues.map(c=>c.id)));
 assert.throws(()=>assertReview({...r,authorization:{...r.authorization,fullRenderAuthorized:false}},r.hashes,data.cues.map(c=>c.id)),/sign-off/);
 assert.throws(()=>assertReview(r,{...r.hashes,'src/cues.json':'changed'},data.cues.map(c=>c.id)),/stale/);
 assert.equal(r.requirements.highRiskSlowAudio,null);
});
