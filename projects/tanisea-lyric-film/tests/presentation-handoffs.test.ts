import {createElement} from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {describe, expect, test} from 'vitest';
import type {AudioFeatureFrame} from '../src/audio-features';
import {LyricDisplay} from '../src/components/LyricDisplay';
import {BreakCard, Outro} from '../src/LyricFilm';
import {lyrics} from '../src/timed-lyrics';
import {frameForSample, SAMPLE_RATE} from '../src/timing/alignment-types';

const CROSSFADE_SAMPLES = 8_379;
const PRECISION_HANDOFF_SAMPLES = 368;
const SEMANTIC_RELEASE_HOLD_SAMPLES = 1_470;
const BREAK_CARD_START_SAMPLE = 2_204_118;
const BREAK_CARD_COMPLETE_SAMPLE = 2_217_348;
const OUTRO_START_SAMPLE = 5_202_918;
const OUTRO_COMPLETE_SAMPLE = 5_221_440;
const PUBLIC_END_SAMPLE = SAMPLE_RATE * 153;

const feature: AudioFeatureFrame = {
  bands: new Uint8Array(64),
  pressure: 0,
  impact: 0,
  lowEnd: 0,
  brightness: 0,
  emotion: 0,
  hero: 0,
  reach: 0,
  momentaryDbfs: -60,
  samplePeakDbfs: -60,
};

const findLine = (id: string) => {
  const line = lyrics.find((candidate) => candidate.id === id);
  if (!line) throw new Error(`Missing lyric ${id}`);
  return line;
};

const internalPairs = ['C1', 'V1', 'C2'].flatMap((prefix) =>
  Array.from({length: 7}, (_, index) => [
    `${prefix}-${String(index + 1).padStart(2, '0')}`,
    `${prefix}-${String(index + 2).padStart(2, '0')}`,
  ] as const),
);

const styleFor = (
  markup: string,
  attribute: string,
  identifier: string,
): string => {
  const index = markup.indexOf(`${attribute}="${identifier}"`);
  if (index < 0) throw new Error(`Missing rendered ${attribute}=${identifier}`);
  const start = markup.lastIndexOf('<div', index);
  const end = markup.indexOf('>', index);
  const style = /style="([^"]*)"/.exec(markup.slice(start, end))?.[1];
  if (!style) throw new Error(`Missing style for ${attribute}=${identifier}`);
  return style;
};

const opacityFor = (
  markup: string,
  attribute: string,
  identifier: string,
): number => {
  const style = styleFor(markup, attribute, identifier);
  const opacity = Number(/(?:^|;)opacity:([^;]+)/.exec(style)?.[1]);
  if (!Number.isFinite(opacity)) {
    throw new Error(`Missing opacity for ${attribute}=${identifier}`);
  }
  return opacity;
};

