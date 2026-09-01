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
  test('uses rounded 7 px bars, precise geometry, and a continuous colour progression', () => {
    const markup = renderToStaticMarkup(
      createElement(SpectrumRail, {feature: spectrum}),
    );
    const svg = openingTagFor(markup, 'data-spectrum-svg', 'bands');
    const measured = openingTagFor(markup, 'data-spectrum-measured-band', '0');
    const cap = openingTagFor(markup, 'data-spectrum-impact-band', '0');

    expect(svg).toContain('shape-rendering="geometricPrecision"');
    expect(markup).toContain('id="spectrum-band-gradient"');
    expect(markup).toContain('offset="0%" stop-color="#ff5b70"');
    expect(markup).toContain('offset="52%" stop-color="#16e6d1"');
    expect(markup).toContain('offset="100%" stop-color="#c9fff7"');
    expect(measured).toContain('x="4"');
    expect(measured).toContain('width="7"');
    expect(measured).toContain('rx="3"');
    expect(measured).toContain('fill="url(#spectrum-band-gradient)"');
    expect(measured).toContain('opacity="0.78"');
    expect(cap).toContain('x="4"');
    expect(cap).toContain('width="7"');
    expect(cap).toContain('rx="3"');
    expect(cap).toContain('opacity="0.52"');
  });

  test('keeps all measured bars and caps while softening baseline and tick contrast', () => {
    const markup = renderToStaticMarkup(
      createElement(SpectrumRail, {feature: spectrum}),
    );

    expect(markup.match(/data-spectrum-measured-band=/g)).toHaveLength(64);
    expect(markup.match(/data-spectrum-impact-band=/g)).toHaveLength(64);
    expect(
      openingTagFor(markup, 'data-spectrum-baseline', 'public'),
    ).toContain('stroke="rgba(201,255,247,.14)"');
    expect(markup).toContain('fill="rgba(201,255,247,.34)"');
  });
});
