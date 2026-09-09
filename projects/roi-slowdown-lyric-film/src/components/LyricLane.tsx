import {AbsoluteFill} from 'remotion';
import {frameForSample} from '../timing';
import type {LyricLine, SongId} from '../timing';

type LyricLaneProps = Readonly<{
  songId: SongId;
  title: string;
  line: LyricLine | undefined;
  frame: number;
  fps: number;
}>;

const COLORS = {
  'song-1': {accent: '#ffd59e', dim: 'rgba(255,213,158,.38)', glow: 'rgba(255,183,94,.42)'},
  'song-2': {accent: '#a7e8ff', dim: 'rgba(167,232,255,.38)', glow: 'rgba(90,196,255,.42)'},
} as const;

const clamp = (value: number, minimum = 0, maximum = 1): number =>
  Math.min(maximum, Math.max(minimum, value));

const smoothstep = (edge0: number, edge1: number, value: number): number => {
  const t = clamp((value - edge0) / Math.max(0.0001, edge1 - edge0));
  return t * t * (3 - 2 * t);
};

const progressFor = (line: LyricLine, frame: number, fps: number): number =>
  smoothstep(
    frameForSample(line.startSample, fps),
    frameForSample(line.endSample, fps),
    frame,
  );

export const LyricLane = ({songId, title, line, frame, fps}: LyricLaneProps) => {
  const palette = COLORS[songId];
  if (!line) {
    return (
      <AbsoluteFill data-lyric-lane={songId} style={{pointerEvents: 'none'}}>
        <div style={{position: 'absolute', left: 180, top: songId === 'song-1' ? 205 : 565, fontFamily: 'Space Grotesk', fontSize: 18, letterSpacing: 4, color: palette.dim}}>
          {songId === 'song-1' ? 'SONG 1 · ROI' : 'SONG 2 · SLOW DOWN'}
        </div>
      </AbsoluteFill>
    );
  }

  const startFrame = frameForSample(line.startSample, fps);
  const endFrame = frameForSample(line.endSample, fps);
  const entrance = smoothstep(startFrame - Math.round(fps * 0.18), startFrame, frame);
  const exit = 1 - smoothstep(endFrame, endFrame + Math.round(fps * 0.2), frame);
  const opacity = entrance * exit;
  const wordDuration = Math.max(1, endFrame - startFrame);
  const top = songId === 'song-1' ? 205 : 565;

  return (
    <AbsoluteFill
      data-lyric-lane={songId}
      data-lyric-line-id={line.id}
      style={{pointerEvents: 'none', opacity, fontFamily: 'Space Grotesk', color: '#fffdf7'}}
    >
      <div style={{position: 'absolute', left: 180, right: 180, top}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 18, color: palette.accent, fontSize: 18, letterSpacing: 4, fontWeight: 700}}>
          <span>{songId === 'song-1' ? 'SONG 1' : 'SONG 2'}</span>
          <span style={{width: 56, height: 2, background: palette.accent, opacity: 0.7}} />
          <span>{title.toUpperCase()}</span>
          <span style={{marginLeft: 'auto', fontSize: 13, letterSpacing: 2.5, opacity: 0.68}}>{line.section}</span>
        </div>
        <div
          data-lyric-text={songId}
          style={{marginTop: 28, display: 'flex', flexWrap: 'wrap', columnGap: 15, rowGap: 6, fontSize: songId === 'song-1' ? 49 : 54, lineHeight: 1.12, fontWeight: 650, letterSpacing: -1.25, textShadow: '0 4px 18px rgba(0,0,0,.62)'}}
        >
          {line.words.map((word) => {
            const wordStart = frameForSample(word.startSample, fps);
            const wordEnd = frameForSample(word.endSample, fps);
            const active = frame >= wordStart && frame < wordEnd;
            const wordProgress = clamp((frame - wordStart + 1) / Math.max(1, wordEnd - wordStart));
            return (
              <span key={word.id} data-lyric-word-id={word.id} style={{position: 'relative', display: 'inline-block', color: active ? '#fffdf7' : palette.dim, fontWeight: active ? 800 : 620, transform: `translateY(${active ? Math.round((1 - wordProgress) * -2) : 0}px)`, textShadow: active ? `0 0 16px ${palette.glow}, 0 4px 18px rgba(0,0,0,.7)` : '0 4px 18px rgba(0,0,0,.62)'}}>
                {word.text}
                <span aria-hidden="true" style={{position: 'absolute', left: 0, right: 0, bottom: -9, height: 3, transformOrigin: 'left center', transform: `scaleX(${active ? wordProgress : 0})`, background: palette.accent, opacity: active ? 0.95 : 0}} />
              </span>
            );
          })}
        </div>
        <div style={{marginTop: 27, height: 3, width: '100%', background: 'rgba(255,255,255,.13)'}}>
          <div data-lyric-progress={songId} style={{height: 3, width: `${Math.round(progressFor(line, frame, fps) * 1000) / 10}%`, background: `linear-gradient(90deg, ${palette.accent}, rgba(255,255,255,.9))`}} />
        </div>
        <div style={{marginTop: 11, color: palette.dim, fontSize: 12, letterSpacing: 2.8, fontVariantNumeric: 'tabular-nums'}}>
          {line.id} · {line.startSample.toLocaleString()}–{line.endSample.toLocaleString()} SAMPLES · {((line.startSample / 44_100)).toFixed(3)}–{((line.endSample / 44_100)).toFixed(3)} S
        </div>
      </div>
    </AbsoluteFill>
  );
};
