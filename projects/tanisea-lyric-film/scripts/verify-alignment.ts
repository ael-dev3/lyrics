import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';

import {
  frameErrorMs,
  frameForSample,
  PROOF_FPS,
  PUBLIC_FPS,
  SAMPLE_RATE,
  type AlignedLyricLine,
  type EvidenceMethod,
  type SourceToken,
} from '../src/timing/alignment-types.js';
import {validateAlignmentManifest} from '../src/timing/validate-alignment.js';

type ReviewedTokenFixture = readonly [
  tokenId: string,
  startSample: number,
  endSample: number,
  manualOnsetSample: number,
  manualOffsetSample: number,
];

const EXPECTED_TOKEN_COUNTS = {
  'C1-01': 4,
  'C1-02': 3,
  'C1-03': 4,
  'C1-04': 3,
  'C1-05': 5,
  'C1-06': 3,
  'C1-07': 4,
  'C1-08': 3,
  'V1-01': 5,
  'V1-02': 4,
  'V1-03': 6,
  'V1-04': 8,
  'V1-05': 5,
  'V1-06': 5,
  'V1-07': 4,
  'V1-08': 7,
  'C2-01': 4,
  'C2-02': 3,
  'C2-03': 4,
  'C2-04': 3,
  'C2-05': 5,
  'C2-06': 3,
  'C2-07': 4,
  'C2-08': 3,
} as const;

