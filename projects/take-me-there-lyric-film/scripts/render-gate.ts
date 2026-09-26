import {readFileSync, realpathSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {resolve} from 'node:path';
import {record, array, str, parseTimeline} from '../src/model.ts';
export const SONG = 'CPznmfSbAiE';
export const REVISION = 'source-integrated-preview-v2';
export const INPUTS = ['public/source.mp4','public/fonts/SpaceGrotesk.ttf','public/timeline.json','public/audio-features.json','public/audio-features.bin','src/model.ts','src/shots.ts','src/scene.ts','src/player.ts','review/index.html','review/client.js','source/user-transcript.txt'];
const root = fileURLToPath(new URL('../', import.meta.url));
export function hashes(base = root): Record<string, string> {return Object.fromEntries(INPUTS.map(p => [p, createHash('sha256').update(readFileSync(resolve(base, p))).digest('hex')]));}
export function validateGate(reviewInput: unknown, approvalInput: unknown, actual: Record<string, string>, cueIds: string[]): void {
 const review = record(reviewInput), approval = record(approvalInput);
 for (const [name, d] of [['review',review], ['approval',approval]] as const) {
  if (d.song !== SONG || d.revision !== REVISION) throw Error(`Stale ${name} identity`);
  const h = record(d.inputHashes);
  if (Object.keys(h).length !== INPUTS.length || INPUTS.some(p => typeof h[p] !== 'string' || h[p] !== actual[p])) throw Error(`Stale ${name} inputs`);
 }
 if (review.status !== 'complete' || review.actualAudio !== 'complete' || review.fullCoverage !== 'complete' || review.wordTiming !== 'complete' || review.lyricText !== 'complete' || array(review.unresolved).length) throw Error('Actual-audio, lyric and word-timing review remains incomplete');
 const formats = array(review.formats).map(str), speeds = array(review.speeds).map(str), checked = array(review.cueIds).map(str);
 if (!['landscape','portrait'].every(x => formats.includes(x)) || !['normal','reduced'].every(x => speeds.includes(x)) || cueIds.some(x => !checked.includes(x))) throw Error('All cues, both formats and normal/reduced listening required');
 if (approval.authorized !== true || approval.previewReviewed !== true) throw Error('Current preview render authorization is required');
}
export function assertGate(base = root): void {
 let review: unknown, approval: unknown;
 try {review = JSON.parse(readFileSync(resolve(base, 'evidence/sync-review.json'), 'utf8')); approval = JSON.parse(readFileSync(resolve(base, 'evidence/render-authorization.json'), 'utf8'));}
 catch {throw Error('Production is blocked: current complete listening review and render authorization are missing');}
 const timeline = parseTimeline(JSON.parse(readFileSync(resolve(base, 'public/timeline.json'), 'utf8')));
 validateGate(review, approval, hashes(base), timeline.cues.map(q => q.id));
}
if (process.argv[1] && realpathSync(process.argv[1]) === fileURLToPath(import.meta.url)) {
 assertGate();
 throw Error('Review gate passed; implement and prove renderer parity before production. No encoding started.');
}
