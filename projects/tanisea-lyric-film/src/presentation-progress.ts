import {frameForSample} from './timing/alignment-types';

type PresentationProgressCue = Readonly<{
  startSample: number;
  endSample: number;
}>;

const clamp = (value: number): number => Math.min(1, Math.max(0, value));

export const getPresentationProgress = (
  cues: readonly PresentationProgressCue[],
  frame: number,
  fps: number,
): number => {
  if (!Number.isFinite(frame) || frame < 0) {
    throw new RangeError(`Frame must be finite and non-negative; received ${frame}`);
  }
  if (!Number.isFinite(fps) || fps <= 0) {
    throw new RangeError(`FPS must be finite and positive; received ${fps}`);
  }
  if (cues.length === 0) return 0;

  const orderedCues = [...cues].sort(
    (left, right) =>
      left.startSample - right.startSample || left.endSample - right.endSample,
  );
  const cueCount = orderedCues.length;

  for (let index = 0; index < cueCount; index += 1) {
    const cue = orderedCues[index];
    if (!cue) continue;
    if (!Number.isInteger(cue.startSample) || cue.startSample < 0) {
      throw new RangeError(
        `Cue start sample must be a non-negative integer; received ${cue.startSample}`,
      );
    }
    if (!Number.isInteger(cue.endSample) || cue.endSample <= cue.startSample) {
      throw new RangeError(
        `Cue end sample must be greater than its start; received ${cue.startSample}..${cue.endSample}`,
      );
    }

    const startFrame = frameForSample(cue.startSample, fps);
    const endFrame = frameForSample(cue.endSample, fps);
    if (frame < startFrame) return index / cueCount;
    if (frame < endFrame) {
      const cueProgress = clamp(
        (frame - startFrame) / Math.max(1, endFrame - startFrame),
      );
      return (index + cueProgress) / cueCount;
    }
  }

  return 1;
};
