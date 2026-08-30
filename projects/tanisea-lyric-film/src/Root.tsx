import {Composition} from 'remotion';
import {LyricFilm} from './LyricFilm';

export const RemotionRoot = () => (
  <Composition
    id="LyricFilmVNext"
    component={LyricFilm}
    durationInFrames={9180}
    fps={60}
    width={1080}
    height={1080}
  />
);
