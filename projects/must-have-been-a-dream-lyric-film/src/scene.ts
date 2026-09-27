import {shotAt, type Shot} from './shots.ts';

export type Format = 'landscape' | 'portrait';
export type Word = {text: string; start: number; end: number; confidence?: string};
export type Cue = {id: string; text: string; start: number; end: number; words: Word[]};
type Timeline = {song: string; sourceDuration: number; cues: Cue[]};
type Features = {
  schemaVersion: number;
  sourceSha256: string;
  analysis: {frameRate: {numerator: number; denominator: number}; frameCount: number};
  rows: number[][];
};
type Ctx = CanvasRenderingContext2D;
type Box = {x: number; y: number; w: number; h: number};
export type Geometry = {w: number; h: number; source: Box; destination: Box};
type Position = {text: string; index: number; x: number; y: number; size: number; width: number};
type Response = {rms: number; attack: number; bands: number[]};

const SOURCE_HASH = '8a37587959dcfef6b9a91d84498d819cd782fc2b78f2edb923cbb63c1fdc19a5';
const FPS = 24000 / 1001;
const ACTIVE_TOP = 204;
const ACTIVE_HEIGHT = 672;
const clamp = (value: number, lo = 0, hi = 1) => Math.min(hi, Math.max(lo, value));
const ease = (value: number) => {const x = clamp(value); return x * x * (3 - 2 * x);};
let timeline: Timeline | undefined;
let features: Features | undefined;
let lowBands: number[] = [];
let highBands: number[] = [];
let sampler: HTMLCanvasElement | undefined;
let samplerCtx: Ctx | undefined;
let colorMask: HTMLCanvasElement | undefined;
let colorMaskCtx: Ctx | undefined;
let lastLive: HTMLCanvasElement | undefined;
let lastLiveCtx: Ctx | undefined;
let lastLiveTime = -100;
let spriteFrame: HTMLCanvasElement | undefined;
let spriteFrameCtx: Ctx | undefined;
let titleMask: HTMLCanvasElement | undefined;
let titleMaskCtx: Ctx | undefined;
let artistLayer: HTMLCanvasElement | undefined;
let artistLayerCtx: Ctx | undefined;
const bridge = new Map<string, HTMLImageElement>();
const positions = new Map<string, Position[]>();

