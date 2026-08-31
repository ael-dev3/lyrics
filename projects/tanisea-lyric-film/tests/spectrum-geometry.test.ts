import {describe, expect, test} from 'vitest';
import {getSpectrumBarGeometry} from '../src/spectrum-geometry';

describe('spectrum bar geometry', () => {
  test('maps peak measurement and impact to the approved 96 + 18 px travel', () => {
    expect(getSpectrumBarGeometry(255, 1)).toEqual({
      measuredHeight: 96,
      impactExtension: 18,
      totalHeight: 114,
    });
  });

  test('keeps a quiet measurement visible without inventing an impact cap', () => {
    expect(getSpectrumBarGeometry(0, 0)).toEqual({
      measuredHeight: 2,
      impactExtension: 0,
      totalHeight: 2,
    });
  });

  test.each([
    {byte: -40, impact: -3, expected: [2, 0, 2]},
    {byte: 400, impact: 4, expected: [96, 18, 114]},
    {byte: Number.NEGATIVE_INFINITY, impact: Number.NEGATIVE_INFINITY, expected: [2, 0, 2]},
    {byte: Number.POSITIVE_INFINITY, impact: Number.POSITIVE_INFINITY, expected: [96, 18, 114]},
    {byte: Number.NaN, impact: Number.NaN, expected: [2, 0, 2]},
    {byte: 141.7, impact: 0.47, expected: [33, 8, 41]},
  ])(
    'clamps byte $byte and impact $impact before returning bounded integer geometry',
    ({byte, impact, expected}) => {
      const geometry = getSpectrumBarGeometry(byte, impact);

      expect([
        geometry.measuredHeight,
        geometry.impactExtension,
        geometry.totalHeight,
      ]).toEqual(expected);
      expect(Object.values(geometry).every(Number.isInteger)).toBe(true);
      expect(geometry.measuredHeight).toBeGreaterThanOrEqual(2);
      expect(geometry.measuredHeight).toBeLessThanOrEqual(96);
      expect(geometry.impactExtension).toBeGreaterThanOrEqual(0);
      expect(geometry.impactExtension).toBeLessThanOrEqual(18);
      expect(geometry.totalHeight).toBeLessThanOrEqual(114);
    },
  );
});
