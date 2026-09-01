import {execFileSync, spawnSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {createReadStream} from 'node:fs';
import {open, stat} from 'node:fs/promises';
import {basename, join, relative, resolve, sep} from 'node:path';

type UnknownRecord = Record<string, unknown>;

export type DeliveryKind = 'reference' | 'public' | 'proof';
type PublicDeliveryKind = Exclude<DeliveryKind, 'reference'>;

type CommandPlan = Readonly<{
  executable: 'ffprobe' | 'ffmpeg';
  arguments: readonly string[];
}>;

type DeliveryVerificationPlan = Readonly<{
  probe: CommandPlan;
  strictDecode: CommandPlan;
  packetStreamHashes: readonly Readonly<{
    owner: 'delivery' | 'source-audio';
    command: CommandPlan;
  }>[];
}>;

type TopLevelAtom = Readonly<{
  type: string;
  offset: number;
  size: number;
}>;

type Probe = Readonly<{
  streams?: readonly unknown[];
  format?: unknown;
}>;

const DELIVERY_FILE_BY_KIND: Readonly<Record<DeliveryKind, string>> = {
  reference: 'Tanisea-Lyric-Film-vNext-reference-2x.mov',
  public: 'Tanisea-Lyric-Film-vNext-60fps-Archival-Master.mp4',
  proof: 'Tanisea-Lyric-Film-Sync-Proof-120fps.mp4',
};

const SHA256_PATTERN = /^[0-9a-f]{64}$/;
const MAX_COMMAND_OUTPUT_BYTES = 16 * 1024 * 1024;

const isRecord = (value: unknown): value is UnknownRecord =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

function usageError(detail: string): never {
  throw new Error(
    `${detail}. Usage: verify-delivery --kind reference|public|proof`,
  );
}

export const parseDeliveryCliArgs = (
  argumentsList: readonly string[],
  projectRoot: string,
): Readonly<{kind: DeliveryKind; deliveryPath: string}> => {
  if (argumentsList.length !== 2 || argumentsList[0] !== '--kind') {
    usageError('Expected exactly one --kind argument');
  }

  const kind = argumentsList[1];
  if (kind !== 'reference' && kind !== 'public' && kind !== 'proof') {
    usageError(`Unsupported delivery kind ${String(kind)}`);
  }

  return {
    kind,
    deliveryPath: join(projectRoot, 'output', DELIVERY_FILE_BY_KIND[kind]),
  };
};

const probeCommand = (path: string): CommandPlan => ({
  executable: 'ffprobe',
  arguments: [
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
});

const packetStreamHashCommand = (path: string): CommandPlan => ({
  executable: 'ffmpeg',
  arguments: [
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
});

export const createDeliveryVerificationPlan = (
  options: Readonly<{
    kind: DeliveryKind;
    deliveryPath: string;
    sourceAudioPath: string;
  }>,
): DeliveryVerificationPlan => {
  const selectedStreams =
    options.kind === 'reference'
      ? ['-map', '0:v:0']
      : ['-map', '0:v:0', '-map', '0:a:0'];

  return {
    probe: probeCommand(options.deliveryPath),
    strictDecode: {
      executable: 'ffmpeg',
      arguments: [
        '-v',
        'error',
        '-xerror',
        '-i',
        options.deliveryPath,
        ...selectedStreams,
        '-f',
        'null',
        '-',
      ],
    },
    packetStreamHashes:
      options.kind === 'reference'
        ? []
        : [
            {
              owner: 'source-audio',
              command: packetStreamHashCommand(options.sourceAudioPath),
            },
            {
              owner: 'delivery',
              command: packetStreamHashCommand(options.deliveryPath),
            },
          ],
  };
};

const parsePositiveCount = (value: unknown, authority: string): number => {
  const parsed =
    typeof value === 'number'
      ? value
      : typeof value === 'string' && /^\d+$/.test(value)
        ? Number(value)
        : Number.NaN;
  if (!Number.isSafeInteger(parsed) || parsed <= 0) {
    throw new Error(`${authority} must be an authoritative positive count`);
  }
  return parsed;
};

export const parseDecodedFrameCount = (stream: unknown): number => {
  if (!isRecord(stream)) {
    throw new Error('Decoded stream must provide nb_read_frames');
  }
  return parsePositiveCount(
    stream.nb_read_frames,
    'nb_read_frames decoded-frame authority',
  );
};

export const parseCountedPacketCount = (stream: unknown): number => {
  if (!isRecord(stream)) {
    throw new Error('Counted stream must provide nb_read_packets');
  }
  return parsePositiveCount(
    stream.nb_read_packets,
    'nb_read_packets counted-packet authority',
  );
};

export const validatePublicOrProofDelivery = (
  metadata: unknown,
  kind: PublicDeliveryKind,
  verifier: (actual: unknown, actualKind: PublicDeliveryKind) => void,
): void => {
  verifier(metadata, kind);
};

function referenceMetadataError(path: string, detail: string): never {
  throw new Error(`Reference delivery metadata: ${path} ${detail}`);
}

const requireReferenceRecord = (
  parent: UnknownRecord,
  field: string,
  path: string,
): UnknownRecord => {
  const value = parent[field];
  if (!isRecord(value)) referenceMetadataError(path, 'must be an object');
  return value;
};

const requireExactReferenceValue = (
  parent: UnknownRecord,
  field: string,
  path: string,
  expected: string | number | boolean,
): void => {
  if (
    typeof parent[field] !== typeof expected ||
    parent[field] !== expected
  ) {
    referenceMetadataError(
      path,
      `must be exactly ${JSON.stringify(expected)}`,
    );
  }
};

export const verifyReferenceDeliveryMetadata = (metadata: unknown): void => {
  if (!isRecord(metadata)) {
    referenceMetadataError('record', 'must be an object');
  }

  requireExactReferenceValue(
    metadata,
    'artifactId',
    'artifactId',
    'reference-render',
  );

  const fileSha256 = requireReferenceRecord(
    metadata,
    'fileSha256',
    'fileSha256',
  );
  if (
    typeof fileSha256.value !== 'string' ||
    !SHA256_PATTERN.test(fileSha256.value)
  ) {
    referenceMetadataError(
      'fileSha256.value',
      'must be 64 lowercase hexadecimal characters',
    );
  }
  requireExactReferenceValue(
    fileSha256,
    'source',
    'fileSha256.source',
    'sha256-file',
  );

  const video = requireReferenceRecord(metadata, 'video', 'video');
  for (const [field, expected] of [
    ['codecName', 'prores'],
    ['profile', '4444'],
    ['codecTag', 'ap4h'],
    ['width', 2160],
    ['height', 2160],
    ['avgFrameRate', '60/1'],
    ['realFrameRate', '60/1'],
    ['pixelFormat', 'yuv444p12le'],
    ['sampleAspectRatio', '1:1'],
    ['colorRange', 'tv'],
    ['colorSpace', 'bt709'],
    ['colorTransfer', 'bt709'],
    ['colorPrimaries', 'bt709'],
    ['startTime', '0.000000'],
    ['duration', '153.000000'],
  ] as const) {
    requireExactReferenceValue(video, field, `video.${field}`, expected);
  }

  const decodedFrameCount = requireReferenceRecord(
    video,
    'decodedFrameCount',
    'video.decodedFrameCount',
  );
  requireExactReferenceValue(
    decodedFrameCount,
    'value',
    'video.decodedFrameCount.value',
    9180,
  );
  requireExactReferenceValue(
    decodedFrameCount,
    'source',
    'video.decodedFrameCount.source',
    'ffprobe-count_frames',
  );

  const container = requireReferenceRecord(
    metadata,
    'container',
    'container',
  );
  requireExactReferenceValue(
    container,
    'duration',
    'container.duration',
    '153.000000',
  );

  const strictDecode = requireReferenceRecord(
    metadata,
    'strictDecode',
    'strictDecode',
  );
  requireExactReferenceValue(
    strictDecode,
    'passed',
    'strictDecode.passed',
    true,
  );
  requireExactReferenceValue(
    strictDecode,
    'source',
    'strictDecode.source',
    'ffmpeg-xerror-full-decode',
  );
};

const atomType = (bytes: Uint8Array, offset: number): string =>
  String.fromCharCode(
    bytes[offset + 4]!,
    bytes[offset + 5]!,
    bytes[offset + 6]!,
    bytes[offset + 7]!,
  );

const parseAtomHeader = (
  bytes: Uint8Array,
  offset: number,
  availableSize: number,
): Readonly<{type: string; size: number}> => {
  if (availableSize < 8 || bytes.byteLength - offset < 8) {
    throw new Error(`Top-level atom header is truncated at offset ${offset}`);
  }

  const view = new DataView(
    bytes.buffer,
    bytes.byteOffset,
    bytes.byteLength,
  );
  const size32 = view.getUint32(offset, false);
  const type = atomType(bytes, offset);
  let headerSize = 8;
  let size: number;

  if (size32 === 1) {
    headerSize = 16;
    if (availableSize < headerSize || bytes.byteLength - offset < headerSize) {
      throw new Error(
        `Top-level atom ${type} has a truncated extended-size header`,
      );
    }
    const high = view.getUint32(offset + 8, false);
    const low = view.getUint32(offset + 12, false);
    const extendedSize = (BigInt(high) << 32n) | BigInt(low);
    if (extendedSize > BigInt(Number.MAX_SAFE_INTEGER)) {
      throw new Error(`Top-level atom ${type} size exceeds safe integer range`);
    }
    size = Number(extendedSize);
  } else if (size32 === 0) {
    size = availableSize;
  } else {
    size = size32;
  }

  if (size < headerSize) {
    throw new Error(
      `Top-level atom ${type} size ${size} is smaller than its ${headerSize}-byte header`,
    );
  }
  if (size > availableSize) {
    throw new Error(
      `Top-level atom ${type} size ${size} extends beyond available input`,
    );
  }
  return {type, size};
};

export const parseTopLevelAtoms = (
  bytes: Uint8Array,
): readonly TopLevelAtom[] => {
  const atoms: TopLevelAtom[] = [];
  let offset = 0;
  while (offset < bytes.byteLength) {
    const {type, size} = parseAtomHeader(
      bytes,
      offset,
      bytes.byteLength - offset,
    );
    atoms.push({type, offset, size});
    offset += size;
  }
  return atoms;
};

const verifyFastStartAtoms = (atoms: readonly TopLevelAtom[]): void => {
  const moovIndex = atoms.findIndex(({type}) => type === 'moov');
  const mdatIndex = atoms.findIndex(({type}) => type === 'mdat');
  if (moovIndex < 0) {
    throw new Error('Faststart verification requires a top-level moov atom');
  }
  if (mdatIndex < 0) {
    throw new Error('Faststart verification requires a top-level mdat atom');
  }
  if (moovIndex >= mdatIndex) {
    throw new Error('Faststart verification requires moov before mdat');
  }
};

export const verifyFastStart = (bytes: Uint8Array): void => {
  verifyFastStartAtoms(parseTopLevelAtoms(bytes));
};

type StreamingHashDependencies = Readonly<{
  createReadStream: (
    path: string,
  ) => AsyncIterable<Uint8Array | string>;
}>;

const defaultStreamingHashDependencies: StreamingHashDependencies = {
  createReadStream: (path) => createReadStream(path),
};

export const sha256FileStreaming = async (
  path: string,
  dependencies: StreamingHashDependencies = defaultStreamingHashDependencies,
): Promise<string> => {
  const hash = createHash('sha256');
  for await (const chunk of dependencies.createReadStream(path)) {
    hash.update(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
  }
  return hash.digest('hex');
};

const requireProbeRecord = (value: unknown, path: string): UnknownRecord => {
  if (!isRecord(value)) throw new Error(`Probe ${path} must be an object`);
  return value;
};

const requireProbeString = (
  record: UnknownRecord,
  field: string,
  path: string,
): string => {
  const value = record[field];
  if (typeof value !== 'string' || value.length === 0) {
    throw new Error(`Probe ${path} must be a nonempty string`);
  }
  return value;
};

const requireProbeNumber = (
  record: UnknownRecord,
  field: string,
  path: string,
): number => {
  const value = record[field];
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    throw new Error(`Probe ${path} must be a finite number`);
  }
  return value;
};

const parseProbe = (output: string): Probe => {
  let parsed: unknown;
  try {
    parsed = JSON.parse(output);
  } catch (error) {
    throw new Error(
      `ffprobe returned invalid JSON: ${
        error instanceof Error ? error.message : String(error)
      }`,
    );
  }
  if (!isRecord(parsed)) throw new Error('ffprobe JSON must be an object');
  if (parsed.streams !== undefined && !Array.isArray(parsed.streams)) {
    throw new Error('ffprobe streams must be an array');
  }
  return parsed as Probe;
};

const requireProbeStream = (
  probe: Probe,
  kind: 'video' | 'audio',
): UnknownRecord => {
  const stream = probe.streams?.find(
    (entry) => isRecord(entry) && entry.codec_type === kind,
  );
  if (!isRecord(stream)) throw new Error(`ffprobe ${kind} stream is missing`);
  return stream;
};

const runTextCommand = (command: CommandPlan, projectRoot: string): string =>
  execFileSync(command.executable, [...command.arguments], {
    cwd: projectRoot,
    encoding: 'utf8',
    maxBuffer: MAX_COMMAND_OUTPUT_BYTES,
  });

const runStrictDecode = (
  command: CommandPlan,
  projectRoot: string,
): void => {
  const result = spawnSync(command.executable, [...command.arguments], {
    cwd: projectRoot,
    encoding: 'utf8',
    maxBuffer: MAX_COMMAND_OUTPUT_BYTES,
  });
  if (result.error) throw result.error;
  const stderr = typeof result.stderr === 'string' ? result.stderr : '';
  if (result.status !== 0 || stderr.trim().length !== 0) {
    throw new Error(
      `Strict decode failed with status ${String(result.status)}: ${stderr.trim()}`,
    );
  }
};

const parsePacketStreamSha256 = (output: string): string => {
  const matches = [...output.matchAll(/(?:SHA256=)?([0-9a-f]{64})\b/gi)];
  const value = matches.at(-1)?.[1]?.toLowerCase();
  if (value === undefined || !SHA256_PATTERN.test(value)) {
    throw new Error('Unable to parse stream-copy SHA-256 from ffmpeg output');
  }
  return value;
};

const parseTopLevelAtomsFromFile = async (
  path: string,
): Promise<readonly TopLevelAtom[]> => {
  const handle = await open(path, 'r');
  try {
    const fileSize = (await handle.stat()).size;
    if (!Number.isSafeInteger(fileSize) || fileSize < 0) {
      throw new Error('Media file size is outside the supported range');
    }

    const atoms: TopLevelAtom[] = [];
    let offset = 0;
    while (offset < fileSize) {
      const header = Buffer.alloc(16);
      const {bytesRead} = await handle.read(header, 0, header.length, offset);
      const {type, size} = parseAtomHeader(
        header.subarray(0, bytesRead),
        0,
        fileSize - offset,
      );
      atoms.push({type, offset, size});
      offset += size;
    }
    return atoms;
  } finally {
    await handle.close();
  }
};

const buildReferenceMetadata = async (
  deliveryPath: string,
  probe: Probe,
): Promise<UnknownRecord> => {
  const video = requireProbeStream(probe, 'video');
  const format = requireProbeRecord(probe.format, 'format');
  return {
    artifactId: 'reference-render',
    fileSha256: {
      value: await sha256FileStreaming(deliveryPath),
      source: 'sha256-file',
    },
    video: {
      codecName: requireProbeString(video, 'codec_name', 'video.codec_name'),
      profile: requireProbeString(video, 'profile', 'video.profile'),
      codecTag: requireProbeString(
        video,
        'codec_tag_string',
        'video.codec_tag_string',
      ),
      width: requireProbeNumber(video, 'width', 'video.width'),
      height: requireProbeNumber(video, 'height', 'video.height'),
      avgFrameRate: requireProbeString(
        video,
        'avg_frame_rate',
        'video.avg_frame_rate',
      ),
      realFrameRate: requireProbeString(
        video,
        'r_frame_rate',
        'video.r_frame_rate',
      ),
      decodedFrameCount: {
        value: parseDecodedFrameCount(video),
        source: 'ffprobe-count_frames',
      },
      pixelFormat: requireProbeString(video, 'pix_fmt', 'video.pix_fmt'),
      sampleAspectRatio: requireProbeString(
        video,
        'sample_aspect_ratio',
        'video.sample_aspect_ratio',
      ),
      colorRange: requireProbeString(
        video,
        'color_range',
        'video.color_range',
      ),
      colorSpace: requireProbeString(
        video,
        'color_space',
        'video.color_space',
      ),
      colorTransfer: requireProbeString(
        video,
        'color_transfer',
        'video.color_transfer',
      ),
      colorPrimaries: requireProbeString(
        video,
        'color_primaries',
        'video.color_primaries',
      ),
      startTime: requireProbeString(video, 'start_time', 'video.start_time'),
      duration: requireProbeString(video, 'duration', 'video.duration'),
    },
    container: {
      duration: requireProbeString(format, 'duration', 'format.duration'),
    },
    strictDecode: {
      passed: true,
      source: 'ffmpeg-xerror-full-decode',
    },
  };
};

const buildPublicOrProofMetadata = async (
  kind: PublicDeliveryKind,
  deliveryPath: string,
  deliveryProbe: Probe,
  sourceProbe: Probe,
  packetStreamHashes: Readonly<{
    delivery: string;
    sourceAudio: string;
  }>,
): Promise<UnknownRecord> => {
  const video = requireProbeStream(deliveryProbe, 'video');
  const audio = requireProbeStream(deliveryProbe, 'audio');
  const sourceAudio = requireProbeStream(sourceProbe, 'audio');
  const format = requireProbeRecord(deliveryProbe.format, 'format');
  return {
    artifactId: kind === 'public' ? 'public-master' : 'sync-proof',
    fileSha256: {
      value: await sha256FileStreaming(deliveryPath),
      source: 'sha256-file',
    },
    video: {
      codecName: requireProbeString(video, 'codec_name', 'video.codec_name'),
      codecTag: requireProbeString(
        video,
        'codec_tag_string',
        'video.codec_tag_string',
      ),
      width: requireProbeNumber(video, 'width', 'video.width'),
      height: requireProbeNumber(video, 'height', 'video.height'),
      avgFrameRate: requireProbeString(
        video,
        'avg_frame_rate',
        'video.avg_frame_rate',
      ),
      realFrameRate: requireProbeString(
        video,
        'r_frame_rate',
        'video.r_frame_rate',
      ),
      decodedFrameCount: {
        value: parseDecodedFrameCount(video),
        source: 'ffprobe-count_frames',
      },
      pixelFormat: requireProbeString(video, 'pix_fmt', 'video.pix_fmt'),
      sampleAspectRatio: requireProbeString(
        video,
        'sample_aspect_ratio',
        'video.sample_aspect_ratio',
      ),
      colorRange: requireProbeString(
        video,
        'color_range',
        'video.color_range',
      ),
      colorSpace: requireProbeString(
        video,
        'color_space',
        'video.color_space',
      ),
      colorTransfer: requireProbeString(
        video,
        'color_transfer',
        'video.color_transfer',
      ),
      colorPrimaries: requireProbeString(
        video,
        'color_primaries',
        'video.color_primaries',
      ),
      startTime: requireProbeString(video, 'start_time', 'video.start_time'),
      duration: requireProbeString(video, 'duration', 'video.duration'),
    },
    audio: {
      codecName: requireProbeString(audio, 'codec_name', 'audio.codec_name'),
      sampleRate: requireProbeString(
        audio,
        'sample_rate',
        'audio.sample_rate',
      ),
      channels: requireProbeNumber(audio, 'channels', 'audio.channels'),
      channelLayout: requireProbeString(
        audio,
        'channel_layout',
        'audio.channel_layout',
      ),
      timeBase: requireProbeString(audio, 'time_base', 'audio.time_base'),
      startPts: requireProbeNumber(audio, 'start_pts', 'audio.start_pts'),
      startTime: requireProbeString(audio, 'start_time', 'audio.start_time'),
      durationTs: requireProbeNumber(
        audio,
        'duration_ts',
        'audio.duration_ts',
      ),
      duration: requireProbeString(audio, 'duration', 'audio.duration'),
      packetCount: {
        value: parseCountedPacketCount(audio),
        source: 'ffprobe-count_packets',
      },
      packetStreamSha256: {
        value: packetStreamHashes.delivery,
        source: 'stream-copy-sha256',
      },
    },
    sourceAudio: {
      timeBase: requireProbeString(
        sourceAudio,
        'time_base',
        'sourceAudio.time_base',
      ),
      startPts: requireProbeNumber(
        sourceAudio,
        'start_pts',
        'sourceAudio.start_pts',
      ),
      startTime: requireProbeString(
        sourceAudio,
        'start_time',
        'sourceAudio.start_time',
      ),
      durationTs: requireProbeNumber(
        sourceAudio,
        'duration_ts',
        'sourceAudio.duration_ts',
      ),
      duration: requireProbeString(
        sourceAudio,
        'duration',
        'sourceAudio.duration',
      ),
      packetCount: {
        value: parseCountedPacketCount(sourceAudio),
        source: 'ffprobe-count_packets',
      },
      packetStreamSha256: {
        value: packetStreamHashes.sourceAudio,
        source: 'stream-copy-sha256',
      },
    },
    container: {
      duration: requireProbeString(format, 'duration', 'format.duration'),
      faststart: {moovBeforeMdat: true, source: 'parsed-atom-order'},
    },
    strictDecode: {
      passed: true,
      source: 'ffmpeg-xerror-full-decode',
    },
  };
};

const projectRootFromModule = (): string => {
  const parent = resolve(__dirname, '..');
  return basename(parent) === '.tools-dist' ? resolve(parent, '..') : parent;
};

const repositoryPath = (projectRoot: string, absolutePath: string): string => {
  const localPath = relative(projectRoot, absolutePath).split(sep).join('/');
  if (
    localPath.length === 0 ||
    localPath === '..' ||
    localPath.startsWith('../')
  ) {
    throw new Error('Delivery path must remain inside the project root');
  }
  return `projects/tanisea-lyric-film/${localPath}`;
};

const runDeliveryVerificationCli = async (): Promise<void> => {
  const projectRoot = projectRootFromModule();
  const {kind, deliveryPath} = parseDeliveryCliArgs(
    process.argv.slice(2),
    projectRoot,
  );
  const sourceAudioPath = resolve(projectRoot, 'public', 'soundtrack.m4a');
  const plan = createDeliveryVerificationPlan({
    kind,
    deliveryPath,
    sourceAudioPath,
  });

  const deliveryProbe = parseProbe(runTextCommand(plan.probe, projectRoot));
  runStrictDecode(plan.strictDecode, projectRoot);

  let metadata: UnknownRecord;
  if (kind === 'reference') {
    metadata = await buildReferenceMetadata(deliveryPath, deliveryProbe);
    verifyReferenceDeliveryMetadata(metadata);
  } else {
    const sourceProbe = parseProbe(
      runTextCommand(probeCommand(sourceAudioPath), projectRoot),
    );
    const packetStreamHashes: {
      delivery?: string;
      sourceAudio?: string;
    } = {};
    for (const hashPlan of plan.packetStreamHashes) {
      const hash = parsePacketStreamSha256(
        runTextCommand(hashPlan.command, projectRoot),
      );
      if (hashPlan.owner === 'delivery') packetStreamHashes.delivery = hash;
      if (hashPlan.owner === 'source-audio') {
        packetStreamHashes.sourceAudio = hash;
      }
    }
    if (
      packetStreamHashes.delivery === undefined ||
      packetStreamHashes.sourceAudio === undefined
    ) {
      throw new Error('Both delivery and source AAC packet hashes are required');
    }

    verifyFastStartAtoms(await parseTopLevelAtomsFromFile(deliveryPath));
    metadata = await buildPublicOrProofMetadata(
      kind,
      deliveryPath,
      deliveryProbe,
      sourceProbe,
      {
        delivery: packetStreamHashes.delivery,
        sourceAudio: packetStreamHashes.sourceAudio,
      },
    );
    const {verifyDeliveryMetadata} = await import('./release-gates.js');
    validatePublicOrProofDelivery(metadata, kind, verifyDeliveryMetadata);
  }

  const sizeBytes = (await stat(deliveryPath)).size;
  process.stdout.write(
    `${JSON.stringify(
      {
        kind,
        path: repositoryPath(projectRoot, deliveryPath),
        sizeBytes,
        ...metadata,
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
  void runDeliveryVerificationCli().catch((error: unknown) => {
    process.stderr.write(
      `${error instanceof Error ? error.message : String(error)}\n`,
    );
    process.exitCode = 1;
  });
}
