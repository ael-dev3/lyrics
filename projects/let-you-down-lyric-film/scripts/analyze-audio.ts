import {createHash} from 'node:crypto';
import {existsSync, mkdirSync, readFileSync, writeFileSync} from 'node:fs';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';

// Measured musical response on the locked source clock. Frame i is centred at
// i/60 s. The binary keeps raw dBFS/flux values; display ranges are metadata.
// These values drive light and the spectrum only. They never assign a lyric time.
const path = (relative: string): string => fileURLToPath(new URL(relative, import.meta.url));
const source = path('../public/source.mp4');
const stem = path('../analysis/stems/vocals.wav');
const binaryPath = path('../public/audio-features.bin');
const metadataPath = path('../public/audio-features.json');
const auditPath = path('../evidence/audio-features-audit.json');
export const SAMPLE_RATE = 44100, FPS = 60, FFT = 4096, BANDS = 48, LOW_HZ = 40, HIGH_HZ = 15000;
export const FIELDS = 3 + BANDS; // rms, flux, vocal rms, bands
const floorDb = -120;

const sha256 = (data: Uint8Array): string => createHash('sha256').update(data).digest('hex');
function quantile(values: ArrayLike<number>, fraction: number): number {
  const sorted = Float64Array.from(values).sort();
  const index = (sorted.length - 1) * fraction, lower = sorted[Math.floor(index)] ?? 0, upper = sorted[Math.ceil(index)] ?? lower;
  return lower + (upper - lower) * (index - Math.floor(index));
}
function range(values: ArrayLike<number>, lower: number, upper: number): {minimum: number; maximum: number} {
  const minimum = quantile(values, lower), maximum = quantile(values, upper);
  if (!(maximum > minimum + 1e-6)) throw Error('Feature series has no usable variation');
  return {minimum, maximum};
}
const db = (amplitude: number): number => Math.max(floorDb, 20 * Math.log10(Math.max(1e-12, amplitude)));
function decode(file: string, filter: string): Float32Array {
  const out = spawnSync('ffmpeg', ['-v', 'error', '-nostdin', '-i', file, '-map', '0:a:0', '-af', filter, '-ar', String(SAMPLE_RATE), '-f', 'f32le', 'pipe:1'], {maxBuffer: 512 * 1024 * 1024});
  if (out.status !== 0) throw Error(`Decode failed: ${out.stderr.toString()}`);
  const bytes = out.stdout;
  return new Float32Array(bytes.buffer, bytes.byteOffset, bytes.byteLength / 4).slice();
}
function fft(real: Float64Array, imag: Float64Array): void {
  const n = real.length;
  for (let i = 1, j = 0; i < n; i++) {
    let bit = n >> 1;
    for (; j & bit; bit >>= 1) j ^= bit;
    j ^= bit;
    if (i < j) {const r = real[i]!; real[i] = real[j]!; real[j] = r; const m = imag[i]!; imag[i] = imag[j]!; imag[j] = m;}
  }
  for (let len = 2; len <= n; len <<= 1) {
    const angle = -2 * Math.PI / len, wr0 = Math.cos(angle), wi0 = Math.sin(angle);
    for (let start = 0; start < n; start += len) {
      let wr = 1, wi = 0;
      for (let k = 0; k < len / 2; k++) {
        const a = start + k, b = a + len / 2;
        const tr = wr * real[b]! - wi * imag[b]!, ti = wr * imag[b]! + wi * real[b]!;
        real[b] = real[a]! - tr; imag[b] = imag[a]! - ti; real[a] = real[a]! + tr; imag[a] = imag[a]! + ti;
        const next = wr * wr0 - wi * wi0; wi = wr * wi0 + wi * wr0; wr = next;
      }
    }
  }
}

