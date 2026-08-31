import type {AudioFeatureFrame} from '../audio-features';
import {getSpectrumBarGeometry} from '../spectrum-geometry';

const teal = '#16e6d1';
const mint = '#c9fff7';
const ember = '#ff5b70';
const white = '#fffdfd';

const BASELINE_Y = 132;

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
  feature: AudioFeatureFrame;
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
      shapeRendering="crispEdges"
    >
      <line
        data-spectrum-baseline="public"
        x1={0}
        y1={BASELINE_Y}
        x2={960}
        y2={BASELINE_Y}
        stroke="rgba(201,255,247,.24)"
        strokeWidth={2}
      />
      {Array.from(feature.bands).map((byte, band) => {
        const normalized = clamp((byte - 24) / 231);
        const geometry = getSpectrumBarGeometry(byte, feature.impact);
        const measuredY = BASELINE_Y - geometry.measuredHeight;
        const capY = measuredY - geometry.impactExtension;
        const color = band <= 20 ? ember : band <= 47 ? teal : mint;
        return (
          <g key={band}>
            <rect
              data-spectrum-measured-band={band}
              x={band * 15 + 3}
              y={measuredY}
              width={9}
              height={geometry.measuredHeight}
              fill={color}
              opacity={0.4 + normalized * 0.55}
            />
            <rect
              data-spectrum-impact-band={band}
              x={band * 15 + 3}
              y={capY}
              width={9}
              height={geometry.impactExtension}
              fill={white}
              opacity={0.5 + normalized * 0.42}
            />
          </g>
        );
      })}
      {frequencyTicks.map(({frequency, label}) => {
        const x = frequencyX(frequency);
        return (
          <g key={frequency}>
            <line
              x1={x}
              y1={BASELINE_Y + 1}
              x2={x}
              y2={BASELINE_Y + 6}
              stroke="rgba(201,255,247,.48)"
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
              fill="rgba(201,255,247,.52)"
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
