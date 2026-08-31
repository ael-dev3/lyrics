import {spawnSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {
  existsSync,
  mkdirSync,
  readFileSync,
  rmSync,
  statSync,
  writeFileSync,
} from 'node:fs';
import {dirname, join, relative, resolve, sep} from 'node:path';
import {lyrics} from '../src/timed-lyrics';

const SAMPLE_RATE = 44_100;
const CHANNELS = 2;
const EXPECTED_DURATION_SECONDS = 153;
const EXPECTED_DECODED_SAMPLES_PER_CHANNEL = 6_747_584;
const LOCKED_AAC_LEADING_SKIP_SAMPLES = 1_600;
const LOCKED_SOURCE_SHA256 =
  '93084f293d491da1519732f3fa3cf6416c783d04e8ca18b5569c7608a8d4540d';

export const ALIGNMENT_PADDING_SAMPLES = 4_410;

export type AlignmentLineWindow = Readonly<{
  id: string;
  text: string;
  vocalStart: number;
  vocalEnd: number;
}>;

export type AlignmentClipPlan = Readonly<{
  id: string;
  text: string;
  vocalStartSample: number;
  vocalEndSample: number;
  clipOffsetSamples: number;
  clipEndSample: number;
  clipSampleCount: number;
  paddingBeforeSamples: number;
  paddingAfterSamples: number;
}>;

type Transcript = Readonly<{
  schemaVersion: 1;
  sourceSha256: string;
  lines: readonly Readonly<{id: string; text: string}>[];
}>;

type CommandSpec = Readonly<{
  executable: string;
  args: readonly string[];
}>;

type CommandResult = Readonly<{
  command: CommandSpec;
  stdout: string;
  stderr: string;
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

export type AudioGeometry = Readonly<{
  codec: string;
  sampleFormat: string;
  sampleRate: number;
  channels: number;
  streamDurationSeconds: number;
  containerDurationSeconds: number;
  durationSamples: number;
  timeBase: string;
}>;

type ProbedGeometry = AudioGeometry & Readonly<{command: CommandSpec}>;

const secondsToSamples = (seconds: number): number =>
  Math.round(seconds * SAMPLE_RATE);

export const assertLockedSourceTimeline = (
  geometry: AudioGeometry,
): void => {
  if (
    geometry.sampleRate !== SAMPLE_RATE ||
    geometry.channels !== CHANNELS ||
    geometry.timeBase !== `1/${SAMPLE_RATE}` ||
    geometry.durationSamples !== 6_747_300 ||
    Math.abs(geometry.streamDurationSeconds - EXPECTED_DURATION_SECONDS) >
      0.000_000_5 ||
    Math.abs(geometry.containerDurationSeconds - EXPECTED_DURATION_SECONDS) >
      0.000_000_5
  ) {
    throw new Error('Locked source stream/container timeline is not 153.000 s');
  }
};

export const assertLockedPcmGeometry = (geometry: AudioGeometry): void => {
  const expectedDuration =
    EXPECTED_DECODED_SAMPLES_PER_CHANNEL / SAMPLE_RATE;
  if (
    geometry.codec !== 'pcm_f32le' ||
    geometry.sampleFormat !== 'flt' ||
    geometry.sampleRate !== SAMPLE_RATE ||
    geometry.channels !== CHANNELS ||
    geometry.timeBase !== `1/${SAMPLE_RATE}` ||
    geometry.durationSamples !== EXPECTED_DECODED_SAMPLES_PER_CHANNEL ||
    Math.abs(geometry.streamDurationSeconds - expectedDuration) > 0.000_000_5 ||
    Math.abs(geometry.containerDurationSeconds - expectedDuration) >
      0.000_000_5
  ) {
    throw new Error(
      'Locked decode must be exact 44.1 kHz stereo float PCM geometry',
    );
  }
};

export const buildLockedDecodeArgs = (
  sourcePath: string,
  outputPath: string,
): readonly string[] => [
  '-hide_banner',
  '-loglevel',
  'error',
  '-nostdin',
  '-y',
  '-flags2',
  '+skip_manual',
  '-i',
  sourcePath,
  '-map',
  '0:a:0',
  '-vn',
  '-af',
  `atrim=start_sample=${LOCKED_AAC_LEADING_SKIP_SAMPLES},asetpts=PTS-STARTPTS`,
  '-ac',
  String(CHANNELS),
  '-ar',
  String(SAMPLE_RATE),
  '-c:a',
  'pcm_f32le',
  outputPath,
];

export const buildClipPlans = (
  lines: readonly AlignmentLineWindow[],
  decodedSamplesPerChannel: number,
): readonly AlignmentClipPlan[] => {
  if (
    !Number.isInteger(decodedSamplesPerChannel) ||
    decodedSamplesPerChannel <= 0
  ) {
    throw new Error('Decoded source length must be a positive integer');
  }

  const ids = new Set<string>();
  return lines.map((line) => {
    if (ids.has(line.id)) throw new Error(`Duplicate transcript ID ${line.id}`);
    ids.add(line.id);
    if (
      !Number.isFinite(line.vocalStart) ||
      !Number.isFinite(line.vocalEnd)
    ) {
      throw new Error(`${line.id} has a non-finite phrase window`);
    }

    const vocalStartSample = secondsToSamples(line.vocalStart);
    const vocalEndSample = secondsToSamples(line.vocalEnd);
    if (
      vocalStartSample < 0 ||
      vocalEndSample <= vocalStartSample ||
      vocalEndSample > decodedSamplesPerChannel
    ) {
      throw new Error(`${line.id} has an invalid phrase window`);
    }

    const clipOffsetSamples = Math.max(
      0,
      vocalStartSample - ALIGNMENT_PADDING_SAMPLES,
    );
    const clipEndSample = Math.min(
      decodedSamplesPerChannel,
      vocalEndSample + ALIGNMENT_PADDING_SAMPLES,
    );

    return {
      id: line.id,
      text: line.text,
      vocalStartSample,
      vocalEndSample,
      clipOffsetSamples,
      clipEndSample,
      clipSampleCount: clipEndSample - clipOffsetSamples,
      paddingBeforeSamples: vocalStartSample - clipOffsetSamples,
      paddingAfterSamples: clipEndSample - vocalEndSample,
    };
  });
};

const findProjectRoot = (startDirectory: string): string => {
  let candidate = resolve(startDirectory);
  while (true) {
    if (
      existsSync(join(candidate, 'package.json')) &&
      existsSync(join(candidate, 'public', 'soundtrack.m4a'))
    ) {
      return candidate;
    }
    const parent = dirname(candidate);
    if (parent === candidate) {
      throw new Error(`Could not locate project root from ${startDirectory}`);
    }
    candidate = parent;
  }
};

const sha256File = (path: string): string =>
  createHash('sha256').update(readFileSync(path)).digest('hex');

const portablePath = (projectRoot: string, path: string): string =>
  relative(projectRoot, path).split(sep).join('/');

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
): ProbedGeometry => {
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
  const codec = stream?.codec_name ?? '';
  const sampleFormat = stream?.sample_fmt ?? '';
  const sampleRate = Number(stream?.sample_rate);
  const channels = stream?.channels ?? 0;
  const streamDurationSeconds = Number(stream?.duration);
  const containerDurationSeconds = Number(probe.format?.duration);
  const durationSamples = Number(stream?.duration_ts);
  const timeBase = stream?.time_base ?? '';
  if (
    sampleRate !== SAMPLE_RATE ||
    channels !== CHANNELS ||
    !Number.isFinite(streamDurationSeconds) ||
    !Number.isFinite(containerDurationSeconds) ||
    !Number.isInteger(durationSamples) ||
    timeBase !== `1/${SAMPLE_RATE}`
  ) {
    throw new Error(
      `Unexpected audio geometry for ${path}: ${JSON.stringify({
        sampleRate,
        channels,
        streamDurationSeconds,
        containerDurationSeconds,
        durationSamples,
        timeBase,
      })}`,
    );
  }
  return {
    command: result.command,
    codec,
    sampleFormat,
    sampleRate,
    channels,
    streamDurationSeconds,
    containerDurationSeconds,
    durationSamples,
    timeBase,
  };
};

const readTranscript = (path: string): Transcript => {
  const value = JSON.parse(readFileSync(path, 'utf8')) as Partial<Transcript>;
  if (
    value.schemaVersion !== 1 ||
    value.sourceSha256 !== LOCKED_SOURCE_SHA256 ||
    !Array.isArray(value.lines) ||
    value.lines.length !== 24 ||
    value.lines.some(
      (line) =>
        !line ||
        typeof line.id !== 'string' ||
        typeof line.text !== 'string' ||
        line.id.length === 0 ||
        line.text.length === 0,
    )
  ) {
    throw new Error('Russian transcript authority is invalid');
  }
  return value as Transcript;
};

const main = (): void => {
  const projectRoot = findProjectRoot(__dirname);
  const sourceRelativePath = 'public/soundtrack.m4a';
  const sourcePath = join(projectRoot, 'public', 'soundtrack.m4a');
  const transcriptPath = join(
    projectRoot,
    'alignment',
    'tanisea-russian-transcript.json',
  );
  const workDirectory = join(projectRoot, 'work', 'alignment');
  const corpusDirectory = join(workDirectory, 'mfa-corpus');
  const decodedPath = join(workDirectory, 'locked-source.wav');
  const manifestPath = join(workDirectory, 'preparation-manifest.json');

  const sourceSha256 = sha256File(sourcePath);
  if (sourceSha256 !== LOCKED_SOURCE_SHA256) {
    throw new Error(
      `Locked soundtrack SHA-256 mismatch: ${sourceSha256} != ${LOCKED_SOURCE_SHA256}`,
    );
  }

  const transcript = readTranscript(transcriptPath);
  const transcriptIds = new Set(transcript.lines.map(({id}) => id));
  if (transcriptIds.size !== transcript.lines.length) {
    throw new Error('Russian transcript authority has duplicate line IDs');
  }
  const lyricWindows = new Map(lyrics.map((line) => [line.id, line]));
  if (
    lyricWindows.size !== 24 ||
    [...lyricWindows.keys()].some((id) => !transcriptIds.has(id))
  ) {
    throw new Error('Transcript IDs do not match the 24 phrase windows');
  }

  const ffmpegVersion = runCommand(projectRoot, 'ffmpeg', ['-version']);
  const ffprobeVersion = runCommand(projectRoot, 'ffprobe', ['-version']);
  const sourceProbe = probeAudio(projectRoot, sourceRelativePath);
  assertLockedSourceTimeline(sourceProbe);

  mkdirSync(workDirectory, {recursive: true});
  rmSync(corpusDirectory, {recursive: true, force: true});
  mkdirSync(corpusDirectory, {recursive: true});

  const decodedRelativePath = portablePath(projectRoot, decodedPath);
  const decode = runCommand(
    projectRoot,
    'ffmpeg',
    buildLockedDecodeArgs(sourceRelativePath, decodedRelativePath),
  );
  const decodedProbe = probeAudio(projectRoot, decodedRelativePath);
  assertLockedPcmGeometry(decodedProbe);

  const lineWindows = transcript.lines.map(({id, text}) => {
    const line = lyricWindows.get(id);
    if (!line) throw new Error(`No phrase window exists for ${id}`);
    return {
      id,
      text,
      vocalStart: line.vocalStart,
      vocalEnd: line.vocalEnd,
    };
  });
  const clipPlans = buildClipPlans(
    lineWindows,
    decodedProbe.durationSamples,
  );

  const clips = clipPlans.map((clip) => {
    const wavPath = join(corpusDirectory, `${clip.id}.wav`);
    const labPath = join(corpusDirectory, `${clip.id}.lab`);
    const wavRelativePath = portablePath(projectRoot, wavPath);
    const labRelativePath = portablePath(projectRoot, labPath);
    const crop = runCommand(projectRoot, 'ffmpeg', [
      '-hide_banner',
      '-loglevel',
      'error',
      '-nostdin',
      '-y',
      '-i',
      decodedRelativePath,
      '-map',
      '0:a:0',
      '-af',
      `atrim=start_sample=${clip.clipOffsetSamples}:end_sample=${clip.clipEndSample},asetpts=PTS-STARTPTS`,
      '-ac',
      String(CHANNELS),
      '-ar',
      String(SAMPLE_RATE),
      '-c:a',
      'pcm_f32le',
      wavRelativePath,
    ]);
    writeFileSync(labPath, `${clip.text}\n`, 'utf8');
    const clipProbe = probeAudio(projectRoot, wavRelativePath);
    if (
      clipProbe.codec !== 'pcm_f32le' ||
      clipProbe.sampleFormat !== 'flt' ||
      clipProbe.durationSamples !== clip.clipSampleCount
    ) {
      throw new Error(
        `${clip.id} float PCM geometry mismatch: ${clipProbe.durationSamples} != ${clip.clipSampleCount}`,
      );
    }
    return {
      ...clip,
      requestedPaddingSamples: {
        before: ALIGNMENT_PADDING_SAMPLES,
        after: ALIGNMENT_PADDING_SAMPLES,
      },
      paths: {wav: wavRelativePath, lab: labRelativePath},
      hashes: {
        wavSha256: sha256File(wavPath),
        labSha256: sha256File(labPath),
      },
      geometry: {
        codec: clipProbe.codec,
        sampleFormat: clipProbe.sampleFormat,
        sampleRate: clipProbe.sampleRate,
        channels: clipProbe.channels,
        samplesPerChannel: clipProbe.durationSamples,
        durationSeconds: clipProbe.containerDurationSeconds,
      },
      commands: {crop: crop.command, probe: clipProbe.command},
    };
  });

  const manifest = {
    schemaVersion: 1,
    source: {
      path: sourceRelativePath,
      sha256: sourceSha256,
      bytes: statSync(sourcePath).size,
      sampleRate: sourceProbe.sampleRate,
      channels: sourceProbe.channels,
      streamDurationSeconds: sourceProbe.streamDurationSeconds,
      containerDurationSeconds: sourceProbe.containerDurationSeconds,
      durationSeconds: sourceProbe.containerDurationSeconds,
      durationSamples: sourceProbe.durationSamples,
      probeCommand: sourceProbe.command,
    },
    transcript: {
      path: portablePath(projectRoot, transcriptPath),
      sha256: sha256File(transcriptPath),
      schemaVersion: transcript.schemaVersion,
      lineCount: transcript.lines.length,
    },
    tools: {
      ffmpeg: {
        version: ffmpegVersion.stdout.split(/\r?\n/, 1)[0] ?? '',
        versionCommand: ffmpegVersion.command,
      },
      ffprobe: {
        version: ffprobeVersion.stdout.split(/\r?\n/, 1)[0] ?? '',
        versionCommand: ffprobeVersion.command,
      },
    },
    lockedDecode: {
      path: decodedRelativePath,
      sha256: sha256File(decodedPath),
      codec: decodedProbe.codec,
      sampleFormat: decodedProbe.sampleFormat,
      sampleRate: decodedProbe.sampleRate,
      channels: decodedProbe.channels,
      decodedSamplesPerChannel: decodedProbe.durationSamples,
      streamDurationSeconds: decodedProbe.streamDurationSeconds,
      containerDurationSeconds: decodedProbe.containerDurationSeconds,
      durationSeconds: decodedProbe.containerDurationSeconds,
      sampleGeometryPolicy: {
        decoderSkipMode: 'manual',
        leadingSamplesRemoved: LOCKED_AAC_LEADING_SKIP_SAMPLES,
        trailingSamplesBeyondContainerDuration:
          decodedProbe.durationSamples - sourceProbe.durationSamples,
        reason:
          'Preserve the authoritative post-leading-edit sample geometry across FFmpeg versions',
      },
      commands: {decode: decode.command, probe: decodedProbe.command},
    },
    padding: {
      requestedBeforeSamples: ALIGNMENT_PADDING_SAMPLES,
      requestedAfterSamples: ALIGNMENT_PADDING_SAMPLES,
      requestedBeforeSeconds: ALIGNMENT_PADDING_SAMPLES / SAMPLE_RATE,
      requestedAfterSeconds: ALIGNMENT_PADDING_SAMPLES / SAMPLE_RATE,
      clampPolicy: 'Clamp each padded clip to decoded source sample bounds',
    },
    corpus: {
      directory: portablePath(projectRoot, corpusDirectory),
      lineCount: clips.length,
      wavCount: clips.length,
      labCount: clips.length,
      clips,
    },
  };
  writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');
  const manifestSha256 = sha256File(manifestPath);

  process.stdout.write(
    [
      `Source SHA-256: ${sourceSha256}`,
      `Decoded samples/channel: ${decodedProbe.durationSamples}`,
      `Prepared WAV/LAB pairs: ${clips.length}`,
      `Padding: ${ALIGNMENT_PADDING_SAMPLES} samples before/after`,
      `Preparation manifest: ${portablePath(projectRoot, manifestPath)}`,
      `Preparation manifest SHA-256: ${manifestSha256}`,
    ].join('\n') + '\n',
  );
};

if (require.main === module) main();
