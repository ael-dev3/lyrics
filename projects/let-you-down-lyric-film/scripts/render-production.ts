import {spawn, type ChildProcess, type ChildProcessWithoutNullStreams} from 'node:child_process';
import {existsSync, mkdirSync, readFileSync, renameSync, statfsSync, statSync, writeFileSync} from 'node:fs';
import {basename, dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {assertGate, hashes, lyricsHash} from './render-gate.ts';
import {initNative, nativeScene, root, sha, sourceFrameAt, SOURCE, SRC_FPS} from './native-host.ts';

// Full-length production (gated) or a short diagnostic proof (≤ 8 s, neutral
// placeholder words, never the lyric). Output cadence is 60 fps; each output
// frame n shows the latest source picture with PTS ≤ n/60 and the scene state
// at exactly n/60 s. The original AAC packets are stream-copied in production.
//   node scripts/render-production.ts --production --format landscape|portrait
//   node scripts/render-production.ts --proof --from 81.5 --to 88 --format landscape
const args = process.argv.slice(2);
const opt = (flag: string): string | undefined => {const i = args.indexOf(flag); return i < 0 ? undefined : args[i + 1];};
const production = args.includes('--production'), proof = args.includes('--proof');
if (production === proof) throw Error('Choose exactly one of --production or --proof');
if (production) assertGate(); // before any output file, decoder or encoder exists
const format = opt('--format');
if (format !== 'landscape' && format !== 'portrait') throw Error('--format landscape|portrait is required');
const [W, H] = format === 'landscape' ? [1920, 1080] : [1080, 1920];
const identity = JSON.parse(readFileSync(`${root}evidence/source-identity.json`, 'utf8')) as {sha256: string; video: {frames: number}; audio: {duration: string}};
const sourceFrames = identity.video.frames, audioEnd = Number(identity.audio.duration);
const totalFrames = Math.ceil(audioEnd * 60 - 1e-9);
let first = 0, last = totalFrames; // output frame range [first, last)
if (proof) {
  const from = Number(opt('--from')), to = Number(opt('--to'));
  if (!(from >= 0 && to > from && to - from <= 8 && to <= audioEnd)) throw Error('--proof needs --from/--to within the recording, at most 8 s');
  first = Math.round(from * 60); last = Math.round(to * 60);
}
const scriptHashes = {'scripts/render-production.ts': sha(readFileSync(fileURLToPath(import.meta.url))), 'scripts/native-host.ts': sha(readFileSync(`${root}scripts/native-host.ts`))};
const approvedInputs = production ? hashes() : null, approvedLyrics = production ? lyricsHash() : null;
if (production && sha(readFileSync(SOURCE)) !== identity.sha256) throw Error('Source media differs from evidence/source-identity.json');
const stem = production ? `Let-You-Down-${format === 'landscape' ? 'YouTube-1920x1080' : 'TikTok-1080x1920'}-60fps` : `proof-${format}-${(first / 60).toFixed(2)}-${(last / 60).toFixed(2)}`;
const output = `${root}renders/${production ? '' : 'proof/'}${stem}.mp4`, partial = output.replace(/\.mp4$/u, '.partial.mp4');
if (existsSync(output) || existsSync(partial)) throw Error(`Output already exists: ${output}`);
const free = statfsSync(root);
if (production && free.bavail * free.bsize < 6e9) throw Error('At least 6 GB free space is required');

initNative({timelinePath: `${root}public/timeline.json`, placeholder: proof});
const scene = nativeScene(format);
mkdirSync(dirname(output), {recursive: true});
const firstSource = sourceFrameAt(first / 60, sourceFrames);
const decoder = spawn('ffmpeg', ['-hide_banner', '-v', 'error', '-nostdin', ...(firstSource > 0 ? ['-ss', ((firstSource - 0.5) / SRC_FPS).toFixed(6)] : []), '-i', SOURCE,
  '-map', '0:v:0', '-fps_mode', 'passthrough', '-f', 'rawvideo', '-pix_fmt', 'rgba', 'pipe:1'], {stdio: ['ignore', 'pipe', 'pipe']});
const audioArgs = production ? ['-i', SOURCE, '-map', '1:a:0', '-c:a', 'copy'] : ['-ss', (first / 60).toFixed(6), '-t', ((last - first) / 60).toFixed(6), '-i', SOURCE, '-map', '1:a:0', '-c:a', 'aac', '-b:a', '192k'];
const encoder = spawn('ffmpeg', ['-hide_banner', '-v', 'warning', '-nostdin', '-n',
  '-f', 'rawvideo', '-pix_fmt', 'rgba', '-s', `${W}x${H}`, '-framerate', '60', '-i', 'pipe:0', ...audioArgs.slice(0, audioArgs.indexOf('-map')),
  '-map', '0:v:0', ...audioArgs.slice(audioArgs.indexOf('-map')),
  '-vf', 'scale=out_color_matrix=bt709:out_range=tv:flags=accurate_rnd+full_chroma_int,format=yuv420p',
  '-c:v', 'libx264', '-preset', production ? 'slow' : 'medium', '-crf', production ? '15' : '18', '-profile:v', 'high', '-g', '120',
  '-color_range', 'tv', '-color_primaries', 'bt709', '-color_trc', 'bt709', '-colorspace', 'bt709',
  '-bsf:v', 'h264_metadata=sample_aspect_ratio=1/1:colour_primaries=1:transfer_characteristics=1:matrix_coefficients=1:video_full_range_flag=0',
  '-video_track_timescale', '60000', '-frames:v', String(last - first), '-movflags', '+faststart',
  '-metadata', 'title=Dawid Podsiadło — Let You Down | Lyric Film', partial], {stdio: ['pipe', 'ignore', 'pipe']});
let encoderLog = '';
encoder.stderr.on('data', chunk => {encoderLog = (encoderLog + String(chunk)).slice(-6000);});
async function exitOf(child: ChildProcess, label: string): Promise<void> {
  const code = child.exitCode ?? await new Promise<number | null>((done, reject) => {child.once('error', reject); child.once('close', done);});
  if (code !== 0) throw Error(`${label} exited ${code}: ${encoderLog}`);
}
async function* frames(child: ChildProcessWithoutNullStreams | ChildProcess): AsyncGenerator<Buffer> {
  const size = 1920 * 1080 * 4;
  let buf = Buffer.allocUnsafe(size), used = 0;
  for await (const part of child.stdout!) {
    const chunk = part as Buffer;
    for (let o = 0; o < chunk.length;) {
      const n = Math.min(size - used, chunk.length - o);
      chunk.copy(buf, used, o, o + n); o += n; used += n;
      if (used === size) {yield buf; buf = Buffer.allocUnsafe(size); used = 0;}
    }
  }
  if (used) throw Error('Truncated source frame');
}
const begun = Date.now();
const source = frames(decoder);
let current: Buffer | null = null, currentIndex = firstSource - 1, written = 0, lastLog = Date.now();
const write = (b: Buffer): Promise<void> => new Promise((done, reject) => encoder.stdin.write(b, e => e ? reject(e) : done()));
try {
  for (let n = first; n < last; n++) {
    const want = sourceFrameAt(n / 60, sourceFrames);
    while (currentIndex < want) {
      const next = await source.next();
      if (next.done) break; // audio tail: hold the final picture
      current = next.value; currentIndex++;
    }
    if (!current) throw Error('No source picture decoded');
    await write(scene.paint(current, n / 60)); written++;
    if (Date.now() - lastLog > 15000) {lastLog = Date.now(); console.log(JSON.stringify({format, written, of: last - first, sourceFrame: currentIndex, elapsed: Math.round((lastLog - begun) / 1000)}));}
  }
  encoder.stdin.end();
  decoder.kill('SIGTERM');
  await exitOf(encoder, 'Encoder');
  if (production) {
    assertGate();
    if (JSON.stringify(hashes()) !== JSON.stringify(approvedInputs) || lyricsHash() !== approvedLyrics) throw Error('Approved inputs changed during capture');
    if (sha(readFileSync(fileURLToPath(import.meta.url))) !== scriptHashes['scripts/render-production.ts']) throw Error('Renderer changed during capture');
  }
  renameSync(partial, output);
  const receipt = {status: production ? 'encoded; independent final verification pending' : 'diagnostic proof (placeholder words); not a production file',
    output: basename(output), format, width: W, height: H, fps: 60, outputFrames: written, firstOutputFrame: first, lastSourceFrame: currentIndex,
    clock: 'output frame n = source time n/60 s; picture = latest source frame with PTS ≤ n/60', audio: production ? 'original AAC stream copy' : 'AAC 192k re-encode of the proof window',
    inputHashes: approvedInputs ?? hashes(), lyricsSha256: approvedLyrics, rendererHashes: scriptHashes, sha256: sha(readFileSync(output)), bytes: statSync(output).size,
    elapsedSeconds: Math.round((Date.now() - begun) / 1000)};
  writeFileSync(`${output}.json`, JSON.stringify(receipt, null, 2) + '\n');
  console.log(JSON.stringify({output: receipt.output, frames: written, sha256: receipt.sha256, seconds: receipt.elapsedSeconds}));
} catch (error) {
  encoder.stdin.destroy(); encoder.kill('SIGTERM'); decoder.kill('SIGTERM');
  throw error;
}
