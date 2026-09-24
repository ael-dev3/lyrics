export function createCues(timeline) {
  const cues = timeline.sections.flatMap(section => section.lines.map(line => ({
    ...line, section: section.name,
  })));
  return cues.map((cue, index) => {
    const previousEnd = index ? cues[index - 1].words.at(-1).end : 0;
    const next = cues[index + 1];
    const displayStart = Math.max(previousEnd, cue.words[0].start - .18);
    const nextDisplayStart = next ? Math.max(cue.words.at(-1).end, next.words[0].start - .18) : Infinity;
    return {...cue, index, displayStart, displayEnd: Math.min(cue.words.at(-1).end + .20, nextDisplayStart)};
  });
}

export function cueAt(cues, time) {
  return cues.find(cue => time >= cue.displayStart && time < cue.displayEnd) ?? null;
}

export function wordIndexAt(words, time) {
  return words.findIndex(word => time >= word.start && time < word.end);
}

export function spectrumAt(values, metadata, time) {
  const {frameCount, bandCount, dbfsOffset, dbfsStep} = metadata.data;
  const result = new Float32Array(bandCount).fill(dbfsOffset);
  if (!Number.isFinite(time) || time < 0 || time >= metadata.source.durationSeconds) return result;
  const position = Math.min(frameCount - 1, time * metadata.clock.framesPerSecond);
  const first = Math.floor(position), next = Math.min(frameCount - 1, first + 1);
  const mix = position - first;
  for (let band = 0; band < bandCount; band++) {
    const a = values[first * bandCount + band], b = values[next * bandCount + band];
    result[band] = dbfsOffset + (a + (b - a) * mix) * dbfsStep;
  }
  return result;
}

export function createVideoFramePump(video, onFrame) {
  let handle = null, generation = 0;
  let lastPresentedFrame = null, callbackCount = 0, skippedSourceFrames = 0, maximumFrameGap = 0;
  const stop = () => {
    generation++;
    if (handle !== null && video.cancelVideoFrameCallback) video.cancelVideoFrameCallback(handle);
    handle = null;
    lastPresentedFrame = null;
  };
  const start = () => {
    if (handle !== null || video.paused || video.seeking || !video.requestVideoFrameCallback) return;
    const ownGeneration = generation;
    handle = video.requestVideoFrameCallback((now, metadata) => {
      if (ownGeneration !== generation) return;
      handle = null;
      if (video.paused || video.seeking) { lastPresentedFrame = null; return; }
      const presented = Number.isInteger(metadata.presentedFrames) ? metadata.presentedFrames : null;
      if (presented !== null && lastPresentedFrame !== null && presented > lastPresentedFrame) {
        const gap = presented - lastPresentedFrame - 1;
        skippedSourceFrames += gap;
        maximumFrameGap = Math.max(maximumFrameGap, gap);
      }
      lastPresentedFrame = presented;
      callbackCount++;
      onFrame(now, metadata);
      start();
    });
  };
  const metrics = () => ({callbackCount, skippedSourceFrames, maximumFrameGap, lastPresentedFrame, generation});
  return {start, stop, pending: () => handle !== null, metrics};
}

// Pausing can cancel the callback for the last decoded source frame. Refresh
// immediately and once after layout/compositing settles, never on a new transport.
export function createSettledFrameRefresh({requestFrame, cancelFrame, draw, canDraw = () => true}) {
  let handle = null, generation = 0;
  const cancel = () => {
    generation++;
    if (handle !== null) cancelFrame(handle);
    handle = null;
  };
  const refresh = () => {
    cancel();
    if (!canDraw()) return;
    draw();
    const ownGeneration = generation;
    handle = requestFrame(() => {
      if (ownGeneration !== generation) return;
      handle = null;
      if (canDraw()) draw();
    });
  };
  return {refresh, cancel, pending: () => handle !== null};
}
