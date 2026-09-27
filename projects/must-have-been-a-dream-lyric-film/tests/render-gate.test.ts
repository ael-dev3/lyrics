import {test} from 'node:test';
import assert from 'node:assert/strict';
import {INPUTS, REVISION, SONG, validateGate} from '../scripts/render-gate.ts';

const actual = Object.fromEntries(INPUTS.map(file => [file, 'a'.repeat(64)]));
const cueIds = Array.from({length: 26}, (_, i) => `L${String(i + 1).padStart(2, '0')}`);
const complete = {
  song: SONG, revision: REVISION, inputHashes: actual,
  status: 'complete', actualAudio: 'complete', fullCoverage: 'complete',
  wordTiming: 'complete', lyricText: 'complete', sourceMotion: 'complete',
  unresolved: [], formats: ['landscape', 'portrait'], speeds: ['normal', 'reduced'], cueIds,
};
const authorized = {song: SONG, revision: REVISION, inputHashes: actual, authorized: true, previewReviewed: true};

test('production gate rejects missing, incomplete and stale review evidence', () => {
  assert.throws(() => validateGate(undefined, authorized, actual, cueIds), /missing/);
  assert.throws(() => validateGate({...complete, wordTiming: 'pending'}, authorized, actual, cueIds), /review is required/);
  assert.throws(() => validateGate({...complete, sourceMotion: 'pending'}, authorized, actual, cueIds), /review is required/);
  assert.throws(() => validateGate({...complete, unresolved: ['line 4']}, authorized, actual, cueIds), /review is required/);
  assert.throws(() => validateGate({...complete, revision: 'previous-preview'}, authorized, actual, cueIds), /another song or preview revision/);
  assert.throws(() => validateGate(complete, authorized, {...actual, 'src/scene.ts': 'b'.repeat(64)}, cueIds), /stale/);
  assert.throws(() => validateGate(complete, authorized, {...actual, 'public/bridge-mid.jpg': 'b'.repeat(64)}, cueIds), /stale/);
  assert.throws(() => validateGate(complete, authorized, {...actual, 'public/bridge-mid-sprite.jpg': 'b'.repeat(64)}, cueIds), /stale/);
  assert.throws(() => validateGate(complete, authorized, {...actual, 'public/bridge-stage-light.jpg': 'b'.repeat(64)}, cueIds), /stale/);
  assert.throws(() => validateGate(complete, authorized, {...actual, 'public/bridge-blue-face.jpg': 'b'.repeat(64)}, cueIds), /stale/);
  assert.throws(() => validateGate({...complete, cueIds: cueIds.slice(1)}, authorized, actual, cueIds), /all 26 cues/);
  assert.throws(() => validateGate({...complete, formats: ['landscape']}, authorized, actual, cueIds), /both formats/);
});

test('production input paths are unique and hash exactly once', () => {
  assert.equal(new Set(INPUTS).size, INPUTS.length);
  assert.equal(Object.keys(actual).length, INPUTS.length);
});

test('production gate requires current explicit authorization even after complete review', () => {
  assert.throws(() => validateGate(complete, undefined, actual, cueIds), /missing/);
  assert.throws(() => validateGate(complete, {...authorized, authorized: false}, actual, cueIds), /Explicit production authorization/);
  assert.throws(() => validateGate(complete, {...authorized, inputHashes: {...actual, 'public/timeline.json': 'b'.repeat(64)}}, actual, cueIds), /stale/);
  validateGate(complete, authorized, actual, cueIds);
});
