export type Format = 'landscape' | 'portrait';
export interface Word {id: string; text: string; punctuationAfter?:string; sourceIndex: number; startSample: number; endSample: number; confidence: number | string; method: string;}
export interface Target {id: string; text: string; punctuationAfter?:string; sourceIndices: number[]; focusSourceIndices: number[]; relation: string; rationale: string;}
export interface Cue {id: string; templateId: string; lane:'lead'|'backing'; voice:string; sourceLanguage: string; targetLanguage: string; sourceText: string; targetText: string; start: number; end: number; visibleStart: number; fullOpacityEnd: number; visibleEnd: number; exitMode: 'fade' | 'vocal-handoff'; words: Word[]; targets: Target[]; sourceBreaks: number[]; targetBreaks: number[];}
export interface Timeline {schemaVersion: number; revision: string; sampleRate: number; sourceSha256: string; sourceDuration: number; cues: Cue[];}
export interface FeatureData {sourceSha256: string; analysis: {frameRate: {numerator: number; denominator: number}; frameCount: number}; rows: number[][];}

export const PALETTE = {rest: '#aaa1a1', focus: '#fff0d7', shadow: '#180609', light: '#e71735'};
export const SOURCE_FPS = 30;
export const SOURCE_WIDTH = 1080;
export const SOURCE_HEIGHT = 1080;

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
  if (t.schemaVersion !== 1 || t.sampleRate !== 44100 || !t.cues.length) throw Error('Invalid source-clock timeline');
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
