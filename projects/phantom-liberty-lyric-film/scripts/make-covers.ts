import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {existsSync, mkdirSync, readFileSync, writeFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {createCanvas, GlobalFonts, loadImage} from '@napi-rs/canvas';
import {checkCurrentProductionGate} from './render-gate.ts';

const root = fileURLToPath(new URL('../', import.meta.url));
const approved = checkCurrentProductionGate();
const sha = (data: Uint8Array): string => createHash('sha256').update(data).digest('hex');
const frameNumber = 4796;
const frameTime = frameNumber * 1001 / 30000;
const source = resolve(root, 'public/source.mp4');
assert.equal(sha(readFileSync(source)), approved.inputs['public/source.mp4']);
if (!GlobalFonts.registerFromPath(resolve(root, 'public/fonts/SpaceGrotesk.ttf'), 'PhantomGrotesk')) throw Error('Approved cover font could not be loaded');
const sourceFrame = execFileSync('ffmpeg', [
  '-hide_banner', '-v', 'error', '-nostdin', '-i', source, '-map', '0:v:0',
  '-vf', `select=eq(n\\,${frameNumber})`, '-frames:v', '1', '-fps_mode', 'passthrough',
  '-f', 'image2pipe', '-vcodec', 'png', 'pipe:1',
], {maxBuffer: 32 * 1024 * 1024});
const decoded = await loadImage(sourceFrame);
assert.equal(decoded.width, 1920); assert.equal(decoded.height, 1080);
type TextBox = {text: string; size: number; left: number; right: number; top: number; bottom: number};
const files: object[] = [], proofs: object[] = [];
mkdirSync(resolve(root, 'publishing/Review'), {recursive: true});
for (const kind of ['YouTube', 'TikTok'] as const) {
  const portrait = kind === 'TikTok', width = portrait ? 1200 : 1280, height = portrait ? 1600 : 720;
  const filename = portrait ? 'Phantom-Liberty-TikTok-Cover-Profile-1200x1600.jpg' : 'Phantom-Liberty-YouTube-Thumbnail-1280x720.jpg';
  const path = resolve(root, 'publishing', filename);
  if (existsSync(path)) throw Error(`Preserve the existing cover before regenerating: ${filename}`);
  const canvas = createCanvas(width, height), ctx = canvas.getContext('2d');
  const crop = {x: portrait ? 835 : 230, y: 132, width: portrait ? 612 : 1450 + 2 / 3, height: 816};
  ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(decoded, crop.x, crop.y, crop.width, crop.height, 0, 0, width, height);
  // A continuous wash protects wording while preserving the selected source
  // face, its crimson scan lines and the original illumination.
  const wash = portrait ? ctx.createLinearGradient(0, 850, 0, 1600) : ctx.createLinearGradient(0, 0, 810, 0);
  wash.addColorStop(0, portrait ? 'rgba(19,6,14,0)' : 'rgba(19,6,14,.5)');
  wash.addColorStop(1, portrait ? 'rgba(19,6,14,.96)' : 'rgba(19,6,14,0)');
  ctx.fillStyle = wash; ctx.fillRect(0, 0, width, height);
  const wording: [string, number, number][] = portrait
    ? [['PHANTOM', 145, 1090], ['LIBERTY', 145, 1240], ['Dawid Podsiadło', 76, 1357], ['P.T. Adamczyk', 76, 1461]]
    : [['PHANTOM', 82, 285], ['LIBERTY', 82, 385], ['Dawid Podsiadło', 40, 465], ['P.T. Adamczyk', 40, 519]];
  const textBoxes: TextBox[] = [];
  ctx.textAlign = portrait ? 'center' : 'left'; ctx.textBaseline = 'alphabetic';
  for (const [text, size, baseline] of wording) {
    const x = portrait ? 600 : 76;
    ctx.font = `600 ${size}px PhantomGrotesk`;
    const metrics = ctx.measureText(text);
    const box = {text, size, left: x - metrics.actualBoundingBoxLeft, right: x + metrics.actualBoundingBoxRight,
      top: baseline - metrics.actualBoundingBoxAscent, bottom: baseline + metrics.actualBoundingBoxDescent};
    const safeX = width * (portrait ? .08 : .05), safeY = height * (portrait ? .07 : .05);
    assert.ok(box.left >= safeX && box.right <= width - safeX && box.top >= safeY && box.bottom <= height - safeY, `${kind} text leaves protected cover area: ${text}`);
    ctx.fillStyle = '#fff0dc'; ctx.shadowColor = 'rgba(19,6,14,.7)'; ctx.shadowBlur = 18;
    ctx.fillText(text, x, baseline); ctx.shadowBlur = 0; textBoxes.push(box);
  }
  for (let i = 1; i < textBoxes.length; i++) assert.ok(textBoxes[i - 1]!.bottom < textBoxes[i]!.top, 'Cover text overlaps');
  const jpeg = canvas.toBuffer('image/jpeg', 95); writeFileSync(path, jpeg);
  const exported = await loadImage(path);
  assert.equal(exported.width, width); assert.equal(exported.height, height);
  assert.ok(!jpeg.includes(Buffer.from('Exif\0\0', 'binary')), 'Cover must not depend on EXIF rotation');
  files.push({path: `publishing/${filename}`, kind, width, height, bytes: jpeg.length, sha256: sha(jpeg), sourceFrame: frameNumber,
    sourceTimeSeconds: frameTime, sourceCrop: crop, textBoxes, orientation: 'square pixels; no EXIF rotation'});
  for (const smallWidth of portrait ? [150, 300] : [320]) {
    const smallHeight = Math.round(smallWidth * height / width), proof = createCanvas(smallWidth, smallHeight);
    proof.getContext('2d').drawImage(exported, 0, 0, smallWidth, smallHeight);
    const proofPath = `publishing/Review/${kind.toLowerCase()}-${smallWidth}x${smallHeight}.png`, bytes = proof.toBuffer('image/png');
    writeFileSync(resolve(root, proofPath), bytes); proofs.push({path: proofPath, width: smallWidth, height: smallHeight, sha256: sha(bytes)});
  }
  if (portrait) {
    const stress = createCanvas(300, 400); stress.getContext('2d').drawImage(exported, width * .05, height * .05, width * .9, height * .9, 0, 0, 300, 400);
    const proofPath = 'publishing/Review/tiktok-center-crop-5percent.png', bytes = stress.toBuffer('image/png');
    writeFileSync(resolve(root, proofPath), bytes); proofs.push({path: proofPath, width: 300, height: 400, sha256: sha(bytes)});
  }
}
assert.deepEqual(checkCurrentProductionGate(), approved);
writeFileSync(resolve(root, 'publishing/cover-assets.json'), JSON.stringify({
  schemaVersion: 1, status: 'generated; local visual review pending', revision: approved.revision,
  sourceSha256: approved.inputs['public/source.mp4'], approvedInputHashes: approved.inputs,
  makerSha256: sha(readFileSync(fileURLToPath(import.meta.url))), sourceFramePngSha256: sha(sourceFrame),
  method: 'Exact original-video frame 4796. Source-picture crop, continuous source-colored wash and Space Grotesk lettering. No generated imagery, subject reconstruction or replacement scene.',
  files, proofs, limitations: 'Profile-size and centered-crop proofs are local simulations, not an actual platform upload preview.',
}, null, 2) + '\n');
console.log(JSON.stringify({status: 'covers generated; inspect proofs', sourceFrame: frameNumber, files: files.length, proofs: proofs.length}));
