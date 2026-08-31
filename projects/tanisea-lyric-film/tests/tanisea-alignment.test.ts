import {describe, expect, test} from 'vitest';
import {taniseaAlignment} from '../src/timing/tanisea-alignment';
import {validateAlignmentManifest} from '../src/timing/validate-alignment';

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

    const first = taniseaAlignment.lines.find(({id}) => id === 'C1-01')!;
    const second = taniseaAlignment.lines.find(({id}) => id === 'C2-01')!;
    expect(
      first.tokens.map(({startSample, endSample}) => [startSample, endSample]),
    ).toEqual([
      [1_066_955, 1_070_483],
      [1_073_129, 1_077_539],
      [1_081_067, 1_097_825],
      [1_100_471, 1_124_991],
    ]);
    expect(
      second.tokens.map(({startSample, endSample}) => [startSample, endSample]),
    ).toEqual([
      [4_031_225, 4_033_871],
      [4_035_635, 4_039_163],
      [4_040_045, 4_061_213],
      [4_062_977, 4_169_743],
    ]);
    expect(
      first.tokens[0]?.evidence.some(
        ({method, sampleIndex}) =>
          method === 'manual-review' && sampleIndex === 1_066_955,
      ),
    ).toBe(true);
    expect(
      second.tokens[0]?.evidence.some(
        ({method, sampleIndex}) =>
          method === 'manual-review' && sampleIndex === 4_031_225,
      ),
    ).toBe(true);
    const normalizedFirst = first.cues.map(
      (cue) =>
        (cue.startSample - first.vocalStartSample) /
        (first.vocalEndSample - first.vocalStartSample),
    );
    const normalizedSecond = second.cues.map(
      (cue) =>
        (cue.startSample - second.vocalStartSample) /
        (second.vocalEndSample - second.vocalStartSample),
    );
    expect(normalizedSecond).not.toEqual(normalizedFirst);
  });

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
