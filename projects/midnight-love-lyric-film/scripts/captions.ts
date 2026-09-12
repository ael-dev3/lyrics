import {readFileSync,writeFileSync} from 'node:fs';
import {parseCues} from '../src/schema.ts';
import {SR} from '../src/config.ts';
const cues=parseCues(JSON.parse(readFileSync('src/cues.json','utf8')));
const time=(sample:number)=>{const ms=Math.round(sample/SR*1000),h=Math.floor(ms/3600000),m=Math.floor(ms/60000)%60,s=Math.floor(ms/1000)%60;return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')},${String(ms%1000).padStart(3,'0')}`;};
writeFileSync('output/Midnight-Love.en.srt',cues.map((c,i)=>`${i+1}\n${time(c.startSample)} --> ${time(c.endSample)}\n${c.words.map(w=>w.text.toLowerCase()).join(' ')}\n`).join('\n'));
