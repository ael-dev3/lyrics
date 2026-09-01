import {Readable} from 'node:stream';
import {join, resolve} from 'node:path';
import {describe, expect, test, vi} from 'vitest';
import {verifyDeliveryMetadata} from '../scripts/release-gates';

const importIo = vi.hoisted(() => {
  const currentProbe = {
    streams: [
      {
        codec_type: 'video',
        codec_name: 'hevc',
        codec_tag_string: 'hvc1',
        width: 1080,
        height: 1080,
        pix_fmt: 'yuv420p10le',
        color_range: 'tv',
        color_space: 'bt709',
        color_transfer: 'bt709',
        color_primaries: 'bt709',
        avg_frame_rate: '60/1',
        start_time: '0.000000',
        duration: '153.000000',
        nb_frames: '9180',
        sample_rate: '44100',
        channels: 2,
      },
      {
        codec_type: 'audio',
        codec_name: 'aac',
        sample_rate: '44100',
        channels: 2,
      },
    ],
    format: {duration: '153.000000', start_time: '0.000000'},
  };
  const execFileSync = vi.fn(
    (executable: string, argumentsList: readonly string[]): string => {
      if (executable === 'ffprobe') return JSON.stringify(currentProbe);
      if (argumentsList.includes('streamhash')) {
        return `0,a,${'b'.repeat(64)}\n`;
      }
      return '';
    },
  );
  const spawnSync = vi.fn(() => ({
    status: 0,
    stderr: '{"input_i":"-10.0","input_tp":"-1.0"}',
  }));
  const openSync = vi.fn(() => 71);
  const readSync = vi.fn((...parameters: readonly unknown[]): number => {
    const target = parameters[1] as Buffer;
    const atoms = Buffer.from('0000moov0000mdat', 'latin1');
    atoms.copy(target);
    return atoms.length;
  });
  const closeSync = vi.fn();
  const readFileSync = vi.fn(() => Buffer.from('legacy whole-file read'));
  const statSync = vi.fn(() => ({size: 22}));
  const stdoutWrite = vi.spyOn(process.stdout, 'write');
  stdoutWrite.mockImplementation(() => true);

  return {
    closeSync,
    execFileSync,
    openSync,
    readFileSync,
    readSync,
    spawnSync,
    statSync,
    stdoutWrite,
  };
});

vi.mock('node:child_process', async (importOriginal) => ({
  ...(await importOriginal<typeof import('node:child_process')>()),
  execFileSync: importIo.execFileSync,
  spawnSync: importIo.spawnSync,
}));

vi.mock('node:fs', async (importOriginal) => ({
  ...(await importOriginal<typeof import('node:fs')>()),
  closeSync: importIo.closeSync,
  openSync: importIo.openSync,
  readFileSync: importIo.readFileSync,
  readSync: importIo.readSync,
  statSync: importIo.statSync,
}));

import * as deliveryVerificationModule from '../scripts/verify-delivery';

const importSideEffects = {
  childProcesses:
    importIo.execFileSync.mock.calls.length + importIo.spawnSync.mock.calls.length,
  fileReads:
    importIo.openSync.mock.calls.length +
    importIo.readSync.mock.calls.length +
    importIo.readFileSync.mock.calls.length +
    importIo.statSync.mock.calls.length,
  stdoutWrites: importIo.stdoutWrite.mock.calls.length,
};
importIo.stdoutWrite.mockRestore();

type DeliveryKind = 'reference' | 'public' | 'proof';
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

