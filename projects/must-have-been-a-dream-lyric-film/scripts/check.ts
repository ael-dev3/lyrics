import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {existsSync, readFileSync, statSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {geometry} from '../src/scene.ts';
import {SHOTS} from '../src/shots.ts';
import {REVISION, SONG} from './render-gate.ts';

const path = (relative: string): string => fileURLToPath(new URL(`../${relative}`, import.meta.url));
const json = (relative: string): Record<string, unknown> => JSON.parse(readFileSync(path(relative), 'utf8')) as Record<string, unknown>;
const sourceHash = '8a37587959dcfef6b9a91d84498d819cd782fc2b78f2edb923cbb63c1fdc19a5';
const sourceDuration = 256.696599;
const videoFrameCount = 6153;
const featureFrameCount = 6155;
const finite = (value: unknown): value is number => typeof value === 'number' && Number.isFinite(value);

const transcript = readFileSync(path('source/user-transcript.txt'), 'utf8').trim().split(/\r?\n/u);
assert.equal(transcript.length, 26, 'The supplied text has 26 lyric lines');
assert.ok(transcript.every(line => line.trim() === line && line.length > 0), 'Transcript lines should be nonempty and unpadded');

const timeline = json('public/timeline.json');
assert.equal(timeline.song, SONG, 'Timeline identifies another source song');
if (timeline.revision !== undefined) assert.equal(timeline.revision, REVISION, 'Timeline identifies another preview revision');
assert.ok(finite(timeline.sourceDuration) && Math.abs(timeline.sourceDuration - sourceDuration) < 0.002, 'Timeline does not use the full source-media clock');
assert.ok(Array.isArray(timeline.cues) && timeline.cues.length === transcript.length, 'Every supplied line needs a cue');
let previousCueEnd = 0;
let wordCount = 0;
for (const [index, raw] of timeline.cues.entries()) {
  assert.ok(raw && typeof raw === 'object' && !Array.isArray(raw), `Malformed cue ${index + 1}`);
  const cue = raw as Record<string, unknown>;
  assert.equal(cue.id, `L${String(index + 1).padStart(2, '0')}`, 'Cue IDs must be unique and in lyric order');
  assert.equal(cue.text, transcript[index], `Cue ${cue.id} differs from the supplied lyric line`);
  assert.ok(finite(cue.start) && finite(cue.end) && cue.start >= 0 && cue.end > cue.start && cue.end <= sourceDuration + 0.005, `Cue ${cue.id} falls outside the recording`);
  assert.ok(cue.start >= previousCueEnd - 0.08, `Cue ${cue.id} is out of sequence`);
  const tokens = (cue.text as string).split(/\s+/u);
  assert.ok(Array.isArray(cue.words) && cue.words.length === tokens.length, `Cue ${cue.id} lacks individually timed words`);
  let previousWordEnd = cue.start;
  for (const [wordIndex, rawWord] of cue.words.entries()) {
    assert.ok(rawWord && typeof rawWord === 'object' && !Array.isArray(rawWord), `Malformed word ${cue.id}:${wordIndex}`);
    const word = rawWord as Record<string, unknown>;
    assert.equal(word.text, tokens[wordIndex], `Wrong or merged lyric word ${cue.id}:${wordIndex}`);
    assert.ok(finite(word.start) && finite(word.end), `Non-finite word time ${cue.id}:${wordIndex}`);
    assert.ok(word.start >= cue.start - 0.02 && word.end <= cue.end + 0.02 && word.end > word.start, `Word ${cue.id}:${wordIndex} falls outside its cue`);
    assert.ok(word.start >= previousWordEnd - 0.08, `Word ${cue.id}:${wordIndex} runs backward`);
    previousWordEnd = word.end;
    wordCount++;
  }
  previousCueEnd = cue.end;
}

const featureData = json('public/audio-features.json');
assert.equal(featureData.schemaVersion, 1);
assert.equal(featureData.sourceSha256, sourceHash, 'Audio features refer to another recording');
const analysis = featureData.analysis as Record<string, unknown>;
const frameRate = analysis.frameRate as Record<string, unknown>;
assert.equal(frameRate.numerator, 24000);
assert.equal(frameRate.denominator, 1001);
assert.equal(analysis.videoFrames, videoFrameCount);
assert.equal(analysis.frameCount, featureFrameCount);
assert.ok(finite(analysis.decodedDurationSeconds) && Math.abs(analysis.decodedDurationSeconds - sourceDuration) < 0.002);
assert.ok(Array.isArray(featureData.rows) && featureData.rows.length === featureFrameCount, 'Audio measurements must cover the source clock through the final frame');
let populatedRows = 0;
for (const [index, raw] of featureData.rows.entries()) {
  assert.ok(Array.isArray(raw) && raw.length === 26, `Audio feature row ${index} needs RMS, transient and 24 bands`);
  assert.ok(raw.every(value => Number.isInteger(value) && value >= 0 && value <= 255), `Invalid measured value in audio feature row ${index}`);
  if (raw[0] > 0) populatedRows++;
}
assert.ok(populatedRows > featureFrameCount * .5, 'Audio features do not contain the full recording');

assert.ok(SHOTS.length >= 60, 'Full-bleed crop plan needs shot-level source coverage');
let next = 0;
const shotIds = new Set<string>();
for (const shot of SHOTS) {
  assert.ok(!shotIds.has(shot.id), `Duplicate shot ID: ${shot.id}`);
  shotIds.add(shot.id);
  assert.ok(Math.abs(shot.start - next) < 1e-6 && shot.end > shot.start, `Crop plan has a gap or overlap at ${shot.id}`);
  const landscape = geometry('landscape', shot);
  const portrait = geometry('portrait', shot);
  for (const [format, g] of [['landscape', landscape], ['portrait', portrait]] as const) {
    assert.deepEqual(g.destination, {x: 0, y: 0, w: g.w, h: g.h}, `${format} must fill its complete frame`);
    assert.equal(g.source.y, 204, `${format} must start at the active source image`);
    assert.equal(g.source.h, 672, `${format} must omit the encoded matte bands`);
    assert.ok(g.source.x >= 0 && g.source.x + g.source.w <= 1920, `${format} crop exceeds source width: ${shot.id}`);
    assert.ok(Math.abs(g.source.w / 672 - g.w / g.h) < 1e-9, `${format} crop distorts the source: ${shot.id}`);
  }
  assert.ok(finite(shot.landscapeCenter) && finite(shot.portraitCenter), `Invalid crop center: ${shot.id}`);
  next = shot.end;
}
assert.ok(next >= sourceDuration, 'Crop plan ends before the last source frame');
const artistTitleShots = SHOTS.filter(shot => shot.id.startsWith('artist-title'));
assert.ok(artistTitleShots.length >= 1 && artistTitleShots.every(shot => shot.protectSourceText), 'Artist-title intervals must protect source-authored lettering');
for (const id of ['song-title-flash', 'source-credit-cards', 'daylight-source-credits']) {
  assert.ok(SHOTS.some(shot => shot.id === id && shot.protectSourceText), `Source-authored lettering is not marked for protection: ${id}`);
}

const bridgeHashes: Record<string, string> = {
  intro: '1b96498590a1b8feddf67cfff87a393ddca5682aa1e5dc40960a7ec845cffbb0',
  mid: 'd5b0a76f9c61da975c9e43419eaffdb75deb72dce2e95aa504ea393f8d491b91',
  title: '445b24a94e54814e58761420fcb14566a3a980f718821809196351f4c63197c7',
  credits: 'cf9c407c6383d947541853a5a8a0dc7de798a7c91633d788bd14a755ebff2994',
  'stage-light': '9e79449409555f3502d2ad7e92639d12e820b3f3f8b1aadf1ea3aa615df912a2',
  'blue-face': '04eb13418f7f4c8e8245e700273c36c4238fd71680c4f58620f08b98920062f5',
};
for (const [name, expected] of Object.entries(bridgeHashes)) {
  const file = path(`public/bridge-${name}.jpg`);
  const bytes = readFileSync(file);
  assert.equal(createHash('sha256').update(bytes).digest('hex'), expected, `Source-derived ${name} bridge changed`);
  const probe = spawnSync('ffprobe', ['-v', 'error', '-show_entries', 'stream=codec_name,width,height', '-of', 'json', file], {encoding: 'utf8'});
  if (probe.error || probe.status !== 0) throw Error(`ffprobe could not decode source bridge ${name}: ${probe.error?.message ?? probe.stderr}`);
  const metadata = JSON.parse(probe.stdout) as {streams: {codec_name: string; width: number; height: number}[]};
  assert.ok(metadata.streams.some(stream => stream.codec_name === 'mjpeg' && stream.width === 1920 && stream.height === 1080), `Source bridge ${name} is not a full-resolution JPEG`);
}
const spritePath = path('public/bridge-mid-sprite.jpg');
const spriteBytes = readFileSync(spritePath);
assert.equal(spriteBytes.byteLength, 1_241_429, 'Source memory sprite byte length changed');
assert.equal(createHash('sha256').update(spriteBytes).digest('hex'), '791b39f3de8cbb1bfb7571f3a83bce9e426b7791090e523fcdd1fdb0cd1c55cd', 'Source memory sprite differs from the locked original-footage sequence');
const spriteProbe = spawnSync('ffprobe', ['-v', 'error', '-show_entries', 'stream=codec_name,width,height', '-of', 'json', spritePath], {encoding: 'utf8'});
if (spriteProbe.error || spriteProbe.status !== 0) throw Error(`ffprobe could not decode the source memory sprite: ${spriteProbe.error?.message ?? spriteProbe.stderr}`);
const sprite = JSON.parse(spriteProbe.stdout) as {streams: {codec_name: string; width: number; height: number}[]};
assert.ok(sprite.streams.some(stream => stream.codec_name === 'mjpeg' && stream.width === 7680 && stream.height === 2688), 'Memory sprite must contain an 8×8 grid of 960×336 source-derived tiles');
const spriteFrames = 60, spriteColumns = 8, tileWidth = 960, tileHeight = 336;
assert.ok(Math.ceil(spriteFrames / spriteColumns) * tileHeight <= 2688 && spriteColumns * tileWidth === 7680, 'The 60 playback tiles do not fit the image');

const font = readFileSync(path('public/ArchivoBlack-Regular.ttf'));
assert.ok(font.length > 10000 && [0x00010000, 0x4f54544f].includes(font.readUInt32BE(0)), 'Film font is missing or malformed');
assert.match(readFileSync(path('public/ArchivoBlack-OFL.txt'), 'utf8'), /SIL OPEN FONT LICENSE/u);

const sourcePath = path('public/source.mp4');
const requireMedia = process.argv.includes('--local-media');
let localMedia: Record<string, unknown> = {status: 'absent', note: 'Restore the ignored source MP4 before browser review; use --local-media to require it.'};
if (requireMedia) assert.ok(existsSync(sourcePath), 'The full original source MP4 is required for local media verification');
if (existsSync(sourcePath)) {
  const source = readFileSync(sourcePath);
  assert.equal(source.byteLength, 75_473_884, 'Original MP4 byte length changed');
  assert.equal(createHash('sha256').update(source).digest('hex'), sourceHash, 'Original MP4 differs from the locked source');
  const result = spawnSync('ffprobe', ['-v', 'error', '-show_entries', 'stream=codec_type,codec_name,width,height,avg_frame_rate,sample_rate,channels,start_time,duration,nb_frames', '-show_entries', 'format=duration', '-of', 'json', sourcePath], {encoding: 'utf8'});
  if (result.error || result.status !== 0) throw Error(`ffprobe could not verify the source: ${result.error?.message ?? result.stderr}`);
  const probe = JSON.parse(result.stdout) as {streams: Record<string, string>[]; format: {duration: string}};
  const video = probe.streams.find(stream => stream.codec_type === 'video');
  const audio = probe.streams.find(stream => stream.codec_type === 'audio');
  assert.ok(video && audio, 'Source needs both original moving picture and soundtrack');
  assert.equal(video.codec_name, 'h264');
  assert.equal(Number(video.width), 1920); assert.equal(Number(video.height), 1080);
  assert.equal(video.avg_frame_rate, '24000/1001');
  assert.equal(Number(video.nb_frames), videoFrameCount);
  assert.ok(Math.abs(Number(video.duration) - 256.631375) < 0.00005);
  assert.equal(audio.codec_name, 'aac'); assert.equal(Number(audio.sample_rate), 44100); assert.equal(Number(audio.channels), 2);
  assert.equal(Number(video.start_time), 0); assert.equal(Number(audio.start_time), 0);
  assert.ok(Math.abs(Number(audio.duration) - sourceDuration) < 0.00005);
  assert.ok(Math.abs(Number(probe.format.duration) - sourceDuration) < 0.00005);
  localMedia = {status: 'verified', bytes: statSync(sourcePath).size, sha256: sourceHash, videoFrames: videoFrameCount, audioDurationSeconds: Number(audio.duration)};
}

process.stdout.write(JSON.stringify({
  status: 'technical-preview-checks-pass', song: SONG, revision: REVISION,
  lyricCues: transcript.length, individuallyTimedWords: wordCount,
  measuredAudioFrames: featureFrameCount, fullBleedShotIntervals: SHOTS.length,
  sourceImageBridges: Object.keys(bridgeHashes).length,
  memorySprite: {frames: spriteFrames, sampleRate: 12, sourceIntervalSeconds: [146.25, 151.25], playbackIntervalSeconds: [151.25, 156.32], sha256: '791b39f3de8cbb1bfb7571f3a83bce9e426b7791090e523fcdd1fdb0cd1c55cd'},
  localMedia,
  evidenceLimit: 'Data and local media identity checks cannot prove phonetic word accuracy, visible browser motion, artistic integration, completed listening review, or render authorization.',
}, null, 2) + '\n');
