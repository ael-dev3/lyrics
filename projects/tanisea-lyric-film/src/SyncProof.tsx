import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { LyricFilm } from "./LyricFilm";
import { lyrics, type PresentationCue } from "./timed-lyrics";
import {
  frameErrorMs,
  frameForSample,
  SAMPLE_RATE,
  type AlignedLyricLine,
  type Confidence,
  type SemanticCue,
} from "./timing/alignment-types";
import { taniseaAlignment } from "./timing/tanisea-alignment";

export { featureFrameForTime } from "./feature-frame";

type ProofTextItem = Readonly<{
  id: string;
  text: string;
}>;

export type IdleProofFrameState = Readonly<{
  status: "idle";
  compositionFps: number;
  proofFrame: number;
  proofTimeSeconds: number;
  proofTimeMilliseconds: number;
}>;

export type ActiveProofFrameState = Readonly<{
  status: "active";
  lineId: string;
  cueId: string;
  activation: SemanticCue["activation"];
  presentationCueId: string;
  sourceTokenIds: readonly string[];
  sourceTokens: readonly ProofTextItem[];
  sourceText: string;
  targetIds: readonly string[];
  targets: readonly ProofTextItem[];
  targetText: string;
  presentationTargetIds: readonly string[];
  presentationTargets: readonly ProofTextItem[];
  presentationTargetText: string;
  presentationStartSample: number;
  presentationEndSample: number;
  presentationStartMilliseconds: number;
  presentationEndMilliseconds: number;
  presentationTimingMode: "reviewed" | "retimed";
  presentationStartOffsetSamples: number;
  presentationEndOffsetSamples: number;
  presentationStartOffsetMilliseconds: number;
  presentationEndOffsetMilliseconds: number;
  presentationHeldBeyondReviewedCue: boolean;
  selectedSample: number;
  selectedMilliseconds: number;
  confidence: Confidence;
  uncertaintySamples: number;
  uncertaintyMilliseconds: number;
  compositionFps: number;
  proofFrame: number;
  proofTimeSeconds: number;
  proofTimeMilliseconds: number;
  nearestFrame: number;
  frameErrorMilliseconds: number;
  absoluteFrameErrorMilliseconds: number;
  matchingCueIds: readonly string[];
  matchingPresentationCueIds: readonly string[];
}>;

export type ProofFrameState = IdleProofFrameState | ActiveProofFrameState;

type ActiveCandidate = Readonly<{
  line: AlignedLyricLine;
  cue: PresentationCue;
  reviewedCue: SemanticCue;
  startFrame: number;
  endFrame: number;
}>;

const validateFrameContext = (fps: number, frame: number): void => {
  if (!Number.isFinite(frame) || frame < 0) {
    throw new RangeError(
      `Frame must be finite and non-negative; received ${frame}`,
    );
  }
  if (!Number.isFinite(fps) || fps <= 0) {
    throw new RangeError(`FPS must be finite and positive; received ${fps}`);
  }
};

const candidateOrder = (
  left: ActiveCandidate,
  right: ActiveCandidate,
): number =>
  right.cue.startSample - left.cue.startSample ||
  left.cue.endSample - right.cue.endSample ||
  left.line.id.localeCompare(right.line.id) ||
  left.cue.id.localeCompare(right.cue.id);

const textItems = (
  ids: readonly string[],
  items: readonly ProofTextItem[],
  kind: string,
): readonly ProofTextItem[] =>
  ids.map((id) => {
    const item = items.find((candidate) => candidate.id === id);
    if (!item) throw new Error(`Reviewed ${kind} ${id} is missing`);
    return { id: item.id, text: item.text };
  });

