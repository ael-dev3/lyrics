import {bindText, clamp, cueIndexAt, cueWindow, mix, parseFeatures, parseTimeline, parseTones, smooth, wordActive} from './model.ts';
import type {Cue, Effect, Features, Format, Timeline, Tones, Word} from './model.ts';
import {parseLyrics} from './lyrics.ts';
import {INSTRUMENTAL, PALETTE, SECTIONS, sectionOfLine} from './song.ts';
import {FIT_BAND, outputSize, placement, shotAt, type Box, type Placement} from './frame.ts';
import type {Shot} from './shots.ts';
export type {Format} from './model.ts';

type Ctx = CanvasRenderingContext2D;
type Canvas = HTMLCanvasElement;
type RGB = [number, number, number];
export const FONT = 'OswaldLYD';
const SKEW = 0.13; // the film's own UI lettering leans forward; glyph boxes stay fixed
const hexRgb = (hex: string): RGB => [parseInt(hex.slice(1, 3), 16), parseInt(hex.slice(3, 5), 16), parseInt(hex.slice(5, 7), 16)];
const rgba = (rgb: RGB, a: number): string => `rgba(${rgb[0]},${rgb[1]},${rgb[2]},${clamp(a).toFixed(4)})`;
const lerpRgb = (a: RGB, b: RGB, f: number): RGB => [Math.round(mix(a[0], b[0], f)), Math.round(mix(a[1], b[1], f)), Math.round(mix(a[2], b[2], f))];

// ---------------------------------------------------------------------------
// Canvas factory (the browser uses DOM canvases; the renderer injects Skia).
let makeCanvas = (w: number, h: number): Canvas => {const c = document.createElement('canvas'); c.width = w; c.height = h; return c;};
export function setCanvasFactory(factory: (w: number, h: number) => Canvas): void {makeCanvas = factory;}
const context = (c: Canvas, read = false): Ctx => {const x = c.getContext('2d', read ? {willReadFrequently: true} : undefined); if (!x) throw Error('Canvas 2D unavailable'); return x as Ctx;};

// ---------------------------------------------------------------------------
// Loaded, immutable scene data.
type State = {
  timeline: Timeline | null; cues: Cue[]; placeholder: boolean;
  features: Features; data: DataView; frames: number;
  bands: Float32Array; lightBands: Float32Array; energy: Float32Array; vocal: Float32Array;
  tones: Tones; ink: Record<string, Float32Array>;
  tiers: {start: number; end: number; tier: number}[];
};
let S: State | undefined;
export type SceneInputs = {timeline: unknown | null; features: unknown; featureBytes: ArrayBuffer; tones: unknown; lyricsText: string | null; lyricsSha256: string | null; placeholder: boolean};

