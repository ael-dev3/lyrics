export type Format = 'landscape' | 'portrait';
export interface Word {id: string; text: string; punctuationAfter?:string; sourceIndex: number; startSample: number; endSample: number; confidence: number | string; method: string;}
export interface Target {id: string; text: string; punctuationAfter?:string; sourceIndices: number[]; focusSourceIndices: number[]; relation: string; rationale: string;}
export interface Cue {id: string; templateId: string; lane:'lead'|'backing'; voice:string; sourceLanguage: string; targetLanguage: string; sourceText: string; targetText: string; start: number; end: number; visibleStart: number; fullOpacityEnd: number; visibleEnd: number; exitMode: 'fade' | 'vocal-handoff'; words: Word[]; targets: Target[]; sourceBreaks: number[]; targetBreaks: number[];}
export interface Timeline {schemaVersion: number; revision: string; sampleRate: number; sourceSha256: string; sourceDuration: number; cues: Cue[];}
export interface FeatureData {sourceSha256: string; analysis: {frameRate: {numerator: number; denominator: number}; frameCount: number}; rows: number[][];}

export const PALETTE = {rest: '#c4cbc4', focus: '#ffe5ab', shadow: '#141817', light: '#d3e0df'};
export const SOURCE_FPS = 25;
export const SOURCE_WIDTH = 1080;
export const SOURCE_HEIGHT = 1080;

const object=(value:unknown):value is Record<string,unknown>=>typeof value==='object'&&value!==null&&!Array.isArray(value);
const numbers=(v:unknown):v is number[]=>Array.isArray(v)&&v.every(x=>typeof x==='number'&&Number.isFinite(x));
const texts=(record:Record<string,unknown>,keys:string[])=>keys.every(k=>typeof record[k]==='string');
export function parseTimeline(value:unknown):Timeline{
 if(!object(value)||value.schemaVersion!==1||value.sampleRate!==44100||!texts(value,['revision','sourceSha256'])||!numbers([value.sourceDuration])||!Array.isArray(value.cues))throw Error('Invalid timeline JSON');
 for(const c of value.cues){
  if(!object(c)||!texts(c,['id','templateId','lane','voice','sourceLanguage','targetLanguage','sourceText','targetText','exitMode'])||!numbers([c.start,c.end,c.visibleStart,c.fullOpacityEnd,c.visibleEnd])||!numbers(c.sourceBreaks)||!numbers(c.targetBreaks)||!Array.isArray(c.words)||!Array.isArray(c.targets))throw Error('Invalid cue JSON');
  for(const w of c.words)if(!object(w)||!texts(w,['id','text','method'])||!numbers([w.sourceIndex,w.startSample,w.endSample])||!(typeof w.confidence==='string'||typeof w.confidence==='number')||(w.punctuationAfter!==undefined&&typeof w.punctuationAfter!=='string'))throw Error('Invalid word JSON');
  for(const target of c.targets)if(!object(target)||!texts(target,['id','text','relation','rationale'])||!numbers(target.sourceIndices)||!numbers(target.focusSourceIndices))throw Error('Invalid correspondence JSON');
 }
 const timeline=value as unknown as Timeline;validateTimeline(timeline);return timeline;
}
export function parseFeatures(value:unknown):FeatureData{
 if(!object(value)||typeof value.sourceSha256!=='string'||!object(value.analysis)||!object(value.analysis.frameRate)||!numbers([value.analysis.frameRate.numerator,value.analysis.frameRate.denominator,value.analysis.frameCount])||!Array.isArray(value.rows))throw Error('Invalid measured-audio JSON');
 if(Number(value.analysis.frameRate.numerator)<=0||Number(value.analysis.frameRate.denominator)<=0||value.rows.length!==value.analysis.frameCount||!value.rows.length)throw Error('Invalid measured-audio clock');
 for(const row of value.rows)if(!numbers(row)||row.length!==26||!row.every(n=>Number.isInteger(n)&&n>=0&&n<=255))throw Error('Invalid measured-audio row');
 return value as unknown as FeatureData;
}

export function readingWindow(start:number,end:number,duration:number,priorVisibleEnd?:number,nextStart?:number,holdThrough=end):Pick<Cue,'visibleStart'|'fullOpacityEnd'|'visibleEnd'|'exitMode'> {
  // Reading lifetime is independent of lexical focus. Keep the full line
  // through its reviewed voice/tail hold; never squeeze a fade into a tiny
  // phrase gap. An adjoining vocal replaces the old neutral line atomically.
  const holdEnd=Math.min(duration,Math.max(end,holdThrough));
  const fadeDeadline=Math.min(duration,nextStart===undefined?duration:nextStart-.22);
  const enoughFadeRoom=fadeDeadline-holdEnd>=.42;
  const visibleEnd=enoughFadeRoom?Math.min(holdEnd+.50,fadeDeadline):Math.min(duration,nextStart??duration);
  return {
    visibleStart:Math.max(0,start-.22,priorVisibleEnd??0),
    fullOpacityEnd:enoughFadeRoom?holdEnd:visibleEnd,
    visibleEnd,
    exitMode:enoughFadeRoom?'fade':'vocal-handoff'
  };
}

