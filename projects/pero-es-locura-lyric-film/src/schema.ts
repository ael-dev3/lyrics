export type SourceWord={id:string;text:string;startSample:number;endSample:number;candidateSpreadMs:number;reviewRequired:boolean};
export type TargetWord={id:string;text:string;sourceIds:string[]};
export type Cue={id:string;section:string;es:SourceWord[];en:TargetWord[];startSample:number;endSample:number;visibleFrom:number;visibleUntil:number};
export type ProductionData={sampleRate:number;sampleCount:number;duration:number;fps:number;frames:number;audioSha256:string;cues:Cue[]};
export type Format='landscape'|'portrait';
export const object=(v:unknown):Record<string,unknown>=>{if(!v||typeof v!=='object'||Array.isArray(v))throw Error('Expected object');return v as Record<string,unknown>;};
export const array=(v:unknown):unknown[]=>{if(!Array.isArray(v))throw Error('Expected array');return v;};
export const str=(v:unknown):string=>{if(typeof v!=='string'||v.length===0)throw Error('Expected nonempty text');return v;};
export const num=(v:unknown):number=>{if(typeof v!=='number'||!Number.isFinite(v))throw Error('Expected finite number');return v;};
export const integer=(v:unknown):number=>{const n=num(v);if(!Number.isSafeInteger(n))throw Error('Expected integer');return n;};
export function parseData(value:unknown):ProductionData{
 const d=object(value),sampleRate=integer(d.sampleRate),sampleCount=integer(d.sampleCount),fps=integer(d.fps);if(sampleRate<=0||sampleCount<=0||fps<=0)throw Error('Invalid clock');
 const ids=new Set<string>();const cues=array(d.cues).map((raw):Cue=>{const c=object(raw),id=str(c.id);if(ids.has(id))throw Error('Duplicate cue');ids.add(id);
 const es=array(c.es).map((raw):SourceWord=>{const w=object(raw);const startSample=integer(w.startSample),endSample=integer(w.endSample);if(startSample<0||endSample<=startSample||endSample>sampleCount)throw Error('Invalid interval '+w.id);return {id:str(w.id),text:str(w.text),startSample,endSample,candidateSpreadMs:num(w.candidateSpreadMs),reviewRequired:w.reviewRequired===true};});
 const en=array(c.en).map((raw):TargetWord=>{const w=object(raw);return {id:str(w.id),text:str(w.text),sourceIds:array(w.sourceIds).map(str)};});
 const sourceIds=new Set(es.map(w=>w.id));if(sourceIds.size!==es.length)throw Error('Duplicate source word');
 for(const w of en)if(!w.sourceIds.length||w.sourceIds.some(id=>!sourceIds.has(id)))throw Error('Unknown semantic source');
 for(const w of es)if(!en.some(t=>t.sourceIds.includes(w.id)))throw Error('Unmapped Spanish word');
 const startSample=integer(c.startSample),endSample=integer(c.endSample);if(es.some(w=>w.startSample<startSample||w.endSample>endSample))throw Error('Cue containment');
 return {id,section:str(c.section),es,en,startSample,endSample,visibleFrom:integer(c.visibleFrom),visibleUntil:integer(c.visibleUntil)};});
 return {sampleRate,sampleCount,fps,frames:integer(d.frames),duration:num(d.duration),audioSha256:str(d.audioSha256),cues};
}
