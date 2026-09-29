import {spawn} from 'node:child_process';
import {createHash} from 'node:crypto';
import {readFileSync, writeFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {SHOTS} from '../src/shots.ts';
import {portraitCentre} from '../src/frame.ts';

// Brightness of the picture beneath each lyric reading zone, per source frame.
// The scene uses it to switch lyrics between light neon type (dark frames) and
// dark ink (white memory frames). Measured once from the locked source so the
// preview, seeks and the final renderer all reach the same state.
const root = fileURLToPath(new URL('../', import.meta.url));
const source = `${root}public/source.mp4`;
const W = 480, H = 270, SPF = 1001 / 24000;
// Each zone: normalized [x0, x1, y0, y1] in the landscape frame, or a portrait
// band expressed inside the current crop.
const ZONES = {
  landscapeLower: [0.14, 0.86, 0.66, 0.9],
  landscapeBottom: [0.14, 0.86, 0.76, 0.95],
  landscapeUpper: [0.14, 0.86, 0.06, 0.3],
  portraitLower: [0, 1, 0.62, 0.84],
} as const;
const fields = Object.keys(ZONES) as (keyof typeof ZONES)[];

function stat(rgb: Buffer, x0: number, x1: number, y0: number, y1: number): number {
  // 80th percentile luma (0..255): bright detail under text matters more than the mean.
  const hist = new Uint32Array(256);
  let count = 0;
  for (let y = Math.floor(y0 * H); y < Math.ceil(y1 * H); y++) for (let x = Math.floor(x0 * W); x < Math.ceil(x1 * W); x++) {
    const k = (y * W + x) * 3;
    hist[Math.round(0.2126 * rgb[k]! + 0.7152 * rgb[k + 1]! + 0.0722 * rgb[k + 2]!)]!++; count++;
  }
  let acc = 0;
  for (let v = 0; v < 256; v++) {acc += hist[v]!; if (acc >= count * 0.8) return v;}
  return 255;
}

const values: number[][] = fields.map(() => []);
const child = spawn('ffmpeg', ['-v', 'error', '-nostdin', '-i', source, '-map', '0:v:0', '-vf', `scale=${W}:${H}:flags=area`, '-f', 'rawvideo', '-pix_fmt', 'rgb24', 'pipe:1']);
let pending = Buffer.alloc(0), frame = 0;
for await (const chunk of child.stdout) {
  pending = Buffer.concat([pending, chunk as Buffer]);
  while (pending.length >= W * H * 3) {
    const rgb = pending.subarray(0, W * H * 3);
    const t = (frame + 0.5) * SPF;
    const shot = SHOTS.find(s => t >= s.start && t < s.end) ?? SHOTS.at(-1)!;
    fields.forEach((field, i) => {
      const [x0, x1, y0, y1] = ZONES[field];
      if (field === 'portraitLower') {
        if (shot.portrait.mode === 'fit') {values[i]!.push(0); return;} // lyrics sit on the dimmed fill
        const c = portraitCentre(shot, t), half = 1080 * 9 / 16 / 1920 / 2;
        values[i]!.push(stat(rgb, c - half, c + half, y0, y1));
      } else values[i]!.push(stat(rgb, x0, x1, y0, y1));
    });
    pending = pending.subarray(W * H * 3); frame++;
  }
}
const code = await new Promise<number | null>(done => child.once('close', done));
if (code !== 0) throw Error('Decoder failed');
const out = {
  schema: 'lyric-film/picture-tones/v1',
  sourceSha256: createHash('sha256').update(readFileSync(source)).digest('hex'),
  frames: frame, frameDuration: SPF, statistic: '80th-percentile Rec.709 luma (0-255) at 480x270, per source frame', zones: ZONES,
  fields, values,
};
writeFileSync(`${root}public/picture-tones.json`, JSON.stringify(out) + '\n');
console.log(`${frame} frames`);
