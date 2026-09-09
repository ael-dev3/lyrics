import {Composition} from 'remotion';
import {LyricFilm} from './LyricFilm';
import {SyncProof} from './SyncProof';
import {LyricOverlay} from './Overlay';
import {PROOF_FPS, PUBLIC_FPS, SOURCE_FRAME_COUNT} from './timing';

export const RemotionRoot = () => (
  <>
    <Composition id="RoiSlowdownLyricFilm" component={LyricFilm} durationInFrames={SOURCE_FRAME_COUNT} fps={PUBLIC_FPS} width={1920} height={1080} />
    <Composition id="RoiSlowdownLyricOverlay" component={LyricOverlay} durationInFrames={SOURCE_FRAME_COUNT} fps={PUBLIC_FPS} width={1920} height={1080} />
    <Composition id="RoiSlowdownSyncProof" component={SyncProof} durationInFrames={SOURCE_FRAME_COUNT * 2} fps={PROOF_FPS} width={1920} height={1080} />
  </>
);
