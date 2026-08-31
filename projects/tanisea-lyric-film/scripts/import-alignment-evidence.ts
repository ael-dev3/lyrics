import {spawnSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import {basename, dirname, extname, join, relative, resolve, sep} from 'node:path';

export type ImportedWord = Readonly<{
  text: string;
  startSample: number;
  endSample: number;
}>;

export type LagObservation = Readonly<{
  sourceSample: number;
  lagSamples: number;
  correlationScore: number;
  peakProminence: number;
}>;

export type FrameLagOptions = Readonly<{
  windowSamples: number;
  maxLagSamples: number;
}>;

export type MfaCoverage = Readonly<{
  availableIds: readonly string[];
  missingIds: readonly string[];
}>;

const MIN_LAG_CORRELATION_SCORE = 0.2;
const MIN_LAG_PEAK_PROMINENCE = 0.05;
const LAG_PEAK_EXCLUSION_SAMPLES = 4;

const secondsToSamples = (seconds: number): number =>
  Math.round(seconds * 44_100);

export const parseTextGridWords = (
  textGrid: string,
  clipOffsetSamples: number,
): readonly ImportedWord[] => {
  const tier = textGrid.match(
    /item \[\d+\]:\s*class = "IntervalTier"\s*name = "words"([\s\S]*?)(?=\n\s*item \[\d+\]:|$)/,
  )?.[1];
  if (!tier) throw new Error('MFA TextGrid has no words tier');
  const interval =
    /intervals \[\d+\]:\s*xmin = ([\d.]+)\s*xmax = ([\d.]+)\s*text = "([^"]*)"/g;
  return [...tier.matchAll(interval)]
    .filter((match) => (match[3] ?? '').trim().length > 0)
    .map((match) => ({
      text: (match[3] ?? '').trim().toLocaleLowerCase('ru'),
      startSample:
        clipOffsetSamples + secondsToSamples(Number(match[1])),
      endSample: clipOffsetSamples + secondsToSamples(Number(match[2])),
    }));
};

export const parseWhisperXWords = (
  json: unknown,
  clipOffsetSamples: number,
): readonly ImportedWord[] => {
  if (
    !json ||
    typeof json !== 'object' ||
    !Array.isArray((json as {word_segments?: unknown}).word_segments)
  ) {
    throw new Error('WhisperX output has no word_segments array');
  }
  return (json as {word_segments: unknown[]}).word_segments.map(
    (value, index) => {
      if (!value || typeof value !== 'object') {
        throw new Error(`WhisperX word ${index} is not an object`);
      }
      const word = value as {word?: unknown; start?: unknown; end?: unknown};
      if (
        typeof word.word !== 'string' ||
        typeof word.start !== 'number' ||
        typeof word.end !== 'number'
      ) {
        throw new Error(`WhisperX word ${index} is missing text/start/end`);
      }
      return {
        text: word.word.trim().toLocaleLowerCase('ru'),
        startSample: clipOffsetSamples + secondsToSamples(word.start),
        endSample: clipOffsetSamples + secondsToSamples(word.end),
      };
    },
  );
};

