import {describe, expect, test} from 'vitest';
import * as verifierModule from '../scripts/verify-alignment';
import {taniseaAlignment} from '../src/timing/tanisea-alignment';
import {validateAlignmentManifest} from '../src/timing/validate-alignment';

type ReviewedTokenFixture = readonly [
  tokenId: string,
  startSample: number,
  endSample: number,
  manualOnsetSample: number,
  manualOffsetSample: number,
];

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

const CHORUS_MUTATION_LINE_IDS = [
  'C1-01',
  'C2-01',
  'C1-02',
  'C2-02',
  'C1-03',
  'C2-03',
  'C1-04',
  'C2-04',
  'C1-05',
  'C2-05',
  'C1-06',
  'C2-06',
  'C1-07',
  'C2-07',
  'C1-08',
  'C2-08',
] as const;

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

type MutableEvidence = {
  method: string;
  sampleIndex: number;
  note: string;
};

type MutableToken = {
  id: string;
  startSample: number;
  endSample: number;
  evidence: MutableEvidence[];
};

type MutableLine = {
  id: string;
  tokens: MutableToken[];
};

type MutableManifest = {
  lines: MutableLine[];
};

type BlockingVerifier = (manifest: unknown) => unknown;

const getBlockingVerifier = (): BlockingVerifier => {
  const candidate = (verifierModule as unknown as Record<string, unknown>)[
    'verifyAlignmentManifest'
  ];
  if (typeof candidate !== 'function') {
    throw new Error(
      'verify-alignment.ts does not export verifyAlignmentManifest',
    );
  }
  return candidate as BlockingVerifier;
};

const cloneManifest = (): MutableManifest =>
  structuredClone(taniseaAlignment) as unknown as MutableManifest;

const findMutableToken = (
  manifest: MutableManifest,
  tokenId: string,
): MutableToken => {
  for (const line of manifest.lines) {
    const token = line.tokens.find(({id}) => id === tokenId);
    if (token) return token;
  }
  throw new Error(`test fixture cannot find token ${tokenId}`);
};

