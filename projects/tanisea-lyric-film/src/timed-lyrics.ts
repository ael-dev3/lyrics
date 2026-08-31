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
const PRESENTATION_CROSSFADE_SAMPLES =
  VISUAL_LEAD_SAMPLES - VISUAL_SETTLE_LEAD_SAMPLES;
const SEMANTIC_RELEASE_HOLD_SAMPLES = Math.round(SAMPLE_RATE / 30);

export const presentationMilestones = {
  breakCardRevealStartSample: 2_204_118,
  breakCardRevealCompleteSample: 2_217_348,
  outroRevealStartSample: 5_202_918,
  outroRevealCompleteSample: 5_221_440,
  publicTimelineEndSample: SAMPLE_RATE * 153,
} as const;

const sectionForLineId = (lineId: string): LyricSection => {
  if (lineId.startsWith('V1-')) return 'verse';

  const chorusMatch = /^C[12]-(\d{2})$/.exec(lineId);
  const lineIndex = Number(chorusMatch?.[1]);
  if (!chorusMatch || !Number.isInteger(lineIndex) || lineIndex < 1 || lineIndex > 8) {
    throw new Error(`Cannot derive lyric section from reviewed line ID ${lineId}`);
  }
  return lineIndex <= 4 ? 'build' : 'chorus';
};

const lyricDrafts = taniseaAlignment.lines.map((line) => ({
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
    segments: line.segments,
    cues: line.cues,
    text: line.segments.map(({text}) => text).join(' '),
    vocalStart: line.vocalStartSample / SAMPLE_RATE,
    vocalEnd: line.vocalEndSample / SAMPLE_RATE,
  }));

const draftById = new Map(lyricDrafts.map((line) => [line.id, line]));

const nextPresentationLineId = (lineId: string): string | null => {
  const match = /^(C1|V1|C2)-(\d{2})$/.exec(lineId);
  if (!match) throw new Error(`Cannot derive presentation successor for ${lineId}`);
  const prefix = match[1];
  const index = Number(match[2]);
  if (index < 8) return `${prefix}-${String(index + 1).padStart(2, '0')}`;
  if (lineId === 'V1-08') return 'C2-01';
  return null;
};

export const lyrics: readonly LyricLine[] = lyricDrafts.map((line) => {
  let visualOutStartSample: number;
  let visualOutEndSample: number;

  if (line.id === 'C1-08') {
    visualOutStartSample = presentationMilestones.breakCardRevealStartSample;
    visualOutEndSample = presentationMilestones.breakCardRevealCompleteSample;
  } else if (line.id === 'C2-08') {
    visualOutStartSample = presentationMilestones.outroRevealStartSample;
    visualOutEndSample = presentationMilestones.outroRevealCompleteSample;
  } else {
    const nextId = nextPresentationLineId(line.id);
    const next = nextId ? draftById.get(nextId) : undefined;
    if (!next) throw new Error(`Missing presentation successor for ${line.id}`);
    visualOutStartSample = Math.max(
      line.vocalEndSample + SEMANTIC_RELEASE_HOLD_SAMPLES,
      next.visualInStartSample,
    );
    visualOutEndSample =
      visualOutStartSample + PRESENTATION_CROSSFADE_SAMPLES;
  }

  return {...line, visualOutStartSample, visualOutEndSample};
});

export const qcVocalOnsets = lyrics.map(({id, vocalStart}) => ({
  id,
  vocalStart,
}));
