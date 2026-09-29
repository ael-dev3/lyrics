import {spawn} from 'node:child_process';
import {mkdirSync, writeFileSync} from 'node:fs';
import {basename} from 'node:path';
import {createCanvas} from '@napi-rs/canvas';
import {initNative, root} from './native-host.ts';
import {assertGate} from './render-gate.ts';
import {FONT, focusFillOf, getCues, inkFor, layoutCue, SKEW} from '../src/scene.ts';
import {cueIndexAt, cueWindow, type Cue} from '../src/model.ts';
import {shotAt, placement} from '../src/frame.ts';

// Encoded-pixel word focus. For every timed word, the output frame at its
// midpoint is decoded from the finished MP4; each visible word's glyph interior
// (eroded mask, lower 40 % of the letters, clear of flame light) is classified
// as focus or rest by colour, independently of the renderer's state: an active
// word is filled opaquely with its published focus gradient (FOCUS_FILL) and
// ringed by its additive neon halo, while a resting word is a translucent
// white over the picture inside a dark readability shadow. A negative control
// re-scores the same frames expecting the NEXT word to be active, to prove the
// check can detect a one-word shift. This verifies the display against the
// frozen timing, not the acoustic truth of that timing.
//   node scripts/verify-word-focus.ts --format landscape|portrait            (production, gated)
//   node scripts/verify-word-focus.ts --proof --file P --from S --to E --format F   (placeholder proof)
const args = process.argv.slice(2), opt = (f: string): string | undefined => {const i = args.indexOf(f); return i < 0 ? undefined : args[i + 1];};
const proof = args.includes('--proof'), format = opt('--format') as 'landscape' | 'portrait';
if (format !== 'landscape' && format !== 'portrait') throw Error('--format landscape|portrait');
if (!proof) assertGate();
const file = proof ? opt('--file')! : `${root}renders/Let-You-Down-${format === 'landscape' ? 'YouTube-1920x1080' : 'TikTok-1080x1920'}-60fps.mp4`;
const firstFrame = proof ? Math.round(Number(opt('--from')) * 60) : 0, endFrame = proof ? Math.round(Number(opt('--to')) * 60) : Infinity;
const [W, H] = format === 'landscape' ? [1920, 1080] : [1080, 1920];
initNative({timelinePath: `${root}public/timeline.json`, placeholder: proof});
const cues = getCues(), duration = 283.422766;
const measure = createCanvas(W, H).getContext('2d');

