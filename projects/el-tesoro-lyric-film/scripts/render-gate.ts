import {createHash} from 'node:crypto';
import {createReadStream, readFileSync, realpathSync, statSync} from 'node:fs';
import {isAbsolute, relative, resolve, sep} from 'node:path';
import {fileURLToPath} from 'node:url';

export const SONG = 'vlneT-a-KkQ';
export const REVISION = 'el-tesoro-preview-v1';
export const PREVIEW_INPUTS = Object.freeze([
  'public/source.mp4',
  'public/source-poster.jpg',
  'public/fonts/Newsreader.ttf',
  'source/media-manifest.json',
  'source/lyrics-editorial.txt',
  'source/translation-mapping.json',
  'src/timeline.json',
  'src/model.ts',
  'src/player.ts',
  'src/visual.ts',
  'public/audio-features.json',
  'public/audio-features.bin',
  'review/index.html',
  'review/client.js',
]);
const root = fileURLToPath(new URL('../', import.meta.url));

function projectFile(base: string, name: string): string {
  if (!name || isAbsolute(name) || name.includes('\\') || name.split('/').some(part => !part || part === '.' || part === '..')) {
    throw Error('Unsafe project-relative input path');
  }
  const actual = realpathSync(resolve(base, name));
  const inside = relative(base, actual);
  if (inside === '..' || inside.startsWith(`..${sep}`) || isAbsolute(inside) || !statSync(actual).isFile()) {
    throw Error(`Input is not a regular project file: ${name}`);
  }
  return actual;
}
export async function sha256(path: string): Promise<string> {
  const digest = createHash('sha256');
  for await (const block of createReadStream(path)) digest.update(block);
  return digest.digest('hex');
}
export async function inputHashes(base = root): Promise<Record<string, string>> {
  base = realpathSync(base);
  const result: Record<string, string> = {};
  for (const name of PREVIEW_INPUTS) result[name] = await sha256(projectFile(base, name));
  return result;
}
function evidence<T>(base: string, name: string): T {
  try {return JSON.parse(readFileSync(projectFile(base, name), 'utf8')) as T;}
  catch (cause) {throw Error(`${name} is missing or invalid`, {cause});}
}
function checkIdentity(record: {song?: string; revision?: string}, name: string): void {
  if (record.song !== SONG || record.revision !== REVISION) throw Error(`${name} belongs to another song or preview revision`);
}
function checkHashes(approved: Record<string, string> | undefined, actual: Record<string, string>, name: string): void {
  if (!approved || Object.keys(approved).length !== PREVIEW_INPUTS.length) throw Error(`${name} input hashes are incomplete`);
  for (const path of PREVIEW_INPUTS) {
    if (!/^[a-f0-9]{64}$/.test(approved[path] ?? '') || approved[path] !== actual[path]) {
      throw Error(`${name} does not match current preview input: ${path}`);
    }
  }
}
export async function assertRenderGate(base = root): Promise<void> {
  base = realpathSync(base);
  const review = evidence<{
    song?: string; revision?: string; status?: string; translationReview?: string;
    actualAudioReview?: string; audiovisualReview?: string; reviewedLines?: string[];
    reviewedFormats?: string[]; reviewedSpeeds?: string[]; unresolvedDefects?: string[];
    inputHashes?: Record<string, string>;
  }>(base, 'evidence/cross-language-sync-review.json');
  checkIdentity(review, 'Synchronization review');
  if (review.status !== 'complete' || review.translationReview !== 'complete' ||
      review.actualAudioReview !== 'complete' || review.audiovisualReview !== 'complete' ||
      review.unresolvedDefects?.length !== 0 ||
      !['landscape', 'portrait'].every(format => review.reviewedFormats?.includes(format)) ||
      !['normal', 'reduced'].every(speed => review.reviewedSpeeds?.includes(speed)) ||
      review.reviewedLines?.length !== 24 ||
      !Array.from({length: 24}, (_, index) => `L${String(index + 1).padStart(2, '0')}`).every(id => review.reviewedLines?.includes(id))) {
    throw Error('Complete current-song bilingual meaning, actual-audio and both-format sync review required');
  }
  const approval = evidence<{
    song?: string; revision?: string; productionAuthorized?: boolean;
    reviewedPreview?: boolean; inputHashes?: Record<string, string>;
  }>(base, 'evidence/render-authorization.json');
  checkIdentity(approval, 'Render authorization');
  if (approval.productionAuthorized !== true || approval.reviewedPreview !== true) {
    throw Error('Explicit production authorization for the reviewed preview is required');
  }
  const actual = await inputHashes(base);
  checkHashes(review.inputHashes, actual, 'Synchronization review');
  checkHashes(approval.inputHashes, actual, 'Render authorization');
}

if (process.argv[1] && realpathSync(process.argv[1]) === fileURLToPath(import.meta.url)) {
  if (process.argv.includes('--hashes')) console.log(JSON.stringify(await inputHashes(), null, 2));
  else {
    await assertRenderGate();
    console.log('Current preview review and render authorization verified; renderer still requires implementation.');
  }
}
