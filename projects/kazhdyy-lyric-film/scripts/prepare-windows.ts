import {readFileSync,writeFileSync} from 'node:fs';
const rows=JSON.parse(readFileSync('source/text-and-mapping.json','utf8')) as {id:string;ru:{text:string}[]}[];
const groups:[string,number,number,number,number][]=[['verse1',0,8,17,52.85],['hook1',8,14,52.75,91],['verse2',14,22,102.5,140.4],['pre2',22,25,140.2,155.25],['chorus2',25,28,155.1,171.5],['final',28,31,171.3,193]];
writeFileSync('source/sections.json',JSON.stringify(groups.map(([id,a,b,start,end])=>({id,start,end,text:rows.slice(a,b).flatMap(c=>c.ru.map(w=>w.text)).join(' ')})),null,2)+'\n');
