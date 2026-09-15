import {readFileSync,writeFileSync} from 'node:fs';
const lines=readFileSync('source/original.txt','utf8').trim().split('\n').filter(Boolean);
type Pair=[string,number|number[]];
const raw:unknown=JSON.parse(readFileSync('source/meaning-map-draft.json','utf8'));
if(!Array.isArray(raw)||raw.length!==lines.length)throw Error('Translation/source line count mismatch');
const maps=raw.map((row:unknown)=>{if(!Array.isArray(row))throw Error('Map row');return row.map((p:unknown):Pair=>{if(!Array.isArray(p)||typeof p[0]!=='string'||!(typeof p[1]==='number'||Array.isArray(p[1])&&p[1].every((n:unknown)=>typeof n==='number')))throw Error('Map pair');return [p[0],p[1]];});});
for(const row of [8,20]){const m=maps[row];if(m){m[0]=['Hundreds of',0];m[1]=['night',1];}}
for(const row of [10,22,24]){const m=maps[row];if(m)m.splice(7,1,['for',4],['the last',5],['time',6]);}
const sections=['V1','V1','V1','V1','V1','V1','V1','V1','C1','C1','C1','C1','V2','V2','V2','V2','V2','V2','V2','V2','C2','C2','C2','C2','END','END'];
const records=lines.map((ru,i)=>{const id='L'+String(i+1).padStart(2,'0'),words=ru.split(/\s+/),m=maps[i];if(!m)throw Error('Missing map');
const en=m.flatMap(([text,ref])=>text.split(/\s+/).map(word=>({text:word,sourceIndices:typeof ref==='number'?[ref]:ref})));
const refs=en.flatMap(w=>w.sourceIndices);if(refs.some(n=>n<0||n>=words.length)||words.some((_,n)=>!refs.includes(n)))throw Error('Source coverage '+id);
return {id,section:sections[i],ru:words.map((text,j)=>({id:id+'-ru-'+String(j+1).padStart(2,'0'),text})),en:en.map((w,j)=>({id:id+'-en-'+String(j+1).padStart(2,'0'),text:w.text,sourceIds:w.sourceIndices.map(n=>id+'-ru-'+String(n+1).padStart(2,'0'))}))};});
writeFileSync('source/text-and-mapping.json',JSON.stringify(records,null,2)+'\n');
writeFileSync('source/translation-en.txt',records.map(r=>r.en.map(w=>w.text).join(' ')).join('\n')+'\n');
const ranges=[['V1',1.5,39.5],['C1',39.5,74],['V2',74,110.5],['C2',110.5,143.2],['END',143.2,161.5]] as const;
writeFileSync('analysis/section-windows.json',JSON.stringify(ranges.map(([id,start,end])=>({id,start,end,text:records.filter(r=>r.section===id).map(r=>r.ru.map(w=>w.text).join(' ')).join(' ')})),null,2));
console.log({lines:records.length,sourceWords:records.reduce((n,r)=>n+r.ru.length,0),englishWords:records.reduce((n,r)=>n+r.en.length,0)});
