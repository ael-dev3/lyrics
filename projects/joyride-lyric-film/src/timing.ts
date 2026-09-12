/** Sample authority is preserved; presentation is quantized once to the video clock. */
export type TimedLine = Readonly<{startSample: number; endSample: number}>;
export type TimingClock = Readonly<{sampleRate: number; fps: number}>;
export const SR = 48000, FPS = 60, SPF = SR / FPS;
const defaultClock: TimingClock = {sampleRate: SR, fps: FPS};

export function sampleToFrame(sample: number, clock: TimingClock = defaultClock): number {
  if (!Number.isFinite(sample) || !Number.isFinite(clock.sampleRate) || !Number.isFinite(clock.fps) || !(clock.sampleRate > 0) || !(clock.fps > 0)) throw Error('Invalid timing clock or sample');
  // One division avoids the floating-point half-frame drift of sample / SR * FPS.
  return Math.round(sample / (clock.sampleRate / clock.fps));
}

/** Compatibility API for source-sample checks. No frame decisions should use this directly. */
export function displayWindow(c: TimedLine, previous: TimedLine | undefined, next: TimedLine | undefined, clock: TimingClock = defaultClock) {
  const maxLead = clock.sampleRate * .24;
  const lead = Math.min(maxLead, Math.max(0, (c.startSample - (previous?.endSample ?? 0)) / 2));
  const nextLead = next ? Math.min(maxLead, Math.max(0, (next.startSample - c.endSample) / 2)) : maxLead;
  return {
    start: c.startSample - lead,
    end: Math.min(c.endSample + maxLead, next ? next.startSample - nextLead : Infinity),
    settled: c.startSample - Math.min(clock.sampleRate / 30, lead * .25),
  };
}

export type CueFrameWindow = Readonly<{
  startFrame: number;
  settledFrame: number;
  vocalStartFrame: number;
  vocalEndFrame: number;
  endFrame: number;
}>;

export function cueFrameWindow(c: TimedLine, previous: TimedLine | undefined, next: TimedLine | undefined, clock: TimingClock = defaultClock): CueFrameWindow {
  const samples = displayWindow(c, previous, next, clock);
  return {
    startFrame: sampleToFrame(samples.start, clock),
    settledFrame: sampleToFrame(samples.settled, clock),
    vocalStartFrame: sampleToFrame(c.startSample, clock),
    vocalEndFrame: sampleToFrame(c.endSample, clock),
    endFrame: sampleToFrame(samples.end, clock),
  };
}

const smooth = (start: number, end: number, frame: number): number => {
  // A zero-duration entrance is an exact step, fully visible at contact.
  if (end <= start) return frame >= end ? 1 : 0;
  const x = Math.max(0, Math.min(1, (frame - start) / (end - start)));
  return x * x * (3 - 2 * x);
};

export function cueOpacityAtFrame(window: CueFrameWindow, frame: number): number {
  if (frame < window.startFrame || frame >= window.endFrame) return 0;
  return smooth(window.startFrame, window.settledFrame, frame) * (1 - smooth(window.vocalEndFrame, window.endFrame, frame));
}

export type GroupFrameWindow = Readonly<{wordIndices: readonly number[]; startFrame: number; endFrame: number}>;
export type CueFrames = Readonly<{index: number; window: CueFrameWindow; groups: readonly GroupFrameWindow[]}>;
type GroupedCue = TimedLine & Readonly<{words: readonly TimedLine[]; groups: readonly (readonly number[])[]}>;

/** Build once, outside the component; never derive focus from rounded seconds. */
export function buildCueFrames(cues: readonly GroupedCue[], clock: TimingClock = defaultClock): readonly CueFrames[] {
  return cues.map((cue, index) => {
    const window = cueFrameWindow(cue, cues[index - 1], cues[index + 1], clock);
    if (window.endFrame <= window.startFrame || window.settledFrame > window.vocalStartFrame) throw Error(`Invalid presentation window for cue ${index}`);
    const groups = cue.groups.map(wordIndices => {
      if (!wordIndices.length) throw Error(`Empty focus group for cue ${index}`);
      const words = wordIndices.map(i => {
        const word = cue.words[i];
        if (!Number.isInteger(i) || i < 0 || !word) throw Error(`Invalid focus index for cue ${index}`);
        return word;
      });
      const startFrame = sampleToFrame(Math.min(...words.map(w => w.startSample)), clock);
      const endFrame = sampleToFrame(Math.max(...words.map(w => w.endSample)), clock);
      if (endFrame <= startFrame) throw Error(`Sub-frame focus group for cue ${index}; group connected words explicitly`);
      if (startFrame < window.startFrame || endFrame > window.endFrame) throw Error(`Focus outside presentation window for cue ${index}`);
      return {wordIndices: [...wordIndices], startFrame, endFrame};
    });
    return {index, window, groups};
  });
}

export type CueFrameState = Readonly<{index: number; opacity: number; activeWordIndices: ReadonlySet<number>}>;

/** Both visibility and exclusive-end focus are evaluated in the same frame domain. */
export function cueStateAtFrame(presentation: readonly CueFrames[], frame: number): CueFrameState | undefined {
  if (!Number.isInteger(frame)) throw Error('Presentation frame must be an integer');
  const cue = presentation.find(c => frame >= c.window.startFrame && frame < c.window.endFrame);
  if (!cue) return undefined;
  const activeWordIndices = new Set<number>();
  for (const group of cue.groups) {
    if (frame >= group.startFrame && frame < group.endFrame) for (const index of group.wordIndices) activeWordIndices.add(index);
  }
  return {index: cue.index, opacity: cueOpacityAtFrame(cue.window, frame), activeWordIndices};
}
