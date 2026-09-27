import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {existsSync, mkdirSync, readFileSync, writeFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {createCanvas, GlobalFonts, loadImage} from '@napi-rs/canvas';
import {assertGate, hashes} from './render-gate.ts';

// Covers are selected source-picture artifacts. Do not generate them from an
// unreviewed scene or a different recording.
assertGate();
const root = fileURLToPath(new URL('../', import.meta.url));
const args = process.argv.slice(2);
function option(flag: string): string | undefined {const at = args.indexOf(flag); return at < 0 ? undefined : args[at + 1];}
function frameOption(flag: string): number {
  const value = Number(option(flag));
  if (!Number.isSafeInteger(value) || value < 0 || value >= 6153) throw Error(`${flag} needs a reviewed source frame number from 0 to 6152`);
  return value;
}
function centerOption(flag: string, fallback: number): number {
  const value = option(flag) === undefined ? fallback : Number(option(flag));
  if (!Number.isFinite(value)) throw Error(`${flag} must be a finite source-pixel x center`);
  return value;
}
const selected = {
  youtube: {frame: frameOption('--youtube-frame'), center: centerOption('--youtube-center', 1247.5)},
  tiktok: {frame: frameOption('--tiktok-frame'), center: centerOption('--tiktok-center', 1152)},
};
const inputHashes = hashes();
const source = resolve(root, 'public/source.mp4');
const font = resolve(root, 'public/ArchivoBlack-Regular.ttf');
if (!GlobalFonts.registerFromPath(font, 'ArchivoBlack')) throw Error('Archivo Black could not be loaded');
const names = {
  youtube: 'Computer-Kill-Must-Have-Been-A-Dream-YouTube-Thumbnail-1920x1080.jpg',
  tiktok: 'Computer-Kill-Must-Have-Been-A-Dream-TikTok-Cover-Profile-1200x1600.jpg',
};
for (const filename of Object.values(names)) if (existsSync(resolve(root, 'publishing', filename))) throw Error(`Preserve the existing cover before regenerating: ${filename}`);

function sourceFrame(frame: number): Buffer {
  return execFileSync('ffmpeg', [
    '-hide_banner','-v','error','-nostdin','-i',source,'-map','0:v:0',
    '-vf',`select=eq(n\\,${frame})`,'-frames:v','1','-fps_mode','passthrough',
    '-f','image2pipe','-vcodec','png','pipe:1',
  ], {maxBuffer: 32 * 1024 * 1024});
}
const sha = (data: Uint8Array): string => createHash('sha256').update(data).digest('hex');
type TextBox = {text: string; left: number; right: number; top: number; bottom: number; size: number};
type Kind = 'youtube' | 'tiktok';
const files: object[] = [];
const proofs: object[] = [];
mkdirSync(resolve(root, 'publishing'), {recursive: true});
mkdirSync(resolve(root, 'evidence/covers'), {recursive: true});

for (const kind of ['youtube', 'tiktok'] as const satisfies readonly Kind[]) {
  const portrait = kind === 'tiktok', pick = selected[kind];
  const width = portrait ? 1200 : 1920, height = portrait ? 1600 : 1080;
  const cropWidth = 672 * width / height;
  const cropX = Math.min(1920 - cropWidth, Math.max(0, pick.center - cropWidth / 2));
  const decoded = await loadImage(sourceFrame(pick.frame));
  if (decoded.width !== 1920 || decoded.height !== 1080) throw Error('Decoded source frame dimensions changed');
  const canvas = createCanvas(width, height), ctx = canvas.getContext('2d');
  ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(decoded, cropX, 204, cropWidth, 672, 0, 0, width, height);
  // These fields protect readable wording while retaining the source picture.
  const wash = portrait
    ? ctx.createLinearGradient(0, 790, 0, 1600)
    : ctx.createLinearGradient(820, 0, 1920, 0);
  if (portrait) {wash.addColorStop(0, 'rgba(4,8,20,0)'); wash.addColorStop(.4, 'rgba(4,8,20,.55)'); wash.addColorStop(1, 'rgba(4,8,20,.84)');}
  else {wash.addColorStop(0, 'rgba(4,8,20,0)'); wash.addColorStop(.35, 'rgba(4,8,20,.55)'); wash.addColorStop(1, 'rgba(4,8,20,.83)');}
  ctx.fillStyle = wash; ctx.fillRect(0, 0, width, height);
  const boxes: TextBox[] = [];
  function title(text: string, size: number, x: number, y: number, color: string, align: 'left' | 'center'): void {
    ctx.font = `900 ${size}px ArchivoBlack`;
    ctx.textBaseline = 'alphabetic'; ctx.textAlign = align;
    const m = ctx.measureText(text);
    const left = x - m.actualBoundingBoxLeft, right = x + m.actualBoundingBoxRight;
    const top = y - m.actualBoundingBoxAscent, bottom = y + m.actualBoundingBoxDescent;
    const marginX = width * (portrait ? .08 : .05), marginY = height * (portrait ? .07 : .05);
    if (left < marginX || right > width - marginX || top < marginY || bottom > height - marginY) throw Error(`${kind} cover title leaves its protected area: ${text}`);
    ctx.lineJoin = 'round'; ctx.lineWidth = Math.max(2, size * .035);
    ctx.strokeStyle = 'rgba(4,7,13,.82)'; ctx.shadowColor = 'rgba(0,0,0,.72)'; ctx.shadowBlur = size * .12;
    ctx.strokeText(text, x, y); ctx.fillStyle = color; ctx.fillText(text, x, y); ctx.shadowBlur = 0;
    boxes.push({text, left, right, top, bottom, size});
  }
  if (portrait) {
    title('MUST HAVE', 103, 600, 1110, '#f4eee9', 'center');
    title('BEEN A', 113, 600, 1250, '#f4eee9', 'center');
    title('DREAM', 150, 600, 1405, '#fa7263', 'center');
    title('COMPUTER KILL', 61, 600, 1470, '#b7deeb', 'center');
  } else {
    title('MUST HAVE', 91, 1045, 408, '#f4eee9', 'left');
    title('BEEN A DREAM', 91, 1045, 540, '#fa7263', 'left');
    title('COMPUTER KILL', 60, 1045, 656, '#b7deeb', 'left');
  }
  for (let i = 0; i < boxes.length; i++) for (let j = i + 1; j < boxes.length; j++) {
    const a = boxes[i]!, b = boxes[j]!;
    if (a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top) throw Error(`${kind} cover text collides`);
  }
  const path = resolve(root, 'publishing', names[kind]);
  const jpeg = canvas.toBuffer('image/jpeg', 95);
  writeFileSync(path, jpeg);
  const exported = await loadImage(path);
  if (exported.width !== width || exported.height !== height || jpeg.includes(Buffer.from('Exif\0\0', 'binary'))) throw Error('Cover dimensions or orientation metadata failed');
  files.push({kind, path: `publishing/${names[kind]}`, bytes: jpeg.length, sha256: sha(jpeg), width, height,
    sourceFrame: pick.frame, sourceTimeSeconds: pick.frame * 1001 / 24000, sourceCrop: {x: cropX, y: 204, width: cropWidth, height: 672}, textBoxes: boxes});
  for (const smallWidth of portrait ? [150, 300] : [320]) {
    const smallHeight = Math.round(smallWidth * height / width);
    const proof = createCanvas(smallWidth, smallHeight);
    proof.getContext('2d').drawImage(exported, 0, 0, smallWidth, smallHeight);
    const proofPath = resolve(root, 'evidence/covers', `${kind}-${smallWidth}x${smallHeight}.png`);
    const bytes = proof.toBuffer('image/png'); writeFileSync(proofPath, bytes);
    proofs.push({path: `evidence/covers/${kind}-${smallWidth}x${smallHeight}.png`, width: smallWidth, height: smallHeight, sha256: sha(bytes)});
  }
  if (portrait) {
    const stress = createCanvas(300, 400);
    stress.getContext('2d').drawImage(exported, width * .05, height * .05, width * .9, height * .9, 0, 0, 300, 400);
    const bytes = stress.toBuffer('image/png');
    writeFileSync(resolve(root, 'evidence/covers/tiktok-center-crop-5percent.png'), bytes);
    proofs.push({path: 'evidence/covers/tiktok-center-crop-5percent.png', width: 300, height: 400, sha256: sha(bytes)});
  }
}
assertGate();
if (JSON.stringify(inputHashes) !== JSON.stringify(hashes())) throw Error('Approved source or scene changed during cover creation');
writeFileSync(resolve(root, 'evidence/cover-assets.json'), JSON.stringify({
  status: 'generated; visual inspection pending', song: 'AK6duyCPU50', revision: 'source-integrated-preview-v1',
  sourceSha256: inputHashes['public/source.mp4'], method: 'Exact original-video frame selection; active-picture crop; Archivo Black wording; source-colored poster wash. No replacement imagery.',
  files, proofs, limits: 'Small-size and centered-crop proofs are local simulations, not a platform upload preview.',
}, null, 2) + '\n');
console.log(JSON.stringify({status: 'covers generated; inspect proofs', files: files.length, proofs: proofs.length}));
