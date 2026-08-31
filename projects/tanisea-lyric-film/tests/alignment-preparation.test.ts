import {describe, expect, test} from 'vitest';
import {
  assessMfaCoverage,
  measureFrameLag,
  observeFrameLag,
  parseTextGridWords,
  parseWhisperXWords,
} from '../scripts/import-alignment-evidence';
import {
  ALIGNMENT_PADDING_SAMPLES,
  assertLockedPcmGeometry,
  assertLockedSourceTimeline,
  buildLockedDecodeArgs,
  buildClipPlans,
} from '../scripts/prepare-alignment';

const MFA_FIXTURE = `File type = "ooTextFile"
Object class = "TextGrid"

item [1]:
    class = "IntervalTier"
    name = "words"
    xmin = 0
    xmax = 3
    intervals [1]:
        xmin = 0
        xmax = 1.1607482993
        text = ""
    intervals [2]:
        xmin = 1.1607482993
        xmax = 1.3605442177
        text = "А"
    intervals [3]:
        xmin = 1.3605442177
        xmax = 2
        text = " Я "
item [2]:
    class = "IntervalTier"
    name = "phones"
    xmin = 0
    xmax = 3`;

const WHISPERX_FIXTURE = {
  word_segments: [
    {word: ' Я ', start: 0.125, end: 0.5},
    {word: 'ПОЮ', start: 0.5, end: 0.875},
  ],
};

describe('alignment evidence import', () => {
  test('parses MFA word intervals into source-relative samples', () => {
    const words = parseTextGridWords(MFA_FIXTURE, 1_020_000);
    expect(words[0]).toEqual({
      text: 'а',
      startSample: 1_071_189,
      endSample: 1_080_000,
    });
  });

  test('rejects an MFA TextGrid without a words tier', () => {
    expect(() => parseTextGridWords('item [1]:\nname = "phones"', 0)).toThrow(
      /no words tier/,
    );
  });

  test('parses WhisperX words into source-relative samples', () => {
    expect(parseWhisperXWords(WHISPERX_FIXTURE, 88_200)).toEqual([
      {text: 'я', startSample: 93_713, endSample: 110_250},
      {text: 'пою', startSample: 110_250, endSample: 126_788},
    ]);
  });

  test('rejects malformed WhisperX words instead of inventing timestamps', () => {
    expect(() =>
      parseWhisperXWords({word_segments: [{word: 'слово', start: 0.5}]}, 0),
    ).toThrow(/missing text\/start\/end/);
  });

  test('records missing MFA files as absent evidence', () => {
    expect(
      assessMfaCoverage(
        ['C1-01', 'C1-02', 'C1-03'],
        ['C1-01', 'C1-03'],
      ),
    ).toEqual({
      availableIds: ['C1-01', 'C1-03'],
      missingIds: ['C1-02'],
    });
  });

  test('returns the median latency when stem lag is constant', () => {
    expect(
      measureFrameLag([
        {sourceSample: 1_000_000, lagSamples: 64},
        {sourceSample: 2_500_000, lagSamples: 71},
        {sourceSample: 4_000_000, lagSamples: 89},
      ]),
    ).toBe(71);
  });

  test('measures positive lag when a stem is delayed from the source', () => {
    const source = new Float32Array(128);
    const stem = new Float32Array(128);
    for (let sample = 24; sample < 104; sample++) {
      source[sample] = ((sample * 17) % 29 - 14) / 14;
    }
    for (let sample = 24; sample < 99; sample++) {
      stem[sample + 5] = source[sample] ?? 0;
    }

    expect(
      observeFrameLag(source, stem, 64, {
        windowSamples: 48,
        maxLagSamples: 8,
      }),
    ).toEqual({sourceSample: 64, lagSamples: 5});
  });

  test('rejects a stem with time-varying lag', () => {
    expect(() =>
      measureFrameLag([
        {sourceSample: 1_000_000, lagSamples: 64},
        {sourceSample: 2_500_000, lagSamples: 71},
        {sourceSample: 4_000_000, lagSamples: 911},
      ]),
    ).toThrow(/inconsistent stem latency/);
  });
});

describe('alignment corpus preparation', () => {
  test('requires separate 153-second stream and container timelines', () => {
    expect(() =>
      assertLockedSourceTimeline({
        codec: 'aac',
        sampleFormat: 'fltp',
        sampleRate: 44_100,
        channels: 2,
        streamDurationSeconds: 153,
        containerDurationSeconds: 153.00644,
        durationSamples: 6_747_300,
        timeBase: '1/44100',
      }),
    ).toThrow(/stream\/container timeline/);
  });

  test('rejects a decoded WAV that is not exact stereo float PCM', () => {
    expect(() =>
      assertLockedPcmGeometry({
        codec: 'pcm_s16le',
        sampleFormat: 's16',
        sampleRate: 44_100,
        channels: 2,
        streamDurationSeconds: 153.00644,
        containerDurationSeconds: 153.00644,
        durationSamples: 6_747_584,
        timeBase: '1/44100',
      }),
    ).toThrow(/float PCM/);
  });

  test('retains the locked post-edit AAC sample geometry on FFmpeg 9', () => {
    expect(buildLockedDecodeArgs('source.m4a', 'locked.wav')).toEqual([
      '-hide_banner',
      '-loglevel',
      'error',
      '-nostdin',
      '-y',
      '-flags2',
      '+skip_manual',
      '-i',
      'source.m4a',
      '-map',
      '0:a:0',
      '-vn',
      '-af',
      'atrim=start_sample=1600,asetpts=PTS-STARTPTS',
      '-ac',
      '2',
      '-ar',
      '44100',
      '-c:a',
      'pcm_f32le',
      'locked.wav',
    ]);
  });

  test('converts phrase windows to padded sample-exact clip plans', () => {
    expect(ALIGNMENT_PADDING_SAMPLES).toBe(4_410);
    expect(
      buildClipPlans(
        [
          {
            id: 'C1-01',
            text: 'А я сотру горизонт',
            vocalStart: 24.29,
            vocalEnd: 27.36,
          },
        ],
        6_747_584,
      ),
    ).toEqual([
      {
        id: 'C1-01',
        text: 'А я сотру горизонт',
        vocalStartSample: 1_071_189,
        vocalEndSample: 1_206_576,
        clipOffsetSamples: 1_066_779,
        clipEndSample: 1_210_986,
        clipSampleCount: 144_207,
        paddingBeforeSamples: 4_410,
        paddingAfterSamples: 4_410,
      },
    ]);
  });

  test('clamps requested padding to the decoded source bounds', () => {
    expect(
      buildClipPlans(
        [{id: 'edge', text: 'край', vocalStart: 0.05, vocalEnd: 0.1}],
        5_000,
      )[0],
    ).toMatchObject({
      clipOffsetSamples: 0,
      clipEndSample: 5_000,
      clipSampleCount: 5_000,
      paddingBeforeSamples: 2_205,
      paddingAfterSamples: 590,
    });
  });
});
