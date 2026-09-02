import {getSpectrumBarGeometry} from '../spectrum-geometry';
import type {SmoothedSpectrumState} from '../spectrum-smoothing';
import {isYouTubeVariant} from '../film-variant';
import type {FilmVariant} from '../film-variant';

const teal = '#16e6d1';
const mint = '#c9fff7';
const ember = '#ff5b70';

const spectrumBandColor = (band: number): string => {
  if (band < 18) return ember;
  return teal;
};

const clamp = (value: number, minimum = 0, maximum = 1): number =>
  Math.min(maximum, Math.max(minimum, value));

const frequencyTicks = [
  {frequency: 20, label: '20'},
  {frequency: 60, label: '60'},
  {frequency: 250, label: '250'},
  {frequency: 1000, label: '1K'},
  {frequency: 4000, label: '4K'},
  {frequency: 20_000, label: '20K'},
] as const;

const frequencyX = (frequency: number, width: number): number =>
  Math.round(
    (Math.log(frequency / 20) / Math.log(20_000 / 20)) * width,
  );

type SpectrumLayout = Readonly<{
  rail: 'public' | 'youtube';
  left: number;
  bottom: number;
  width: number;
  height: number;
  baselineY: number;
  tickY: number;
  strokeWidth: number;
  tickFontSize: number;
}>;

const spectrumLayoutFor = (variant: FilmVariant): SpectrumLayout =>
  isYouTubeVariant(variant)
    ? {
        rail: 'youtube',
        left: 104,
        bottom: 66,
        width: 1712,
        height: 174,
        baselineY: 148,
        tickY: 171,
        strokeWidth: 9,
        tickFontSize: 9,
      }
    : {
        rail: 'public',
        left: 60,
        bottom: 68,
        width: 960,
        height: 150,
        baselineY: 132,
        tickY: 148,
        strokeWidth: 7,
        tickFontSize: 7,
      };

export type SpectrumRailProps = Readonly<{
  feature: SmoothedSpectrumState;
  variant?: FilmVariant;
}>;

export const SpectrumRail = ({
  feature,
  variant = 'square',
}: SpectrumRailProps) => {
  const layout = spectrumLayoutFor(variant);
  const bandWidth = layout.width / 64;

  return (
  <div
    data-spectrum-rail={layout.rail}
    style={{
      position: 'absolute',
      left: layout.left,
      bottom: layout.bottom,
      width: layout.width,
      height: layout.height,
      color: mint,
      fontFamily: 'Space Grotesk',
      pointerEvents: 'none',
    }}
  >
    <svg
      data-spectrum-svg="bands"
      width={layout.width}
      height={layout.height}
      viewBox={`0 0 ${layout.width} ${layout.height}`}
      style={{position: 'absolute', inset: 0}}
      shapeRendering="geometricPrecision"
    >
      <line
        data-spectrum-baseline={layout.rail}
        x1={0}
        y1={layout.baselineY}
        x2={layout.width}
        y2={layout.baselineY}
        stroke={teal}
        opacity={0.24}
        strokeWidth={1}
      />
      {Array.from(feature.bands).map((byte, band) => {
        const normalized = clamp((byte - 24) / 231);
        const geometry = getSpectrumBarGeometry(byte, feature.impact);
        const measuredY = layout.baselineY - geometry.measuredHeight;
        const capY = measuredY - geometry.impactExtension;
        const x = band * bandWidth + bandWidth / 2;
        const fill = spectrumBandColor(band);
        return (
          <g key={band}>
            <line
              data-spectrum-measured-band={band}
              x1={x}
              y1={layout.baselineY}
              x2={x}
              y2={measuredY}
              stroke={fill}
              strokeWidth={layout.strokeWidth}
              strokeLinecap="butt"
              opacity={Number((0.34 + normalized * 0.5).toFixed(2))}
            />
            {geometry.impactExtension > 0 ? (
              <line
                data-spectrum-impact-band={band}
                x1={x}
              y1={measuredY}
              x2={x}
              y2={capY}
              stroke={fill}
              strokeWidth={layout.strokeWidth}
                strokeLinecap="butt"
                opacity={Number((0.38 + normalized * 0.34).toFixed(2))}
              />
            ) : null}
          </g>
        );
      })}
      {frequencyTicks.map(({frequency, label}) => {
        const x = frequencyX(frequency, layout.width);
        return (
          <g key={frequency}>
            <line
              data-spectrum-tick-mark={label}
              x1={x}
              y1={layout.baselineY + 1}
              x2={x}
              y2={layout.baselineY + 6}
              stroke={teal}
              opacity={0.38}
              strokeWidth={1}
            />
            <text
              data-spectrum-tick={label}
              x={x}
              y={layout.tickY}
              textAnchor={
                frequency === 20
                  ? 'start'
                  : frequency === 20_000
                    ? 'end'
                    : 'middle'
              }
              fill={mint}
              opacity={0.52}
              fontFamily="Space Grotesk"
              fontSize={layout.tickFontSize}
              fontWeight={600}
            >
              {label}
            </text>
          </g>
        );
      })}
    </svg>
  </div>
  );
};
