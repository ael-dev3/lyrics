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
  test('uses square-ended 7 px lines, precise geometry, and a restrained two-tone palette', () => {
    const markup = renderToStaticMarkup(
      createElement(SpectrumRail, {feature: spectrum}),
    );
    const svg = openingTagFor(markup, 'data-spectrum-svg', 'bands');
    const measured = openingTagFor(markup, 'data-spectrum-measured-band', '0');
    const cap = openingTagFor(markup, 'data-spectrum-impact-band', '0');

    expect(svg).toContain('shape-rendering="geometricPrecision"');
    expect(markup).not.toContain('<linearGradient');
    expect(measured).toContain('x1="7.5"');
    expect(measured).toContain('x2="7.5"');
    expect(measured).toContain('stroke-width="7"');
    expect(measured).toContain('stroke-linecap="butt"');
    expect(measured).toContain('stroke="#ff5b70"');
    expect(measured).toContain('opacity="0.84"');
    expect(cap).toContain('x1="7.5"');
    expect(cap).toContain('x2="7.5"');
    expect(cap).toContain('stroke-width="7"');
    expect(cap).toContain('stroke-linecap="butt"');
    expect(cap).toContain('stroke="#ff5b70"');
    expect(cap).toContain('opacity="0.72"');
    expect(markup).not.toContain('rx="');
    expect(markup).not.toContain('stroke-linecap="round"');
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
    const allBarTags = [
      ...markup.matchAll(
        /<line data-spectrum-(?:measured|impact)-band="\d+"[^>]*>/g,
      ),
    ].map(([tag]) => tag);
    expect(allBarTags).toHaveLength(128);
    for (const tag of allBarTags) {
      expect(tag).toMatch(/stroke="(?:#ff5b70|#16e6d1)"/);
      expect(tag).toContain('stroke-linecap="butt"');
    }
    for (const band of [0, 17]) {
      expect(
        openingTagFor(markup, 'data-spectrum-measured-band', String(band)),
      ).toContain('stroke="#ff5b70"');
      expect(
        openingTagFor(markup, 'data-spectrum-impact-band', String(band)),
      ).toContain('stroke="#ff5b70"');
    }
    for (const band of [18, 51, 52, 63]) {
      expect(
        openingTagFor(markup, 'data-spectrum-measured-band', String(band)),
      ).toContain('stroke="#16e6d1"');
      expect(
        openingTagFor(markup, 'data-spectrum-impact-band', String(band)),
      ).toContain('stroke="#16e6d1"');
    }
    expect(markup).not.toMatch(/(?:fill|stroke)="(?:#fffdfd|rgba\(255,255,255)/);
  });

  test('does not emit isolated transient dots for a zero-impact frame', () => {
    const markup = renderToStaticMarkup(
      createElement(SpectrumRail, {
        feature: {bands: new Uint8Array(64), impact: 0},
      }),
    );

    expect(markup).not.toContain('data-spectrum-impact-band=');
    expect(markup).not.toContain('stroke-linecap="round"');
    expect(markup).not.toContain('rx="');
  });
});
