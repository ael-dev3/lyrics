import {spawn} from 'node:child_process';
import {createHash} from 'node:crypto';
import {readFileSync, writeFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';

// The film's own neon colours, per source frame: the two dominant hues of
// vivid, bright pixels (saturation > 0.5, value > 0.55; 36 hue bins weighted
// by saturation × value), and how much vivid light the frame holds. Hues are
// smoothed with a centred ±6-frame circular average so the light field can
// take each shot's colours without flickering. Measured once from the locked
// source; the preview and renderer read the same numbers after any seek.
const root = fileURLToPath(new URL('../', import.meta.url));
const source = `${root}public/source.mp4`;
const W = 192, H = 108, BINS = 36;
const hueA: number[] = [], hueB: number[] = [], strength: number[] = [];
const child = spawn('ffmpeg', ['-v', 'error', '-nostdin', '-i', source, '-map', '0:v:0', '-vf', `scale=${W}:${H}:flags=area`, '-f', 'rawvideo', '-pix_fmt', 'rgb24', 'pipe:1']);
let pending = Buffer.alloc(0);
for await (const chunk of child.stdout) {
  pending = Buffer.concat([pending, chunk as Buffer]);
  while (pending.length >= W * H * 3) {
    const px = pending.subarray(0, W * H * 3), hist = new Float64Array(BINS);
    let vivid = 0;
    for (let i = 0; i < W * H; i++) {
      const r = px[i * 3]! / 255, g = px[i * 3 + 1]! / 255, b = px[i * 3 + 2]! / 255;
      const mx = Math.max(r, g, b), mn = Math.min(r, g, b), s = mx ? (mx - mn) / mx : 0;
      if (s < 0.5 || mx < 0.55) continue;
      const d = mx - mn;
      let h = mx === r ? ((g - b) / d + 6) % 6 : mx === g ? (b - r) / d + 2 : (r - g) / d + 4;
      h /= 6;
      hist[Math.floor(h * BINS) % BINS]! += s * mx; vivid++;
    }
    const order = Array.from({length: BINS}, (_, k) => k).sort((x, y) => hist[y]! - hist[x]!);
    const a = order[0]!, b = order.find(k => Math.min(Math.abs(k - a), BINS - Math.abs(k - a)) >= 6) ?? (a + BINS / 2) % BINS;
    hueA.push((a + 0.5) * 360 / BINS); hueB.push((b + 0.5) * 360 / BINS); strength.push(vivid / (W * H));
    pending = pending.subarray(W * H * 3);
  }
}
if (await new Promise<number | null>(done => child.once('close', done)) !== 0) throw Error('Decoder failed');
function smoothHue(values: number[], weight: number[]): number[] {
  return values.map((_, k) => {
    let x = 0, y = 0;
    for (let j = Math.max(0, k - 6); j <= Math.min(values.length - 1, k + 6); j++) {
      const w = 0.05 + weight[j]!;
      x += Math.cos(values[j]! * Math.PI / 180) * w; y += Math.sin(values[j]! * Math.PI / 180) * w;
    }
    return Math.round(((Math.atan2(y, x) * 180 / Math.PI) + 360) % 360);
  });
}
const smoothStrength = strength.map((_, k) => {
  let s = 0, c = 0;
  for (let j = Math.max(0, k - 6); j <= Math.min(strength.length - 1, k + 6); j++) {s += strength[j]!; c++;}
  return Math.round(Math.min(1, s / c * 8) * 255); // 12.5 % vivid pixels = full strength
});
const out = {
  schema: 'lyric-film/picture-palette/v1', sourceSha256: createHash('sha256').update(readFileSync(source)).digest('hex'),
  frames: hueA.length, frameDuration: 1001 / 24000,
  method: 'Dominant and secondary hue (>= 60 degrees apart) of vivid pixels at 192x108; centred ±6-frame circular smoothing; strength = vivid-pixel fraction × 8, clamped, 0-255.',
  hueA: smoothHue(hueA, strength), hueB: smoothHue(hueB, strength), strength: smoothStrength,
};
writeFileSync(`${root}public/picture-palette.json`, JSON.stringify(out) + '\n');
console.log(`${out.frames} frames; median strength ${[...out.strength].sort((x, y) => x - y)[out.frames >> 1]}`);
