import {describe, expect, test} from 'vitest';
import {
  frameErrorMs,
  frameForSample,
  SAMPLE_RATE,
} from '../src/timing/alignment-types';
import {validateAlignmentManifest} from '../src/timing/validate-alignment';

describe('sample-indexed alignment contract', () => {
  test('maps samples to bounded nearest frames', () => {
    const sample = 3_889_431;
    const frame60 = frameForSample(sample, 60);
    const frame120 = frameForSample(sample, 120);
    expect(Math.abs(frameErrorMs(sample, frame60, 60))).toBeLessThanOrEqual(8.334);
    expect(Math.abs(frameErrorMs(sample, frame120, 120))).toBeLessThanOrEqual(4.167);
    expect(SAMPLE_RATE).toBe(44_100);
  });

  test('rejects proportional timing and unresolved evidence spread', () => {
    expect(() =>
      validateAlignmentManifest({
        schemaVersion: 3,
        sourceSha256: '93084f293d491da1519732f3fa3cf6416c783d04e8ca18b5569c7608a8d4540d',
        sampleRate: 44_100,
        decodedSamplesPerChannel: 6_747_584,
        lines: [{
          id: 'C1-01',
          sourceText: 'А я сотру горизонт',
          vocalStartSample: 1_071_189,
          vocalEndSample: 1_206_576,
          tokens: [{
            id: 'C1-01-R01', text: 'А', startSample: 1_071_189,
            endSample: 1_080_000, confidence: 'high', uncertaintySamples: 500,
            evidence: [{method: 'proportional', sampleIndex: 1_071_189, note: 'invalid'}],
          }],
          segments: [{id: 'C1-01-S01', text: "And I'll erase"}],
          cues: [],
        }],
      }),
    ).toThrow(/proportional/);
  });
});

const LOCKED_SOURCE_SHA256 =
  '93084f293d491da1519732f3fa3cf6416c783d04e8ca18b5569c7608a8d4540d';

const makeValidManifest = () => ({
  schemaVersion: 3,
  sourceSha256: LOCKED_SOURCE_SHA256,
  sampleRate: 44_100,
  decodedSamplesPerChannel: 6_747_584,
  lines: Array.from({length: 24}, (_, index) => {
    const lineId = `L${String(index + 1).padStart(2, '0')}`;
    const vocalStartSample = 1_000 + index * 250_000;
    const vocalEndSample = vocalStartSample + 100_000;
    const firstTokenId = `${lineId}-R01`;
    const secondTokenId = `${lineId}-R02`;
    const firstSegmentId = `${lineId}-S01`;

    return {
      id: lineId,
      sourceText: `Russian line ${index + 1}`,
      vocalStartSample,
      vocalEndSample,
      tokens: [
        {
          id: firstTokenId,
          text: 'source-one',
          startSample: vocalStartSample,
          endSample: vocalStartSample + 20_000,
          confidence: 'high',
          uncertaintySamples: 500,
          evidence: [{
            method: 'mfa',
            sampleIndex: vocalStartSample,
            note: 'forced alignment boundary',
          }],
        },
        {
          id: secondTokenId,
          text: 'source-two',
          startSample: vocalStartSample + 20_000,
          endSample: vocalStartSample + 40_000,
          confidence: 'medium',
          uncertaintySamples: 800,
          evidence: [{
            method: 'waveform',
            sampleIndex: vocalStartSample + 20_000,
            note: 'waveform boundary',
          }],
        },
      ],
      segments: [
        {id: firstSegmentId, text: 'English one'},
        {id: `${lineId}-S02`, text: 'English two'},
      ],
      cues: [{
        id: `${lineId}-C01`,
        startSample: vocalStartSample,
        endSample: vocalStartSample + 20_000,
        sourceTokenIds: [firstTokenId],
        targets: [firstSegmentId],
        activation: 'forward',
        confidence: 'high',
        uncertaintySamples: 500,
        mappingNote: 'direct semantic mapping',
      }],
    };
  }),
});

type TestManifest = ReturnType<typeof makeValidManifest>;
type ManifestMutation = (manifest: TestManifest) => void;

