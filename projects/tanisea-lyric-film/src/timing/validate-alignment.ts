import {
  frameErrorMs,
  frameForSample,
  PROOF_FPS,
  PUBLIC_FPS,
  SAMPLE_RATE,
  type AlignmentManifest,
} from './alignment-types.js';

const LOCKED_SOURCE_SHA256 =
  '93084f293d491da1519732f3fa3cf6416c783d04e8ca18b5569c7608a8d4540d';
const LOCKED_DECODED_SAMPLES_PER_CHANNEL = 6_747_584;
const REQUIRED_LINE_COUNT = 24;
const MANUAL_REVIEW_THRESHOLD_SAMPLES = (SAMPLE_RATE * 25) / 1000;
const MAX_UNCERTAINTY_SAMPLES = (SAMPLE_RATE * 50) / 1000;

const CONFIDENCE_VALUES = new Set(['high', 'medium', 'low']);
const EVIDENCE_METHODS = new Set([
  'mfa',
  'whisperx',
  'waveform',
  'spectrogram',
  'manual-review',
]);
const ACTIVATION_VALUES = new Set([
  'forward',
  'backward',
  'repeat',
  'simultaneous',
  'hold',
]);

const assertInteger: (
  value: unknown,
  label: string,
) => asserts value is number = (value, label) => {
  if (!Number.isInteger(value) || (value as number) < 0) {
    throw new Error(`${label} must be a non-negative integer sample index`);
  }
};

const requireRecord = (
  value: unknown,
  label: string,
): Record<string, unknown> => {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    throw new Error(`${label} must be an object`);
  }
  return value as Record<string, unknown>;
};

const requireArray = (value: unknown, label: string): unknown[] => {
  if (!Array.isArray(value)) {
    throw new Error(`${label} must be an array`);
  }
  return value;
};

const requireNonEmptyString = (value: unknown, label: string): string => {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new Error(`${label} must be a non-empty string`);
  }
  return value;
};

const requireEnumValue = (
  value: unknown,
  allowed: ReadonlySet<string>,
  label: string,
): string => {
  if (typeof value !== 'string' || !allowed.has(value)) {
    throw new Error(`${label} is not an allowed value`);
  }
  return value;
};

const assertFrameBounds = (sample: number, label: string): void => {
  const cadences = [
    {fps: PUBLIC_FPS, maximumErrorMs: 8.334},
    {fps: PROOF_FPS, maximumErrorMs: 4.167},
  ] as const;

  for (const {fps, maximumErrorMs} of cadences) {
    const frame = frameForSample(sample, fps);
    const errorMs = Math.abs(frameErrorMs(sample, frame, fps));
    if (!Number.isFinite(errorMs) || errorMs > maximumErrorMs) {
      throw new Error(
        `${label} exceeds the ${fps} fps frame-error bound of ${maximumErrorMs} ms`,
      );
    }
  }
};

const requireSample = (
  value: unknown,
  label: string,
  decodedSamplesPerChannel: number,
): number => {
  assertInteger(value, label);
  if (value > decodedSamplesPerChannel) {
    throw new Error(`${label} exceeds decodedSamplesPerChannel`);
  }
  assertFrameBounds(value, label);
  return value;
};

const requireUncertainty = (value: unknown, label: string): number => {
  assertInteger(value, label);
  if (value > MAX_UNCERTAINTY_SAMPLES) {
    throw new Error(`${label} exceeds the absolute 50 ms uncertainty ceiling`);
  }
  return value;
};

const addUniqueId = (ids: Set<string>, id: string, label: string): void => {
  if (ids.has(id)) {
    throw new Error(`duplicate ${label} ID: ${id}`);
  }
  ids.add(id);
};

