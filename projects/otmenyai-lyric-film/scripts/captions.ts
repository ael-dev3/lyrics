import {readFileSync,writeFileSync} from 'node:fs';
type Cue={startSample:number;endSample:number;words:{text:string}[];en:{text:string}[]};
const cues=JSON.parse(readFileSync('src/cues.json','utf8')) as Cue[];
const tc=(s:number)=>{const ms=Math.round(s/48);return `${String(Math.floor(ms/3600000)).padStart(2,'0')}:${String(Math.floor(ms/60000)%60).padStart(2,'0')}:${String(Math.floor(ms/1000)%60).padStart(2,'0')},${String(ms%1000).padStart(3,'0')}`;};
for(const lang of ['ru','en'])writeFileSync(`../../outputs/REDCHINAWAVE-Otmenyai.${lang}.srt`,cues.map((c,i)=>`${i+1}\n${tc(c.startSample)} --> ${tc(c.endSample)}\n${(lang==='ru'?c.words:c.en).map(w=>w.text).join(' ')}\n`).join('\n'));
