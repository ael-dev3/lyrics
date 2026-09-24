import React from 'react';
import {Composition, registerRoot} from 'remotion';
import {DIMENSIONS, DURATION_FRAMES, FPS, type Format} from './config.ts';
import {Film} from './Film.tsx';

const Root: React.FC = () => <>{(['landscape', 'portrait'] as const).map((format: Format) => <Composition
  key={format}
  id={format}
  component={Film}
  width={DIMENSIONS[format].width}
  height={DIMENSIONS[format].height}
  fps={FPS}
  durationInFrames={DURATION_FRAMES}
  defaultProps={{format, renderPermit: false}}
/>)}</>;

registerRoot(Root);
