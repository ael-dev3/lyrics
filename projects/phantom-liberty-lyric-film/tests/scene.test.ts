import assert from 'node:assert/strict';
import test from 'node:test';
import {createHash} from 'node:crypto';
import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {createCanvas, GlobalFonts} from '@napi-rs/canvas';
import {COMPOSITION, cueOpacity, getReadingCues, initScene, layoutCue} from '../src/scene.ts';
import {sourceActive, tokenActive, vocalTrack, type FeatureData, type Timeline} from '../src/model.ts';

const root = resolve(fileURLToPath(new URL('..', import.meta.url)));
const read = <T>(path: string): T => JSON.parse(readFileSync(resolve(root, path), 'utf8')) as T;
const timeline = read<Timeline>('public/timeline.json');
const features = read<FeatureData>('public/audio-features.json');
const recording = read<{sourceSha256: string; sampleRate: number; productionRenderApproved: boolean; decodedSampleCount: number;
  picture: {frameRate: {numerator: number; denominator: number}; frameCount: number}}>('source/recording.json');
const phrases = read<Array<{id: string; vocalTrack: 'lead' | 'backing'; words: Array<{word: string}>}>>('source/phrases.json');
const normalize = (word: string): string => word.normalize('NFKC').replace(/[‘’]/g, "'").replace(/[^a-z0-9']/gi, '').toLowerCase();
assert.ok(GlobalFonts.registerFromPath(resolve(root, 'public/fonts/SpaceGrotesk.ttf'), 'PhantomGrotesk'));
initScene(timeline, features);

test('complete English lead and all sixteen independently timed backing phrases remain present', () => {
  assert.deepEqual(timeline.cues.map(cue => cue.id).sort(), phrases.map(phrase => phrase.id).sort());
  assert.equal(timeline.cues.filter(cue => vocalTrack(cue) === 'backing').length, 16);
  for (const phrase of phrases) {
    const cue = timeline.cues.find(cue => cue.id === phrase.id); assert.ok(cue);
    assert.equal(vocalTrack(cue), phrase.vocalTrack);
    assert.equal(cue.sourceLanguage, 'en');
    assert.deepEqual(cue.lanes.map(lane => lane.language), ['en']);
    assert.deepEqual(cue.words.map(word => normalize(word.text)), phrase.words.map(word => normalize(word.word)));
  }
  const labels = timeline.cues.filter(cue => vocalTrack(cue) === 'lead').map(cue => cue.words.map(word => normalize(word.text)).join(' '));
  assert.equal(labels[0], 'found out');
  assert.ok(labels.includes('i found out'));
  assert.equal(labels.filter(label => label === 'you have to play').length, 2);
  assert.equal(labels.filter(label => label === "you can't escape").length, 2);
  assert.ok(labels.includes('pleasures and rage combined'));
  assert.ok(labels.includes('pleasures are long forgotten'));
});
test('actual recording identity and unchanged measured features use the native rational source clock', () => {
  const sourceHash = createHash('sha256').update(readFileSync(resolve(root, 'public/source.mp4'))).digest('hex');
  assert.equal(sourceHash, recording.sourceSha256);
  assert.equal(timeline.sourceSha256, sourceHash); assert.equal(features.sourceSha256, sourceHash);
  assert.equal(timeline.sampleRate, recording.sampleRate);
  assert.deepEqual(features.analysis.frameRate, recording.picture.frameRate);
  assert.equal(features.rows.length, features.analysis.frameCount);
  assert.ok(features.rows.length >= recording.picture.frameCount);
  assert.ok(Math.abs(timeline.sourceDuration - recording.decodedSampleCount / recording.sampleRate) < 1 / recording.sampleRate);
  const mismatch = structuredClone(features); mismatch.sourceSha256 = '0'.repeat(64);
  assert.throws(() => initScene(timeline, mismatch), /Measured audio identity/);
  initScene(timeline, features);
});
test('each actual word is fully readable and meaning-focused from its first through final active sample', () => {
  for (const cue of timeline.cues) for (const word of cue.words) {
    const samples = [word.startSample, word.startSample + Math.floor((word.endSample - word.startSample) / 2), word.endSample - 1];
    for (const sample of samples) {
      const time = sample / timeline.sampleRate;
      assert.equal(sourceActive(word, time, timeline.sampleRate), true, word.id);
      assert.equal(cueOpacity(cue, time), 1, word.id);
      const owners = cue.lanes[0]!.tokens.filter(token => token.sourceIndices.includes(word.sourceIndex));
      assert.ok(owners.length > 0, word.id);
      for (const token of owners) assert.equal(tokenActive(token, cue.words, time, timeline.sampleRate), true, token.id);
    }
    assert.equal(sourceActive(word, word.endSample / timeline.sampleRate, timeline.sampleRate), false, word.id);
  }
});
test('all reading blocks fit both layouts with spectrum body and portrait platform clearance', () => {
  for (const format of ['landscape', 'portrait'] as const) {
    const p = COMPOSITION[format], canvas = createCanvas(p.width, p.height), ctx = canvas.getContext('2d') as unknown as CanvasRenderingContext2D;
    const margin = format === 'portrait' ? 60 : 80, spectrumTop = p.spectrumBaseline - p.travel - 2;
    for (const cue of timeline.cues) {
      const layout = layoutCue(ctx, cue, format);
      assert.ok(layout.top >= 0 && layout.bottom + 8 <= spectrumTop, `${cue.id}/${format}`);
      if (format === 'portrait') assert.ok(layout.bottom < p.height - 180, cue.id);
      for (const slot of layout.slots) assert.ok(slot.x >= margin && slot.x + slot.width <= p.width - margin, `${slot.token.id}/${format}`);
    }
  }
});
test('full backing phrases preserve their stable block through simultaneous lead ownership', () => {
  const leads = timeline.cues.filter(cue => vocalTrack(cue) === 'lead'), backing = timeline.cues.filter(cue => vocalTrack(cue) === 'backing');
  let overlaps = 0;
  for (const a of leads) for (const b of backing) {
    const start = Math.max(a.start, b.start), end = Math.min(a.end, b.end); if (start >= end) continue;
    overlaps++;
    const time = (start + end) / 2, visibleIds = getReadingCues(time).map(cue => cue.id);
    assert.ok(visibleIds.includes(a.id) && visibleIds.includes(b.id), `${a.id}/${b.id}`);
    assert.equal(cueOpacity(a, time), 1); assert.equal(cueOpacity(b, time), 1);
    for (const format of ['landscape', 'portrait'] as const) {
      const p = COMPOSITION[format], ctx = createCanvas(p.width, p.height).getContext('2d') as unknown as CanvasRenderingContext2D;
      const leadLayout = layoutCue(ctx, a, format), backingLayout = layoutCue(ctx, b, format);
      assert.ok(leadLayout.bottom + 12 <= backingLayout.top, `${a.id}/${b.id}/${format}`);
      assert.equal(Math.max(...backingLayout.slots.map(slot => slot.y)), p.backingBaseline);
    }
  }
  assert.ok(overlaps > 0, 'The selected recording must preserve actual simultaneous vocal bodies.');
});
test('preview commands cannot silently encode a full lyric film or reuse production permission', () => {
  const pkg = read<{scripts: Record<string, string>}>('package.json');
  assert.equal(recording.productionRenderApproved, false);
  assert.match(pkg.scripts.preview ?? '', /preview-server/);
  assert.doesNotMatch(`${pkg.scripts.preview}\n${pkg.scripts.build}`, /ffmpeg|render-production|capture|encode/);
});
