import {readFileSync,writeFileSync} from 'node:fs';
type W={word:string;start:number;end:number;probability?:number};type S={id:string;text:string;words:W[]};
const read=(s:string)=>(JSON.parse(readFileSync(`analysis/${s}.json`,'utf8')) as {segments:S[]}).segments;
const v=read('mms-vocals16'),m=read('mms-audio16'),e=read('wav2vec-vocals16'),a=read('attention-by-line');
const rows=v.flatMap((s,i)=>s.words.map((w,k)=>{const mix=m[i]?.words[k],eng=e[i]?.words[k],att=a[i]?.words[k];if(!mix||!eng||!att)throw Error('mismatch');return {id:s.id,k,word:w.word,v:w,m:mix,e:eng,a:att,spread:Math.max(w.start,mix.start,eng.start)-Math.min(w.start,mix.start,eng.start)};}));
writeFileSync('analysis/candidate-comparison.json',JSON.stringify(rows,null,2));
for(const s of v){console.log('\n'+s.id+' '+s.text);for(const r of rows.filter(r=>r.id===s.id))console.log(`${String(r.k).padStart(2)} ${r.word.padEnd(10)} ${[r.v,r.m,r.e,r.a].map(w=>`${w.start.toFixed(3)}–${w.end.toFixed(3)}(${(w.probability??0).toFixed(2)})`).join(' | ')}${r.spread>.18?' *':''}`);}
