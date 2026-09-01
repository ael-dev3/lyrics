import {describe, expect, test} from 'vitest';
import {
  createReferenceNormalizationPlan,
  parseVideoStreamSha256,
  verifyNormalizedReferenceProbe,
} from '../scripts/normalize-reference';

const exactProbe = () => ({
  streams: [
    {
      codec_type: 'video',
      codec_name: 'prores',
      profile: '4444',
      codec_tag_string: 'ap4h',
      width: 2160,
      height: 2160,
      sample_aspect_ratio: '1:1',
      display_aspect_ratio: '1:1',
      pix_fmt: 'yuv444p12le',
      color_range: 'tv',
      color_space: 'bt709',
      color_transfer: 'bt709',
      color_primaries: 'bt709',
      r_frame_rate: '60/1',
      avg_frame_rate: '60/1',
      start_time: '0.000000',
      duration: '153.000000',
      bits_per_raw_sample: '12',
      nb_frames: '9180',
    },
  ],
  format: {
    start_time: '0.000000',
    duration: '153.000000',
  },
});

describe('reference metadata normalization', () => {
  test('plans a video-packet-copy remux with explicit square BT.709 metadata', () => {
    const plan = createReferenceNormalizationPlan(
      'output/reference.mov',
      'output/reference.metadata-normalized.mov',
    );

    expect(plan.remux).toEqual({
      executable: 'ffmpeg',
      arguments: [
        '-v',
        'error',
        '-i',
        'output/reference.mov',
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
        'output/reference.metadata-normalized.mov',
      ],
    });
    expect(plan.sourceVideoHash.arguments).toContain(
      'output/reference.mov',
    );
    expect(plan.normalizedVideoHash.arguments).toContain(
      'output/reference.metadata-normalized.mov',
    );
    expect(plan.probe.arguments.at(-1)).toBe(
      'output/reference.metadata-normalized.mov',
    );
  });

  test('accepts the exact normalized 12-bit ProRes 4444 probe', () => {
    expect(verifyNormalizedReferenceProbe(exactProbe())).toEqual({
      frameCount: 9180,
      durationSeconds: 153,
      pixelFormat: 'yuv444p12le',
      sampleAspectRatio: '1:1',
    });
  });

  test.each([
    ['missing SAR', (probe: ReturnType<typeof exactProbe>) => {
      delete (probe.streams[0] as {sample_aspect_ratio?: string})
        .sample_aspect_ratio;
    }, /sample aspect ratio/i],
    ['wrong decoded depth', (probe: ReturnType<typeof exactProbe>) => {
      probe.streams[0].pix_fmt = 'yuv444p10le';
    }, /pixel format/i],
    ['missing transfer declaration', (probe: ReturnType<typeof exactProbe>) => {
      delete (probe.streams[0] as {color_transfer?: string}).color_transfer;
    }, /transfer/i],
  ] as const)('rejects %s', (_label, mutate, pattern) => {
    const probe = exactProbe();
    mutate(probe);
    expect(() => verifyNormalizedReferenceProbe(probe)).toThrow(pattern);
  });

  test('parses one exact SHA-256 streamhash and rejects ambiguity', () => {
    const hash = 'a'.repeat(64);
    expect(parseVideoStreamSha256(`0,v,SHA256=${hash}\n`)).toBe(hash);
    expect(() =>
      parseVideoStreamSha256(`0,v,SHA256=${hash}\n0,v,SHA256=${hash}\n`),
    ).toThrow(/exactly one/i);
  });
});
