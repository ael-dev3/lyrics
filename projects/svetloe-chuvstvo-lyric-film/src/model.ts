export type Format = 'landscape' | 'portrait';
export interface Word {id: string; text: string; punctuationAfter?:string; sourceIndex: number; startSample: number; endSample: number; confidence: number | string; method: string;}
export interface Target {id: string; text: string; sourceIndices: number[]; focusSourceIndices: number[]; relation: string; rationale: string;}
export interface Cue {id: string; templateId: string; sourceLanguage: string; targetLanguage: string; sourceText: string; targetText: string; start: number; end: number; visibleStart: number; fullOpacityEnd: number; visibleEnd: number; exitMode: 'fade' | 'vocal-handoff'; words: Word[]; targets: Target[]; sourceBreaks: number[]; targetBreaks: number[];}
export interface Timeline {schemaVersion: number; revision: string; sampleRate: number; sourceSha256: string; sourceDuration: number; cues: Cue[];}
export interface FeatureData {sourceSha256: string; analysis: {frameRate: {numerator: number; denominator: number}; frameCount: number}; rows: number[][];}

export const PALETTE = {rest: '#282720', focus: '#ab3810', shadow: '#25211b', light: '#f2cb89'};
export const SOURCE_FPS = 25;
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
  return timeline.cues.find(cue => time >= cue.visibleStart && time < cue.visibleEnd);
}
export function validateTimeline(t: Timeline): void {
  if (t.schemaVersion !== 1 || t.sampleRate !== 44100 || !t.cues.length) throw Error('Invalid source-clock timeline');
  const ids = new Set<string>();
  let priorEnd = 0,priorVisibleEnd=0;
  for (const cue of t.cues) {
    if (ids.has(cue.id)) throw Error(`Duplicate cue ${cue.id}`);
    ids.add(cue.id);
    if (!(cue.start >= priorEnd && cue.end > cue.start && cue.visibleStart>=priorVisibleEnd && cue.visibleStart <= cue.start && cue.fullOpacityEnd>=cue.end && cue.fullOpacityEnd<=cue.visibleEnd && cue.visibleEnd<=t.sourceDuration && cue.end <= t.sourceDuration)) throw Error(`Invalid cue interval ${cue.id}`);
    if(cue.exitMode==='vocal-handoff' && cue.fullOpacityEnd!==cue.visibleEnd)throw Error(`Invalid continuous handoff ${cue.id}`);
    if(cue.exitMode==='fade' && cue.visibleEnd-cue.fullOpacityEnd<.419999)throw Error(`Compressed reading fade ${cue.id}`);
    priorEnd = cue.end;
    priorVisibleEnd=cue.visibleEnd;
    let wordEnd = 0;
    cue.words.forEach((w, i) => {
      if (w.sourceIndex !== i || !(w.startSample >= wordEnd && w.endSample > w.startSample) || !Number.isSafeInteger(w.startSample) || !Number.isSafeInteger(w.endSample)) throw Error(`Invalid word interval ${w.id}`);
      if (w.startSample < Math.round(cue.start * t.sampleRate) - 1 || w.endSample > Math.round(cue.end * t.sampleRate) + 1) throw Error(`Word outside cue ${w.id}`);
      wordEnd = w.endSample;
    });
    const mapped = new Set<number>();
    for (const target of cue.targets) {
      if (!target.sourceIndices.length || !target.focusSourceIndices.length || !target.rationale) throw Error(`Missing semantic justification ${target.id}`);
      if(new Set(target.sourceIndices).size!==target.sourceIndices.length || new Set(target.focusSourceIndices).size!==target.focusSourceIndices.length)throw Error(`Duplicate semantic contributor ${target.id}`);
      for(const i of target.sourceIndices)if(!Number.isInteger(i)||!cue.words[i])throw Error(`Missing lexical contributor ${target.id}`);
      for (const i of target.focusSourceIndices) {
        if (!Number.isInteger(i) || !cue.words[i]) throw Error(`Missing semantic anchor ${target.id}`);
        mapped.add(i);
      }
    }
    cue.words.forEach(w => {if (!mapped.has(w.sourceIndex)) throw Error(`Unmapped source word ${w.id}`);});
  }
}
