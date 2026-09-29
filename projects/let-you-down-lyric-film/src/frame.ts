import {SHOTS, type Shot} from './shots.ts';
import type {Format} from './model.ts';

export const SW = 1920, SH = 1080; // source frame
export const CROP_W = SH * 9 / 16; // portrait crop width in source pixels (607.5)
export type Box = {x: number; y: number; w: number; h: number};

const ease = (x: number): number => {const v = Math.max(0, Math.min(1, x)); return v * v * (3 - 2 * v);};
export function shotAt(t: number): Shot {
  let lo = 0, hi = SHOTS.length - 1;
  while (lo < hi) {const mid = (lo + hi + 1) >> 1; if (SHOTS[mid]!.start <= t) lo = mid; else hi = mid - 1;}
  return SHOTS[lo]!;
}
/** Normalized horizontal crop centre for portrait crop shots (panned shots ease
 * between their authored start and end centres over the shot). */
export function portraitCentre(shot: Shot, t: number): number {
  if (shot.portrait.mode !== 'crop') return 0.5;
  const {x, x2} = shot.portrait;
  if (x2 === undefined) return x;
  return x + (x2 - x) * ease((t - shot.start) / Math.max(0.001, shot.end - shot.start));
}
export function outputSize(format: Format): {w: number; h: number} {
  return format === 'landscape' ? {w: 1920, h: 1080} : {w: 1080, h: 1920};
}
/** Where the source picture lands. Landscape keeps the whole 16:9 frame.
 * Portrait either crops the moving frame around the subject, or (authored
 * lettering) fits the whole frame into a band above the lyrics. */
export type Placement = {mode: 'full' | 'crop' | 'fit'; src: Box; dst: Box};
export const FIT_BAND = {y: 430, h: 1080 * 1080 / 1920}; // 607.5 px tall
export function placement(format: Format, shot: Shot, t: number): Placement {
  if (format === 'landscape') return {mode: 'full', src: {x: 0, y: 0, w: SW, h: SH}, dst: {x: 0, y: 0, w: 1920, h: 1080}};
  if (shot.portrait.mode === 'fit') return {mode: 'fit', src: {x: 0, y: 0, w: SW, h: SH}, dst: {x: 0, y: FIT_BAND.y, w: 1080, h: FIT_BAND.h}};
  const c = portraitCentre(shot, t), x = Math.max(0, Math.min(SW - CROP_W, c * SW - CROP_W / 2));
  return {mode: 'crop', src: {x, y: 0, w: CROP_W, h: SH}, dst: {x: 0, y: 0, w: 1080, h: 1920}};
}
export {SHOTS};