export function loadScene(input: SceneInputs): void {
  const features = parseFeatures(input.features, input.featureBytes.byteLength);
  const data = new DataView(input.featureBytes), n = features.frameCount, F = features.scalarsPerFrame;
  const m = features.displayMapping, norm = (v: number, r: {minimum: number; maximum: number}): number => clamp((v - r.minimum) / (r.maximum - r.minimum));
  // Deterministic display envelopes computed once over the whole recording:
  // asymmetric attack/release in source frames. Seeks and slow playback read
  // the same values; nothing integrates browser time.
  const bands = new Float32Array(n * 48), lightBands = new Float32Array(n * 48), energy = new Float32Array(n), vocal = new Float32Array(n);
  const bar = new Float32Array(48), glow = new Float32Array(48);
  let e = 0, v = 0;
  for (let i = 0; i < n; i++) {
    const raw = (k: number): number => data.getFloat32((i * F + k) * 4, true);
    const er = norm(raw(0), m.rmsDb), vr = norm(raw(2), m.vocalRmsDb);
    e += (er - e) * (er > e ? 0.5 : 0.08); v += (vr - v) * (vr > v ? 0.45 : 0.1);
    energy[i] = e; vocal[i] = v;
    for (let b = 0; b < 48; b++) {
      const x = norm(raw(3 + b), m.bandsDb[b]!);
      bar[b]! += (x - bar[b]!) * (x > bar[b]! ? 0.62 : 0.2);
      glow[b]! += (x - glow[b]!) * (x > glow[b]! ? 0.42 : 0.075);
      bands[i * 48 + b] = bar[b]!; lightBands[i * 48 + b] = glow[b]!;
    }
  }
  const tones = parseTones(input.tones);
  // Ink factor per zone: bright picture under the words → dark ink type. A
  // centred max (±3 frames) then mean (±4) keeps single flash frames and
  // dissolve flicker from toggling the lettering.
  // Two tracks per zone: `ink` (only near-white memory frames flip the type to
  // dark ink, with a steep curve so mid-bright frames never leave grey text)
  // and `bright` (how much extra shading light type needs on brighter frames).
  const ink: Record<string, Float32Array> = {};
  tones.fields.forEach((field, fi) => {
    const src = tones.values[fi]!, count = src.length, peak = new Float32Array(count), level = new Float32Array(count), out = new Float32Array(count), bright = new Float32Array(count);
    for (let k = 0; k < count; k++) {let mx = 0; for (let j = Math.max(0, k - 3); j <= Math.min(count - 1, k + 3); j++) mx = Math.max(mx, src[j]!); peak[k] = mx;}
    for (let k = 0; k < count; k++) {let s = 0, c = 0; for (let j = Math.max(0, k - 4); j <= Math.min(count - 1, k + 4); j++) {s += peak[j]!; c++;} level[k] = s / c;}
    for (let k = 0; k < count; k++) {out[k] = smooth((level[k]! - 212) / 26); bright[k] = smooth((level[k]! - 105) / 95);}
    ink[field] = out; ink[`${field}:bright`] = bright;
  });
  let timeline: Timeline | null = null, cues: Cue[] = [];
  if (input.timeline) {
    timeline = parseTimeline(input.timeline);
    const lyrics = input.lyricsText !== null && !input.placeholder ? parseLyrics(input.lyricsText) : null;
    if (!lyrics && !input.placeholder) throw Error('Lyric text is required unless placeholder mode is requested');
    cues = bindText(timeline, lyrics, input.lyricsSha256);
  }
  S = {timeline, cues, placeholder: input.placeholder, features, data, frames: n, bands, lightBands, energy, vocal, tones, ink, tiers: buildTiers(cues)};
  layoutCache = new WeakMap();
}
export const sceneReady = (): boolean => S !== undefined;
/** Bound cues (for verification tools; read-only). */
export const getCues = (): readonly Cue[] => S?.cues ?? [];
/** Reading-zone ink factor at t (0 = light neon type, 1 = dark ink type). */
export function inkFor(format: Format, t: number): number {
  const shot = shotAt(t), p = placement(format, shot, t);
  if (p.mode === 'fit') return 0;
  return inkAt(format === 'portrait' ? 'portraitLower' : shot.zone === 'upper' ? 'landscapeUpper' : shot.zone === 'bottom' ? 'landscapeBottom' : 'landscapeLower', t);
}
export {SKEW};
export function getLines(): {id: string; label: string; start: number; end: number; review: boolean}[] {
  if (!S) return [];
  return S.cues.map((q, i) => {
    const [start, end] = cueWindow(S!.cues, i, S!.timeline!.duration);
    return {id: q.id, label: q.words.map(w => w.text).join(' '), start, end, review: q.words.some(w => w.review === 'priority')};
  });
}

// Section tiers: reach allowed to the measured light and the spectrum.
function buildTiers(cues: Cue[]): {start: number; end: number; tier: number}[] {
  const spans = SECTIONS.map(s => {
    const lines = cues.filter(q => q.line >= s.first && q.line <= s.last);
    return lines.length ? {id: s.id, start: lines[0]!.start, end: Math.max(...lines.map(q => q.end)), tier: s.tier} : null;
  });
  if (spans.some(s => !s)) {
    // Before timing exists: the measured vocal-activity map (evidence/audio-features-audit.json).
    return [{start: INSTRUMENTAL.introStart, end: 36.8, tier: INSTRUMENTAL.introTier}, {start: 36.8, end: 108.2, tier: 0.6},
      {start: 108.2, end: 123.2, tier: INSTRUMENTAL.dropTier}, {start: 123.2, end: 232, tier: 0.85}];
  }
  const s = spans as {id: string; start: number; end: number; tier: number}[];
  const out = [{start: INSTRUMENTAL.introStart, end: s[0]!.start - 0.4, tier: INSTRUMENTAL.introTier}];
  for (let i = 0; i < s.length; i++) {
    const cur = s[i]!, next = s[i + 1];
    out.push({start: cur.start - 0.4, end: cur.end + 0.4, tier: cur.tier});
    if (next) out.push({start: cur.end + 0.4, end: next.start - 0.4, tier: cur.id === 'chorus-1' ? INSTRUMENTAL.dropTier : (cur.tier + next.tier) / 2});
  }
  out.push({start: s.at(-1)!.end + 0.4, end: INSTRUMENTAL.visualEnd, tier: INSTRUMENTAL.tailTier});
  return out.filter(x => x.end > x.start);
}
function tierAt(t: number): number {
  if (!S) return 0;
  let value = 0;
  // Each span contributes with 0.7 s smooth edges, so tier changes glide.
  for (const span of S.tiers) {
    const w = Math.min(smooth((t - span.start + 0.35) / 0.7), smooth((span.end - t + 0.35) / 0.7));
    value = Math.max(value, span.tier * w);
  }
  return value * smooth((INSTRUMENTAL.visualEnd - t) / 0.45);
}

