import assert from 'node:assert/strict';
import {readFileSync, writeFileSync, mkdirSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {runInNewContext} from 'node:vm';

// Exercise the exact production filter without rendering the real composition.
// All video sources are synthetic16×16 pixels; no source media is changed.
const sourceScript = 'scripts/render-revision.ts';
const sourceText = readFileSync(sourceScript, 'utf8');
const literal = sourceText.match(/const filter=('.*?');/s)?.[1];
assert(literal, 'Expected the production filter as a single string literal');
const decoded: unknown = runInNewContext(literal, {}, {timeout: 1000});
assert(typeof decoded === 'string');
const filter = decoded;
type FrameHash = {pts: number; dts: number; duration: number; bytes: number; sha: string};
function frameHashes(args: string[]): {frames: FrameHash[]; timeBase: string} {
  const output = execFileSync('ffmpeg', ['-v', 'error', ...args, '-an', '-pix_fmt', 'yuv444p', '-f', 'framemd5', '-'], {encoding: 'utf8', maxBuffer: 4 * 1024 * 1024});
  const lines = output.split('\n'), timeBase = lines.find(line => line.startsWith('#tb 0:'));
  assert(timeBase);
  const frames = lines.filter(line => /^0,/.test(line)).map(line => {
    const fields = line.split(',').map(field => field.trim());
    assert.equal(fields.length, 6);
    const sha = fields[5]; assert(sha && /^[a-f0-9]{32}$/.test(sha));
    const result = {dts: Number(fields[1]), pts: Number(fields[2]), duration: Number(fields[3]), bytes: Number(fields[4]), sha};
    assert([result.dts, result.pts, result.duration, result.bytes].every(Number.isFinite));
    return result;
  });
  return {frames, timeBase};
}
const compositeArgs = (first: string, second: string): string[] => [
  '-f', 'lavfi', '-i', 'color=black:s=16x16:r=60:d=150',
  '-f', 'lavfi', '-i', first, '-f', 'lavfi', '-i', second,
  '-filter_complex', filter, '-map', '[v]', '-frames:v', '9000',
];
const staticResult = frameHashes(compositeArgs('color=red:s=16x16:r=60:d=6', 'color=blue:s=16x16:r=60:d=7'));
assert.equal(staticResult.timeBase, '#tb 0: 1/60');
assert.equal(staticResult.frames.length, 9000);
const colors = {base: staticResult.frames[0]?.sha, focus: staticResult.frames[1980]?.sha, onset: staticResult.frames[4620]?.sha};
assert(colors.base && colors.focus && colors.onset);
assert.equal(new Set(Object.values(colors)).size, 3);
for (const [index, frame] of staticResult.frames.entries()) {
  const expected: string = index >= 1980 && index < 2340 ? colors.focus : index >= 4620 && index < 5040 ? colors.onset : colors.base;
  assert.equal(frame.sha, expected, `Overlay leaked or missed frame ${index}`);
  assert.equal(frame.pts, index, `Incorrect PTS at frame ${index}`);
  assert.equal(frame.dts, index, `Incorrect DTS at frame ${index}`);
  assert.equal(frame.duration, 1, `Incorrect duration at frame ${index}`);
  assert.equal(frame.bytes, 16 * 16 * 3);
}

// Changing every patch frame catches internal framesync slips that static colors cannot.
const focusSource = "nullsrc=s=16x16:r=60:d=6,geq=lum='mod(N,200)+16':cb=100:cr=150,format=yuv444p";
const onsetSource = "nullsrc=s=16x16:r=60:d=7,geq=lum='mod(N*3,200)+16':cb=150:cr=100,format=yuv444p";
const focusFrames = frameHashes(['-f', 'lavfi', '-i', focusSource]).frames;
const onsetFrames = frameHashes(['-f', 'lavfi', '-i', onsetSource]).frames;
const moving = frameHashes(compositeArgs(focusSource, onsetSource));
assert.equal(focusFrames.length, 360); assert.equal(onsetFrames.length, 420);
assert.equal(moving.frames.length, 9000); assert.equal(moving.timeBase, '#tb 0: 1/60');
for (const [index, expected] of focusFrames.entries()) assert.equal(moving.frames[1980 + index]?.sha, expected.sha, `Focus patch shifted or changed pixel values at local frame ${index}`);
for (const [index, expected] of onsetFrames.entries()) assert.equal(moving.frames[4620 + index]?.sha, expected.sha, `Onset patch shifted or changed pixel values at local frame ${index}`);
for (const [index, frame] of moving.frames.entries()) {
  assert.equal(frame.pts, index); assert.equal(frame.duration, 1);
  if (!(index >= 1980 && index < 2340) && !(index >= 4620 && index < 5040)) assert.equal(frame.sha, colors.base, `Dynamic patch leaked at ${index}`);
}
const report = {
  passed: true,
  sourceScript,
  sourceScriptSha256: createHash('sha256').update(sourceText).digest('hex'),
  filterSha256: createHash('sha256').update(filter).digest('hex'),
  filter,
  ffmpeg: execFileSync('ffmpeg', ['-version'], {encoding: 'utf8'}).split('\n')[0],
  fixture: {dimensions: [16, 16], pixelFormat: 'yuv444p', fps: 60, prefixFrames: 9000, durationSeconds: 150},
  exactPatchRanges: [
    {id: 'focus', globalStartFrame: 1980, globalEndFrameInclusive: 2339, exclusiveEndFrame: 2340, frameCount: 360},
    {id: 'onset', globalStartFrame: 4620, globalEndFrameInclusive: 5039, exclusiveEndFrame: 5040, frameCount: 420},
  ],
  staticFramesChecked: staticResult.frames.length,
  dynamicFramesChecked: moving.frames.length,
  dynamicPatchFramesComparedAgainstIndependentSources: focusFrames.length + onsetFrames.length,
  exactTimeBase: '1/60',
  everyOutputPtsEqualsFrameIndex: true,
  everyFrameDurationEqualsOneTick: true,
  noOverlayOutsideDeclaredWindows: true,
  opaquePatchPixelsBitIdentical: true,
  noInternalFramesyncSlippage: true,
  limits: 'Synthetic filter validation. Final real-media prefix/tail join, frame counts, decoded pixels, duration, color metadata and AAC identity require separate delivery verification.',
};
mkdirSync('evidence', {recursive: true});
writeFileSync('evidence/patch-merge-fixture.json', JSON.stringify(report, null, 2));
console.log(JSON.stringify({passed: true, staticFramesChecked: report.staticFramesChecked, dynamicFramesChecked: report.dynamicFramesChecked, dynamicPatchFramesCompared: report.dynamicPatchFramesComparedAgainstIndependentSources, exactTimeBase: report.exactTimeBase}));