const validateLine = (
  value: unknown,
  lineIndex: number,
  decodedSamplesPerChannel: number,
): string => {
  const label = `lines[${lineIndex}]`;
  const line = requireRecord(value, label);
  const lineId = requireNonEmptyString(line.id, `${label}.id`);
  requireNonEmptyString(line.sourceText, `${label}.sourceText`);

  const vocalStartSample = requireSample(
    line.vocalStartSample,
    `${label}.vocalStartSample`,
    decodedSamplesPerChannel,
  );
  const vocalEndSample = requireSample(
    line.vocalEndSample,
    `${label}.vocalEndSample`,
    decodedSamplesPerChannel,
  );
  if (vocalEndSample <= vocalStartSample) {
    throw new Error(`${label} vocal interval must have positive duration`);
  }

  const tokens = requireArray(line.tokens, `${label}.tokens`);
  const segments = requireArray(line.segments, `${label}.segments`);
  const cues = requireArray(line.cues, `${label}.cues`);
  if (tokens.length === 0) {
    throw new Error(`${label}.tokens must be non-empty`);
  }
  if (segments.length === 0) {
    throw new Error(`${label}.segments must be non-empty`);
  }

  const tokenIds = new Set<string>();
  let previousTokenEndSample: number | undefined;

  for (const [tokenIndex, tokenValue] of tokens.entries()) {
    const tokenLabel = `${label}.tokens[${tokenIndex}]`;
    const token = requireRecord(tokenValue, tokenLabel);
    const tokenId = requireNonEmptyString(token.id, `${tokenLabel}.id`);
    addUniqueId(tokenIds, tokenId, 'token');
    requireNonEmptyString(token.text, `${tokenLabel}.text`);
    requireEnumValue(token.confidence, CONFIDENCE_VALUES, `${tokenLabel}.confidence`);

    const startSample = requireSample(
      token.startSample,
      `${tokenLabel}.startSample`,
      decodedSamplesPerChannel,
    );
    const endSample = requireSample(
      token.endSample,
      `${tokenLabel}.endSample`,
      decodedSamplesPerChannel,
    );
    if (endSample <= startSample) {
      throw new Error(`${tokenLabel} token interval must have positive duration`);
    }
    if (startSample < vocalStartSample || endSample > vocalEndSample) {
      throw new Error(`${tokenLabel} must be contained within its line vocal window`);
    }
    if (
      previousTokenEndSample !== undefined &&
      startSample < previousTokenEndSample
    ) {
      throw new Error(
        `${label} token intervals must be ordered and non-overlapping`,
      );
    }
    previousTokenEndSample = endSample;

    const uncertaintySamples = requireUncertainty(
      token.uncertaintySamples,
      `${tokenLabel}.uncertaintySamples`,
    );
    const evidence = requireArray(token.evidence, `${tokenLabel}.evidence`);
    if (evidence.length === 0) {
      throw new Error(`${tokenLabel} requires non-empty evidence`);
    }

    let hasManualReview = false;
    for (const [evidenceIndex, evidenceValue] of evidence.entries()) {
      const evidenceLabel = `${tokenLabel}.evidence[${evidenceIndex}]`;
      const evidenceRecord = requireRecord(evidenceValue, evidenceLabel);
      if (evidenceRecord.method === 'proportional') {
        throw new Error(`${evidenceLabel} uses forbidden proportional timing`);
      }
      const method = requireEnumValue(
        evidenceRecord.method,
        EVIDENCE_METHODS,
        `${evidenceLabel}.method`,
      );
      hasManualReview ||= method === 'manual-review';
      requireSample(
        evidenceRecord.sampleIndex,
        `${evidenceLabel}.sampleIndex`,
        decodedSamplesPerChannel,
      );
      requireNonEmptyString(evidenceRecord.note, `${evidenceLabel}.note`);
    }

    if (
      uncertaintySamples > MANUAL_REVIEW_THRESHOLD_SAMPLES &&
      !hasManualReview
    ) {
      throw new Error(
        `${tokenLabel} uncertainty over 25 ms requires manual-review evidence`,
      );
    }
  }

  const segmentIds = new Set<string>();
  for (const [segmentIndex, segmentValue] of segments.entries()) {
    const segmentLabel = `${label}.segments[${segmentIndex}]`;
    const segment = requireRecord(segmentValue, segmentLabel);
    const segmentId = requireNonEmptyString(segment.id, `${segmentLabel}.id`);
    addUniqueId(segmentIds, segmentId, 'segment');
    requireNonEmptyString(segment.text, `${segmentLabel}.text`);
  }

  const cueIds = new Set<string>();
  for (const [cueIndex, cueValue] of cues.entries()) {
    const cueLabel = `${label}.cues[${cueIndex}]`;
    const cue = requireRecord(cueValue, cueLabel);
    const cueId = requireNonEmptyString(cue.id, `${cueLabel}.id`);
    addUniqueId(cueIds, cueId, 'cue');

    const startSample = requireSample(
      cue.startSample,
      `${cueLabel}.startSample`,
      decodedSamplesPerChannel,
    );
    const endSample = requireSample(
      cue.endSample,
      `${cueLabel}.endSample`,
      decodedSamplesPerChannel,
    );
    if (endSample <= startSample) {
      throw new Error(`${cueLabel} cue interval must have positive duration`);
    }
    if (startSample < vocalStartSample || endSample > vocalEndSample) {
      throw new Error(`${cueLabel} must be contained within its line vocal window`);
    }

    requireEnumValue(cue.activation, ACTIVATION_VALUES, `${cueLabel}.activation`);
    requireEnumValue(cue.confidence, CONFIDENCE_VALUES, `${cueLabel}.confidence`);
    requireUncertainty(cue.uncertaintySamples, `${cueLabel}.uncertaintySamples`);
    requireNonEmptyString(cue.mappingNote, `${cueLabel}.mappingNote`);

    const sourceTokenIds = requireArray(
      cue.sourceTokenIds,
      `${cueLabel}.sourceTokenIds`,
    );
    if (sourceTokenIds.length === 0) {
      throw new Error(`${cueLabel} must reference at least one source token`);
    }
    for (const [sourceIndex, sourceValue] of sourceTokenIds.entries()) {
      const sourceId = requireNonEmptyString(
        sourceValue,
        `${cueLabel}.sourceTokenIds[${sourceIndex}]`,
      );
      if (!tokenIds.has(sourceId)) {
        throw new Error(`${cueLabel} references unknown source token ${sourceId}`);
      }
    }

    const targets = requireArray(cue.targets, `${cueLabel}.targets`);
    if (targets.length === 0) {
      throw new Error(`${cueLabel} must reference at least one target segment`);
    }
    for (const [targetIndex, targetValue] of targets.entries()) {
      const targetId = requireNonEmptyString(
        targetValue,
        `${cueLabel}.targets[${targetIndex}]`,
      );
      if (!segmentIds.has(targetId)) {
        throw new Error(`${cueLabel} references unknown target segment ${targetId}`);
      }
    }
  }

  return lineId;
};