const CHORUS_REVIEW_FIXTURES = {
  'C1-01': [
    ['C1-01-R01', 1_066_955, 1_070_483, 1_066_955, 1_070_483],
    ['C1-01-R02', 1_073_129, 1_077_539, 1_073_129, 1_077_539],
    ['C1-01-R03', 1_081_067, 1_097_825, 1_081_067, 1_097_825],
    ['C1-01-R04', 1_100_471, 1_124_991, 1_100_471, 1_124_991],
  ],
  'C1-02': [
    ['C1-02-R01', 1_219_674, 1_224_966, 1_219_674, 1_224_966],
    ['C1-02-R02', 1_225_848, 1_241_724, 1_225_848, 1_241_724],
    ['C1-02-R03', 1_243_488, 1_332_702, 1_243_488, 1_332_702],
  ],
  'C1-03': [
    ['C1-03-R01', 1_346_638, 1_372_700, 1_346_638, 1_372_700],
    ['C1-03-R02', 1_372_700, 1_398_764, 1_372_700, 1_398_764],
    ['C1-03-R03', 1_400_528, 1_405_820, 1_400_528, 1_405_820],
    ['C1-03-R04', 1_407_584, 1_487_052, 1_407_584, 1_487_052],
  ],
  'C1-04': [
    ['C1-04-R01', 1_491_462, 1_494_108, 1_491_462, 1_494_108],
    ['C1-04-R02', 1_497_636, 1_525_904, 1_497_636, 1_525_904],
    ['C1-04-R03', 1_528_550, 1_628_348, 1_528_550, 1_628_348],
  ],
  'C1-05': [
    ['C1-05-R01', 1_631_876, 1_638_932, 1_631_876, 1_638_932],
    ['C1-05-R02', 1_639_814, 1_659_263, 1_639_814, 1_659_263],
    ['C1-05-R03', 1_660_145, 1_672_492, 1_660_145, 1_672_492],
    ['C1-05-R04', 1_674_257, 1_698_000, 1_674_257, 1_698_000],
    ['C1-05-R05', 1_698_000, 1_795_223, 1_698_000, 1_795_223],
  ],
  'C1-06': [
    ['C1-06-R01', 1_796_987, 1_814_671, 1_796_987, 1_814_671],
    ['C1-06-R02', 1_818_199, 1_931_227, 1_818_199, 1_931_227],
    ['C1-06-R03', 1_936_519, 1_971_843, 1_936_519, 1_971_843],
  ],
  'C1-07': [
    ['C1-07-R01', 1_974_489, 1_975_371, 1_974_489, 1_975_371],
    ['C1-07-R02', 1_978_017, 2_012_459, 1_978_017, 2_012_459],
    ['C1-07-R03', 2_013_341, 2_046_020, 2_013_341, 2_046_020],
    ['C1-07-R04', 2_046_902, 2_063_660, 2_046_902, 2_063_660],
  ],
  'C1-08': [
    ['C1-08-R01', 2_064_542, 2_078_698, 2_064_542, 2_078_698],
    ['C1-08-R02', 2_080_462, 2_096_338, 2_080_462, 2_096_338],
    ['C1-08-R03', 2_098_102, 2_171_396, 2_098_102, 2_171_396],
  ],
  'C2-01': [
    ['C2-01-R01', 4_031_225, 4_033_871, 4_031_225, 4_033_871],
    ['C2-01-R02', 4_035_635, 4_039_163, 4_035_635, 4_039_163],
    ['C2-01-R03', 4_040_045, 4_061_213, 4_040_045, 4_061_213],
    ['C2-01-R04', 4_062_977, 4_169_743, 4_062_977, 4_169_743],
  ],
  'C2-02': [
    ['C2-02-R01', 4_175_917, 4_178_563, 4_175_917, 4_178_563],
    ['C2-02-R02', 4_181_209, 4_204_185, 4_181_209, 4_204_185],
    ['C2-02-R03', 4_205_949, 4_307_423, 4_205_949, 4_307_423],
  ],
  'C2-03': [
    ['C2-03-R01', 4_310_069, 4_321_535, 4_310_069, 4_321_535],
    ['C2-03-R02', 4_323_299, 4_333_883, 4_323_299, 4_333_883],
    ['C2-03-R03', 4_334_765, 4_339_175, 4_334_765, 4_339_175],
    ['C2-03-R04', 4_340_057, 4_449_249, 4_340_057, 4_449_249],
  ],
  'C2-04': [
    ['C2-04-R01', 4_449_249, 4_461_818, 4_449_249, 4_461_818],
    ['C2-04-R02', 4_462_700, 4_486_514, 4_462_700, 4_486_514],
    ['C2-04-R03', 4_491_806, 4_590_634, 4_491_806, 4_590_634],
  ],
  'C2-05': [
    ['C2-05-R01', 4_595_926, 4_599_498, 4_595_926, 4_599_498],
    ['C2-05-R02', 4_603_026, 4_623_312, 4_603_026, 4_623_312],
    ['C2-05-R03', 4_624_194, 4_626_500, 4_624_194, 4_626_500],
    ['C2-05-R04', 4_626_500, 4_630_368, 4_626_500, 4_630_368],
    ['C2-05-R05', 4_630_368, 4_757_420, 4_630_368, 4_757_420],
  ],
  'C2-06': [
    ['C2-06-R01', 4_760_948, 4_777_706, 4_760_948, 4_777_706],
    ['C2-06-R02', 4_778_588, 4_791_818, 4_778_588, 4_791_818],
    ['C2-06-R03', 4_793_582, 4_875_652, 4_793_582, 4_875_652],
  ],
  'C2-07': [
    ['C2-07-R01', 4_878_298, 4_884_472, 4_878_298, 4_884_472],
    ['C2-07-R02', 4_886_236, 4_901_230, 4_886_236, 4_901_230],
    ['C2-07-R03', 4_903_876, 4_927_734, 4_903_876, 4_927_734],
    ['C2-07-R04', 4_935_672, 5_017_742, 4_935_672, 5_017_742],
  ],
  'C2-08': [
    ['C2-08-R01', 5_019_506, 5_036_264, 5_019_506, 5_036_264],
    ['C2-08-R02', 5_037_146, 5_045_966, 5_037_146, 5_045_966],
    ['C2-08-R03', 5_048_612, 5_171_254, 5_048_612, 5_171_254],
  ],
} as const satisfies Readonly<Record<string, readonly ReviewedTokenFixture[]>>;