export const observeFrameLag = (
  source: Float32Array,
  stem: Float32Array,
  sourceSample: number,
  options: FrameLagOptions,
): LagObservation => {
  if (
    !Number.isInteger(sourceSample) ||
    !Number.isInteger(options.windowSamples) ||
    options.windowSamples <= 0 ||
    !Number.isInteger(options.maxLagSamples) ||
    options.maxLagSamples < 0
  ) {
    throw new Error('Stem-lag observation requires integer sample geometry');
  }
  const windowStart = sourceSample - Math.floor(options.windowSamples / 2);
  const windowEnd = windowStart + options.windowSamples;
  if (
    windowStart < 0 ||
    windowEnd > source.length ||
    windowStart - options.maxLagSamples < 0 ||
    windowEnd + options.maxLagSamples > stem.length
  ) {
    throw new Error('Stem-lag observation window exceeds audio bounds');
  }

  let sourcePower = 0;
  for (let sample = windowStart; sample < windowEnd; sample++) {
    const value = source[sample] ?? 0;
    sourcePower += value * value;
  }
  if (sourcePower <= 1e-12) {
    throw new Error(`Stem-lag source window at ${sourceSample} is silent`);
  }

  let bestLag = 0;
  let bestScore = Number.NEGATIVE_INFINITY;
  const lagScores: {lag: number; score: number}[] = [];
  for (
    let lag = -options.maxLagSamples;
    lag <= options.maxLagSamples;
    lag++
  ) {
    let dot = 0;
    let stemPower = 0;
    for (let sample = windowStart; sample < windowEnd; sample++) {
      const sourceValue = source[sample] ?? 0;
      const stemValue = stem[sample + lag] ?? 0;
      dot += sourceValue * stemValue;
      stemPower += stemValue * stemValue;
    }
    if (stemPower <= 1e-12) continue;
    const score = dot / Math.sqrt(sourcePower * stemPower);
    lagScores.push({lag, score});
    if (
      score > bestScore + Number.EPSILON ||
      (Math.abs(score - bestScore) <= Number.EPSILON &&
        Math.abs(lag) < Math.abs(bestLag))
    ) {
      bestScore = score;
      bestLag = lag;
    }
  }
  if (!Number.isFinite(bestScore)) {
    throw new Error(`Stem-lag window at ${sourceSample} has no usable stem`);
  }
  if (Math.abs(bestLag) === options.maxLagSamples) {
    throw new Error(
      `Stem-lag peak at ${sourceSample} reached search boundary ${options.maxLagSamples}`,
    );
  }
  if (bestScore < MIN_LAG_CORRELATION_SCORE) {
    throw new Error(
      `Stem-lag correlation at ${sourceSample} is below ${MIN_LAG_CORRELATION_SCORE}`,
    );
  }
  const comparisonScore = lagScores
    .filter(
      ({lag}) => Math.abs(lag - bestLag) > LAG_PEAK_EXCLUSION_SAMPLES,
    )
    .reduce(
      (highest, {score}) => Math.max(highest, score),
      Number.NEGATIVE_INFINITY,
    );
  if (!Number.isFinite(comparisonScore)) {
    throw new Error(
      `Stem-lag peak at ${sourceSample} has no distinct comparison lag`,
    );
  }
  const peakProminence = bestScore - comparisonScore;
  if (peakProminence < MIN_LAG_PEAK_PROMINENCE) {
    throw new Error(
      `Stem-lag peak prominence at ${sourceSample} is below ${MIN_LAG_PEAK_PROMINENCE}`,
    );
  }
  return {
    sourceSample,
    lagSamples: bestLag,
    correlationScore: bestScore,
    peakProminence,
  };
};

export const measureFrameLag = (
  observations: readonly LagObservation[],
): number => {
  if (observations.length < 3) {
    throw new Error('At least three stem-lag observations are required');
  }
  const lags = observations
    .map(({lagSamples}) => lagSamples)
    .sort((a, b) => a - b);
  if ((lags.at(-1) ?? 0) - (lags[0] ?? 0) > 220) {
    throw new Error('inconsistent stem latency across the track');
  }
  return lags[Math.floor(lags.length / 2)] ?? 0;
};

export const assessMfaCoverage = (
  expectedIds: readonly string[],
  observedIds: readonly string[],
): MfaCoverage => {
  const expected = new Set(expectedIds);
  if (expected.size !== expectedIds.length) {
    throw new Error('Expected MFA line IDs contain duplicates');
  }
  const observed = new Set(observedIds);
  if (observed.size !== observedIds.length) {
    throw new Error('MFA output has duplicate TextGrid basenames');
  }
  const unexpectedIds = observedIds.filter((id) => !expected.has(id));
  if (unexpectedIds.length > 0) {
    throw new Error(
      `MFA output has unexpected TextGrid IDs: ${unexpectedIds.join(', ')}`,
    );
  }
  return {
    availableIds: expectedIds.filter((id) => observed.has(id)),
    missingIds: expectedIds.filter((id) => !observed.has(id)),
  };
};

type CommandSpec = Readonly<{
  executable: string;
  args: readonly string[];
}>;

type CommandResult = Readonly<{
  command: CommandSpec;
  stdout: string;
  stderr: string;
}>;

type PreparationClip = Readonly<{
  id: string;
  text: string;
  clipOffsetSamples: number;
  clipSampleCount: number;
  paths: Readonly<{wav: string; lab: string}>;
}>;

