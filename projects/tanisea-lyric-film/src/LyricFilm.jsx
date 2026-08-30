import React, {useMemo} from 'react';
import {
  AbsoluteFill,
  Img,
  interpolate,
  random,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import {Audio} from '@remotion/media';
import {useAudioData, visualizeAudio} from '@remotion/media-utils';
import {lyrics} from './timed-lyrics';

const teal = '#10e0cc';
const mint = '#b8fff4';
const wine = '#330810';
const ember = '#ff5368';

const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value));
const fade = (time, start, end, edge = 0.45) => {
  const enter = clamp((time - start) / edge);
  const exit = clamp((end - time) / edge);
  return Math.min(enter, exit);
};

const mean = (items) => items.reduce((sum, value) => sum + value, 0) / Math.max(1, items.length);

const spectrumToBands = (spectrum, count = 56) => {
  if (!spectrum.length) return Array.from({length: count}, () => 0);
  const lowBin = 1;
  const highBin = spectrum.length - 1;
  const ratio = highBin / lowBin;

  return Array.from({length: count}, (_, index) => {
    const startFloat = lowBin * Math.pow(ratio, index / count);
    const endFloat = lowBin * Math.pow(ratio, (index + 1) / count);
    const start = Math.max(lowBin, Math.floor(startFloat));
    const end = Math.min(highBin + 1, Math.max(start + 1, Math.ceil(endFloat)));
    const slice = spectrum.slice(start, end);
    const peak = Math.max(...slice, 0);
    const average = mean(slice);
    const frequencyPosition = index / Math.max(1, count - 1);
    const gain = 2.2 + frequencyPosition * 5.2;
    return clamp(Math.pow((peak * 0.72 + average * 0.4) * gain, 0.58));
  });
};

const GlobalStyles = () => (
  <style>{`
    @font-face {font-family: 'Space Grotesk'; src: url('${staticFile('SpaceGrotesk.ttf')}') format('truetype'); font-weight: 300 700;}
    @font-face {font-family: 'Bebas Neue'; src: url('${staticFile('BebasNeue.ttf')}') format('truetype'); font-weight: 400;}
    * {box-sizing: border-box;}
  `}</style>
);

const Artwork = ({time, energy}) => {
  const zoom = 1.075 + time * 0.0003 + Math.sin(time * 0.16) * 0.016 + energy * 0.018;
  const x = Math.sin(time * 0.085) * 10;
  const y = Math.cos(time * 0.071) * 9;
  const shock = energy > 0.16 ? (energy - 0.16) * 28 : 0;

  return (
    <AbsoluteFill style={{overflow: 'hidden', background: wine}}>
      <Img
        src={staticFile('artwork.png')}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          transform: `translate(${x}px, ${y}px) scale(${zoom})`,
          filter: `contrast(${1.07 + energy * 0.7}) saturate(${0.92 + energy * 0.8}) brightness(${0.62 + energy * 0.45})`,
        }}
      />
      <Img
        src={staticFile('artwork.png')}
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          transform: `translate(${x + shock}px, ${y}px) scale(${zoom})`,
          mixBlendMode: 'screen',
          opacity: clamp((energy - 0.13) * 1.8, 0, 0.18),
          filter: 'saturate(1.8) hue-rotate(16deg)',
        }}
      />
      <AbsoluteFill
        style={{
          background: 'radial-gradient(circle at 43% 42%, transparent 12%, rgba(15,1,8,.12) 48%, rgba(19,0,8,.78) 100%)',
        }}
      />
      <AbsoluteFill
        style={{
          background: 'linear-gradient(180deg, rgba(36,2,9,.08) 30%, rgba(28,1,8,.86) 100%)',
        }}
      />
    </AbsoluteFill>
  );
};

