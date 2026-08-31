import {flushSync} from 'react-dom';
import {createRoot} from 'react-dom/client';
import {LyricDisplay} from '../../src/components/LyricDisplay';

declare global {
  interface Window {
    __lyricLayoutReady?: boolean;
    __setLyricLayoutFrame?: (frame: number, fps: number) => Promise<void>;
  }
}

const host = document.getElementById('root');
if (!host) throw new Error('Missing lyric layout root');
const root = createRoot(host);

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
  await renderFrame(0, 60);
  window.__lyricLayoutReady = true;
};

void boot();
