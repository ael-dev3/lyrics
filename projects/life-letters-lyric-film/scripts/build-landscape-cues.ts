import {readFileSync,writeFileSync} from 'node:fs';
import {pronounce} from './pronunciation.ts';
import {wrap} from './geometry.ts';
type Word={word:string,start:number,end:number,probability:number};
type Event={start:number,end:number,ru:number[],es:number[],held?:{word:number,char:number,phonChar?:number}};
type Cue={id:string,phraseId:string,start:number,end:number,ru:string[],es:string[],phonetic?:string[],ruRows:number[][],esRows:number[][],events:Event[],words:Word[],review:string;texture?:boolean;displayStart?:number;displayEnd?:number};
const read=(f:string)=>JSON.parse(readFileSync(f,'utf8'));
const core=read('src/core-cues-draft.json').cues as Cue[];
const library=read('source/semantic-map.json').phrases;
const boundaries=read('analysis/mms-mix-boundaries.json').segments;
const refined=read('analysis/mms-vocals-final-refine.json').segments;
const segment=(id:string)=>refined.find((s:{id:string})=>s.id===id).words as Word[];
function fromPhrase(i:number,words:Word[],id:string):Cue{
 const p=library[i],es:string[]=[],units:number[][]=p.es.map((s:string)=>{const n=es.length;es.push(...s.split(/\s+/));return es.slice(n).map((_,j)=>n+j);});
 return {id,phraseId:p.id,start:words[0]!.start,end:words.at(-1)!.end,ru:[...p.ru],es,words,ruRows:[],esRows:[],events:p.groups.map(([r,e]:[number[],number[]])=>({start:Math.min(...r.map(i=>words[i]!.start)),end:Math.max(...r.map(i=>words[i]!.end)),ru:r,es:e.flatMap(i=>units[i]??[])})),review:'Bounded mix alignment corroborated against unforced recognition; approximate phonetic aid uses same source-word clock'};
}
const initial=fromPhrase(0,boundaries.find((x:{id:string})=>x.id==='opening-short').words,'OPEN');
const verse=fromPhrase(1,boundaries.find((x:{id:string})=>x.id==='first-verse-short').words,'VERSE-ENTRY');
// The recognizer's 0.28 s first-word timestamp spans instrumental/glitch material.
// Bounded evidence and direct matching locate the actual phrase at 9.14 s.
initial.words[4]!.start=9.95;
initial.events.at(-1)!.start=9.95;
const kissCore=core.find(c=>c.id==='C009')!;
Object.assign(kissCore,fromPhrase(10,segment('first-chorus'),'C009'));
const tail=core.find(c=>c.phraseId==='T26')!;
const finalWords=boundaries.find((s:{id:string})=>s.id==='last-complete').words as Word[];
tail.words=finalWords;tail.ru.push('на','воде');tail.es.push('sobre','el','agua');tail.end=finalWords.at(-1)!.end;
tail.events.push({start:finalWords[10]!.start,end:finalWords[11]!.end,ru:[10,11],es:[14,15,16]});
let cues:Cue[]=[initial,verse,...core];
// Bounded lexical repetitions corroborated by normalized waveform matching.
for(const [id,n] of [['rays-93',93],['rays-104',104],['rays-114',114]] as const){
 const full=fromPhrase(15,[{word:'Целуй',start:n-2,end:n-1,probability:0},{word:'меня',start:n-1,end:n-.8,probability:0},...segment(id)],id);
 // Strip the command: these three edits actually begin with пока.
 full.ru=full.ru.slice(2);full.es=full.es.slice(1);full.words=full.words.slice(2);full.start=full.words[0]!.start;
 full.events=full.events.slice(1).map(e=>({...e,ru:e.ru.map(i=>i-2),es:e.es.map(i=>i-1)}));
 cues.push(full);
}
const kissA=fromPhrase(14,segment('kiss-71'),'KISS-A');
const kissB=fromPhrase(21,segment('kiss-179'),'KISS-B');
cues.push(kissA,kissB);
// Same vocal fragment, independently fingerprinted in every listed cycle.
// Whole-word emphasis covers altered/uncertain timbres. Only corroborated open-a
// portions receive character emphasis; no synthetic new syllables are invented.
const textureWindows=[
 {start:72.30,end:93.58,shifts:[0,10.3225]},
 {start:96.15,end:103.90,shifts:[20.6435]},
 {start:106.47,end:114.22,shifts:[30.96775]},
 {start:116.80,end:145.25,shifts:[41.292,51.61125,61.9355]},
 {start:180.90,end:212.31,shifts:[108.3855,118.708,129.03225]}
];
for(const [i,w] of textureWindows.entries()){
 const source=structuredClone(kissA);source.id='VOWEL-'+(i+1);source.start=w.start;source.end=w.end;source.texture=true;
 source.words=[{word:'Целуй',start:w.start,end:w.start,probability:0},{word:'меня',start:w.start,end:w.end,probability:1}];
 source.events=[{start:w.start,end:w.end,ru:[1],es:[0]}];
 for(const shift of w.shifts){const a=Math.max(w.start,76.10+shift),b=Math.min(w.end,81.25+shift);if(b>a)source.events.push({start:a,end:b,ru:[1],es:[0],held:{word:1,char:3,phonChar:4}});}
 source.review='Vocal fragment from меня; repeated edits confirmed by waveform fingerprints, open-a focus supported by CTC vowel observations. Altered timbres use whole-word focus.';
 cues.push(source);
}

