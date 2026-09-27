import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {AnimationMixer} from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {clone as cloneSkeleton} from 'three/addons/utils/SkeletonUtils.js';
import {cueAt, wordAt, featuresAt, frameState, seedRandom, semanticEffectsAt, effectTargetsForCue} from '../src/core.js';
import {sampleGuardianPose} from '../src/guardian-clock.js';
import {validateProjectData, validateSpectrum} from './check.mjs';
import {buildIdentity, validateProductionStatus, PROJECT_ID, PREVIEW_REVISION, LOCKED_SOURCE_SHA256, PROJECT_ROOT} from './render-gate.mjs';

const cues = [{id: 'A', displayStart: 1, displayEnd: 3}, {id: 'B', displayStart: 3, displayEnd: 4}, {id: 'C', displayStart: 5, displayEnd: 6}];
const words = [{start: 1.1, end: 1.4}, {start: 1.4, end: 1.7}, {start: 2, end: 2.5}];
const features = {sampleRate: 2, duration: 1, frames: [[0, .2, .4, .6, .8], [.2, .4, .6, .8, 1], [.4, .6, .8, 1, 0]]};
const dataPath = new URL('../data/lyrics.json', import.meta.url);
const featurePath = new URL('../data/features.json', import.meta.url);

// Run the actual UI handler with controlled asynchronous loads, without WebGL.
async function recoveryFixture(createWorld, {playing = false, initializing = false} = {}) {
  const source = await readFile(new URL('../src/player.js', import.meta.url), 'utf8');
  const start = source.indexOf('restoreButton.onclick=async()=>{');
  const end = source.indexOf('\n};', start);
  assert.ok(start >= 0 && end > start, 'The recovery handler must be available for its integration contract.');
  const handler = source.slice(start, end + 3);
  return new Function('createWorld', 'initializing', 'playing', `
    const nodes = {'#loading': {hidden: true}, '#error': {hidden: true}, '#load-detail': {}, '#scene': {replaceWith(canvas) {nodes['#scene'] = canvas}}};
    const $ = selector => nodes[selector], document = {createElement: () => ({replaceWith(canvas) {nodes['#scene'] = canvas}})};
    const restoreButton = {disabled: initializing}, events = [], notes = [{text: 'Preserved listening note'}], lyrics = {cues: []}, spectrum = {frames: []};
    const audio = {paused: !playing, currentTime: 123.25, pause() {this.paused = true}, async play() {this.paused = false;events.push('play')}};
    let restoring = false, restoreRequest = 0, ready = true, world = {dispose() {events.push('dispose')}};
    const stopPump = () => events.push('stop'), resize = () => events.push('resize'), settled = () => events.push('settled');
    const error = e => {nodes['#error'].hidden = false;events.push(e.message)};
    ${handler}
    return {restore: () => restoreButton.onclick(), audio, nodes, notes, events, get buttonDisabled() {return restoreButton.disabled}, get world() {return world}, get ready() {return ready}};
  `)(createWorld, initializing, playing);
}

test('recovery serializes repeated clicks and preserves the paused source position and notes', async () => {
  let complete, calls = 0;
  const fixture = await recoveryFixture(() => {calls++;return new Promise(resolve => {complete = resolve})});
  const first = fixture.restore();
  await fixture.restore();
  assert.equal(calls, 1, 'A second click must not start another canvas/world load.');
  assert.equal(fixture.buttonDisabled, true);
  assert.equal(fixture.world, null, 'Resize events must not target the disposed renderer while it is rebuilding.');
  const replacement = {setData(lyrics, spectrum) {this.bound = !!lyrics && !!spectrum}, dispose() {throw Error('Current world was discarded')}};
  complete(replacement);await first;
  assert.equal(fixture.world, replacement);
  assert.equal(replacement.bound, true);
  assert.equal(fixture.ready, true);
  assert.equal(fixture.audio.currentTime, 123.25);
  assert.equal(fixture.audio.paused, true);
  assert.equal(fixture.buttonDisabled, false);
  assert.equal(fixture.nodes['#loading'].hidden, true);
  assert.deepEqual(fixture.notes, [{text: 'Preserved listening note'}]);
});

