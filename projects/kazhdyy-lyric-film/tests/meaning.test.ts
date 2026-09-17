import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {parseData} from '../src/schema.ts';
import {activeTargets,frameAt} from '../src/focus.ts';
const d=parseData(JSON.parse(readFileSync('src/cues.json','utf8')));
const cue=(id:string)=>d.cues.find(c=>c.id===id)!;
const span=(id:string,source:string)=>{const c=cue(id),w=c.ru.find(w=>w.text.replace(/[,….]/g,'')===source)!;return c.en.filter(t=>t.sourceIds.includes(w.id)).map(t=>t.text).join(' ');};
test('complete grammatical spans and individual negation',()=>{
 assert.equal(span('KB-002','пледом'),'with a blanket,');
 assert.equal(span('KB-003','Залезу'),"I'll crawl");
 assert.equal(span('KB-004','Питер'),'St. Petersburg,');
 assert.equal(span('KB-009','столе'),'the table');
 assert.equal(span('KB-009','не'),'not');
 assert.equal(span('KB-010','Привяжу'),"I'll tie");
 assert.equal(span('KB-010','темноты'),'of the dark');
 assert.equal(span('KB-019','бы'),'would');
 assert.equal(span('KB-018','улыбалась'),'you smile');
});
test('discontinuous hurt does not absorb intervening you',()=>{
 const c=cue('KB-001'),hurt=c.en.find(w=>w.text==='hurt')!,you=c.ru.find(w=>w.text==='тебе')!;
 assert.deepEqual(hurt.sourceIds,['KB-001-s03','KB-001-s05']);
 const frame=frameAt((you.startSample+you.endSample)/2,d.sampleRate,d.fps);
 assert.equal(activeTargets(c,frame,d).has(hurt.id),false);
});
test('repeated wishes have separate event unions, never one broad phrase',()=>{
 const c=cue('KB-018');assert.deepEqual(c.en[0]!.sourceIds,['KB-018-s01','KB-018-s02']);
 assert.deepEqual(c.en[6]!.sourceIds,['KB-018-s06','KB-018-s07']);
 assert.equal(c.en.filter(w=>w.text==="don't").length,1);
});
test('supplied nonlexical vocalisation retained once',()=>{
 const c=d.cues.filter(c=>c.section==='Vocalisation');assert.equal(c.length,1);assert.equal(c[0]!.ru[0]!.text,'У-у-у');assert.equal(c[0]!.en[0]!.text,'Ooh');
});