const EXPECTED_MFA_MISSING_TOKEN_IDS = [
  'C1-06-R01',
  'C1-06-R02',
  'C1-06-R03',
  'C1-07-R01',
  'C1-07-R02',
  'C1-07-R03',
  'C1-07-R04',
  'V1-08-R01',
  'V1-08-R02',
  'V1-08-R03',
  'V1-08-R04',
  'V1-08-R05',
  'V1-08-R06',
  'V1-08-R07',
  'C2-06-R01',
  'C2-06-R02',
  'C2-06-R03',
  'C2-07-R01',
  'C2-07-R02',
  'C2-07-R03',
  'C2-07-R04',
] as const;

const REQUIRED_V103 = [
  {
    sourceTokenIds: ['V1-03-R05'],
    targets: ['V1-03-S03'],
    activation: 'forward',
  },
  {
    sourceTokenIds: ['V1-03-R06'],
    targets: ['V1-03-S02'],
    activation: 'backward',
  },
] as const;

const REQUIRED_V108 = [
  {
    sourceTokenIds: ['V1-08-R02'],
    targets: ['V1-08-S02'],
    activation: 'forward',
  },
  {
    sourceTokenIds: ['V1-08-R03', 'V1-08-R04'],
    targets: ['V1-08-S01'],
    activation: 'backward',
  },
  {
    sourceTokenIds: ['V1-08-R05', 'V1-08-R06'],
    targets: ['V1-08-S03'],
    activation: 'forward',
  },
  {
    sourceTokenIds: ['V1-08-R07'],
    targets: ['V1-08-S04'],
    activation: 'forward',
  },
] as const;

const REQUIRED_SELECTED_EVIDENCE_METHODS = [
  'waveform',
  'spectrogram',
  'manual-review',
] as const satisfies readonly EvidenceMethod[];
const METHOD_SPREAD_THRESHOLD_SAMPLES = SAMPLE_RATE * 0.025;
const MAX_UNCERTAINTY_SAMPLES = SAMPLE_RATE * 0.05;

const fail = (message: string): never => {
  throw new Error(`alignment verification failed: ${message}`);
};

const requireCondition = (condition: boolean, message: string): void => {
  if (!condition) fail(message);
};

const sameJson = (left: unknown, right: unknown): boolean =>
  JSON.stringify(left) === JSON.stringify(right);

const lineById = (
  lines: readonly AlignedLyricLine[],
  id: string,
): AlignedLyricLine =>
  lines.find((line) => line.id === id) ?? fail(`missing line ${id}`);

const cueShape = (line: AlignedLyricLine) =>
  line.cues.map(({sourceTokenIds, targets, activation}) => ({
    sourceTokenIds,
    targets,
    activation,
  }));

const countForbiddenProportionalFields = (value: unknown): number => {
  if (Array.isArray(value)) {
    return value.reduce(
      (count, item) => count + countForbiddenProportionalFields(item),
      0,
    );
  }
  if (typeof value !== 'object' || value === null) {
    return value === 'proportional' ? 1 : 0;
  }
  return Object.entries(value).reduce((count, [key, item]) => {
    const normalizedKey = key.toLowerCase();
    const forbiddenKey =
      normalizedKey.includes('proportional') ||
      normalizedKey.includes('normalized');
    return (
      count +
      (forbiddenKey ? 1 : 0) +
      countForbiddenProportionalFields(item)
    );
  }, 0);
};

const evidenceSamples = (
  token: SourceToken,
  method: EvidenceMethod,
): readonly number[] =>
  token.evidence
    .filter((evidence) => evidence.method === method)
    .map(({sampleIndex}) => sampleIndex);

const hasSelectedBoundaryEvidence = (
  token: SourceToken,
  method: EvidenceMethod,
): boolean => {
  const samples = evidenceSamples(token, method);
  return samples.includes(token.startSample) && samples.includes(token.endSample);
};

const selectedBoundaryEvidenceRecordCount = (
  token: SourceToken,
  method: EvidenceMethod,
): number =>
  evidenceSamples(token, method).filter(
    (sample) => sample === token.startSample || sample === token.endSample,
  ).length;