type DeliveryVerificationApi = Readonly<{
  parseDeliveryCliArgs: (
    argumentsList: readonly string[],
    projectRoot: string,
  ) => Readonly<{kind: DeliveryKind; deliveryPath: string}>;
  createDeliveryVerificationPlan: (options: Readonly<{
    kind: DeliveryKind;
    deliveryPath: string;
    sourceAudioPath: string;
  }>) => DeliveryVerificationPlan;
  parseDecodedFrameCount: (stream: unknown) => number;
  parseCountedPacketCount: (stream: unknown) => number;
  validatePublicOrProofDelivery: (
    metadata: unknown,
    kind: PublicDeliveryKind,
    verifier: (actual: unknown, actualKind: PublicDeliveryKind) => void,
  ) => void;
  verifyReferenceDeliveryMetadata: (metadata: unknown) => void;
  parseTopLevelAtoms: (
    bytes: Uint8Array,
  ) => readonly Readonly<{type: string; offset: number; size: number}>[];
  verifyFastStart: (bytes: Uint8Array) => void;
  sha256FileStreaming: (
    path: string,
    dependencies?: Readonly<{
      createReadStream: (path: string) => AsyncIterable<Uint8Array | string>;
    }>,
  ) => Promise<string>;
}>;

const deliveryVerification =
  deliveryVerificationModule as unknown as Partial<DeliveryVerificationApi>;

const requireApi = <Name extends keyof DeliveryVerificationApi>(
  name: Name,
): DeliveryVerificationApi[Name] => {
  const value = deliveryVerification[name];
  expect(value, `verify-delivery must export ${name}`).toBeTypeOf('function');
  return value as DeliveryVerificationApi[Name];
};

const validDelivery = (kind: PublicDeliveryKind) => ({
  artifactId: kind === 'public' ? 'public-master' : 'sync-proof',
  fileSha256: {
    value: (kind === 'public' ? '4' : '5').repeat(64),
    source: 'sha256-file',
  },
  video: {
    codecName: kind === 'public' ? 'hevc' : 'h264',
    codecTag: kind === 'public' ? 'hvc1' : 'avc1',
    width: 1080,
    height: 1080,
    avgFrameRate: kind === 'public' ? '60/1' : '120/1',
    realFrameRate: kind === 'public' ? '60/1' : '120/1',
    decodedFrameCount: {
      value: kind === 'public' ? 9180 : 18360,
      source: 'ffprobe-count_frames',
    },
    pixelFormat: kind === 'public' ? 'yuv420p10le' : 'yuv420p',
    sampleAspectRatio: '1:1',
    colorRange: 'tv',
    colorSpace: 'bt709',
    colorTransfer: 'bt709',
    colorPrimaries: 'bt709',
    startTime: '0.000000',
    duration: '153.000000',
  },
  audio: {
    codecName: 'aac',
    sampleRate: '44100',
    channels: 2,
    channelLayout: 'stereo',
    timeBase: '1/44100',
    startPts: 0,
    startTime: '0.000000',
    durationTs: 6_747_300,
    duration: '153.000000',
    packetCount: {value: 6590, source: 'ffprobe-count_packets'},
    packetStreamSha256: {
      value: 'b'.repeat(64),
      source: 'stream-copy-sha256',
    },
  },
  sourceAudio: {
    timeBase: '1/44100',
    startPts: 0,
    startTime: '0.000000',
    durationTs: 6_747_300,
    duration: '153.000000',
    packetCount: {value: 6590, source: 'ffprobe-count_packets'},
    packetStreamSha256: {
      value: 'b'.repeat(64),
      source: 'stream-copy-sha256',
    },
  },
  container: {
    duration: '153.000000',
    faststart: {moovBeforeMdat: true, source: 'parsed-atom-order'},
  },
  strictDecode: {passed: true, source: 'ffmpeg-xerror-full-decode'},
});

const validReference = () => ({
  artifactId: 'reference-render',
  fileSha256: {value: '3'.repeat(64), source: 'sha256-file'},
  video: {
    codecName: 'prores',
    profile: '4444',
    codecTag: 'ap4h',
    width: 2160,
    height: 2160,
    avgFrameRate: '60/1',
    realFrameRate: '60/1',
    decodedFrameCount: {value: 9180, source: 'ffprobe-count_frames'},
    pixelFormat: 'yuv444p12le',
    sampleAspectRatio: '1:1',
    colorRange: 'tv',
    colorSpace: 'bt709',
    colorTransfer: 'bt709',
    colorPrimaries: 'bt709',
    startTime: '0.000000',
    duration: '153.000000',
  },
  container: {duration: '153.000000'},
  strictDecode: {passed: true, source: 'ffmpeg-xerror-full-decode'},
});

