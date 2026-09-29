import type {Lyrics, Voice} from './lyrics.ts';
import {placeholderWord} from './lyrics.ts';

export type Format = 'landscape' | 'portrait';
export type Review = 'normal' | 'priority';
/** Timing for one supplied word. The committed timeline carries no lyric text:
 * `chars` is the display length, used only for placeholder diagnostics. */
export type Effect = 'neon' | 'moon' | 'flame' | 'drop';
export type TimedWord = {id: string; token: number; voice: Voice; chars: number; start: number; end: number; startSample: number; endSample: number; basis: string; spreadMs: number; review: Review; effect: Effect | null};
export type TimedCue = {id: string; line: number; section: string; start: number; end: number; words: TimedWord[]};
export type Timeline = {schema: string; song: string; revision: string; duration: number; sampleRate: number; text: {sha256: string; lines: number; tokens: number; tokensPerLine: number[]}; cues: TimedCue[]};
/** A cue joined with display text (from the local lyric file or placeholders). */
export type Word = TimedWord & {text: string; norm: string};
export type Cue = Omit<TimedCue, 'words'> & {words: Word[]};

export type Range = {minimum: number; maximum: number};
export type Features = {framesPerSecond: number; frameCount: number; bandCount: number; scalarsPerFrame: number; bytesPerFrame: number; durationSeconds: number; dataSha256: string; sourceSha256: string; bandEdgesHz: number[]; displayMapping: {rmsDb: Range; flux: Range; vocalRmsDb: Range; bandsDb: Range[]}};
export type Tones = {frames: number; frameDuration: number; fields: string[]; values: number[][]};

export const clamp = (x: number, a = 0, b = 1): number => Math.max(a, Math.min(b, x));
export const smooth = (x: number): number => {const v = clamp(x); return v * v * (3 - 2 * v);};
export const mix = (a: number, b: number, t: number): number => a + (b - a) * t;
export function record(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw Error('Expected an object');
  return value as Record<string, unknown>;
}
export function num(value: unknown): number {if (typeof value !== 'number' || !Number.isFinite(value)) throw Error('Expected finite number'); return value;}
export function str(value: unknown): string {if (typeof value !== 'string' || !value) throw Error('Expected nonempty string'); return value;}
export function array(value: unknown): unknown[] {if (!Array.isArray(value)) throw Error('Expected array'); return value;}

export function parseTimeline(input: unknown): Timeline {
  const d = record(input), text = record(d.text), duration = num(d.duration), sampleRate = num(d.sampleRate);
  if (d.schema !== 'lyric-film/timeline-id-only/v1') throw Error('Unknown timeline schema');
  if (sampleRate !== 44100) throw Error('Timeline must use the 44.1 kHz source grid');
  const ids = new Set<string>();
  const cues = array(d.cues).map(item => {
    const q = record(item), id = str(q.id), line = num(q.line);
    if (id !== `L${String(line).padStart(2, '0')}`) throw Error(`Cue ID ${id} does not match line ${line}`);
    const words = array(q.words).map(item => {
      const w = record(item), wid = str(w.id), start = num(w.start), end = num(w.end), startSample = num(w.startSample), endSample = num(w.endSample);
      const voice = w.voice === 'backing' ? 'backing' : w.voice === 'lead' ? 'lead' : null;
      if (!voice) throw Error(`Invalid voice for ${wid}`);
      if (ids.has(wid) || !wid.startsWith(`${id}-W`) || start < 0 || end <= start || end > duration + 1e-6) throw Error(`Invalid word ${wid}`);
      if (Math.abs(start - startSample / sampleRate) > 1e-6 || Math.abs(end - endSample / sampleRate) > 1e-6) throw Error(`Word ${wid} is off the sample grid`);
      ids.add(wid);
      const review = w.review === 'priority' ? 'priority' : 'normal';
      const effect = w.effect === undefined || w.effect === null ? null : (['neon', 'moon', 'flame', 'drop'] as const).find(e => e === w.effect);
      if (effect === undefined) throw Error(`Unknown effect on ${wid}`);
      return {id: wid, token: num(w.token), voice, chars: num(w.chars), start, end, startSample, endSample, basis: str(w.basis), spreadMs: num(w.spreadMs), review, effect} satisfies TimedWord;
    });
    const start = num(q.start), end = num(q.end);
    if (!words.length || words.some(w => w.start < start - 1e-6 || w.end > end + 1e-6)) throw Error(`Invalid cue bounds ${id}`);
    for (const voice of ['lead', 'backing'] as const) {
      const lane = words.filter(w => w.voice === voice);
      for (let i = 1; i < lane.length; i++) if (lane[i - 1]!.end > lane[i]!.start + 1e-6) throw Error(`Overlapping ${voice} words in ${id}`);
    }
    return {id, line, section: str(q.section), start, end, words} satisfies TimedCue;
  });
  for (let i = 1; i < cues.length; i++) {
    const a = cues[i - 1]!, b = cues[i]!;
    if (a.line + 1 !== b.line) throw Error('Cues must follow the lyric line order');
    if (a.start > b.start) throw Error(`Cue ${b.id} starts before ${a.id}`);
  }
  const tokensPerLine = array(text.tokensPerLine).map(num);
  return {schema: str(d.schema), song: str(d.song), revision: str(d.revision), duration, sampleRate,
    text: {sha256: str(text.sha256), lines: num(text.lines), tokens: num(text.tokens), tokensPerLine}, cues};
}

