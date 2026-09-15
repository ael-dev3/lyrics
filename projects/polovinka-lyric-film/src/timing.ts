import raw from './cues.json' with {type:'json'};
import {FPS,SR} from './config.ts';
export type Cue=typeof raw[number];
export const cues=raw;
export const frameAt=(sample:number)=>Math.ceil(sample*FPS/SR);
export const smooth=(a:number,b:number,x:number)=>{const q=Math.min(1,Math.max(0,(x-a)/Math.max(.000001,b-a)));return q*q*(3-2*q);};
export function cueAt(f:number){
 for(let i=0;i<cues.length;i++){
  const c=cues[i]!,start=frameAt(c.startSample)-12;
  const end=Math.min(frameAt(c.endSample)+28,cues[i+1]?frameAt(cues[i+1]!.startSample)-13:Infinity);
  if(f>=start&&f<end)return {cue:c,index:i,opacity:Math.min(smooth(start,start+8,f),1-smooth(end-8,end,f))};
 }
 return undefined;
}
export const wordActive=(w:{startSample:number;endSample:number},f:number)=>f>=frameAt(w.startSample)&&f<frameAt(w.endSample);
