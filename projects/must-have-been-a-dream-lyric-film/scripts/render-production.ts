import {spawn, execFileSync, type ChildProcess, type ChildProcessWithoutNullStreams} from 'node:child_process';
import {createHash} from 'node:crypto';
import {readFileSync, writeFileSync, mkdirSync, existsSync, renameSync, statSync, statfsSync} from 'node:fs';
import {basename, dirname, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {createCanvas, GlobalFonts, Image as NativeImage, ImageData} from '@napi-rs/canvas';
import {assertGate, hashes} from './render-gate.ts';
import {loadScene, paintScene, type Format} from '../src/scene.ts';

// Keep the production gate ahead of output creation, frame capture and encoders.
assertGate();

const root = fileURLToPath(new URL('../', import.meta.url));
const source = resolve(root, 'public/source.mp4');
const FPS_NUM = 24000, FPS_DEN = 1001, FPS = FPS_NUM / FPS_DEN;
const scriptPath = fileURLToPath(import.meta.url);
const ownHash = sha(readFileSync(scriptPath));
const approvedInputs = hashes();
const args = process.argv.slice(2);
const option = (flag: string): string | undefined => {
  const at = args.indexOf(flag);
  return at < 0 ? undefined : args[at + 1];
};
const requestedModes = ['production', 'still', 'proof'].filter(name => args.includes(`--${name}`));
if (requestedModes.length !== 1) throw Error('Choose exactly one of --still, --proof, or --production');
const mode = requestedModes[0]!;
const format = option('--format');
if (format !== 'landscape' && format !== 'portrait') throw Error('Choose --format landscape|portrait');
const dimensions = format === 'landscape' ? {width: 1920, height: 1080} : {width: 1080, height: 1920};
const at = option('--at');
const requestedDuration = option('--duration');
if (mode === 'production' && (at !== undefined || requestedDuration !== undefined)) throw Error('Production encodes the full source clock');
if (mode !== 'production' && (at === undefined || !Number.isFinite(Number(at)))) throw Error('--still and --proof require --at SECONDS');
if (mode === 'proof' && (requestedDuration === undefined || !Number.isFinite(Number(requestedDuration)) || Number(requestedDuration) <= 0 || Number(requestedDuration) > 5)) throw Error('--proof requires --duration SECONDS from 0 to 5');
if (mode !== 'proof' && requestedDuration !== undefined) throw Error('--duration is only for --proof');

type Probe = {streams: {nb_frames?: string; r_frame_rate?: string; width?: number; height?: number; duration?: string}[]; format?: {duration?: string}};
const probe = JSON.parse(execFileSync('ffprobe', ['-v','error','-select_streams','v:0','-show_entries','stream=nb_frames,r_frame_rate,width,height,duration','-show_entries','format=duration','-of','json',source], {encoding: 'utf8'})) as Probe;
const video = probe.streams[0];
if (!video || video.width !== 1920 || video.height !== 1080 || video.r_frame_rate !== '24000/1001') throw Error('Source video is not the approved 1920×1080 24000/1001 fps stream');
const sourceFrames = Number(video.nb_frames);
const audioEnd = Number(probe.format?.duration);
const targetFrames = Math.ceil(audioEnd * FPS);
if (!Number.isInteger(sourceFrames) || sourceFrames < 1 || !Number.isFinite(audioEnd) || targetFrames < sourceFrames || targetFrames - sourceFrames > 3) throw Error('Unexpected source frame count or audio tail');
const first = mode === 'production' ? 0 : Math.round(Number(at) * FPS);
if (first < 0 || first >= sourceFrames) throw Error('Diagnostic start is outside source pictures');
const lastExclusive = mode === 'proof' ? Math.min(targetFrames, first + Math.ceil(Number(requestedDuration) * FPS)) : targetFrames;
const proofFrames = lastExclusive - first;
if (mode === 'proof' && proofFrames < 1) throw Error('Proof duration resolves to no source-clock frame');

const output = resolve(root, mode === 'still'
  ? `renders/diagnostic/MUST-HAVE-BEEN-A-DREAM-${format}-${String(first).padStart(4, '0')}.png`
  : mode === 'proof'
    ? `renders/diagnostic/MUST-HAVE-BEEN-A-DREAM-${format}-PROOF-${first}-${proofFrames}.mp4`
    : `renders/MUST-HAVE-BEEN-A-DREAM-${format}-${dimensions.width}x${dimensions.height}-24000of1001fps.mp4`);
const partial = output.replace(/\.(png|mp4)$/u, '.partial.$1');
if (existsSync(output) || existsSync(partial)) throw Error(`Output already exists: ${output}`);
const free = statfsSync(root);
if (mode === 'production' && free.bavail * free.bsize < 4e9) throw Error('At least 4 GB free space is required');

// The scene has one Canvas2D implementation. This thin host supplies the same
// approved scene inputs and font to @napi-rs/canvas without changing scene.ts.
if (!GlobalFonts.registerFromPath(resolve(root, 'public/ArchivoBlack-Regular.ttf'), 'ArchivoBlack')) throw Error('ArchivoBlack font could not be registered');
const sourceImageDescriptor = Object.getOwnPropertyDescriptor(NativeImage.prototype, 'src');
if (!sourceImageDescriptor?.set) throw Error('Native image source setter unavailable');
Object.defineProperty(NativeImage.prototype, 'src', {
  ...sourceImageDescriptor,
  set(this: NativeImage, value: string | Buffer) {
    if (typeof value !== 'string' || !value.startsWith('/public/')) throw Error('Unexpected source still path');
    sourceImageDescriptor.set!.call(this, resolve(root, `.${value}`));
  },
});
(globalThis as unknown as {Image: typeof NativeImage}).Image = NativeImage;
(globalThis as unknown as {HTMLMediaElement: {HAVE_CURRENT_DATA: number}}).HTMLMediaElement = {HAVE_CURRENT_DATA: 2};
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
const sourceCanvas = createCanvas(1920, 1080);
Object.assign(sourceCanvas, {readyState: 2, videoWidth: 1920, videoHeight: 1080});
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
  paintScene(sceneContext as unknown as CanvasRenderingContext2D, outputFrame / FPS, format as Format, sourceCanvas as unknown as HTMLVideoElement);
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
function startDecoder(from?: number, through?: number): ChildProcessWithoutNullStreams {
  const filter = from === undefined || through === undefined ? [] : [
    '-vf', `select=between(n\\,${from}\\,${through})`, '-frames:v', String(through - from + 1),
  ];
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
  // A short run-up recreates the scene's previous-live-frame memory at a seek.
  const warmupStart = Math.max(0, first - Math.ceil(1.3 * FPS));
  const decoder = startDecoder(warmupStart, first);
  let frames = 0;
  for await (const bytes of decodedFrames(decoder)) {
    frames++;
    paint(bytes, warmupStart + frames - 1);
  }
  await exitOf(decoder, 'Source decoder');
  if (frames !== first - warmupStart + 1) throw Error(`Expected ${first - warmupStart + 1} source frames, got ${frames}`);
  writeFileSync(partial, await scene.encode('png'));
  verifyFrozenInputs();
  renameSync(partial, output);
  console.log(JSON.stringify({mode, format, frame: first, sourceTime: first / FPS, warmupFrames: frames - 1, output, sha256: sha(readFileSync(output)), elapsedSeconds: (Date.now() - begun) / 1000}));
} else {
  const diagnostic = mode === 'proof';
  const expectedOutput = diagnostic ? proofFrames : targetFrames;
  const decodeStart = diagnostic ? Math.max(0, first - Math.ceil(1.3 * FPS)) : 0;
  const decodeLast = diagnostic ? Math.min(sourceFrames - 1, lastExclusive - 1) : sourceFrames - 1;
  const audioInput = diagnostic ? ['-ss', (first / FPS).toFixed(9), '-i', source] : ['-i', source];
  const encoder = spawn('ffmpeg', [
    '-hide_banner','-v','warning','-nostdin','-n',
    '-f','rawvideo','-pix_fmt','rgba','-s',`${dimensions.width}x${dimensions.height}`,'-framerate','24000/1001','-i','pipe:0',
    ...audioInput,'-map','0:v:0','-map','1:a:0',
    // The default RGBA -> yuv420p swscale matrix is BT.601 even at HD sizes.
    // Convert with BT.709 first; the flags below then declare the same truth.
    '-vf','scale=in_range=full:out_range=limited:out_color_matrix=bt709,format=yuv420p,setsar=1,setparams=color_primaries=bt709:color_trc=bt709:colorspace=bt709:range=tv',
    '-c:v','libx264','-preset','medium','-crf','17','-threads','6','-g','120','-pix_fmt','yuv420p',
    '-color_range','tv','-color_primaries','bt709','-color_trc','bt709','-colorspace','bt709',
    '-bsf:v','h264_metadata=sample_aspect_ratio=1/1:colour_primaries=1:transfer_characteristics=1:matrix_coefficients=1',
    '-video_track_timescale','24000','-frames:v',String(expectedOutput),'-c:a','copy',
    ...(diagnostic ? ['-t', (expectedOutput / FPS).toFixed(9)] : []),
    '-movflags','+faststart','-metadata','title=Computer Kill — Must Have Been A Dream | Lyric Film',partial,
  ], {stdio: ['pipe','ignore','pipe']});
  let encoderError = '';
  encoder.stderr.on('data', chunk => {encoderError += String(chunk); if (encoderError.length > 8000) encoderError = encoderError.slice(-8000);});
  const decoder = diagnostic ? startDecoder(decodeStart, decodeLast) : startDecoder();
  let sourceCount = 0, outputCount = 0, lastReport = Date.now();
  try {
    for await (const bytes of decodedFrames(decoder)) {
      const sourceIndex = decodeStart + sourceCount;
      if (sourceIndex > decodeLast) throw Error('Source has more frames than approved metadata');
      sourceCount++;
      lastSource = bytes;
      const rendered = paint(bytes, sourceIndex);
      if (sourceIndex < first) continue;
      await new Promise<void>((done, reject) => encoder.stdin.write(rendered, error => error ? reject(error) : done()));
      outputCount++;
      if (Date.now() - lastReport > 10000) {
        lastReport = Date.now();
        console.log(JSON.stringify({format, phase: diagnostic ? 'proof' : 'rendering', outputCount, targetFrames: expectedOutput, elapsedSeconds: (lastReport - begun) / 1000}));
      }
    }
    await exitOf(decoder, 'Source decoder');
    if (sourceCount !== decodeLast - decodeStart + 1 || !lastSource) throw Error(`Source frame count ${sourceCount} differs from expected decoded range`);
    while (outputCount < expectedOutput) {
      const rendered = paint(lastSource, first + outputCount);
      await new Promise<void>((done, reject) => encoder.stdin.write(rendered, error => error ? reject(error) : done()));
      outputCount++;
    }
    encoder.stdin.end();
    await exitOf(encoder, `Encoder: ${encoderError}`);
    verifyFrozenInputs();
    renameSync(partial, output);
    const receipt = {status: diagnostic ? 'diagnostic encode; not a deliverable' : 'encoded; independent final-file verification pending', output: basename(output), format, width: dimensions.width, height: dimensions.height, fps: '24000/1001', sourceFrames, sourceStartFrame: first, decodedSourceFrames: sourceCount, outputFrames: outputCount, audioTailFrames: Math.max(0, lastExclusive - sourceFrames), sourceClock: 'n*1001/24000', audio: 'Original AAC stream copy', approvedInputHashes: approvedInputs, rendererSha256: ownHash, sha256: sha(readFileSync(output)), bytes: statSync(output).size, elapsedSeconds: (Date.now() - begun) / 1000};
    writeFileSync(`${output}.json`, JSON.stringify(receipt, null, 2) + '\n');
    console.log(JSON.stringify(receipt));
  } catch (error) {
    encoder.stdin.destroy(); encoder.kill('SIGTERM'); decoder.kill('SIGTERM');
    throw error;
  }
}
