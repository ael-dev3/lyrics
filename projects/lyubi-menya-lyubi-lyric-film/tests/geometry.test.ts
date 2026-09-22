import {readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {GlobalFonts, createCanvas} from '@napi-rs/canvas';
import {frameAt, visibleCue} from '../src/focus.ts';
import {parseData} from '../src/schema.ts';
import type {Format} from '../src/schema.ts';
import type {Box, Layouts} from '../src/layout-types.ts';

const readJson = (path: string) => JSON.parse(readFileSync(new URL(path, import.meta.url), 'utf8'));
const data = parseData(readJson('../src/cues.json'));
const layouts = readJson('../src/layout.json') as Layouts;
const spectrum: unknown = readJson('../public/science.json');
const media = readJson('../source/media-manifest.json') as {audio: {sampleRate: number; decodedSampleCount: number; presentedDuration: number; sha256: string}};
const analysis = readJson('../analysis/manifest.json') as {sampleRate: number; sampleCount: number; frames: number; fps: number; sourceAudioSha256: string; bands: unknown[]};
const planned = readJson('../source/text-and-mapping.json') as {id: string; ru: {id: string; text: string}[]; en: {id: string; text: string; sourceIds: string[]; focusSourceIds?: string[]; focusGroup?: string}[]}[];
const dimensions: Record<Format, [number, number]> = {landscape: [1920, 1080], portrait: [1080, 1920]};

assert.ok(GlobalFonts.registerFromPath(fileURLToPath(new URL('../public/fonts/Oswald-Medium.ttf', import.meta.url)), 'LyubiGeometryAudit'), 'The frozen lyric font must load; fallback metrics cannot validate this layout');
const canvas = createCanvas(1920, 1920);
const context = canvas.getContext('2d');
context.fontKerning = 'none';

test('timing, spectrum analysis and media provenance share the locked presentation clock', () => {
  assert.equal(data.sampleRate, media.audio.sampleRate);
  assert.equal(data.sampleRate, analysis.sampleRate);
  assert.equal(data.sampleCount, media.audio.decodedSampleCount);
  assert.equal(data.sampleCount, analysis.sampleCount);
  assert.equal(data.duration, media.audio.presentedDuration);
  assert.equal(data.audioSha256, media.audio.sha256);
  assert.equal(data.audioSha256, analysis.sourceAudioSha256);
  assert.match(data.audioSha256, /^[a-f0-9]{64}$/);
  assert.equal(data.fps, 60);
  assert.equal(analysis.fps, data.fps);
  assert.equal(data.frames, Math.ceil(data.duration * data.fps), 'Presentation frame count must cover the container duration, not the padded decoded tail');
  assert.equal(analysis.frames, data.frames);
  assert.ok((data.frames - 1) / data.fps < data.duration);
  assert.ok(data.frames / data.fps >= data.duration);
  const tailSamples = data.sampleCount - data.duration * data.sampleRate;
  assert.ok(tailSamples >= 0 && tailSamples < 1024, 'This AAC source has less than one decoded AAC frame beyond its presented duration');
});

test('every presentation frame has 64 finite spectrum measurements', () => {
  assert.ok(Array.isArray(spectrum));
  assert.equal(spectrum.length, data.frames, 'A short feature file must not silently repeat its last row');
  assert.equal(analysis.bands.length, 64);
  let minimum = Infinity;
  let maximum = -Infinity;
  for (let frame = 0; frame < spectrum.length; frame++) {
    const row: unknown = spectrum[frame];
    assert.ok(Array.isArray(row), `Spectrum frame ${frame} is missing`);
    assert.equal(row.length, 64, `Spectrum frame ${frame} has an incomplete band set`);
    for (let band = 0; band < row.length; band++) {
      const value: unknown = row[band];
      assert.ok(typeof value === 'number' && Number.isFinite(value), `Non-finite dBFS value at frame ${frame}, band ${band}`);
      minimum = Math.min(minimum, value);
      maximum = Math.max(maximum, value);
    }
  }
  assert.ok(maximum - minimum > 20, 'An entirely missing or constant feature field cannot support the measured visualizer');
});

test('timed data preserves every reviewed text and correspondence identity', () => {
  assert.deepEqual(data.cues.map(cue => cue.id), planned.map(cue => cue.id));
  for (let index = 0; index < planned.length; index++) {
    const expected = planned[index]!;
    const actual = data.cues[index]!;
    assert.deepEqual(actual.ru.map(({id, text}) => ({id, text})), expected.ru, `${actual.id}: stale or altered Russian text`);
    assert.deepEqual(actual.en, expected.en, `${actual.id}: timing generation must preserve the reviewed English map`);
  }
});

test('all source intervals and visible cues stay inside the presentation and preserve every active word frame', () => {
  const presentedEndSample = Math.ceil(data.duration * data.sampleRate);
  let previousVisibleEnd = 0;
  let previousCueEnd = 0;
  const allWordIds = new Set<string>();
  for (const cue of data.cues) {
    assert.ok(cue.ru.length > 0 && cue.en.length > 0, `${cue.id}: both languages are required`);
    for (const [name, value] of Object.entries({start: cue.startSample, end: cue.endSample, visibleFrom: cue.visibleFrom, visibleUntil: cue.visibleUntil})) {
      assert.ok(Number.isSafeInteger(value), `${cue.id}: ${name} is not a sample index`);
      assert.ok(value >= 0 && value <= presentedEndSample, `${cue.id}: ${name} exceeds the presented soundtrack`);
    }
    assert.ok(cue.startSample < cue.endSample);
    assert.ok(cue.visibleFrom <= cue.startSample && cue.visibleUntil >= cue.endSample, `${cue.id}: lyrics disappear during their source events`);
    assert.ok(cue.visibleFrom >= previousVisibleEnd, `${cue.id}: overlapping visible cues would be hidden by first-match lookup`);
    assert.ok(cue.startSample >= previousCueEnd, `${cue.id}: source cues are out of order or overlap`);
    assert.equal(cue.startSample, Math.min(...cue.ru.map(word => word.startSample)));
    assert.equal(cue.endSample, Math.max(...cue.ru.map(word => word.endSample)));
    let previousWordEnd = cue.startSample;
    for (const word of cue.ru) {
      assert.ok(!allWordIds.has(word.id), `Repeated performance reused source identity ${word.id}`);
      allWordIds.add(word.id);
      assert.ok(Number.isSafeInteger(word.startSample) && Number.isSafeInteger(word.endSample));
      assert.ok(word.startSample >= previousWordEnd, `${word.id}: source intervals overlap or run backward`);
      assert.ok(word.startSample < word.endSample && word.endSample <= cue.endSample && word.endSample <= presentedEndSample);
      assert.ok(Number.isFinite(word.candidateSpreadMs) && word.candidateSpreadMs >= 0, `${word.id}: invalid uncertainty data`);
      const first = frameAt(word.startSample, data.sampleRate, data.fps);
      const end = frameAt(word.endSample, data.sampleRate, data.fps);
      assert.ok(first >= 0 && first < end && end <= data.frames, `${word.id}: event has no valid visible frame`);
      for (let frame = first; frame < end; frame++) {
        assert.equal(visibleCue(data, frame)?.id, cue.id, `${word.id}: active frame ${frame} loses its intended line`);
      }
      previousWordEnd = word.endSample;
    }
    previousVisibleEnd = cue.visibleUntil;
    previousCueEnd = cue.endSample;
  }
});

type InkBox = {left: number; right: number; top: number; bottom: number};
function inkBox(box: Box): InkBox {
  const metrics = context.measureText(box.text);
  assert.ok(Math.abs(metrics.width - box.width) <= 0.02, `${box.id}: stored width no longer matches the frozen font`);
  return {left: box.x - metrics.actualBoundingBoxLeft, right: box.x + metrics.actualBoundingBoxRight, top: box.y - metrics.actualBoundingBoxAscent, bottom: box.y + metrics.actualBoundingBoxDescent};
}

for (const format of ['landscape', 'portrait'] as const) {
  test(`${format}: every Russian and English word fits in at most two non-overlapping rows`, () => {
    const layout = layouts[format];
    assert.deepEqual([layout.width, layout.height], dimensions[format]);
    for (const value of [layout.fontSize, layout.lineHeight, layout.safeX]) assert.ok(Number.isFinite(value) && value > 0);
    assert.ok(layout.lineHeight >= layout.fontSize, 'Line spacing must accommodate the same full-size font in both languages');
    assert.deepEqual(Object.keys(layout.cues).sort(), data.cues.map(cue => cue.id).sort(), 'Every active cue must have geometry, with no stale cue entries');
    context.font = `500 ${layout.fontSize}px LyubiGeometryAudit`;

    for (const cue of data.cues) {
      const geometry = layout.cues[cue.id]!;
      const languageInk: Record<'ru' | 'en', InkBox[]> = {ru: [], en: []};
      for (const language of ['ru', 'en'] as const) {
        const boxes = geometry[language];
        assert.deepEqual(boxes.map(({id, text}) => ({id, text})), cue[language].map(({id, text}) => ({id, text})), `${format} ${cue.id} ${language}: dropped, duplicated or reordered words`);
        const rowCount = language === 'ru' ? geometry.ruRows : geometry.enRows;
        assert.ok(Number.isInteger(rowCount) && rowCount >= 1 && rowCount <= 2, `${format} ${cue.id} ${language}: more than two rows`);
        const rows = new Map<number, Box[]>();
        for (const box of boxes) {
          for (const value of [box.x, box.y, box.width]) assert.ok(Number.isFinite(value), `${box.id}: non-finite geometry`);
          assert.ok(box.width > 0);
          assert.ok(box.x >= layout.safeX && box.x + box.width <= layout.width - layout.safeX, `${format} ${box.id}: advance box escapes horizontal safe area`);
          const ink = inkBox(box);
          for (const value of Object.values(ink)) assert.ok(Number.isFinite(value));
          assert.ok(ink.left >= layout.safeX && ink.right <= layout.width - layout.safeX, `${format} ${box.id}: visible glyph escapes horizontal safe area`);
          assert.ok(ink.top >= 0 && ink.bottom <= layout.height, `${format} ${box.id}: visible glyph clips vertically`);
          languageInk[language].push(ink);
          rows.set(box.y, [...(rows.get(box.y) ?? []), box]);
        }
        assert.equal(rows.size, rowCount, `${format} ${cue.id} ${language}: row metadata disagrees with actual baselines`);
        const orderedRows = [...rows.entries()].sort(([a], [b]) => a - b);
        let previousBottom = -Infinity;
        for (let rowIndex = 0; rowIndex < orderedRows.length; rowIndex++) {
          const [baseline, row] = orderedRows[rowIndex]!;
          if (rowIndex > 0) assert.ok(Math.abs(baseline - orderedRows[rowIndex - 1]![0] - layout.lineHeight) <= 0.01, 'Rows must preserve their declared stable line spacing');
          const inks = row.map(inkBox);
          const top = Math.min(...inks.map(ink => ink.top));
          const bottom = Math.max(...inks.map(ink => ink.bottom));
          assert.ok(top - previousBottom >= layout.fontSize * 0.08, `${format} ${cue.id} ${language}: glyphs collide across rows`);
          for (let index = 1; index < row.length; index++) {
            assert.ok(row[index]!.x > row[index - 1]!.x);
            assert.ok(inks[index]!.left - inks[index - 1]!.right >= layout.fontSize * 0.02, `${format} ${cue.id}: adjacent word glyphs collide`);
          }
          previousBottom = bottom;
        }
      }
      const russianBottom = Math.max(...languageInk.ru.map(ink => ink.bottom));
      const englishTop = Math.min(...languageInk.en.map(ink => ink.top));
      assert.ok(englishTop - russianBottom >= layout.fontSize * 0.3, `${format} ${cue.id}: the two full-size language lanes collide`);
    }
  });
}