function parseTimeline(input: unknown): Timeline {
  if (!input || typeof input !== 'object') throw Error('Lyric timeline is not an object');
  const raw = input as Timeline;
  if (raw.song !== 'AK6duyCPU50' || !Array.isArray(raw.cues) || raw.cues.length !== 26) throw Error('This preview needs all 26 source lyric lines');
  let previousEnd = 0;
  const ids = new Set<string>();
  for (const cue of raw.cues) {
    if (!cue.id || ids.has(cue.id) || !cue.text || !Number.isFinite(cue.start) || !Number.isFinite(cue.end)) throw Error('Invalid lyric cue');
    ids.add(cue.id);
    if (cue.start < previousEnd - .08 || cue.end <= cue.start || cue.end > raw.sourceDuration + .01) throw Error(`Cue order or range is invalid: ${cue.id}`);
    if (!Array.isArray(cue.words) || cue.words.length !== cue.text.trim().split(/\s+/u).length) throw Error(`Word coverage differs from lyric text: ${cue.id}`);
    let previousWordEnd = cue.start - .02;
    for (const word of cue.words) {
      if (!word.text || !Number.isFinite(word.start) || !Number.isFinite(word.end) || word.end <= word.start || word.start < cue.start - .02 || word.end > cue.end + .02 || word.start < previousWordEnd - .08) throw Error(`Invalid word interval: ${cue.id}`);
      previousWordEnd = word.end;
    }
    previousEnd = cue.end;
  }
  return raw;
}
function parseFeatures(input: unknown): Features {
  if (!input || typeof input !== 'object') throw Error('Audio feature data is not an object');
  const data = input as Features;
  if (data.schemaVersion !== 1 || data.sourceSha256 !== SOURCE_HASH || data.analysis?.frameRate?.numerator !== 24000 || data.analysis?.frameRate?.denominator !== 1001 || !Array.isArray(data.rows) || data.rows.length < 6153) throw Error('Audio features do not match the locked source');
  if (data.rows.some(row => row.length !== 26 || row.some(v => !Number.isInteger(v) || v < 0 || v > 255))) throw Error('Invalid measured audio feature row');
  return data;
}
function bandCalibration(rows: number[][]): void {
  lowBands = []; highBands = [];
  const body = rows.slice(0, Math.floor(234 * FPS));
  for (let band = 0; band < 24; band++) {
    const values = body.map(row => row[band + 2] ?? 0).sort((a, b) => a - b);
    lowBands.push(values[Math.floor(values.length * .16)] ?? 0);
    highBands.push(values[Math.floor(values.length * .91)] ?? 255);
  }
}
async function loadJson(url: string): Promise<unknown> {
  const response = await fetch(url, {cache: 'no-store'});
  if (!response.ok) throw Error(`Could not load ${url} (${response.status})`);
  return response.json() as Promise<unknown>;
}
async function loadStill(name: string): Promise<HTMLImageElement> {
  const image = new Image(); image.src = `/public/bridge-${name}.jpg`;
  await image.decode();
  if (image.naturalWidth !== 1920 || image.naturalHeight !== 1080) throw Error(`Source bridge ${name} does not match the picture`);
  return image;
}
async function loadSprite(): Promise<HTMLImageElement> {
  const image = new Image(); image.src = '/public/bridge-mid-sprite.jpg';
  await image.decode();
  if (image.naturalWidth !== 7680 || image.naturalHeight !== 2688) throw Error('The original-footage memory sequence is unavailable');
  return image;
}
export async function loadScene(): Promise<void> {
  const [lyricData, audioData, intro, mid, title, credits, stageLight, blueFace, sprite] = await Promise.all([
    loadJson('/public/timeline.json'), loadJson('/public/audio-features.json'),
    loadStill('intro'), loadStill('mid'), loadStill('title'), loadStill('credits'), loadStill('stage-light'), loadStill('blue-face'), loadSprite(),
  ]);
  timeline = parseTimeline(lyricData); features = parseFeatures(audioData);
  bridge.set('intro', intro); bridge.set('mid', mid);
  bridge.set('title', title); bridge.set('credits', credits); bridge.set('mid-sprite', sprite);
  bridge.set('stage-light', stageLight);
  bridge.set('blue-face', blueFace);
  bandCalibration(features.rows);
  const loaded = await document.fonts.load('900 64px ArchivoBlack');
  if (!loaded.length || !document.fonts.check('900 64px ArchivoBlack')) throw Error('Film lettering font is unavailable');
  sampler = document.createElement('canvas'); sampler.width = 160; sampler.height = 90;
  samplerCtx = sampler.getContext('2d', {willReadFrequently: true}) ?? undefined;
  colorMask = document.createElement('canvas'); colorMask.width = 160; colorMask.height = 90;
  colorMaskCtx = colorMask.getContext('2d') ?? undefined;
  lastLive = document.createElement('canvas'); lastLive.width = 1920; lastLive.height = 1080;
  lastLiveCtx = lastLive.getContext('2d') ?? undefined;
  spriteFrame = document.createElement('canvas'); spriteFrame.width = 1920; spriteFrame.height = 1080;
  spriteFrameCtx = spriteFrame.getContext('2d') ?? undefined;
  titleMask = document.createElement('canvas'); titleMask.width = 1920; titleMask.height = ACTIVE_HEIGHT;
  titleMaskCtx = titleMask.getContext('2d', {willReadFrequently: true}) ?? undefined;
  artistLayer = document.createElement('canvas'); artistLayer.width = 1920; artistLayer.height = 1080;
  artistLayerCtx = artistLayer.getContext('2d') ?? undefined;
  if (!samplerCtx || !colorMaskCtx || !lastLiveCtx || !spriteFrameCtx || !titleMaskCtx || !artistLayerCtx) throw Error('Source picture canvas is unavailable');
  positions.clear(); lastLiveTime = -100;
}
export function getLines(): {id: string; label: string; start: number; end: number}[] {
  return timeline?.cues.map(cue => ({id: cue.id, label: cue.text, start: cue.start, end: cue.end})) ?? [];
}

