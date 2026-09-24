import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {test} from 'node:test';
import {fileURLToPath} from 'node:url';
import {activeSourceIds, activeTargetIndices, validateTimeline, visibleLineAt} from '../src/model.ts';
import type {Timeline} from '../src/model.ts';

const timeline = JSON.parse(readFileSync(fileURLToPath(new URL('../src/timeline.json', import.meta.url)), 'utf8')) as Timeline;
const seconds = (sample: number): number => sample / timeline.sampleRate;
const line = (id: string) => timeline.lines.find(value => value.id === id)!;

test('held Ah releases during the actual pause before paso', () => {
  const opening = line('L01');
  assert.ok(Math.abs(seconds(opening.es[0]!.endSample) - 18.74) < 0.001);
  assert.ok(seconds(opening.es[1]!.startSample) > 20.6);
  assert.equal(activeSourceIds(opening, Math.round(19.5 * timeline.sampleRate)).size, 0);
});

test('second refrain hands off before Pensé and shows its first word', () => {
  assert.ok(seconds(line('L16').es.at(-1)!.endSample) <= 137.5);
  assert.equal(visibleLineAt(timeline, 137.76)?.id, 'L17');
  assert.equal(visibleLineAt(timeline, 154.9)?.id, 'L21');
  assert.ok(activeSourceIds(line('L21'), Math.round(154.9 * timeline.sampleRate)).has('L21-W01'));
});

test('English receives complete meaning without fabricated separate timing', () => {
  const care = line('L10');
  const caring = activeTargetIndices(care, new Set(['L10-W01']));
  assert.deepEqual([...caring].map(index => care.en[index]!.text), ['To', 'care', 'for', 'you']);
  const waste = line('L04');
  const losing = activeTargetIndices(waste, new Set(['L04-W05']));
  assert.deepEqual([...losing].map(index => waste.en[index]!.text), ["I'm", 'wasting']);
});

test('repeated lines have independent source times and coda has no invented lyric', () => {
  assert.notEqual(line('L01').es[0]!.startSample, line('L03').es[0]!.startSample);
  assert.equal(visibleLineAt(timeline, 190), null);
});

test('overlapping line visibility fails validation', () => {
  const changed: Timeline = structuredClone(timeline);
  changed.lines[15]!.visibleUntilSample = changed.lines[16]!.visibleFromSample + 1;
  assert.throws(() => validateTimeline(changed), /overlap/);
});
