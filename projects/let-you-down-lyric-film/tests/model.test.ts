import {test} from 'node:test';
import assert from 'node:assert/strict';
import {bindText, cueIndexAt, cueWindow, parseTimeline, type Cue} from '../src/model.ts';
import {parseLyrics} from '../src/lyrics.ts';
import {effectFor} from '../src/song.ts';

const R = 44100;
const w = (id: string, token: number, s: number, e: number, voice = 'lead', effect: string | null = null) =>
  ({id, token, voice, chars: 5, start: s, end: e, startSample: Math.round(s * R), endSample: Math.round(e * R), basis: 'test', spreadMs: 0, review: 'normal', effect});
const grid = (x: number): number => Math.round(x * R) / R;
function timeline(): Record<string, unknown> {
  return {schema: 'lyric-film/timeline-id-only/v1', song: 'x', revision: 'r', duration: 20, sampleRate: R,
    text: {sha256: 'abc', lines: 2, tokens: 4, tokensPerLine: [2, 2]},
    cues: [
      {id: 'L01', line: 1, section: 'verse-1', start: grid(1), end: grid(2.5), words: [w('L01-W01', 1, grid(1), grid(1.6)), w('L01-W02', 2, grid(1.6), grid(2.5))]},
      {id: 'L02', line: 2, section: 'verse-1', start: grid(5), end: grid(7), words: [w('L02-W01', 1, grid(5), grid(6)), w('L02-W02', 2, grid(6), grid(7), 'backing')]},
    ]};
}

test('timeline validation accepts a grid-aligned, ordered map', () => {
  assert.equal(parseTimeline(timeline()).cues.length, 2);
});
test('timeline validation rejects off-grid samples, overlaps and unknown effects', () => {
  const offGrid = timeline(); (offGrid.cues as {words: {start: number}[]}[])[0]!.words[0]!.start = 1.00001;
  assert.throws(() => parseTimeline(offGrid), /sample grid/u);
  const overlap = timeline(); (overlap.cues as {words: {end: number; endSample: number}[]}[])[0]!.words[0]!.end = grid(1.7); (overlap.cues as {words: {endSample: number}[]}[])[0]!.words[0]!.endSample = Math.round(1.7 * R);
  assert.throws(() => parseTimeline(overlap), /Overlapping/u);
  const effect = timeline(); (effect.cues as {words: {effect: string}[]}[])[0]!.words[0]!.effect = 'sparkle';
  assert.throws(() => parseTimeline(effect), /Unknown effect/u);
});
test('binding refuses a different lyric text', () => {
  const t = parseTimeline(timeline());
  const lyrics = parseLyrics('one two\nthree (four)\n');
  assert.throws(() => bindText(t, lyrics, 'different-hash'), /differs/u);
  const cues = bindText(t, lyrics, 'abc');
  assert.deepEqual(cues[1]!.words.map(x => x.text), ['three', 'four'], 'backing parentheses become typography');
  const placeholder = bindText(t, null, null);
  assert.ok(placeholder.every(q => q.words.every(x => x.norm === '')), 'placeholder mode carries no lyric text');
});
test('cue windows hand off at gap midpoints without overlap', () => {
  const cues = bindText(parseTimeline(timeline()), null, null) as Cue[];
  const [a0, a1] = cueWindow(cues, 0, 20), [b0] = cueWindow(cues, 1, 20);
  assert.ok(a0 < 1 && a1 <= b0 + 1e-9, 'first line leads in and ends before the second begins');
  assert.equal(cueIndexAt(cues, 0.7, 20), 0);
  assert.equal(cueIndexAt(cues, 4.8, 20), 1);
  assert.equal(cueIndexAt(cues, 3.6, 20), -1, 'a long instrumental gap shows no line');
});
test('effects: exact IDs with expected words; the drop only closes chorus/outro phrases', () => {
  assert.equal(effectFor('L02-W01', 'neon', 2), 'neon');
  assert.equal(effectFor('L02-W01', 'other', 2), null, 'a different text disables the effect');
  assert.equal(effectFor('L17-W06', 'flames', 17), 'flame');
  assert.equal(effectFor('L13-W06', 'down', 13), 'drop');
  assert.equal(effectFor('L18-W04', 'down', 18), null, 'the same word inside verse 2 is a negative case');
  assert.equal(effectFor('L05-W02', 'down', 5), null);
});