// ---------------------------------------------------------------------------
// Measured values at source time t (linear interpolation between 60 Hz rows).
function frameLerp(t: number): {a: number; b: number; f: number} {
  const p = clamp(t * 60, 0, S!.frames - 1), a = Math.floor(p);
  return {a, b: Math.min(S!.frames - 1, a + 1), f: p - a};
}
function bandsAt(arr: Float32Array, t: number, out: Float32Array): Float32Array {
  const {a, b, f} = frameLerp(t);
  for (let k = 0; k < 48; k++) out[k] = mix(arr[a * 48 + k]!, arr[b * 48 + k]!, f);
  return out;
}
const scalarAt = (arr: Float32Array, t: number): number => {const {a, b, f} = frameLerp(t); return mix(arr[a]!, arr[b]!, f);};
function inkAt(field: string, t: number): number {
  const arr = S!.ink[field]; if (!arr) return 0;
  const p = clamp(t / S!.tones.frameDuration - 0.5, 0, arr.length - 1), a = Math.floor(p), b = Math.min(arr.length - 1, a + 1);
  return mix(arr[a]!, arr[b]!, p - a);
}

// ---------------------------------------------------------------------------
// Offscreen buffers.
let buffers: {sample: Canvas; sctx: Ctx; emit: Canvas; ectx: Ctx; blur: Canvas; bctx: Ctx; fill: Canvas; fctx: Ctx; spec: Canvas; spctx: Ctx; specBlur: Canvas; sbctx: Ctx; ghost: Canvas; gctx: Ctx} | undefined;
function buf(): NonNullable<typeof buffers> {
  if (buffers) return buffers;
  const sample = makeCanvas(384, 384), emit = makeCanvas(384, 384), blur = makeCanvas(384, 384), fill = makeCanvas(270, 480);
  const spec = makeCanvas(460, 140), specBlur = makeCanvas(460, 140), ghost = makeCanvas(1920, 360);
  buffers = {sample, sctx: context(sample, true), emit, ectx: context(emit), blur, bctx: context(blur), fill, fctx: context(fill), spec, spctx: context(spec), specBlur, sbctx: context(specBlur), ghost, gctx: context(ghost)};
  return buffers;
}

// ---------------------------------------------------------------------------
// 1. Picture.
function drawPicture(c: Ctx, frame: CanvasImageSource, p: Placement): void {
  if (p.mode !== 'fit') {c.drawImage(frame, p.src.x, p.src.y, p.src.w, p.src.h, p.dst.x, p.dst.y, p.dst.w, p.dst.h); return;}
  // Authored lettering in portrait: the whole moving frame in a band, over a
  // dim, blurred fill made from the same frame (no replacement imagery).
  const {fill, fctx} = buf();
  fctx.clearRect(0, 0, 270, 480);
  // Blur at the fill's small size (cheap), then enlarge: soft, never a new image.
  // Heavy blur + dark veil so authored text never reads twice in the fill.
  fctx.filter = 'blur(14px)';
  fctx.drawImage(frame, (1920 - 1080 * 9 / 16) / 2, 0, 1080 * 9 / 16, 1080, -40, -40, 350, 560);
  fctx.filter = 'none';
  c.save();
  c.drawImage(fill, 0, 0, 1080, 1920);
  c.fillStyle = 'rgba(6,3,15,0.74)'; c.fillRect(0, 0, 1080, 1920);
  c.restore();
  c.drawImage(frame, 0, 0, 1920, 1080, p.dst.x, p.dst.y, p.dst.w, p.dst.h);
  c.save();
  c.globalAlpha = 0.32; c.fillStyle = PALETTE.glitch.left; c.fillRect(0, p.dst.y - 2, 1080, 1.5);
  c.fillStyle = PALETTE.glitch.right; c.fillRect(0, p.dst.y + p.dst.h + 0.5, 1080, 1.5);
  c.restore();
}

// 2. Measured light inside the picture's own neon. Bright, saturated source
// pixels glow with the band family that matches their hue: magenta/red with
// the low end, violet/blue with low-mids, amber with mids, cyan with the top.
const lightTmp = new Float32Array(48);
function neonLight(c: Ctx, frame: CanvasImageSource, p: Placement, t: number, strength: number): void {
  if (strength <= 0.01) return;
  const {sample, sctx, emit, ectx, blur, bctx} = buf();
  const landscape = p.dst.w > p.dst.h;
  const w = landscape || p.mode === 'fit' ? 384 : 216, h = landscape || p.mode === 'fit' ? 216 : 384;
  sctx.clearRect(0, 0, w, h);
  sctx.drawImage(frame, p.src.x, p.src.y, p.src.w, p.src.h, 0, 0, w, h);
  const img = sctx.getImageData(0, 0, w, h), px = img.data;
  const lb = bandsAt(S!.lightBands, t, lightTmp);
  const avg = (a: number, b: number): number => {let s = 0; for (let k = a; k <= b; k++) s += lb[k]!; return s / (b - a + 1);};
  const low = avg(0, 11), lowMid = avg(12, 25), mid = avg(26, 34), high = avg(35, 47);
  const gains = [low, lowMid, mid, high].map(x => Math.pow(x, 1.6) * strength);
  for (let i = 0; i < px.length; i += 4) {
    const r = px[i]!, g = px[i + 1]!, b = px[i + 2]!;
    const mx = Math.max(r, g, b), mn = Math.min(r, g, b);
    if (mx < 110 || mx - mn < 45) {px[i + 3] = 0; continue;}
    const sat = (mx - mn) / mx, val = mx / 255;
    let hue: number;
    const d = mx - mn;
    if (mx === r) hue = ((g - b) / d + 6) % 6; else if (mx === g) hue = (b - r) / d + 2; else hue = (r - g) / d + 4;
    hue /= 6;
    const family = hue > 0.82 || hue < 0.04 ? 0 : hue > 0.62 ? 1 : hue < 0.42 ? 2 : 3;
    const a = smooth((val - 0.45) / 0.3) * smooth((sat - 0.35) / 0.3) * gains[family]!;
    px[i + 3] = Math.min(255, a * 255);
  }
  ectx.clearRect(0, 0, w, h); ectx.putImageData(img, 0, 0);
  bctx.clearRect(0, 0, w, h); bctx.filter = `blur(${landscape ? 3.2 : 3.6}px)`; bctx.drawImage(emit, 0, 0, w, h, 0, 0, w, h); bctx.filter = 'none';
  c.save(); c.globalCompositeOperation = 'screen';
  c.globalAlpha = 0.9; c.drawImage(blur, 0, 0, w, h, p.dst.x, p.dst.y, p.dst.w, p.dst.h);
  c.globalAlpha = 0.42; c.drawImage(emit, 0, 0, w, h, p.dst.x, p.dst.y, p.dst.w, p.dst.h);
  c.restore();
}