test('failed recovery releases its guard for retry and a playing recovery resumes only after loading', async () => {
  let calls = 0;
  const replacement = {setData() {}, dispose() {}};
  const fixture = await recoveryFixture(async () => {if (++calls === 1)throw Error('Controlled load failure');return replacement}, {playing: true});
  await fixture.restore();
  assert.equal(fixture.buttonDisabled, false);
  assert.equal(fixture.nodes['#loading'].hidden, true);
  assert.equal(fixture.nodes['#error'].hidden, false);
  assert.equal(fixture.ready, false);
  assert.equal(fixture.audio.paused, true);
  await fixture.restore();
  assert.equal(calls, 2);
  assert.equal(fixture.world, replacement);
  assert.equal(fixture.nodes['#error'].hidden, true);
  assert.equal(fixture.audio.paused, true, 'A retry preserves the current paused state after a failure.');
  const playing = await recoveryFixture(async () => replacement, {playing: true});
  await playing.restore();
  assert.equal(playing.audio.paused, false);
  assert.ok(playing.events.indexOf('resize') < playing.events.indexOf('play'));
  const booting = await recoveryFixture(() => {throw Error('Must not race initial load')}, {initializing: true});
  await booting.restore();
  assert.equal(booting.buttonDisabled, true);
});

test('line visibility hands off once at an exclusive end and is neutral in a real gap', () => {
  assert.equal(cueAt(cues, .999), null);
  assert.equal(cueAt(cues, 1)?.id, 'A');
  assert.equal(cueAt(cues, 3)?.id, 'B');
  assert.equal(cueAt(cues, 4), null);
  assert.equal(cueAt(cues, 4.75), null);
  assert.equal(cueAt(cues, 6), null);
});

test('word emphasis starts on its onset, releases exclusively, and preserves breaths', () => {
  assert.equal(wordAt(words, 1.099), -1);
  assert.equal(wordAt(words, 1.1), 0);
  assert.equal(wordAt(words, 1.4), 1);
  assert.equal(wordAt(words, 1.7), -1);
  assert.equal(wordAt(words, 1.99), -1);
  assert.equal(wordAt(words, 2), 2);
  assert.equal(wordAt(words, 2.5), -1);
});

test('measured features interpolate within source time and become neutral outside it', () => {
  assert.deepEqual(featuresAt(features, -.01), [0, 0, 0, 0, 0]);
  assert.deepEqual(featuresAt(features, 1.01), [0, 0, 0, 0, 0]);
  assert.deepEqual(featuresAt(features, 0), features.frames[0]);
  assert.deepEqual(featuresAt(features, 1), features.frames[2]);
  featuresAt(features, .25).forEach((value, i) => assert.ok(Math.abs(value - (features.frames[0][i] + features.frames[1][i]) / 2) < 1e-12));
});

test('a backward/nonsequential seek reconstructs the same story and feature state', async () => {
  const signal = [.45, .8, .4, .2, .1];
  const lyrics = JSON.parse(await readFile(dataPath, 'utf8')), options = {cues: lyrics.cues};
  const original = frameState(63.25, signal, options);
  frameState(235, signal, options); frameState(121.2, signal, options); frameState(0, signal, options);
  assert.deepEqual(frameState(63.25, signal, options), original);
  assert.equal(frameState(40, signal, options).door, 0);
  assert.equal(frameState(245, signal, options).door, 1);
  assert.equal(frameState(40, signal, options).community, 0);
});

test('disabling measured effects preserves the story state and lyric-independent clock', () => {
  const signal = [.45, .8, .4, .2, .1];
  const normal = frameState(235, signal), simple = frameState(235, signal, {effects: false, reduced: true});
  for (const key of ['low', 'mid', 'high', 'attack']) assert.equal(simple[key], 0);
  for (const key of ['t', 'door', 'community', 'light']) assert.equal(simple[key], normal[key]);
  assert.equal(simple.reduced, true);
  assert.equal(simple.energy, normal.energy);
});

