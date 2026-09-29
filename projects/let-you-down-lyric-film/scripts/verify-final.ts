import {createHash} from 'node:crypto';
import {spawn, spawnSync, execFileSync} from 'node:child_process';
import {createReadStream, existsSync, readFileSync, statSync, writeFileSync} from 'node:fs';
import {basename} from 'node:path';
import {fileURLToPath} from 'node:url';
import {assertGate} from './render-gate.ts';

// Independent verification of encoded films: container, cadence, timestamp
// grid, soundtrack identity, strict decode and black where the source picture
// is missing (not merely dark by composition). Production
// files are verified under the gate and recorded in evidence/final-verification.json;
// `--proof --file PATH` checks a diagnostic proof's container and cadence only.
const root = fileURLToPath(new URL('../', import.meta.url));
const args = process.argv.slice(2), proof = args.includes('--proof');
if (!proof) assertGate();
const identity = JSON.parse(readFileSync(`${root}evidence/source-identity.json`, 'utf8')) as {sha256: string; video: {frames: number}; audio: {duration: string; packetFramemd5Sha256: string; decodedPcmS16leSha256: string}};
const files = proof ? [args[args.indexOf('--file') + 1]!] : [`${root}renders/Let-You-Down-YouTube-1920x1080-60fps.mp4`, `${root}renders/Let-You-Down-TikTok-1080x1920-60fps.mp4`];
const expectedFrames = Math.ceil(Number(identity.audio.duration) * 60 - 1e-9);

async function streamHash(cmd: string, a: string[]): Promise<string> {
  const child = spawn(cmd, a, {stdio: ['ignore', 'pipe', 'pipe']}), h = createHash('sha256');
  child.stdout.on('data', (c: Buffer) => h.update(c));
  let err = ''; child.stderr.on('data', c => {err += String(c);});
  const code = await new Promise<number | null>(done => child.once('close', done));
  if (code !== 0) throw Error(`${cmd} failed: ${err.slice(-1500)}`);
  return h.digest('hex');
}
async function fileSha(p: string): Promise<string> {const h = createHash('sha256'); for await (const c of createReadStream(p)) h.update(c as Buffer); return h.digest('hex');}
/** Near-black intervals (≥ 0.06 s, 98.5 % of pixels below luma 0.08). */
function black(file: string): [number, number][] {
  const r = spawnSync('ffmpeg', ['-hide_banner', '-nostdin', '-i', file, '-vf', 'scale=480:-2,blackdetect=d=0.06:pix_th=0.08:pic_th=0.985', '-an', '-f', 'null', '-'], {encoding: 'utf8', maxBuffer: 64 << 20});
  return [...String(r.stderr).matchAll(/black_start:([\d.]+) black_end:([\d.]+)/gu)].map(m => [Number(m[1]), Number(m[2])] as [number, number]);
}

