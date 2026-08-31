const requireFiniteNonNegative = (value: number, label: string): void => {
  if (!Number.isFinite(value) || value < 0) {
    throw new RangeError(`${label} must be finite and non-negative; received ${value}`);
  }
};

const requireFinitePositive = (value: number, label: string): void => {
  if (!Number.isFinite(value) || value <= 0) {
    throw new RangeError(`${label} must be finite and positive; received ${value}`);
  }
};

export const featureFrameForTime = (
  compositionFrame: number,
  compositionFps: number,
  featureFps: number,
): number => {
  requireFiniteNonNegative(compositionFrame, 'Composition frame');
  requireFinitePositive(compositionFps, 'Composition FPS');
  requireFinitePositive(featureFps, 'Feature FPS');

  const time = compositionFrame / compositionFps;
  return Math.round(time * featureFps);
};
