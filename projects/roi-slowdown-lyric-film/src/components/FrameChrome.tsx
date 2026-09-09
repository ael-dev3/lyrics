import {AbsoluteFill} from 'remotion';

const formatTime = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const wholeSeconds = Math.floor(seconds % 60);
  const frames = Math.floor((seconds % 1) * 60);
  return `${String(minutes).padStart(2, '0')}:${String(wholeSeconds).padStart(2, '0')}:${String(frames).padStart(2, '0')}`;
};

export const FrameChrome = ({seconds}: Readonly<{seconds: number}>) => (
  <AbsoluteFill data-frame-chrome="public" style={{pointerEvents: 'none', fontFamily: 'Space Grotesk', color: 'rgba(255,255,255,.72)'}}>
    <div style={{position: 'absolute', inset: 34, border: '1px solid rgba(255,255,255,.18)'}} />
    <div style={{position: 'absolute', left: 72, top: 62, fontSize: 14, letterSpacing: 4.2, fontWeight: 700}}>ROI × SLOW DOWN</div>
    <div style={{position: 'absolute', left: 72, bottom: 60, fontSize: 12, letterSpacing: 3.2, opacity: 0.62}}>DUAL-SONG LYRIC FILM · 1080P60 · SAMPLE LOCKED</div>
    <div style={{position: 'absolute', right: 72, bottom: 58, fontSize: 15, letterSpacing: 2.5, fontVariantNumeric: 'tabular-nums'}}>{formatTime(seconds)}</div>
  </AbsoluteFill>
);
