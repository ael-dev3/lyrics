import {createHash} from 'node:crypto';
import {existsSync, readFileSync} from 'node:fs';
import {spawn} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {createCanvas, GlobalFonts, ImageData, type Canvas, type SKRSContext2D} from '@napi-rs/canvas';
import {FONT, loadScene, paintScene, setCanvasFactory, type Format} from '../src/scene.ts';
import {normalizeLyrics} from '../src/lyrics.ts';

// Native (Skia) host for the one scene implementation in src/scene.ts. It feeds
// the same committed inputs the browser preview loads; only the canvas backend
// and the frame source differ.
export const root = fileURLToPath(new URL('../', import.meta.url));
export const SOURCE = `${root}public/source.mp4`;
export const SRC_FPS = 24000 / 1001;
export const sha = (bytes: Uint8Array): string => createHash('sha256').update(bytes).digest('hex');

export function initNative(opts: {timelinePath: string | null; placeholder: boolean}): {lyricsSha256: string | null} {
  if (!GlobalFonts.registerFromPath(`${root}public/fonts/Rajdhani-Bold.ttf`, FONT)) throw Error('Rajdhani Bold could not be registered');
  setCanvasFactory((w, h) => createCanvas(w, h) as unknown as HTMLCanvasElement);
  const featureBytes = readFileSync(`${root}public/audio-features.bin`);
  const features = JSON.parse(readFileSync(`${root}public/audio-features.json`, 'utf8')) as {dataSha256: string};
  if (sha(featureBytes) !== features.dataSha256) throw Error('Audio feature identity mismatch');
  const lyricsPath = `${root}source/lyrics.local.txt`;
  let lyricsText: string | null = null, lyricsSha256: string | null = null;
  if (!opts.placeholder) {
    if (!existsSync(lyricsPath)) throw Error('source/lyrics.local.txt is required for lyric rendering (use --placeholder for diagnostics)');
    lyricsText = readFileSync(lyricsPath, 'utf8');
    lyricsSha256 = sha(Buffer.from(normalizeLyrics(lyricsText), 'utf8'));
  }
  const ab = featureBytes.buffer.slice(featureBytes.byteOffset, featureBytes.byteOffset + featureBytes.byteLength) as ArrayBuffer;
  loadScene({
    timeline: opts.timelinePath ? JSON.parse(readFileSync(opts.timelinePath, 'utf8')) : null,
    features, featureBytes: ab, tones: JSON.parse(readFileSync(`${root}public/picture-tones.json`, 'utf8')),
    palette: JSON.parse(readFileSync(`${root}public/picture-palette.json`, 'utf8')),
    lyricsText, lyricsSha256, placeholder: opts.placeholder,
  });
  return {lyricsSha256};
}

export type NativeScene = {canvas: Canvas; ctx: SKRSContext2D; source: Canvas; sourceCtx: SKRSContext2D; paint: (rgba: Buffer, t: number) => Buffer};
export function nativeScene(format: Format): NativeScene {
  const [w, h] = format === 'landscape' ? [1920, 1080] : [1080, 1920];
  const canvas = createCanvas(w, h), ctx = canvas.getContext('2d');
  const source = createCanvas(1920, 1080), sourceCtx = source.getContext('2d');
  const paint = (rgba: Buffer, t: number): Buffer => {
    sourceCtx.putImageData(new ImageData(new Uint8ClampedArray(rgba.buffer, rgba.byteOffset, rgba.byteLength), 1920, 1080), 0, 0);
    paintScene(ctx as unknown as CanvasRenderingContext2D, t, format, source as unknown as CanvasImageSource);
    return canvas.data();
  };
  return {canvas, ctx, source, sourceCtx, paint};
}

/** Decode exactly source frame k (PTS k × 1001/24000) as RGBA. */
export async function decodeFrame(k: number): Promise<Buffer> {
  const seek = Math.max(0, (k - 0.5) / SRC_FPS);
  const child = spawn('ffmpeg', ['-hide_banner', '-v', 'error', '-nostdin', '-ss', seek.toFixed(6), '-i', SOURCE, '-map', '0:v:0', '-frames:v', '1', '-f', 'rawvideo', '-pix_fmt', 'rgba', 'pipe:1']);
  const parts: Buffer[] = [];
  for await (const chunk of child.stdout) parts.push(chunk as Buffer);
  const out = Buffer.concat(parts);
  if (out.length !== 1920 * 1080 * 4) throw Error(`Frame ${k} decode returned ${out.length} bytes`);
  return out;
}
/** The source frame presented at output time t: the latest frame with PTS ≤ t. */
export const sourceFrameAt = (t: number, frames: number): number => Math.min(frames - 1, Math.floor(t * SRC_FPS + 1e-9));
