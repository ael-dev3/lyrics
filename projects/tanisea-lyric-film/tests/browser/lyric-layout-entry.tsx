import {flushSync} from 'react-dom';
import {createRoot} from 'react-dom/client';
import type {AudioFeatureFrame} from '../../src/audio-features';
import {FrameChrome} from '../../src/components/FrameChrome';
import {LyricDisplay} from '../../src/components/LyricDisplay';
import {SpectrumRail} from '../../src/components/SpectrumRail';
import {lyrics} from '../../src/timed-lyrics';
import {frameForSample} from '../../src/timing/alignment-types';

type EntryFrames = Readonly<{
  lineId: string;
  frames: readonly number[];
}>;

declare global {
  interface Window {
    __lyricLayoutReady?: boolean;
    __setLyricLayoutFrame?: (frame: number, fps: number) => Promise<void>;
    __getLyricEntryFrames?: (fps: number) => readonly EntryFrames[];
  }
}

const host = document.getElementById('root');
if (!host) throw new Error('Missing lyric layout root');
const root = createRoot(host);

const peakFeature: AudioFeatureFrame = {
  bands: new Uint8Array(64).fill(255),
  pressure: 0,
  impact: 1,
  lowEnd: 0,
  brightness: 0,
  emotion: 0,
  hero: 0,
  reach: 0,
  momentaryDbfs: -8,
  samplePeakDbfs: 0,
};

const renderFrame = async (frame: number, fps: number): Promise<void> => {
  flushSync(() => {
    root.render(
      <div
        style={{
          position: 'relative',
          width: 1080,
          height: 1080,
          overflow: 'hidden',
          background: '#090106',
          fontFamily: 'Space Grotesk',
        }}
      >
        <LyricDisplay frame={frame} fps={fps} />
        <SpectrumRail feature={peakFeature} />
        <FrameChrome time={frame / fps} />
      </div>,
    );
  });
  await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
};

const boot = async (): Promise<void> => {
  const font = new FontFace(
    'Space Grotesk',
    'url(/SpaceGrotesk.ttf)',
    {weight: '300 700'},
  );
  document.fonts.add(await font.load());
  window.__setLyricLayoutFrame = renderFrame;
  window.__getLyricEntryFrames = (fps) => lyrics.map((line) => {
    const start = frameForSample(line.visualInStartSample, fps);
    const end = frameForSample(line.visualInCompleteSample, fps);
    return {
      lineId: line.id,
      frames: Array.from({length: end - start + 1}, (_, index) => start + index),
    };
  });
  await renderFrame(0, 60);
  window.__lyricLayoutReady = true;
};

void boot();