const Atmosphere = ({frame, energy}) => {
  const particles = useMemo(
    () => Array.from({length: 42}, (_, i) => ({
      x: random(`px-${i}`) * 1080,
      y: random(`py-${i}`) * 1080,
      size: 1 + random(`ps-${i}`) * 4,
      speed: 0.25 + random(`pv-${i}`) * 0.8,
      phase: random(`pp-${i}`) * 300,
    })),
    [],
  );

  return (
    <AbsoluteFill style={{overflow: 'hidden', pointerEvents: 'none'}}>
      <svg width="1080" height="1080" style={{position: 'absolute', inset: 0, opacity: 0.34 + energy}}>
        {particles.map((p, i) => {
          const y = (p.y - (frame + p.phase) * p.speed + 1300) % 1300 - 100;
          const pulse = 0.5 + Math.sin(frame * 0.045 + i) * 0.5;
          return <circle key={i} cx={p.x} cy={y} r={p.size + energy * 5} fill={i % 4 === 0 ? ember : teal} opacity={0.12 + pulse * 0.42} />;
        })}
      </svg>
      <AbsoluteFill
        style={{
          opacity: 0.13,
          backgroundImage: 'repeating-linear-gradient(0deg, transparent 0px, transparent 3px, rgba(184,255,244,.16) 4px)',
          mixBlendMode: 'screen',
        }}
      />
      <AbsoluteFill
        style={{
          opacity: 0.17,
          backgroundImage: 'radial-gradient(rgba(255,255,255,.5) .55px, transparent .65px)',
          backgroundSize: '5px 5px',
          transform: `translate(${frame % 5}px, ${(frame * 0.57) % 5}px)`,
          mixBlendMode: 'overlay',
        }}
      />
    </AbsoluteFill>
  );
};

const ReactiveHalo = ({energy, time}) => (
  <div
    style={{
      position: 'absolute',
      left: '50%',
      top: '46%',
      width: 690 + energy * 760,
      height: 690 + energy * 760,
      borderRadius: '50%',
      transform: `translate(-50%, -50%) rotate(${time * 3}deg)`,
      border: `${1 + energy * 8}px solid rgba(16,224,204,${0.09 + energy * 0.28})`,
      boxShadow: `0 0 ${80 + energy * 230}px rgba(16,224,204,${0.05 + energy * 0.22}), inset 0 0 90px rgba(255,83,104,.08)`,
    }}
  />
);

const FrameChrome = ({time}) => (
  <AbsoluteFill style={{pointerEvents: 'none', color: mint, fontFamily: 'Space Grotesk'}}>
    <div style={{position: 'absolute', inset: 30, border: '1px solid rgba(184,255,244,.24)'}} />
    {[[30, 30], [1050, 30], [30, 1050], [1050, 1050]].map(([x, y], i) => (
      <div key={i} style={{position: 'absolute', left: x - (x > 500 ? 32 : 0), top: y - (y > 500 ? 32 : 0), width: 32, height: 32, borderLeft: x < 500 ? `3px solid ${teal}` : 'none', borderRight: x > 500 ? `3px solid ${teal}` : 'none', borderTop: y < 500 ? `3px solid ${teal}` : 'none', borderBottom: y > 500 ? `3px solid ${teal}` : 'none'}} />
    ))}
    <div style={{position: 'absolute', left: 48, top: 48, fontSize: 15, letterSpacing: 4, fontWeight: 600}}>TANISEA // KSVIETY</div>
    <div style={{position: 'absolute', right: 48, top: 48, fontSize: 15, letterSpacing: 3, opacity: 0.7}}>EN LYRIC FILM</div>
    <div style={{position: 'absolute', left: 48, bottom: 48, fontSize: 14, letterSpacing: 3, opacity: 0.62}}>TRACK 01 · REMIX</div>
    <div style={{position: 'absolute', right: 48, bottom: 48, fontVariantNumeric: 'tabular-nums', fontSize: 14, letterSpacing: 3, opacity: 0.62}}>{String(Math.floor(time / 60)).padStart(2, '0')}:{String(Math.floor(time % 60)).padStart(2, '0')}</div>
  </AbsoluteFill>
);

