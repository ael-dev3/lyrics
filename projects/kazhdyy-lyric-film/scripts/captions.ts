import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {parseData} from '../src/schema.ts';
import {assertProductionGate} from './production-contract.ts';
assertProductionGate();
const data=parseData(JSON.parse(readFileSync('src/cues.json','utf8')));
const stamp=(samples:number)=>{const ms=Math.round(samples/data.sampleRate*1000);return [Math.floor(ms/3600000),Math.floor(ms/60000)%60,Math.floor(ms/1000)%60].map(n=>String(n).padStart(2,'0')).join(':')+','+String(ms%1000).padStart(3,'0');};
mkdirSync('publishing/captions',{recursive:true});
for(const language of ['ru','en','bilingual'] as const){const text=data.cues.map((c,i)=>{const ru=c.ru.map(w=>w.text).join(' '),en=c.en.map(w=>w.text).join(' ');return `${i+1}\n${stamp(c.startSample)} --> ${stamp(c.endSample)}\n${language==='ru'?ru:language==='en'?en:ru+'\n'+en}\n`;}).join('\n');writeFileSync(`publishing/captions/Kazhdyy-${language}.srt`,text);}
