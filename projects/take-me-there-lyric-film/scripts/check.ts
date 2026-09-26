import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {existsSync, readFileSync} from 'node:fs';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {array, clamp, num, parseFeatures, parseTimeline, record, str} from '../src/model.ts';
import {REVISION, SONG} from './render-gate.ts';

const path = (relative: string): string => fileURLToPath(new URL(`../${relative}`, import.meta.url));
const json = (relative: string): unknown => JSON.parse(readFileSync(path(relative), 'utf8'));
const hash = (data: Uint8Array): string => createHash('sha256').update(data).digest('hex');
const sourceHash = '954ce98a308937e81a167ab740381cd46195abbad3279f3bc57319fa48bbd73c';
const timeline = parseTimeline(json('public/timeline.json'));
assert.equal(timeline.song, SONG, 'Timeline song identity differs from the render gate');
assert.equal(timeline.revision, REVISION, 'Timeline revision differs from the render gate');
assert.ok(timeline.cues.length > 0, 'Timeline must contain reviewable lyric cues');
const cueIds = new Set<string>();
for (const cue of timeline.cues) {
  assert.ok(!cueIds.has(cue.id), `Duplicate cue ID: ${cue.id}`);
  cueIds.add(cue.id);
  assert.ok(cue.start >= 0 && cue.end > cue.start && cue.end <= timeline.duration, `Out-of-source cue: ${cue.id}`);
  for (const word of cue.words) {
    assert.ok(word.text.trim().length > 0 && !/[\r\n\t]/u.test(word.text), `Invalid displayed word: ${word.id}`);
    for (const time of [word.start, word.end]) {
      assert.ok(Math.abs(time * 44100 - Math.round(time * 44100)) < 1e-5, `Word event is not on the locked source-sample clock: ${word.id}`);
    }
  }
}

const binary = readFileSync(path('public/audio-features.bin'));
const features = parseFeatures(json('public/audio-features.json'), binary.length);
assert.match(features.sourceSha256, /^[a-f0-9]{64}$/u);
assert.equal(features.sourceSha256, sourceHash, 'Features refer to a different source recording');
assert.equal(features.dataSha256, hash(binary), 'Feature binary identity does not match its metadata');
assert.ok(Number.isInteger(features.frameCount) && features.frameCount > 0);
assert.equal(features.frameCount, Math.ceil(features.durationSeconds * features.framesPerSecond));
assert.ok(Math.abs(timeline.duration - features.durationSeconds) < 1 / 44100, 'Timeline and measured source duration differ');
const normalized: number[][] = Array.from({length: features.scalarsPerFrame}, () => []);
const ranges = [features.displayMapping.rmsDb, features.displayMapping.flux, ...features.displayMapping.bandsDb];
for (let frame = 0; frame < features.frameCount; frame++) {
  for (let field = 0; field < features.scalarsPerFrame; field++) {
    const value = binary.readFloatLE(frame * features.bytesPerFrame + field * 4);
    assert.ok(Number.isFinite(value), `Non-finite feature at frame${frame}, field${field}`);
    assert.ok(field === 1 ? value >= 0 : value >= -120 && value <= 6, `Impossible feature magnitude at frame${frame}, field${field}`);
    const range = ranges[field];
    assert.ok(range);
    normalized[field]?.push(clamp((value - range.minimum) / (range.maximum - range.minimum)));
  }
}
const saturatedFractions = normalized.map(values => values.filter(value => value >= 1).length / values.length);
assert.ok(saturatedFractions.every(fraction => fraction < 0.02), 'Feature display mapping spends too long pinned at its ceiling');
const sortedRms = [...(normalized[0] ?? [])].sort((a, b) => a - b);
const rmsSpread = (sortedRms[Math.floor(sortedRms.length * .9)] ?? 0) - (sortedRms[Math.floor(sortedRms.length * .1)] ?? 0);
assert.ok(rmsSpread > .35, 'Feature energy lacks useful source dynamics');
const audit = record(json('evidence/audio-features-audit.json'));
assert.equal(str(audit.sourceSha256), sourceHash);
assert.equal(str(audit.dataSha256), features.dataSha256);
assert.equal(num(audit.frameCount), features.frameCount);
assert.equal(num(audit.bytes), binary.length);

const font = readFileSync(path('public/fonts/SpaceGrotesk.ttf'));
assert.ok(font.length > 10000 && [0x00010000, 0x4f54544f].includes(font.readUInt32BE(0)), 'Film font is not a valid sfnt/OTF asset');
assert.match(readFileSync(path('public/fonts/SpaceGrotesk-OFL.txt'), 'utf8'), /SIL OPEN FONT LICENSE/u, 'Font license is missing');