// 3. Continuous readability shading: never a cue-shaped panel.
function shade(c: Ctx, format: Format, shot: Shot, p: Placement, ink: number, bright: number): void {
  const {w, h} = outputSize(format);
  if (p.mode === 'fit') return; // the fill is already dimmed
  // Light type needs more shade over brighter pictures; ink type needs none.
  const dark = (1 - ink) * (1 + 0.45 * bright);
  c.save();
  if (format === 'landscape') {
    const upper = shot.zone === 'upper';
    const g = upper ? c.createLinearGradient(0, 0, 0, 430) : c.createLinearGradient(0, 1080, 0, 560);
    g.addColorStop(0, `rgba(7,3,17,${Math.min(0.86, 0.62 * dark)})`); g.addColorStop(0.45, `rgba(7,3,17,${Math.min(0.6, 0.34 * dark)})`); g.addColorStop(1, 'rgba(7,3,17,0)');
    c.fillStyle = g; c.fillRect(0, upper ? 0 : 560, w, upper ? 430 : 520);
    if (!upper) {const g2 = c.createLinearGradient(0, 0, 0, 170); g2.addColorStop(0, `rgba(7,3,17,${0.16 * (1 - ink)})`); g2.addColorStop(1, 'rgba(7,3,17,0)'); c.fillStyle = g2; c.fillRect(0, 0, w, 170);}
  } else {
    const g = c.createLinearGradient(0, h, 0, 980);
    g.addColorStop(0, `rgba(7,3,17,${Math.min(0.9, 0.74 * dark)})`); g.addColorStop(0.45, `rgba(7,3,17,${Math.min(0.66, 0.44 * dark)})`); g.addColorStop(1, 'rgba(7,3,17,0)');
    c.fillStyle = g; c.fillRect(0, 980, w, h - 980);
  }
  if (ink > 0.01) {
    // White memory frames: a faint lilac haze behind dark ink keeps mid-tones calm.
    const g = format === 'landscape' ? c.createLinearGradient(0, 1080, 0, 640) : c.createLinearGradient(0, 1920, 0, 1100);
    g.addColorStop(0, `rgba(248,244,255,${0.3 * ink})`); g.addColorStop(1, 'rgba(248,244,255,0)');
    c.fillStyle = g; c.fillRect(0, format === 'landscape' ? 640 : 1100, w, format === 'landscape' ? 440 : 820);
  }
  c.restore();
}