// Fill either output with the source's actual 1920×672 moving picture.
// The encoded 204px black mattes are never drawn.
export function geometry(format: Format, shot: Shot): Geometry {
  const landscape = format === 'landscape';
  const w = landscape ? 1920 : 1080, h = landscape ? 1080 : 1920;
  const sourceWidth = ACTIVE_HEIGHT * w / h;
  const center = landscape ? shot.landscapeCenter : shot.portraitCenter;
  const x = clamp(center - sourceWidth / 2, 0, 1920 - sourceWidth);
  return {w, h, source: {x, y: ACTIVE_TOP, w: sourceWidth, h: ACTIVE_HEIGHT}, destination: {x: 0, y: 0, w, h}};
}
function drawCrop(c: Ctx, image: CanvasImageSource, g: Geometry, zoom = 1): void {
  const w = g.source.w / zoom, h = g.source.h / zoom;
  const x = g.source.x + (g.source.w - w) / 2, y = g.source.y + (g.source.h - h) / 2;
  c.drawImage(image, x, y, w, h, 0, 0, g.w, g.h);
}
function sourceSample(image: CanvasImageSource, g: Geometry): Uint8ClampedArray {
  if (!samplerCtx || !sampler) throw Error('Frame sampler is not ready');
  samplerCtx.drawImage(image, g.source.x, g.source.y, g.source.w, g.source.h, 0, 0, 160, 90);
  return samplerCtx.getImageData(0, 0, 160, 90).data;
}
function isSourceBlack(data: Uint8ClampedArray): boolean {
  let black = 0;
  for (let p = 0; p < data.length; p += 4) {
    const lum = (data[p] ?? 0) * .2126 + (data[p + 1] ?? 0) * .7152 + (data[p + 2] ?? 0) * .0722;
    if (lum < 11) black++;
  }
  return black / (data.length / 4) > .973;
}
function fallbackAt(time: number): HTMLImageElement | undefined {
  if (time >= 19.45 && time < 21.25) return bridge.get('stage-light');
  if (time >= 234.7 && time < 244.7) return bridge.get('credits');
  if (time >= 150.9 && time < 156.5) return bridge.get('mid');
  if (time >= 167.4 && time < 169) return bridge.get('title');
  if (time >= 42.5 && time < 44) return bridge.get('intro');
}
function drawPicture(c: Ctx, frame: HTMLVideoElement, time: number, g: Geometry): CanvasImageSource {
  if (time >= 43.35 && time < 44.12 && titleMask && titleMaskCtx) {
    titleMaskCtx.drawImage(frame, 0, ACTIVE_TOP, 1920, ACTIVE_HEIGHT, 0, 0, 1920, ACTIVE_HEIGHT);
    const letters = titleMaskCtx.getImageData(0, 0, 1920, ACTIVE_HEIGHT);
    let redLetters = 0;
    for (let p = 0; p < letters.data.length; p += 4) {
      const red = letters.data[p] ?? 0, green = letters.data[p + 1] ?? 0, blue = letters.data[p + 2] ?? 0;
      const alpha = clamp((red - 115) / 45) * clamp((red - green * 1.55 - 20) / 45) * clamp((red - blue * 1.6 - 20) / 45);
      letters.data[p + 3] = Math.round(alpha * 255);
      if (alpha > .5) redLetters++;
    }
    if (redLetters > 800) {
      const stage = bridge.get('intro');
      if (!stage) throw Error('The source title stage is missing');
      drawCrop(c, stage, g, 1 + (time - 43.35) * .015);
      if (g.w === 1920) {
        titleMaskCtx.putImageData(letters, 0, 0);
        c.drawImage(titleMask, 0, 0, g.w, g.h);
      } else {
        c.save(); c.textAlign = 'center'; c.textBaseline = 'alphabetic';
        c.fillStyle = '#ef342d'; c.shadowColor = 'rgba(0,0,0,.82)';
        c.shadowBlur = 9; c.shadowOffsetX = 7; c.shadowOffsetY = 8;
        c.font = '900 110px ArchivoBlack'; c.fillText('COMPUTER', 540, 770);
        c.font = '900 167px ArchivoBlack'; c.fillText('KILL', 540, 970);
        c.restore();
      }
      return stage;
    }
  }
  if (time >= 44.1 && time < 46.0 && g.w === 1920 && artistLayer && artistLayerCtx) {
    const pixels = sourceSample(frame, g);
    let redLetters = 0;
    for (let p = 0; p < pixels.length; p += 4) {
      const r = pixels[p] ?? 0, green = pixels[p + 1] ?? 0, blue = pixels[p + 2] ?? 0;
      if (r > 145 && r > green * 1.65 && r > blue * 1.7) redLetters++;
    }
    if (redLetters > 90) {
      // Source artist lettering is wider than a cover crop. Preserve its full
      // moving composition, extending the same picture above and below it.
      c.save(); c.filter = 'blur(16px)'; drawCrop(c, frame, g); c.restore();
      artistLayerCtx.clearRect(0, 0, 1920, 1080);
      artistLayerCtx.drawImage(frame, 0, ACTIVE_TOP, 1920, ACTIVE_HEIGHT, 0, 204, 1920, ACTIVE_HEIGHT);
      artistLayerCtx.save(); artistLayerCtx.globalCompositeOperation = 'destination-in';
      const feather = artistLayerCtx.createLinearGradient(0, 145, 0, 935);
      feather.addColorStop(0, 'rgba(0,0,0,0)');
      feather.addColorStop(.15, 'rgba(0,0,0,1)');
      feather.addColorStop(.85, 'rgba(0,0,0,1)');
      feather.addColorStop(1, 'rgba(0,0,0,0)');
      artistLayerCtx.fillStyle = feather; artistLayerCtx.fillRect(0, 0, 1920, 1080);
      artistLayerCtx.restore();
      c.drawImage(artistLayer, 0, 0);
      return frame;
    }
  }
  if (time >= 167.55 && time < 168.8 && titleMask && titleMaskCtx) {
    titleMaskCtx.drawImage(frame, 0, ACTIVE_TOP, 1920, ACTIVE_HEIGHT, 0, 0, 1920, ACTIVE_HEIGHT);
    const letters = titleMaskCtx.getImageData(0, 0, 1920, ACTIVE_HEIGHT);
    let titlePixels = 0, redTotal = 0, greenTotal = 0, blueTotal = 0;
    for (let p = 0; p < letters.data.length; p += 4) {
      const r = letters.data[p] ?? 0, green = letters.data[p + 1] ?? 0, blue = letters.data[p + 2] ?? 0;
      const alpha = clamp((r - 145) / 40) * clamp((green - 75) / 35) * clamp((115 - blue) / 35) * clamp((r - blue - 55) / 30);
      letters.data[p + 3] = Math.round(alpha * 255);
      if (alpha > .5) {titlePixels++; redTotal += r; greenTotal += green; blueTotal += blue;}
    }
    if (titlePixels > 1000) {
      // The original title changes from copper to yellow. Keep that frame's own hue.
      c.save(); c.filter = 'blur(30px)'; drawCrop(c, frame, g); c.restore();
      if (g.w === 1920) {
        // Extract the moving source lettering so the picture remains full bleed.
        titleMaskCtx.putImageData(letters, 0, 0);
        c.drawImage(titleMask, 0, 0, g.w, g.h);
      } else {
        const color = `rgb(${Math.round(redTotal / titlePixels)},${Math.round(greenTotal / titlePixels)},${Math.round(blueTotal / titlePixels)})`;
        c.save(); c.textAlign = 'center'; c.textBaseline = 'alphabetic';
        c.font = '900 119px ArchivoBlack'; c.fillStyle = color;
        c.shadowColor = 'rgba(0,0,0,.72)'; c.shadowBlur = 13;
        c.shadowOffsetX = 7; c.shadowOffsetY = 9;
        c.fillText('MUST HAVE', 540, 750);
        c.font = '900 104px ArchivoBlack';
        c.fillText('BEEN A DREAM', 540, 923);
        c.restore();
      }
      return frame;
    }
  }
  if (time >= 151.25 && time < 156.32 && spriteFrame && spriteFrameCtx) {
    const sprite = bridge.get('mid-sprite');
    if (!sprite) throw Error('The original-footage memory sequence is missing');
    const index = Math.min(59, Math.floor((time - 151.25) * 12));
    const tileX = index % 8, tileY = Math.floor(index / 8);
    spriteFrameCtx.clearRect(0, 0, 1920, 1080);
    spriteFrameCtx.drawImage(sprite, tileX * 960, tileY * 336, 960, 336, 0, ACTIVE_TOP, 1920, ACTIVE_HEIGHT);
    drawCrop(c, spriteFrame, g);
    c.save(); c.globalCompositeOperation = 'screen'; drawCrop(c, frame, g); c.restore();
    return spriteFrame;
  }
  const encoded = sourceSample(frame, g);
  let earlyLuma = 0;
  if (time >= 19.45 && time < 21.25) {
    for (let p = 0; p < encoded.length; p += 4) earlyLuma += (encoded[p] ?? 0) * .2126 + (encoded[p + 1] ?? 0) * .7152 + (encoded[p + 2] ?? 0) * .0722;
    earlyLuma /= encoded.length / 4;
  }
  const darkStageFlash = time >= 19.45 && time < 21.25 && earlyLuma < 22;
  if (!isSourceBlack(encoded) && !darkStageFlash) {
    if (g.w === 1080 && time >= 244.55 && artistLayer && artistLayerCtx) {
      // The wide source credits become incomplete fragments under a portrait
      // cover crop. Repair only their thin red glyphs from neighboring pixels
      // in the same decoded frame; the rest of the moving picture stays sharp.
      artistLayerCtx.drawImage(frame, 0, 0, 1920, 1080);
      const width = 650, height = 50;
      const strip = artistLayerCtx.getImageData(650, 515, width, height);
      const original = new Uint8ClampedArray(strip.data);
      const mask = new Uint8Array(width * height);
      for (let y = 8; y < 42; y++) for (let x = 0; x < width; x++) {
        const p = (y * width + x) * 4;
        const red = original[p] ?? 0, green = original[p + 1] ?? 0, blue = original[p + 2] ?? 0;
        if (red > 55 && red > green + 4 && red > blue + 4) mask[y * width + x] = 1;
      }
      const expanded = new Uint8Array(mask);
      for (let y = 9; y < 41; y++) for (let x = 1; x < width - 1; x++) {
        const p = y * width + x;
        if (mask[p] || mask[p - 1] || mask[p + 1] || mask[p - width] || mask[p + width]) expanded[p] = 1;
      }
      for (let y = 9; y < 41; y++) for (let x = 1; x < width - 1; x++) {
        if (!expanded[y * width + x]) continue;
        const sums = [0, 0, 0]; let weight = 0;
        for (const [dx, dy] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) {
          for (let distance = 1; distance <= 18; distance++) {
            const sx = x + dx! * distance, sy = y + dy! * distance;
            if (sx < 0 || sx >= width || sy < 0 || sy >= height) break;
            if (expanded[sy * width + sx]) continue;
            const sample = (sy * width + sx) * 4, w = 1 / distance;
            for (let channel = 0; channel < 3; channel++) sums[channel] = (sums[channel] ?? 0) + (original[sample + channel] ?? 0) * w;
            weight += w; break;
          }
        }
        if (!weight) continue;
        const p = (y * width + x) * 4;
        for (let channel = 0; channel < 3; channel++) strip.data[p + channel] = Math.round(sums[channel]! / weight);
      }
      artistLayerCtx.putImageData(strip, 650, 515);
      drawCrop(c, artistLayer, g);
    } else drawCrop(c, frame, g);
    if (lastLiveCtx && time - lastLiveTime > .09) {
      lastLiveCtx.drawImage(frame, 0, 0, 1920, 1080);
      lastLiveTime = time;
    }
    return frame;
  }
  const recorded = fallbackAt(time);
  const previous = Math.abs(time - lastLiveTime) < 1.1 ? lastLive : undefined;
  const memory = recorded ?? previous;
  if (!memory) {drawCrop(c, frame, g); return frame;}
  if (darkStageFlash && memory === bridge.get('stage-light')) {
    const selected = g.w === 1920 ? bridge.get('blue-face') : memory;
    if (!selected) throw Error('The source flash bridge is missing');
    const crop = g.w === 1920 ? {...g, source: {...g.source, x: 365}} : g;
    drawCrop(c, selected, crop, 1 + Math.min(.012, Math.max(0, time - 19.45) * .008));
    return selected;
  }
  const longBridge = (time >= 150.9 && time < 156.5) || (time >= 234.7 && time < 244.7);
  const drift = longBridge ? Math.min(.045, Math.max(0, time - (time < 200 ? 151.25 : 234.9)) * .004) : 0;
  drawCrop(c, memory, g, 1 + drift);
  // Source-authored title and credit lettering is retained over picture.
  c.save(); c.fillStyle = longBridge ? 'rgba(0,0,0,.32)' : 'rgba(0,0,0,.18)';
  c.fillRect(0, 0, g.w, g.h);
  c.globalCompositeOperation = 'screen'; drawCrop(c, frame, g); c.restore();
  return memory;
}
function sampleAt(time: number): Response {
  if (!features) throw Error('Measured features are unavailable');
  const frame = Math.floor(clamp(time * FPS, 0, features.rows.length - 1));
  const row = features.rows[frame]!;
  const rmsDb = -96 + (row[0] ?? 0) * 96 / 255;
  const riseDb = (row[1] ?? 0) * 18 / 255;
  return {
    rms: ease((rmsDb + 31) / 28), attack: ease((riseDb - .7) / 6),
    bands: Array.from({length: 24}, (_, i) => ease(((row[i + 2] ?? 0) - (lowBands[i] ?? 0)) / Math.max(16, (highBands[i] ?? 255) - (lowBands[i] ?? 0)))),
  };
}
function activeCue(time: number): Cue | undefined {
  if (!timeline) return;
  let chosen: Cue | undefined;
  for (const cue of timeline.cues) if (time >= cue.start - .15 && time < cue.end + .14) chosen = cue;
  return chosen;
}

