export const SONG_ID = '2102888874858959029';
export const REVISION = 'preview-v2-city';
export const FPS = 60;
export const DURATION_SECONDS = 247.253333;
export const DURATION_FRAMES = Math.ceil(DURATION_SECONDS * FPS);

export type Format = 'landscape' | 'portrait';
export const DIMENSIONS: Record<Format, {width: number; height: number}> = {
  landscape: {width: 1920, height: 1080},
  portrait: {width: 1080, height: 1920},
};
