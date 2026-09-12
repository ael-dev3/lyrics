import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {cpSync, createReadStream, existsSync, mkdirSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync} from 'node:fs';
import {dirname, join, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {FPS, FRAMES, SR} from '../src/config.ts';
import {parseCues} from '../src/schema.ts';

// Importing these shared read-only helpers never stages or publishes anything.
export const VERSION = '1.1.0';
export const RELEASE_TAG = `midnight-love-v${VERSION}`;
export const RELEASE_URL = `https://github.com/ael-dev3/lyrics/releases/tag/${RELEASE_TAG}`;
export const PROJECT = 'projects/midnight-love-lyric-film';
export const OUTPUT_FILES = [
  'Midnight-Love-YouTube-1920x1080-60fps.mp4', 'Midnight-Love-TikTok-1080x1920-60fps.mp4',
  'Midnight-Love-YouTube-Thumbnail-1920x1080.jpg', 'Midnight-Love-TikTok-Cover-Profile-1200x1600.jpg',
  'Midnight-Love-YouTube-Title.txt', 'Midnight-Love-YouTube-Description.txt',
  'Midnight-Love-TikTok-Title.txt', 'Midnight-Love-TikTok-Description.txt', 'Midnight-Love.en.srt',
  'Midnight-Love-YouTube-Verification.json', 'Midnight-Love-TikTok-Verification.json',
] as const;
export const RELEASE_FILES = [...OUTPUT_FILES, 'Midnight-Love-Complete-Production.zip', 'Midnight-Love-Original-Source.mkv', 'Midnight-Love-Cover-Prompts.json'] as const;
export type Asset = {file: string; bytes: number; sha256: string};
export const record = (value: unknown): Record<string, unknown> => {
  assert(value && typeof value === 'object' && !Array.isArray(value));
  return value as Record<string, unknown>;
};
export const readRecord = (path: string): Record<string, unknown> => record(JSON.parse(readFileSync(path, 'utf8')));
export const hashFile = async (path: string): Promise<string> => {
  const hash = createHash('sha256');
  for await (const chunk of createReadStream(path)) hash.update(chunk);
  return hash.digest('hex');
};
export const hashBytes = (bytes: string | Buffer): string => createHash('sha256').update(bytes).digest('hex');
export const asset = async (path: string, file: string): Promise<Asset> => {
  assert(statSync(path).isFile(), `Expected a regular file: ${path}`);
  return {file, bytes: statSync(path).size, sha256: await hashFile(path)};
};

export async function validateCorrectedDelivery() {
  assert.equal(readRecord('package.json').version, VERSION);
  const cues = parseCues(JSON.parse(readFileSync('src/cues.json', 'utf8')));
  const production = {version: VERSION, releaseTag: RELEASE_TAG, cues: cues.length,
    performedWords: cues.reduce((n, cue) => n + cue.words.length, 0),
    focusGroups: cues.reduce((n, cue) => n + cue.groups.length, 0),
    cueSha256: await hashFile('src/cues.json'), filmSha256: await hashFile('src/Film.tsx'),
    frozenInputManifestSha256: await hashFile('evidence/render-inputs.json'),
    renderMethod: 'opaque-lyric-viewport', fps: FPS, frames: FRAMES};
  const revision = record(readRecord('source.json').productionRevision);
  assert.equal(revision.version, VERSION); assert.equal(revision.cues, production.cues);
  assert.equal(revision.performedWords, production.performedWords); assert.equal(revision.focusGroups, production.focusGroups);
  const hashes = new Map<string, string>();
  const cachedHash = async (path: string) => {
    let value = hashes.get(path);
    if (!value) {value = await hashFile(path); hashes.set(path, value);}
    return value;
  };
  const frozen = readRecord('evidence/render-inputs.json'); assert(Array.isArray(frozen.inputs));
  for (const value of frozen.inputs) {
    const input = record(value); assert(typeof input.path === 'string' && typeof input.sha256 === 'string');
    assert.equal(await cachedHash(input.path), input.sha256, `Frozen input changed: ${input.path}`);
  }
  const timing = readRecord('evidence/timing-checks.json');
  assert.equal(timing.cues, production.cues); assert.equal(timing.displayWords, production.performedWords);
  assert.equal(timing.highlightGroups, production.focusGroups); assert.equal(timing.fullyVisibleFirstFocusContacts, production.focusGroups);
  for (const kind of ['YouTube', 'TikTok']) {
    const file = `Midnight-Love-${kind}-${kind === 'YouTube' ? '1920x1080' : '1080x1920'}-60fps.mp4`;
    const report = readRecord(`evidence/${kind.toLowerCase()}-verification.json`);
    assert.deepEqual(report, readRecord(`output/Midnight-Love-${kind}-Verification.json`), 'Publishing report differs from final evidence');
    assert.equal(report.file, file); assert.equal(report.sha256, await cachedHash('output/' + file), `Unverified or stale movie: ${file}`);
    assert.equal(report.bytes, statSync('output/' + file).size);
    for (const field of ['strictFullDecodePassed', 'constantFrameRateVerifiedForEveryFrame', 'aacPacketIdentity', 'fastStart']) assert.equal(report[field], true, `${kind}: ${field}`);
    assert.equal(report.layoutStates, production.cues * 2); assert.deepEqual(report.timing, timing, `${kind}: stale cue/timing report`);
    const video = record(report.video);
    assert.equal(Number(video.nb_read_frames), FRAMES); assert.equal(video.avg_frame_rate, `${FPS}/1`);
    assert(Array.isArray(report.inputHashes)); const paths = new Set<string>();
    for (const value of report.inputHashes) {
      const input = record(value); assert(typeof input.path === 'string' && typeof input.sha256 === 'string'); paths.add(input.path);
      assert.equal(await cachedHash(input.path), input.sha256, `Verification describes a different input: ${input.path}`);
    }
    for (const path of ['src/Film.tsx', 'src/cues.json', 'src/timing.ts', 'src/config.ts', 'public/science.json', 'public/motion.json', 'public/soundtrack.m4a', 'public/source-video.webm']) assert(paths.has(path));
  }
  const viewport = readRecord('evidence/viewport-proof.json');
  assert.equal(viewport.passed, true); assert.equal(viewport.scale, 2); assert(Array.isArray(viewport.inputs));
  for (const value of viewport.inputs) {
    const input = record(value); assert(typeof input.path === 'string');
    assert.equal(input.sha256, await cachedHash(input.path), `Viewport proof is stale: ${input.path}`);
  }
  assert(Array.isArray(viewport.proof) && viewport.proof.length === 16);
  const viewportProofFiles: string[] = [];
  for (const value of viewport.proof) {
    const row = record(value); assert.equal(row.matched, true); assert.equal(row.fullCropRgbaSha256, row.viewportRgbaSha256);
    for (const key of ['fullPng', 'viewportPng']) {
      const path = row[key]; assert(typeof path === 'string' && /^evidence\/viewport-proof\/(youtube|tiktok)-(full|viewport)-f\d+\.png$/.test(path));
      assert(statSync(path).isFile()); viewportProofFiles.push(path);
    }
  }
  const preflight = readRecord('evidence/cinematic-preflight.json'), options = record(preflight.options);
  assert.equal(preflight.passed, true); assert.equal(options.method, production.renderMethod);
  assert.equal(options.frozenInputManifestSha256, production.frozenInputManifestSha256);
  assert.equal(options.frames, FRAMES); assert.equal(options.fps, FPS); assert.equal(options.scale, 2);
  assert.deepEqual(options, readRecord('evidence/cinematic-render-options.json'));
  assert.equal(preflight.viewportProofSha256, await cachedHash('evidence/viewport-proof.json'));
  const rebuilt = readRecord('evidence/cinematic-rebuild.json'); assert.equal(rebuilt.passed, true);
  assert.deepEqual(rebuilt.preflight, preflight); assert(Array.isArray(rebuilt.formats) && rebuilt.formats.length === 2);
  const proof = readRecord('evidence/cinematic-pixel-verification.json');
  assert.equal(proof.passed, true); assert.equal(proof.allMatches, true);
  assert.equal(proof.cinematicRebuildSha256, await cachedHash('evidence/cinematic-rebuild.json'));
  assert.equal(proof.cinematicPreflightSha256, await cachedHash('evidence/cinematic-preflight.json'));
  assert.equal(proof.frozenInputManifestSha256, production.frozenInputManifestSha256);
  assert.equal(proof.sourceScriptSha256, await cachedHash('scripts/verify-cinematic-pixels.ts'));
  assert(Array.isArray(proof.comparisons) && proof.comparisons.length === 64);
  assert(proof.comparisons.every(value => record(value).matched === true));
  assert(Array.isArray(proof.inputs));
  for (const kind of ['youtube', 'tiktok']) {
    for (const check of ['outside-viewport-preserved', 'inside-viewport-replaced']) assert.equal(proof.comparisons.filter(value => {const row = record(value); return row.kind === kind && row.check === check;}).length, 16);
    const matchedFormat: unknown = rebuilt.formats.find(entry => record(entry).kind === kind); assert(matchedFormat);
    const format = record(matchedFormat); assert(Array.isArray(format.chunks) && format.chunks.length === 4);
    let nextFrame = 0;
    for (const value of format.chunks) {
      const chunk = record(value); assert.equal(chunk.start, nextFrame); assert(typeof chunk.end === 'number');
      nextFrame = chunk.end + 1; assert.equal(chunk.frozenInputManifestSha256, production.frozenInputManifestSha256);
      assert.deepEqual(chunk, readRecord(`evidence/cinematic/${kind}-part-${chunk.part}.json`));
    }
    assert.equal(nextFrame, FRAMES);
    for (const [pathField, hashField] of [['output', 'outputSha256'], ['viewportMaster', 'viewportSha256']]) {
      assert(pathField && hashField);
      assert(proof.inputs.some(value => {const input = record(value); return input.file === format[pathField] && input.sha256 === format[hashField];}), `Pixel proof describes a different ${kind} ${pathField}`);
    }
  }
  assert(Array.isArray(preflight.oldMasters));
  for (const value of preflight.oldMasters) {
    const old = record(value); assert(proof.inputs.some(value => {const input = record(value); return input.file === old.path && input.sha256 === old.sha256;}));
  }
  const reviewed = readRecord('evidence/encoded-frame-review.json');
  assert.equal(reviewed.status, 'Selected decoded frames visually reviewed'); assert(Array.isArray(reviewed.frames));
  const reviewedFrames = reviewed.frames.map(value => {
    const row = record(value); assert(typeof row.file === 'string' && /^evidence\/encoded\/(YouTube|TikTok)-\d+\.jpg$/.test(row.file));
    assert(statSync(row.file).isFile()); return {file: row.file, kind: row.kind, frame: row.frame};
  });
  for (const kind of ['YouTube', 'TikTok']) for (const frame of [0, 960, 2186, 2907, 2908, 4844, 5815, 5816, 8723, 8724, 9000, 9840, 11028, FRAMES - 1]) assert(reviewedFrames.some(row => row.kind === kind && row.frame === frame), `Missing corrected-frame review ${kind}:${frame}`);
  const summary = readFileSync('evidence/final-verification.md', 'utf8');
  for (const kind of ['YouTube', 'TikTok']) assert(summary.includes(String(readRecord(`evidence/${kind.toLowerCase()}-verification.json`).sha256)), 'Final written report is stale');
  const covers = readRecord('evidence/cover-verification.json'); assert(Array.isArray(covers.assets)); assert.equal(covers.assets.length, 2);
  for (const value of covers.assets) {
    const cover = record(value); assert(typeof cover.file === 'string' && (OUTPUT_FILES as readonly string[]).includes(cover.file));
    assert.equal(cover.sha256, await cachedHash('output/' + cover.file), `Unverified cover: ${cover.file}`);
  }
  const time = (sample: number) => {
    const ms = Math.round(sample / SR * 1000);
    return `${String(Math.floor(ms / 3600000)).padStart(2, '0')}:${String(Math.floor(ms / 60000) % 60).padStart(2, '0')}:${String(Math.floor(ms / 1000) % 60).padStart(2, '0')},${String(ms % 1000).padStart(3, '0')}`;
  };
  const srt = cues.map((cue, index) => `${index + 1}\n${time(cue.startSample)} --> ${time(cue.endSample)}\n${cue.words.map(word => word.text.toLowerCase()).join(' ')}\n`).join('\n');
  assert.equal(readFileSync('output/Midnight-Love.en.srt', 'utf8'), srt, 'Run captions.ts against the corrected cues');
  const outputAssets: Asset[] = [];
  for (const file of OUTPUT_FILES) outputAssets.push(await asset('output/' + file, file));
  return {production, outputAssets, reviewedFrameFiles: [...new Set(reviewedFrames.map(row => row.file))], viewportProofFiles: [...new Set(viewportProofFiles)]};
}

const publicFiles = ['source-frame.png', 'science.json', 'motion.json', 'SpaceGrotesk.ttf', 'CormorantGaramond-Semibold.ttf', 'CormorantGaramond-Italic.ttf', 'SpaceGrotesk-OFL.txt', 'CormorantGaramond-OFL.txt'];
const analysisFiles = ['lyrics-user-en.txt', 'lyrics-performance-en.txt', 'performed-repeat-map.json', 'v1.0-cues.json', 'windows.json', 'window-method.md', 'full-audio16.json', 'full-vocals16.json', 'bounded-vocals16.json', 'mms-vocals16.json', 'mms-audio16.json', 'wav2vec-vocals16.json', 'alignment-decisions.json', 'repeated-vocal-correlation.json', 'manifest.json', 'motion-manifest.json', 'events.json', 'vocal-rms-5ms.json', 'cover-prompts.json', 'cover-youtube-generated.png', 'cover-tiktok-generated.png', 'source-probe.json', 'calibration.json'];
const evidenceFiles = ['cinematic-style-review.json', 'viewport-proof.json', 'cinematic-preflight.json', 'cinematic-render-options.json', 'cinematic-rebuild.json', 'cinematic-pixel-verification.json', 'youtube-final-164.png', 'tiktok-final-183.8.png', 'youtube-final-44.png', 'tiktok-final-44.png', 'source-contact.jpg', 'vocal-boundary-review.svg', 'vocal-boundary-review.png', 'profile-150x200.png', 'profile-crop-300x400.png', 'thumbnail-320x180.png', 'layout-YouTube.json', 'layout-TikTok.json', 'timing-checks.json', 'audio-timing-check.json', 'dsp-checks.log', 'cover-verification.json', 'final-verification.md', 'youtube-final-contact-sheet.png', 'tiktok-final-contact-sheet.png', 'render-inputs.json', 'encoded-frame-review.json', 'youtube-verification.json', 'tiktok-verification.json', 'intro-revision.json', 'Film-before-title-handoff.txt'];
// Explicit generated files from the abandoned underlined patch plan. They are
// neither current acceptance evidence nor source dependencies. v1.0 stays in Git history.
export const OBSOLETE_EVIDENCE = ['patch-merge-fixture.json', 'revision-plan.json', 'revision-still-review.json', 'revision-preview-review.json', 'revision-rebuild.json', 'revision-pixel-verification.json', 'revision-preview-youtube-contact.jpg', 'revision-preview-tiktok-contact.jpg', 'smooth-preview-contact.jpg', 'opening-preview-contact.jpg'];

// Enumerate first so a missing proof cannot leave a partially staged project.
export function stagingFiles(): {source: string; target: string}[] {
  const files: {source: string; target: string}[] = [];
  const add = (source: string, target = source) => {assert(statSync(source).isFile(), `Missing publication input: ${source}`); files.push({source, target});};
  const tree = (directory: string) => {
    for (const entry of readdirSync(directory, {withFileTypes: true})) {
      const path = join(directory, entry.name); if (path.endsWith('.log')) continue;
      if (entry.isDirectory()) tree(path); else {assert(entry.isFile(), `Unexpected non-regular source: ${path}`); add(path);}
    }
  };
  for (const directory of ['src', 'scripts', 'analysis/tail-correction', 'analysis/original-cue-audit']) tree(directory);
  for (const path of ['README.md', 'SOFTWARE.md', 'package.json', 'package-lock.json', 'tsconfig.json', 'source.json']) add(path);
  for (const path of publicFiles) add('public/' + path);
  for (const path of analysisFiles) add('analysis/' + path);
  for (const path of evidenceFiles) add('evidence/' + path);
  for (const kind of ['youtube', 'tiktok']) for (let part = 1; part <= 4; part++) add(`evidence/cinematic/${kind}-part-${part}.json`);
  if (existsSync('evidence/cinematic/capture-reuse.json')) {
    add('evidence/cinematic/capture-reuse.json');
    tree('evidence/cinematic/original-capture');
  }
  for (const file of OUTPUT_FILES) if (!file.endsWith('.mp4')) add('output/' + file, 'publishing/' + file);
  for (const receipt of ['desktop-verification.json', 'release-upload-verification.json']) if (existsSync('evidence/' + receipt)) add('evidence/' + receipt);
  return files;
}
export const stagedBytes = (source: string): Buffer => source === 'README.md'
  ? Buffer.from(readFileSync(source, 'utf8').replaceAll('](output/', '](publishing/')) : readFileSync(source);

async function stage() {
  const {production, outputAssets} = await validateCorrectedDelivery();
  const files = stagingFiles(), repo = resolve(process.env.LYRICS_REPO ?? '../lyrics'), dest = join(repo, PROJECT);
  for (const receipt of ['desktop-verification.json', 'release-upload-verification.json']) {
    const source = 'evidence/' + receipt; if (!existsSync(source)) continue;
    const value = readRecord(source); assert.equal(value.releaseTag, RELEASE_TAG, `Do not carry a previous edition's ${receipt}`);
    assert.equal(value.cueSha256, production.cueSha256); assert.equal(value.filmSha256, production.filmSha256);
    assert.equal(value.frozenInputManifestSha256, production.frozenInputManifestSha256); assert(Array.isArray(value.assets));
    for (const output of outputAssets) assert(value.assets.some(item => {const row = record(item); return (row.file ?? row.name) === output.file && row.sha256 === output.sha256;}), `Stale ${receipt}: ${output.file}`);
  }
  for (const {source, target} of files) {
    const path = join(dest, target); mkdirSync(dirname(path), {recursive: true});
    if (source === 'README.md') writeFileSync(path, stagedBytes(source)); else cpSync(source, path);
  }
  // Only remove generated receipts absent from this edition. Git history retains
  // v1.0; its receipt at the current path would falsely verify these new movies.
  for (const receipt of ['desktop-verification.json', 'release-upload-verification.json']) if (!existsSync('evidence/' + receipt)) rmSync(join(dest, 'evidence', receipt), {force: true});
  for (const file of OBSOLETE_EVIDENCE) rmSync(join(dest, 'evidence', file), {force: true});
  mkdirSync(join(repo, 'assets'), {recursive: true});
  cpSync('evidence/youtube-final-44.png', join(repo, 'assets/midnight-love-44.png'));
  console.log({files: files.length, ...production, staged: true});
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  if (process.argv.includes('--check')) {
    const checked = await validateCorrectedDelivery();
    console.log({passed: true, readOnly: true, ...checked.production, outputAssets: checked.outputAssets.length, stagingFiles: stagingFiles().length});
  } else await stage();
}
