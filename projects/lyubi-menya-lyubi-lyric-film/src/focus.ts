import type {Cue,ProductionData,SourceWord,TargetWord} from './schema.ts';
export function frameAt(sample:number,sampleRate:number,fps:number){return Math.round(sample/sampleRate*fps);}
export function wordActive(word:SourceWord,frame:number,data:ProductionData){return frame>=frameAt(word.startSample,data.sampleRate,data.fps)&&frame<frameAt(word.endSample,data.sampleRate,data.fps);}
export function activeSource(cue:Cue,frame:number,data:ProductionData){return new Set(cue.ru.filter(w=>wordActive(w,frame,data)).map(w=>w.id));}
export const targetFocusIds=(word:TargetWord)=>word.focusSourceIds??word.sourceIds;
// Source events remain acoustic evidence. Display groups are derived separately,
// so a complete translation never highlights only half its Russian counterpart.
export function sourceFocusIds(cue:Cue,id:string):string[]{
 const ids=new Set([id]);let changed=true;
 while(changed){changed=false;for(const word of cue.en){const linked=targetFocusIds(word);if(!linked.some(key=>ids.has(key)))continue;for(const key of linked)if(!ids.has(key)){ids.add(key);changed=true;}}}
 return cue.ru.filter(word=>ids.has(word.id)).map(word=>word.id);
}
export function activeDisplaySource(cue:Cue,frame:number,data:ProductionData){
 const acoustic=activeSource(cue,frame,data),display=new Set(acoustic);
 for(const id of acoustic)for(const member of sourceFocusIds(cue,id))display.add(member);
 return display;
}
export function activeTargets(cue:Cue,frame:number,data:ProductionData){const source=activeSource(cue,frame,data);return new Set(cue.en.filter(w=>targetFocusIds(w).some(id=>source.has(id))).map(w=>w.id));}
export function visibleCue(data:ProductionData,frame:number){const sample=Math.round(frame/data.fps*data.sampleRate);return data.cues.find(c=>sample>=c.visibleFrom&&sample<c.visibleUntil);}