export const proofFrameState = (
  lineId: string | null,
  fps: number,
  frame: number,
): ProofFrameState => {
  validateFrameContext(fps, frame);

  const presentationLines =
    lineId === null ? lyrics : lyrics.filter(({ id }) => id === lineId);
  if (lineId !== null && presentationLines.length === 0) {
    throw new Error(`Unknown reviewed line: ${lineId}`);
  }

  const activeCandidates = presentationLines
    .flatMap((presentationLine) => {
      const line = taniseaAlignment.lines.find(
        ({ id }) => id === presentationLine.id,
      );
      if (!line) {
        throw new Error(`Reviewed line ${presentationLine.id} is missing`);
      }
      return presentationLine.presentationCues.map((cue) => {
        const reviewedCue = line.cues.find(({ id }) => id === cue.sourceCueId);
        if (!reviewedCue) {
          throw new Error(`Reviewed cue ${cue.sourceCueId} is missing`);
        }
        // The source cue remains the audit authority. Presentation can use a
        // separately reviewed choreography (for example the requested C1 ↔ C2
        // parity fit), so keep both clocks visible in the diagnostic instead
        // of pretending that every public onset is the source onset.
        return {
          line,
          cue,
          reviewedCue,
          startFrame: frameForSample(cue.startSample, fps),
          endFrame: frameForSample(cue.endSample, fps),
        };
      });
    })
    .filter(
      ({ startFrame, endFrame }) => frame >= startFrame && frame < endFrame,
    )
    .sort(candidateOrder);

  const proofTimeSeconds = frame / fps;
  const proofTimeMilliseconds = proofTimeSeconds * 1_000;
  const selected = activeCandidates[0];
  if (!selected) {
    return {
      status: "idle",
      compositionFps: fps,
      proofFrame: frame,
      proofTimeSeconds,
      proofTimeMilliseconds,
    };
  }

  // Most recently started contact wins; ties use shortest end, line ID, then
  // cue ID. All simultaneous matches remain visible through matchingCueIds.
  const { line, cue, reviewedCue } = selected;
  const sourceTokens = textItems(
    reviewedCue.sourceTokenIds,
    line.tokens,
    "source token",
  );
  const targets = textItems(
    reviewedCue.targets,
    line.segments,
    "reviewed target segment",
  );
  const presentationTargets = textItems(
    cue.targets,
    line.segments,
    "presentation target segment",
  );
  const nearestFrame = frameForSample(reviewedCue.startSample, fps);
  const signedFrameError = frameErrorMs(
    reviewedCue.startSample,
    nearestFrame,
    fps,
  );
  const presentationStartOffsetSamples =
    cue.startSample - reviewedCue.startSample;
  const presentationEndOffsetSamples = cue.endSample - reviewedCue.endSample;
  const presentationTimingMode =
    presentationStartOffsetSamples === 0 && presentationEndOffsetSamples === 0
      ? "reviewed"
      : "retimed";

  return {
    status: "active",
    lineId: line.id,
    cueId: reviewedCue.id,
    activation: reviewedCue.activation,
    presentationCueId: cue.id,
    sourceTokenIds: [...reviewedCue.sourceTokenIds],
    sourceTokens,
    sourceText: sourceTokens.map(({ text }) => text).join(" "),
    targetIds: [...reviewedCue.targets],
    targets,
    targetText: targets.map(({ text }) => text).join(" "),
    presentationTargetIds: [...cue.targets],
    presentationTargets,
    presentationTargetText: presentationTargets
      .map(({ text }) => text)
      .join(" "),
    presentationStartSample: cue.startSample,
    presentationEndSample: cue.endSample,
    presentationStartMilliseconds: (cue.startSample / SAMPLE_RATE) * 1_000,
    presentationEndMilliseconds: (cue.endSample / SAMPLE_RATE) * 1_000,
    presentationTimingMode,
    presentationStartOffsetSamples,
    presentationEndOffsetSamples,
    presentationStartOffsetMilliseconds:
      (presentationStartOffsetSamples / SAMPLE_RATE) * 1_000,
    presentationEndOffsetMilliseconds:
      (presentationEndOffsetSamples / SAMPLE_RATE) * 1_000,
    presentationHeldBeyondReviewedCue: cue.endSample > reviewedCue.endSample,
    selectedSample: reviewedCue.startSample,
    selectedMilliseconds: (reviewedCue.startSample / SAMPLE_RATE) * 1_000,
    confidence: reviewedCue.confidence,
    uncertaintySamples: reviewedCue.uncertaintySamples,
    uncertaintyMilliseconds:
      (reviewedCue.uncertaintySamples / SAMPLE_RATE) * 1_000,
    compositionFps: fps,
    proofFrame: frame,
    proofTimeSeconds,
    proofTimeMilliseconds,
    nearestFrame,
    frameErrorMilliseconds: signedFrameError,
    absoluteFrameErrorMilliseconds: Math.abs(signedFrameError),
    matchingCueIds: activeCandidates.map(
      ({ line: candidateLine, reviewedCue: candidateCue }) =>
        `${candidateLine.id}/${candidateCue.id}`,
    ),
    matchingPresentationCueIds: activeCandidates.map(
      ({ line: candidateLine, cue: candidateCue }) =>
        `${candidateLine.id}/${candidateCue.id}`,
    ),
  };
};

const valueStyle = {
  color: "#fffdfd",
  fontWeight: 650,
} as const;

