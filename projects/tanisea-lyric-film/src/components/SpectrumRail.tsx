import {getSpectrumBarGeometry} from '../spectrum-geometry';
import type {SmoothedSpectrumState} from '../spectrum-smoothing';

const teal = '#16e6d1';
const mint = '#c9fff7';
const ember = '#ff5b70';

const BASELINE_Y = 132;

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

const frequencyX = (frequency: number): number =>
  Math.round(
    (Math.log(frequency / 20) / Math.log(20_000 / 20)) * 960,
  );

export type SpectrumRailProps = Readonly<{
  feature: SmoothedSpectrumState;
}>;

export const SpectrumRail = ({feature}: SpectrumRailProps) => (
  <div
    data-spectrum-rail="public"
    style={{
      position: 'absolute',
      left: 60,
      bottom: 68,
      width: 960,
      height: 150,
      color: mint,
      fontFamily: 'Space Grotesk',
      pointerEvents: 'none',
    }}
  >
    <svg
      data-spectrum-svg="bands"
      width={960}
      height={150}
      viewBox="0 0 960 150"
      style={{position: 'absolute', inset: 0}}
      shapeRendering="geometricPrecision"
    >
      <line
        data-spectrum-baseline="public"
        x1={0}
        y1={BASELINE_Y}
        x2={960}
        y2={BASELINE_Y}
        stroke={teal}
        opacity={0.24}
        strokeWidth={1}
      />
      {Array.from(feature.bands).map((byte, band) => {
        const normalized = clamp((byte - 24) / 231);
        const geometry = getSpectrumBarGeometry(byte, feature.impact);
        const measuredY = BASELINE_Y - geometry.measuredHeight;
        const capY = measuredY - geometry.impactExtension;
        const fill = spectrumBandColor(band);
        return (
          <g key={band}>
            <rect
              data-spectrum-measured-band={band}
              x={band * 15 + 4}
              y={measuredY}
              width={7}
              height={geometry.measuredHeight}
              rx={3}
              fill={fill}
              opacity={Number((0.34 + normalized * 0.5).toFixed(2))}
            />
            <rect
              data-spectrum-impact-band={band}
              x={band * 15 + 4}
              y={capY}
              width={7}
              height={geometry.impactExtension}
              rx={3}
              fill={fill}
              opacity={Number((0.38 + normalized * 0.34).toFixed(2))}
            />
          </g>
        );
      })}
      {frequencyTicks.map(({frequency, label}) => {
        const x = frequencyX(frequency);
        return (
          <g key={frequency}>
            <line
              data-spectrum-tick-mark={label}
              x1={x}
              y1={BASELINE_Y + 1}
              x2={x}
              y2={BASELINE_Y + 6}
              stroke={teal}
              opacity={0.38}
              strokeWidth={1}
            />
            <text
              data-spectrum-tick={label}
              x={x}
              y={148}
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
              fontSize={7}
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
