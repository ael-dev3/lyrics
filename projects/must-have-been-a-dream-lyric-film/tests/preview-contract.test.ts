import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {createCanvas, loadImage} from '@napi-rs/canvas';
import {geometry} from '../src/scene.ts';
import {SHOTS, shotAt} from '../src/shots.ts';

const path = (relative: string): string => fileURLToPath(new URL(`../${relative}`, import.meta.url));
const expectedLines = [
  'It must have been a dream',
  "I couldn't tell what time it was",
  "Couldn't seem to breathe",
  'But it still felt like me',
  'At least it looked like you',
  'Remember all the things we used to do',
  "Once again, they're coming true",
  "Mr. Know-It-All, why'd you let it fall?",
  "It's a bad idea to just disappear",
  'Running towards your voice',
  'As if I even had a choice',
  'I had to see your smile',
  'Ran for what seemed like miles',
  'Walked for what seemed like days',
  'Just getting further and',
  'Further and further and further away, oh',
  "It's time to let it go",
  'Just let it be a ghost',
  'Haunting me in my sleep',
  'But first I need to know',
  'Tell me all your plans',
  'Anything that you can',
  'To keep me in, so far from you',
  'So tell me what you meant',
  "Mr. Know-It-All, why'd you let it fall?",
  "It's a bad idea to just disappear",
];

test('the full supplied lyric sequence and individual display words survive unchanged', () => {
  const transcript = readFileSync(path('source/user-transcript.txt'), 'utf8').trim().split(/\r?\n/u);
  assert.deepEqual(transcript, expectedLines);
  const timeline = JSON.parse(readFileSync(path('public/timeline.json'), 'utf8')) as {cues: {text: string; words: {text: string}[]}[]};
  assert.deepEqual(timeline.cues.map(cue => cue.text), expectedLines);
  for (const cue of timeline.cues) {
    assert.deepEqual(cue.words.map(word => word.text), cue.text.split(/\s+/u), `A word was omitted or merged in ${cue.text}`);
  }
});

test('both full-bleed reframings use only the active source picture without distortion', () => {
  assert.ok(SHOTS.length >= 60, 'Keep granular shot-level framing throughout the source');
  let next = 0;
  for (const shot of SHOTS) {
    assert.equal(shot.start, next, `Shot gap at ${shot.id}`);
    next = shot.end;
    const landscape = geometry('landscape', shot);
    const portrait = geometry('portrait', shot);
    assert.equal(landscape.w, 1920); assert.equal(landscape.h, 1080);
    assert.equal(portrait.w, 1080); assert.equal(portrait.h, 1920);
    for (const g of [landscape, portrait]) {
      assert.deepEqual(g.destination, {x: 0, y: 0, w: g.w, h: g.h});
      assert.equal(g.source.y, 204); assert.equal(g.source.h, 672);
      assert.ok(g.source.x >= 0 && g.source.x + g.source.w <= 1920);
      assert.ok(Math.abs(g.source.w / g.source.h - g.w / g.h) < 1e-9);
    }
    assert.equal(shotAt(shot.start).id, shot.id);
  }
  assert.ok(next >= 256.696599);
  const artistTitleShots = SHOTS.filter(item => item.id.startsWith('artist-title'));
  assert.ok(artistTitleShots.length >= 1 && artistTitleShots.every(shot => shot.protectSourceText), 'Artist-title intervals contain original lettering');
  for (const id of ['song-title-flash', 'source-credit-cards', 'daylight-source-credits']) {
    const shot = SHOTS.find(item => item.id === id);
    assert.ok(shot?.protectSourceText, `${id} contains original on-screen lettering`);
  }
});

test('the original-footage memory sprite contains 60 visibly changing picture tiles', async () => {
  const image = await loadImage(path('public/bridge-mid-sprite.jpg'));
  assert.equal(image.width, 8 * 960);
  assert.equal(image.height, 8 * 336);
  const canvas = createCanvas(32, 12);
  const ctx = canvas.getContext('2d');
  let previous: number[] | undefined;
  let changingPairs = 0;
  for (let index = 0; index < 60; index++) {
    ctx.drawImage(image, index % 8 * 960, Math.floor(index / 8) * 336, 960, 336, 0, 0, 32, 12);
    const pixels = ctx.getImageData(0, 0, 32, 12).data;
    const luminance: number[] = [];
    for (let p = 0; p < pixels.length; p += 4) luminance.push((pixels[p] ?? 0) * .2126 + (pixels[p + 1] ?? 0) * .7152 + (pixels[p + 2] ?? 0) * .0722);
    const prior = previous;
    if (prior) {
      const difference = luminance.reduce((sum, value, p) => sum + Math.abs(value - prior[p]!), 0) / luminance.length;
      if (difference > 1) changingPairs++;
    }
    previous = luminance;
  }
  assert.ok(changingPairs >= 50, `Only ${changingPairs} of 59 consecutive sprite tile pairs visibly change`);
});

test('the two source-derived dark-flash bridges supply visible picture in their respective crops', async () => {
  const stage = await loadImage(path('public/bridge-stage-light.jpg'));
  const face = await loadImage(path('public/bridge-blue-face.jpg'));
  for (const image of [stage, face]) {assert.equal(image.width, 1920); assert.equal(image.height, 1080);}
  const canvas = createCanvas(64, 36), ctx = canvas.getContext('2d');
  for (const format of ['landscape', 'portrait'] as const) {
    const g = geometry(format, shotAt(20));
    const image = format === 'landscape' ? face : stage;
    const x = format === 'landscape' ? 365 : g.source.x;
    ctx.drawImage(image, x, g.source.y, g.source.w, g.source.h, 0, 0, 64, 36);
    const pixels = ctx.getImageData(0, 0, 64, 36).data;
    let luminance = 0;
    for (let p = 0; p < pixels.length; p += 4) luminance += (pixels[p] ?? 0) * .2126 + (pixels[p + 1] ?? 0) * .7152 + (pixels[p + 2] ?? 0) * .0722;
    assert.ok(luminance / (pixels.length / 4) > 25, `${format} stage bridge still appears too dark for the flash`);
  }
});
