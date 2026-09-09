import {AbsoluteFill} from 'remotion';
import {calmWavePath} from '../visualizer';

type CalmVisualizerProps = Readonly<{
  seconds: number;
  energy: number;
  phase: number;
}>;

const song1Color = '#ffd59e';
const song2Color = '#a7e8ff';

export const CalmVisualizer = ({seconds, energy, phase}: CalmVisualizerProps) => {
  const pulse = 0.86 + energy * 0.14;
  return (
    <AbsoluteFill
      data-visualizer="calm-dual-rail"
      style={{pointerEvents: 'none', opacity: 0.96}}
    >
      <svg
        width={1920}
        height={1080}
        viewBox="0 0 1920 1080"
        style={{position: 'absolute', inset: 0}}
        shapeRendering="geometricPrecision"
      >
        <defs>
          <filter id="soft-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="9" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <path
          d={calmWavePath({width: 1560, centerY: 464, amplitude: 26, phase: phase + 0.4, energy})}
          transform="translate(180 0)"
          fill="none"
          stroke={song1Color}
          strokeWidth={9}
          opacity={0.12 * pulse}
          filter="url(#soft-glow)"
        />
        <path
          data-visualizer-line="song-1"
          d={calmWavePath({width: 1560, centerY: 464, amplitude: 26, phase: phase + 0.4, energy})}
          transform="translate(180 0)"
          fill="none"
          stroke={song1Color}
          strokeWidth={2.4}
          strokeLinecap="butt"
          opacity={0.46 + energy * 0.12}
        />
        <path
          d={calmWavePath({width: 1560, centerY: 770, amplitude: 22, phase: phase + 2.05, energy: energy * 0.88})}
          transform="translate(180 0)"
          fill="none"
          stroke={song2Color}
          strokeWidth={9}
          opacity={0.11 * pulse}
          filter="url(#soft-glow)"
        />
        <path
          data-visualizer-line="song-2"
          d={calmWavePath({width: 1560, centerY: 770, amplitude: 22, phase: phase + 2.05, energy: energy * 0.88})}
          transform="translate(180 0)"
          fill="none"
          stroke={song2Color}
          strokeWidth={2.4}
          strokeLinecap="butt"
          opacity={0.42 + energy * 0.12}
        />
        <line x1={180} y1={464} x2={1740} y2={464} stroke={song1Color} strokeWidth={1} opacity={0.16} />
        <line x1={180} y1={770} x2={1740} y2={770} stroke={song2Color} strokeWidth={1} opacity={0.14} />
      </svg>
      <div
        style={{
          position: 'absolute',
          left: 180,
          right: 180,
          top: 492,
          height: 1,
          background: 'linear-gradient(90deg, transparent, rgba(255,255,255,.13), transparent)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: 180,
          right: 180,
          top: 798,
          height: 1,
          background: 'linear-gradient(90deg, transparent, rgba(255,255,255,.11), transparent)',
        }}
      />
      <span data-visualizer-seconds={seconds.toFixed(3)} style={{display: 'none'}} />
    </AbsoluteFill>
  );
};