test('seeded environmental samples reproduce without wall-clock state', () => {
  const first = seedRandom(9021), second = seedRandom(9021);
  const a = Array.from({length: 32}, first), b = Array.from({length: 32}, second);
  assert.deepEqual(a, b);
  assert.ok(a.every(value => value >= 0 && value < 1));
  assert.ok(new Set(a).size > 20);
});

test('actual Warplet pose is identical on the first frame after seeks into and out of salutes', async () => {
  const bytes = await readFile(new URL('../public/assets/pr375/guardian.glb', import.meta.url));
  const gltf = await new GLTFLoader().parseAsync(bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength), '');
  const idleClip = gltf.animations.find(clip => clip.name === 'Warplet_Idle');
  const saluteClip = gltf.animations.find(clip => clip.name === 'Warplet_Torch_Salute');
  assert.ok(idleClip && saluteClip, 'The selected source must contain both authored actions.');
  const makeRig = () => {
    const root = cloneSkeleton(gltf.scene), mixer = new AnimationMixer(root);
    const idle = mixer.clipAction(idleClip).play(), salute = mixer.clipAction(saluteClip).play();
    salute.weight = 0;
    return {root, mixer, idle, salute};
  };
  const pose = (rig, time, scale) => {
    sampleGuardianPose(rig.mixer, rig.idle, rig.salute, saluteClip, time, scale);
    rig.root.updateMatrixWorld(true);
    const values = [];
    rig.root.traverse(node => values.push(...node.matrixWorld.elements));
    return values;
  };
  for (const scale of [1, .15]) {
    const sequential = makeRig();
    for (const time of [18, 21, 18, 16.2, 20, 17, 2, 19.99, 242, 247, 0, 235]) {
      const direct = pose(makeRig(), time, scale), afterSeek = pose(sequential, time, scale);
      assert.equal(afterSeek.length, direct.length);
      assert.ok(afterSeek.every((value, index) => Math.abs(value - direct[index]) < 1e-10), `First pose at ${time}s, motion scale ${scale}, must not depend on the previous action.`);
    }
  }
});

test('semantic selectors name specific lyric events and exclude similar unrelated lines', () => {
  assert.deepEqual(effectTargetsForCue('L10'), ['lamps']);
  assert.deepEqual(effectTargetsForCue('L14'), ['rain']);
  assert.deepEqual(effectTargetsForCue('L27'), ['core']);
  assert.deepEqual(effectTargetsForCue('L58'), ['door']);
  for (const id of ['L17', 'L18', 'L29', 'L33', 'L41', 'L42', 'L57', 'L1']) assert.deepEqual(effectTargetsForCue(id), [], `${id} must not trigger a similar word by keyword or partial-ID match`);
  const unrelated = [{id: 'OTHER', words: [{id: 'OTHER-W01', text: 'lamps', start: 1, end: 2}, {id: 'OTHER-W02', text: 'rain', start: 2, end: 3}, {id: 'OTHER-W03', text: 'Core', start: 3, end: 4}, {id: 'OTHER-W04', text: 'finally', start: 4, end: 5}]}];
  for (const t of [1.5, 2.5, 3.5, 4.5]) assert.deepEqual(semanticEffectsAt(unrelated, t), {lamps: 0, rain: 0, core: 0, door: 0});
});