describe('alignment manifest runtime validation', () => {
  test('accepts a complete valid manifest', () => {
    expect(() => validateAlignmentManifest(makeValidManifest())).not.toThrow();
  });

  test.each<[string, ManifestMutation, RegExp]>([
    ['schema version', (manifest) => {
      manifest.schemaVersion = 2;
    }, /schemaVersion/],
    ['source hash', (manifest) => {
      manifest.sourceSha256 = 'not-the-locked-source';
    }, /sourceSha256/],
    ['sample rate', (manifest) => {
      manifest.sampleRate = 48_000;
    }, /sampleRate/],
    ['decoded sample count', (manifest) => {
      manifest.decodedSamplesPerChannel = 6_747_583;
    }, /decodedSamplesPerChannel/],
  ])('rejects a mismatched %s', (_label, mutate, error) => {
    const manifest = makeValidManifest();
    mutate(manifest);
    expect(() => validateAlignmentManifest(manifest)).toThrow(error);
  });

  test('requires exactly 24 lines after validating supplied lines', () => {
    const manifest = makeValidManifest();
    manifest.lines.pop();
    expect(() => validateAlignmentManifest(manifest)).toThrow(/exactly 24 lines/);
  });

  test('rejects duplicate line IDs', () => {
    const manifest = makeValidManifest();
    manifest.lines[1]!.id = manifest.lines[0]!.id;
    expect(() => validateAlignmentManifest(manifest)).toThrow(/line ID/);
  });

  test.each<[string, ManifestMutation]>([
    ['token', (manifest) => {
      manifest.lines[0]!.tokens[1]!.id = manifest.lines[0]!.tokens[0]!.id;
    }],
    ['segment', (manifest) => {
      manifest.lines[0]!.segments[1]!.id = manifest.lines[0]!.segments[0]!.id;
    }],
    ['cue', (manifest) => {
      const cue = manifest.lines[0]!.cues[0]!;
      manifest.lines[0]!.cues.push({...cue});
    }],
  ])('rejects duplicate %s IDs inside a line', (_kind, mutate) => {
    const manifest = makeValidManifest();
    mutate(manifest);
    expect(() => validateAlignmentManifest(manifest)).toThrow(/duplicate/);
  });

  test('rejects reversed and overlapping token intervals', () => {
    const reversed = makeValidManifest();
    reversed.lines[0]!.tokens[0]!.endSample =
      reversed.lines[0]!.tokens[0]!.startSample;
    expect(() => validateAlignmentManifest(reversed)).toThrow(/token interval/);

    const overlapping = makeValidManifest();
    overlapping.lines[0]!.tokens[1]!.startSample =
      overlapping.lines[0]!.tokens[0]!.endSample - 1;
    expect(() => validateAlignmentManifest(overlapping)).toThrow(/overlap/);
  });

  test.each<[string, ManifestMutation, RegExp]>([
    ['outside its vocal window', (manifest) => {
      manifest.lines[0]!.cues[0]!.startSample =
        manifest.lines[0]!.vocalStartSample - 1;
    }, /vocal window/],
    ['with an unknown source token', (manifest) => {
      manifest.lines[0]!.cues[0]!.sourceTokenIds = ['unknown-token'];
    }, /source token/],
    ['with an unknown target segment', (manifest) => {
      manifest.lines[0]!.cues[0]!.targets = ['unknown-segment'];
    }, /target segment/],
  ])('rejects a cue %s', (_label, mutate, error) => {
    const manifest = makeValidManifest();
    mutate(manifest);
    expect(() => validateAlignmentManifest(manifest)).toThrow(error);
  });

  test('requires evidence for every token', () => {
    const manifest = makeValidManifest();
    manifest.lines[0]!.tokens[0]!.evidence = [];
    expect(() => validateAlignmentManifest(manifest)).toThrow(/non-empty evidence/);
  });

  test('requires manual review above 25 ms uncertainty', () => {
    const manifest = makeValidManifest();
    manifest.lines[0]!.tokens[0]!.uncertaintySamples = 1_103;
    expect(() => validateAlignmentManifest(manifest)).toThrow(/manual-review/);
  });

  test('enforces an inclusive 50 ms uncertainty ceiling', () => {
    const accepted = makeValidManifest();
    accepted.lines[0]!.tokens[0]!.uncertaintySamples = 2_205;
    accepted.lines[0]!.tokens[0]!.evidence.push({
      method: 'manual-review',
      sampleIndex: accepted.lines[0]!.tokens[0]!.startSample,
      note: 'resolved reverberant boundary',
    });
    expect(() => validateAlignmentManifest(accepted)).not.toThrow();

    const rejected = makeValidManifest();
    rejected.lines[0]!.tokens[0]!.uncertaintySamples = 2_206;
    rejected.lines[0]!.tokens[0]!.evidence.push({
      method: 'manual-review',
      sampleIndex: rejected.lines[0]!.tokens[0]!.startSample,
      note: 'spread remains unresolved',
    });
    expect(() => validateAlignmentManifest(rejected)).toThrow(/50 ms/);
  });

  test.each<[string, ManifestMutation]>([
    ['line boundary', (manifest) => {
      manifest.lines[0]!.vocalStartSample = -1;
    }],
    ['token boundary', (manifest) => {
      manifest.lines[0]!.tokens[0]!.startSample += 0.5;
    }],
    ['evidence boundary', (manifest) => {
      manifest.lines[0]!.tokens[0]!.evidence[0]!.sampleIndex = -1;
    }],
    ['cue boundary', (manifest) => {
      manifest.lines[0]!.cues[0]!.endSample += 0.5;
    }],
  ])('rejects a non-integer or negative %s', (_label, mutate) => {
    const manifest = makeValidManifest();
    mutate(manifest);
    expect(() => validateAlignmentManifest(manifest)).toThrow(
      /non-negative integer sample index/,
    );
  });
});
