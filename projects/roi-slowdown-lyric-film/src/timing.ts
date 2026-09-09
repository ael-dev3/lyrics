export const SAMPLE_RATE = 44_100 as const;
export const PUBLIC_FPS = 60 as const;
export const PROOF_FPS = 120 as const;
export const SOURCE_FRAME_COUNT = 22_763 as const;
export const SOURCE_DURATION_SECONDS = SOURCE_FRAME_COUNT / PUBLIC_FPS;

export type SongId = 'song-1' | 'song-2';

export type LyricWord = Readonly<{
  id: string;
  text: string;
  startSample: number;
  endSample: number;
}>;

export type LyricLine = Readonly<{
  id: string;
  songId: SongId;
  songLabel: string;
  section: string;
  text: string;
  startSample: number;
  endSample: number;
  words: readonly LyricWord[];
  evidence: string;
  confidence: 'high' | 'medium' | 'low';
}>;

export type SongAlignment = Readonly<{
  id: SongId;
  label: string;
  title: string;
  lines: readonly LyricLine[];
}>;

export type DualSongAlignment = Readonly<{
  schemaVersion: 1;
  sourceId: string;
  sourceSha256: string;
  sampleRate: typeof SAMPLE_RATE;
  fps: typeof PUBLIC_FPS;
  durationSeconds: number;
  songs: readonly [SongAlignment, SongAlignment];
}>;

export const sampleForSeconds = (seconds: number): number => {
  if (!Number.isFinite(seconds) || seconds < 0) {
    throw new RangeError(`seconds must be finite and non-negative: ${seconds}`);
  }
  return Math.round(seconds * SAMPLE_RATE);
};

export const frameForSample = (sample: number, fps: number): number => {
  if (!Number.isInteger(sample) || sample < 0) {
    throw new RangeError(`sample must be a non-negative integer: ${sample}`);
  }
  if (!Number.isFinite(fps) || fps <= 0) {
    throw new RangeError(`fps must be finite and positive: ${fps}`);
  }
  return Math.round((sample * fps) / SAMPLE_RATE);
};

export const frameErrorMs = (sample: number, fps: number): number => {
  const frame = frameForSample(sample, fps);
  return (frame / fps - sample / SAMPLE_RATE) * 1_000;
};

export const secondsFromSample = (sample: number): number => sample / SAMPLE_RATE;
