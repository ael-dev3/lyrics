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
  test('uses rounded 7 px bars, precise geometry, and a restrained two-tone palette', () => {
    const markup = renderToStaticMarkup(
      createElement(SpectrumRail, {feature: spectrum}),
    );
    const svg = openingTagFor(markup, 'data-spectrum-svg', 'bands');
    const measured = openingTagFor(markup, 'data-spectrum-measured-band', '0');
    const cap = openingTagFor(markup, 'data-spectrum-impact-band', '0');

    expect(svg).toContain('shape-rendering="geometricPrecision"');
    expect(markup).not.toContain('<linearGradient');
    expect(measured).toContain('x="4"');
    expect(measured).toContain('width="7"');
    expect(measured).toContain('rx="3"');
    expect(measured).toContain('fill="#ff5b70"');
    expect(measured).toContain('opacity="0.84"');
    expect(cap).toContain('x="4"');
    expect(cap).toContain('width="7"');
    expect(cap).toContain('rx="3"');
    expect(cap).toContain('fill="#ff5b70"');
    expect(cap).toContain('opacity="0.72"');
    expect(
      openingTagFor(markup, 'data-spectrum-measured-band', '1'),
    ).toContain('opacity="0.34"');
    expect(
      openingTagFor(markup, 'data-spectrum-impact-band', '1'),
    ).toContain('opacity="0.38"');
    expect(markup).not.toContain('#fffdfd');
  });

  test('keeps all rail geometry while tinting every line and label with the approved palette', () => {
    const markup = renderToStaticMarkup(
      createElement(SpectrumRail, {feature: spectrum}),
    );

    expect(markup.match(/data-spectrum-measured-band=/g)).toHaveLength(64);
    expect(markup.match(/data-spectrum-impact-band=/g)).toHaveLength(64);
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
    for (const band of [0, 17]) {
      expect(
        openingTagFor(markup, 'data-spectrum-measured-band', String(band)),
      ).toContain('fill="#ff5b70"');
      expect(
        openingTagFor(markup, 'data-spectrum-impact-band', String(band)),
      ).toContain('fill="#ff5b70"');
    }
    for (const band of [18, 51, 52, 63]) {
      expect(
        openingTagFor(markup, 'data-spectrum-measured-band', String(band)),
      ).toContain('fill="#16e6d1"');
      expect(
        openingTagFor(markup, 'data-spectrum-impact-band', String(band)),
      ).toContain('fill="#16e6d1"');
    }
    expect(markup).not.toMatch(/(?:fill|stroke)="(?:#fffdfd|rgba\(255,255,255)/);
  });
});