function layout(c: Ctx, cue: Cue, format: Format, shot: Shot, g: Geometry): Position[] {
  const zone = format === 'landscape' ? shot.lyricZone ?? 'lower' : 'lower';
  const key = `${cue.id}:${format}:${zone}:${shot.lyricMaxWidth ?? 0}:${shot.portraitLyricZone ?? 'lower'}`;
  const cached = positions.get(key); if (cached) return cached;
  const tokens = cue.text.trim().split(/\s+/u);
  const side = zone === 'left' || zone === 'right';
  const maxWidth = format === 'portrait' ? 958 : shot.lyricMaxWidth ?? (side ? 1160 : 1720);
  const permitted = format === 'portrait' || side ? 3 : 2;
  let size = format === 'portrait' ? 109 : side ? 93 : 103;
  let rows: number[][] = [];
  for (; size >= 51; size--) {
    c.font = `900 ${size}px ArchivoBlack`;
    const space = c.measureText(' ').width;
    rows = [[]]; let width = 0;
    for (let i = 0; i < tokens.length; i++) {
      const measured = c.measureText(tokens[i]!).width;
      if (rows.at(-1)!.length && width + space + measured > maxWidth) {rows.push([]); width = 0;}
      rows.at(-1)!.push(i); width += measured + (rows.at(-1)!.length > 1 ? space : 0);
    }
    if (rows.length <= permitted) break;
  }
  if (size < 51 || rows.length > permitted) throw Error(`Lyric line does not fit inside the picture: ${cue.id}`);
  c.font = `900 ${size}px ArchivoBlack`;
  const space = c.measureText(' ').width;
  const baselines = format === 'portrait'
    ? shot.portraitLyricZone === 'upper'
      ? rows.length === 1 ? [690] : rows.length === 2 ? [575, 690] : [460, 575, 690]
      : rows.length === 1 ? [1645] : rows.length === 2 ? [1518, 1645] : [1393, 1519, 1645]
    : rows.length === 1 ? [879] : rows.length === 2 ? [764, 878] : [650, 764, 878];
  const placed: Position[] = [];
  for (let r = 0; r < rows.length; r++) {
    const indices = rows[r]!;
    const width = indices.reduce((sum, i, n) => sum + c.measureText(tokens[i]!).width + (n ? space : 0), 0);
    let x = side ? zone === 'left' ? 105 : g.w - 105 - width : (g.w - width) / 2;
    for (const index of indices) {
      const text = tokens[index]!, wordWidth = c.measureText(text).width;
      placed.push({text, index, x, y: baselines[r]!, size, width: wordWidth});
      x += wordWidth + space;
    }
  }
  positions.set(key, placed);
  return placed;
}
function drawLyric(c: Ctx, cue: Cue, time: number, format: Format, shot: Shot, g: Geometry, response: Response): void {
  const alpha = Math.min(ease((time - cue.start + .15) / .18), ease((cue.end + .14 - time) / .22));
  if (alpha <= 0) return;
  const placed = layout(c, cue, format, shot, g);
  c.save(); c.textAlign = 'left'; c.textBaseline = 'alphabetic'; c.lineJoin = 'round';
  for (const p of placed) {
    const word = cue.words[p.index]!;
    const active = time >= word.start && time < word.end;
    const spoken = time >= word.end;
    const local = response.bands[Math.floor(p.index / Math.max(1, cue.words.length - 1) * 23)] ?? 0;
    c.font = `900 ${p.size}px ArchivoBlack`;
    c.globalAlpha = alpha * (active ? 1 : spoken ? .92 : .72);
    c.shadowColor = 'rgba(0,0,0,.78)'; c.shadowBlur = p.size * .13;
    c.shadowOffsetX = p.size * .055; c.shadowOffsetY = p.size * .065;
    c.strokeStyle = 'rgba(3,8,14,.82)'; c.lineWidth = p.size * .115;
    c.strokeText(p.text, p.x, p.y);
    c.shadowOffsetX = 0; c.shadowOffsetY = 0;
    if (active && time >= 44.1 && time < 46.0) {
      c.fillStyle = '#9ee7f4'; c.shadowColor = 'rgba(71,205,236,.6)';
      c.shadowBlur = p.size * (.12 + .11 * response.rms);
      c.fillText(p.text, p.x, p.y);
    } else if (active) {
      const hot = clamp(.22 + response.rms * .48 + local * .32 + response.attack * .18);
      const ink = c.createLinearGradient(p.x, p.y - p.size, p.x + p.width, p.y);
      ink.addColorStop(0, '#ef322e');
      ink.addColorStop(.5, hot > .68 ? '#ff9f6b' : '#ff5242');
      ink.addColorStop(1, hot > .82 ? '#ffe1a4' : '#fa4639');
      c.fillStyle = ink; c.shadowColor = `rgba(239,55,46,${.16 + .32 * hot})`;
      c.shadowBlur = p.size * (.09 + .14 * response.rms);
      c.fillText(p.text, p.x, p.y);
      // Audio transients live on the sung glyph, not in a separate graph.
      if (response.attack > .27) {
        c.globalAlpha = alpha * response.attack * .16;
        c.shadowBlur = 0; c.fillStyle = '#78c8da';
        c.fillText(p.text, p.x + 2 + response.attack * 3, p.y - 1);
      }
    } else {
      c.shadowBlur = 0; c.fillStyle = spoken ? '#f1eee8' : '#c4cdd0';
      c.fillText(p.text, p.x, p.y);
    }
  }
  c.restore();
}

