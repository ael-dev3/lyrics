import {taniseaAlignment} from './timing/tanisea-alignment';
import {SAMPLE_RATE} from './timing/alignment-types';
import type {FocusProfile} from './focus-state';
import type {
  LyricSegment as ReviewedLyricSegment,
  SemanticCue,
} from './timing/alignment-types';

export type LyricSection = 'build' | 'chorus' | 'verse';
export type LyricSegment = ReviewedLyricSegment;

export type LyricLine = Readonly<{
  id: string;
  section: LyricSection;
  focusProfile: FocusProfile;
  vocalStartSample: number;
  vocalEndSample: number;
  visualInStartSample: number;
  visualInCompleteSample: number;
  visualOutStartSample: number;
  visualOutEndSample: number;
  segments: readonly LyricSegment[];
  cues: readonly SemanticCue[];
  presentationCues: readonly SemanticCue[];
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
const PRECISION_HANDOFF_SAMPLES = Math.round(SAMPLE_RATE * 0.05);
const SEMANTIC_RELEASE_HOLD_SAMPLES = Math.round(SAMPLE_RATE / 30);

const continuousEnglishTargets = new Map<string, readonly string[]>([
  ['C1-01', ['C1-01-S01', 'C1-01-S02']],
  ['C1-06', ['C1-06-S01', 'C1-06-S02', 'C1-06-S03']],
  ['C1-07', ['C1-07-S01', 'C1-07-S02', 'C1-07-S03']],
  ['C1-08', ['C1-08-S01', 'C1-08-S02', 'C1-08-S03']],
]);

const presentationCuesForLine = (
  lineId: string,
  cues: readonly SemanticCue[],
  releaseSample: number,
): readonly SemanticCue[] => {
  const targets = continuousEnglishTargets.get(lineId);
  if (!targets) return cues;
  if (targets.length !== cues.length) {
    throw new Error(
      `${lineId} continuous presentation requires one target per reviewed cue`,
    );
  }

  return cues.map((cue, index) => {
    const target = targets[index];
    if (!target) throw new Error(`${lineId} presentation target ${index} is missing`);
    const nextCue = cues[index + 1];
    const endSample = nextCue?.startSample ?? releaseSample;
    if (endSample <= cue.startSample) {
      throw new Error(`${lineId} presentation cue ${cue.id} has no duration`);
    }
    return {
      ...cue,
      endSample,
      targets: [target],
      activation: 'forward',
      mappingNote:
        `Continuous English-order presentation for ${lineId}; ` +
        `reviewed source semantics remain in alignment/tanisea-word-alignment-v3.json.`,
    };
  });
};

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
    focusProfile: (
      line.id.startsWith('C1-') ? 'precision' : 'cinematic'
    ) as FocusProfile,
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
  let presentationReleaseSample: number;

  if (line.id === 'C1-08') {
    visualOutStartSample = presentationMilestones.breakCardRevealStartSample;
    visualOutEndSample = presentationMilestones.breakCardRevealCompleteSample;
    presentationReleaseSample = presentationMilestones.breakCardRevealStartSample;
  } else if (line.id === 'C2-08') {
    visualOutStartSample = presentationMilestones.outroRevealStartSample;
    visualOutEndSample = presentationMilestones.outroRevealCompleteSample;
    presentationReleaseSample = line.vocalEndSample;
  } else {
    const nextId = nextPresentationLineId(line.id);
    const next = nextId ? draftById.get(nextId) : undefined;
    if (!next) throw new Error(`Missing presentation successor for ${line.id}`);
    presentationReleaseSample = next.vocalStartSample;
    const cinematicOutStartSample = Math.max(
      line.vocalEndSample + SEMANTIC_RELEASE_HOLD_SAMPLES,
      next.visualInStartSample,
    );
    const cinematicOutEndSample =
      cinematicOutStartSample + PRESENTATION_CROSSFADE_SAMPLES;
    if (line.focusProfile === 'precision') {
      visualOutEndSample = next.vocalStartSample;
      visualOutStartSample = Math.max(
        line.vocalEndSample,
        visualOutEndSample - PRECISION_HANDOFF_SAMPLES,
      );
    } else {
      visualOutStartSample = cinematicOutStartSample;
      visualOutEndSample = cinematicOutEndSample;
    }
  }

  return {
    ...line,
    presentationCues: presentationCuesForLine(
      line.id,
      line.cues,
      presentationReleaseSample,
    ),
    visualOutStartSample,
    visualOutEndSample,
  };
});

export const qcVocalOnsets = lyrics.map(({id, vocalStart}) => ({
  id,
  vocalStart,
}));
