import {createElement} from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {describe, expect, test} from 'vitest';
import {SpectrumRail} from '../src/components/SpectrumRail';
import type {SmoothedSpectrumState} from '../src/spectrum-smoothing';

const spectrum: SmoothedSpectrumState = {
  bands: Uint8Array.from({length: 64}, (_, band) => band === 0 ? 255 : 0),
  impact: 1,
};

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

describe('calm spectrum rail rendering', () => {
  test('uses thin continuous lines with precise geometry and a restrained two-tone palette', () => {
    const markup = renderToStaticMarkup(
      createElement(SpectrumRail, {feature: spectrum}),
    );
    const svg = openingTagFor(markup, 'data-spectrum-svg', 'bands');
    const peak = openingTagFor(markup, 'data-spectrum-line-band', '0');
    const quiet = openingTagFor(markup, 'data-spectrum-line-band', '1');

    expect(svg).toContain('shape-rendering="geometricPrecision"');
    expect(markup).not.toContain('<linearGradient');
    expect(markup).not.toContain('<rect');
    expect(markup).not.toContain('data-spectrum-measured-band');
    expect(markup).not.toContain('data-spectrum-impact-band');
    expect(peak).toContain('x1="7.5"');
    expect(peak).toContain('x2="7.5"');
    expect(peak).toContain('y1="132"');
    expect(peak).toContain('y2="18"');
    expect(peak).toContain('stroke-width="4"');
    expect(peak).toContain('stroke-linecap="butt"');
    expect(peak).toContain('stroke="#ff5b70"');
    expect(peak).toContain('opacity="0.74"');
    expect(quiet).toContain('x1="22.5"');
    expect(quiet).toContain('y2="112"');
    expect(quiet).toContain('opacity="0.3"');
    expect(markup).not.toContain('#fffdfd');
  });

  test('keeps exactly 64 line bands while tinting every line and label with the approved palette', () => {
    const markup = renderToStaticMarkup(
      createElement(SpectrumRail, {feature: spectrum}),
    );

    expect(markup.match(/data-spectrum-line-band=/g)).toHaveLength(64);
    expect(markup).not.toContain('data-spectrum-impact-band');
    expect(
      openingTagFor(markup, 'data-spectrum-baseline', 'public'),
    ).toContain('stroke="#16e6d1"');
    expect(
      openingTagFor(markup, 'data-spectrum-baseline', 'public'),
    ).toContain('opacity="0.24"');
    expect(
      openingTagFor(markup, 'data-spectrum-tick-mark', '20'),
    ).toContain('stroke="#16e6d1"');
    expect(openingTagFor(markup, 'data-spectrum-tick', '20')).toContain(
      'fill="#c9fff7"',
    );
    const allBandTags = [
      ...markup.matchAll(
        /<line data-spectrum-line-band="\d+"[^>]*>/g,
      ),
    ].map(([tag]) => tag);
    expect(allBandTags).toHaveLength(64);
    for (const tag of allBandTags) {
      expect(tag).toMatch(/stroke="(?:#ff5b70|#16e6d1)"/);
      expect(tag).toContain('stroke-linecap="butt"');
    }
    for (const band of [0, 17]) {
      expect(
        openingTagFor(markup, 'data-spectrum-line-band', String(band)),
      ).toContain('stroke="#ff5b70"');
    }
    for (const band of [18, 51, 52, 63]) {
      expect(
        openingTagFor(markup, 'data-spectrum-line-band', String(band)),
      ).toContain('stroke="#16e6d1"');
    }
    expect(markup).not.toMatch(/(?:fill|stroke)="(?:#fffdfd|rgba\(255,255,255)/);
  });
});
