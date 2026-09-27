import {createHash} from 'node:crypto';
import {readFile, readdir, lstat, mkdir, writeFile} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

export const PROJECT_ID = 'leave-it-on-warpkeep-lyric-film';
export const PREVIEW_REVISION = 'preview-v2-pr375';
export const LOCKED_SOURCE_SHA256 = '376926ae77af41789ac620685dd15b5e1515e3777aece65e964463277e5cfe44';
export const PROJECT_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const IDENTITY_DIRECTORIES = ['src', 'data', 'public/fonts', 'public/assets', 'source'];
const IDENTITY_FILES = ['package.json', 'package-lock.json', 'review/index.html', 'review/style.css', 'scripts/render-gate.mjs'];
const REVIEW_FLAGS = ['actualAudioEveryCue', 'allPerformedWords', 'independentRepeats', 'neutralGaps', 'finalRelease', 'bothFormats', 'pictureMotionVerified'];
const sha256 = bytes => createHash('sha256').update(bytes).digest('hex');
const sortedFiles = files => Object.fromEntries(Object.keys(files).sort().map(key => [key, files[key]]));

async function collect(directory, root, files) {
  const stat = await lstat(path.join(root, directory));
  if (stat.isSymbolicLink()) throw new Error(`Identity input must be a local regular file/directory: ${directory}`);
  if (stat.isFile()) {
    const bytes = await readFile(path.join(root, directory));
    files[directory.split(path.sep).join('/')] = {sha256: sha256(bytes), bytes: bytes.length};
    return;
  }
  if (!stat.isDirectory()) throw new Error(`Unsupported identity input: ${directory}`);
  const entries = await readdir(path.join(root, directory));
  for (const entry of entries.sort()) await collect(path.join(directory, entry), root, files);
}

/** Hash all presentation inputs, local asset/font bytes, and original/playback media.
 * Review/approval records are excluded to avoid a self-referential identity.
 * Calling this function never creates approval or listening evidence. */
export async function buildIdentity(root = PROJECT_ROOT) {
  const files = {};
  for (const input of [...IDENTITY_DIRECTORIES, ...IDENTITY_FILES]) await collect(input, root, files);
  for (const required of ['source/Leave It On.m4a', 'source/leave-it-on.opus.webm', 'data/lyrics.json', 'data/features.json']) {
    if (!files[required]) throw new Error(`Missing required source/presentation input: ${required}`);
  }
  const payload = {schemaVersion: 1, projectId: PROJECT_ID, previewRevision: PREVIEW_REVISION, files: sortedFiles(files)};
  return {...payload, inputDigest: sha256(JSON.stringify(payload))};
}

function identityErrors(identity, current, label) {
  const errors = [];
  if (!identity || typeof identity !== 'object') return [`${label} is missing.`];
  if (identity.projectId !== PROJECT_ID || identity.previewRevision !== PREVIEW_REVISION) errors.push(`${label} belongs to another song or preview revision.`);
  if (!identity.files || !Object.keys(identity.files).length) errors.push(`${label} has no complete input hash map.`);
  if (JSON.stringify(sortedFiles(identity.files || {})) !== JSON.stringify(sortedFiles(current.files))) errors.push(`${label} contains stale, missing, changed or extra inputs.`);
  if (identity.inputDigest !== current.inputDigest) errors.push(`${label} digest does not match the current preview.`);
  return errors;
}

/** This checks declared evidence and binding, not acoustic truth or authenticity.
 * A complete technical check must never turn a pending review into a completed one. */
export function validateProductionStatus(status, current, frozen) {
  const errors = identityErrors(frozen, current, 'Frozen preview identity');
  if (current.files?.['source/Leave It On.m4a']?.sha256 !== LOCKED_SOURCE_SHA256) errors.push('The original recording differs from the locked Leave It On source.');
  if (!status || typeof status !== 'object') return [...errors, 'Production status/authorization is missing.'];
  if (status.schemaVersion !== 1 || status.projectId !== PROJECT_ID || status.previewRevision !== PREVIEW_REVISION) errors.push('Production status belongs to another song or preview revision.');
  const sync = status.syncReview;
  if (sync?.complete !== true) errors.push('Complete current-recording synchronization review is pending.');
  for (const key of REVIEW_FLAGS) if (sync?.[key] !== true) errors.push(`Synchronization review is incomplete: ${key}.`);
  if (sync?.inputDigest !== current.inputDigest) errors.push('Synchronization review is absent or stale for the current inputs.');
  if (typeof sync?.evidence !== 'string' || !sync.evidence.trim()) errors.push('Synchronization review evidence is missing.');
  const approval = status.renderAuthorization;
  if (approval?.authorized !== true) errors.push('Explicit production-render authorization is pending.');
  if (approval?.scope !== 'full-production-render') errors.push('Authorization does not cover a full production render.');
  if (approval?.projectId !== PROJECT_ID || approval?.previewRevision !== PREVIEW_REVISION) errors.push('Authorization belongs to another song or preview revision.');
  if (approval?.inputDigest !== current.inputDigest) errors.push('Authorization is absent or stale for the current inputs.');
  if (typeof approval?.authorizationId !== 'string' || !approval.authorizationId.trim()) errors.push('Authorization identity is missing.');
  if (typeof approval?.authorizedAt !== 'string' || !Number.isFinite(Date.parse(approval.authorizedAt))) errors.push('Authorization date is missing or invalid.');
  return [...new Set(errors)];
}

async function readOptionalJson(filename, root) {
  try {return JSON.parse(await readFile(path.join(root, filename), 'utf8'));}
  catch (error) {if (error.code === 'ENOENT') return null; throw error;}
}

export async function evaluateGate(root = PROJECT_ROOT) {
  const current = await buildIdentity(root);
  const status = await readOptionalJson('review/production-status.json', root);
  const frozen = await readOptionalJson('review/preview-identity.json', root);
  return {current, status, frozen, errors: validateProductionStatus(status, current, frozen)};
}

async function main() {
  const args = process.argv.slice(2);
  if (args.length && !(args.length === 1 && args[0] === '--freeze')) throw new Error('Usage: node scripts/render-gate.mjs [--freeze]');
  if (args[0] === '--freeze') {
    const identity = await buildIdentity();
    if (identity.files['source/Leave It On.m4a'].sha256 !== LOCKED_SOURCE_SHA256) throw new Error('Refusing to freeze a different original recording.');
    await mkdir(path.join(PROJECT_ROOT, 'review'), {recursive: true});
    await writeFile(path.join(PROJECT_ROOT, 'review/preview-identity.json'), `${JSON.stringify(identity, null, 2)}\n`);
    console.log(`Frozen ${Object.keys(identity.files).length} inputs as ${identity.inputDigest}. Approval and listening status were not changed.`);
    return;
  }
  const result = await evaluateGate();
  if (result.errors.length) {
    console.error(`Production gate CLOSED:\n${result.errors.map(error => `- ${error}`).join('\n')}`);
    process.exitCode = 1;
    return;
  }
  console.log('Review and authorization bindings pass. No renderer is implemented or invoked. Browser/renderer parity and an approved short encoded proof are still required before any full capture.');
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch(error => {console.error(`Production gate CLOSED: ${error.message}`); process.exitCode = 1;});
}
