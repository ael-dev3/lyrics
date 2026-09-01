const SMOOTHING_WEIGHTS = [1, 2, 3, 2, 1] as const;
const KERNEL_RADIUS = 2;
const KERNEL_TOTAL = 9;

export type SpectrumFeatureFrame = Readonly<{
  bands: Uint8Array;
  impact: number;
}>;

export type SpectrumFeatureSource = Readonly<{
  frameCount: number;
  bandCount: number;
  getFrame: (frame: number) => SpectrumFeatureFrame;
}>;

export type SmoothedSpectrumState = Readonly<{
  bands: Uint8Array;
  impact: number;
}>;

const clamp = (value: number, minimum: number, maximum: number): number =>
  Math.min(maximum, Math.max(minimum, value));

export const getSmoothedSpectrumState = (
  source: SpectrumFeatureSource,
  requestedFrame: number,
): SmoothedSpectrumState => {
  if (source.frameCount < 1 || source.bandCount < 1) {
    throw new Error('Spectrum smoothing requires at least one frame and one band');
  }
  if (!Number.isFinite(requestedFrame)) {
    throw new Error(`Invalid spectrum frame: ${requestedFrame}`);
  }

  const centreFrame = clamp(
    Math.round(requestedFrame),
    0,
    source.frameCount - 1,
  );
  const temporalBands = new Float64Array(source.bandCount);
  let smoothedImpact = 0;

  for (let kernelIndex = 0; kernelIndex < SMOOTHING_WEIGHTS.length; kernelIndex++) {
    const weight = SMOOTHING_WEIGHTS[kernelIndex] ?? 0;
    const frame = clamp(
      centreFrame + kernelIndex - KERNEL_RADIUS,
      0,
      source.frameCount - 1,
    );
    const feature = source.getFrame(frame);
    smoothedImpact += clamp(feature.impact, 0, 1) * weight;
    for (let band = 0; band < source.bandCount; band++) {
      temporalBands[band] =
        (temporalBands[band] ?? 0) + (feature.bands[band] ?? 0) * weight;
    }
  }

  for (let band = 0; band < temporalBands.length; band++) {
    temporalBands[band] = (temporalBands[band] ?? 0) / KERNEL_TOTAL;
  }

  const bands = new Uint8Array(source.bandCount);
  for (let band = 0; band < source.bandCount; band++) {
    let spatialValue = 0;
    for (let kernelIndex = 0; kernelIndex < SMOOTHING_WEIGHTS.length; kernelIndex++) {
      const weight = SMOOTHING_WEIGHTS[kernelIndex] ?? 0;
      const neighbourBand = clamp(
        band + kernelIndex - KERNEL_RADIUS,
        0,
        source.bandCount - 1,
      );
      spatialValue += (temporalBands[neighbourBand] ?? 0) * weight;
    }
    bands[band] = Math.round(clamp(spatialValue / KERNEL_TOTAL, 0, 255));
  }

  return {
    bands,
    impact: clamp(smoothedImpact / KERNEL_TOTAL, 0, 1),
  };
};