const Equalizer = ({bands, bass, mids, highs}) => (
  <div style={{position: 'absolute', left: 64, right: 64, bottom: 76, height: 50, fontFamily: 'Space Grotesk', pointerEvents: 'none'}}>
    <div style={{position: 'absolute', inset: '0 0 10px', display: 'flex', gap: 3, alignItems: 'flex-end', borderBottom: '1px solid rgba(184,255,244,.18)'}}>
      {bands.map((value, index) => {
        const position = index / Math.max(1, bands.length - 1);
        const color = position < 0.24 ? ember : position < 0.72 ? teal : mint;
        return (
          <div key={index} style={{position: 'relative', flex: 1, height: '100%', display: 'flex', alignItems: 'flex-end'}}>
            <div style={{width: '100%', minHeight: 2, height: 2 + value * 38, background: color, borderRadius: '2px 2px 0 0', opacity: 0.38 + value * 0.62, boxShadow: `0 0 ${3 + value * 14}px ${color}`, transform: `scaleY(${0.94 + value * 0.06})`, transformOrigin: 'bottom'}} />
            <div style={{position: 'absolute', left: 0, right: 0, bottom: 2 + value * 38, height: 1, background: '#fff', opacity: value * 0.65}} />
          </div>
        );
      })}
    </div>
    <div style={{position: 'absolute', left: 0, right: 0, bottom: -2, display: 'flex', justifyContent: 'space-between', fontSize: 8, letterSpacing: 2.5, color: 'rgba(184,255,244,.45)'}}>
      <span style={{opacity: 0.45 + bass * 0.55}}>SUB / BASS</span>
      <span style={{opacity: 0.45 + mids * 0.55}}>VOCAL / MID</span>
      <span style={{opacity: 0.45 + highs * 0.55}}>AIR</span>
    </div>
  </div>
);

const Intro = ({time, frame, fps}) => {
  if (time >= 20) return null;
  const artist = fade(time, 0.5, 7.2, 0.8);
  const title = fade(time, 3.0, 16.0, 1.0);
  const sub = fade(time, 10.5, 19.7, 0.8);
  const titleSpring = spring({frame: Math.max(0, frame - 90), fps, config: {damping: 18, stiffness: 92}});

  return (
    <AbsoluteFill style={{justifyContent: 'center', padding: 86, fontFamily: 'Space Grotesk', color: '#fff'}}>
      <div style={{opacity: artist, transform: `translateY(${(1 - artist) * 25}px)`, letterSpacing: 10, fontSize: 20, fontWeight: 650, color: teal, marginBottom: 24}}>TANISEA × KSVIETY</div>
      <div style={{opacity: title, transform: `scale(${0.92 + titleSpring * 0.08})`, transformOrigin: 'left center'}}>
        <div style={{fontFamily: 'Bebas Neue', fontSize: 150, lineHeight: 0.82, letterSpacing: 3, textShadow: '0 12px 45px rgba(0,0,0,.6)'}}>I'LL SCREAM</div>
        <div style={{fontFamily: 'Bebas Neue', fontSize: 112, lineHeight: 1.02, color: mint, WebkitTextStroke: '1px rgba(16,224,204,.55)', textShadow: `0 0 40px rgba(16,224,204,.38)`}}>TO THE WHOLE WORLD</div>
      </div>
      <div style={{opacity: sub, marginTop: 38, width: 420, height: 2, background: `linear-gradient(90deg, ${teal}, transparent)`}} />
      <div style={{opacity: sub, marginTop: 18, fontSize: 16, letterSpacing: 7, fontWeight: 500}}>ENGLISH LYRIC FILM · 2024 REMIX</div>
    </AbsoluteFill>
  );
};

