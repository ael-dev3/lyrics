import {createHash} from 'node:crypto';
import {mkdirSync, readFileSync, writeFileSync} from 'node:fs';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';

const path = (relative: string): string => fileURLToPath(new URL(relative, import.meta.url));
const source = path('../public/source.mp4');
const binaryPath = path('../public/audio-features.bin');
const metadataPath = path('../public/audio-features.json');
const auditPath = path('../evidence/audio-features-audit.json');
const sampleRate = 22050;
const fps = 60;
const fftSize = 2048;
const bandCount = 24;
const stride = bandCount + 2;
const floorDb = -120;

function sha256(data: Uint8Array): string {
  return createHash('sha256').update(data).digest('hex');
}
function quantile(values: readonly number[], fraction: number): number {
  if (values.length === 0) throw new Error('Cannot calibrate an empty feature series');
  const sorted = [...values].sort((a, b) => a - b);
  const index = (sorted.length - 1) * fraction;
  const lower = sorted[Math.floor(index)] ?? 0;
  const upper = sorted[Math.ceil(index)] ?? lower;
  return lower + (upper - lower) * (index - Math.floor(index));
}
function describe(values: readonly number[]): Record<string, number> {
  return {
    minimum: quantile(values, 0), p10: quantile(values, 0.10), p50: quantile(values, 0.50),
    p90: quantile(values, 0.90), p99: quantile(values, 0.99), maximum: quantile(values, 1),
  };
}
function range(values: readonly number[], lower: number, upper: number): {minimum: number; maximum: number} {
  const minimum = quantile(values, lower);
  const maximum = quantile(values, upper);
  if (!(maximum > minimum)) throw new Error('Feature series has no usable variation');
  return {minimum, maximum};
}
function db(amplitude: number): number {
  return Math.max(floorDb, 20 * Math.log10(Math.max(1e-12, amplitude)));
}
function normalized(value: number, bounds: {minimum: number; maximum: number}): number {
  return Math.max(0, Math.min(1, (value - bounds.minimum) / (bounds.maximum - bounds.minimum)));
}
function fft(real: Float64Array, imaginary: Float64Array): void {
  let j = 0;
  for (let i = 1; i < fftSize; i++) {
    let bit = fftSize >> 1;
    while (j & bit) { j ^= bit; bit >>= 1; }
    j ^= bit;
    if (i < j) {
      const realI = real[i] ?? 0;
      const imaginaryI = imaginary[i] ?? 0;
      real[i] = real[j] ?? 0;
      imaginary[i] = imaginary[j] ?? 0;
      real[j] = realI;
      imaginary[j] = imaginaryI;
    }
  }
  for (let length = 2; length <= fftSize; length <<= 1) {
    const angle = -2 * Math.PI / length;
    for (let start = 0; start < fftSize; start += length) {
      for (let k = 0; k < length / 2; k++) {
        const a = start + k;
        const b = a + length / 2;
        const wr = Math.cos(angle * k);
        const wi = Math.sin(angle * k);
        const realA = real[a] ?? 0;
        const imaginaryA = imaginary[a] ?? 0;
        const realB = real[b] ?? 0;
        const imaginaryB = imaginary[b] ?? 0;
        const transformedReal = wr * realB - wi * imaginaryB;
        const transformedImaginary = wr * imaginaryB + wi * realB;
        real[b] = realA - transformedReal;
        imaginary[b] = imaginaryA - transformedImaginary;
        real[a] = realA + transformedReal;
        imaginary[a] = imaginaryA + transformedImaginary;
      }
    }
  }
}