const atom = (type: string, payload = Buffer.alloc(0)): Buffer => {
  const bytes = Buffer.alloc(8 + payload.length);
  bytes.writeUInt32BE(bytes.length, 0);
  bytes.write(type, 4, 4, 'ascii');
  payload.copy(bytes, 8);
  return bytes;
};

const extendedAtom = (type: string, payload = Buffer.alloc(0)): Buffer => {
  const bytes = Buffer.alloc(16 + payload.length);
  bytes.writeUInt32BE(1, 0);
  bytes.write(type, 4, 4, 'ascii');
  bytes.writeBigUInt64BE(BigInt(bytes.length), 8);
  payload.copy(bytes, 16);
  return bytes;
};

describe('verify-delivery import and CLI contract', () => {
  test('performs no child-process, filesystem, or stdout I/O on import', () => {
    expect(importSideEffects).toEqual({
      childProcesses: 0,
      fileReads: 0,
      stdoutWrites: 0,
    });
  });

  test.each([
    ['reference', 'Tanisea-Lyric-Film-vNext-reference-2x.mov'],
    ['public', 'Tanisea-Lyric-Film-vNext-60fps-Archival-Master.mp4'],
    ['proof', 'Tanisea-Lyric-Film-Sync-Proof-120fps.mp4'],
  ] as const)('maps exact --kind %s to its canonical output path', (kind, file) => {
    const projectRoot = resolve('fixture-project');
    const parseDeliveryCliArgs = requireApi('parseDeliveryCliArgs');

    expect(parseDeliveryCliArgs(['--kind', kind], projectRoot)).toEqual({
      kind,
      deliveryPath: join(projectRoot, 'output', file),
    });
  });

  test.each([
    [[]],
    [['--kind']],
    [['--kind', 'preview']],
    [['--kind=public']],
    [['--platform-safe']],
    [['--kind', 'public', 'output/custom.mp4']],
    [['--kind', 'public', '--kind', 'proof']],
  ] as const)(
    'rejects non-exact CLI arguments %j',
    (argumentsList) => {
      const parseDeliveryCliArgs = requireApi('parseDeliveryCliArgs');
      expect(() => parseDeliveryCliArgs(argumentsList, resolve('fixture-project')))
        .toThrow(/kind|argument|usage/i);
    },
  );
});

