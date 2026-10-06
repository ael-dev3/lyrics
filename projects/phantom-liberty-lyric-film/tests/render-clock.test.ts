import assert from 'node:assert/strict';
import test from 'node:test';
import {renderClock, sceneTimeForOutput, sourceFrameForOutput, readJson, type Recording} from '../scripts/render-production.ts';
const source = readJson<Recording>('source/recording.json');
test('the rational export clock preserves the complete original picture and AAC tail', () => {
  const clock = renderClock(source);
  assert.equal(clock.outputFrames, 20862);
  assert.equal(clock.outputEnd, 348.0477);
  assert.ok(clock.outputEnd >= clock.audioEnd && clock.outputEnd - clock.audioEnd < 1001 / 60000);
  assert.equal(sourceFrameForOutput(0, clock), 0);
  assert.equal(sourceFrameForOutput(1, clock), 0);
  assert.equal(sourceFrameForOutput(2, clock), 1);
  assert.equal(sourceFrameForOutput(4678, clock), 2339);
  for (let frame = 20856; frame < 20862; frame++) assert.equal(sourceFrameForOutput(frame, clock), 10428);
  assert.throws(() => sourceFrameForOutput(20862, clock), /outside/);
  assert.throws(() => renderClock({...source, originSeconds: .1}), /source clock/);
  assert.throws(() => renderClock({...source, decodedSampleCount: source.decodedSampleCount - 44100}), /audio tail/);
});
test('subframe scene focus advances while duplicated source pictures keep their original cadence', () => {
  let prior = -1;
  for (let frame = 0; frame < 20862; frame++) {
    const time = sceneTimeForOutput(frame);
    assert.ok(time > prior); prior = time;
    assert.ok(Math.abs(time - frame * 1001 / 60000) < 1e-12);
    assert.equal(Math.floor(time * 30000 / 1001), Math.floor(frame / 2));
  }
});
