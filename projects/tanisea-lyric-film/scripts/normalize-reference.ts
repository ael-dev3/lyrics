import {execFileSync} from 'node:child_process';
import {existsSync, renameSync, rmSync, statSync} from 'node:fs';
import {basename, dirname, resolve} from 'node:path';
import {projectRootFromScriptDirectory} from './project-root.js';

type UnknownRecord = Record<string, unknown>;

type CommandPlan = Readonly<{
  executable: 'ffmpeg' | 'ffprobe';
  arguments: readonly string[];
}>;

export type ReferenceNormalizationPlan = Readonly<{
  remux: CommandPlan;
  probe: CommandPlan;
  sourceVideoHash: CommandPlan;
  normalizedVideoHash: CommandPlan;
}>;

const REFERENCE_FILE = 'Tanisea-Lyric-Film-vNext-reference-2x.mov';
const NORMALIZED_FILE =
  'Tanisea-Lyric-Film-vNext-reference-2x.metadata-normalized.mov';
const BACKUP_FILE =
  'Tanisea-Lyric-Film-vNext-reference-2x.metadata-unnormalized.mov';
const SHA256_PATTERN = /^[0-9a-f]{64}$/;
const MAX_COMMAND_OUTPUT_BYTES = 16 * 1024 * 1024;

const isRecord = (value: unknown): value is UnknownRecord =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

function requireValue(
  condition: unknown,
  detail: string,
): asserts condition {
  if (!condition) throw new Error(`Reference normalization: ${detail}`);
}

const videoStreamHashCommand = (path: string): CommandPlan => ({
  executable: 'ffmpeg',
  arguments: [
    '-v',
    'error',
    '-i',
    path,
    '-map',
    '0:v:0',
    '-c',
    'copy',
    '-f',
    'streamhash',
    '-hash',
    'sha256',
    '-',
  ],
});

