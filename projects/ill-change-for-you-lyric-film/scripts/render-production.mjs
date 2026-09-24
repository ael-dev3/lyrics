import {spawn} from 'node:child_process';
import {once} from 'node:events';
import {mkdirSync, renameSync, rmSync, writeFileSync} from 'node:fs';
import {dirname} from 'node:path';
import {createScene} from './production-scene.mjs';
import {assertRenderGate, inputHashes, sha256} from './render-gate.mjs';

const value = (key, fallback) => {
  const index = process.argv.indexOf(key);
  return index < 0 ? fallback : process.argv[index + 1];
};
const production = process.argv.includes('--production');
const diagnostic = process.argv.includes('--diagnostic');
const still = process.argv.includes('--still');
if ([production, diagnostic, still].filter(Boolean).length !== 1)
  throw Error('Choose exactly one: --production, --diagnostic or --still');
// This must happen before any capture, directory creation, or encoder start.
if (production) await assertRenderGate();

export const FPS = 60;
const format = value('--format', 'landscape');
if (!['landscape', 'portrait'].includes(format)) throw Error('Unknown render format');
const scene = createScene(format);
const totalFrames = Math.ceil(196.464036 * FPS);
const first = production ? 0 : Math.round(Number(value('--start', '61.3')) * FPS);
const frames = production ? totalFrames : still ? 1 : Number(value('--frames', '120'));
if (!Number.isSafeInteger(first) || !Number.isSafeInteger(frames) || first < 0 || frames < 1
    || first + frames > totalFrames || (diagnostic && frames > 900))
  throw Error('Invalid render range; a diagnostic may contain at most 15 seconds');
const name = `Ill-Change-for-You-${format === 'landscape' ? 'original-4x3' : 'portrait-9x16'}`;
const output = value('--output', production ? `output/${name}.mp4`
  : still ? `evidence/diagnostic/${name}-${String(first).padStart(6, '0')}.png`
    : `evidence/diagnostic/${name}-${String(first).padStart(6, '0')}.mp4`);
mkdirSync(dirname(output), {recursive: true});
const temporary = production ? output.replace(/\.mp4$/i, '.partial.mp4') : output;
if (production && temporary === output) throw Error('Production output must end in .mp4');

const startSeconds = first / FPS, endSeconds = (first + frames) / FPS;
const sourceFrames = `[0:v]fps=fps=${FPS}:round=up,tpad=stop_mode=clone:stop_duration=0.2,trim=start_frame=${first}:end_frame=${first + frames},setpts=N/(${FPS}*TB)`;
const picture = format === 'landscape'
  ? `${sourceFrames},setsar=1[picture];`
  : `${sourceFrames},split=2[bg][fg];`
    + "[bg]crop=608:1080:(iw-608)/2:0,scale=360:640:flags=bicubic,gblur=sigma=27,eq=saturation=0.82,lutrgb=r='val*0.39':g='val*0.39':b='val*0.39',scale=1080:1920:flags=bilinear[fill];"
    + '[fg]scale=1080:810:flags=lanczos[front];'
    + '[fill][front]overlay=0:288:shortest=1:format=auto[picture];';
const audio = diagnostic
  ? `[0:a:0]atrim=start=${startSeconds}:end=${endSeconds},asetpts=PTS-STARTPTS[aout];`
  : '';
const filter = picture + audio
  + `[picture][1:v]overlay=0:0:shortest=1:format=auto:alpha=straight,setsar=1,format=${still ? 'rgb24' : 'yuv420p'}[out]`;
const args = [
  '-hide_banner', '-v', 'warning', '-y', '-threads', '4', '-filter_complex_threads', '4',
  '-i', 'public/source.mp4', '-f', 'rawvideo', '-pixel_format', 'rgba',
  '-video_size', `${scene.width}x${scene.height}`, '-framerate', String(FPS), '-i', 'pipe:0',
  '-filter_complex', filter, '-map', '[out]',
];
if (production) args.push('-map', '0:a:0', '-c:a', 'copy');
else if (diagnostic) args.push('-map', '[aout]', '-c:a', 'aac', '-b:a', '256k');
else args.push('-an');
if (still) args.push('-frames:v', '1', '-update', '1');
else args.push('-c:v', 'libx264', '-preset', 'medium', '-crf', '17', '-threads', '6',
  '-pix_fmt', 'yuv420p', '-color_primaries', 'bt709', '-color_trc', 'bt709',
  '-colorspace', 'bt709', '-color_range', 'tv', '-video_track_timescale', '60000',
  '-frames:v', String(frames), '-movflags', '+faststart');
args.push(temporary);

const began = Date.now();
const child = spawn('ffmpeg', args, {stdio: ['pipe', 'inherit', 'inherit']});
let writeError = null;
child.stdin.on('error', error => { writeError = error; });
const closed = once(child, 'close');
try {
  let lastStatus = 0;
  for (let frame = first; frame < first + frames; frame++) {
    if (writeError) throw writeError;
    const canvas = scene.paint(frame / FPS);
    const bytes = canvas.data();
    if (!child.stdin.write(bytes)) await once(child.stdin, 'drain');
    if (Date.now() - lastStatus > 10000) {
      lastStatus = Date.now();
      const status = {format, phase: 'compositing', frame: frame - first + 1,
        frames, seconds: (Date.now() - began) / 1000};
      console.log(JSON.stringify(status));
      if (production) writeFileSync(`output/${name}-status.json`, JSON.stringify(status, null, 2) + '\n');
    }
  }
  child.stdin.end();
  const [code] = await closed;
  if (code !== 0) throw Error('FFmpeg failed with exit code ' + code);
  if (production) renameSync(temporary, output);
} catch (error) {
  child.kill('SIGTERM');
  if (production) rmSync(temporary, {force: true});
  throw error;
}

const receipt = {
  status: 'encoded; independent delivery verification pending',
  mode: production ? 'production' : still ? 'still' : 'diagnostic',
  format, width: scene.width, height: scene.height, fps: FPS,
  firstFrame: first, frames, sourceClock: 'n/60 seconds',
  sourcePicture: 'complete source film; native 4:3 or whole-frame portrait inset',
  sourceAudio: production ? 'original AAC packet stream copied' : diagnostic ? 'source section AAC diagnostic' : 'none',
  sourceFinalFrame: 'cloned through the 59.503 ms original audio tail',
  output, sha256: await sha256(output),
  previewInputHashes: production ? await inputHashes() : undefined,
  rendererSha256: production ? await sha256('scripts/render-production.mjs') : undefined,
  sceneSha256: production ? await sha256('scripts/production-scene.mjs') : undefined,
  elapsedSeconds: (Date.now() - began) / 1000,
};
writeFileSync(output + '.json', JSON.stringify(receipt, null, 2) + '\n');
console.log(JSON.stringify(receipt));
