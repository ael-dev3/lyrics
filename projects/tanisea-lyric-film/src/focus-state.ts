import {frameForSample} from './timing/alignment-types';
import type {SemanticCue} from './timing/alignment-types';

export type SegmentFocusState = Readonly<{
  contact: 0 | 1;
  emphasis: number;
}>;

type FocusCue = Pick<SemanticCue, 'startSample' | 'endSample' | 'targets'>;

const clamp = (value: number): number => Math.min(1, Math.max(0, value));

export const getSegmentFocusState = (
  cues: readonly FocusCue[],
  segmentId: string,
  frame: number,
  fps: number,
): SegmentFocusState => {
  const targetedFrames = cues
    .filter(({targets}) => targets.includes(segmentId))
    .map(({startSample, endSample}) => ({
      startFrame: frameForSample(startSample, fps),
      endFrame: frameForSample(endSample, fps),
    }));
  const active = targetedFrames.find(
    ({startFrame, endFrame}) => frame >= startFrame && frame < endFrame,
  );

  if (active) {
    return {
      contact: 1,
      emphasis: clamp((frame - active.startFrame + 1) / 3),
    };
  }

  const latestEndFrame = targetedFrames.reduce<number | undefined>(
    (latest, {endFrame}) =>
      endFrame <= frame && (latest === undefined || endFrame > latest)
        ? endFrame
        : latest,
    undefined,
  );

  if (latestEndFrame === undefined) {
    return {contact: 0, emphasis: 0};
  }

  return {
    contact: 0,
    emphasis: clamp(1 - (frame - latestEndFrame) / 2),
  };
};
