import {readFileSync,writeFileSync} from 'node:fs';
import {object,array,str} from '../src/schema.ts';
const plan=object(JSON.parse(readFileSync('source/lyric-plan.json','utf8')));
const rows=array(plan.rows).map(object);
writeFileSync('source/original.txt',rows.map(r=>str(r.text)).join('\n')+'\n');
console.log({cues:rows.length,language:'en',scope:'Text only; existing alignment windows and word boundaries are preserved.'});