// Explicit equal-weight mono fold-down keeps the measurement reproducible. It
// can cancel antiphase stereo detail; these features never establish lyric timing.
const decode = spawnSync('ffmpeg', [
  '-v', 'error', '-i', source, '-map', '0:a:0',
  '-af', 'pan=mono|c0=0.5*c0+0.5*c1', '-ar', String(sampleRate),
  '-f', 'f32le', 'pipe:1',
], {maxBuffer: 64 * 1024 * 1024});
if (decode.status !== 0) throw new Error(`Audio decode failed: ${decode.stderr.toString()}`);
const decoded = decode.stdout;
if (decoded.length === 0 || decoded.length % 4 !== 0) throw new Error('Invalid decoded float audio');
const sampleCount = decoded.length / 4;
const audio = Float32Array.from({length: sampleCount}, (_, i) => decoded.readFloatLE(i * 4));
const durationSeconds = sampleCount / sampleRate;
const frameCount = Math.ceil(durationSeconds * fps);
const real = new Float64Array(fftSize);
const imaginary = new Float64Array(fftSize);
const window = Float64Array.from({length: fftSize}, (_, i) => 0.5 - 0.5 * Math.cos(2 * Math.PI * i / fftSize));
const windowPower = window.reduce((sum, value) => sum + value * value, 0) / fftSize;
const windowCoherentGain = window.reduce((sum, value) => sum + value, 0) / fftSize;
const bandEdgesHz = Array.from({length: bandCount + 1}, (_, i) => 55 * (10000 / 55) ** (i / bandCount));
const binBands = Int16Array.from({length: fftSize / 2}, (_, bin) => {
  const frequency = bin * sampleRate / fftSize;
  return bandEdgesHz.findIndex((edge, index) => index < bandCount && frequency >= edge && frequency < (bandEdgesHz[index + 1] ?? 0));
});
const previousMagnitudes = new Float64Array(fftSize / 2);
const data = Buffer.alloc(frameCount * stride * 4);
const rmsSeries: number[] = [];
const fluxSeries: number[] = [];
const bandSeries: number[][] = Array.from({length: bandCount}, () => []);
let firstFrame = true;
for (let frame = 0; frame < frameCount; frame++) {
  const centerSample = Math.round(frame * sampleRate / fps);
  let samplePower = 0;
  let supportedSamples = 0;
  for (let i = 0; i < fftSize; i++) {
    const sampleIndex = centerSample + i - fftSize / 2;
    const sample = audio[sampleIndex] ?? 0;
    samplePower += sample * sample;
    if (sampleIndex >= 0 && sampleIndex < sampleCount) supportedSamples++;
    real[i] = sample * (window[i] ?? 0);
    imaginary[i] = 0;
  }
  fft(real, imaginary);
  const rmsDb = db(Math.sqrt(samplePower / Math.max(1, supportedSamples)));
  const bandPower = new Float64Array(bandCount);
  let flux = 0;
  for (let bin = 1; bin < fftSize / 2; bin++) {
    const magnitude = Math.hypot(real[bin] ?? 0, imaginary[bin] ?? 0);
    const normalizedMagnitude = magnitude / (fftSize * windowCoherentGain / 2);
    flux += Math.max(0, normalizedMagnitude - (previousMagnitudes[bin] ?? 0));
    previousMagnitudes[bin] = normalizedMagnitude;
    const band = binBands[bin] ?? -1;
    if (band >= 0) bandPower[band] = (bandPower[band] ?? 0) + magnitude * magnitude;
  }
  // No synthetic transient at t=0: there is no preceding decoded frame there.
  if (firstFrame) { flux = 0; firstFrame = false; }
  rmsSeries.push(rmsDb);
  fluxSeries.push(flux);
  const offset = frame * stride * 4;
  data.writeFloatLE(rmsDb, offset);
  data.writeFloatLE(flux, offset + 4);
  for (let band = 0; band < bandCount; band++) {
    // Integrate one-sided FFT power, correcting the Hann window's power loss.
    const bandRmsDb = db(Math.sqrt(2 * (bandPower[band] ?? 0) / (fftSize * fftSize * windowPower)));
    bandSeries[band]?.push(bandRmsDb);
    data.writeFloatLE(bandRmsDb, offset + (band + 2) * 4);
  }
}
for (let offset = 0; offset < data.length; offset += 4) {
  if (!Number.isFinite(data.readFloatLE(offset))) throw new Error(`Non-finite feature at byte ${offset}`);
}

