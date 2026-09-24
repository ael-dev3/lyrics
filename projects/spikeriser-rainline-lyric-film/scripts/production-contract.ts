import {createHash} from 'node:crypto';
import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {previewIdentityPaths, REVISION, SONG_ID} from '../src/identity.ts';

type RecordValue = Record<string, unknown>;
export type GateInputs = {
  identity: unknown;
  review: unknown;
  authorization: unknown;
  currentHashes: Record<string, string>;
  cueIds: string[];
};

const object = (value: unknown, label: string): RecordValue => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error(`Missing or invalid ${label}`);
  return value as RecordValue;
};
const array = (value: unknown, label: string): unknown[] => {
  if (!Array.isArray(value)) throw new Error(`Missing or invalid ${label}`);
  return value;
};
export const sha256 = (bytes: Buffer | string) => createHash('sha256').update(bytes).digest('hex');

export function checkProductionGate(input: GateInputs): void {
  const identity = object(input.identity, 'preview identity');
  if (identity.song !== SONG_ID || identity.revision !== REVISION) throw new Error('Preview identity is for another song or revision');
  const hashes = object(identity.hashes, 'preview hashes');
  const expectedPaths = [...previewIdentityPaths].sort();
  if (JSON.stringify(Object.keys(hashes).sort()) !== JSON.stringify(expectedPaths)) throw new Error('Preview input inventory is incomplete or unexpected');
  if (identity.identitySha256 !== sha256(JSON.stringify(hashes))) throw new Error('Preview identity digest is invalid');
  for (const path of previewIdentityPaths) {
    if (hashes[path] !== input.currentHashes[path]) throw new Error(`Preview input changed: ${path}`);
  }

  const review = object(input.review, 'synchronization review');
  if (review.song !== SONG_ID || review.revision !== REVISION || review.previewIdentitySha256 !== identity.identitySha256 ||
      review.status !== 'complete' || review.actualAudioReviewComplete !== true || review.allCuesAllFormatsComplete !== true) {
    throw new Error('Current-preview complete audio and both-format synchronization review is required');
  }
  if (array(review.unresolvedDefects, 'unresolved defects').length !== 0) throw new Error('Synchronization defects remain unresolved');
  const rows = array(review.cues, 'review cues').map(row => object(row, 'review cue'));
  if (rows.length !== input.cueIds.length || new Set(rows.map(row => row.id)).size !== input.cueIds.length) throw new Error('Synchronization review has an incomplete cue inventory');
  for (const id of input.cueIds) {
    const row = rows.find(value => value.id === id);
    if (!row || !['lyricsVerified', 'wordFocusReviewed', 'normalAudio', 'slowAudio', 'landscape', 'portrait'].every(key => row[key] === true)) {
      throw new Error(`Incomplete synchronization review for ${id}`);
    }
  }

  const authorization = object(input.authorization, 'render authorization');
  if (authorization.song !== SONG_ID || authorization.revision !== REVISION ||
      authorization.status !== 'authorized' || authorization.fullRenderAuthorized !== true ||
      authorization.previewIdentitySha256 !== identity.identitySha256 ||
      authorization.reviewSha256 !== sha256(JSON.stringify(review)) ||
      typeof authorization.evidenceBasis !== 'string' || authorization.evidenceBasis.trim().length === 0) {
    throw new Error('Explicit render authorization for this reviewed preview is required');
  }
}

export function assertProductionGate(root = process.cwd()): void {
  const read = (path: string): unknown => {
    try {return JSON.parse(readFileSync(resolve(root, path), 'utf8')) as unknown;}
    catch {throw new Error(`Missing or invalid production evidence: ${path}`);}
  };
  const identity = read('evidence/preview-identity.json');
  const review = read('evidence/sync-review.json');
  const authorization = read('evidence/render-authorization.json');
  const currentHashes = Object.fromEntries(previewIdentityPaths.map(path => {
    try {return [path, sha256(readFileSync(resolve(root, path)))];}
    catch {throw new Error(`Missing preview input: ${path}`);}
  }));
  const cueIds = array(read('src/word-cues.json'), 'source cues').map(cue => {
    const id = object(cue, 'source cue').id;
    if (typeof id !== 'string' || !id) throw new Error('Invalid source cue ID');
    return id;
  });
  if (new Set(cueIds).size !== cueIds.length) throw new Error('Duplicate source cue IDs');
  checkProductionGate({
    identity,
    review,
    authorization,
    currentHashes,
    cueIds,
  });
}