function command(executable: string, args: string[]): string {
  const result = spawnSync(executable, args, {encoding: 'utf8', maxBuffer: 16 * 1024 * 1024});
  if (result.error || result.status !== 0) throw Error(`${executable} failed: ${result.error?.message ?? result.stderr}`);
  return result.stdout;
}
function probe(relative: string): {streams: Record<string, unknown>[]; duration: number} {
  const input: unknown = JSON.parse(command('ffprobe', ['-v', 'error', '-show_streams', '-show_format', '-of', 'json', path(relative)]));
  const data = record(input);
  return {streams: array(data.streams).map(record), duration: Number(str(record(data.format).duration))};
}
function audioHash(relative: string, codec: 'copy' | 'pcm_s32le'): string {
  const output = command('ffmpeg', ['-v', 'error', '-i', path(relative), '-map', '0:a:0', '-c:a', codec, '-f', 'hash', '-hash', 'sha256', '-']).trim();
  assert.match(output, /^SHA256=[a-f0-9]{64}$/u, 'Unexpected audio hash output');
  return output.slice(7);
}
const sourcePresent = existsSync(path('public/source.mp4'));
const soundtrackPresent = existsSync(path('public/soundtrack.m4a'));
let localMedia: Record<string, unknown> = {status: 'skipped', reason: 'Ignored source media is absent. Structural checks pass independently; this is not audio-identity evidence.'};
if (process.argv.includes('--local-media')) assert.ok(sourcePresent, 'Local media verification requires the locked source');
if (sourcePresent) {
  assert.equal(hash(readFileSync(path('public/source.mp4'))), sourceHash, 'Source MP4 differs from the locked recording');
  const source = probe('public/source.mp4');
  const soundtrack = soundtrackPresent ? probe('public/soundtrack.m4a') : undefined;
  const video = source.streams.find(stream => stream.codec_type === 'video');
  assert.ok(video);
  assert.equal(num(video.width), 1920); assert.equal(num(video.height), 1080);
  assert.equal(str(video.avg_frame_rate), '60/1');
  assert.equal(str(video.codec_name), 'h264');
  assert.equal(Number(str(video.start_time)), 0, 'Video begins at a shifted source time');
  const pictureDuration = Number(str(video.duration));
  assert.ok(Math.abs(pictureDuration - 134.883333) < 1 / 15360, 'Source picture duration differs from the locked recording');
  assert.equal(Number(str(video.nb_frames)), 8093, 'Source picture frame count differs');
  assert.ok(timeline.duration - pictureDuration >= 0 && timeline.duration - pictureDuration < .05, 'Unexpected audio/picture terminal-tail difference');
  const sourceAudio = source.streams.find(stream => stream.codec_type === 'audio');
  const previewAudio = soundtrack?.streams.find(stream => stream.codec_type === 'audio');
  assert.ok(sourceAudio);
  if (soundtrack) {
    assert.ok(previewAudio, 'Separate soundtrack has no audio stream');
    assert.equal(soundtrack.streams.length, 1, 'Separate soundtrack should contain one audio stream');
    assert.ok(Math.abs(source.duration - soundtrack.duration) < 1 / 44100);
  }
  for (const audio of previewAudio ? [sourceAudio, previewAudio] : [sourceAudio]) {
    assert.equal(str(audio.codec_name), 'aac'); assert.equal(str(audio.sample_rate), '44100'); assert.equal(num(audio.channels), 2);
    assert.equal(Number(str(audio.start_time)), 0, 'Audio begins at a shifted source time');
    assert.ok(Math.abs(Number(str(audio.duration)) - timeline.duration) < 1 / 44100, 'Audio duration differs from the lyric clock');
  }
  const sourcePacketHash = audioHash('public/source.mp4', 'copy');
  const sourcePcmHash = audioHash('public/source.mp4', 'pcm_s32le');
  assert.equal(sourcePacketHash, 'cad0e9b829c5bc0b6dcf426ff2e8b8f5aab6938b14f09fb0d12d4c984fc96726', 'Source AAC packet identity changed');
  assert.equal(sourcePcmHash, '17dcb6b92c81f4ae830d7d9c38e40d8932e0d549ae5e70488468cdab0c718fc0', 'Full source PCM decode differs');
  if (soundtrackPresent) {
    assert.equal(audioHash('public/soundtrack.m4a', 'copy'), sourcePacketHash, 'Separate soundtrack AAC packets differ from source');
    assert.equal(audioHash('public/soundtrack.m4a', 'pcm_s32le'), sourcePcmHash, 'Separate soundtrack decoded PCM differs from source');
  }
  localMedia = {status: 'verified', sourceSha256: sourceHash, sourcePicture: {width: 1920, height: 1080, framesPerSecond: 60, frameCount: 8093, startSeconds: 0, durationSeconds: pictureDuration}, terminalAudioTailSeconds: timeline.duration - pictureDuration, audioStartSeconds: 0, durationSeconds: source.duration, sampleRate: 44100, channels: 2, encodedAacPacketSha256: sourcePacketHash, decodedPcmS32leSha256: sourcePcmHash, separateSoundtrackVerifiedIfPresent: soundtrackPresent};
}
process.stdout.write(JSON.stringify({
  status: 'technical-checks-pass',
  song: timeline.song, revision: timeline.revision, cues: timeline.cues.length,
  wordEvents: timeline.cues.reduce((sum, cue) => sum + cue.words.length, 0),
  featureFrames: features.frameCount, featureBytes: binary.length, featureSha256: features.dataSha256,
  maximumUpperSaturationFraction: Math.max(...saturatedFractions), normalizedRmsP90MinusP10: rmsSpread,
  localMedia,
  evidenceLimit: 'These checks establish data integrity, full source-video metadata and exact source audio identity where available. They do not establish visible browser picture, correct lyric transcription, phonetic timing, perceptual integration, completed listening review or render approval.',
}, null, 2) + '\n');
