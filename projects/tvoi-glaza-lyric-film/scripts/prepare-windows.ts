import {readFileSync,writeFileSync} from 'node:fs';
type TextLine={id:string;section:string;ru:{id:string;text:string}[]};
type Candidate={word:string;start:number;end:number};
const lines=JSON.parse(readFileSync('source/text-and-mapping.json','utf8')) as TextLine[];
const aligned=JSON.parse(readFileSync('analysis/mms-vocals-sections.json','utf8')) as {segments:{id:string;words:Candidate[]}[]};
const all=aligned.segments.flatMap(s=>s.words);let cursor=0;
const windows=lines.map(l=>{const words=all.slice(cursor,cursor+l.ru.length);cursor+=words.length;const first=words[0],last=words.at(-1);if(!first||!last)throw Error('Missing source words '+l.id);return {id:l.id,text:l.ru.map(w=>w.text).join(' '),start:Math.max(0,first.start-.35),end:last.end+.4};});
if(cursor!==all.length)throw Error('Unmapped aligner words');
writeFileSync('analysis/line-windows.json',JSON.stringify(windows,null,2));console.log('Prepared',windows.length,'individually bounded lines');
