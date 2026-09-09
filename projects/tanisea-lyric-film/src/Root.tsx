import {Composition} from 'remotion';
import {LyricFilm, YouTubeLyricFilm} from './LyricFilm';
import {SyncProof, YouTubeSyncProof} from './SyncProof';

export const RemotionRoot = () => (
  <>
    <Composition
      id="LyricFilmVNext"
      component={LyricFilm}
      durationInFrames={9180}
      fps={60}
      width={1080}
      height={1080}
    />
    <Composition
      id="LyricFilmSyncProof"
      component={SyncProof}
      durationInFrames={18360}
      fps={120}
      width={1080}
      height={1080}
    />
    <Composition
      id="LyricFilmYouTube"
      component={YouTubeLyricFilm}
      durationInFrames={9180}
      fps={60}
      width={1920}
      height={1080}
    />
    <Composition
      id="LyricFilmYouTubeSyncProof"
      component={YouTubeSyncProof}
      durationInFrames={18360}
      fps={120}
      width={1920}
      height={1080}
    />
  </>
);
