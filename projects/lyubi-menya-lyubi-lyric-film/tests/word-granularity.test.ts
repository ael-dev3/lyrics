import {readFileSync} from 'node:fs';
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {parseData} from '../src/schema.ts';
import type {Layouts} from '../src/layout-types.ts';
import {auditWordGranularity} from '../scripts/audit-word-granularity.ts';
const read=(path:string)=>JSON.parse(readFileSync(new URL(path,import.meta.url),'utf8'));
const data=parseData(read('../src/cues.json')),layouts=read('../src/layout.json') as Layouts;

test('all current words receive precise independent or explicitly justified focus in both layouts',()=>{
 const audit=auditWordGranularity(data,layouts);
 assert.equal(audit.russianWords,147);assert.equal(audit.englishWords,169);
 assert.equal(audit.singleEnglishEvents,125);
 assert.equal(audit.necessaryEnglishPairs.reduce((sum,group)=>sum+group.events.length,0),22);
});

test('the word audit rejects broad source groups, orphan translations and arbitrary English pairs',()=>{
 const broad=structuredClone(data);broad.cues[1]!.en.at(-1)!.focusSourceIds=broad.cues[1]!.ru.slice(3).map(word=>word.id);
 assert.throws(()=>auditWordGranularity(broad,layouts),/one performed Russian word/);
 const orphan=structuredClone(data);orphan.cues[0]!.en[0]!.sourceIds=[];
 assert.throws(()=>auditWordGranularity(orphan,layouts),/one performed Russian word/);
 const grouped=structuredClone(data);grouped.cues[0]!.en[0]!.sourceIds=[grouped.cues[0]!.ru[0]!.id];
 assert.throws(()=>auditWordGranularity(grouped,layouts),/unnecessary or unreviewed English grouping/);
});
