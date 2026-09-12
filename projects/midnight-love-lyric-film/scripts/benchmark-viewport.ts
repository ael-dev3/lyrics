import assert from 'node:assert/strict';
import {bundle} from '@remotion/bundler';
import {makeCancelSignal, renderMedia, renderStill, selectComposition} from '@remotion/renderer';
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {createReadStream, mkdirSync, readFileSync, readdirSync, writeFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {FPS, FRAMES} from '../src/config.ts';
import {REVISION_VIEWPORTS} from '../src/viewport-config.ts';

// Bounded crop-equivalence proof and throughput measurement, not a full render.
const root = 'evidence/viewport-proof';
mkdirSync(root, {recursive: true});
const selectedFrames = [0, 900, 2186, 4844, 9840, 11028, 11340, FRAMES - 1];
const cases = [
  {kind: 'youtube', fullId: 'MidnightYouTube', cropId: 'MidnightYouTubeViewport', ...REVISION_VIEWPORTS.youtube},
  {kind: 'tiktok', fullId: 'MidnightTikTok', cropId: 'MidnightTikTokViewport', ...REVISION_VIEWPORTS.tiktok},
] as const;
const hashFile = async (path: string): Promise<string> => {
  const hash = createHash('sha256'); for await (const chunk of createReadStream(path)) hash.update(chunk); return hash.digest('hex');
};
const paths = [...readdirSync('src').map(path => 'src/' + path), 'scripts/benchmark-viewport.ts', 'package-lock.json'];
const inputs = [];
for (const path of paths.sort()) inputs.push({path, sha256: await hashFile(path)});
assert(!readFileSync('src/Film.tsx', 'utf8').includes('bottom:-3,height:3'), 'Wait for the color-only lyric style before proving this revision');
const serveUrl = await bundle({entryPoint: resolve('src/index.tsx')});
const {cancelSignal, cancel} = makeCancelSignal();
process.once('SIGINT', cancel); process.once('SIGTERM', cancel);
const decodedRgbaHash = (path: string, crop?: {x: number; y: number; width: number; height: number}) => {
  const filter = crop ? `crop=${crop.width * 2}:${crop.height * 2}:${crop.x * 2}:${crop.y * 2},format=rgba` : 'format=rgba';
  const result = execFileSync('ffmpeg', ['-v', 'error', '-threads', '1', '-i', path, '-vf', filter, '-frames:v', '1', '-c:v', 'rawvideo', '-threads', '1', '-f', 'hash', '-hash', 'sha256', '-'], {encoding: 'utf8'}).trim();
  assert(/^SHA256=[a-f0-9]{64}$/.test(result)); return result.slice('SHA256='.length);
};
const proof: {kind: string; frame: number; fullPng: string; viewportPng: string; fullCropRgbaSha256: string; viewportRgbaSha256: string; matched: boolean}[] = [];
const benchmarks: unknown[] = [];
const started = Date.now();
for (const item of cases) {
  const full = await selectComposition({serveUrl, id: item.fullId});
  const viewport = await selectComposition({serveUrl, id: item.cropId});
  assert.equal(viewport.width, item.width); assert.equal(viewport.height, item.height);
  for (const composition of [full, viewport]) {assert.equal(composition.fps, FPS); assert.equal(composition.durationInFrames, FRAMES);}
  for (const frame of selectedFrames) {
    const fullPng = `${root}/${item.kind}-full-f${frame}.png`, viewportPng = `${root}/${item.kind}-viewport-f${frame}.png`;
    await renderStill({serveUrl, composition: full, cancelSignal, frame, scale: 2, output: fullPng, imageFormat: 'png'});
    await renderStill({serveUrl, composition: viewport, cancelSignal, frame, scale: 2, output: viewportPng, imageFormat: 'png'});
    const fullCropRgbaSha256 = decodedRgbaHash(fullPng, item), viewportRgbaSha256 = decodedRgbaHash(viewportPng);
    const row = {kind: item.kind, frame, fullPng, viewportPng, fullCropRgbaSha256, viewportRgbaSha256, matched: fullCropRgbaSha256 === viewportRgbaSha256};
    proof.push(row);
    writeFileSync(`${root}/progress.json`, JSON.stringify({inputs, selectedFrames, proof, benchmarks, finished: false}, null, 2));
    console.log(JSON.stringify({kind: item.kind, frame, pngCropExactlyMatched: row.matched, seconds: (Date.now() - started) / 1000}));
    assert(row.matched, `Viewport differs from full Film crop: ${item.kind}:${frame}`);
  }
  if (!process.argv.includes('--proof-only')) {
    const output = `${root}/${item.kind}-benchmark-120f-lossless.mkv`, begin = Date.now();
    await renderMedia({serveUrl, composition: viewport, cancelSignal, frameRange: [9840, 9959], scale: 2,
      imageFormat: 'png', codec: 'h264', crf: 1, x264Preset: 'ultrafast', pixelFormat: 'yuv444p', colorSpace: 'bt709', muted: true, concurrency: 3, outputLocation: output,
      ffmpegOverride: ({args}) => {const result = [...args], index = result.indexOf('-crf'); if (index >= 0) result[index + 1] = '0'; return result;},
      onProgress: value => {if (value.renderedFrames === 120) console.log(JSON.stringify({kind: item.kind, benchmarkRenderedFrames: value.renderedFrames, encodedFrames: value.encodedFrames}));},
    });
    const seconds = (Date.now() - begin) / 1000;
    const metadata = JSON.parse(execFileSync('ffprobe', ['-v', 'error', '-count_frames', '-select_streams', 'v:0', '-show_entries', 'stream=width,height,pix_fmt,nb_read_frames,avg_frame_rate', '-of', 'json', output], {encoding: 'utf8'})) as {streams: {width: number; height: number; pix_fmt: string; nb_read_frames: string; avg_frame_rate: string}[]};
    const stream = metadata.streams[0]; assert(stream); assert.equal(stream.width, item.width * 2); assert.equal(stream.height, item.height * 2);
    assert.equal(stream.pix_fmt, 'yuv444p'); assert.equal(Number(stream.nb_read_frames), 120); assert.equal(stream.avg_frame_rate, `${FPS}/1`);
    benchmarks.push({kind: item.kind, output, range: [9840, 9959], frames: 120, scale: 2, concurrency: 3, seconds, framesPerSecond: 120 / seconds, projectedFullTimelineMinutes: FRAMES / (120 / seconds) / 60, stream, sha256: await hashFile(output)});
    console.log(JSON.stringify(benchmarks.at(-1)));
  }
}
for (const input of inputs) assert.equal(await hashFile(input.path), input.sha256, `Source changed while checking viewport: ${input.path}`);
const report = {passed: proof.every(row => row.matched), inputs, scale: 2, sourceFrameClock: 'Global 60 fps frame; no sequence/offset retiming', viewports: cases, proof, benchmarks, seconds: (Date.now() - started) / 1000,
  limits: 'Sixteen selected PNG comparisons prove identical captured RGBA pixels inside the listed rectangles at those frames. This is not an exhaustive proof over all frames or of pixels outside the rectangles. Benchmark projections are estimates, not promises. Opaque YUV444 overlay and final encoding require separate pixel/frame/audio verification.'};
writeFileSync('evidence/viewport-proof.json', JSON.stringify(report, null, 2));
writeFileSync(`${root}/progress.json`, JSON.stringify({...report, finished: true}, null, 2));
console.log(JSON.stringify({passed: report.passed, comparedFrames: proof.length, seconds: report.seconds, report: 'evidence/viewport-proof.json'}));