type PreparationManifest = Readonly<{
  schemaVersion: number;
  source: Readonly<{sha256: string}>;
  lockedDecode: Readonly<{
    path: string;
    sha256: string;
    decodedSamplesPerChannel: number;
  }>;
  corpus: Readonly<{
    lineCount: number;
    clips: readonly PreparationClip[];
  }>;
}>;

type ProbeAudio = Readonly<{
  streams?: readonly Readonly<{
    codec_name?: string;
    sample_fmt?: string;
    sample_rate?: string;
    channels?: number;
    duration?: string;
    duration_ts?: number | string;
    time_base?: string;
  }>[];
  format?: Readonly<{duration?: string}>;
}>;

const SAMPLE_RATE = 44_100;
const CHANNELS = 2;
const EXPECTED_DECODED_SAMPLES_PER_CHANNEL = 6_747_584;
const LOCKED_SOURCE_SHA256 =
  '93084f293d491da1519732f3fa3cf6416c783d04e8ca18b5569c7608a8d4540d';
const LAG_WINDOW_SAMPLES = 8_192;
const MAX_LAG_SAMPLES = 2_205;
const LAG_ANCHORS = [
  {id: 'C1-01', sourceSample: 1_071_189},
  {id: 'V1-01', sourceSample: 2_825_046},
  {id: 'C2-05', sourceSample: 4_597_866},
] as const;

const findProjectRoot = (startDirectory: string): string => {
  let candidate = resolve(startDirectory);
  while (true) {
    if (
      existsSync(join(candidate, 'package.json')) &&
      existsSync(
        join(candidate, 'work', 'alignment', 'preparation-manifest.json'),
      )
    ) {
      return candidate;
    }
    const parent = dirname(candidate);
    if (parent === candidate) {
      throw new Error(`Could not locate prepared project root from ${startDirectory}`);
    }
    candidate = parent;
  }
};

const portablePath = (projectRoot: string, path: string): string =>
  relative(projectRoot, path).split(sep).join('/');

const sha256File = (path: string): string =>
  createHash('sha256').update(readFileSync(path)).digest('hex');

const runCommand = (
  projectRoot: string,
  executable: string,
  args: readonly string[],
): CommandResult => {
  const result = spawnSync(executable, args, {
    cwd: projectRoot,
    encoding: 'utf8',
    windowsHide: true,
  });
  const command = {executable, args: [...args]};
  if (result.error) {
    throw new Error(
      `${executable} could not start for ${JSON.stringify(command)}: ${result.error.message}`,
    );
  }
  if (result.status !== 0) {
    throw new Error(
      `${executable} exited ${result.status} for ${JSON.stringify(command)}\n${result.stderr}`,
    );
  }
  return {
    command,
    stdout: result.stdout ?? '',
    stderr: result.stderr ?? '',
  };
};

const probeAudio = (
  projectRoot: string,
  path: string,
): Readonly<{
  command: CommandSpec;
  codec: string;
  sampleFormat: string;
  sampleRate: number;
  channels: number;
  durationSamples: number;
  durationSeconds: number;
}> => {
  const result = runCommand(projectRoot, 'ffprobe', [
    '-v',
    'error',
    '-show_entries',
    'stream=codec_name,sample_fmt,sample_rate,channels,duration,duration_ts,time_base:format=duration',
    '-of',
    'json',
    path,
  ]);
  const probe = JSON.parse(result.stdout) as ProbeAudio;
  const stream = probe.streams?.[0];
  const sampleRate = Number(stream?.sample_rate);
  const channels = stream?.channels ?? 0;
  const durationSamples = Number(stream?.duration_ts);
  const durationSeconds = Number(probe.format?.duration ?? stream?.duration);
  if (
    sampleRate !== SAMPLE_RATE ||
    channels !== CHANNELS ||
    stream?.time_base !== `1/${SAMPLE_RATE}` ||
    !Number.isInteger(durationSamples) ||
    !Number.isFinite(durationSeconds)
  ) {
    throw new Error(`Unexpected audio geometry for ${path}`);
  }
  return {
    command: result.command,
    codec: stream.codec_name ?? '',
    sampleFormat: stream.sample_fmt ?? '',
    sampleRate,
    channels,
    durationSamples,
    durationSeconds,
  };
};

