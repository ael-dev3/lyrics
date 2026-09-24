import {spawnSync} from 'node:child_process';
import {existsSync, mkdirSync} from 'node:fs';
import {resolve} from 'node:path';
import {bundle} from '@remotion/bundler';
import {renderMedia, selectComposition} from '@remotion/renderer';
import type {Format} from '../src/config.ts';
import {assertProductionGate} from './production-contract.ts';

const production = process.argv.includes('--production');
const formatPosition = process.argv.indexOf('--format');
const formatArg = process.argv[formatPosition + 1];
if (!production || formatPosition < 0 || (formatArg !== 'landscape' && formatArg !== 'portrait')) {
  throw new Error('PRODUCTION BLOCKED: use npm run render -- --production --format landscape|portrait after approval.');
}
const format: Format = formatArg;
assertProductionGate();

const output = resolve('output', `Rainline-${format}.mp4`);
if (existsSync(output)) throw new Error(`Refusing to overwrite ${output}`);
mkdirSync(resolve('output'), {recursive: true});
const picture = resolve('output', `Rainline-${format}-picture-only.mp4`);
if (existsSync(picture)) throw new Error(`Refusing to overwrite ${picture}`);
const inputProps = {format, renderPermit: true};
const serveUrl = await bundle({entryPoint: resolve('src/index.tsx'), publicDir: resolve('public')});
const composition = await selectComposition({serveUrl, id: format, inputProps});
await renderMedia({
  serveUrl,
  composition,
  inputProps,
  outputLocation: picture,
  codec: 'h264',
  pixelFormat: 'yuv420p',
  imageFormat: 'png',
  colorSpace: 'bt709',
  crf: 16,
  x264Preset: 'slow',
  muted: true,
  concurrency: 4,
});
const result = spawnSync('ffmpeg', [
  '-v', 'error', '-i', picture, '-i', resolve('public/soundtrack.m4a'),
  '-map', '0:v:0', '-map', '1:a:0', '-c:v', 'copy', '-c:a', 'copy',
  '-movflags', '+faststart', output,
], {stdio: 'inherit'});
if (result.status !== 0) throw new Error(`FFmpeg assembly failed with status ${String(result.status)}`);
console.log(`Production file: ${output}`);
