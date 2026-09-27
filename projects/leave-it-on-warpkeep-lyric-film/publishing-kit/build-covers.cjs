#!/usr/bin/env node
// Code-native cover typography over exact, unretouched browser-scene captures.
// Requires sharp on NODE_PATH; no image generation or scene replacement is used.
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const sharp = require('sharp');

const here = __dirname;
const project = path.dirname(here);
const glyphData = JSON.parse(fs.readFileSync(path.join(here, 'type-paths.json'), 'utf8'));
const evidence = path.join(project, 'evidence');
const out = here;

function glyphWidth(text, size, tracking = 0) {
  return [...text].reduce((sum, c) => sum + glyphData.glyphs[c].advance * size / glyphData.unitsPerEm, 0)
    + Math.max(0, text.length - 1) * tracking;
}

function paths(text, x, baseline, size, color, { tracking = 0, outline = 0, opacity = 1 } = {}) {
  const scale = size / glyphData.unitsPerEm;
  let cursor = x;
  const spans = [];
  for (const char of text) {
    const glyph = glyphData.glyphs[char];
    if (!glyph) throw new Error(`Missing glyph ${JSON.stringify(char)}`);
    if (glyph.path) {
      spans.push(`<path d="${glyph.path}" transform="translate(${cursor.toFixed(2)} ${baseline.toFixed(2)}) scale(${scale.toFixed(6)} ${(-scale).toFixed(6)})"/>`);
    }
    cursor += glyph.advance * scale + tracking;
  }
  return `<g fill="${color}" opacity="${opacity}" stroke="${outline ? '#071b28' : 'none'}" stroke-width="${outline / scale}" stroke-linejoin="round" paint-order="stroke fill">${spans.join('')}</g>`;
}

function coverSvg({width, height, mode}) {
  if (mode === 'wide') {
    return Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
      <defs>
        <linearGradient id="shade" x1="0" x2="1"><stop offset="0" stop-color="#05182a" stop-opacity=".90"/><stop offset=".45" stop-color="#082038" stop-opacity=".44"/><stop offset=".67" stop-color="#082038" stop-opacity="0"/></linearGradient>
        <linearGradient id="bottom" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#06131c" stop-opacity="0"/><stop offset="1" stop-color="#06131c" stop-opacity=".30"/></linearGradient>
      </defs>
      <rect width="1920" height="1080" fill="url(#shade)"/>
      <rect y="780" width="1920" height="300" fill="url(#bottom)"/>
      <rect x="94" y="175" width="7" height="440" rx="3" fill="#75eafb" opacity=".95"/>
      ${paths('LEAVE', 128, 345, 190, '#fcf4dc', {tracking:-4,outline:5})}
      ${paths('IT ON', 128, 560, 220, '#8cefff', {tracking:-3,outline:5})}
      ${paths('LYRIC VISUALIZER', 126, 634, 47, '#f8e6b5', {tracking:2,outline:2})}
    </svg>`);
  }

  if (mode === 'vertical') {
    return Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
      <defs><linearGradient id="footer" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#041522" stop-opacity="0"/><stop offset=".46" stop-color="#041522" stop-opacity=".69"/><stop offset="1" stop-color="#041522" stop-opacity=".91"/></linearGradient></defs>
      <rect y="1260" width="1080" height="660" fill="url(#footer)"/>
      <rect x="72" y="1520" width="7" height="244" rx="3" fill="#75eafb" opacity=".95"/>
      ${paths('LEAVE', 102, 1641, 166, '#fcf4dc', {tracking:-2,outline:5})}
      ${paths('IT ON', 102, 1784, 181, '#8cefff', {tracking:-2,outline:5})}
    </svg>`);
  }
  return Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
    <defs>
      <linearGradient id="footer" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#041522" stop-opacity="0"/><stop offset=".47" stop-color="#041522" stop-opacity=".70"/><stop offset="1" stop-color="#041522" stop-opacity=".92"/></linearGradient>
    </defs>
    <rect y="1060" width="1200" height="540" fill="url(#footer)"/>
    <rect x="78" y="1177" width="7" height="251" rx="3" fill="#75eafb" opacity=".95"/>
    ${paths('LEAVE', 108, 1300, 174, '#fcf4dc', {tracking:-2,outline:5})}
    ${paths('IT ON', 108, 1442, 188, '#8cefff', {tracking:-2,outline:5})}
  </svg>`);
}

async function makeWide() {
  const source = path.join(evidence, 'preview-landscape-266.000.png');
  const output = path.join(out, 'Leave-It-On-Warpkeep-YouTube-Thumbnail-1920x1080.jpg');
  const result = await sharp(source).removeAlpha().composite([{input:coverSvg({width:1920,height:1080,mode:'wide'})}])
    .jpeg({quality:94,mozjpeg:true,chromaSubsampling:'4:4:4'}).toFile(output);
  await sharp(output).resize(320,180).png().toFile(path.join(out,'review-youtube-320x180.png'));
  return {source, output, ...result};
}

async function makePortrait() {
  const source = path.join(evidence, 'preview-portrait-205.000.png');
  const output = path.join(out, 'Leave-It-On-Warpkeep-TikTok-Cover-Profile-1200x1600.jpg');
  // Independent 3:4 cover framing from the native 9:16 portrait scene: ridge,
  // guardian and castle remain visible with no stretch or padded borders.
  const base = await sharp(source).extract({left:0, top:120, width:1080, height:1440})
    .resize(1200,1600).removeAlpha().toBuffer();
  const result = await sharp(base).composite([{input:coverSvg({width:1200,height:1600,mode:'profile'})}])
    .jpeg({quality:94,mozjpeg:true,chromaSubsampling:'4:4:4'}).toFile(output);
  await sharp(output).resize(300,400).png().toFile(path.join(out,'review-tiktok-300x400.png'));
  await sharp(output).resize(150,200).png().toFile(path.join(out,'review-tiktok-150x200.png'));
  const stress = await sharp(output).extract({left:60,top:80,width:1080,height:1440}).resize(300,400).png().toBuffer();
  fs.writeFileSync(path.join(out,'review-tiktok-trim-300x400.png'),stress);
  return {source, output, ...result};
}

async function makeVertical() {
  const source = path.join(evidence, 'preview-portrait-266.000.png');
  const output = path.join(out, 'Leave-It-On-Warpkeep-TikTok-Cover-Vertical-1080x1920.jpg');
  const result = await sharp(source).removeAlpha().composite([{input:coverSvg({width:1080,height:1920,mode:'vertical'})}])
    .jpeg({quality:94,mozjpeg:true,chromaSubsampling:'4:4:4'}).toFile(output);
  return {source, output, ...result};
}

async function main() {
  for (const asset of [await makeWide(),await makePortrait(),await makeVertical()]) {
    const b = fs.readFileSync(asset.output);
    const md = await sharp(b).metadata();
    console.log(JSON.stringify({source:path.relative(project,asset.source),file:path.relative(project,asset.output),
      width:md.width,height:md.height,bytes:b.length,sha256:crypto.createHash('sha256').update(b).digest('hex')}));
  }
  console.log(JSON.stringify({headlineWidthWide:glyphWidth('LEAVE',190,-4),
    headlineWidthPortrait:glyphWidth('LEAVE',174,-2)}));
}

main().catch(error=>{console.error(error);process.exitCode=1});