const listFilesRecursively = (directory: string): readonly string[] => {
  const files: string[] = [];
  const visit = (current: string): void => {
    for (const entry of readdirSync(current, {withFileTypes: true}).sort((a, b) =>
      a.name.localeCompare(b.name, 'en'),
    )) {
      const path = join(current, entry.name);
      if (entry.isDirectory()) visit(path);
      else if (entry.isFile()) files.push(path);
    }
  };
  visit(directory);
  return files;
};

const readFloat32File = (path: string): Float32Array => {
  const bytes = readFileSync(path);
  if (bytes.byteLength % Float32Array.BYTES_PER_ELEMENT !== 0) {
    throw new Error(`${path} is not packed float32 PCM`);
  }
  const buffer = bytes.buffer.slice(
    bytes.byteOffset,
    bytes.byteOffset + bytes.byteLength,
  );
  return new Float32Array(buffer);
};

const assertImportedWords = (
  words: readonly ImportedWord[],
  label: string,
): void => {
  if (words.length === 0) throw new Error(`${label} contains no aligned words`);
  words.forEach((word, index) => {
    if (
      word.text.length === 0 ||
      !Number.isInteger(word.startSample) ||
      !Number.isInteger(word.endSample) ||
      word.startSample < 0 ||
      word.endSample <= word.startSample
    ) {
      throw new Error(`${label} word ${index} has an invalid raw interval`);
    }
  });
};

