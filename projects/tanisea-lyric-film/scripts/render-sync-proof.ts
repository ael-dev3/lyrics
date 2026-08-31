import {execFileSync} from 'node:child_process';
import {
  existsSync,
  mkdirSync,
  openSync,
  closeSync,
  readSync,
  realpathSync,
  renameSync,
  rmSync,
  statSync,
} from 'node:fs';
import {basename, dirname, extname, resolve} from 'node:path';

const COMPOSITION_ID = 'LyricFilmSyncProof';
const PROOF_FPS = 120;
const FULL_FRAME_COUNT = 18_360;
const FULL_DURATION_SECONDS = FULL_FRAME_COUNT / PROOF_FPS;

export type InclusiveFrameRange = Readonly<{
  start: number;
  end: number;
}>;

export type ProofRenderPlan = Readonly<{
  compositionId: typeof COMPOSITION_ID;
  frameRange: InclusiveFrameRange | null;
  expectedFrameCount: number;
  expectedDurationSeconds: number;
  mutedOutputPath: string;
  finalOutputPath: string;
  renderArguments: readonly string[];
  remuxArguments: readonly string[] | null;
}>;

type CreateProofRenderPlanOptions = Readonly<{
  entryPoint: string;
  soundtrackPath: string;
  outputPath: string;
  frameRange: InclusiveFrameRange | null;
}>;

type ProbeStream = Readonly<{
  codec_type?: string;
  codec_name?: string;
  codec_tag_string?: string;
  width?: number;
  height?: number;
  pix_fmt?: string;
  color_range?: string;
  color_space?: string;
  color_transfer?: string;
  color_primaries?: string;
  avg_frame_rate?: string;
  r_frame_rate?: string;
  start_time?: string;
  duration?: string;
  nb_read_frames?: string;
  nb_read_packets?: string;
  sample_rate?: string;
  channels?: number;
}>;

export type ProofProbe = Readonly<{
  streams?: readonly ProbeStream[];
  format?: Readonly<{
    duration?: string;
    start_time?: string;
  }>;
}>;

type ProofProbeExpectation = Readonly<{
  expectedFrameCount: number;
  expectedDurationSeconds: number;
  requireAudio: boolean;
}>;

export type ProofProbeSummary = Readonly<{
  frameCount: number;
  frameRate: string;
  dimensions: string;
  durationSeconds: number;
  audioPacketCount: number | null;
}>;

export type AudioPacketIdentity = Readonly<{
  packetCount: number;
  streamHash: string;
}>;