describe('Tanisea reviewed alignment', () => {
  test('contains 24 independently timed lines and all 102 performed tokens', () => {
    expect(() => validateAlignmentManifest(taniseaAlignment)).not.toThrow();
    expect(taniseaAlignment.lines).toHaveLength(24);
    expect(
      taniseaAlignment.lines.reduce(
        (tokenCount, line) => tokenCount + line.tokens.length,
        0,
      ),
    ).toBe(102);
  });

  test('pins literal token intervals and manual-review boundaries for all eight chorus pairs', () => {
    expect(Object.keys(CHORUS_REVIEW_FIXTURES)).toHaveLength(16);
    expect(
      Object.values(CHORUS_REVIEW_FIXTURES).reduce(
        (count, fixtures) => count + fixtures.length,
        0,
      ),
    ).toBe(58);

    for (const [lineId, fixtures] of Object.entries(
      CHORUS_REVIEW_FIXTURES,
    )) {
      const line = taniseaAlignment.lines.find(({id}) => id === lineId);
      expect(line, `missing reviewed chorus line ${lineId}`).toBeDefined();
      if (!line) continue;

      expect(
        line.tokens.map(({id, startSample, endSample}) => [
          id,
          startSample,
          endSample,
        ]),
        `${lineId} selected token intervals`,
      ).toEqual(fixtures.map(([id, start, end]) => [id, start, end]));

      for (const [
        tokenId,
        ,
        ,
        manualOnsetSample,
        manualOffsetSample,
      ] of fixtures) {
        const token = line.tokens.find(({id}) => id === tokenId);
        expect(token, `missing reviewed token ${tokenId}`).toBeDefined();
        expect(
          token?.evidence
            .filter(({method}) => method === 'manual-review')
            .map(({sampleIndex}) => sampleIndex)
            .sort((left, right) => left - right),
          `${tokenId} manual-review evidence identifiers/samples`,
        ).toEqual([manualOnsetSample, manualOffsetSample]);
      }
    }
  });

  test('blocking verifier reports the complete evidence exception categories', () => {
    expect(getBlockingVerifier()(taniseaAlignment)).toMatchObject({
      evidencePolicyViolationCount: 0,
      mfaBackedTokenCount: 81,
      mfaMissingTokenCount: 21,
      mfaMissingTokenIds: EXPECTED_MFA_MISSING_TOKEN_IDS,
      methodSpreadOver25MsTokenCount: 80,
      maximumMethodSpreadSamples: 161_803,
      selectedBoundaryEvidenceTokenCount: 102,
      independentChorusLiteralPairCount: 8,
      independentChorusLiteralTokenCount: 58,
      independentChorusManualReviewBoundaryCount: 116,
    });
  });

  test.each(CHORUS_MUTATION_LINE_IDS)(
    'blocking verifier rejects arbitrary replacement timing for %s',
    (lineId) => {
      const mutated = cloneManifest();
      const line = mutated.lines.find(({id}) => id === lineId);
      if (!line?.tokens[0]) throw new Error(`missing mutation line ${lineId}`);
      const token = line.tokens[0];
      const reviewedStartSample = token.startSample;
      token.startSample += 1;
      for (const evidence of token.evidence) {
        if (
          ['waveform', 'spectrogram', 'manual-review'].includes(
            evidence.method,
          ) &&
          evidence.sampleIndex === reviewedStartSample
        ) {
          evidence.sampleIndex += 1;
        }
      }

      expect(() => getBlockingVerifier()(mutated)).toThrow(
        new RegExp(`${lineId}.*literal reviewed fixture`),
      );
    },
  );

  test('blocking verifier rejects missing waveform and spectrogram resolution on the maximum-spread token', () => {
    const mutated = cloneManifest();
    const token = findMutableToken(mutated, 'C2-08-R01');
    token.evidence = token.evidence.filter(
      ({method}) => method !== 'waveform' && method !== 'spectrogram',
    );

    expect(() => getBlockingVerifier()(mutated)).toThrow(
      /C2-08-R01.*candidate spread.*waveform.*spectrogram/,
    );
  });

  test('blocking verifier rejects fabricated MFA on a required no-MFA token', () => {
    const mutated = cloneManifest();
    const token = findMutableToken(mutated, 'C1-06-R01');
    token.evidence.push({
      method: 'mfa',
      sampleIndex: token.startSample,
      note: 'Fabricated MFA onset compared with the audible token boundary.',
    });

    expect(() => getBlockingVerifier()(mutated)).toThrow(
      /C1-06-R01.*must have zero MFA evidence records/,
    );
  });

  test.each(['waveform', 'spectrogram', 'manual-review'] as const)(
    'blocking verifier rejects a required no-MFA token missing selected %s offset evidence',
    (method) => {
      const mutated = cloneManifest();
      const token = findMutableToken(mutated, 'C2-07-R04');
      token.evidence = token.evidence.filter(
        (evidence) =>
          !(
            evidence.method === method &&
            evidence.sampleIndex === token.endSample
          ),
      );

      expect(() => getBlockingVerifier()(mutated)).toThrow(
        new RegExp(
          `C2-07-R04.*requires selected onset and offset ${method} evidence`,
        ),
      );
    },
  );

  test('encodes the two required backward semantic transitions', () => {
    const v103 = taniseaAlignment.lines.find(({id}) => id === 'V1-03')!;
    const v108 = taniseaAlignment.lines.find(({id}) => id === 'V1-08')!;

    expect(
      v103.cues.map(({sourceTokenIds, targets, activation}) => ({
        sourceTokenIds,
        targets,
        activation,
      })),
    ).toContainEqual({
      sourceTokenIds: ['V1-03-R05'],
      targets: ['V1-03-S03'],
      activation: 'forward',
    });
    expect(
      v103.cues.map(({sourceTokenIds, targets, activation}) => ({
        sourceTokenIds,
        targets,
        activation,
      })),
    ).toContainEqual({
      sourceTokenIds: ['V1-03-R06'],
      targets: ['V1-03-S02'],
      activation: 'backward',
    });
    expect(
      v108.cues.slice(0, 4).map(({sourceTokenIds, targets, activation}) => ({
        sourceTokenIds,
        targets,
        activation,
      })),
    ).toEqual([
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
    ]);
  });
});
