import {taniseaAlignment} from './timing/tanisea-alignment';
import {SAMPLE_RATE} from './timing/alignment-types';
import type {
  LyricSegment as ReviewedLyricSegment,
  SemanticCue,
} from './timing/alignment-types';

export type LyricSection = 'build' | 'chorus' | 'verse';
export type LyricSegment = ReviewedLyricSegment;

export type LyricLine = Readonly<{
  id: string;
  section: LyricSection;
  vocalStartSample: number;
  vocalEndSample: number;
  visualInStartSample: number;
  visualInCompleteSample: number;
  visualOutStartSample: number;
  visualOutEndSample: number;
  segments: readonly LyricSegment[];
  cues: readonly SemanticCue[];
  text: string;
  /** Sample-derived seconds retained for alignment preparation tooling. */
  vocalStart: number;
  /** Sample-derived seconds retained for alignment preparation tooling. */
  vocalEnd: number;
}>;

const VISUAL_LEAD_SAMPLES = Math.round(SAMPLE_RATE * 0.24);
const VISUAL_SETTLE_LEAD_SAMPLES = Math.round(SAMPLE_RATE * 0.05);
const VISUAL_TRAIL_SAMPLES = Math.round(SAMPLE_RATE * 0.05);

const sectionForLineId = (lineId: string): LyricSection => {
  if (lineId.startsWith('V1-')) return 'verse';

  const chorusMatch = /^C[12]-(\d{2})$/.exec(lineId);
  const lineIndex = Number(chorusMatch?.[1]);
  if (!chorusMatch || !Number.isInteger(lineIndex) || lineIndex < 1 || lineIndex > 8) {
    throw new Error(`Cannot derive lyric section from reviewed line ID ${lineId}`);
  }
  return lineIndex <= 4 ? 'build' : 'chorus';
};

export const lyrics: readonly LyricLine[] = taniseaAlignment.lines.map(
  (line) => ({
    id: line.id,
    section: sectionForLineId(line.id),
    vocalStartSample: line.vocalStartSample,
    vocalEndSample: line.vocalEndSample,
    visualInStartSample: Math.max(
      0,
      line.vocalStartSample - VISUAL_LEAD_SAMPLES,
    ),
    visualInCompleteSample: Math.max(
      0,
      line.vocalStartSample - VISUAL_SETTLE_LEAD_SAMPLES,
    ),
    visualOutStartSample: line.vocalEndSample,
    visualOutEndSample: line.vocalEndSample + VISUAL_TRAIL_SAMPLES,
    segments: line.segments,
    cues: line.cues,
    text: line.segments.map(({text}) => text).join(' '),
    vocalStart: line.vocalStartSample / SAMPLE_RATE,
    vocalEnd: line.vocalEndSample / SAMPLE_RATE,
  }),
);

export const qcVocalOnsets = lyrics.map(({id, vocalStart}) => ({
  id,
  vocalStart,
}));
