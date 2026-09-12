import assert from 'node:assert/strict';
import {mkdirSync, writeFileSync} from 'node:fs';
import {buildCueFrames, cueStateAtFrame, sampleToFrame, type TimingClock} from '../src/timing.ts';

// Clock-relative synthetic cues, independent of any song duration or word timings.
let contactCases = 0, boundaryStates = 0;
for (const clock of [{sampleRate: 48000, fps: 60}, {sampleRate: 44100, fps: 60}, {sampleRate: 48000, fps: 120}] satisfies TimingClock[]) {
  const spf = clock.sampleRate / clock.fps;
  for (const fraction of [0, .125, .49, .5, .51, .875]) {
    const start = Math.round((clock.fps + fraction) * spf);
    const previousStart = start - Math.round(6 * spf), end = start + Math.round(8 * spf);
    const cues = [
      {startSample: previousStart, endSample: start, words: [{startSample: previousStart, endSample: start}], groups: [[0]]},
      {startSample: start, endSample: end, words: [{startSample: start, endSample: end}], groups: [[0]]},
      {startSample: end, endSample: end + Math.round(7 * spf), words: [{startSample: end, endSample: end + Math.round(7 * spf)}], groups: [[0]]},
    ];
    const before = JSON.stringify(cues), plan = buildCueFrames(cues, clock), contact = sampleToFrame(start, clock), release = sampleToFrame(end, clock);
    assert.equal(JSON.stringify(cues), before, 'Building presentation must not mutate sample authority');
    for (const offset of [-1, 0, 1, 2]) {
      const state = cueStateAtFrame(plan, contact + offset);
      assert(state);
      assert.equal(state.index, offset < 0 ? 0 : 1);
      assert.equal(state.opacity, 1, 'Contiguous incoming cue must be settled at contact');
      assert(state.activeWordIndices.has(0));
      boundaryStates++;
    }
    assert.equal(cueStateAtFrame(plan, release - 1)?.index, 1);
    assert.equal(cueStateAtFrame(plan, release)?.index, 2, 'Exclusive end hands off on the same rounded frame');
    assert(Math.abs(contact * spf - start) <= spf / 2 + 1e-8);
    contactCases++;
  }
  const a = Math.round(clock.sampleRate), b = a + Math.round(4 * spf), c = b + Math.round(4 * spf);
  const grouped = buildCueFrames([{startSample: a, endSample: c, words: [{startSample: a, endSample: b}, {startSample: b, endSample: c}], groups: [[0, 1]]}], clock);
  const groupContact = sampleToFrame(a, clock), groupEnd = sampleToFrame(c, clock);
  assert.deepEqual([...(cueStateAtFrame(grouped, groupContact)?.activeWordIndices ?? [])], [0, 1]);
  assert.equal(cueStateAtFrame(grouped, groupContact)?.opacity, 1, 'Normal lead must settle before onset');
  assert.equal(cueStateAtFrame(grouped, groupEnd)?.activeWordIndices.size, 0, 'No focus survives its exclusive end');
  const finalEnd = grouped[0]?.window.endFrame;
  assert(finalEnd !== undefined);
  assert.equal(cueStateAtFrame(grouped, finalEnd), undefined, 'Display end is exclusive');
  const fromZero = buildCueFrames([{startSample: 0, endSample: Math.round(6 * spf), words: [{startSample: 0, endSample: Math.round(6 * spf)}], groups: [[0]]}], clock);
  assert.equal(cueStateAtFrame(fromZero, 0)?.opacity, 1, 'An immediate vocal is visible at timeline zero');
}
assert.equal(sampleToFrame(49200), 62, 'Exact half-frame ties must not drift down through seconds conversion');
const result = {passed: true, contactCases, boundaryStates, clocks: ['48000/60', '44100/60', '48000/120'], checks: ['Sample authority immutable', 'Nearest-frame visibility and focus agree', 'Zero-lead contact is fully opaque', 'Exclusive end hands off on the same frame', 'Grouped words share contact and release', 'Normal entrance settles by contact'], limitation: 'Synthetic presentation checks do not establish acoustic alignment accuracy.'};
if (!process.argv.includes('--no-report')) {
  mkdirSync('evidence', {recursive: true});
  writeFileSync('evidence/timing-boundary-checks.json', JSON.stringify(result, null, 2));
}
console.log(JSON.stringify(result));
