import {spawn} from 'node:child_process';
import {mkdirSync, writeFileSync} from 'node:fs';
import {basename} from 'node:path';
import {createCanvas} from '@napi-rs/canvas';
import {initNative, root} from './native-host.ts';
import {assertGate} from './render-gate.ts';
import {FONT, getCues, inkFor, layoutCue, SKEW} from '../src/scene.ts';
import {cueIndexAt, type Cue} from '../src/model.ts';
import {shotAt, placement} from '../src/frame.ts';

// Encoded-pixel word focus. For every timed word, the output frame at its
// midpoint is decoded from the finished MP4; each visible word's glyph interior
// (eroded mask, lower 40 % of the letters, clear of flame light) is classified
// as focus or rest by colour, independently of the renderer's state. A negative
// control re-scores the same frames expecting the NEXT word to be active, to
// prove the check can detect a one-word shift. This verifies the display
// against the frozen timing, not the acoustic truth of that timing.
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

type Check = {word: string; frame: number; expect: 'focus' | 'rest'; negExpect: 'focus' | 'rest'; ink: number; mask: {x: number; y: number; w: number; h: number; px: Uint8Array}};
const plan = new Map<number, Check[]>();
const maskCache = new Map<string, Check['mask']>();
function maskFor(cue: Cue, wordId: string, t: number): Check['mask'] | null {
  const shot = shotAt(t), p = placement(format, shot, t), key = `${cue.id}:${wordId}:${shot.zone}:${p.mode}`;
  const hit = maskCache.get(key); if (hit) return hit;
  const layout = layoutCue(measure as unknown as CanvasRenderingContext2D, cue, format, shot, p), pl = layout.placed.find(x => x.word.id === wordId);
  if (!pl) return null;
  const pad = Math.ceil(pl.size * 0.4), x0 = Math.floor(pl.x - pad), y0 = Math.floor(pl.y - pl.size), w = Math.ceil(pl.w + pad * 2), h = Math.ceil(pl.size * 1.2);
  const c = createCanvas(w, h), g = c.getContext('2d');
  g.fillStyle = '#fff'; g.translate(pl.x - x0, pl.y - y0); g.transform(1, 0, -SKEW, 1, 0, 0); g.font = `700 ${pl.size}px ${FONT}`; g.fillText(pl.word.text.toLocaleUpperCase('en'), 0, 0);
  const a = g.getImageData(0, 0, w, h).data, inside = new Uint8Array(w * h), er = Math.max(2, Math.round(pl.size * 0.035));
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) inside[y * w + x] = a[(y * w + x) * 4 + 3]! > 240 ? 1 : 0;
  const px = new Uint8Array(w * h), lowBand = pl.y - y0 - pl.size * 0.8 * 0.4; // lower 40 % of cap height
  for (let y = er; y < h - er; y++) for (let x = er; x < w - er; x++) {
    if (y < lowBand) continue;
    let all = 1; for (let dy = -er; dy <= er && all; dy++) for (let dx = -er; dx <= er; dx++) if (!inside[(y + dy) * w + x + dx]) {all = 0; break;}
    px[y * w + x] = all;
  }
  const m = {x: x0, y: y0, w, h, px}; maskCache.set(key, m); return m;
}
for (const cue of cues) {
  cue.words.forEach((word, wi) => {
    let n = Math.round(((word.start + word.end) / 2) * 60);
    if (n / 60 < word.start || n / 60 >= word.end) n = Math.ceil(word.start * 60);
    if (n / 60 >= word.end || n < firstFrame || n >= endFrame) return;
    const t = n / 60, ci = cueIndexAt(cues, t, duration);
    if (ci < 0) return;
    const shown = cues[ci]!, lane = cue.words.filter(x => x.voice === word.voice), next = lane[lane.indexOf(word) + 1];
    for (const other of shown.words) {
      if (other.effect === 'moon') continue; // silver focus is intentionally low-saturation; reviewed visually
      const mask = maskFor(shown, other.id, t); if (!mask) continue;
      const active = t >= other.start && t < other.end;
      const neg = next ? other.id === next.id || (other.id !== word.id && active) : active;
      const list = plan.get(n) ?? []; list.push({word: other.id, frame: n, expect: active ? 'focus' : 'rest', negExpect: neg ? 'focus' : 'rest', ink: inkFor(format, t), mask}); plan.set(n, list);
    }
    void wi;
  });
}
const wanted = [...plan.keys()].sort((a, b) => a - b), last = wanted.at(-1) ?? 0;
function classify(frame: Buffer, c: Check): 'focus' | 'rest' | 'ambiguous' {
  const rs: number[] = [], gs: number[] = [], bs: number[] = [];
  for (let y = 0; y < c.mask.h; y++) for (let x = 0; x < c.mask.w; x++) {
    if (!c.mask.px[y * c.mask.w + x]) continue;
    const X = c.mask.x + x, Y = c.mask.y + y; if (X < 0 || Y < 0 || X >= W || Y >= H) continue;
    const k = (Y * W + X) * 3; rs.push(frame[k]!); gs.push(frame[k + 1]!); bs.push(frame[k + 2]!);
  }
  if (rs.length < 12) return 'ambiguous';
  const med = (v: number[]): number => v.sort((a, b) => a - b)[v.length >> 1]!;
  const r = med(rs), g = med(gs), b = med(bs), mx = Math.max(r, g, b), mn = Math.min(r, g, b), sat = mx ? (mx - mn) / mx : 0;
  if (c.ink > 0.5) return sat > 0.45 && r > g + 40 ? 'focus' : sat < 0.35 ? 'rest' : 'ambiguous';
  return sat > 0.3 && mx > 120 ? 'focus' : sat < 0.2 ? 'rest' : 'ambiguous';
}
const child = spawn('ffmpeg', ['-v', 'error', '-nostdin', '-i', file, '-map', '0:v:0', '-f', 'rawvideo', '-pix_fmt', 'rgb24', 'pipe:1'], {stdio: ['ignore', 'pipe', 'inherit']});
const size = W * H * 3; let buf = Buffer.alloc(0), n = firstFrame;
let scored = 0, checks = 0, pass = 0, ambiguous = 0, negDetected = 0, negChecks = 0;
const mismatches: unknown[] = [];
for await (const chunk of child.stdout) {
  buf = Buffer.concat([buf, chunk as Buffer]);
  while (buf.length >= size) {
    const frame = buf.subarray(0, size);
    if (plan.has(n)) scored++;
    for (const c of plan.get(n) ?? []) {
      const got = classify(frame, c); checks++;
      if (got === 'ambiguous') ambiguous++;
      else if (got === c.expect) pass++;
      else mismatches.push({word: c.word, frame: n, time: +(n / 60).toFixed(3), expect: c.expect, got});
      if (c.negExpect !== c.expect) {negChecks++; if (got !== 'ambiguous' && got !== c.negExpect) negDetected++;}
    }
    buf = buf.subarray(size); n++;
    if (n > last) {child.kill(); break;}
  }
  if (n > last) break;
}
const result = {schema: 'lyric-film/encoded-focus/v1', file: basename(file), format, mode: proof ? 'placeholder-proof' : 'production',
  framesChecked: scored, glyphChecks: checks, pass, mismatches: mismatches.length, ambiguous,
  negativeControl: {expectation: 'next word in the lane active instead', differingChecks: negChecks, detected: negDetected},
  method: 'Median RGB of eroded glyph interiors (lower 40 % of cap height) in decoded frames; focus = saturated neon or magenta ink, rest = low saturation. Moon focus (silver) is reviewed visually.',
  mismatchList: mismatches.slice(0, 200)};
mkdirSync(`${root}evidence`, {recursive: true});
if (!proof) writeFileSync(`${root}evidence/encoded-focus-${format}.json`, JSON.stringify(result, null, 2) + '\n');
console.log(JSON.stringify({...result, mismatchList: undefined}));
if (mismatches.length) process.exitCode = 1;
