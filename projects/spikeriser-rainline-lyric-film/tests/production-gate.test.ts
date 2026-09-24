import assert from 'node:assert/strict';
import {test} from 'node:test';
import {previewIdentityPaths, REVISION, SONG_ID} from '../src/identity.ts';
import {checkProductionGate, sha256, type GateInputs} from '../scripts/production-contract.ts';

function ready(): GateInputs {
  const hashes = Object.fromEntries(previewIdentityPaths.map((path, index) => [path, sha256(`${path}:${index}`)]));
  const identitySha256 = sha256(JSON.stringify(hashes));
  const review = {
    song: SONG_ID, revision: REVISION, previewIdentitySha256: identitySha256,
    status: 'complete', actualAudioReviewComplete: true, allCuesAllFormatsComplete: true,
    unresolvedDefects: [],
    cues: ['a', 'b'].map(id => ({id, lyricsVerified: true, wordFocusReviewed: true, normalAudio: true, slowAudio: true, landscape: true, portrait: true})),
  };
  return {
    identity: {song: SONG_ID, revision: REVISION, identitySha256, hashes},
    review,
    authorization: {song: SONG_ID, revision: REVISION, status: 'authorized', fullRenderAuthorized: true, previewIdentitySha256: identitySha256, reviewSha256: sha256(JSON.stringify(review)), evidenceBasis: 'Explicit authorization for this reviewed preview'},
    currentHashes: {...hashes}, cueIds: ['a', 'b'],
  };
}

test('current, fully reviewed and authorized inputs can pass the contract', () => {
  assert.doesNotThrow(() => checkProductionGate(ready()));
});

test('missing frozen preview identity blocks production', () => {
  const input = ready();
  input.identity = undefined;
  assert.throws(() => checkProductionGate(input), /preview identity/);
});

test('missing authorization blocks production', () => {
  const input = ready();
  input.authorization = undefined;
  assert.throws(() => checkProductionGate(input), /render authorization/);
});

test('changed scene bytes invalidate a frozen preview', () => {
  const input = ready();
  input.currentHashes['src/city.ts'] = sha256('changed city');
  assert.throws(() => checkProductionGate(input), /Preview input changed: src\/city.ts/);
});

test('changed street pedestrian code invalidates a frozen preview', () => {
  const input = ready();
  input.currentHashes['src/pedestrians.ts'] = sha256('changed pedestrian motion');
  assert.throws(() => checkProductionGate(input), /Preview input changed: src\/pedestrians.ts/);
});

test('changed sidewalk paths invalidate a frozen preview', () => {
  const input = ready();
  input.currentHashes['src/pedestrian-paths.ts'] = sha256('changed sidewalk path');
  assert.throws(() => checkProductionGate(input), /Preview input changed: src\/pedestrian-paths.ts/);
});

test('changed camera, vehicle, or lyric choreography invalidates a frozen preview', () => {
  const input = ready();
  input.currentHashes['src/city-choreography.ts'] = sha256('changed street choreography');
  assert.throws(() => checkProductionGate(input), /Preview input changed: src\/city-choreography.ts/);
});

test('the archived v3 identity cannot authorize the v4 native revision', () => {
  const input = ready();
  input.identity = {...input.identity as object, revision: 'preview-v3-street'};
  assert.throws(() => checkProductionGate(input), /another song or revision/);
});

test('missing or changed city art invalidates a frozen preview', () => {
  const missing = ready();
  const hashes = {...(missing.identity as {hashes: Record<string, string>}).hashes};
  delete hashes['public/city-airship.png'];
  missing.identity = {...missing.identity as object, hashes, identitySha256: sha256(JSON.stringify(hashes))};
  assert.throws(() => checkProductionGate(missing), /input inventory is incomplete/);

  const changed = ready();
  changed.currentHashes['public/city-portrait.png'] = sha256('changed portrait art');
  assert.throws(() => checkProductionGate(changed), /Preview input changed: public\/city-portrait.png/);
});

test('review for another revision or preview identity cannot pass', () => {
  const input = ready();
  input.review = {...input.review as object, revision: 'earlier'};
  assert.throws(() => checkProductionGate(input), /Current-preview complete/);
  const other = ready();
  other.review = {...other.review as object, previewIdentitySha256: sha256('old preview')};
  assert.throws(() => checkProductionGate(other), /Current-preview complete/);
});

test('incomplete cue review and unresolved defects block production', () => {
  const input = ready();
  input.review = {...input.review as object, cues: [{id: 'a', lyricsVerified: true}]};
  assert.throws(() => checkProductionGate(input), /incomplete cue inventory/);
  const other = ready();
  other.review = {...other.review as object, unresolvedDefects: ['uncertain chorus']};
  assert.throws(() => checkProductionGate(other), /defects remain unresolved/);
});

test('approval bound to a different review cannot pass', () => {
  const input = ready();
  input.authorization = {...input.authorization as object, reviewSha256: sha256('different review')};
  assert.throws(() => checkProductionGate(input), /Explicit render authorization/);
});