export function sourceActive(word: Word, time: number, sampleRate = 44100): boolean {
  // Keep real fractional playback samples. Only repair machine-precision
  // multiplication error at an integer boundary; no half-sample rounding,
  // perceptual anticipation or extra display-frame hold is introduced.
  const scaled=time*sampleRate,nearest=Math.round(scaled);
  const sample=Math.abs(scaled-nearest)<=2*Number.EPSILON*Math.max(1,Math.abs(scaled))?nearest:scaled;
  return sample >= word.startSample && sample < word.endSample;
}
export function targetActive(target: Target, words: Word[], time: number, sampleRate = 44100): boolean {
  // Union, not the enclosing span: focus releases over unrelated words/gaps.
  return target.focusSourceIndices.some(index => words.some(word => word.sourceIndex === index && sourceActive(word, time, sampleRate)));
}
export function visibleCue(timeline: Timeline, time: number): Cue | undefined {
  return visibleCues(timeline,time).find(cue=>cue.lane==='lead')??visibleCues(timeline,time)[0];
}
export function visibleCues(timeline:Timeline,time:number):Cue[]{
 return timeline.cues.filter(cue=>time>=cue.visibleStart&&time<cue.visibleEnd);
}
export function validateTimeline(t: Timeline): void {
  if (t.schemaVersion !== 1 || t.sampleRate !== 44100 || !t.cues.length||!Number.isFinite(t.sourceDuration)||t.sourceDuration<=0||!/^[a-f0-9]{64}$/.test(t.sourceSha256)) throw Error('Invalid source-clock timeline');
  const ids = new Set<string>();
  const prior=new Map<string,{end:number;visibleEnd:number}>();
  for (const cue of t.cues) {
    if (ids.has(cue.id)) throw Error(`Duplicate cue ${cue.id}`);
    ids.add(cue.id);
    const p=prior.get(cue.lane)??{end:0,visibleEnd:0};
    if (!['lead','backing'].includes(cue.lane)||!(cue.start >= p.end && cue.end > cue.start && cue.visibleStart>=p.visibleEnd && cue.visibleStart <= cue.start && cue.fullOpacityEnd>=cue.end && cue.fullOpacityEnd<=cue.visibleEnd && cue.visibleEnd<=t.sourceDuration && cue.end <= t.sourceDuration)) throw Error(`Invalid cue interval ${cue.id}`);
    if(cue.exitMode==='vocal-handoff' && cue.fullOpacityEnd!==cue.visibleEnd)throw Error(`Invalid continuous handoff ${cue.id}`);
    if(cue.exitMode==='fade' && cue.visibleEnd-cue.fullOpacityEnd<.419999)throw Error(`Compressed reading fade ${cue.id}`);
    prior.set(cue.lane,{end:cue.end,visibleEnd:cue.visibleEnd});
    if(!cue.words.length||!cue.targets.length||!['fade','vocal-handoff'].includes(cue.exitMode))throw Error(`Empty or unknown cue ${cue.id}`);
    let wordEnd = 0;
    cue.words.forEach((w, i) => {
      if (w.sourceIndex !== i || !(w.startSample >= wordEnd && w.endSample > w.startSample) || !Number.isSafeInteger(w.startSample) || !Number.isSafeInteger(w.endSample)) throw Error(`Invalid word interval ${w.id}`);
      if (w.startSample < Math.round(cue.start * t.sampleRate) - 1 || w.endSample > Math.round(cue.end * t.sampleRate) + 1) throw Error(`Word outside cue ${w.id}`);
      wordEnd = w.endSample;
    });
    const mapped = new Set<number>();
    for (const target of cue.targets) {
      if (!target.focusSourceIndices.length || !target.rationale) throw Error(`Missing semantic justification ${target.id}`);
      for (const i of target.focusSourceIndices) {
        if (!Number.isInteger(i) || !cue.words[i]) throw Error(`Missing semantic anchor ${target.id}`);
        mapped.add(i);
      }
    }
    cue.words.forEach(w => {if (!mapped.has(w.sourceIndex)) throw Error(`Unmapped source word ${w.id}`);});
  }
}
