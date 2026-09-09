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
import {getSmoothedSpectrumState} from './spectrum-smoothing';
import {isYouTubeVariant} from './film-variant';
import type {FilmVariant} from './film-variant';

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

export const useProductionFonts = (): boolean => {
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
  variant: FilmVariant;
}>;

const Background = ({time, feature, variant}: BackgroundProps) => {
  const pulse = feature.pressure * 0.09 + feature.impact * 0.07;
  const warm = feature.brightness * 0.08;
  const haloX = 48 + Math.round(Math.sin(time * 0.11) * 4);
  const haloY = 41 + Math.round(Math.cos(time * 0.09) * 3);

  if (isYouTubeVariant(variant)) {
    return (
      <AbsoluteFill
        data-film-background="youtube"
        style={{backgroundColor: wine, overflow: 'hidden'}}
      >
        <Img
          src={staticFile('artwork.png')}
          style={{
            position: 'absolute',
            inset: -38,
            width: 'calc(100% + 76px)',
            height: 'calc(100% + 76px)',
            objectFit: 'cover',
            filter: `blur(17px) contrast(${1.12 + pulse}) saturate(${0.8 + warm}) brightness(${0.3 + pulse * 0.42})`,
          }}
        />
        <div
          data-youtube-artwork-stage="sharp"
          style={{
            position: 'absolute',
            right: 76,
            bottom: -4,
            width: 1080,
            height: 1080,
            overflow: 'hidden',
            borderLeft: '1px solid rgba(22,230,209,.22)',
            boxShadow: '-26px 0 70px rgba(9,1,6,.52)',
          }}
        >
          <Img
            src={staticFile('artwork.png')}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              filter: `contrast(${1.1 + pulse}) saturate(${0.94 + warm}) brightness(${0.61 + pulse * 0.68})`,
            }}
          />
          <AbsoluteFill
            style={{
              background:
                'linear-gradient(180deg, rgba(18,1,7,.08) 0%, rgba(12,0,6,.58) 100%)',
            }}
          />
        </div>
        <AbsoluteFill
          style={{
            background:
              'linear-gradient(90deg, rgba(9,1,6,.98) 0%, rgba(12,1,7,.92) 35%, rgba(18,1,8,.62) 55%, rgba(9,1,6,.08) 100%)',
          }}
        />
        <AbsoluteFill
          style={{
            background: `radial-gradient(ellipse at ${haloX}% ${haloY}%, rgba(16,224,204,${0.07 + feature.pressure * 0.11}) 0%, transparent 34%), radial-gradient(ellipse at 72% 65%, rgba(255,83,104,${0.05 + feature.emotion * 0.07}) 0%, transparent 40%)`,
          }}
        />
        <div
          style={{
            position: 'absolute',
            left: 104,
            top: 126,
            width: 1,
            height: 718,
            background:
              'linear-gradient(180deg, rgba(22,230,209,.72), rgba(22,230,209,.02))',
          }}
        />
      </AbsoluteFill>
    );
  }

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
  variant: FilmVariant;
}>;

