import {createHash} from 'node:crypto';
import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {fileURLToPath} from 'node:url';

/** Exact preview inputs that must match the owner's review and render authorization. */
export const SONG = 'AK6duyCPU50';
export const REVISION = 'source-integrated-preview-v1';
export const INPUTS = [
  'public/source.mp4',
  'public/ArchivoBlack-Regular.ttf',
  'public/timeline.json',
  'public/audio-features.json',
  'public/bridge-intro.jpg',
  'public/bridge-mid.jpg',
  'public/bridge-mid-sprite.jpg',
  'public/bridge-title.jpg',
  'public/bridge-credits.jpg',
  'public/bridge-stage-light.jpg',
  'public/bridge-blue-face.jpg',
  'source/user-transcript.txt',
  'src/shots.ts',
  'src/scene.ts',
  'src/player.ts',
  'review/index.html',
  'review/client.js',
] as const;

const root = fileURLToPath(new URL('../', import.meta.url));
function object(value: unknown, label: string): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw Error(`${label} is missing or malformed`);
  return value as Record<string, unknown>;
}
function stringArray(value: unknown): string[] {
  if (!Array.isArray(value) || value.some(item => typeof item !== 'string')) return [];
  return value;
}
export function hashes(base = root): Record<string, string> {
  if (new Set(INPUTS).size !== INPUTS.length) throw Error('Production inputs contain duplicate paths');
  return Object.fromEntries(INPUTS.map(file => [
    file,
    createHash('sha256').update(readFileSync(resolve(base, file))).digest('hex'),
  ]));
}

/** Testable policy. No review or approval record is fabricated by this module. */
export function validateGate(
  reviewInput: unknown,
  approvalInput: unknown,
  actual: Record<string, string>,
  cueIds: string[],
): void {
  const review = object(reviewInput, 'Listening review');
  const approval = object(approvalInput, 'Render authorization');
  for (const [label, evidence] of [['Listening review', review], ['Render authorization', approval]] as const) {
    if (evidence.song !== SONG || evidence.revision !== REVISION) throw Error(`${label} identifies another song or preview revision`);
    const recorded = object(evidence.inputHashes, `${label} input hashes`);
    if (Object.keys(recorded).length !== INPUTS.length || INPUTS.some(file => recorded[file] !== actual[file] || typeof actual[file] !== 'string')) {
      throw Error(`${label} is stale: preview inputs changed`);
    }
  }
  if (
    review.status !== 'complete' || review.actualAudio !== 'complete' ||
    review.fullCoverage !== 'complete' || review.wordTiming !== 'complete' ||
    review.lyricText !== 'complete' || review.sourceMotion !== 'complete' ||
    !Array.isArray(review.unresolved) || review.unresolved.length !== 0
  ) throw Error('Complete actual-audio, lyric, motion and word-timing review is required');

  const formats = stringArray(review.formats);
  const speeds = stringArray(review.speeds);
  const checkedCues = stringArray(review.cueIds);
  if (
    !['landscape', 'portrait'].every(format => formats.includes(format)) ||
    !['normal', 'reduced'].every(speed => speeds.includes(speed)) ||
    cueIds.length !== 26 || checkedCues.length !== 26 ||
    new Set(checkedCues).size !== 26 || cueIds.some(id => !checkedCues.includes(id))
  ) throw Error('Review must cover all 26 cues at normal and reduced speed in both formats');

  if (approval.authorized !== true || approval.previewReviewed !== true) {
    throw Error('Explicit production authorization for this reviewed preview is required');
  }
}

export function assertGate(base = root): void {
  let review: unknown;
  let approval: unknown;
  try {
    review = JSON.parse(readFileSync(resolve(base, 'evidence/sync-review.json'), 'utf8')) as unknown;
    approval = JSON.parse(readFileSync(resolve(base, 'evidence/render-authorization.json'), 'utf8')) as unknown;
  } catch {
    throw Error('Production blocked: current complete listening review and render authorization are missing');
  }
  const timeline = object(JSON.parse(readFileSync(resolve(base, 'public/timeline.json'), 'utf8')) as unknown, 'Timeline');
  const cues = timeline.cues;
  if (!Array.isArray(cues) || cues.some(cue => typeof object(cue, 'Cue').id !== 'string')) throw Error('Production blocked: lyric cue IDs are invalid');
  validateGate(review, approval, hashes(base), cues.map(cue => (cue as {id: string}).id));
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  assertGate();
  console.log('Current review and render authorization gate passed. Encode each format with npm run render:production -- --format landscape or --format portrait.');
}