export function validateAlignmentManifest(
  manifest: unknown,
): asserts manifest is AlignmentManifest {
  const value = requireRecord(manifest, 'alignment manifest');

  if (value.schemaVersion !== 3) {
    throw new Error('schemaVersion must be exactly 3');
  }
  if (value.sourceSha256 !== LOCKED_SOURCE_SHA256) {
    throw new Error('sourceSha256 does not match the locked soundtrack');
  }
  if (value.sampleRate !== SAMPLE_RATE) {
    throw new Error(`sampleRate must be exactly ${SAMPLE_RATE}`);
  }

  assertInteger(value.decodedSamplesPerChannel, 'decodedSamplesPerChannel');
  if (
    value.decodedSamplesPerChannel !== LOCKED_DECODED_SAMPLES_PER_CHANNEL
  ) {
    throw new Error(
      `decodedSamplesPerChannel must be exactly ${LOCKED_DECODED_SAMPLES_PER_CHANNEL}`,
    );
  }

  const lines = requireArray(value.lines, 'lines');
  const lineIds = new Set<string>();
  for (const [lineIndex, line] of lines.entries()) {
    const lineId = validateLine(
      line,
      lineIndex,
      value.decodedSamplesPerChannel,
    );
    addUniqueId(lineIds, lineId, 'line');
  }

  if (lines.length !== REQUIRED_LINE_COUNT) {
    throw new Error(
      `alignment manifest must contain exactly ${REQUIRED_LINE_COUNT} lines`,
    );
  }
}
