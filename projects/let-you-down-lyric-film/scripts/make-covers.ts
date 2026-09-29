import {mkdirSync, writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {createCanvas, GlobalFonts, ImageData, type SKRSContext2D} from '@napi-rs/canvas';
import {decodeFrame, root, SRC_FPS} from './native-host.ts';
import {ARTIST, TITLE} from '../src/song.ts';

// Posting covers from one exact source frame plus title/artist typography in
// the film's own lettering (no lyric text). YouTube 1920×1080 thumbnail and
// the default TikTok PORTRAIT 1200×1600 profile cover (3:4), with small-size
// review images for the 150×200 and 320×180 checks.
if (!GlobalFonts.registerFromPath(`${root}public/fonts/Oswald-Bold.ttf`, 'OswaldLYD')) throw Error('font');
const FRAME_TIME = 65.6, k = Math.floor(FRAME_TIME * SRC_FPS + 1e-9);
const rgba = await decodeFrame(k);
const src = createCanvas(1920, 1080);
src.getContext('2d').putImageData(new ImageData(new Uint8ClampedArray(rgba.buffer, rgba.byteOffset, rgba.byteLength), 1920, 1080), 0, 0);
const YELLOW = '#fcee0a', CYAN = '#2ee6ff';

function type(g: SKRSContext2D, text: string, x: number, y: number, size: number, fill: string, glow: string, align: 'left' | 'center' = 'left'): number {
  g.save(); g.font = `700 ${size}px OswaldLYD`; g.textAlign = align; g.textBaseline = 'alphabetic';
  const w = g.measureText(text).width;
  g.translate(x, y); g.transform(1, 0, -0.13, 1, 0, 0);
  g.lineJoin = 'round'; g.lineWidth = size * 0.08; g.strokeStyle = 'rgba(8,3,20,0.9)'; g.shadowColor = 'rgba(5,2,14,0.9)'; g.shadowBlur = size * 0.18; g.strokeText(text, 0, 0);
  g.shadowColor = glow; g.shadowBlur = size * 0.35; g.fillStyle = fill; g.fillText(text, 0, 0);
  g.shadowBlur = 0; g.fillText(text, 0, 0); g.restore();
  return w;
}
function shade(g: SKRSContext2D, x0: number, x1: number, w: number, h: number, alpha: number): void {
  const grad = g.createLinearGradient(x0, 0, x1, 0);
  grad.addColorStop(0, `rgba(6,3,16,${alpha})`); grad.addColorStop(1, 'rgba(6,3,16,0)');
  g.fillStyle = grad; g.fillRect(0, 0, w, h);
}
const outDir = `${root}publishing`, reviewDir = `${root}evidence/covers`;
mkdirSync(outDir, {recursive: true}); mkdirSync(reviewDir, {recursive: true});
const sha = (b: Uint8Array): string => createHash('sha256').update(b).digest('hex');
const receipt: Record<string, string> = {};

// YouTube 1920×1080: the whole source frame; title stacked in the left third.
{
  const c = createCanvas(1920, 1080), g = c.getContext('2d');
  g.drawImage(src, 0, 0);
  shade(g, 0, 900, 1920, 1080, 0.78);
  type(g, 'LET', 118, 360, 250, YELLOW, YELLOW);
  type(g, 'YOU', 118, 610, 250, YELLOW, YELLOW);
  type(g, 'DOWN', 118, 860, 250, YELLOW, YELLOW);
  type(g, ARTIST.toLocaleUpperCase('en'), 126, 968, 70, '#ffffff', CYAN);
  const jpg = await c.encode('jpeg', 92), file = 'Dawid-Podsiadlo-Let-You-Down-YouTube-Thumbnail-1920x1080.jpg';
  writeFileSync(`${outDir}/${file}`, jpg); receipt[file] = sha(jpg);
  const small = createCanvas(320, 180); small.getContext('2d').drawImage(c, 0, 0, 320, 180);
  writeFileSync(`${reviewDir}/youtube-320x180.png`, await small.encode('png'));
}
// TikTok profile cover: PORTRAIT 1200×1600 (3:4), centred on the subject.
{
  const c = createCanvas(1200, 1600), g = c.getContext('2d');
  const cropW = 1080 * 1200 / 1600, cx = 0.5 * 1920;
  g.drawImage(src, cx - cropW / 2, 0, cropW, 1080, 0, 0, 1200, 1600);
  const grad = g.createLinearGradient(0, 1600, 0, 900);
  grad.addColorStop(0, 'rgba(6,3,16,0.88)'); grad.addColorStop(1, 'rgba(6,3,16,0)');
  g.fillStyle = grad; g.fillRect(0, 900, 1200, 700);
  type(g, TITLE.toLocaleUpperCase('en'), 600, 1370, 170, YELLOW, YELLOW, 'center');
  type(g, ARTIST.toLocaleUpperCase('en'), 600, 1478, 74, '#ffffff', CYAN, 'center');
  const jpg = await c.encode('jpeg', 92), file = 'Dawid-Podsiadlo-Let-You-Down-TikTok-Cover-Profile-1200x1600.jpg';
  writeFileSync(`${outDir}/${file}`, jpg); receipt[file] = sha(jpg);
  for (const [w, h] of [[150, 200], [300, 400]] as const) {
    const small = createCanvas(w, h); small.getContext('2d').drawImage(c, 0, 0, w, h);
    writeFileSync(`${reviewDir}/tiktok-${w}x${h}.png`, await small.encode('png'));
  }
  // A modest centred crop (5 %) must keep the full title visible.
  const crop = createCanvas(1080, 1440); crop.getContext('2d').drawImage(c, 60, 80, 1080, 1440, 0, 0, 1080, 1440);
  const cs = createCanvas(150, 200); cs.getContext('2d').drawImage(crop, 0, 0, 150, 200);
  writeFileSync(`${reviewDir}/tiktok-center-crop-5percent-150x200.png`, await cs.encode('png'));
}
writeFileSync(`${root}evidence/cover-assets.json`, JSON.stringify({schema: 'lyric-film/covers/v1', sourceFrame: k, sourceTime: +(k / SRC_FPS).toFixed(6),
  typography: 'Oswald Bold (OFL), forward lean matching the film; title and artist only, no lyric text', files: receipt}, null, 2) + '\n');
console.log(JSON.stringify(receipt));
