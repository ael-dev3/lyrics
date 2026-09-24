import {createHash} from 'node:crypto';
import {createReadStream, readFileSync, realpathSync, statSync} from 'node:fs';
import {isAbsolute, relative, resolve, sep} from 'node:path';
import {fileURLToPath} from 'node:url';

export const SONG = 'BPy1NIiKKW0';
export const REVISION = 'acoustic-revision-2026-09-24';
export const PREVIEW_INPUTS = Object.freeze([
  'public/source.mp4', 'src/timeline.json',
  'public/audio-features.json', 'public/audio-features.bin',
  'public/picture-tones.json', 'review/index.html',
  'src/player.js', 'src/preview-core.js', 'src/edgeprint.js',
]);

const root = fileURLToPath(new URL('../', import.meta.url));
function projectFile(base, name) {
  if (typeof name !== 'string' || !name || isAbsolute(name) || name.includes('\\')
      || name.split('/').some(part => !part || part === '.' || part === '..'))
    throw Error('Unsafe project-relative input path');
  const path = resolve(base, name), actual = realpathSync(path), inside = relative(base, actual);
  if (inside === '..' || inside.startsWith('..' + sep) || isAbsolute(inside) || !statSync(actual).isFile())
    throw Error('Input is not a regular project file: ' + name);
  return actual;
}
export async function sha256(path) {
  const digest = createHash('sha256');
  for await (const block of createReadStream(path)) digest.update(block);
  return digest.digest('hex');
}
export async function inputHashes(base = root) {
  base = realpathSync(base);
  const result = {};
  for (const name of PREVIEW_INPUTS) result[name] = await sha256(projectFile(base, name));
  return result;
}
export async function assertRenderGate({base = root} = {}) {
  base = realpathSync(base);
  let record;
  try { record = JSON.parse(readFileSync(projectFile(base, 'evidence/render-authorization.json'), 'utf8')); }
  catch (error) { throw Error('Current render authorization is missing or invalid', {cause: error}); }
  if (record.song !== SONG || record.revision !== REVISION || record.productionAuthorized !== true)
    throw Error('Current song, preview revision and explicit production authorization required');
  if (record.synchronizationReview !== 'owner-attested-complete'
      || !['landscape', 'portrait'].every(format => record.reviewedFormats?.includes(format))
      || !['normal', 'reduced'].every(speed => record.reviewedSpeeds?.includes(speed)))
    throw Error('Full actual-audio and both-format synchronization review required');
  if (!record.inputHashes || Object.keys(record.inputHashes).length !== PREVIEW_INPUTS.length)
    throw Error('Approved preview input hashes are incomplete');
  const actual = await inputHashes(base);
  for (const name of PREVIEW_INPUTS) {
    const approved = record.inputHashes[name];
    if (!/^[a-f0-9]{64}$/.test(approved ?? '') || approved !== actual[name])
      throw Error('Approved preview input changed: ' + name);
  }
  return record;
}

if (process.argv[1] && realpathSync(process.argv[1]) === fileURLToPath(import.meta.url)) {
  if (process.argv.includes('--hashes')) console.log(JSON.stringify(await inputHashes(), null, 2));
  else {
    await assertRenderGate();
    console.log('Current preview review and render authorization verified');
  }
}