const Atmosphere = ({frame, feature, variant}: AtmosphereProps) => {
  const youtube = isYouTubeVariant(variant);
  const canvasWidth = youtube ? 1920 : 1080;
  const travelHeight = youtube ? 1320 : 1300;
  const horizontalInset = youtube ? 104 : 42;
  const usableWidth = youtube ? 1712 : 996;
  const particleSeed = youtube ? 'youtube-' : '';
  const particles = useMemo(
    () =>
      Array.from({length: 30}, (_, index) => ({
        x: Math.round(
          horizontalInset +
            random(`${particleSeed}particle-x-${index}`) * usableWidth,
        ),
        y: Math.round(
          random(`${particleSeed}particle-y-${index}`) * (youtube ? 1240 : 1180),
        ),
        size:
          (youtube ? 3 : 2) +
          Math.round(random(`${particleSeed}particle-size-${index}`) * 2),
        speed:
          0.12 + random(`${particleSeed}particle-speed-${index}`) * 0.3,
        phase: Math.round(
          random(`${particleSeed}particle-phase-${index}`) * 600,
        ),
      })),
    [horizontalInset, particleSeed, usableWidth, youtube],
  );

  return (
    <AbsoluteFill style={{overflow: 'hidden', pointerEvents: 'none'}}>
      <svg
        width={canvasWidth}
        height={1080}
        style={{position: 'absolute', inset: 0}}
      >
        {particles.map((particle, index) => {
          const y =
            Math.round(
              particle.y -
                (frame + particle.phase) * particle.speed +
                travelHeight,
            ) %
              travelHeight -
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
          opacity: youtube ? 0.075 : 0.09,
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
  variant: FilmVariant;
  center?: number | undefined;
}>;

const AudioMotionLine = ({
  feature,
  top,
  emphasis = 1,
  variant,
  center,
}: MotionLineProps) => {
  const youtube = isYouTubeVariant(variant);
  const canvasWidth = youtube ? 1920 : 1080;
  const motionCenter = center ?? 540;
  const rawWidth = youtube
    ? 940 + 520 * feature.reach + 180 * feature.hero
    : 520 + 300 * feature.reach + 100 * feature.hero;
  const width = Math.min(
    youtube ? 1520 : 920,
    2 * Math.round(rawWidth / 2),
  );
  const left = Math.round(motionCenter - width / 2);
  const right = Math.round(motionCenter + width / 2);
  const centreGap = youtube ? 26 : 22;
  const coreThickness = youtube
    ? 3 + Math.round(2 * feature.lowEnd)
    : 2 + Math.round(2 * feature.lowEnd);
  const intensity = clamp(
    0.24 + feature.pressure * 0.27 + feature.impact * 0.28 + feature.hero * 0.2,
  );
  const endpoint = (youtube ? 6 : 4) + Math.round(feature.impact * 4);

  return (
    <svg
      width={canvasWidth}
      height={28}
      viewBox={`0 0 ${canvasWidth} 28`}
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
        strokeWidth={youtube ? 12 : 10}
        opacity={0.055 + feature.hero * 0.09}
        style={{filter: `blur(${youtube ? 8 : 6}px)`}}
      >
        <line
          x1={left}
          y1={14}
          x2={motionCenter - centreGap}
          y2={14}
        />
        <line
          x1={motionCenter + centreGap}
          y1={14}
          x2={right}
          y2={14}
        />
      </g>
      <line
        x1={left}
        y1={14}
        x2={motionCenter - centreGap}
        y2={14}
        stroke={teal}
        strokeWidth={coreThickness}
        opacity={intensity}
      />
      <line
        x1={motionCenter + centreGap}
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
        x={motionCenter - 4}
        y={10}
        width={8}
        height={8}
        transform={`rotate(45 ${motionCenter} 14)`}
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
  variant: FilmVariant;
}>;

const Intro = ({time, frame, fps, feature, variant}: IntroProps) => {
  if (time >= 23.75) return null;
  const youtube = isYouTubeVariant(variant);
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
        alignItems: youtube ? 'flex-start' : undefined,
        padding: youtube ? '100px 0 190px 140px' : '110px 78px 190px',
        fontFamily: 'Space Grotesk',
        color: white,
        opacity,
      }}
    >
      <AudioMotionLine
        feature={feature}
        top={youtube ? 132 : 122}
        emphasis={0.9}
        variant={variant}
        center={youtube ? 540 : undefined}
      />
      <div
        style={{
          fontSize: youtube ? 18 : 16,
          letterSpacing: youtube ? 10.2 : 9,
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
          maxWidth: youtube ? 1000 : undefined,
          transform: `translateY(${Math.round((1 - settle) * 22)}px)`,
          transformOrigin: 'left center',
        }}
      >
        <div
          style={{
            fontFamily: 'Bebas Neue',
            fontSize: youtube ? 214 : 160,
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
            fontSize: youtube ? 142 : 108,
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
          marginTop: youtube ? 40 : 34,
          width: youtube ? 560 : 420,
          height: 2,
          background: `linear-gradient(90deg, ${teal}, rgba(22,230,209,0))`,
          opacity: subOpacity,
        }}
      />
      <div
        style={{
          marginTop: youtube ? 20 : 17,
          fontSize: youtube ? 16 : 14,
          letterSpacing: youtube ? 6.1 : 5.5,
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
  variant: FilmVariant;
}>;

export const BreakCard = ({time, feature, variant}: BreakCardProps) => {
  if (time < 49.98 || time >= 64.02) return null;
  const youtube = isYouTubeVariant(variant);
  const opacity = fadeWindow(time, 49.98, 64.02, 0.3, 0.48);
  const development = smoothstep(56.1, 57.05, time);
  return (
    <AbsoluteFill
      data-presentation-layer="break-card"
      style={{
        justifyContent: 'center',
        alignItems: youtube ? 'flex-start' : 'center',
        paddingBottom: youtube ? 156 : 132,
        paddingLeft: youtube ? 142 : undefined,
        color: mint,
        fontFamily: 'Space Grotesk',
        opacity,
      }}
    >
      <div
        style={{
          fontSize: youtube ? 14 : 12,
          letterSpacing: youtube ? 7.8 : 7,
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
          fontSize: Math.round((youtube ? 142 : 106) - development * (youtube ? 22 : 18)),
          letterSpacing: (youtube ? 8.4 : 7) + development * 2,
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
          fontSize: youtube ? 64 : 50,
          letterSpacing: youtube ? 11.2 : 10,
          color: mint,
          opacity: development,
          transform: `translateY(${Math.round((1 - development) * 12)}px)`,
        }}
      >
        KSVIETY REMIX
      </div>
      <AudioMotionLine
        feature={feature}
        top={(youtube ? 584 : 548) + Math.round(development * 44)}
        emphasis={0.86}
        variant={variant}
        center={youtube ? 550 : undefined}
      />
      <div
        style={{
          marginTop: 44 - development * 10,
          fontSize: youtube ? 14 : 12,
          letterSpacing: youtube ? 4.6 : 4,
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
  variant: FilmVariant;
}>;

export const Outro = ({time, feature, variant}: OutroProps) => {
  if (time < 117.98) return null;
  const youtube = isYouTubeVariant(variant);
  const reveal = smoothstep(117.98, 118.4, time);
  const translationStage = smoothstep(125.45, 126.3, time);
  const outroSettleStage = smoothstep(135.7, 136.8, time);
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
        padding: youtube ? '0 120px 172px' : '0 52px 148px',
        color: white,
      }}
    >
      <div
        data-presentation-layer="outro-reveal"
        style={{
          position: 'absolute',
          width: youtube ? 1420 : 870,
          height: youtube ? 540 : 430,
          borderRadius: '50%',
          background: `radial-gradient(ellipse, rgba(22,230,209,${0.06 + feature.pressure * 0.08 + feature.hero * 0.08}) 0%, rgba(255,91,112,${0.025 + feature.emotion * 0.055}) 45%, transparent 72%)`,
          filter: 'blur(22px)',
          opacity: reveal,
        }}
      />
      <AudioMotionLine
        feature={feature}
        top={(youtube ? 378 : 390) - Math.round(outroSettleStage * 34) + Math.round(endCardStage * 42)}
        emphasis={0.5 + reveal * 0.5}
        variant={variant}
        center={youtube ? 960 : undefined}
      />
      <div
        data-presentation-layer="outro-primary-title"
        style={{
          position: 'absolute',
          left: youtube ? 160 : 52,
          right: youtube ? 160 : 52,
          top: youtube ? 376 : 386,
          textAlign: 'center',
          fontFamily: 'Space Grotesk',
          opacity: primaryOpacity,
          transform: `translateY(${Math.round((1 - reveal) * 16 - outroSettleStage * 6 + drift)}px) scale(${1 - outroSettleStage * 0.02})`,
        }}
      >
        <div
          style={{
            fontSize: youtube ? 14 : 12,
            letterSpacing: youtube ? 7.8 : 7,
            fontWeight: 650,
            color: teal,
            marginBottom: youtube ? 26 : 22,
          }}
        >
          ORIGINAL TITLE // VERIFIED OUTRO STATE
        </div>
        <div
          style={{
            fontFamily: 'Playfair',
            fontSize: youtube ? 98 : 74,
            fontWeight: 740,
            lineHeight: 1.04,
            letterSpacing: 0.5,
            whiteSpace: 'nowrap',
            color: white,
            textShadow: `0 7px 24px rgba(0,0,0,.74), 0 0 ${titleGlow}px rgba(22,230,209,${0.16 + feature.hero * 0.2})`,
            display: 'flex',
            justifyContent: 'center',
            gap: youtube ? 24 : 17,
          }}
        >
          <span
            style={{
              transform: 'translateX(0px)',
            }}
          >
            ЗАКРИЧУ
          </span>
          <span
            style={{
              transform: 'translateX(0px)',
            }}
          >
            НА ВЕСЬ МИР
          </span>
        </div>
        <div
          style={{
            marginTop: youtube ? 26 : 22,
            fontSize: youtube ? 15 : 13,
            letterSpacing: youtube ? 4.7 : 4.1,
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
          left: youtube ? 160 : 52,
          right: youtube ? 160 : 52,
          top: youtube ? 338 : 344,
          textAlign: 'center',
          fontFamily: 'Space Grotesk',
          opacity: endCardStage,
          transform: `translateY(${Math.round((1 - endCardStage) * 18)}px)`,
        }}
      >
        <div
          style={{
            fontSize: youtube ? 14 : 12,
            letterSpacing: youtube ? 8 : 7.2,
            fontWeight: 650,
            color: teal,
            marginBottom: youtube ? 20 : 17,
          }}
        >
          ARTIST // REMIX // ORIGINAL TITLE
        </div>
        <div
          style={{
            fontFamily: 'Bebas Neue',
            fontSize: youtube ? 138 : 104,
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
            marginTop: youtube ? 22 : 18,
            fontFamily: 'Playfair',
            fontSize: youtube ? 40 : 31,
            fontWeight: 700,
            letterSpacing: 1.4,
            color: mint,
          }}
        >
          ЗАКРИЧУ НА ВЕСЬ МИР
        </div>
        <div
          style={{
            marginTop: youtube ? 24 : 20,
            fontSize: youtube ? 14 : 12,
            fontWeight: 600,
            letterSpacing: youtube ? 5 : 4.4,
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

export type LyricFilmProps = Readonly<{
  variant?: FilmVariant;
}>;

export const LyricFilm = ({variant = 'square'}: LyricFilmProps) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const time = frame / fps;
  const fontsReady = useProductionFonts();
  const audioFeatures = useAudioFeatures();
  const featureFrame = audioFeatures
    ? featureFrameForTime(frame, fps, audioFeatures.fps)
    : 0;
  const spectrumFeature = useMemo(
    () => audioFeatures
      ? getSmoothedSpectrumState(audioFeatures, featureFrame)
      : null,
    [audioFeatures, featureFrame],
  );

  if (!fontsReady || !audioFeatures || !spectrumFeature) return null;

  const feature = audioFeatures.getFrame(featureFrame);

  return (
    <AbsoluteFill style={{backgroundColor: ink, overflow: 'hidden'}}>
      <GlobalStyles />
      <Audio src={staticFile('soundtrack.m4a')} />
      <Background time={time} feature={feature} variant={variant} />
      <Atmosphere frame={frame} feature={feature} variant={variant} />
      <Intro
        time={time}
        frame={frame}
        fps={fps}
        feature={feature}
        variant={variant}
      />
      <BreakCard time={time} feature={feature} variant={variant} />
      <LyricDisplay frame={frame} fps={fps} variant={variant} />
      <Outro time={time} feature={feature} variant={variant} />
      <SpectrumRail feature={spectrumFeature} variant={variant} />
      <FrameChrome time={time} variant={variant} />
      <EndFade time={time} />
    </AbsoluteFill>
  );
};

export const YouTubeLyricFilm = () => <LyricFilm variant="youtube" />;
