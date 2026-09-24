export type SourceWord = {
  id: string;
  text: string;
  startSample: number;
  endSample: number;
  confidence: number;
  review: 'provisional' | 'checked';
};

export type TargetWord = {
  text: string;
  sourceIds: string[];
};

export type LyricLine = {
  id: string;
  section: string;
  es: SourceWord[];
  en: TargetWord[];
  visibleFromSample: number;
  visibleUntilSample: number;
};

export type Timeline = {
  sourceSha256: string;
  sampleRate: number;
  durationSeconds: number;
  status: 'provisional-preview' | 'reviewed';
  lines: LyricLine[];
};

export function visibleLineAt(timeline: Timeline, seconds: number): LyricLine | null {
  const sample = Math.round(seconds * timeline.sampleRate);
  return timeline.lines.find(line => sample >= line.visibleFromSample && sample < line.visibleUntilSample) ?? null;
}

export function activeSourceIds(line: LyricLine, sample: number): Set<string> {
  return new Set(line.es.filter(word => sample >= word.startSample && sample < word.endSample).map(word => word.id));
}

export function activeTargetIndices(line: LyricLine, sourceIds: ReadonlySet<string>): Set<number> {
  return new Set(line.en.flatMap((word, index) => word.sourceIds.some(id => sourceIds.has(id)) ? [index] : []));
}

export function validateTimeline(timeline: Timeline): void {
  if (timeline.sampleRate !== 44100 || timeline.durationSeconds < 260 || timeline.lines.length !== 24) {
    throw Error('Unexpected source clock or lyric coverage');
  }
  const allIds = new Set<string>();
  let previousStart = -1;
  let previousVisibleUntil = -1;
  for (const line of timeline.lines) {
    if (!line.es.length || !line.en.length) throw Error(`${line.id}: empty language lane`);
    const first = line.es[0]!;
    const last = line.es.at(-1)!;
    if (first.startSample <= previousStart) throw Error(`${line.id}: lines out of order`);
    if (line.visibleFromSample < previousVisibleUntil) throw Error(`${line.id}: hides the preceding line during a cue overlap`);
    previousStart = first.startSample;
    previousVisibleUntil = line.visibleUntilSample;
    if (line.visibleFromSample > first.startSample || line.visibleUntilSample <= last.endSample) {
      throw Error(`${line.id}: line visibility clips its words`);
    }
    let previousWordStart = -1;
    for (const word of line.es) {
      if (allIds.has(word.id)) throw Error(`Duplicate word ID: ${word.id}`);
      allIds.add(word.id);
      if (word.startSample < previousWordStart || word.endSample <= word.startSample) {
        throw Error(`${word.id}: invalid word interval`);
      }
      if (word.startSample < line.visibleFromSample || word.endSample > line.visibleUntilSample) {
        throw Error(`${word.id}: word clipped by line visibility`);
      }
      previousWordStart = word.startSample;
    }
    const mapped = new Set(line.en.flatMap(word => word.sourceIds));
    for (const word of line.en) {
      if (!word.sourceIds.length || word.sourceIds.some(id => !line.es.some(source => source.id === id))) {
        throw Error(`${line.id}: incomplete English mapping for ${word.text}`);
      }
    }
    for (const word of line.es) if (!mapped.has(word.id)) throw Error(`${word.id}: no English meaning`);
  }
}
