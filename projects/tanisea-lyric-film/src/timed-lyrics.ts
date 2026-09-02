import { taniseaAlignment } from "./timing/tanisea-alignment";
import { SAMPLE_RATE } from "./timing/alignment-types";
import type { FocusProfile } from "./focus-state";
import type {
  LyricSegment as ReviewedLyricSegment,
  SemanticCue,
} from "./timing/alignment-types";

export type LyricSection = "build" | "chorus" | "verse";
export type LyricSegment = ReviewedLyricSegment;

export type PresentationCue = Readonly<{
  id: string;
  sourceCueId: string;
  startSample: number;
  endSample: number;
  targets: readonly string[];
}>;

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
  presentationCues: readonly PresentationCue[];
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

// C1-05..08 repeat the complete later chorus. Keep the reviewed sample
// anchors and semantic order, then derive the visible choreography from the
// user-approved C2 reference performance below.
const cinematicParityLines = new Set(["C1-05", "C1-06", "C1-07", "C1-08"]);

const firstChorusPresentationLines = new Set([
  "C1-05",
  "C1-06",
  "C1-07",
  "C1-08",
]);

const continuousEnglishTargets = new Map<string, readonly string[]>([
  ["C1-01", ["C1-01-S01", "C1-01-S02"]],
]);

