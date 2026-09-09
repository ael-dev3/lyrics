import {AbsoluteFill} from 'remotion';
import {isYouTubeVariant} from '../film-variant';
import type {FilmVariant} from '../film-variant';

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
  variant?: FilmVariant;
}>;

export const FrameChrome = ({
  time,
  variant = 'square',
}: FrameChromeProps) => {
  const youtube = isYouTubeVariant(variant);
  const canvasWidth = youtube ? 1920 : 1080;
  const canvasHeight = 1080;
  const inset = youtube ? 42 : 30;
  const cornerSize = youtube ? 40 : 32;
  const identityLeft = youtube ? 64 : 48;
  const identityTop = youtube ? 63 : 47;
  const bottomLabel = youtube ? 58 : 43;

  return (
    <AbsoluteFill
      data-frame-chrome={youtube ? 'youtube' : 'public'}
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
        inset,
        border: '2px solid rgba(201,255,247,.2)',
      }}
    />
    {[
      {corner: 'top-left', x: inset, y: inset, translate: '0 0'},
      {corner: 'top-right', x: canvasWidth - inset, y: inset, translate: '-100% 0'},
      {corner: 'bottom-left', x: inset, y: canvasHeight - inset, translate: '0 -100%'},
      {corner: 'bottom-right', x: canvasWidth - inset, y: canvasHeight - inset, translate: '-100% -100%'},
    ].map(({corner, x, y, translate}, index) => (
      <div
        key={corner}
        data-frame-chrome-corner={corner}
        style={{
          position: 'absolute',
          left: x,
          top: y,
          width: cornerSize,
          height: cornerSize,
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
        left: identityLeft,
        top: identityTop,
        fontSize: youtube ? 16 : 14,
        letterSpacing: youtube ? 4.1 : 3.6,
        fontWeight: 650,
      }}
    >
      TANISEA // KSVIETY
    </div>
    <div
      data-frame-chrome-slot="track-label"
      style={{
        position: 'absolute',
        left: identityLeft,
        bottom: bottomLabel,
        fontSize: youtube ? 12 : 10,
        letterSpacing: youtube ? 2.8 : 2.4,
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
        right: identityLeft,
        bottom: youtube ? 56 : 41,
        fontSize: youtube ? 14 : 12,
        letterSpacing: youtube ? 2.6 : 2.2,
        fontWeight: 650,
        fontVariantNumeric: 'tabular-nums',
        color: 'rgba(201,255,247,.68)',
      }}
    >
      {formatTime(time)}
    </div>
    </AbsoluteFill>
  );
};