const candidateInterval = (
  token: SourceToken,
  method: 'mfa' | 'whisperx',
): readonly [number, number] => {
  const samples = [...evidenceSamples(token, method)].sort(
    (left, right) => left - right,
  );
  requireCondition(
    samples.length === 2,
    `${token.id} must have exactly two ${method} candidate evidence records`,
  );
  const start =
    samples[0] ?? fail(`${token.id} ${method} candidate onset is missing`);
  const end =
    samples[1] ?? fail(`${token.id} ${method} candidate offset is missing`);
  if (end <= start) {
    fail(
      `${token.id} ${method} candidate evidence must contain a positive onset/offset interval`,
    );
  }
  return [start, end];
};

const verifyEvidencePolicy = (lines: readonly AlignedLyricLine[]) => {
  const expectedMissingMfaIds = new Set<string>(EXPECTED_MFA_MISSING_TOKEN_IDS);
  const actualMissingMfaIds: string[] = [];
  const methodSpreadOver25MsTokenIds: string[] = [];
  const selectedBoundaryEvidenceRecordCounts = {
    waveform: 0,
    spectrogram: 0,
    manualReview: 0,
  };
  const mandatoryNoMfaBoundaryEvidenceRecordCounts = {
    waveform: 0,
    spectrogram: 0,
    manualReview: 0,
  };
  let mfaBackedTokenCount = 0;
  let selectedBoundaryEvidenceTokenCount = 0;
  let maximumMethodSpreadSamples = 0;
  let maximumMethodSpreadTokenId = '';

  for (const line of lines) {
    for (const token of line.tokens) {
      candidateInterval(token, 'whisperx');
      const mfaSamples = evidenceSamples(token, 'mfa');
      const isRequiredNoMfaToken = expectedMissingMfaIds.has(token.id);
      if (mfaSamples.length === 0) actualMissingMfaIds.push(token.id);

      for (const method of REQUIRED_SELECTED_EVIDENCE_METHODS) {
        const count = selectedBoundaryEvidenceRecordCount(token, method);
        if (method === 'waveform') {
          selectedBoundaryEvidenceRecordCounts.waveform += count;
        } else if (method === 'spectrogram') {
          selectedBoundaryEvidenceRecordCounts.spectrogram += count;
        } else {
          selectedBoundaryEvidenceRecordCounts.manualReview += count;
        }
      }
      if (
        REQUIRED_SELECTED_EVIDENCE_METHODS.every((method) =>
          hasSelectedBoundaryEvidence(token, method),
        )
      ) {
        selectedBoundaryEvidenceTokenCount += 1;
      }

      if (isRequiredNoMfaToken) {
        requireCondition(
          mfaSamples.length === 0,
          `${token.id} required no-MFA token must have zero MFA evidence records`,
        );
        for (const method of REQUIRED_SELECTED_EVIDENCE_METHODS) {
          requireCondition(
            hasSelectedBoundaryEvidence(token, method),
            `${token.id} required no-MFA token requires selected onset and offset ${method} evidence`,
          );
          const count = selectedBoundaryEvidenceRecordCount(token, method);
          if (method === 'waveform') {
            mandatoryNoMfaBoundaryEvidenceRecordCounts.waveform += count;
          } else if (method === 'spectrogram') {
            mandatoryNoMfaBoundaryEvidenceRecordCounts.spectrogram += count;
          } else {
            mandatoryNoMfaBoundaryEvidenceRecordCounts.manualReview += count;
          }
        }
        continue;
      }

      const [mfaStart, mfaEnd] = candidateInterval(token, 'mfa');
      const [whisperXStart, whisperXEnd] = candidateInterval(
        token,
        'whisperx',
      );
      mfaBackedTokenCount += 1;
      const methodSpreadSamples = Math.max(
        Math.abs(mfaStart - whisperXStart),
        Math.abs(mfaEnd - whisperXEnd),
      );
      if (methodSpreadSamples > maximumMethodSpreadSamples) {
        maximumMethodSpreadSamples = methodSpreadSamples;
        maximumMethodSpreadTokenId = token.id;
      }
      if (methodSpreadSamples > METHOD_SPREAD_THRESHOLD_SAMPLES) {
        methodSpreadOver25MsTokenIds.push(token.id);
        const hasResolution = REQUIRED_SELECTED_EVIDENCE_METHODS.every(
          (method) => hasSelectedBoundaryEvidence(token, method),
        );
        requireCondition(
          hasResolution,
          `${token.id} candidate spread ${methodSpreadSamples} samples above 25 ms requires selected onset and offset waveform and spectrogram evidence plus manual-review`,
        );
      }
    }
  }

  requireCondition(
    sameJson(actualMissingMfaIds, EXPECTED_MFA_MISSING_TOKEN_IDS),
    'MFA-missing token IDs do not match the exact 21-token exception set',
  );
  requireCondition(
    mfaBackedTokenCount === 81,
    'MFA-backed token count must be exactly 81',
  );

  return {
    evidencePolicyViolationCount: 0,
    mfaBackedTokenCount,
    mfaMissingTokenCount: actualMissingMfaIds.length,
    mfaMissingTokenIds: actualMissingMfaIds,
    methodSpreadThresholdSamples: METHOD_SPREAD_THRESHOLD_SAMPLES,
    methodSpreadThresholdMs: 25,
    methodSpreadOver25MsTokenCount: methodSpreadOver25MsTokenIds.length,
    methodSpreadOver25MsTokenIds,
    maximumMethodSpreadSamples,
    maximumMethodSpreadMs: Number(
      ((maximumMethodSpreadSamples / SAMPLE_RATE) * 1000).toFixed(6),
    ),
    maximumMethodSpreadTokenId,
    selectedBoundaryEvidenceTokenCount,
    selectedBoundaryEvidenceRecordCounts,
    mandatoryNoMfaBoundaryEvidenceRecordCounts,
  };
};