// These artistic maps are metadata only. The binary retains measured dB/flux.
const rmsRange = range(rmsSeries, 0.10, 0.995);
const fluxRange = range(fluxSeries, 0.50, 0.995);
const bandRanges = bandSeries.map(values => range(values, 0.10, 0.995));
const displayMapping = {
  formula: 'clamp((raw - minimum) / (maximum - minimum), 0, 1)',
  rmsDb: {...rmsRange, percentiles: [0.10, 0.995]},
  flux: {...fluxRange, percentiles: [0.50, 0.995]},
  bandsDb: bandRanges.map(bounds => ({...bounds, percentiles: [0.10, 0.995]})),
  note: 'Source-specific artistic scaling, not loudness units. Bands are individually calibrated; compare absolute spectral balance using the raw dBFS values. Any release/smoothing belongs to deterministic source-time display logic, never vocal timing.',
};
const sourceSha256 = sha256(readFileSync(source));
const dataSha256 = sha256(data);
const metadata = {
  version: 1,
  sourceSha256,
  dataSha256,
  dataFile: 'audio-features.bin',
  analysisSampleRate: sampleRate,
  decodedSamples: sampleCount,
  durationSeconds,
  framesPerSecond: fps,
  frameCount,
  fftSize,
  window: 'periodic Hann',
  windowCoherentGain,
  windowPower,
  supportSeconds: fftSize / sampleRate,
  bandCount,
  bandEdgesHz,
  format: 'Float32LE interleaved',
  scalarsPerFrame: stride,
  bytesPerFrame: stride * 4,
  fields: ['rmsDbFS', 'positiveMagnitudeFlux', ...Array.from({length: bandCount}, (_, i) => `band${i}DbFS`)],
  rmsDefinition: 'Unwindowed mono RMS across supported samples in the centered analysis window; 20log10(amplitude), floored at -120 dBFS.',
  bandDefinition: 'Integrated one-sided FFT band power, corrected by periodic-Hann power gain; 20log10(RMS), floored at -120 dBFS. DC and Nyquist excluded.',
  fluxDefinition: 'Unsmoothed sum of positive changes in coherent-gain-corrected magnitude across bins 1..1023 relative to previous 60Hz frame; first frame is zero.',
  sourceClock: 'Frame i is centered at i/60 seconds. Samples outside the decoded recording are zero-padded; RMS uses supported sample count. Final frame is before decoded end. Interpolate adjacent frames and clamp to final frame at media end. No source offset.',
  limitations: ['Centered 92.88ms windows include approximately 46.44ms of future/past audio; these are musical-response features, not syllable-onset evidence.', 'Explicit 0.5L + 0.5R mono fold-down can cancel antiphase stereo content. No vocal/instrument separation or beat labels are inferred.', 'Band normalization is artistic and source-specific. Spectral flux is not proof of a drum hit, a scene cut, a vocal attack or a lyric boundary.'],
  displayMapping,
};
const normalizedRms = rmsSeries.map(value => normalized(value, rmsRange));
const normalizedFlux = fluxSeries.map(value => normalized(value, fluxRange));
const saturation = (values: readonly number[]): number => values.filter(value => value >= 1).length / values.length;
const audit = {
  status: 'measured-musical-response-only',
  sourceSha256,
  dataSha256,
  frameCount,
  bytes: data.length,
  durationSeconds,
  lastFrameSeconds: (frameCount - 1) / fps,
  allScalarsFinite: true,
  rmsDbFS: describe(rmsSeries),
  rawFlux: describe(fluxSeries),
  normalizedRms: describe(normalizedRms),
  normalizedFlux: describe(normalizedFlux),
  upperSaturationFraction: {
    rms: saturation(normalizedRms), flux: saturation(normalizedFlux),
    bands: bandSeries.map((values, band) => saturation(values.map(value => normalized(value, bandRanges[band] ?? rmsRange)))),
  },
  eightSecondSections: Array.from({length: Math.ceil(durationSeconds / 8)}, (_, i) => {
    const begin = i * 8;
    const end = Math.min(durationSeconds, begin + 8);
    const values = rmsSeries.slice(Math.floor(begin * fps), Math.ceil(end * fps));
    return {start: begin, end, rmsDbFSMedian: quantile(values, 0.5), rmsDbFS90th: quantile(values, 0.9)};
  }),
  checks: ['Binary length equals frameCount × 26 × 4 bytes.', 'Every Float32LE scalar is finite.', 'All calibrated series have a nonzero display range.', 'Full decoded source is covered at 60Hz; no cropped analysis interval.', 'Upper clipping is limited by source-specific 99.5th-percentile scales instead of a fixed multiplier.'],
  limitations: metadata.limitations,
};
mkdirSync(path('../evidence/'), {recursive: true});
writeFileSync(binaryPath, data);
writeFileSync(metadataPath, JSON.stringify(metadata, null, 2) + '\n');
writeFileSync(auditPath, JSON.stringify(audit, null, 2) + '\n');
process.stdout.write(`${frameCount} frames × ${stride} Float32LE scalars; ${data.length} bytes; ${durationSeconds.toFixed(6)} seconds\n`);
