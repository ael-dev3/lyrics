export type Format = 'landscape' | 'portrait';
export type VocalTrack = 'lead' | 'backing';
export interface Word {
  id: string; text: string; sourceIndex: number;
  startSample: number; endSample: number;
  confidence?: number | string; method?: string;
}
export interface Token {id: string; text: string; sourceIndices: number[]; rationale: string;}
export interface Lane {language: 'en'; tokens: Token[];}
export interface Cue {
  id: string; label: string; sourceLanguage: 'en'; vocalTrack?: VocalTrack;
  start: number; end: number; visibleStart: number; fullOpacityEnd: number; visibleEnd: number;
  words: Word[]; lanes: Lane[];
}
export interface Timeline {
  schemaVersion: 2; revision: string; sampleRate: number;
  sourceSha256: string; sourceDuration: number; cues: Cue[];
}
export interface FeatureData {
  sourceSha256: string;
  analysis: {frameRate: {numerator: number; denominator: number}; frameCount: number};
  rows: number[][];
}

// Correct only the representation error of multiplying a rational source time
// back to an exact integer sample. Genuine fractional sample positions remain.
export function sourceSample(time: number, sampleRate: number): number {
  const scaled = time * sampleRate, nearest = Math.round(scaled);
  return Math.abs(scaled - nearest) <= 2 * Number.EPSILON * Math.max(1, Math.abs(scaled)) ? nearest : scaled;
}
export function sourceActive(word: Word, time: number, sampleRate: number): boolean {
  const sample = sourceSample(time, sampleRate);
  return sample >= word.startSample && sample < word.endSample;
}
export function tokenActive(token: Token, words: Word[], time: number, sampleRate: number): boolean {
  return token.sourceIndices.some(index => words[index] !== undefined && sourceActive(words[index]!, time, sampleRate));
}
export function vocalTrack(cue: Cue): VocalTrack {return cue.vocalTrack ?? 'lead';}
export function visibleCues(timeline: Timeline, time: number): Cue[] {
  return timeline.cues.filter(cue => time >= cue.visibleStart && time < cue.visibleEnd)
    .sort((a, b) => Number(vocalTrack(a) === 'backing') - Number(vocalTrack(b) === 'backing') || a.start - b.start);
}
export function visibleCue(timeline: Timeline, time: number, track?: VocalTrack): Cue | undefined {
  const visible = visibleCues(timeline, time);
  return track ? visible.find(cue => vocalTrack(cue) === track) : visible.find(cue => vocalTrack(cue) === 'lead') ?? visible[0];
}

export function validateTimeline(timeline: Timeline): void {
  if (timeline.schemaVersion !== 2 || !Number.isSafeInteger(timeline.sampleRate) || timeline.sampleRate < 1 ||
      !Number.isFinite(timeline.sourceDuration) || timeline.sourceDuration <= 0 || !timeline.revision ||
      !/^[a-f0-9]{64}$/.test(timeline.sourceSha256) || !timeline.cues.length) throw Error('Invalid source-clock timeline');
  const cueIds = new Set<string>(), wordIds = new Set<string>(), tokenIds = new Set<string>();
  for (const cue of timeline.cues) {
    if (!cue.id || cueIds.has(cue.id)) throw Error(`Duplicate or empty cue ${cue.id}`);
    cueIds.add(cue.id);
    if (cue.sourceLanguage !== 'en' || !['lead', 'backing'].includes(vocalTrack(cue))) throw Error(`Invalid vocal ownership ${cue.id}`);
    const intervals = [cue.start, cue.end, cue.visibleStart, cue.fullOpacityEnd, cue.visibleEnd];
    if (intervals.some(value => !Number.isFinite(value)) || !(cue.start >= 0 && cue.end > cue.start &&
        cue.visibleStart >= 0 && cue.visibleStart <= cue.start && cue.fullOpacityEnd >= cue.end &&
        cue.fullOpacityEnd <= cue.visibleEnd && cue.visibleEnd <= timeline.sourceDuration)) throw Error(`Invalid reading interval ${cue.id}`);
    if (!cue.words.length || cue.lanes.length !== 1 || cue.lanes[0]?.language !== 'en') throw Error(`Missing English lane ${cue.id}`);
    let precedingEnd = 0;
    cue.words.forEach((word, index) => {
      if (!word.id || wordIds.has(word.id) || !word.text || word.sourceIndex !== index ||
          !Number.isSafeInteger(word.startSample) || !Number.isSafeInteger(word.endSample) ||
          word.startSample < precedingEnd || word.endSample <= word.startSample) throw Error(`Invalid word ${word.id}`);
      wordIds.add(word.id);
      if (word.startSample < Math.round(cue.start * timeline.sampleRate) - 1 ||
          word.endSample > Math.round(cue.end * timeline.sampleRate) + 1 ||
          word.endSample > Math.ceil(timeline.sourceDuration * timeline.sampleRate)) throw Error(`Word outside cue ${word.id}`);
      precedingEnd = word.endSample;
    });
    const mapped = new Set<number>();
    for (const token of cue.lanes[0].tokens) {
      if (!token.id || tokenIds.has(token.id) || !token.text || !token.rationale || !token.sourceIndices.length) throw Error(`Invalid English token ${token.id}`);
      tokenIds.add(token.id);
      for (const index of token.sourceIndices) {
        if (!Number.isInteger(index) || !cue.words[index]) throw Error(`Missing source contributor ${token.id}`);
        mapped.add(index);
      }
    }
    for (const word of cue.words) if (!mapped.has(word.sourceIndex)) throw Error(`Unmapped performed word ${word.id}`);
  }
  // Simultaneous lead and backing cues are legitimate. Only cues belonging to
  // the same performed voice must have ordered, noncolliding reading windows.
  for (const track of ['lead', 'backing'] as const) {
    const cues = timeline.cues.filter(cue => vocalTrack(cue) === track);
    for (let index = 1; index < cues.length; index++) {
      const prior = cues[index - 1]!, next = cues[index]!;
      if (next.start < prior.end || next.visibleStart < prior.visibleEnd) throw Error(`Colliding ${track} cues ${prior.id}/${next.id}`);
    }
  }
}