// 4. A compact cyberdeck-style spectrum in a fixed anchor (per format).
export const SPECTRUM: Record<Format, {x: number; base: number; w: number; travel: number; bars: number}> = {
  landscape: {x: 600, base: 1044, w: 720, travel: 54, bars: 48},
  portrait: {x: 180, base: 1768, w: 720, travel: 66, bars: 48},
};
const barTmp = new Float32Array(48);
const SPECTRUM_RGB = (() => {
  const [c0, c1, c2] = PALETTE.spectrum.map(hex => hexRgb(hex)) as [[number, number, number], [number, number, number], [number, number, number]];
  return Array.from({length: 48}, (_, i) => {const k = i / 47; return k < 0.5 ? lerpRgb(c0, c1, k * 2) : lerpRgb(c1, c2, (k - 0.5) * 2);});
})();
function spectrum(c: Ctx, format: Format, t: number, tier: number, ink: number): void {
  const vis = smooth(tier / 0.12);
  if (vis <= 0.01) return;
  const g = SPECTRUM[format], step = g.w / g.bars, bw = Math.max(3, step * 0.52);
  const b = bandsAt(S!.bands, t, barTmp), energy = scalarAt(S!.energy, t);
  const dim = 1 - 0.45 * ink;
  const colour = (i: number, alpha: number): string => {const [r, gg, bb] = SPECTRUM_RGB[i]!; return `rgba(${Math.round(r * dim)},${Math.round(gg * dim)},${Math.round(bb * dim)},${alpha})`;};
  const heights = Array.from({length: g.bars}, (_, i) => 2 + g.travel * (0.35 + 0.65 * tier) * Math.pow(b[i]!, 1.25));
  // Bloom: draw bars at half scale into a small layer, blur once, screen it.
  // Layer origin in output pixels: (g.x - pad, g.base - g.travel - pad).
  const {spec, spctx, specBlur, sbctx} = buf(), sc = 0.5, pad = 40;
  spctx.clearRect(0, 0, spec.width, spec.height);
  heights.forEach((hgt, i) => {spctx.fillStyle = colour(i, 1); spctx.fillRect((pad + i * step) * sc, (pad + g.travel - hgt) * sc, bw * sc, hgt * sc);});
  sbctx.clearRect(0, 0, specBlur.width, specBlur.height);
  sbctx.filter = 'blur(7px)'; sbctx.drawImage(spec, 0, 0); sbctx.filter = 'none';
  c.save();
  c.globalAlpha = vis * (0.5 + 0.3 * energy) * (1 - ink);
  c.globalCompositeOperation = 'screen';
  c.drawImage(specBlur, g.x - pad, g.base - g.travel - pad, spec.width / sc, spec.height / sc);
  c.globalCompositeOperation = 'source-over';
  c.globalAlpha = vis * (0.58 + 0.34 * energy);
  heights.forEach((hgt, i) => {
    const x = g.x + i * step;
    c.fillStyle = colour(i, 0.95); c.fillRect(x, g.base - hgt, bw, hgt);
    c.fillStyle = `rgba(255,255,255,${0.35 + 0.25 * b[i]!})`; c.fillRect(x, g.base - hgt, bw, Math.min(2, hgt));
  });
  // Hairline rail with end ticks, echoing the film's upload and deck panels.
  c.globalAlpha = vis * 0.42;
  c.fillStyle = ink > 0.5 ? 'rgba(40,24,70,0.9)' : 'rgba(210,200,255,0.9)';
  c.fillRect(g.x - 22, g.base + 5, g.w + 44 - step + bw, 1.2);
  c.fillRect(g.x - 22, g.base - 3, 1.2, 8); c.fillRect(g.x + g.w + 22 - step + bw - 1.2, g.base - 3, 1.2, 8);
  c.restore();
}

