import {createHash} from 'node:crypto';
import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {fileURLToPath} from 'node:url';

export const REVISION = 'phantom-liberty-preview-v2';
export const SONG = 'u15tEo0wsQI';
export const APPROVED_INPUTS = [
  'public/source.mp4', 'source/recording.json', 'source/lyrics-supplied.txt',
  'source/phrases.json', 'source/selected-words.json', 'source/portrait-framing.json',
  'public/timeline.json', 'public/audio-features.json', 'public/fonts/SpaceGrotesk.ttf',
  'src/model.ts', 'src/scene.ts', 'src/player.ts', 'review/index.html', 'review/client.js',
] as const;
const root = fileURLToPath(new URL('../', import.meta.url));
type Hashes = Record<string, string>;
type RecordData = Record<string, unknown>;
function object(value: unknown, label: string): RecordData {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw Error(`${label} is missing or malformed`);
  return value as RecordData;
}
export function currentInputHashes(base = root): Hashes {
  return Object.fromEntries(APPROVED_INPUTS.map(file => [file,
    createHash('sha256').update(readFileSync(resolve(base, file))).digest('hex')]));
}
function assertIdentity(record: RecordData, hashes: Hashes, label: string): void {
  if (record.song !== SONG || record.revision !== REVISION) throw Error(`${label} identifies another recording or preview`);
  const expected = object(record.inputHashes, `${label} input hashes`);
  if (Object.keys(expected).length !== APPROVED_INPUTS.length || APPROVED_INPUTS.some(file => expected[file] !== hashes[file])) {
    throw Error(`${label} is stale: approved preview inputs changed`);
  }
}
/** Owner acceptance and authorization remain distinct from model confidence or technical checks. */
export function validateProductionGate(frozenInput: unknown, reviewInput: unknown, approvalInput: unknown, hashes: Hashes): void {
  const frozen = object(frozenInput, 'Frozen preview');
  const review = object(reviewInput, 'Owner review');
  const approval = object(approvalInput, 'Production authorization');
  assertIdentity(frozen, hashes, 'Frozen preview');
  assertIdentity(review, hashes, 'Owner review');
  assertIdentity(approval, hashes, 'Production authorization');
  if (review.status !== 'owner-reviewed-current-preview' || review.acceptedCurrentPreview !== true ||
      review.reportedReviewScope !== 'complete-current-preview' || review.reviewerRole !== 'project-owner' ||
      review.modelUncertaintyRetained !== true) throw Error('Current complete owner review is required');
  if (approval.authorized !== true || approval.previewReviewed !== true || approval.platformUploadAuthorized !== false ||
      approval.publicMediaReleaseAuthorized !== false) throw Error('Explicit current-preview local production authorization is required');
  const formats = approval.formats;
  if (!Array.isArray(formats) || formats.length !== 2 || !['landscape', 'portrait'].every(format => formats.includes(format))) {
    throw Error('Both approved delivery formats are required');
  }
}
export function checkCurrentProductionGate(base = root): {revision: string; inputs: Hashes} {
  const read = (path: string): unknown => JSON.parse(readFileSync(resolve(base, path), 'utf8')) as unknown;
  const inputs = currentInputHashes(base);
  validateProductionGate(read('evidence/preview-inputs.json'), read('evidence/owner-review.json'), read('evidence/render-authorization.json'), inputs);
  const timeline = object(read('public/timeline.json'), 'Timeline');
  const cues = timeline.cues;
  if (timeline.revision !== REVISION || timeline.sourceSha256 !== inputs['public/source.mp4'] || !Array.isArray(cues) ||
      cues.length !== 60 || cues.reduce((count: number, cue: unknown) => {
        const words = object(cue, 'Cue').words; if (!Array.isArray(words)) throw Error('Missing performed events'); return count + words.length;
      }, 0) !== 313) throw Error('Approved full-recording event inventory differs');
  return {revision: REVISION, inputs};
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  checkCurrentProductionGate(); console.log('Frozen owner-reviewed v2 production gate passed.');
}
