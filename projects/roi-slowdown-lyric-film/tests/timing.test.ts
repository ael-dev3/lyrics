import {describe, expect, it} from 'vitest';
import {PUBLIC_FPS, SAMPLE_RATE, frameForSample, sampleForSeconds} from '../src/timing';
import {dualSongAlignment, getActiveLines} from '../src/lyrics';

describe('dual-song timing authority', () => {
  it('uses integer sample indices and deterministic frame conversion', () => {
    expect(sampleForSeconds(1.5)).toBe(66_150);
    expect(frameForSample(66_150, PUBLIC_FPS)).toBe(90);
    expect(frameForSample(sampleForSeconds(1 / 120), PUBLIC_FPS)).toBe(1);
  });

  it('keeps song lanes independently addressable during overlap', () => {
    const active = getActiveLines(86.5);
    expect(active.song1.length).toBeGreaterThan(0);
    expect(active.song2.length).toBeGreaterThan(0);
    expect(new Set(active.song1.map((line) => line.songId))).toEqual(new Set(['song-1']));
    expect(new Set(active.song2.map((line) => line.songId))).toEqual(new Set(['song-2']));
  });

  it('contains the supplied centerpiece timing for Song 2', () => {
    const line = dualSongAlignment.songs[1].lines.find((item) => item.startSample === sampleForSeconds(100));
    expect(line).toBeDefined();
    expect(line!.startSample / SAMPLE_RATE).toBeCloseTo(100, 3);
  });
});