test('chosen semantic events respond while bounded decoration never extends word focus', async () => {
  const lyrics = JSON.parse(await readFile(dataPath, 'utf8'));
  const words = lyrics.cues.flatMap(cue => cue.words);
  for (const [id, meaning, key, tail] of [['L10-W05', 'lamps', 'lamps', 1.5], ['L14-W07', 'rain', 'rain', 3], ['L31-W02', 'Core', 'core', 7]]) {
    const word = words.find(item => item.id === id);
    assert.ok(word?.text.toLowerCase().includes(meaning.toLowerCase()), `${id} must still identify the intended performed text`);
    assert.ok(semanticEffectsAt(lyrics.cues, (word.start + word.end) / 2)[key] > 0, `${id} positive response`);
    assert.ok(semanticEffectsAt([{words: [word]}], word.end + .2)[key] > 0, `${id} explicitly bounded decorative tail`);
    assert.equal(wordAt([word], word.end + .2), -1, `${id} acoustic focus remains released`);
    assert.equal(semanticEffectsAt([{words: [word]}], word.end + tail)[key], 0, `${id} decoration cleans up exactly`);
  }
  const doorCue = lyrics.cues.find(cue => cue.id === 'L58'), finallyWord = doorCue.words.find(word => word.id === 'L58-W05'), hungWord = doorCue.words.find(word => word.id === 'L58-W06');
  assert.match(finallyWord.text, /finally/i);
  assert.match(hungWord.text, /hung/i);
  assert.equal(semanticEffectsAt(lyrics.cues, finallyWord.start - .01).door, 0);
  assert.equal(semanticEffectsAt(lyrics.cues, hungWord.end).door, 1);
  assert.equal(semanticEffectsAt(lyrics.cues, 270).door, 1, 'Completed story state persists after the acoustic phrase.');
  assert.equal(semanticEffectsAt(lyrics.cues, 40).door, 0, 'Rewinding reconstructs the earlier gate state.');
});

test('every adopted word is visible at its midpoint and releases at its exact end', async () => {
  const lyrics = JSON.parse(await readFile(dataPath, 'utf8'));
  assert.ok(lyrics.cues.some(cue => cue.words.length), 'Acoustic word candidates are required for this check.');
  for (const cue of lyrics.cues) for (const [index, word] of cue.words.entries()) {
    const midpoint = (word.start + word.end) / 2;
    assert.equal(cueAt(lyrics.cues, midpoint)?.id, cue.id, `${word.id}: phrase visibility`);
    assert.equal(wordAt(cue.words, midpoint), index, `${word.id}: midpoint focus`);
    assert.notEqual(wordAt(cue.words, word.end), index, `${word.id}: exclusive release`);
    const next = cue.words[index + 1];
    if (next && next.start > word.end) assert.equal(wordAt(cue.words, (word.end + next.start) / 2), -1, `${word.id}: neutral breath`);
  }
});

test('a deliberately wrong focus span is detected by the timing validator', async () => {
  const lyrics = JSON.parse(await readFile(dataPath, 'utf8'));
  const measured = JSON.parse(await readFile(featurePath, 'utf8'));
  const cue = lyrics.cues.find(item => item.words.length);
  cue.words[0].end = cue.displayEnd + 2;
  assert.ok(validateProjectData(lyrics, measured).some(error => error.includes('outside its visible phrase')), 'Negative control must detect a word that outlives its phrase.');
});

test('the environmental spectrum validates its source and rejects a corrupted band', async () => {
  const lyrics = JSON.parse(await readFile(dataPath, 'utf8'));
  const spectrum = JSON.parse(await readFile(new URL('../data/spectrum.json', import.meta.url), 'utf8'));
  assert.deepEqual(validateSpectrum(spectrum, lyrics.source), []);
  spectrum.frames[12][8] = 256;
  assert.ok(validateSpectrum(spectrum, lyrics.source).some(error => error.includes('Invalid quantized spectrum frame')));
});