const reviewedFixtureForLine = (
  line: AlignedLyricLine,
): readonly ReviewedTokenFixture[] =>
  line.tokens.map((token) => {
    const manualSamples = [...evidenceSamples(token, 'manual-review')]
      .filter(
        (sample) =>
          sample === token.startSample || sample === token.endSample,
      )
      .sort((left, right) => left - right);
    return [
      token.id,
      token.startSample,
      token.endSample,
      manualSamples[0] ?? -1,
      manualSamples[1] ?? -1,
    ] as const;
  });

export const verifyAlignmentManifest = (rawManifest: unknown) => {
  validateAlignmentManifest(rawManifest);
  const manifest = rawManifest;

  const expectedSourceTokenIds = Object.entries(EXPECTED_TOKEN_COUNTS).flatMap(
    ([lineId, count]) =>
      Array.from(
        {length: count},
        (_, index) => `${lineId}-R${String(index + 1).padStart(2, '0')}`,
      ),
  );
  const expectedSourceTokenIdSet = new Set(expectedSourceTokenIds);
  const actualSourceTokenIds = manifest.lines.flatMap((line) =>
    line.tokens.map(({id}) => id),
  );
  const actualSourceTokenIdSet = new Set(actualSourceTokenIds);
  const missingSourceTokenIds = expectedSourceTokenIds.filter(
    (id) => !actualSourceTokenIdSet.has(id),
  );
  const unknownSourceTokenIds = actualSourceTokenIds.filter(
    (id) => !expectedSourceTokenIdSet.has(id),
  );
  requireCondition(
    actualSourceTokenIds.length === 102,
    'source token count is not 102',
  );
  requireCondition(
    missingSourceTokenIds.length === 0,
    'source token inventory is incomplete',
  );
  requireCondition(
    unknownSourceTokenIds.length === 0,
    'unknown source token IDs exist',
  );

  const evidencePolicy = verifyEvidencePolicy(manifest.lines);

  const segmentIds = manifest.lines.flatMap((line) =>
    line.segments.map(({id}) => id),
  );
  const segmentIdSet = new Set(segmentIds);
  const cueTargetIds = manifest.lines.flatMap((line) =>
    line.cues.flatMap(({targets}) => targets),
  );
  const cueTargetCounts = new Map<string, number>();
  for (const target of cueTargetIds) {
    cueTargetCounts.set(target, (cueTargetCounts.get(target) ?? 0) + 1);
  }
  const unknownTargetIds = [...new Set(cueTargetIds)].filter(
    (id) => !segmentIdSet.has(id),
  );
  const untargetedSegmentIds = segmentIds.filter(
    (id) => !cueTargetCounts.has(id),
  );
  const duplicateTargetIds = segmentIds.filter(
    (id) => (cueTargetCounts.get(id) ?? 0) !== 1,
  );
  requireCondition(
    unknownTargetIds.length === 0,
    'unknown cue target IDs exist',
  );
  requireCondition(
    untargetedSegmentIds.length === 0,
    'untargeted semantic segments exist',
  );
  requireCondition(
    duplicateTargetIds.length === 0,
    'semantic targets are not one-to-one',
  );

  const cueReferencedSourceIds = manifest.lines.flatMap((line) =>
    line.cues.flatMap(({sourceTokenIds}) => sourceTokenIds),
  );
  const cueReferencedSourceIdSet = new Set(cueReferencedSourceIds);
  const semanticallyUnmappedSourceTokenIds = actualSourceTokenIds.filter(
    (id) => !cueReferencedSourceIdSet.has(id),
  );
  requireCondition(
    sameJson(semanticallyUnmappedSourceTokenIds, ['V1-08-R01']),
    'only the semantically null V1-08-R01 connective may be omitted from cues',
  );

  const forbiddenProportionalEvidenceCount =
    countForbiddenProportionalFields(rawManifest);
  requireCondition(
    forbiddenProportionalEvidenceCount === 0,
    'forbidden proportional or normalized timing fields exist',
  );

  const unresolvedTokenIds = manifest.lines.flatMap((line) =>
    line.tokens
      .filter(
        (token) =>
          token.uncertaintySamples > MAX_UNCERTAINTY_SAMPLES ||
          !hasSelectedBoundaryEvidence(token, 'manual-review'),
      )
      .map(({id}) => id),
  );
  requireCondition(
    unresolvedTokenIds.length === 0,
    'unresolved token reviews exist',
  );

  let independentChorusLiteralTokenCount = 0;
  const literalPairIds = new Set<string>();
  for (const [lineId, expectedFixture] of Object.entries(
    CHORUS_REVIEW_FIXTURES,
  ) as Array<[string, readonly ReviewedTokenFixture[]]>) {
    const line = lineById(manifest.lines, lineId);
    requireCondition(
      sameJson(reviewedFixtureForLine(line), expectedFixture),
      `${lineId} differs from its literal reviewed fixture`,
    );
    independentChorusLiteralTokenCount += expectedFixture.length;
    literalPairIds.add(lineId.slice(-2));
  }
  requireCondition(
    literalPairIds.size === 8,
    'literal chorus fixtures must cover all eight C1/C2 pairs',
  );

  const distinctChorusLineIds = Array.from({length: 8}, (_, index) => {
    const suffix = String(index + 1).padStart(2, '0');
    const first = lineById(manifest.lines, `C1-${suffix}`);
    const second = lineById(manifest.lines, `C2-${suffix}`);
    const relativeTimeline = (line: AlignedLyricLine): readonly number[] =>
      line.tokens.flatMap(({startSample, endSample}) => [
        startSample - line.vocalStartSample,
        endSample - line.vocalStartSample,
      ]);
    requireCondition(
      !sameJson(relativeTimeline(first), relativeTimeline(second)),
      `chorus line ${suffix} reuses a line-relative token timeline`,
    );
    return suffix;
  });

  const v103 = lineById(manifest.lines, 'V1-03');
  const v103Required = cueShape(v103).filter(({sourceTokenIds}) =>
    sourceTokenIds.some(
      (id) => id === 'V1-03-R05' || id === 'V1-03-R06',
    ),
  );
  requireCondition(
    sameJson(v103Required, REQUIRED_V103),
    'V1-03 backward sequence does not match the reviewed mapping',
  );
  const v108 = lineById(manifest.lines, 'V1-08');
  requireCondition(
    sameJson(cueShape(v108), REQUIRED_V108),
    'V1-08 backward sequence does not match the reviewed mapping',
  );

  let max60FpsErrorMs = 0;
  let max120FpsErrorMs = 0;
  let maxCueUncertaintySamples = 0;
  for (const line of manifest.lines) {
    for (const cue of line.cues) {
      maxCueUncertaintySamples = Math.max(
        maxCueUncertaintySamples,
        cue.uncertaintySamples,
      );
      for (const sample of [cue.startSample, cue.endSample]) {
        max60FpsErrorMs = Math.max(
          max60FpsErrorMs,
          Math.abs(
            frameErrorMs(
              sample,
              frameForSample(sample, PUBLIC_FPS),
              PUBLIC_FPS,
            ),
          ),
        );
        max120FpsErrorMs = Math.max(
          max120FpsErrorMs,
          Math.abs(
            frameErrorMs(
              sample,
              frameForSample(sample, PROOF_FPS),
              PROOF_FPS,
            ),
          ),
        );
      }
    }
  }
  requireCondition(
    max60FpsErrorMs <= 8.334,
    '60 fps cue frame error exceeds bound',
  );
  requireCondition(
    max120FpsErrorMs <= 4.167,
    '120 fps cue frame error exceeds bound',
  );

  return {
    status: 'ok',
    lineCount: manifest.lines.length,
    sourceTokenCount: actualSourceTokenIds.length,
    cueCount: manifest.lines.reduce(
      (count, line) => count + line.cues.length,
      0,
    ),
    targetSegmentCount: segmentIds.length,
    missingSourceTokenCount: missingSourceTokenIds.length,
    missingSourceTokenIds,
    unknownSourceTokenCount: unknownSourceTokenIds.length,
    unknownSourceTokenIds,
    unknownTargetCount: unknownTargetIds.length,
    unknownTargetIds,
    untargetedSegmentCount: untargetedSegmentIds.length,
    duplicateTargetCount: duplicateTargetIds.length,
    forbiddenProportionalEvidenceCount,
    unresolvedReviewCount: unresolvedTokenIds.length,
    unresolvedTokenIds,
    ...evidencePolicy,
    cueReferencedSourceTokenCount: cueReferencedSourceIdSet.size,
    semanticallyUnmappedSourceTokenIds,
    independentlyTimedChoruses: 2,
    independentChorusPairCount: distinctChorusLineIds.length,
    independentChorusLineIds: distinctChorusLineIds,
    independentChorusLiteralPairCount: literalPairIds.size,
    independentChorusLiteralTokenCount,
    independentChorusManualReviewBoundaryCount:
      independentChorusLiteralTokenCount * 2,
    independentChorusLiteralEvidence: CHORUS_REVIEW_FIXTURES,
    backwardSequences: {
      'V1-03': v103Required,
      'V1-08': cueShape(v108),
    },
    maxCueUncertaintySamples,
    maxCueUncertaintyMs: Number(
      ((maxCueUncertaintySamples / SAMPLE_RATE) * 1000).toFixed(6),
    ),
    frameBounds: {
      '60fps': {
        maximumMs: 8.334,
        observedMaximumMs: Number(max60FpsErrorMs.toFixed(6)),
      },
      '120fps': {
        maximumMs: 4.167,
        observedMaximumMs: Number(max120FpsErrorMs.toFixed(6)),
      },
    },
  };
};

const entryPoint = process.argv[1];
if (
  entryPoint !== undefined &&
  resolve(entryPoint) ===
    resolve(process.cwd(), '.tools-dist', 'scripts', 'verify-alignment.js')
) {
  const manifestPath = resolve(
    process.cwd(),
    'alignment',
    'tanisea-word-alignment-v3.json',
  );
  const rawManifest: unknown = JSON.parse(readFileSync(manifestPath, 'utf8'));
  console.log(JSON.stringify(verifyAlignmentManifest(rawManifest), null, 2));
}