describe('delivery command plans', () => {
  test.each(['reference', 'public', 'proof'] as const)(
    'counts decoded frames and packets in the %s ffprobe plan',
    (kind) => {
      const createDeliveryVerificationPlan = requireApi(
        'createDeliveryVerificationPlan',
      );
      const deliveryPath = `output/${kind}.mov`;
      const plan = createDeliveryVerificationPlan({
        kind,
        deliveryPath,
        sourceAudioPath: 'public/soundtrack.m4a',
      });

      expect(plan.probe).toEqual({
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
          deliveryPath,
        ],
      });
    },
  );

  test.each([
    ['reference', ['-map', '0:v:0']],
    ['public', ['-map', '0:v:0', '-map', '0:a:0']],
    ['proof', ['-map', '0:v:0', '-map', '0:a:0']],
  ] as const)('strictly decodes every selected %s stream with -xerror', (kind, maps) => {
    const createDeliveryVerificationPlan = requireApi(
      'createDeliveryVerificationPlan',
    );
    const deliveryPath = `output/${kind}.mov`;
    const plan = createDeliveryVerificationPlan({
      kind,
      deliveryPath,
      sourceAudioPath: 'public/soundtrack.m4a',
    });

    expect(plan.strictDecode).toEqual({
      executable: 'ffmpeg',
      arguments: [
        '-v',
        'error',
        '-xerror',
        '-i',
        deliveryPath,
        ...maps,
        '-f',
        'null',
        '-',
      ],
    });
  });

  test.each(['public', 'proof'] as const)(
    'plans source and delivery AAC packet-stream identity for %s',
    (kind) => {
      const createDeliveryVerificationPlan = requireApi(
        'createDeliveryVerificationPlan',
      );
      const deliveryPath = `output/${kind}.mp4`;
      const sourceAudioPath = 'public/soundtrack.m4a';
      const plan = createDeliveryVerificationPlan({
        kind,
        deliveryPath,
        sourceAudioPath,
      });
      const hashArguments = (path: string) => [
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
      ];

      expect(plan.packetStreamHashes).toEqual([
        {
          owner: 'source-audio',
          command: {
            executable: 'ffmpeg',
            arguments: hashArguments(sourceAudioPath),
          },
        },
        {
          owner: 'delivery',
          command: {
            executable: 'ffmpeg',
            arguments: hashArguments(deliveryPath),
          },
        },
      ]);
    },
  );

  test('does not plan an AAC packet identity for the muted reference', () => {
    const createDeliveryVerificationPlan = requireApi(
      'createDeliveryVerificationPlan',
    );
    const plan = createDeliveryVerificationPlan({
      kind: 'reference',
      deliveryPath: 'output/reference.mov',
      sourceAudioPath: 'public/soundtrack.m4a',
    });

    expect(plan.packetStreamHashes).toEqual([]);
  });
});

describe('authoritative counted evidence', () => {
  test('uses nb_read_frames even when nb_frames disagrees', () => {
    const parseDecodedFrameCount = requireApi('parseDecodedFrameCount');
    expect(
      parseDecodedFrameCount({nb_read_frames: '9180', nb_frames: '1'}),
    ).toBe(9180);
  });

  test('rejects nb_frames as a decoded-frame fallback', () => {
    const parseDecodedFrameCount = requireApi('parseDecodedFrameCount');
    expect(() => parseDecodedFrameCount({nb_frames: '9180'})).toThrow(
      /nb_read_frames|decoded/i,
    );
  });

  test('uses nb_read_packets even when nb_packets disagrees', () => {
    const parseCountedPacketCount = requireApi('parseCountedPacketCount');
    expect(
      parseCountedPacketCount({nb_read_packets: '6590', nb_packets: '1'}),
    ).toBe(6590);
  });

  test('rejects nb_packets as a counted-packet fallback', () => {
    const parseCountedPacketCount = requireApi('parseCountedPacketCount');
    expect(() => parseCountedPacketCount({nb_packets: '6590'})).toThrow(
      /nb_read_packets|counted/i,
    );
  });
});

describe('collected delivery metadata validation', () => {
  test.each(['public', 'proof'] as const)(
    'passes exact %s metadata through the pure release verifier',
    (kind) => {
      const validatePublicOrProofDelivery = requireApi(
        'validatePublicOrProofDelivery',
      );
      const metadata = validDelivery(kind);

      expect(() =>
        validatePublicOrProofDelivery(
          metadata,
          kind,
          verifyDeliveryMetadata,
        ),
      ).not.toThrow();
    },
  );

  test.each(['public', 'proof'] as const)(
    'preserves %s decoded-count provenance for the pure release verifier',
    (kind) => {
      const validatePublicOrProofDelivery = requireApi(
        'validatePublicOrProofDelivery',
      );
      const metadata = validDelivery(kind);
      const adverse = {
        ...metadata,
        video: {
          ...metadata.video,
          decodedFrameCount: {
            ...metadata.video.decodedFrameCount,
            source: 'ffprobe-nb_frames',
          },
        },
      };

      expect(() =>
        validatePublicOrProofDelivery(
          adverse,
          kind,
          verifyDeliveryMetadata,
        ),
      ).toThrow(/video\.decodedFrameCount\.source/);
    },
  );
});