const SplitText = ({line, time}) => {
  const chorus = line.section === 'chorus';

  return (
    <div style={{display: 'flex', flexWrap: 'wrap', gap: chorus ? '0 20px' : '0 14px', justifyContent: chorus ? 'center' : 'flex-start', alignItems: 'baseline'}}>
      {line.cues.map((item, i) => {
        const local = clamp((time - item.start) / Math.max(0.001, item.end - item.start));
        const active = time >= item.start && time < item.end;
        const complete = time >= item.end;
        return (
          <span
            key={`${item.text}-${i}`}
            style={{
              display: 'inline-block',
              color: complete ? mint : active ? '#fff' : 'rgba(255,255,255,.38)',
              transform: `translateY(${active ? -7 * Math.sin(local * Math.PI) : 0}px) scale(${active ? 1.045 + Math.sin(local * Math.PI) * 0.018 : 1})`,
              textShadow: active ? `0 0 ${24 + 22 * Math.sin(local * Math.PI)}px ${teal}, 0 5px 18px rgba(0,0,0,.72)` : '0 5px 18px rgba(0,0,0,.65)',
              WebkitTextStroke: active && chorus ? '1px rgba(255,255,255,.34)' : '0 transparent',
            }}
          >
            {item.text}
          </span>
        );
      })}
    </div>
  );
};

const LyricDisplay = ({time}) => {
  const index = lyrics.findIndex((line) => time >= line.start && time < line.end);
  if (index < 0) return null;
  const line = lyrics[index];
  const next = lyrics[index + 1];
  const opacity = fade(time, line.start, line.end, 0.32);
  const entry = clamp((time - line.start) / 0.5);
  const progress = clamp((time - line.start) / (line.end - line.start));
  const chorus = line.section === 'chorus';
  const verse = line.section === 'verse';
  const size = chorus ? (line.text.length > 27 ? 76 : 88) : verse ? (line.text.length > 42 ? 48 : 57) : (line.text.length > 26 ? 62 : 72);

  return (
    <AbsoluteFill style={{justifyContent: chorus ? 'center' : 'flex-end', alignItems: chorus ? 'center' : 'stretch', padding: chorus ? '180px 80px 210px' : '0 76px 178px', fontFamily: 'Space Grotesk', color: '#fff'}}>
      {chorus && [1, 2].map((n) => (
        <div key={n} style={{position: 'absolute', width: '100%', textAlign: 'center', fontFamily: 'Bebas Neue', fontSize: size + n * 27, letterSpacing: n * 7, color: 'transparent', WebkitTextStroke: `1px rgba(16,224,204,${0.16 / n})`, transform: `translate(${n * 8}px, ${n * 12}px)`, opacity}}>{line.text.toUpperCase()}</div>
      ))}
      <div style={{position: 'relative', opacity, transform: `translateY(${(1 - entry) * 46}px)`, filter: `blur(${(1 - entry) * 12}px)`, maxWidth: chorus ? 930 : 900, alignSelf: chorus ? 'center' : 'flex-start'}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 14, marginBottom: 18, color: teal, fontSize: 14, letterSpacing: 5, fontWeight: 650}}>
          <span>{String(index + 1).padStart(2, '0')}</span>
          <span style={{height: 1, width: 72, background: teal}} />
          <span>{line.section.toUpperCase()}</span>
        </div>
        <div style={{fontSize: size, fontWeight: chorus ? 680 : 620, lineHeight: chorus ? 0.98 : 1.08, letterSpacing: chorus ? -3 : -2, textTransform: chorus ? 'uppercase' : 'none', textAlign: chorus ? 'center' : 'left'}}>
          <SplitText line={line} time={time} />
        </div>
        <div style={{marginTop: 24, height: 3, width: chorus ? '100%' : 520, maxWidth: '100%', background: 'rgba(255,255,255,.12)', overflow: 'hidden'}}>
          <div style={{height: '100%', width: `${progress * 100}%`, background: `linear-gradient(90deg, ${teal}, ${mint}, ${ember})`, boxShadow: `0 0 22px ${teal}`}} />
        </div>
        {next && next.start - line.end < 1 && (
          <div style={{marginTop: 17, fontSize: 19, letterSpacing: 1.5, fontWeight: 450, opacity: 0.34, textAlign: chorus ? 'center' : 'left'}}>{next.text}</div>
        )}
      </div>
    </AbsoluteFill>
  );
};

