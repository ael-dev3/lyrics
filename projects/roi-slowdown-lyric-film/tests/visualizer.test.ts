import {describe, expect, it} from 'vitest';
import {calmWavePath, visualizerAmplitude} from '../src/visualizer';

describe('calm visualizer', () => {
  it('limits motion amplitude to a quiet range', () => {
    expect(visualizerAmplitude(1)).toBeLessThanOrEqual(0.46);
    expect(visualizerAmplitude(0)).toBeGreaterThanOrEqual(0.1);
  });

  it('generates a stable, non-chaotic path with no marker dots', () => {
    const path = calmWavePath({width: 1_200, centerY: 210, amplitude: 30, phase: 0.2});
    expect(path.startsWith('M ')).toBe(true);
    expect(path).not.toContain('circle');
    expect(path.split('L ').length).toBeLessThan(50);
  });
});
