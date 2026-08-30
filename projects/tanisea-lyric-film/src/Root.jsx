import React from 'react';
import {Composition} from 'remotion';
import {LyricFilm} from './LyricFilm';

export const RemotionRoot = () => (
  <Composition
    id="LyricFilm"
    component={LyricFilm}
    durationInFrames={4590}
    fps={30}
    width={1080}
    height={1080}
  />
);
