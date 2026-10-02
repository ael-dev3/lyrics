/**
 * Source-clocked mixed-audio features for the review preview.
 *
 * Rebuild with: node scripts/analyze-audio.ts
 * Requires ffmpeg and ffprobe on PATH. No npm packages are required.
 */
import {spawnSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {readFileSync, writeFileSync} from 'node:fs';
import {dirname, join} from 'node:path';
import {fileURLToPath} from 'node:url';

const ROOT = dirname(dirname(fileURLToPath(import.meta.url)));
const SOURCE = join(ROOT, 'public/source.mp4');
const OUTPUT = join(ROOT, 'public/audio-features.json');
const SAMPLE_RATE = 22050;
const CHANNELS = 2;
const FFT_SIZE = 4096;
const BAND_COUNT = 24;
const LOW_HZ = 40;
const HIGH_HZ = 10000;
const FLOOR_DB = -96;
const TRANSIENT_MAX_DB = 18;
const RMS_HALF_WINDOW = Math.round(SAMPLE_RATE * 0.020); // 40 ms total
const ATTACK_HALF_WINDOW = Math.round(SAMPLE_RATE * 0.010); // 20 ms total
const ATTACK_LAG = Math.round(SAMPLE_RATE * 0.020);
const ATTACK_STEP = Math.round(SAMPLE_RATE * 0.005);

function command(name: string, args: string[], maxBuffer = 64 * 1024 * 1024): Buffer {
  const result = spawnSync(name, args, {maxBuffer, encoding: 'buffer'});
  if (result.error || result.status !== 0) {
    throw new Error(`${name} failed: ${result.error?.message ?? result.stderr.toString()}`);
  }
  return result.stdout;
}

function parseRate(rate: string): [number, number] {
  const parts = rate.split('/').map(Number);
  if (parts.length !== 2 || !parts.every(Number.isInteger) || parts.some(x => x <= 0)) {
    throw new Error(`Invalid source frame rate: ${rate}`);
  }
  return [parts[0]!, parts[1]!];
}

const probe = JSON.parse(command('ffprobe', [
  '-v', 'error', '-show_entries',
  'stream=index,codec_type,start_time,nb_frames,avg_frame_rate:format=duration',
  '-of', 'json', SOURCE,
]).toString('utf8'));
const video = probe.streams.find((stream: {codec_type: string}) => stream.codec_type === 'video');
const audio = probe.streams.find((stream: {codec_type: string}) => stream.codec_type === 'audio');
if (!video || !audio) throw new Error('Expected both source video and audio streams');
if (Math.abs(Number(audio.start_time ?? 0)) > 0.0001) {
  throw new Error('Nonzero audio stream start needs an explicit source-time offset');
}
const [fpsNumerator, fpsDenominator] = parseRate(video.avg_frame_rate);
const sourceSha256 = createHash('sha256').update(readFileSync(SOURCE)).digest('hex');
const ffmpegVersion = command('ffmpeg', ['-version']).toString('utf8').split('\n')[0]!.trim();
const pcmBytes = command('ffmpeg', [
  '-v', 'error', '-nostdin', '-i', SOURCE, '-map', `0:${audio.index}`,
  '-vn', '-ac', String(CHANNELS), '-ar', String(SAMPLE_RATE),
  '-c:a', 'pcm_f32le', '-f', 'f32le', 'pipe:1',
], 128 * 1024 * 1024);
if (pcmBytes.byteLength % (CHANNELS * 4) !== 0) throw new Error('Incomplete decoded PCM frame');
const sampleCount = pcmBytes.byteLength / (CHANNELS * 4);
const pcm = pcmBytes.byteOffset % 4 === 0
  ? new Float32Array(pcmBytes.buffer, pcmBytes.byteOffset, pcmBytes.byteLength / 4)
  : Float32Array.from({length: pcmBytes.byteLength / 4}, (_, i) => pcmBytes.readFloatLE(i * 4));

// Prefix sums preserve stereo mean power. Downmixing L+R first could cancel phase.
const power = new Float64Array(sampleCount + 1);
const difference = new Float64Array(sampleCount + 1);
let previousL = 0;
let previousR = 0;
for (let i = 0; i < sampleCount; i++) {
  const l = pcm[i * 2]!;
  const r = pcm[i * 2 + 1]!;
  power[i + 1] = power[i]! + (l * l + r * r) / 2;
  difference[i + 1] = difference[i]! + ((l - previousL) ** 2 + (r - previousR) ** 2) / 2;
  previousL = l;
  previousR = r;
}

function windowPower(prefix: Float64Array, center: number, halfWindow: number): number {
  const first = Math.max(0, center - halfWindow);
  const end = Math.min(sampleCount, center + halfWindow);
  return (prefix[end]! - prefix[first]!) / Math.max(1, end - first);
}
function db(value: number): number {
  return 10 * Math.log10(Math.max(1e-12, value));
}
function quantizeDb(value: number): number {
  return Math.round(Math.max(0, Math.min(1, (value - FLOOR_DB) / -FLOOR_DB)) * 255);
}
function quantizeAttack(value: number): number {
  return Math.round(Math.max(0, Math.min(1, value / TRANSIENT_MAX_DB)) * 255);
}

// Hann-windowed FFT. A band holds its share of mean-square signal power,
// rather than an averaged bin magnitude that changes with band width.
const hann = new Float64Array(FFT_SIZE);
let hannSquareMean = 0;
for (let i = 0; i < FFT_SIZE; i++) {
  hann[i] = 0.5 - 0.5 * Math.cos(2 * Math.PI * i / (FFT_SIZE - 1));
  hannSquareMean += hann[i]! ** 2 / FFT_SIZE;
}
const bandEdgesHz = Array.from({length: BAND_COUNT + 1}, (_, i) =>
  LOW_HZ * (HIGH_HZ / LOW_HZ) ** (i / BAND_COUNT));
const binBand = new Int8Array(FFT_SIZE / 2 + 1).fill(-1);
for (let bin = 1; bin < FFT_SIZE / 2; bin++) {
  const hz = bin * SAMPLE_RATE / FFT_SIZE;
  const band = Math.floor(Math.log(hz / LOW_HZ) / Math.log(HIGH_HZ / LOW_HZ) * BAND_COUNT);
  if (hz >= LOW_HZ && hz < HIGH_HZ && band >= 0 && band < BAND_COUNT) binBand[bin] = band;
}
const reversed = new Uint16Array(FFT_SIZE);
const fftBits = Math.log2(FFT_SIZE);
for (let i = 0; i < FFT_SIZE; i++) {
  let value = i;
  let reverse = 0;
  for (let bit = 0; bit < fftBits; bit++) {
    reverse = (reverse << 1) | (value & 1);
    value >>>= 1;
  }
  reversed[i] = reverse;
}
const real = new Float64Array(FFT_SIZE);
const imaginary = new Float64Array(FFT_SIZE);
function fftBandPowers(center: number): Float64Array {
  const bands = new Float64Array(BAND_COUNT);
  for (let channel = 0; channel < CHANNELS; channel++) {
    for (let i = 0; i < FFT_SIZE; i++) {
      const index = center + i - FFT_SIZE / 2;
      real[reversed[i]!] = index >= 0 && index < sampleCount
        ? pcm[index * CHANNELS + channel]! * hann[i]!
        : 0;
      imaginary[reversed[i]!] = 0;
    }
    for (let length = 2; length <= FFT_SIZE; length *= 2) {
      const half = length / 2;
      const angle = -2 * Math.PI / length;
      const stepReal = Math.cos(angle);
      const stepImaginary = Math.sin(angle);
      for (let start = 0; start < FFT_SIZE; start += length) {
        let twiddleReal = 1;
        let twiddleImaginary = 0;
        for (let offset = 0; offset < half; offset++) {
          const a = start + offset;
          const b = a + half;
          const tr = twiddleReal * real[b]! - twiddleImaginary * imaginary[b]!;
          const ti = twiddleReal * imaginary[b]! + twiddleImaginary * real[b]!;
          real[b] = real[a]! - tr;
          imaginary[b] = imaginary[a]! - ti;
          real[a] = real[a]! + tr;
          imaginary[a] = imaginary[a]! + ti;
          const nextReal = twiddleReal * stepReal - twiddleImaginary * stepImaginary;
          twiddleImaginary = twiddleReal * stepImaginary + twiddleImaginary * stepReal;
          twiddleReal = nextReal;
        }
      }
    }
    for (let bin = 1; bin < FFT_SIZE / 2; bin++) {
      const band = binBand[bin]!;
      if (band >= 0) bands[band] = bands[band]! + (real[bin]! ** 2 + imaginary[bin]! ** 2)
        * 2 / (CHANNELS * FFT_SIZE * FFT_SIZE * hannSquareMean);
    }
  }
  return bands;
}

// Transient is an observed short-window rise within each video frame interval.
// It is a display proxy, not a beat or lyric onset timestamp.
function transientRise(firstSample: number, endSample: number): number {
  let strongest = 0;
  for (let center = firstSample; center < endSample; center += ATTACK_STEP) {
    const currentRms = db(windowPower(power, center, ATTACK_HALF_WINDOW));
    if (currentRms < -50) continue;
    const previous = Math.max(0, center - ATTACK_LAG);
    const rmsRise = currentRms - Math.max(-72, db(windowPower(power, previous, ATTACK_HALF_WINDOW)));
    const highRise = db(windowPower(difference, center, ATTACK_HALF_WINDOW))
      - Math.max(-72, db(windowPower(difference, previous, ATTACK_HALF_WINDOW)));
    strongest = Math.max(strongest, rmsRise, highRise);
  }
  return Math.max(0, strongest);
}

const frameCount = Math.ceil(sampleCount * fpsNumerator / (SAMPLE_RATE * fpsDenominator));
const rows: number[][] = [];
for (let frame = 0; frame < frameCount; frame++) {
  const center = Math.round(frame * fpsDenominator * SAMPLE_RATE / fpsNumerator);
  const end = Math.min(sampleCount, Math.round((frame + 1) * fpsDenominator * SAMPLE_RATE / fpsNumerator));
  const rms = quantizeDb(db(windowPower(power, center, RMS_HALF_WINDOW)));
  const transient = quantizeAttack(transientRise(center, end));
  rows.push([rms, transient, ...fftBandPowers(center).map(bandPower => quantizeDb(db(bandPower)))]);
}

const featureFile = {
  schemaVersion: 1,
  sourceSha256,
  analysis: {
    ffmpegVersion,
    decodedAudioStreamIndex: audio.index,
    sampleRate: SAMPLE_RATE,
    channels: CHANNELS,
    decodedSamples: sampleCount,
    decodedDurationSeconds: sampleCount / SAMPLE_RATE,
    videoFrames: Number(video.nb_frames),
    frameRate: {numerator: fpsNumerator, denominator: fpsDenominator},
    frameCount,
    fftSize: FFT_SIZE,
    rmsWindowSeconds: 2 * RMS_HALF_WINDOW / SAMPLE_RATE,
    spectralWindowSeconds: FFT_SIZE / SAMPLE_RATE,
    transientWindowSeconds: 2 * ATTACK_HALF_WINDOW / SAMPLE_RATE,
    transientLagSeconds: ATTACK_LAG / SAMPLE_RATE,
    transientStepSeconds: ATTACK_STEP / SAMPLE_RATE,
  },
  encoding: {
    row: '[rms, transient, band0, ..., band23]',
    valueType: 'uint8 integer',
    rmsAndBandsDb: `-96 + value * 96 / 255 (dBFS mean-square power; values at or below -96 dBFS clamp to 0)`,
    transientDb: `value * ${TRANSIENT_MAX_DB} / 255 (positive short-window rise, clamped at ${TRANSIENT_MAX_DB} dB)`,
    frameTimeSeconds: 'frameIndex * frameRate.denominator / frameRate.numerator',
    bandEdgesHz: bandEdgesHz.map(x => Math.round(x * 1000) / 1000),
  },
  rows,
};
writeFileSync(OUTPUT, JSON.stringify(featureFile) + '\n');
console.log(JSON.stringify({output: OUTPUT, sourceSha256, sampleCount, frameCount,
  seconds: sampleCount / SAMPLE_RATE, bytes: readFileSync(OUTPUT).byteLength}));
