import {describe, expect, test} from 'vitest';
import {
  getSmoothedSpectrumState,
  type SpectrumFeatureSource,
} from '../src/spectrum-smoothing';

const makeSource = (
  frames: readonly (readonly number[])[],
  impacts: readonly number[] = [],
): SpectrumFeatureSource => {
  const bandCount = frames[0]?.length ?? 0;
  return {
    frameCount: frames.length,
    bandCount,
    getFrame: (frame) => {
      const bands = frames[frame];
      if (!bands) throw new Error(`Missing fixture frame ${frame}`);
      return {
        bands: Uint8Array.from(bands),
        impact: impacts[frame] ?? 0,
      };
    },
  };
};

const roughness = (bands: Uint8Array): number =>
  Array.from(bands.slice(1)).reduce(
    (sum, value, index) => sum + Math.abs(value - (bands[index] ?? value)),
    0,
  );

describe('calm spectrum state', () => {
  test('preserves constant band and impact values', () => {
    const source = makeSource(
      Array.from({length: 7}, () => Array(9).fill(120)),
      Array(7).fill(0.4),
    );

    const state = getSmoothedSpectrumState(source, 3);

    expect(Array.from(state.bands)).toEqual(Array(9).fill(120));
    expect(state.impact).toBeCloseTo(0.4, 10);
  });

  test('centres temporal smoothing on the current frame without visual lag', () => {
    const source = makeSource(
      Array.from({length: 9}, (_, frame) => [frame === 4 ? 255 : 0]),
    );

    const values = Array.from({length: 5}, (_, offset) =>
      getSmoothedSpectrumState(source, offset + 2).bands[0],
    );

    expect(values).toEqual([28, 57, 85, 57, 28]);
    expect(values[2]).toBeGreaterThan(values[1] ?? 0);
  });

  test('clamps temporal neighbours at source boundaries', () => {
    const source = makeSource(
      [Array(5).fill(90), Array(5).fill(0), Array(5).fill(0)],
      [0.9, 0, 0],
    );

    const state = getSmoothedSpectrumState(source, 0);

    expect(Array.from(state.bands)).toEqual(Array(5).fill(60));
    expect(state.impact).toBeCloseTo(0.6, 10);
  });

  test('reduces adjacent-band roughness while returning bounded integer bytes', () => {
    const raw = Uint8Array.from({length: 16}, (_, band) => band % 2 ? 255 : 0);
    const source = makeSource([Array.from(raw)]);

    const state = getSmoothedSpectrumState(source, 0);

    expect(roughness(state.bands)).toBeLessThan(roughness(raw) * 0.25);
    for (const byte of state.bands) {
      expect(Number.isInteger(byte)).toBe(true);
      expect(byte).toBeGreaterThanOrEqual(0);
      expect(byte).toBeLessThanOrEqual(255);
    }
  });
});
