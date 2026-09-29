import {test} from 'node:test';
import assert from 'node:assert/strict';
import {SHOTS} from '../src/shots.ts';
import {CROP_W, placement, portraitCentre, shotAt, SW} from '../src/frame.ts';

test('shot map is contiguous from the first to the last source frame', () => {
  assert.equal(SHOTS[0]!.frames[0], 0);
  assert.equal(SHOTS.at(-1)!.frames[1], 6794);
  for (let i = 1; i < SHOTS.length; i++) assert.equal(SHOTS[i]!.frames[0], SHOTS[i - 1]!.frames[1], `gap before ${SHOTS[i]!.id}`);
});
test('portrait crops stay inside the source picture and never stretch it', () => {
  for (const s of SHOTS) for (const f of [0, 0.5, 0.999]) {
    const t = s.start + (s.end - s.start) * f, p = placement('portrait', s, t);
    if (p.mode === 'fit') {assert.equal(p.dst.w / p.dst.h, 16 / 9); continue;}
    assert.ok(p.src.x >= 0 && p.src.x + p.src.w <= SW + 1e-9, `${s.id} crop leaves the frame`);
    assert.ok(Math.abs(p.src.w / p.src.h - 9 / 16) < 1e-9 && p.src.w === CROP_W, `${s.id} crop aspect`);
  }
});
test('authored lettering shots use the full frame in portrait and receive no added light', () => {
  const at = (t: number) => shotAt(t);
  for (const t of [29.5, 31.5, 35.0, 89.5, 112.0, 115.0, 202.5, 223.5, 255.0, 270.0]) {
    assert.equal(at(t).portrait.mode, 'fit', `lettering at ${t}s`);
    assert.equal(at(t).protect, true, `protection at ${t}s`);
  }
});
test('panned shots ease between their authored centres', () => {
  const pan = SHOTS.find(s => s.portrait.mode === 'crop' && s.portrait.x2 !== undefined && s.end - s.start > 1)!;
  assert.ok(pan, 'at least one authored pan exists');
  if (pan.portrait.mode !== 'crop') return;
  assert.equal(portraitCentre(pan, pan.start), pan.portrait.x);
  assert.ok(Math.abs(portraitCentre(pan, pan.end) - pan.portrait.x2!) < 1e-9);
});