// ---------------------------------------------------------------------------
// 5. Lyrics: stable geometry, colour-only focus, a few meaning-linked effects.
type Placed = {word: Word; x: number; y: number; w: number; size: number; row: number};
type Layout = {placed: Placed[]; size: number; box: Box};
let layoutCache = new WeakMap<Cue, Map<string, Layout>>();
function zoneBox(format: Format, shot: Shot, p: Placement): Box {
  if (format === 'landscape') {
    if (shot.zone === 'upper') return {x: 200, y: 96, w: 1520, h: 210};
    if (shot.zone === 'bottom') return {x: 200, y: 900, w: 1520, h: 86};
    return {x: 200, y: 752, w: 1520, h: 214};
  }
  // Portrait: centred about y≈1370, above the spectrum and clear of the top bar.
  if (p.mode === 'fit') return {x: 64, y: FIT_BAND.y + FIT_BAND.h + 70, w: 952, h: 340};
  return {x: 64, y: 1200, w: 952, h: 360};
}
const upper = (s: string): string => s.toLocaleUpperCase('en');
function measure(c: Ctx, text: string, size: number): number {c.font = `700 ${size}px ${FONT}`; return c.measureText(upper(text)).width + size * SKEW * 0.6;}
function breakRows(c: Ctx, words: Word[], size: number, maxW: number, maxRows: number): Word[][] | null {
  const space = size * 0.24, widths = words.map(w => measure(c, w.text, size));
  const total = widths.reduce((a, b) => a + b, 0) + space * (words.length - 1);
  for (let rows = 1; rows <= maxRows; rows++) {
    // Balanced partition: greedy against the ideal row width, checked for fit.
    const target = total / rows, out: Word[][] = [[]];
    let width = 0;
    words.forEach((w, i) => {
      const add = (out.at(-1)!.length ? space : 0) + widths[i]!;
      if (out.at(-1)!.length && width + add > target * 1.08 && out.length < rows) {out.push([]); width = 0;}
      out.at(-1)!.push(w); width += (out.at(-1)!.length > 1 ? space : 0) + widths[i]!;
    });
    const fits = out.every(r => r.reduce((a, w) => a + measure(c, w.text, size), 0) + space * (r.length - 1) <= maxW);
    if (fits && !out.some(r => r.length === 0)) return out;
  }
  return null;
}
export function layoutCue(c: Ctx, cue: Cue, format: Format, shot: Shot, p: Placement): Layout {
  const key = `${format}:${shot.zone}:${p.mode}`;
  const hit = layoutCache.get(cue)?.get(key); if (hit) return hit;
  const box = zoneBox(format, shot, p), lead = cue.words.filter(w => w.voice === 'lead'), back = cue.words.filter(w => w.voice === 'backing');
  const mainWords = lead.length ? lead : back, second = lead.length ? back : [];
  const maxRows = format === 'landscape' ? (shot.zone === 'bottom' ? 1 : 2) : 3;
  let size = format === 'landscape' ? (shot.zone === 'bottom' ? 80 : 84) : 94;
  if (!lead.length) size *= 0.8;
  let rows: Word[][] | null = null, backRows: Word[][] = [], backSize = 0;
  for (; size >= 40; size -= 2) {
    rows = breakRows(c, mainWords, size, box.w, maxRows);
    backSize = Math.round(size * 0.62);
    backRows = second.length ? breakRows(c, second, backSize, box.w, 1) ?? [] : [];
    const height = (rows?.length ?? 9) * size * 1.06 + (second.length ? backSize * 1.3 : 0);
    if (rows && (!second.length || backRows.length) && height <= box.h + size * 0.3) break;
  }
  if (!rows) throw Error(`Lyric cue ${cue.id} cannot fit its reading zone`);
  const lh = size * 1.06, blockH = rows.length * lh + (second.length ? backSize * 1.3 : 0);
  const top = box.y + (box.h - blockH) / 2, placed: Placed[] = [];
  const placeRow = (row: Word[], sz: number, baseline: number, rowIndex: number): void => {
    const space = sz * 0.24, widths = row.map(w => measure(c, w.text, sz));
    let x = box.x + (box.w - (widths.reduce((a, b) => a + b, 0) + space * (row.length - 1))) / 2;
    row.forEach((w, i) => {placed.push({word: w, x, y: baseline, w: widths[i]!, size: sz, row: rowIndex}); x += widths[i]! + space;});
  };
  rows.forEach((row, r) => placeRow(row, size, top + r * lh + size * 0.86, r));
  backRows.forEach(row => placeRow(row, backSize, top + rows!.length * lh + backSize * 1.08, rows!.length));
  const layout = {placed, size, box};
  let m = layoutCache.get(cue); if (!m) {m = new Map(); layoutCache.set(cue, m);} m.set(key, layout);
  return layout;
}

// Deterministic pseudo-random numbers per word (effects never use Math.random).
function seeded(id: string, k: number): number {
  let h = 2166136261;
  for (const ch of `${id}:${k}`) {h ^= ch.charCodeAt(0); h = Math.imul(h, 16777619);}
  return ((h >>> 0) % 100000) / 100000;
}
function glyph(c: Ctx, text: string, x: number, y: number, size: number, draw: (c: Ctx) => void): void {
  c.save(); c.translate(x, y); c.transform(1, 0, -SKEW, 1, 0, 0); c.font = `700 ${size}px ${FONT}`; c.textBaseline = 'alphabetic'; c.textAlign = 'left';
  draw(c); c.restore();
}

