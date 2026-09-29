import {test} from 'node:test';
import assert from 'node:assert/strict';
import {INPUTS, validateGate, type GateFacts} from '../scripts/render-gate.ts';
import {SONG} from '../src/song.ts';

const facts: GateFacts = {inputs: Object.fromEntries(INPUTS.map((p, i) => [p, `h${i}`])), lyricsSha256: 'lyr', revision: 'preview-v1', cueIds: ['L01', 'L02']};
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
