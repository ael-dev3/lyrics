export type Format = 'landscape' | 'portrait';
export interface Word {id:string;text:string;sourceIndex:number;startSample:number;endSample:number;confidence:number|string;method:string;}
export interface Token {id:string;text:string;sourceIndices:number[];rationale:string;}
export interface Lane {language:'ja'|'ru'|'en';tokens:Token[];}
export interface CarryVoice {fromCueId:string;words:Word[];lanes:Lane[];visibleEnd:number;}
export interface Cue {id:string;label:string;sourceLanguage:'ja'|'ru';start:number;end:number;visibleStart:number;fullOpacityEnd:number;visibleEnd:number;words:Word[];lanes:Lane[];carry?:CarryVoice;readingPlacement?:'closing';}
export interface Timeline {schemaVersion:2;revision:string;sampleRate:44100;sourceSha256:string;sourceDuration:number;cues:Cue[];}
export interface FeatureData {sourceSha256:string;analysis:{frameRate:{numerator:number;denominator:number};frameCount:number};rows:number[][];}

export function sourceActive(word:Word,time:number,sampleRate=44100):boolean {
 const scaled=time*sampleRate,nearest=Math.round(scaled);
 const sample=Math.abs(scaled-nearest)<=2*Number.EPSILON*Math.max(1,Math.abs(scaled))?nearest:scaled;
 return sample>=word.startSample && sample<word.endSample;
}
export function tokenActive(token:Token,words:Word[],time:number,sampleRate=44100):boolean {
 return token.sourceIndices.some(i=>words[i]!==undefined && sourceActive(words[i]!,time,sampleRate));
}
export function visibleCue(timeline:Timeline,time:number):Cue|undefined {
 return timeline.cues.find(c=>time>=c.visibleStart && time<c.visibleEnd);
}
export function validateTimeline(t:Timeline):void {
 if(t.schemaVersion!==2 || t.sampleRate!==44100 || !t.cues.length)throw Error('Invalid source-clock timeline');
 const ids=new Set<string>();let priorVisibleEnd=0;
 for(const [cueIndex,c] of t.cues.entries()) {
  if(ids.has(c.id))throw Error(`Duplicate cue ${c.id}`);ids.add(c.id);
  const prior=t.cues[cueIndex-1],next=t.cues[cueIndex+1];
  if(!(c.end>c.start && c.visibleStart>=priorVisibleEnd && c.visibleStart<=c.start && c.fullOpacityEnd>=Math.min(c.end,c.visibleEnd) && c.fullOpacityEnd<=c.visibleEnd && c.visibleEnd<=t.sourceDuration))throw Error(`Invalid reading interval ${c.id}`);
  if(prior && c.start<prior.end && (!c.carry || c.carry.fromCueId!==prior.id))throw Error(`Unrepresented overlapping voice ${c.id}`);
  if(c.visibleEnd<c.end && (!next?.carry || next.carry.fromCueId!==c.id || next.visibleStart!==c.visibleEnd))throw Error(`Truncated performed voice ${c.id}`);
  priorVisibleEnd=c.visibleEnd;
  let wordEnd=0;
  c.words.forEach((w,i)=>{
   if(w.sourceIndex!==i || !Number.isSafeInteger(w.startSample) || !Number.isSafeInteger(w.endSample) || w.startSample<wordEnd || w.endSample<=w.startSample)throw Error(`Invalid word ${w.id}`);
   if(w.startSample<Math.round(c.start*t.sampleRate)-1 || w.endSample>Math.round(c.end*t.sampleRate)+1)throw Error(`Word outside cue ${w.id}`);wordEnd=w.endSample;
  });
  const languages=c.lanes.map(l=>l.language);
  const expected=c.sourceLanguage==='ja'?['ja','ru','en']:['ru','en'];
  if(JSON.stringify(languages)!==JSON.stringify(expected))throw Error(`Missing or wrong language lane ${c.id}`);
  for(const l of c.lanes){
   const mapped=new Set<number>();
   for(const token of l.tokens){
    if(!token.text || !token.rationale || !token.sourceIndices.length)throw Error(`Missing complete semantic span ${token.id}`);
    for(const i of token.sourceIndices){if(!Number.isInteger(i)||!c.words[i])throw Error(`Missing source contributor ${token.id}`);mapped.add(i);}
   }
   c.words.forEach(w=>{if(!mapped.has(w.sourceIndex))throw Error(`Unmapped source word in ${l.language}: ${w.id}`);});
  }
  if(c.carry){
   const carry=c.carry;
   if(!prior || carry.fromCueId!==prior.id || c.visibleStart!==c.start || carry.visibleEnd!==prior.end || carry.visibleEnd<=c.start || JSON.stringify(carry.lanes.map(l=>l.language))!==JSON.stringify(prior.lanes.map(l=>l.language)))throw Error(`Invalid simultaneous voice ${c.id}`);
   carry.words.forEach((w,i)=>{
    const original=prior.words.find(p=>p.id===w.id);
    if(!original || w.sourceIndex!==i || w.startSample!==original.startSample || w.endSample!==original.endSample || w.text!==original.text || w.endSample<=Math.round(c.start*t.sampleRate))throw Error(`Changed carried voice ${w.id}`);
   });
   if(prior.words.some(w=>w.endSample>Math.round(c.start*t.sampleRate) && !carry.words.some(p=>p.id===w.id)))throw Error(`Missing overlapping word ${c.id}`);
   for(const lane of carry.lanes)for(const token of lane.tokens)if(!token.rationale || !token.sourceIndices.length || token.sourceIndices.some(i=>!carry.words[i]))throw Error(`Incomplete overlap translation ${c.id}`);
  }
 }
}