export const createReferenceNormalizationPlan = (
  sourcePath: string,
  normalizedPath: string,
): ReferenceNormalizationPlan => {
  requireValue(
    resolve(sourcePath) !== resolve(normalizedPath),
    'source and normalized output must be different paths',
  );

  return {
    remux: {
      executable: 'ffmpeg',
      arguments: [
        '-v',
        'error',
        '-i',
        sourcePath,
        '-map',
        '0:v:0',
        '-c:v',
        'copy',
        '-aspect',
        '1:1',
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
    },
    probe: {
      executable: 'ffprobe',
      arguments: [
        '-v',
        'error',
        '-show_streams',
        '-show_format',
        '-of',
        'json',
        normalizedPath,
      ],
    },
    sourceVideoHash: videoStreamHashCommand(sourcePath),
    normalizedVideoHash: videoStreamHashCommand(normalizedPath),
  };
};

const requireExact = (
  parent: UnknownRecord,
  field: string,
  expected: string | number,
  label: string,
): void => {
  requireValue(
    typeof parent[field] === typeof expected && parent[field] === expected,
    `${label} must be exactly ${JSON.stringify(expected)}, got ${JSON.stringify(parent[field])}`,
  );
};

export const verifyNormalizedReferenceProbe = (
  probe: unknown,
): Readonly<{
  frameCount: number;
  durationSeconds: number;
  pixelFormat: string;
  sampleAspectRatio: string;
}> => {
  requireValue(isRecord(probe), 'ffprobe output must be an object');
  requireValue(Array.isArray(probe.streams), 'ffprobe streams must be an array');
  const streams = probe.streams;
  const videos = streams.filter(
    (stream) => isRecord(stream) && stream.codec_type === 'video',
  );
  requireValue(videos.length === 1, 'exactly one video stream is required');
  requireValue(streams.length === 1, 'the muted reference must contain only video');
  const video = videos[0];
  requireValue(isRecord(video), 'video stream must be an object');
  requireValue(isRecord(probe.format), 'ffprobe format must be an object');
  const format = probe.format;

  for (const [field, expected, label] of [
    ['codec_name', 'prores', 'video codec'],
    ['profile', '4444', 'video profile'],
    ['codec_tag_string', 'ap4h', 'video codec tag'],
    ['width', 2160, 'video width'],
    ['height', 2160, 'video height'],
    ['sample_aspect_ratio', '1:1', 'sample aspect ratio'],
    ['display_aspect_ratio', '1:1', 'display aspect ratio'],
    ['pix_fmt', 'yuv444p12le', 'pixel format'],
    ['color_range', 'tv', 'color range'],
    ['color_space', 'bt709', 'color space'],
    ['color_transfer', 'bt709', 'color transfer'],
    ['color_primaries', 'bt709', 'color primaries'],
    ['r_frame_rate', '60/1', 'real frame rate'],
    ['avg_frame_rate', '60/1', 'average frame rate'],
    ['start_time', '0.000000', 'video start time'],
    ['duration', '153.000000', 'video duration'],
    ['bits_per_raw_sample', '12', 'bits per raw sample'],
  ] as const) {
    requireExact(video, field, expected, label);
  }
  requireExact(format, 'start_time', '0.000000', 'container start time');
  requireExact(format, 'duration', '153.000000', 'container duration');

  const frameCount = Number(video.nb_frames);
  requireValue(
    Number.isInteger(frameCount) && frameCount === 9180,
    `video frame count must be exactly 9180, got ${JSON.stringify(video.nb_frames)}`,
  );

  return {
    frameCount,
    durationSeconds: Number(video.duration),
    pixelFormat: String(video.pix_fmt),
    sampleAspectRatio: String(video.sample_aspect_ratio),
  };
};

export const parseVideoStreamSha256 = (output: string): string => {
  const matches = [
    ...output.matchAll(/^0,v,SHA256=([0-9a-f]{64})\s*$/gim),
  ];
  requireValue(
    matches.length === 1,
    `expected exactly one video SHA-256 streamhash line, got ${matches.length}`,
  );
  const hash = matches[0]?.[1]?.toLowerCase();
  requireValue(hash !== undefined && SHA256_PATTERN.test(hash), 'invalid streamhash');
  return hash;
};

const runTextCommand = (command: CommandPlan, cwd: string): string =>
  execFileSync(command.executable, [...command.arguments], {
    cwd,
    encoding: 'utf8',
    maxBuffer: MAX_COMMAND_OUTPUT_BYTES,
  });

const assertManagedPath = (
  path: string,
  outputDirectory: string,
  expectedBasename: string,
): void => {
  requireValue(
    dirname(path) === outputDirectory && basename(path) === expectedBasename,
    `refusing unmanaged generated path ${path}`,
  );
};

const runReferenceNormalizationCli = (): void => {
  requireValue(
    process.argv.length === 2,
    'this command accepts no arguments; it operates on the canonical reference',
  );
  const projectRoot = projectRootFromScriptDirectory(__dirname);
  const outputDirectory = resolve(projectRoot, 'output');
  const sourcePath = resolve(outputDirectory, REFERENCE_FILE);
  const normalizedPath = resolve(outputDirectory, NORMALIZED_FILE);
  const backupPath = resolve(outputDirectory, BACKUP_FILE);

  assertManagedPath(sourcePath, outputDirectory, REFERENCE_FILE);
  assertManagedPath(normalizedPath, outputDirectory, NORMALIZED_FILE);
  assertManagedPath(backupPath, outputDirectory, BACKUP_FILE);
  requireValue(
    existsSync(sourcePath) && statSync(sourcePath).isFile(),
    `canonical reference is missing: ${sourcePath}`,
  );

  rmSync(normalizedPath, {force: true});
  rmSync(backupPath, {force: true});

  const plan = createReferenceNormalizationPlan(sourcePath, normalizedPath);
  const sourceVideoHash = parseVideoStreamSha256(
    runTextCommand(plan.sourceVideoHash, projectRoot),
  );
  execFileSync(plan.remux.executable, [...plan.remux.arguments], {
    cwd: projectRoot,
    stdio: 'inherit',
  });
  requireValue(
    existsSync(normalizedPath) && statSync(normalizedPath).size > 0,
    `normalized reference was not created: ${normalizedPath}`,
  );
  const probe = JSON.parse(runTextCommand(plan.probe, projectRoot)) as unknown;
  const summary = verifyNormalizedReferenceProbe(probe);
  const normalizedVideoHash = parseVideoStreamSha256(
    runTextCommand(plan.normalizedVideoHash, projectRoot),
  );
  requireValue(
    normalizedVideoHash === sourceVideoHash,
    `video packet hash changed during stream copy (${sourceVideoHash} -> ${normalizedVideoHash})`,
  );

  renameSync(sourcePath, backupPath);
  try {
    renameSync(normalizedPath, sourcePath);
  } catch (error: unknown) {
    renameSync(backupPath, sourcePath);
    throw error;
  }
  rmSync(backupPath, {force: true});

  process.stdout.write(
    `${JSON.stringify(
      {
        path: `output/${REFERENCE_FILE}`,
        sizeBytes: statSync(sourcePath).size,
        videoPacketSha256: sourceVideoHash,
        ...summary,
      },
      null,
      2,
    )}\n`,
  );
};

const isCommonJsMain =
  typeof require !== 'undefined' &&
  typeof module !== 'undefined' &&
  require.main === module;

if (isCommonJsMain) {
  try {
    runReferenceNormalizationCli();
  } catch (error: unknown) {
    process.stderr.write(
      `${error instanceof Error ? error.message : String(error)}\n`,
    );
    process.exitCode = 1;
  }
}
