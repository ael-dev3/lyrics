export type Word={text:string;startSample:number;endSample:number;confidence:number};
export type Cue={id:string;section:string;words:Word[];groups:number[][];startSample:number;endSample:number};
export function parseCues(value:unknown):Cue[]{
 if(!Array.isArray(value))throw Error('Cues must be an array');
 return value.map((v:unknown)=>{
  if(typeof v!=='object'||v===null)throw Error('Invalid cue');
  const c=v as Record<string,unknown>;
  if(typeof c.id!=='string'||typeof c.section!=='string'||!Number.isInteger(c.startSample)||!Number.isInteger(c.endSample)||!Array.isArray(c.words)||!Array.isArray(c.groups))throw Error('Invalid cue fields');
  for(const w of c.words as unknown[]){if(typeof w!=='object'||w===null)throw Error('Invalid word');const q=w as Record<string,unknown>;if(typeof q.text!=='string'||!Number.isInteger(q.startSample)||!Number.isInteger(q.endSample)||typeof q.confidence!=='number')throw Error('Invalid word fields');}
  for(const g of c.groups as unknown[])if(!Array.isArray(g)||!g.every(i=>Number.isInteger(i)))throw Error('Invalid group');
  return c as unknown as Cue;
 });
}
