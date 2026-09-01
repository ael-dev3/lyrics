import {createHash} from 'node:crypto';
import {createElement} from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {describe, expect, test} from 'vitest';
import {
  verifyDeliveryMetadata,
  verifyPublicMarkup,
  verifyRequirementMatrix,
} from '../scripts/release-gates';
import * as releaseGates from '../scripts/release-gates';
import {FrameChrome} from '../src/components/FrameChrome';

const SHA256 = 'a'.repeat(64);
const QA_COMPARISON_RECORD = {
  matched: true,
  authoritativeRunId: 'run-2',
  recordPath:
    'projects/tanisea-lyric-film/work/qa/run-2/run-comparison.json',
  unexplainedDrift: [],
} as const;
const qaJsonSha256 = (value: unknown): string =>
  createHash('sha256')
    .update(`${JSON.stringify(value, null, 2)}\n`)
    .digest('hex');
const QA_COMPARISON_SHA256 = qaJsonSha256(QA_COMPARISON_RECORD);

const validDelivery = (kind: 'public' | 'proof') => ({
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

const requirementEvidence = (
  criterionId: number,
  mode: 'baseline' | 'prepublication' | 'final',
  runId: 'run-1' | 'run-2' = 'run-2',
  runLogSha256: string = SHA256,
) => {
  if (criterionId === 11 && mode === 'final') {
    return {
      id: 'criterion-11-evidence-01',
      kind: 'release-url',
      artifact: 'https://github.com/ael-dev3/lyrics/releases/tag/v2.0.0',
      sha256: '',
      value: 'v2.0.0 release publication verified',
    };
  }

  const authorities: Record<number, {kind: string; artifact: string}> = {
    1: {
      kind: 'source-audio',
      artifact: 'projects/tanisea-lyric-film/public/soundtrack.m4a',
    },
    2: {
      kind: 'test-result',
      artifact:
        `projects/tanisea-lyric-film/work/qa/${runId}/logs/check.log`,
    },
    3: {
      kind: 'alignment-manifest',
      artifact:
        'projects/tanisea-lyric-film/alignment/tanisea-word-alignment-v3.json',
    },
    4: {
      kind: 'alignment-manifest',
      artifact:
        'projects/tanisea-lyric-film/alignment/tanisea-word-alignment-v3.json',
    },
    5: {
      kind: 'semantic-map',
      artifact:
        'projects/tanisea-lyric-film/alignment/tanisea-word-alignment-v3.json',
    },
    6: {
      kind: 'semantic-map',
      artifact:
        'projects/tanisea-lyric-film/alignment/tanisea-word-alignment-v3.json',
    },
    7: {
      kind: 'cadence-verification',
      artifact:
        `projects/tanisea-lyric-film/work/qa/${runId}/logs/verify-public.log`,
    },
    8: {
      kind: 'public-markup',
      artifact:
        `projects/tanisea-lyric-film/work/qa/${runId}/logs/verify-public-markup.log`,
    },
    9: {
      kind: 'layout-verification',
      artifact:
        `projects/tanisea-lyric-film/work/qa/${runId}/logs/layout-verify.log`,
    },
    10: {
      kind: 'qa-run-comparison',
      artifact:
        'projects/tanisea-lyric-film/work/qa/run-2/run-comparison.json',
    },
    11: {
      kind: 'publication-readiness',
      artifact:
        'projects/tanisea-lyric-film/output/Tanisea-Lyric-Film-vNext-60fps-Archival-Master.mp4',
    },
  };
  const authority = authorities[criterionId];
  if (!authority) throw new Error(`Missing evidence authority ${criterionId}`);

  return {
    id: `criterion-${String(criterionId).padStart(2, '0')}-evidence-01`,
    ...authority,
    sha256:
      criterionId === 10
        ? QA_COMPARISON_SHA256
        : [2, 7, 8, 9].includes(criterionId)
          ? runLogSha256
          : SHA256,
    value: `criterion ${criterionId} verified`,
  };
};

const requirementMatrix = (
  mode: 'baseline' | 'prepublication' | 'final',
  runId: 'run-1' | 'run-2' = 'run-2',
  runLogSha256: string = SHA256,
) => ({
  criteria: Array.from({length: 11}, (_, index) => {
    const criterionId = index + 1;
    const primaryEvidence = requirementEvidence(
      criterionId,
      mode,
      runId,
      runLogSha256,
    );
    return {
      id: criterionId,
      title: `Criterion ${criterionId}`,
      status:
        mode === 'baseline' && criterionId === 10
          ? 'pending-repeat'
          : mode !== 'final' && criterionId === 11
          ? 'pending-publication'
          : 'proved',
      evidence:
        criterionId === 7
          ? [
              primaryEvidence,
              {
                ...primaryEvidence,
                id: 'criterion-07-evidence-02',
                artifact:
                  `projects/tanisea-lyric-film/work/qa/${runId}/logs/verify-proof.log`,
              },
            ]
          : criterionId === 8 || criterionId === 9
            ? [
                primaryEvidence,
                {
                  id: `criterion-0${criterionId}-evidence-02`,
                  kind: 'encoded-frame',
                  artifact:
                    `projects/tanisea-lyric-film/work/qa/${runId}/selected-frames/` +
                    `${criterionId === 8 ? 'chrome' : 'safe-area'}.png`,
                  sha256: (criterionId === 8 ? 'c' : 'f').repeat(64),
                  value: `criterion ${criterionId} encoded frame verified`,
                },
              ]
            : [primaryEvidence],
    };
  }),
});

const criterion = (
  matrix: ReturnType<typeof requirementMatrix>,
  id: number,
) => {
  const result = matrix.criteria.find((entry) => entry.id === id);
  if (!result) throw new Error(`Missing test fixture criterion ${id}`);
  return result;
};

const publicFrameMarkup = renderToStaticMarkup(
  createElement(FrameChrome, {time: 64.06}),
);

const withoutAttribute = (
  markup: string,
  attribute: string,
  value: string,
): string => {
  const token = ` ${attribute}="${value}"`;
  const result = markup.replace(token, '');
  if (result === markup) {
    throw new Error(`Missing fixture attribute ${attribute}=${value}`);
  }
  return result;
};

const withRootAttribute = (markup: string, attribute: string): string =>
  markup.replace(
    'data-frame-chrome="public"',
    `data-frame-chrome="public" ${attribute}`,
  );

describe('delivery-metadata release gate', () => {
  test('accepts valid public delivery metadata', () => {
    expect(() =>
      verifyDeliveryMetadata(validDelivery('public'), 'public'),
    ).not.toThrow();
  });

  test('accepts valid proof delivery metadata', () => {
    expect(() =>
      verifyDeliveryMetadata(validDelivery('proof'), 'proof'),
    ).not.toThrow();
  });

  test('rejects an unknown delivery kind', () => {
    expect(() =>
      verifyDeliveryMetadata(validDelivery('public'), 'preview' as never),
    ).toThrow(/^Delivery metadata: unsupported kind preview\b/);
  });

  test.each([
    ['public', 'non-object', 'not-metadata', /^Public delivery metadata: must be an object\b/],
    ['proof', 'null', null, /^Proof delivery metadata: must be an object\b/],
  ] as const)(
    'rejects %s %s delivery metadata',
    (kind, _case, candidate, expected) => {
      expect(() => verifyDeliveryMetadata(candidate, kind)).toThrow(expected);
    },
  );

  test('rejects public delivery metadata with missing video', () => {
    const candidate: Record<string, unknown> = {...validDelivery('public')};
    delete candidate.video;

    expect(() => verifyDeliveryMetadata(candidate, 'public')).toThrow(
      /^Public delivery metadata: video must be an object\b/,
    );
  });

  test.each([
    ['public', 'null', null, /^Public delivery metadata: video must be an object\b/],
    ['proof', 'non-object', 'not-video', /^Proof delivery metadata: video must be an object\b/],
    ['public', 'array', [], /^Public delivery metadata: video must be an object\b/],
  ] as const)(
    'rejects %s delivery metadata with %s video',
    (kind, _case, video, expected) => {
      expect(() =>
        verifyDeliveryMetadata({...validDelivery(kind), video}, kind),
      ).toThrow(expected);
    },
  );

  test.each([
    ['public', 'codecName', 'h264', /^Public delivery metadata: video\.codecName\b/],
    ['proof', 'codecName', 'hevc', /^Proof delivery metadata: video\.codecName\b/],
    ['public', 'codecTag', 'avc1', /^Public delivery metadata: video\.codecTag\b/],
    ['proof', 'codecTag', 'hvc1', /^Proof delivery metadata: video\.codecTag\b/],
    ['public', 'width', 1920, /^Public delivery metadata: video\.width\b/],
    ['proof', 'width', 1920, /^Proof delivery metadata: video\.width\b/],
    ['public', 'height', 1920, /^Public delivery metadata: video\.height\b/],
    ['proof', 'height', 1920, /^Proof delivery metadata: video\.height\b/],
    ['public', 'avgFrameRate', '120/1', /^Public delivery metadata: video\.avgFrameRate\b/],
    ['proof', 'avgFrameRate', '60/1', /^Proof delivery metadata: video\.avgFrameRate\b/],
    ['public', 'realFrameRate', '120/1', /^Public delivery metadata: video\.realFrameRate\b/],
    ['proof', 'realFrameRate', '60/1', /^Proof delivery metadata: video\.realFrameRate\b/],
    ['public', 'pixelFormat', 'yuv420p', /^Public delivery metadata: video\.pixelFormat\b/],
    ['proof', 'pixelFormat', 'yuv420p10le', /^Proof delivery metadata: video\.pixelFormat\b/],
  ] as const)(
    'rejects %s delivery metadata with wrong video.%s',
    (kind, field, value, expected) => {
      const delivery = validDelivery(kind);

      expect(() =>
        verifyDeliveryMetadata(
          {...delivery, video: {...delivery.video, [field]: value}},
          kind,
        ),
      ).toThrow(expected);
    },
  );

  test.each([
    ['public', 9179, /^Public delivery metadata: video\.decodedFrameCount\.value\b/],
    ['proof', 18359, /^Proof delivery metadata: video\.decodedFrameCount\.value\b/],
  ] as const)(
    'rejects %s delivery metadata with wrong video.decodedFrameCount.value',
    (kind, value, expected) => {
      const delivery = validDelivery(kind);

      expect(() =>
        verifyDeliveryMetadata(
          {
            ...delivery,
            video: {
              ...delivery.video,
              decodedFrameCount: {
                ...delivery.video.decodedFrameCount,
                value,
              },
            },
          },
          kind,
        ),
      ).toThrow(expected);
    },
  );

  test.each([
    ['public', 'sampleAspectRatio', '4:3', /^Public delivery metadata: video\.sampleAspectRatio\b/],
    ['proof', 'sampleAspectRatio', '4:3', /^Proof delivery metadata: video\.sampleAspectRatio\b/],
    ['public', 'colorRange', 'pc', /^Public delivery metadata: video\.colorRange\b/],
    ['proof', 'colorRange', 'pc', /^Proof delivery metadata: video\.colorRange\b/],
    ['public', 'colorSpace', 'bt2020nc', /^Public delivery metadata: video\.colorSpace\b/],
    ['proof', 'colorSpace', 'bt2020nc', /^Proof delivery metadata: video\.colorSpace\b/],
    ['public', 'colorTransfer', 'smpte2084', /^Public delivery metadata: video\.colorTransfer\b/],
    ['proof', 'colorTransfer', 'smpte2084', /^Proof delivery metadata: video\.colorTransfer\b/],
    ['public', 'colorPrimaries', 'bt2020', /^Public delivery metadata: video\.colorPrimaries\b/],
    ['proof', 'colorPrimaries', 'bt2020', /^Proof delivery metadata: video\.colorPrimaries\b/],
    ['public', 'startTime', '0.001000', /^Public delivery metadata: video\.startTime\b/],
    ['proof', 'startTime', '0.001000', /^Proof delivery metadata: video\.startTime\b/],
    ['public', 'duration', '152.999000', /^Public delivery metadata: video\.duration\b/],
    ['proof', 'duration', '152.999000', /^Proof delivery metadata: video\.duration\b/],
  ] as const)(
    'rejects %s delivery metadata with wrong video.%s',
    (kind, field, value, expected) => {
      const delivery = validDelivery(kind);

      expect(() =>
        verifyDeliveryMetadata(
          {...delivery, video: {...delivery.video, [field]: value}},
          kind,
        ),
      ).toThrow(expected);
    },
  );

  test.each([
    ['public', /^Public delivery metadata: container\.duration\b/],
    ['proof', /^Proof delivery metadata: container\.duration\b/],
  ] as const)(
    'rejects %s delivery metadata with wrong container.duration',
    (kind, expected) => {
      const delivery = validDelivery(kind);

      expect(() =>
        verifyDeliveryMetadata(
          {
            ...delivery,
            container: {...delivery.container, duration: '152.999000'},
          },
          kind,
        ),
      ).toThrow(expected);
    },
  );

  test.each([
    ['public', 9180, /^Public delivery metadata: video\.decodedFrameCount\b/],
    ['proof', 18360, /^Proof delivery metadata: video\.decodedFrameCount\b/],
  ] as const)(
    'rejects %s delivery metadata missing decodedFrameCount despite fallback evidence',
    (kind, nbFrames, expected) => {
      const delivery = validDelivery(kind);
      const video: Partial<typeof delivery.video> & {
        nbFrames: number;
        requestedFlags: readonly string[];
      } = {
        ...delivery.video,
        nbFrames,
        requestedFlags: ['-count_frames', '-count_packets'],
      };
      delete video.decodedFrameCount;

      expect(() =>
        verifyDeliveryMetadata({...delivery, video}, kind),
      ).toThrow(expected);
    },
  );

  test.each([
    ['public', 'ffprobe-nb_frames', /^Public delivery metadata: video\.decodedFrameCount\.source\b/],
    ['proof', 'requested-count-frames', /^Proof delivery metadata: video\.decodedFrameCount\.source\b/],
  ] as const)(
    'rejects %s delivery metadata with decodedFrameCount source %s',
    (kind, source, expected) => {
      const delivery = validDelivery(kind);

      expect(() =>
        verifyDeliveryMetadata(
          {
            ...delivery,
            video: {
              ...delivery.video,
              decodedFrameCount: {
                ...delivery.video.decodedFrameCount,
                source,
              },
            },
          },
          kind,
        ),
      ).toThrow(expected);
    },
  );

  test.each([
    ['public', /^Public delivery metadata: video\.width\b/],
    ['proof', /^Proof delivery metadata: video\.width\b/],
  ] as const)(
    'rejects %s delivery metadata with string video.width',
    (kind, expected) => {
      const delivery = validDelivery(kind);

      expect(() =>
        verifyDeliveryMetadata(
          {...delivery, video: {...delivery.video, width: '1080'}},
          kind,
        ),
      ).toThrow(expected);
    },
  );

  test.each([
    ['public', '9180', /^Public delivery metadata: video\.decodedFrameCount\.value\b/],
    ['proof', '18360', /^Proof delivery metadata: video\.decodedFrameCount\.value\b/],
  ] as const)(
    'rejects %s delivery metadata with string decodedFrameCount.value',
    (kind, value, expected) => {
      const delivery = validDelivery(kind);

      expect(() =>
        verifyDeliveryMetadata(
          {
            ...delivery,
            video: {
              ...delivery.video,
              decodedFrameCount: {
                ...delivery.video.decodedFrameCount,
                value,
              },
            },
          },
          kind,
        ),
      ).toThrow(expected);
    },
  );

  test.each([
    ['public', /^Public delivery metadata: video\.startTime\b/],
    ['proof', /^Proof delivery metadata: video\.startTime\b/],
  ] as const)(
    'rejects %s delivery metadata with numeric video.startTime',
    (kind, expected) => {
      const delivery = validDelivery(kind);

      expect(() =>
        verifyDeliveryMetadata(
          {...delivery, video: {...delivery.video, startTime: 0}},
          kind,
        ),
      ).toThrow(expected);
    },
  );

  test.each([
    ['public', /^Public delivery metadata: video\.duration\b/],
    ['proof', /^Proof delivery metadata: video\.duration\b/],
  ] as const)(
    'rejects %s delivery metadata with numeric video.duration',
    (kind, expected) => {
      const delivery = validDelivery(kind);

      expect(() =>
        verifyDeliveryMetadata(
          {...delivery, video: {...delivery.video, duration: 153}},
          kind,
        ),
      ).toThrow(expected);
    },
  );

  test.each([
    ['public', /^Public delivery metadata: container\.duration\b/],
    ['proof', /^Proof delivery metadata: container\.duration\b/],
  ] as const)(
    'rejects %s delivery metadata with numeric container.duration',
    (kind, expected) => {
      const delivery = validDelivery(kind);

      expect(() =>
        verifyDeliveryMetadata(
          {...delivery, container: {...delivery.container, duration: 153}},
          kind,
        ),
      ).toThrow(expected);
    },
  );

  test.each([
    ['public', 'audio', /^Public delivery metadata: audio must be an object\b/],
    ['proof', 'audio', /^Proof delivery metadata: audio must be an object\b/],
    ['public', 'sourceAudio', /^Public delivery metadata: sourceAudio must be an object\b/],
    ['proof', 'sourceAudio', /^Proof delivery metadata: sourceAudio must be an object\b/],
    ['public', 'container', /^Public delivery metadata: container must be an object\b/],
    ['proof', 'container', /^Proof delivery metadata: container must be an object\b/],
    ['public', 'strictDecode', /^Public delivery metadata: strictDecode must be an object\b/],
    ['proof', 'strictDecode', /^Proof delivery metadata: strictDecode must be an object\b/],
  ] as const)(
    'rejects %s delivery metadata missing %s',
    (kind, field, expected) => {
      const candidate: Record<string, unknown> = {...validDelivery(kind)};
      delete candidate[field];

      expect(() => verifyDeliveryMetadata(candidate, kind)).toThrow(expected);
    },
  );

  test.each([
    ['public', 'audio', null, /^Public delivery metadata: audio must be an object\b/],
    ['proof', 'audio', [], /^Proof delivery metadata: audio must be an object\b/],
    ['public', 'sourceAudio', null, /^Public delivery metadata: sourceAudio must be an object\b/],
    ['proof', 'sourceAudio', [], /^Proof delivery metadata: sourceAudio must be an object\b/],
    ['public', 'container', null, /^Public delivery metadata: container must be an object\b/],
    ['proof', 'container', [], /^Proof delivery metadata: container must be an object\b/],
    ['public', 'strictDecode', null, /^Public delivery metadata: strictDecode must be an object\b/],
    ['proof', 'strictDecode', [], /^Proof delivery metadata: strictDecode must be an object\b/],
  ] as const)(
    'rejects %s delivery metadata with malformed %s',
    (kind, field, value, expected) => {
      expect(() =>
        verifyDeliveryMetadata({...validDelivery(kind), [field]: value}, kind),
      ).toThrow(expected);
    },
  );

  test.each([
    ['public', /^Public delivery metadata: container\.faststart must be an object\b/],
    ['proof', /^Proof delivery metadata: container\.faststart must be an object\b/],
  ] as const)(
    'rejects %s delivery metadata missing container.faststart',
    (kind, expected) => {
      const delivery = validDelivery(kind);
      const container: Record<string, unknown> = {...delivery.container};
      delete container.faststart;

      expect(() =>
        verifyDeliveryMetadata({...delivery, container}, kind),
      ).toThrow(expected);
    },
  );

  test.each([
    ['public', null, /^Public delivery metadata: container\.faststart must be an object\b/],
    ['proof', [], /^Proof delivery metadata: container\.faststart must be an object\b/],
  ] as const)(
    'rejects %s delivery metadata with malformed container.faststart',
    (kind, faststart, expected) => {
      const delivery = validDelivery(kind);

      expect(() =>
        verifyDeliveryMetadata(
          {...delivery, container: {...delivery.container, faststart}},
          kind,
        ),
      ).toThrow(expected);
    },
  );

  test.each([
    ['public', 'codecName', 'mp3', /^Public delivery metadata: audio\.codecName\b/],
    ['proof', 'codecName', 'mp3', /^Proof delivery metadata: audio\.codecName\b/],
    ['public', 'sampleRate', '48000', /^Public delivery metadata: audio\.sampleRate\b/],
    ['proof', 'sampleRate', '48000', /^Proof delivery metadata: audio\.sampleRate\b/],
    ['public', 'channels', 1, /^Public delivery metadata: audio\.channels\b/],
    ['proof', 'channels', 1, /^Proof delivery metadata: audio\.channels\b/],
    ['public', 'channelLayout', 'mono', /^Public delivery metadata: audio\.channelLayout\b/],
    ['proof', 'channelLayout', 'mono', /^Proof delivery metadata: audio\.channelLayout\b/],
    ['public', 'sampleRate', 44100, /^Public delivery metadata: audio\.sampleRate\b/],
    ['proof', 'sampleRate', 44100, /^Proof delivery metadata: audio\.sampleRate\b/],
    ['public', 'channels', '2', /^Public delivery metadata: audio\.channels\b/],
    ['proof', 'channels', '2', /^Proof delivery metadata: audio\.channels\b/],
  ] as const)(
    'rejects %s delivery metadata with invalid audio.%s',
    (kind, field, value, expected) => {
      const delivery = validDelivery(kind);

      expect(() =>
        verifyDeliveryMetadata(
          {...delivery, audio: {...delivery.audio, [field]: value}},
          kind,
        ),
      ).toThrow(expected);
    },
  );

  test.each([
    ['public', 'audio', /^Public delivery metadata: audio\.packetCount\b/],
    ['proof', 'audio', /^Proof delivery metadata: audio\.packetCount\b/],
    ['public', 'sourceAudio', /^Public delivery metadata: sourceAudio\.packetCount\b/],
    ['proof', 'sourceAudio', /^Proof delivery metadata: sourceAudio\.packetCount\b/],
  ] as const)(
    'rejects %s delivery metadata missing %s.packetCount',
    (kind, owner, expected) => {
      const delivery = validDelivery(kind);
      const stream: Record<string, unknown> = {...delivery[owner]};
      delete stream.packetCount;

      expect(() =>
        verifyDeliveryMetadata({...delivery, [owner]: stream}, kind),
      ).toThrow(expected);
    },
  );

  test.each([
    ['public', 'audio', /^Public delivery metadata: audio\.packetCount\.value\b/],
    ['proof', 'audio', /^Proof delivery metadata: audio\.packetCount\.value\b/],
    ['public', 'sourceAudio', /^Public delivery metadata: sourceAudio\.packetCount\.value\b/],
    ['proof', 'sourceAudio', /^Proof delivery metadata: sourceAudio\.packetCount\.value\b/],
  ] as const)(
    'rejects %s delivery metadata missing %s.packetCount.value',
    (kind, owner, expected) => {
      const delivery = validDelivery(kind);
      const packetCount: Record<string, unknown> = {
        ...delivery[owner].packetCount,
      };
      delete packetCount.value;

      expect(() =>
        verifyDeliveryMetadata(
          {
            ...delivery,
            [owner]: {...delivery[owner], packetCount},
          },
          kind,
        ),
      ).toThrow(expected);
    },
  );

  test.each([
    ['public', 'audio', 0, /^Public delivery metadata: audio\.packetCount\.value\b/],
    ['proof', 'audio', 0, /^Proof delivery metadata: audio\.packetCount\.value\b/],
    ['public', 'audio', -1, /^Public delivery metadata: audio\.packetCount\.value\b/],
    ['proof', 'audio', -1, /^Proof delivery metadata: audio\.packetCount\.value\b/],
    ['public', 'audio', '6590', /^Public delivery metadata: audio\.packetCount\.value\b/],
    ['proof', 'audio', '6590', /^Proof delivery metadata: audio\.packetCount\.value\b/],
    ['public', 'sourceAudio', 0, /^Public delivery metadata: sourceAudio\.packetCount\.value\b/],
    ['proof', 'sourceAudio', 0, /^Proof delivery metadata: sourceAudio\.packetCount\.value\b/],
    ['public', 'sourceAudio', -1, /^Public delivery metadata: sourceAudio\.packetCount\.value\b/],
    ['proof', 'sourceAudio', -1, /^Proof delivery metadata: sourceAudio\.packetCount\.value\b/],
    ['public', 'sourceAudio', '6590', /^Public delivery metadata: sourceAudio\.packetCount\.value\b/],
    ['proof', 'sourceAudio', '6590', /^Proof delivery metadata: sourceAudio\.packetCount\.value\b/],
  ] as const)(
    'rejects %s delivery metadata with invalid %s.packetCount.value %s',
    (kind, owner, value, expected) => {
      const delivery = validDelivery(kind);

      expect(() =>
        verifyDeliveryMetadata(
          {
            ...delivery,
            [owner]: {
              ...delivery[owner],
              packetCount: {...delivery[owner].packetCount, value},
            },
          },
          kind,
        ),
      ).toThrow(expected);
    },
  );

  test.each([
    ['public', /^Public delivery metadata: audio\.packetCount\b/],
    ['proof', /^Proof delivery metadata: audio\.packetCount\b/],
  ] as const)(
    'rejects %s delivery metadata with mismatched audio packet count',
    (kind, expected) => {
      const delivery = validDelivery(kind);

      expect(() =>
        verifyDeliveryMetadata(
          {
            ...delivery,
            audio: {
              ...delivery.audio,
              packetCount: {...delivery.audio.packetCount, value: 6589},
            },
          },
          kind,
        ),
      ).toThrow(expected);
    },
  );

  test.each([
    ['public', 'audio', 'ffprobe-count_packets ', /^Public delivery metadata: audio\.packetCount\.source\b/],
    ['proof', 'audio', 'requested-count-packets', /^Proof delivery metadata: audio\.packetCount\.source\b/],
    ['public', 'sourceAudio', 'ffprobe-count-frames', /^Public delivery metadata: sourceAudio\.packetCount\.source\b/],
    ['proof', 'sourceAudio', 'requested-count-packets', /^Proof delivery metadata: sourceAudio\.packetCount\.source\b/],
  ] as const)(
    'rejects %s delivery metadata with %s.packetCount source %s',
    (kind, owner, source, expected) => {
      const delivery = validDelivery(kind);

      expect(() =>
        verifyDeliveryMetadata(
          {
            ...delivery,
            [owner]: {
              ...delivery[owner],
              packetCount: {...delivery[owner].packetCount, source},
            },
          },
          kind,
        ),
      ).toThrow(expected);
    },
  );

  test.each([
    ['public', 'audio', /^Public delivery metadata: audio\.packetStreamSha256\b/],
    ['proof', 'audio', /^Proof delivery metadata: audio\.packetStreamSha256\b/],
    ['public', 'sourceAudio', /^Public delivery metadata: sourceAudio\.packetStreamSha256\b/],
    ['proof', 'sourceAudio', /^Proof delivery metadata: sourceAudio\.packetStreamSha256\b/],
  ] as const)(
    'rejects %s delivery metadata missing %s.packetStreamSha256',
    (kind, owner, expected) => {
      const delivery = validDelivery(kind);
      const stream: Record<string, unknown> = {...delivery[owner]};
      delete stream.packetStreamSha256;

      expect(() =>
        verifyDeliveryMetadata({...delivery, [owner]: stream}, kind),
      ).toThrow(expected);
    },
  );

  test.each([
    ['public', 'audio', /^Public delivery metadata: audio\.packetStreamSha256\.value\b/],
    ['proof', 'audio', /^Proof delivery metadata: audio\.packetStreamSha256\.value\b/],
    ['public', 'sourceAudio', /^Public delivery metadata: sourceAudio\.packetStreamSha256\.value\b/],
    ['proof', 'sourceAudio', /^Proof delivery metadata: sourceAudio\.packetStreamSha256\.value\b/],
  ] as const)(
    'rejects %s delivery metadata missing %s.packetStreamSha256.value',
    (kind, owner, expected) => {
      const delivery = validDelivery(kind);
      const packetStreamSha256: Record<string, unknown> = {
        ...delivery[owner].packetStreamSha256,
      };
      delete packetStreamSha256.value;

      expect(() =>
        verifyDeliveryMetadata(
          {
            ...delivery,
            [owner]: {...delivery[owner], packetStreamSha256},
          },
          kind,
        ),
      ).toThrow(expected);
    },
  );

  test.each([
    ['public', 'audio', 'non-string', 42, /^Public delivery metadata: audio\.packetStreamSha256\.value\b/],
    ['proof', 'audio', 'non-string', 42, /^Proof delivery metadata: audio\.packetStreamSha256\.value\b/],
    ['public', 'audio', 'short', 'b'.repeat(63), /^Public delivery metadata: audio\.packetStreamSha256\.value\b/],
    ['proof', 'audio', 'short', 'b'.repeat(63), /^Proof delivery metadata: audio\.packetStreamSha256\.value\b/],
    ['public', 'audio', 'malformed', 'g'.repeat(64), /^Public delivery metadata: audio\.packetStreamSha256\.value\b/],
    ['proof', 'audio', 'malformed', 'g'.repeat(64), /^Proof delivery metadata: audio\.packetStreamSha256\.value\b/],
    ['public', 'audio', 'uppercase', 'B'.repeat(64), /^Public delivery metadata: audio\.packetStreamSha256\.value\b/],
    ['proof', 'audio', 'uppercase', 'B'.repeat(64), /^Proof delivery metadata: audio\.packetStreamSha256\.value\b/],
    ['public', 'sourceAudio', 'non-string', 42, /^Public delivery metadata: sourceAudio\.packetStreamSha256\.value\b/],
    ['proof', 'sourceAudio', 'non-string', 42, /^Proof delivery metadata: sourceAudio\.packetStreamSha256\.value\b/],
    ['public', 'sourceAudio', 'short', 'b'.repeat(63), /^Public delivery metadata: sourceAudio\.packetStreamSha256\.value\b/],
    ['proof', 'sourceAudio', 'short', 'b'.repeat(63), /^Proof delivery metadata: sourceAudio\.packetStreamSha256\.value\b/],
    ['public', 'sourceAudio', 'malformed', 'g'.repeat(64), /^Public delivery metadata: sourceAudio\.packetStreamSha256\.value\b/],
    ['proof', 'sourceAudio', 'malformed', 'g'.repeat(64), /^Proof delivery metadata: sourceAudio\.packetStreamSha256\.value\b/],
    ['public', 'sourceAudio', 'uppercase', 'B'.repeat(64), /^Public delivery metadata: sourceAudio\.packetStreamSha256\.value\b/],
    ['proof', 'sourceAudio', 'uppercase', 'B'.repeat(64), /^Proof delivery metadata: sourceAudio\.packetStreamSha256\.value\b/],
  ] as const)(
    'rejects %s delivery metadata with %s %s.packetStreamSha256.value',
    (kind, owner, _case, value, expected) => {
      const delivery = validDelivery(kind);

      expect(() =>
        verifyDeliveryMetadata(
          {
            ...delivery,
            [owner]: {
              ...delivery[owner],
              packetStreamSha256: {
                ...delivery[owner].packetStreamSha256,
                value,
              },
            },
          },
          kind,
        ),
      ).toThrow(expected);
    },
  );

  test.each([
    ['public', /^Public delivery metadata: audio\.packetStreamSha256\b/],
    ['proof', /^Proof delivery metadata: audio\.packetStreamSha256\b/],
  ] as const)(
    'rejects %s delivery metadata with mismatched packet-stream SHA-256',
    (kind, expected) => {
      const delivery = validDelivery(kind);

      expect(() =>
        verifyDeliveryMetadata(
          {
            ...delivery,
            audio: {
              ...delivery.audio,
              packetStreamSha256: {
                ...delivery.audio.packetStreamSha256,
                value: 'c'.repeat(64),
              },
            },
          },
          kind,
        ),
      ).toThrow(expected);
    },
  );

  test.each([
    ['public', 'audio', 'stream-copy-sha256 ', /^Public delivery metadata: audio\.packetStreamSha256\.source\b/],
    ['proof', 'audio', 'ffmpeg-streamhash-sha256', /^Proof delivery metadata: audio\.packetStreamSha256\.source\b/],
    ['public', 'sourceAudio', 'stream-copy', /^Public delivery metadata: sourceAudio\.packetStreamSha256\.source\b/],
    ['proof', 'sourceAudio', 'requested-stream-copy-sha256', /^Proof delivery metadata: sourceAudio\.packetStreamSha256\.source\b/],
  ] as const)(
    'rejects %s delivery metadata with %s.packetStreamSha256 source %s',
    (kind, owner, source, expected) => {
      const delivery = validDelivery(kind);

      expect(() =>
        verifyDeliveryMetadata(
          {
            ...delivery,
            [owner]: {
              ...delivery[owner],
              packetStreamSha256: {
                ...delivery[owner].packetStreamSha256,
                source,
              },
            },
          },
          kind,
        ),
      ).toThrow(expected);
    },
  );

  test.each([
    ['public', 'audio', 'startPts', 1],
    ['proof', 'audio', 'startTime', '0.000023'],
    ['public', 'sourceAudio', 'timeBase', '1/48000'],
    ['proof', 'sourceAudio', 'durationTs', 6_747_301],
    ['public', 'audio', 'duration', '153.000023'],
  ] as const)(
    'rejects %s delivery metadata with shifted %s.%s timing',
    (kind, owner, field, value) => {
      const delivery = validDelivery(kind);

      expect(() =>
        verifyDeliveryMetadata(
          {
            ...delivery,
            [owner]: {...delivery[owner], [field]: value},
          },
          kind,
        ),
      ).toThrow(
        new RegExp(
          `^${kind === 'public' ? 'Public' : 'Proof'} delivery metadata: ${owner}\\.${field}\\b`,
        ),
      );
    },
  );

  test.each([
    ['public', false, /^Public delivery metadata: container\.faststart\.moovBeforeMdat\b/],
    ['proof', false, /^Proof delivery metadata: container\.faststart\.moovBeforeMdat\b/],
    ['public', 'true', /^Public delivery metadata: container\.faststart\.moovBeforeMdat\b/],
    ['proof', 1, /^Proof delivery metadata: container\.faststart\.moovBeforeMdat\b/],
  ] as const)(
    'rejects %s delivery metadata with container.faststart.moovBeforeMdat %s',
    (kind, moovBeforeMdat, expected) => {
      const delivery = validDelivery(kind);

      expect(() =>
        verifyDeliveryMetadata(
          {
            ...delivery,
            container: {
              ...delivery.container,
              faststart: {
                ...delivery.container.faststart,
                moovBeforeMdat,
              },
            },
          },
          kind,
        ),
      ).toThrow(expected);
    },
  );

  test.each([
    ['public', /^Public delivery metadata: container\.faststart\.source\b/],
    ['proof', /^Proof delivery metadata: container\.faststart\.source\b/],
  ] as const)(
    'rejects %s delivery metadata with requested-flag-only faststart evidence',
    (kind, expected) => {
      const delivery = validDelivery(kind);

      expect(() =>
        verifyDeliveryMetadata(
          {
            ...delivery,
            container: {
              ...delivery.container,
              faststart: {
                moovBeforeMdat: true,
                source: 'requested-movflags-faststart',
                requestedFlags: ['-movflags', '+faststart'],
              },
            },
          },
          kind,
        ),
      ).toThrow(expected);
    },
  );

  test.each([
    ['public', false, /^Public delivery metadata: strictDecode\.passed\b/],
    ['proof', false, /^Proof delivery metadata: strictDecode\.passed\b/],
    ['public', 'true', /^Public delivery metadata: strictDecode\.passed\b/],
    ['proof', 1, /^Proof delivery metadata: strictDecode\.passed\b/],
  ] as const)(
    'rejects %s delivery metadata with strictDecode.passed %s',
    (kind, passed, expected) => {
      const delivery = validDelivery(kind);

      expect(() =>
        verifyDeliveryMetadata(
          {...delivery, strictDecode: {...delivery.strictDecode, passed}},
          kind,
        ),
      ).toThrow(expected);
    },
  );

  test.each([
    ['public', 'non-xerror full decode', 'ffmpeg-full-decode', /^Public delivery metadata: strictDecode\.source\b/],
    ['proof', 'requested policy', 'requested-ffmpeg-xerror-policy', /^Proof delivery metadata: strictDecode\.source\b/],
  ] as const)(
    'rejects %s delivery metadata with %s strictDecode provenance',
    (kind, _case, source, expected) => {
      const delivery = validDelivery(kind);

      expect(() =>
        verifyDeliveryMetadata(
          {...delivery, strictDecode: {...delivery.strictDecode, source}},
          kind,
        ),
      ).toThrow(expected);
    },
  );
});

describe('public-markup release gate', () => {
  test('accepts the actual public FrameChrome contract at 01:04.06', () => {
    expect(() => verifyPublicMarkup(publicFrameMarkup)).not.toThrow();
  });

  test.each([
    ['blank', '   ', /nonempty string/],
    ['non-string', 64.06, /nonempty string/],
    ['malformed', '<div data-frame-chrome="public">', /malformed markup/],
  ])('rejects %s markup input', (_label, markup, expected) => {
    expect(() => verifyPublicMarkup(markup)).toThrow(expected);
  });

  test.each([
    [
      'public root',
      withoutAttribute(publicFrameMarkup, 'data-frame-chrome', 'public'),
      /public frame-chrome root/,
    ],
    [
      'frame border',
      withoutAttribute(
        publicFrameMarkup,
        'data-frame-chrome-border',
        'frame',
      ),
      /frame border/,
    ],
    [
      'identity',
      publicFrameMarkup.replace('TANISEA // KSVIETY', 'TANISEA'),
      /TANISEA \/\/ KSVIETY/,
    ],
    [
      'lower track label',
      publicFrameMarkup.replace(
        'TRACK 01 · ENGLISH LYRIC FILM · VNEXT',
        'TRACK 01',
      ),
      /lower track label/,
    ],
    [
      'lower track-label position',
      publicFrameMarkup.replace('bottom:43px', 'top:43px'),
      /lower track label/,
    ],
    [
      'timecode',
      publicFrameMarkup.replace('01:04.06', '01:04.05'),
      /01:04\.06/,
    ],
  ])('rejects markup missing the required %s', (_label, markup, expected) => {
    expect(() => verifyPublicMarkup(markup)).toThrow(expected);
  });

  test.each(['top-left', 'top-right', 'bottom-left', 'bottom-right'])(
    'rejects a missing %s corner',
    (corner) => {
      expect(() =>
        verifyPublicMarkup(
          withoutAttribute(
            publicFrameMarkup,
            'data-frame-chrome-corner',
            corner,
          ),
        ),
      ).toThrow(/frame-chrome corners/);
    },
  );

  test.each([
    [
      'duplicate',
      `${publicFrameMarkup}<div data-frame-chrome-corner="top-left"></div>`,
    ],
    [
      'unknown',
      publicFrameMarkup.replace(
        'data-frame-chrome-corner="top-left"',
        'data-frame-chrome-corner="centre"',
      ),
    ],
  ])('rejects a %s corner', (_label, markup) => {
    expect(() => verifyPublicMarkup(markup)).toThrow(/frame-chrome corners/);
  });

  test.each(['identity', 'track-label', 'timecode'])(
    'rejects a missing %s slot',
    (slot) => {
      expect(() =>
        verifyPublicMarkup(
          withoutAttribute(
            publicFrameMarkup,
            'data-frame-chrome-slot',
            slot,
          ),
        ),
      ).toThrow(/frame-chrome slots/);
    },
  );

  test.each([
    [
      'duplicate',
      `${publicFrameMarkup}<div data-frame-chrome-slot="identity"></div>`,
    ],
    [
      'unknown',
      publicFrameMarkup.replace(
        'data-frame-chrome-slot="identity"',
        'data-frame-chrome-slot="telemetry"',
      ),
    ],
  ])('rejects a %s slot', (_label, markup) => {
    expect(() => verifyPublicMarkup(markup)).toThrow(/frame-chrome slots/);
  });

  test.each([
    ['RMS', '<span>RMS -7.1</span>', /RMS/],
    ['dBFS', '<span>-7.1 dBFS</span>', /dBFS/],
    ['PK', '<span>PK -0.2</span>', /PK/],
    ['PEAK', '<span>PEAK -0.2</span>', /PEAK/],
    ['FPS', '<span>60 FPS</span>', /FPS/],
  ])('rejects rendered %s telemetry', (_label, diagnostic, expected) => {
    expect(() => verifyPublicMarkup(`${publicFrameMarkup}${diagnostic}`)).toThrow(
      expected,
    );
  });

  test('rejects an explicit top-right PEAK diagnostic label', () => {
    expect(() =>
      verifyPublicMarkup(
        `${publicFrameMarkup}<span data-frame-chrome-slot="top-right-diagnostic">PEAK -0.2 dBFS</span>`,
      ),
    ).toThrow();
  });

  test('accepts ordinary lyric markup containing the word peak', () => {
    expect(() =>
      verifyPublicMarkup(
        `${publicFrameMarkup}<span data-lyric-token="ordinary">I'll bend every mountain peak</span>`,
      ),
    ).not.toThrow();
  });

  test.each([
    ['diagnostic', 'data-frame-diagnostic="rms"', /diagnostic data attribute/],
    ['telemetry', 'data-frame-telemetry="peak"', /telemetry data attribute/],
    ['global rail', 'data-global-rail="public"', /global rail/],
    ['upper rail', 'data-rail="upper"', /upper rail/],
    ['reactive rail', 'data-spectrum-rail="reactive"', /reactive rail/],
  ])('rejects a rendered %s data attribute', (_label, attribute, expected) => {
    expect(() =>
      verifyPublicMarkup(withRootAttribute(publicFrameMarkup, attribute)),
    ).toThrow(expected);
  });

  test('rejects a top-positioned public spectrum rail', () => {
    expect(() =>
      verifyPublicMarkup(
        `${publicFrameMarkup}<div data-spectrum-rail="public" style="position:absolute;top:112px"></div>`,
      ),
    ).toThrow(/top-positioned rail/);
  });

  test('accepts a separately appended bottom-positioned public spectrum rail', () => {
    expect(() =>
      verifyPublicMarkup(
        `${publicFrameMarkup}<div data-spectrum-rail="public" style="position:absolute;bottom:68px"></div>`,
      ),
    ).not.toThrow();
  });
});

describe('requirement-matrix release gate', () => {
  test('accepts criterion 10 pending-repeat only for a baseline run', () => {
    const matrix = requirementMatrix('prepublication');
    criterion(matrix, 10).status = 'pending-repeat';

    expect(() =>
      qaReleaseGates.verifyRequirementMatrix(matrix, 'baseline' as never),
    ).not.toThrow();
    expect(() =>
      qaReleaseGates.verifyRequirementMatrix(matrix, 'prepublication'),
    ).toThrow(/Criterion 10.*prepublication.*proved.*pending-repeat/i);
  });

  test('accepts exactly criteria 1-10 proved and criterion 11 pending-publication in prepublication mode', () => {
    expect(() =>
      verifyRequirementMatrix(requirementMatrix('prepublication'), 'prepublication'),
    ).not.toThrow();
  });

  test('accepts exactly criteria 1-11 proved in final mode', () => {
    expect(() =>
      verifyRequirementMatrix(requirementMatrix('final'), 'final'),
    ).not.toThrow();
  });

  test.each([
    [8, 'public-markup', 'encoded-frame'],
    [9, 'layout-verification', 'encoded-frame'],
  ] as const)(
    'requires criterion %s to include both %s and %s evidence',
    (criterionId, _primaryKind, requiredKind) => {
      const matrix = requirementMatrix('prepublication');
      criterion(matrix, criterionId).evidence.splice(1, 1);

      expect(() => verifyRequirementMatrix(matrix, 'prepublication')).toThrow(
        new RegExp(`Criterion ${criterionId}.*${requiredKind}`),
      );
    },
  );

  test('attributes a missing criterion to its exact ID', () => {
    const matrix = requirementMatrix('prepublication');
    matrix.criteria.splice(6, 1);

    expect(() => verifyRequirementMatrix(matrix, 'prepublication')).toThrow(
      'Criterion 7: missing',
    );
  });

  test('attributes a duplicate criterion to its exact ID', () => {
    const matrix = requirementMatrix('prepublication');
    matrix.criteria.push({...criterion(matrix, 4)});

    expect(() => verifyRequirementMatrix(matrix, 'prepublication')).toThrow(
      'Criterion 4: duplicate ID',
    );
  });

  test('attributes an unknown criterion to its exact ID', () => {
    const matrix = requirementMatrix('prepublication');
    criterion(matrix, 11).id = 12;

    expect(() => verifyRequirementMatrix(matrix, 'prepublication')).toThrow(
      'Criterion 12: unknown ID',
    );
  });

  test('requires a nonempty authoritative evidence array for each criterion', () => {
    const matrix = requirementMatrix('prepublication');
    criterion(matrix, 3).evidence = [];

    expect(() => verifyRequirementMatrix(matrix, 'prepublication')).toThrow(
      'Criterion 3: evidence must be a nonempty array',
    );
  });

  test.each([
    ['id', {id: '   '}],
    ['kind', {kind: ''}],
    ['artifact', {artifact: ''}],
  ] as const)(
    'attributes a missing authoritative evidence %s field to criterion and entry',
    (field, replacement) => {
      const matrix = requirementMatrix('prepublication');
      Object.assign(criterion(matrix, 5).evidence[0]!, replacement);

      expect(() => verifyRequirementMatrix(matrix, 'prepublication')).toThrow(
        `Criterion 5 evidence[0]: ${field} must be a nonempty string`,
      );
    },
  );

  test.each([
    'C:/private/qa/report.json',
    'C:\\private\\qa\\report.json',
    '/private/qa/report.json',
    '\\\\server\\share\\report.json',
  ])('rejects absolute public evidence artifact %s', (artifact) => {
    const matrix = requirementMatrix('prepublication');
    criterion(matrix, 6).evidence[0]!.artifact = artifact;

    expect(() => verifyRequirementMatrix(matrix, 'prepublication')).toThrow(
      'Criterion 6 evidence[0]: artifact must be repository-relative',
    );
  });

  test('requires a valid SHA-256 for non-release evidence even with a value detail', () => {
    const matrix = requirementMatrix('prepublication');
    const evidence = criterion(matrix, 8).evidence[0]!;
    evidence.sha256 = '';
    evidence.value = '   ';

    expect(() => verifyRequirementMatrix(matrix, 'prepublication')).toThrow(
      'Criterion 8 evidence[0]: sha256 must be 64 lowercase hexadecimal characters',
    );
  });

  test('rejects a malformed SHA-256 even when a value is present', () => {
    const matrix = requirementMatrix('prepublication');
    criterion(matrix, 9).evidence[0]!.sha256 = 'not-a-sha256';

    expect(() => verifyRequirementMatrix(matrix, 'prepublication')).toThrow(
      'Criterion 9 evidence[0]: sha256 must be 64 lowercase hexadecimal characters',
    );
  });

  test('attributes a prepublication pending status before criterion 11', () => {
    const matrix = requirementMatrix('prepublication');
    criterion(matrix, 4).status = 'pending-publication';

    expect(() => verifyRequirementMatrix(matrix, 'prepublication')).toThrow(
      'Criterion 4: prepublication status must be proved, got pending-publication',
    );
  });

  test('requires criterion 11 to remain exactly pending-publication before publication', () => {
    const matrix = requirementMatrix('prepublication');
    criterion(matrix, 11).status = 'proved';

    expect(() => verifyRequirementMatrix(matrix, 'prepublication')).toThrow(
      'Criterion 11: prepublication status must be pending-publication, got proved',
    );
  });

  test('rejects an unsupported status with exact criterion attribution', () => {
    const matrix = requirementMatrix('final');
    criterion(matrix, 2).status = 'unsupported';

    expect(() => verifyRequirementMatrix(matrix, 'final')).toThrow(
      'Criterion 2: unsupported status unsupported',
    );
  });

  test('requires every criterion to be proved in final mode', () => {
    const matrix = requirementMatrix('final');
    criterion(matrix, 11).status = 'pending-publication';

    expect(() => verifyRequirementMatrix(matrix, 'final')).toThrow(
      'Criterion 11: final status must be proved, got pending-publication',
    );
  });

  test('rejects an unsupported matrix mode before evaluating criteria', () => {
    expect(() =>
      verifyRequirementMatrix(requirementMatrix('final'), 'draft' as never),
    ).toThrow('Unsupported requirement-matrix mode: draft');
  });

  test('attributes a non-integer criterion ID to its exact structural index', () => {
    const matrix = requirementMatrix('prepublication');
    matrix.criteria[3]!.id = 4.5;

    expect(() => verifyRequirementMatrix(matrix, 'prepublication')).toThrow(
      'Requirement matrix criteria[3]: criterion ID must be an integer, got 4.5',
    );
  });

  test.each([
    ['missing', (matrix: ReturnType<typeof requirementMatrix>) => {
      delete (criterion(matrix, 3) as {title?: string}).title;
    }],
    ['blank', (matrix: ReturnType<typeof requirementMatrix>) => {
      criterion(matrix, 3).title = '   ';
    }],
  ] as const)(
    'rejects a %s criterion title with exact attribution',
    (_label, mutate) => {
      const matrix = requirementMatrix('prepublication');
      mutate(matrix);

      expect(() => verifyRequirementMatrix(matrix, 'prepublication')).toThrow(
        'Criterion 3: title must be a nonempty string',
      );
    },
  );

  test('rejects a blank criterion status with exact attribution', () => {
    const matrix = requirementMatrix('prepublication');
    criterion(matrix, 2).status = '   ';

    expect(() => verifyRequirementMatrix(matrix, 'prepublication')).toThrow(
      'Criterion 2: status must be a nonempty string',
    );
  });

  test('rejects a duplicate evidence ID across criteria with both locations', () => {
    const matrix = requirementMatrix('prepublication');
    criterion(matrix, 6).evidence[0]!.id =
      criterion(matrix, 5).evidence[0]!.id;

    expect(() => verifyRequirementMatrix(matrix, 'prepublication')).toThrow(
      'Criterion 6 evidence[0]: duplicate evidence ID criterion-05-evidence-01 (first used by Criterion 5 evidence[0])',
    );
  });

  test.each([
    'audits/../private/report.json',
    'audits\\..\\private\\report.json',
  ])('rejects path traversal in evidence artifact %s', (artifact) => {
    const matrix = requirementMatrix('prepublication');
    criterion(matrix, 6).evidence[0]!.artifact = artifact;

    expect(() => verifyRequirementMatrix(matrix, 'prepublication')).toThrow(
      'Criterion 6 evidence[0]: artifact must be repository-relative',
    );
  });

  test('rejects URL evidence before publication', () => {
    const matrix = requirementMatrix('prepublication');
    Object.assign(criterion(matrix, 11).evidence[0]!, {
      kind: 'release-url',
      artifact: 'https://github.com/ael-dev3/lyrics/releases/tag/v2.0.0',
      value: 'v2.0.0 release publication verified',
    });

    expect(() => verifyRequirementMatrix(matrix, 'prepublication')).toThrow(
      'Criterion 11 evidence[0]: unsupported kind release-url; expected publication-readiness',
    );
  });

  test('accepts a published release URL for criterion 11 in final mode', () => {
    const matrix = requirementMatrix('final');
    criterion(matrix, 11).evidence[0]!.artifact =
      'https://github.com/ael-dev3/lyrics/releases/tag/v2.0.0';

    expect(() => verifyRequirementMatrix(matrix, 'final')).not.toThrow();
  });

  test('rejects a URL outside publication criterion 11 in final mode', () => {
    const matrix = requirementMatrix('final');
    criterion(matrix, 10).evidence[0]!.artifact =
      'https://github.com/example/project/actions/runs/123';

    expect(() => verifyRequirementMatrix(matrix, 'final')).toThrow(
      'Criterion 10 evidence[0]: artifact must be repository-relative',
    );
  });

  test.each([
    'C:/private/qa/report.json',
    'C:\\private\\qa\\report.json',
    '/private/qa/report.json',
    '\\\\server\\share\\report.json',
    'audits/../private/report.json',
  ])('rejects local or traversing final evidence artifact %s', (artifact) => {
    const matrix = requirementMatrix('final');
    criterion(matrix, 11).evidence[0]!.artifact = artifact;

    expect(() => verifyRequirementMatrix(matrix, 'final')).toThrow(
      'Criterion 11 evidence[0]: release-url artifact must be an HTTPS GitHub release URL for ael-dev3/lyrics',
    );
  });

  test('attributes a malformed criterion object to its structural index', () => {
    const matrix = requirementMatrix('prepublication');
    matrix.criteria[2] = null as never;

    expect(() => verifyRequirementMatrix(matrix, 'prepublication')).toThrow(
      'Requirement matrix criteria[2]: must be an object',
    );
  });

  test('attributes a malformed evidence object to its criterion and index', () => {
    const matrix = requirementMatrix('prepublication');
    criterion(matrix, 4).evidence[0] = null as never;

    expect(() => verifyRequirementMatrix(matrix, 'prepublication')).toThrow(
      'Criterion 4 evidence[0]: must be an object',
    );
  });

  test('rejects a non-string SHA-256 even when a value is present', () => {
    const matrix = requirementMatrix('prepublication');
    criterion(matrix, 9).evidence[0]!.sha256 = 42 as never;

    expect(() => verifyRequirementMatrix(matrix, 'prepublication')).toThrow(
      'Criterion 9 evidence[0]: sha256 must be 64 lowercase hexadecimal characters',
    );
  });

  test('rejects a non-string value even when a valid SHA-256 is present', () => {
    const matrix = requirementMatrix('prepublication');
    criterion(matrix, 9).evidence[0]!.value = {verified: true} as never;

    expect(() => verifyRequirementMatrix(matrix, 'prepublication')).toThrow(
      'Criterion 9 evidence[0]: value must be a nonempty string when provided',
    );
  });
});

const QA_BOUNDED_CLAIM =
  'sample-indexed alignment with frame-bounded rendering';
const QA_HEAD_COMMIT = '99b28cef7db6069b64790038e3369f1f0d5d124e';
const QA_TRACKED_TREE_SHA256 = 'c'.repeat(64);
const QA_WORKTREE_DIFF_SHA256 = 'f'.repeat(64);

const QA_LINE_IDS = [
  'C1-01',
  'C1-02',
  'C1-03',
  'C1-04',
  'C1-05',
  'C1-06',
  'C1-07',
  'C1-08',
  'V1-01',
  'V1-02',
  'V1-03',
  'V1-04',
  'V1-05',
  'V1-06',
  'V1-07',
  'V1-08',
  'C2-01',
  'C2-02',
  'C2-03',
  'C2-04',
  'C2-05',
  'C2-06',
  'C2-07',
  'C2-08',
] as const;

const QA_SPEED_VARIANTS = ['normal', 'half'] as const;
const QA_DEDICATED_RANGES = [
  'v1-03',
  'v1-08',
  'chorus-1',
  'chorus-2',
  'final-handoff',
] as const;
const QA_PROOF_RANGES = ['v1-03', 'v1-08'] as const;
const QA_CUE_IDS = [
  'V1-03-C01',
  'V1-03-C02',
  'V1-03-C03',
  'V1-08-C01',
  'V1-08-C02',
  'V1-08-C03',
  'V1-08-C04',
] as const;
const QA_CONTACT_OFFSETS = [-1, 0, 1, 2] as const;
const QA_CADENCES = [60, 120] as const;
const QA_STILL_PURPOSES = [
  'chrome',
  'handoff',
  'focus',
  'safe-area',
  'spectrum-peak',
  'backward-contact',
  'final-transition',
] as const;

const validQaCoverage = () => ({
  lineIds: [...QA_LINE_IDS],
  speedVariants: [...QA_SPEED_VARIANTS],
  dedicatedRanges: [...QA_DEDICATED_RANGES],
  proofRanges: [...QA_PROOF_RANGES],
  cueIds: [...QA_CUE_IDS],
  contactOffsets: [...QA_CONTACT_OFFSETS],
  cadences: [...QA_CADENCES],
  stillPurposes: [...QA_STILL_PURPOSES],
  allArtifactsHashed: true,
  mediaManifestArtifactId: 'qa-media-manifest',
});

const qaReleaseGates = releaseGates as unknown as Readonly<{
  verifyQaRunRecord: (run: unknown) => void;
  verifyQaRunPair: (run1: unknown, run2: unknown) => void;
  verifyQaReport: (report: unknown) => void;
}>;

const qaCommandSpecs = [
  {id: 'npm-ci', command: 'npm ci'},
  {id: 'check', command: 'npm run check'},
  {id: 'alignment-verify', command: 'npm run alignment:verify'},
  {id: 'layout-verify', command: 'npm run layout:verify'},
  {id: 'compositions', command: 'npm run compositions'},
  {
    id: 'verify-reference',
    command: 'npm run verify -- --kind reference',
  },
  {id: 'verify-public', command: 'npm run verify -- --kind public'},
  {id: 'verify-proof', command: 'npm run verify -- --kind proof'},
  {
    id: 'verify-public-markup',
    command:
      'npm run test:run -- tests/release-gates.test.ts -t "public-markup release gate"',
  },
  {
    id: 'verify-matrix',
    command:
      'npm run test:run -- tests/release-gates.test.ts -t "requirement-matrix release gate"',
  },
] as const;

const QA_ARTIFACT_SPECS = [
  {
    id: 'source-audio',
    kind: 'source-audio',
    path: 'projects/tanisea-lyric-film/public/soundtrack.m4a',
    sizeBytes: 8_421_376,
    shaSeed: '0',
  },
  {
    id: 'alignment-manifest',
    kind: 'alignment',
    path: 'projects/tanisea-lyric-film/alignment/tanisea-word-alignment-v3.json',
    sizeBytes: 184_320,
    shaSeed: '1',
  },
  {
    id: 'audio-features',
    kind: 'features',
    path: 'projects/tanisea-lyric-film/public/audio-features.bin',
    sizeBytes: 2_048_000,
    shaSeed: '2',
  },
  {
    id: 'reference-render',
    kind: 'reference',
    path: 'projects/tanisea-lyric-film/output/Tanisea-Lyric-Film-vNext-reference-2x.mov',
    sizeBytes: 18_500_000_000,
    shaSeed: '3',
  },
  {
    id: 'public-master',
    kind: 'public',
    path: 'projects/tanisea-lyric-film/output/Tanisea-Lyric-Film-vNext-60fps-Archival-Master.mp4',
    sizeBytes: 1_250_000_000,
    shaSeed: '4',
  },
  {
    id: 'sync-proof',
    kind: 'proof',
    path: 'projects/tanisea-lyric-film/output/Tanisea-Lyric-Film-Sync-Proof-120fps.mp4',
    sizeBytes: 1_500_000_000,
    shaSeed: '5',
  },
  {
    id: 'qa-media-manifest',
    kind: 'qa-manifest',
    path: 'projects/tanisea-lyric-film/work/qa/media/qa-media-manifest.json',
    sizeBytes: 96_000,
    shaSeed: '6',
  },
  {
    id: 'v1-03-public-contact',
    kind: 'qa-contact',
    path: 'projects/tanisea-lyric-film/work/qa/media/contacts/v1-03/public/frame-004224.png',
    sizeBytes: 864_000,
    shaSeed: '7',
  },
  {
    id: 'v1-03-public-contact-sheet',
    kind: 'qa-contact-sheet',
    path: 'projects/tanisea-lyric-film/work/qa/media/contact-sheets/v1-03-public.png',
    sizeBytes: 4_250_000,
    shaSeed: '8',
  },
  {
    id: 'v1-03-proof-contact-sheet',
    kind: 'qa-contact-sheet',
    path: 'projects/tanisea-lyric-film/work/qa/media/contact-sheets/v1-03-proof.png',
    sizeBytes: 4_350_000,
    shaSeed: '9',
  },
  {
    id: 'v1-08-public-contact-sheet',
    kind: 'qa-contact-sheet',
    path: 'projects/tanisea-lyric-film/work/qa/media/contact-sheets/v1-08-public.png',
    sizeBytes: 4_500_000,
    shaSeed: 'a',
  },
  {
    id: 'v1-08-proof-contact-sheet',
    kind: 'qa-contact-sheet',
    path: 'projects/tanisea-lyric-film/work/qa/media/contact-sheets/v1-08-proof.png',
    sizeBytes: 4_650_000,
    shaSeed: 'b',
  },
  {
    id: 'public-chrome-still',
    kind: 'qa-still',
    path: 'projects/tanisea-lyric-film/work/qa/media/stills/public-chrome.png',
    sizeBytes: 905_000,
    shaSeed: 'c',
  },
  {
    id: 'public-handoff-still',
    kind: 'qa-still',
    path: 'projects/tanisea-lyric-film/work/qa/media/stills/public-handoff.png',
    sizeBytes: 910_000,
    shaSeed: 'd',
  },
  {
    id: 'public-focus-still',
    kind: 'qa-still',
    path: 'projects/tanisea-lyric-film/work/qa/media/stills/public-focus.png',
    sizeBytes: 915_000,
    shaSeed: 'e',
  },
  {
    id: 'public-safe-area-still',
    kind: 'qa-still',
    path: 'projects/tanisea-lyric-film/work/qa/media/stills/public-safe-area.png',
    sizeBytes: 920_000,
    shaSeed: 'f',
  },
  {
    id: 'public-spectrum-peak-still',
    kind: 'qa-still',
    path: 'projects/tanisea-lyric-film/work/qa/media/stills/public-spectrum-peak.png',
    sizeBytes: 925_000,
    shaSeed: '0',
  },
  {
    id: 'proof-backward-contact-still',
    kind: 'qa-still',
    path: 'projects/tanisea-lyric-film/work/qa/media/stills/proof-backward-contact.png',
    sizeBytes: 930_000,
    shaSeed: '1',
  },
  {
    id: 'reference-transition-still',
    kind: 'qa-still',
    path: 'projects/tanisea-lyric-film/work/qa/media/stills/reference-final-transition.png',
    sizeBytes: 2_100_000,
    shaSeed: '2',
  },
] as const;

const validQaArtifacts = () =>
  QA_ARTIFACT_SPECS.map(({shaSeed, ...artifact}) => ({
    ...artifact,
    sha256: shaSeed.repeat(64),
  }));

const qaArtifactById = (id: string) => {
  const artifact = validQaArtifacts().find((entry) => entry.id === id);
  if (!artifact) throw new Error(`Missing QA artifact fixture ${id}`);
  return artifact;
};

const QA_SELECTED_FRAME_SPECS = [
  {
    id: 'chrome',
    artifactId: 'public-chrome-still',
    composition: 'LyricFilmVNext',
    frame: 3844,
  },
  {
    id: 'handoff',
    artifactId: 'public-handoff-still',
    composition: 'LyricFilmVNext',
    frame: 7079,
  },
  {
    id: 'focus',
    artifactId: 'public-focus-still',
    composition: 'LyricFilmVNext',
    frame: 4355,
  },
  {
    id: 'safe-area',
    artifactId: 'public-safe-area-still',
    composition: 'LyricFilmVNext',
    frame: 4458,
  },
  {
    id: 'spectrum-peak',
    artifactId: 'public-spectrum-peak-still',
    composition: 'LyricFilmVNext',
    frame: 2306,
  },
  {
    id: 'backward-contact',
    artifactId: 'proof-backward-contact-still',
    composition: 'LyricFilmSyncProof',
    frame: 10_394,
  },
  {
    id: 'final-transition',
    artifactId: 'reference-transition-still',
    composition: 'LyricFilmVNext',
    frame: 7092,
  },
] as const;

const validReferenceMedia = () => ({
  artifactId: 'reference-render',
  fileSha256: {value: '3'.repeat(64), source: 'sha256-file'},
  video: {
    codecName: 'prores',
    codecTag: 'ap4h',
    profile: '4444',
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

const validQaRunRecord = (runId: 'run-1' | 'run-2') => {
  const runNumber = runId === 'run-1' ? 1 : 2;

  return {
    schemaVersion: 1,
    runId,
    fullMediaExecuted: true,
    boundedClaim: QA_BOUNDED_CLAIM,
    git: {
      headCommit: QA_HEAD_COMMIT,
      trackedTreeSha256: QA_TRACKED_TREE_SHA256,
      worktreeDiffSha256: QA_WORKTREE_DIFF_SHA256,
      isClean: false,
      statusEntries: [
        'projects/tanisea-lyric-film/scripts/release-gates.ts',
        'projects/tanisea-lyric-film/tests/release-gates.test.ts',
      ],
    },
    toolVersions: {
      node: 'v26.4.0',
      npm: '11.6.0',
      ffmpeg: '8.0.1',
      ffprobe: '8.0.1',
    },
    commands: qaCommandSpecs.map(({id, command}, index) => ({
      id,
      command,
      exitCode: 0,
      durationMs: 1_000 + index * 100 + runNumber,
      logPath: `projects/tanisea-lyric-film/work/qa/${runId}/logs/${id}.log`,
      logSha256: (runId === 'run-1' ? 'd' : 'e').repeat(64),
    })),
    artifacts: validQaArtifacts(),
    media: {
      reference: validReferenceMedia(),
      public: validDelivery('public'),
      proof: validDelivery('proof'),
    },
    qaCoverage: validQaCoverage(),
    requirementMatrix: requirementMatrix(
      runId === 'run-1' ? 'baseline' : 'prepublication',
      runId,
      (runId === 'run-1' ? 'd' : 'e').repeat(64),
    ),
    selectedFrames: QA_SELECTED_FRAME_SPECS.map((selectedFrame) => ({
      ...selectedFrame,
      path: `projects/tanisea-lyric-film/work/qa/${runId}/selected-frames/${selectedFrame.id}.png`,
      sha256: qaArtifactById(selectedFrame.artifactId).sha256,
    })),
  };
};

const validQaRunPair = () =>
  [validQaRunRecord('run-1'), validQaRunRecord('run-2')] as const;

const validQaReport = () => {
  const baselineRun = validQaRunRecord('run-1');
  const authoritativeRun = validQaRunRecord('run-2');
  const artifactReferences = authoritativeRun.artifacts.map(
    ({id, path, sha256}) => ({id, path, sha256}),
  );

  return {
    schemaVersion: 1,
    status: 'passed-prepublication',
    boundedClaim: QA_BOUNDED_CLAIM,
    fullMediaExecuted: true,
    requirementMatrix: authoritativeRun.requirementMatrix,
    artifactReferences,
    baselineRun,
    authoritativeRun,
    sourceSummary: {
      artifactId: 'source-audio',
      sha256: qaArtifactById('source-audio').sha256,
      sampleRateHz: 44_100,
      channels: 2,
      channelLayout: 'stereo',
      publicDurationSeconds: 153,
      decodedSamplesPerChannel: 6_747_584,
      retainedAnalysisDurationSeconds: 153.00644,
    },
    alignmentSummary: {
      artifactId: 'alignment-manifest',
      sha256: qaArtifactById('alignment-manifest').sha256,
      displayedLineCount: 24,
      sourceTokenCount: 102,
      cueReferencedSemanticSourceTokenCount: 101,
      explicitlyUnmappedSourceTokenIds: ['V1-08-R01'],
      cueCount: 74,
      targetActivationCount: 74,
      chorusOccurrenceCount: 2,
      literalChorusPairCount: 8,
      maximumUncertainty: {samples: 882, milliseconds: 20},
      observedMaximumFrameErrorMilliseconds: {
        fps60: 8.321995,
        fps120: 4.002268,
      },
      reviewedSemanticSequences: [
        {
          lineId: 'V1-03',
          records: [
            {
              cueId: 'V1-03-C02',
              startSample: 3_173_568,
              sourceTokenIds: ['V1-03-R05'],
              targetSegmentIds: ['V1-03-S03'],
              activation: 'forward',
            },
            {
              cueId: 'V1-03-C03',
              startSample: 3_200_910,
              sourceTokenIds: ['V1-03-R06'],
              targetSegmentIds: ['V1-03-S02'],
              activation: 'backward',
            },
          ],
        },
        {
          lineId: 'V1-08',
          records: [
            {
              cueId: 'V1-08-C01',
              startSample: 3_807_197,
              sourceTokenIds: ['V1-08-R02'],
              targetSegmentIds: ['V1-08-S02'],
              activation: 'forward',
            },
            {
              cueId: 'V1-08-C02',
              startSample: 3_819_545,
              sourceTokenIds: ['V1-08-R03', 'V1-08-R04'],
              targetSegmentIds: ['V1-08-S01'],
              activation: 'backward',
            },
            {
              cueId: 'V1-08-C03',
              startSample: 3_869_863,
              sourceTokenIds: ['V1-08-R05', 'V1-08-R06'],
              targetSegmentIds: ['V1-08-S03'],
              activation: 'forward',
            },
            {
              cueId: 'V1-08-C04',
              startSample: 3_912_243,
              sourceTokenIds: ['V1-08-R07'],
              targetSegmentIds: ['V1-08-S04'],
              activation: 'forward',
            },
          ],
        },
      ],
    },
    featuresSummary: {
      artifactId: 'audio-features',
      sha256: qaArtifactById('audio-features').sha256,
    },
    layoutSummary: {
      spectrumBandCount: 64,
      spectrumMeasuredCorePx: 96,
      spectrumMaximumCapPx: 18,
      minimumLyricGapPx: 36,
      lowerChromeClearancePx: 11,
      publicUpperTelemetryAbsent: true,
      publicGlobalUpperRailAbsent: true,
    },
    qaCoverage: authoritativeRun.qaCoverage,
    media: authoritativeRun.media,
    runReferences: [
      {
        runId: 'run-1',
        path: 'projects/tanisea-lyric-film/work/qa/run-1/qa-run.json',
        sha256: qaJsonSha256(baselineRun),
      },
      {
        runId: 'run-2',
        path: 'projects/tanisea-lyric-film/work/qa/run-2/qa-run.json',
        sha256: qaJsonSha256(authoritativeRun),
      },
    ],
    comparison: {
      ...QA_COMPARISON_RECORD,
      recordSha256: QA_COMPARISON_SHA256,
    },
  };
};

describe('QA run and report release gates', () => {
  test('accepts a complete full-media QA run record', () => {
    expect(() =>
      qaReleaseGates.verifyQaRunRecord(validQaRunRecord('run-1')),
    ).not.toThrow();
  });

  test('accepts matching run-1 then run-2 records with run-local differences', () => {
    const [run1, run2] = validQaRunPair();

    expect(() => qaReleaseGates.verifyQaRunPair(run1, run2)).not.toThrow();
  });

  test('accepts a neutral passed-prepublication QA report', () => {
    expect(() => qaReleaseGates.verifyQaReport(validQaReport())).not.toThrow();
  });

  test.each([
    ['null', null],
    ['non-object', 'not-a-run-record'],
  ] as const)('rejects a %s QA run record', (_case, candidate) => {
    expect(() => qaReleaseGates.verifyQaRunRecord(candidate)).toThrow(
      /^QA run run-1: record\b/,
    );
  });

  test.each([
    ['wrong numeric value', 2],
    ['string coercion', '1'],
  ] as const)(
    'rejects QA run run-1 schemaVersion %s',
    (_case, schemaVersion) => {
      expect(() =>
        qaReleaseGates.verifyQaRunRecord({
          ...validQaRunRecord('run-1'),
          schemaVersion,
        }),
      ).toThrow(/^QA run run-1: schemaVersion\b/);
    },
  );

  test('rejects an invalid QA run run-1 runId', () => {
    expect(() =>
      qaReleaseGates.verifyQaRunRecord({
        ...validQaRunRecord('run-1'),
        runId: 'run-3',
      }),
    ).toThrow(/^QA run run-1: runId\b/);
  });

  test.each([
    ['blank', '   '],
    ['wrong', 'frame-rounded synchronization'],
  ] as const)(
    'rejects a %s QA run run-1 boundedClaim',
    (_case, boundedClaim) => {
      expect(() =>
        qaReleaseGates.verifyQaRunRecord({
          ...validQaRunRecord('run-1'),
          boundedClaim,
        }),
      ).toThrow(/^QA run run-1: boundedClaim\b/);
    },
  );

  test.each([
    ['false', false],
    ['non-boolean', 'true'],
  ] as const)(
    'rejects QA run run-1 fullMediaExecuted %s',
    (_case, fullMediaExecuted) => {
      expect(() =>
        qaReleaseGates.verifyQaRunRecord({
          ...validQaRunRecord('run-1'),
          fullMediaExecuted,
        }),
      ).toThrow(/^QA run run-1: fullMediaExecuted\b/);
    },
  );

  test('rejects QA run run-1 with missing git', () => {
    const candidate: Record<string, unknown> = {
      ...validQaRunRecord('run-1'),
    };
    delete candidate.git;

    expect(() => qaReleaseGates.verifyQaRunRecord(candidate)).toThrow(
      /^QA run run-1: git\b/,
    );
  });

  test('rejects QA run run-1 with non-object git', () => {
    expect(() =>
      qaReleaseGates.verifyQaRunRecord({
        ...validQaRunRecord('run-1'),
        git: 'not-git-metadata',
      }),
    ).toThrow(/^QA run run-1: git\b/);
  });

  test.each([
    ['malformed', 'not-a-commit'],
    ['uppercase', QA_HEAD_COMMIT.toUpperCase()],
  ] as const)(
    'rejects a %s QA run run-1 git.headCommit',
    (_case, headCommit) => {
      const run = validQaRunRecord('run-1');

      expect(() =>
        qaReleaseGates.verifyQaRunRecord({
          ...run,
          git: {...run.git, headCommit},
        }),
      ).toThrow(/^QA run run-1: git\.headCommit\b/);
    },
  );

  test.each([
    ['trackedTreeSha256', 'malformed', 'not-a-sha256'],
    ['trackedTreeSha256', 'uppercase', QA_TRACKED_TREE_SHA256.toUpperCase()],
    ['worktreeDiffSha256', 'malformed', 'not-a-sha256'],
    ['worktreeDiffSha256', 'uppercase', QA_WORKTREE_DIFF_SHA256.toUpperCase()],
  ] as const)(
    'rejects a %s QA run run-1 git.%s',
    (field, _case, value) => {
      const run = validQaRunRecord('run-1');

      expect(() =>
        qaReleaseGates.verifyQaRunRecord({
          ...run,
          git: {...run.git, [field]: value},
        }),
      ).toThrow(new RegExp(`^QA run run-1: git\\.${field}\\b`));
    },
  );

  test('rejects a non-boolean QA run run-1 git.isClean', () => {
    const run = validQaRunRecord('run-1');

    expect(() =>
      qaReleaseGates.verifyQaRunRecord({
        ...run,
        git: {...run.git, isClean: 'false'},
      }),
    ).toThrow(/^QA run run-1: git\.isClean\b/);
  });

  test('rejects QA run run-1 with missing git.statusEntries', () => {
    const run = validQaRunRecord('run-1');
    const git: Record<string, unknown> = {...run.git};
    delete git.statusEntries;

    expect(() =>
      qaReleaseGates.verifyQaRunRecord({...run, git}),
    ).toThrow(/^QA run run-1: git\.statusEntries\b/);
  });

  test.each([
    ['non-array', 'not-status-entries'],
    [
      'unsorted',
      [
        'projects/tanisea-lyric-film/tests/release-gates.test.ts',
        'projects/tanisea-lyric-film/scripts/release-gates.ts',
      ],
    ],
    [
      'duplicate',
      [
        'projects/tanisea-lyric-film/scripts/release-gates.ts',
        'projects/tanisea-lyric-film/scripts/release-gates.ts',
      ],
    ],
    ['absolute', ['C:/private/release-gates.ts']],
    [
      'traversal',
      ['projects/tanisea-lyric-film/../private/release-gates.ts'],
    ],
    ['non-string', [42]],
  ] as const)(
    'rejects QA run run-1 git.statusEntries that are %s',
    (_case, statusEntries) => {
      const run = validQaRunRecord('run-1');

      expect(() =>
        qaReleaseGates.verifyQaRunRecord({
          ...run,
          git: {...run.git, statusEntries},
        }),
      ).toThrow(/^QA run run-1: git\.statusEntries\b/);
    },
  );

  test('rejects QA run run-1 with missing toolVersions', () => {
    const candidate: Record<string, unknown> = {
      ...validQaRunRecord('run-1'),
    };
    delete candidate.toolVersions;

    expect(() => qaReleaseGates.verifyQaRunRecord(candidate)).toThrow(
      /^QA run run-1: toolVersions\b/,
    );
  });

  test('rejects QA run run-1 with non-object toolVersions', () => {
    expect(() =>
      qaReleaseGates.verifyQaRunRecord({
        ...validQaRunRecord('run-1'),
        toolVersions: 'not-tool-versions',
      }),
    ).toThrow(/^QA run run-1: toolVersions\b/);
  });

  test.each([
    ['node', 'missing', undefined],
    ['node', 'blank', '   '],
    ['node', 'non-string', 26],
    ['npm', 'missing', undefined],
    ['npm', 'blank', '   '],
    ['npm', 'non-string', 11],
    ['ffmpeg', 'missing', undefined],
    ['ffmpeg', 'blank', '   '],
    ['ffmpeg', 'non-string', 8],
    ['ffprobe', 'missing', undefined],
    ['ffprobe', 'blank', '   '],
    ['ffprobe', 'non-string', 8],
  ] as const)(
    'rejects a %s QA run run-1 toolVersions.%s',
    (field, _case, value) => {
      const run = validQaRunRecord('run-1');
      const toolVersions: Record<string, unknown> = {...run.toolVersions};
      if (value === undefined) {
        delete toolVersions[field];
      } else {
        toolVersions[field] = value;
      }

      expect(() =>
        qaReleaseGates.verifyQaRunRecord({...run, toolVersions}),
      ).toThrow(new RegExp(`^QA run run-1: toolVersions\\.${field}\\b`));
    },
  );

  test('rejects QA run run-1 with missing commands', () => {
    const candidate: Record<string, unknown> = {
      ...validQaRunRecord('run-1'),
    };
    delete candidate.commands;

    expect(() => qaReleaseGates.verifyQaRunRecord(candidate)).toThrow(
      /^QA run run-1: commands\b/,
    );
  });

  test.each([
    ['non-array', 'not-commands'],
    ['empty', []],
  ] as const)(
    'rejects QA run run-1 commands that are %s',
    (_case, commands) => {
      expect(() =>
        qaReleaseGates.verifyQaRunRecord({
          ...validQaRunRecord('run-1'),
          commands,
        }),
      ).toThrow(/^QA run run-1: commands\b/);
    },
  );

  test('rejects QA run run-1 commands with a missing required ID', () => {
    const run = validQaRunRecord('run-1');
    const commands = run.commands.filter(({id}) => id !== 'verify-proof');

    expect(() =>
      qaReleaseGates.verifyQaRunRecord({...run, commands}),
    ).toThrow(/^QA run run-1: commands\b/);
  });

  test('rejects QA run run-1 commands with a duplicate ID', () => {
    const run = validQaRunRecord('run-1');
    const commands = run.commands.map((entry) => ({...entry}));
    commands[1]!.id = commands[0]!.id;

    expect(() =>
      qaReleaseGates.verifyQaRunRecord({...run, commands}),
    ).toThrow(/^QA run run-1: commands\[1\]\.id\b/);
  });

  test('rejects QA run run-1 commands with an unknown ID', () => {
    const run = validQaRunRecord('run-1');
    const commands = run.commands.map((entry) => ({
      ...entry,
    })) as Array<Record<string, unknown>>;
    commands[0]!.id = 'unknown-command';

    expect(() =>
      qaReleaseGates.verifyQaRunRecord({...run, commands}),
    ).toThrow(/^QA run run-1: commands\[0\]\.id\b/);
  });

  test.each([
    ['altered', 'npm install'],
    ['absolute', 'C:/Program Files/nodejs/npm.cmd ci'],
  ] as const)(
    'rejects QA run run-1 commands with %s command text',
    (_case, command) => {
      const run = validQaRunRecord('run-1');
      const commands = run.commands.map((entry) => ({
        ...entry,
      })) as Array<Record<string, unknown>>;
      commands[0]!.command = command;

      expect(() =>
        qaReleaseGates.verifyQaRunRecord({...run, commands}),
      ).toThrow(/^QA run run-1: commands\[0\]\.command\b/);
    },
  );

  test('rejects a non-object QA run run-1 command entry', () => {
    const run = validQaRunRecord('run-1');
    const commands = run.commands.map((entry) => ({...entry}));
    commands[0] = null as never;

    expect(() =>
      qaReleaseGates.verifyQaRunRecord({...run, commands}),
    ).toThrow(/^QA run run-1: commands\[0\]\b/);
  });

  test.each([
    ['id', 'blank', '   '],
    ['id', 'non-string', 42],
    ['command', 'blank', '   '],
    ['command', 'non-string', 42],
  ] as const)(
    'rejects a %s QA run run-1 commands[0].%s',
    (field, _case, value) => {
      const run = validQaRunRecord('run-1');
      const commands = run.commands.map((entry) => ({...entry})) as Array<
        Record<string, unknown>
      >;
      commands[0]![field] = value;

      expect(() =>
        qaReleaseGates.verifyQaRunRecord({...run, commands}),
      ).toThrow(new RegExp(`^QA run run-1: commands\\[0\\]\\.${field}\\b`));
    },
  );

  test.each([
    ['nonzero', 1],
    ['non-number', '0'],
  ] as const)(
    'rejects a %s QA run run-1 commands[0].exitCode',
    (_case, exitCode) => {
      const run = validQaRunRecord('run-1');
      const commands = run.commands.map((entry) => ({...entry, exitCode}));

      expect(() =>
        qaReleaseGates.verifyQaRunRecord({...run, commands}),
      ).toThrow(/^QA run run-1: commands\[0\]\.exitCode\b/);
    },
  );

  test.each([
    ['negative', -1],
    ['non-finite', Number.POSITIVE_INFINITY],
    ['non-number', '1000'],
  ] as const)(
    'rejects a %s QA run run-1 commands[0].durationMs',
    (_case, durationMs) => {
      const run = validQaRunRecord('run-1');
      const commands = run.commands.map((entry) => ({...entry, durationMs}));

      expect(() =>
        qaReleaseGates.verifyQaRunRecord({...run, commands}),
      ).toThrow(/^QA run run-1: commands\[0\]\.durationMs\b/);
    },
  );

  test.each([
    ['blank', '   '],
    ['absolute', 'C:/private/npm-ci.log'],
    ['UNC', '\\\\server\\share\\npm-ci.log'],
    [
      'traversal',
      'projects/tanisea-lyric-film/work/qa/run-1/logs/../private.log',
    ],
    ['non-string', 42],
  ] as const)(
    'rejects a %s QA run run-1 commands[0].logPath',
    (_case, logPath) => {
      const run = validQaRunRecord('run-1');
      const commands = run.commands.map((entry) => ({...entry, logPath}));

      expect(() =>
        qaReleaseGates.verifyQaRunRecord({...run, commands}),
      ).toThrow(/^QA run run-1: commands\[0\]\.logPath\b/);
    },
  );

  test('rejects a missing QA run run-1 commands[0].logSha256', () => {
    const run = validQaRunRecord('run-1');
    const commands = run.commands.map((entry) => ({...entry})) as Array<
      Record<string, unknown>
    >;
    delete commands[0]!.logSha256;

    expect(() =>
      qaReleaseGates.verifyQaRunRecord({...run, commands}),
    ).toThrow(/^QA run run-1: commands\[0\]\.logSha256\b/);
  });

  test.each([
    ['short', 'a'.repeat(63)],
    ['malformed', 'g'.repeat(64)],
    ['uppercase', 'A'.repeat(64)],
    ['non-string', 42],
  ] as const)(
    'rejects a %s QA run run-1 commands[0].logSha256',
    (_case, logSha256) => {
      const run = validQaRunRecord('run-1');
      const commands = run.commands.map((entry) => ({...entry, logSha256}));

      expect(() =>
        qaReleaseGates.verifyQaRunRecord({...run, commands}),
      ).toThrow(/^QA run run-1: commands\[0\]\.logSha256\b/);
    },
  );

  test('rejects QA run run-1 with missing artifacts', () => {
    const candidate: Record<string, unknown> = {
      ...validQaRunRecord('run-1'),
    };
    delete candidate.artifacts;

    expect(() => qaReleaseGates.verifyQaRunRecord(candidate)).toThrow(
      /^QA run run-1: artifacts\b/,
    );
  });

  test.each([
    ['non-array', 'not-artifacts'],
    ['empty', []],
  ] as const)(
    'rejects QA run run-1 artifacts that are %s',
    (_case, artifacts) => {
      expect(() =>
        qaReleaseGates.verifyQaRunRecord({
          ...validQaRunRecord('run-1'),
          artifacts,
        }),
      ).toThrow(/^QA run run-1: artifacts\b/);
    },
  );

  test('rejects a non-object QA run run-1 artifact entry', () => {
    const run = validQaRunRecord('run-1');
    const artifacts = validQaArtifacts().map((entry) => ({...entry}));
    artifacts[0] = null as never;

    expect(() =>
      qaReleaseGates.verifyQaRunRecord({...run, artifacts}),
    ).toThrow(/^QA run run-1: artifacts\[0\]\b/);
  });

  test.each([
    ['ID source-audio', 'id', 'source-audio'],
    ['ID alignment-manifest', 'id', 'alignment-manifest'],
    ['ID audio-features', 'id', 'audio-features'],
    ['ID reference-render', 'id', 'reference-render'],
    ['ID public-master', 'id', 'public-master'],
    ['ID sync-proof', 'id', 'sync-proof'],
    ['qa-contact artifact', 'kind', 'qa-contact'],
    ['qa-contact-sheet artifact', 'kind', 'qa-contact-sheet'],
    ['qa-still artifact', 'kind', 'qa-still'],
  ] as const)(
    'rejects QA run run-1 artifacts missing required %s',
    (_case, field, value) => {
      const run = validQaRunRecord('run-1');
      const artifacts = validQaArtifacts().filter(
        (entry) => entry[field] !== value,
      );

      expect(() =>
        qaReleaseGates.verifyQaRunRecord({...run, artifacts}),
      ).toThrow(/^QA run run-1: artifacts\b/);
    },
  );

  test('rejects QA run run-1 artifacts with a duplicate ID', () => {
    const run = validQaRunRecord('run-1');
    const artifacts = validQaArtifacts().map((entry) => ({...entry}));
    artifacts[1]!.id = artifacts[0]!.id;

    expect(() =>
      qaReleaseGates.verifyQaRunRecord({...run, artifacts}),
    ).toThrow(/^QA run run-1: artifacts\[1\]\.id\b/);
  });

  test.each([
    ['blank', '   '],
    ['non-string', 42],
  ] as const)(
    'rejects a %s QA run run-1 artifacts[0].id',
    (_case, id) => {
      const run = validQaRunRecord('run-1');
      const artifacts = validQaArtifacts().map((entry) => ({
        ...entry,
      })) as Array<Record<string, unknown>>;
      artifacts[0]!.id = id;

      expect(() =>
        qaReleaseGates.verifyQaRunRecord({...run, artifacts}),
      ).toThrow(/^QA run run-1: artifacts\[0\]\.id\b/);
    },
  );

  test.each([
    ['blank', '   '],
    ['non-string', 42],
  ] as const)(
    'rejects a %s QA run run-1 artifacts[0].kind',
    (_case, kind) => {
      const run = validQaRunRecord('run-1');
      const artifacts = validQaArtifacts().map((entry) => ({
        ...entry,
      })) as Array<Record<string, unknown>>;
      artifacts[0]!.kind = kind;

      expect(() =>
        qaReleaseGates.verifyQaRunRecord({...run, artifacts}),
      ).toThrow(/^QA run run-1: artifacts\[0\]\.kind\b/);
    },
  );

  test.each([
    ['blank', '   '],
    ['absolute', 'C:/private/artifact.bin'],
    ['UNC', '\\\\server\\share\\artifact.bin'],
    [
      'traversal',
      'projects/tanisea-lyric-film/work/qa/../private/artifact.bin',
    ],
    ['non-string', 42],
  ] as const)(
    'rejects a %s QA run run-1 artifacts[0].path',
    (_case, path) => {
      const run = validQaRunRecord('run-1');
      const artifacts = validQaArtifacts().map((entry) => ({
        ...entry,
      })) as Array<Record<string, unknown>>;
      artifacts[0]!.path = path;

      expect(() =>
        qaReleaseGates.verifyQaRunRecord({...run, artifacts}),
      ).toThrow(/^QA run run-1: artifacts\[0\]\.path\b/);
    },
  );

  test.each([
    ['zero', 0],
    ['negative', -1],
    ['string', '8421376'],
  ] as const)(
    'rejects a %s QA run run-1 artifacts[0].sizeBytes',
    (_case, sizeBytes) => {
      const run = validQaRunRecord('run-1');
      const artifacts = validQaArtifacts().map((entry) => ({
        ...entry,
      })) as Array<Record<string, unknown>>;
      artifacts[0]!.sizeBytes = sizeBytes;

      expect(() =>
        qaReleaseGates.verifyQaRunRecord({...run, artifacts}),
      ).toThrow(/^QA run run-1: artifacts\[0\]\.sizeBytes\b/);
    },
  );

  test('rejects a missing QA run run-1 artifacts[0].sha256', () => {
    const run = validQaRunRecord('run-1');
    const artifacts = validQaArtifacts().map((entry) => ({
      ...entry,
    })) as Array<Record<string, unknown>>;
    delete artifacts[0]!.sha256;

    expect(() =>
      qaReleaseGates.verifyQaRunRecord({...run, artifacts}),
    ).toThrow(/^QA run run-1: artifacts\[0\]\.sha256\b/);
  });

  test.each([
    ['short', 'a'.repeat(63)],
    ['malformed', 'g'.repeat(64)],
    ['uppercase', 'A'.repeat(64)],
    ['non-string', 42],
  ] as const)(
    'rejects a %s QA run run-1 artifacts[0].sha256',
    (_case, sha256) => {
      const run = validQaRunRecord('run-1');
      const artifacts = validQaArtifacts().map((entry) => ({
        ...entry,
      })) as Array<Record<string, unknown>>;
      artifacts[0]!.sha256 = sha256;

      expect(() =>
        qaReleaseGates.verifyQaRunRecord({...run, artifacts}),
      ).toThrow(/^QA run run-1: artifacts\[0\]\.sha256\b/);
    },
  );

  test('rejects QA run run-1 with missing selectedFrames', () => {
    const candidate: Record<string, unknown> = {
      ...validQaRunRecord('run-1'),
    };
    delete candidate.selectedFrames;

    expect(() => qaReleaseGates.verifyQaRunRecord(candidate)).toThrow(
      /^QA run run-1: selectedFrames\b/,
    );
  });

  test.each([
    ['non-array', 'not-selected-frames'],
    ['empty', []],
  ] as const)(
    'rejects QA run run-1 selectedFrames that are %s',
    (_case, selectedFrames) => {
      expect(() =>
        qaReleaseGates.verifyQaRunRecord({
          ...validQaRunRecord('run-1'),
          selectedFrames,
        }),
      ).toThrow(/^QA run run-1: selectedFrames\b/);
    },
  );

  test('rejects a non-object QA run run-1 selected frame entry', () => {
    const run = validQaRunRecord('run-1');
    const selectedFrames = run.selectedFrames.map((entry) => ({...entry}));
    selectedFrames[0] = null as never;

    expect(() =>
      qaReleaseGates.verifyQaRunRecord({...run, selectedFrames}),
    ).toThrow(/^QA run run-1: selectedFrames\[0\]\b/);
  });

  test('rejects QA run run-1 selectedFrames with a duplicate ID', () => {
    const run = validQaRunRecord('run-1');
    const selectedFrames = run.selectedFrames.map((entry) => ({...entry}));
    selectedFrames[1]!.id = selectedFrames[0]!.id;

    expect(() =>
      qaReleaseGates.verifyQaRunRecord({...run, selectedFrames}),
    ).toThrow(/^QA run run-1: selectedFrames\[1\]\.id\b/);
  });

  test.each([
    ['blank', '   '],
    ['non-string', 42],
  ] as const)(
    'rejects a %s QA run run-1 selectedFrames[0].id',
    (_case, id) => {
      const run = validQaRunRecord('run-1');
      const selectedFrames = run.selectedFrames.map((entry) => ({
        ...entry,
      })) as Array<Record<string, unknown>>;
      selectedFrames[0]!.id = id;

      expect(() =>
        qaReleaseGates.verifyQaRunRecord({...run, selectedFrames}),
      ).toThrow(/^QA run run-1: selectedFrames\[0\]\.id\b/);
    },
  );

  test.each([
    ['blank', '   '],
    ['unknown', 'UnknownComposition'],
    ['non-string', 42],
  ] as const)(
    'rejects a %s QA run run-1 selectedFrames[0].composition',
    (_case, composition) => {
      const run = validQaRunRecord('run-1');
      const selectedFrames = run.selectedFrames.map((entry) => ({
        ...entry,
      })) as Array<Record<string, unknown>>;
      selectedFrames[0]!.composition = composition;

      expect(() =>
        qaReleaseGates.verifyQaRunRecord({...run, selectedFrames}),
      ).toThrow(/^QA run run-1: selectedFrames\[0\]\.composition\b/);
    },
  );

  test.each([
    ['negative', -1],
    ['non-integer', 1.5],
    ['string', '3840'],
  ] as const)(
    'rejects a %s QA run run-1 selectedFrames[0].frame',
    (_case, frame) => {
      const run = validQaRunRecord('run-1');
      const selectedFrames = run.selectedFrames.map((entry) => ({
        ...entry,
      })) as Array<Record<string, unknown>>;
      selectedFrames[0]!.frame = frame;

      expect(() =>
        qaReleaseGates.verifyQaRunRecord({...run, selectedFrames}),
      ).toThrow(/^QA run run-1: selectedFrames\[0\]\.frame\b/);
    },
  );

  test.each([
    ['blank', '   '],
    ['absolute', 'C:/private/selected-frame.png'],
    ['UNC', '\\\\server\\share\\selected-frame.png'],
    [
      'traversal',
      'projects/tanisea-lyric-film/work/qa/run-1/selected-frames/../private.png',
    ],
    ['non-string', 42],
  ] as const)(
    'rejects a %s QA run run-1 selectedFrames[0].path',
    (_case, path) => {
      const run = validQaRunRecord('run-1');
      const selectedFrames = run.selectedFrames.map((entry) => ({
        ...entry,
      })) as Array<Record<string, unknown>>;
      selectedFrames[0]!.path = path;

      expect(() =>
        qaReleaseGates.verifyQaRunRecord({...run, selectedFrames}),
      ).toThrow(/^QA run run-1: selectedFrames\[0\]\.path\b/);
    },
  );

  test('rejects a missing QA run run-1 selectedFrames[0].sha256', () => {
    const run = validQaRunRecord('run-1');
    const selectedFrames = run.selectedFrames.map((entry) => ({
      ...entry,
    })) as Array<Record<string, unknown>>;
    delete selectedFrames[0]!.sha256;

    expect(() =>
      qaReleaseGates.verifyQaRunRecord({...run, selectedFrames}),
    ).toThrow(/^QA run run-1: selectedFrames\[0\]\.sha256\b/);
  });

  test.each([
    ['short', 'a'.repeat(63)],
    ['malformed', 'g'.repeat(64)],
    ['uppercase', 'A'.repeat(64)],
    ['non-string', 42],
  ] as const)(
    'rejects a %s QA run run-1 selectedFrames[0].sha256',
    (_case, sha256) => {
      const run = validQaRunRecord('run-1');
      const selectedFrames = run.selectedFrames.map((entry) => ({
        ...entry,
      })) as Array<Record<string, unknown>>;
      selectedFrames[0]!.sha256 = sha256;

      expect(() =>
        qaReleaseGates.verifyQaRunRecord({...run, selectedFrames}),
      ).toThrow(/^QA run run-1: selectedFrames\[0\]\.sha256\b/);
    },
  );

  test('rejects QA run run-1 with missing media', () => {
    const candidate: Record<string, unknown> = {
      ...validQaRunRecord('run-1'),
    };
    delete candidate.media;

    expect(() => qaReleaseGates.verifyQaRunRecord(candidate)).toThrow(
      /^QA run run-1: media\b/,
    );
  });

  test('rejects QA run run-1 with non-object media', () => {
    expect(() =>
      qaReleaseGates.verifyQaRunRecord({
        ...validQaRunRecord('run-1'),
        media: 'not-media',
      }),
    ).toThrow(/^QA run run-1: media\b/);
  });

  test('rejects QA run run-1 with missing media.reference', () => {
    const run = validQaRunRecord('run-1');
    const media: Record<string, unknown> = {...run.media};
    delete media.reference;

    expect(() =>
      qaReleaseGates.verifyQaRunRecord({...run, media}),
    ).toThrow(/^QA run run-1: media\.reference\b/);
  });

  test('rejects QA run run-1 with non-object media.reference', () => {
    const run = validQaRunRecord('run-1');

    expect(() =>
      qaReleaseGates.verifyQaRunRecord({
        ...run,
        media: {...run.media, reference: 'not-reference-media'},
      }),
    ).toThrow(/^QA run run-1: media\.reference\b/);
  });

  test.each([
    ['wrong', 'public-master'],
    ['non-string', 42],
  ] as const)(
    'rejects a %s QA run run-1 media.reference.artifactId',
    (_case, artifactId) => {
      const run = validQaRunRecord('run-1');

      expect(() =>
        qaReleaseGates.verifyQaRunRecord({
          ...run,
          media: {
            ...run.media,
            reference: {...run.media.reference, artifactId},
          },
        }),
      ).toThrow(/^QA run run-1: media\.reference\.artifactId\b/);
    },
  );

  test('rejects QA run run-1 with missing media.reference.fileSha256', () => {
    const run = validQaRunRecord('run-1');
    const reference: Record<string, unknown> = {...run.media.reference};
    delete reference.fileSha256;

    expect(() =>
      qaReleaseGates.verifyQaRunRecord({
        ...run,
        media: {...run.media, reference},
      }),
    ).toThrow(/^QA run run-1: media\.reference\.fileSha256\b/);
  });

  test('rejects QA run run-1 with non-object media.reference.fileSha256', () => {
    const run = validQaRunRecord('run-1');

    expect(() =>
      qaReleaseGates.verifyQaRunRecord({
        ...run,
        media: {
          ...run.media,
          reference: {...run.media.reference, fileSha256: null},
        },
      }),
    ).toThrow(/^QA run run-1: media\.reference\.fileSha256\b/);
  });

  test.each([
    ['missing', undefined],
    ['non-string', 42],
    ['short', '3'.repeat(63)],
    ['malformed', 'g'.repeat(64)],
    ['uppercase', 'A'.repeat(64)],
  ] as const)(
    'rejects a %s QA run run-1 media.reference.fileSha256.value',
    (_case, value) => {
      const run = validQaRunRecord('run-1');
      const fileSha256: Record<string, unknown> = {
        ...run.media.reference.fileSha256,
      };
      if (value === undefined) {
        delete fileSha256.value;
      } else {
        fileSha256.value = value;
      }

      expect(() =>
        qaReleaseGates.verifyQaRunRecord({
          ...run,
          media: {
            ...run.media,
            reference: {...run.media.reference, fileSha256},
          },
        }),
      ).toThrow(/^QA run run-1: media\.reference\.fileSha256\.value\b/);
    },
  );

  test.each([
    ['wrong', 'requested-sha256-file'],
    ['non-string', 256],
  ] as const)(
    'rejects a %s QA run run-1 media.reference.fileSha256.source',
    (_case, source) => {
      const run = validQaRunRecord('run-1');

      expect(() =>
        qaReleaseGates.verifyQaRunRecord({
          ...run,
          media: {
            ...run.media,
            reference: {
              ...run.media.reference,
              fileSha256: {...run.media.reference.fileSha256, source},
            },
          },
        }),
      ).toThrow(/^QA run run-1: media\.reference\.fileSha256\.source\b/);
    },
  );

  test('rejects QA run run-1 with missing media.reference.video', () => {
    const run = validQaRunRecord('run-1');
    const reference: Record<string, unknown> = {...run.media.reference};
    delete reference.video;

    expect(() =>
      qaReleaseGates.verifyQaRunRecord({
        ...run,
        media: {...run.media, reference},
      }),
    ).toThrow(/^QA run run-1: media\.reference\.video\b/);
  });

  test('rejects QA run run-1 with non-object media.reference.video', () => {
    const run = validQaRunRecord('run-1');

    expect(() =>
      qaReleaseGates.verifyQaRunRecord({
        ...run,
        media: {
          ...run.media,
          reference: {...run.media.reference, video: 'not-video'},
        },
      }),
    ).toThrow(/^QA run run-1: media\.reference\.video\b/);
  });

  test.each([
    ['codecName', 'h264'],
    ['codecTag', 'apcn'],
    ['profile', 'HQ'],
    ['width', 1080],
    ['height', 1080],
    ['avgFrameRate', '60000/1001'],
    ['realFrameRate', '60000/1001'],
    ['pixelFormat', 'yuv422p10le'],
    ['sampleAspectRatio', '4:3'],
    ['colorRange', 'pc'],
    ['colorSpace', 'bt2020nc'],
    ['colorTransfer', 'smpte2084'],
    ['colorPrimaries', 'bt2020'],
    ['startTime', '0'],
    ['duration', '153'],
  ] as const)(
    'rejects QA run run-1 media.reference.video with wrong %s',
    (field, value) => {
      const run = validQaRunRecord('run-1');

      expect(() =>
        qaReleaseGates.verifyQaRunRecord({
          ...run,
          media: {
            ...run.media,
            reference: {
              ...run.media.reference,
              video: {...run.media.reference.video, [field]: value},
            },
          },
        }),
      ).toThrow(
        new RegExp(`^QA run run-1: media\\.reference\\.video\\.${field}\\b`),
      );
    },
  );

  test('rejects QA run run-1 with missing media.reference.video.decodedFrameCount', () => {
    const run = validQaRunRecord('run-1');
    const video: Record<string, unknown> = {...run.media.reference.video};
    delete video.decodedFrameCount;

    expect(() =>
      qaReleaseGates.verifyQaRunRecord({
        ...run,
        media: {
          ...run.media,
          reference: {...run.media.reference, video},
        },
      }),
    ).toThrow(
      /^QA run run-1: media\.reference\.video\.decodedFrameCount\b/,
    );
  });

  test('rejects QA run run-1 with non-object media.reference.video.decodedFrameCount', () => {
    const run = validQaRunRecord('run-1');

    expect(() =>
      qaReleaseGates.verifyQaRunRecord({
        ...run,
        media: {
          ...run.media,
          reference: {
            ...run.media.reference,
            video: {
              ...run.media.reference.video,
              decodedFrameCount: 'not-decoded-frame-count',
            },
          },
        },
      }),
    ).toThrow(
      /^QA run run-1: media\.reference\.video\.decodedFrameCount\b/,
    );
  });

  test.each([
    ['wrong', 'value', 9179],
    ['string coercion', 'value', '9180'],
    ['wrong', 'source', 'ffprobe-nb_frames'],
    ['non-string', 'source', 1],
  ] as const)(
    'rejects a %s QA run run-1 media.reference.video.decodedFrameCount.%s',
    (_case, field, value) => {
      const run = validQaRunRecord('run-1');

      expect(() =>
        qaReleaseGates.verifyQaRunRecord({
          ...run,
          media: {
            ...run.media,
            reference: {
              ...run.media.reference,
              video: {
                ...run.media.reference.video,
                decodedFrameCount: {
                  ...run.media.reference.video.decodedFrameCount,
                  [field]: value,
                },
              },
            },
          },
        }),
      ).toThrow(
        new RegExp(
          `^QA run run-1: media\\.reference\\.video\\.decodedFrameCount\\.${field}\\b`,
        ),
      );
    },
  );

  test.each([
    ['width', '2160'],
    ['avgFrameRate', 60],
    ['startTime', 0],
    ['duration', 153],
  ] as const)(
    'rejects a type-coerced QA run run-1 media.reference.video.%s',
    (field, value) => {
      const run = validQaRunRecord('run-1');

      expect(() =>
        qaReleaseGates.verifyQaRunRecord({
          ...run,
          media: {
            ...run.media,
            reference: {
              ...run.media.reference,
              video: {...run.media.reference.video, [field]: value},
            },
          },
        }),
      ).toThrow(
        new RegExp(`^QA run run-1: media\\.reference\\.video\\.${field}\\b`),
      );
    },
  );

  test('rejects QA run run-1 with missing media.reference.container', () => {
    const run = validQaRunRecord('run-1');
    const reference: Record<string, unknown> = {...run.media.reference};
    delete reference.container;

    expect(() =>
      qaReleaseGates.verifyQaRunRecord({
        ...run,
        media: {...run.media, reference},
      }),
    ).toThrow(/^QA run run-1: media\.reference\.container\b/);
  });

  test('rejects QA run run-1 with non-object media.reference.container', () => {
    const run = validQaRunRecord('run-1');

    expect(() =>
      qaReleaseGates.verifyQaRunRecord({
        ...run,
        media: {
          ...run.media,
          reference: {...run.media.reference, container: 'not-container'},
        },
      }),
    ).toThrow(/^QA run run-1: media\.reference\.container\b/);
  });

  test.each([
    ['wrong string', '152.999000'],
    ['numeric coercion', 153],
  ] as const)(
    'rejects a %s QA run run-1 media.reference.container.duration',
    (_case, duration) => {
      const run = validQaRunRecord('run-1');

      expect(() =>
        qaReleaseGates.verifyQaRunRecord({
          ...run,
          media: {
            ...run.media,
            reference: {
              ...run.media.reference,
              container: {...run.media.reference.container, duration},
            },
          },
        }),
      ).toThrow(/^QA run run-1: media\.reference\.container\.duration\b/);
    },
  );

  test('rejects QA run run-1 with missing media.reference.strictDecode', () => {
    const run = validQaRunRecord('run-1');
    const reference: Record<string, unknown> = {...run.media.reference};
    delete reference.strictDecode;

    expect(() =>
      qaReleaseGates.verifyQaRunRecord({
        ...run,
        media: {...run.media, reference},
      }),
    ).toThrow(/^QA run run-1: media\.reference\.strictDecode\b/);
  });

  test('rejects QA run run-1 with non-object media.reference.strictDecode', () => {
    const run = validQaRunRecord('run-1');

    expect(() =>
      qaReleaseGates.verifyQaRunRecord({
        ...run,
        media: {
          ...run.media,
          reference: {...run.media.reference, strictDecode: null},
        },
      }),
    ).toThrow(/^QA run run-1: media\.reference\.strictDecode\b/);
  });

  test.each([
    ['false', false],
    ['string coercion', 'true'],
  ] as const)(
    'rejects QA run run-1 media.reference.strictDecode.passed %s',
    (_case, passed) => {
      const run = validQaRunRecord('run-1');

      expect(() =>
        qaReleaseGates.verifyQaRunRecord({
          ...run,
          media: {
            ...run.media,
            reference: {
              ...run.media.reference,
              strictDecode: {...run.media.reference.strictDecode, passed},
            },
          },
        }),
      ).toThrow(
        /^QA run run-1: media\.reference\.strictDecode\.passed\b/,
      );
    },
  );

  test.each([
    ['wrong', 'ffmpeg-full-decode'],
    ['non-string', 1],
  ] as const)(
    'rejects a %s QA run run-1 media.reference.strictDecode.source',
    (_case, source) => {
      const run = validQaRunRecord('run-1');

      expect(() =>
        qaReleaseGates.verifyQaRunRecord({
          ...run,
          media: {
            ...run.media,
            reference: {
              ...run.media.reference,
              strictDecode: {...run.media.reference.strictDecode, source},
            },
          },
        }),
      ).toThrow(
        /^QA run run-1: media\.reference\.strictDecode\.source\b/,
      );
    },
  );

  test('rejects QA run run-1 with missing media.public', () => {
    const run = validQaRunRecord('run-1');
    const media: Record<string, unknown> = {...run.media};
    delete media.public;

    expect(() =>
      qaReleaseGates.verifyQaRunRecord({...run, media}),
    ).toThrow(
      /^QA run run-1: media\.public: Public delivery metadata: must be an object\b/,
    );
  });

  test('rejects QA run run-1 with non-object media.public', () => {
    const run = validQaRunRecord('run-1');

    expect(() =>
      qaReleaseGates.verifyQaRunRecord({
        ...run,
        media: {...run.media, public: 'not-public-media'},
      }),
    ).toThrow(
      /^QA run run-1: media\.public: Public delivery metadata: must be an object\b/,
    );
  });

  test('rejects QA run run-1 with missing media.proof', () => {
    const run = validQaRunRecord('run-1');
    const media: Record<string, unknown> = {...run.media};
    delete media.proof;

    expect(() =>
      qaReleaseGates.verifyQaRunRecord({...run, media}),
    ).toThrow(
      /^QA run run-1: media\.proof: Proof delivery metadata: must be an object\b/,
    );
  });

  test('rejects QA run run-1 with non-object media.proof', () => {
    const run = validQaRunRecord('run-1');

    expect(() =>
      qaReleaseGates.verifyQaRunRecord({
        ...run,
        media: {...run.media, proof: 'not-proof-media'},
      }),
    ).toThrow(
      /^QA run run-1: media\.proof: Proof delivery metadata: must be an object\b/,
    );
  });

  test('preserves public codec detail in a wrapped QA run run-1 error', () => {
    const run = validQaRunRecord('run-1');
    const publicMedia = validDelivery('public');
    publicMedia.video.codecName = 'h264';

    expect(() =>
      qaReleaseGates.verifyQaRunRecord({
        ...run,
        media: {...run.media, public: publicMedia},
      }),
    ).toThrow(
      /^QA run run-1: media\.public: Public delivery metadata: video\.codecName\b/,
    );
  });

  test('preserves public codec-tag detail in a wrapped QA run run-1 error', () => {
    const run = validQaRunRecord('run-1');
    const publicMedia = validDelivery('public');
    publicMedia.video.codecTag = 'avc1';

    expect(() =>
      qaReleaseGates.verifyQaRunRecord({
        ...run,
        media: {...run.media, public: publicMedia},
      }),
    ).toThrow(
      /^QA run run-1: media\.public: Public delivery metadata: video\.codecTag\b/,
    );
  });

  test('preserves public decoded-frame provenance detail in a wrapped QA run run-1 error', () => {
    const run = validQaRunRecord('run-1');
    const publicMedia = validDelivery('public');
    publicMedia.video.decodedFrameCount.source = 'ffprobe-nb_frames';

    expect(() =>
      qaReleaseGates.verifyQaRunRecord({
        ...run,
        media: {...run.media, public: publicMedia},
      }),
    ).toThrow(
      /^QA run run-1: media\.public: Public delivery metadata: video\.decodedFrameCount\.source\b/,
    );
  });

  test('preserves public audio packet-mismatch detail in a wrapped QA run run-1 error', () => {
    const run = validQaRunRecord('run-1');
    const publicMedia = validDelivery('public');
    publicMedia.audio.packetCount.value -= 1;

    expect(() =>
      qaReleaseGates.verifyQaRunRecord({
        ...run,
        media: {...run.media, public: publicMedia},
      }),
    ).toThrow(
      /^QA run run-1: media\.public: Public delivery metadata: audio\.packetCount\b/,
    );
  });

  test('preserves proof codec detail in a wrapped QA run run-1 error', () => {
    const run = validQaRunRecord('run-1');
    const proofMedia = validDelivery('proof');
    proofMedia.video.codecName = 'hevc';

    expect(() =>
      qaReleaseGates.verifyQaRunRecord({
        ...run,
        media: {...run.media, proof: proofMedia},
      }),
    ).toThrow(
      /^QA run run-1: media\.proof: Proof delivery metadata: video\.codecName\b/,
    );
  });

  test('preserves proof codec-tag detail in a wrapped QA run run-1 error', () => {
    const run = validQaRunRecord('run-1');
    const proofMedia = validDelivery('proof');
    proofMedia.video.codecTag = 'hvc1';

    expect(() =>
      qaReleaseGates.verifyQaRunRecord({
        ...run,
        media: {...run.media, proof: proofMedia},
      }),
    ).toThrow(
      /^QA run run-1: media\.proof: Proof delivery metadata: video\.codecTag\b/,
    );
  });

  test('preserves proof decoded-frame-count detail in a wrapped QA run run-1 error', () => {
    const run = validQaRunRecord('run-1');
    const proofMedia = validDelivery('proof');
    proofMedia.video.decodedFrameCount.value -= 1;

    expect(() =>
      qaReleaseGates.verifyQaRunRecord({
        ...run,
        media: {...run.media, proof: proofMedia},
      }),
    ).toThrow(
      /^QA run run-1: media\.proof: Proof delivery metadata: video\.decodedFrameCount\.value\b/,
    );
  });

  test('preserves proof strict-decode detail in a wrapped QA run run-1 error', () => {
    const run = validQaRunRecord('run-1');
    const proofMedia = validDelivery('proof');
    proofMedia.strictDecode.passed = false;

    expect(() =>
      qaReleaseGates.verifyQaRunRecord({
        ...run,
        media: {...run.media, proof: proofMedia},
      }),
    ).toThrow(
      /^QA run run-1: media\.proof: Proof delivery metadata: strictDecode\.passed\b/,
    );
  });

  test('rejects QA run run-1 with missing requirementMatrix', () => {
    const candidate: Record<string, unknown> = {
      ...validQaRunRecord('run-1'),
    };
    delete candidate.requirementMatrix;

    expect(() => qaReleaseGates.verifyQaRunRecord(candidate)).toThrow(
      /^QA run run-1: requirementMatrix: Requirement matrix: must be an object\b/,
    );
  });

  test('rejects QA run run-1 with non-object requirementMatrix', () => {
    expect(() =>
      qaReleaseGates.verifyQaRunRecord({
        ...validQaRunRecord('run-1'),
        requirementMatrix: 'not-a-requirement-matrix',
      }),
    ).toThrow(
      /^QA run run-1: requirementMatrix: Requirement matrix: must be an object\b/,
    );
  });

  test('attributes a missing baseline criterion through QA run run-1', () => {
    const run = validQaRunRecord('run-1');
    const matrix = requirementMatrix('baseline', 'run-1', 'd'.repeat(64));
    matrix.criteria.splice(6, 1);

    expect(() =>
      qaReleaseGates.verifyQaRunRecord({...run, requirementMatrix: matrix}),
    ).toThrow(
      /^QA run run-1: requirementMatrix: Criterion 7: missing\b/,
    );
  });

  test('proves QA run run-1 validates criterion 1 in baseline mode', () => {
    const run = validQaRunRecord('run-1');
    const matrix = requirementMatrix('baseline', 'run-1', 'd'.repeat(64));
    criterion(matrix, 1).status = 'pending-publication';

    expect(() =>
      qaReleaseGates.verifyQaRunRecord({...run, requirementMatrix: matrix}),
    ).toThrow(
      /^QA run run-1: requirementMatrix: Criterion 1: baseline status must be proved, got pending-publication\b/,
    );
  });

  test('proves QA run run-1 keeps criterion 11 pending in baseline mode', () => {
    const run = validQaRunRecord('run-1');
    const matrix = requirementMatrix('baseline', 'run-1', 'd'.repeat(64));
    criterion(matrix, 11).status = 'proved';

    expect(() =>
      qaReleaseGates.verifyQaRunRecord({...run, requirementMatrix: matrix}),
    ).toThrow(
      /^QA run run-1: requirementMatrix: Criterion 11: baseline status must be pending-publication, got proved\b/,
    );
  });

  test('attributes empty baseline evidence through QA run run-1', () => {
    const run = validQaRunRecord('run-1');
    const matrix = requirementMatrix('baseline', 'run-1', 'd'.repeat(64));
    criterion(matrix, 3).evidence = [];

    expect(() =>
      qaReleaseGates.verifyQaRunRecord({...run, requirementMatrix: matrix}),
    ).toThrow(
      /^QA run run-1: requirementMatrix: Criterion 3: evidence must be a nonempty array\b/,
    );
  });

  test('attributes unsupported baseline evidence status through QA run run-1', () => {
    const run = validQaRunRecord('run-1');
    const matrix = requirementMatrix('baseline', 'run-1', 'd'.repeat(64));
    criterion(matrix, 4).status = 'unsupported';

    expect(() =>
      qaReleaseGates.verifyQaRunRecord({...run, requirementMatrix: matrix}),
    ).toThrow(
      /^QA run run-1: requirementMatrix: Criterion 4: unsupported status unsupported\b/,
    );
  });

  test('rejects authorized-looking requirement evidence from the wrong run', () => {
    const run = validQaRunRecord('run-1');
    const matrix = structuredClone(run.requirementMatrix);
    criterion(matrix, 2).evidence[0]!.artifact =
      'projects/tanisea-lyric-film/work/qa/run-2/logs/check.log';

    expect(() =>
      qaReleaseGates.verifyQaRunRecord({...run, requirementMatrix: matrix}),
    ).toThrow(
      /^QA run run-1: requirementMatrix criterion 2 evidence\[0\] artifact must equal check logPath\b/,
    );
  });

  test('rejects a requirement evidence hash that is not the emitted log hash', () => {
    const run = validQaRunRecord('run-2');
    const matrix = structuredClone(run.requirementMatrix);
    criterion(matrix, 7).evidence[1]!.sha256 = 'f'.repeat(64);

    expect(() =>
      qaReleaseGates.verifyQaRunRecord({...run, requirementMatrix: matrix}),
    ).toThrow(
      /^QA run run-2: requirementMatrix criterion 7 evidence\[1\] SHA-256 must equal verify-proof logSha256\b/,
    );
  });

  test.each([
    ['duplicate run-1 IDs', 'run-1', 'run-1'],
    ['duplicate run-2 IDs', 'run-2', 'run-2'],
    ['reversed run IDs', 'run-2', 'run-1'],
  ] as const)(
    'rejects a QA run pair with %s',
    (_case, firstRunId, secondRunId) => {
      expect(() =>
        qaReleaseGates.verifyQaRunPair(
          validQaRunRecord(firstRunId),
          validQaRunRecord(secondRunId),
        ),
      ).toThrow(/^QA run pair: runId\b/);
    },
  );

  test.each([
    ['headCommit', 'a'.repeat(40)],
    ['trackedTreeSha256', 'a'.repeat(64)],
    ['worktreeDiffSha256', 'a'.repeat(64)],
    ['isClean', true],
    [
      'statusEntries',
      ['projects/tanisea-lyric-film/scripts/release-gates.ts'],
    ],
  ] as const)('rejects QA run pair git.%s drift', (field, value) => {
    const [run1, run2] = validQaRunPair();

    expect(() =>
      qaReleaseGates.verifyQaRunPair(run1, {
        ...run2,
        git: {...run2.git, [field]: value},
      }),
    ).toThrow(new RegExp(`^QA run pair: git\\.${field}\\b`));
  });

  test.each([
    ['node', 'v26.4.1'],
    ['npm', '11.6.1'],
    ['ffmpeg', '8.0.2'],
    ['ffprobe', '8.0.2'],
  ] as const)(
    'rejects QA run pair toolVersions.%s drift',
    (field, value) => {
      const [run1, run2] = validQaRunPair();

      expect(() =>
        qaReleaseGates.verifyQaRunPair(run1, {
          ...run2,
          toolVersions: {...run2.toolVersions, [field]: value},
        }),
      ).toThrow(new RegExp(`^QA run pair: toolVersions\\.${field}\\b`));
    },
  );

  test.each(
    qaCommandSpecs.map(({id}, commandIndex) => [id, commandIndex] as const),
  )(
    'rejects QA run pair %s commands[%i].id drift',
    (commandId, commandIndex) => {
      const [run1, run2] = validQaRunPair();
      const commands = run2.commands.map((entry) => ({...entry})) as Array<
        Record<string, unknown>
      >;
      commands[commandIndex]!.id = `${commandId}-drift`;

      expect(() =>
        qaReleaseGates.verifyQaRunPair(run1, {...run2, commands}),
      ).toThrow(
        new RegExp(`^QA run pair: commands\\[${commandIndex}\\]\\.id\\b`),
      );
    },
  );

  test.each(
    qaCommandSpecs.map(
      ({id, command}, commandIndex) => [id, commandIndex, command] as const,
    ),
  )(
    'rejects QA run pair %s commands[%i].command drift',
    (_commandId, commandIndex, command) => {
      const [run1, run2] = validQaRunPair();
      const commands = run2.commands.map((entry) => ({...entry})) as Array<
        Record<string, unknown>
      >;
      commands[commandIndex]!.command = `${command} --drift`;

      expect(() =>
        qaReleaseGates.verifyQaRunPair(run1, {...run2, commands}),
      ).toThrow(
        new RegExp(
          `^QA run pair: commands\\[${commandIndex}\\]\\.command\\b`,
        ),
      );
    },
  );

  test.each(
    qaCommandSpecs.map(({id}, commandIndex) => [id, commandIndex] as const),
  )(
    'rejects QA run pair %s commands[%i].exitCode drift',
    (_commandId, commandIndex) => {
      const [run1, run2] = validQaRunPair();
      const commands = run2.commands.map((entry) => ({...entry}));
      commands[commandIndex]!.exitCode = 1;

      expect(() =>
        qaReleaseGates.verifyQaRunPair(run1, {...run2, commands}),
      ).toThrow(
        new RegExp(
          `^QA run pair: commands\\[${commandIndex}\\]\\.exitCode\\b`,
        ),
      );
    },
  );

  test('rejects QA run pair artifacts with a missing ID', () => {
    const [run1, run2] = validQaRunPair();

    expect(() =>
      qaReleaseGates.verifyQaRunPair(run1, {
        ...run2,
        artifacts: run2.artifacts.slice(1),
      }),
    ).toThrow(/^QA run pair: artifacts\b/);
  });

  test('rejects QA run pair artifacts with an extra ID', () => {
    const [run1, run2] = validQaRunPair();

    expect(() =>
      qaReleaseGates.verifyQaRunPair(run1, {
        ...run2,
        artifacts: [
          ...run2.artifacts,
          {...run2.artifacts[0]!, id: 'source-audio-extra'},
        ],
      }),
    ).toThrow(/^QA run pair: artifacts\b/);
  });

  test('rejects reordered QA run pair artifact IDs', () => {
    const [run1, run2] = validQaRunPair();
    const artifacts = run2.artifacts.map((entry) => ({...entry}));
    [artifacts[0], artifacts[1]] = [artifacts[1]!, artifacts[0]!];

    expect(() =>
      qaReleaseGates.verifyQaRunPair(run1, {...run2, artifacts}),
    ).toThrow(/^QA run pair: artifacts\[0\]\.id\b/);
  });

  test.each([
    ['kind', 'source-audio-copy'],
    [
      'path',
      'projects/tanisea-lyric-film/public/soundtrack-copy.m4a',
    ],
    ['sizeBytes', 8_421_377],
    ['sha256', 'd'.repeat(64)],
  ] as const)('rejects QA run pair artifacts[0].%s drift', (field, value) => {
    const [run1, run2] = validQaRunPair();
    const artifacts = run2.artifacts.map((entry) => ({...entry}));
    artifacts[0] = {...artifacts[0]!, [field]: value};

    expect(() =>
      qaReleaseGates.verifyQaRunPair(run1, {...run2, artifacts}),
    ).toThrow(new RegExp(`^QA run pair: artifacts\\[0\\]\\.${field}\\b`));
  });

  test('rejects QA run pair media.reference.fileSha256.value drift', () => {
    const [run1, run2] = validQaRunPair();

    expect(() =>
      qaReleaseGates.verifyQaRunPair(run1, {
        ...run2,
        media: {
          ...run2.media,
          reference: {
            ...run2.media.reference,
            fileSha256: {
              ...run2.media.reference.fileSha256,
              value: 'd'.repeat(64),
            },
          },
        },
      }),
    ).toThrow(/^QA run pair: media\.reference\.fileSha256\.value\b/);
  });

  test('rejects QA run pair media.reference.video.decodedFrameCount.value drift', () => {
    const [run1, run2] = validQaRunPair();

    expect(() =>
      qaReleaseGates.verifyQaRunPair(run1, {
        ...run2,
        media: {
          ...run2.media,
          reference: {
            ...run2.media.reference,
            video: {
              ...run2.media.reference.video,
              decodedFrameCount: {
                ...run2.media.reference.video.decodedFrameCount,
                value: 9179,
              },
            },
          },
        },
      }),
    ).toThrow(
      /^QA run pair: media\.reference\.video\.decodedFrameCount\.value\b/,
    );
  });

  test.each([
    ['public', 'codecName', 'h264'],
    ['proof', 'codecTag', 'hvc1'],
  ] as const)(
    'rejects QA run pair media.%s.video.%s drift',
    (kind, field, value) => {
      const [run1, run2] = validQaRunPair();
      const delivery = run2.media[kind];

      expect(() =>
        qaReleaseGates.verifyQaRunPair(run1, {
          ...run2,
          media: {
            ...run2.media,
            [kind]: {
              ...delivery,
              video: {...delivery.video, [field]: value},
            },
          },
        }),
      ).toThrow(
        new RegExp(`^QA run pair: media\\.${kind}\\.video\\.${field}\\b`),
      );
    },
  );

  test.each(['public', 'proof'] as const)(
    'rejects QA run pair media.%s.audio.packetCount.value drift',
    (kind) => {
      const [run1, run2] = validQaRunPair();
      const delivery = run2.media[kind];
      const value = delivery.audio.packetCount.value + 1;

      expect(() =>
        qaReleaseGates.verifyQaRunPair(run1, {
          ...run2,
          media: {
            ...run2.media,
            [kind]: {
              ...delivery,
              audio: {
                ...delivery.audio,
                packetCount: {...delivery.audio.packetCount, value},
              },
              sourceAudio: {
                ...delivery.sourceAudio,
                packetCount: {...delivery.sourceAudio.packetCount, value},
              },
            },
          },
        }),
      ).toThrow(
        new RegExp(
          `^QA run pair: media\\.${kind}\\.audio\\.packetCount\\.value\\b`,
        ),
      );
    },
  );

  test.each(['public', 'proof'] as const)(
    'rejects QA run pair media.%s.audio.packetStreamSha256.value drift',
    (kind) => {
      const [run1, run2] = validQaRunPair();
      const delivery = run2.media[kind];
      const value = 'd'.repeat(64);

      expect(() =>
        qaReleaseGates.verifyQaRunPair(run1, {
          ...run2,
          media: {
            ...run2.media,
            [kind]: {
              ...delivery,
              audio: {
                ...delivery.audio,
                packetStreamSha256: {
                  ...delivery.audio.packetStreamSha256,
                  value,
                },
              },
              sourceAudio: {
                ...delivery.sourceAudio,
                packetStreamSha256: {
                  ...delivery.sourceAudio.packetStreamSha256,
                  value,
                },
              },
            },
          },
        }),
      ).toThrow(
        new RegExp(
          `^QA run pair: media\\.${kind}\\.audio\\.packetStreamSha256\\.value\\b`,
        ),
      );
    },
  );

  test('rejects QA run pair requirementMatrix criterion status drift', () => {
    const [run1, run2] = validQaRunPair();
    const matrix = requirementMatrix('prepublication');
    criterion(matrix, 4).status = 'pending-publication';

    expect(() =>
      qaReleaseGates.verifyQaRunPair(run1, {
        ...run2,
        requirementMatrix: matrix,
      }),
    ).toThrow(/^QA run pair: requirementMatrix\.criteria\[3\]\.status\b/);
  });

  test('rejects QA run pair requirementMatrix criterion evidence drift', () => {
    const [run1, run2] = validQaRunPair();
    const matrix = requirementMatrix('prepublication');
    criterion(matrix, 5).evidence[0]!.artifact =
      'audits/tanisea-final-qa-vnext-copy.json';

    expect(() =>
      qaReleaseGates.verifyQaRunPair(run1, {
        ...run2,
        requirementMatrix: matrix,
      }),
    ).toThrow(
      /^QA run pair: requirementMatrix\.criteria\[4\]\.evidence\[0\]\.artifact\b/,
    );
  });

  test('rejects QA run pair requirementMatrix criterion evidence hash drift', () => {
    const [run1, run2] = validQaRunPair();
    const matrix = requirementMatrix('prepublication');
    criterion(matrix, 6).evidence[0]!.sha256 = 'b'.repeat(64);

    expect(() =>
      qaReleaseGates.verifyQaRunPair(run1, {
        ...run2,
        requirementMatrix: matrix,
      }),
    ).toThrow(
      /^QA run pair: requirementMatrix\.criteria\[5\]\.evidence\[0\]\.sha256\b/,
    );
  });

  test('rejects reordered QA run pair requirementMatrix criterion IDs', () => {
    const [run1, run2] = validQaRunPair();
    const matrix = requirementMatrix('prepublication');
    [matrix.criteria[0], matrix.criteria[1]] = [
      matrix.criteria[1]!,
      matrix.criteria[0]!,
    ];

    expect(() =>
      qaReleaseGates.verifyQaRunPair(run1, {
        ...run2,
        requirementMatrix: matrix,
      }),
    ).toThrow(/^QA run pair: requirementMatrix\.criteria\[0\]\.id\b/);
  });

  test('rejects QA run pair requirementMatrix criterion ID drift', () => {
    const [run1, run2] = validQaRunPair();
    const matrix = requirementMatrix('prepublication');
    matrix.criteria[4]!.id = 6;

    expect(() =>
      qaReleaseGates.verifyQaRunPair(run1, {
        ...run2,
        requirementMatrix: matrix,
      }),
    ).toThrow(/^QA run pair: requirementMatrix\.criteria\[4\]\.id\b/);
  });

  test('rejects QA run pair selectedFrames with a missing ID', () => {
    const [run1, run2] = validQaRunPair();

    expect(() =>
      qaReleaseGates.verifyQaRunPair(run1, {
        ...run2,
        selectedFrames: run2.selectedFrames.slice(1),
      }),
    ).toThrow(/^QA run pair: selectedFrames\b/);
  });

  test('rejects QA run pair selectedFrames with an extra ID', () => {
    const [run1, run2] = validQaRunPair();

    expect(() =>
      qaReleaseGates.verifyQaRunPair(run1, {
        ...run2,
        selectedFrames: [
          ...run2.selectedFrames,
          {
            ...run2.selectedFrames[0]!,
            id: 'public-v1-03-contact-extra',
          },
        ],
      }),
    ).toThrow(/^QA run pair: selectedFrames\b/);
  });

  test('rejects reordered QA run pair selectedFrame IDs', () => {
    const [run1, run2] = validQaRunPair();
    const selectedFrames = run2.selectedFrames.map((entry) => ({...entry}));
    [selectedFrames[0], selectedFrames[1]] = [
      selectedFrames[1]!,
      selectedFrames[0]!,
    ];

    expect(() =>
      qaReleaseGates.verifyQaRunPair(run1, {...run2, selectedFrames}),
    ).toThrow(/^QA run pair: selectedFrames\[0\]\.id\b/);
  });

  test.each([
    ['composition', 'LyricFilmSyncProof'],
    ['frame', 3841],
    ['sha256', 'd'.repeat(64)],
  ] as const)(
    'rejects QA run pair selectedFrames[0].%s drift',
    (field, value) => {
      const [run1, run2] = validQaRunPair();
      const selectedFrames = run2.selectedFrames.map((entry) => ({...entry}));
      selectedFrames[0] = {...selectedFrames[0]!, [field]: value};

      expect(() =>
        qaReleaseGates.verifyQaRunPair(run1, {...run2, selectedFrames}),
      ).toThrow(
        new RegExp(`^QA run pair: selectedFrames\\[0\\]\\.${field}\\b`),
      );
    },
  );

  test.each([
    ['null', null],
    ['non-object', 'not-a-qa-report'],
  ] as const)('rejects a %s QA report', (_case, candidate) => {
    expect(() => qaReleaseGates.verifyQaReport(candidate)).toThrow(
      /^QA report: report\b/,
    );
  });

  test.each([
    ['wrong numeric value', 2],
    ['string coercion', '1'],
  ] as const)(
    'rejects QA report schemaVersion %s',
    (_case, schemaVersion) => {
      expect(() =>
        qaReleaseGates.verifyQaReport({
          ...validQaReport(),
          schemaVersion,
        }),
      ).toThrow(/^QA report: schemaVersion\b/);
    },
  );

  test.each([
    ['wrong value', 'passed'],
    ['non-string', true],
  ] as const)('rejects QA report status %s', (_case, status) => {
    expect(() =>
      qaReleaseGates.verifyQaReport({...validQaReport(), status}),
    ).toThrow(/^QA report: status\b/);
  });

  test.each([
    ['blank', '   '],
    ['wrong', 'frame-rounded synchronization'],
  ] as const)(
    'rejects a %s QA report boundedClaim',
    (_case, boundedClaim) => {
      expect(() =>
        qaReleaseGates.verifyQaReport({
          ...validQaReport(),
          boundedClaim,
        }),
      ).toThrow(/^QA report: boundedClaim\b/);
    },
  );

  test.each([
    ['false', false],
    ['non-boolean', 'true'],
  ] as const)(
    'rejects QA report fullMediaExecuted %s',
    (_case, fullMediaExecuted) => {
      expect(() =>
        qaReleaseGates.verifyQaReport({
          ...validQaReport(),
          fullMediaExecuted,
        }),
      ).toThrow(/^QA report: fullMediaExecuted\b/);
    },
  );

  test('rejects a QA report with missing requirementMatrix', () => {
    const candidate: Record<string, unknown> = {...validQaReport()};
    delete candidate.requirementMatrix;

    expect(() => qaReleaseGates.verifyQaReport(candidate)).toThrow(
      /^QA report: requirementMatrix: Requirement matrix: must be an object\b/,
    );
  });

  test('rejects a QA report with non-object requirementMatrix', () => {
    expect(() =>
      qaReleaseGates.verifyQaReport({
        ...validQaReport(),
        requirementMatrix: 'not-a-requirement-matrix',
      }),
    ).toThrow(
      /^QA report: requirementMatrix: Requirement matrix: must be an object\b/,
    );
  });

  test('attributes a missing prepublication criterion through the QA report', () => {
    const report = validQaReport();
    const matrix = requirementMatrix('prepublication');
    matrix.criteria.splice(6, 1);

    expect(() =>
      qaReleaseGates.verifyQaReport({...report, requirementMatrix: matrix}),
    ).toThrow(/^QA report: requirementMatrix: Criterion 7: missing\b/);
  });

  test('proves the QA report validates criterion 1 in prepublication mode', () => {
    const report = validQaReport();
    const matrix = requirementMatrix('prepublication');
    criterion(matrix, 1).status = 'pending-publication';

    expect(() =>
      qaReleaseGates.verifyQaReport({...report, requirementMatrix: matrix}),
    ).toThrow(
      /^QA report: requirementMatrix: Criterion 1: prepublication status must be proved, got pending-publication\b/,
    );
  });

  test('proves the QA report keeps criterion 11 pending in prepublication mode', () => {
    const report = validQaReport();
    const matrix = requirementMatrix('prepublication');
    criterion(matrix, 11).status = 'proved';

    expect(() =>
      qaReleaseGates.verifyQaReport({...report, requirementMatrix: matrix}),
    ).toThrow(
      /^QA report: requirementMatrix: Criterion 11: prepublication status must be pending-publication, got proved\b/,
    );
  });

  test('attributes empty prepublication evidence through the QA report', () => {
    const report = validQaReport();
    const matrix = requirementMatrix('prepublication');
    criterion(matrix, 3).evidence = [];

    expect(() =>
      qaReleaseGates.verifyQaReport({...report, requirementMatrix: matrix}),
    ).toThrow(
      /^QA report: requirementMatrix: Criterion 3: evidence must be a nonempty array\b/,
    );
  });

  test('attributes an unsupported prepublication status through the QA report', () => {
    const report = validQaReport();
    const matrix = requirementMatrix('prepublication');
    criterion(matrix, 4).status = 'unsupported';

    expect(() =>
      qaReleaseGates.verifyQaReport({...report, requirementMatrix: matrix}),
    ).toThrow(
      /^QA report: requirementMatrix: Criterion 4: unsupported status unsupported\b/,
    );
  });

  test('rejects a QA report with missing artifactReferences', () => {
    const candidate: Record<string, unknown> = {...validQaReport()};
    delete candidate.artifactReferences;

    expect(() => qaReleaseGates.verifyQaReport(candidate)).toThrow(
      /^QA report: artifactReferences\b/,
    );
  });

  test.each([
    ['non-array', 'not-artifact-references'],
    ['empty', []],
  ] as const)(
    'rejects QA report artifactReferences that are %s',
    (_case, artifactReferences) => {
      expect(() =>
        qaReleaseGates.verifyQaReport({
          ...validQaReport(),
          artifactReferences,
        }),
      ).toThrow(/^QA report: artifactReferences\b/);
    },
  );

  test('rejects a non-object QA report artifactReferences entry', () => {
    const report = validQaReport();
    const artifactReferences = report.artifactReferences.map((entry) => ({
      ...entry,
    }));
    artifactReferences[0] = null as never;

    expect(() =>
      qaReleaseGates.verifyQaReport({...report, artifactReferences}),
    ).toThrow(/^QA report: artifactReferences\[0\]\b/);
  });

  test.each([
    'reference-render',
    'public-master',
    'sync-proof',
  ] as const)(
    'rejects QA report artifactReferences missing required %s',
    (requiredId) => {
      const report = validQaReport();

      expect(() =>
        qaReleaseGates.verifyQaReport({
          ...report,
          artifactReferences: report.artifactReferences.filter(
            ({id}) => id !== requiredId,
          ),
        }),
      ).toThrow(/^QA report: artifactReferences\b/);
    },
  );

  test('rejects QA report artifactReferences without QA evidence', () => {
    const report = validQaReport();
    const qaEvidenceIds = new Set<string>(
      QA_ARTIFACT_SPECS.filter(({kind}) => kind.startsWith('qa-')).map(
        ({id}) => id,
      ),
    );

    expect(() =>
      qaReleaseGates.verifyQaReport({
        ...report,
        artifactReferences: report.artifactReferences.filter(
          ({id}) => !qaEvidenceIds.has(id),
        ),
      }),
    ).toThrow(/^QA report: artifactReferences\b/);
  });

  test('rejects QA report artifactReferences with a duplicate ID', () => {
    const report = validQaReport();
    const artifactReferences = report.artifactReferences.map((entry) => ({
      ...entry,
    }));
    const duplicateIndex = artifactReferences.length;
    artifactReferences.push({...artifactReferences[3]!});

    expect(() =>
      qaReleaseGates.verifyQaReport({...report, artifactReferences}),
    ).toThrow(
      new RegExp(
        `^QA report: artifactReferences\\[${duplicateIndex}\\]\\.id\\b`,
      ),
    );
  });

  test.each([
    ['blank', '   '],
    ['non-string', 42],
  ] as const)(
    'rejects a %s QA report artifactReferences[0].id',
    (_case, id) => {
      const report = validQaReport();
      const artifactReferences = report.artifactReferences.map((entry) => ({
        ...entry,
      })) as Array<Record<string, unknown>>;
      artifactReferences[0]!.id = id;

      expect(() =>
        qaReleaseGates.verifyQaReport({...report, artifactReferences}),
      ).toThrow(/^QA report: artifactReferences\[0\]\.id\b/);
    },
  );

  test.each([
    ['blank', '   '],
    ['absolute', 'C:/private/qa-artifact.bin'],
    ['UNC', '\\\\server\\share\\qa-artifact.bin'],
    [
      'traversal',
      'projects/tanisea-lyric-film/work/qa/../private/qa-artifact.bin',
    ],
    ['URL', 'https://example.com/qa-artifact.bin'],
    ['non-string', 42],
  ] as const)(
    'rejects a %s QA report artifactReferences[0].path',
    (_case, path) => {
      const report = validQaReport();
      const artifactReferences = report.artifactReferences.map((entry) => ({
        ...entry,
      })) as Array<Record<string, unknown>>;
      artifactReferences[0]!.path = path;

      expect(() =>
        qaReleaseGates.verifyQaReport({...report, artifactReferences}),
      ).toThrow(/^QA report: artifactReferences\[0\]\.path\b/);
    },
  );

  test('rejects a missing QA report artifactReferences[0].sha256', () => {
    const report = validQaReport();
    const artifactReferences = report.artifactReferences.map((entry) => ({
      ...entry,
    })) as Array<Record<string, unknown>>;
    delete artifactReferences[0]!.sha256;

    expect(() =>
      qaReleaseGates.verifyQaReport({...report, artifactReferences}),
    ).toThrow(/^QA report: artifactReferences\[0\]\.sha256\b/);
  });

  test.each([
    ['short', 'a'.repeat(63)],
    ['malformed', 'g'.repeat(64)],
    ['uppercase', 'A'.repeat(64)],
    ['non-string', 42],
  ] as const)(
    'rejects a %s QA report artifactReferences[0].sha256',
    (_case, sha256) => {
      const report = validQaReport();
      const artifactReferences = report.artifactReferences.map((entry) => ({
        ...entry,
      })) as Array<Record<string, unknown>>;
      artifactReferences[0]!.sha256 = sha256;

      expect(() =>
        qaReleaseGates.verifyQaReport({...report, artifactReferences}),
      ).toThrow(/^QA report: artifactReferences\[0\]\.sha256\b/);
    },
  );

  test('rejects a QA report with missing runReferences', () => {
    const candidate: Record<string, unknown> = {...validQaReport()};
    delete candidate.runReferences;

    expect(() => qaReleaseGates.verifyQaReport(candidate)).toThrow(
      /^QA report: runReferences\b/,
    );
  });

  test('rejects QA report runReferences that are non-array', () => {
    expect(() =>
      qaReleaseGates.verifyQaReport({
        ...validQaReport(),
        runReferences: 'not-run-references',
      }),
    ).toThrow(/^QA report: runReferences\b/);
  });

  test('rejects a non-object QA report runReferences entry', () => {
    const report = validQaReport();
    const runReferences = report.runReferences.map((entry) => ({...entry}));
    runReferences[0] = null as never;

    expect(() =>
      qaReleaseGates.verifyQaReport({...report, runReferences}),
    ).toThrow(/^QA report: runReferences\[0\]\b/);
  });

  test.each([
    ['empty', 0],
    ['one entry', 1],
    ['extra entry', 3],
  ] as const)(
    'rejects QA report runReferences with %s',
    (_case, referenceCount) => {
      const report = validQaReport();
      const runReferences = report.runReferences.map((entry) => ({...entry}));
      if (referenceCount === 3) {
        runReferences.push({...runReferences[1]!});
      } else {
        runReferences.length = referenceCount;
      }

      expect(() =>
        qaReleaseGates.verifyQaReport({...report, runReferences}),
      ).toThrow(/^QA report: runReferences\b/);
    },
  );

  test('rejects reversed QA report runReferences', () => {
    const report = validQaReport();
    const runReferences = [
      {...report.runReferences[1]!},
      {...report.runReferences[0]!},
    ];

    expect(() =>
      qaReleaseGates.verifyQaReport({...report, runReferences}),
    ).toThrow(/^QA report: runReferences\[0\]\.runId\b/);
  });

  test('rejects an invalid QA report runReferences[0].runId', () => {
    const report = validQaReport();
    const runReferences = report.runReferences.map((entry) => ({...entry}));
    runReferences[0]!.runId = 'run-3';

    expect(() =>
      qaReleaseGates.verifyQaReport({...report, runReferences}),
    ).toThrow(/^QA report: runReferences\[0\]\.runId\b/);
  });

  test('rejects duplicate QA report runReferences runId values', () => {
    const report = validQaReport();
    const runReferences = report.runReferences.map((entry) => ({...entry}));
    runReferences[1]!.runId = runReferences[0]!.runId;

    expect(() =>
      qaReleaseGates.verifyQaReport({...report, runReferences}),
    ).toThrow(/^QA report: runReferences\[1\]\.runId\b/);
  });

  test('rejects a missing QA report runReferences[0].runId', () => {
    const report = validQaReport();
    const runReferences = report.runReferences.map((entry) => ({
      ...entry,
    })) as Array<Record<string, unknown>>;
    delete runReferences[0]!.runId;

    expect(() =>
      qaReleaseGates.verifyQaReport({...report, runReferences}),
    ).toThrow(/^QA report: runReferences\[0\]\.runId\b/);
  });

  test.each([
    ['blank', '   '],
    ['absolute', 'C:/private/qa-run.json'],
    ['UNC', '\\\\server\\share\\qa-run.json'],
    [
      'traversal',
      'projects/tanisea-lyric-film/work/qa/run-1/../private/qa-run.json',
    ],
    ['URL', 'https://example.com/qa-run.json'],
    ['non-string', 42],
  ] as const)(
    'rejects a %s QA report runReferences[0].path',
    (_case, path) => {
      const report = validQaReport();
      const runReferences = report.runReferences.map((entry) => ({
        ...entry,
      })) as Array<Record<string, unknown>>;
      runReferences[0]!.path = path;

      expect(() =>
        qaReleaseGates.verifyQaReport({...report, runReferences}),
      ).toThrow(/^QA report: runReferences\[0\]\.path\b/);
    },
  );

  test('rejects a missing QA report runReferences[0].sha256', () => {
    const report = validQaReport();
    const runReferences = report.runReferences.map((entry) => ({
      ...entry,
    })) as Array<Record<string, unknown>>;
    delete runReferences[0]!.sha256;

    expect(() =>
      qaReleaseGates.verifyQaReport({...report, runReferences}),
    ).toThrow(/^QA report: runReferences\[0\]\.sha256\b/);
  });

  test.each([
    ['short', 'a'.repeat(63)],
    ['malformed', 'g'.repeat(64)],
    ['uppercase', 'A'.repeat(64)],
    ['non-string', 42],
  ] as const)(
    'rejects a %s QA report runReferences[0].sha256',
    (_case, sha256) => {
      const report = validQaReport();
      const runReferences = report.runReferences.map((entry) => ({
        ...entry,
      })) as Array<Record<string, unknown>>;
      runReferences[0]!.sha256 = sha256;

      expect(() =>
        qaReleaseGates.verifyQaReport({...report, runReferences}),
      ).toThrow(/^QA report: runReferences\[0\]\.sha256\b/);
    },
  );

  test('rejects a QA report with missing comparison', () => {
    const candidate: Record<string, unknown> = {...validQaReport()};
    delete candidate.comparison;

    expect(() => qaReleaseGates.verifyQaReport(candidate)).toThrow(
      /^QA report: comparison\b/,
    );
  });

  test('rejects a QA report with non-object comparison', () => {
    expect(() =>
      qaReleaseGates.verifyQaReport({
        ...validQaReport(),
        comparison: 'not-a-comparison',
      }),
    ).toThrow(/^QA report: comparison\b/);
  });

  test.each([
    ['false', false],
    ['non-boolean', 'true'],
  ] as const)(
    'rejects QA report comparison.matched %s',
    (_case, matched) => {
      const report = validQaReport();

      expect(() =>
        qaReleaseGates.verifyQaReport({
          ...report,
          comparison: {...report.comparison, matched},
        }),
      ).toThrow(/^QA report: comparison\.matched\b/);
    },
  );

  test.each([
    ['wrong', 'run-1'],
    ['blank', '   '],
    ['non-string', 42],
  ] as const)(
    'rejects a %s QA report comparison.authoritativeRunId',
    (_case, authoritativeRunId) => {
      const report = validQaReport();

      expect(() =>
        qaReleaseGates.verifyQaReport({
          ...report,
          comparison: {...report.comparison, authoritativeRunId},
        }),
      ).toThrow(/^QA report: comparison\.authoritativeRunId\b/);
    },
  );

  test.each([
    ['blank', '   '],
    ['absolute', 'C:/private/run-comparison.json'],
    ['UNC', '\\\\server\\share\\run-comparison.json'],
    [
      'traversal',
      'projects/tanisea-lyric-film/work/qa/run-2/../private/run-comparison.json',
    ],
    ['URL', 'https://example.com/run-comparison.json'],
    ['non-string', 42],
  ] as const)(
    'rejects a %s QA report comparison.recordPath',
    (_case, recordPath) => {
      const report = validQaReport();

      expect(() =>
        qaReleaseGates.verifyQaReport({
          ...report,
          comparison: {...report.comparison, recordPath},
        }),
      ).toThrow(/^QA report: comparison\.recordPath\b/);
    },
  );

  test('rejects a missing QA report comparison.recordSha256', () => {
    const report = validQaReport();
    const comparison: Record<string, unknown> = {...report.comparison};
    delete comparison.recordSha256;

    expect(() =>
      qaReleaseGates.verifyQaReport({...report, comparison}),
    ).toThrow(/^QA report: comparison\.recordSha256\b/);
  });

  test.each([
    ['short', 'a'.repeat(63)],
    ['malformed', 'g'.repeat(64)],
    ['uppercase', 'A'.repeat(64)],
    ['non-string', 42],
  ] as const)(
    'rejects a %s QA report comparison.recordSha256',
    (_case, recordSha256) => {
      const report = validQaReport();

      expect(() =>
        qaReleaseGates.verifyQaReport({
          ...report,
          comparison: {...report.comparison, recordSha256},
        }),
      ).toThrow(/^QA report: comparison\.recordSha256\b/);
    },
  );

  test('rejects a missing QA report comparison.unexplainedDrift', () => {
    const report = validQaReport();
    const comparison: Record<string, unknown> = {...report.comparison};
    delete comparison.unexplainedDrift;

    expect(() =>
      qaReleaseGates.verifyQaReport({...report, comparison}),
    ).toThrow(/^QA report: comparison\.unexplainedDrift\b/);
  });

  test.each([
    ['non-array', 'not-an-array'],
    ['nonempty', ['frame drift']],
    ['non-string entry', [42]],
  ] as const)(
    'rejects QA report comparison.unexplainedDrift that is %s',
    (_case, unexplainedDrift) => {
      const report = validQaReport();

      expect(() =>
        qaReleaseGates.verifyQaReport({
          ...report,
          comparison: {...report.comparison, unexplainedDrift},
        }),
      ).toThrow(/^QA report: comparison\.unexplainedDrift\b/);
    },
  );

  test.each([
    ['a drive absolute path', 'C:\\Users\\private\\qa-report.json'],
    ['a UNC path', '\\\\server\\share\\qa-report.json'],
    ['a macOS home path', '/Users/private/qa-report.json'],
    ['a Linux home path', '/home/private/qa-report.json'],
    ['a superpowers path', '.superpowers/plans/qa-report.md'],
    ['subagent narration', 'a subagent verified the renderer evidence'],
    ['an explicit agent nickname', 'Agent Atlas verified the renderer evidence'],
    [
      'worker/process orchestration narration',
      'worker process 2 was orchestrated to verify the renderer evidence',
    ],
  ] as const)(
    'rejects nested QA report text containing %s',
    (_case, note) => {
      expect(() =>
        qaReleaseGates.verifyQaReport({
          ...validQaReport(),
          privacyReview: {evidence: [{note}]},
        }),
      ).toThrow(
        /^QA report: private\/absolute field privacyReview\.evidence\[0\]\.note\b/,
      );
    },
  );

  test('accepts a neutral nested QA report note', () => {
    expect(() =>
      qaReleaseGates.verifyQaReport({
        ...validQaReport(),
        privacyReview: {
          evidence: [{note: 'alignment and renderer evidence verified'}],
        },
      }),
    ).not.toThrow();
  });
});

describe('Task 7 pure-gate review Fix Round A', () => {
  describe('authoritative requirement evidence', () => {
    test('rejects unsupported-self-assertion with exact criterion and evidence attribution', () => {
      const matrix = requirementMatrix('prepublication');
      Object.assign(criterion(matrix, 1).evidence[0]!, {
        kind: 'unsupported-self-assertion',
        artifact: 'audits/placeholder.json',
        sha256: '',
        value: 'claimed',
      });

      expect(() => verifyRequirementMatrix(matrix, 'prepublication')).toThrow(
        'Criterion 1 evidence[0]: unsupported kind unsupported-self-assertion; expected source-audio',
      );
    });

    test.each([
      [5, 'alignment-manifest', 'semantic-map'],
      [10, 'test-result', 'qa-run-comparison'],
    ] as const)(
      'rejects criterion %i evidence using wrong kind %s',
      (criterionId, kind, expectedKind) => {
        const matrix = requirementMatrix('prepublication');
        criterion(matrix, criterionId).evidence[0]!.kind = kind;

        expect(() =>
          verifyRequirementMatrix(matrix, 'prepublication'),
        ).toThrow(
          `Criterion ${criterionId} evidence[0]: unsupported kind ${kind}; expected ${expectedKind}`,
        );
      },
    );

    test('rejects an alignment-manifest authority bound to an arbitrary artifact', () => {
      const matrix = requirementMatrix('prepublication');
      criterion(matrix, 3).evidence[0]!.artifact = 'audits/placeholder.json';

      expect(() => verifyRequirementMatrix(matrix, 'prepublication')).toThrow(
        /^Criterion 3 evidence\[0\]: alignment-manifest artifact\b/,
      );
    });

    test('rejects the final QA report as self-proof', () => {
      const matrix = requirementMatrix('prepublication');
      criterion(matrix, 10).evidence[0]!.artifact =
        'audits/tanisea-final-qa-vnext.json';

      expect(() => verifyRequirementMatrix(matrix, 'prepublication')).toThrow(
        /^Criterion 10 evidence\[0\]: qa-run-comparison artifact\b/,
      );
    });

    test('rejects non-release evidence without lowercase SHA-256 despite a value claim', () => {
      const matrix = requirementMatrix('prepublication');
      Object.assign(criterion(matrix, 2).evidence[0]!, {
        sha256: '',
        value: 'tests claimed green',
      });

      expect(() => verifyRequirementMatrix(matrix, 'prepublication')).toThrow(
        'Criterion 2 evidence[0]: sha256 must be 64 lowercase hexadecimal characters',
      );
    });

    test('forbids release-url authority in prepublication mode', () => {
      const matrix = requirementMatrix('prepublication');
      Object.assign(criterion(matrix, 11).evidence[0]!, {
        kind: 'release-url',
        artifact: 'https://github.com/ael-dev3/lyrics/releases/tag/v2.0.0',
        value: 'v2.0.0 published',
      });

      expect(() => verifyRequirementMatrix(matrix, 'prepublication')).toThrow(
        'Criterion 11 evidence[0]: unsupported kind release-url; expected publication-readiness',
      );
    });

    test('requires final release-url authority to use HTTPS GitHub release identity', () => {
      const matrix = requirementMatrix('final');
      criterion(matrix, 11).evidence[0]!.artifact =
        'http://github.com/ael-dev3/lyrics/releases/tag/v2.0.0';

      expect(() => verifyRequirementMatrix(matrix, 'final')).toThrow(
        'Criterion 11 evidence[0]: release-url artifact must be an HTTPS GitHub release URL for ael-dev3/lyrics',
      );
    });

    test('requires final release-url authority to carry nonempty value detail', () => {
      const matrix = requirementMatrix('final');
      criterion(matrix, 11).evidence[0]!.value = '   ';

      expect(() => verifyRequirementMatrix(matrix, 'final')).toThrow(
        'Criterion 11 evidence[0]: release-url value must be a nonempty string',
      );
    });
  });

  describe('public upper reactive markup', () => {
    test.each([
      ['audio meter', 'data-audio-meter="reactive"', 'top:24px'],
      ['moving spectrum', 'data-spectrum="motion"', 'top:48px'],
      ['reactive motion', 'data-motion="reactive"', 'top:72px'],
      ['upper visualizer', 'data-visualizer="upper reactive"', 'left:24px'],
    ] as const)(
      'rejects a top or upper %s without a rail descriptor',
      (_case, descriptor, position) => {
        expect(() =>
          verifyPublicMarkup(
            `${publicFrameMarkup}<div ${descriptor} style="position:absolute;${position}"></div>`,
          ),
        ).toThrow(/forbidden (?:top-positioned|upper) reactive element/);
      },
    );

    test('accepts a bottom-positioned reactive audio spectrum', () => {
      expect(() =>
        verifyPublicMarkup(
          `${publicFrameMarkup}<div data-audio-meter="reactive spectrum" style="position:absolute;bottom:68px"></div>`,
        ),
      ).not.toThrow();
    });
  });

  describe('prepublication report privacy and publication claims', () => {
    test.each([
      ['rooted POSIX path', 'path=/tmp/private/run.log'],
      [
        'GitHub release URL',
        'https://github.com/ael-dev3/lyrics/releases/tag/v2.0.0',
      ],
      ['published claim', 'release status: published'],
      ['publication-complete claim', 'publication-complete'],
    ] as const)(
      'rejects nested QA report value containing %s',
      (_case, note) => {
        expect(() =>
          qaReleaseGates.verifyQaReport({
            ...validQaReport(),
            privacyReview: {evidence: [{note}]},
          }),
        ).toThrow(
          /^QA report: private\/absolute field privacyReview\.evidence\[0\]\.note\b/,
        );
      },
    );

    test.each([
      ['rooted POSIX path', 'path=/tmp/private/run.log'],
      ['publication-complete claim', 'publicationComplete'],
    ] as const)(
      'rejects a QA report object key containing %s with key attribution',
      (_case, field) => {
        expect(() =>
          qaReleaseGates.verifyQaReport({
            ...validQaReport(),
            privacyReview: {[field]: 'neutral evidence detail'},
          }),
        ).toThrow(
          new RegExp(
            `^QA report: private/absolute field privacyReview\\.${field.replace(/[.*+?^${}()|[\\]\\]/g, '\\$&')} \\(key\\)`,
          ),
        );
      },
    );
  });
});

const QA_B1_COVERAGE_MUTATIONS = [
  {
    label: 'a missing displayed line',
    field: 'lineIds',
    value: QA_LINE_IDS.slice(0, -1),
  },
  {
    label: 'reordered displayed lines',
    field: 'lineIds',
    value: [QA_LINE_IDS[1], QA_LINE_IDS[0], ...QA_LINE_IDS.slice(2)],
  },
  {
    label: 'an incomplete speed-variant list',
    field: 'speedVariants',
    value: ['normal'],
  },
  {
    label: 'an incomplete dedicated-range list',
    field: 'dedicatedRanges',
    value: QA_DEDICATED_RANGES.slice(0, -1),
  },
  {
    label: 'a reordered proof-range list',
    field: 'proofRanges',
    value: [...QA_PROOF_RANGES].reverse(),
  },
  {
    label: 'an incomplete backward-cue list',
    field: 'cueIds',
    value: QA_CUE_IDS.slice(0, -1),
  },
  {
    label: 'an incomplete contact-offset list',
    field: 'contactOffsets',
    value: [0, 1, 2],
  },
  {
    label: 'an incomplete cadence list',
    field: 'cadences',
    value: [60],
  },
  {
    label: 'an incomplete still-purpose list',
    field: 'stillPurposes',
    value: QA_STILL_PURPOSES.slice(0, -1),
  },
  {
    label: 'an unhashed-artifact flag',
    field: 'allArtifactsHashed',
    value: false,
  },
  {
    label: 'the wrong media-manifest artifact ID',
    field: 'mediaManifestArtifactId',
    value: 'qa-media-manifest-copy',
  },
] as const;

const QA_B1_PAIR_COVERAGE_DRIFT = [
  ['lineIds', QA_LINE_IDS.slice(1)],
  ['speedVariants', [...QA_SPEED_VARIANTS].reverse()],
  ['dedicatedRanges', QA_DEDICATED_RANGES.slice(0, -1)],
  ['proofRanges', [...QA_PROOF_RANGES].reverse()],
  ['cueIds', QA_CUE_IDS.slice(0, -1)],
  ['contactOffsets', [0, 1, 2]],
  ['cadences', [60]],
  ['stillPurposes', QA_STILL_PURPOSES.slice(0, -1)],
  ['allArtifactsHashed', false],
  ['mediaManifestArtifactId', 'qa-media-manifest-copy'],
] as const;

describe('Task 7 pure-gate review Fix Round B1 complete QA run records', () => {
  test('accepts the exact complete dirty B1 run and run-local selected-frame paths', () => {
    const run = validQaRunRecord('run-1');
    const [run1, run2] = validQaRunPair();

    expect(() => qaReleaseGates.verifyQaRunRecord(run)).not.toThrow();
    expect(() => qaReleaseGates.verifyQaRunPair(run1, run2)).not.toThrow();
  });

  describe('Git logical consistency', () => {
    test('accepts a logically clean run with no status entries', () => {
      const run = validQaRunRecord('run-1');

      expect(() =>
        qaReleaseGates.verifyQaRunRecord({
          ...run,
          git: {...run.git, isClean: true, statusEntries: []},
        }),
      ).not.toThrow();
    });

    test.each([
      ['clean with dirty entries', true, validQaRunRecord('run-1').git.statusEntries],
      ['dirty with no entries', false, []],
    ] as const)(
      'rejects a run that is %s',
      (_case, isClean, statusEntries) => {
        const run = validQaRunRecord('run-1');

        expect(() =>
          qaReleaseGates.verifyQaRunRecord({
            ...run,
            git: {...run.git, isClean, statusEntries},
          }),
        ).toThrow(/^QA run run-1: git\.isClean\/statusEntries\b/);
      },
    );
  });

  describe('complete authoritative artifact inventory', () => {
    test.each(
      QA_ARTIFACT_SPECS.slice(6).map(({id}) => [id] as const),
    )('rejects a run missing required B1 artifact ID %s', (id) => {
      const run = validQaRunRecord('run-1');
      const artifacts = run.artifacts.filter((artifact) => artifact.id !== id);

      expect(() =>
        qaReleaseGates.verifyQaRunRecord({...run, artifacts}),
      ).toThrow(
        new RegExp(
          `^QA run run-1: artifacts must include required ID ${id}\\b`,
        ),
      );
    });

    test.each(
      QA_ARTIFACT_SPECS.map(({id, kind}, index) =>
        [id, kind, index] as const,
      ),
    )(
      'binds artifact ID %s to its approved kind and path authority',
      (id, kind, index) => {
        const run = validQaRunRecord('run-1');
        const wrongKindArtifacts = run.artifacts.map((artifact) => ({
          ...artifact,
        })) as Array<Record<string, unknown>>;
        wrongKindArtifacts[index]!.kind = `${kind}-copy`;

        expect.soft(() =>
          qaReleaseGates.verifyQaRunRecord({
            ...run,
            artifacts: wrongKindArtifacts,
          }),
        ).toThrow(
          new RegExp(`^QA run run-1: artifacts\\[${index}\\]\\.kind\\b`),
        );

        const wrongPathArtifacts = run.artifacts.map((artifact) => ({
          ...artifact,
        })) as Array<Record<string, unknown>>;
        wrongPathArtifacts[index]!.path =
          `projects/tanisea-lyric-film/work/qa/media/wrong/${id}.bin`;

        expect.soft(() =>
          qaReleaseGates.verifyQaRunRecord({
            ...run,
            artifacts: wrongPathArtifacts,
          }),
        ).toThrow(
          new RegExp(`^QA run run-1: artifacts\\[${index}\\]\\.path\\b`),
        );
      },
    );

    test('rejects duplicate artifact paths even when IDs and hashes differ', () => {
      const run = validQaRunRecord('run-1');
      const artifacts = run.artifacts.map((artifact) => ({...artifact}));
      artifacts[1]!.path = artifacts[0]!.path;

      expect(() =>
        qaReleaseGates.verifyQaRunRecord({...run, artifacts}),
      ).toThrow(/^QA run run-1: artifacts\[1\]\.path\b/);
    });
  });

  describe('release-media artifact evidence cross-links', () => {
    test.each([
      ['reference', 'reference-render', 'public-master'],
      ['public', 'public-master', 'sync-proof'],
      ['proof', 'sync-proof', 'public-master'],
    ] as const)(
      'requires media.%s identity evidence to cross-link artifact %s',
      (kind, artifactId, wrongArtifactId) => {
        const run = validQaRunRecord('run-1');
        const mediaEntry = {...run.media[kind]} as Record<string, unknown>;
        const withoutArtifactId = {...mediaEntry};
        delete withoutArtifactId.artifactId;
        expect.soft(() =>
          qaReleaseGates.verifyQaRunRecord({
            ...run,
            media: {...run.media, [kind]: withoutArtifactId},
          }),
        ).toThrow(
          new RegExp(`^QA run run-1: media\\.${kind}\\.artifactId\\b`),
        );

        expect.soft(() =>
          qaReleaseGates.verifyQaRunRecord({
            ...run,
            media: {
              ...run.media,
              [kind]: {...mediaEntry, artifactId: wrongArtifactId},
            },
          }),
        ).toThrow(
          new RegExp(`^QA run run-1: media\\.${kind}\\.artifactId\\b`),
        );

        const withoutFileSha256 = {...mediaEntry};
        delete withoutFileSha256.fileSha256;
        expect.soft(() =>
          qaReleaseGates.verifyQaRunRecord({
            ...run,
            media: {...run.media, [kind]: withoutFileSha256},
          }),
        ).toThrow(
          new RegExp(`^QA run run-1: media\\.${kind}\\.fileSha256\\b`),
        );

        const fileSha256 = mediaEntry.fileSha256 as Record<string, unknown>;
        expect.soft(() =>
          qaReleaseGates.verifyQaRunRecord({
            ...run,
            media: {
              ...run.media,
              [kind]: {
                ...mediaEntry,
                fileSha256: {...fileSha256, source: 'requested-sha256-file'},
              },
            },
          }),
        ).toThrow(
          new RegExp(
            `^QA run run-1: media\\.${kind}\\.fileSha256\\.source\\b`,
          ),
        );

        expect.soft(() =>
          qaReleaseGates.verifyQaRunRecord({
            ...run,
            media: {
              ...run.media,
              [kind]: {
                ...mediaEntry,
                fileSha256: {...fileSha256, value: 'f'.repeat(64)},
              },
            },
          }),
        ).toThrow(
          new RegExp(
            `^QA run run-1: media\\.${kind}\\.fileSha256\\.value\\b`,
          ),
        );

      },
    );
  });

  describe('exact deterministic QA coverage', () => {
    test('rejects a run without qaCoverage', () => {
      const run: Record<string, unknown> = {...validQaRunRecord('run-1')};
      delete run.qaCoverage;

      expect(() => qaReleaseGates.verifyQaRunRecord(run)).toThrow(
        /^QA run run-1: qaCoverage\b/,
      );
    });

    test.each(QA_B1_COVERAGE_MUTATIONS)(
      'rejects qaCoverage with $label',
      ({field, value}) => {
        const run = validQaRunRecord('run-1');

        expect(() =>
          qaReleaseGates.verifyQaRunRecord({
            ...run,
            qaCoverage: {...run.qaCoverage, [field]: value},
          }),
        ).toThrow(
          new RegExp(`^QA run run-1: qaCoverage\\.${field}\\b`),
        );
      },
    );
  });

  describe('fixed selected-frame evidence', () => {
    test.each(
      QA_SELECTED_FRAME_SPECS.map(({id, artifactId}, index) =>
        [id, artifactId, index] as const,
      ),
    )(
      'requires selected-frame ID %s and its %s artifact cross-link',
      (id, artifactId, index) => {
        const run = validQaRunRecord('run-1');
        expect.soft(() =>
          qaReleaseGates.verifyQaRunRecord({
            ...run,
            selectedFrames: run.selectedFrames.filter(
              (selectedFrame) => selectedFrame.id !== id,
            ),
          }),
        ).toThrow(
          new RegExp(
            `^QA run run-1: selectedFrames must include required ID ${id}\\b`,
          ),
        );

        const wrongArtifactFrames = run.selectedFrames.map((frame) => ({
          ...frame,
        })) as Array<Record<string, unknown>>;
        wrongArtifactFrames[index]!.artifactId = 'public-master';
        expect.soft(() =>
          qaReleaseGates.verifyQaRunRecord({
            ...run,
            selectedFrames: wrongArtifactFrames,
          }),
        ).toThrow(
          new RegExp(
            `^QA run run-1: selectedFrames\\[${index}\\]\\.artifactId\\b`,
          ),
        );

        const wrongHashFrames = run.selectedFrames.map((frame) => ({
          ...frame,
        })) as Array<Record<string, unknown>>;
        wrongHashFrames[index]!.sha256 = '9'.repeat(64);
        expect.soft(() =>
          qaReleaseGates.verifyQaRunRecord({
            ...run,
            selectedFrames: wrongHashFrames,
          }),
        ).toThrow(
          new RegExp(
            `^QA run run-1: selectedFrames\\[${index}\\]\\.sha256\\b`,
          ),
        );
      },
    );
  });

  describe('deterministic run-pair evidence', () => {
    test.each(QA_B1_PAIR_COVERAGE_DRIFT)(
      'rejects qaCoverage.%s drift',
      (field, value) => {
        const [run1, run2] = validQaRunPair();

        expect(() =>
          qaReleaseGates.verifyQaRunPair(run1, {
            ...run2,
            qaCoverage: {...run2.qaCoverage, [field]: value},
          }),
        ).toThrow(new RegExp(`^QA run pair: qaCoverage\\.${field}\\b`));
      },
    );

    test.each(['public', 'proof'] as const)(
      'rejects media.%s file identity drift',
      (kind) => {
        const [run1, run2] = validQaRunPair();
        const mediaEntry = run2.media[kind];

        expect(() =>
          qaReleaseGates.verifyQaRunPair(run1, {
            ...run2,
            media: {
              ...run2.media,
              [kind]: {
                ...mediaEntry,
                fileSha256: {
                  ...mediaEntry.fileSha256,
                  value: 'f'.repeat(64),
                },
              },
            },
          }),
        ).toThrow(
          new RegExp(
            `^QA run pair: media\\.${kind}\\.fileSha256\\.value\\b`,
          ),
        );
      },
    );

    test.each(
      QA_SELECTED_FRAME_SPECS.map(({id}, index) => [id, index] as const),
    )('rejects selected evidence %s artifactId drift', (_id, index) => {
      const [run1, run2] = validQaRunPair();
      const selectedFrames = run2.selectedFrames.map((frame) => ({
        ...frame,
      })) as Array<Record<string, unknown>>;
      selectedFrames[index]!.artifactId = 'public-master';

      expect(() =>
        qaReleaseGates.verifyQaRunPair(run1, {...run2, selectedFrames}),
      ).toThrow(
        new RegExp(
          `^QA run pair: selectedFrames\\[${index}\\]\\.artifactId\\b`,
        ),
      );
    });
  });
});

describe('Task 7 pure-gate review Fix Round B2 complete QA report', () => {
  test('accepts the complete cross-linked prepublication report', () => {
    expect(() => qaReleaseGates.verifyQaReport(validQaReport())).not.toThrow();
  });

  describe('embedded authoritative run', () => {
    test('requires authoritativeRun', () => {
      const report: Record<string, unknown> = {...validQaReport()};
      delete report.authoritativeRun;

      expect(() => qaReleaseGates.verifyQaReport(report)).toThrow(
        /^QA report: authoritativeRun\b/,
      );
    });

    test('requires authoritativeRun to be run-2', () => {
      expect(() =>
        qaReleaseGates.verifyQaReport({
          ...validQaReport(),
          authoritativeRun: validQaRunRecord('run-1'),
        }),
      ).toThrow(/^QA report: authoritativeRun\b/);
    });

    test('rejects an internally invalid authoritativeRun', () => {
      const report = validQaReport();

      expect(() =>
        qaReleaseGates.verifyQaReport({
          ...report,
          authoritativeRun: {
            ...report.authoritativeRun,
            qaCoverage: {
              ...report.authoritativeRun.qaCoverage,
              contactOffsets: [-1, 0, 1],
            },
          },
        }),
      ).toThrow(/^QA report: authoritativeRun\b/);
    });
  });

  describe('complete artifact-reference cross-links', () => {
    test.each(QA_ARTIFACT_SPECS.map(({id}) => [id] as const))(
      'rejects a report missing authoritative artifact reference %s',
      (id) => {
        const report = validQaReport();

        expect(() =>
          qaReleaseGates.verifyQaReport({
            ...report,
            artifactReferences: report.artifactReferences.filter(
              (reference) => reference.id !== id,
            ),
          }),
        ).toThrow(/^QA report: artifactReferences\b/);
      },
    );

    test.each(QA_ARTIFACT_SPECS.map(({id}, index) => [id, index] as const))(
      'rejects mismatched path/hash cross-links for %s',
      (_id, index) => {
        const report = validQaReport();
        const wrongPath = report.artifactReferences.map((reference) => ({
          ...reference,
        })) as Array<Record<string, unknown>>;
        wrongPath[index]!.path =
          'projects/tanisea-lyric-film/work/qa/media/invented-evidence.bin';
        expect.soft(() =>
          qaReleaseGates.verifyQaReport({
            ...report,
            artifactReferences: wrongPath,
          }),
        ).toThrow(/^QA report: artifactReferences\b/);

        const wrongHash = report.artifactReferences.map((reference) => ({
          ...reference,
        }));
        wrongHash[index]!.sha256 =
          wrongHash[index]!.sha256 === '9'.repeat(64)
            ? '8'.repeat(64)
            : '9'.repeat(64);
        expect.soft(() =>
          qaReleaseGates.verifyQaReport({
            ...report,
            artifactReferences: wrongHash,
          }),
        ).toThrow(/^QA report: artifactReferences\b/);
      },
    );

    test('rejects reordered or invented artifact references', () => {
      const report = validQaReport();
      expect.soft(() =>
        qaReleaseGates.verifyQaReport({
          ...report,
          artifactReferences: [...report.artifactReferences].reverse(),
        }),
      ).toThrow(/^QA report: artifactReferences\b/);

      expect.soft(() =>
        qaReleaseGates.verifyQaReport({
          ...report,
          artifactReferences: [
            ...report.artifactReferences,
            {
              id: 'invented-proof',
              path: 'projects/tanisea-lyric-film/work/qa/media/invented.png',
              sha256: '9'.repeat(64),
            },
          ],
        }),
      ).toThrow(/^QA report: artifactReferences\b/);
    });
  });

  describe('exact source summary', () => {
    test('requires sourceSummary', () => {
      const report: Record<string, unknown> = {...validQaReport()};
      delete report.sourceSummary;
      expect(() => qaReleaseGates.verifyQaReport(report)).toThrow(
        /^QA report: sourceSummary\b/,
      );
    });

    test.each([
      ['artifactId', 'source-audio-copy'],
      ['sha256', '9'.repeat(64)],
      ['sampleRateHz', 48_000],
      ['channels', 1],
      ['channelLayout', 'mono'],
      ['publicDurationSeconds', 153.00644],
      ['decodedSamplesPerChannel', 6_747_583],
      ['retainedAnalysisDurationSeconds', 153],
    ] as const)('rejects sourceSummary.%s drift', (field, value) => {
      const report = validQaReport();
      expect(() =>
        qaReleaseGates.verifyQaReport({
          ...report,
          sourceSummary: {...report.sourceSummary, [field]: value},
        }),
      ).toThrow(new RegExp(`^QA report: sourceSummary\\.${field}\\b`));
    });
  });

  describe('exact alignment and semantic summary', () => {
    test('requires alignmentSummary', () => {
      const report: Record<string, unknown> = {...validQaReport()};
      delete report.alignmentSummary;
      expect(() => qaReleaseGates.verifyQaReport(report)).toThrow(
        /^QA report: alignmentSummary\b/,
      );
    });

    test.each([
      ['artifactId', 'alignment-copy'],
      ['sha256', '9'.repeat(64)],
      ['displayedLineCount', 23],
      ['sourceTokenCount', 101],
      ['cueReferencedSemanticSourceTokenCount', 102],
      ['explicitlyUnmappedSourceTokenIds', []],
      ['cueCount', 73],
      ['targetActivationCount', 73],
      ['chorusOccurrenceCount', 1],
      ['literalChorusPairCount', 7],
      ['maximumUncertainty', {samples: 881, milliseconds: 20}],
      [
        'observedMaximumFrameErrorMilliseconds',
        {fps60: 8.321995, fps120: 4.002269},
      ],
    ] as const)('rejects alignmentSummary.%s drift', (field, value) => {
      const report = validQaReport();
      expect(() =>
        qaReleaseGates.verifyQaReport({
          ...report,
          alignmentSummary: {...report.alignmentSummary, [field]: value},
        }),
      ).toThrow(new RegExp(`^QA report: alignmentSummary\\.${field}\\b`));
    });

    test('rejects missing, reordered, or altered reviewed semantic records', () => {
      const report = validQaReport();
      const sequences = structuredClone(
        report.alignmentSummary.reviewedSemanticSequences,
      );

      expect.soft(() =>
        qaReleaseGates.verifyQaReport({
          ...report,
          alignmentSummary: {
            ...report.alignmentSummary,
            reviewedSemanticSequences: sequences.slice(0, 1),
          },
        }),
      ).toThrow(
        /^QA report: alignmentSummary\.reviewedSemanticSequences\b/,
      );

      expect.soft(() =>
        qaReleaseGates.verifyQaReport({
          ...report,
          alignmentSummary: {
            ...report.alignmentSummary,
            reviewedSemanticSequences: [...sequences].reverse(),
          },
        }),
      ).toThrow(
        /^QA report: alignmentSummary\.reviewedSemanticSequences\b/,
      );

      sequences[1]!.records[1]!.activation = 'forward';
      expect.soft(() =>
        qaReleaseGates.verifyQaReport({
          ...report,
          alignmentSummary: {
            ...report.alignmentSummary,
            reviewedSemanticSequences: sequences,
          },
        }),
      ).toThrow(
        /^QA report: alignmentSummary\.reviewedSemanticSequences\b/,
      );
    });
  });

  describe('feature, layout, coverage, and media cross-links', () => {
    test.each([
      ['artifactId', 'audio-features-copy'],
      ['sha256', '9'.repeat(64)],
    ] as const)('rejects featuresSummary.%s drift', (field, value) => {
      const report = validQaReport();
      expect(() =>
        qaReleaseGates.verifyQaReport({
          ...report,
          featuresSummary: {...report.featuresSummary, [field]: value},
        }),
      ).toThrow(new RegExp(`^QA report: featuresSummary\\.${field}\\b`));
    });

    test.each([
      ['spectrumBandCount', 63],
      ['spectrumMeasuredCorePx', 95],
      ['spectrumMaximumCapPx', 19],
      ['minimumLyricGapPx', 35],
      ['lowerChromeClearancePx', 10],
      ['publicUpperTelemetryAbsent', false],
      ['publicGlobalUpperRailAbsent', false],
    ] as const)('rejects layoutSummary.%s drift', (field, value) => {
      const report = validQaReport();
      expect(() =>
        qaReleaseGates.verifyQaReport({
          ...report,
          layoutSummary: {...report.layoutSummary, [field]: value},
        }),
      ).toThrow(new RegExp(`^QA report: layoutSummary\\.${field}\\b`));
    });

    test('requires exact qaCoverage equality with authoritativeRun', () => {
      const report = validQaReport();
      expect(() =>
        qaReleaseGates.verifyQaReport({
          ...report,
          qaCoverage: {
            ...report.qaCoverage,
            contactOffsets: [-1, 0, 1],
          },
        }),
      ).toThrow(/^QA report: qaCoverage\b/);
    });

    test.each(['reference', 'public', 'proof'] as const)(
      'requires media.%s identity equality with authoritativeRun',
      (kind) => {
        const report = validQaReport();
        const mediaEntry = report.media[kind];
        expect(() =>
          qaReleaseGates.verifyQaReport({
            ...report,
            media: {
              ...report.media,
              [kind]: {
                ...mediaEntry,
                fileSha256: {
                  ...mediaEntry.fileSha256,
                  value: '9'.repeat(64),
                },
              },
            },
          }),
        ).toThrow(new RegExp(`^QA report: media\\.${kind}\\b`));
      },
    );
  });

  describe('prepublication publication-claim privacy', () => {
    test('rejects a top-level publicationStatus published pair', () => {
      expect(() =>
        qaReleaseGates.verifyQaReport({
          ...validQaReport(),
          publicationStatus: 'published',
        }),
      ).toThrow(
        /^QA report: private\/absolute field publicationStatus\b/,
      );
    });

    test('rejects a nested publicationStatus published pair', () => {
      expect(() =>
        qaReleaseGates.verifyQaReport({
          ...validQaReport(),
          releaseReadiness: {publicationStatus: 'published'},
        }),
      ).toThrow(
        /^QA report: private\/absolute field releaseReadiness\.publicationStatus\b/,
      );
    });

    test('rejects an object-form publicationStatus published claim', () => {
      expect(() =>
        qaReleaseGates.verifyQaReport({
          ...validQaReport(),
          publicationStatus: {state: 'published'},
        }),
      ).toThrow(
        /^QA report: private\/absolute field publicationStatus\.state\b/,
      );
    });

    test('rejects a split release.status published claim', () => {
      expect(() =>
        qaReleaseGates.verifyQaReport({
          ...validQaReport(),
          release: {status: 'published'},
        }),
      ).toThrow(
        /^QA report: private\/absolute field release\.status\b/,
      );
    });
  });
});

describe('Task 7 pure-gate final independent-review fixes', () => {
  describe('embedded two-run proof and matrix cross-link', () => {
    test('requires an individually valid baseline run-1', () => {
      const report: Record<string, unknown> = {...validQaReport()};
      delete report.baselineRun;
      expect(() => qaReleaseGates.verifyQaReport(report)).toThrow(
        /^QA report: baselineRun\b/,
      );

      expect.soft(() =>
        qaReleaseGates.verifyQaReport({
          ...validQaReport(),
          baselineRun: validQaRunRecord('run-2'),
        }),
      ).toThrow(/^QA report: baselineRun\b/);
    });

    test('applies the real run-pair gate to baselineRun and authoritativeRun', () => {
      const report = validQaReport();
      expect(() =>
        qaReleaseGates.verifyQaReport({
          ...report,
          baselineRun: {
            ...report.baselineRun,
            toolVersions: {
              ...report.baselineRun.toolVersions,
              node: 'v26.4.1',
            },
          },
        }),
      ).toThrow(/^QA report: baselineRun\/authoritativeRun pair\b/);
    });

    test('requires the report matrix to equal the authoritative run matrix', () => {
      const report = validQaReport();
      const changedMatrix = structuredClone(report.requirementMatrix);
      changedMatrix.criteria[0]!.evidence[0]!.value =
        'criterion 1 independently verified';

      expect(() =>
        qaReleaseGates.verifyQaReport({
          ...report,
          requirementMatrix: changedMatrix,
        }),
      ).toThrow(/^QA report: requirementMatrix must exactly equal authoritativeRun\b/);
    });

    test('binds run-reference and comparison records to their exact run-local paths', () => {
      const report = validQaReport();
      const runReferences = report.runReferences.map((reference) => ({
        ...reference,
      }));
      runReferences[0]!.path =
        'projects/tanisea-lyric-film/work/qa/run-2/qa-run.json';
      expect.soft(() =>
        qaReleaseGates.verifyQaReport({...report, runReferences}),
      ).toThrow(/^QA report: runReferences\[0\]\.path\b/);

      expect.soft(() =>
        qaReleaseGates.verifyQaReport({
          ...report,
          comparison: {
            ...report.comparison,
            recordPath:
              'projects/tanisea-lyric-film/work/qa/run-1/run-comparison.json',
          },
        }),
      ).toThrow(/^QA report: comparison\.recordPath\b/);
    });

    test.each([0, 1] as const)(
      'binds runReferences[%s].sha256 to its embedded QA run',
      (index) => {
        const report = validQaReport();
        const runReferences = report.runReferences.map((reference) => ({
          ...reference,
        }));
        runReferences[index]!.sha256 = '0'.repeat(64);

        expect(() =>
          qaReleaseGates.verifyQaReport({...report, runReferences}),
        ).toThrow(
          new RegExp(`^QA report: runReferences\\[${index}\\]\\.sha256\\b`),
        );
      },
    );

    test('binds comparison.recordSha256 to the exact comparison payload', () => {
      const report = validQaReport();

      expect(() =>
        qaReleaseGates.verifyQaReport({
          ...report,
          comparison: {
            ...report.comparison,
            recordSha256: '0'.repeat(64),
          },
        }),
      ).toThrow(/^QA report: comparison\.recordSha256\b/);
    });

    test('binds criterion 10 evidence to the exact comparison record', () => {
      const report = validQaReport();
      const baselineRun = structuredClone(report.baselineRun);
      const authoritativeRun = structuredClone(report.authoritativeRun);
      const comparisonEvidenceSha256 = '0'.repeat(64);
      criterion(baselineRun.requirementMatrix, 10).evidence[0]!.sha256 =
        comparisonEvidenceSha256;
      criterion(authoritativeRun.requirementMatrix, 10).evidence[0]!.sha256 =
        comparisonEvidenceSha256;

      expect(() =>
        qaReleaseGates.verifyQaReport({
          ...report,
          baselineRun,
          authoritativeRun,
          requirementMatrix: authoritativeRun.requirementMatrix,
          runReferences: [
            {...report.runReferences[0], sha256: qaJsonSha256(baselineRun)},
            {
              ...report.runReferences[1],
              sha256: qaJsonSha256(authoritativeRun),
            },
          ],
        }),
      ).toThrow(/^QA report: requirementMatrix criterion 10 evidence\b/);
    });
  });

  describe('run-local selected-frame paths', () => {
    test.each(
      QA_SELECTED_FRAME_SPECS.map(({id}, index) => [id, index] as const),
    )('rejects non-local selected frame path for %s', (_id, index) => {
      const run = validQaRunRecord('run-1');
      const selectedFrames = run.selectedFrames.map((frame) => ({
        ...frame,
      }));
      selectedFrames[index]!.path =
        `projects/tanisea-lyric-film/work/qa/run-2/selected-frames/${selectedFrames[index]!.id}.png`;

      expect(() =>
        qaReleaseGates.verifyQaRunRecord({...run, selectedFrames}),
      ).toThrow(
        new RegExp(`^QA run run-1: selectedFrames\\[${index}\\]\\.path\\b`),
      );
    });
  });

  describe('normalized final release URL authority', () => {
    test.each([
      'https://github.com/ael-dev3/lyrics/releases/tag/..',
      'https://github.com/ael-dev3/lyrics/releases/tag/.',
      'https://github.com/ael-dev3/lyrics/releases/tag/%2e%2e',
      'https://github.com/ael-dev3/lyrics/releases/tag/%252e%252e',
      'https://github.com/ael-dev3/lyrics/releases/tag/%252Ffake',
      'https://github.com/ael-dev3/lyrics/releases/tag/%255Cfake',
      'https://github.com/ael-dev3/lyrics/releases/tag/%3Ffake',
      'https://github.com/ael-dev3/lyrics/releases/tag/%23fake',
      'https://github.com/ael-dev3/lyrics/releases/tag/%253Ffake',
      'https://github.com/ael-dev3/lyrics/releases/tag/%2523fake',
      'https://github.com/ael-dev3/lyrics/releases/download/v2.0.0/..',
      'https://github.com/ael-dev3/lyrics/releases/download/v2.0.0/%252Fasset.mp4',
      'https://github.com@evil.example/ael-dev3/lyrics/releases/tag/v2.0.0',
    ])('rejects non-release or dot-segment URL %s', (artifact) => {
      const matrix = requirementMatrix('final');
      criterion(matrix, 11).evidence[0] = {
        ...criterion(matrix, 11).evidence[0]!,
        artifact,
      };

      expect(() =>
        verifyRequirementMatrix(matrix, 'final'),
      ).toThrow(
        /Criterion 11 evidence\[0\]: release-url artifact must be an HTTPS GitHub release URL/,
      );
    });
  });

  describe('structural and prose publication claims', () => {
    test.each([
      ['boolean isPublished', {isPublished: true}, 'isPublished'],
      [
        'nested boolean isPublished',
        {release: {isPublished: true}},
        'release\\.isPublished',
      ],
      [
        'publication state string',
        {publication: {state: 'published'}},
        'publication\\.state',
      ],
      [
        'published prose',
        {note: 'The release is published and ready.'},
        'note',
      ],
      [
        'wrapped publication state',
        {publication: {details: {state: 'published'}}},
        'publication\\.details\\.state',
      ],
      [
        'wrapped release status',
        {release: {details: {status: 'published'}}},
        'release\\.details\\.status',
      ],
      [
        'wrapped publicationStatus value',
        {publicationStatus: {value: 'published'}},
        'publicationStatus\\.value',
      ],
      [
        'publicationStatus array value',
        {publicationStatus: ['published']},
        'publicationStatus\\[0\\]',
      ],
      [
        'release-context array value',
        {release: {details: ['published']}},
        'release\\.details\\[0\\]',
      ],
      [
        'past-tense publication prose',
        {note: 'The release was published yesterday.'},
        'note',
      ],
      [
        'active publication prose',
        {note: 'We published the release after QA.'},
        'note',
      ],
      [
        'perfect-tense publication prose',
        {note: 'The publication has been published.'},
        'note',
      ],
    ] as const)('rejects %s', (_case, fields, pathPattern) => {
      expect(() =>
        qaReleaseGates.verifyQaReport({...validQaReport(), ...fields}),
      ).toThrow(
        new RegExp(`^QA report: private/absolute field ${pathPattern}\\b`),
      );
    });
  });
});