describe('reference delivery metadata', () => {
  test('accepts the exact reference ProRes 4444 delivery', () => {
    const verifyReferenceDeliveryMetadata = requireApi(
      'verifyReferenceDeliveryMetadata',
    );
    expect(() => verifyReferenceDeliveryMetadata(validReference())).not.toThrow();
  });

  test.each([
    ['artifactId', (value: ReturnType<typeof validReference>) => ({...value, artifactId: 'other'})],
    ['fileSha256.value', (value: ReturnType<typeof validReference>) => ({...value, fileSha256: {...value.fileSha256, value: 'not-a-hash'}})],
    ['fileSha256.source', (value: ReturnType<typeof validReference>) => ({...value, fileSha256: {...value.fileSha256, source: 'read-file-sync'}})],
    ['video.codecName', (value: ReturnType<typeof validReference>) => ({...value, video: {...value.video, codecName: 'hevc'}})],
    ['video.profile', (value: ReturnType<typeof validReference>) => ({...value, video: {...value.video, profile: '422 HQ'}})],
    ['video.codecTag', (value: ReturnType<typeof validReference>) => ({...value, video: {...value.video, codecTag: 'ap4x'}})],
    ['video.width', (value: ReturnType<typeof validReference>) => ({...value, video: {...value.video, width: 1080}})],
    ['video.height', (value: ReturnType<typeof validReference>) => ({...value, video: {...value.video, height: 1080}})],
    ['video.avgFrameRate', (value: ReturnType<typeof validReference>) => ({...value, video: {...value.video, avgFrameRate: '60000/1001'}})],
    ['video.realFrameRate', (value: ReturnType<typeof validReference>) => ({...value, video: {...value.video, realFrameRate: '60000/1001'}})],
    ['video.decodedFrameCount.value', (value: ReturnType<typeof validReference>) => ({...value, video: {...value.video, decodedFrameCount: {...value.video.decodedFrameCount, value: 9179}}})],
    ['video.decodedFrameCount.source', (value: ReturnType<typeof validReference>) => ({...value, video: {...value.video, decodedFrameCount: {...value.video.decodedFrameCount, source: 'ffprobe-nb_frames'}}})],
    ['video.pixelFormat', (value: ReturnType<typeof validReference>) => ({...value, video: {...value.video, pixelFormat: 'yuv422p10le'}})],
    ['video.sampleAspectRatio', (value: ReturnType<typeof validReference>) => ({...value, video: {...value.video, sampleAspectRatio: '4:3'}})],
    ['video.colorRange', (value: ReturnType<typeof validReference>) => ({...value, video: {...value.video, colorRange: 'pc'}})],
    ['video.colorSpace', (value: ReturnType<typeof validReference>) => ({...value, video: {...value.video, colorSpace: 'bt2020nc'}})],
    ['video.colorTransfer', (value: ReturnType<typeof validReference>) => ({...value, video: {...value.video, colorTransfer: 'smpte2084'}})],
    ['video.colorPrimaries', (value: ReturnType<typeof validReference>) => ({...value, video: {...value.video, colorPrimaries: 'bt2020'}})],
    ['video.startTime', (value: ReturnType<typeof validReference>) => ({...value, video: {...value.video, startTime: '0.001000'}})],
    ['video.duration', (value: ReturnType<typeof validReference>) => ({...value, video: {...value.video, duration: '152.999000'}})],
    ['container.duration', (value: ReturnType<typeof validReference>) => ({...value, container: {duration: '152.999000'}})],
    ['strictDecode.passed', (value: ReturnType<typeof validReference>) => ({...value, strictDecode: {...value.strictDecode, passed: false}})],
    ['strictDecode.source', (value: ReturnType<typeof validReference>) => ({...value, strictDecode: {...value.strictDecode, source: 'ffmpeg-full-decode'}})],
  ] as const)('rejects adverse reference %s evidence', (field, mutate) => {
    const verifyReferenceDeliveryMetadata = requireApi(
      'verifyReferenceDeliveryMetadata',
    );
    expect(() => verifyReferenceDeliveryMetadata(mutate(validReference()))).toThrow(
      new RegExp(field.replaceAll('.', '\\.')),
    );
  });
});

