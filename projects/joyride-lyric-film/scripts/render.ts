import {bundle} from '@remotion/bundler';
import {renderMedia, renderStill, selectComposition, makeCancelSignal} from '@remotion/renderer';
import {resolve, dirname} from 'node:path';
import {mkdirSync, writeFileSync} from 'node:fs';
import assert from 'node:assert/strict';
import {FPS, FRAMES} from '../src/config.ts';
import {verifyFrozenInputs} from './record-render-inputs.ts';

const flag = (name: string): string | undefined => process.argv.find(value => value.startsWith(`--${name}=`))?.slice(name.length + 3);
const numeric = (name: string, fallback: number): number => {
  const value = Number(flag(name) ?? fallback);
  assert(Number.isFinite(value), `Invalid --${name}`);
  return value;
};
const portrait = process.argv.includes('--portrait'), still = process.argv.includes('--still');
const preview = process.argv.includes('--preview'), benchmark = process.argv.includes('--benchmark');
const kind = portrait ? 'tiktok' : 'youtube', production = !still && !preview && !benchmark;
const concurrency = numeric('concurrency', 3), scale = numeric('scale', preview || still ? 1 : 2);
assert(Number.isInteger(concurrency) && concurrency >= 1 && concurrency <= 12, 'Concurrency must be an integer from 1 to 12');
assert(scale > 0 && scale <= 4, 'Scale must be greater than 0 and at most 4');
const frozenInputs = flag('frozen-inputs'), sharedBundle = flag('serve-url');
if (production) {
  assert(frozenInputs && sharedBundle, 'Use scripts/render-all.ts for production so preflight and shared-bundle input freezing cannot be skipped');
  assert.equal(scale, 2, 'Production reference rendering requires 2× scale');
}
if (frozenInputs) await verifyFrozenInputs(frozenInputs);
const serveUrl = sharedBundle ?? await bundle({entryPoint: resolve('src/index.tsx')});
const browserExecutable = flag('browser-executable');
const browserOptions = browserExecutable ? {browserExecutable} : {};
const composition = await selectComposition({serveUrl, id: portrait ? 'JoyrideTikTok' : 'JoyrideYouTube', ...browserOptions});
assert.equal(composition.fps, FPS); assert.equal(composition.durationInFrames, FRAMES);
const {cancelSignal, cancel} = makeCancelSignal();
process.once('SIGINT', cancel); process.once('SIGTERM', cancel);
mkdirSync('evidence', {recursive: true});

if (still) {
  const times = flag('times')?.split(',').map(Number) ?? [0, .1, .25, .5, .75, 1].map(fraction => (FRAMES - 1) * fraction / FPS);
  for (const time of times) {
    const frame = Math.round(time * FPS);
    assert(Number.isFinite(time) && frame >= 0 && frame < FRAMES, 'Still frame is outside the composition');
    await renderStill({serveUrl, composition, cancelSignal, frame, scale, output: `evidence/${kind}-frame-${frame}.png`, imageFormat: 'png', ...browserOptions});
  }
} else {
  const part = numeric('part', 0), parts = numeric('parts', 2);
  assert(Number.isInteger(parts) && parts >= 1 && parts <= FRAMES, 'Invalid segment count');
  assert(Number.isInteger(part) && part >= 0 && part <= parts, 'Invalid part');
  const defaultStart = part ? Math.floor((part - 1) * FRAMES / parts) : 0;
  const startFrame = numeric('start-frame', flag('start') === undefined ? defaultStart : numeric('start', 0) * FPS);
  const defaultEnd = part ? Math.floor(part * FRAMES / parts) - 1 : FRAMES - 1;
  const frameCount = numeric('frames', flag('seconds') !== undefined ? Math.round(numeric('seconds', 0) * FPS) : preview || benchmark ? Math.min(300, FRAMES - startFrame) : defaultEnd - startFrame + 1);
  const range: [number, number] = [Math.round(startFrame), Math.round(startFrame) + frameCount - 1];
  assert(Number.isInteger(frameCount) && frameCount >= 1 && range[0] >= 0 && range[1] < FRAMES, 'Render window is outside the composition');
  const name = benchmark ? `benchmark-f${range[0]}-n${frameCount}-c${concurrency}-s${scale}` : preview ? `preview-f${range[0]}-n${frameCount}` : part ? `part-${part}` : 'master-lossless';
  const output = flag('output') ?? `evidence/${kind}-${name}.mkv`;
  mkdirSync(dirname(output), {recursive: true});
  let last = 0;
  const started = Date.now();
  await renderMedia({
    serveUrl, composition, cancelSignal, outputLocation: output, codec: 'h264', crf: 1,
    x264Preset: 'ultrafast', pixelFormat: 'yuv444p', imageFormat: 'png', colorSpace: 'bt709',
    muted: true, scale, concurrency, frameRange: range, ...browserOptions,
    offthreadVideoCacheSizeInBytes: 512 * 1024 * 1024,
    mediaCacheSizeInBytes: 128 * 1024 * 1024,
    offthreadVideoThreads: 2,
    timeoutInMilliseconds: 120000,
    ffmpegOverride: ({args}) => {
      const modified = [...args], index = modified.indexOf('-crf');
      if (index >= 0) {
        assert(index + 1 < modified.length, 'Missing renderer CRF value');
        modified[index + 1] = '0';
      } else {
        // Remotion's final stitch step may copy its already-lossless pre-encode.
        assert(modified.some((value, i) => value === '-c:v' && modified[i + 1] === 'copy'), 'Expected a lossless encode or video stream-copy stitch');
      }
      return modified;
    },
    onProgress: progress => {
      if (Date.now() - last < 10000) return;
      last = Date.now();
      console.log(JSON.stringify({kind, rendered: progress.renderedFrames, encoded: progress.encodedFrames, seconds: (Date.now() - started) / 1000}));
    },
  });
  if (frozenInputs) await verifyFrozenInputs(frozenInputs);
  const seconds = (Date.now() - started) / 1000;
  writeFileSync(`evidence/${kind}-${name}.json`, JSON.stringify({seconds, framesPerSecond: frameCount / seconds, scale, concurrency, range, frames: frameCount, losslessReference: true, sharedBundle: sharedBundle !== undefined}, null, 2));
}
