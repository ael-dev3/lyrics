const SAMPLE_RATE = 44_100;
const CHANNELS = 2;
const FRAME_COUNT = 9_180;
const BAND_COUNT = 64;
const FREQUENCY_MIN = 20;
const FREQUENCY_MAX = 20_000;
const LOCKED_AAC_LEADING_SKIP_SAMPLES = 1_600;
const LOCKED_DECODED_SAMPLES_PER_CHANNEL = 6_747_584;
const LOCKED_AUDIO_FEATURE_SHA256 =
  'c9453f8c6fb3de3f16e691b51b4155c5db7e313f5aac1cc7942904754d29b7cf';

const LOCKED_DECODE_FILTER =
  `atrim=start_sample=${LOCKED_AAC_LEADING_SKIP_SAMPLES},` +
  'asetpts=PTS-STARTPTS';

export const assertLockedAudioFeatureArtifact = (
  decodedSamplesPerChannel: number,
  artifactSha256: string,
): void => {
  if (decodedSamplesPerChannel !== LOCKED_DECODED_SAMPLES_PER_CHANNEL) {
    throw new Error(
      'Audio-feature decode geometry must retain exactly 6,747,584 samples per channel',
    );
  }
  if (artifactSha256 !== LOCKED_AUDIO_FEATURE_SHA256) {
    throw new Error(
      `Audio-feature SHA-256 identity must be exactly ${LOCKED_AUDIO_FEATURE_SHA256}`,
    );
  }
};

export const buildAudioFeaturePcmArgs = (
  sourcePath: string,
  outputPath: string,
): readonly string[] => [
  '-v',
  'error',
  '-flags2',
  '+skip_manual',
  '-i',
  sourcePath,
  '-af',
  LOCKED_DECODE_FILTER,
  '-f',
  'f32le',
  '-acodec',
  'pcm_f32le',
  '-ac',
  String(CHANNELS),
  '-ar',
  String(SAMPLE_RATE),
  outputPath,
  '-y',
];

export const buildAudioFeatureSpectrumArgs = (
  sourcePath: string,
  outputPath: string,
): readonly string[] => [
  '-v',
  'error',
  '-flags2',
  '+skip_manual',
  '-i',
  sourcePath,
  '-lavfi',
  [
    LOCKED_DECODE_FILTER,
    [
      `showspectrumpic=s=${FRAME_COUNT}x${BAND_COUNT}`,
      'mode=combined',
      'color=intensity',
      'scale=log',
      'fscale=log',
      'win_func=hann',
      'legend=0',
      `start=${FREQUENCY_MIN}`,
      `stop=${FREQUENCY_MAX}`,
      'drange=80',
      'limit=0',
    ].join(':'),
  ].join(','),
  '-frames:v',
  '1',
  '-pix_fmt',
  'gray',
  '-f',
  'rawvideo',
  outputPath,
  '-y',
];
