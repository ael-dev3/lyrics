import {describe, expect, test} from 'vitest';
import {createArchivalDeliveryArguments} from '../scripts/encode-delivery-plan';

describe('archival delivery encode plan', () => {
  test('locks all 9,180 video frames without shortest-stream truncation', () => {
    const argumentsList = createArchivalDeliveryArguments({
      referencePath: 'output/reference.mov',
      soundtrackPath: 'public/soundtrack.m4a',
      outputPath: 'output/public.mp4',
    });

    expect(argumentsList).not.toContain('-shortest');
    const frameLimitIndex = argumentsList.indexOf('-frames:v');
    expect(frameLimitIndex).toBeGreaterThan(-1);
    expect(argumentsList[frameLimitIndex + 1]).toBe('9180');
    expect(argumentsList).toContain('passthrough');
    expect(argumentsList).toContain('copy');
    expect(argumentsList.slice(-2)).toEqual([
      '-y',
      'output/public.mp4',
    ]);
  });
});
