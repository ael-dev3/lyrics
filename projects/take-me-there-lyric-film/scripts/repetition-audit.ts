import {spawnSync} from 'node:child_process';
import {readFileSync, writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';

const path = (relative: string): string => fileURLToPath(new URL(relative, import.meta.url));
const stemPath = path('../analysis/transcription-pass-a/vocals16.wav');
const sampleRate = 4000;
const decoded = spawnSync('ffmpeg', ['-v', 'error', '-i', stemPath, '-af', 'highpass=f=100,lowpass=f=1800', '-ar', String(sampleRate), '-f', 'f32le', 'pipe:1'], {maxBuffer: 32 * 1024 * 1024});
if (decoded.status !== 0) throw new Error(decoded.stderr.toString());
const audio = Float64Array.from({length: decoded.stdout.length / 4}, (_, i) => decoded.stdout.readFloatLE(i * 4));
let fftSize = 1;
while (fftSize < audio.length + sampleRate * 3) fftSize *= 2;

function fft(real: Float64Array, imaginary: Float64Array, inverse = false): void {
  const size = real.length;
  let j = 0;
  for (let i = 1; i < size; i++) {
    let bit = size >> 1;
    while (j & bit) {j ^= bit; bit >>= 1;}
    j ^= bit;
    if (i < j) {
      const a = real[i] ?? 0, b = imaginary[i] ?? 0;
      real[i] = real[j] ?? 0; imaginary[i] = imaginary[j] ?? 0;
      real[j] = a; imaginary[j] = b;
    }
  }
  for (let length = 2; length <= size; length *= 2) {
    const angle = (inverse ? 2 : -2) * Math.PI / length;
    const factorReal = Math.cos(angle), factorImaginary = Math.sin(angle);
    for (let start = 0; start < size; start += length) {
      let wr = 1, wi = 0;
      for (let k = 0; k < length / 2; k++) {
        const a = start + k, b = a + length / 2;
        const ra = real[a] ?? 0, ia = imaginary[a] ?? 0;
        const rb = real[b] ?? 0, ib = imaginary[b] ?? 0;
        const tr = wr * rb - wi * ib, ti = wr * ib + wi * rb;
        real[a] = ra + tr; imaginary[a] = ia + ti;
        real[b] = ra - tr; imaginary[b] = ia - ti;
        const nextWr = wr * factorReal - wi * factorImaginary;
        wi = wr * factorImaginary + wi * factorReal; wr = nextWr;
      }
    }
  }
  if (inverse) for (let i = 0; i < size; i++) {
    real[i] = (real[i] ?? 0) / size; imaginary[i] = (imaginary[i] ?? 0) / size;
  }
}
const sourceReal = new Float64Array(fftSize);
sourceReal.set(audio);
const sourceImaginary = new Float64Array(fftSize);
fft(sourceReal, sourceImaginary);
const cumulativePower = new Float64Array(audio.length + 1);
for (let i = 0; i < audio.length; i++) cumulativePower[i + 1] = (cumulativePower[i] ?? 0) + (audio[i] ?? 0) ** 2;

interface Peak {start: number; end: number; correlation: number; relativeAmplitude: number}
function correlate(start: number, end: number, threshold: number, separation: number): Peak[] {
  const begin = Math.round(start * sampleRate), stop = Math.round(end * sampleRate);
  const length = stop - begin;
  const real = new Float64Array(fftSize), imaginary = new Float64Array(fftSize);
  let templatePower = 0;
  for (let i = 0; i < length; i++) {
    const sample = audio[begin + i] ?? 0;
    real[length - 1 - i] = sample; templatePower += sample * sample;
  }
  fft(real, imaginary);
  for (let i = 0; i < fftSize; i++) {
    const a = real[i] ?? 0, b = imaginary[i] ?? 0;
    const c = sourceReal[i] ?? 0, d = sourceImaginary[i] ?? 0;
    real[i] = a * c - b * d; imaginary[i] = a * d + b * c;
  }
  fft(real, imaginary, true);
  const candidates: Peak[] = [];
  for (let offset = 0; offset < audio.length - length; offset++) {
    const power = (cumulativePower[offset + length] ?? 0) - (cumulativePower[offset] ?? 0);
    if (power < templatePower * 0.0001) continue;
    const correlation = (real[offset + length - 1] ?? 0) / Math.sqrt(templatePower * power);
    if (correlation < threshold) continue;
    candidates.push({start: offset / sampleRate, end: (offset + length) / sampleRate, correlation, relativeAmplitude: Math.sqrt(power / templatePower)});
  }
  const selected: Peak[] = [];
  for (const candidate of candidates.sort((a, b) => b.correlation - a.correlation)) {
    if (selected.every(peak => Math.abs(peak.start - candidate.start) >= separation)) selected.push(candidate);
  }
  return selected.sort((a, b) => a.start - b.start).map(peak => ({...peak, correlation: +peak.correlation.toFixed(6), relativeAmplitude: +peak.relativeAmplitude.toFixed(6)}));
}

const templates = [
  {id: 'active-opening-lead', start: 0.50, end: 1.94, threshold: 0.23, separation: 1.5, rationale: 'Active opening phrase; stem RMS rises above 0.004 near0.50s and reaches0.03 by0.55s after low-level pre-roll. Establishes measured sample alignment, not a human-approved syllable onset.'},
  {id: 'opening-lead-phrase', start: 0.10, end: 1.96, threshold: 0.16, separation: 1.5, rationale: 'Initial user-transcribed Take me there lead. Window brackets the candidate speech found by Whisper, whose final token is incorrectly down. Template boundaries are analysis selections, not approved word boundaries.'},
  {id: 'opening-there-body', start: 1.40, end: 1.90, threshold: 0.16, separation: 0.16, rationale: 'Initial candidate there vowel/body. Short-window similarity can match delay copies but also similar unrelated vowels. Verify each candidate against transcript and wider context.'},
  {id: 'opening-take-body', start: 0.22, end: 0.72, threshold: 0.16, separation: 0.25, rationale: 'Early portion of the candidate take. Helps distinguish complete lead restarts from there-only echo tails.'},
  {id: 'active-take-body', start: 0.54, end: 0.94, threshold: 0.25, separation: 0.30, rationale: 'Active first take portion after quiet pre-roll. A waveform similarity candidate, not a new transcription.'},
  {id: 'short-take-probe', start: 0.54, end: 0.80, threshold: 0.30, separation: 0.18, rationale: 'Short Take candidate probe for chopped repeat region. Similarity is acoustic evidence only, not a new word count.'},
  {id: 'short-me-probe', start: 0.92, end: 1.20, threshold: 0.30, separation: 0.18, rationale: 'Broad me candidate body around the independent recognizer interval; may include preceding take vowel.'},
  {id: 'strict-me-probe', start: 1.06, end: 1.18, threshold: 0.42, separation: 0.14, rationale: 'Short me nucleus from stem MMS candidate; very short windows can match unrelated vowels and require context.'},
  {id: 'local-chopped-pair', start: 103.39, end: 104.23, threshold: 0.22, separation: 0.50, rationale: 'Local Take me candidate before the processed transition, avoiding dependence on the more distant opening mix.'},
  {id: 'local-transition-pair', start: 107.23, end: 108.12, threshold: 0.22, separation: 0.50, rationale: 'Local final strong Take me candidate at the transition; probe repeated later fragments independently of ASR labels.'},
  {id: 'there-short-body', start: 1.50, end: 1.73, threshold: 0.32, separation: 0.17, rationale: 'Short there-body template to flag chopped echo copies. High scores identify waveform similarity; not every voiced peak is a separate word.'},
  {id: 'closing-dreams-phrase', start: 121.48, end: 123.90, threshold: 0.20, separation: 2.0, rationale: 'First Dreams come true with you candidate phrase from independent forced alignment and ASR; maps later sample copies without equal spacing assumptions.'},
];
const evidence = templates.map(template => ({...template, matches: correlate(template.start, template.end, template.threshold, template.separation)}));

// Phase-invariant cross-check. Mean-centered log band energy is compared across
// time. Spectral similarity alone cannot decide whether a processed fragment is
// an intelligible word, but can detect sample-family matches missed by waveform.
const spectralFps = 100;
const spectralBands = 12;
const spectralSize = 256;
const spectralEdges = Array.from({length: spectralBands + 1}, (_, i) => 100 * 18 ** (i / spectralBands));
const spectralFrames = Math.ceil(audio.length / sampleRate * spectralFps);
const spectralFeatures = new Float64Array(spectralFrames * spectralBands);
const spectrumReal = new Float64Array(spectralSize), spectrumImaginary = new Float64Array(spectralSize);
for (let frame = 0; frame < spectralFrames; frame++) {
  const center = Math.round(frame / spectralFps * sampleRate);
  for (let i = 0; i < spectralSize; i++) {
    spectrumReal[i] = (audio[center + i - spectralSize / 2] ?? 0) * (0.5 - 0.5 * Math.cos(2 * Math.PI * i / spectralSize));
    spectrumImaginary[i] = 0;
  }
  fft(spectrumReal, spectrumImaginary);
  const energies = new Float64Array(spectralBands);
  for (let bin = 1; bin < spectralSize / 2; bin++) {
    const hz = bin * sampleRate / spectralSize;
    const band = spectralEdges.findIndex((edge, index) => index < spectralBands && hz >= edge && hz < (spectralEdges[index + 1] ?? 0));
    if (band >= 0) energies[band] = (energies[band] ?? 0) + (spectrumReal[bin] ?? 0) ** 2 + (spectrumImaginary[bin] ?? 0) ** 2;
  }
  const logEnergies = Array.from(energies, value => Math.log(Math.max(1e-7, value)));
  const mean = logEnergies.reduce((sum, value) => sum + value, 0) / spectralBands;
  for (let band = 0; band < spectralBands; band++) spectralFeatures[frame * spectralBands + band] = (logEnergies[band] ?? mean) - mean;
}
function spectralProbe(start: number, end: number): {start: number; end: number; cosine: number}[] {
  const templateFrame = Math.round(start * spectralFps);
  const length = Math.round((end - start) * spectralFps);
  const candidates: {start: number; end: number; cosine: number}[] = [];
  for (let frame = 103 * spectralFps; frame + length < Math.floor(121.464 * spectralFps); frame++) {
    let product = 0, powerA = 0, powerB = 0;
    for (let i = 0; i < length * spectralBands; i++) {
      const a = spectralFeatures[templateFrame * spectralBands + i] ?? 0;
      const b = spectralFeatures[frame * spectralBands + i] ?? 0;
      product += a * b; powerA += a * a; powerB += b * b;
    }
    const cosine = product / Math.max(1e-10, Math.sqrt(powerA * powerB));
    if (cosine >= 0.70) candidates.push({start: frame / spectralFps, end: (frame + length) / spectralFps, cosine: +cosine.toFixed(6)});
  }
  const selected: typeof candidates = [];
  for (const candidate of candidates.sort((a, b) => b.cosine - a.cosine)) {
    if (selected.every(other => Math.abs(other.start - candidate.start) >= 0.25)) selected.push(candidate);
  }
  return selected.sort((a, b) => a.start - b.start);
}
const chopProbes = templates.filter(template => ['short-take-probe', 'short-me-probe', 'strict-me-probe', 'there-short-body', 'local-chopped-pair', 'local-transition-pair'].includes(template.id)).map(template => ({
  template: {id: template.id, start: template.start, end: template.end},
  waveformMatches: evidence.find(item => item.id === template.id)?.matches.filter(match => match.start >= 103 && match.start < 121.464) ?? [],
  phaseInvariantSpectralMatches: spectralProbe(template.start, template.end),
}));
const phrase = evidence.find(item => item.id === 'active-opening-lead');
const take = evidence.find(item => item.id === 'active-take-body');
const corroboratedLeadRestarts = (take?.matches ?? []).filter(match => match.correlation >= 0.50).map(match => {
  const leadMatch = phrase?.matches.find(lead => Math.abs(lead.start - (match.start - 0.04)) < 0.12);
  return {
    templateBodyStart: match.start,
    initialOnsetTransferred: +(match.start - 0.04).toFixed(6),
    takeBodyCorrelation: match.correlation,
    fullPhraseCorrelation: leadMatch?.correlation ?? null,
    fullPhraseStart: leadMatch?.start ?? null,
    precisionLimit: 'Sample alignment is measured; subtracting0.04 transfers the provisional initial0.50s onset. Confirm initial and repeated phonetic boundaries independently.',
  };
});
const envelope = Array.from({length: Math.ceil(audio.length / sampleRate * 100)}, (_, frame) => {
  const start = Math.round(frame / 100 * sampleRate), end = Math.min(audio.length, start + sampleRate * 0.02);
  const power = (cumulativePower[end] ?? 0) - (cumulativePower[start] ?? 0);
  return {time: frame / 100, rms: +Math.sqrt(power / Math.max(1, end - start)).toFixed(7)};
});
const output = {
  sourceStemSha256: createHash('sha256').update(readFileSync(stemPath)).digest('hex'),
  sourceVideoSha256: createHash('sha256').update(readFileSync(path('../public/source.mp4'))).digest('hex'),
  method: 'Normalized waveform-template correlation using FFT convolution, actual full vocal stem; 100–1800Hz bandpass and 4000Hz resampling. Local maxima selected by correlation rank and minimum separation. Positive polarity matches only. No beat grid or proportional word spacing.',
  sampleRate,
  evidence,
  corroboratedLeadRestarts,
  closingPhraseMatches: (evidence.find(item => item.id === 'closing-dreams-phrase')?.matches ?? []).filter(match => match.start >= 119 && match.correlation >= 0.5),
  independentBoundaryComparison: {
    source: 'Parallel short-window MMS forced-alignment agent report, not a listening attestation.',
    initialTakeStart: 0.492,
    initialTakeNote: 'Both mix and stem short-window alignments start Take at0.492s, consistent with the waveform rise near0.50s. They disagree on me/there transitions, so only the repeated sample alignment is established here.',
    closingDreamsStarts: [121.464, 125.284, 129.104],
    closingNote: 'Independent stem forced alignment places the three Dreams starts within16ms of the selected template starts121.48,125.291,129.10225. This supports repeat placement but does not prove all internal word transitions.',
  },
  echoAssessment: 'No final echo word intervals emitted. There-only waveform candidates include similar vowels and variable separation artifacts, and do not establish a reliable six-echo count. Preserve the candidates for review instead of inventing proportional subdivisions.',
  openingEnvelope: envelope.filter(frame => frame.time < 3),
  limitations: ['Waveform similarity is repetition evidence, not phonetic transcription or proof of a word boundary.', 'Demucs separation and changing accompaniment can reduce correlation even for the same performed sample. Pitch/time transformations may evade a fixed template.', 'Echo candidates overlap reverberation; threshold is deliberately permissive and matches require editorial review.', 'Window start is the shifted template start; the actual syllable onset lies inside it, as in the opening template.'],
};
writeFileSync(path('../analysis/repetition-evidence.json'), JSON.stringify(output, null, 2) + '\n');
writeFileSync(path('../analysis/chop-evidence.json'), JSON.stringify({
  sourceStemSha256: output.sourceStemSha256,
  region: [103, 121.464],
  waveformMethod: output.method,
  spectralMethod: '12 logarithmic bands100–1800Hz; centered256-sample Hann FFT at4kHz (64ms support),100Hz analysis clock. Log band energies are centered by each frame mean. Cosine similarity of complete template time-frequency patches; peaks at least250ms apart. Phase invariant, but neither phonetic classification nor a word-count model.',
  probes: chopProbes,
  conclusion: {
    stableTransitionTake: 107.253,
    stableTransitionTakeScore: 0.753113,
    localEarlierPairCandidates: [103.39, 104.335, 105.2635, 106.17475],
    noAdditionalTakeTemplateWaveformMatchAbove0_50After107: true,
    finalPerformedWordCount: null,
    laterReviewWindows: [[110.75, 111.55], [112.50, 113.00], [113.95, 114.95], [116.00, 116.80], [117.65, 118.75], [119.20, 121.45]],
    note: 'Short Take-template waveform correlation has no later match above0.50 before121.464. Short me-like nuclei and phase-invariant spectral matches continue, but do not establish complete Take me phrases or a trailing intelligible there. The user transcript count and recognizer expansion remain separate hypotheses.',
    spectralCaution: 'Spectral cosine stays high for many overlapping candidates from different word templates (selected-peak medians approximately0.83–0.87), reflecting shared vocal spectral color. It is therefore not a discriminative phonetic classifier here; high cosine does not resolve the count.',
  },
  limitations: output.limitations,
}, null, 2) + '\n');
for (const result of evidence) process.stdout.write(`${result.id}: ${result.matches.length} candidate matches\n`);