const presentationCuesForLine = (
  lineId: string,
  cues: readonly SemanticCue[],
  releaseSample: number,
): readonly PresentationCue[] => {
  const targets = continuousEnglishTargets.get(lineId);
  if (targets && targets.length !== cues.length) {
    throw new Error(
      `${lineId} continuous presentation requires one target per reviewed cue`,
    );
  }

  return cues.map((cue, index) => {
    const target = targets?.[index];
    if (targets && !target) {
      throw new Error(`${lineId} presentation target ${index} is missing`);
    }
    const nextCue = cues[index + 1];
    const endSample = targets
      ? (nextCue?.startSample ?? releaseSample)
      : cue.endSample;
    if (endSample <= cue.startSample) {
      throw new Error(`${lineId} presentation cue ${cue.id} has no duration`);
    }
    return {
      id: `${cue.id}-P`,
      sourceCueId: cue.id,
      startSample: cue.startSample,
      endSample,
      targets: target ? [target] : [...cue.targets],
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
  if (lineId.startsWith("V1-")) return "verse";

  const chorusMatch = /^C[12]-(\d{2})$/.exec(lineId);
  const lineIndex = Number(chorusMatch?.[1]);
  if (
    !chorusMatch ||
    !Number.isInteger(lineIndex) ||
    lineIndex < 1 ||
    lineIndex > 8
  ) {
    throw new Error(
      `Cannot derive lyric section from reviewed line ID ${lineId}`,
    );
  }
  return lineIndex <= 4 ? "build" : "chorus";
};

const lyricDrafts = taniseaAlignment.lines.map((line) => {
  const precision =
    line.id.startsWith("C1-") && !cinematicParityLines.has(line.id);
  return {
    id: line.id,
    section: sectionForLineId(line.id),
    focusProfile: (precision ? "precision" : "cinematic") as FocusProfile,
    vocalStartSample: line.vocalStartSample,
    vocalEndSample: line.vocalEndSample,
    visualInStartSample: Math.max(0, line.vocalStartSample - VISUAL_LEAD_SAMPLES),
    visualInCompleteSample: Math.max(
      0,
      line.vocalStartSample - VISUAL_SETTLE_LEAD_SAMPLES,
    ),
    segments: line.segments,
    cues: line.cues,
    text: line.segments.map(({ text }) => text).join(" "),
    vocalStart: line.vocalStartSample / SAMPLE_RATE,
    vocalEnd: line.vocalEndSample / SAMPLE_RATE,
  };
});

const draftById = new Map(lyricDrafts.map((line) => [line.id, line]));

const nextPresentationLineId = (lineId: string): string | null => {
  const match = /^(C1|V1|C2)-(\d{2})$/.exec(lineId);
  if (!match)
    throw new Error(`Cannot derive presentation successor for ${lineId}`);
  const prefix = match[1];
  const index = Number(match[2]);
  if (index < 8) return `${prefix}-${String(index + 1).padStart(2, "0")}`;
  if (lineId === "V1-08") return "C2-01";
  return null;
};

const baseLyrics: readonly LyricLine[] = lyricDrafts.map((line) => {
  let visualOutStartSample: number;
  let visualOutEndSample: number;
  let presentationReleaseSample: number;

  if (line.id === "C1-08") {
    visualOutStartSample = presentationMilestones.breakCardRevealStartSample;
    visualOutEndSample = presentationMilestones.breakCardRevealCompleteSample;
    presentationReleaseSample =
      presentationMilestones.breakCardRevealStartSample;
  } else if (line.id === "C2-08") {
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
    if (line.focusProfile === "precision") {
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

const baseLyricById = new Map(baseLyrics.map((line) => [line.id, line]));

const firstChorusStart = baseLyricById.get("C1-05");
const firstChorusEnd = baseLyricById.get("C1-08");
const laterChorusStart = baseLyricById.get("C2-05");
const laterChorusEnd = baseLyricById.get("C2-08");

if (
  !firstChorusStart ||
  !firstChorusEnd ||
  !laterChorusStart ||
  !laterChorusEnd
) {
  throw new Error(
    "Cannot build first-chorus presentation parity without C1/C2 anchors",
  );
}

const mapLaterChorusPresentationSample = (sample: number): number => {
  const laterSpan =
    laterChorusEnd.vocalEndSample - laterChorusStart.vocalStartSample;
  const firstSpan =
    firstChorusEnd.vocalEndSample - firstChorusStart.vocalStartSample;
  if (laterSpan <= 0 || firstSpan <= 0) {
    throw new Error(
      "First/later chorus presentation anchors must have a positive span",
    );
  }

  return Math.round(
    firstChorusStart.vocalStartSample +
      ((sample - laterChorusStart.vocalStartSample) * firstSpan) / laterSpan,
  );
};

const firstChorusPresentationTargets = (
  firstLineId: string,
  templateLineId: string,
  targets: readonly string[],
): readonly string[] => {
  const templatePrefix = `${templateLineId}-`;
  const firstPrefix = `${firstLineId}-`;

  return targets.map((target) => {
    if (!target.startsWith(templatePrefix)) {
      throw new Error(
        `Cannot map ${target} from ${templateLineId} onto ${firstLineId}`,
      );
    }
    return `${firstPrefix}${target.slice(templatePrefix.length)}`;
  });
};

const firstChorusPresentationParity = (line: LyricLine): LyricLine => {
  const suffix = line.id.slice("C1-".length);
  const templateLineId = `C2-${suffix}`;
  const template = baseLyricById.get(templateLineId);
  if (!template) {
    throw new Error(
      `Missing later-chorus presentation template ${templateLineId}`,
    );
  }
  if (template.presentationCues.length !== line.cues.length) {
    throw new Error(
      `${line.id} and ${templateLineId} need matching cue counts for presentation parity`,
    );
  }

  const presentationCues = template.presentationCues.map(
    (templateCue, index) => {
      const sourceCue = line.cues[index];
      if (!sourceCue) {
        throw new Error(`Missing ${line.id} source cue ${index}`);
      }
      const startSample = mapLaterChorusPresentationSample(
        templateCue.startSample,
      );
      const endSample = mapLaterChorusPresentationSample(templateCue.endSample);
      if (endSample <= startSample) {
        throw new Error(
          `${line.id} mapped presentation cue ${sourceCue.id} has no duration`,
        );
      }

      return {
        id: `${sourceCue.id}-P`,
        sourceCueId: sourceCue.id,
        startSample,
        endSample,
        targets: firstChorusPresentationTargets(
          line.id,
          templateLineId,
          templateCue.targets,
        ),
      };
    },
  );

  // C1's final exit remains tied to its dedicated break-card milestone. Every
  // word cue and incoming/ordinary outgoing line transition mirrors the
  // reference choreography, affinely fitted to the first performance window.
  return {
    ...line,
    visualInStartSample: mapLaterChorusPresentationSample(
      template.visualInStartSample,
    ),
    visualInCompleteSample: mapLaterChorusPresentationSample(
      template.visualInCompleteSample,
    ),
    visualOutStartSample:
      line.id === "C1-08"
        ? line.visualOutStartSample
        : mapLaterChorusPresentationSample(template.visualOutStartSample),
    visualOutEndSample:
      line.id === "C1-08"
        ? line.visualOutEndSample
        : mapLaterChorusPresentationSample(template.visualOutEndSample),
    presentationCues,
  };
};

// The reviewed C1 cue table remains the source of truth for audit/proof data.
// This separate display schedule intentionally follows the C2 timing shape:
// the user approved that pass and requested the early chorus to match it.
export const lyrics: readonly LyricLine[] = baseLyrics.map((line) =>
  firstChorusPresentationLines.has(line.id)
    ? firstChorusPresentationParity(line)
    : line,
);

export const qcVocalOnsets = lyrics.map(({ id, vocalStart }) => ({
  id,
  vocalStart,
}));