// Fire words: vocal-energy flame tongues rising from the glyph tops, plus
// embers. The word's focus interval is unchanged; the flame may cool for at
// most 0.45 s after the sung word ends (a bounded decorative tail).
function flame(c: Ctx, p: Placed, t: number, vocal: number, ink: number, alpha: number): void {
  const w = p.word, attack = smooth((t - w.start) / 0.06), release = 1 - smooth((t - w.end) / 0.45);
  const env = Math.min(attack, release) * alpha;
  if (env <= 0.001) return;
  // Quiet and forceful singing burn differently: vocal energy scales height
  // and heat; the envelope alone never lets an active flame word go dark.
  const heat = env * (0.62 + 0.38 * vocal), reach = env * (0.5 + 0.5 * vocal), cap = p.size * 0.8, n = Math.max(4, Math.round(p.w / (p.size * 0.19)));
  const [c0, c1, c2, c3] = PALETTE.flame.map(hexRgb) as [RGB, RGB, RGB, RGB];
  c.save(); c.globalCompositeOperation = ink > 0.5 ? 'multiply' : 'screen';
  // Warm body light over the word, so the flame reads at small player sizes.
  const cx = p.x + p.w / 2 + SKEW * cap, cy = p.y - cap * 0.9;
  c.save(); c.translate(cx, cy); c.scale(1, 0.42);
  const body = c.createRadialGradient(0, 0, 0, 0, 0, p.w * 0.62);
  body.addColorStop(0, rgba(c1, 0.34 * heat)); body.addColorStop(0.55, rgba(c2, 0.14 * heat)); body.addColorStop(1, rgba(c3, 0));
  c.fillStyle = body; c.fillRect(-p.w, -p.w, p.w * 2, p.w * 2); c.restore();
  for (let i = 0; i < n; i++) {
    const phase = seeded(w.id, i) * Math.PI * 2, rate = 7 + seeded(w.id, i + 40) * 5;
    const flick = 0.7 + 0.3 * Math.sin(t * rate + phase) * Math.sin(t * rate * 0.63 + phase * 1.7);
    // Tongues root just inside the cap line and rise up to ~1.2 em above it.
    const h = p.size * (0.42 + 0.78 * seeded(w.id, i + 80)) * reach * flick;
    const bx = p.x + (i + 0.5) / n * p.w + SKEW * cap * 0.9, by = p.y - cap + p.size * 0.2, sway = Math.sin(t * 3.4 + phase) * p.size * 0.1;
    const tw = p.size * 0.26 * (0.75 + 0.5 * seeded(w.id, i + 120));
    const g = c.createLinearGradient(0, by + p.size * 0.1, 0, by - h);
    g.addColorStop(0, rgba(c0, 0.95 * heat)); g.addColorStop(0.28, rgba(c1, 0.9 * heat)); g.addColorStop(0.66, rgba(c2, 0.62 * heat)); g.addColorStop(1, rgba(c3, 0));
    c.fillStyle = g; c.beginPath();
    c.moveTo(bx - tw / 2, by + p.size * 0.1);
    c.bezierCurveTo(bx - tw * 0.62, by - h * 0.35, bx + sway * 0.4 - tw * 0.2, by - h * 0.7, bx + sway, by - h);
    c.bezierCurveTo(bx + sway * 0.4 + tw * 0.2, by - h * 0.7, bx + tw * 0.62, by - h * 0.35, bx + tw / 2, by + p.size * 0.1);
    c.closePath(); c.fill();
  }
  // Embers: born during the word, rising and cooling within 0.8 s.
  for (let i = 0; i < 16; i++) {
    const born = w.start + seeded(w.id, i + 200) * Math.max(0.05, w.end - w.start), age = t - born;
    if (age < 0 || age > 0.8) continue;
    const x = p.x + seeded(w.id, i + 240) * p.w + Math.sin(age * 6 + i) * 6, y = p.y - cap * 0.9 - age * p.size * (0.9 + seeded(w.id, i + 280));
    const a = (1 - age / 0.8) * env * 0.9, r = 1.6 + seeded(w.id, i + 320) * 1.8;
    c.fillStyle = rgba(i % 3 ? c1 : c0, a); c.beginPath(); c.arc(x, y, r, 0, Math.PI * 2); c.fill();
  }
  c.restore();
}

// The title hook's last word: a short signal-drop afterimage (cyan/magenta
// ghosts slide down and fade within 0.36 s). The real glyph never moves.
function dropGhost(c: Ctx, p: Placed, t: number, ink: number, alpha: number): void {
  const tau = t - p.word.start, life = 0.42;
  if (tau < 0 || tau > life) return;
  const e = 1 - Math.pow(1 - tau / life, 3), fade = 1 - tau / life, dy = e * p.size * 0.42;
  const text = upper(p.word.text), slice = tau < 0.12 ? Math.floor(tau * 30) : -1;
  const draw = (colour: string, dx: number): void => {
    for (let band = 0; band < 3; band++) {
      const jitter = slice >= 0 ? (seeded(p.word.id, slice * 3 + band) - 0.5) * p.size * 0.28 : 0;
      c.save();
      c.beginPath(); c.rect(p.x - p.size, p.y - p.size * (0.95 - band * 0.36) + dy, p.w + p.size * 2, p.size * 0.36); c.clip();
      glyph(c, text, p.x + dx + jitter, p.y + dy, p.size, g => {g.fillStyle = colour; g.fillText(text, 0, 0);});
      c.restore();
    }
  };
  c.save(); c.globalCompositeOperation = ink > 0.5 ? 'multiply' : 'screen'; c.globalAlpha = 0.82 * fade * alpha;
  draw(PALETTE.glitch.left, -(4 + 14 * e)); draw(PALETTE.glitch.right, 4 + 14 * e);
  c.restore();
}