/** Join timing to display text. The lyric file must be the exact text the
 * timeline was aligned to; otherwise nothing is displayed. */
export function bindText(timeline: Timeline, lyrics: Lyrics | null, lyricsSha256: string | null): Cue[] {
  if (lyrics) {
    if (lyricsSha256 !== timeline.text.sha256) throw Error('The local lyric file differs from the text this timeline was aligned to');
    if (lyrics.lines.length !== timeline.text.lines) throw Error('Lyric line count differs from the timeline');
  }
  return timeline.cues.map(cue => {
    const line = lyrics?.lines[cue.line - 1];
    if (lyrics && (!line || line.tokens.length !== timeline.text.tokensPerLine[cue.line - 1])) throw Error(`Token count differs on ${cue.id}`);
    return {...cue, words: cue.words.map(w => {
      const token = line?.tokens[w.token - 1];
      if (lyrics && (!token || token.id !== w.id || token.voice !== w.voice)) throw Error(`Token ${w.id} does not match the lyric file`);
      // Backing parentheses become typography (a separate lane); the words stay.
      const text = token ? token.display.replace(/[()]/gu, '') : placeholderWord(w.chars);
      return {...w, text, norm: token?.norm ?? ''};
    })};
  });
}

export function parseFeatures(input: unknown, byteLength: number): Features {
  const d = record(input), m = record(d.displayMapping);
  const range = (v: unknown): Range => {const r = record(v), minimum = num(r.minimum), maximum = num(r.maximum); if (maximum <= minimum) throw Error('Empty display range'); return {minimum, maximum};};
  const f: Features = {framesPerSecond: num(d.framesPerSecond), frameCount: num(d.frameCount), bandCount: num(d.bandCount), scalarsPerFrame: num(d.scalarsPerFrame),
    bytesPerFrame: num(d.bytesPerFrame), durationSeconds: num(d.durationSeconds), dataSha256: str(d.dataSha256), sourceSha256: str(d.sourceSha256),
    bandEdgesHz: array(d.bandEdgesHz).map(num),
    displayMapping: {rmsDb: range(m.rmsDb), flux: range(m.flux), vocalRmsDb: range(m.vocalRmsDb), bandsDb: array(m.bandsDb).map(range)}};
  if (f.framesPerSecond !== 60 || f.bandCount !== 48 || f.scalarsPerFrame !== 51 || f.bytesPerFrame !== 204 || f.frameCount * f.bytesPerFrame !== byteLength || f.displayMapping.bandsDb.length !== 48) throw Error('Invalid feature geometry');
  return f;
}

export function parseTones(input: unknown): Tones {
  const d = record(input), frames = num(d.frames), fields = array(d.fields).map(str), values = array(d.values).map(v => array(v).map(num));
  if (values.length !== fields.length || values.some(v => v.length !== frames)) throw Error('Invalid picture tones');
  return {frames, frameDuration: num(d.frameDuration), fields, values};
}

/** The cue whose reading window contains t. Lines appear shortly before their
 * first sung word and hand off at the midpoint of the gap to the next line. */
export const LEAD_IN = 0.42, HOLD = 0.55;
export function cueWindow(cues: readonly Cue[], i: number, duration: number): [number, number] {
  const q = cues[i]!, previous = cues[i - 1], next = cues[i + 1];
  const start = Math.max(q.start - LEAD_IN, previous ? (previous.end + q.start) / 2 : 0, previous ? previous.start + 0.05 : 0);
  const end = Math.min(q.end + HOLD, next ? Math.max((q.end + next.start) / 2, next.start - LEAD_IN) : duration);
  return [start, Math.max(start + 0.05, end)];
}
export function cueIndexAt(cues: readonly Cue[], t: number, duration: number): number {
  for (let i = 0; i < cues.length; i++) {
    const [a, b] = cueWindow(cues, i, duration);
    if (t >= a && t < b) return i;
  }
  return -1;
}
export const wordActive = (w: {start: number; end: number}, t: number): boolean => t >= w.start && t < w.end;