const BreakCard = ({time}) => {
  if (time < 50 || time >= 64) return null;
  const p = fade(time, 50, 64, 0.7);
  return (
    <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', color: mint, fontFamily: 'Bebas Neue', opacity: p}}>
      <div style={{fontSize: 34, letterSpacing: 18, color: teal}}>TANISEA</div>
      <div style={{fontSize: 112, letterSpacing: 6, lineHeight: 1, color: 'transparent', WebkitTextStroke: '2px rgba(184,255,244,.82)'}}>REMIX // 01</div>
      <div style={{marginTop: 24, width: 360, height: 2, background: `linear-gradient(90deg, transparent, ${ember}, transparent)`}} />
    </AbsoluteFill>
  );
};

const Outro = ({time, frame, fps, masterLevel, bass}) => {
  if (time < 118) return null;
  const reveal = clamp(spring({
    frame: Math.max(0, frame - Math.round(118 * fps)),
    fps,
    config: {damping: 22, stiffness: 72, mass: 1.1},
  }));
  const outroTime = time - 118;
  const pulse = clamp(masterLevel * 0.7 + bass * 0.45, 0, 0.5);
  const drift = Math.sin(outroTime * 0.22) * 3;
  const lineWidth = 520 + reveal * 150 + pulse * 120;
  const titleScale = 0.965 + reveal * 0.035 + pulse * 0.012;
  const titleGlow = 20 + pulse * 95;

  return (
    <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', padding: '0 76px 150px', color: '#fff', overflow: 'hidden'}}>
      <div
        style={{
          position: 'absolute',
          width: 820 + pulse * 260,
          height: 420 + pulse * 160,
          borderRadius: '50%',
          background: `radial-gradient(ellipse, rgba(16,224,204,${0.07 + pulse * 0.16}) 0%, rgba(255,83,104,${0.035 + pulse * 0.08}) 42%, transparent 72%)`,
          filter: `blur(${20 + pulse * 22}px)`,
          transform: `translateY(${drift}px) scale(${0.92 + reveal * 0.08})`,
          opacity: reveal,
        }}
      />
      <div
        style={{
          position: 'absolute',
          fontFamily: "Georgia, 'Times New Roman', serif",
          fontWeight: 700,
          fontSize: 72,
          letterSpacing: -1.5,
          whiteSpace: 'nowrap',
          color: 'transparent',
          WebkitTextStroke: `1px rgba(184,255,244,${0.05 + pulse * 0.1})`,
          transform: `translateY(${drift + 4}px) scale(${titleScale * 1.055})`,
          opacity: reveal,
        }}
      >
        ЗАКРИЧУ НА ВЕСЬ МИР
      </div>
      <div
        style={{
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          width: '100%',
          transform: `translateY(${(1 - reveal) * 34 + drift}px) scale(${titleScale})`,
          opacity: reveal,
        }}
      >
        <div style={{display: 'flex', alignItems: 'center', gap: 18, width: lineWidth, maxWidth: '84%', marginBottom: 23}}>
          <div style={{height: 2, flex: 1, background: `linear-gradient(90deg, transparent, ${teal})`, boxShadow: `0 0 ${10 + pulse * 24}px ${teal}`}} />
          <div style={{width: 7, height: 7, transform: 'rotate(45deg)', background: mint, boxShadow: `0 0 ${12 + pulse * 30}px ${teal}`}} />
          <div style={{height: 2, flex: 1, background: `linear-gradient(90deg, ${ember}, transparent)`, boxShadow: `0 0 ${10 + pulse * 24}px ${ember}`}} />
        </div>
        <div style={{fontFamily: 'Space Grotesk', fontSize: 14, color: teal, letterSpacing: 8, fontWeight: 650, marginBottom: 18}}>ORIGINAL TITLE</div>
        <div
          style={{
            width: '100%',
            textAlign: 'center',
            fontFamily: "Georgia, 'Times New Roman', serif",
            fontWeight: 700,
            fontSize: 72,
            letterSpacing: -1.5,
            lineHeight: 1.06,
            whiteSpace: 'nowrap',
            clipPath: `inset(0 ${(1 - reveal) * 100}% 0 0)`,
            textShadow: `0 7px 26px rgba(0,0,0,.78), 0 0 ${titleGlow}px rgba(16,224,204,${0.18 + pulse * 0.4})`,
          }}
        >
          ЗАКРИЧУ НА ВЕСЬ МИР
        </div>
        <div style={{fontFamily: 'Space Grotesk', fontSize: 18, letterSpacing: 5, color: mint, marginTop: 19, fontWeight: 520}}>TANISEA × KSVIETY · REMIX</div>
        <div style={{marginTop: 30, width: 170 + pulse * 110, height: 2, background: `linear-gradient(90deg, transparent, rgba(184,255,244,.9), transparent)`, boxShadow: `0 0 ${12 + pulse * 28}px ${teal}`}} />
      </div>
    </AbsoluteFill>
  );
};