function lyrics(c: Ctx, format: Format, shot: Shot, p: Placement, t: number, ink: number): void {
  if (!S || !S.timeline) return;
  const i = cueIndexAt(S.cues, t, S.timeline.duration);
  if (i < 0) return;
  const cue = S.cues[i]!, [a, b] = cueWindow(S.cues, i, S.timeline.duration);
  const alpha = Math.min(smooth((t - a) / 0.16), smooth((b - t) / 0.2));
  if (alpha <= 0.002) return;
  const layout = layoutCue(c, cue, format, shot, p), vocal = scalarAt(S.vocal, t);
  const section = sectionOfLine(cue.line), chorus = section?.kind === 'chorus' || section?.kind === 'outro';
  const rest = hexRgb(PALETTE.rest), inkRgb = hexRgb(PALETTE.ink), memory = hexRgb(PALETTE.memoryFocus);
  for (const pl of layout.placed) {
    const w = pl.word, text = upper(w.text), active = wordActive(w, t), sung = t >= w.end;
    const backing = w.voice === 'backing';
    const pal = w.effect === 'moon' ? PALETTE.moon : w.effect === 'neon' ? {core: '#ffffff', mid: '#ffc2e6', edge: '#ff4fb4', glow: '#ff3fa8'} : chorus && !backing ? PALETTE.chorus : PALETTE.verse;
    if (w.effect === 'drop') dropGhost(c, pl, t, ink, alpha);
    const restA = backing ? 0.74 : sung ? 0.96 : 0.8;
    const baseFill = lerpRgb(sung ? [248, 247, 255] : rest, inkRgb, ink);
    glyph(c, text, pl.x, pl.y, pl.size, g => {
      g.globalAlpha = alpha;
      g.lineJoin = 'round'; g.miterLimit = 2;
      g.lineWidth = Math.max(2, pl.size * 0.075);
      // Readability: a dark stroke and soft shadow on dark frames, a light edge
      // on white memory frames. Both blend with the measured picture tone.
      if (ink < 0.98) {
        g.strokeStyle = `rgba(10,4,24,${(0.8 * (1 - ink)).toFixed(3)})`;
        g.shadowColor = 'rgba(6,2,16,0.85)'; g.shadowBlur = pl.size * 0.14 * (1 - ink);
        g.strokeText(text, 0, 0);
      }
      if (ink > 0.02) {
        g.strokeStyle = `rgba(255,255,255,${(0.6 * ink).toFixed(3)})`;
        g.shadowColor = 'rgba(255,255,255,0.45)'; g.shadowBlur = pl.size * 0.12 * ink;
        g.strokeText(text, 0, 0);
      }
      g.shadowBlur = 0;
      if (!active) {g.fillStyle = rgba(baseFill, restA); g.fillText(text, 0, 0); return;}
      // Active: a neon tube lights. Strike = brief extra glow at the onset.
      const tau = t - w.start;
      let strike = 1 + 0.6 * (1 - smooth(tau / 0.14));
      if (w.effect === 'neon') strike *= tau < 0.03 ? 1 : tau < 0.06 ? 0.2 : tau < 0.1 ? 1.1 : tau < 0.13 ? 0.4 : 1;
      if (ink < 0.99) {
        g.shadowColor = pal.glow; g.shadowBlur = pl.size * (0.2 + 0.24 * vocal) * strike * (1 - ink);
        g.fillStyle = rgba(hexRgb(pal.edge), 0.9 * (1 - ink)); g.fillText(text, 0, 0);
        g.shadowBlur = 0;
      }
      const grad = g.createLinearGradient(0, -pl.size * 0.78, 0, 0);
      const core = lerpRgb(hexRgb(pal.core), memory, ink), midC = lerpRgb(hexRgb(pal.mid), memory, ink), edge = lerpRgb(hexRgb(pal.edge), memory, ink);
      grad.addColorStop(0, rgba(midC, 1)); grad.addColorStop(0.45, rgba(core, 1)); grad.addColorStop(1, rgba(edge, 1));
      g.fillStyle = grad; g.fillText(text, 0, 0);
    });
    // Flames rise from the cap line in front of the dark readability shadow;
    // screen blending only adds light, so the glyph stays legible beneath.
    if (w.effect === 'flame') flame(c, pl, t, vocal, ink, alpha);
  }
}

// ---------------------------------------------------------------------------
export type Diagnostics = {shot: string; tier: number; ink: number; cue: string | null};
export function paintScene(c: Ctx, time: number, format: Format, frame: CanvasImageSource): Diagnostics {
  if (!S) throw Error('Scene is not ready');
  const duration = S.features.durationSeconds, t = clamp(time, 0, duration);
  const shot = shotAt(t), p = placement(format, shot, t), {w, h} = outputSize(format);
  c.save();
  c.setTransform(c.canvas.width / w, 0, 0, c.canvas.height / h, 0, 0);
  c.globalAlpha = 1; c.globalCompositeOperation = 'source-over'; c.filter = 'none';
  c.fillStyle = '#000'; c.fillRect(0, 0, w, h);
  drawPicture(c, frame, p);
  const tier = tierAt(t);
  if (!shot.protect) neonLight(c, frame, p, t, tier * 0.95);
  const field = format === 'portrait' ? 'portraitLower' : shot.zone === 'upper' ? 'landscapeUpper' : shot.zone === 'bottom' ? 'landscapeBottom' : 'landscapeLower';
  const ink = p.mode === 'fit' ? 0 : inkAt(field, t), bright = p.mode === 'fit' ? 0 : inkAt(`${field}:bright`, t);
  shade(c, format, shot, p, ink, bright);
  spectrum(c, format, t, tier, format === 'portrait' && p.mode !== 'fit' ? inkAt('portraitLower', t) * 0.6 : ink * 0.6);
  lyrics(c, format, shot, p, t, ink);
  c.restore();
  const i = S.timeline ? cueIndexAt(S.cues, t, S.timeline.duration) : -1;
  return {shot: shot.id, tier, ink, cue: i >= 0 ? S.cues[i]!.id : null};
}
export type {Effect};