type RGB = [number, number, number];
type Mask = {x: number; y: number; w: number; h: number; px: Uint8Array; ring: {xs: number[]; ys: number[]}; far: {xs: number[]; ys: number[]}; ref: RGB; halo: 'pink' | 'cyan' | 'fire'};
type Check = {word: string; frame: number; expect: 'focus' | 'rest'; negExpect: 'focus' | 'rest'; ink: number; mask: Mask; restBase: RGB; restAlpha: number};
// Resting and ink colours from the published visual brief (the renderer's
// src/scene.ts is a gated input and publishes only FOCUS_FILL): unsung
// lilac-white #f4f0fb at 82 % (backing echoes 78 %), sung white at 97 %;
// towards white memory frames both blend into dark ink #2c1a3c, and an
// active word's fill is overlaid with ink focus magenta #d43f86 at the same
// ink level.
const REST: RGB = [244, 240, 251], SUNG: RGB = [255, 255, 255], INK: RGB = [44, 26, 60], INK_FOCUS: RGB = [212, 63, 134];
const mixRgb = (a: readonly number[], b: readonly number[], f: number): RGB => [0, 1, 2].map(i => a[i]! + (b[i]! - a[i]!) * f) as RGB;
const plan = new Map<number, Check[]>();
const maskCache = new Map<string, Mask>();
function maskFor(cue: Cue, wordId: string, t: number): Mask | null {
  const shot = shotAt(t), p = placement(format, shot, t), key = `${cue.id}:${wordId}:${shot.zone}:${p.mode}`;
  const hit = maskCache.get(key); if (hit) return hit;
  const layout = layoutCue(measure as unknown as CanvasRenderingContext2D, cue, format, shot, p), pl = layout.placed.find(x => x.word.id === wordId);
  if (!pl) return null;
  const pad = Math.ceil(pl.size * 0.4), x0 = Math.floor(pl.x - pad), y0 = Math.floor(pl.y - pl.size), w = Math.ceil(pl.w + pad * 2), h = Math.ceil(pl.size * 1.2);
  const c = createCanvas(w, h), g = c.getContext('2d');
  g.fillStyle = '#fff'; g.translate(pl.x - x0, pl.y - y0); g.transform(1, 0, -SKEW, 1, 0, 0); g.font = `700 ${pl.size}px ${FONT}`; g.fillText(pl.word.text, 0, 0);
  const a = g.getImageData(0, 0, w, h).data, inside = new Uint8Array(w * h), er = Math.max(2, Math.round(pl.size * 0.035));
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) inside[y * w + x] = a[(y * w + x) * 4 + 3]! > 240 ? 1 : 0;
  const interior = (e: number, share: number): Uint8Array => {
    const out = new Uint8Array(w * h), lowBand = pl.y - y0 - pl.size * 0.8 * share; // lower part of the cap height
    for (let y = e; y < h - e; y++) for (let x = e; x < w - e; x++) {
      if (y < lowBand) continue;
      let all = 1; for (let dy = -e; dy <= e && all; dy++) for (let dx = -e; dx <= e; dx++) if (!inside[(y + dy) * w + x + dx]) {all = 0; break;}
      out[y * w + x] = all;
    }
    return out;
  };
  let px = interior(er, 0.4);
  if (px.reduce((n, v) => n + v, 0) < 60) px = interior(1, 0.7);
  // Halo ring: outside the letters, 0.03-0.12 em from their edges, within the
  // word's own span (neighbouring halos stay out), across the letter band.
  const xs: number[] = [], ys: number[] = [], r1 = Math.max(2, Math.round(pl.size * 0.03)), r2 = Math.round(pl.size * 0.12), capTop = pl.y - pl.size * 0.7;
  const ink = (x: number, y: number): boolean => x >= 0 && y >= 0 && x < w && y < h && a[(y * w + x) * 4 + 3]! > 20;
  for (let y = 0; y < h; y += 2) for (let x = 0; x < w; x += 2) {
    const X = x0 + x, Y = y0 + y;
    if (X < pl.x || X > pl.x + pl.w || Y < capTop - pl.size * 0.12 || Y > pl.y + pl.size * 0.12 || ink(x, y)) continue;
    let d = Infinity;
    for (let dy = -r2; dy <= r2; dy++) for (let dx = -r2; dx <= r2; dx++) if (ink(x + dx, y + dy)) d = Math.min(d, Math.hypot(dx, dy));
    if (d >= r1 && d <= r2) {xs.push(X); ys.push(Y);}
  }
  // Far field: bands 0.22-0.36 em above the cap line and below the baseline,
  // within the word's span. A lit ring is at least as bright as this field
  // (additive halo); a resting word's shadow darkens its ring below it.
  const fx: number[] = [], fy: number[] = [];
  for (const [ya, yb] of [[capTop - pl.size * 0.36, capTop - pl.size * 0.22], [pl.y + pl.size * 0.22, pl.y + pl.size * 0.36]] as const)
    for (let Y = Math.round(ya); Y <= Math.round(yb); Y += 2) for (let X = Math.round(pl.x); X <= Math.round(pl.x + pl.w); X += 2) {fx.push(X); fy.push(Y);}
  // Reference: the published focus gradient at the interior pixels' median depth.
  const depths: number[] = [];
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) if (px[y * w + x]) depths.push(y0 + y - pl.y);
  depths.sort((p, q) => p - q);
  const stops = focusFillOf(pl.word).map(hex => [1, 3, 5].map(k => parseInt(hex.slice(k, k + 2), 16)) as RGB);
  const at = Math.min(1, Math.max(0, ((depths[depths.length >> 1] ?? 0) + pl.size * 0.72) / (pl.size * 0.72))) * (stops.length - 1), k = Math.min(stops.length - 2, Math.floor(at));
  const ref = [0, 1, 2].map(c => stops[k]![c]! + (stops[k + 1]![c]! - stops[k]![c]!) * (at - k)) as RGB;
  const halo = pl.word.effect === 'flame' ? 'fire' : pl.word.effect === 'moon' || pl.word.voice === 'backing' ? 'cyan' : 'pink';
  const m: Mask = {x: x0, y: y0, w, h, px, ring: {xs, ys}, far: {xs: fx, ys: fy}, ref, halo}; maskCache.set(key, m); return m;
}
// Each word is checked at the middle of the part of its active span where its
// line is fully faded in (lines fade in over 0.16 s and out over 0.20 s at the
// hand-off to the next line). A word whose line never reaches full opacity
// while it is active (an overlap with the next line's first word) is listed,
// not scored.
const faded: string[] = [];
cues.forEach((cue, qi) => {
  const [a, b] = cueWindow(cues, qi, duration), lo = a + 0.16, hi = b - 0.2;
  cue.words.forEach(word => {
    const s0 = Math.max(word.start, lo), e0 = Math.min(word.end, hi);
    if (Math.ceil(s0 * 60) / 60 >= e0) {if (word.start * 60 >= firstFrame && word.start * 60 < endFrame) faded.push(word.id); return;}
    let n = Math.round(((s0 + e0) / 2) * 60);
    if (n / 60 < s0 || n / 60 >= e0) n = Math.ceil(s0 * 60);
    if (n < firstFrame || n >= endFrame) return;
    const t = n / 60, ci = cueIndexAt(cues, t, duration);
    if (ci < 0) return;
    const shown = cues[ci]!, lane = cue.words.filter(x => x.voice === word.voice), next = lane[lane.indexOf(word) + 1];
    for (const other of shown.words) {
      const mask = maskFor(shown, other.id, t); if (!mask) continue;
      const active = t >= other.start && t < other.end;
      const neg = next ? other.id === next.id || (other.id !== word.id && active) : active;
      const list = plan.get(n) ?? []; const sung = t >= other.end;
      list.push({word: other.id, frame: n, expect: active ? 'focus' : 'rest', negExpect: neg ? 'focus' : 'rest', ink: inkFor(format, t), mask,
        restBase: sung ? SUNG : REST, restAlpha: other.voice === 'backing' ? 0.78 : sung ? 0.97 : 0.82}); plan.set(n, list);
    }
  });
});
const wanted = [...plan.keys()].sort((a, b) => a - b), last = wanted.at(-1) ?? 0;
function median(frame: Buffer, xs: number[], ys: number[]): [number, number, number] | null {
  const rs: number[] = [], gs: number[] = [], bs: number[] = [];
  for (let i = 0; i < xs.length; i++) {
    const X = xs[i]!, Y = ys[i]!; if (X < 0 || Y < 0 || X >= W || Y >= H) continue;
    const k = (Y * W + X) * 3; rs.push(frame[k]!); gs.push(frame[k + 1]!); bs.push(frame[k + 2]!);
  }
  if (rs.length < 12) return null;
  const med = (v: number[]): number => v.sort((a, b) => a - b)[v.length >> 1]!;
  return [med(rs), med(gs), med(bs)];
}
// Focus signature. The renderer's colours are predictable from the design and
// the frame's measured ink level, so the lower glyph interior is compared with
// two predictions:
// - focus: the published gradient at that depth, overlaid with ink magenta
//   at the ink level;
// - rest: the resting colour (blended towards ink at the same level) over the
//   word's own surroundings, measured in bands above and below it.
// Focus needs the interior within 18 RGB units of its prediction and closer
// to it than to the rest prediction. Below half ink, the ring 0.03-0.12 em
// outside the letters must also carry the halo: its hue, and either bright or
// at least as bright as the surroundings. A resting word over a look-alike
// hot-pink picture fails there, because its shadowed ring is darker than its
// surroundings. Rest is 34+ units from the focus prediction, or beyond 24 and
// closer to the rest prediction. Anything else is reported as ambiguous.
type Verdict = {got: 'focus' | 'rest' | 'ambiguous'; inner?: number[]; distance?: number; restDistance?: number; ring?: number[]; far?: number[]};
function classify(frame: Buffer, c: Check): Verdict {
  const xs: number[] = [], ys: number[] = [];
  for (let y = 0; y < c.mask.h; y++) for (let x = 0; x < c.mask.w; x++) if (c.mask.px[y * c.mask.w + x]) {xs.push(c.mask.x + x); ys.push(c.mask.y + y);}
  const m = median(frame, xs, ys); if (!m) return {got: 'ambiguous'};
  const far = median(frame, c.mask.far.xs, c.mask.far.ys);
  const focusRef = mixRgb(c.mask.ref, INK_FOCUS, c.ink);
  const restRef = far ? mixRgb(far, mixRgb(c.restBase, INK, c.ink), c.restAlpha) : null;
  const dist = (p: readonly number[], q: readonly number[]): number => Math.hypot(p[0]! - q[0]!, p[1]! - q[1]!, p[2]! - q[2]!);
  const dF = dist(m, focusRef), dR = restRef ? dist(m, restRef) : Infinity;
  const base = {inner: m, distance: Math.round(dF), ...(restRef ? {restDistance: Math.round(dR)} : {}), ...(far ? {far} : {})};
  if (dF >= 34 || (dF > 24 && dR < dF)) return {got: 'rest', ...base};
  if (dF > 18 || dF >= dR) return {got: 'ambiguous', ...base};
  if (c.ink >= 0.5) return {got: 'focus', ...base};
  const ring = median(frame, c.mask.ring.xs, c.mask.ring.ys); if (!ring) return {got: 'ambiguous', ...base};
  const [R, G, B] = ring, luma = (v: readonly number[]): number => 0.2126 * v[0]! + 0.7152 * v[1]! + 0.0722 * v[2]!;
  const raised = far !== null && luma(ring) >= luma(far) - 4;
  const lit = c.mask.halo === 'pink' ? R >= G + 40 && (R >= 120 || raised) : c.mask.halo === 'cyan' ? B >= R + 25 && (B >= 120 || raised) : R >= B + 60 && (R >= 150 || raised);
  return {got: lit ? 'focus' : 'ambiguous', ...base, ring};
}
const child = spawn('ffmpeg', ['-v', 'error', '-nostdin', '-i', file, '-map', '0:v:0', '-f', 'rawvideo', '-pix_fmt', 'rgb24', 'pipe:1'], {stdio: ['ignore', 'pipe', 'inherit']});
const size = W * H * 3; let buf = Buffer.alloc(0), n = firstFrame;
let scored = 0, checks = 0, pass = 0, ambiguous = 0, negDetected = 0, negChecks = 0;
const mismatches: unknown[] = [], ambiguousList: unknown[] = [];
for await (const chunk of child.stdout) {
  buf = Buffer.concat([buf, chunk as Buffer]);
  while (buf.length >= size) {
    const frame = buf.subarray(0, size);
    if (plan.has(n)) scored++;
    for (const c of plan.get(n) ?? []) {
      const verdict = classify(frame, c), got = verdict.got; checks++;
      if (got === 'ambiguous') {ambiguous++; ambiguousList.push({word: c.word, frame: n, time: +(n / 60).toFixed(3), expect: c.expect, ink: +c.ink.toFixed(2), inner: verdict.inner, distance: verdict.distance, restDistance: verdict.restDistance, ring: verdict.ring});}
      else if (got === c.expect) pass++;
      else mismatches.push({word: c.word, frame: n, time: +(n / 60).toFixed(3), expect: c.expect, got, ink: +c.ink.toFixed(2), inner: verdict.inner, distance: verdict.distance, restDistance: verdict.restDistance, ring: verdict.ring});
      if (c.negExpect !== c.expect) {negChecks++; if (got !== 'ambiguous' && got !== c.negExpect) negDetected++;}
    }
    buf = buf.subarray(size); n++;
    if (n > last) {child.kill(); break;}
  }
  if (n > last) break;
}
const result = {schema: 'lyric-film/encoded-focus/v1', file: basename(file), format, mode: proof ? 'placeholder-proof' : 'production',
  framesChecked: scored, glyphChecks: checks, pass, mismatches: mismatches.length, ambiguous, notFullyShownWhileActive: faded,
  negativeControl: {expectation: 'next word in the lane active instead', differingChecks: negChecks, detected: negDetected},
  method: 'preview-v2: median RGB of the eroded lower glyph interior against two predictions at the frame\'s ink level: the published focus gradient overlaid with ink magenta, and the resting colour (towards dark ink) over the word\'s measured surroundings. Focus: within 18 RGB units and nearer the focus prediction, plus (below half ink) a halo-hued ring 0.03-0.12 em outside the letters that is bright or at least as bright as the surroundings. Rest: 34+ units from focus, or beyond 24 and nearer the rest prediction. Thin glyphs use a 1 px erosion.',
  mismatchList: mismatches.slice(0, 200), ambiguousList};
mkdirSync(`${root}evidence`, {recursive: true});
if (!proof) writeFileSync(`${root}evidence/encoded-focus-${format}.json`, JSON.stringify(result, null, 2) + '\n');
console.log(JSON.stringify(mismatches.length ? result : {...result, mismatchList: undefined}));
if (mismatches.length) process.exitCode = 1;
