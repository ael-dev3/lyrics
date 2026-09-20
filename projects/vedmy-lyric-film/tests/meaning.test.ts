import {test} from 'node:test';
import assert from 'node:assert/strict';
import {timedLyrics as d} from '../src/timed-lyrics.ts';
import type {SourceWord} from '../src/schema.ts';
import {activeDisplaySource,activeTargets} from '../src/focus.ts';
test('discontinuous idiom completes both languages without absorbing the explicit recipient',()=>{
 const c=d.cues.find(c=>c.id==='VE-032');assert.ok(c);
 const me=c.ru.find(w=>w.text==='мне'),dust=c.ru.find(w=>w.text==='пыль');assert.ok(me&&dust);
 const at=(w:typeof me)=>Math.round((w.startSample+w.endSample)/2/d.sampleRate*d.fps);
 const words=(ids:Set<string>)=>c.en.filter(w=>ids.has(w.id)).map(w=>w.text).join(' ');
 assert.equal(words(activeTargets(c,at(me),d)),'me');
 assert.equal(words(activeTargets(c,at(dust),d)),'you were deceiving');
 assert.deepEqual(c.ru.filter(w=>activeDisplaySource(c,at(dust),d).has(w.id)).map(w=>w.text),['в','глаза','кидал','пыль']);
});
test('negation and possessive remain independent source events',()=>{
 const c=d.cues.find(c=>c.id==='VE-019');assert.ok(c);
 for(const [ru,en] of [['Не','not'],['мои','my']]){const word:SourceWord|undefined=c.ru.find(item=>item.text===ru);assert.ok(word);const active=activeTargets(c,Math.round((word.startSample+word.endSample)/2/d.sampleRate*60),d);assert.equal(c.en.filter(w=>active.has(w.id)).map(w=>w.text).join(' '),en);}
});
test('all four choruses have separate source events and timing candidates',()=>{
 const rows=d.cues.filter(c=>c.ru.map(w=>w.text).join(' ')==='На ветру белое платье');assert.equal(rows.length,4);assert.equal(new Set(rows.map(c=>c.startSample)).size,4);assert.equal(new Set(rows.flatMap(c=>c.ru.map(w=>w.id))).size,16);
});
test('grammatical expansions highlight completely without absorbing neighboring meanings',()=>{
 const examples=[['VE-004','поосторожней','more careful'],['VE-005','Искупи','Atone for'],['VE-011','Искусаю',"I'll bite"],['VE-017','Хочешь,','If you want,'],['VE-030','отпустить','to let go'],['VE-031','казалось','It seemed'],['VE-033','возгорит','will burn']];
 for(const [id,source,target] of examples){const c=d.cues.find(c=>c.id===id);assert.ok(c);const w=c.ru.find(w=>w.text===source);assert.ok(w);const f=Math.round((w.startSample+w.endSample)/2/d.sampleRate*d.fps);const active=activeTargets(c,f,d);assert.equal(c.en.filter(w=>active.has(w.id)).map(w=>w.text).join(' '),target);}
});
test('the short negation in the first verse stays separate from ask and mercy',()=>{
 const c=d.cues.find(c=>c.id==='VE-012');assert.ok(c);const w=c.ru.find(w=>w.text==='не');assert.ok(w);
 const f=Math.round((w.startSample+w.endSample)/2/d.sampleRate*d.fps),active=activeTargets(c,f,d);
 assert.equal(c.en.filter(w=>active.has(w.id)).map(w=>w.text).join(' '),"Don't");
 assert.deepEqual(c.ru.filter(w=>activeDisplaySource(c,f,d).has(w.id)).map(w=>w.text),['не']);
});
