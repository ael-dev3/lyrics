import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {createReadStream, existsSync, statSync, writeFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {projectRootFromScriptDirectory} from './project-root.js';

type UnknownRecord = Record<string, unknown>;

type Probe = Readonly<{
  streams?: readonly unknown[];
  format?: UnknownRecord;
}>;

const FRAME_COUNT = 9_180;
const PROOF_FRAME_COUNT = 18_360;
const DURATION_SECONDS = 153;
const WIDTH = 1_920;
const HEIGHT = 1_080;
const SHA256_PATTERN = /^[0-9a-f]{64}$/;
const GIT_SHA_PATTERN = /^[0-9a-f]{40}$/;
const skipProof = process.argv.includes('--skip-proof');

const root = projectRootFromScriptDirectory(__dirname);
const outputDirectory = resolve(root, 'output');
const auditPath = resolve(root, 'audits', 'tanisea-youtube-1920x1080-v2.5.0.json');
const files = {
  reference: resolve(
    outputDirectory,
    'Tanisea-Lyric-Film-YouTube-1920x1080-Reference.mov',
  ),
  final: resolve(
    outputDirectory,
    'Tanisea-Lyric-Film-YouTube-1920x1080-Final.mp4',
  ),
  proof: resolve(
    outputDirectory,
    'Tanisea-Lyric-Film-YouTube-Sync-Proof-120fps.mp4',
  ),
  soundtrack: resolve(root, 'public', 'soundtrack.m4a'),
} as const;

function requireValue(
  condition: unknown,
  message: string,
): asserts condition {
  if (!condition) throw new Error(message);
}

const isRecord = (value: unknown): value is UnknownRecord =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const probe = (path: string): Probe =>
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
  ) as Probe;

const videoStream = (metadata: Probe, label: string): UnknownRecord => {
  const stream = metadata.streams?.find(
    (candidate) => isRecord(candidate) && candidate.codec_type === 'video',
  );
  requireValue(stream && isRecord(stream), `${label} must contain one video stream`);
  return stream;
};

const audioStream = (metadata: Probe, label: string): UnknownRecord => {
  const stream = metadata.streams?.find(
    (candidate) => isRecord(candidate) && candidate.codec_type === 'audio',
  );
  requireValue(stream && isRecord(stream), `${label} must contain one audio stream`);
  return stream;
};

const exact = (
  object: UnknownRecord,
  key: string,
  value: string | number,
  label: string,
): void =>
  requireValue(
    object[key] === value,
    `${label}.${key} must be ${JSON.stringify(value)}, got ${JSON.stringify(object[key])}`,
  );

const positiveInteger = (value: unknown, label: string): number => {
  const numberValue = typeof value === 'number' ? value : Number(value);
  requireValue(
    Number.isSafeInteger(numberValue) && numberValue > 0,
    `${label} must be a positive integer, got ${JSON.stringify(value)}`,
  );
  return numberValue;
};

const closeTo = (value: unknown, expected: number, label: string): void => {
  const numberValue = Number(value);
  requireValue(
    Number.isFinite(numberValue) && Math.abs(numberValue - expected) <= 0.001,
    `${label} must be ${expected}, got ${JSON.stringify(value)}`,
  );
};

const validateVideo = (
  stream: UnknownRecord,
  options: Readonly<{
    label: string;
    codec: string;
    tag: string;
    fps: string;
    frames: number;
  }>,
): void => {
  exact(stream, 'codec_name', options.codec, options.label);
  exact(stream, 'codec_tag_string', options.tag, options.label);
  exact(stream, 'width', WIDTH, options.label);
  exact(stream, 'height', HEIGHT, options.label);
  requireValue(
    stream.sample_aspect_ratio === undefined || stream.sample_aspect_ratio === '1:1',
    `${options.label}.sample_aspect_ratio must be square or implicit, got ${JSON.stringify(stream.sample_aspect_ratio)}`,
  );
  exact(stream, 'display_aspect_ratio', '16:9', options.label);
  exact(stream, 'r_frame_rate', options.fps, options.label);
  exact(stream, 'avg_frame_rate', options.fps, options.label);
  exact(stream, 'color_range', 'tv', options.label);
  exact(stream, 'color_space', 'bt709', options.label);
  requireValue(
    stream.color_transfer === undefined || stream.color_transfer === 'bt709',
    `${options.label}.color_transfer must be bt709 or implicit, got ${JSON.stringify(stream.color_transfer)}`,
  );
  requireValue(
    stream.color_primaries === undefined || stream.color_primaries === 'bt709',
    `${options.label}.color_primaries must be bt709 or implicit, got ${JSON.stringify(stream.color_primaries)}`,
  );
  exact(stream, 'nb_read_frames', String(options.frames), options.label);
  positiveInteger(stream.nb_read_packets, `${options.label}.nb_read_packets`);
  closeTo(stream.duration, DURATION_SECONDS, `${options.label}.duration`);
};

