import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import type {Cue} from '../src/schema.ts';
const cues=JSON.parse(readFileSync('src/cues.json','utf8')) as Cue[];
const time=(sample:number)=>{const ms=Math.round(sample/48);return `${String(Math.floor(ms/3600000)).padStart(2,'0')}:${String(Math.floor(ms/60000)%60).padStart(2,'0')}:${String(Math.floor(ms/1000)%60).padStart(2,'0')},${String(ms%1000).padStart(3,'0')}`;};
mkdirSync('output',{recursive:true});
for(const language of ['ru','en'])writeFileSync(`output/Pozhary.${language}.srt`,cues.map((c,i)=>`${i+1}\n${time(c.startSample)} --> ${time(c.endSample)}\n${language==='ru'?c.words.map(w=>w.text).join(' '):c.en.map(e=>e.text).join(' ')}\n`).join('\n'));
