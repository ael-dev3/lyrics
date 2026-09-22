import {createCanvas, GlobalFonts, loadImage} from '@napi-rs/canvas';
import {createHash} from 'node:crypto';
import {mkdirSync, readFileSync, writeFileSync} from 'node:fs';
import {palette} from '../src/scene.ts';

const artworkPath = 'public/artwork.png';
const fontPath = 'public/fonts/Oswald-Medium.ttf';
if (!GlobalFonts.registerFromPath(fontPath, 'LyubiCover')) throw Error('The approved Oswald font could not be loaded');
const artwork = await loadImage(artworkPath);
if (artwork.width !== 1080 || artwork.height !== 1080) throw Error('Unexpected original-artwork geometry');
mkdirSync('publishing', {recursive: true});
mkdirSync('evidence/covers', {recursive: true});
const sha256 = (bytes: Uint8Array) => createHash('sha256').update(bytes).digest('hex');
const identity = (path: string) => {
  const bytes = readFileSync(path);
  return {path, bytes: bytes.length, sha256: sha256(bytes)};
};
type TextBox = {text: string; fontSize: number; left: number; right: number; top: number; bottom: number};
const assets: object[] = [];
const proofs: object[] = [];

for (const portrait of [false, true]) {
  const width = portrait ? 1200 : 1920;
  const height = portrait ? 1600 : 1080;
  const label = portrait ? 'TikTok' : 'YouTube';
  const canvas = createCanvas(width, height);
  const context = canvas.getContext('2d');
  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = 'high';
  context.fontKerning = 'none';

  const paper = context.createLinearGradient(0, 0, width, height);
  paper.addColorStop(0, '#f6e8e2');
  paper.addColorStop(1, palette.paper);
  context.fillStyle = paper;
  context.fillRect(0, 0, width, height);
  // The same quiet paper texture as the approved film, rendered deterministically.
  for (let x = 0; x < width; x += 11) for (let y = 0; y < height; y += 13) {
    context.globalAlpha = 0.045;
    context.fillStyle = palette.ink;
    context.beginPath(); context.arc(x + 2, y + 4, 0.6, 0, Math.PI * 2); context.fill();
    context.globalAlpha = 0.06;
    context.fillStyle = palette.active;
    context.beginPath(); context.arc(x + 8, y + 10, 0.35, 0, Math.PI * 2); context.fill();
  }
  context.globalAlpha = 1;

  const art = portrait ? {x: 185, y: 137, size: 830} : {x: 1050, y: 153, size: 775};
  const center = {x: art.x + art.size / 2, y: art.y + art.size / 2};
  context.save();
  context.translate(center.x, center.y);
  context.rotate(-2 * Math.PI / 180);
  context.translate(-center.x, -center.y);
  context.fillStyle = palette.ink;
  context.globalAlpha = 0.07;
  context.fillRect(art.x - 14, art.y - 11, art.size + 39, art.size + 43);
  context.globalAlpha = 1;
  context.fillStyle = '#faeee8';
  context.fillRect(art.x - 18, art.y - 18, art.size + 36, art.size + 36);
  // Full source picture: no retouching, recoloring, content replacement or crop.
  context.drawImage(artwork, art.x, art.y, art.size, art.size);
  context.restore();

  const textBoxes: TextBox[] = [];
  const maxTextWidth = portrait ? 972 : 820;
  const title = ['ЛЮБИ МЕНЯ,', 'ЛЮБИ'];
  let titleSize = portrait ? 154 : 148;
  while (titleSize > 100) {
    context.font = `500 ${titleSize}px LyubiCover`;
    if (title.every(line => context.measureText(line).width <= maxTextWidth)) break;
    titleSize--;
  }
  const text = (value: string, size: number, x: number, baseline: number, color: string, align: 'left' | 'center') => {
    context.font = `500 ${size}px LyubiCover`;
    context.textAlign = align;
    context.textBaseline = 'alphabetic';
    context.fillStyle = color;
    const metrics = context.measureText(value);
    const box = {text: value, fontSize: size, left: x - metrics.actualBoundingBoxLeft, right: x + metrics.actualBoundingBoxRight, top: baseline - metrics.actualBoundingBoxAscent, bottom: baseline + metrics.actualBoundingBoxDescent};
    // Preserve the full title/artist under a 5% crop and the portrait cover safe area.
    const safeX = portrait ? width * 0.08 : width * 0.05;
    const safeY = portrait ? height * 0.07 : height * 0.05;
    if (box.left < safeX || box.right > width - safeX || box.top < safeY || box.bottom > height - safeY) throw Error(`Cover text leaves its protected area: ${label} ${value}`);
    context.fillText(value, x, baseline);
    textBoxes.push(box);
  };
  if (portrait) {
    text(title[0]!, titleSize, 600, 1170, palette.ink, 'center');
    text(title[1]!, titleSize, 600, 1346, palette.active, 'center');
    text('ГРЕЧКА', 66, 600, 1460, palette.ink, 'center');
  } else {
    text('ГРЕЧКА', 70, 125, 323, palette.active, 'left');
    text(title[0]!, titleSize, 120, 515, palette.ink, 'left');
    text(title[1]!, titleSize, 120, 708, palette.active, 'left');
  }
  for (let i = 0; i < textBoxes.length; i++) for (let j = i + 1; j < textBoxes.length; j++) {
    const a = textBoxes[i]!, b = textBoxes[j]!;
    if (a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top) throw Error('Cover text collision');
  }

  const file = portrait ? 'Lyubi-Menya-Lyubi-TikTok-Cover-Profile-1200x1600.jpg' : 'Lyubi-Menya-Lyubi-YouTube-Thumbnail-1920x1080.jpg';
  const path = `publishing/${file}`;
  writeFileSync(path, canvas.toBuffer('image/jpeg', 95));
  const decoded = await loadImage(path);
  if (decoded.width !== width || decoded.height !== height) throw Error('Encoded cover dimensions changed');
  const bytes = readFileSync(path);
  const exifPresent = bytes.includes(Buffer.from('Exif\0\0', 'binary'));
  if (exifPresent) throw Error('Fresh cover must not depend on EXIF orientation');
  assets.push({...identity(path), width, height, aspectRatio: portrait ? '3:4 portrait' : '16:9 landscape', mimeType: 'image/jpeg', squarePixels: true, exifOrientationDependency: false, textBoxes, artwork: {...art, rotationDegrees: -2, entireSourceImage: true}});

  const nativePath = `evidence/covers/${label}-native.png`;
  // Proofs decode the delivered JPEG, so they include its real compression.
  const native = createCanvas(width, height);
  native.getContext('2d').drawImage(decoded, 0, 0);
  writeFileSync(nativePath, native.toBuffer('image/png'));
  proofs.push({...identity(nativePath), width, height, kind: 'decoded native JPEG proof'});
  for (const smallWidth of portrait ? [150, 300] : [320, 640]) {
    const smallHeight = Math.round(smallWidth * height / width);
    const small = createCanvas(smallWidth, smallHeight);
    const smallContext = small.getContext('2d');
    smallContext.imageSmoothingQuality = 'high';
    smallContext.drawImage(decoded, 0, 0, smallWidth, smallHeight);
    const proofPath = `evidence/covers/${label}-${smallWidth}x${smallHeight}.png`;
    writeFileSync(proofPath, small.toBuffer('image/png'));
    proofs.push({...identity(proofPath), width: smallWidth, height: smallHeight, kind: 'local mobile-size proof'});
  }
  const cropWidth = portrait ? 300 : 320, cropHeight = portrait ? 400 : 180;
  const crop = createCanvas(cropWidth, cropHeight);
  crop.getContext('2d').drawImage(decoded, width * 0.05, height * 0.05, width * 0.9, height * 0.9, 0, 0, cropWidth, cropHeight);
  const cropPath = `evidence/covers/${label}-center-crop-5percent.png`;
  writeFileSync(cropPath, crop.toBuffer('image/png'));
  proofs.push({...identity(cropPath), width: cropWidth, height: cropHeight, kind: 'local centered crop simulation; 5% removed from every edge'});
}

writeFileSync('evidence/cover-assets.json', JSON.stringify({
  method: 'Code-native canvas typography and poster composition using the unchanged original album image, approved rose-paper palette and bundled Oswald Medium font. No generated replacement imagery or image retouching.',
  sourceArtwork: identity(artworkPath),
  font: identity(fontPath),
  script: identity('scripts/covers.ts'),
  files: assets,
  proofs,
  programmaticChecks: {exactDimensions: true, fullTitleAndArtistInsideSafeMargins: true, fivePercentCropTextProtection: true, noTextCollisions: true, uprightWithoutExifRotation: true},
  visualReview: {status: 'Proofs generated; visual inspection required', platformUploadPreview: false, limits: 'Mobile-size and crop images are local simulations, not an upload-interface test.'},
}, null, 2) + '\n');
console.log({covers: assets.length, proofs: proofs.length, method: 'original artwork + code-native typography'});
