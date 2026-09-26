export type Format = 'landscape' | 'portrait';
export type Word = {id: string; text: string; start: number; end: number; evidence: string};
export type Cue = {id: string; kind: 'hook' | 'phrase'; words: Word[]; start: number; end: number; review: string};
export type Timeline = {song: string; revision: string; duration: number; cues: Cue[]};
export type Range = {minimum: number; maximum: number};
export type Features = {framesPerSecond: number; frameCount: number; bandCount: number; scalarsPerFrame: number; bytesPerFrame: number; durationSeconds: number; dataSha256: string; sourceSha256: string; displayMapping: {rmsDb: Range; flux: Range; bandsDb: Range[]}};
export const clamp = (x: number, a = 0, b = 1): number => Math.max(a, Math.min(b, x));
export const smooth = (x: number): number => {const v = clamp(x); return v * v * (3 - 2 * v);};
export function record(value: unknown): Record<string, unknown> {
 if (!value || typeof value !== 'object' || Array.isArray(value)) throw Error('Expected an object');
 return value as Record<string, unknown>;
}
export function num(value: unknown): number {if (typeof value !== 'number' || !Number.isFinite(value)) throw Error('Expected finite number'); return value;}
export function str(value: unknown): string {if (typeof value !== 'string' || !value) throw Error('Expected nonempty string'); return value;}
export function array(value: unknown): unknown[] {if (!Array.isArray(value)) throw Error('Expected array'); return value;}
export function parseTimeline(input: unknown): Timeline {
 const d = record(input), ids = new Set<string>(), duration = num(d.duration);
 const cues = array(d.cues).map(item => {
  const q = record(item), id = str(q.id), kind = q.kind;
  if (kind !== 'hook' && kind !== 'phrase') throw Error('Unknown cue kind');
  const words = array(q.words).map(item => {
   const w = record(item), id = str(w.id), start = num(w.start), end = num(w.end);
   if (ids.has(id) || start < 0 || end <= start || end > duration) throw Error(`Invalid word ${id}`);
   ids.add(id); return {id, text: str(w.text), start, end, evidence: str(w.evidence)};
  });
  const start = num(q.start), end = num(q.end);
  if (!words.length || words.some(w => w.start < start || w.end > end)) throw Error(`Invalid cue bounds ${id}`);
  for (let i = 1; i < words.length; i++) {
   const a = words[i - 1], b = words[i];
   if (a && b && a.end > b.start + 1 / 44100) throw Error(`Overlapping word focus ${id}`);
  }
  return {id, kind, words, start, end, review: str(q.review)} satisfies Cue;
 });
 for (let i = 1; i < cues.length; i++) {
  const a = cues[i - 1], b = cues[i];
  if (a && b && a.end > b.start + 1 / 44100) throw Error(`Overlapping cues ${a.id}/${b.id}`);
 }
 return {song: str(d.song), revision: str(d.revision), duration, cues};
}
export function parseFeatures(input: unknown, byteLength: number): Features {
 const d = record(input), m = record(d.displayMapping);
 function range(v: unknown): Range {const r = record(v), minimum = num(r.minimum), maximum = num(r.maximum); if (maximum <= minimum) throw Error('Empty display range'); return {minimum, maximum};}
 const f: Features = {framesPerSecond: num(d.framesPerSecond), frameCount: num(d.frameCount), bandCount: num(d.bandCount), scalarsPerFrame: num(d.scalarsPerFrame), bytesPerFrame: num(d.bytesPerFrame), durationSeconds: num(d.durationSeconds), dataSha256: str(d.dataSha256), sourceSha256: str(d.sourceSha256), displayMapping: {rmsDb: range(m.rmsDb), flux: range(m.flux), bandsDb: array(m.bandsDb).map(range)}};
 if (f.framesPerSecond !== 60 || f.bandCount !== 24 || f.scalarsPerFrame !== 26 || f.bytesPerFrame !== 104 || f.frameCount * f.bytesPerFrame !== byteLength || f.displayMapping.bandsDb.length !== 24) throw Error('Invalid feature geometry');
 return f;
}
export function cueAt(timeline: Timeline, t: number): Cue | undefined {
 for (let i = 0; i < timeline.cues.length; i++) {
  const q = timeline.cues[i]; if (!q) continue;
  const previous = timeline.cues[i - 1], next = timeline.cues[i + 1];
  const start = Math.max(q.start - .22, previous ? (previous.end + q.start) / 2 : 0);
  const end = Math.min(q.end + .30, next ? (q.end + next.start) / 2 : timeline.duration);
  if (t >= start && t < end) return q;
 }
 return undefined;
}
export function wordActive(w: Word, t: number): boolean {return t >= w.start && t < w.end;}
export type Slot = {text: string; wordIds: string[]};
export function cueSlots(cue: Cue): Slot[] {
 if (cue.words.length && cue.words.every(w => w.text.toLowerCase().replace(/[^a-z]/g, '') === 'there')) {
  return [{text: 'There', wordIds: cue.words.map(w => w.id)}];
 }
 // Repeated delay words light the same physical letterform. Each performance
 // retains its own acoustic ID and interval; no cumulative focus or fake words.
 if (cue.kind === 'hook' && cue.words.length >= 3 && cue.words.slice(2).every(w => w.text.toLowerCase().replace(/[^a-z]/g, '') === 'there')) {
  return cue.words.slice(0, 3).map((w, i) => ({text: w.text, wordIds: i === 2 ? cue.words.slice(2).map(x => x.id) : [w.id]}));
 }
 return cue.words.map(w => ({text: w.text, wordIds: [w.id]}));
}