export const ProofDiagnosticOverlay = ({
  state,
}: Readonly<{ state: ProofFrameState }>) => (
  <div
    data-sync-proof-overlay="true"
    data-sync-proof-status={state.status}
    data-sync-proof-line-id={
      state.status === "active" ? state.lineId : undefined
    }
    style={{
      position: "absolute",
      zIndex: 100,
      left: 26,
      right: 26,
      bottom: 24,
      minHeight: 218,
      padding: "18px 22px",
      border: "2px solid rgba(255,211,62,.96)",
      borderRadius: 8,
      background: "rgba(5,8,13,.94)",
      boxShadow: "0 0 0 2px rgba(0,0,0,.72), 0 12px 34px rgba(0,0,0,.64)",
      color: "#c9fff7",
      fontFamily: "Space Grotesk, sans-serif",
      fontSize: 20,
      lineHeight: 1.34,
      letterSpacing: 0.2,
      pointerEvents: "none",
    }}
  >
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        gap: 24,
        paddingBottom: 8,
        marginBottom: 9,
        borderBottom: "1px solid rgba(255,211,62,.5)",
        color: "#ffd33e",
        fontSize: 17,
        fontWeight: 800,
        letterSpacing: 2.3,
      }}
    >
      <span>SYNC PROOF · {state.status.toUpperCase()}</span>
      <span>
        FRAME {state.proofFrame} · {state.compositionFps} FPS ·{" "}
        {state.proofTimeMilliseconds.toFixed(3)} MS
      </span>
    </div>
    {state.status === "idle" ? (
      <div style={{ ...valueStyle, paddingTop: 44, textAlign: "center" }}>
        IDLE — NO PRESENTATION CUE ACTIVE
      </div>
    ) : (
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "6px 24px",
        }}
      >
        <div>
          REVIEWED LINE / CUE / TYPE ·{" "}
          <span style={valueStyle}>
            {state.lineId} · {state.cueId} · {state.activation.toUpperCase()}
          </span>
        </div>
        <div>
          SAMPLE / TIME ·{" "}
          <span style={valueStyle}>
            {state.selectedSample} · {state.selectedMilliseconds.toFixed(3)} MS
          </span>
        </div>
        <div>
          RUSSIAN IDS ·{" "}
          <span style={valueStyle}>{state.sourceTokenIds.join(" + ")}</span>
        </div>
        <div>
          CONFIDENCE / UNCERTAINTY ·{" "}
          <span style={valueStyle}>
            {state.confidence.toUpperCase()} · {state.uncertaintySamples}{" "}
            samples · {state.uncertaintyMilliseconds.toFixed(3)} MS
          </span>
        </div>
        <div>
          RUSSIAN · <span style={valueStyle}>{state.sourceText}</span>
        </div>
        <div>
          PROOF / NEAREST ·{" "}
          <span style={valueStyle}>
            {state.proofFrame} / {state.nearestFrame}
          </span>
        </div>
        <div>
          REVIEWED ENGLISH IDS ·{" "}
          <span style={valueStyle}>{state.targetIds.join(" + ")}</span>
        </div>
        <div>
          SIGNED / ABS ERROR ·{" "}
          <span style={valueStyle}>
            {state.frameErrorMilliseconds >= 0 ? "+" : ""}
            {state.frameErrorMilliseconds.toFixed(3)} /{" "}
            {state.absoluteFrameErrorMilliseconds.toFixed(3)} MS
          </span>
        </div>
        <div style={{ gridColumn: "1 / -1" }}>
          REVIEWED ENGLISH · <span style={valueStyle}>{state.targetText}</span>
        </div>
        <div style={{ gridColumn: "1 / -1" }}>
          PRESENTATION CUE / INTERVAL ·{" "}
          <span style={valueStyle}>
            {state.presentationCueId} · {state.presentationStartSample}..
            {state.presentationEndSample} ·{" "}
            {state.presentationTimingMode === "retimed"
              ? "RETIMED"
              : state.presentationHeldBeyondReviewedCue
                ? "EXTENDED HOLD"
                : "REVIEWED END"}
          </span>
        </div>
        <div style={{ gridColumn: "1 / -1" }}>
          PRESENTATION / SOURCE START Δ ·{" "}
          <span style={valueStyle}>
            {state.presentationStartOffsetSamples >= 0 ? "+" : ""}
            {state.presentationStartOffsetSamples} samples ·{" "}
            {state.presentationStartOffsetMilliseconds >= 0 ? "+" : ""}
            {state.presentationStartOffsetMilliseconds.toFixed(3)} MS
          </span>
        </div>
        <div style={{ gridColumn: "1 / -1" }}>
          PUBLIC ENGLISH IDS / TEXT ·{" "}
          <span style={valueStyle}>
            {state.presentationTargetIds.join(" + ")} ·{" "}
            {state.presentationTargetText}
          </span>
        </div>
      </div>
    )}
  </div>
);

export const SyncProofFrame = ({
  frame,
  fps,
}: Readonly<{ frame: number; fps: number }>) => {
  const state = proofFrameState(null, fps, frame);

  return (
    <AbsoluteFill data-sync-proof-frame="true">
      <LyricFilm />
      <ProofDiagnosticOverlay state={state} />
    </AbsoluteFill>
  );
};

export const SyncProof = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return <SyncProofFrame frame={frame} fps={fps} />;
};
