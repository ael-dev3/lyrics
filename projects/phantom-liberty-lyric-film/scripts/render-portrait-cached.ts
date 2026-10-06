import {spawn, execFileSync, type ChildProcess, type ChildProcessWithoutNullStreams} from 'node:child_process';
import {createHash} from 'node:crypto';
import {createReadStream, readFileSync, writeFileSync, mkdirSync, existsSync, renameSync, statSync, statfsSync} from 'node:fs';
import {basename, dirname, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {createCanvas, GlobalFonts, ImageData} from '@napi-rs/canvas';
import {checkCurrentProductionGate} from './render-gate.ts';
import {createCachedPainter} from './cached-painter.ts';
import {COMPOSITION, initScene, paintScene} from '../src/scene.ts';
import type {FeatureData, Format, Timeline} from '../src/model.ts';

export const root = fileURLToPath(new URL('../', import.meta.url));
export const OUTPUT_RATE = {numerator: 60000, denominator: 1001} as const;
export interface Recording {
  sourceSha256: string; originSeconds: number; sampleRate: number; decodedSampleCount: number;
  sourceDuration: number; pictureDuration: number; audioStreamDuration: number;
  picture: {width: number; height: number; frameRate: {numerator: number; denominator: number}; frameCount: number};
}
export interface RenderClock {
  sourceFrames: number; sourceRate: {numerator: number; denominator: number};
  outputFrames: number; outputRate: {numerator: number; denominator: number};
  audioSamples: number; sampleRate: number; audioEnd: number; videoEnd: number; outputEnd: number;
}
export const readJson = <T>(path: string): T => JSON.parse(readFileSync(resolve(root, path), 'utf8')) as T;
const sha = (bytes: Uint8Array): string => createHash('sha256').update(bytes).digest('hex');
export async function fileHash(path: string): Promise<string> {
  const hash = createHash('sha256');
  for await (const chunk of createReadStream(path)) hash.update(chunk as Buffer);
  return hash.digest('hex');
}
export function renderClock(recording: Recording): RenderClock {
  const v = recording.picture, r = v.frameRate;
  if (v.width !== 1920 || v.height !== 1080 || r.numerator !== 30000 || r.denominator !== 1001 ||
      recording.originSeconds !== 0 || recording.sampleRate !== 44100 ||
      !Number.isSafeInteger(v.frameCount) || v.frameCount < 1 ||
      !Number.isSafeInteger(recording.decodedSampleCount) || recording.decodedSampleCount < 1)
    throw Error('Unexpected original source clock');
  const audioEnd = recording.decodedSampleCount / recording.sampleRate;
  const videoEnd = v.frameCount * r.denominator / r.numerator;
  if (Math.abs(audioEnd - recording.audioStreamDuration) > 1 / recording.sampleRate ||
      Math.abs(audioEnd - recording.sourceDuration) > 1 / recording.sampleRate ||
      Math.abs(videoEnd - recording.pictureDuration) > .000001 || audioEnd < videoEnd || audioEnd - videoEnd > .1)
    throw Error('Unexpected original audio tail');
  // Integer cross-products preserve rational cadence and cover every original
  // decoded sample. The last source picture is held through the AAC tail.
  const outputFrames = Math.ceil(recording.decodedSampleCount * OUTPUT_RATE.numerator /
    (recording.sampleRate * OUTPUT_RATE.denominator));
  return {sourceFrames: v.frameCount, sourceRate: r, outputFrames, outputRate: OUTPUT_RATE,
    audioSamples: recording.decodedSampleCount, sampleRate: recording.sampleRate, audioEnd, videoEnd,
    outputEnd: outputFrames * OUTPUT_RATE.denominator / OUTPUT_RATE.numerator};
}
export function sourceFrameForOutput(frame: number, clock: RenderClock): number {
  if (!Number.isSafeInteger(frame) || frame < 0 || frame >= clock.outputFrames) throw Error('Output frame outside locked duration');
  return Math.min(clock.sourceFrames - 1, Math.floor(frame / 2));
}
export function sceneTimeForOutput(frame: number): number {
  if (!Number.isSafeInteger(frame) || frame < 0) throw Error('Invalid scene frame');
  let time = frame * OUTPUT_RATE.denominator / OUTPUT_RATE.numerator;
  const exactFeatureRow = Math.floor(frame / 2), bits = new DataView(new ArrayBuffer(8));
  // Correct only IEEE754 representation at exact native feature-row borders.
  // Word comparisons use the unchanged model's sourceSample normalization.
  while (Math.floor(time * 30000 / 1001) < exactFeatureRow) {
    bits.setFloat64(0, time, false); bits.setBigUint64(0, bits.getBigUint64(0, false) + 1n, false);
    time = bits.getFloat64(0, false);
  }
  return time;
}
export function dimensions(format: Format): {width: number; height: number} {
  return {width: COMPOSITION[format].width, height: COMPOSITION[format].height};
}
export function createApprovedPainter(format: Format) {
  const timeline = readJson<Timeline>('public/timeline.json'), features = readJson<FeatureData>('public/audio-features.json');
  if (!GlobalFonts.registerFromPath(resolve(root, 'public/fonts/SpaceGrotesk.ttf'), 'PhantomGrotesk'))
    throw Error('Approved font registration failed');
  initScene(timeline, features);
  const size = dimensions(format), canvas = createCanvas(size.width, size.height);
  const context = canvas.getContext('2d') as unknown as CanvasRenderingContext2D;
  const sourceCanvas = createCanvas(1920, 1080), sourceContext = sourceCanvas.getContext('2d');
  let priorSource = -1;
  return {canvas, context, timeline, paint(bytes: Buffer, sourceFrame: number, outputFrame: number): Buffer {
    if (bytes.length !== 1920 * 1080 * 4) throw Error('Wrong original frame byte count');
    if (priorSource !== sourceFrame) {
      sourceContext.putImageData(new ImageData(new Uint8ClampedArray(bytes.buffer, bytes.byteOffset, bytes.byteLength), 1920, 1080), 0, 0);
      priorSource = sourceFrame;
    }
    paintScene(context, sceneTimeForOutput(outputFrame), format, sourceCanvas as unknown as CanvasImageSource);
    const rendered = canvas.data();
    if (rendered.length !== size.width * size.height * 4) throw Error('Wrong painted frame byte count');
    return rendered;
  }};
}
export async function* rawFrames(child: ChildProcessWithoutNullStreams, frameBytes: number): AsyncGenerator<Buffer> {
  let frame = Buffer.allocUnsafe(frameBytes), used = 0;
  for await (const part of child.stdout) {
    const chunk = part as Buffer;
    for (let offset = 0; offset < chunk.length;) {
      const count = Math.min(frameBytes - used, chunk.length - offset);
      chunk.copy(frame, used, offset, offset + count); offset += count; used += count;
      if (used === frameBytes) {yield frame; frame = Buffer.allocUnsafe(frameBytes); used = 0;}
    }
  }
  if (used !== 0) throw Error(`Decoder returned a truncated raw frame (${used} bytes)`);
}
export function watchChild(child: ChildProcess, label: string): Promise<void> {
  let stderr = ''; child.stderr?.on('data', chunk => {stderr = (stderr + String(chunk)).slice(-6000);});
  const done = new Promise<void>((accept, reject) => {
    child.once('error', reject);
    child.once('close', code => code === 0 ? accept() : reject(Error(`${label} exited ${code}: ${stderr.replaceAll(root, '<project>')}`)));
  });
  void done.catch(() => {}); return done;
}
export function startSourceDecoder(indices?: number[]): ChildProcessWithoutNullStreams {
  if (indices && (!indices.length || indices.some((n, i) => !Number.isSafeInteger(n) || n < 0 || (i > 0 && n <= indices[i - 1]!))))
    throw Error('Diagnostic source indices must be strictly increasing');
  const filter = indices ? ['-vf', `select=${indices.map(n => `eq(n\\,${n})`).join('+')}`, '-frames:v', String(indices.length)] : [];
  const child = spawn('ffmpeg', ['-hide_banner', '-v', 'error', '-nostdin', '-threads', '2', '-filter_threads', '1',
    '-i', resolve(root, 'public/source.mp4'), '-map', '0:v:0', ...filter,
    '-fps_mode', 'passthrough', '-f', 'rawvideo', '-pix_fmt', 'rgba', 'pipe:1'], {stdio: ['pipe', 'pipe', 'pipe']});
  child.stdin.end(); return child;
}
const writeFrame = (child: ChildProcessWithoutNullStreams, bytes: Buffer): Promise<void> =>
  new Promise((done, reject) => child.stdin.write(bytes, error => error ? reject(error) : done()));

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  if (args.includes('--help')) {
    console.log('Usage: node scripts/render-portrait-cached.ts --check-gate | --plan | --production --format portrait | --still --format portrait --frame N | --diagnostic --format portrait --start-frame N --frame-count N'); return;
  }
  // No decode, capture, painting, directory creation or encoding before the
  // exact reviewed revision has passed the current authorization gate.
  const approved = checkCurrentProductionGate();
  if (args.includes('--check-gate')) {console.log('Current production gate passed; no capture or output.'); return;}
  const recording = readJson<Recording>('source/recording.json'), clock = renderClock(recording);
  if (args.includes('--plan')) {
    console.log(JSON.stringify({...clock, sourceFrameMapping: `min(${clock.sourceFrames - 1}, floor(n/2))`,
      finalPictureFirstOutputFrame: (clock.sourceFrames - 1) * 2,
      audioTailSeconds: clock.audioEnd - clock.videoEnd, cfrRemainderSeconds: clock.outputEnd - clock.audioEnd})); return;
  }
  const option = (name: string): string | undefined => {const at = args.indexOf(name); return at < 0 ? undefined : args[at + 1];};
  const production = args.includes('--production'), still = args.includes('--still'), diagnostic = args.includes('--diagnostic');
  if (Number(production) + Number(still) + Number(diagnostic) !== 1) throw Error('Choose exactly one render mode');
  const selectedFormat = option('--format');
  if (selectedFormat !== 'portrait') throw Error('This cached producer permits only --format portrait');
  const format: Format = selectedFormat, size = dimensions(format);
  const frameOption = option('--frame'), startOption = option('--start-frame'), countOption = option('--frame-count');
  if (production && [frameOption, startOption, countOption].some(value => value !== undefined)) throw Error('A production render always includes the full recording');
  if (still && (startOption !== undefined || countOption !== undefined)) throw Error('--still accepts only --frame');
  if (diagnostic && frameOption !== undefined) throw Error('--diagnostic accepts only --start-frame and --frame-count');
  const firstFrame = still ? Number(frameOption) : diagnostic ? Number(startOption) : 0;
  const frameCount = still ? 1 : diagnostic ? Number(countOption) : clock.outputFrames;
  if (!Number.isSafeInteger(firstFrame) || firstFrame < 0 || !Number.isSafeInteger(frameCount) || frameCount < 1 || firstFrame + frameCount > clock.outputFrames)
    throw Error('Render range outside locked duration');
  const producerScript = 'scripts/render-portrait-cached.ts';
  const rendererPath = fileURLToPath(import.meta.url), producerSha256 = sha(readFileSync(rendererPath));
  const dependencyPaths = ['scripts/render-production.ts', 'scripts/cached-painter.ts'];
  const dependencyHashes = Object.fromEntries(dependencyPaths.map(path => [path, sha(readFileSync(resolve(root, path)))]));
  const rendererSha256 = dependencyHashes['scripts/render-production.ts']!;
  const frozenApproval = JSON.stringify(approved);
  const verifyFrozen = (): void => {
    if (JSON.stringify(checkCurrentProductionGate()) !== frozenApproval || sha(readFileSync(rendererPath)) !== producerSha256 ||
        dependencyPaths.some(path => sha(readFileSync(resolve(root, path))) !== dependencyHashes[path]))
      throw Error('Production inputs or renderer changed during export');
  };
  const sourcePath = resolve(root, 'public/source.mp4');
  const probe = JSON.parse(execFileSync('ffprobe', ['-v', 'error', '-select_streams', 'v:0', '-show_entries',
    'stream=width,height,r_frame_rate,nb_frames,start_time,duration', '-of', 'json', sourcePath], {encoding: 'utf8'})) as
    {streams: {width: number; height: number; r_frame_rate: string; nb_frames: string; start_time: string; duration: string}[]};
  const video = probe.streams[0];
  if (!video || video.width !== 1920 || video.height !== 1080 || video.r_frame_rate !== '30000/1001' ||
      Number(video.nb_frames) !== clock.sourceFrames || Number(video.start_time) !== 0 || Math.abs(Number(video.duration) - clock.videoEnd) > .000001)
    throw Error('Original picture differs from locked clock');
  const name = `Phantom-Liberty-TikTok-${size.width}x${size.height}-59.94fps`;
  const output = resolve(root, production ? `renders/${name}.mp4` :
    `renders/diagnostic/${name}-cached-${String(firstFrame).padStart(5, '0')}-${frameCount}.${still ? 'png' : 'mp4'}`);
  const partial = output.replace(/\.(mp4|png)$/u, '.partial.$1');
  if (existsSync(output) || existsSync(partial)) throw Error(`Output exists: ${basename(output)}; refusing overwrite`);
  const free = statfsSync(root);
  if (production && free.bavail * free.bsize < 4e9) throw Error('At least 4 GB free disk space is required');
  const painter = createCachedPainter(format);
  mkdirSync(dirname(output), {recursive: true}); const begun = Date.now();
  if (still) {
    const sourceFrame = sourceFrameForOutput(firstFrame, clock), decoder = startSourceDecoder([sourceFrame]);
    const done = watchChild(decoder, 'Original still decoder'); let count = 0;
    try {
      for await (const bytes of rawFrames(decoder, 1920 * 1080 * 4)) {
        count++; painter.paint(bytes, sourceFrame, firstFrame); writeFileSync(partial, await painter.canvas.encode('png'));
      }
      await done; if (count !== 1) throw Error(`Expected one diagnostic picture, received ${count}`);
      verifyFrozen(); renameSync(partial, output);
      console.log(JSON.stringify({status: 'diagnostic still', file: basename(output), format, outputFrame: firstFrame,
        sourceFrame, time: sceneTimeForOutput(firstFrame), revision: approved.revision, rendererSha256,
        producerScript, producerSha256, dependencyHashes,
        sha256: await fileHash(output), elapsedSeconds: (Date.now() - begun) / 1000}));
    } catch (error) {decoder.kill('SIGTERM'); throw error;}
    return;
  }
  const encoderArgs = ['-hide_banner', '-v', 'warning', '-nostdin', '-n',
    '-f', 'rawvideo', '-pix_fmt', 'rgba', '-s', `${size.width}x${size.height}`, '-framerate', '60000/1001', '-i', 'pipe:0'];
  if (production) encoderArgs.push('-i', sourcePath);
  encoderArgs.push('-map', '0:v:0'); if (production) encoderArgs.push('-map', '1:a:0');
  encoderArgs.push('-vf', 'scale=in_range=full:out_range=tv:out_color_matrix=bt709,setsar=1,format=yuv420p,setparams=range=limited:color_primaries=bt709:color_trc=bt709:colorspace=bt709',
    '-c:v', 'libx264', '-preset', 'medium', '-crf', '17', '-threads', '6', '-g', '120',
    '-color_range', 'tv', '-color_primaries', 'bt709', '-color_trc', 'bt709', '-colorspace', 'bt709',
    '-video_track_timescale', '60000', '-frames:v', String(frameCount));
  if (production) encoderArgs.push('-c:a', 'copy');
  encoderArgs.push('-movflags', '+faststart', '-metadata', 'title=Phantom Liberty | English Lyric Film', partial);
  const encoder = spawn('ffmpeg', encoderArgs, {stdio: ['pipe', 'pipe', 'pipe']});
  encoder.stdout.resume(); encoder.stdin.on('error', () => {});
  const encoded = watchChild(encoder, 'Production encoder');
  const selectedSourceFrames = diagnostic ? [...new Set(Array.from({length: frameCount}, (_, i) => sourceFrameForOutput(firstFrame + i, clock)))] : undefined;
  const decoder = startSourceDecoder(selectedSourceFrames), decoded = watchChild(decoder, 'Original picture decoder');
  let sourceCount = 0, outputCount = 0, lastReport = Date.now();
  try {
    for await (const bytes of rawFrames(decoder, 1920 * 1080 * 4)) {
      const sourceIndex = selectedSourceFrames ? selectedSourceFrames[sourceCount] : sourceCount;
      if (sourceIndex === undefined || sourceIndex >= clock.sourceFrames) throw Error('Original decoded more pictures than locked manifest');
      while (outputCount < frameCount && sourceFrameForOutput(firstFrame + outputCount, clock) === sourceIndex) {
        await writeFrame(encoder, painter.paint(bytes, sourceIndex, firstFrame + outputCount)); outputCount++;
      }
      sourceCount++;
      if (Date.now() - lastReport >= 10000) {
        lastReport = Date.now(); const elapsedSeconds = (lastReport - begun) / 1000;
        console.log(JSON.stringify({format, phase: diagnostic ? 'diagnostic' : 'rendering', outputFrames: outputCount,
          totalFrames: frameCount, decodedSourceFrames: sourceCount, elapsedSeconds: Number(elapsedSeconds.toFixed(1)),
          renderFramesPerSecond: Number((outputCount / elapsedSeconds).toFixed(2)),
          estimatedRemainingSeconds: Number((elapsedSeconds * (frameCount - outputCount) / Math.max(1, outputCount)).toFixed(1))}));
      }
    }
    await decoded;
    if (sourceCount !== (selectedSourceFrames?.length ?? clock.sourceFrames) || outputCount !== frameCount)
      throw Error(`Incomplete render: ${sourceCount} original / ${outputCount} output frames`);
    encoder.stdin.end(); await encoded; verifyFrozen(); renameSync(partial, output);
    const receipt = {schema: 'phantom-liberty/production-render/v1',
      status: production ? 'encoded; independent encoded-file verification pending' : 'bounded video-only parity diagnostic',
      file: basename(output), format, width: size.width, height: size.height, revision: approved.revision,
      sourceSha256: recording.sourceSha256, approvedInputHashes: approved.inputs, rendererSha256,
      producerScript, producerSha256, dependencyHashes,
      ...clock, firstOutputFrame: firstFrame, encodedFrames: frameCount, decodedSourceFrames: sourceCount,
      sourceFrameMapping: `min(${clock.sourceFrames - 1}, floor(n/2))`,
      sourcePictureCadence: 'Every original 30000/1001 decoded picture is repeated; no motion interpolation',
      finalPictureFirstOutputFrame: (clock.sourceFrames - 1) * 2,
      audioTailSeconds: clock.audioEnd - clock.videoEnd, cfrRemainderSeconds: clock.outputEnd - clock.audioEnd,
      audio: production ? 'Original AAC stream copy; no filters, trimming, reencoding or shortest truncation' : 'No diagnostic audio',
      colorConversion: 'Full-range RGB to limited-range BT.709 YUV420P; BT.709 tags; square pixels',
      sceneHost: 'Unchanged shared paintScene/initScene through transparent native-context cache, pinned SpaceGrotesk600, every original decoded source picture',
      sourceBackgroundCache: 'Restore exact opaque RGBA only for the identical repeated decoded source buffer; assert the unchanged portrait background operation sequence; forward every dynamic scene operation',
      sceneClock: 'Mathematical n*1001/60000; only representable-float normalization at exact native feature-row borders, no authored word offset',
      sha256: await fileHash(output), bytes: statSync(output).size, elapsedSeconds: (Date.now() - begun) / 1000};
    writeFileSync(`${output}.json`, JSON.stringify(receipt, null, 2) + '\n'); console.log(JSON.stringify(receipt));
  } catch (error) {encoder.stdin.destroy(); encoder.kill('SIGTERM'); decoder.kill('SIGTERM'); throw error;}
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch(error => {console.error(error instanceof Error ? error.message : error); process.exitCode = 1;});
}
