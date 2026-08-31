import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';

import {
  frameErrorMs,
  frameForSample,
  PROOF_FPS,
  PUBLIC_FPS,
  SAMPLE_RATE,
  type AlignedLyricLine,
} from '../src/timing/alignment-types.js';
import {validateAlignmentManifest} from '../src/timing/validate-alignment.js';

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

const EXPECTED_FIRST_CHORUS_LINE = [
  [1_066_955, 1_070_483],
  [1_073_129, 1_077_539],
  [1_081_067, 1_097_825],
  [1_100_471, 1_124_991],
] as const;

const EXPECTED_SECOND_CHORUS_LINE = [
  [4_031_225, 4_033_871],
  [4_035_635, 4_039_163],
  [4_040_045, 4_061_213],
  [4_062_977, 4_169_743],
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
): AlignedLyricLine => lines.find((line) => line.id === id) ?? fail(`missing line ${id}`);

const tokenIntervals = (line: AlignedLyricLine): readonly (readonly number[])[] =>
  line.tokens.map(({startSample, endSample}) => [startSample, endSample]);

const relativeTokenTimeline = (line: AlignedLyricLine): readonly number[] =>
  line.tokens.flatMap(({startSample, endSample}) => [
    startSample - line.vocalStartSample,
    endSample - line.vocalStartSample,
  ]);

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
      normalizedKey.includes('proportional') || normalizedKey.includes('normalized');
    return (
      count +
      (forbiddenKey ? 1 : 0) +
      countForbiddenProportionalFields(item)
    );
  }, 0);
};

const manifestPath = resolve(
  process.cwd(),
  'alignment',
  'tanisea-word-alignment-v3.json',
);
const rawManifest: unknown = JSON.parse(readFileSync(manifestPath, 'utf8'));
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
requireCondition(actualSourceTokenIds.length === 102, 'source token count is not 102');
requireCondition(missingSourceTokenIds.length === 0, 'source token inventory is incomplete');
requireCondition(unknownSourceTokenIds.length === 0, 'unknown source token IDs exist');

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
requireCondition(unknownTargetIds.length === 0, 'unknown cue target IDs exist');
requireCondition(untargetedSegmentIds.length === 0, 'untargeted semantic segments exist');
requireCondition(duplicateTargetIds.length === 0, 'semantic targets are not one-to-one');

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
        token.uncertaintySamples > SAMPLE_RATE * 0.05 ||
        !token.evidence.some(({method}) => method === 'manual-review'),
    )
    .map(({id}) => id),
);
requireCondition(unresolvedTokenIds.length === 0, 'unresolved token reviews exist');

const firstLiteralLine = lineById(manifest.lines, 'C1-01');
const secondLiteralLine = lineById(manifest.lines, 'C2-01');
requireCondition(
  sameJson(tokenIntervals(firstLiteralLine), EXPECTED_FIRST_CHORUS_LINE),
  'C1-01 differs from its literal reviewed samples',
);
requireCondition(
  sameJson(tokenIntervals(secondLiteralLine), EXPECTED_SECOND_CHORUS_LINE),
  'C2-01 differs from its literal reviewed samples',
);
requireCondition(
  firstLiteralLine.tokens[0]?.evidence.some(
    ({method, sampleIndex}) =>
      method === 'manual-review' && sampleIndex === 1_066_955,
  ) === true,
  'C1-01 literal manual-review evidence is missing',
);
requireCondition(
  secondLiteralLine.tokens[0]?.evidence.some(
    ({method, sampleIndex}) =>
      method === 'manual-review' && sampleIndex === 4_031_225,
  ) === true,
  'C2-01 literal manual-review evidence is missing',
);
const distinctChorusLineIds = Array.from({length: 8}, (_, index) => {
  const suffix = String(index + 1).padStart(2, '0');
  const first = lineById(manifest.lines, `C1-${suffix}`);
  const second = lineById(manifest.lines, `C2-${suffix}`);
  requireCondition(
    !sameJson(relativeTokenTimeline(first), relativeTokenTimeline(second)),
    `chorus line ${suffix} reuses a line-relative token timeline`,
  );
  return suffix;
});

const v103 = lineById(manifest.lines, 'V1-03');
const v103Required = cueShape(v103).filter(({sourceTokenIds}) =>
  sourceTokenIds.some((id) => id === 'V1-03-R05' || id === 'V1-03-R06'),
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
        Math.abs(frameErrorMs(sample, frameForSample(sample, PUBLIC_FPS), PUBLIC_FPS)),
      );
      max120FpsErrorMs = Math.max(
        max120FpsErrorMs,
        Math.abs(frameErrorMs(sample, frameForSample(sample, PROOF_FPS), PROOF_FPS)),
      );
    }
  }
}
requireCondition(max60FpsErrorMs <= 8.334, '60 fps cue frame error exceeds bound');
requireCondition(max120FpsErrorMs <= 4.167, '120 fps cue frame error exceeds bound');

const summary = {
  status: 'ok',
  lineCount: manifest.lines.length,
  sourceTokenCount: actualSourceTokenIds.length,
  cueCount: manifest.lines.reduce((count, line) => count + line.cues.length, 0),
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
  cueReferencedSourceTokenCount: cueReferencedSourceIdSet.size,
  semanticallyUnmappedSourceTokenIds,
  independentlyTimedChoruses: 2,
  independentChorusPairCount: distinctChorusLineIds.length,
  independentChorusLineIds: distinctChorusLineIds,
  independentChorusLiteralEvidence: {
    'C1-01': EXPECTED_FIRST_CHORUS_LINE,
    'C2-01': EXPECTED_SECOND_CHORUS_LINE,
  },
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

console.log(JSON.stringify(summary, null, 2));
