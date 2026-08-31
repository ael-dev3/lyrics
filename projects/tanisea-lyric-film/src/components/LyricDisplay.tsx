import {AbsoluteFill} from 'remotion';
import {getSegmentFocusState} from '../focus-state';
import {lyrics} from '../timed-lyrics';
import type {LyricLine} from '../timed-lyrics';
import {frameForSample} from '../timing/alignment-types';

const teal = '#16e6d1';
const mint = '#c9fff7';
const ember = '#ff5b70';
const white = '#fffdfd';

const clamp = (value: number, minimum = 0, maximum = 1): number =>
  Math.min(maximum, Math.max(minimum, value));

const smoothstep = (edge0: number, edge1: number, value: number): number => {
  if (edge1 <= edge0) return value >= edge1 ? 1 : 0;
  const normalized = clamp((value - edge0) / (edge1 - edge0));
  return normalized * normalized * (3 - 2 * normalized);
};

type LyricLineViewProps = Readonly<{
  line: LyricLine;
  frame: number;
  fps: number;
}>;

const LyricLineView = ({line, frame, fps}: LyricLineViewProps) => {
  const enter = smoothstep(
    frameForSample(line.visualInStartSample, fps),
    frameForSample(line.visualInCompleteSample, fps),
    frame,
  );
  const exit = smoothstep(
    frameForSample(line.visualOutStartSample, fps),
    frameForSample(line.visualOutEndSample, fps),
    frame,
  );
  const opacity = enter * (1 - exit);
  const chorus = line.section === 'chorus';
  const verse = line.section === 'verse';
  const fontSize = chorus
    ? line.text.length > 31
      ? 66
      : 80
    : verse
      ? line.text.length > 45
        ? 45
        : 53
      : line.text.length > 36
        ? 53
        : 62;
  const vocalStartFrame = frameForSample(line.vocalStartSample, fps);
  const vocalEndFrame = frameForSample(line.vocalEndSample, fps);
  const progress = clamp(
    (frame - vocalStartFrame) / (vocalEndFrame - vocalStartFrame),
  );

  return (
    <AbsoluteFill
      data-lyric-line-id={line.id}
      style={{
        justifyContent: chorus ? 'center' : 'flex-end',
        alignItems: chorus ? 'center' : 'stretch',
        padding: chorus ? '180px 76px 205px' : '0 74px 238px',
        color: white,
        fontFamily: 'Space Grotesk',
        opacity,
        transform: `translateY(${Math.round((1 - enter) * 18 - exit * 10)}px)`,
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: chorus ? 940 : 920,
          alignSelf: chorus ? 'center' : 'flex-start',
        }}
      >
        <div
          data-lyric-row-id={line.id}
          style={{
            display: 'flex',
            justifyContent: chorus ? 'center' : 'flex-start',
            alignItems: 'center',
            gap: 13,
            marginBottom: 17,
            fontSize: 12,
            letterSpacing: 4.2,
            fontWeight: 650,
            color: teal,
          }}
        >
          <span>{line.id}</span>
          <span style={{height: 2, width: 58, background: teal}} />
          <span>{line.section.toUpperCase()}</span>
        </div>
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: chorus ? 'center' : 'flex-start',
            alignItems: 'baseline',
            columnGap: chorus ? 18 : 13,
            rowGap: 8,
            fontSize,
            lineHeight: chorus ? 1.02 : 1.1,
            letterSpacing: chorus ? -1.8 : -1.1,
            textAlign: chorus ? 'center' : 'left',
            textTransform: chorus ? 'uppercase' : 'none',
          }}
        >
          {line.segments.map((segment) => {
            const focus = getSegmentFocusState(
              line.cues,
              segment.id,
              frame,
              fps,
            );
            const underlineWidth = focus.contact ? 100 : 0;
            const baseWeight = chorus ? 610 : 540;
            const emphasisWeightRange = chorus ? 90 : 150;

            return (
              <span
                key={segment.id}
                data-lyric-segment-id={segment.id}
                style={{
                  display: 'inline-block',
                  position: 'relative',
                  whiteSpace: 'nowrap',
                  fontWeight: 700,
                  paddingBottom: 5,
                }}
              >
                <span
                  aria-hidden="true"
                  data-lyric-placeholder-id={segment.id}
                  style={{
                    display: 'block',
                    visibility: 'hidden',
                    fontWeight: 700,
                  }}
                >
                  {segment.text}
                </span>
                <span
                  data-lyric-glyph-id={segment.id}
                  style={{
                    display: 'block',
                    position: 'absolute',
                    inset: 0,
                    color: `rgba(255,255,255,${0.62 + focus.emphasis * 0.38})`,
                    fontWeight: Math.round(
                      baseWeight + focus.emphasis * emphasisWeightRange,
                    ),
                    textShadow:
                      focus.emphasis > 0.01
                        ? `0 0 ${Math.round(8 + focus.emphasis * 15)}px rgba(22,230,209,${0.18 + focus.emphasis * 0.42}), 0 4px 16px rgba(0,0,0,.68)`
                        : '0 4px 16px rgba(0,0,0,.68)',
                    backgroundImage: `linear-gradient(90deg, ${teal}, ${mint})`,
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'center bottom',
                    backgroundSize: `${underlineWidth}% 3px`,
                  }}
                >
                  {segment.text}
                </span>
              </span>
            );
          })}
        </div>
        <div
          style={{
            marginTop: 24,
            marginLeft: chorus ? 'auto' : 0,
            marginRight: chorus ? 'auto' : 0,
            width: chorus ? 760 : 560,
            maxWidth: '100%',
            height: 4,
            background: 'rgba(255,255,255,.12)',
          }}
        >
          <div
            style={{
              width: `${Math.round(progress * 1000) / 10}%`,
              height: 4,
              background: `linear-gradient(90deg, ${teal}, ${mint}, ${ember})`,
            }}
          />
        </div>
      </div>
    </AbsoluteFill>
  );
};

export type LyricDisplayProps = Readonly<{
  frame: number;
  fps: number;
}>;

export const LyricDisplay = ({frame, fps}: LyricDisplayProps) => (
  <>
    {lyrics
      .filter(
        (line) =>
          frame >= frameForSample(line.visualInStartSample, fps) &&
          frame < frameForSample(line.visualOutEndSample, fps),
      )
      .map((line) => (
        <LyricLineView
          key={line.id}
          line={line}
          frame={frame}
          fps={fps}
        />
      ))}
  </>
);
