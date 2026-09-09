import {createElement} from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {describe, expect, test} from 'vitest';
import type {AudioFeatureFrame} from '../src/audio-features';
import {FrameChrome} from '../src/components/FrameChrome';
import {SpectrumRail} from '../src/components/SpectrumRail';

const peakFeature: AudioFeatureFrame = {
  bands: Uint8Array.from({length: 64}, (_, index) => index === 0 ? 255 : 0),
  pressure: 0,
  impact: 1,
  lowEnd: 0,
  brightness: 0,
  emotion: 0,
  hero: 0,
  reach: 0,
  momentaryDbfs: -8.4,
  samplePeakDbfs: -0.2,
};

const valuesFor = (markup: string, attribute: string): string[] =>
  [...markup.matchAll(new RegExp(`${attribute}="([^"]+)"`, 'g'))]
    .map((match) => match[1])
    .filter((value): value is string => value !== undefined);

const openingTagFor = (
  markup: string,
  attribute: string,
  value: string,
): string => {
  const attributeIndex = markup.indexOf(`${attribute}="${value}"`);
  if (attributeIndex < 0) throw new Error(`Missing ${attribute}=${value}`);
  const tagStart = markup.lastIndexOf('<', attributeIndex);
  const tagEnd = markup.indexOf('>', attributeIndex);
  return markup.slice(tagStart, tagEnd + 1);
};

describe('public frame chrome', () => {
  test('renders only the approved identity and lower public labels around the frame', () => {
    const markup = renderToStaticMarkup(createElement(FrameChrome, {time: 64.06}));

    expect(markup).toContain('data-frame-chrome="public"');
    expect(markup).toContain('data-frame-chrome-border="frame"');
    expect(valuesFor(markup, 'data-frame-chrome-corner')).toEqual([
      'top-left',
      'top-right',
      'bottom-left',
      'bottom-right',
    ]);
    expect(valuesFor(markup, 'data-frame-chrome-slot')).toEqual([
      'identity',
      'track-label',
      'timecode',
    ]);
    expect(markup).toContain('TANISEA // KSVIETY');
    expect(markup).toContain('TRACK 01 · ENGLISH LYRIC FILM · VNEXT');
    expect(markup).toContain('01:04.06');
    expect(markup).not.toMatch(/RMS|dBFS|\bPK\b|60 FPS/);
  });
});