function imageLightResponse(c: Ctx, image: CanvasImageSource, g: Geometry, response: Response, shot: Shot, time: number): void {
  if (time >= 234.5 || response.rms < .045) return;
  const rgba = sourceSample(image, g);
  const brightness = (x: number, y: number) => {
    const p = (y * 160 + x) * 4;
    return (rgba[p] ?? 0) * .2126 + (rgba[p + 1] ?? 0) * .7152 + (rgba[p + 2] ?? 0) * .0722;
  };
  const candidates: {x: number; y: number; score: number; r: number; green: number; b: number}[] = [];
  for (let y = 7; y < 86; y += 2) for (let x = 5; x < 155; x += 2) {
    const p = (y * 160 + x) * 4;
    const r = rgba[p] ?? 0, green = rgba[p + 1] ?? 0, b = rgba[p + 2] ?? 0;
    const lum = brightness(x, y);
    const nearby = (brightness(x - 3, y) + brightness(x + 3, y) + brightness(x, y - 3) + brightness(x, y + 3)) / 4;
    // Only brighten real pale/cyan lamps, glass glints, and stage lights.
    if (lum < 116 || lum - nearby < 16 || b < r * .79 || b < green * .78) continue;
    if (shot.mood === 'street' && x > 58 && x < 102 && y > 20 && y < 65) continue;
    const sx = x / 160 * g.w, sy = y / 90 * g.h;
    candidates.push({x: sx, y: sy, score: lum - nearby + lum * .1, r, green, b});
  }
  candidates.sort((a, b) => b.score - a.score);
  const chosen: typeof candidates = [];
  for (const item of candidates) {
    if (chosen.some(other => Math.hypot(item.x - other.x, item.y - other.y) < (g.w === 1920 ? 155 : 115))) continue;
    chosen.push(item); if (chosen.length === 9) break;
  }
  c.save(); c.globalCompositeOperation = 'screen';
  for (const light of chosen) {
    const band = Math.floor(clamp(light.x / g.w, 0, .999) * 24);
    const local = response.bands[band] ?? 0;
    const power = response.rms * (.31 + .69 * local) + response.attack * .13;
    const radius = (g.w === 1920 ? 135 : 125) * (.65 + power * .88);
    const alpha = clamp(.055 + .25 * power, 0, .32);
    const gradient = c.createRadialGradient(light.x, light.y, 0, light.x, light.y, radius);
    gradient.addColorStop(0, `rgba(${light.r},${light.green},${light.b},${alpha})`);
    gradient.addColorStop(.18, `rgba(${light.r},${light.green},${light.b},${alpha * .57})`);
    gradient.addColorStop(1, `rgba(${light.r},${light.green},${light.b},0)`);
    c.fillStyle = gradient; c.fillRect(light.x - radius, light.y - radius, radius * 2, radius * 2);
    if (response.attack > .3 && power > .23) {
      const length = radius * (shot.mood === 'stage' ? 1.1 : 1.35);
      const ray = shot.mood === 'street' && light.y > g.h * .57
        ? c.createLinearGradient(light.x, light.y, light.x, light.y + length)
        : c.createLinearGradient(light.x - length, light.y, light.x + length, light.y);
      ray.addColorStop(0, `rgba(${light.r},${light.green},${light.b},0)`);
      ray.addColorStop(.5, `rgba(${light.r},${light.green},${light.b},${alpha * response.attack * .26})`);
      ray.addColorStop(1, `rgba(${light.r},${light.green},${light.b},0)`);
      c.fillStyle = ray;
      if (shot.mood === 'street' && light.y > g.h * .57) c.fillRect(light.x - 3, light.y, 6, length);
      else c.fillRect(light.x - length, light.y - 2, length * 2, 4);
    }
  }
  c.restore();
}

