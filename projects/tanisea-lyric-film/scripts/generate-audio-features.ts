import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import {tmpdir} from 'node:os';
import {join, resolve} from 'node:path';

const FPS = 60;
const DURATION_SECONDS = 153;
const FRAME_COUNT = FPS * DURATION_SECONDS;
const SAMPLE_RATE = 44_100;
const BAND_COUNT = 64;
const HEADER_SIZE = 32;
const RECORD_SIZE = BAND_COUNT + 7 + 4;
const FREQUENCY_MIN = 20;
const FREQUENCY_MAX = 20_000;

type Accent = Readonly<{
  id: string;
  start: number;
  apex: number;
  end: number;
  intensity: number;
  reason: string;
}>;

const accents: readonly Accent[] = [
  {
    id: 'chorus-title-01',
    start: 37.03,
    apex: 38.43,
    end: 40.08,
    intensity: 0.84,
    reason: 'First complete title phrase',
  },
  {
    id: 'verse-night',
    start: 64.06,
    apex: 65.98,
    end: 67.13,
    intensity: 0.34,
    reason: 'Quiet emotional hold without fabricated loudness',
  },
  {
    id: 'chorus-title-02',
    start: 104.26,
    apex: 105.67,
    end: 107.32,
    intensity: 0.98,
    reason: 'Repeated title phrase and principal vocal peak',
  },
  {
    id: 'outro-handoff',
    start: 113.81,
    apex: 116.05,
    end: 118.2,
    intensity: 0.9,
    reason: 'Final clear lyric resolving into the original-title state',
  },
  {
    id: 'original-title-reveal',
    start: 117.98,
    apex: 118.2,
    end: 119.1,
    intensity: 0.72,
    reason: 'Original Russian title transition on the reviewed outro accent',
  },
];

const clamp = (value: number, minimum = 0, maximum = 1): number =>
  Math.min(maximum, Math.max(minimum, value));

const smoothstep = (edge0: number, edge1: number, value: number): number => {
  if (edge1 <= edge0) return value >= edge1 ? 1 : 0;
  const normalized = clamp((value - edge0) / (edge1 - edge0));
  return normalized * normalized * (3 - 2 * normalized);
};

const quantizeUnit = (value: number): number =>
  Math.round(clamp(value) * 255);

const round = (value: number, digits = 4): number => {
  const scale = 10 ** digits;
  return Math.round(value * scale) / scale;
};

const percentile = (values: readonly number[], proportion: number): number => {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const position = clamp(proportion) * (sorted.length - 1);
  const lower = Math.floor(position);
  const upper = Math.ceil(position);
  const fraction = position - lower;
  const a = sorted[lower] ?? sorted[0] ?? 0;
  const b = sorted[upper] ?? sorted.at(-1) ?? a;
  return a + (b - a) * fraction;
};

const sha256 = (data: Uint8Array): string =>
  createHash('sha256').update(data).digest('hex');

const root = resolve(__dirname, '..');
const audioPath = join(root, 'public', 'soundtrack.m4a');
const outputPath = join(root, 'public', 'audio-features.bin');
const manifestPath = join(root, 'public', 'audio-features.manifest.json');
const temporaryDirectory = mkdtempSync(join(tmpdir(), 'tanisea-features-'));
const pcmPath = join(temporaryDirectory, 'soundtrack.f32le');
const spectrumPath = join(temporaryDirectory, 'spectrum.gray');

