export type Focus={start:number;end:number;ru:number[];es:number[];held?:{word:number;char:number;phonChar?:number}};
export type Word={word:string;start:number;end:number;probability?:number};
export type Cue={id:string;start:number;end:number;ru:string[];es:string[];phonetic:string[];ruRows:number[][];esRows:number[][];events:Focus[];words:Word[];displayStart?:number;displayEnd?:number;texture?:boolean};
const object=(x:unknown):Record<string,unknown>=>{if(!x||typeof x!=='object'||Array.isArray(x))throw Error('Expected object');return x as Record<string,unknown>;};
const number=(x:unknown)=>{if(typeof x!=='number'||!Number.isFinite(x))throw Error('Expected finite number');return x;};
const string=(x:unknown)=>{if(typeof x!=='string'||!x.trim())throw Error('Expected text');return x;};
const array=(x:unknown):unknown[]=>{if(!Array.isArray(x))throw Error('Expected array');return x;};
export function parseCues(x:unknown):Cue[]{return array(object(x).cues).map(item=>{
 const c=object(item),ru=array(c.ru).map(string),es=array(c.es).map(string),phonetic=c.phonetic?array(c.phonetic).map(string):ru;
 if(phonetic.length!==ru.length)throw Error('Pronunciation/source mismatch');
 const start=number(c.start),end=number(c.end);if(end<=start)throw Error('Invalid cue window');
 const events=array(c.events).map(raw=>{
  const e=object(raw),a=number(e.start),b=number(e.end),ri=array(e.ru).map(number),ei=array(e.es).map(number);
  if(a<start-1e-6||b>end+1e-6||a>=b||ri.some(i=>!Number.isInteger(i)||!ru[i])||ei.some(i=>!Number.isInteger(i)||!es[i]))throw Error('Invalid focus event '+c.id);
  const event:Focus={start:a,end:b,ru:ri,es:ei};
  if(e.held){const h=object(e.held);event.held={word:number(h.word),char:number(h.char),...(h.phonChar!==undefined?{phonChar:number(h.phonChar)}:{})};if(!ru[event.held.word]?.[event.held.char])throw Error('Invalid held letter');}
  return event;
 });
 const rows=(raw:unknown,words:string[])=>raw?array(raw).map(r=>array(r).map(number)):[words.map((_,i)=>i)];
 const ruRows=rows(c.ruRows,ru),esRows=rows(c.esRows,es);
 for(const [order,words] of [[ruRows,ru],[esRows,es]] as const)if(order.flat().join(',')!==words.map((_,i)=>i).join(','))throw Error('Incomplete line geometry');
 const words=c.words?array(c.words).map(w=>{const q=object(w);return {word:string(q.word),start:number(q.start),end:number(q.end)};}):[];
 return {id:string(c.id),start,end,ru,es,phonetic,ruRows,esRows,events,words,texture:c.texture===true,...(c.displayStart!==undefined?{displayStart:number(c.displayStart)}:{}),...(c.displayEnd!==undefined?{displayEnd:number(c.displayEnd)}:{})};
});}