describe('public spectrum rail', () => {
  test('renders 64 measured bars and separate lighter impact caps on the 960x150 rail', () => {
    const markup = renderToStaticMarkup(
      createElement(SpectrumRail, {feature: peakFeature}),
    );
    const root = openingTagFor(markup, 'data-spectrum-rail', 'public');
    const svg = openingTagFor(markup, 'data-spectrum-svg', 'bands');
    const measured = valuesFor(markup, 'data-spectrum-measured-band');
    const caps = valuesFor(markup, 'data-spectrum-impact-band');

    expect(root).toContain('left:60px');
    expect(root).toContain('bottom:68px');
    expect(root).toContain('width:960px');
    expect(root).toContain('height:150px');
    expect(svg).toContain('width="960"');
    expect(svg).toContain('height="150"');
    expect(measured).toEqual(Array.from({length: 64}, (_, index) => String(index)));
    expect(caps).toEqual(measured);

    const peakMeasured = openingTagFor(markup, 'data-spectrum-measured-band', '0');
    const peakCap = openingTagFor(markup, 'data-spectrum-impact-band', '0');
    expect(peakMeasured).toContain('x1="7.5"');
    expect(peakMeasured).toContain('y1="132"');
    expect(peakMeasured).toContain('x2="7.5"');
    expect(peakMeasured).toContain('y2="36"');
    expect(peakMeasured).toContain('stroke-width="7"');
    expect(peakMeasured).toContain('stroke-linecap="butt"');
    expect(peakMeasured).toContain('stroke="#ff5b70"');
    expect(peakCap).toContain('x1="7.5"');
    expect(peakCap).toContain('y1="36"');
    expect(peakCap).toContain('x2="7.5"');
    expect(peakCap).toContain('y2="18"');
    expect(peakCap).toContain('stroke-width="7"');
    expect(peakCap).toContain('stroke-linecap="butt"');
    expect(peakCap).toContain('stroke="#ff5b70"');

    const quietMeasured = openingTagFor(markup, 'data-spectrum-measured-band', '1');
    expect(quietMeasured).toContain('x1="22.5"');
    expect(quietMeasured).toContain('y1="132"');
    expect(quietMeasured).toContain('y2="130"');
  });

  test('preserves the baseline and logarithmic ticks with a two-tone bar palette', () => {
    const markup = renderToStaticMarkup(
      createElement(SpectrumRail, {feature: peakFeature}),
    );

    expect(openingTagFor(markup, 'data-spectrum-baseline', 'public')).toContain('y1="132"');
    expect(markup).not.toContain('<linearGradient');
    expect(openingTagFor(markup, 'data-spectrum-measured-band', '17')).toContain('stroke="#ff5b70"');
    expect(openingTagFor(markup, 'data-spectrum-measured-band', '18')).toContain('stroke="#16e6d1"');
    expect(openingTagFor(markup, 'data-spectrum-measured-band', '51')).toContain('stroke="#16e6d1"');
    expect(openingTagFor(markup, 'data-spectrum-measured-band', '52')).toContain('stroke="#16e6d1"');
    expect(openingTagFor(markup, 'data-spectrum-measured-band', '63')).toContain('stroke="#16e6d1"');
    expect(valuesFor(markup, 'data-spectrum-tick')).toEqual([
      '20',
      '60',
      '250',
      '1K',
      '4K',
      '20K',
    ]);
    expect(markup).not.toContain('STEREO · 64 LOG BANDS · HANN · 20 HZ—20 KHZ');
  });
});

describe('landscape YouTube chrome and spectrum', () => {
  test('uses a native 1920×1080 frame rather than square coordinates', () => {
    const markup = renderToStaticMarkup(
      createElement(FrameChrome, {time: 136.06, variant: 'youtube'}),
    );

    expect(markup).toContain('data-frame-chrome="youtube"');
    expect(openingTagFor(markup, 'data-frame-chrome-border', 'frame')).toContain(
      'inset:42px',
    );
    expect(openingTagFor(markup, 'data-frame-chrome-corner', 'top-right')).toContain(
      'left:1878px;top:42px',
    );
    expect(openingTagFor(markup, 'data-frame-chrome-corner', 'bottom-left')).toContain(
      'left:42px;top:1038px',
    );
    expect(markup).toContain('02:16.06');
  });

  test('spans the landscape safe area with 64 square-ended reactive bands', () => {
    const markup = renderToStaticMarkup(
      createElement(SpectrumRail, {feature: peakFeature, variant: 'youtube'}),
    );
    const root = openingTagFor(markup, 'data-spectrum-rail', 'youtube');
    const svg = openingTagFor(markup, 'data-spectrum-svg', 'bands');
    const peak = openingTagFor(markup, 'data-spectrum-measured-band', '0');
    const cap = openingTagFor(markup, 'data-spectrum-impact-band', '0');

    expect(root).toContain('left:104px');
    expect(root).toContain('bottom:66px');
    expect(root).toContain('width:1712px');
    expect(root).toContain('height:174px');
    expect(svg).toContain('width="1712"');
    expect(svg).toContain('height="174"');
    expect(openingTagFor(markup, 'data-spectrum-baseline', 'youtube')).toContain(
      'y1="148"',
    );
    expect(peak).toContain('x1="13.375"');
    expect(peak).toContain('y1="148"');
    expect(peak).toContain('y2="52"');
    expect(peak).toContain('stroke-width="9"');
    expect(peak).toContain('stroke-linecap="butt"');
    expect(cap).toContain('y1="52"');
    expect(cap).toContain('y2="34"');
    expect(cap).toContain('stroke-width="9"');
    expect(markup.match(/data-spectrum-measured-band=/g)).toHaveLength(64);
    expect(markup).not.toContain('stroke-linecap="round"');
  });
});
