import {createHash} from 'node:crypto';
import {existsSync, readFileSync, realpathSync} from 'node:fs';
import {resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {array, parseTimeline, record, str} from '../src/model.ts';
import {normalizeLyrics} from '../src/lyrics.ts';
import {SONG} from '../src/song.ts';

// Production gate. A full-length capture, encode or delivery package starts
// only when a current review record AND an explicit render authorization both
// bind the exact bytes below (plus the local lyric text's normalized SHA-256).
// Any changed byte, missing record or partial review refuses production.
// Diagnostics (stills, ≤8 s placeholder proofs) are separate.
//
// The review is either the default complete synchronization review, or the
// scoped production decision described in docs/preview-before-render.md
// (`owner-approved-preview`): the owner's overall acceptance of a presented
// preview plus an explicit render instruction, recorded without claiming a
// granular listening audit. That scope binds the accepted preview's identity;
// the only inputs allowed to differ from it are the ones the owner directed in
// the same instruction, and the timeline may differ only in its revision label.
export const INPUTS = [
  'public/source.mp4', 'public/fonts/Rajdhani-Bold.ttf', 'public/timeline.json', 'public/audio-features.json', 'public/audio-features.bin',
  'public/picture-tones.json', 'public/picture-palette.json', 'src/lyrics.ts', 'src/model.ts', 'src/song.ts', 'src/frame.ts', 'src/shots.ts', 'src/scene.ts', 'src/player.ts',
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
/** Identity of the word timing itself: the timeline without its revision label. */
export function timingSha256(timelineJson: unknown): string {
  const t = {...record(timelineJson)};
  delete t.revision;
  return sha(JSON.stringify(t));
}
export type GateFacts = {inputs: Record<string, string>; lyricsSha256: string | null; revision: string; cueIds: string[]; timingSha256: string};
export function validateGate(reviewInput: unknown, approvalInput: unknown, facts: GateFacts): void {
  const review = record(reviewInput), approval = record(approvalInput);
  for (const [name, d] of [['review', review], ['authorization', approval]] as const) {
    if (d.song !== SONG || d.revision !== facts.revision) throw Error(`Stale ${name}: song or revision differs`);
    const h = record(d.inputHashes);
    if (Object.keys(h).length !== INPUTS.length || INPUTS.some(p => h[p] !== facts.inputs[p])) throw Error(`Stale ${name}: input hashes differ`);
    if (!facts.lyricsSha256 || d.lyricsSha256 !== facts.lyricsSha256) throw Error(`Stale ${name}: local lyric text differs or is missing`);
  }
  if (array(review.unresolved).length) throw Error('The review lists unresolved items');
  const cues = array(review.cueIds).map(str);
  if (facts.cueIds.some(id => !cues.includes(id))) throw Error('Every cue must be covered by the review record');
  if (review.status === 'owner-approved-preview') {
    // Scoped production decision: bind what the owner accepted and what the
    // owner directed since; granular listening fields stay unrecorded.
    if (typeof review.method !== 'string' || !review.method.trim()) throw Error('Scoped acceptance must state its basis');
    const accepted = record(review.acceptedInputHashes);
    if (typeof review.acceptedRevision !== 'string' || Object.keys(accepted).length !== INPUTS.length || INPUTS.some(p => typeof accepted[p] !== 'string')) {
      throw Error('Scoped acceptance must bind the accepted preview identity');
    }
    const directed = array(review.ownerDirectedChanges).map(record);
    if (directed.some(c => typeof c.change !== 'string' || !c.change.trim() || !array(c.inputs).length)) throw Error('Each owner-directed change needs a description and its inputs');
    const allowed = new Set(directed.flatMap(c => array(c.inputs).map(str)));
    if ([...allowed].some(p => !(INPUTS as readonly string[]).includes(p) || p === 'public/timeline.json')) throw Error('Owner-directed changes may name only gated presentation inputs other than the timeline');
    if (review.acceptedTimingSha256 !== facts.timingSha256) throw Error('Word timing differs from the accepted preview');
    const changed = INPUTS.filter(p => accepted[p] !== facts.inputs[p] && p !== 'public/timeline.json');
    if (changed.some(p => !allowed.has(p))) throw Error(`Inputs changed beyond the owner-directed revision: ${changed.filter(p => !allowed.has(p)).join(', ')}`);
    if (approval.basis !== 'owner-approved-preview' || approval.acceptedRevision !== review.acceptedRevision) throw Error('The authorization must name the same scoped acceptance');
  } else {
    if (review.status !== 'complete' || review.actualAudio !== 'complete' || review.fullCoverage !== 'complete' || review.wordTiming !== 'complete' ||
        review.lyricText !== 'complete' || review.sourceMotion !== 'complete') {
      throw Error('Actual-audio listening, coverage, word timing, text and picture review must all be complete with nothing unresolved');
    }
    const formats = array(review.formats).map(str), speeds = array(review.speeds).map(str);
    if (!['landscape', 'portrait'].every(f => formats.includes(f)) || !['normal', 'reduced'].every(s => speeds.includes(s))) throw Error('Both formats at normal and reduced speed are required');
  }
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
  const raw = JSON.parse(readFileSync(resolve(base, 'public/timeline.json'), 'utf8')) as unknown, timeline = parseTimeline(raw);
  validateGate(review, approval, {inputs: hashes(base), lyricsSha256: lyricsHash(base), revision: timeline.revision, cueIds: timeline.cues.map(q => q.id), timingSha256: timingSha256(raw)});
}
if (process.argv[1] && realpathSync(process.argv[1]) === fileURLToPath(import.meta.url)) {
  assertGate();
  console.log('Render gate passed for the current reviewed revision.');
}