function surfaceResponse(c: Ctx, image: CanvasImageSource, g: Geometry, response: Response, shot: Shot, time: number): void {
  if (time >= 234.5 || response.rms < .11 || shot.protectSourceText) return;
  if (!['street', 'day', 'transit', 'stage'].includes(shot.mood)) return;
  const rgba = sourceSample(image, g);
  const portrait = g.h > g.w;
  const stride = portrait ? 2 : 1;
  const bins = 24;
  c.save(); c.globalCompositeOperation = 'screen';
  for (let band = 0; band < bins; band += stride) {
    const local = response.bands[band] ?? 0;
    const energy = response.rms * (.18 + .82 * local);
    if (energy < .17) continue;
    const lo = shot.mood === 'street' || shot.mood === 'day' ? 65 : shot.mood === 'transit' ? 17 : 6;
    const hi = shot.mood === 'street' || shot.mood === 'day' ? 87 : shot.mood === 'transit' ? 58 : 38;
    const x0 = Math.floor((band + .12) / bins * 160);
    const x1 = Math.min(157, Math.ceil((band + .88) / bins * 160));
    let found: {x: number; y: number; r: number; green: number; b: number; score: number} | undefined;
    for (let y = lo; y <= hi; y += 2) for (let x = x0; x <= x1; x++) {
      const p = (y * 160 + x) * 4;
      const r = rgba[p] ?? 0, green = rgba[p + 1] ?? 0, b = rgba[p + 2] ?? 0;
      const lum = .2126 * r + .7152 * green + .0722 * b;
      const score = lum + (shot.mood === 'street' ? Math.max(0, b - r) * .17 : 0);
      if (!found || score > found.score) found = {x, y, r, green, b, score};
    }
    if (!found || found.score < (shot.mood === 'day' ? 84 : shot.mood === 'stage' ? 53 : 37)) continue;
    const x = found.x / 160 * g.w, y = found.y / 90 * g.h;
    const color = shot.mood === 'stage'
      ? [78, 150 + Math.round(50 * local), 235]
      : shot.mood === 'transit'
        ? [116, 203, 237]
        : shot.mood === 'day'
          ? [232, 178, 156]
          : [224, 92 + Math.round(32 * local), 84];
    const alpha = Math.min(.35, (.055 + .26 * energy + .08 * response.attack) * (shot.mood === 'day' ? .55 : 1));
    if (shot.mood === 'street' || shot.mood === 'day') {
      // Band energy lengthens a reflection on bright source pavement, rather
      // than erecting a row of bars over the picture.
      const length = (portrait ? 160 : 90) * (.25 + energy * 1.25);
      const width = (portrait ? 12 : 8) * (.4 + local * .8);
      const reflection = c.createLinearGradient(x, y - length * .22, x, y + length);
      reflection.addColorStop(0, `rgba(${color.join(',')},0)`);
      reflection.addColorStop(.22, `rgba(${color.join(',')},${alpha})`);
      reflection.addColorStop(.5, `rgba(${color.join(',')},${alpha * .45})`);
      reflection.addColorStop(1, `rgba(${color.join(',')},0)`);
      c.fillStyle = reflection; c.shadowColor = `rgb(${color.join(',')})`;
      c.shadowBlur = 16 + energy * 25;
      c.fillRect(x - width / 2, y - length * .22, width, length * 1.22);
    } else if (shot.mood === 'transit') {
      // Short cyan streaks stay on actual illuminated glass/roof pixels.
      const length = (portrait ? 115 : 145) * (.3 + energy);
      const reflection = c.createLinearGradient(x - length, y, x + length, y);
      reflection.addColorStop(0, `rgba(${color.join(',')},0)`);
      reflection.addColorStop(.5, `rgba(${color.join(',')},${alpha})`);
      reflection.addColorStop(1, `rgba(${color.join(',')},0)`);
      c.fillStyle = reflection; c.shadowColor = `rgb(${color.join(',')})`;
      c.shadowBlur = 12 + energy * 18;
      c.fillRect(x - length, y - 2.2, length * 2, 4.4);
    } else {
      // Blue cones originate at measured hot stage pixels in the source.
      const length = (portrait ? 420 : 310) * (.2 + energy);
      const beam = c.createLinearGradient(x, y, x, y + length);
      beam.addColorStop(0, `rgba(${color.join(',')},${alpha * .8})`);
      beam.addColorStop(1, `rgba(${color.join(',')},0)`);
      c.save(); c.fillStyle = beam; c.shadowBlur = 0; c.filter = 'blur(16px)';
      c.beginPath(); c.moveTo(x - 4, y); c.lineTo(x + 4, y);
      c.lineTo(x + length * .21, y + length);
      c.lineTo(x - length * .21, y + length); c.closePath(); c.fill(); c.restore();
    }
  }
  c.restore();
}

