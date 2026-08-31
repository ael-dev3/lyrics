import {useEffect, useMemo, useState} from 'react';
import {Audio} from '@remotion/media';
import {
  AbsoluteFill,
  Img,
  cancelRender,
  continueRender,
  delayRender,
  interpolate,
  random,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import {useAudioFeatures} from './audio-features';
import type {AudioFeatureFrame} from './audio-features';
import {FrameChrome} from './components/FrameChrome';
import {LyricDisplay} from './components/LyricDisplay';
import {SpectrumRail} from './components/SpectrumRail';
import {featureFrameForTime} from './feature-frame';

const teal = '#16e6d1';
const mint = '#c9fff7';
const wine = '#310711';
const ink = '#090106';
const ember = '#ff5b70';
const white = '#fffdfd';

const clamp = (value: number, minimum = 0, maximum = 1): number =>
  Math.min(maximum, Math.max(minimum, value));

const smoothstep = (edge0: number, edge1: number, value: number): number => {
  if (edge1 <= edge0) return value >= edge1 ? 1 : 0;
  const normalized = clamp((value - edge0) / (edge1 - edge0));
  return normalized * normalized * (3 - 2 * normalized);
};

const fadeWindow = (
  time: number,
  start: number,
  end: number,
  enterDuration = 0.45,
  exitDuration = 0.45,
): number =>
  smoothstep(start, start + enterDuration, time) *
  (1 - smoothstep(end - exitDuration, end, time));

let fontPromise: Promise<void> | null = null;

const loadFonts = (): Promise<void> => {
  if (!fontPromise) {
    const faces = [
      new FontFace(
        'Space Grotesk',
        `url(${staticFile('SpaceGrotesk.ttf')})`,
        {weight: '300 700'},
      ),
      new FontFace(
        'Bebas Neue',
        `url(${staticFile('BebasNeue.ttf')})`,
        {weight: '400'},
      ),
      new FontFace(
        'Playfair',
        `url(${staticFile('Playfair.ttf')})`,
        {weight: '400 900'},
      ),
    ];

    fontPromise = Promise.all(faces.map((face) => face.load())).then(
      (loadedFaces) => {
        for (const face of loadedFaces) document.fonts.add(face);
      },
    );
  }
  return fontPromise;
};

const useProductionFonts = (): boolean => {
  const [ready, setReady] = useState(false);
  const [renderHandle] = useState(() =>
    delayRender('Loading bundled production fonts'),
  );

  useEffect(() => {
    let cancelled = false;
    loadFonts()
      .then(() => {
        if (!cancelled) setReady(true);
        continueRender(renderHandle);
      })
      .catch((error: unknown) => {
        cancelRender(
          error instanceof Error ? error : new Error(String(error)),
        );
      });
    return () => {
      cancelled = true;
    };
  }, [renderHandle]);

  return ready;
};

const GlobalStyles = () => (
  <style>{`
    * {
      box-sizing: border-box;
      font-synthesis: none;
      text-rendering: geometricPrecision;
    }
    body {
      margin: 0;
      background: ${ink};
    }
  `}</style>
);

type BackgroundProps = Readonly<{
  time: number;
  feature: AudioFeatureFrame;
}>;

const Background = ({time, feature}: BackgroundProps) => {
  const pulse = feature.pressure * 0.09 + feature.impact * 0.07;
  const warm = feature.brightness * 0.08;
  const haloX = 48 + Math.round(Math.sin(time * 0.11) * 4);
  const haloY = 41 + Math.round(Math.cos(time * 0.09) * 3);

  return (
    <AbsoluteFill style={{backgroundColor: wine, overflow: 'hidden'}}>
      <Img
        src={staticFile('artwork.png')}
        style={{
          width: 1080,
          height: 1080,
          objectFit: 'cover',
          filter: `contrast(${1.08 + pulse}) saturate(${0.92 + warm}) brightness(${0.57 + pulse * 0.7})`,
        }}
      />
      <AbsoluteFill
        style={{
          background: `radial-gradient(circle at ${haloX}% ${haloY}%, rgba(16,224,204,${0.06 + feature.pressure * 0.09}) 0%, transparent 34%), radial-gradient(circle at 67% 66%, rgba(255,83,104,${0.035 + feature.emotion * 0.08}) 0%, transparent 38%)`,
        }}
      />
      <AbsoluteFill
        style={{
          background:
            'radial-gradient(circle at 50% 45%, transparent 13%, rgba(18,1,8,.18) 50%, rgba(9,0,5,.84) 100%)',
        }}
      />
      <AbsoluteFill
        style={{
          background:
            'linear-gradient(180deg, rgba(18,1,7,.18) 0%, rgba(20,1,8,.08) 40%, rgba(12,0,6,.72) 100%)',
        }}
      />
    </AbsoluteFill>
  );
};

type AtmosphereProps = Readonly<{
  frame: number;
  feature: AudioFeatureFrame;
}>;

const Atmosphere = ({frame, feature}: AtmosphereProps) => {
  const particles = useMemo(
    () =>
      Array.from({length: 30}, (_, index) => ({
        x: Math.round(42 + random(`particle-x-${index}`) * 996),
        y: Math.round(random(`particle-y-${index}`) * 1180),
        size: 2 + Math.round(random(`particle-size-${index}`) * 2),
        speed: 0.12 + random(`particle-speed-${index}`) * 0.3,
        phase: Math.round(random(`particle-phase-${index}`) * 600),
      })),
    [],
  );

  return (
    <AbsoluteFill style={{overflow: 'hidden', pointerEvents: 'none'}}>
      <svg width={1080} height={1080} style={{position: 'absolute', inset: 0}}>
        {particles.map((particle, index) => {
          const y =
            Math.round(
              particle.y - (frame + particle.phase) * particle.speed + 1300,
            ) %
              1300 -
            110;
          const emphasis = clamp(
            0.16 + feature.pressure * 0.28 + feature.impact * 0.32,
          );
          return (
            <circle
              key={index}
              cx={particle.x}
              cy={y}
              r={particle.size}
              fill={index % 5 === 0 ? ember : teal}
              opacity={emphasis * (index % 3 === 0 ? 0.7 : 0.42)}
            />
          );
        })}
      </svg>
      <AbsoluteFill
        style={{
          opacity: 0.09,
          backgroundImage:
            'repeating-linear-gradient(0deg, transparent 0px, transparent 3px, rgba(201,255,247,.15) 4px)',
        }}
      />
    </AbsoluteFill>
  );
};

type MotionLineProps = Readonly<{
  feature: AudioFeatureFrame;
  top: number;
  emphasis?: number;
}>;

const AudioMotionLine = ({
  feature,
  top,
  emphasis = 1,
}: MotionLineProps) => {
  const rawWidth = 520 + 300 * feature.reach + 100 * feature.hero;
  const width = Math.min(920, 2 * Math.round(rawWidth / 2));
  const left = Math.round((1080 - width) / 2);
  const right = 1080 - left;
  const centreGap = 22;
  const coreThickness = 2 + Math.round(2 * feature.lowEnd);
  const intensity = clamp(
    0.24 + feature.pressure * 0.27 + feature.impact * 0.28 + feature.hero * 0.2,
  );
  const endpoint = 4 + Math.round(feature.impact * 4);

  return (
    <svg
      width={1080}
      height={28}
      viewBox="0 0 1080 28"
      style={{
        position: 'absolute',
        left: 0,
        top,
        overflow: 'visible',
        pointerEvents: 'none',
        opacity: emphasis,
      }}
      shapeRendering="geometricPrecision"
    >
      <g
        stroke={teal}
        strokeWidth={10}
        opacity={0.055 + feature.hero * 0.09}
        style={{filter: 'blur(6px)'}}
      >
        <line x1={left} y1={14} x2={540 - centreGap} y2={14} />
        <line x1={540 + centreGap} y1={14} x2={right} y2={14} />
      </g>
      <line
        x1={left}
        y1={14}
        x2={540 - centreGap}
        y2={14}
        stroke={teal}
        strokeWidth={coreThickness}
        opacity={intensity}
      />
      <line
        x1={540 + centreGap}
        y1={14}
        x2={right}
        y2={14}
        stroke={feature.hero > 0.38 ? white : ember}
        strokeWidth={coreThickness}
        opacity={intensity}
      />
      <rect
        x={left - endpoint / 2}
        y={14 - endpoint / 2}
        width={endpoint}
        height={endpoint}
        fill={mint}
        opacity={0.45 + feature.impact * 0.5}
      />
      <rect
        x={right - endpoint / 2}
        y={14 - endpoint / 2}
        width={endpoint}
        height={endpoint}
        fill={feature.hero > 0.38 ? white : ember}
        opacity={0.45 + feature.impact * 0.5}
      />
      <rect
        x={536}
        y={10}
        width={8}
        height={8}
        transform="rotate(45 540 14)"
        fill={mint}
        opacity={0.42 + feature.emotion * 0.52}
      />
    </svg>
  );
};

type IntroProps = Readonly<{
  time: number;
  frame: number;
  fps: number;
  feature: AudioFeatureFrame;
}>;

const Intro = ({time, frame, fps, feature}: IntroProps) => {
  if (time >= 23.75) return null;
  const opacity = fadeWindow(time, 0.45, 23.72, 0.7, 0.62);
  const settle = spring({
    frame: Math.max(0, frame - Math.round(1.1 * fps)),
    fps,
    config: {damping: 24, stiffness: 84, mass: 1.1},
  });
  const titleOpacity = smoothstep(1.15, 2.5, time);
  const subOpacity = smoothstep(6.4, 7.3, time);

  return (
    <AbsoluteFill
      style={{
        justifyContent: 'center',
        padding: '110px 78px 190px',
        fontFamily: 'Space Grotesk',
        color: white,
        opacity,
      }}
    >
      <AudioMotionLine feature={feature} top={122} emphasis={0.9} />
      <div
        style={{
          fontSize: 16,
          letterSpacing: 9,
          fontWeight: 650,
          color: teal,
          marginBottom: 25,
          opacity: smoothstep(0.55, 1.35, time),
        }}
      >
        TANISEA × KSVIETY
      </div>
      <div
        style={{
          opacity: titleOpacity,
          transform: `translateY(${Math.round((1 - settle) * 22)}px)`,
          transformOrigin: 'left center',
        }}
      >
        <div
          style={{
            fontFamily: 'Bebas Neue',
            fontSize: 160,
            lineHeight: 0.78,
            letterSpacing: 2,
            textShadow: '0 10px 34px rgba(0,0,0,.62)',
          }}
        >
          I'LL SCREAM
        </div>
        <div
          style={{
            fontFamily: 'Bebas Neue',
            fontSize: 108,
            lineHeight: 1.03,
            letterSpacing: 2,
            color: mint,
            textShadow: `0 0 ${18 + feature.emotion * 22}px rgba(22,230,209,.28)`,
          }}
        >
          TO THE WHOLE WORLD
        </div>
      </div>
      <div
        style={{
          marginTop: 34,
          width: 420,
          height: 2,
          background: `linear-gradient(90deg, ${teal}, rgba(22,230,209,0))`,
          opacity: subOpacity,
        }}
      />
      <div
        style={{
          marginTop: 17,
          fontSize: 14,
          letterSpacing: 5.5,
          fontWeight: 550,
          color: 'rgba(255,255,255,.82)',
          opacity: subOpacity,
        }}
      >
        ENGLISH SEMANTIC LYRIC FILM · 60 FPS
      </div>
    </AbsoluteFill>
  );
};

type BreakCardProps = Readonly<{
  time: number;
  feature: AudioFeatureFrame;
}>;

export const BreakCard = ({time, feature}: BreakCardProps) => {
  if (time < 49.98 || time >= 64.02) return null;
  const opacity = fadeWindow(time, 49.98, 64.02, 0.3, 0.48);
  const development = smoothstep(56.1, 57.05, time);
  return (
    <AbsoluteFill
      data-presentation-layer="break-card"
      style={{
        justifyContent: 'center',
        alignItems: 'center',
        paddingBottom: 132,
        color: mint,
        fontFamily: 'Space Grotesk',
        opacity,
      }}
    >
      <div
        style={{
          fontSize: 12,
          letterSpacing: 7,
          fontWeight: 650,
          color: teal,
          marginBottom: 17,
        }}
      >
        {development < 0.5
          ? 'INTERLUDE // SIGNAL HOLD'
          : 'INTERLUDE // PHASE 02'}
      </div>
      <div
        style={{
          fontFamily: 'Bebas Neue',
          fontSize: Math.round(106 - development * 18),
          letterSpacing: 7 + development * 2,
          lineHeight: 0.95,
          color: white,
          transform: `translateY(${Math.round(-development * 17)}px)`,
        }}
      >
        TANISEA
      </div>
      <div
        style={{
          marginTop: 13,
          fontFamily: 'Bebas Neue',
          fontSize: 50,
          letterSpacing: 10,
          color: mint,
          opacity: development,
          transform: `translateY(${Math.round((1 - development) * 12)}px)`,
        }}
      >
        KSVIETY REMIX
      </div>
      <AudioMotionLine
        feature={feature}
        top={548 + Math.round(development * 44)}
        emphasis={0.86}
      />
      <div
        style={{
          marginTop: 44 - development * 10,
          fontSize: 12,
          letterSpacing: 4,
          color: 'rgba(201,255,247,.68)',
        }}
      >
        VERSE IN · 01:04.06 · 64 LOG BANDS
      </div>
    </AbsoluteFill>
  );
};

type OutroProps = Readonly<{
  time: number;
  feature: AudioFeatureFrame;
}>;

export const Outro = ({time, feature}: OutroProps) => {
  if (time < 117.98) return null;
  const reveal = smoothstep(117.98, 118.4, time);
  const translationStage = smoothstep(125.45, 126.3, time);
  const deconstructionStage = smoothstep(135.7, 136.8, time);
  const endCardStage = smoothstep(144.55, 145.45, time);
  const primaryOpacity = reveal * (1 - smoothstep(144.35, 145.25, time));
  const translationOpacity =
    translationStage * (1 - smoothstep(143.95, 145.05, time));
  const drift = Math.round(Math.sin((time - 118.2) * 0.18) * 2);
  const titleGlow = 14 + Math.round(feature.emotion * 24 + feature.hero * 28);

  return (
    <AbsoluteFill
      style={{
        justifyContent: 'center',
        alignItems: 'center',
        padding: '0 52px 148px',
        color: white,
      }}
    >
      <div
        data-presentation-layer="outro-reveal"
        style={{
          position: 'absolute',
          width: 870,
          height: 430,
          borderRadius: '50%',
          background: `radial-gradient(ellipse, rgba(22,230,209,${0.06 + feature.pressure * 0.08 + feature.hero * 0.08}) 0%, rgba(255,91,112,${0.025 + feature.emotion * 0.055}) 45%, transparent 72%)`,
          filter: 'blur(22px)',
          opacity: reveal,
        }}
      />
      <AudioMotionLine
        feature={feature}
        top={390 - Math.round(deconstructionStage * 34) + Math.round(endCardStage * 42)}
        emphasis={0.5 + reveal * 0.5}
      />
      <div
        style={{
          position: 'absolute',
          left: 52,
          right: 52,
          top: 386,
          textAlign: 'center',
          fontFamily: 'Space Grotesk',
          opacity: primaryOpacity,
          transform: `translateY(${Math.round((1 - reveal) * 16 - deconstructionStage * 16 + drift)}px) scale(${1 - deconstructionStage * 0.035})`,
        }}
      >
        <div
          style={{
            fontSize: 12,
            letterSpacing: 7,
            fontWeight: 650,
            color: teal,
            marginBottom: 22,
          }}
        >
          ORIGINAL TITLE // VERIFIED OUTRO STATE
        </div>
        <div
          style={{
            fontFamily: 'Playfair',
            fontSize: 74,
            fontWeight: 740,
            lineHeight: 1.04,
            letterSpacing: 0.5 + deconstructionStage * 1.8,
            whiteSpace: 'nowrap',
            color: white,
            textShadow: `0 7px 24px rgba(0,0,0,.74), 0 0 ${titleGlow}px rgba(22,230,209,${0.16 + feature.hero * 0.2})`,
            display: 'flex',
            justifyContent: 'center',
            gap: 17 + deconstructionStage * 26,
          }}
        >
          <span
            style={{
              transform: `translateX(${Math.round(-deconstructionStage * 10)}px)`,
            }}
          >
            ЗАКРИЧУ
          </span>
          <span
            style={{
              transform: `translateX(${Math.round(deconstructionStage * 10)}px)`,
            }}
          >
            НА ВЕСЬ МИР
          </span>
        </div>
        <div
          style={{
            marginTop: 22,
            fontSize: 13,
            letterSpacing: 4.1,
            fontWeight: 580,
            color: mint,
            opacity: translationOpacity,
          }}
        >
          I’LL SCREAM FOR THE WHOLE WORLD TO HEAR
        </div>
      </div>
      <div
        style={{
          position: 'absolute',
          left: 52,
          right: 52,
          top: 344,
          textAlign: 'center',
          fontFamily: 'Space Grotesk',
          opacity: endCardStage,
          transform: `translateY(${Math.round((1 - endCardStage) * 18)}px)`,
        }}
      >
        <div
          style={{
            fontSize: 12,
            letterSpacing: 7.2,
            fontWeight: 650,
            color: teal,
            marginBottom: 17,
          }}
        >
          ARTIST // REMIX // ORIGINAL TITLE
        </div>
        <div
          style={{
            fontFamily: 'Bebas Neue',
            fontSize: 104,
            lineHeight: 0.92,
            letterSpacing: 7,
            color: white,
            textShadow: '0 8px 28px rgba(0,0,0,.72)',
          }}
        >
          TANISEA
        </div>
        <div
          style={{
            marginTop: 18,
            fontFamily: 'Playfair',
            fontSize: 31,
            fontWeight: 700,
            letterSpacing: 1.4,
            color: mint,
          }}
        >
          ЗАКРИЧУ НА ВЕСЬ МИР
        </div>
        <div
          style={{
            marginTop: 20,
            fontSize: 12,
            fontWeight: 600,
            letterSpacing: 4.4,
            color: 'rgba(201,255,247,.72)',
          }}
        >
          KSVIETY REMIX · 153.000 S · 60 FPS
        </div>
      </div>
    </AbsoluteFill>
  );
};

const EndFade = ({time}: Readonly<{time: number}>) => {
  const opacity = interpolate(time, [151.35, 153], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: (value) => smoothstep(0, 1, value),
  });
  return (
    <AbsoluteFill
      style={{backgroundColor: ink, opacity, pointerEvents: 'none'}}
    />
  );
};

export const LyricFilm = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const time = frame / fps;
  const fontsReady = useProductionFonts();
  const audioFeatures = useAudioFeatures();

  if (!fontsReady || !audioFeatures) return null;

  const featureFrame = featureFrameForTime(frame, fps, audioFeatures.fps);
  const feature = audioFeatures.getFrame(featureFrame);

  return (
    <AbsoluteFill style={{backgroundColor: ink, overflow: 'hidden'}}>
      <GlobalStyles />
      <Audio src={staticFile('soundtrack.m4a')} />
      <Background time={time} feature={feature} />
      <Atmosphere frame={frame} feature={feature} />
      <Intro time={time} frame={frame} fps={fps} feature={feature} />
      <BreakCard time={time} feature={feature} />
      <LyricDisplay frame={frame} fps={fps} />
      <Outro time={time} feature={feature} />
      <SpectrumRail feature={feature} />
      <FrameChrome time={time} />
      <EndFade time={time} />
    </AbsoluteFill>
  );
};
