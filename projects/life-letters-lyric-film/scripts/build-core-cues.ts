import {readFileSync,writeFileSync} from 'node:fs';
import {parseCues} from '../src/schema.ts';
type Phrase={id:string;line:number;ru:string[];es:string[];groups:[number[],number[]][]};
type Word={word:string;start:number;end:number;probability:number};
type Segment={id:string;words:Word[]};
type CueInput={id:string;phraseId:string;start:number;end:number;ru:string[];es:string[];ruRows:number[][];esRows:number[][];events:{start:number;end:number;ru:number[];es:number[]}[];words:Word[];review:string};
const library=JSON.parse(readFileSync('source/semantic-map.json','utf8')) as {phrases:Phrase[]};
const alignment=JSON.parse(readFileSync('analysis/mms-vocals-continuous.json','utf8')) as {segments:Segment[]};
const metrics=JSON.parse(readFileSync('analysis/font-metrics.json','utf8')) as {unitsPerEm:number;widths:Record<string,number>};
const width=(s:string)=>Array.from(s.toUpperCase()).reduce((a,c)=>a+(metrics.widths[c]??metrics.unitsPerEm*.6)*82/metrics.unitsPerEm+.1,0);
function rows(words:string[]):number[][]{
 const result:number[][]=[];let row:number[]=[],used=0;
 for(const [i,word] of words.entries()){const w=width(word);if(w>1000)throw Error(`Unbreakable text wider than lane: ${word}`);if(row.length&&used+18+w>985){result.push(row);row=[];used=0;}row.push(i);used+=w+(row.length>1?18:0);}
 if(row.length)result.push(row);return result;
}
function phrase(i:number):Phrase{const p=library.phrases[i];if(!p)throw Error('Missing phrase '+i);return structuredClone(p);}
const specifications:{segment:string;phrases:Phrase[]}[]=[
 {segment:'verse-continuous',phrases:[2,3,4,5,6,7,8,9].map(phrase)},
 {segment:'chorus-continuous',phrases:[10,11,12,13,15,16,17].map(phrase)},
 {segment:'second-chorus',phrases:[15,16,17,15,16,17].map(phrase)},
 {segment:'hour-bridge',phrases:[18,19,20].map(phrase)},
 {segment:'hour-reprise',phrases:[22,23,24].map(phrase)},
 {segment:'last-words',phrases:[phrase(25)]}
];
// These blocks begin after the two-word command already heard in the preceding edit.
for(const spec of specifications.filter(s=>['second-chorus','hour-reprise'].includes(s.segment))){const p=spec.phrases[0];if(!p)throw Error('Missing partial phrase');p.ru=p.ru.slice(2);p.es=p.es.slice(1);p.groups=p.groups.slice(1).map(([r,e])=>[r.map(i=>i-2),e.map(i=>i-1)]);}
const cues:CueInput[]=[];
const normal=(s:string)=>s.toLowerCase().replace(/[^\p{L}\p{N}]/gu,'').replaceAll('ё','е');
for(const spec of specifications){const segment=alignment.segments.find(s=>s.id===spec.segment);if(!segment)throw Error('Missing aligned segment '+spec.segment);let offset=0;
 for(const p of spec.phrases){const words=segment.words.slice(offset,offset+p.ru.length);offset+=p.ru.length;
  if(words.length!==p.ru.length||words.some((w,i)=>normal(w.word)!==normal(p.ru[i]??'')))throw Error('Source text/alignment mismatch '+p.id);
  const start=words[0]?.start??NaN,end=words.at(-1)?.end??NaN;
  const es:string[]=[],targets=p.es.map(unit=>{const first=es.length;es.push(...unit.split(/\s+/));return es.slice(first).map((_,i)=>first+i);});
  const events=p.groups.map(([ru,groups])=>({start:Math.min(...ru.map(i=>words[i]?.start??NaN)),end:Math.max(...ru.map(i=>words[i]?.end??NaN)),ru,es:groups.flatMap(i=>targets[i]??[])}));
  cues.push({id:`C${String(cues.length+1).padStart(3,'0')}`,phraseId:p.id,start,end,ru:p.ru,es,ruRows:rows(p.ru),esRows:rows(es),events,words,review:'Continuous acoustic alignment candidate; onset/release and holds still require selection'});
 }
 if(offset!==segment.words.length)throw Error('Unmapped performed words in '+segment.id);
}
const doc={status:'CORE TIMING DRAFT — incomplete opening, elongated-vowel blocks and final two-word continuation. Not final.',sampleRate:48000,cues};
parseCues(doc);
writeFileSync('src/core-cues-draft.json',JSON.stringify(doc,null,2));
writeFileSync('analysis/core-geometry.json',JSON.stringify(cues.map(c=>({id:c.id,phrase:c.phraseId,ruRows:c.ruRows.length,esRows:c.esRows.length,ruMax:Math.max(...c.ruRows.map(r=>r.reduce((sum,i)=>sum+width(c.ru[i]??''),0)+18*(r.length-1))),esMax:Math.max(...c.esRows.map(r=>r.reduce((sum,i)=>sum+width(c.es[i]??''),0)+18*(r.length-1)))})),null,2));
console.log({cues:cues.length,sourceWords:cues.reduce((n,c)=>n+c.ru.length,0),semanticEvents:cues.reduce((n,c)=>n+c.events.length,0)});