const main = (): void => {
  const projectRoot = findProjectRoot(__dirname);
  const alignmentDirectory = join(projectRoot, 'work', 'alignment');
  const preparationPath = join(
    alignmentDirectory,
    'preparation-manifest.json',
  );
  const mfaDirectory = join(alignmentDirectory, 'mfa-output');
  const whisperXDirectory = join(alignmentDirectory, 'whisperx');
  const stemPath = join(
    alignmentDirectory,
    'demucs',
    'htdemucs_ft',
    'locked-source',
    'vocals.wav',
  );
  const evidencePath = join(alignmentDirectory, 'evidence.json');
  const temporaryDirectory = join(alignmentDirectory, 'import-temp');

  const preparation = JSON.parse(
    readFileSync(preparationPath, 'utf8'),
  ) as PreparationManifest;
  if (
    preparation.schemaVersion !== 1 ||
    preparation.source.sha256 !== LOCKED_SOURCE_SHA256 ||
    preparation.lockedDecode.decodedSamplesPerChannel !==
      EXPECTED_DECODED_SAMPLES_PER_CHANNEL ||
    preparation.corpus.lineCount !== 24 ||
    preparation.corpus.clips.length !== 24
  ) {
    throw new Error('Preparation manifest does not match the locked authority');
  }
  const clipIds = new Set(preparation.corpus.clips.map(({id}) => id));
  if (clipIds.size !== 24) {
    throw new Error('Preparation manifest has duplicate clip IDs');
  }

  const sourcePath = join(projectRoot, preparation.lockedDecode.path);
  if (
    sha256File(sourcePath) !== preparation.lockedDecode.sha256 ||
    !existsSync(stemPath)
  ) {
    throw new Error('Locked source or Demucs stem identity is missing');
  }
  const sourceProbe = probeAudio(
    projectRoot,
    preparation.lockedDecode.path,
  );
  const stemRelativePath = portablePath(projectRoot, stemPath);
  const stemProbe = probeAudio(projectRoot, stemRelativePath);
  if (
    sourceProbe.durationSamples !== EXPECTED_DECODED_SAMPLES_PER_CHANNEL ||
    stemProbe.durationSamples !== EXPECTED_DECODED_SAMPLES_PER_CHANNEL
  ) {
    throw new Error(
      `Source/stem sample geometry mismatch: ${sourceProbe.durationSamples}/${stemProbe.durationSamples}`,
    );
  }

  rmSync(temporaryDirectory, {recursive: true, force: true});
  mkdirSync(temporaryDirectory, {recursive: true});
  let sourceMonoCommand: CommandSpec;
  let stemMonoCommand: CommandSpec;
  let lagObservations: readonly LagObservation[];
  let stemLatencySamples: number;
  try {
    const sourceMonoPath = join(temporaryDirectory, 'source-mono.f32le');
    const stemMonoPath = join(temporaryDirectory, 'stem-mono.f32le');
    const decodeMono = (input: string, output: string): CommandResult =>
      runCommand(projectRoot, 'ffmpeg', [
        '-hide_banner',
        '-loglevel',
        'error',
        '-nostdin',
        '-y',
        '-i',
        input,
        '-map',
        '0:a:0',
        '-ac',
        '1',
        '-ar',
        String(SAMPLE_RATE),
        '-c:a',
        'pcm_f32le',
        '-f',
        'f32le',
        portablePath(projectRoot, output),
      ]);
    const sourceMono = decodeMono(
      preparation.lockedDecode.path,
      sourceMonoPath,
    );
    const stemMono = decodeMono(stemRelativePath, stemMonoPath);
    sourceMonoCommand = sourceMono.command;
    stemMonoCommand = stemMono.command;
    const sourceSamples = readFloat32File(sourceMonoPath);
    const stemSamples = readFloat32File(stemMonoPath);
    if (
      sourceSamples.length !== EXPECTED_DECODED_SAMPLES_PER_CHANNEL ||
      stemSamples.length !== EXPECTED_DECODED_SAMPLES_PER_CHANNEL
    ) {
      throw new Error(
        `Mono decode sample mismatch: ${sourceSamples.length}/${stemSamples.length}`,
      );
    }
    lagObservations = LAG_ANCHORS.map(({sourceSample}) =>
      observeFrameLag(sourceSamples, stemSamples, sourceSample, {
        windowSamples: LAG_WINDOW_SAMPLES,
        maxLagSamples: MAX_LAG_SAMPLES,
      }),
    );
    stemLatencySamples = measureFrameLag(lagObservations);
  } finally {
    rmSync(temporaryDirectory, {recursive: true, force: true});
  }

  const textGridFiles = listFilesRecursively(mfaDirectory).filter(
    (path) => extname(path).toLocaleLowerCase('en') === '.textgrid',
  );
  const textGridById = new Map(
    textGridFiles.map((path) => [basename(path, extname(path)), path]),
  );
  const mfaCoverage = assessMfaCoverage(
    preparation.corpus.clips.map(({id}) => id),
    textGridFiles.map((path) => basename(path, extname(path))),
  );

  for (const clip of preparation.corpus.clips) {
    const labPath = join(projectRoot, clip.paths.lab);
    if (readFileSync(labPath, 'utf8') !== `${clip.text}\n`) {
      throw new Error(`${clip.id} LAB no longer matches transcript authority`);
    }
  }

  const mfaLines = preparation.corpus.clips
    .filter(({id}) => textGridById.has(id))
    .map((clip) => {
      const textGridPath = textGridById.get(clip.id);
      if (!textGridPath) throw new Error(`MFA coverage lost ${clip.id}`);
      const words = parseTextGridWords(
        readFileSync(textGridPath, 'utf8'),
        clip.clipOffsetSamples,
      );
      assertImportedWords(words, `MFA ${clip.id}`);
      return {
        id: clip.id,
        text: clip.text,
        clipOffsetSamples: clip.clipOffsetSamples,
        clipSampleCount: clip.clipSampleCount,
        rawPath: portablePath(projectRoot, textGridPath),
        rawSha256: sha256File(textGridPath),
        words,
      };
    });

  const whisperXFiles = listFilesRecursively(whisperXDirectory).filter(
    (path) => extname(path).toLocaleLowerCase('en') === '.json',
  );
  if (whisperXFiles.length !== 1) {
    throw new Error(
      `Expected one WhisperX JSON file, received ${whisperXFiles.length}`,
    );
  }
  const whisperXPath = whisperXFiles[0];
  if (!whisperXPath) throw new Error('WhisperX JSON path is missing');
  const whisperXWords = parseWhisperXWords(
    JSON.parse(readFileSync(whisperXPath, 'utf8')) as unknown,
    -stemLatencySamples,
  );
  assertImportedWords(whisperXWords, 'WhisperX');

  const ffmpegVersion = runCommand(projectRoot, 'ffmpeg', ['-version']);
  const evidence = {
    schemaVersion: 1,
    evidenceKind: 'raw-alignment-candidates',
    authority: {
      sourceSha256: LOCKED_SOURCE_SHA256,
      sampleRate: SAMPLE_RATE,
      decodedSamplesPerChannel: EXPECTED_DECODED_SAMPLES_PER_CHANNEL,
      preparationManifestPath: portablePath(projectRoot, preparationPath),
      preparationManifestSha256: sha256File(preparationPath),
    },
    policy: {
      finalBoundariesSelected: false,
      interpolatedUnalignedWords: false,
      note: 'Raw candidates only; final word-boundary adjudication belongs to Task 3',
    },
    stem: {
      path: stemRelativePath,
      sha256: sha256File(stemPath),
      codec: stemProbe.codec,
      sampleFormat: stemProbe.sampleFormat,
      sampleRate: stemProbe.sampleRate,
      channels: stemProbe.channels,
      decodedSamplesPerChannel: stemProbe.durationSamples,
      durationSeconds: stemProbe.durationSeconds,
      lagMethod: 'normalized cross-correlation against locked source mix',
      lagWindowSamples: LAG_WINDOW_SAMPLES,
      maxSearchedLagSamples: MAX_LAG_SAMPLES,
      minimumCorrelationScore: MIN_LAG_CORRELATION_SCORE,
      minimumPeakProminence: MIN_LAG_PEAK_PROMINENCE,
      peakProminenceExclusionSamples: LAG_PEAK_EXCLUSION_SAMPLES,
      boundaryPeaksAccepted: false,
      lagToleranceSamples: 220,
      observationAnchors: LAG_ANCHORS.map((anchor, index) => {
        const observation = lagObservations[index];
        if (!observation) throw new Error(`Missing lag observation ${anchor.id}`);
        return {
          ...anchor,
          lagSamples: observation.lagSamples,
          correlationScore: observation.correlationScore,
          peakProminence: observation.peakProminence,
        };
      }),
      latencySamples: stemLatencySamples,
      sourceRelativeCompensationSamples: -stemLatencySamples,
      commands: {
        sourceProbe: sourceProbe.command,
        stemProbe: stemProbe.command,
        sourceMonoDecode: sourceMonoCommand,
        stemMonoDecode: stemMonoCommand,
      },
    },
    mfa: {
      outputDirectory: portablePath(projectRoot, mfaDirectory),
      expectedLineCount: preparation.corpus.clips.length,
      textGridCount: textGridFiles.length,
      lineCount: mfaLines.length,
      missingLineIds: mfaCoverage.missingIds,
      wordCount: mfaLines.reduce((count, line) => count + line.words.length, 0),
      lines: mfaLines,
    },
    whisperX: {
      rawPath: portablePath(projectRoot, whisperXPath),
      rawSha256: sha256File(whisperXPath),
      rawWordCount: whisperXWords.length,
      inputTimeline: 'Demucs vocal stem',
      appliedSourceOffsetSamples: -stemLatencySamples,
      words: whisperXWords,
    },
    tools: {
      ffmpeg: {
        version: ffmpegVersion.stdout.split(/\r?\n/, 1)[0] ?? '',
        versionCommand: ffmpegVersion.command,
      },
    },
  };
  writeFileSync(evidencePath, `${JSON.stringify(evidence, null, 2)}\n`, 'utf8');

  process.stdout.write(
    [
      `Stem samples/channel: ${stemProbe.durationSamples}`,
      `Stem lag observations: ${lagObservations
        .map(
          ({lagSamples, correlationScore, peakProminence}) =>
            `${lagSamples} (score ${correlationScore}, prominence ${peakProminence})`,
        )
        .join(', ')}`,
      `Applied stem latency compensation: ${-stemLatencySamples} samples`,
      `Imported MFA TextGrids: ${textGridFiles.length}`,
      `Missing MFA line IDs: ${mfaCoverage.missingIds.join(', ') || 'none'}`,
      `Imported MFA words: ${evidence.mfa.wordCount}`,
      `Imported WhisperX words: ${whisperXWords.length}`,
      `Evidence SHA-256: ${sha256File(evidencePath)}`,
    ].join('\n') + '\n',
  );
};

if (require.main === module) main();
