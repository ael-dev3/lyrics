import {readFileSync,writeFileSync} from 'node:fs';
import assert from 'node:assert/strict';
import {parseCues} from '../src/schema.ts';
const original=parseCues(JSON.parse(readFileSync('analysis/v1.0-cues.json','utf8'))),tail=parseCues(JSON.parse(readFileSync('analysis/tail-correction/tail-cues.json','utf8')));
assert.equal(original.length,32);assert.equal(tail.length,6);
const byId=(id:string)=>{const c=original.find(c=>c.id===id);assert(c,'Missing source cue '+id);return c;};
const audit:unknown=JSON.parse(readFileSync('analysis/original-cue-audit/proposed-corrections.json','utf8'));
assert(audit&&typeof audit==='object'&&'corrections' in audit&&Array.isArray(audit.corrections)&&'groupChanges' in audit&&Array.isArray(audit.groupChanges));
for(const row of audit.corrections){assert(row&&typeof row.cue==='string'&&Number.isInteger(row.wordIndex)&&row.proposed&&row.original);const cue=byId(row.cue);assert.deepEqual(cue.words[row.wordIndex],row.original);cue.words[row.wordIndex]=row.proposed;assert(cue.words[0]&&cue.words.at(-1));cue.startSample=cue.words[0].startSample;cue.endSample=cue.words.at(-1)?.endSample??0;}
for(const row of audit.groupChanges){assert(row&&typeof row.cue==='string'&&Array.isArray(row.proposed));const cue=byId(row.cue);assert.deepEqual(cue.groups,row.original);cue.groups=row.proposed;}
const final=parseCues([...original,...tail]);
writeFileSync('src/cues.json',JSON.stringify(final,null,2)+'\n');
console.log({cues:final.length,words:final.reduce((n,c)=>n+c.words.length,0),groups:final.reduce((n,c)=>n+c.groups.length,0)});
