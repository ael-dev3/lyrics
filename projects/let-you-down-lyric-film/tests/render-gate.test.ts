import {test} from 'node:test';
import assert from 'node:assert/strict';
import {INPUTS, validateGate, type GateFacts} from '../scripts/render-gate.ts';
import {SONG} from '../src/song.ts';

const facts: GateFacts = {inputs: Object.fromEntries(INPUTS.map((p, i) => [p, `h${i}`])), lyricsSha256: 'lyr', revision: 'preview-v1', cueIds: ['L01', 'L02'], timingSha256: 'timing'};
const review = () => ({song: SONG, revision: 'preview-v1', inputHashes: {...facts.inputs}, lyricsSha256: 'lyr', status: 'complete', actualAudio: 'complete', fullCoverage: 'complete',
  wordTiming: 'complete', lyricText: 'complete', sourceMotion: 'complete', unresolved: [], formats: ['landscape', 'portrait'], speeds: ['normal', 'reduced'], cueIds: ['L01', 'L02']});
const auth = () => ({song: SONG, revision: 'preview-v1', inputHashes: {...facts.inputs}, lyricsSha256: 'lyr', authorized: true, previewReviewed: true, scope: 'full-length landscape and portrait masters'});

test('gate passes only for a complete, current review and authorization', () => {
  assert.doesNotThrow(() => validateGate(review(), auth(), facts));
});
test('gate refuses every stale or incomplete case', () => {
  const cases: [string, () => void][] = [
    ['no authorization', () => validateGate(review(), {...auth(), authorized: false}, facts)],
    ['preview not reviewed', () => validateGate(review(), {...auth(), previewReviewed: false}, facts)],
    ['other song', () => validateGate({...review(), song: 'other'}, auth(), facts)],
    ['other revision', () => validateGate(review(), {...auth(), revision: 'preview-v0'}, facts)],
    ['changed input byte', () => validateGate({...review(), inputHashes: {...facts.inputs, 'src/scene.ts': 'changed'}}, auth(), facts)],
    ['missing input hash', () => {const h: Record<string, string> = {...facts.inputs}; delete h['public/timeline.json']; validateGate(review(), {...auth(), inputHashes: h}, facts);}],
    ['different lyric text', () => validateGate(review(), auth(), {...facts, lyricsSha256: 'other'})],
    ['lyric file missing', () => validateGate(review(), auth(), {...facts, lyricsSha256: null})],
    ['listening incomplete', () => validateGate({...review(), actualAudio: 'partial'}, auth(), facts)],
    ['unresolved item', () => validateGate({...review(), unresolved: ['L02 onset']}, auth(), facts)],
    ['one format only', () => validateGate({...review(), formats: ['landscape']}, auth(), facts)],
    ['normal speed only', () => validateGate({...review(), speeds: ['normal']}, auth(), facts)],
    ['a cue unreviewed', () => validateGate({...review(), cueIds: ['L01']}, auth(), facts)],
    ['picture motion unchecked', () => validateGate({...review(), sourceMotion: 'pending'}, auth(), facts)],
  ];
  for (const [name, run] of cases) assert.throws(run, Error, name);
});

// Scoped production decision: the owner accepted preview-v0 and directed one
// scene change; the timeline differs only by its revision label.
const accepted = {...facts.inputs, 'src/scene.ts': 'v0-scene', 'review/client.js': 'v0-client', 'public/timeline.json': 'v0-timeline'};
const scoped = () => ({song: SONG, revision: 'preview-v1', inputHashes: {...facts.inputs}, lyricsSha256: 'lyr', status: 'owner-approved-preview',
  method: 'Overall acceptance of the presented preview-v0, then an explicit render instruction with one requested change', acceptedRevision: 'preview-v0',
  acceptedInputHashes: accepted, acceptedTimingSha256: 'timing', ownerDirectedChanges: [{change: 'milder flames', inputs: ['src/scene.ts', 'review/client.js']}],
  unresolved: [], cueIds: ['L01', 'L02'], actualAudio: null, wordTiming: null});
const scopedAuth = () => ({...auth(), basis: 'owner-approved-preview', acceptedRevision: 'preview-v0'});

test('gate passes a scoped owner-approved preview bound to its accepted identity', () => {
  assert.doesNotThrow(() => validateGate(scoped(), scopedAuth(), facts));
});
test('gate refuses scoped acceptance that drifts beyond the owner-directed change', () => {
  const cases: [string, () => void][] = [
    ['undeclared changed input', () => validateGate({...scoped(), acceptedInputHashes: {...accepted, 'src/shots.ts': 'other'}}, scopedAuth(), facts)],
    ['timing changed', () => validateGate({...scoped(), acceptedTimingSha256: 'other-timing'}, scopedAuth(), facts)],
    ['timeline declared as a directed change', () => validateGate({...scoped(), ownerDirectedChanges: [{change: 'retime', inputs: ['public/timeline.json']}]}, scopedAuth(), facts)],
    ['directed change without a description', () => validateGate({...scoped(), ownerDirectedChanges: [{change: '', inputs: ['src/scene.ts', 'review/client.js']}]}, scopedAuth(), facts)],
    ['no stated basis', () => validateGate({...scoped(), method: ''}, scopedAuth(), facts)],
    ['accepted identity missing', () => validateGate({...scoped(), acceptedInputHashes: {}}, scopedAuth(), facts)],
    ['authorization not scoped', () => validateGate(scoped(), auth(), facts)],
    ['authorization names another acceptance', () => validateGate(scoped(), {...scopedAuth(), acceptedRevision: 'preview-x'}, facts)],
    ['unresolved item', () => validateGate({...scoped(), unresolved: ['L02 flame']}, scopedAuth(), facts)],
    ['cue missing', () => validateGate({...scoped(), cueIds: ['L01']}, scopedAuth(), facts)],
    ['current bytes differ', () => validateGate({...scoped(), inputHashes: {...facts.inputs, 'src/scene.ts': 'later'}}, scopedAuth(), facts)],
    ['not authorized', () => validateGate(scoped(), {...scopedAuth(), authorized: false}, facts)],
  ];
  for (const [name, run] of cases) assert.throws(run, Error, name);
});
