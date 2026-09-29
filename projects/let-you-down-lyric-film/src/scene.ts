import {bindText, clamp, cueIndexAt, cueWindow, mix, parseFeatures, parseTimeline, parseTones, smooth, wordActive} from './model.ts';
import type {Cue, Effect, Features, Format, Timeline, Tones, Word} from './model.ts';
import {parseLyrics} from './lyrics.ts';
import {INSTRUMENTAL, PALETTE, SECTIONS, sectionOfLine} from './song.ts';
import {FIT_BAND, outputSize, placement, shotAt, type Box, type Placement} from './frame.ts';
import type {Shot} from './shots.ts';
export type {Format} from './model.ts';

// preview-v2: lettering, light and effects taken from the film's own visual
// language. Its overlay cards use a squarish rounded sans in white with a
// neon glow halo; its light is pink/cyan/violet neon with heavy bloom.
type Ctx = CanvasRenderingContext2D;
type Canvas = HTMLCanvasElement;
type RGB = [number, number, number];
export const FONT = 'RajdhaniLYD';
export const SKEW = 0; // upright, like the film's own title and credit cards
const hexRgb = (hex: string): RGB => [parseInt(hex.slice(1, 3), 16), parseInt(hex.slice(3, 5), 16), parseInt(hex.slice(5, 7), 16)];
const rgba = (rgb: RGB, a: number): string => `rgba(${rgb[0]},${rgb[1]},${rgb[2]},${clamp(a).toFixed(4)})`;
const lerpRgb = (a: RGB, b: RGB, f: number): RGB => [Math.round(mix(a[0], b[0], f)), Math.round(mix(a[1], b[1], f)), Math.round(mix(a[2], b[2], f))];
function hsl(h: number, s: number, l: number): RGB {
  const k = (n: number): number => (n + h / 30) % 12, a = s * Math.min(l, 1 - l);
  const f = (n: number): number => l - a * Math.max(-1, Math.min(k(n) - 3, 9 - k(n), 1));
  return [Math.round(f(0) * 255), Math.round(f(8) * 255), Math.round(f(4) * 255)];
}

// ---------------------------------------------------------------------------
// Canvas factory (the browser uses DOM canvases; the renderer injects Skia).
let makeCanvas = (w: number, h: number): Canvas => {const c = document.createElement('canvas'); c.width = w; c.height = h; return c;};
export function setCanvasFactory(factory: (w: number, h: number) => Canvas): void {makeCanvas = factory;}
const context = (c: Canvas, read = false): Ctx => {const x = c.getContext('2d', read ? {willReadFrequently: true} : undefined); if (!x) throw Error('Canvas 2D unavailable'); return x as Ctx;};

// ---------------------------------------------------------------------------
// Loaded, immutable scene data.
type Palette = {frameDuration: number; hueA: number[]; hueB: number[]; strength: number[]};
type State = {
  timeline: Timeline | null; cues: Cue[]; placeholder: boolean;
  features: Features; data: DataView; frames: number;
  bands: Float32Array; peaks: Float32Array; lightBands: Float32Array; energy: Float32Array; vocal: Float32Array; bass: Float32Array;
  tones: Tones; ink: Record<string, Float32Array>; palette: Palette;
  tiers: {start: number; end: number; tier: number}[]; dropIndex: Map<string, number>;
};
let S: State | undefined;
export type SceneInputs = {timeline: unknown | null; features: unknown; featureBytes: ArrayBuffer; tones: unknown; palette: unknown; lyricsText: string | null; lyricsSha256: string | null; placeholder: boolean};

function parsePalette(input: unknown): Palette {
  const d = input as Partial<Palette> & {frames?: number};
  if (!d || !Array.isArray(d.hueA) || !Array.isArray(d.hueB) || !Array.isArray(d.strength) || typeof d.frameDuration !== 'number' || d.hueA.length !== d.frames || d.hueB.length !== d.frames || d.strength.length !== d.frames) throw Error('Invalid picture palette');
  return {frameDuration: d.frameDuration, hueA: d.hueA, hueB: d.hueB, strength: d.strength};
}

export function loadScene(input: SceneInputs): void {
  const features = parseFeatures(input.features, input.featureBytes.byteLength);
  const data = new DataView(input.featureBytes), n = features.frameCount, F = features.scalarsPerFrame;
  const m = features.displayMapping, norm = (v: number, r: {minimum: number; maximum: number}): number => clamp((v - r.minimum) / (r.maximum - r.minimum));
  // Deterministic display envelopes computed once over the whole recording
  // (asymmetric attack/release in source frames): seeks, slow playback and the
  // renderer read identical values; nothing integrates browser time.
  const bands = new Float32Array(n * 48), peaks = new Float32Array(n * 48), lightBands = new Float32Array(n * 48), energy = new Float32Array(n), vocal = new Float32Array(n), bass = new Float32Array(n);
  const bar = new Float32Array(48), glow = new Float32Array(48), peak = new Float32Array(48), hold = new Int32Array(48);
  let e = 0, v = 0, lo = 0;
  for (let i = 0; i < n; i++) {
    const raw = (k: number): number => data.getFloat32((i * F + k) * 4, true);
    const er = norm(raw(0), m.rmsDb), vr = norm(raw(2), m.vocalRmsDb);
    e += (er - e) * (er > e ? 0.5 : 0.08); v += (vr - v) * (vr > v ? 0.45 : 0.1);
    let low = 0;
    for (let b = 0; b < 48; b++) {
      const x = norm(raw(3 + b), m.bandsDb[b]!);
      if (b < 10) low += x / 10;
      bar[b]! += (x - bar[b]!) * (x > bar[b]! ? 0.55 : 0.14);
      glow[b]! += (x - glow[b]!) * (x > glow[b]! ? 0.42 : 0.075);
      // Peak marks hold for 14 rows (0.23 s), then fall at 0.66 of full scale per second.
      if (bar[b]! >= peak[b]!) {peak[b] = bar[b]!; hold[b] = 14;} else if (hold[b]! > 0) hold[b] = hold[b]! - 1; else peak[b] = Math.max(bar[b]!, peak[b]! - 0.011);
      bands[i * 48 + b] = bar[b]!; peaks[i * 48 + b] = peak[b]!; lightBands[i * 48 + b] = glow[b]!;
    }
    lo += (low - lo) * (low > lo ? 0.6 : 0.1);
    energy[i] = e; vocal[i] = v; bass[i] = lo;
  }
  const tones = parseTones(input.tones);
  // Ink factor per zone: only near-white memory frames flip the lettering to
  // dark ink (steep curve, so mid-bright frames never leave grey text); a
  // separate `bright` track deepens the shading behind light lettering.
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
  // Occurrence index of each signal-drop word: the effect deepens through the song.
  const dropIndex = new Map<string, number>();
  cues.flatMap(q => q.words).filter(w => w.effect === 'drop').forEach((w, i) => dropIndex.set(w.id, i));
  S = {timeline, cues, placeholder: input.placeholder, features, data, frames: n, bands, peaks, lightBands, energy, vocal, bass, tones, ink,
    palette: parsePalette(input.palette), tiers: buildTiers(cues), dropIndex};
  layoutCache = new WeakMap();
  sprites = undefined; dropSprite = undefined; dripCache.clear();
}
export const sceneReady = (): boolean => S !== undefined;
/** Bound cues (for verification tools; read-only). */
export const getCues = (): readonly Cue[] => S?.cues ?? [];
/** Reading-zone ink factor at t (0 = light lettering, 1 = dark ink lettering). */
export function inkFor(format: Format, t: number): number {
  const shot = shotAt(t), p = placement(format, shot, t);
  if (p.mode === 'fit') return 0;
  return inkAt(zoneField(format, shot), t);
}
export function getLines(): {id: string; label: string; start: number; end: number; review: boolean}[] {
  if (!S) return [];
  return S.cues.map((q, i) => {
    const [start, end] = cueWindow(S!.cues, i, S!.timeline!.duration);
    return {id: q.id, label: q.words.map(w => w.text).join(' '), start, end, review: q.words.some(w => w.review === 'priority')};
  });
}