const strictDecode = (path: string): void => {
  execFileSync(
    'ffmpeg',
    ['-v', 'error', '-xerror', '-i', path, '-map', '0', '-f', 'null', '-'],
    {stdio: 'inherit'},
  );
};

const packetHash = (path: string): string => {
  const output = execFileSync(
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
  );
  const match = /^0,a,SHA256=([0-9a-f]{64})\s*$/im.exec(output);
  const hash = match?.[1];
  requireValue(
    typeof hash === 'string' && SHA256_PATTERN.test(hash),
    'Missing audio packet SHA-256',
  );
  return hash;
};

const sha256 = (path: string): Promise<string> =>
  new Promise((resolveHash, rejectHash) => {
    const hash = createHash('sha256');
    const stream = createReadStream(path);
    stream.on('data', (chunk) => hash.update(chunk));
    stream.on('error', rejectHash);
    stream.on('end', () => resolveHash(hash.digest('hex')));
  });

const run = async (): Promise<void> => {
  const requiredFiles = skipProof
    ? {
        reference: files.reference,
        final: files.final,
        soundtrack: files.soundtrack,
      }
    : files;
  for (const [label, path] of Object.entries(requiredFiles)) {
    requireValue(existsSync(path), `Missing ${label}: ${path}`);
  }
  requireValue(!existsSync(auditPath), `Refusing to overwrite audit: ${auditPath}`);

  const reference = probe(files.reference);
  const final = probe(files.final);
  const proof = skipProof ? null : probe(files.proof);

  validateVideo(videoStream(reference, 'reference'), {
    label: 'reference.video',
    codec: 'prores',
    tag: 'ap4h',
    fps: '60/1',
    frames: FRAME_COUNT,
  });
  requireValue(
    !(reference.streams ?? []).some(
      (stream) => isRecord(stream) && stream.codec_type === 'audio',
    ),
    'reference must remain muted',
  );

  validateVideo(videoStream(final, 'final'), {
    label: 'final.video',
    codec: 'h264',
    tag: 'avc1',
    fps: '60/1',
    frames: FRAME_COUNT,
  });
  exact(audioStream(final, 'final'), 'codec_name', 'aac', 'final.audio');

  if (proof) {
    validateVideo(videoStream(proof, 'proof'), {
      label: 'proof.video',
      codec: 'h264',
      tag: 'avc1',
      fps: '120/1',
      frames: PROOF_FRAME_COUNT,
    });
    exact(audioStream(proof, 'proof'), 'codec_name', 'aac', 'proof.audio');
  }

  for (const path of [
    files.reference,
    files.final,
    ...(proof ? [files.proof] : []),
  ]) {
    strictDecode(path);
  }

  const sourceAudioPacketSha256 = packetHash(files.soundtrack);
  const proofAudioPacketSha256 = proof ? packetHash(files.proof) : null;
  if (proofAudioPacketSha256) {
    requireValue(
      sourceAudioPacketSha256 === proofAudioPacketSha256,
      'proof audio packet hash differs from source soundtrack',
    );
  }

  const sourceCommit = execFileSync('git', ['rev-parse', 'HEAD'], {
    cwd: root,
    encoding: 'utf8',
  }).trim();
  const renderSourceCommit =
    process.env.TANISEA_RENDER_SOURCE_COMMIT ?? sourceCommit;
  requireValue(
    GIT_SHA_PATTERN.test(renderSourceCommit),
    `renderSourceCommit must be a full Git SHA, got ${JSON.stringify(renderSourceCommit)}`,
  );
  const [referenceSha256, finalSha256, proofSha256] = await Promise.all([
    sha256(files.reference),
    sha256(files.final),
    proof ? sha256(files.proof) : Promise.resolve(null),
  ]);
  const artifact = (path: string, hash: string) => ({
    path: path.replace(`${root}/`, ''),
    sizeBytes: statSync(path).size,
    sha256: hash,
  });
  const report = {
    schemaVersion: 1,
    status: 'passed',
    sourceCommit,
    renderSourceCommit,
    composition: 'LyricFilmYouTube',
    dimensions: `${WIDTH}x${HEIGHT}`,
    durationSeconds: DURATION_SECONDS,
    finalFrameCount: FRAME_COUNT,
    proof: proof
      ? {
          status: 'verified',
          composition: 'LyricFilmYouTubeSyncProof',
          frameCount: PROOF_FRAME_COUNT,
          audioPacketSha256: proofAudioPacketSha256,
        }
      : {
          status: 'not-rendered',
          reason:
            'Optional 120 fps diagnostic proof was not required for the delivery audit.',
        },
    artifacts: {
      reference: artifact(files.reference, referenceSha256),
      final: artifact(files.final, finalSha256),
      ...(proof && proofSha256
        ? {proof: artifact(files.proof, proofSha256)}
        : {}),
    },
  };
  writeFileSync(auditPath, `${JSON.stringify(report, null, 2)}\n`, 'utf8');
  process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
};

run().catch((error: unknown) => {
  process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
  process.exitCode = 1;
});