const EndFade = ({time}) => {
  const opacity = interpolate(time, [151.4, 153], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  return <AbsoluteFill style={{backgroundColor: '#090106', opacity, pointerEvents: 'none'}} />;
};

export const LyricFilm = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const time = frame / fps;
  const audioData = useAudioData(staticFile('soundtrack.m4a'));
  const emptySpectrum = Array.from({length: 256}, () => 0);
  const spectrumNow = audioData
    ? visualizeAudio({fps, frame, audioData, numberOfSamples: 256, smoothing: false, optimizeFor: 'accuracy'})
    : emptySpectrum;
  const spectrumPrevious = audioData
    ? visualizeAudio({fps, frame: frame - 1, audioData, numberOfSamples: 256, smoothing: false, optimizeFor: 'accuracy'})
    : emptySpectrum;
  const spectrumPreviousTwo = audioData
    ? visualizeAudio({fps, frame: frame - 2, audioData, numberOfSamples: 256, smoothing: false, optimizeFor: 'accuracy'})
    : emptySpectrum;
  const responsiveSpectrum = spectrumNow.map((value, index) => Math.max(
    value,
    spectrumPrevious[index] * 0.62,
    spectrumPreviousTwo[index] * 0.36,
  ));
  const spectralRms = Math.sqrt(mean(responsiveSpectrum.map((value) => value * value)));
  const amplitudeGate = clamp((spectralRms - 0.002) / 0.018);
  const bands = spectrumToBands(responsiveSpectrum, 56).map((value) => value * (0.12 + amplitudeGate * 0.88));
  const bass = mean(bands.slice(0, 14));
  const mids = mean(bands.slice(14, 40));
  const highs = mean(bands.slice(40));
  const masterLevel = clamp(bass * 0.44 + mids * 0.38 + highs * 0.18);
  const energy = clamp(masterLevel * 0.34, 0, 0.34);

  return (
    <AbsoluteFill style={{backgroundColor: wine, overflow: 'hidden'}}>
      <GlobalStyles />
      <Audio src={staticFile('soundtrack.m4a')} />
      <Artwork time={time} energy={energy} />
      <ReactiveHalo time={time} energy={energy} />
      <Atmosphere frame={frame} energy={energy} />
      <Intro time={time} frame={frame} fps={fps} />
      <BreakCard time={time} />
      <LyricDisplay time={time} />
      <Outro time={time} frame={frame} fps={fps} masterLevel={masterLevel} bass={bass} />
      <Equalizer bands={bands} bass={bass} mids={mids} highs={highs} />
      <FrameChrome time={time} />
      <EndFade time={time} />
    </AbsoluteFill>
  );
};
