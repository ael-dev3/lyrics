export const SAMPLE_RATE = 44_100 as const;
export const PUBLIC_FPS = 60 as const;
export const PROOF_FPS = 120 as const;

export type Confidence = 'high' | 'medium' | 'low';
export type EvidenceMethod =
  | 'mfa'
  | 'whisperx'
  | 'waveform'
  | 'spectrogram'
  | 'manual-review';

export type AlignmentEvidence = Readonly<{
  method: EvidenceMethod;
  sampleIndex: number;
  note: string;
}>;

export type SourceToken = Readonly<{
  id: string;
  text: string;
  startSample: number;
  endSample: number;
  confidence: Confidence;
  uncertaintySamples: number;
  evidence: readonly AlignmentEvidence[];
}>;

export type LyricSegment = Readonly<{id: string; text: string}>;

export type SemanticCue = Readonly<{
  id: string;
  startSample: number;
  endSample: number;
  sourceTokenIds: readonly string[];
  targets: readonly string[];
  activation: 'forward' | 'backward' | 'repeat' | 'simultaneous' | 'hold';
  confidence: Confidence;
  uncertaintySamples: number;
  mappingNote: string;
}>;

export type AlignedLyricLine = Readonly<{
  id: string;
  sourceText: string;
  vocalStartSample: number;
  vocalEndSample: number;
  tokens: readonly SourceToken[];
  segments: readonly LyricSegment[];
  cues: readonly SemanticCue[];
}>;

export type AlignmentManifest = Readonly<{
  schemaVersion: 3;
  sourceSha256: string;
  sampleRate: typeof SAMPLE_RATE;
  decodedSamplesPerChannel: number;
  lines: readonly AlignedLyricLine[];
}>;

export const frameForSample = (sample: number, fps: number): number =>
  Math.round((sample * fps) / SAMPLE_RATE);

export const frameErrorMs = (sample: number, frame: number, fps: number): number =>
  (frame / fps - sample / SAMPLE_RATE) * 1000;
