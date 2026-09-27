import assert from 'node:assert/strict';
import {spawn, execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {createReadStream, existsSync, mkdirSync, renameSync, statSync, writeFileSync} from 'node:fs';
import {basename, dirname, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {assertGate, hashes, REVISION, SONG} from './render-gate.ts';

// The same current, explicit authorization is required before examining masters.
assertGate();

const root = fileURLToPath(new URL('../', import.meta.url));
const source = resolve(root, 'public/source.mp4');
const outputDirectory = resolve(root, 'renders');
const evidencePath = resolve(outputDirectory, 'production-verification.json');
const FPS_NUM = 24000;
const FPS_DEN = 1001;
const FRAMES = 6155;
const VIDEO_DURATION_TICKS = FRAMES * FPS_DEN;
const AUDIO_RATE = 44100;
const AUDIO_CHANNELS = 2;
const SAMPLE_BYTES = 4; // Signed 32-bit PCM, in interleaved stereo order.
const TAIL_BYTES = AUDIO_RATE * AUDIO_CHANNELS * SAMPLE_BYTES;
const times = [20, 43.9, 153.5, 168, 239] as const;
const approvedInputs = hashes();

type Stream = {
  codec_type?: string; codec_name?: string; width?: number; height?: number;
  pix_fmt?: string; sample_aspect_ratio?: string; color_range?: string;
  color_space?: string; color_transfer?: string; color_primaries?: string;
  r_frame_rate?: string; avg_frame_rate?: string; time_base?: string;
  start_pts?: number; duration_ts?: number; nb_frames?: string;
  sample_rate?: string; channels?: number; channel_layout?: string;
  extradata_hash?: string;
};
type Probe = {streams?: Stream[]};
type VideoFrame = {pts?: number; pkt_duration?: number};
type AudioPacket = {pts?: number; dts?: number; duration?: number; size?: string; data_hash?: string};
type FileState = {size: number; mtimeMs: number};

function jsonProbe<T>(args: string[], label: string): T {
  const raw = execFileSync('ffprobe', ['-v', 'error', ...args, '-of', 'json'], {
    encoding: 'utf8', maxBuffer: 64 * 1024 * 1024,
  });
  try {return JSON.parse(raw) as T;}
  catch {throw Error(`${label}: ffprobe returned invalid JSON`);}
}

function streams(file: string): {video: Stream; audio: Stream} {
  const probe = jsonProbe<Probe>([
    '-show_data_hash', 'sha256',
    '-show_entries', 'stream=codec_type,codec_name,width,height,pix_fmt,sample_aspect_ratio,color_range,color_space,color_transfer,color_primaries,r_frame_rate,avg_frame_rate,time_base,start_pts,duration_ts,nb_frames,sample_rate,channels,channel_layout,extradata_hash',
    file,
  ], basename(file));
  const video = probe.streams?.filter(stream => stream.codec_type === 'video');
  const audio = probe.streams?.filter(stream => stream.codec_type === 'audio');
  assert.equal(video?.length, 1, `${basename(file)} must have one video stream`);
  assert.equal(audio?.length, 1, `${basename(file)} must have one audio stream`);
  assert.equal(probe.streams?.length, 2, `${basename(file)} must have only video and audio`);
  return {video: video![0]!, audio: audio![0]!};
}

function checkVideoMetadata(video: Stream, format: 'landscape' | 'portrait', width: number, height: number): void {
  const label = `${format} video`;
  assert.equal(video.codec_name, 'h264', `${label}: codec`);
  assert.equal(video.width, width, `${label}: width`);
  assert.equal(video.height, height, `${label}: height`);
  assert.equal(video.pix_fmt, 'yuv420p', `${label}: pixel format`);
  assert.equal(video.r_frame_rate, '24000/1001', `${label}: nominal frame rate`);
  assert.equal(video.avg_frame_rate, '24000/1001', `${label}: average frame rate`);
  assert.equal(video.time_base, '1/24000', `${label}: time base`);
  assert.equal(Number(video.start_pts), 0, `${label}: first PTS`);
  assert.equal(Number(video.duration_ts), VIDEO_DURATION_TICKS, `${label}: duration ticks`);
  assert.equal(Number(video.nb_frames), FRAMES, `${label}: container frame count`);
  assert.equal(video.sample_aspect_ratio, '1:1', `${label}: sample aspect ratio`);
  assert.equal(video.color_primaries, 'bt709', `${label}: color primaries`);
  assert.equal(video.color_transfer, 'bt709', `${label}: transfer function`);
  assert.equal(video.color_space, 'bt709', `${label}: color matrix`);
  assert.equal(video.color_range, 'tv', `${label}: limited-range signal`);
}

function checkDecodedFrameTimestamps(file: string): {count: number; firstPts: number; lastPts: number; durationTicks: number} {
  const probe = jsonProbe<{frames?: VideoFrame[]}>([
    '-select_streams', 'v:0', '-show_frames',
    '-show_entries', 'frame=pts,pkt_duration', file,
  ], `${basename(file)} decoded frames`);
  const frames = probe.frames;
  assert.ok(frames, `${basename(file)}: no decoded video frames`);
  assert.equal(frames?.length, FRAMES, `${basename(file)}: decoded frame count`);
  for (let index = 0; index < frames.length; index++) {
    const frame: VideoFrame = frames[index]!;
    assert.equal(Number(frame.pts), index * FPS_DEN,
      `${basename(file)}: frame ${index} must have exact presentation timestamp`);
    if (frame.pkt_duration !== undefined) {
      assert.equal(Number(frame.pkt_duration), FPS_DEN,
        `${basename(file)}: frame ${index} duration`);
    }
  }
  return {count: frames.length, firstPts: 0, lastPts: (FRAMES - 1) * FPS_DEN, durationTicks: VIDEO_DURATION_TICKS};
}

function audioPackets(file: string): {count: number; payloadSha256: string; timingSha256: string; firstPts: number; lastEndPts: number} {
  const probe = jsonProbe<{packets?: AudioPacket[]}>([
    '-select_streams', 'a:0', '-show_packets', '-show_data_hash', 'sha256',
    '-show_entries', 'packet=pts,dts,duration,size,data_hash', file,
  ], `${basename(file)} AAC packets`);
  const packets = probe.packets;
  assert.ok(packets?.length, `${basename(file)}: no AAC packets`);
  const payload = createHash('sha256');
  const timing = createHash('sha256');
  for (const [index, packet] of packets.entries()) {
    assert.match(packet.data_hash ?? '', /^SHA256:[0-9a-f]{64}$/u, `${basename(file)}: AAC packet ${index} hash`);
    assert.ok(Number.isSafeInteger(Number(packet.pts)), `${basename(file)}: AAC packet ${index} PTS`);
    assert.ok(Number.isSafeInteger(Number(packet.dts)), `${basename(file)}: AAC packet ${index} DTS`);
    assert.ok(Number.isSafeInteger(Number(packet.duration)) && Number(packet.duration) > 0,
      `${basename(file)}: AAC packet ${index} duration`);
    assert.ok(Number.isSafeInteger(Number(packet.size)) && Number(packet.size) > 0,
      `${basename(file)}: AAC packet ${index} byte count`);
    // Length-prefixed records make the aggregate unambiguous. Each packet is
    // independently hashed by ffprobe before the ordered aggregate is made.
    payload.update(`${packet.size}:${packet.data_hash}\n`);
    timing.update(`${packet.pts}:${packet.dts}:${packet.duration}\n`);
  }
  const first = packets[0]!;
  const last = packets.at(-1)!;
  return {
    count: packets.length,
    payloadSha256: payload.digest('hex'), timingSha256: timing.digest('hex'),
    firstPts: Number(first.pts), lastEndPts: Number(last.pts) + Number(last.duration),
  };
}

function checkAudioMetadata(audio: Stream, original: Stream, label: string): void {
  assert.equal(audio.codec_name, 'aac', `${label}: audio codec`);
  assert.equal(audio.sample_rate, String(AUDIO_RATE), `${label}: audio sample rate`);
  assert.equal(audio.channels, AUDIO_CHANNELS, `${label}: audio channels`);
  assert.equal(audio.channel_layout, 'stereo', `${label}: audio layout`);
  for (const key of ['time_base', 'start_pts', 'duration_ts', 'nb_frames', 'extradata_hash'] as const) {
    assert.equal(audio[key], original[key], `${label}: original AAC ${key}`);
  }
}

function childExit(child: ReturnType<typeof spawn>, label: string, stderr: () => string): Promise<void> {
  return new Promise((resolveExit, reject) => {
    child.once('error', reject);
    child.once('close', code => code === 0 ? resolveExit() : reject(Error(`${label} exited ${code}: ${stderr()}`)));
  });
}

async function decodeAll(file: string): Promise<void> {
  const child = spawn('ffmpeg', [
    '-hide_banner', '-v', 'error', '-xerror', '-err_detect', 'explode', '-nostdin',
    '-i', file, '-map', '0:v:0', '-map', '0:a:0', '-f', 'null', '-',
  ], {stdio: ['ignore', 'ignore', 'pipe']});
  let stderr = '';
  child.stderr.on('data', chunk => {stderr = (stderr + String(chunk)).slice(-12000);});
  await childExit(child, `${basename(file)} full decode`, () => stderr);
  assert.equal(stderr.trim(), '', `${basename(file)} emitted decoder errors`);
}

async function decodedPcm(file: string): Promise<{sampleFrames: number; sha256: string; tailSha256: string; tailSampleFrames: number}> {
  const child = spawn('ffmpeg', [
    '-hide_banner', '-v', 'error', '-xerror', '-err_detect', 'explode', '-nostdin',
    '-i', file, '-map', '0:a:0', '-vn', '-ac', String(AUDIO_CHANNELS), '-ar', String(AUDIO_RATE),
    '-c:a', 'pcm_s32le', '-f', 's32le', 'pipe:1',
  ], {stdio: ['ignore', 'pipe', 'pipe']});
  let stderr = '';
  child.stderr.on('data', chunk => {stderr = (stderr + String(chunk)).slice(-12000);});
  const complete = childExit(child, `${basename(file)} PCM decode`, () => stderr);
  const digest = createHash('sha256');
  const tail = Buffer.alloc(TAIL_BYTES);
  let count = 0;
  for await (const part of child.stdout) {
    const chunk = part as Buffer;
    digest.update(chunk);
    count += chunk.length;
    if (chunk.length >= TAIL_BYTES) {
      chunk.copy(tail, 0, chunk.length - TAIL_BYTES);
    } else {
      tail.copyWithin(0, chunk.length);
      chunk.copy(tail, TAIL_BYTES - chunk.length);
    }
  }
  await complete;
  assert.equal(stderr.trim(), '', `${basename(file)} emitted PCM decoder errors`);
  assert.equal(count % (AUDIO_CHANNELS * SAMPLE_BYTES), 0, `${basename(file)}: truncated PCM sample`);
  assert.ok(count >= TAIL_BYTES, `${basename(file)}: PCM is shorter than one second`);
  return {
    sampleFrames: count / (AUDIO_CHANNELS * SAMPLE_BYTES),
    sha256: digest.digest('hex'),
    tailSha256: createHash('sha256').update(tail).digest('hex'),
    tailSampleFrames: AUDIO_RATE,
  };
}

function sampleScenes(file: string, width: number, height: number) {
  const indices = times.map(seconds => Math.round(seconds * FPS_NUM / FPS_DEN));
  const sampleWidth = width > height ? 160 : 90;
  const sampleHeight = width > height ? 90 : 160;
  const frameBytes = sampleWidth * sampleHeight * 3;
  const selector = indices.map(index => `eq(n\\,${index})`).join('+');
  // One decode from frame zero makes n the exact source presentation index.
  // Passthrough avoids frame duplication or dropping after the select filter.
  const samples = execFileSync('ffmpeg', [
    '-hide_banner', '-v', 'error', '-xerror', '-err_detect', 'explode', '-nostdin',
    '-i', file, '-map', '0:v:0', '-vf', `select=${selector},scale=${sampleWidth}:${sampleHeight}:flags=area`,
    '-fps_mode', 'passthrough', '-frames:v', String(indices.length),
    '-pix_fmt', 'rgb24', '-f', 'rawvideo', 'pipe:1',
  ], {maxBuffer: 2 * 1024 * 1024});
  assert.equal(samples.length, indices.length * frameBytes, `${basename(file)}: missing decoded scene samples`);
  return times.map((seconds, sampleIndex) => {
    const frame = indices[sampleIndex]!;
    const rgb = samples.subarray(sampleIndex * frameBytes, (sampleIndex + 1) * frameBytes);
    let sum = 0;
    let above20 = 0;
    const levels: number[] = [];
    for (let offset = 0; offset < rgb.length; offset += 3) {
      const luma = .2126 * rgb[offset]! + .7152 * rgb[offset + 1]! + .0722 * rgb[offset + 2]!;
      levels.push(luma);
      sum += luma;
      if (luma >= 20) above20++;
    }
    levels.sort((a, b) => a - b);
    const meanLuma = sum / levels.length;
    const nonBlackFraction = above20 / levels.length;
    const p95Luma = levels[Math.floor(levels.length * .95)]!;
    assert.ok(meanLuma >= 4 && nonBlackFraction >= .015 && p95Luma >= 24,
      `${basename(file)}: scene at ${seconds}s is blank or effectively black`);
    return {
      requestedSeconds: seconds, frame, frameTimeSeconds: frame * FPS_DEN / FPS_NUM,
      sampleWidth, sampleHeight,
      meanLuma: Number(meanLuma.toFixed(3)),
      nonBlackFraction: Number(nonBlackFraction.toFixed(5)),
      p95Luma: Number(p95Luma.toFixed(3)),
    };
  });
}

async function fileSha256(file: string): Promise<string> {
  const digest = createHash('sha256');
  for await (const part of createReadStream(file)) digest.update(part as Buffer);
  return digest.digest('hex');
}

function state(file: string): FileState {
  const stat = statSync(file);
  assert.ok(stat.isFile() && stat.size > 0, `${basename(file)} is not a complete file`);
  return {size: stat.size, mtimeMs: stat.mtimeMs};
}

const formats = [
  {format: 'landscape' as const, width: 1920, height: 1080},
  {format: 'portrait' as const, width: 1080, height: 1920},
];
const masterFiles = formats.map(item => ({
  ...item,
  file: resolve(outputDirectory, `MUST-HAVE-BEEN-A-DREAM-${item.format}-${item.width}x${item.height}-24000of1001fps.mp4`),
}));
for (const master of masterFiles) {
  assert.ok(existsSync(master.file), `Missing ${master.format} production master: ${master.file}`);
}
const originalState = state(source);
const masterStates = masterFiles.map(master => state(master.file));
const originalStreams = streams(source);
assert.equal(originalStreams.audio.codec_name, 'aac', 'Source has no AAC soundtrack');
assert.equal(originalStreams.audio.sample_rate, String(AUDIO_RATE), 'Source AAC rate changed');
assert.equal(originalStreams.audio.channels, AUDIO_CHANNELS, 'Source AAC channels changed');
const sourcePackets = audioPackets(source);
const sourcePcm = await decodedPcm(source);
assert.equal(sourcePackets.lastEndPts, Number(originalStreams.audio.duration_ts), 'Source AAC packet tail differs from stream duration');

const masters = [];
for (const master of masterFiles) {
  console.log(`Verifying ${master.format} master: ${basename(master.file)}`);
  const observed = streams(master.file);
  checkVideoMetadata(observed.video, master.format, master.width, master.height);
  checkAudioMetadata(observed.audio, originalStreams.audio, master.format);
  const frames = checkDecodedFrameTimestamps(master.file);
  const packets = audioPackets(master.file);
  assert.deepEqual(packets, sourcePackets, `${master.format}: AAC packet payload, timing or tail differs from source`);
  await decodeAll(master.file);
  const pcm = await decodedPcm(master.file);
  assert.deepEqual(pcm, sourcePcm, `${master.format}: decoded PCM or final second differs from source`);
  const sceneSamples = sampleScenes(master.file, master.width, master.height);
  const sha256 = await fileSha256(master.file);
  masters.push({
    format: master.format, file: basename(master.file), width: master.width, height: master.height,
    bytes: masterStates[masters.length]!.size, sha256,
    video: {codec: observed.video.codec_name, pixelFormat: observed.video.pix_fmt,
      frameRate: observed.video.avg_frame_rate, timeBase: observed.video.time_base,
      sampleAspectRatio: observed.video.sample_aspect_ratio,
      colorPrimaries: observed.video.color_primaries, colorTransfer: observed.video.color_transfer,
      colorMatrix: observed.video.color_space, colorRange: observed.video.color_range, ...frames},
    audio: {codec: observed.audio.codec_name, sampleRate: Number(observed.audio.sample_rate),
      channels: observed.audio.channels, durationTicks: Number(observed.audio.duration_ts),
      ...packets, pcm},
    sceneSamples,
  });
}

assert.deepEqual(state(source), originalState, 'Source changed during verification');
for (const [index, master] of masterFiles.entries()) {
  assert.deepEqual(state(master.file), masterStates[index], `${master.format} master changed during verification`);
}
assertGate();
assert.deepEqual(hashes(), approvedInputs, 'Approved inputs changed during verification');
const evidence = {
  schemaVersion: 1, status: 'verified', verifiedAt: new Date().toISOString(),
  song: SONG, revision: REVISION,
  checks: ['full audio/video decode', 'exact decoded-frame PTS', 'BT.709 limited-range stream metadata',
    'original AAC payload and timing', 'entire decoded PCM and final-second identity', 'decoded scene samples'],
  approvedInputHashes: approvedInputs,
  source: {file: 'public/source.mp4', bytes: originalState.size,
    sha256: approvedInputs['public/source.mp4'], audio: {...sourcePackets, pcm: sourcePcm}},
  masters,
};
mkdirSync(dirname(evidencePath), {recursive: true});
const partial = `${evidencePath}.partial`;
writeFileSync(partial, JSON.stringify(evidence, null, 2) + '\n');
renameSync(partial, evidencePath);
console.log(JSON.stringify({status: evidence.status, evidence: evidencePath,
  masters: masters.map(master => ({format: master.format, file: master.file, sha256: master.sha256}))}));
