import type {Cue,ProductionData,SourceWord,TargetWord} from './schema.ts';
export function frameAt(sample:number,sampleRate:number,fps:number){return Math.round(sample/sampleRate*fps);}
export function wordActive(word:SourceWord,frame:number,data:ProductionData){return frame>=frameAt(word.startSample,data.sampleRate,data.fps)&&frame<frameAt(word.endSample,data.sampleRate,data.fps);}
export function activeSource(cue:Cue,frame:number,data:ProductionData){return new Set(cue.es.filter(w=>wordActive(w,frame,data)).map(w=>w.id));}
export const targetFocusIds=(word:TargetWord)=>word.focusSourceIds??word.sourceIds;
export function activeTargets(cue:Cue,frame:number,data:ProductionData){const source=activeSource(cue,frame,data);return new Set(cue.en.filter(w=>targetFocusIds(w).some(id=>source.has(id))).map(w=>w.id));}
export function visibleCue(data:ProductionData,frame:number){const sample=Math.round(frame/data.fps*data.sampleRate);return data.cues.find(c=>sample>=c.visibleFrom&&sample<c.visibleUntil);}