describe('absolute-sample presentation handoffs', () => {
  test('uses fixed cinematic crossfades and contact-bounded C1 precision handoffs', () => {
    for (const [currentId, nextId] of [
      ...internalPairs,
      ['V1-08', 'C2-01'] as const,
    ]) {
      const current = findLine(currentId);
      const next = findLine(nextId);
      const cinematicStart = Math.max(
        current.vocalEndSample + SEMANTIC_RELEASE_HOLD_SAMPLES,
        next.visualInStartSample,
      );
      const cinematicEnd = cinematicStart + CROSSFADE_SAMPLES;
      const contactBounded = current.focusProfile === 'precision';
      const expectedEnd = contactBounded
        ? next.vocalStartSample
        : cinematicEnd;
      const expectedStart = contactBounded
        ? Math.max(
            current.vocalEndSample,
            expectedEnd - PRECISION_HANDOFF_SAMPLES,
          )
        : cinematicStart;

      expect(current.visualOutStartSample, currentId).toBe(expectedStart);
      expect(current.visualOutEndSample, currentId).toBe(expectedEnd);
    }
  });

  test('uses explicit terminal presentation milestones', () => {
    expect(findLine('C1-08')).toMatchObject({
      visualOutStartSample: BREAK_CARD_START_SAMPLE,
      visualOutEndSample: BREAK_CARD_COMPLETE_SAMPLE,
    });
    expect(findLine('V1-08')).toMatchObject({
      visualOutStartSample: findLine('C2-01').visualInStartSample,
      visualOutEndSample: findLine('C2-01').visualInCompleteSample,
    });
    expect(findLine('C2-08')).toMatchObject({
      visualOutStartSample: OUTRO_START_SAMPLE,
      visualOutEndSample: OUTRO_COMPLETE_SAMPLE,
    });
  });

  test('keeps all presentation intervals ordered within the public timeline', () => {
    for (const line of lyrics) {
      expect(line.visualInStartSample, line.id).toBeGreaterThanOrEqual(0);
      expect(line.visualInCompleteSample, line.id).toBeGreaterThan(
        line.visualInStartSample,
      );
      expect(line.visualOutStartSample, line.id).toBeGreaterThan(
        line.visualInCompleteSample,
      );
      expect(line.visualOutEndSample, line.id).toBeGreaterThan(
        line.visualOutStartSample,
      );
      expect(line.visualOutEndSample, line.id).toBeLessThanOrEqual(
        PUBLIC_END_SAMPLE,
      );
    }
  });

  test.each([60, 120])(
    'renders overlap at every cinematic lyric-to-lyric handoff at %i fps',
    (fps) => {
      for (const [currentId, nextId] of [
        ...internalPairs,
        ['V1-08', 'C2-01'] as const,
      ]) {
        const current = findLine(currentId);
        if (current.focusProfile === 'precision') continue;
        const sample = Math.round(
          (current.visualOutStartSample + current.visualOutEndSample) / 2,
        );
        const frame = frameForSample(sample, fps);
        const markup = renderToStaticMarkup(
          createElement(LyricDisplay, {frame, fps}),
        );
        const currentOpacity = opacityFor(
          markup,
          'data-lyric-line-id',
          currentId,
        );
        const nextOpacity = opacityFor(
          markup,
          'data-lyric-line-id',
          nextId,
        );

        expect(currentOpacity, `${currentId} at ${frame}`).toBeGreaterThan(0);
        expect(nextOpacity, `${nextId} at ${frame}`).toBeGreaterThan(0);
        expect(currentOpacity + nextOpacity, `${currentId}->${nextId}`).toBeGreaterThanOrEqual(0.95);
      }
    },
  );

  test.each([60, 120])(
    'renders continuous overlap at C1-08/card and C2-08/outro at %i fps',
    (fps) => {
      const boundaries = [
        {
          lineId: 'C1-08',
          startSample: BREAK_CARD_START_SAMPLE,
          endSample: BREAK_CARD_COMPLETE_SAMPLE,
          overlay: (time: number) =>
            renderToStaticMarkup(createElement(BreakCard, {time, feature})),
          overlayAttribute: 'data-presentation-layer',
          overlayId: 'break-card',
        },
        {
          lineId: 'C2-08',
          startSample: OUTRO_START_SAMPLE,
          endSample: OUTRO_COMPLETE_SAMPLE,
          overlay: (time: number) =>
            renderToStaticMarkup(createElement(Outro, {time, feature})),
          overlayAttribute: 'data-presentation-layer',
          overlayId: 'outro-reveal',
        },
      ] as const;

      for (const boundary of boundaries) {
        const sample = Math.round(
          (boundary.startSample + boundary.endSample) / 2,
        );
        const frame = frameForSample(sample, fps);
        const lyricMarkup = renderToStaticMarkup(
          createElement(LyricDisplay, {frame, fps}),
        );
        const overlayMarkup = boundary.overlay(frame / fps);
        const lyricOpacity = opacityFor(
          lyricMarkup,
          'data-lyric-line-id',
          boundary.lineId,
        );
        const overlayOpacity = opacityFor(
          overlayMarkup,
          boundary.overlayAttribute,
          boundary.overlayId,
        );

        expect(lyricOpacity, boundary.lineId).toBeGreaterThan(0);
        expect(overlayOpacity, boundary.overlayId).toBeGreaterThan(0);
        expect(lyricOpacity + overlayOpacity).toBeGreaterThanOrEqual(0.95);
      }
    },
  );
});