/** Brightest 0.1 % of luma (0-255) in one decoded frame at t, at 480 px width. */
function highlight(file: string, t: number): number {
  const r = spawnSync('ffmpeg', ['-v', 'error', '-nostdin', '-ss', Math.max(0, t).toFixed(4), '-i', file, '-frames:v', '1', '-vf', 'scale=480:-2', '-f', 'rawvideo', '-pix_fmt', 'gray', 'pipe:1'], {maxBuffer: 64 << 20});
  const px = r.stdout as Buffer;
  if (r.status !== 0 || !px.length) return -1;
  const sorted = Uint8Array.from(px).sort();
  return sorted[Math.floor(sorted.length * 0.999)]!;
}
const sourceBlack = proof ? [] : black(`${root}public/source.mp4`);
// Source black intervals within 0.4 s of each other are one dark passage (a
// single dim fade frame between them should not split it).
const darkPassages = sourceBlack.reduce<[number, number][]>((acc, [s0, e0]) => {
  const last = acc.at(-1);
  if (last && s0 - last[1] <= 0.4) last[1] = Math.max(last[1], e0); else acc.push([s0, e0]);
  return acc;
}, []);
const report: Record<string, unknown>[] = [];
let failures = 0;
for (const file of files) {
  if (!existsSync(file)) throw Error(`Missing ${file}`);
  const problems: string[] = [];
  const checks: Record<string, unknown> = {file: basename(file), bytes: statSync(file).size, sha256: await fileSha(file), failures: problems};
  const probe = JSON.parse(execFileSync('ffprobe', ['-v', 'error', '-count_packets', '-show_entries', 'stream=codec_type,codec_name,profile,width,height,pix_fmt,sample_aspect_ratio,r_frame_rate,color_range,color_space,color_transfer,color_primaries,nb_read_packets,start_time,duration,sample_rate,channels:format=duration', '-of', 'json', file], {encoding: 'utf8'})) as {streams: Record<string, string | number>[]};
  const v = probe.streams.filter(s => s.codec_type === 'video'), a = probe.streams.filter(s => s.codec_type === 'audio');
  checks.streams = probe.streams;
  if (v.length !== 1 || a.length !== 1) problems.push('expected exactly one video and one audio stream');
  const vs = v[0]!;
  if (vs.codec_name !== 'h264' || vs.pix_fmt !== 'yuv420p' || vs.r_frame_rate !== '60/1' || vs.sample_aspect_ratio !== '1:1') problems.push('video codec, pixel format, cadence or SAR');
  if (vs.color_range !== 'tv' || vs.color_space !== 'bt709' || vs.color_transfer !== 'bt709' || vs.color_primaries !== 'bt709') problems.push('BT.709 limited-range tags');
  const frames = Number(vs.nb_read_packets);
  checks.frames = frames;
  if (!proof && frames !== expectedFrames) problems.push(`frame count ${frames} ≠ ${expectedFrames}`);
  const pts = execFileSync('ffprobe', ['-v', 'error', '-select_streams', 'v:0', '-show_entries', 'packet=pts', '-of', 'csv=p=0', file], {encoding: 'utf8', maxBuffer: 64 << 20})
    .trim().split(/\r?\n/u).map(Number).sort((x, y) => x - y);
  const offGrid = pts.filter((p, i) => p !== i * 1000).length; // 60000 timescale ÷ 60 fps
  checks.timestampGrid = {count: pts.length, offGrid};
  if (offGrid) problems.push(`${offGrid} video timestamps off the exact 1/60 s grid`);
  if (!proof) {
    const packets = await streamHash('ffmpeg', ['-v', 'error', '-nostdin', '-i', file, '-map', '0:a:0', '-c', 'copy', '-f', 'framemd5', 'pipe:1']);
    const pcm = await streamHash('ffmpeg', ['-v', 'error', '-nostdin', '-i', file, '-map', '0:a:0', '-f', 's16le', '-acodec', 'pcm_s16le', 'pipe:1']);
    checks.audio = {packetFramemd5Sha256: packets, decodedPcmSha256: pcm, packetsMatchSource: packets === identity.audio.packetFramemd5Sha256, pcmMatchesSource: pcm === identity.audio.decodedPcmS16leSha256};
    if (packets !== identity.audio.packetFramemd5Sha256) problems.push('AAC packets differ from the source');
    if (pcm !== identity.audio.decodedPcmS16leSha256) problems.push('decoded PCM differs from the source');
    if (frames / 60 + 1e-6 < Number(identity.audio.duration)) problems.push('picture ends before the soundtrack');
  }
  const strict = spawnSync('ffmpeg', ['-v', 'error', '-xerror', '-err_detect', 'explode', '-nostdin', '-i', file, '-f', 'null', '-'], {encoding: 'utf8', maxBuffer: 64 << 20});
  checks.strictDecode = strict.status === 0 && !String(strict.stderr).trim() ? 'pass' : 'fail';
  if (checks.strictDecode !== 'pass') problems.push(`strict decode: ${String(strict.stderr).slice(0, 300)}`);
  const out = black(file);
  // A black-looking stretch the source does not have is a failure only if the
  // picture itself went missing. Composition alone can make a frame count as
  // black: the portrait band shrinks the end logos and credits under the
  // detector's 1.5 % non-black share, and the readability shade can tip a
  // single dim fade frame. So every output frame is sampled every 0.25 s
  // across such a stretch, and must keep the source's highlights (its brightest
  // 0.1 % at least half as bright) wherever the source has any (above 40).
  const outside = proof ? [] : out.filter(([s, e]) => !darkPassages.some(([s0, e0]) => s >= s0 - 0.2 && e <= e0 + 0.2));
  const explained: unknown[] = [], unexpected: unknown[] = [];
  for (const [s, e] of outside) {
    const samples: {t: number; source: number; output: number}[] = [];
    for (let t = s + 0.02; t < e; t += 0.25) samples.push({t: +t.toFixed(3), source: Math.max(highlight(`${root}public/source.mp4`, t), highlight(`${root}public/source.mp4`, t - 1001 / 24000)), output: highlight(file, t)});
    const lost = samples.filter(x => x.output < 0 || x.source < 0 || (x.source > 40 && x.output < 0.5 * x.source));
    (lost.length ? unexpected : explained).push({interval: [s, e], samples: samples.length, lost});
  }
  checks.black = {outputIntervals: out, sourceDarkPassages: darkPassages, explainedByComposition: explained, unexpected};
  if (unexpected.length) problems.push(`${unexpected.length} black intervals where the source picture is missing`);
  failures += problems.length;
  report.push(checks);
  console.log(JSON.stringify({file: checks.file, frames, strict: checks.strictDecode, timestampsOffGrid: offGrid, failures: problems}));
}
if (!proof) writeFileSync(`${root}evidence/final-verification.json`, JSON.stringify({schema: 'lyric-film/final-verification/v1', sourceSha256: identity.sha256, expectedFrames, sourceBlackIntervals: sourceBlack, files: report,
  limits: ['These checks establish delivery integrity (container, cadence, soundtrack identity, decode, missing-picture black intervals), not acoustic word accuracy or visual quality.']}, null, 2) + '\n');
if (failures) {console.error(`${failures} verification failure(s)`); process.exit(1);}
