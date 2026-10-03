import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const ed=JSON.parse(readFileSync('source/lyrics-editorial.json','utf8'));
const template=(id:string)=>ed.templates.find((t:{id:string})=>t.id===id);
const index=(t:any,text:string)=>t.sourceTokens.find((s:any)=>s.text.replace(/[,—.]/g,'')===text).index;
test('sing a song does not invent an addressee and includes its article',()=>{
  const t=template('intro');assert(!t.targetText.match(/\b(us|me)\b/));
  const noun=index(t,'песенку');for(const text of ['a','song,'])assert.deepEqual(t.targetTokens.find((x:any)=>x.text===text).focusSourceIndices,[noun]);
});
test('passive tense and inflected person highlight as complete English meanings',()=>{
  const t=template('v1-time'),anchor=index(t,'сложено');
  for(const text of ['is','folded'])assert.deepEqual(t.targetTokens.find((x:any)=>x.text===text).focusSourceIndices,[anchor]);
});
test('repeated small pebbles never borrow focus from another occurrence',()=>{
  const t=template('refrain-pebbles');const nouns=t.sourceTokens.filter((x:any)=>x.text.includes('камушку')).map((x:any)=>x.index);
  assert.equal(nouns.length,2);for(const n of nouns){const targets=t.targetTokens.filter((x:any)=>x.focusSourceIndices.includes(n));assert.equal(targets.length,2);assert(targets.every((x:any)=>x.focusSourceIndices.length===1));}
});
test('negation and independently sung repetition are not swallowed by whole-line groups',()=>{
  for(const id of ['v1-sorrow','pre-run','pre-carry','pre-cross']){const t=template(id);for(const s of t.sourceTokens)assert(t.targetTokens.some((x:any)=>x.focusSourceIndices.length===1&&x.focusSourceIndices[0]===s.index));}
});
test('every translated word has a grammatical or lexical reason and valid event membership',()=>{
  for(const t of ed.templates){for(const x of t.targetTokens){assert(x.rationale);assert(x.focusSourceIndices.length);for(const i of x.focusSourceIndices)assert(t.sourceTokens[i]);}assert.equal(t.targetTokens.map((x:any)=>x.text).join(' '),t.targetText);}
});
