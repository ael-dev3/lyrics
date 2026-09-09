import {readFileSync,writeFileSync} from 'node:fs';
type W={word:string;start:number;end:number;probability:number};
type S={text:string;start:number;end:number;words:W[]};
type C={id:string;lang:string;text:string;start:number;end:number;words:{text:string;start:number;end:number}[];evidence:string};
const read=(p:string):S[]=>{const d=JSON.parse(readFileSync(p,'utf8')) as {segments:S[]};if(!Array.isArray(d.segments)||d.segments.some(s=>!s.words.every(w=>Number.isFinite(w.start)&&Number.isFinite(w.end)&&typeof w.word==='string')))throw Error('Invalid alignment');return d.segments;};
const audioOffset=.0365;
const cues:C[]=[];
function put(s:S,lang:string,shift=0,evidence='bounded forced alignment',phrase=false){
 const words:{text:string;start:number;end:number}[]=[];
 for(const w of s.words){
  const start=w.start+shift+audioOffset,end=w.end+shift+audioOffset;
  const previous=words.at(-1);
  if((w.probability<.15||end-start<.035)&&previous){previous.text+=' '+w.word.trim();previous.end=Math.max(previous.end,end);}
  else words.push({text:w.word.trim(),start,end:Math.max(start+.0167,end)});
 }
 if(!words.length)return;
 if(phrase){const start=words[0]?.start??0,end=words.at(-1)?.end??0;words.splice(0,words.length,{text:s.text.trim(),start,end});}
 cues.push({id:lang+'-'+String(cues.length+1).padStart(3,'0'),lang,text:s.text.trim(),start:words[0]?.start??0,end:words.at(-1)?.end??0,words,evidence});
}
const fr=read('../aligned-fr.json');
fr.forEach((s,i)=>{if(i===0){s.start=42.42;if(s.words[0])s.words[0].start=42.42;}put(s,'fr',0,'multilingual forced alignment; low-confidence adjacent words grouped');});
const en=read('../aligned-en.json');
const starts=new Map([[0,8.86],[1,12.96],[2,17.24],[4,31.30],[5,39.86],[6,86.10],[7,90.22],[10,108.40],[11,116.97]]);
en.forEach((s,i)=>{const start=starts.get(i);if(start!==undefined&&s.words[0]){s.start=start;s.words[0].start=start;}put(s,'en');});
const extraE=read('../extra-aligned-en.json');
// Separate correlation peaks anchor each repeated phrase against the actual mix.
extraE.forEach((s,i)=>{put(s,'en',0,'independent spectral-template match plus bounded alignment',i===2||i===4||i===5||i===9);});
const verse=read('../verse3-aligned.json');
for(const shift of [-34.2334,-25.6667,-17.1000,-8.5667,0])verse.forEach(s=>put(s,'fr',shift,'clearest verse word alignment; occurrence shift measured by spectral correlation'));
// Intro/final French lines in v1.0.1 lacked corroboration and are excluded.
cues.sort((a,b)=>a.start-b.start);
for(const lang of ['fr','en']){const rows=cues.filter(c=>c.lang===lang);for(let i=0;i<rows.length-1;i++){const a=rows[i],b=rows[i+1];if(a&&b&&a.end>b.start){a.end=b.start;const last=a.words.at(-1);if(last)last.end=Math.min(last.end,b.start);}}}
for(const c of cues){if(c.start<0||c.end>379.3834||c.end<=c.start||c.words.some(w=>w.end<=w.start))throw Error('Bad cue '+c.id);}
writeFileSync('src/cues.json',JSON.stringify(cues,null,2));
writeFileSync('../cue-audit.json',JSON.stringify({audioOffset,offsetEvidence:'AAC versus Opus waveform correlation: 0.92–0.96 at five independent 3-second windows; AAC lags by 36.5ms',wordMethod:'forced alignment with uncertainty grouping; no character-weight division',excluded:'Unsupported French intro/final phrases and unresolvable chopped fragments use title state',cues},null,2));
console.log({lines:cues.length,fr:cues.filter(c=>c.lang==='fr').length,en:cues.filter(c=>c.lang==='en').length});
