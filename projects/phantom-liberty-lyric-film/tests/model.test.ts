import assert from 'node:assert/strict';
import test from 'node:test';
import {sourceActive, sourceSample, tokenActive, validateTimeline, visibleCue, visibleCues, type Cue, type Timeline, type VocalTrack} from '../src/model.ts';

function cue(id: string, track: VocalTrack, start: number, end: number): Cue {
  return {id, label: id, sourceLanguage: 'en', vocalTrack: track, start, end,
    visibleStart: start, fullOpacityEnd: end, visibleEnd: end + .1,
    words: [{id: `${id}-w0`, text: id, sourceIndex: 0, startSample: Math.round(start * 48000), endSample: Math.round(end * 48000)}],
    lanes: [{language: 'en', tokens: [{id: `${id}-t0`, text: id, sourceIndices: [0], rationale: 'Original English word owns its acoustic event.'}]}]};
}
function timeline(): Timeline {
  return {schemaVersion: 2, revision: 'test-v1', sampleRate: 48000, sourceSha256: 'a'.repeat(64), sourceDuration: 10,
    cues: [cue('lead-1', 'lead', 1, 2), cue('backing-1', 'backing', 1.5, 3), cue('lead-2', 'lead', 2.1, 2.8)]};
}
test('overlapping complete lead/backing phrases retain independent ownership', () => {
  const map = timeline(); validateTimeline(map);
  assert.deepEqual(visibleCues(map, 1.75).map(cue => cue.id), ['lead-1', 'backing-1']);
  assert.equal(visibleCue(map, 1.75)?.id, 'lead-1');
  assert.equal(visibleCue(map, 1.75, 'backing')?.id, 'backing-1');
  assert.equal(visibleCue(map, 2.9)?.id, 'backing-1');
  assert.equal(sourceActive(map.cues[1]!.words[0]!, 2.9, map.sampleRate), true);
});
test('sample-based focus is inclusive at entry, exclusive at release', () => {
  const word = {id: 'w', text: 'way', sourceIndex: 0, startSample: 90000, endSample: 99000};
  assert.equal(sourceActive(word, 90000 / 48000, 48000), true);
  assert.equal(sourceActive(word, 99000 / 48000, 48000), false);
  assert.equal(sourceActive(word, 89999.75 / 48000, 48000), false);
  assert.equal(sourceActive(word, 98999.75 / 48000, 48000), true);
  assert.equal(sourceSample(90000.25 / 48000, 48000), 90000.25);
});
test('semantic unions release during unrelated intervening words', () => {
  const words = [0, 1, 2].map(index => ({id: `w${index}`, text: `${index}`, sourceIndex: index,
    startSample: index * 48000, endSample: (index + 1) * 48000}));
  const token = {id: 'union', text: 'union', sourceIndices: [0, 2], rationale: 'Two contributors, not a broad enclosing span.'};
  assert.equal(tokenActive(token, words, .5, 48000), true);
  assert.equal(tokenActive(token, words, 1.5, 48000), false);
  assert.equal(tokenActive(token, words, 2.5, 48000), true);
});
test('same-voice collision is rejected rather than clipping its held word', () => {
  const map = timeline(); map.cues[2]!.visibleStart = 1.99;
  assert.throws(() => validateTimeline(map), /Colliding lead cues/);
});
test('a line cannot become faint or disappear during its performed ending', () => {
  const map = timeline(); map.cues[0]!.fullOpacityEnd = 1.8;
  assert.throws(() => validateTimeline(map), /Invalid reading interval/);
});
test('every visible English meaning references existing acoustic source events', () => {
  const map = timeline(); map.cues[1]!.lanes[0]!.tokens[0]!.sourceIndices = [9];
  assert.throws(() => validateTimeline(map), /Missing source contributor/);
});
test('identity, duplicate words and fractional source samples are rejected', () => {
  const badSample = timeline(); badSample.cues[0]!.words[0]!.startSample += .5;
  assert.throws(() => validateTimeline(badSample), /Invalid word/);
  const duplicate = timeline(); duplicate.cues[1]!.words[0]!.id = duplicate.cues[0]!.words[0]!.id;
  assert.throws(() => validateTimeline(duplicate), /Invalid word/);
  const wrongLanguage = timeline(); (wrongLanguage.cues[1] as unknown as {sourceLanguage: string}).sourceLanguage = 'ja';
  assert.throws(() => validateTimeline(wrongLanguage), /Invalid vocal ownership/);
  const noRate = timeline(); noRate.sampleRate = 0;
  assert.throws(() => validateTimeline(noRate), /Invalid source-clock timeline/);
});