describe('top-level atom parsing', () => {
  test('does not treat a fake moov substring inside mdat as a top-level atom', () => {
    const parseTopLevelAtoms = requireApi('parseTopLevelAtoms');
    const verifyFastStart = requireApi('verifyFastStart');
    const bytes = Buffer.concat([
      atom('ftyp', Buffer.from('isom')),
      atom('mdat', Buffer.from('prefixmoovsuffix')),
    ]);

    expect(parseTopLevelAtoms(bytes)).toEqual([
      {type: 'ftyp', offset: 0, size: 12},
      {type: 'mdat', offset: 12, size: 24},
    ]);
    expect(() => verifyFastStart(bytes)).toThrow(/moov|faststart/i);
  });

  test('accepts an actual top-level moov atom before mdat', () => {
    const parseTopLevelAtoms = requireApi('parseTopLevelAtoms');
    const verifyFastStart = requireApi('verifyFastStart');
    const bytes = Buffer.concat([atom('ftyp', Buffer.from('isom')), atom('moov'), atom('mdat')]);

    expect(parseTopLevelAtoms(bytes)).toEqual([
      {type: 'ftyp', offset: 0, size: 12},
      {type: 'moov', offset: 12, size: 8},
      {type: 'mdat', offset: 20, size: 8},
    ]);
    expect(() => verifyFastStart(bytes)).not.toThrow();
  });

  test('parses an extended-size top-level atom structurally', () => {
    const parseTopLevelAtoms = requireApi('parseTopLevelAtoms');
    const verifyFastStart = requireApi('verifyFastStart');
    const bytes = Buffer.concat([
      atom('ftyp', Buffer.from('isom')),
      extendedAtom('moov', Buffer.from('index')),
      atom('mdat'),
    ]);

    expect(parseTopLevelAtoms(bytes)).toEqual([
      {type: 'ftyp', offset: 0, size: 12},
      {type: 'moov', offset: 12, size: 21},
      {type: 'mdat', offset: 33, size: 8},
    ]);
    expect(() => verifyFastStart(bytes)).not.toThrow();
  });

  test.each([
    ['truncated header', Buffer.alloc(7)],
    [
      'atom smaller than its header',
      (() => {
        const bytes = Buffer.alloc(8);
        bytes.writeUInt32BE(4, 0);
        bytes.write('moov', 4, 4, 'ascii');
        return bytes;
      })(),
    ],
    [
      'declared atom beyond input',
      (() => {
        const bytes = Buffer.alloc(8);
        bytes.writeUInt32BE(32, 0);
        bytes.write('moov', 4, 4, 'ascii');
        return bytes;
      })(),
    ],
    [
      'truncated extended-size header',
      (() => {
        const bytes = Buffer.alloc(12);
        bytes.writeUInt32BE(1, 0);
        bytes.write('moov', 4, 4, 'ascii');
        return bytes;
      })(),
    ],
  ] as const)('rejects malformed %s', (_case, bytes) => {
    const parseTopLevelAtoms = requireApi('parseTopLevelAtoms');
    expect(() => parseTopLevelAtoms(bytes)).toThrow(/atom|size|truncat/i);
  });
});

describe('streaming file identity', () => {
  test('returns the known SHA-256 from chunked stream input', async () => {
    const sha256FileStreaming = requireApi('sha256FileStreaming');
    const requestedPaths: string[] = [];
    const hash = await sha256FileStreaming('virtual/abc.bin', {
      createReadStream: (path) => {
        requestedPaths.push(path);
        return Readable.from([
          Buffer.from('a'),
          Buffer.from('b'),
          Buffer.from('c'),
        ]);
      },
    });

    expect(requestedPaths).toEqual(['virtual/abc.bin']);
    expect(hash).toBe(
      'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad',
    );
  });
});
