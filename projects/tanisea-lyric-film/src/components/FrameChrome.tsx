import {AbsoluteFill} from 'remotion';

const teal = '#16e6d1';
const mint = '#c9fff7';

const formatTime = (time: number): string => {
  const minutes = Math.floor(time / 60);
  const seconds = Math.floor(time % 60);
  const centiseconds = Math.floor((time % 1) * 100);
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}.${String(centiseconds).padStart(2, '0')}`;
};

export type FrameChromeProps = Readonly<{
  time: number;
}>;

export const FrameChrome = ({time}: FrameChromeProps) => (
  <AbsoluteFill
    data-frame-chrome="public"
    style={{
      color: mint,
      fontFamily: 'Space Grotesk',
      pointerEvents: 'none',
    }}
  >
    <div
      data-frame-chrome-border="frame"
      style={{
        position: 'absolute',
        inset: 30,
        border: '2px solid rgba(201,255,247,.2)',
      }}
    />
    {[
      {corner: 'top-left', x: 30, y: 30, translate: '0 0'},
      {corner: 'top-right', x: 1050, y: 30, translate: '-100% 0'},
      {corner: 'bottom-left', x: 30, y: 1050, translate: '0 -100%'},
      {corner: 'bottom-right', x: 1050, y: 1050, translate: '-100% -100%'},
    ].map(({corner, x, y, translate}, index) => (
      <div
        key={corner}
        data-frame-chrome-corner={corner}
        style={{
          position: 'absolute',
          left: x,
          top: y,
          width: 32,
          height: 32,
          transform: `translate(${translate})`,
          borderLeft: index % 2 === 0 ? `4px solid ${teal}` : undefined,
          borderRight: index % 2 === 1 ? `4px solid ${teal}` : undefined,
          borderTop: index < 2 ? `4px solid ${teal}` : undefined,
          borderBottom: index >= 2 ? `4px solid ${teal}` : undefined,
        }}
      />
    ))}
    <div
      data-frame-chrome-slot="identity"
      style={{
        position: 'absolute',
        left: 48,
        top: 47,
        fontSize: 14,
        letterSpacing: 3.6,
        fontWeight: 650,
      }}
    >
      TANISEA // KSVIETY
    </div>
    <div
      data-frame-chrome-slot="track-label"
      style={{
        position: 'absolute',
        left: 48,
        bottom: 43,
        fontSize: 10,
        letterSpacing: 2.4,
        fontWeight: 600,
        color: 'rgba(201,255,247,.54)',
      }}
    >
      TRACK 01 · ENGLISH LYRIC FILM · VNEXT
    </div>
    <div
      data-frame-chrome-slot="timecode"
      style={{
        position: 'absolute',
        right: 48,
        bottom: 41,
        fontSize: 12,
        letterSpacing: 2.2,
        fontWeight: 650,
        fontVariantNumeric: 'tabular-nums',
        color: 'rgba(201,255,247,.68)',
      }}
    >
      {formatTime(time)}
    </div>
  </AbsoluteFill>
);