function subset(c:Cue,ri:number[],ei:number[],suffix:string):Cue{
 const words=ri.map(i=>c.words[i]!);return {...c,id:c.id+suffix,ru:ri.map(i=>c.ru[i]!),es:ei.map(i=>c.es[i]!),words,start:words[0]!.start,end:words.at(-1)!.end,
 events:c.events.filter(e=>e.ru.some(i=>ri.includes(i))).map(e=>({...e,start:Math.max(e.start,words[0]!.start),end:Math.min(e.end,words.at(-1)!.end),ru:e.ru.filter(i=>ri.includes(i)).map(i=>ri.indexOf(i)),es:e.es.filter(i=>ei.includes(i)).map(i=>ei.indexOf(i))}))};
}
// Reorder whole semantic units, preserving natural Spanish on each timed card.
cues=cues.flatMap(c=>{
 if(c.phraseId==='T04')return [subset(c,[0,1,2,3,4],[0,1,2,3,10,11],'-a'),subset(c,[5,6,7,8,9,10],[4,5,6,7,8,9],'-b')];
 if(c.phraseId==='T26')return [subset(c,[0,1,2,3,4,5,6],c.es.map((_,i)=>i).slice(0,9),'-a'),subset(c,[7,8,9,10,11],c.es.map((_,i)=>i).slice(9),'-b')];
 return [c];
});
cues.sort((a,b)=>a.start-b.start);
for(const c of cues){
 c.phonetic=pronounce(c.ru);c.ruRows=wrap(c.ru,c.phonetic);c.esRows=wrap(c.es);
 for(const [i,w] of c.words.entries()){
  if(c.texture||w.end-w.start<.7)continue;
  const token=w.word.toLowerCase().replace(/[^а-яё]/g,'');
  const character=token==='здесь'?2:token==='нас'?1:token==='пелерин'?5:undefined;
  if(character!==undefined){const semantic=c.events.find(e=>e.ru.includes(i));const ph=c.phonetic[i]??'';const phonChar=token==='здесь'?ph.indexOf('e'):token==='нас'?ph.indexOf('a'):ph.indexOf('í');
   c.events.push({start:w.start+.18,end:w.end-.07,ru:[i],es:semantic?.es??[],held:{word:i,char:character,phonChar}});
  }
 }
 if(c.ruRows.length>2||c.esRows.length>3)throw Error('Too many lyric rows '+c.id);
}
for(let i=0;i<cues.length;i++){
 const c=cues[i]!,prev=cues[i-1],next=cues[i+1];
 if(prev&&c.start<prev.end-.001)throw Error('Cue overlap '+prev.id+' '+c.id);
 c.displayStart=Math.max(0,c.start-.24,prev?(prev.end+c.start)/2:0);
 c.displayEnd=Math.min(c.end+.30,next?(c.end+next.start)/2:Infinity);
}

writeFileSync('src/landscape-cues.json',JSON.stringify({status:'Full performed map with explicit vowel-fragment contexts; pronunciation is a Spanish-oriented approximation; retained model candidates are fallible evidence',cues},null,2));
console.log(cues.map(c=>({id:c.id,ru:c.ruRows.length,es:c.esRows.length,text:c.es.join(' ')})));
