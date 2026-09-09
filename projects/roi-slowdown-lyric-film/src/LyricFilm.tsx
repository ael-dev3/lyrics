import {OffthreadVideo, AbsoluteFill, interpolate, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {dualSongAlignment, getActiveLines} from './lyrics';
import {featureAtTime} from './visualizer';
import {CalmVisualizer} from './components/CalmVisualizer';
import {FrameChrome} from './components/FrameChrome';
import {LyricLane} from './components/LyricLane';

export type LyricFilmProps = Readonly<{showProof?: boolean; transparentBackground?: boolean}>;

const clamp = (value: number, minimum = 0, maximum = 1): number => Math.min(maximum, Math.max(minimum, value));

const GlobalStyles = () => (
  <style>{`
    @font-face { font-family: 'Space Grotesk'; src: url('${staticFile('SpaceGrotesk.ttf')}') format('truetype'); font-weight: 300 800; }
    @font-face { font-family: 'Bebas Neue'; src: url('${staticFile('BebasNeue.ttf')}') format('truetype'); font-weight: 400; }
    * { box-sizing: border-box; font-synthesis: none; text-rendering: geometricPrecision; }
    body { margin: 0; background: #071017; }
  `}</style>
);

const Background = () => (
  <AbsoluteFill style={{background: '#071017', overflow: 'hidden'}}>
    <OffthreadVideo
      src={staticFile('source-video.mp4')}
      volume={1}
      style={{position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(.62) saturate(.86) contrast(1.05)'}}
    />
    <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(3,10,16,.54) 0%, rgba(3,10,16,.16) 42%, rgba(3,10,16,.72) 100%)'}} />
    <AbsoluteFill style={{background: 'linear-gradient(90deg, rgba(255,179,94,.08) 0%, transparent 42%, rgba(90,196,255,.1) 100%)', mixBlendMode: 'screen'}} />
    <AbsoluteFill style={{background: 'radial-gradient(circle at 50% 52%, transparent 18%, rgba(3,8,14,.18) 66%, rgba(3,8,14,.68) 100%)'}} />
  </AbsoluteFill>
);

const TitleCard = ({seconds}: Readonly<{seconds: number}>) => {
  const fadeIn = interpolate(seconds, [0.3, 1.4], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const fadeOut = interpolate(seconds, [4.3, 5.5], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const opacity = fadeIn * fadeOut;
  if (opacity <= 0) return null;
  return (
    <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', color: '#fffdf7', fontFamily: 'Space Grotesk', opacity}}>
      <div style={{fontSize: 18, letterSpacing: 7, color: '#ffd59e', fontWeight: 700}}>DUAL-SONG LYRIC FILM</div>
      <div style={{marginTop: 22, fontFamily: 'Bebas Neue', fontSize: 138, letterSpacing: 4, lineHeight: .86}}>ROI × SLOW DOWN</div>
      <div style={{marginTop: 27, fontSize: 15, letterSpacing: 4, color: '#a7e8ff'}}>TWO VOCALS · ONE MIX · SAMPLE-LOCKED TIMING</div>
    </AbsoluteFill>
  );
};

export const LyricFilm = ({showProof = false, transparentBackground = false}: LyricFilmProps) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const seconds = frame / fps;
  const active = getActiveLines(seconds);
  const feature = featureAtTime(seconds);
  const watermarkOpacity = clamp(interpolate(seconds, [5.4, 6.4], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}));

  return (
    <AbsoluteFill style={{background: transparentBackground ? 'transparent' : '#071017', overflow: 'hidden'}}>
      <GlobalStyles />
      {transparentBackground ? null : <Background />}
      <TitleCard seconds={seconds} />
      <CalmVisualizer seconds={seconds} energy={feature.energy} phase={feature.phase} />
      <LyricLane songId="song-1" title={dualSongAlignment.songs[0].title} line={active.song1[0]} frame={frame} fps={fps} />
      <LyricLane songId="song-2" title="SLOW DOWN" line={active.song2[0]} frame={frame} fps={fps} />
      <div style={{position: 'absolute', top: 126, left: 180, right: 180, display: 'flex', justifyContent: 'space-between', fontFamily: 'Space Grotesk', fontSize: 13, letterSpacing: 3.2, color: 'rgba(255,255,255,.68)', opacity: watermarkOpacity}}>
        <span>SONG 1 · FRANÇAIS</span>
        <span>SONG 2 · ENGLISH</span>
      </div>
      <FrameChrome seconds={seconds} />
      {showProof ? <ProofOverlay seconds={seconds} frame={frame} fps={fps} /> : null}
    </AbsoluteFill>
  );
};

const ProofOverlay = ({seconds, frame, fps}: Readonly<{seconds: number; frame: number; fps: number}>) => {
  const active = getActiveLines(seconds);
  const line1 = active.song1[0];
  const line2 = active.song2[0];
  return (
    <div data-sync-proof-overlay="true" style={{position: 'absolute', left: 48, right: 48, bottom: 42, padding: '18px 22px', border: '2px solid rgba(255,220,125,.94)', borderRadius: 8, background: 'rgba(3,8,14,.88)', color: '#fffdf7', fontFamily: 'Space Grotesk', fontSize: 16, lineHeight: 1.4, letterSpacing: .4, pointerEvents: 'none'}}>
      <div style={{display: 'flex', justifyContent: 'space-between', color: '#ffdc7d', fontSize: 14, letterSpacing: 2.4, fontWeight: 750}}>
        <span>SYNC PROOF · DUAL TRACK</span><span>FRAME {frame} · {fps} FPS · {seconds.toFixed(3)} S</span>
      </div>
      <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 20px', marginTop: 12}}>
        <div>SONG 1 · {line1?.id ?? 'IDLE'} · {line1 ? `${line1.startSample}–${line1.endSample}` : '—'} samples</div>
        <div>SONG 2 · {line2?.id ?? 'IDLE'} · {line2 ? `${line2.startSample}–${line2.endSample}` : '—'} samples</div>
        <div style={{gridColumn: '1 / -1', color: 'rgba(255,255,255,.65)'}}>Frame-boundary error is computed from each integer-sample onset in the release timing report.</div>
      </div>
    </div>
  );
};
