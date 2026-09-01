import {createHash} from 'node:crypto';

export type RequirementMatrixMode = 'baseline' | 'prepublication' | 'final';
export type DeliveryMetadataKind = 'public' | 'proof';

type UnknownRecord = Record<string, unknown>;

const SUPPORTED_STATUSES = new Set([
  'proved',
  'pending-repeat',
  'pending-publication',
]);
const GIT_COMMIT_PATTERN = /^[0-9a-f]{40}$/;
const SHA256_PATTERN = /^[0-9a-f]{64}$/;
const URL_PATTERN = /^[a-z][a-z\d+.-]*:\/\//i;
const DRIVE_PATH_PATTERN = /^[a-z]:/i;
const PATH_TRAVERSAL_PATTERN = /(?:^|[\\/])\.\.(?:[\\/]|$)/;
const MARKUP_TAG_PATTERN = /<[^<>]*>/g;
const MARKUP_TAG_SHAPE =
  /^<\s*(\/?)\s*([a-z][a-z\d:-]*)([\s\S]*?)(\/?)\s*>$/i;
const MARKUP_ATTRIBUTE_PATTERN =
  /\s+([^\s"'=<>`/]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+)))?/gy;
const VOID_MARKUP_TAGS = new Set([
  'area',
  'base',
  'br',
  'col',
  'embed',
  'hr',
  'img',
  'input',
  'link',
  'meta',
  'param',
  'source',
  'track',
  'wbr',
]);
const PUBLIC_CORNERS = [
  'top-left',
  'top-right',
  'bottom-left',
  'bottom-right',
] as const;
const PUBLIC_SLOTS = ['identity', 'track-label', 'timecode'] as const;
const QA_BOUNDED_CLAIM =
  'sample-indexed alignment with frame-bounded rendering';
const QA_TOOL_VERSION_FIELDS = [
  'node',
  'npm',
  'ffmpeg',
  'ffprobe',
] as const;
const QA_COMMAND_SPECS = [
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
type QaArtifactAuthority = Readonly<{
  id: string;
  kind: string;
  path: string;
}>;

const QA_ARTIFACT_AUTHORITIES: readonly QaArtifactAuthority[] = [
  {
    id: 'source-audio',
    kind: 'source-audio',
    path: 'projects/tanisea-lyric-film/public/soundtrack.m4a',
  },
  {
    id: 'alignment-manifest',
    kind: 'alignment',
    path: 'projects/tanisea-lyric-film/alignment/tanisea-word-alignment-v3.json',
  },
  {
    id: 'audio-features',
    kind: 'features',
    path: 'projects/tanisea-lyric-film/public/audio-features.bin',
  },
  {
    id: 'reference-render',
    kind: 'reference',
    path: 'projects/tanisea-lyric-film/output/Tanisea-Lyric-Film-vNext-reference-2x.mov',
  },
  {
    id: 'public-master',
    kind: 'public',
    path: 'projects/tanisea-lyric-film/output/Tanisea-Lyric-Film-vNext-60fps-Archival-Master.mp4',
  },
  {
    id: 'sync-proof',
    kind: 'proof',
    path: 'projects/tanisea-lyric-film/output/Tanisea-Lyric-Film-Sync-Proof-120fps.mp4',
  },
  {
    id: 'qa-media-manifest',
    kind: 'qa-manifest',
    path: 'projects/tanisea-lyric-film/work/qa/media/qa-media-manifest.json',
  },
  {
    id: 'v1-03-public-contact',
    kind: 'qa-contact',
    path: 'projects/tanisea-lyric-film/work/qa/media/contacts/v1-03/public/frame-004224.png',
  },
  {
    id: 'v1-03-public-contact-sheet',
    kind: 'qa-contact-sheet',
    path: 'projects/tanisea-lyric-film/work/qa/media/contact-sheets/v1-03-public.png',
  },
  {
    id: 'v1-03-proof-contact-sheet',
    kind: 'qa-contact-sheet',
    path: 'projects/tanisea-lyric-film/work/qa/media/contact-sheets/v1-03-proof.png',
  },
  {
    id: 'v1-08-public-contact-sheet',
    kind: 'qa-contact-sheet',
    path: 'projects/tanisea-lyric-film/work/qa/media/contact-sheets/v1-08-public.png',
  },
  {
    id: 'v1-08-proof-contact-sheet',
    kind: 'qa-contact-sheet',
    path: 'projects/tanisea-lyric-film/work/qa/media/contact-sheets/v1-08-proof.png',
  },
  {
    id: 'public-chrome-still',
    kind: 'qa-still',
    path: 'projects/tanisea-lyric-film/work/qa/media/stills/public-chrome.png',
  },
  {
    id: 'public-handoff-still',
    kind: 'qa-still',
    path: 'projects/tanisea-lyric-film/work/qa/media/stills/public-handoff.png',
  },
  {
    id: 'public-focus-still',
    kind: 'qa-still',
    path: 'projects/tanisea-lyric-film/work/qa/media/stills/public-focus.png',
  },
  {
    id: 'public-safe-area-still',
    kind: 'qa-still',
    path: 'projects/tanisea-lyric-film/work/qa/media/stills/public-safe-area.png',
  },
  {
    id: 'public-spectrum-peak-still',
    kind: 'qa-still',
    path: 'projects/tanisea-lyric-film/work/qa/media/stills/public-spectrum-peak.png',
  },
  {
    id: 'proof-backward-contact-still',
    kind: 'qa-still',
    path: 'projects/tanisea-lyric-film/work/qa/media/stills/proof-backward-contact.png',
  },
  {
    id: 'reference-transition-still',
    kind: 'qa-still',
    path: 'projects/tanisea-lyric-film/work/qa/media/stills/reference-final-transition.png',
  },
];
const QA_ARTIFACT_AUTHORITY_BY_ID = new Map(
  QA_ARTIFACT_AUTHORITIES.map((authority) => [authority.id, authority] as const),
);
const QA_REQUIRED_ARTIFACT_IDS = new Set(
  QA_ARTIFACT_AUTHORITIES.map(({id}) => id),
);
const QA_ADDITIONAL_ARTIFACT_KIND_PATTERN = /^qa-[a-z0-9]+(?:-[a-z0-9]+)*$/;
const QA_ADDITIONAL_ARTIFACT_PATH_PREFIX =
  'projects/tanisea-lyric-film/work/qa/media/';
const QA_REQUIRED_EVIDENCE_KINDS = new Set([
  'qa-contact',
  'qa-contact-sheet',
  'qa-still',
]);
const QA_REPORT_REQUIRED_ARTIFACT_IDS = new Set([
  'reference-render',
  'public-master',
  'sync-proof',
]);
const QA_REPORT_EVIDENCE_IDS = new Set([
  'v1-03-public-contact',
  'v1-08-proof-contact',
  'v1-03-contact-sheet',
  'v1-08-contact-sheet',
  'public-chrome-still',
  'proof-contact-still',
  'reference-transition-still',
]);
const QA_REPORT_PRIVATE_TEXT_PATTERNS = [
  /(?:^|[\s"'(])(?:[a-z]:[\\/])/i,
  /\\\\[^\\/\s]+[\\/]/,
  /(?:^|[\s"'(])\/(?:Users|home)\//i,
  /(?:^|[\s"'(=:{,])\/(?![\/\s])[^\s"'<>)]*/,
  /\bhttps:\/\/[^\s"'<>]*\/releases(?:\/[^\s"'<>]*)?/i,
  /\b(?:release|publication)\s+status\s*:\s*published\b/i,
  /\b(?:the\s+)?(?:release|publication)\s+(?:is|was|has\s+been)\s+published\b/i,
  /\b(?:we\s+)?published\s+(?:the\s+)?(?:release|publication)\b/i,
  /\bpublication[\s_-]*complete\b/i,
  /(?:^|[\\/])\.superpowers(?:[\\/]|$)/i,
  /\bsubagent\b/i,
  /\bagent\b/i,
  /\bworker\s+process\b|\borchestrat(?:e|ed|es|ing|ion)\b/i,
] as const;
const NEUTRAL_PUBLICATION_PATTERNS = [
  ['Windows path', /(?:^|[\s"'(])(?:[a-z]:[\\/])/i],
  ['UNC path', /\\\\[^\\/\s]+[\\/]/],
  ['POSIX home', /(?:^|[\s"'(])\/(?:Users|home)\//i],
  ['ChatGPT provenance', /\bChatGPT\b/i],
  ['Codex provenance', /\bCodex\b/i],
  ['workflow name', /\bsuperpowers\b/i],
  ['approval provenance', /\buser[\s_-]*approved\b/i],
  [
    'report provenance',
    /\bsupplied(?:\s+[\w/-]+){0,3}\s+report\b/i,
  ],
  ['prompt excerpt', /\bprompt(?:ed|ing|s)?\b/i],
  ['unsupported precision', /\bmillisecond[\s-]*perfect\b/i],
  ['unsupported certainty', /\bzero\s+uncertainty\b/i],
] as const;
const QA_SELECTED_FRAME_COMPOSITIONS = new Set([
  'LyricFilmVNext',
  'LyricFilmSyncProof',
]);
const QA_SELECTED_FRAME_AUTHORITIES = [
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
    frame: 10394,
  },
  {
    id: 'final-transition',
    artifactId: 'reference-transition-still',
    composition: 'LyricFilmVNext',
    frame: 7092,
  },
] as const;
const QA_SELECTED_FRAME_AUTHORITY_BY_ID: ReadonlyMap<
  string,
  (typeof QA_SELECTED_FRAME_AUTHORITIES)[number]
> = new Map(
  QA_SELECTED_FRAME_AUTHORITIES.map((authority) => [
    authority.id,
    authority,
  ] as const),
);
const QA_COVERAGE_EXPECTED: Readonly<Record<string, unknown>> = {
  lineIds: [
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
  ],
  speedVariants: ['normal', 'half'],
  dedicatedRanges: [
    'v1-03',
    'v1-08',
    'chorus-1',
    'chorus-2',
    'final-handoff',
  ],
  proofRanges: ['v1-03', 'v1-08'],
  cueIds: [
    'C1-04-C01',
    'C1-04-C02',
    'C1-04-C03',
    'V1-03-C01',
    'V1-03-C02',
    'V1-03-C03',
    'V1-08-C01',
    'V1-08-C02',
    'V1-08-C03',
    'V1-08-C04',
  ],
  contactOffsets: [-1, 0, 1, 2],
  cadences: [60, 120],
  stillPurposes: [
    'chrome',
    'handoff',
    'focus',
    'safe-area',
    'spectrum-peak',
    'backward-contact',
    'final-transition',
  ],
  allArtifactsHashed: true,
  mediaManifestArtifactId: 'qa-media-manifest',
};
const QA_COVERAGE_FIELDS = Object.keys(QA_COVERAGE_EXPECTED);
const QA_COVERAGE_FIELD_SET = new Set(QA_COVERAGE_FIELDS);

type RequirementEvidenceKind =
  | 'source-audio'
  | 'test-result'
  | 'alignment-manifest'
  | 'semantic-map'
  | 'cadence-verification'
  | 'public-markup'
  | 'encoded-frame'
  | 'layout-verification'
  | 'qa-run-comparison'
  | 'publication-readiness'
  | 'release-url';

const REQUIREMENT_EVIDENCE_KINDS = new Map<
  number,
  readonly RequirementEvidenceKind[]
>([
  [1, ['source-audio']],
  [2, ['test-result']],
  [3, ['alignment-manifest']],
  [4, ['alignment-manifest']],
  [5, ['semantic-map']],
  [6, ['semantic-map']],
  [7, ['cadence-verification', 'cadence-verification']],
  [8, ['public-markup', 'encoded-frame']],
  [9, ['layout-verification', 'encoded-frame']],
  [10, ['qa-run-comparison']],
]);

const SOURCE_AUDIO_ARTIFACT =
  'projects/tanisea-lyric-film/public/soundtrack.m4a';
const ALIGNMENT_MANIFEST_ARTIFACT =
  'projects/tanisea-lyric-film/alignment/tanisea-word-alignment-v3.json';
const QA_RUN_ARTIFACT_ROOT =
  'projects/tanisea-lyric-film/work/qa/run-[12]';
const TEST_RESULT_ARTIFACT_PATTERN = new RegExp(
  `^${QA_RUN_ARTIFACT_ROOT}/logs/check\\.log$`,
);
const CADENCE_VERIFICATION_ARTIFACT_PATTERN = new RegExp(
  `^${QA_RUN_ARTIFACT_ROOT}/logs/verify-(?:public|proof)\\.log$`,
);
const PUBLIC_MARKUP_ARTIFACT_PATTERN = new RegExp(
  `^${QA_RUN_ARTIFACT_ROOT}/logs/verify-public-markup\\.log$`,
);
const LAYOUT_VERIFICATION_ARTIFACT_PATTERN = new RegExp(
  `^${QA_RUN_ARTIFACT_ROOT}/logs/layout-verify\\.log$`,
);
const ENCODED_FRAME_ARTIFACT_PATTERN =
  /^projects\/tanisea-lyric-film\/work\/qa\/(?:media\/.+|run-[12]\/selected-frames\/[^/]+)\.png$/;
const QA_RUN_COMPARISON_ARTIFACT =
  'projects/tanisea-lyric-film/work/qa/run-2/run-comparison.json';
const PUBLICATION_READINESS_ARTIFACTS = new Set([
  'projects/tanisea-lyric-film/output/Tanisea-Lyric-Film-vNext-reference-2x.mov',
  'projects/tanisea-lyric-film/output/Tanisea-Lyric-Film-vNext-60fps-Archival-Master.mp4',
  'projects/tanisea-lyric-film/output/Tanisea-Lyric-Film-Sync-Proof-120fps.mp4',
]);

type ParsedMarkupTag = Readonly<{
  name: string;
  attributes: ReadonlyMap<string, string>;
}>;

const isRecord = (value: unknown): value is UnknownRecord =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const qaJsonSha256 = (value: unknown): string =>
  createHash('sha256')
    .update(`${JSON.stringify(value, null, 2)}\n`)
    .digest('hex');

const isNonemptyString = (value: unknown): value is string =>
  typeof value === 'string' && value.trim().length > 0;

export const verifyNeutralPublicationText = (
  source: unknown,
  label: string,
): void => {
  if (!isNonemptyString(label)) {
    throw new Error('Publication document label must be a nonempty string');
  }
  if (!isNonemptyString(source)) {
    throw new Error(`${label}: document must be a nonempty string`);
  }
  for (const [finding, pattern] of NEUTRAL_PUBLICATION_PATTERNS) {
    if (pattern.test(source)) {
      throw new Error(`${label}: ${finding}`);
    }
  }
};

const isRepositoryRelativePath = (value: unknown): value is string =>
  isNonemptyString(value) &&
  !URL_PATTERN.test(value) &&
  !value.startsWith('/') &&
  !value.startsWith('\\') &&
  !DRIVE_PATH_PATTERN.test(value) &&
  !PATH_TRAVERSAL_PATTERN.test(value);

const describeValue = (value: unknown): string =>
  typeof value === 'string' ? value : String(value);

function deliveryMetadataError(
  label: 'Public' | 'Proof',
  detail: string,
): never {
  throw new Error(`${label} delivery metadata: ${detail}`);
}

const requireDeliveryRecord = (
  parent: UnknownRecord,
  field: string,
  path: string,
  label: 'Public' | 'Proof',
): UnknownRecord => {
  const value = parent[field];
  if (!isRecord(value)) {
    deliveryMetadataError(label, `${path} must be an object`);
  }
  return value;
};

const requireExactDeliveryValue = (
  record: UnknownRecord,
  field: string,
  path: string,
  expected: string | number | boolean,
  label: 'Public' | 'Proof',
): void => {
  const value = record[field];
  if (typeof value !== typeof expected || value !== expected) {
    deliveryMetadataError(
      label,
      `${path} must be exactly ${JSON.stringify(expected)}`,
    );
  }
};

const requirePositiveInteger = (
  record: UnknownRecord,
  field: string,
  path: string,
  label: 'Public' | 'Proof',
): number => {
  const value = record[field];
  if (typeof value !== 'number' || !Number.isInteger(value) || value <= 0) {
    deliveryMetadataError(label, `${path} must be a positive integer`);
  }
  return value;
};

const requireDeliverySha256 = (
  record: UnknownRecord,
  field: string,
  path: string,
  label: 'Public' | 'Proof',
): string => {
  const value = record[field];
  if (typeof value !== 'string' || !SHA256_PATTERN.test(value)) {
    deliveryMetadataError(
      label,
      `${path} must be 64 lowercase hexadecimal characters`,
    );
  }
  return value;
};

export const verifyDeliveryMetadata = (
  actual: unknown,
  kind: DeliveryMetadataKind,
): void => {
  if (kind !== 'public' && kind !== 'proof') {
    throw new Error(`Delivery metadata: unsupported kind ${describeValue(kind)}`);
  }

  const label = kind === 'public' ? 'Public' : 'Proof';
  if (!isRecord(actual)) {
    deliveryMetadataError(label, 'must be an object');
  }

  const video = requireDeliveryRecord(actual, 'video', 'video', label);
  const audio = requireDeliveryRecord(actual, 'audio', 'audio', label);
  const sourceAudio = requireDeliveryRecord(
    actual,
    'sourceAudio',
    'sourceAudio',
    label,
  );
  const container = requireDeliveryRecord(
    actual,
    'container',
    'container',
    label,
  );
  const strictDecode = requireDeliveryRecord(
    actual,
    'strictDecode',
    'strictDecode',
    label,
  );

  for (const [field, expected] of [
    ['codecName', kind === 'public' ? 'hevc' : 'h264'],
    ['codecTag', kind === 'public' ? 'hvc1' : 'avc1'],
    ['width', 1080],
    ['height', 1080],
    ['avgFrameRate', kind === 'public' ? '60/1' : '120/1'],
    ['realFrameRate', kind === 'public' ? '60/1' : '120/1'],
    ['pixelFormat', kind === 'public' ? 'yuv420p10le' : 'yuv420p'],
    ['sampleAspectRatio', '1:1'],
    ['colorRange', 'tv'],
    ['colorSpace', 'bt709'],
    ['colorTransfer', 'bt709'],
    ['colorPrimaries', 'bt709'],
    ['startTime', '0.000000'],
    ['duration', '153.000000'],
  ] as const) {
    requireExactDeliveryValue(video, field, `video.${field}`, expected, label);
  }

  const decodedFrameCount = requireDeliveryRecord(
    video,
    'decodedFrameCount',
    'video.decodedFrameCount',
    label,
  );
  requireExactDeliveryValue(
    decodedFrameCount,
    'value',
    'video.decodedFrameCount.value',
    kind === 'public' ? 9180 : 18360,
    label,
  );
  requireExactDeliveryValue(
    decodedFrameCount,
    'source',
    'video.decodedFrameCount.source',
    'ffprobe-count_frames',
    label,
  );

  for (const [field, expected] of [
    ['codecName', 'aac'],
    ['sampleRate', '44100'],
    ['channels', 2],
    ['channelLayout', 'stereo'],
  ] as const) {
    requireExactDeliveryValue(audio, field, `audio.${field}`, expected, label);
  }

  for (const [ownerName, owner] of [
    ['audio', audio],
    ['sourceAudio', sourceAudio],
  ] as const) {
    for (const [field, expected] of [
      ['timeBase', '1/44100'],
      ['startPts', 0],
      ['startTime', '0.000000'],
      ['durationTs', 6_747_300],
      ['duration', '153.000000'],
    ] as const) {
      requireExactDeliveryValue(
        owner,
        field,
        `${ownerName}.${field}`,
        expected,
        label,
      );
    }
  }

  const audioPacketCount = requireDeliveryRecord(
    audio,
    'packetCount',
    'audio.packetCount',
    label,
  );
  const sourcePacketCount = requireDeliveryRecord(
    sourceAudio,
    'packetCount',
    'sourceAudio.packetCount',
    label,
  );
  const audioPacketCountValue = requirePositiveInteger(
    audioPacketCount,
    'value',
    'audio.packetCount.value',
    label,
  );
  const sourcePacketCountValue = requirePositiveInteger(
    sourcePacketCount,
    'value',
    'sourceAudio.packetCount.value',
    label,
  );
  requireExactDeliveryValue(
    audioPacketCount,
    'source',
    'audio.packetCount.source',
    'ffprobe-count_packets',
    label,
  );
  requireExactDeliveryValue(
    sourcePacketCount,
    'source',
    'sourceAudio.packetCount.source',
    'ffprobe-count_packets',
    label,
  );
  if (audioPacketCountValue !== sourcePacketCountValue) {
    deliveryMetadataError(
      label,
      'audio.packetCount must equal sourceAudio.packetCount',
    );
  }

  const audioPacketStreamSha256 = requireDeliveryRecord(
    audio,
    'packetStreamSha256',
    'audio.packetStreamSha256',
    label,
  );
  const sourcePacketStreamSha256 = requireDeliveryRecord(
    sourceAudio,
    'packetStreamSha256',
    'sourceAudio.packetStreamSha256',
    label,
  );
  const audioPacketStreamSha256Value = requireDeliverySha256(
    audioPacketStreamSha256,
    'value',
    'audio.packetStreamSha256.value',
    label,
  );
  const sourcePacketStreamSha256Value = requireDeliverySha256(
    sourcePacketStreamSha256,
    'value',
    'sourceAudio.packetStreamSha256.value',
    label,
  );
  requireExactDeliveryValue(
    audioPacketStreamSha256,
    'source',
    'audio.packetStreamSha256.source',
    'stream-copy-sha256',
    label,
  );
  requireExactDeliveryValue(
    sourcePacketStreamSha256,
    'source',
    'sourceAudio.packetStreamSha256.source',
    'stream-copy-sha256',
    label,
  );
  if (audioPacketStreamSha256Value !== sourcePacketStreamSha256Value) {
    deliveryMetadataError(
      label,
      'audio.packetStreamSha256 must equal sourceAudio.packetStreamSha256',
    );
  }

  requireExactDeliveryValue(
    container,
    'duration',
    'container.duration',
    '153.000000',
    label,
  );
  const faststart = requireDeliveryRecord(
    container,
    'faststart',
    'container.faststart',
    label,
  );
  requireExactDeliveryValue(
    faststart,
    'moovBeforeMdat',
    'container.faststart.moovBeforeMdat',
    true,
    label,
  );
  requireExactDeliveryValue(
    faststart,
    'source',
    'container.faststart.source',
    'parsed-atom-order',
    label,
  );

  requireExactDeliveryValue(
    strictDecode,
    'passed',
    'strictDecode.passed',
    true,
    label,
  );
  requireExactDeliveryValue(
    strictDecode,
    'source',
    'strictDecode.source',
    'ffmpeg-xerror-full-decode',
    label,
  );
};

const requireRepositoryReference = (
  artifact: string,
  location: string,
): void => {
  const isUrl = URL_PATTERN.test(artifact);
  if (
    isUrl ||
    artifact.startsWith('/') ||
    artifact.startsWith('\\') ||
    DRIVE_PATH_PATTERN.test(artifact) ||
    PATH_TRAVERSAL_PATTERN.test(artifact)
  ) {
    throw new Error(`${location}: artifact must be repository-relative`);
  }
};

const expectedRequirementEvidenceKinds = (
  criterionId: number,
  mode: RequirementMatrixMode,
): readonly RequirementEvidenceKind[] => {
  if (criterionId === 11) {
    return mode === 'final' ? ['release-url'] : ['publication-readiness'];
  }
  return REQUIREMENT_EVIDENCE_KINDS.get(criterionId)!;
};

const requirementArtifactAuthority = (
  kind: Exclude<RequirementEvidenceKind, 'release-url'>,
  artifact: string,
): boolean => {
  switch (kind) {
    case 'source-audio':
      return artifact === SOURCE_AUDIO_ARTIFACT;
    case 'test-result':
      return TEST_RESULT_ARTIFACT_PATTERN.test(artifact);
    case 'alignment-manifest':
    case 'semantic-map':
      return artifact === ALIGNMENT_MANIFEST_ARTIFACT;
    case 'cadence-verification':
      return CADENCE_VERIFICATION_ARTIFACT_PATTERN.test(artifact);
    case 'public-markup':
      return PUBLIC_MARKUP_ARTIFACT_PATTERN.test(artifact);
    case 'encoded-frame':
      return ENCODED_FRAME_ARTIFACT_PATTERN.test(artifact);
    case 'layout-verification':
      return LAYOUT_VERIFICATION_ARTIFACT_PATTERN.test(artifact);
    case 'qa-run-comparison':
      return artifact === QA_RUN_COMPARISON_ARTIFACT;
    case 'publication-readiness':
      return PUBLICATION_READINESS_ARTIFACTS.has(artifact);
  }
};

const decodeSafeReleasePathSegment = (segment: string): string | null => {
  if (segment.length === 0) return null;

  let decoded = segment;
  while (decoded.includes('%')) {
    let next: string;
    try {
      next = decodeURIComponent(decoded);
    } catch {
      return null;
    }
    if (next === decoded) return null;
    decoded = next;
  }

  if (
    decoded.length === 0 ||
    decoded === '.' ||
    decoded === '..' ||
    /[\\/?#\u0000-\u001f\u007f\s]/.test(decoded)
  ) {
    return null;
  }
  return decoded;
};

const isAuthorizedGithubReleaseUrl = (artifact: string): boolean => {
  if (artifact.includes('?') || artifact.includes('#')) return false;

  let parsed: URL;
  try {
    parsed = new URL(artifact);
  } catch {
    return false;
  }

  if (
    parsed.protocol !== 'https:' ||
    parsed.hostname !== 'github.com' ||
    parsed.username.length !== 0 ||
    parsed.password.length !== 0 ||
    parsed.port.length !== 0 ||
    parsed.search.length !== 0 ||
    parsed.hash.length !== 0
  ) {
    return false;
  }

  const authorityStart = artifact.indexOf('://');
  if (authorityStart < 0) return false;
  const pathStart = artifact.indexOf('/', authorityStart + 3);
  if (pathStart < 0) return false;
  const rawAuthority = artifact.slice(authorityStart + 3, pathStart);
  if (rawAuthority !== 'github.com') return false;

  const rawSegments = artifact.slice(pathStart).split('/');
  const decodedSegments: string[] = [''];
  for (const segment of rawSegments.slice(1)) {
    const decoded = decodeSafeReleasePathSegment(segment);
    if (decoded === null) return false;
    decodedSegments.push(decoded);
  }

  const releasePrefix = ['', 'ael-dev3', 'lyrics', 'releases'];
  if (
    decodedSegments.length < releasePrefix.length ||
    releasePrefix.some(
      (segment, index) => decodedSegments[index] !== segment,
    )
  ) {
    return false;
  }

  return (
    (decodedSegments.length === 6 && decodedSegments[4] === 'tag') ||
    (decodedSegments.length === 7 && decodedSegments[4] === 'download')
  );
};

const requireAuthorizedRequirementArtifact = (
  kind: RequirementEvidenceKind,
  artifact: string,
  location: string,
): void => {
  if (kind === 'release-url') {
    if (!isAuthorizedGithubReleaseUrl(artifact)) {
      throw new Error(
        `${location}: release-url artifact must be an HTTPS GitHub release URL for ael-dev3/lyrics`,
      );
    }
    return;
  }

  requireRepositoryReference(artifact, location);
  if (!requirementArtifactAuthority(kind, artifact)) {
    throw new Error(
      `${location}: ${kind} artifact is not an authoritative repository artifact`,
    );
  }
};

type QaRunId = 'run-1' | 'run-2';

const qaRunLabel = (candidate: unknown): QaRunId =>
  isRecord(candidate) && candidate.runId === 'run-2' ? 'run-2' : 'run-1';

function qaRunError(runId: QaRunId, detail: string): never {
  throw new Error(`QA run ${runId}: ${detail}`);
}

const verifyQaCoverage = (
  runLabel: QaRunId,
  candidate: unknown,
): UnknownRecord => {
  if (!isRecord(candidate)) {
    qaRunError(runLabel, 'qaCoverage must be an object');
  }

  for (const field of QA_COVERAGE_FIELDS) {
    const actual = candidate[field];
    const expected = QA_COVERAGE_EXPECTED[field];
    if (Array.isArray(expected)) {
      if (
        !Array.isArray(actual) ||
        actual.length !== expected.length ||
        actual.some((value, index) => !Object.is(value, expected[index]))
      ) {
        qaRunError(runLabel, `qaCoverage.${field} must match exactly`);
      }
    } else if (!Object.is(actual, expected)) {
      qaRunError(runLabel, `qaCoverage.${field} must be exactly ${JSON.stringify(expected)}`);
    }
  }

  const actualFields = Object.keys(candidate);
  if (
    actualFields.length !== QA_COVERAGE_FIELDS.length ||
    actualFields.some((field) => !QA_COVERAGE_FIELD_SET.has(field))
  ) {
    qaRunError(runLabel, 'qaCoverage must contain exactly the approved fields');
  }

  return candidate;
};

const verifyQaMediaArtifactIdentity = (
  runLabel: QaRunId,
  mediaKind: 'reference' | 'public' | 'proof',
  mediaEntry: UnknownRecord,
  expectedArtifactId: 'reference-render' | 'public-master' | 'sync-proof',
  artifactsById: ReadonlyMap<string, UnknownRecord>,
): void => {
  if (mediaEntry.artifactId !== expectedArtifactId) {
    qaRunError(
      runLabel,
      `media.${mediaKind}.artifactId must be exactly ${expectedArtifactId}`,
    );
  }

  const fileSha256 = mediaEntry.fileSha256;
  if (!isRecord(fileSha256)) {
    qaRunError(runLabel, `media.${mediaKind}.fileSha256 must be an object`);
  }
  if (
    typeof fileSha256.value !== 'string' ||
    !SHA256_PATTERN.test(fileSha256.value)
  ) {
    qaRunError(
      runLabel,
      `media.${mediaKind}.fileSha256.value must be 64 lowercase hexadecimal characters`,
    );
  }
  if (fileSha256.source !== 'sha256-file') {
    qaRunError(
      runLabel,
      `media.${mediaKind}.fileSha256.source must be exactly sha256-file`,
    );
  }

  const artifact = artifactsById.get(expectedArtifactId);
  if (!artifact || fileSha256.value !== artifact.sha256) {
    qaRunError(
      runLabel,
      `media.${mediaKind}.fileSha256.value must equal artifact ${expectedArtifactId} SHA-256`,
    );
  }
};

export const verifyQaRunRecord = (candidate: unknown): void => {
  const runLabel = qaRunLabel(candidate);
  if (!isRecord(candidate)) {
    qaRunError(runLabel, 'record must be an object');
  }

  if (candidate.schemaVersion !== 1) {
    qaRunError(runLabel, 'schemaVersion must be exactly 1');
  }
  if (candidate.runId !== 'run-1' && candidate.runId !== 'run-2') {
    qaRunError(runLabel, 'runId must be exactly run-1 or run-2');
  }
  if (candidate.boundedClaim !== QA_BOUNDED_CLAIM) {
    qaRunError(runLabel, `boundedClaim must be exactly ${QA_BOUNDED_CLAIM}`);
  }
  if (candidate.fullMediaExecuted !== true) {
    qaRunError(runLabel, 'fullMediaExecuted must be exactly true');
  }

  const git = candidate.git;
  if (!isRecord(git)) {
    qaRunError(runLabel, 'git must be an object');
  }
  if (
    typeof git.headCommit !== 'string' ||
    !GIT_COMMIT_PATTERN.test(git.headCommit)
  ) {
    qaRunError(
      runLabel,
      'git.headCommit must be 40 lowercase hexadecimal characters',
    );
  }
  for (const field of [
    'trackedTreeSha256',
    'worktreeDiffSha256',
  ] as const) {
    if (typeof git[field] !== 'string' || !SHA256_PATTERN.test(git[field])) {
      qaRunError(
        runLabel,
        `git.${field} must be 64 lowercase hexadecimal characters`,
      );
    }
  }
  if (typeof git.isClean !== 'boolean') {
    qaRunError(runLabel, 'git.isClean must be a boolean');
  }

  const statusEntries = git.statusEntries;
  if (!Array.isArray(statusEntries)) {
    qaRunError(runLabel, 'git.statusEntries must be an array');
  }
  if (
    (git.isClean === true && statusEntries.length !== 0) ||
    (git.isClean === false && statusEntries.length === 0)
  ) {
    qaRunError(
      runLabel,
      'git.isClean/statusEntries must consistently describe clean or dirty state',
    );
  }
  if (!statusEntries.every(isRepositoryRelativePath)) {
    qaRunError(
      runLabel,
      'git.statusEntries must contain only repository-relative paths',
    );
  }
  if (new Set(statusEntries).size !== statusEntries.length) {
    qaRunError(runLabel, 'git.statusEntries must contain unique paths');
  }
  const sortedStatusEntries = [...statusEntries].sort();
  if (
    statusEntries.some(
      (statusEntry, index) => statusEntry !== sortedStatusEntries[index],
    )
  ) {
    qaRunError(runLabel, 'git.statusEntries must be sorted');
  }

  const toolVersions = candidate.toolVersions;
  if (!isRecord(toolVersions)) {
    qaRunError(runLabel, 'toolVersions must be an object');
  }
  for (const field of QA_TOOL_VERSION_FIELDS) {
    if (!isNonemptyString(toolVersions[field])) {
      qaRunError(runLabel, `toolVersions.${field} must be a nonempty string`);
    }
  }

  const commands = candidate.commands;
  if (!Array.isArray(commands) || commands.length !== QA_COMMAND_SPECS.length) {
    qaRunError(runLabel, 'commands must contain exactly ten entries');
  }

  for (const [index, expected] of QA_COMMAND_SPECS.entries()) {
    const command = commands[index];
    if (!isRecord(command)) {
      qaRunError(runLabel, `commands[${index}]_entry must be an object`);
    }
    if (!isNonemptyString(command.id) || command.id !== expected.id) {
      qaRunError(
        runLabel,
        `commands[${index}].id must be exactly ${expected.id}`,
      );
    }
    if (
      !isNonemptyString(command.command) ||
      command.command !== expected.command
    ) {
      qaRunError(
        runLabel,
        `commands[${index}].command must be exactly ${expected.command}`,
      );
    }
    if (command.exitCode !== 0) {
      qaRunError(runLabel, `commands[${index}].exitCode must be exactly 0`);
    }
    if (
      typeof command.durationMs !== 'number' ||
      !Number.isFinite(command.durationMs) ||
      command.durationMs < 0
    ) {
      qaRunError(
        runLabel,
        `commands[${index}].durationMs must be a finite nonnegative number`,
      );
    }
    if (!isRepositoryRelativePath(command.logPath)) {
      qaRunError(
        runLabel,
        `commands[${index}].logPath must be repository-relative`,
      );
    }
    const expectedLogPath =
      `projects/tanisea-lyric-film/work/qa/${candidate.runId}/logs/` +
      `${expected.id}.log`;
    if (command.logPath !== expectedLogPath) {
      qaRunError(
        runLabel,
        `commands[${index}].logPath must be exactly ${expectedLogPath}`,
      );
    }
    if (
      typeof command.logSha256 !== 'string' ||
      !SHA256_PATTERN.test(command.logSha256)
    ) {
      qaRunError(
        runLabel,
        `commands[${index}].logSha256 must be 64 lowercase hexadecimal characters`,
      );
    }
  }

  const artifacts = candidate.artifacts;
  if (!Array.isArray(artifacts) || artifacts.length === 0) {
    qaRunError(runLabel, 'artifacts must be a nonempty array');
  }

  const artifactIds = new Set<string>();
  const artifactKinds = new Set<string>();
  const artifactPaths = new Set<string>();
  const artifactsById = new Map<string, UnknownRecord>();
  for (const [index, artifact] of artifacts.entries()) {
    if (!isRecord(artifact)) {
      qaRunError(runLabel, `artifacts[${index}]_entry must be an object`);
    }
    if (!isNonemptyString(artifact.id)) {
      qaRunError(runLabel, `artifacts[${index}].id must be a nonempty string`);
    }
    if (artifactIds.has(artifact.id)) {
      qaRunError(runLabel, `artifacts[${index}].id must be unique`);
    }
    artifactIds.add(artifact.id);

    if (!isNonemptyString(artifact.kind)) {
      qaRunError(
        runLabel,
        `artifacts[${index}].kind must be a nonempty string`,
      );
    }
    artifactKinds.add(artifact.kind);

    const authority = QA_ARTIFACT_AUTHORITY_BY_ID.get(artifact.id);
    if (authority && artifact.kind !== authority.kind) {
      qaRunError(
        runLabel,
        `artifacts[${index}].kind must be exactly ${authority.kind}`,
      );
    }
    if (
      !authority &&
      !QA_ADDITIONAL_ARTIFACT_KIND_PATTERN.test(artifact.kind)
    ) {
      qaRunError(
        runLabel,
        `artifacts[${index}].kind must identify an additional QA artifact`,
      );
    }

    if (!isRepositoryRelativePath(artifact.path)) {
      qaRunError(
        runLabel,
        `artifacts[${index}].path must be repository-relative`,
      );
    }
    if (artifactPaths.has(artifact.path)) {
      qaRunError(runLabel, `artifacts[${index}].path must be unique`);
    }
    artifactPaths.add(artifact.path);
    if (authority && artifact.path !== authority.path) {
      qaRunError(
        runLabel,
        `artifacts[${index}].path must be exactly ${authority.path}`,
      );
    }
    if (
      !authority &&
      !artifact.path.startsWith(QA_ADDITIONAL_ARTIFACT_PATH_PREFIX)
    ) {
      qaRunError(
        runLabel,
        `artifacts[${index}].path must be within ${QA_ADDITIONAL_ARTIFACT_PATH_PREFIX}`,
      );
    }
    if (
      typeof artifact.sizeBytes !== 'number' ||
      !Number.isFinite(artifact.sizeBytes) ||
      artifact.sizeBytes <= 0
    ) {
      qaRunError(
        runLabel,
        `artifacts[${index}].sizeBytes must be a positive finite number`,
      );
    }
    if (
      typeof artifact.sha256 !== 'string' ||
      !SHA256_PATTERN.test(artifact.sha256)
    ) {
      qaRunError(
        runLabel,
        `artifacts[${index}].sha256 must be 64 lowercase hexadecimal characters`,
      );
    }
    artifactsById.set(artifact.id, artifact);
  }

  for (const requiredId of QA_REQUIRED_ARTIFACT_IDS) {
    if (!artifactIds.has(requiredId)) {
      qaRunError(runLabel, `artifacts must include required ID ${requiredId}`);
    }
  }
  for (const requiredKind of QA_REQUIRED_EVIDENCE_KINDS) {
    if (!artifactKinds.has(requiredKind)) {
      qaRunError(
        runLabel,
        `artifacts must include required kind ${requiredKind}`,
      );
    }
  }

  const selectedFrames = candidate.selectedFrames;
  if (!Array.isArray(selectedFrames) || selectedFrames.length === 0) {
    qaRunError(runLabel, 'selectedFrames must be a nonempty array');
  }

  const selectedFrameIds = new Set<string>();
  for (const [index, selectedFrame] of selectedFrames.entries()) {
    if (!isRecord(selectedFrame)) {
      qaRunError(runLabel, `selectedFrames[${index}]_entry must be an object`);
    }
    if (!isNonemptyString(selectedFrame.id)) {
      qaRunError(
        runLabel,
        `selectedFrames[${index}].id must be a nonempty string`,
      );
    }
    if (selectedFrameIds.has(selectedFrame.id)) {
      qaRunError(runLabel, `selectedFrames[${index}].id must be unique`);
    }
    selectedFrameIds.add(selectedFrame.id);

    if (
      typeof selectedFrame.composition !== 'string' ||
      !QA_SELECTED_FRAME_COMPOSITIONS.has(selectedFrame.composition)
    ) {
      qaRunError(
        runLabel,
        `selectedFrames[${index}].composition must be approved`,
      );
    }
    if (
      typeof selectedFrame.frame !== 'number' ||
      !Number.isInteger(selectedFrame.frame) ||
      selectedFrame.frame < 0
    ) {
      qaRunError(
        runLabel,
        `selectedFrames[${index}].frame must be a nonnegative integer`,
      );
    }
    if (!isRepositoryRelativePath(selectedFrame.path)) {
      qaRunError(
        runLabel,
        `selectedFrames[${index}].path must be repository-relative`,
      );
    }
    const expectedSelectedFramePath =
      `projects/tanisea-lyric-film/work/qa/${runLabel}/` +
      `selected-frames/${selectedFrame.id}.png`;
    if (selectedFrame.path !== expectedSelectedFramePath) {
      qaRunError(
        runLabel,
        `selectedFrames[${index}].path must be exactly ${expectedSelectedFramePath}`,
      );
    }
    if (
      typeof selectedFrame.sha256 !== 'string' ||
      !SHA256_PATTERN.test(selectedFrame.sha256)
    ) {
      qaRunError(
        runLabel,
        `selectedFrames[${index}].sha256 must be 64 lowercase hexadecimal characters`,
      );
    }

    const authority = QA_SELECTED_FRAME_AUTHORITY_BY_ID.get(selectedFrame.id);
    if (authority && selectedFrame.artifactId !== authority.artifactId) {
      qaRunError(
        runLabel,
        `selectedFrames[${index}].artifactId must be exactly ${authority.artifactId}`,
      );
    }
    if (authority && selectedFrame.composition !== authority.composition) {
      qaRunError(
        runLabel,
        `selectedFrames[${index}].composition must be exactly ${authority.composition}`,
      );
    }
    if (authority && selectedFrame.frame !== authority.frame) {
      qaRunError(
        runLabel,
        `selectedFrames[${index}].frame must be exactly ${authority.frame}`,
      );
    }
    if (!isNonemptyString(selectedFrame.artifactId)) {
      qaRunError(
        runLabel,
        `selectedFrames[${index}].artifactId must be a nonempty string`,
      );
    }
    const selectedArtifact = artifactsById.get(selectedFrame.artifactId);
    if (
      !selectedArtifact ||
      typeof selectedArtifact.kind !== 'string' ||
      !selectedArtifact.kind.startsWith('qa-')
    ) {
      qaRunError(
        runLabel,
        `selectedFrames[${index}].artifactId must name a QA artifact`,
      );
    }
    if (selectedFrame.sha256 !== selectedArtifact.sha256) {
      qaRunError(
        runLabel,
        `selectedFrames[${index}].sha256 must equal its artifact SHA-256`,
      );
    }
  }

  for (const {id} of QA_SELECTED_FRAME_AUTHORITIES) {
    if (!selectedFrameIds.has(id)) {
      qaRunError(runLabel, `selectedFrames must include required ID ${id}`);
    }
  }

  verifyQaCoverage(runLabel, candidate.qaCoverage);

  const media = candidate.media;
  if (!isRecord(media)) {
    qaRunError(runLabel, 'media must be an object');
  }

  const reference = media.reference;
  if (!isRecord(reference)) {
    qaRunError(runLabel, 'media.reference must be an object');
  }
  if (reference.artifactId !== 'reference-render') {
    qaRunError(
      runLabel,
      'media.reference.artifactId must be exactly reference-render',
    );
  }

  const fileSha256 = reference.fileSha256;
  if (!isRecord(fileSha256)) {
    qaRunError(runLabel, 'media.reference.fileSha256 must be an object');
  }
  if (
    typeof fileSha256.value !== 'string' ||
    !SHA256_PATTERN.test(fileSha256.value)
  ) {
    qaRunError(
      runLabel,
      'media.reference.fileSha256.value must be 64 lowercase hexadecimal characters',
    );
  }
  if (fileSha256.source !== 'sha256-file') {
    qaRunError(
      runLabel,
      'media.reference.fileSha256.source must be exactly sha256-file',
    );
  }
  verifyQaMediaArtifactIdentity(
    runLabel,
    'reference',
    reference,
    'reference-render',
    artifactsById,
  );

  const referenceVideo = reference.video;
  if (!isRecord(referenceVideo)) {
    qaRunError(runLabel, 'media.reference.video must be an object');
  }
  for (const [field, expected] of [
    ['codecName', 'prores'],
    ['codecTag', 'ap4h'],
    ['profile', '4444'],
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
    if (
      typeof referenceVideo[field] !== typeof expected ||
      referenceVideo[field] !== expected
    ) {
      qaRunError(
        runLabel,
        `media.reference.video.${field} must be exactly ${JSON.stringify(expected)}`,
      );
    }
  }

  const decodedFrameCount = referenceVideo.decodedFrameCount;
  if (!isRecord(decodedFrameCount)) {
    qaRunError(
      runLabel,
      'media.reference.video.decodedFrameCount must be an object',
    );
  }
  if (decodedFrameCount.value !== 9180) {
    qaRunError(
      runLabel,
      'media.reference.video.decodedFrameCount.value must be exactly 9180',
    );
  }
  if (decodedFrameCount.source !== 'ffprobe-count_frames') {
    qaRunError(
      runLabel,
      'media.reference.video.decodedFrameCount.source must be exactly ffprobe-count_frames',
    );
  }

  const referenceContainer = reference.container;
  if (!isRecord(referenceContainer)) {
    qaRunError(runLabel, 'media.reference.container must be an object');
  }
  if (referenceContainer.duration !== '153.000000') {
    qaRunError(
      runLabel,
      'media.reference.container.duration must be exactly "153.000000"',
    );
  }

  const referenceStrictDecode = reference.strictDecode;
  if (!isRecord(referenceStrictDecode)) {
    qaRunError(runLabel, 'media.reference.strictDecode must be an object');
  }
  if (referenceStrictDecode.passed !== true) {
    qaRunError(
      runLabel,
      'media.reference.strictDecode.passed must be exactly true',
    );
  }
  if (referenceStrictDecode.source !== 'ffmpeg-xerror-full-decode') {
    qaRunError(
      runLabel,
      'media.reference.strictDecode.source must be exactly ffmpeg-xerror-full-decode',
    );
  }

  const publicMedia = media.public;
  if (!isRecord(publicMedia)) {
    qaRunError(
      runLabel,
      'media.public: Public delivery metadata: must be an object',
    );
  }
  verifyQaMediaArtifactIdentity(
    runLabel,
    'public',
    publicMedia,
    'public-master',
    artifactsById,
  );
  try {
    verifyDeliveryMetadata(publicMedia, 'public');
  } catch (error) {
    qaRunError(
      runLabel,
      `media.public: ${error instanceof Error ? error.message : String(error)}`,
    );
  }

  const proofMedia = media.proof;
  if (!isRecord(proofMedia)) {
    qaRunError(
      runLabel,
      'media.proof: Proof delivery metadata: must be an object',
    );
  }
  verifyQaMediaArtifactIdentity(
    runLabel,
    'proof',
    proofMedia,
    'sync-proof',
    artifactsById,
  );
  try {
    verifyDeliveryMetadata(proofMedia, 'proof');
  } catch (error) {
    qaRunError(
      runLabel,
      `media.proof: ${error instanceof Error ? error.message : String(error)}`,
    );
  }

  const requirementMatrix = candidate.requirementMatrix;
  if (!isRecord(requirementMatrix)) {
    qaRunError(
      runLabel,
      'requirementMatrix: Requirement matrix: must be an object',
    );
  }
  try {
    verifyRequirementMatrix(
      requirementMatrix,
      candidate.runId === 'run-1' ? 'baseline' : 'prepublication',
    );
  } catch (error) {
    qaRunError(
      runLabel,
      `requirementMatrix: ${error instanceof Error ? error.message : String(error)}`,
    );
  }

  const requirementCriteria = requirementMatrix.criteria as UnknownRecord[];
  const commandEvidenceBindings = [
    [2, ['check']],
    [7, ['verify-public', 'verify-proof']],
    [8, ['verify-public-markup']],
    [9, ['layout-verify']],
  ] as const;
  for (const [criterionId, commandIds] of commandEvidenceBindings) {
    const requirementCriterion = requirementCriteria.find(
      (entry) => entry.id === criterionId,
    );
    const evidence = requirementCriterion?.evidence;
    if (!Array.isArray(evidence)) {
      qaRunError(
        runLabel,
        `requirementMatrix criterion ${criterionId} command evidence is missing`,
      );
    }
    for (const [evidenceIndex, commandId] of commandIds.entries()) {
      const command = commands.find(
        (entry): entry is UnknownRecord =>
          isRecord(entry) && entry.id === commandId,
      );
      const authority = evidence[evidenceIndex];
      if (!command || !isRecord(authority)) {
        qaRunError(
          runLabel,
          `requirementMatrix criterion ${criterionId} command evidence is missing`,
        );
      }
      if (authority.artifact !== command.logPath) {
        qaRunError(
          runLabel,
          `requirementMatrix criterion ${criterionId} evidence[${evidenceIndex}] artifact must equal ${commandId} logPath`,
        );
      }
      if (authority.sha256 !== command.logSha256) {
        qaRunError(
          runLabel,
          `requirementMatrix criterion ${criterionId} evidence[${evidenceIndex}] SHA-256 must equal ${commandId} logSha256`,
        );
      }
    }
  }

  for (const [criterionId, selectedFrameId] of [
    [8, 'chrome'],
    [9, 'safe-area'],
  ] as const) {
    const requirementCriterion = requirementCriteria.find(
      (entry) => entry.id === criterionId,
    );
    const evidence = requirementCriterion?.evidence;
    const encodedEvidence = Array.isArray(evidence) ? evidence[1] : undefined;
    const selectedFrame = selectedFrames.find(
      (entry): entry is UnknownRecord =>
        isRecord(entry) && entry.id === selectedFrameId,
    );
    if (!isRecord(encodedEvidence) || !selectedFrame) {
      qaRunError(
        runLabel,
        `requirementMatrix criterion ${criterionId} encoded-frame evidence is missing`,
      );
    }
    if (encodedEvidence.artifact !== selectedFrame.path) {
      qaRunError(
        runLabel,
        `requirementMatrix criterion ${criterionId} encoded-frame artifact must equal selected frame ${selectedFrameId} path`,
      );
    }
    if (encodedEvidence.sha256 !== selectedFrame.sha256) {
      qaRunError(
        runLabel,
        `requirementMatrix criterion ${criterionId} encoded-frame SHA-256 must equal selected frame ${selectedFrameId} SHA-256`,
      );
    }
  }
};

function qaRunPairError(detail: string): never {
  throw new Error(`QA run pair: ${detail}`);
}

const verifyQaRunPairRecord = (
  candidate: unknown,
  side: QaRunId,
): UnknownRecord => {
  try {
    verifyQaRunRecord(candidate);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    const runPrefix = `QA run ${qaRunLabel(candidate)}: `;
    const detail = message.startsWith(runPrefix)
      ? message.slice(runPrefix.length)
      : message;
    if (/^commands\[\d+\]\.(?:id|command|exitCode)\b/.test(detail)) {
      qaRunPairError(`${detail} (${side} input)`);
    }
    qaRunPairError(`${side} input: ${message}`);
  }

  if (!isRecord(candidate)) {
    qaRunPairError(`record must be an object (${side} input)`);
  }
  return candidate;
};

const equalStringArrays = (
  first: readonly unknown[],
  second: readonly unknown[],
): boolean =>
  first.length === second.length &&
  first.every((value, index) => value === second[index]);

const compareQaRunPairValue = (
  first: unknown,
  second: unknown,
  path: string,
): void => {
  if (Object.is(first, second)) return;

  if (Array.isArray(first)) {
    if (!Array.isArray(second) || first.length !== second.length) {
      qaRunPairError(`${path} must have equal length`);
    }
    for (const [index, value] of first.entries()) {
      compareQaRunPairValue(value, second[index], `${path}[${index}]`);
    }
    return;
  }

  if (isRecord(first)) {
    if (!isRecord(second)) {
      qaRunPairError(`${path} must be equal`);
    }
    for (const key of Object.keys(first)) {
      if (!Object.hasOwn(second, key)) {
        qaRunPairError(`${path}.${key} must be equal`);
      }
      compareQaRunPairValue(first[key], second[key], `${path}.${key}`);
    }
    for (const key of Object.keys(second)) {
      if (!Object.hasOwn(first, key)) {
        qaRunPairError(`${path} must have equal fields`);
      }
    }
    return;
  }

  qaRunPairError(`${path} must be equal`);
};

const compareQaRunPairDeterministicContent = (
  first: UnknownRecord,
  second: UnknownRecord,
): void => {
  if (Array.isArray(second.artifacts)) {
    compareQaRunPairValue(first.artifacts, second.artifacts, 'artifacts');
  }

  if (isRecord(second.media)) {
    compareQaRunPairValue(first.media, second.media, 'media');
  }

  if (isRecord(second.qaCoverage)) {
    compareQaRunPairValue(first.qaCoverage, second.qaCoverage, 'qaCoverage');
  }

  if (isRecord(second.requirementMatrix)) {
    const normalizeRequirementMatrix = (matrix: unknown): unknown => {
      const normalized = JSON.parse(JSON.stringify(matrix)) as UnknownRecord;
      if (!Array.isArray(normalized.criteria)) return normalized;
      for (const criterion of normalized.criteria) {
        if (!isRecord(criterion)) continue;
        if ([2, 7, 8, 9].includes(criterion.id as number)) {
          const evidence = criterion.evidence;
          if (Array.isArray(evidence)) {
            for (const authority of evidence) {
              if (!isRecord(authority)) continue;
              authority.artifact = '<run-local-log>';
              authority.sha256 = '<run-local-log-sha256>';
            }
          }
        }
        if (criterion.id === 10) {
          criterion.status = '<repeat-state>';
          const evidence = criterion.evidence;
          if (Array.isArray(evidence) && isRecord(evidence[0])) {
            evidence[0].value = '<repeat-state-value>';
          }
        }
      }
      return normalized;
    };
    compareQaRunPairValue(
      normalizeRequirementMatrix(first.requirementMatrix),
      normalizeRequirementMatrix(second.requirementMatrix),
      'requirementMatrix',
    );
  }

  if (Array.isArray(second.selectedFrames)) {
    const firstFrames = first.selectedFrames as readonly UnknownRecord[];
    if (firstFrames.length !== second.selectedFrames.length) {
      qaRunPairError('selectedFrames must have equal length');
    }
    for (const [index, firstFrame] of firstFrames.entries()) {
      const secondFrame = second.selectedFrames[index];
      if (!isRecord(secondFrame)) continue;
      for (const field of [
        'id',
        'artifactId',
        'composition',
        'frame',
        'sha256',
      ] as const) {
        if (firstFrame[field] !== secondFrame[field]) {
          qaRunPairError(`selectedFrames[${index}].${field} must be equal`);
        }
      }
    }
  }
};

export const verifyQaRunPair = (run1: unknown, run2: unknown): void => {
  const first = verifyQaRunPairRecord(run1, 'run-1');
  if (isRecord(run2)) {
    const firstGit = first.git;
    const secondGit = run2.git;
    if (
      isRecord(firstGit) &&
      isRecord(secondGit) &&
      typeof secondGit.isClean === 'boolean' &&
      firstGit.isClean !== secondGit.isClean
    ) {
      qaRunPairError('git.isClean must be equal');
    }
    compareQaRunPairDeterministicContent(first, run2);
  }
  const second = verifyQaRunPairRecord(run2, 'run-2');

  if (first.runId !== 'run-1' || second.runId !== 'run-2') {
    qaRunPairError('runId must be exactly run-1 then run-2');
  }

  const firstGit = first.git as UnknownRecord;
  const secondGit = second.git as UnknownRecord;
  for (const field of [
    'headCommit',
    'trackedTreeSha256',
    'worktreeDiffSha256',
    'isClean',
  ] as const) {
    if (firstGit[field] !== secondGit[field]) {
      qaRunPairError(`git.${field} must be equal`);
    }
  }

  const firstStatusEntries = firstGit.statusEntries as readonly unknown[];
  const secondStatusEntries = secondGit.statusEntries as readonly unknown[];
  if (!equalStringArrays(firstStatusEntries, secondStatusEntries)) {
    qaRunPairError('git.statusEntries must be equal by index');
  }

  const firstToolVersions = first.toolVersions as UnknownRecord;
  const secondToolVersions = second.toolVersions as UnknownRecord;
  for (const field of QA_TOOL_VERSION_FIELDS) {
    if (firstToolVersions[field] !== secondToolVersions[field]) {
      qaRunPairError(`toolVersions.${field} must be equal`);
    }
  }

  const firstCommands = first.commands as readonly UnknownRecord[];
  const secondCommands = second.commands as readonly UnknownRecord[];
  for (const [index, firstCommand] of firstCommands.entries()) {
    const secondCommand = secondCommands[index]!;
    for (const field of ['id', 'command', 'exitCode'] as const) {
      if (firstCommand[field] !== secondCommand[field]) {
        qaRunPairError(`commands[${index}].${field} must be equal`);
      }
    }
  }
};

function qaReportError(detail: string): never {
  throw new Error(`QA report: ${detail}`);
}

const QA_REPORT_ALIGNMENT_SUMMARY = {
  artifactId: 'alignment-manifest',
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
          startSample: 3173568,
          sourceTokenIds: ['V1-03-R05'],
          targetSegmentIds: ['V1-03-S03'],
          activation: 'forward',
        },
        {
          cueId: 'V1-03-C03',
          startSample: 3200910,
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
          startSample: 3807197,
          sourceTokenIds: ['V1-08-R02'],
          targetSegmentIds: ['V1-08-S02'],
          activation: 'forward',
        },
        {
          cueId: 'V1-08-C02',
          startSample: 3819545,
          sourceTokenIds: ['V1-08-R03', 'V1-08-R04'],
          targetSegmentIds: ['V1-08-S01'],
          activation: 'backward',
        },
        {
          cueId: 'V1-08-C03',
          startSample: 3869863,
          sourceTokenIds: ['V1-08-R05', 'V1-08-R06'],
          targetSegmentIds: ['V1-08-S03'],
          activation: 'forward',
        },
        {
          cueId: 'V1-08-C04',
          startSample: 3912243,
          sourceTokenIds: ['V1-08-R07'],
          targetSegmentIds: ['V1-08-S04'],
          activation: 'forward',
        },
      ],
    },
  ],
} as const;

const QA_PUBLICATION_TAG = 'v2.0.0';
const QA_PUBLICATION_ASSET_NAMES = [
  'Tanisea-Lyric-Film-Production-Master-vNext.mp4',
  'Tanisea-Lyric-Film-Sync-Proof-120fps.mp4',
  'tanisea-vnext-hero.png',
  'Tanisea-Lyric-Film-Source-vNext.zip',
  'tanisea-word-alignment-v3.json',
  'tanisea-word-alignment-v3.md',
] as const;
const QA_PUBLICATION_CHECKSUM_ENTRY_COUNT = 8;

const qaReportValuesEqual = (first: unknown, second: unknown): boolean => {
  if (Object.is(first, second)) return true;
  if (Array.isArray(first)) {
    return (
      Array.isArray(second) &&
      first.length === second.length &&
      first.every((entry, index) =>
        qaReportValuesEqual(entry, second[index]),
      )
    );
  }
  if (!isRecord(first) || !isRecord(second)) return false;
  const firstKeys = Object.keys(first);
  const secondKeys = Object.keys(second);
  return (
    firstKeys.length === secondKeys.length &&
    firstKeys.every(
      (key) =>
        Object.hasOwn(second, key) &&
        qaReportValuesEqual(first[key], second[key]),
    )
  );
};

const verifyQaReportExactRecord = (
  candidate: UnknownRecord,
  field: string,
  expected: UnknownRecord,
): UnknownRecord => {
  const actual = candidate[field];
  if (!isRecord(actual)) {
    qaReportError(`${field} must be an object`);
  }
  for (const [expectedField, expectedValue] of Object.entries(expected)) {
    if (!qaReportValuesEqual(actual[expectedField], expectedValue)) {
      qaReportError(`${field}.${expectedField} must match exactly`);
    }
  }
  const actualFields = Object.keys(actual);
  if (
    actualFields.length !== Object.keys(expected).length ||
    actualFields.some((actualField) => !Object.hasOwn(expected, actualField))
  ) {
    qaReportError(`${field} must contain exactly the approved fields`);
  }
  return actual;
};

const verifyQaReportAuthoritativeRun = (
  candidate: UnknownRecord,
): UnknownRecord => {
  const authoritativeRun = candidate.authoritativeRun;
  if (!isRecord(authoritativeRun) || authoritativeRun.runId !== 'run-2') {
    qaReportError('authoritativeRun must be a run-2 QA record');
  }
  try {
    verifyQaRunRecord(authoritativeRun);
  } catch (error) {
    qaReportError(
      `authoritativeRun: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
  return authoritativeRun;
};

const verifyQaReportBaselineRun = (
  candidate: UnknownRecord,
): UnknownRecord => {
  const baselineRun = candidate.baselineRun;
  if (!isRecord(baselineRun) || baselineRun.runId !== 'run-1') {
    qaReportError('baselineRun must be a run-1 QA record');
  }
  try {
    verifyQaRunRecord(baselineRun);
  } catch (error) {
    qaReportError(
      `baselineRun: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
  return baselineRun;
};

const verifyQaReportArtifactReferences = (
  candidate: UnknownRecord,
  authoritativeRun: UnknownRecord,
): void => {
  const artifactReferences = candidate.artifactReferences;
  if (!Array.isArray(artifactReferences) || artifactReferences.length === 0) {
    qaReportError('artifactReferences must be a nonempty array');
  }

  const artifactIds = new Set<string>();
  for (const [index, artifactReference] of artifactReferences.entries()) {
    const location = `artifactReferences[${index}]`;
    if (!isRecord(artifactReference)) {
      qaReportError(`${location}_entry must be an object`);
    }
    if (!isNonemptyString(artifactReference.id)) {
      qaReportError(`${location}.id must be a nonempty string`);
    }
    if (artifactIds.has(artifactReference.id)) {
      qaReportError(`${location}.id must be unique`);
    }
    artifactIds.add(artifactReference.id);

    if (!isRepositoryRelativePath(artifactReference.path)) {
      qaReportError(`${location}.path must be repository-relative`);
    }
    if (
      typeof artifactReference.sha256 !== 'string' ||
      !SHA256_PATTERN.test(artifactReference.sha256)
    ) {
      qaReportError(
        `${location}.sha256 must be 64 lowercase hexadecimal characters`,
      );
    }
  }

  for (const requiredId of QA_REPORT_REQUIRED_ARTIFACT_IDS) {
    if (!artifactIds.has(requiredId)) {
      qaReportError(`artifactReferences must include required ID ${requiredId}`);
    }
  }
  if (![...QA_REPORT_EVIDENCE_IDS].some((id) => artifactIds.has(id))) {
    qaReportError('artifactReferences must include QA evidence');
  }

  const authoritativeArtifacts = authoritativeRun.artifacts;
  if (
    !Array.isArray(authoritativeArtifacts) ||
    artifactReferences.length !== authoritativeArtifacts.length
  ) {
    qaReportError('artifactReferences must exactly mirror authoritativeRun artifacts');
  }
  for (const [index, authoritativeArtifact] of authoritativeArtifacts.entries()) {
    const artifactReference = artifactReferences[index];
    if (!isRecord(authoritativeArtifact) || !isRecord(artifactReference)) {
      qaReportError(`artifactReferences[${index}] must cross-link authoritativeRun`);
    }
    for (const field of ['id', 'path', 'sha256'] as const) {
      if (artifactReference[field] !== authoritativeArtifact[field]) {
        qaReportError(
          `artifactReferences[${index}].${field} must equal authoritativeRun`,
        );
      }
    }
  }
};

const qaReportAuthoritativeArtifact = (
  authoritativeRun: UnknownRecord,
  artifactId: string,
): UnknownRecord => {
  const artifacts = authoritativeRun.artifacts as readonly unknown[];
  const artifact = artifacts.find(
    (entry) => isRecord(entry) && entry.id === artifactId,
  );
  if (!isRecord(artifact)) {
    qaReportError(`authoritativeRun missing artifact ${artifactId}`);
  }
  return artifact;
};

const verifyQaReportSummaries = (
  candidate: UnknownRecord,
  authoritativeRun: UnknownRecord,
): void => {
  const sourceArtifact = qaReportAuthoritativeArtifact(
    authoritativeRun,
    'source-audio',
  );
  verifyQaReportExactRecord(candidate, 'sourceSummary', {
    artifactId: 'source-audio',
    sha256: sourceArtifact.sha256,
    sampleRateHz: 44100,
    channels: 2,
    channelLayout: 'stereo',
    publicDurationSeconds: 153,
    decodedSamplesPerChannel: 6747584,
    retainedAnalysisDurationSeconds: 153.00644,
  });

  const alignmentArtifact = qaReportAuthoritativeArtifact(
    authoritativeRun,
    'alignment-manifest',
  );
  verifyQaReportExactRecord(candidate, 'alignmentSummary', {
    ...QA_REPORT_ALIGNMENT_SUMMARY,
    sha256: alignmentArtifact.sha256,
  });

  const featuresArtifact = qaReportAuthoritativeArtifact(
    authoritativeRun,
    'audio-features',
  );
  verifyQaReportExactRecord(candidate, 'featuresSummary', {
    artifactId: 'audio-features',
    sha256: featuresArtifact.sha256,
  });

  verifyQaReportExactRecord(candidate, 'layoutSummary', {
    spectrumBandCount: 64,
    spectrumMeasuredCorePx: 96,
    spectrumMaximumCapPx: 18,
    minimumLyricGapPx: 36,
    lowerChromeClearancePx: 11,
    publicUpperTelemetryAbsent: true,
    publicGlobalUpperRailAbsent: true,
  });
};

const verifyQaReportRunCrossLinks = (
  candidate: UnknownRecord,
  authoritativeRun: UnknownRecord,
): void => {
  if (!qaReportValuesEqual(candidate.qaCoverage, authoritativeRun.qaCoverage)) {
    qaReportError('qaCoverage must exactly equal authoritativeRun');
  }

  const media = candidate.media;
  const authoritativeMedia = authoritativeRun.media;
  if (!isRecord(media) || !isRecord(authoritativeMedia)) {
    qaReportError('media must be an object');
  }
  for (const kind of ['reference', 'public', 'proof'] as const) {
    if (!qaReportValuesEqual(media[kind], authoritativeMedia[kind])) {
      qaReportError(`media.${kind} must exactly equal authoritativeRun`);
    }
  }
  if (!qaReportValuesEqual(media, authoritativeMedia)) {
    qaReportError('media must exactly equal authoritativeRun');
  }
};

const verifyQaReportRunReferences = (
  candidate: UnknownRecord,
  baselineRun: UnknownRecord,
  authoritativeRun: UnknownRecord,
): void => {
  const runReferences = candidate.runReferences;
  if (!Array.isArray(runReferences) || runReferences.length !== 2) {
    qaReportError('runReferences must contain exactly two entries');
  }

  const runIds = new Set<string>();
  for (const [index, expectedRunId] of ['run-1', 'run-2'].entries()) {
    const runReference = runReferences[index];
    const location = `runReferences[${index}]`;
    if (!isRecord(runReference)) {
      qaReportError(`${location}_entry must be an object`);
    }
    if (
      !isNonemptyString(runReference.runId) ||
      (runReference.runId !== 'run-1' && runReference.runId !== 'run-2')
    ) {
      qaReportError(`${location}.runId must be exactly run-1 or run-2`);
    }
    if (runIds.has(runReference.runId)) {
      qaReportError(`${location}.runId must be unique`);
    }
    runIds.add(runReference.runId);
    if (runReference.runId !== expectedRunId) {
      qaReportError(`${location}.runId must be exactly ${expectedRunId}`);
    }

    if (!isRepositoryRelativePath(runReference.path)) {
      qaReportError(`${location}.path must be repository-relative`);
    }
    const expectedPath =
      `projects/tanisea-lyric-film/work/qa/${expectedRunId}/qa-run.json`;
    if (runReference.path !== expectedPath) {
      qaReportError(`${location}.path must be exactly ${expectedPath}`);
    }
    if (
      typeof runReference.sha256 !== 'string' ||
      !SHA256_PATTERN.test(runReference.sha256)
    ) {
      qaReportError(
        `${location}.sha256 must be 64 lowercase hexadecimal characters`,
      );
    }
    const embeddedRun = index === 0 ? baselineRun : authoritativeRun;
    if (runReference.sha256 !== qaJsonSha256(embeddedRun)) {
      qaReportError(`${location}.sha256 must match the embedded QA run`);
    }
  }
};

const verifyQaReportComparison = (candidate: UnknownRecord): void => {
  const comparison = candidate.comparison;
  if (!isRecord(comparison)) {
    qaReportError('comparison must be an object');
  }
  if (comparison.matched !== true) {
    qaReportError('comparison.matched must be exactly true');
  }
  if (comparison.authoritativeRunId !== 'run-2') {
    qaReportError('comparison.authoritativeRunId must be exactly run-2');
  }
  if (!isRepositoryRelativePath(comparison.recordPath)) {
    qaReportError('comparison.recordPath must be repository-relative');
  }
  const expectedRecordPath =
    'projects/tanisea-lyric-film/work/qa/run-2/run-comparison.json';
  if (comparison.recordPath !== expectedRecordPath) {
    qaReportError(
      `comparison.recordPath must be exactly ${expectedRecordPath}`,
    );
  }
  if (
    typeof comparison.recordSha256 !== 'string' ||
    !SHA256_PATTERN.test(comparison.recordSha256)
  ) {
    qaReportError(
      'comparison.recordSha256 must be 64 lowercase hexadecimal characters',
    );
  }
  if (
    !Array.isArray(comparison.unexplainedDrift) ||
    comparison.unexplainedDrift.length !== 0
  ) {
    qaReportError('comparison.unexplainedDrift must be exactly an empty array');
  }
  const comparisonRecord = {
    matched: comparison.matched,
    authoritativeRunId: comparison.authoritativeRunId,
    recordPath: comparison.recordPath,
    unexplainedDrift: comparison.unexplainedDrift,
  };
  if (comparison.recordSha256 !== qaJsonSha256(comparisonRecord)) {
    qaReportError(
      'comparison.recordSha256 must match the exact comparison payload',
    );
  }
};

const verifyQaReportNeutralText = (
  value: unknown,
  path: string,
  visited: WeakMap<object, number>,
  publicationContext = false,
): void => {
  if (typeof value === 'string') {
    const attributedPath = path.endsWith(']') ? `${path}_entry` : path;
    if (
      publicationContext &&
      value.trim().toLowerCase() === 'published'
    ) {
      qaReportError(`private/absolute field ${attributedPath}`);
    }
    if (QA_REPORT_PRIVATE_TEXT_PATTERNS.some((pattern) => pattern.test(value))) {
      qaReportError(`private/absolute field ${attributedPath}`);
    }
    return;
  }
  if (typeof value !== 'object' || value === null) return;
  const contextMask = publicationContext ? 2 : 1;
  const visitedContexts = visited.get(value) ?? 0;
  if ((visitedContexts & contextMask) !== 0) return;
  visited.set(value, visitedContexts | contextMask);

  if (Array.isArray(value)) {
    for (const [index, entry] of value.entries()) {
      verifyQaReportNeutralText(
        entry,
        `${path}[${index}]`,
        visited,
        publicationContext,
      );
    }
    return;
  }

  for (const [field, entry] of Object.entries(value)) {
    const entryPath = path.length === 0 ? field : `${path}.${field}`;
    const normalizedField = field.toLowerCase().replace(/[^a-z]/g, '');
    const entryPublicationContext =
      publicationContext ||
      normalizedField.includes('publication') ||
      normalizedField.includes('release');
    if (
      entry === true &&
      (normalizedField === 'ispublished' || normalizedField === 'published')
    ) {
      qaReportError(`private/absolute field ${entryPath}`);
    }
    if (QA_REPORT_PRIVATE_TEXT_PATTERNS.some((pattern) => pattern.test(field))) {
      qaReportError(`private/absolute field ${entryPath} (key)`);
    }
    verifyQaReportNeutralText(
      entry,
      entryPath,
      visited,
      entryPublicationContext,
    );
  }
};

export const verifyQaReport = (candidate: unknown): void => {
  if (!isRecord(candidate)) {
    qaReportError('report must be an object');
  }
  if (candidate.schemaVersion !== 1) {
    qaReportError('schemaVersion must be exactly 1');
  }
  if (candidate.status !== 'passed-prepublication') {
    qaReportError('status must be exactly passed-prepublication');
  }
  if (candidate.boundedClaim !== QA_BOUNDED_CLAIM) {
    qaReportError(`boundedClaim must be exactly ${QA_BOUNDED_CLAIM}`);
  }
  if (candidate.fullMediaExecuted !== true) {
    qaReportError('fullMediaExecuted must be exactly true');
  }

  const requirementMatrix = candidate.requirementMatrix;
  if (!isRecord(requirementMatrix)) {
    qaReportError(
      'requirementMatrix: Requirement matrix: must be an object',
    );
  }
  try {
    verifyRequirementMatrix(requirementMatrix, 'prepublication');
  } catch (error) {
    qaReportError(
      `requirementMatrix: ${error instanceof Error ? error.message : String(error)}`,
    );
  }

  const baselineRun = verifyQaReportBaselineRun(candidate);
  const authoritativeRun = verifyQaReportAuthoritativeRun(candidate);
  try {
    verifyQaRunPair(baselineRun, authoritativeRun);
  } catch (error) {
    qaReportError(
      `baselineRun/authoritativeRun pair: ${
        error instanceof Error ? error.message : String(error)
      }`,
    );
  }
  if (!qaReportValuesEqual(requirementMatrix, authoritativeRun.requirementMatrix)) {
    qaReportError(
      'requirementMatrix must exactly equal authoritativeRun.requirementMatrix',
    );
  }
  verifyQaReportArtifactReferences(candidate, authoritativeRun);
  verifyQaReportSummaries(candidate, authoritativeRun);
  verifyQaReportRunCrossLinks(candidate, authoritativeRun);
  verifyQaReportRunReferences(candidate, baselineRun, authoritativeRun);
  verifyQaReportComparison(candidate);
  const comparison = candidate.comparison as UnknownRecord;
  const requirementCriteria = requirementMatrix.criteria as UnknownRecord[];
  const criterion10 = requirementCriteria.find((entry) => entry.id === 10);
  const criterion10Evidence = Array.isArray(criterion10?.evidence)
    ? criterion10.evidence[0]
    : undefined;
  if (
    !isRecord(criterion10Evidence) ||
    criterion10Evidence.sha256 !== comparison.recordSha256
  ) {
    qaReportError(
      'requirementMatrix criterion 10 evidence must match comparison.recordSha256',
    );
  }
  verifyQaReportNeutralText(candidate, '', new WeakMap<object, number>());
};

const qaPublicationError = (detail: string): never => {
  throw new Error(`QA publication: ${detail}`);
};

const requireExactRecordFields = (
  candidate: UnknownRecord,
  location: string,
  expectedFields: readonly string[],
): void => {
  const actualFields = Object.keys(candidate);
  if (
    actualFields.length !== expectedFields.length ||
    actualFields.some((field) => !expectedFields.includes(field))
  ) {
    qaPublicationError(
      `${location} must contain exactly ${expectedFields.join(', ')}`,
    );
  }
};

const verifyQaPublicationEvidence = (
  candidate: unknown,
): UnknownRecord => {
  if (!isRecord(candidate)) {
    qaPublicationError('publication must be an object');
  }
  const publication = candidate as UnknownRecord;
  requireExactRecordFields(publication, 'publication', [
    'sourceCommit',
    'tag',
    'releaseUrl',
    'checksumsUrl',
    'assets',
    'checksumVerification',
  ]);

  if (
    typeof publication.sourceCommit !== 'string' ||
    !GIT_COMMIT_PATTERN.test(publication.sourceCommit)
  ) {
    qaPublicationError('publication.sourceCommit must be a 40-character lowercase Git commit');
  }
  if (publication.tag !== QA_PUBLICATION_TAG) {
    qaPublicationError(`publication.tag must be exactly ${QA_PUBLICATION_TAG}`);
  }

  const releaseUrl =
    `https://github.com/ael-dev3/lyrics/releases/tag/${QA_PUBLICATION_TAG}`;
  const downloadRoot =
    `https://github.com/ael-dev3/lyrics/releases/download/${QA_PUBLICATION_TAG}`;
  if (publication.releaseUrl !== releaseUrl) {
    qaPublicationError(`publication.releaseUrl must be exactly ${releaseUrl}`);
  }
  if (publication.checksumsUrl !== `${downloadRoot}/CHECKSUMS.sha256`) {
    qaPublicationError(
      `publication.checksumsUrl must be exactly ${downloadRoot}/CHECKSUMS.sha256`,
    );
  }

  if (
    !Array.isArray(publication.assets) ||
    publication.assets.length !== QA_PUBLICATION_ASSET_NAMES.length
  ) {
    qaPublicationError(
      `publication.assets must list exactly ${QA_PUBLICATION_ASSET_NAMES.length} stable release assets`,
    );
  }
  const assets = publication.assets as unknown[];
  for (const [index, expectedName] of QA_PUBLICATION_ASSET_NAMES.entries()) {
    const asset = assets[index];
    const location = `publication.assets[${index}]`;
    if (!isRecord(asset)) {
      qaPublicationError(`${location} must be an object`);
    }
    const assetRecord = asset as UnknownRecord;
    requireExactRecordFields(assetRecord, location, [
      'name',
      'url',
      'sizeBytes',
      'sha256',
    ]);
    if (assetRecord.name !== expectedName) {
      qaPublicationError(
        `publication.assets must list the approved names exactly; ${location}.name must be ${expectedName}`,
      );
    }
    if (assetRecord.url !== `${downloadRoot}/${expectedName}`) {
      qaPublicationError(
        `${location}.url must be exactly ${downloadRoot}/${expectedName}`,
      );
    }
    if (!Number.isSafeInteger(assetRecord.sizeBytes) || (assetRecord.sizeBytes as number) <= 0) {
      qaPublicationError(`${location}.sizeBytes must be a positive safe integer`);
    }
    if (
      typeof assetRecord.sha256 !== 'string' ||
      !SHA256_PATTERN.test(assetRecord.sha256)
    ) {
      qaPublicationError(
        `${location}.sha256 must be 64 lowercase hexadecimal characters`,
      );
    }
  }

  const checksumVerification = publication.checksumVerification;
  if (!isRecord(checksumVerification)) {
    qaPublicationError('publication.checksumVerification must be an object');
  }
  const checksumRecord = checksumVerification as UnknownRecord;
  requireExactRecordFields(
    checksumRecord,
    'publication.checksumVerification',
    ['algorithm', 'entryCount', 'result'],
  );
  if (checksumRecord.algorithm !== 'SHA-256') {
    qaPublicationError(
      'publication.checksumVerification.algorithm must be exactly SHA-256',
    );
  }
  if (checksumRecord.entryCount !== QA_PUBLICATION_CHECKSUM_ENTRY_COUNT) {
    qaPublicationError(
      `publication.checksumVerification.entryCount must be exactly ${QA_PUBLICATION_CHECKSUM_ENTRY_COUNT}`,
    );
  }
  if (checksumRecord.result !== 'matched-after-download') {
    qaPublicationError(
      'publication.checksumVerification.result must be exactly matched-after-download',
    );
  }
  return publication;
};

const cloneQaJson = <T>(value: T): T =>
  JSON.parse(JSON.stringify(value)) as T;

const qaCriterionById = (
  matrix: UnknownRecord,
  criterionId: number,
): UnknownRecord => {
  const criteria = matrix.criteria;
  if (!Array.isArray(criteria)) {
    qaReportError('requirementMatrix.criteria must be an array');
  }
  const criterion = criteria.find(
    (entry) => isRecord(entry) && entry.id === criterionId,
  );
  if (!isRecord(criterion)) {
    qaReportError(`requirementMatrix criterion ${criterionId} must exist`);
  }
  return criterion;
};

export const verifyPublishedQaReport = (candidate: unknown): void => {
  if (!isRecord(candidate)) {
    qaReportError('published report must be an object');
  }
  if (candidate.status !== 'passed-publication') {
    qaReportError('status must be exactly passed-publication');
  }
  const publication = verifyQaPublicationEvidence(candidate.publication);

  const authoritativeRun = candidate.authoritativeRun;
  if (!isRecord(authoritativeRun) || !isRecord(authoritativeRun.requirementMatrix)) {
    qaReportError('authoritativeRun requirement matrix must be an object');
  }

  const prepublicationReport = cloneQaJson(candidate);
  delete prepublicationReport.publication;
  prepublicationReport.status = 'passed-prepublication';
  prepublicationReport.requirementMatrix = cloneQaJson(
    authoritativeRun.requirementMatrix,
  );
  verifyQaReport(prepublicationReport);

  const finalMatrix = candidate.requirementMatrix;
  if (!isRecord(finalMatrix)) {
    qaReportError('requirementMatrix must be an object');
  }
  try {
    verifyRequirementMatrix(finalMatrix, 'final');
  } catch (error) {
    qaReportError(
      `requirementMatrix: ${error instanceof Error ? error.message : String(error)}`,
    );
  }

  for (let criterionId = 1; criterionId <= 10; criterionId += 1) {
    const finalCriterion = qaCriterionById(finalMatrix, criterionId);
    const authoritativeCriterion = qaCriterionById(
      authoritativeRun.requirementMatrix,
      criterionId,
    );
    if (!qaReportValuesEqual(finalCriterion, authoritativeCriterion)) {
      qaReportError(
        `requirementMatrix criterion ${criterionId} must exactly equal authoritativeRun`,
      );
    }
  }

  const finalCriterion11 = qaCriterionById(finalMatrix, 11);
  const authoritativeCriterion11 = qaCriterionById(
    authoritativeRun.requirementMatrix,
    11,
  );
  if (finalCriterion11.title !== authoritativeCriterion11.title) {
    qaReportError('requirementMatrix criterion 11 title must equal authoritativeRun');
  }
  const expectedCriterion11Evidence = [
    {
      id: 'criterion-11-evidence-01',
      kind: 'release-url',
      artifact: publication.releaseUrl,
      sha256: '',
      value:
        `${publication.tag} release assets and checksums matched after remote download`,
    },
  ];
  if (
    finalCriterion11.status !== 'proved' ||
    !qaReportValuesEqual(
      finalCriterion11.evidence,
      expectedCriterion11Evidence,
    )
  ) {
    qaReportError(
      'requirementMatrix criterion 11 must exactly match publication evidence',
    );
  }
};

export const createPublishedQaReport = (
  candidate: unknown,
  publicationCandidate: unknown,
): UnknownRecord => {
  verifyQaReport(candidate);
  if (!isRecord(candidate)) {
    qaReportError('report must be an object');
  }
  const publication = verifyQaPublicationEvidence(publicationCandidate);
  const published = cloneQaJson(candidate);
  const finalMatrix = cloneQaJson(published.requirementMatrix);
  if (!isRecord(finalMatrix)) {
    qaReportError('requirementMatrix must be an object');
  }
  const criterion11 = qaCriterionById(finalMatrix, 11);
  criterion11.status = 'proved';
  criterion11.evidence = [
    {
      id: 'criterion-11-evidence-01',
      kind: 'release-url',
      artifact: publication.releaseUrl,
      sha256: '',
      value:
        `${publication.tag} release assets and checksums matched after remote download`,
    },
  ];
  published.status = 'passed-publication';
  published.requirementMatrix = finalMatrix;
  published.publication = cloneQaJson(publication);
  verifyPublishedQaReport(published);
  return published;
};

function malformedPublicMarkup(): never {
  throw new Error('Public markup: malformed markup');
}

const parseMarkupAttributes = (source: string): ReadonlyMap<string, string> => {
  const attributes = new Map<string, string>();
  let offset = 0;

  while (offset < source.length) {
    if (source.slice(offset).trim().length === 0) break;

    MARKUP_ATTRIBUTE_PATTERN.lastIndex = offset;
    const match = MARKUP_ATTRIBUTE_PATTERN.exec(source);
    if (!match || match.index !== offset) malformedPublicMarkup();

    const name = match[1]!.toLowerCase();
    if (attributes.has(name)) malformedPublicMarkup();
    attributes.set(name, match[2] ?? match[3] ?? match[4] ?? '');
    offset = MARKUP_ATTRIBUTE_PATTERN.lastIndex;
  }

  return attributes;
};

const parseMarkupTags = (markup: string): ParsedMarkupTag[] => {
  const openingTags: ParsedMarkupTag[] = [];
  const stack: string[] = [];
  let offset = 0;

  MARKUP_TAG_PATTERN.lastIndex = 0;
  for (
    let match = MARKUP_TAG_PATTERN.exec(markup);
    match;
    match = MARKUP_TAG_PATTERN.exec(markup)
  ) {
    if (/[<>]/.test(markup.slice(offset, match.index))) malformedPublicMarkup();

    const source = match[0]!;
    const shape = MARKUP_TAG_SHAPE.exec(source);
    if (!shape) malformedPublicMarkup();

    const closing = shape[1] === '/';
    const name = shape[2]!.toLowerCase();
    const attributeSource = shape[3] ?? '';
    const explicitlySelfClosing = shape[4] === '/';

    if (closing) {
      if (attributeSource.trim().length > 0 || explicitlySelfClosing) {
        malformedPublicMarkup();
      }
      if (stack.pop() !== name) malformedPublicMarkup();
    } else {
      openingTags.push({
        name,
        attributes: parseMarkupAttributes(attributeSource),
      });
      if (!explicitlySelfClosing && !VOID_MARKUP_TAGS.has(name)) {
        stack.push(name);
      }
    }

    offset = match.index + source.length;
  }

  if (
    openingTags.length === 0 ||
    stack.length > 0 ||
    /[<>]/.test(markup.slice(offset))
  ) {
    malformedPublicMarkup();
  }

  return openingTags;
};

const attributeValues = (
  tags: readonly ParsedMarkupTag[],
  attribute: string,
): string[] =>
  tags.flatMap((tag) => {
    const value = tag.attributes.get(attribute);
    return value === undefined ? [] : [value];
  });

const hasExactValues = (
  actual: readonly string[],
  expected: readonly string[],
): boolean =>
  actual.length === expected.length &&
  expected.every(
    (expectedValue) =>
      actual.filter((actualValue) => actualValue === expectedValue).length === 1,
  );

const cssHasProperty = (style: string, property: string): boolean =>
  new RegExp(`(?:^|;)\\s*${property}\\s*:`, 'i').test(style);

const descriptorTokens = (value: string): string[] =>
  value.toLowerCase().split(/[^a-z\d]+/).filter(Boolean);

export const verifyPublicMarkup = (candidate: unknown): void => {
  if (!isNonemptyString(candidate)) {
    throw new Error('Public markup: must be a nonempty string');
  }

  const markup = candidate;
  const tags = parseMarkupTags(markup);
  const rootValues = attributeValues(tags, 'data-frame-chrome');
  if (
    !hasExactValues(rootValues, ['public']) ||
    tags[0]?.attributes.get('data-frame-chrome') !== 'public'
  ) {
    throw new Error(
      'Public markup: requires exactly one public frame-chrome root',
    );
  }

  if (
    !hasExactValues(
      attributeValues(tags, 'data-frame-chrome-border'),
      ['frame'],
    )
  ) {
    throw new Error('Public markup: requires exactly one frame border');
  }

  if (
    !hasExactValues(
      attributeValues(tags, 'data-frame-chrome-corner'),
      PUBLIC_CORNERS,
    )
  ) {
    throw new Error(
      'Public markup: frame-chrome corners must be exactly top-left, top-right, bottom-left, bottom-right',
    );
  }

  if (
    !hasExactValues(
      attributeValues(tags, 'data-frame-chrome-slot'),
      PUBLIC_SLOTS,
    )
  ) {
    throw new Error(
      'Public markup: frame-chrome slots must be exactly identity, track-label, timecode',
    );
  }

  const visibleText = markup.replace(/<[^<>]*>/g, ' ');
  if (!visibleText.includes('TANISEA // KSVIETY')) {
    throw new Error('Public markup: missing TANISEA // KSVIETY identity');
  }

  const trackLabel = tags.find(
    (tag) => tag.attributes.get('data-frame-chrome-slot') === 'track-label',
  );
  const trackLabelStyle = trackLabel?.attributes.get('style') ?? '';
  if (
    !visibleText.includes('TRACK 01 · ENGLISH LYRIC FILM · VNEXT') ||
    !cssHasProperty(trackLabelStyle, 'bottom') ||
    cssHasProperty(trackLabelStyle, 'top')
  ) {
    throw new Error('Public markup: missing lower track label');
  }

  if (!visibleText.includes('01:04.06')) {
    throw new Error('Public markup: missing 01:04.06 timecode');
  }

  for (const tag of tags) {
    for (const [name, value] of tag.attributes) {
      if (!name.startsWith('data-')) continue;

      const tokens = descriptorTokens(`${name} ${value}`);
      for (const descriptor of ['diagnostic', 'telemetry'] as const) {
        if (tokens.includes(descriptor)) {
          throw new Error(
            `Public markup: forbidden ${descriptor} data attribute`,
          );
        }
      }

      if (tokens.includes('rail')) {
        for (const descriptor of ['global', 'upper', 'reactive'] as const) {
          if (tokens.includes(descriptor)) {
            throw new Error(`Public markup: forbidden ${descriptor} rail`);
          }
        }
      }
    }
  }

  for (const tag of tags) {
    const dataDescriptorTokens = [...tag.attributes.entries()].flatMap(
      ([name, value]) =>
        name.startsWith('data-') ? descriptorTokens(`${name} ${value}`) : [],
    );
    const isRail = dataDescriptorTokens.includes('rail');
    if (
      isRail &&
      cssHasProperty(tag.attributes.get('style') ?? '', 'top')
    ) {
      throw new Error('Public markup: top-positioned rail is forbidden');
    }

    const isReactiveElement = [
      'audio',
      'meter',
      'spectrum',
      'motion',
      'visualizer',
    ].some((descriptor) => dataDescriptorTokens.includes(descriptor));
    if (isReactiveElement) {
      if (cssHasProperty(tag.attributes.get('style') ?? '', 'top')) {
        throw new Error(
          'Public markup: forbidden top-positioned reactive element',
        );
      }
      if (dataDescriptorTokens.includes('upper')) {
        throw new Error('Public markup: forbidden upper reactive element');
      }
    }
  }

  for (const [label, pattern] of [
    ['RMS', /\bRMS\s+[+-]?\d+(?:\.\d+)?(?:\s*dBFS)?\b/i],
    ['dBFS', /[+-]?\d+(?:\.\d+)?\s*dBFS\b/i],
    ['PK', /\bPK\s+[+-]?\d+(?:\.\d+)?(?:\s*dBFS)?\b/i],
    ['PEAK', /\bPEAK\s+[+-]?\d+(?:\.\d+)?(?:\s*dBFS)?\b/i],
    ['FPS', /\b\d+(?:\.\d+)?\s*FPS\b/i],
  ] as const) {
    if (pattern.test(visibleText)) {
      throw new Error(`Public markup: forbidden ${label} telemetry`);
    }
  }
};

export const verifyRequirementMatrix = (
  matrix: unknown,
  mode: RequirementMatrixMode,
): void => {
  if (mode !== 'baseline' && mode !== 'prepublication' && mode !== 'final') {
    throw new Error(`Unsupported requirement-matrix mode: ${describeValue(mode)}`);
  }
  if (!isRecord(matrix)) {
    throw new Error('Requirement matrix: must be an object');
  }
  if (!Array.isArray(matrix.criteria)) {
    throw new Error('Requirement matrix: criteria must be an array');
  }

  const criteriaById = new Map<number, UnknownRecord>();
  for (const [index, candidate] of matrix.criteria.entries()) {
    if (!isRecord(candidate)) {
      throw new Error(`Requirement matrix criteria[${index}]: must be an object`);
    }

    const id = candidate.id;
    if (!Number.isInteger(id)) {
      throw new Error(
        `Requirement matrix criteria[${index}]: criterion ID must be an integer, got ${describeValue(id)}`,
      );
    }
    const criterionId = id as number;
    if (criterionId < 1 || criterionId > 11) {
      throw new Error(`Criterion ${criterionId}: unknown ID`);
    }
    if (criteriaById.has(criterionId)) {
      throw new Error(`Criterion ${criterionId}: duplicate ID`);
    }
    criteriaById.set(criterionId, candidate);
  }

  for (let criterionId = 1; criterionId <= 11; criterionId += 1) {
    if (!criteriaById.has(criterionId)) {
      throw new Error(`Criterion ${criterionId}: missing`);
    }
  }

  const evidenceOwners = new Map<string, string>();
  for (let criterionId = 1; criterionId <= 11; criterionId += 1) {
    const criterion = criteriaById.get(criterionId)!;
    const title = criterion.title;
    if (!isNonemptyString(title)) {
      throw new Error(`Criterion ${criterionId}: title must be a nonempty string`);
    }

    const status = criterion.status;
    if (!isNonemptyString(status)) {
      throw new Error(`Criterion ${criterionId}: status must be a nonempty string`);
    }
    if (!SUPPORTED_STATUSES.has(status)) {
      throw new Error(`Criterion ${criterionId}: unsupported status ${status}`);
    }

    const expectedStatus =
      mode === 'baseline' && criterionId === 10
        ? 'pending-repeat'
        : mode !== 'final' && criterionId === 11
          ? 'pending-publication'
          : 'proved';
    if (status !== expectedStatus) {
      throw new Error(
        `Criterion ${criterionId}: ${mode} status must be ${expectedStatus}, got ${status}`,
      );
    }

    const evidence = criterion.evidence;
    if (!Array.isArray(evidence) || evidence.length === 0) {
      throw new Error(`Criterion ${criterionId}: evidence must be a nonempty array`);
    }
    const expectedKinds = expectedRequirementEvidenceKinds(criterionId, mode);
    const expectedKindCounts = new Map<string, number>();
    for (const expectedKind of expectedKinds) {
      expectedKindCounts.set(
        expectedKind,
        (expectedKindCounts.get(expectedKind) ?? 0) + 1,
      );
    }
    const observedKindCounts = new Map<string, number>();

    for (const [evidenceIndex, candidate] of evidence.entries()) {
      const location = `Criterion ${criterionId} evidence[${evidenceIndex}]`;
      if (!isRecord(candidate)) {
        throw new Error(`${location}: must be an object`);
      }

      for (const field of ['id', 'kind', 'artifact'] as const) {
        if (!isNonemptyString(candidate[field])) {
          throw new Error(`${location}: ${field} must be a nonempty string`);
        }
      }

      const kind = candidate.kind as string;
      if (!expectedKinds.includes(kind as RequirementEvidenceKind)) {
        throw new Error(
          `${location}: unsupported kind ${kind}; expected ${expectedKinds.join(' or ')}`,
        );
      }
      observedKindCounts.set(kind, (observedKindCounts.get(kind) ?? 0) + 1);

      const evidenceId = candidate.id as string;
      const firstOwner = evidenceOwners.get(evidenceId);
      if (firstOwner) {
        throw new Error(
          `${location}: duplicate evidence ID ${evidenceId} (first used by ${firstOwner})`,
        );
      }
      evidenceOwners.set(evidenceId, location);

      requireAuthorizedRequirementArtifact(
        kind as RequirementEvidenceKind,
        candidate.artifact as string,
        location,
      );

      const sha256 = candidate.sha256;
      const hasSha256 = isNonemptyString(sha256);
      if (sha256 !== undefined && sha256 !== null && hasSha256 && !SHA256_PATTERN.test(sha256)) {
        throw new Error(
          `${location}: sha256 must be 64 lowercase hexadecimal characters`,
        );
      }
      if (
        sha256 !== undefined &&
        sha256 !== null &&
        typeof sha256 !== 'string'
      ) {
        throw new Error(
          `${location}: sha256 must be 64 lowercase hexadecimal characters`,
        );
      }

      const value = candidate.value;
      if (
        value !== undefined &&
        value !== null &&
        typeof value !== 'string'
      ) {
        throw new Error(
          `${location}: value must be a nonempty string when provided`,
        );
      }

      if (kind !== 'release-url' && !SHA256_PATTERN.test(sha256 as string)) {
        throw new Error(
          `${location}: sha256 must be 64 lowercase hexadecimal characters`,
        );
      }
      if (kind === 'release-url' && !isNonemptyString(value)) {
        throw new Error(
          `${location}: release-url value must be a nonempty string`,
        );
      }
    }
    for (const [expectedKind, expectedCount] of expectedKindCounts) {
      if (observedKindCounts.get(expectedKind) !== expectedCount) {
        throw new Error(
          `Criterion ${criterionId}: evidence must include exactly ${expectedCount} ${expectedKind} record${expectedCount === 1 ? '' : 's'}`,
        );
      }
    }
  }
};
