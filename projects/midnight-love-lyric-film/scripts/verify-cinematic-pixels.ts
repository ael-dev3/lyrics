import assert from 'node:assert/strict';
import {execFileSync, spawnSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {createReadStream, mkdirSync, readFileSync, statSync, writeFileSync} from 'node:fs';
import {FPS, FRAMES} from '../src/config.ts';
import {REVISION_VIEWPORTS} from '../src/viewport-config.ts';

// Run only after render-cinematic.ts has completed both lossless masters.
// Compare decoded Y, U and V planes directly. Masking/cropping changes only the
// comparison region; there is no resizing or RGB/color-space conversion.
assert.equal(FPS, 60);
assert.equal(FRAMES, 11632);
const SCALE = 2;
const kinds = ['youtube', 'tiktok'] as const;
const sampledFrames = [0, 900, 960, 2186, 2907, 2908, 4844, 5815, 5816, 8723, 8724, 9279, 9840, 11028, 11340, 11631];
type Kind = typeof kinds[number];
type Region = 'outside' | 'inside';
type Input = {path: string; kind: Kind; role: 'old-master' | 'new-master' | 'viewport'; expectedSha256: string; regions: Region[]};
type Stream = {width: number; height: number; pix_fmt: string; time_base: string; start_time?: string; avg_frame_rate: string; r_frame_rate: string; codec_name: string};
type Frame = {frame: number; sha256: string; rawBytes: number; pts: number; duration: number; sourcePts: number; sourcePtsSeconds: number; sourceTimestampErrorSeconds: number};
type SeekProof = {file: string; region: Region; requestedFrames: number[]; requestedSeekSecond: number; actualSeekSecond: number; firstDecodedPtsSeconds: number; expectedFirstDecodedPtsSeconds: number; firstDecodedNominalFrame: number; expectedFirstDecodedNominalFrame: number; sourceTimeBase: string; outputTimeBase: string; attempt: 'requested-integer-second' | 'one-integer-second-earlier' | 'timeline-zero-fallback'; filter: string; outputWidth: number; outputHeight: number};
type Extraction = {frames: Frame[]; proof: SeekProof};
type Preflight = {passed: boolean; options: {scale: number; fps: number; frames: number; viewports: typeof REVISION_VIEWPORTS; frozenInputManifestSha256: string}; oldMasters: {kind: Kind; path: string; sha256: string}[]};
type Rebuild = {passed: boolean; preflight: Preflight; formats: {kind: Kind; viewportMaster: string; viewportSha256: string; output: string; outputSha256: string}[]};
class FirstTimestampMismatch extends Error {
  readonly observed: number;
  readonly expected: number;
  constructor(observed: number, expected: number) {
    super(`First decoded timestamp ${observed} does not match integer seek ${expected}`);
    this.observed = observed;
    this.expected = expected;
  }
}
const sha256 = (bytes: Buffer): string => createHash('sha256').update(bytes).digest('hex');
const hashFile = async (path: string): Promise<string> => {
  const hash = createHash('sha256');
  for await (const chunk of createReadStream(path)) hash.update(chunk);
  return hash.digest('hex');
};
const rational = (value: string): number => {
  const fields = value.split('/').map(Number), numerator = fields[0], denominator = fields[1];
  assert(fields.length === 2 && numerator !== undefined && denominator !== undefined && Number.isFinite(numerator) && Number.isFinite(denominator) && numerator > 0 && denominator > 0, `Invalid positive rational ${value}`);
  return numerator / denominator;
};
const boundFiles = ['evidence/cinematic-rebuild.json', 'evidence/cinematic-preflight.json', 'evidence/render-inputs.json', 'scripts/verify-cinematic-pixels.ts'] as const;
const boundBytes = new Map(boundFiles.map(path => [path, readFileSync(path)]));
const binding = (path: typeof boundFiles[number]): string => { const bytes = boundBytes.get(path); assert(bytes); return sha256(bytes); };
const rebuild = JSON.parse(boundBytes.get('evidence/cinematic-rebuild.json')!.toString('utf8')) as Rebuild;
const preflight = JSON.parse(boundBytes.get('evidence/cinematic-preflight.json')!.toString('utf8')) as Preflight;
assert.equal(rebuild.passed, true, 'Complete both cinematic masters before verification');
assert.equal(preflight.passed, true);
assert.deepEqual(rebuild.preflight, preflight, 'Rebuild and standalone preflight must agree');
assert.equal(preflight.options.scale, SCALE);
assert.equal(preflight.options.fps, FPS);
assert.equal(preflight.options.frames, FRAMES);
assert.deepEqual(preflight.options.viewports, REVISION_VIEWPORTS);
assert.equal(preflight.options.frozenInputManifestSha256, binding('evidence/render-inputs.json'), 'Frozen input manifest no longer matches the rebuild');
assert.equal(rebuild.formats.length, kinds.length);
assert.equal(preflight.oldMasters.length, kinds.length);
const inputs: Input[] = [];
for (const kind of kinds) {
  const formats = rebuild.formats.filter(format => format.kind === kind), bases = preflight.oldMasters.filter(base => base.kind === kind);
  assert.equal(formats.length, 1); assert.equal(bases.length, 1);
  const format = formats[0]!, base = bases[0]!;
  assert.equal(base.path, `../midnight-love/evidence/${kind}-master-lossless.mkv`);
  assert.equal(format.output, `evidence/${kind}-master-lossless.mkv`);
  assert.equal(format.viewportMaster, `evidence/cinematic/${kind}-viewport-lossless.mkv`);
  inputs.push(
    {path: base.path, kind, role: 'old-master', expectedSha256: base.sha256, regions: ['outside']},
    {path: format.output, kind, role: 'new-master', expectedSha256: format.outputSha256, regions: ['outside', 'inside']},
    {path: format.viewportMaster, kind, role: 'viewport', expectedSha256: format.viewportSha256, regions: ['inside']},
  );
}
for (const input of inputs) assert(/^[a-f0-9]{64}$/i.test(input.expectedSha256), `Missing receipt checksum for ${input.path}`);
for (const frame of sampledFrames) assert(Number.isInteger(frame) && frame >= 0 && frame < FRAMES);
assert.equal(new Set(sampledFrames).size, sampledFrames.length);

const probe = (input: Input): Stream => {
  const data: unknown = JSON.parse(execFileSync('ffprobe', ['-v', 'error', '-select_streams', 'v:0', '-show_entries', 'stream=width,height,pix_fmt,time_base,start_time,avg_frame_rate,r_frame_rate,codec_name', '-of', 'json', input.path], {encoding: 'utf8'}));
  assert(data && typeof data === 'object' && 'streams' in data && Array.isArray(data.streams) && data.streams.length === 1);
  const stream: unknown = data.streams[0];
  assert(stream && typeof stream === 'object');
  for (const field of ['width', 'height']) assert(field in stream && typeof Reflect.get(stream, field) === 'number');
  for (const field of ['pix_fmt', 'time_base', 'avg_frame_rate', 'r_frame_rate', 'codec_name']) assert(field in stream && typeof Reflect.get(stream, field) === 'string');
  if ('start_time' in stream) assert.equal(typeof stream.start_time, 'string');
  const value = stream as Stream, viewport = REVISION_VIEWPORTS[input.kind];
  assert.equal(value.width, SCALE * (input.role === 'viewport' ? viewport.width : viewport.fullWidth));
  assert.equal(value.height, SCALE * (input.role === 'viewport' ? viewport.height : viewport.fullHeight));
  assert.equal(value.pix_fmt, 'yuv444p', `Unexpected source pixel format in ${input.path}`);
  assert.equal(value.codec_name, 'h264');
  assert.equal(rational(value.avg_frame_rate), FPS);
  assert.equal(rational(value.r_frame_rate), FPS);
  // Some completed Matroska masters omit this metadata. The mandatory frame-0
  // extraction below independently proves the actual decoded timeline start.
  if (value.start_time !== undefined) assert(Math.abs(Number(value.start_time)) <= rational(value.time_base) / 2 + 1e-9, `Nonzero timeline start in ${input.path}`);
  return value;
};

function extract(input: Input, stream: Stream, region: Region, frames: number[], requestedSecond: number, seekSecond: number, attempt: SeekProof['attempt']): Extraction {
  const localFrames = frames.map(frame => frame - seekSecond * FPS);
  assert(localFrames.every(frame => Number.isInteger(frame) && frame >= 0));
  const viewport = REVISION_VIEWPORTS[input.kind];
  const x = viewport.x * SCALE, y = viewport.y * SCALE, width = viewport.width * SCALE, height = viewport.height * SCALE;
  const selection = localFrames.map(frame => `eq(n\\,${frame})`).join('+');
  const regionFilter = region === 'outside'
    ? `drawbox=x=${x}:y=${y}:w=${width}:h=${height}:color=black:t=fill`
    : input.role === 'new-master' ? `crop=w=${width}:h=${height}:x=${x}:y=${y}:exact=1` : 'null';
  const outputWidth = region === 'outside' ? stream.width : width, outputHeight = region === 'outside' ? stream.height : height;
  const filter = `showinfo@seek=checksum=0,select=${selection},${regionFilter},showinfo@pixels=checksum=0`;
  const result = spawnSync('ffmpeg', [
    '-hide_banner', '-loglevel', 'info', '-nostdin', '-copyts',
    '-ss', String(seekSecond), '-accurate_seek', '-threads', '2', '-i', input.path,
    '-map', '0:v:0', '-an', '-sn', '-dn', '-vf', filter,
    '-frames:v', String(frames.length), '-fps_mode', 'passthrough', '-enc_time_base:v', '1/60',
    '-c:v', 'rawvideo', '-pix_fmt', '+yuv444p', '-threads', '1',
    '-f', 'framemd5', '-hash', 'sha256', '-',
  ], {encoding: 'utf8', maxBuffer: 12 * 1024 * 1024, timeout: 600000});
  if (result.error) throw result.error;
  assert.equal(result.status, 0, `Frame extraction failed for ${input.path} (${region}): ${result.stderr.slice(-6000)}`);
  const firstLine = result.stderr.split('\n').find(line => line.includes('showinfo@seek') && /\bn:\s*0\s/.test(line));
  assert(firstLine, `No first-decoded-frame timestamp was reported for ${input.path}`);
  const sourceTimeBase = rational(stream.time_base);
  const seekTimeBase = result.stderr.split('\n').find(line => line.includes('showinfo@seek') && line.includes('config in time_base:'))?.match(/time_base:\s*([^,\s]+)/)?.[1];
  const pixelsTimeBase = result.stderr.split('\n').find(line => line.includes('showinfo@pixels') && line.includes('config in time_base:'))?.match(/time_base:\s*([^,\s]+)/)?.[1];
  assert(seekTimeBase && pixelsTimeBase, 'Missing decoded/filter timestamp time bases');
  assert.equal(rational(seekTimeBase), sourceTimeBase);
  assert.equal(rational(pixelsTimeBase), sourceTimeBase, 'Comparison filter changed the timestamp clock');
  const ptsText = firstLine.match(/\bpts:\s*(-?\d+)/)?.[1];
  assert(ptsText);
  assert(Number.isSafeInteger(Number(ptsText)));
  const firstPts = Number(ptsText) * sourceTimeBase;
  const firstDecodedNominalFrame = Math.round(firstPts * FPS), expectedFirstDecodedNominalFrame = seekSecond * FPS;
  // Concatenating Matroska chunks can accumulate millisecond offsets. Accept a
  // nonzero seek only if its actual source PTS uniquely identifies the requested
  // 60 fps frame. Timeline zero still requires half-source-tick agreement.
  const firstTolerance = seekSecond === 0 ? sourceTimeBase / 2 + 1e-9 : 0.5 / FPS - 1e-9;
  if (firstDecodedNominalFrame !== expectedFirstDecodedNominalFrame || Math.abs(firstPts - seekSecond) > firstTolerance) throw new FirstTimestampMismatch(firstPts, seekSecond);
  const pixelLines = result.stderr.split('\n').filter(line => line.includes('showinfo@pixels') && /\bn:\s*\d+\s/.test(line));
  assert.equal(pixelLines.length, frames.length, `Unexpected filtered-frame count in ${input.path}`);
  const sourceFrames = pixelLines.map((line, index) => {
    assert.equal(line.match(/\bfmt:([^\s]+)/)?.[1], 'yuv444p', 'Filter changed the YUV plane format');
    assert.equal(line.match(/\bs:(\d+x\d+)/)?.[1], `${outputWidth}x${outputHeight}`, 'Unexpected comparison-region dimensions');
    const sourcePtsText = line.match(/\bpts:\s*(-?\d+)/)?.[1], frame = frames[index];
    assert(sourcePtsText && frame !== undefined);
    const sourcePts = Number(sourcePtsText), sourcePtsSeconds = sourcePts * sourceTimeBase;
    assert(Number.isSafeInteger(sourcePts));
    assert.equal(Math.round(sourcePtsSeconds * FPS), frame, `Selected source PTS does not identify global frame ${frame} in ${input.path}`);
    const sourceTimestampErrorSeconds = sourcePtsSeconds - frame / FPS;
    assert(Math.abs(sourceTimestampErrorSeconds) < 0.5 / FPS - 1e-9, 'Selected source timestamp is ambiguous between nominal frames');
    return {sourcePts, sourcePtsSeconds, sourceTimestampErrorSeconds};
  });
  const lines = result.stdout.split('\n');
  const outputTimeBase = lines.find(line => line.startsWith('#tb 0:'))?.split(':').at(-1)?.trim();
  assert.equal(outputTimeBase, '1/60', `Unexpected hash timestamp time base for ${input.path}`);
  assert(lines.some(line => /^#hash:\s*SHA256$/i.test(line)), 'Expected SHA-256 decoded-frame hashes');
  const outputFrames: Frame[] = lines.filter(line => /^0,/.test(line)).map((line, index) => {
    const fields = line.split(',').map(field => field.trim());
    assert.equal(fields.length, 6);
    const pts = Number(fields[2]), duration = Number(fields[3]), rawBytes = Number(fields[4]), hash = fields[5], frame = frames[index];
    assert(frame !== undefined && hash && /^[a-f0-9]{64}$/i.test(hash));
    assert.equal(pts, frame, `Selected timestamp does not match global frame ${frame} in ${input.path}`);
    assert.equal(duration, 1, `Unexpected selected-frame duration in ${input.path}`);
    assert.equal(rawBytes, outputWidth * outputHeight * 3, 'Unexpected 8-bit yuv444p plane byte count');
    const sourceFrame = sourceFrames[index]; assert(sourceFrame);
    return {frame, pts, duration, rawBytes, sha256: hash, ...sourceFrame};
  });
  assert.equal(outputFrames.length, frames.length, `Missing selected frames in ${input.path}`);
  return {frames: outputFrames, proof: {file: input.path, region, requestedFrames: frames, requestedSeekSecond: requestedSecond, actualSeekSecond: seekSecond, firstDecodedPtsSeconds: firstPts, expectedFirstDecodedPtsSeconds: seekSecond, firstDecodedNominalFrame, expectedFirstDecodedNominalFrame, sourceTimeBase: stream.time_base, outputTimeBase, attempt, filter, outputWidth, outputHeight}};
}

const observations = new Map<string, Map<number, Frame>>(), seekProofs: SeekProof[] = [], seekFallbacks: unknown[] = [], inputReports: unknown[] = [];
const key = (path: string, region: Region): string => `${path}:${region}`;
const groups = new Map<number, number[]>();
for (const frame of sampledFrames) { const second = Math.floor(frame / FPS), group = groups.get(second) ?? []; group.push(frame); groups.set(second, group); }
const reportPath = 'evidence/cinematic-pixel-verification.json';
mkdirSync('evidence', {recursive: true});
writeFileSync(reportPath, JSON.stringify({passed: false, allMatches: false, status: 'running'}, null, 2));
for (const input of inputs) {
  const before = statSync(input.path, {bigint: true});
  assert(before.isFile(), `Missing completed cinematic input: ${input.path}`);
  const stream = probe(input);
  for (const region of input.regions) {
    const cache = new Map<number, Frame>();
    for (const [second, frames] of groups) {
      const attempts = [...new Set([second, Math.max(0, second - 1), 0])];
      let extraction: Extraction | undefined;
      for (const seekSecond of attempts) {
        const attempt: SeekProof['attempt'] = seekSecond === second ? 'requested-integer-second' : seekSecond === second - 1 ? 'one-integer-second-earlier' : 'timeline-zero-fallback';
        try { extraction = extract(input, stream, region, frames, second, seekSecond, attempt); break; }
        catch (error) {
          if (!(error instanceof FirstTimestampMismatch)) throw error;
          seekFallbacks.push({file: input.path, region, requestedFrames: frames, attemptedSeekSecond: seekSecond, observedFirstPtsSeconds: error.observed, expectedFirstPtsSeconds: error.expected});
        }
      }
      assert(extraction, `Could not prove exact seeking for ${input.path} frames ${frames.join(',')}`);
      for (const frame of extraction.frames) cache.set(frame.frame, frame);
      seekProofs.push(extraction.proof);
    }
    observations.set(key(input.path, region), cache);
  }
  const fileSha256 = await hashFile(input.path), after = statSync(input.path, {bigint: true});
  for (const field of ['dev', 'ino', 'size', 'mtimeNs', 'ctimeNs'] as const) assert.equal(after[field], before[field], `Input changed during verification: ${input.path}`);
  assert.equal(fileSha256, input.expectedSha256, `Input checksum does not match completed rebuild receipt: ${input.path}`);
  inputReports.push({file: input.path, kind: input.kind, role: input.role, bytes: Number(after.size), sha256: fileSha256, expectedSha256: input.expectedSha256, stream, regions: input.regions, sampledFrames});
  console.log(JSON.stringify({file: input.path, sampledFrames: sampledFrames.length, comparisonRegions: input.regions, verifiedIntegerSeekGroups: groups.size * input.regions.length}));
}
const frameAt = (file: string, region: Region, frame: number): Frame => { const value = observations.get(key(file, region))?.get(frame); assert(value, `Missing cached frame ${file}:${region}:${frame}`); return value; };
const comparisons = [];
for (const kind of kinds) {
  const old = `../midnight-love/evidence/${kind}-master-lossless.mkv`, current = `evidence/${kind}-master-lossless.mkv`, viewport = `evidence/cinematic/${kind}-viewport-lossless.mkv`;
  for (const globalFrame of sampledFrames) for (const region of ['outside', 'inside'] as const) {
    const referenceFile = region === 'outside' ? old : viewport;
    const reference = frameAt(referenceFile, region, globalFrame), candidate = frameAt(current, region, globalFrame);
    comparisons.push({kind, check: region === 'outside' ? 'outside-viewport-preserved' : 'inside-viewport-replaced', globalFrame, referenceFile, candidateFile: current, referenceSha256: reference.sha256, candidateSha256: candidate.sha256, referenceRawBytes: reference.rawBytes, candidateRawBytes: candidate.rawBytes, referencePts: reference.pts, candidatePts: candidate.pts, referenceSourcePts: reference.sourcePts, candidateSourcePts: candidate.sourcePts, referenceSourcePtsSeconds: reference.sourcePtsSeconds, candidateSourcePtsSeconds: candidate.sourcePtsSeconds, referenceSourceTimestampErrorSeconds: reference.sourceTimestampErrorSeconds, candidateSourceTimestampErrorSeconds: candidate.sourceTimestampErrorSeconds, matched: reference.sha256 === candidate.sha256 && reference.rawBytes === candidate.rawBytes});
  }
}
assert.equal(comparisons.length, 64);
for (const path of boundFiles) assert.equal(sha256(readFileSync(path)), binding(path), `Verification provenance changed during the check: ${path}`);
const allMatches = comparisons.every(comparison => comparison.matched);
const report = {
  passed: allMatches, allMatches, status: 'complete', fps: FPS, fullVideoFrames: FRAMES, scale: SCALE,
  cinematicRebuildSha256: binding('evidence/cinematic-rebuild.json'), cinematicPreflightSha256: binding('evidence/cinematic-preflight.json'), frozenInputManifestSha256: binding('evidence/render-inputs.json'), sourceScriptSha256: binding('scripts/verify-cinematic-pixels.ts'),
  checkedFormats: kinds, sampledGlobalFrames: sampledFrames, comparisonCount: comparisons.length,
  outsideViewportComparisons: comparisons.filter(comparison => comparison.check === 'outside-viewport-preserved').length,
  insideViewportComparisons: comparisons.filter(comparison => comparison.check === 'inside-viewport-replaced').length,
  coverage: {sampledFramesPerFormat: sampledFrames.length, totalFramesPerFormat: FRAMES, sampledFrameFraction: sampledFrames.length / FRAMES, chunkBoundaryPairs: [[2907, 2908], [5815, 5816], [8723, 8724]], includesFirstAndLastFrame: true},
  viewports: REVISION_VIEWPORTS,
  extraction: {hash: 'SHA-256 of decoded 8-bit yuv444p planes via framemd5', outside: 'Fill the identical 2x integer viewport rectangle with opaque black in both old and new masters, then hash all three full-frame planes. Matching hashes prove equality of the unmasked pixels at each sampled frame.', inside: 'Crop the new full master to its exact 2x integer viewport rectangle and compare all three planes with the complete independently rendered viewport at the same global frame.', seeking: 'Seek to floor(frame/60) integer seconds with copyts and accurate seeking, then select local frame indices. Prove the first decoded source PTS identifies the expected nominal frame, and every selected source PTS identifies the requested global frame. Retry one integer second earlier, then timeline zero, only when the first timestamp is not proven.', pixels: 'Require yuv444p source and filtered output, +pix_fmt to prohibit automatic conversion, exact output dimensions and width*height*3 raw bytes. No resizing, RGB conversion or colorspace filter.', sourceTimestampTolerance: 'Timeline zero requires half one source timestamp tick. Nonzero first-decoded and every selected source PTS must round uniquely to the requested 60 fps frame with strictly less than half-frame error, allowing accumulated Matroska concat millisecond offsets. Selected output PTS must additionally equal the requested integer frame exactly in a 1/60 time base.'},
  ffmpeg: execFileSync('ffmpeg', ['-version'], {encoding: 'utf8'}).split('\n')[0],
  inputs: inputReports, seekProofs, seekFallbacks, comparisons,
  limits: 'Sampled decoded-frame verification, not an exhaustive pixel proof: 16 of 11632 frames per format. It proves old-master preservation outside the viewport and new-viewport replacement inside it only at the listed frames. It does not prove viewport/full-Film render equivalence, every intervening frame, full-file frame count or CFR, final downsampling/encoding, audio packets, or final visual quality. Those require the separate viewport proof and delivery checks. Source-file SHA-256 values match the completed rebuild receipt, and file identity/size/change timestamps are checked across each extraction and hash pass.',
};
writeFileSync(reportPath, JSON.stringify(report, null, 2));
assert(allMatches, `Cinematic lossless pixel comparison failed; inspect ${reportPath}`);
console.log(JSON.stringify({passed: true, comparisons: comparisons.length, exactSeekGroups: seekProofs.length, seekFallbacks: seekFallbacks.length}));