// Section tiers: how much reach the measured light may use.
function buildTiers(cues: Cue[]): {start: number; end: number; tier: number}[] {
  const spans = SECTIONS.map(s => {
    const lines = cues.filter(q => q.line >= s.first && q.line <= s.last);
    return lines.length ? {id: s.id, start: lines[0]!.start, end: Math.max(...lines.map(q => q.end)), tier: s.tier} : null;
  });
  if (spans.some(s => !s)) {
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
const zoneField = (format: Format, shot: Shot): string =>
  format === 'portrait' ? 'portraitLower' : shot.zone === 'upper' ? 'landscapeUpper' : shot.zone === 'bottom' ? 'landscapeBottom' : 'landscapeLower';
/** The shot's own neon pair at t (smoothed), falling back to the film's
 * signature pink/cyan where a frame holds little vivid light. */
const FILM_PINK = hexRgb('#ff4d9d'), FILM_CYAN = hexRgb('#3fd6ec');
function sceneColours(t: number): {a: RGB; b: RGB; strength: number} {
  const P = S!.palette, k = clamp(Math.round(t / P.frameDuration - 0.5), 0, P.hueA.length - 1);
  const strength = (P.strength[k] ?? 0) / 255;
  const a = hsl(P.hueA[k] ?? 330, 0.95, 0.62), b = hsl(P.hueB[k] ?? 190, 0.95, 0.62);
  const w = smooth(strength / 0.6);
  return {a: lerpRgb(FILM_PINK, a, w), b: lerpRgb(FILM_CYAN, b, w), strength};
}

// ---------------------------------------------------------------------------
// Offscreen buffers and particle sprites.
let buffers: {sample: Canvas; sctx: Ctx; emit: Canvas; ectx: Ctx; blur: Canvas; bctx: Ctx; bloom: Canvas; blctx: Ctx; fill: Canvas; fctx: Ctx; light: Canvas; lctx: Ctx; lightBlur: Canvas; lbctx: Ctx; glyph: Canvas; gctx: Ctx; pour: Canvas; pctx: Ctx; drip: Canvas; dctx: Ctx} | undefined;
const POUR_BUFFER = 768;
function buf(): NonNullable<typeof buffers> {
  if (buffers) return buffers;
  const sample = makeCanvas(384, 384), emit = makeCanvas(384, 384), blur = makeCanvas(384, 384), bloom = makeCanvas(192, 192), fill = makeCanvas(270, 480);
  const light = makeCanvas(480, 160), lightBlur = makeCanvas(480, 160), glyph = makeCanvas(POUR_BUFFER, POUR_BUFFER), pour = makeCanvas(POUR_BUFFER, POUR_BUFFER), drip = makeCanvas(POUR_BUFFER, POUR_BUFFER);
  buffers = {sample, sctx: context(sample, true), emit, ectx: context(emit), blur, bctx: context(blur), bloom, blctx: context(bloom), fill, fctx: context(fill),
    light, lctx: context(light), lightBlur, lbctx: context(lightBlur), glyph, gctx: context(glyph), pour, pctx: context(pour), drip, dctx: context(drip)};
  return buffers;
}
// Neon droplet: one soft white sprite, tinted in bulk after drawing.
let dropSprite: Canvas | undefined;
function droplet(): Canvas {
  if (dropSprite) return dropSprite;
  const c = makeCanvas(32, 32), g = context(c), grad = g.createRadialGradient(16, 16, 0, 16, 16, 16);
  grad.addColorStop(0, 'rgba(255,255,255,1)'); grad.addColorStop(0.4, 'rgba(255,255,255,0.7)'); grad.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = grad; g.fillRect(0, 0, 32, 32);
  return (dropSprite = c);
}
// Fire particles: soft additive sprites prerendered along the colour ramp
// (white-hot → gold → orange → magenta), so each particle is one drawImage.
let sprites: Canvas[] | undefined;
function fireSprites(): Canvas[] {
  if (sprites) return sprites;
  const ramp = PALETTE.flame.map(hexRgb) as RGB[];
  sprites = Array.from({length: 16}, (_, i) => {
    const f = i / 15, seg = f * (ramp.length - 1), k = Math.min(ramp.length - 2, Math.floor(seg));
    const col = lerpRgb(ramp[k]!, ramp[k + 1]!, seg - k);
    const c = makeCanvas(48, 48), g = context(c), grad = g.createRadialGradient(24, 24, 0, 24, 24, 24);
    grad.addColorStop(0, rgba(lerpRgb(col, [255, 255, 255], 0.35 * (1 - f)), 1)); grad.addColorStop(0.35, rgba(col, 0.75)); grad.addColorStop(1, rgba(col, 0));
    g.fillStyle = grad; g.fillRect(0, 0, 48, 48);
    return c;
  });
  return sprites;
}

// ---------------------------------------------------------------------------
// 1. Picture.
function drawPicture(c: Ctx, frame: CanvasImageSource, p: Placement): void {
  if (p.mode !== 'fit') {c.drawImage(frame, p.src.x, p.src.y, p.src.w, p.src.h, p.dst.x, p.dst.y, p.dst.w, p.dst.h); return;}
  // Portrait lettering shots: the whole moving frame in a band over a heavily
  // blurred, darkened fill made from the same frame (text never reads twice).
  const {fill, fctx} = buf();
  fctx.clearRect(0, 0, 270, 480);
  fctx.filter = 'blur(14px)';
  fctx.drawImage(frame, (1920 - 1080 * 9 / 16) / 2, 0, 1080 * 9 / 16, 1080, -40, -40, 350, 560);
  fctx.filter = 'none';
  c.drawImage(fill, 0, 0, 1080, 1920);
  c.fillStyle = 'rgba(8,3,18,0.72)'; c.fillRect(0, 0, 1080, 1920);
  c.drawImage(frame, 0, 0, 1920, 1080, p.dst.x, p.dst.y, p.dst.w, p.dst.h);
}

// 2. The film's own neon breathes with the music. Bright, saturated source
// pixels glow with the band family matching their hue (magenta/red ← lows,
// violet/blue ← low-mids, amber/green ← mids, cyan ← highs), with a wide bloom
// so signs and tubes visibly flare on the beat.
const lightTmp = new Float32Array(48);
function neonLight(c: Ctx, frame: CanvasImageSource, p: Placement, t: number, strength: number): void {
  if (strength <= 0.01) return;
  const {sample, sctx, emit, ectx, blur, bctx, bloom, blctx} = buf();
  const landscape = p.dst.w > p.dst.h;
  const w = landscape || p.mode === 'fit' ? 384 : 216, h = landscape || p.mode === 'fit' ? 216 : 384;
  sctx.clearRect(0, 0, w, h);
  sctx.drawImage(frame, p.src.x, p.src.y, p.src.w, p.src.h, 0, 0, w, h);
  const img = sctx.getImageData(0, 0, w, h), px = img.data;
  const lb = bandsAt(S!.lightBands, t, lightTmp);
  const avg = (a: number, b: number): number => {let s = 0; for (let k = a; k <= b; k++) s += lb[k]!; return s / (b - a + 1);};
  const gains = [avg(0, 11), avg(12, 25), avg(26, 34), avg(35, 47)].map(x => Math.pow(x, 1.25) * strength * 1.25);
  for (let i = 0; i < px.length; i += 4) {
    const r = px[i]!, g = px[i + 1]!, b = px[i + 2]!;
    const mx = Math.max(r, g, b), mn = Math.min(r, g, b);
    if (mx < 100 || mx - mn < 40) {px[i + 3] = 0; continue;}
    const sat = (mx - mn) / mx, val = mx / 255, d = mx - mn;
    let hue = mx === r ? ((g - b) / d + 6) % 6 : mx === g ? (b - r) / d + 2 : (r - g) / d + 4;
    hue /= 6;
    const family = hue > 0.82 || hue < 0.04 ? 0 : hue > 0.62 ? 1 : hue < 0.42 ? 2 : 3;
    px[i + 3] = Math.min(255, smooth((val - 0.4) / 0.3) * smooth((sat - 0.3) / 0.3) * gains[family]! * 255);
  }
  ectx.clearRect(0, 0, w, h); ectx.putImageData(img, 0, 0);
  bctx.clearRect(0, 0, w, h); bctx.filter = 'blur(3.5px)'; bctx.drawImage(emit, 0, 0); bctx.filter = 'none';
  const bw = w / 2, bh = h / 2;
  blctx.clearRect(0, 0, 192, 192); blctx.filter = 'blur(6px)'; blctx.drawImage(emit, 0, 0, w, h, 0, 0, bw, bh); blctx.filter = 'none';
  c.save(); c.globalCompositeOperation = 'screen';
  c.globalAlpha = 0.95; c.drawImage(blur, 0, 0, w, h, p.dst.x, p.dst.y, p.dst.w, p.dst.h);
  c.globalAlpha = 0.8; c.drawImage(bloom, 0, 0, bw, bh, p.dst.x, p.dst.y, p.dst.w, p.dst.h);
  c.globalAlpha = 0.45; c.drawImage(emit, 0, 0, w, h, p.dst.x, p.dst.y, p.dst.w, p.dst.h);
  c.restore();
}

// 3. Continuous readability shading, tinted like the film's shadows.
function shade(c: Ctx, format: Format, shot: Shot, p: Placement, ink: number, bright: number): void {
  const {w, h} = outputSize(format);
  if (p.mode === 'fit') return;
  const dark = (1 - ink) * (1 + 0.45 * bright);
  c.save();
  if (format === 'landscape') {
    const upper = shot.zone === 'upper';
    const g = upper ? c.createLinearGradient(0, 0, 0, 430) : c.createLinearGradient(0, 1080, 0, 520);
    g.addColorStop(0, `rgba(9,3,20,${Math.min(0.84, 0.6 * dark)})`); g.addColorStop(0.5, `rgba(9,3,20,${Math.min(0.56, 0.3 * dark)})`); g.addColorStop(1, 'rgba(9,3,20,0)');
    c.fillStyle = g; c.fillRect(0, upper ? 0 : 520, w, upper ? 430 : 560);
  } else {
    const g = c.createLinearGradient(0, h, 0, 980);
    g.addColorStop(0, `rgba(9,3,20,${Math.min(0.88, 0.72 * dark)})`); g.addColorStop(0.45, `rgba(9,3,20,${Math.min(0.64, 0.42 * dark)})`); g.addColorStop(1, 'rgba(9,3,20,0)');
    c.fillStyle = g; c.fillRect(0, 980, w, h - 980);
  }
  if (ink > 0.01) {
    const g = format === 'landscape' ? c.createLinearGradient(0, 1080, 0, 620) : c.createLinearGradient(0, 1920, 0, 1100);
    g.addColorStop(0, `rgba(252,246,255,${0.3 * ink})`); g.addColorStop(1, 'rgba(252,246,255,0)');
    c.fillStyle = g; c.fillRect(0, format === 'landscape' ? 620 : 1100, w, format === 'landscape' ? 460 : 820);
  }
  c.restore();
}

// 4. Neon spectrum: the lyric film's instrument, drawn in the video's own tube
// light and set under the lyric column. The 48 measured bands mirror about the
// centre (bass in the middle, highs toward the sides) as thin neon tubes on a
// baseline: white-hot cores, one shared bloom, pink at the centre through
// violet to cyan at the edges (the film's measured neon). Peak marks hold,
// then fall; a faint reflection sits under the baseline like neon on a wet
// street. Travel is bounded and follows the section tier, so the picture keeps
// the frame; on white memory frames the tubes turn to ink.
type SpectrumGeometry = {x0: number; x1: number; base: number; travel: number; bars: number; tube: number};
export const SPECTRUM: Record<Format, SpectrumGeometry> = {
  landscape: {x0: 200, x1: 1720, base: 1040, travel: 92, bars: 80, tube: 6},
  portrait: {x0: 64, x1: 1016, base: 1768, travel: 110, bars: 56, tube: 6},
};
/** Under the film's own upload panel (bottom zone) the lyric row sits low, so
 * the instrument drops and shortens. */
export function spectrumGeometry(format: Format, shot: Shot): SpectrumGeometry {
  const g = SPECTRUM[format];
  return format === 'landscape' && shot.zone === 'bottom' ? {...g, base: 1058, travel: 40} : g;
}
/** Highest point a tube or peak mark can reach in this shot (layout clearance). */
export function spectrumTop(format: Format, shot: Shot): number {
  const g = spectrumGeometry(format, shot);
  return g.base - g.travel - 12;
}
const NEON_STOPS: RGB[] = [hexRgb('#ff4fa3'), hexRgb('#c45cff'), hexRgb('#46d9f0')];
const INK_STOPS: RGB[] = [hexRgb('#c83a7e'), hexRgb('#7a4fc4'), hexRgb('#4a6fc0')];
function ramp(stops: RGB[], u: number): RGB {
  const x = clamp(u) * (stops.length - 1), k = Math.min(stops.length - 2, Math.floor(x));
  return lerpRgb(stops[k]!, stops[k + 1]!, x - k);
}
const spectrumTmp = new Float32Array(48), peakTmp = new Float32Array(48);
function spectrum(c: Ctx, format: Format, shot: Shot, t: number, tier: number, ink: number): void {
  const vis = smooth(tier / 0.12);
  if (vis <= 0.01) return;
  const g = spectrumGeometry(format, shot), lv = bandsAt(S!.bands, t, spectrumTmp), pk = bandsAt(S!.peaks, t, peakTmp);
  const travel = g.travel * (0.5 + 0.5 * tier), step = (g.x1 - g.x0) / g.bars, half = (g.bars - 1) / 2, tube = g.tube;
  const bars: {x: number; top: number; peak: number; col: RGB; edge: number}[] = [];
  for (let i = 0; i < g.bars; i++) {
    const d = Math.abs(i - half) / half, band = Math.min(46.999, d * 47), k = Math.floor(band), f = band - k;
    const edge = 1 - 0.75 * smooth((d - 0.8) / 0.2);
    const level = mix(lv[k]!, lv[k + 1]!, f), held = Math.max(level, mix(pk[k]!, pk[k + 1]!, f));
    const col = lerpRgb(ramp(NEON_STOPS, d), ramp(INK_STOPS, d), ink);
    bars.push({x: g.x0 + (i + 0.5) * step, top: g.base - 3 - travel * Math.pow(level, 1.7) * edge, peak: g.base - 9 - travel * Math.pow(held, 1.7) * edge, col, edge});
  }
  c.save();
  // One shared bloom: the tubes drawn wide into a small buffer, blurred once.
  const glow = vis * 0.5 * (1 - ink);
  if (glow > 0.01) {
    const {light, lctx, lightBlur, lbctx} = buf(), LW = light.width, LH = light.height, pad = 40;
    const top = g.base - g.travel - pad, bottom = g.base + pad * 0.5, sx = LW / (g.x1 - g.x0 + pad * 2), sy = LH / (bottom - top);
    lctx.save(); lctx.setTransform(1, 0, 0, 1, 0, 0); lctx.clearRect(0, 0, LW, LH);
    lctx.setTransform(sx, 0, 0, sy, -(g.x0 - pad) * sx, -top * sy); lctx.lineCap = 'round';
    for (const bar of bars) {lctx.strokeStyle = rgba(bar.col, 0.9 * bar.edge); lctx.lineWidth = tube * 2.2; lctx.beginPath(); lctx.moveTo(bar.x, g.base); lctx.lineTo(bar.x, bar.top); lctx.stroke();}
    lctx.restore();
    lbctx.clearRect(0, 0, LW, LH); lbctx.filter = 'blur(3px)'; lbctx.drawImage(light, 0, 0); lbctx.filter = 'none';
    c.globalCompositeOperation = 'screen'; c.globalAlpha = glow;
    c.drawImage(lightBlur, 0, 0, LW, LH, g.x0 - pad, top, g.x1 - g.x0 + pad * 2, bottom - top);
  }
  c.globalCompositeOperation = 'source-over'; c.globalAlpha = 1; c.lineCap = 'round';
  const a = vis * (1 - 0.25 * ink);
  // Baseline hairline, fading at both ends.
  const line = c.createLinearGradient(g.x0, 0, g.x1, 0), lc = lerpRgb([236, 214, 255], INK_STOPS[1]!, ink);
  line.addColorStop(0, rgba(lc, 0)); line.addColorStop(0.18, rgba(lc, 0.32 * a)); line.addColorStop(0.82, rgba(lc, 0.32 * a)); line.addColorStop(1, rgba(lc, 0));
  c.fillStyle = line; c.fillRect(g.x0, g.base + 2, g.x1 - g.x0, 1.5);
  for (const bar of bars) {
    const len = g.base - bar.top, hot = lerpRgb(bar.col, [255, 255, 255], 0.3 * (1 - ink));
    // Reflection under the baseline.
    const refl = c.createLinearGradient(0, g.base + 5, 0, g.base + 5 + len * 0.35);
    refl.addColorStop(0, rgba(bar.col, 0.26 * a * bar.edge)); refl.addColorStop(1, rgba(bar.col, 0));
    c.strokeStyle = refl; c.lineWidth = tube; c.lineCap = 'butt'; c.beginPath(); c.moveTo(bar.x, g.base + 5); c.lineTo(bar.x, g.base + 5 + len * 0.35); c.stroke();
    // Tube body: deeper at the base, hotter toward the tip.
    const body = c.createLinearGradient(0, g.base, 0, bar.top);
    body.addColorStop(0, rgba(lerpRgb(bar.col, [30, 10, 50], 0.25), 0.88 * a * bar.edge)); body.addColorStop(1, rgba(hot, a * bar.edge));
    c.strokeStyle = body; c.lineCap = 'round'; c.beginPath(); c.moveTo(bar.x, g.base - tube / 2); c.lineTo(bar.x, bar.top); c.stroke();
    if (len > tube * 2 && ink < 0.5) {c.strokeStyle = `rgba(255,255,255,${(0.6 * a * bar.edge).toFixed(3)})`; c.lineWidth = tube * 0.34; c.beginPath(); c.moveTo(bar.x, g.base - tube); c.lineTo(bar.x, bar.top + tube * 0.4); c.stroke(); c.lineWidth = tube;}
    // Peak mark: holds, then falls back to the tube.
    if (bar.peak < bar.top - 3) {c.fillStyle = rgba(lerpRgb(bar.col, [255, 255, 255], 0.45 * (1 - ink)), 0.9 * a * bar.edge); c.fillRect(bar.x - tube / 2, bar.peak - 1.5, tube, 3);}
  }
  c.restore();
}

// ---------------------------------------------------------------------------
// 5. Lyrics: the film's own card style (white lettering, neon halo).
type Placed = {word: Word; x: number; y: number; w: number; size: number; row: number};
type Layout = {placed: Placed[]; size: number; box: Box};
let layoutCache = new WeakMap<Cue, Map<string, Layout>>();
function zoneBox(format: Format, shot: Shot, p: Placement): Box {
  if (format === 'landscape') {
    if (shot.zone === 'upper') return {x: 200, y: 96, w: 1520, h: 210};
    if (shot.zone === 'bottom') return {x: 200, y: 900, w: 1520, h: 78};
    return {x: 200, y: 676, w: 1520, h: 200};
  }
  if (p.mode === 'fit') return {x: 64, y: FIT_BAND.y + FIT_BAND.h + 70, w: 952, h: 340};
  return {x: 64, y: 1180, w: 952, h: 360};
}
function measure(c: Ctx, text: string, size: number): number {c.font = `700 ${size}px ${FONT}`; return c.measureText(text).width;}
function breakRows(c: Ctx, words: Word[], size: number, maxW: number, maxRows: number): Word[][] | null {
  const space = size * 0.26, widths = words.map(w => measure(c, w.text, size));
  const total = widths.reduce((a, b) => a + b, 0) + space * (words.length - 1);
  for (let rows = 1; rows <= maxRows; rows++) {
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
  const store = (layout: Layout): Layout => {let mm = layoutCache.get(cue); if (!mm) {mm = new Map(); layoutCache.set(cue, mm);} mm.set(key, layout); return layout;};
  if (maxRows === 1 && second.length) {
    // One-row zone (under the film's upload panel): the backing echo follows
    // the lead on the same baseline, smaller.
    for (let size = 80; size >= 40; size -= 2) {
      const bs = Math.round(size * 0.66), gap = size * 0.55;
      const lw = mainWords.map(w => measure(c, w.text, size)), bw = second.map(w => measure(c, w.text, bs));
      const total = lw.reduce((a, b) => a + b, 0) + size * 0.26 * (lw.length - 1) + gap + bw.reduce((a, b) => a + b, 0) + bs * 0.26 * (bw.length - 1);
      if (total > box.w && size > 40) continue;
      const placed: Placed[] = [], baseline = box.y + (box.h - size) / 2 + size * 0.8;
      let x = box.x + (box.w - total) / 2;
      mainWords.forEach((w, i) => {placed.push({word: w, x, y: baseline, w: lw[i]!, size, row: 0}); x += lw[i]! + size * 0.26;});
      x += gap - size * 0.26;
      second.forEach((w, i) => {placed.push({word: w, x, y: baseline, w: bw[i]!, size: bs, row: 0}); x += bw[i]! + bs * 0.26;});
      return store({placed, size, box});
    }
  }
  let size = format === 'landscape' ? (shot.zone === 'bottom' ? 80 : 92) : 102;
  if (!lead.length) size *= 0.82;
  let rows: Word[][] | null = null, backRows: Word[][] = [], backSize = 0;
  for (; size >= 40; size -= 2) {
    rows = breakRows(c, mainWords, size, box.w, maxRows);
    backSize = Math.round(size * 0.64);
    backRows = second.length ? breakRows(c, second, backSize, box.w, 1) ?? [] : [];
    const height = (rows?.length ?? 9) * size * 1.0 + (second.length ? backSize * 1.2 : 0);
    if (rows && (!second.length || backRows.length) && height <= box.h + size * 0.25) break;
  }
  if (!rows) throw Error(`Lyric cue ${cue.id} cannot fit its reading zone`);
  const lh = size * 1.0, blockH = rows.length * lh + (second.length ? backSize * 1.2 : 0);
  const top = box.y + (box.h - blockH) / 2, placed: Placed[] = [];
  const placeRow = (row: Word[], sz: number, baseline: number, rowIndex: number): void => {
    const space = sz * 0.26, widths = row.map(w => measure(c, w.text, sz));
    let x = box.x + (box.w - (widths.reduce((a, b) => a + b, 0) + space * (row.length - 1))) / 2;
    row.forEach((w, i) => {placed.push({word: w, x, y: baseline, w: widths[i]!, size: sz, row: rowIndex}); x += widths[i]! + space;});
  };
  rows.forEach((row, r) => placeRow(row, size, top + r * lh + size * 0.8, r));
  backRows.forEach(row => placeRow(row, backSize, top + rows!.length * lh + backSize * 0.95, rows!.length));
  return store({placed, size, box});
}

// Deterministic pseudo-random numbers per word (effects never use Math.random).
function seeded(id: string, k: number): number {
  let h = 2166136261;
  for (const ch of `${id}:${k}`) {h ^= ch.charCodeAt(0); h = Math.imul(h, 16777619);}
  return ((h >>> 0) % 100000) / 100000;
}
function text(c: Ctx, s: string, x: number, y: number, size: number, draw: (c: Ctx) => void): void {
  c.save(); c.translate(x, y); c.font = `700 ${size}px ${FONT}`; c.textBaseline = 'alphabetic'; c.textAlign = 'left';
  draw(c); c.restore();
}

// Fire words: a molten fill plus a continuous flame made of soft additive
// particles rising from the letters with gentle turbulence. Emission runs only
// while the word is sung (rate follows measured vocal energy); particles then
// cool and fade within at most 0.9 s. Every particle is a pure function of its
// seeded birth time, so any seek reconstructs the same flame.
function flameParticles(c: Ctx, p: Placed, t: number, alpha: number, ink: number): void {
  const w = p.word, spr = fireSprites(), dur = Math.max(0.05, w.end - w.start), rate = 260;
  const count = Math.ceil(dur * rate), unit = p.size / 92, capTop = p.y - p.size * 0.66;
  if (t < w.start || t > w.end + 0.8) return;
  const heat = Math.min(smooth((t - w.start) / 0.08), 1 - smooth((t - w.end) / 0.5)), vocal = scalarAt(S!.vocal, t);
  const roots = Math.max(3, Math.round(p.w / (p.size * 0.5)));
  // A shared, slowly turning wind leans the whole flame; each tongue's height
  // flickers on its own, so the fire never reads as a regular row.
  const wind = (Math.sin(t * 1.3 + seeded(w.id, 7) * 6.28) * 0.6 + Math.sin(t * 2.9) * 0.4) * p.size * 0.12;
  const flick = (root: number, time: number): number => {
    const ph = seeded(w.id, 980 + root) * 6.28;
    return 0.55 + 0.25 * Math.sin(time * (8 + 5 * seeded(w.id, 990 + root)) + ph) + 0.2 * Math.sin(time * 17.3 + ph * 2.1);
  };
  c.save(); c.globalCompositeOperation = ink > 0.5 ? 'multiply' : 'lighter';
  // Continuous burning edge along the tops of the letters, and the light it casts.
  const glow = c.createRadialGradient(p.x + p.w / 2, capTop, 0, p.x + p.w / 2, capTop, p.w * 0.62);
  glow.addColorStop(0, rgba(hexRgb('#ff8a3a'), (0.2 + 0.12 * vocal) * heat * alpha)); glow.addColorStop(1, rgba(hexRgb('#ff2e7a'), 0));
  c.fillStyle = glow; c.fillRect(p.x - p.w * 0.2, capTop - p.w * 0.62, p.w * 1.4, p.w * 0.95);
  c.save(); c.translate(p.x + p.w / 2, capTop - p.size * 0.02); c.scale(1, p.size * 0.16 / (p.w * 0.56));
  const edge = c.createRadialGradient(0, 0, 0, 0, 0, p.w * 0.56);
  edge.addColorStop(0, rgba(hexRgb('#ffb04a'), 0.5 * heat * alpha)); edge.addColorStop(0.7, rgba(hexRgb('#ff6a2a'), 0.25 * heat * alpha)); edge.addColorStop(1, rgba(hexRgb('#ff3a6a'), 0));
  c.fillStyle = edge; c.fillRect(-p.w * 0.6, -p.w * 0.6, p.w * 1.2, p.w * 1.2); c.restore();
  for (let i = 0; i < count; i++) {
    const born = w.start + i / rate, age = t - born;
    if (age < 0) break;
    if (seeded(w.id, i * 9 + 2) > 0.5 + 0.5 * scalarAt(S!.vocal, born)) continue;
    const root = i % roots, u = seeded(w.id, i * 9 + 3);
    const rootX = p.x + (root + 0.5 + (seeded(w.id, 900 + root) - 0.5) * 0.7) / roots * p.w;
    const life = (0.3 + 0.26 * seeded(w.id, i * 9 + 1)) * flick(root, born) * (0.8 + 0.4 * scalarAt(S!.vocal, born));
    if (age > life) continue;
    const f = age / life, rise = (1.45 + 0.7 * seeded(w.id, i * 9 + 4)) * p.size;
    // Spread wide at the base and gather toward the tongue's tip.
    const spread = (u - 0.5) * p.size * 0.42 * (1 - 0.75 * f);
    const x = rootX + spread + wind * f * f + Math.sin(born * 11 + root * 2.3 + age * 10) * p.size * 0.04 * f;
    const y = capTop + p.size * 0.08 - rise * age;
    const r = (10 + 10 * seeded(w.id, i * 9 + 7)) * unit * (1 - 0.72 * f);
    const sprite = spr[Math.min(15, Math.floor((0.12 + 0.88 * f) * 16))]!;
    c.globalAlpha = alpha * (1 - f) * Math.min(1, f / 0.1) * 0.42;
    c.drawImage(sprite, x - r * 0.9, y - r * 2.4, r * 1.8, r * 4.4);
  }
  // Sparks drift above the flame and cool on the way.
  for (let i = 0; i < 12; i++) {
    const born = w.start + seeded(w.id, 2000 + i) * dur, age = t - born, life = 0.7 + 0.5 * seeded(w.id, 2100 + i);
    if (age < 0 || age > life) continue;
    const f = age / life, x = p.x + seeded(w.id, 2200 + i) * p.w + wind * f + Math.sin(age * 5 + i) * p.size * 0.08;
    const y = capTop - age * p.size * (1.3 + 0.8 * seeded(w.id, 2300 + i));
    c.globalAlpha = alpha * (1 - f) * 0.85; c.fillStyle = rgba(hexRgb(i % 2 ? '#ffd27a' : '#ff8a4a'), 1);
    c.beginPath(); c.arc(x, y, (1.4 + 1.3 * seeded(w.id, 2400 + i)) * unit, 0, Math.PI * 2); c.fill();
  }
  c.restore();
}

// Signal drop ("down" at the end of chorus and outro phrases): the word's
// neon runs down like rain on glass. Light spills softly below the letters
// while droplets form on their lower edges, hang, then fall with gravity and a
// little wind, stretched by their own speed and cooling from the word's white
// into the shot's own neon pair. Emission follows the held note and the
// measured vocal; afterwards the last drops fall away. Rate, weight, wind,
// drip pattern and colour order vary per occurrence and deepen through the
// song; the last is the longest, heaviest fall. Every droplet is a pure
// function of its seeded birth time, so any seek reconstructs the same frame.
const easeOut = (x: number): number => 1 - Math.pow(1 - clamp(x), 3);
function noise1(id: string, salt: number, u: number, knots: number): number {
  const x = clamp(u) * knots, k = Math.floor(x), f = x - k;
  return mix(seeded(id, salt + k), seeded(id, salt + k + 1), f * f * (3 - 2 * f));
}
// Where a word's letters touch the baseline (x offsets at a given size).
const dripCache = new Map<string, number[]>();
function dripPoints(word: string, size: number, width: number): number[] {
  const key = `${size}|${word}`, hit = dripCache.get(key);
  if (hit) return hit;
  const W = Math.ceil(width + 4), band = Math.max(2, Math.round(size * 0.05)), cv = makeCanvas(W, Math.ceil(size * 1.3)), g = context(cv, true);
  g.font = `700 ${size}px ${FONT}`; g.textBaseline = 'alphabetic'; g.fillStyle = '#fff'; g.fillText(word, 0, size);
  const px = g.getImageData(0, size - band, W, band).data, out: number[] = [];
  for (let x = 0; x < W; x += 2) {let ink = 0; for (let y = 0; y < band; y++) ink = Math.max(ink, px[(y * W + x) * 4 + 3]!); if (ink > 140) out.push(x);}
  const points = out.length ? out : [0.2, 0.4, 0.6, 0.8].map(f => f * width);
  dripCache.set(key, points);
  return points;
}
function dropTrail(c: Ctx, p: Placed, t: number, alpha: number, ink: number, floor: number): void {
  const w = p.word, n = S!.dropIndex.get(w.id) ?? 0, total = Math.max(1, S!.dropIndex.size), last = n === total - 1;
  const progress = n / Math.max(1, total - 1), held = Math.max(0.3, w.end - w.start), tau = t - w.start, heavy = last ? 1.35 : 1;
  const maxLife = 0.4 + 1.2 * heavy;
  if (tau < 0 || tau > held + maxLife) return;
  const size = p.size, padX = Math.round(size * 0.5), top = Math.round(size * 1.05);
  const reach = Math.max(size * 0.4, Math.min(size * (last ? 2.8 : 1.6 + 0.8 * progress), floor - p.y));
  const bw = Math.min(POUR_BUFFER, Math.ceil(p.w + padX * 2)), bh = Math.min(POUR_BUFFER, Math.ceil(top + reach + size * 0.2));
  const a = alpha * smooth(tau / 0.1);
  if (a <= 0.003) return;
  const {glyph, gctx, pour, pctx, drip, dctx} = buf(), spr = droplet();
  const reset = (g: Ctx): void => {g.setTransform(1, 0, 0, 1, 0, 0); g.globalCompositeOperation = 'source-over'; g.globalAlpha = 1; g.filter = 'none'; g.clearRect(0, 0, bw, bh);};
  gctx.save(); reset(gctx); gctx.font = `700 ${size}px ${FONT}`; gctx.textBaseline = 'alphabetic'; gctx.fillStyle = '#fff'; gctx.fillText(w.text, padX, top); gctx.restore();
  // Soft spill: the letters' lower edge stretched downward (seeded, uneven
  // lengths), later blurred into one glow; it swells while the note is held.
  pctx.save(); reset(pctx);
  const knots = 3 + Math.floor(seeded(w.id, 12) * 4), col = Math.max(2, Math.round(size * 0.03)), slice = size * 0.1;
  const swell = easeOut(tau / (held * 0.9 + 0.2)) * (1 - smooth((tau - held) / 0.6));
  if (swell > 0.01) {
    for (let x = padX - col; x < bw - padX + col; x += col) {
      const len = size * (0.34 + 0.4 * progress + (last ? 0.3 : 0)) * (0.45 + 0.55 * noise1(w.id, 100, (x - padX) / Math.max(1, p.w), knots)) * swell;
      if (len >= 1) pctx.drawImage(glyph, x, top - slice, col, slice, x, top - slice, col, slice + len);
    }
  }
  // Droplets: form on a lower edge, hang, then fall and stretch with speed.
  dctx.save(); reset(dctx);
  const pts = dripPoints(w.text, size, p.w), rate = 14 + 12 * progress, count = Math.ceil(held * rate);
  const wind = (seeded(w.id, 16) - 0.5) * size * 0.9;
  for (let i = 0; i < count; i++) {
    const born = i / rate, age = tau - born;
    if (age < 0) break;
    if (seeded(w.id, 3000 + i) > 0.3 + 0.7 * scalarAt(S!.vocal, w.start + born)) continue;
    // Weighted pick: some letters drip more than others this time.
    let u = seeded(w.id, 3200 + i), tries = 0;
    while (tries < 3 && seeded(w.id, 3250 + i * 3 + tries) > 0.25 + 0.75 * noise1(w.id, 400, u, knots)) {u = seeded(w.id, 3260 + i * 3 + tries); tries++;}
    const x0 = padX + pts[Math.min(pts.length - 1, Math.floor(u * pts.length))]!;
    const hang = 0.12 + 0.28 * seeded(w.id, 3300 + i), life = hang + (0.7 + 0.5 * seeded(w.id, 3400 + i)) * heavy;
    if (age > life) continue;
    const r = size * (0.05 + 0.045 * seeded(w.id, 3500 + i)) * (last ? 1.25 : 1);
    const fallT = Math.max(0, age - hang), g = size * (1.8 + 1.4 * seeded(w.id, 3600 + i)) / heavy, v = g * fallT;
    const y = top + r * 0.6 + r * 1.2 * smooth(age / hang) + 0.5 * g * fallT * fallT;
    const x = x0 + wind * fallT * fallT + Math.sin(born * 9 + fallT * 4) * size * 0.012 * fallT;
    const grow = 0.45 + 0.55 * smooth(age / hang), stretch = 2 * r * grow + v * 0.075; // motion blur: the tail a 1/13 s shutter would draw
    const depth = (y - top) / reach, f = (age - hang) / (life - hang);
    const o = Math.min(1, age / 0.05) * (fallT > 0 ? Math.pow(1 - clamp(f), 0.9) : 1) * (1 - smooth((depth - 0.75) / 0.25));
    if (o <= 0.01) continue;
    dctx.globalAlpha = o; dctx.drawImage(spr, x - r * grow, y - stretch + r * grow, 2 * r * grow, stretch);
  }
  // Tint both layers: the word's hot white at the letters, then the shot's
  // neon pair (order alternates by occurrence); ink frames run magenta to violet.
  const cols = sceneColours(t), [deep, deeper] = n % 2 ? [cols.b, cols.a] : [cols.a, cols.b];
  const tint = (g: Ctx, fadeTo: number): void => {
    g.globalAlpha = 1; g.globalCompositeOperation = 'destination-in';
    const fall = g.createLinearGradient(0, top, 0, top + reach * fadeTo);
    fall.addColorStop(0, 'rgba(255,255,255,1)'); fall.addColorStop(0.6, 'rgba(255,255,255,0.85)'); fall.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = fall; g.fillRect(0, 0, bw, bh);
    const col = g.createLinearGradient(0, top - size * 0.1, 0, top + reach);
    if (ink > 0.5) {col.addColorStop(0, rgba(lerpRgb(INK_FOCUS, [255, 255, 255], 0.35), 1)); col.addColorStop(0.5, 'rgba(176,120,226,1)'); col.addColorStop(1, 'rgba(140,130,236,1)');}
    else {col.addColorStop(0, rgba(lerpRgb([255, 255, 255], FILM_PINK, 0.25), 1)); col.addColorStop(0.3, rgba(lerpRgb(deep, [255, 255, 255], 0.2), 1)); col.addColorStop(1, rgba(deeper, 1));}
    g.globalCompositeOperation = 'source-in'; g.fillStyle = col; g.fillRect(0, 0, bw, bh);
  };
  tint(pctx, 0.7); pctx.restore();
  tint(dctx, 1); dctx.restore();
  // Ink frames: softer, like watercolour on paper rather than neon.
  const k = ink > 0.5 ? 0.55 : 1;
  c.save(); c.globalCompositeOperation = ink > 0.5 ? 'multiply' : 'screen'; c.translate(p.x - padX, p.y - top);
  if (swell > 0.01) {c.filter = `blur(${(size * 0.13).toFixed(2)}px)`; c.globalAlpha = a * 0.9 * k; c.drawImage(pour, 0, 0, bw, bh, 0, 0, bw, bh);}
  c.filter = `blur(${(size * 0.05).toFixed(2)}px)`; c.globalAlpha = a * 0.9 * k; c.drawImage(drip, 0, 0, bw, bh, 0, 0, bw, bh);
  c.filter = 'none'; c.globalAlpha = a * k; c.drawImage(drip, 0, 0, bw, bh, 0, 0, bw, bh);
  c.restore();
}

const REST: RGB = [244, 240, 251], SUNG: RGB = [255, 255, 255], INK: RGB = [44, 26, 60], INK_FOCUS: RGB = [212, 63, 134];
/** Active-word fills, evenly spaced stops from 0.72 em above the baseline down
 * to it: white lit from below by the halo's own colour (pink lead, cyan for
 * backing echoes and the moon, molten for fire). The encoded-focus verifier
 * derives its reference colours from this same specification. */
export const FOCUS_FILL = {lead: ['#ffffff', '#ffc4e1'], cool: ['#ffffff', '#b3f0ff'], flame: ['#fff4d6', '#ffc15a', '#ff6a3a']} as const;
export const focusFillOf = (w: Pick<Word, 'effect' | 'voice'>): readonly string[] =>
  w.effect === 'flame' ? FOCUS_FILL.flame : w.effect === 'moon' || w.voice === 'backing' ? FOCUS_FILL.cool : FOCUS_FILL.lead;
function lyrics(c: Ctx, format: Format, shot: Shot, p: Placement, t: number, ink: number): void {
  if (!S || !S.timeline) return;
  const i = cueIndexAt(S.cues, t, S.timeline.duration);
  if (i < 0) return;
  const cue = S.cues[i]!, [a, b] = cueWindow(S.cues, i, S.timeline.duration);
  const alpha = Math.min(smooth((t - a) / 0.16), smooth((b - t) / 0.2));
  if (alpha <= 0.002) return;
  const layout = layoutCue(c, cue, format, shot, p), vocal = scalarAt(S.vocal, t);
  const section = sectionOfLine(cue.line), intense = section?.kind === 'chorus' || section?.kind === 'outro';
  const floor = spectrumTop(format, shot) - 6; // pours stop above the spectrum
  for (const pl of layout.placed) {
    const w = pl.word, active = wordActive(w, t), sung = t >= w.end, backing = w.voice === 'backing';
    if (w.effect === 'drop') dropTrail(c, pl, t, alpha, ink, floor);
    // Halo colours: the film's pink for the lead, cyan for backing echoes and
    // the moon; choruses add a second, wider cyan halo (the film's dual neon).
    const halo = w.effect === 'moon' || backing ? FILM_CYAN : w.effect === 'flame' ? hexRgb('#ff7a2a') : FILM_PINK;
    const tau = t - w.start;
    let strike = active ? 1 + 0.5 * (1 - smooth(tau / 0.16)) : 1;
    if (active && w.effect === 'neon') strike *= tau < 0.03 ? 1 : tau < 0.07 ? 0.25 : tau < 0.11 ? 1.1 : tau < 0.15 ? 0.45 : 1;
    text(c, w.text, pl.x, pl.y, pl.size, g => {
      g.globalAlpha = alpha; g.lineJoin = 'round';
      // Readability: a violet-black shadow on dark frames; a light edge on white ones.
      if (ink < 0.98) {
        g.shadowColor = `rgba(10,3,22,${(0.9 * (1 - ink)).toFixed(3)})`; g.shadowBlur = pl.size * 0.16;
        g.lineWidth = Math.max(1.5, pl.size * 0.045); g.strokeStyle = `rgba(12,4,26,${(0.6 * (1 - ink)).toFixed(3)})`; g.strokeText(w.text, 0, 0);
        g.shadowBlur = 0;
      }
      if (ink > 0.02) {g.lineWidth = Math.max(1.5, pl.size * 0.04); g.strokeStyle = `rgba(255,255,255,${(0.6 * ink).toFixed(3)})`; g.strokeText(w.text, 0, 0);}
      if (!active) {
        const base = lerpRgb(sung ? SUNG : REST, INK, ink);
        g.fillStyle = rgba(base, backing ? 0.78 : sung ? 0.97 : 0.82); g.fillText(w.text, 0, 0);
        return;
      }
      if (ink < 0.99) {
        // Neon halo passes, as on the film's own cards: the colour lives in the
        // glow, a wide soft bloom plus a tight bright one; choruses add a second,
        // wider cyan bloom (the film's dual neon lighting).
        const k = (1 - ink) * strike;
        g.fillStyle = rgba(halo, 0.95 * (1 - ink)); g.shadowColor = rgba(halo, 1);
        g.globalCompositeOperation = 'lighter';
        g.shadowBlur = pl.size * (0.7 + 0.3 * vocal) * k; g.fillText(w.text, 0, 0);
        g.shadowBlur = pl.size * 0.3 * k; g.fillText(w.text, 0, 0);
        if (intense && !backing && w.effect !== 'flame') {g.shadowColor = rgba(FILM_CYAN, 0.9); g.shadowBlur = pl.size * (1.0 + 0.3 * vocal) * k; g.fillText(w.text, 0, 0);}
        g.globalCompositeOperation = 'source-over';
        g.shadowColor = rgba(halo, 1); g.shadowBlur = pl.size * 0.1 * k; g.fillText(w.text, 0, 0);
        g.shadowBlur = 0;
      }
      const grad = g.createLinearGradient(0, -pl.size * 0.72, 0, 0), stops = focusFillOf(w);
      stops.forEach((col, k) => grad.addColorStop(k / (stops.length - 1), col));
      g.fillStyle = grad; g.fillText(w.text, 0, 0);
      if (ink > 0.01) {g.globalAlpha = alpha * ink; g.fillStyle = rgba(INK_FOCUS, 1); g.fillText(w.text, 0, 0);}
    });
    if (w.effect === 'flame') flameParticles(c, pl, t, alpha, ink);
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
  if (!shot.protect) neonLight(c, frame, p, t, tier);
  const ink = p.mode === 'fit' ? 0 : inkAt(zoneField(format, shot), t), bright = p.mode === 'fit' ? 0 : inkAt(`${zoneField(format, shot)}:bright`, t);
  shade(c, format, shot, p, ink, bright);
  spectrum(c, format, shot, t, tier, format === 'landscape' ? inkAt('landscapeBottom', t) : p.mode === 'fit' ? 0 : inkAt('portraitLower', t));
  lyrics(c, format, shot, p, t, ink);
  c.restore();
  const i = S.timeline ? cueIndexAt(S.cues, t, S.timeline.duration) : -1;
  return {shot: shot.id, tier, ink, cue: i >= 0 ? S.cues[i]!.id : null};
}
export type {Effect};