// Equal-weight mono fold-down; antiphase stereo content can cancel. Documented.
const mix = decode(source, 'pan=mono|c0=0.5*c0+0.5*c1');
if (!existsSync(stem)) throw Error('analysis/stems/vocals.wav is required (run analysis/separate_stems.py first)');
const vocal = decode(stem, 'pan=mono|c0=0.5*c0+0.5*c1');
const samples = mix.length, durationSeconds = samples / SAMPLE_RATE, frameCount = Math.ceil(durationSeconds * FPS);
if (Math.abs(vocal.length - samples) > SAMPLE_RATE * 0.05) throw Error(`Vocal stem length ${vocal.length} differs from mix ${samples}`);
const window = Float64Array.from({length: FFT}, (_, i) => 0.5 - 0.5 * Math.cos(2 * Math.PI * i / FFT));
const windowPower = window.reduce((sum, v) => sum + v * v, 0) / FFT;
const coherent = window.reduce((sum, v) => sum + v, 0) / FFT;
const edges = Array.from({length: BANDS + 1}, (_, i) => LOW_HZ * (HIGH_HZ / LOW_HZ) ** (i / BANDS));
const binBand = Int16Array.from({length: FFT / 2}, (_, bin) => {
  const f = bin * SAMPLE_RATE / FFT;
  return edges.findIndex((edge, i) => i < BANDS && f >= edge && f < (edges[i + 1] ?? 0));
});
// Very low bands contain fewer than one FFT bin each; they borrow the nearest bin
// so every band is measured. Record which bands are interpolated.
const bandBins: number[][] = Array.from({length: BANDS}, () => []);
binBand.forEach((band, bin) => {if (band >= 0 && bin > 0) bandBins[band]?.push(bin);});
const borrowed: number[] = [];
bandBins.forEach((bins, band) => {
  if (bins.length) return;
  const centre = Math.sqrt((edges[band] ?? 1) * (edges[band + 1] ?? 1));
  bins.push(Math.max(1, Math.round(centre * FFT / SAMPLE_RATE))); borrowed.push(band);
});
const data = Buffer.alloc(frameCount * FIELDS * 4);
const series: Float64Array[] = Array.from({length: FIELDS}, () => new Float64Array(frameCount));
const real = new Float64Array(FFT), imag = new Float64Array(FFT), previous = new Float64Array(FFT / 2);
for (let frame = 0; frame < frameCount; frame++) {
  const centre = Math.round(frame * SAMPLE_RATE / FPS);
  let power = 0, vocalPower = 0, supported = 0;
  for (let i = 0; i < FFT; i++) {
    const index = centre + i - FFT / 2, inside = index >= 0 && index < samples;
    const x = inside ? mix[index]! : 0, v = inside ? (vocal[index] ?? 0) : 0;
    power += x * x; vocalPower += v * v; if (inside) supported++;
    real[i] = x * window[i]!; imag[i] = 0;
  }
  fft(real, imag);
  const magnitude = new Float64Array(FFT / 2);
  let flux = 0;
  for (let bin = 1; bin < FFT / 2; bin++) {
    const m = Math.hypot(real[bin]!, imag[bin]!);
    magnitude[bin] = m;
    const normalized = m / (FFT * coherent / 2);
    flux += Math.max(0, normalized - previous[bin]!); previous[bin] = normalized;
  }
  const values = [db(Math.sqrt(power / Math.max(1, supported))), frame === 0 ? 0 : flux, db(Math.sqrt(vocalPower / Math.max(1, supported)))];
  for (const bins of bandBins) {
    let bandPower = 0;
    for (const bin of bins) bandPower += magnitude[bin]! * magnitude[bin]!;
    values.push(db(Math.sqrt(2 * bandPower / (FFT * FFT * windowPower))));
  }
  values.forEach((value, field) => {
    if (!Number.isFinite(value)) throw Error(`Non-finite feature ${field} at frame ${frame}`);
    series[field]![frame] = value; data.writeFloatLE(value, (frame * FIELDS + field) * 4);
  });
}
const rms = range(series[0]!, 0.10, 0.995), flux = range(series[1]!, 0.50, 0.995), vocalRms = range(series[2]!, 0.30, 0.995);
const bands = Array.from({length: BANDS}, (_, band) => range(series[3 + band]!, 0.10, 0.995));
const displayMapping = {
  formula: 'clamp((raw - minimum) / (maximum - minimum), 0, 1)',
  rmsDb: {...rms, percentiles: [0.10, 0.995]},
  flux: {...flux, percentiles: [0.50, 0.995]},
  vocalRmsDb: {...vocalRms, percentiles: [0.30, 0.995]},
  bandsDb: bands.map(r => ({...r, percentiles: [0.10, 0.995]})),
  note: 'Source-specific artistic scaling, not loudness units. Raw dBFS stays in the binary. Any smoothing, section tiers or display curves belong to scene code on the source clock, never to lyric timing.',
};
const stemIdentity = sha256(readFileSync(stem));
const metadata = {
  version: 1, sourceSha256: sha256(readFileSync(source)), vocalStemSha256: stemIdentity, dataSha256: sha256(data), dataFile: 'audio-features.bin',
  analysisSampleRate: SAMPLE_RATE, decodedSamples: samples, durationSeconds, framesPerSecond: FPS, frameCount, fftSize: FFT,
  window: 'periodic Hann', supportSeconds: FFT / SAMPLE_RATE, bandCount: BANDS, bandEdgesHz: edges, borrowedSingleBinBands: borrowed,
  format: 'Float32LE interleaved', scalarsPerFrame: FIELDS, bytesPerFrame: FIELDS * 4,
  fields: ['rmsDbFS', 'positiveMagnitudeFlux', 'vocalStemRmsDbFS', ...Array.from({length: BANDS}, (_, i) => `band${i}DbFS`)],
  sourceClock: 'Frame i is centred at i/60 s on the original AAC decode (no offset). Interpolate adjacent frames; clamp at the ends.',
  limitations: [
    'Centred 92.9 ms windows include about 46 ms of future and past audio: musical response only, never syllable-onset evidence.',
    'Equal-weight mono fold-down can cancel antiphase stereo content.',
    'The vocal field is measured on an estimated HTDemucs stem that leaks accompaniment; it scales artistic intensity only.',
    'Bands below about 120 Hz contain one or two FFT bins; their motion is coarse by construction.',
  ],
  displayMapping,
};
const norm = (v: number, r: {minimum: number; maximum: number}): number => Math.max(0, Math.min(1, (v - r.minimum) / (r.maximum - r.minimum)));
const audit = {
  status: 'measured-musical-response-only', sourceSha256: metadata.sourceSha256, vocalStemSha256: stemIdentity, dataSha256: metadata.dataSha256,
  frameCount, bytes: data.length, durationSeconds, allScalarsFinite: true,
  rmsDbFS: {p10: quantile(series[0]!, .1), p50: quantile(series[0]!, .5), p90: quantile(series[0]!, .9), max: quantile(series[0]!, 1)},
  vocalRmsDbFS: {p10: quantile(series[2]!, .1), p50: quantile(series[2]!, .5), p90: quantile(series[2]!, .9), max: quantile(series[2]!, 1)},
  upperSaturationFraction: {rms: Array.from(series[0]!).filter(v => norm(v, rms) >= 1).length / frameCount, bands: bands.map((r, b) => Array.from(series[3 + b]!).filter(v => norm(v, r) >= 1).length / frameCount)},
  fourSecondSections: Array.from({length: Math.ceil(durationSeconds / 4)}, (_, i) => {
    const a = Math.floor(i * 4 * FPS), b = Math.min(frameCount, Math.ceil((i + 1) * 4 * FPS));
    return {start: i * 4, rmsDbMedian: +quantile(series[0]!.subarray(a, b), .5).toFixed(2), vocalDbMedian: +quantile(series[2]!.subarray(a, b), .5).toFixed(2), vocalDb90: +quantile(series[2]!.subarray(a, b), .9).toFixed(2)};
  }),
  checks: [`Binary length equals frameCount × ${FIELDS} × 4 bytes.`, 'Every scalar is finite.', 'Every calibrated series has a nonzero display range.', 'The full decoded recording is covered at 60 Hz.'],
  limitations: metadata.limitations,
};
mkdirSync(path('../evidence/'), {recursive: true});
writeFileSync(binaryPath, data);
writeFileSync(metadataPath, JSON.stringify(metadata, null, 2) + '\n');
writeFileSync(auditPath, JSON.stringify(audit, null, 2) + '\n');
console.log(`${frameCount} frames × ${FIELDS} scalars; ${data.length} bytes; ${durationSeconds.toFixed(6)} s; borrowed bands ${borrowed.join(',') || 'none'}`);