function requireValue(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

const requireNonEmptyPath = (value: string, label: string): void => {
  if (value.trim().length === 0) throw new Error(`${label} must not be empty`);
};

const validateFrameRange = ({start, end}: InclusiveFrameRange): void => {
  if (!Number.isInteger(start) || start < 0) {
    throw new RangeError(
      `Frame-range start must be a non-negative integer; received ${start}`,
    );
  }
  if (!Number.isInteger(end) || end < start) {
    throw new RangeError(
      `Frame-range end must be an integer at least ${start}; received ${end}`,
    );
  }
  if (end >= FULL_FRAME_COUNT) {
    throw new RangeError(
      `Frame-range end must be below ${FULL_FRAME_COUNT}; received ${end}`,
    );
  }
};

export const parseInclusiveFrameRange = (
  value: string,
): InclusiveFrameRange => {
  const match = /^(0|[1-9]\d*)-(0|[1-9]\d*)$/.exec(value);
  if (!match) {
    throw new Error(
      `Frame range must use inclusive non-negative integers START-END; received ${value}`,
    );
  }

  const start = Number(match[1]);
  const end = Number(match[2]);
  const range = {start, end};
  validateFrameRange(range);
  return range;
};

const withVideoOnlySuffix = (path: string): string => {
  const extension = extname(path);
  return extension.length === 0
    ? `${path}.video-only`
    : `${path.slice(0, -extension.length)}.video-only${extension}`;
};

const withBt709NormalizedSuffix = (path: string): string => {
  const extension = extname(path);
  return extension.length === 0
    ? `${path}.bt709-normalized`
    : `${path.slice(0, -extension.length)}.bt709-normalized${extension}`;
};

const canonicalWindowsPath = (path: string): string => {
  const unresolvedSegments: string[] = [];
  let existingAncestor = resolve(path);
  while (!existsSync(existingAncestor)) {
    const parent = dirname(existingAncestor);
    requireValue(
      parent !== existingAncestor,
      `Unable to resolve an existing ancestor for ${path}`,
    );
    unresolvedSegments.push(basename(existingAncestor));
    existingAncestor = parent;
  }

  const filesystemPath = resolve(
    realpathSync.native(existingAncestor),
    ...unresolvedSegments.reverse(),
  );
  return filesystemPath
    .replaceAll('/', '\\')
    .toLocaleLowerCase('en-US');
};

type ExistingFileIdentity = Readonly<{
  device: bigint;
  inode: bigint;
}>;

const existingFileIdentity = (path: string): ExistingFileIdentity | null => {
  if (!existsSync(path)) return null;
  const statistics = statSync(path, {bigint: true});
  return {device: statistics.dev, inode: statistics.ino};
};

const sameExistingFile = (
  left: ExistingFileIdentity | null,
  right: ExistingFileIdentity | null,
): boolean =>
  left !== null &&
  right !== null &&
  left.inode !== 0n &&
  left.device === right.device &&
  left.inode === right.inode;

export const createProofRenderPlan = ({
  entryPoint,
  soundtrackPath,
  outputPath,
  frameRange,
}: CreateProofRenderPlanOptions): ProofRenderPlan => {
  requireNonEmptyPath(entryPoint, 'Entry point');
  requireNonEmptyPath(soundtrackPath, 'Soundtrack path');
  requireNonEmptyPath(outputPath, 'Output path');
  if (frameRange) validateFrameRange(frameRange);

  const isShortRange = frameRange !== null;
  const expectedFrameCount = isShortRange
    ? frameRange.end - frameRange.start + 1
    : FULL_FRAME_COUNT;
  const mutedOutputPath = isShortRange
    ? outputPath
    : withVideoOnlySuffix(outputPath);
  const renderArguments = [
    'render',
    entryPoint,
    COMPOSITION_ID,
    mutedOutputPath,
    '--codec=h264',
    '--crf=12',
    '--pixel-format=yuv420p',
    '--color-space=bt709',
    '--muted',
    '--overwrite',
    ...(frameRange ? [`--frames=${frameRange.start}-${frameRange.end}`] : []),
  ];

  return {
    compositionId: COMPOSITION_ID,
    frameRange,
    expectedFrameCount,
    expectedDurationSeconds: expectedFrameCount / PROOF_FPS,
    mutedOutputPath,
    finalOutputPath: outputPath,
    renderArguments,
    remuxArguments: isShortRange
      ? null
      : [
          '-hide_banner',
          '-i',
          mutedOutputPath,
          '-i',
          soundtrackPath,
          '-map',
          '0:v:0',
          '-map',
          '1:a:0',
          '-c:v',
          'copy',
          '-c:a',
          'copy',
          '-tag:v',
          'avc1',
          '-movflags',
          '+faststart',
          '-y',
          outputPath,
        ],
  };
};

export const prepareProofRenderPaths = ({
  entryPoint,
  soundtrackPath,
  plan,
}: Readonly<{
  entryPoint: string;
  soundtrackPath: string;
  plan: Pick<ProofRenderPlan, 'mutedOutputPath' | 'finalOutputPath'>;
}>): string => {
  const normalizedMutedOutputPath = withBt709NormalizedSuffix(
    plan.mutedOutputPath,
  );
  const protectedInputs = [
    {label: 'protected entry point', path: entryPoint},
    {label: 'protected soundtrack', path: soundtrackPath},
  ].map((input) => ({
    ...input,
    canonicalPath: canonicalWindowsPath(input.path),
    fileIdentity: existingFileIdentity(input.path),
  }));
  const deletionTargets = [
    {label: 'muted output', path: plan.mutedOutputPath},
    {label: 'final output', path: plan.finalOutputPath},
    {label: 'BT.709 normalized output', path: normalizedMutedOutputPath},
  ].map((target) => ({
    ...target,
    canonicalPath: canonicalWindowsPath(target.path),
    fileIdentity: existingFileIdentity(target.path),
  }));

  for (const target of deletionTargets) {
    for (const input of protectedInputs) {
      if (
        target.canonicalPath === input.canonicalPath ||
        sameExistingFile(target.fileIdentity, input.fileIdentity)
      ) {
        throw new Error(
          `Refusing destructive path collision: ${target.label} ${target.path} aliases ${input.label} ${input.path}`,
        );
      }
    }
  }

  const uniqueDeletionTargets = new Map(
    deletionTargets.map(({canonicalPath, path}) => [canonicalPath, path]),
  );
  for (const path of uniqueDeletionTargets.values()) {
    mkdirSync(dirname(path), {recursive: true});
  }
  for (const path of uniqueDeletionTargets.values()) {
    rmSync(path, {force: true});
  }
  return normalizedMutedOutputPath;
};

const numberFromProbe = (value: string | undefined): number => Number(value);

const within = (actual: number, expected: number, tolerance = 0.001): boolean =>
  Number.isFinite(actual) && Math.abs(actual - expected) <= tolerance;

export const verifyProofProbe = (
  probe: ProofProbe,
  expectation: ProofProbeExpectation,
): ProofProbeSummary => {
  const {expectedFrameCount, expectedDurationSeconds, requireAudio} = expectation;
  if (!Number.isInteger(expectedFrameCount) || expectedFrameCount <= 0) {
    throw new RangeError(
      `Expected frame count must be a positive integer; received ${expectedFrameCount}`,
    );
  }
  if (!Number.isFinite(expectedDurationSeconds) || expectedDurationSeconds <= 0) {
    throw new RangeError(
      `Expected duration must be finite and positive; received ${expectedDurationSeconds}`,
    );
  }

  const video = probe.streams?.find(({codec_type}) => codec_type === 'video');
  const audio = probe.streams?.find(({codec_type}) => codec_type === 'audio');
  const frameCount = numberFromProbe(video?.nb_read_frames);
  const frameCountLabel = expectedFrameCount.toLocaleString('en-US');

  requireValue(
    frameCount === expectedFrameCount,
    `Expected ${frameCountLabel} decoded video frames, got ${video?.nb_read_frames ?? 'none'}`,
  );
  requireValue(video?.codec_name === 'h264', `Expected H.264, got ${video?.codec_name}`);
  requireValue(
    video?.codec_tag_string === 'avc1',
    `Expected avc1, got ${video?.codec_tag_string}`,
  );
  requireValue(
    video?.width === 1_080 && video.height === 1_080,
    `Expected 1080×1080 video, got ${video?.width}×${video?.height}`,
  );
  requireValue(
    video?.pix_fmt === 'yuv420p',
    `Expected yuv420p, got ${video?.pix_fmt}`,
  );
  requireValue(
    video?.avg_frame_rate === '120/1',
    `Expected 120/1 average frame rate, got ${video?.avg_frame_rate}`,
  );
  requireValue(
    video?.r_frame_rate === '120/1',
    `Expected 120/1 real frame rate, got ${video?.r_frame_rate}`,
  );
  requireValue(
    video?.color_range === 'tv',
    `Expected limited colour range, got ${video?.color_range}`,
  );
  requireValue(
    video?.color_space === 'bt709',
    `Expected BT.709 matrix, got ${video?.color_space}`,
  );
  requireValue(
    video?.color_transfer === 'bt709',
    `Expected BT.709 transfer, got ${video?.color_transfer}`,
  );
  requireValue(
    video?.color_primaries === 'bt709',
    `Expected BT.709 primaries, got ${video?.color_primaries}`,
  );

  const videoStartTime = numberFromProbe(video?.start_time);
  const videoDuration = numberFromProbe(video?.duration);
  const formatStartTime = numberFromProbe(probe.format?.start_time);
  const formatDuration = numberFromProbe(probe.format?.duration);
  requireValue(
    within(videoStartTime, 0),
    `Expected zero video start time, got ${video?.start_time}`,
  );
  requireValue(
    within(formatStartTime, 0),
    `Expected zero format start time, got ${probe.format?.start_time}`,
  );
  requireValue(
    within(videoDuration, expectedDurationSeconds),
    `Expected ${expectedDurationSeconds.toFixed(6)} s video duration, got ${video?.duration}`,
  );
  requireValue(
    within(formatDuration, expectedDurationSeconds),
    `Expected ${expectedDurationSeconds.toFixed(6)} s format duration, got ${probe.format?.duration}`,
  );

  if (!requireAudio) {
    requireValue(audio === undefined, 'Expected a muted proof with no audio stream');
    return {
      frameCount,
      frameRate: video.avg_frame_rate,
      dimensions: `${video.width}x${video.height}`,
      durationSeconds: formatDuration,
      audioPacketCount: null,
    };
  }

  requireValue(audio?.codec_name === 'aac', `Expected AAC, got ${audio?.codec_name}`);
  requireValue(
    audio?.sample_rate === '44100',
    `Expected 44.1 kHz, got ${audio?.sample_rate}`,
  );
  requireValue(audio?.channels === 2, `Expected stereo, got ${audio?.channels} channels`);
  const audioStartTime = numberFromProbe(audio?.start_time);
  const audioDuration = numberFromProbe(audio?.duration);
  requireValue(
    within(audioStartTime, 0),
    `Expected zero audio start time, got ${audio?.start_time}`,
  );
  requireValue(
    within(audioDuration, FULL_DURATION_SECONDS),
    `Expected ${FULL_DURATION_SECONDS.toFixed(3)} s audio duration, got ${audio?.duration}`,
  );
  const audioPacketCount = numberFromProbe(audio?.nb_read_packets);
  requireValue(
    Number.isInteger(audioPacketCount) && audioPacketCount > 0,
    `Expected a positive counted AAC packet total, got ${audio?.nb_read_packets}`,
  );

  return {
    frameCount,
    frameRate: video.avg_frame_rate,
    dimensions: `${video.width}x${video.height}`,
    durationSeconds: formatDuration,
    audioPacketCount,
  };
};

export const verifyAudioPacketIdentity = (
  source: AudioPacketIdentity,
  proof: AudioPacketIdentity,
): void => {
  requireValue(
    source.packetCount === proof.packetCount,
    `AAC packet count mismatch: ${source.packetCount} != ${proof.packetCount}`,
  );
  requireValue(
    source.streamHash === proof.streamHash,
    `AAC packet hash mismatch: ${source.streamHash} != ${proof.streamHash}`,
  );
};

const probeFile = (path: string): ProofProbe =>
  JSON.parse(
    execFileSync(
      'ffprobe',
      [
        '-v',
        'error',
        '-count_frames',
        '-count_packets',
        '-show_streams',
        '-show_format',
        '-of',
        'json',
        path,
      ],
      {encoding: 'utf8'},
    ),
  ) as ProofProbe;

const audioPacketIdentity = (path: string): AudioPacketIdentity => {
  const probe = probeFile(path);
  const audio = probe.streams?.find(({codec_type}) => codec_type === 'audio');
  const packetCount = numberFromProbe(audio?.nb_read_packets);
  requireValue(
    Number.isInteger(packetCount) && packetCount > 0,
    `Expected counted AAC packets in ${path}, got ${audio?.nb_read_packets}`,
  );

  const streamHash = execFileSync(
    'ffmpeg',
    [
      '-v',
      'error',
      '-i',
      path,
      '-map',
      '0:a:0',
      '-c',
      'copy',
      '-f',
      'streamhash',
      '-hash',
      'sha256',
      '-',
    ],
    {encoding: 'utf8'},
  )
    .trim()
    .replace(/^\d+,a,/, '');
  requireValue(streamHash.length > 0, `Unable to derive AAC packet hash for ${path}`);
  return {packetCount, streamHash};
};

const verifyFastStart = (path: string): void => {
  const descriptor = openSync(path, 'r');
  try {
    const atomBuffer = Buffer.alloc(1024 * 1024);
    const atomBytes = readSync(descriptor, atomBuffer, 0, atomBuffer.length, 0);
    const atoms = atomBuffer.subarray(0, atomBytes).toString('latin1');
    const moovPosition = atoms.indexOf('moov');
    const mdatPosition = atoms.indexOf('mdat');
    requireValue(moovPosition >= 0, 'moov atom not found in the first MiB');
    requireValue(
      mdatPosition < 0 || moovPosition < mdatPosition,
      'moov atom is not before mdat',
    );
  } finally {
    closeSync(descriptor);
  }
};

export const decodeProof = (path: string, requireAudio: boolean): void => {
  execFileSync(
    'ffmpeg',
    [
      '-v',
      'error',
      '-xerror',
      '-i',
      path,
      '-map',
      '0:v:0',
      ...(requireAudio ? ['-map', '0:a:0'] : []),
      '-f',
      'null',
      '-',
    ],
    {stdio: 'inherit'},
  );
};

const normalizeBt709Metadata = (
  path: string,
  normalizedPath: string,
): void => {
  execFileSync(
    'ffmpeg',
    [
      '-v',
      'error',
      '-i',
      path,
      '-map',
      '0:v:0',
      '-c:v',
      'copy',
      '-tag:v',
      'avc1',
      '-color_primaries',
      'bt709',
      '-color_trc',
      'bt709',
      '-colorspace',
      'bt709',
      '-color_range',
      'tv',
      '-movflags',
      '+faststart',
      '-y',
      normalizedPath,
    ],
    {stdio: 'inherit'},
  );
  requireValue(
    existsSync(normalizedPath) && statSync(normalizedPath).size > 0,
    `BT.709-normalized proof was not created: ${normalizedPath}`,
  );
  rmSync(path, {force: true});
  renameSync(normalizedPath, path);
};

const findProjectRoot = (): string => {
  const candidates = [resolve(__dirname, '..'), resolve(__dirname, '..', '..')];
  const projectRoot = candidates.find((candidate) =>
    existsSync(resolve(candidate, 'package.json')),
  );
  if (!projectRoot) {
    throw new Error(`Unable to locate project root from ${__dirname}`);
  }
  return projectRoot;
};

type CliOptions = Readonly<{
  frameRange: InclusiveFrameRange | null;
  outputPath: string | null;
  entryPoint: string | null;
  soundtrackPath: string | null;
}>;

const readOptionValue = (
  argumentsList: readonly string[],
  index: number,
  option: string,
): Readonly<{value: string; nextIndex: number}> => {
  const argument = argumentsList[index];
  const prefix = `${option}=`;
  if (argument?.startsWith(prefix)) {
    const value = argument.slice(prefix.length);
    requireValue(value.length > 0, `${option} requires a value`);
    return {value, nextIndex: index};
  }
  requireValue(argument === option, `Unexpected argument: ${argument}`);
  const value = argumentsList[index + 1];
  requireValue(value !== undefined && value.length > 0, `${option} requires a value`);
  return {value, nextIndex: index + 1};
};

const parseCliOptions = (argumentsList: readonly string[]): CliOptions => {
  let frameRange: InclusiveFrameRange | null = null;
  let outputPath: string | null = null;
  let entryPoint: string | null = null;
  let soundtrackPath: string | null = null;

  for (let index = 0; index < argumentsList.length; index += 1) {
    const argument = argumentsList[index];
    if (argument === '--help') {
      process.stdout.write(
        'Usage: npm run proof -- [--frames=START-END] [--output=PATH]\n',
      );
      process.exit(0);
    }

    const option = ['--frames', '--output', '--entry-point', '--soundtrack'].find(
      (candidate) => argument === candidate || argument?.startsWith(`${candidate}=`),
    );
    if (!option) throw new Error(`Unexpected argument: ${argument}`);
    const {value, nextIndex} = readOptionValue(argumentsList, index, option);
    index = nextIndex;

    if (option === '--frames') frameRange = parseInclusiveFrameRange(value);
    if (option === '--output') outputPath = value;
    if (option === '--entry-point') entryPoint = value;
    if (option === '--soundtrack') soundtrackPath = value;
  }

  return {frameRange, outputPath, entryPoint, soundtrackPath};
};

const run = (): void => {
  const root = findProjectRoot();
  const options = parseCliOptions(process.argv.slice(2));
  const entryPoint = resolve(root, options.entryPoint ?? 'src/index.ts');
  const soundtrackPath = resolve(root, options.soundtrackPath ?? 'public/soundtrack.m4a');
  const outputPath = resolve(
    root,
    options.outputPath ??
      (options.frameRange
        ? `work/visual-review/task-6/LyricFilmSyncProof-${options.frameRange.start}-${options.frameRange.end}.mp4`
        : 'output/Tanisea-Lyric-Film-Sync-Proof-120fps.mp4'),
  );

  requireValue(existsSync(entryPoint), `Entry point does not exist: ${entryPoint}`);
  if (!options.frameRange) {
    requireValue(
      existsSync(soundtrackPath),
      `Soundtrack does not exist: ${soundtrackPath}`,
    );
  }

  const plan = createProofRenderPlan({
    entryPoint,
    soundtrackPath,
    outputPath,
    frameRange: options.frameRange,
  });
  const normalizedMutedOutputPath = prepareProofRenderPaths({
    entryPoint,
    soundtrackPath,
    plan,
  });

  const remotionExecutable = resolve(
    root,
    'node_modules',
    '@remotion',
    'cli',
    'remotion-cli.js',
  );
  requireValue(
    existsSync(remotionExecutable),
    `Remotion executable does not exist: ${remotionExecutable}`,
  );
  execFileSync(process.execPath, [remotionExecutable, ...plan.renderArguments], {
    cwd: root,
    stdio: 'inherit',
  });
  requireValue(
    existsSync(plan.mutedOutputPath) && statSync(plan.mutedOutputPath).size > 0,
    `Proof render was not created: ${plan.mutedOutputPath}`,
  );
  normalizeBt709Metadata(plan.mutedOutputPath, normalizedMutedOutputPath);

  const mutedSummary = verifyProofProbe(probeFile(plan.mutedOutputPath), {
    expectedFrameCount: plan.expectedFrameCount,
    expectedDurationSeconds: plan.expectedDurationSeconds,
    requireAudio: false,
  });
  decodeProof(plan.mutedOutputPath, false);

  if (!plan.remuxArguments) {
    process.stdout.write(`${JSON.stringify({plan, media: mutedSummary}, null, 2)}\n`);
    return;
  }

  execFileSync('ffmpeg', [...plan.remuxArguments], {cwd: root, stdio: 'inherit'});
  requireValue(
    existsSync(plan.finalOutputPath) && statSync(plan.finalOutputPath).size > 0,
    `Proof remux was not created: ${plan.finalOutputPath}`,
  );
  const finalSummary = verifyProofProbe(probeFile(plan.finalOutputPath), {
    expectedFrameCount: plan.expectedFrameCount,
    expectedDurationSeconds: plan.expectedDurationSeconds,
    requireAudio: true,
  });
  const sourceAudio = audioPacketIdentity(soundtrackPath);
  const proofAudio = audioPacketIdentity(plan.finalOutputPath);
  verifyAudioPacketIdentity(sourceAudio, proofAudio);
  verifyFastStart(plan.finalOutputPath);
  decodeProof(plan.finalOutputPath, true);

  process.stdout.write(
    `${JSON.stringify(
      {plan, media: finalSummary, sourceAudio, proofAudio, fastStart: true},
      null,
      2,
    )}\n`,
  );
};

if (require.main === module) run();
