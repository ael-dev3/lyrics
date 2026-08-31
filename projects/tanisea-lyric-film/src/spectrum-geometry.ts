const MINIMUM_MEASURED_HEIGHT = 2;
const MAXIMUM_MEASURED_HEIGHT = 96;
const MAXIMUM_IMPACT_EXTENSION = 18;

const clamp = (value: number, minimum: number, maximum: number): number => {
  if (Number.isNaN(value)) return minimum;
  return Math.min(maximum, Math.max(minimum, value));
};

export type SpectrumBarGeometry = Readonly<{
  measuredHeight: number;
  impactExtension: number;
  totalHeight: number;
}>;

export const getSpectrumBarGeometry = (
  byte: number,
  impact: number,
): SpectrumBarGeometry => {
  const clampedByte = clamp(byte, 0, 255);
  const clampedImpact = clamp(impact, 0, 1);
  const normalized = clamp((clampedByte - 24) / 231, 0, 1);
  const measuredHeight = Math.round(
    MINIMUM_MEASURED_HEIGHT +
      normalized ** 1.65 *
        (MAXIMUM_MEASURED_HEIGHT - MINIMUM_MEASURED_HEIGHT),
  );
  const impactExtension = Math.round(
    clampedImpact * MAXIMUM_IMPACT_EXTENSION,
  );

  return {
    measuredHeight,
    impactExtension,
    totalHeight: measuredHeight + impactExtension,
  };
};
