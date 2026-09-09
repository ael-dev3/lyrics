export type CalmWaveOptions = Readonly<{
  width: number;
  centerY: number;
  amplitude: number;
  phase: number;
  energy?: number;
}>;

const clamp = (value: number, minimum = 0, maximum = 1): number =>
  Math.min(maximum, Math.max(minimum, value));

export const visualizerAmplitude = (energy: number): number =>
  0.1 + clamp(energy) * 0.36;

export const calmWavePath = ({
  width,
  centerY,
  amplitude,
  phase,
  energy = 0.5,
}: CalmWaveOptions): string => {
  const points = 28;
  const scale = visualizerAmplitude(energy) / 0.28;
  const values = Array.from({length: points}, (_, index) => {
    const x = Math.round((index / (points - 1)) * width);
    const envelope = 0.78 + 0.22 * Math.sin((index / (points - 1)) * Math.PI);
    const y = Math.round(
      centerY +
        Math.sin(index * 0.63 + phase) * amplitude * envelope * scale +
        Math.sin(index * 0.19 + phase * 0.35) * amplitude * 0.18 * envelope,
    );
    return `${x},${y}`;
  });
  const [first, ...rest] = values;
  return `M ${first ?? `0,${centerY}`} ${rest.map((point) => `L ${point}`).join(' ')}`;
};

export const featureAtTime = (seconds: number): Readonly<{
  energy: number;
  phase: number;
}> => {
  const energy = clamp(
    0.34 +
      Math.sin(seconds * 0.81) * 0.12 +
      Math.sin(seconds * 0.17 + 1.1) * 0.08 +
      Math.sin(seconds * 2.2) * 0.035,
  );
  return {energy, phase: seconds * 0.72};
};
