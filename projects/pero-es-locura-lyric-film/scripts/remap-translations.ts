import {readFileSync,writeFileSync} from 'node:fs';
import assert from 'node:assert/strict';
import {parseData} from '../src/schema.ts';
import {translate} from '../src/translation.ts';
import type {TranslationTemplate} from '../src/translation.ts';

const read=(path:string)=>JSON.parse(readFileSync(path,'utf8'));
const data=parseData(read('src/cues.json'));
const templates=read('source/translation-templates.json') as TranslationTemplate[];
const sequence=read('source/performed-sequence.json') as {displayGroups:string[][]}[];
const groups=sequence.flatMap(p=>p.displayGroups);
assert.equal(groups.length,data.cues.length);
for(const [i,cue] of data.cues.entries()){
  let offset=0;const next=[];
  for(const id of groups[i]!){
    const template=templates.find(t=>t.id===id);assert.ok(template);
    const words=cue.es.slice(offset,offset+template.es.split(/\s+/).length);
    next.push(...translate(template,words,cue.id,next.length));offset+=words.length;
  }
  assert.equal(offset,cue.es.length);
  if(next[0])next[0].text=next[0].text.replace(/^\p{L}/u,c=>c.toLocaleUpperCase('en'));
  assert.deepEqual(next.map(w=>({id:w.id,text:w.text})),cue.en.map(w=>({id:w.id,text:w.text})),'This pass must not change displayed wording');
  cue.en=next;
}
parseData(data);
writeFileSync('src/cues.json',JSON.stringify(data,null,2)+'\n');
console.log('Updated translation mappings only; all source timestamps and displayed text retained.');
