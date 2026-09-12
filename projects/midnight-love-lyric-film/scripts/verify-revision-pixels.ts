import assert from 'node:assert/strict';
import {execFileSync, spawnSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {createReadStream, mkdirSync, readFileSync, statSync, writeFileSync} from 'node:fs';
import {FPS, FRAMES} from '../src/config.ts';

// Run only after both complete corrected lossless masters and all patches exist.
// Integer-second seeks are verified against the first decoded timestamp. No RGB
// conversion, resizing or color filter participates in the frame-hash comparison.
assert.equal(FPS, 60);
const preservedFrames = [1978, 1979, 1980, 2338, 2339, 2340, 4618, 4619, 4620, 5038, 5039, 5040, 8998, 8999, 9000] as const;
const patchDefinitions = [
  {id: 'focus', startFrame: 1980, frames: 360, localFrames: [0, 146, 206, 359]},
  {id: 'onset', startFrame: 4620, frames: 420, localFrames: [0, 186, 224, 419]},
  {id: 'ending', startFrame: 9000, frames: FRAMES - 9000, localFrames: [0, 279, 763, 2124, 2631]},
] as const;
assert.equal(patchDefinitions[2].frames, 2632);
type Kind = 'youtube' | 'tiktok';
type Input = {path: string; kind: Kind; expectedFrames: number};
type Stream = {width: number; height: number; pix_fmt: string; time_base: string; start_time: string; avg_frame_rate: string; r_frame_rate: string; codec_name: string};
type Frame = {frame: number; sha256: string; rawBytes: number; pts: number; duration: number};
type SeekProof = {file: string; requestedFrames: number[]; requestedSeekSecond: number; actualSeekSecond: number; firstDecodedPtsSeconds: number; expectedFirstDecodedPtsSeconds: number; sourceTimeBase: string; outputTimeBase: string; attempt: 'requested-integer-second' | 'one-integer-second-earlier' | 'timeline-zero-fallback'};
type Extraction = {frames: Frame[]; proof: SeekProof};
class FirstTimestampMismatch extends Error {
  constructor(readonly observed: number, readonly expected: number) { super(`First decoded timestamp ${observed} does not match integer seek ${expected}`); }
}
const rational = (text: string): number => {
  const fields = text.split('/').map(Number), a = fields[0], b = fields[1];
  assert(a !== undefined && b !== undefined && Number.isFinite(a) && Number.isFinite(b) && b > 0, `Invalid time base ${text}`);
  return a / b;
};
const hashFile = async (path: string): Promise<string> => {
  const hash = createHash('sha256');
  for await (const chunk of createReadStream(path)) hash.update(chunk);
  return hash.digest('hex');
};
const probe = (input: Input): Stream => {
  const data: unknown = JSON.parse(execFileSync('ffprobe', ['-v', 'error', '-select_streams', 'v:0', '-show_entries', 'stream=width,height,pix_fmt,time_base,start_time,avg_frame_rate,r_frame_rate,codec_name', '-of', 'json', input.path], {encoding: 'utf8'}));
  assert(data && typeof data === 'object' && 'streams' in data && Array.isArray(data.streams) && data.streams.length === 1);
  const stream: unknown = data.streams[0];
  assert(stream && typeof stream === 'object');
  for (const field of ['width', 'height']) assert(field in stream && typeof Reflect.get(stream, field) === 'number');
  for (const field of ['pix_fmt', 'time_base', 'start_time', 'avg_frame_rate', 'r_frame_rate', 'codec_name']) assert(field in stream && typeof Reflect.get(stream, field) === 'string');
  const value = stream as Stream;
  assert.equal(value.width, input.kind === 'youtube' ? 3840 : 2160);
  assert.equal(value.height, input.kind === 'youtube' ? 2160 : 3840);
  assert.equal(value.pix_fmt, 'yuv444p', `Unexpected pixel format in ${input.path}`);
  assert.equal(value.codec_name, 'h264');
  assert.equal(rational(value.avg_frame_rate), FPS);
  assert.equal(rational(value.r_frame_rate), FPS);
  assert(Math.abs(Number(value.start_time)) <= rational(value.time_base) / 2 + 1e-9, `Nonzero timeline start in ${input.path}`);
  return value;
};

function extract(input: Input, stream: Stream, frames: number[], requestedSecond: number, seekSecond: number, attempt: SeekProof['attempt']): Extraction {
  const localFrames = frames.map(frame => frame - seekSecond * FPS);
  assert(localFrames.every(frame => Number.isInteger(frame) && frame >= 0));
  const selection = localFrames.map(frame => `eq(n\\,${frame})`).join('+');
  const filter = `showinfo@seek=checksum=0,select=${selection}`;
  const args = [
    '-hide_banner', '-loglevel', 'info', '-nostdin', '-copyts',
    '-ss', String(seekSecond), '-accurate_seek', '-threads', '2', '-i', input.path,
    '-map', '0:v:0', '-an', '-sn', '-dn', '-vf', filter,
    '-frames:v', String(frames.length), '-fps_mode', 'passthrough', '-enc_time_base:v', '1/60',
    '-c:v', 'rawvideo', '-pix_fmt', '+yuv444p', '-threads', '1',
    '-f', 'framemd5', '-hash', 'sha256', '-',
  ];
  const result = spawnSync('ffmpeg', args, {encoding: 'utf8', maxBuffer: 12 * 1024 * 1024, timeout: 600000});
  if (result.error) throw result.error;
  assert.equal(result.status, 0, `Frame extraction failed for ${input.path}: ${result.stderr.slice(-6000)}`);
  const firstLine = result.stderr.split('\n').find(line => line.includes('showinfo@seek') && /\bn:\s*0\s/.test(line));
  assert(firstLine, `No first-decoded-frame timestamp was reported for ${input.path}`);
  const ptsText = firstLine.match(/\bpts_time:\s*([^\s]+)/)?.[1];
  assert(ptsText);
  const firstPts = Number(ptsText);
  assert(Number.isFinite(firstPts));
  const tolerance = rational(stream.time_base) / 2 + 1e-9;
  if (Math.abs(firstPts - seekSecond) > tolerance) throw new FirstTimestampMismatch(firstPts, seekSecond);
  const lines = result.stdout.split('\n');
  const outputTimeBase = lines.find(line => line.startsWith('#tb 0:'))?.split(':').at(-1)?.trim();
  assert.equal(outputTimeBase, '1/60', `Unexpected hash timestamp time base for ${input.path}`);
  assert(lines.some(line => /^#hash:\s*SHA256$/i.test(line)), 'Expected SHA-256 decoded-frame hashes');
  const outputFrames: Frame[] = lines.filter(line => /^0,/.test(line)).map((line, index) => {
    const fields = line.split(',').map(field => field.trim());
    assert.equal(fields.length, 6);
    const pts = Number(fields[2]), duration = Number(fields[3]), rawBytes = Number(fields[4]), sha256 = fields[5], frame = frames[index];
    assert(frame !== undefined && sha256 && /^[a-f0-9]{64}$/i.test(sha256));
    assert.equal(pts, frame, `Selected frame timestamp does not match requested frame ${frame} in ${input.path}`);
    assert.equal(duration, 1, `Unexpected selected-frame duration in ${input.path}`);
    assert.equal(rawBytes, stream.width * stream.height * 3, 'Unexpected yuv444p plane byte count');
    return {frame, pts, duration, rawBytes, sha256};
  });
  assert.equal(outputFrames.length, frames.length, `Missing selected frames in ${input.path}`);
  return {frames: outputFrames, proof: {file: input.path, requestedFrames: frames, requestedSeekSecond: requestedSecond, actualSeekSecond: seekSecond, firstDecodedPtsSeconds: firstPts, expectedFirstDecodedPtsSeconds: seekSecond, sourceTimeBase: stream.time_base, outputTimeBase, attempt}};
}

const inputs = new Map<string, Input>(), requests = new Map<string, Set<number>>();
function request(input: Input, frame: number): void {
  assert(Number.isInteger(frame) && frame >= 0 && frame < input.expectedFrames);
  inputs.set(input.path, input);
  const set = requests.get(input.path) ?? new Set<number>(); set.add(frame); requests.set(input.path, set);
}
for (const kind of ['youtube', 'tiktok'] as const) {
  const old = {path: `../midnight-love/evidence/${kind}-master-lossless.mkv`, kind, expectedFrames: FRAMES};
  const current = {path: `evidence/${kind}-master-lossless.mkv`, kind, expectedFrames: FRAMES};
  for (const frame of preservedFrames) { request(old, frame); request(current, frame); }
  for (const patch of patchDefinitions) for (const frame of patch.localFrames) {
    request({path: `evidence/${kind}-${patch.id}-lossless.mkv`, kind, expectedFrames: patch.frames}, frame);
    request(current, patch.startFrame + frame);
  }
}
const observations = new Map<string, Map<number, Frame>>(), seekProofs: SeekProof[] = [], seekFallbacks: unknown[] = [], inputReports: unknown[] = [];
for (const input of inputs.values()) {
  assert(statSync(input.path).isFile(), `Missing completed master or patch: ${input.path}`);
  const stream = probe(input), wanted = [...(requests.get(input.path) ?? [])].sort((a, b) => a - b);
  const groups = new Map<number, number[]>();
  for (const frame of wanted) { const second = Math.floor(frame / FPS), group = groups.get(second) ?? []; group.push(frame); groups.set(second, group); }
  const cache = new Map<number, Frame>();
  for (const [second, frames] of groups) {
    const attempts = [...new Set([second, Math.max(0, second - 1), 0])];
    let extraction: Extraction | undefined;
    for (const seekSecond of attempts) {
      const attempt: SeekProof['attempt'] = seekSecond === second ? 'requested-integer-second' : seekSecond === second - 1 ? 'one-integer-second-earlier' : 'timeline-zero-fallback';
      try { extraction = extract(input, stream, frames, second, seekSecond, attempt); break; }
      catch (error) {
        if (!(error instanceof FirstTimestampMismatch)) throw error;
        seekFallbacks.push({file: input.path, requestedFrames: frames, attemptedSeekSecond: seekSecond, observedFirstPtsSeconds: error.observed, expectedFirstPtsSeconds: error.expected});
      }
    }
    assert(extraction, `Could not prove exact seeking for ${input.path} frames ${frames.join(',')}`);
    for (const frame of extraction.frames) cache.set(frame.frame, frame);
    seekProofs.push(extraction.proof);
  }
  observations.set(input.path, cache);
  inputReports.push({file: input.path, bytes: statSync(input.path).size, sha256: await hashFile(input.path), stream, sampledFrames: wanted});
  console.log(JSON.stringify({file: input.path, verifiedSamples: wanted.length, verifiedIntegerSeekGroups: groups.size}));
}
const frameAt = (file: string, frame: number): Frame => { const value = observations.get(file)?.get(frame); assert(value, `Missing cached frame ${file}:${frame}`); return value; };
const comparisons: {kind: Kind; check: string; globalFrame: number; referenceFile: string; referenceFrame: number; candidateFile: string; candidateFrame: number; referenceSha256: string; candidateSha256: string; matched: boolean}[] = [];
for (const kind of ['youtube', 'tiktok'] as const) {
  const old = `../midnight-love/evidence/${kind}-master-lossless.mkv`, current = `evidence/${kind}-master-lossless.mkv`;
  for (const frame of preservedFrames) {
    const reference = frameAt(old, frame), candidate = frameAt(current, frame);
    comparisons.push({kind, check: 'preserved-boundary-state', globalFrame: frame, referenceFile: old, referenceFrame: frame, candidateFile: current, candidateFrame: frame, referenceSha256: reference.sha256, candidateSha256: candidate.sha256, matched: reference.sha256 === candidate.sha256});
  }
  for (const patch of patchDefinitions) for (const frame of patch.localFrames) {
    const referenceFile = `evidence/${kind}-${patch.id}-lossless.mkv`, globalFrame = patch.startFrame + frame;
    const reference = frameAt(referenceFile, frame), candidate = frameAt(current, globalFrame);
    comparisons.push({kind, check: `rendered-${patch.id}-patch`, globalFrame, referenceFile, referenceFrame: frame, candidateFile: current, candidateFrame: globalFrame, referenceSha256: reference.sha256, candidateSha256: candidate.sha256, matched: reference.sha256 === candidate.sha256});
  }
}
const allMatches = comparisons.every(comparison => comparison.matched);
const report = {
  passed: allMatches, allMatches, fps: FPS, fullVideoFrames: FRAMES,
  checkedFormats: ['youtube', 'tiktok'],
  comparisonCount: comparisons.length,
  preservedBoundaryComparisons: comparisons.filter(c => c.check === 'preserved-boundary-state').length,
  renderedPatchComparisons: comparisons.filter(c => c.check !== 'preserved-boundary-state').length,
  extraction: {hash: 'SHA-256 of decoded yuv444p planes via framemd5', seeking: 'Seek to floor(frame/60) integer seconds with copyts and accurate seeking, then select frame mod60. Prove the first decoded timestamp and selected frame PTS. Retry one integer second earlier, then timeline zero, only if the first timestamp is not proven.', pixels: 'Raw yuv444p required with +pix_fmt, disabling automatic pixel-format conversion; no scale or colorspace filter.', sourceTimestampTolerance: 'Half one source timestamp tick for first decoded timestamp; selected output PTS must equal the requested integer frame exactly.'},
  sourceScriptSha256: createHash('sha256').update(readFileSync('scripts/verify-revision-pixels.ts')).digest('hex'),
  ffmpeg: execFileSync('ffmpeg', ['-version'], {encoding: 'utf8'}).split('\n')[0],
  inputs: inputReports, seekProofs, seekFallbacks, comparisons,
  limits: 'Sampled decoded-frame verification, not an exhaustive pixel proof. The listed old/new boundary states are intentionally expected unchanged even when a sample lies just inside a rendered patch. This does not verify every intervening picture, the final downsample/encode, audio packets, full decoding, or full-file CFR; those remain separate delivery checks.',
};
mkdirSync('evidence', {recursive: true});
writeFileSync('evidence/revision-pixel-verification.json', JSON.stringify(report, null, 2));
assert(allMatches, 'Lossless revision pixel comparison failed; inspect evidence/revision-pixel-verification.json');
console.log(JSON.stringify({passed: true, comparisons: comparisons.length, exactSeekGroups: seekProofs.length, seekFallbacks: seekFallbacks.length}));
