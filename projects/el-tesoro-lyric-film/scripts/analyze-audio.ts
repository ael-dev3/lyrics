import {createHash} from 'node:crypto';
import {readFileSync, writeFileSync} from 'node:fs';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';

const source = fileURLToPath(new URL('../public/source.mp4', import.meta.url));
const output = fileURLToPath(new URL('../public/audio-features.bin', import.meta.url));
const metadataOutput = fileURLToPath(new URL('../public/audio-features.json', import.meta.url));
const sourceHash = createHash('sha256').update(readFileSync(source)).digest('hex');
const sampleRate = 22050;
const fps = 60;
const fftSize = 2048;
const bandCount = 24;
const result = spawnSync('ffmpeg', [
  '-v', 'error', '-i', source, '-map', '0:a:0', '-ac', '1', '-ar', String(sampleRate),
  '-f', 'f32le', 'pipe:1',
], {maxBuffer: 64 * 1024 * 1024});
if (result.status !== 0) throw new Error(`Audio decode failed: ${result.stderr.toString()}`);
const bytes = result.stdout;
const audio = new Float32Array(bytes.buffer, bytes.byteOffset, Math.floor(bytes.byteLength / 4));
const frameCount = Math.ceil(audio.length / sampleRate * fps);
const stride = bandCount + 2;
const data = Buffer.alloc(frameCount * stride);
const real = new Float64Array(fftSize);
const imag = new Float64Array(fftSize);
const window = Float64Array.from({length: fftSize}, (_, i) => 0.5 - 0.5 * Math.cos(2 * Math.PI * i / fftSize));
const edges = Float64Array.from({length: bandCount + 1}, (_, i) => 55 * Math.pow(10000 / 55, i / bandCount));
const previous = new Float64Array(fftSize / 2);
const rawFlux = new Float64Array(frameCount);

function fft(re: Float64Array, im: Float64Array): void {
  let j = 0;
  for (let i = 1; i < fftSize; i++) {
    let bit = fftSize >> 1;
    while (j & bit) {j ^= bit; bit >>= 1;}
    j ^= bit;
    if (i < j) {
      [re[i], re[j]] = [re[j]!, re[i]!];
      [im[i], im[j]] = [im[j]!, im[i]!];
    }
  }
  for (let length = 2; length <= fftSize; length <<= 1) {
    const angle = -2 * Math.PI / length;
    for (let start = 0; start < fftSize; start += length) {
      for (let k = 0; k < length / 2; k++) {
        const wr = Math.cos(angle * k), wi = Math.sin(angle * k);
        const a = start + k, b = a + length / 2;
        const tr = wr * re[b]! - wi * im[b]!;
        const ti = wr * im[b]! + wi * re[b]!;
        re[b] = re[a]! - tr;
        im[b] = im[a]! - ti;
        re[a] = re[a]! + tr;
        im[a] = im[a]! + ti;
      }
    }
  }
}
const byte = (db: number): number => Math.round(Math.max(0, Math.min(1, (db + 90) / 90)) * 255);
let previousFlux = 0;
for (let frame = 0; frame < frameCount; frame++) {
  const center = Math.round(frame * sampleRate / fps);
  let square = 0;
  for (let i = 0; i < fftSize; i++) {
    const sample = audio[center + i - fftSize / 2] ?? 0;
    square += sample * sample;
    real[i] = sample * window[i]!;
    imag[i] = 0;
  }
  fft(real, imag);
  const offset = frame * stride;
  data[offset] = byte(20 * Math.log10(Math.max(1e-8, Math.sqrt(square / fftSize))));
  const sums = new Float64Array(bandCount);
  const counts = new Uint16Array(bandCount);
  let flux = 0;
  for (let bin = 1; bin < fftSize / 2; bin++) {
    const frequency = bin * sampleRate / fftSize;
    const magnitude = Math.hypot(real[bin]!, imag[bin]!) / (fftSize / 2);
    flux += Math.max(0, magnitude - previous[bin]!);
    previous[bin] = magnitude;
    for (let band = 0; band < bandCount; band++) {
      if (frequency >= edges[band]! && frequency < edges[band + 1]!) {
        sums[band] += magnitude * magnitude;
        counts[band]++;
        break;
      }
    }
  }
  const smoothedFlux = 0.32 * flux + 0.68 * previousFlux;
  previousFlux = smoothedFlux;
  rawFlux[frame] = smoothedFlux;
  for (let band = 0; band < bandCount; band++) {
    const rms = Math.sqrt(sums[band]! / Math.max(1, counts[band]!));
    data[offset + 2 + band] = byte(20 * Math.log10(Math.max(1e-8, rms)));
  }
}
// Calibrate transient response against this locked recording. A fixed multiplier
// clips nearly every frame of this dense mix and produces a constant glint.
const sortedFlux = Float64Array.from(rawFlux).sort();
const quantile = (fraction: number): number => sortedFlux[Math.floor((frameCount - 1) * fraction)]!;
const fluxFloor = quantile(0.10);
const fluxCeiling = quantile(0.98);
if (!(fluxCeiling > fluxFloor)) throw Error('No usable spectral-flux variation');
for (let frame = 0; frame < frameCount; frame++) {
  const normalized = (rawFlux[frame]! - fluxFloor) / (fluxCeiling - fluxFloor);
  data[frame * stride + 1] = Math.round(Math.max(0, Math.min(1, normalized)) * 255);
}
writeFileSync(output, data);
const metadata = {
  sourceSha256: sourceHash,
  analysisSampleRate: sampleRate,
  decodedSamples: audio.length,
  framesPerSecond: fps,
  frameCount,
  fftSize,
  window: 'periodic Hann',
  supportSeconds: fftSize / sampleRate,
  bandCount,
  bandEdgesHz: Array.from(edges),
  format: 'Uint8 interleaved [window RMS, positive spectral flux, 24 log-frequency band RMS]',
  bandScale: 'dBFS mapped linearly from -90 to 0 dBFS; 0–255',
  fluxScale: 'positive magnitude difference with 0.32/0.68 smoothing; 10th-to-98th percentile normalization of this source, clipped to 0–255',
  fluxFloor,
  fluxCeiling,
  sourceClock: 'Frame i is centered at i / 60 seconds; features are musical response inputs, not vocal-boundary evidence.',
  dataSha256: createHash('sha256').update(data).digest('hex'),
};
writeFileSync(metadataOutput, JSON.stringify(metadata, null, 2) + '\n');
process.stdout.write(`${frameCount} frames, ${audio.length} decoded analysis samples, ${data.length} bytes\n`);
