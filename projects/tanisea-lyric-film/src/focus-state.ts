import {frameForSample} from './timing/alignment-types';
import type {SemanticCue} from './timing/alignment-types';

export type SegmentFocusState = Readonly<{
  contact: 0 | 1;
  emphasis: number;
}>;

type FocusCue = Pick<SemanticCue, 'startSample' | 'endSample' | 'targets'>;

const clamp = (value: number): number => Math.min(1, Math.max(0, value));

const validateInputs = (
  cues: readonly FocusCue[],
  frame: number,
  fps: number,
): void => {
  if (!Number.isFinite(frame) || frame < 0) {
    throw new RangeError(`Frame must be finite and non-negative; received ${frame}`);
  }
  if (!Number.isFinite(fps) || fps <= 0) {
    throw new RangeError(`FPS must be finite and positive; received ${fps}`);
  }

  for (const {startSample, endSample} of cues) {
    if (!Number.isInteger(startSample) || startSample < 0) {
      throw new RangeError(
        `Cue start sample must be a non-negative integer; received ${startSample}`,
      );
    }
    if (!Number.isInteger(endSample) || endSample < 0) {
      throw new RangeError(
        `Cue end sample must be a non-negative integer; received ${endSample}`,
      );
    }
    if (endSample <= startSample) {
      throw new RangeError(
        `Cue end sample must be greater than its start; received ${startSample}..${endSample}`,
      );
    }
  }
};

export const getSegmentFocusState = (
  cues: readonly FocusCue[],
  segmentId: string,
  frame: number,
  fps: number,
): SegmentFocusState => {
  validateInputs(cues, frame, fps);

  let contact: 0 | 1 = 0;
  let emphasis = 0;

  // Every targeted cue contributes independently. Taking the maximum makes
  // duplicate, overlapping, multi-target, and unsorted cue arrays equivalent.
  for (const {startSample, endSample, targets} of cues) {
    if (!targets.includes(segmentId)) continue;
    const startFrame = frameForSample(startSample, fps);
    const endFrame = frameForSample(endSample, fps);

    if (frame >= startFrame && frame < endFrame) {
      contact = 1;
      emphasis = Math.max(
        emphasis,
        clamp((frame - startFrame + 1) / 3),
      );
      continue;
    }

    if (frame >= endFrame) {
      emphasis = Math.max(
        emphasis,
        clamp(1 - (frame - endFrame) / 2),
      );
    }
  }

  return {contact, emphasis: clamp(emphasis)};
};
