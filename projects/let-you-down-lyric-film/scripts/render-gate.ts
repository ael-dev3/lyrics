import {createHash} from 'node:crypto';
import {existsSync, readFileSync, realpathSync} from 'node:fs';
import {resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {array, parseTimeline, record, str} from '../src/model.ts';
import {normalizeLyrics} from '../src/lyrics.ts';
import {SONG} from '../src/song.ts';

// Production gate. A full-length capture, encode or delivery package starts
// only when a complete, current synchronization review AND an explicit render
// authorization both bind the exact bytes below (plus the local lyric text's
// normalized SHA-256). Any changed byte, missing record or partial review
// refuses production. Diagnostics (stills, ≤8 s placeholder proofs) are separate.
export const INPUTS = [
  'public/source.mp4', 'public/fonts/Oswald-Bold.ttf', 'public/timeline.json', 'public/audio-features.json', 'public/audio-features.bin',
  'public/picture-tones.json', 'src/lyrics.ts', 'src/model.ts', 'src/song.ts', 'src/frame.ts', 'src/shots.ts', 'src/scene.ts', 'src/player.ts',
  'review/index.html', 'review/client.js',
] as const;
const root = fileURLToPath(new URL('../', import.meta.url));
const sha = (bytes: Uint8Array | string): string => createHash('sha256').update(bytes).digest('hex');
export function hashes(base = root): Record<string, string> {
  return Object.fromEntries(INPUTS.map(p => [p, sha(readFileSync(resolve(base, p)))]));
}
export function lyricsHash(base = root): string | null {
  const p = resolve(base, 'source/lyrics.local.txt');
  return existsSync(p) ? sha(normalizeLyrics(readFileSync(p, 'utf8'))) : null;
}
export type GateFacts = {inputs: Record<string, string>; lyricsSha256: string | null; revision: string; cueIds: string[]};
export function validateGate(reviewInput: unknown, approvalInput: unknown, facts: GateFacts): void {
  const review = record(reviewInput), approval = record(approvalInput);
  for (const [name, d] of [['review', review], ['authorization', approval]] as const) {
    if (d.song !== SONG || d.revision !== facts.revision) throw Error(`Stale ${name}: song or revision differs`);
    const h = record(d.inputHashes);
    if (Object.keys(h).length !== INPUTS.length || INPUTS.some(p => h[p] !== facts.inputs[p])) throw Error(`Stale ${name}: input hashes differ`);
    if (!facts.lyricsSha256 || d.lyricsSha256 !== facts.lyricsSha256) throw Error(`Stale ${name}: local lyric text differs or is missing`);
  }
  if (review.status !== 'complete' || review.actualAudio !== 'complete' || review.fullCoverage !== 'complete' || review.wordTiming !== 'complete' ||
      review.lyricText !== 'complete' || review.sourceMotion !== 'complete' || array(review.unresolved).length) {
    throw Error('Actual-audio listening, coverage, word timing, text and picture review must all be complete with nothing unresolved');
  }
  const formats = array(review.formats).map(str), speeds = array(review.speeds).map(str), cues = array(review.cueIds).map(str);
  if (!['landscape', 'portrait'].every(f => formats.includes(f)) || !['normal', 'reduced'].every(s => speeds.includes(s))) throw Error('Both formats at normal and reduced speed are required');
  if (facts.cueIds.some(id => !cues.includes(id))) throw Error('Every cue must be reviewed');
  if (approval.authorized !== true || approval.previewReviewed !== true || typeof approval.scope !== 'string') throw Error('Explicit render authorization for this reviewed preview is required');
}
export function assertGate(base = root): void {
  let review: unknown, approval: unknown;
  try {
    review = JSON.parse(readFileSync(resolve(base, 'evidence/sync-review.json'), 'utf8'));
    approval = JSON.parse(readFileSync(resolve(base, 'evidence/render-authorization.json'), 'utf8'));
  } catch {
    throw Error('Production is blocked: a complete current sync review (evidence/sync-review.json) and render authorization (evidence/render-authorization.json) are required');
  }
  const timeline = parseTimeline(JSON.parse(readFileSync(resolve(base, 'public/timeline.json'), 'utf8')));
  validateGate(review, approval, {inputs: hashes(base), lyricsSha256: lyricsHash(base), revision: timeline.revision, cueIds: timeline.cues.map(q => q.id)});
}
if (process.argv[1] && realpathSync(process.argv[1]) === fileURLToPath(import.meta.url)) {
  assertGate();
  console.log('Render gate passed for the current reviewed revision.');
}