function sourceColorResponse(c: Ctx, image: CanvasImageSource, g: Geometry, response: Response, shot: Shot): void {
  if (!colorMask || !colorMaskCtx || shot.protectSourceText) return;
  const picture = sourceSample(image, g);
  const mask = colorMaskCtx.createImageData(160, 90);
  let colored = 0;
  for (let y = 0; y < 90; y++) for (let x = 0; x < 160; x++) {
    const p = (y * 160 + x) * 4;
    const red = picture[p] ?? 0, green = picture[p + 1] ?? 0, blue = picture[p + 2] ?? 0;
    const band = response.bands[Math.min(23, Math.floor(x / 160 * 24))] ?? 0;
    const power = response.rms * (.28 + .72 * band) + .17 * response.attack;
    let presence = 0;
    if (shot.mood === 'stage') {
      presence = clamp((blue - red * 1.24) / 85) * clamp((blue - 95) / 115);
      mask.data[p] = 76; mask.data[p + 1] = 177; mask.data[p + 2] = 255;
    } else {
      presence = clamp((red - green * 1.32) / 80) * clamp((red - blue * 1.14) / 80) * clamp((red - 60) / 120);
      mask.data[p] = 255; mask.data[p + 1] = 65 + Math.round(65 * band); mask.data[p + 2] = 46;
    }
    const alpha = presence * (.10 + .55 * power);
    mask.data[p + 3] = Math.round(255 * Math.min(.59, alpha));
    if (alpha > .08) colored++;
  }
  if (colored < 25) return;
  colorMaskCtx.putImageData(mask, 0, 0);
  c.save(); c.globalCompositeOperation = 'screen'; c.imageSmoothingEnabled = true;
  c.filter = 'blur(12px)'; c.globalAlpha = .76;
  c.drawImage(colorMask, 0, 0, g.w, g.h);
  c.filter = 'none'; c.globalAlpha = .32;
  c.drawImage(colorMask, 0, 0, g.w, g.h);
  c.restore();
}

export function paintScene(c: Ctx, time: number, format: Format, frame: HTMLVideoElement): void {
  if (!timeline || !features) throw Error('The complete lyric and audio scene is not ready');
  if (frame.readyState < HTMLMediaElement.HAVE_CURRENT_DATA || !frame.videoWidth || !frame.videoHeight) throw Error('Original picture has not decoded');
  const shot = shotAt(time), g = geometry(format, shot);
  c.clearRect(0, 0, g.w, g.h);
  const picture = drawPicture(c, frame, time, g);
  if (time < 234.5) {
    const response = sampleAt(time);
    imageLightResponse(c, picture, g, response, shot, time);
    surfaceResponse(c, picture, g, response, shot, time);
    sourceColorResponse(c, picture, g, response, shot);
    const cue = activeCue(time);
    if (cue) drawLyric(c, cue, time, format, shot, g, response);
  }
}
