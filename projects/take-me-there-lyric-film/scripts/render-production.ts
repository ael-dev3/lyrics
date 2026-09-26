import {spawn, execFileSync, type ChildProcess, type ChildProcessWithoutNullStreams} from 'node:child_process';
import {createHash} from 'node:crypto';
import {readFileSync, writeFileSync, mkdirSync, existsSync, renameSync, statSync, statfsSync} from 'node:fs';
import {basename, dirname, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {createCanvas, GlobalFonts, ImageData} from '@napi-rs/canvas';
import {assertGate, hashes} from './render-gate.ts';
import {loadScene, paintScene, type Format} from '../src/scene.ts';

// Keep the production gate ahead of output creation, frame capture and encoders.
assertGate();

const root = fileURLToPath(new URL('../', import.meta.url));
const source = resolve(root, 'public/source.mp4');
const scriptPath = fileURLToPath(import.meta.url);
const ownHash = sha(readFileSync(scriptPath));
const approvedInputs = hashes();
const args = process.argv.slice(2);
const option = (flag: string): string | undefined => {
  const at = args.indexOf(flag);
  return at < 0 ? undefined : args[at + 1];
};
const mode = args.includes('--production') ? 'production' : args.includes('--still') ? 'still' : null;
if (!mode || (args.includes('--production') && args.includes('--still'))) throw Error('Choose --still or --production');
const format = option('--format');
if (format !== 'landscape' && format !== 'portrait') throw Error('Choose --format landscape|portrait');
const dimensions = format === 'landscape' ? {width: 1920, height: 1080} : {width: 1080, height: 1920};
const at = option('--at');
if (mode === 'production' && at !== undefined) throw Error('--at is only for diagnostic stills');
if (mode === 'still' && (at === undefined || !Number.isFinite(Number(at)))) throw Error('--still requires --at SECONDS');

type Probe = {streams: {nb_frames?: string; r_frame_rate?: string; width?: number; height?: number; duration?: string}[]; format?: {duration?: string}};
const probe = JSON.parse(execFileSync('ffprobe', ['-v','error','-select_streams','v:0','-show_entries','stream=nb_frames,r_frame_rate,width,height,duration','-show_entries','format=duration','-of','json',source], {encoding: 'utf8'})) as Probe;
const video = probe.streams[0];
if (!video || video.width !== 1920 || video.height !== 1080 || video.r_frame_rate !== '60/1') throw Error('Source video is not the approved 1920×1080 60 fps stream');
const sourceFrames = Number(video.nb_frames);
const audioEnd = Number(probe.format?.duration);
const targetFrames = Math.ceil(audioEnd * 60);
if (!Number.isInteger(sourceFrames) || sourceFrames < 1 || !Number.isFinite(audioEnd) || targetFrames < sourceFrames || targetFrames - sourceFrames > 3) throw Error('Unexpected source frame count or audio tail');
const first = mode === 'still' ? Math.round(Number(at) * 60) : 0;
if (first < 0 || first >= sourceFrames) throw Error('Diagnostic still is outside source pictures');

const output = resolve(root, mode === 'still'
  ? `renders/diagnostic/TAKE-ME-THERE-${format}-${String(first).padStart(4, '0')}.png`
  : `renders/TAKE-ME-THERE-${format}-${dimensions.width}x${dimensions.height}-60fps.mp4`);
const partial = output.replace(/\.(png|mp4)$/u, '.partial.$1');
if (existsSync(output) || existsSync(partial)) throw Error(`Output already exists: ${output}`);
const free = statfsSync(root);
if (mode === 'production' && free.bavail * free.bsize < 4e9) throw Error('At least 4 GB free space is required');

// The scene has one Canvas2D implementation. This thin host supplies the same
// approved scene inputs and font to @napi-rs/canvas without changing scene.ts.
if (!GlobalFonts.registerFromPath(resolve(root, 'public/fonts/SpaceGrotesk.ttf'), 'SpaceGrotesk')) throw Error('SpaceGrotesk font could not be registered');
const originalFetch = globalThis.fetch;
(globalThis as unknown as {document: Document}).document = {
  fonts: {load: async () => [{}], check: () => true},
  createElement: (name: string) => {
    if (name !== 'canvas') throw Error(`Unexpected element: ${name}`);
    return createCanvas(1, 1);
  },
} as unknown as Document;
globalThis.fetch = async (input, init) => {
  const url = String(input);
  if (!url.startsWith('/public/')) return originalFetch(input, init);
  const bytes = readFileSync(resolve(root, `.${url}`));
  return new Response(bytes, {status: 200});
};
await loadScene();
const scene = createCanvas(dimensions.width, dimensions.height);
const sceneContext = scene.getContext('2d');
// The source TTF is variable (wght 300–700). Skia registers its default 300
// face, so CSS "700" alone leaves the native renderer visibly too thin.
sceneContext.fontVariationSettings = "'wght' 700";
const sourceCanvas = createCanvas(1920, 1080);
const sourceContext = sourceCanvas.getContext('2d');
const frameBytes = 1920 * 1080 * 4;
let lastSource: Buffer | undefined;

function sha(bytes: Uint8Array): string {return createHash('sha256').update(bytes).digest('hex');}
function verifyFrozenInputs(): void {
  assertGate();
  if (sha(readFileSync(scriptPath)) !== ownHash || JSON.stringify(hashes()) !== JSON.stringify(approvedInputs)) throw Error('Renderer or approved inputs changed during capture');
}
function paint(sourceBytes: Buffer, outputFrame: number): Buffer {
  const raw = new ImageData(new Uint8ClampedArray(sourceBytes.buffer, sourceBytes.byteOffset, sourceBytes.byteLength), 1920, 1080);
  sourceContext.putImageData(raw, 0, 0);
  paintScene(sceneContext as unknown as CanvasRenderingContext2D, outputFrame / 60, format as Format, sourceCanvas as unknown as CanvasImageSource);
  const rendered = scene.data();
  if (rendered.byteLength !== dimensions.width * dimensions.height * 4) throw Error('Unexpected rendered frame size');
  return rendered;
}
async function* decodedFrames(child: ChildProcessWithoutNullStreams): AsyncGenerator<Buffer> {
  let frame = Buffer.allocUnsafe(frameBytes), used = 0;
  for await (const part of child.stdout) {
    const chunk = part as Buffer;
    for (let offset = 0; offset < chunk.byteLength;) {
      const count = Math.min(frameBytes - used, chunk.byteLength - offset);
      chunk.copy(frame, used, offset, offset + count);
      offset += count; used += count;
      if (used === frameBytes) {
        yield frame;
        frame = Buffer.allocUnsafe(frameBytes); used = 0;
      }
    }
  }
  if (used !== 0) throw Error(`Decoder returned a truncated frame (${used} bytes)`);
}
function startDecoder(frame?: number): ChildProcessWithoutNullStreams {
  const filter = frame === undefined ? [] : ['-vf', `select=eq(n\\,${frame})`, '-frames:v', '1'];
  const child = spawn('ffmpeg', ['-hide_banner','-v','error','-nostdin','-i',source,'-map','0:v:0',...filter,'-fps_mode','passthrough','-f','rawvideo','-pix_fmt','rgba','pipe:1'], {stdio: ['pipe','pipe','pipe']});
  child.stdin.end();
  return child;
}
async function exitOf(child: ChildProcess, label: string): Promise<void> {
  if (child.exitCode !== null) {
    if (child.exitCode !== 0) throw Error(`${label} exited ${child.exitCode}`);
    return;
  }
  const code = await new Promise<number | null>((resolveExit, reject) => {
    child.once('error', reject);
    child.once('close', resolveExit);
  });
  if (code !== 0) throw Error(`${label} exited ${code}`);
}

mkdirSync(dirname(output), {recursive: true});
const begun = Date.now();
if (mode === 'still') {
  const decoder = startDecoder(first);
  let frames = 0;
  for await (const bytes of decodedFrames(decoder)) {
    frames++;
    // Paint is deliberately separate from decoding so the saved still is the
    // exact requested source frame, never a player screenshot.
    paint(bytes, first);
    writeFileSync(partial, await scene.encode('png'));
  }
  await exitOf(decoder, 'Source decoder');
  if (frames !== 1) throw Error(`Expected one source frame, got ${frames}`);
  verifyFrozenInputs();
  renameSync(partial, output);
  console.log(JSON.stringify({mode, format, frame: first, sourceTime: first / 60, output, sha256: sha(readFileSync(output)), elapsedSeconds: (Date.now() - begun) / 1000}));
} else {
  const encoder = spawn('ffmpeg', [
    '-hide_banner','-v','warning','-nostdin','-n',
    '-f','rawvideo','-pix_fmt','rgba','-s',`${dimensions.width}x${dimensions.height}`,'-framerate','60','-i','pipe:0',
    '-i',source,'-map','0:v:0','-map','1:a:0',
    '-c:v','libx264','-preset','medium','-crf','17','-threads','6','-g','120','-pix_fmt','yuv420p',
    '-color_range','tv','-color_primaries','bt709','-color_trc','bt709','-colorspace','bt709',
    '-video_track_timescale','60000','-frames:v',String(targetFrames),'-c:a','copy',
    '-movflags','+faststart','-metadata','title=excape. — TAKE ME THERE | Lyric Film',partial,
  ], {stdio: ['pipe','ignore','pipe']});
  let encoderError = '';
  encoder.stderr.on('data', chunk => {encoderError += String(chunk); if (encoderError.length > 8000) encoderError = encoderError.slice(-8000);});
  const decoder = startDecoder();
  let sourceCount = 0, outputCount = 0, lastReport = Date.now();
  try {
    for await (const bytes of decodedFrames(decoder)) {
      if (sourceCount >= sourceFrames) throw Error('Source has more frames than approved metadata');
      lastSource = bytes;
      const rendered = paint(bytes, outputCount);
      await new Promise<void>((done, reject) => encoder.stdin.write(rendered, error => error ? reject(error) : done()));
      sourceCount++; outputCount++;
      if (Date.now() - lastReport > 10000) {
        lastReport = Date.now();
        console.log(JSON.stringify({format, phase: 'rendering', outputCount, targetFrames, elapsedSeconds: (lastReport - begun) / 1000}));
      }
    }
    await exitOf(decoder, 'Source decoder');
    if (sourceCount !== sourceFrames || !lastSource) throw Error(`Source frame count ${sourceCount} differs from ${sourceFrames}`);
    while (outputCount < targetFrames) {
      const rendered = paint(lastSource, outputCount);
      await new Promise<void>((done, reject) => encoder.stdin.write(rendered, error => error ? reject(error) : done()));
      outputCount++;
    }
    encoder.stdin.end();
    await exitOf(encoder, `Encoder: ${encoderError}`);
    verifyFrozenInputs();
    renameSync(partial, output);
    const receipt = {status: 'encoded; independent final-file verification pending', output: basename(output), format, width: dimensions.width, height: dimensions.height, fps: 60, sourceFrames, outputFrames: outputCount, audioTailFrames: outputCount - sourceCount, sourceClock: 'n/60', audio: 'Original AAC stream copy', approvedInputHashes: approvedInputs, rendererSha256: ownHash, sha256: sha(readFileSync(output)), bytes: statSync(output).size, elapsedSeconds: (Date.now() - begun) / 1000};
    writeFileSync(`${output}.json`, JSON.stringify(receipt, null, 2) + '\n');
    console.log(JSON.stringify(receipt));
  } catch (error) {
    encoder.stdin.destroy(); encoder.kill('SIGTERM'); decoder.kill('SIGTERM');
    throw error;
  }
}