function identityFixture() {
  return {schemaVersion: 1, projectId: PROJECT_ID, previewRevision: PREVIEW_REVISION, inputDigest: 'test-identity', files: {'source/Leave It On.m4a': {sha256: LOCKED_SOURCE_SHA256, bytes: 4448680}, 'src/scene.js': {sha256: 'test-scene', bytes: 12}}};
}
function completeFixture(identity) {
  return {schemaVersion: 1, projectId: PROJECT_ID, previewRevision: PREVIEW_REVISION,
    syncReview: {complete: true, actualAudioEveryCue: true, allPerformedWords: true, independentRepeats: true, neutralGaps: true, finalRelease: true, bothFormats: true, pictureMotionVerified: true, inputDigest: identity.inputDigest, evidence: 'Synthetic test fixture only; never written as production evidence.'},
    renderAuthorization: {authorized: true, scope: 'full-production-render', projectId: PROJECT_ID, previewRevision: PREVIEW_REVISION, inputDigest: identity.inputDigest, authorizationId: 'synthetic-test-only', authorizedAt: '2026-09-27T00:00:00Z'}};
}

test('synthetic complete bindings exercise the positive branch without creating approval', () => {
  const identity = identityFixture();
  assert.deepEqual(validateProductionStatus(completeFixture(identity), identity, identity), []);
});

test('missing approval and missing frozen identity both close production', () => {
  const identity = identityFixture();
  assert.ok(validateProductionStatus(null, identity, identity).some(error => error.includes('missing')));
  assert.ok(validateProductionStatus(completeFixture(identity), identity, null).some(error => error.includes('Frozen preview identity is missing')));
  const status = completeFixture(identity); status.renderAuthorization.authorized = false;
  assert.ok(validateProductionStatus(status, identity, identity).some(error => error.includes('authorization is pending')));
});

test('incomplete listening and separate formats cannot be replaced by technical success', () => {
  const identity = identityFixture();
  for (const flag of ['complete', 'actualAudioEveryCue', 'allPerformedWords', 'independentRepeats', 'neutralGaps', 'finalRelease', 'bothFormats', 'pictureMotionVerified']) {
    const status = completeFixture(identity); status.syncReview[flag] = false;
    assert.ok(validateProductionStatus(status, identity, identity).length > 0, `${flag} must close production`);
  }
});

test('stale hashes, omitted inputs and another revision cannot authorize production', () => {
  const current = identityFixture(), frozen = structuredClone(current), status = completeFixture(current);
  frozen.files['src/scene.js'].sha256 = 'previous-scene';
  assert.ok(validateProductionStatus(status, current, frozen).some(error => error.includes('stale, missing, changed or extra')));
  const omitted = structuredClone(current); delete omitted.files['src/scene.js'];
  assert.ok(validateProductionStatus(status, current, omitted).length > 0);
  const stale = completeFixture(current); stale.renderAuthorization.inputDigest = 'previous-inputs';
  assert.ok(validateProductionStatus(stale, current, current).some(error => error.includes('Authorization is absent or stale')));
  const wrong = completeFixture(current); wrong.renderAuthorization.previewRevision = 'another-revision';
  assert.ok(validateProductionStatus(wrong, current, current).some(error => error.includes('another song or preview revision')));
});

test('even self-consistent records cannot substitute a different soundtrack', () => {
  const other = identityFixture();
  other.files['source/Leave It On.m4a'].sha256 = 'another-recording';
  assert.ok(validateProductionStatus(completeFixture(other), other, other).some(error => error.includes('differs from the locked Leave It On source')));
});

test('preview identity includes code, data, fonts, assets, original and playback audio', async () => {
  const identity = await buildIdentity(PROJECT_ROOT), names = Object.keys(identity.files);
  for (const prefix of ['src/', 'data/', 'public/fonts/', 'public/assets/']) assert.ok(names.some(name => name.startsWith(prefix)), `${prefix} must be bound`);
  for (const name of ['source/Leave It On.m4a', 'source/leave-it-on.opus.webm', 'review/index.html', 'review/style.css', 'package-lock.json']) assert.ok(identity.files[name], `${name} must be bound`);
  assert.equal(identity.files['source/Leave It On.m4a'].sha256, LOCKED_SOURCE_SHA256);
  assert.equal(identity.files['review/production-status.json'], undefined, 'Approval must not hash itself.');
  assert.equal(identity.files['review/preview-identity.json'], undefined, 'Identity must not hash itself.');
});