try {
  execFileSync(
    'ffmpeg',
    [
      '-v',
      'error',
      '-i',
      audioPath,
      '-f',
      'f32le',
      '-acodec',
      'pcm_f32le',
      '-ac',
      '2',
      '-ar',
      String(SAMPLE_RATE),
      pcmPath,
      '-y',
    ],
    {stdio: ['ignore', 'ignore', 'inherit']},
  );

  execFileSync(
    'ffmpeg',
    [
      '-v',
      'error',
      '-i',
      audioPath,
      '-lavfi',
      [
        `showspectrumpic=s=${FRAME_COUNT}x${BAND_COUNT}`,
        'mode=combined',
        'color=intensity',
        'scale=log',
        'fscale=log',
        'win_func=hann',
        'legend=0',
        `start=${FREQUENCY_MIN}`,
        `stop=${FREQUENCY_MAX}`,
        'drange=80',
        'limit=0',
      ].join(':'),
      '-frames:v',
      '1',
      '-pix_fmt',
      'gray',
      '-f',
      'rawvideo',
      spectrumPath,
      '-y',
    ],
    {stdio: ['ignore', 'ignore', 'inherit']},
  );

  const audioBytes = readFileSync(audioPath);
  const pcmBytes = readFileSync(pcmPath);
  const spectrumBytes = readFileSync(spectrumPath);

  if (pcmBytes.length % 8 !== 0) {
    throw new Error(`PCM byte count ${pcmBytes.length} is not stereo float32`);
  }

  if (spectrumBytes.length !== FRAME_COUNT * BAND_COUNT) {
    throw new Error(
      `Expected ${FRAME_COUNT * BAND_COUNT} spectrum bytes, received ${spectrumBytes.length}`,
    );
  }

  const pcm = new Float32Array(
    pcmBytes.buffer,
    pcmBytes.byteOffset,
    pcmBytes.length / Float32Array.BYTES_PER_ELEMENT,
  );
  const sampleCount = pcm.length / 2;
  const powerPrefix = new Float64Array(sampleCount + 1);

  for (let sample = 0; sample < sampleCount; sample++) {
    const left = pcm[sample * 2] ?? 0;
    const right = pcm[sample * 2 + 1] ?? 0;
    const stereoPower = (left * left + right * right) / 2;
    powerPrefix[sample + 1] = (powerPrefix[sample] ?? 0) + stereoPower;
  }

  const powerDb = (centerSample: number, halfWindow: number): number => {
    const start = Math.max(0, centerSample - halfWindow);
    const end = Math.min(sampleCount, centerSample + halfWindow);
    const count = Math.max(1, end - start);
    const sum = (powerPrefix[end] ?? 0) - (powerPrefix[start] ?? 0);
    return 10 * Math.log10(Math.max(sum / count, 1e-12));
  };

  const momentaryDb = new Float64Array(FRAME_COUNT);
  const shortDb = new Float64Array(FRAME_COUNT);
  const peakDb = new Float64Array(FRAME_COUNT);
  const lowRaw = new Float64Array(FRAME_COUNT);
  const brightnessRaw = new Float64Array(FRAME_COUNT);
  const fluxRaw = new Float64Array(FRAME_COUNT);

  const spectrumValue = (frame: number, lowToHighBand: number): number => {
    const imageRow = BAND_COUNT - 1 - lowToHighBand;
    return spectrumBytes[imageRow * FRAME_COUNT + frame] ?? 0;
  };

  for (let frame = 0; frame < FRAME_COUNT; frame++) {
    const centerSample = Math.round((frame / FPS) * SAMPLE_RATE);
    momentaryDb[frame] = powerDb(centerSample, Math.round(SAMPLE_RATE * 0.2));
    shortDb[frame] = powerDb(centerSample, Math.round(SAMPLE_RATE * 0.0125));

    const frameStart = Math.max(0, Math.floor((frame / FPS) * SAMPLE_RATE));
    const frameEnd = Math.min(
      sampleCount,
      Math.floor(((frame + 1) / FPS) * SAMPLE_RATE),
    );
    let framePeak = 0;
    for (let sample = frameStart; sample < frameEnd; sample++) {
      framePeak = Math.max(
        framePeak,
        Math.abs(pcm[sample * 2] ?? 0),
        Math.abs(pcm[sample * 2 + 1] ?? 0),
      );
    }
    peakDb[frame] = 20 * Math.log10(Math.max(framePeak, 1e-6));

    let low = 0;
    let high = 0;
    let total = 0;
    let positiveFlux = 0;

    for (let band = 0; band < BAND_COUNT; band++) {
      const current = spectrumValue(frame, band) / 255;
      const previous = frame > 0 ? spectrumValue(frame - 1, band) / 255 : current;
      total += current;
      if (band <= 21) low += current;
      if (band >= 48) high += current;
      positiveFlux += Math.max(0, current - previous);
    }

    lowRaw[frame] = low / 22;
    brightnessRaw[frame] = high / Math.max(total, 1e-6);
    const previousShort = frame > 0 ? shortDb[frame - 1] ?? shortDb[frame] : shortDb[frame];
    const levelRise = Math.max(0, (shortDb[frame] ?? -120) - (previousShort ?? -120));
    fluxRaw[frame] = positiveFlux / BAND_COUNT + levelRise / 48;
  }

  const activeMomentary = [...momentaryDb].filter((value) => value > -60);
  const activeLow = [...lowRaw].filter((_, frame) => (momentaryDb[frame] ?? -120) > -60);
  const activeBrightness = [...brightnessRaw].filter(
    (_, frame) => (momentaryDb[frame] ?? -120) > -60,
  );
  const activeFlux = [...fluxRaw].filter((_, frame) => (momentaryDb[frame] ?? -120) > -60);

  const loudnessPercentiles = {
    p50: percentile(activeMomentary, 0.5),
    p60: percentile(activeMomentary, 0.6),
    p85: percentile(activeMomentary, 0.85),
    p95: percentile(activeMomentary, 0.95),
    p96: percentile(activeMomentary, 0.96),
    p99: percentile(activeMomentary, 0.99),
  };
  const fluxP80 = percentile(activeFlux, 0.8);
  const fluxP99 = percentile(activeFlux, 0.99);
  const lowP50 = percentile(activeLow, 0.5);
  const lowP98 = percentile(activeLow, 0.98);
  const brightnessP20 = percentile(activeBrightness, 0.2);
  const brightnessP95 = percentile(activeBrightness, 0.95);

  const pressure = new Float64Array(FRAME_COUNT);
  const normalizedImpact = new Float64Array(FRAME_COUNT);
  const impact = new Float64Array(FRAME_COUNT);
  const lowEnd = new Float64Array(FRAME_COUNT);
  const brightness = new Float64Array(FRAME_COUNT);
  const emotion = new Float64Array(FRAME_COUNT);
  const hero = new Float64Array(FRAME_COUNT);
  const reach = new Float64Array(FRAME_COUNT);

  let pressureState = 0;
  const attackAlpha = 1 - Math.exp(-(1 / FPS) / 0.08);
  const releaseAlpha = 1 - Math.exp(-(1 / FPS) / 0.36);

  for (let frame = 0; frame < FRAME_COUNT; frame++) {
    const target = smoothstep(
      loudnessPercentiles.p60,
      loudnessPercentiles.p96,
      momentaryDb[frame] ?? -120,
    ) ** 1.35;
    const alpha = target > pressureState ? attackAlpha : releaseAlpha;
    pressureState += (target - pressureState) * alpha;
    pressure[frame] = clamp(pressureState);
    normalizedImpact[frame] =
      smoothstep(fluxP80, fluxP99, fluxRaw[frame] ?? 0) ** 1.7;
    lowEnd[frame] = smoothstep(lowP50, lowP98, lowRaw[frame] ?? 0);
    brightness[frame] = smoothstep(
      brightnessP20,
      brightnessP95,
      brightnessRaw[frame] ?? 0,
    );
  }

  const transientEvents: Array<{frame: number; strength: number}> = [];
  for (let frame = 2; frame < FRAME_COUNT - 2; frame++) {
    const strength = normalizedImpact[frame] ?? 0;
    if (strength < 0.08) continue;
    const localMaximum =
      strength >= (normalizedImpact[frame - 1] ?? 0) &&
      strength >= (normalizedImpact[frame - 2] ?? 0) &&
      strength >= (normalizedImpact[frame + 1] ?? 0) &&
      strength >= (normalizedImpact[frame + 2] ?? 0);
    if (!localMaximum) continue;

    const previousEvent = transientEvents.at(-1);
    if (previousEvent && frame - previousEvent.frame < 8) {
      if (strength > previousEvent.strength) {
        transientEvents[transientEvents.length - 1] = {frame, strength};
      }
      continue;
    }
    transientEvents.push({frame, strength});
  }

  for (const event of transientEvents) {
    for (let offset = -2; offset <= 16; offset++) {
      const frame = event.frame + offset;
      if (frame < 0 || frame >= FRAME_COUNT) continue;
      const shape =
        offset < 0
          ? ((offset + 2) / 2) ** 2
          : Math.exp(-offset / 7);
      impact[frame] = Math.max(impact[frame] ?? 0, event.strength * shape);
    }
  }

  for (let frame = 0; frame < FRAME_COUNT; frame++) {
    const time = frame / FPS;
    let emotionalValue = 0;
    for (const accent of accents) {
      if (time < accent.start || time > accent.end) continue;
      const normalized =
        time <= accent.apex
          ? (time - accent.start) / Math.max(0.001, accent.apex - accent.start)
          : (accent.end - time) / Math.max(0.001, accent.end - accent.apex);
      const shaped = Math.sin(clamp(normalized) * Math.PI * 0.5) ** 2;
      emotionalValue = Math.max(emotionalValue, shaped * accent.intensity);
    }
    emotion[frame] = emotionalValue;

    const loudHero = smoothstep(
      loudnessPercentiles.p95,
      loudnessPercentiles.p99,
      momentaryDb[frame] ?? -120,
    );
    const authoredHero =
      0.6 * smoothstep(0.9, 0.98, emotionalValue);
    const combinedHero =
      Math.max(
        loudHero * Math.max(impact[frame] ?? 0, emotionalValue),
        authoredHero,
      ) +
      0.15 * loudHero * emotionalValue;
    hero[frame] = clamp(
      combinedHero,
    );

    const baseReach = Math.max(
      (pressure[frame] ?? 0) ** 1.45,
      0.72 * (impact[frame] ?? 0) ** 1.8,
      0.9 * emotionalValue ** 1.25,
    );
    reach[frame] = clamp(baseReach + 0.08 * emotionalValue);
  }

  const output = Buffer.alloc(HEADER_SIZE + FRAME_COUNT * RECORD_SIZE);
  output.write('TLVF', 0, 'ascii');
  output.writeUInt16LE(1, 4);
  output.writeUInt16LE(HEADER_SIZE, 6);
  output.writeUInt32LE(FRAME_COUNT, 8);
  output.writeUInt16LE(FPS, 12);
  output.writeUInt16LE(BAND_COUNT, 14);
  output.writeUInt32LE(SAMPLE_RATE, 16);
  output.writeUInt16LE(RECORD_SIZE, 20);
  output.writeUInt16LE(0, 22);
  Buffer.from(sha256(audioBytes).slice(0, 16), 'hex').copy(output, 24);

  let heroFrames = 0;
  let majorFrames = 0;
  const lineWidths = new Float64Array(FRAME_COUNT);
  for (let frame = 0; frame < FRAME_COUNT; frame++) {
    const offset = HEADER_SIZE + frame * RECORD_SIZE;
    for (let band = 0; band < BAND_COUNT; band++) {
      output[offset + band] = spectrumValue(frame, band);
    }

    output[offset + 64] = quantizeUnit(pressure[frame] ?? 0);
    output[offset + 65] = quantizeUnit(impact[frame] ?? 0);
    output[offset + 66] = quantizeUnit(lowEnd[frame] ?? 0);
    output[offset + 67] = quantizeUnit(brightness[frame] ?? 0);
    output[offset + 68] = quantizeUnit(emotion[frame] ?? 0);
    output[offset + 69] = quantizeUnit(hero[frame] ?? 0);
    output[offset + 70] = quantizeUnit(reach[frame] ?? 0);
    output.writeInt16LE(
      Math.round(clamp(momentaryDb[frame] ?? -120, -120, 12) * 100),
      offset + 71,
    );
    output.writeInt16LE(
      Math.round(clamp(peakDb[frame] ?? -120, -120, 12) * 100),
      offset + 73,
    );

    const width =
      520 + 300 * (reach[frame] ?? 0) + 100 * (hero[frame] ?? 0);
    lineWidths[frame] = Math.min(920, 2 * Math.round(width / 2));
    if (width >= 900) heroFrames++;
    if (width >= 850) majorFrames++;
  }

  writeFileSync(outputPath, output);
  const outputHash = sha256(output);
  const strongestEvents = [...transientEvents]
    .sort((a, b) => b.strength - a.strength)
    .slice(0, 20)
    .sort((a, b) => a.frame - b.frame)
    .map((event) => ({
      timeSeconds: round(event.frame / FPS, 3),
      strength: round(event.strength),
    }));
  const accentSnapshots = accents.map((accent) => {
    const frame = Math.round(accent.apex * FPS);
    return {
      id: accent.id,
      timeSeconds: accent.apex,
      pressure: round(pressure[frame] ?? 0),
      impact: round(impact[frame] ?? 0),
      emotion: round(emotion[frame] ?? 0),
      hero: round(hero[frame] ?? 0),
      lineWidthPx: lineWidths[frame] ?? 520,
    };
  });

  const manifest = {
    schemaVersion: 1,
    source: {
      path: 'public/soundtrack.m4a',
      sha256: sha256(audioBytes),
      sampleRate: SAMPLE_RATE,
      decodedSamplesPerChannel: sampleCount,
      channels: 2,
      durationSeconds: DURATION_SECONDS,
    },
    analysis: {
      frameRate: FPS,
      frameCount: FRAME_COUNT,
      bandCount: BAND_COUNT,
      frequencyScale: 'logarithmic',
      frequencyRangeHz: [FREQUENCY_MIN, FREQUENCY_MAX],
      spectrumChannels: 'combined stereo',
      spectrumWindow: 'periodic Hann via FFmpeg showspectrumpic',
      spectrumScale: 'logarithmic intensity, 80 dB display range',
      pressureWindowMilliseconds: 400,
      transientLevelWindowMilliseconds: 25,
      transientVisualPrerollMilliseconds: round((2 / FPS) * 1000, 3),
      pressureAttackMilliseconds: 80,
      pressureReleaseMilliseconds: 360,
    },
    percentiles: {
      momentaryDbfs: Object.fromEntries(
        Object.entries(loudnessPercentiles).map(([key, value]) => [
          key,
          round(value, 3),
        ]),
      ),
      spectralFlux: {p80: round(fluxP80, 6), p99: round(fluxP99, 6)},
      lowBand: {p50: round(lowP50, 6), p98: round(lowP98, 6)},
      brightness: {
        p20: round(brightnessP20, 6),
        p95: round(brightnessP95, 6),
      },
    },
    motion: {
      accents,
      transientEventCount: transientEvents.length,
      strongestTransientEvents: strongestEvents,
      accentSnapshots,
      lineWidthPercentilesPx: {
        p50: percentile([...lineWidths], 0.5),
        p85: percentile([...lineWidths], 0.85),
        p95: percentile([...lineWidths], 0.95),
        p99: percentile([...lineWidths], 0.99),
        maximum: Math.max(...lineWidths),
      },
      majorFrameFraction: round(majorFrames / FRAME_COUNT, 6),
      heroFrameFraction: round(heroFrames / FRAME_COUNT, 6),
      widthFormula:
        'min(920, 2 * round((520 + 300 * reach + 100 * hero) / 2))',
    },
    artifact: {
      path: 'public/audio-features.bin',
      bytes: output.length,
      sha256: outputHash,
      headerBytes: HEADER_SIZE,
      recordBytes: RECORD_SIZE,
      recordLayout: {
        bandsUint8: [0, 63],
        pressureUint8: 64,
        impactUint8: 65,
        lowEndUint8: 66,
        brightnessUint8: 67,
        emotionUint8: 68,
        heroUint8: 69,
        reachUint8: 70,
        momentaryDbfsInt16x100: [71, 72],
        samplePeakDbfsInt16x100: [73, 74],
      },
    },
  };

  writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);

  process.stdout.write(
    [
      `Generated ${outputPath}`,
      `Frames: ${FRAME_COUNT} at ${FPS} fps`,
      `Decoded samples/channel: ${sampleCount}`,
      `Transient events: ${transientEvents.length}`,
      `Major frames: ${round((majorFrames / FRAME_COUNT) * 100, 3)}%`,
      `Hero frames: ${round((heroFrames / FRAME_COUNT) * 100, 3)}%`,
      `Artifact SHA-256: ${outputHash}`,
    ].join('\n') + '\n',
  );
} finally {
  rmSync(temporaryDirectory, {recursive: true, force: true});
}
