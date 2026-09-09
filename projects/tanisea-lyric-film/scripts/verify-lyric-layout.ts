import {createServer} from 'node:http';
import {mkdtemp, readFile, rm, writeFile} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join, resolve} from 'node:path';

import {BundlerInternals} from '@remotion/bundler';
import {openBrowser} from '@remotion/renderer';

const SAMPLE_RATE = 44_100;
const VIEWPORT = 1080;
const TOLERANCE_PX = 0.05;
const MAXIMUM_LYRIC_BOTTOM_PX = 844;
const MAXIMUM_SPECTRUM_CAP_TOP_PX = 880;
const MINIMUM_SAFE_AREA_PX = 36;

type SegmentFixture = Readonly<{id: string; text: string}>;
type LineFixture = Readonly<{
  id: string;
  segments: readonly SegmentFixture[];
  cues: readonly Readonly<{startSample: number; endSample: number}>[];
}>;

const fixtures: readonly LineFixture[] = [
  {
    id: 'V1-03',
    segments: [
      {id: 'V1-03-S01', text: 'I remember what happened;'},
      {id: 'V1-03-S02', text: 'questions'},
      {id: 'V1-03-S03', text: 'gnaw at me'},
    ],
    cues: [
      {startSample: 3_104_728, endSample: 3_171_804},
      {startSample: 3_173_568, endSample: 3_199_146},
      {startSample: 3_200_910, endSample: 3_236_234},
    ],
  },
  {
    id: 'V1-08',
    segments: [
      {id: 'V1-08-S01', text: 'Behind my back,'},
      {id: 'V1-08-S02', text: 'someone'},
      {id: 'V1-08-S03', text: "couldn't hold back"},
      {id: 'V1-08-S04', text: 'a laugh'},
    ],
    cues: [
      {startSample: 3_807_197, endSample: 3_817_781},
      {startSample: 3_819_545, endSample: 3_868_099},
      {startSample: 3_869_863, endSample: 3_910_435},
      {startSample: 3_912_243, endSample: 3_949_287},
    ],
  },
] as const;

type Rectangle = Readonly<{
  left: number;
  top: number;
  width: number;
  height: number;
  row: number;
}>;

type Snapshot = Readonly<{
  stableIdentifiers: boolean;
  rectangles: Readonly<Record<string, Rectangle>>;
}>;

type EntryFrames = Readonly<{
  lineId: string;
  frames: readonly number[];
}>;

type PublicLayoutSnapshot = Readonly<{
  lineIds: readonly string[];
  lyricBottom: number;
  capTop: number;
  separation: number;
  spectrumClipped: boolean;
  tickBottom: number;
  lowerChromeTop: number;
}>;

const frameForSample = (sample: number, fps: number): number =>
  Math.round((sample * fps) / SAMPLE_RATE);

const framesFor = (fixture: LineFixture, fps: number): readonly number[] =>
  [...new Set(
    fixture.cues.flatMap(({startSample, endSample}) => {
      const start = frameForSample(startSample, fps);
      const end = frameForSample(endSample, fps);
      return [start - 1, start, start + 1, start + 2, end, end + 1, end + 2];
    }),
  )].sort((left, right) => left - right);

const listen = async (directory: string) => {
  const bundle = await readFile(join(directory, 'bundle.js'));
  const html = await readFile(join(directory, 'index.html'));
  const font = await readFile(resolve('public/SpaceGrotesk.ttf'));
  const server = createServer((request, response) => {
    const path = request.url ?? '/';
    if (path === '/bundle.js') {
      response.writeHead(200, {'content-type': 'text/javascript'});
      response.end(bundle);
      return;
    }
    if (path === '/SpaceGrotesk.ttf') {
      response.writeHead(200, {'content-type': 'font/ttf'});
      response.end(font);
      return;
    }
    response.writeHead(200, {'content-type': 'text/html'});
    response.end(html);
  });
  await new Promise<void>((resolvePromise, reject) => {
    server.once('error', reject);
    server.listen(0, '127.0.0.1', () => resolvePromise());
  });
  const address = server.address();
  if (!address || typeof address === 'string') {
    throw new Error('Unable to resolve lyric layout verification port');
  }
  return {
    url: `http://127.0.0.1:${address.port}`,
    close: () => new Promise<void>((resolvePromise, reject) =>
      server.close((error) => error ? reject(error) : resolvePromise()),
    ),
  };
};

const waitUntilReady = async (page: Awaited<ReturnType<Awaited<ReturnType<typeof openBrowser>>['newPage']>>) => {
  for (let attempt = 0; attempt < 200; attempt++) {
    if (await page.evaluate(() =>
      (window as Window & {__lyricLayoutReady?: boolean}).__lyricLayoutReady === true,
    )) return;
    await new Promise((resolvePromise) => setTimeout(resolvePromise, 25));
  }
  throw new Error('Timed out waiting for lyric layout browser harness');
};

const measure = async (
  page: Awaited<ReturnType<Awaited<ReturnType<typeof openBrowser>>['newPage']>>,
  fixture: LineFixture,
  frame: number,
  fps: number,
): Promise<Snapshot> => page.evaluate(
  async (payload: {
    lineId: string;
    segments: Array<{id: string; text: string}>;
    requestedFrame: number;
    requestedFps: number;
  }) => {
    const {lineId, segments, requestedFrame, requestedFps} = payload;
    const setter = (window as Window & {
      __setLyricLayoutFrame?: (frame: number, fps: number) => Promise<void>;
    }).__setLyricLayoutFrame;
    if (!setter) throw new Error('Lyric layout setter is unavailable');
    await setter(requestedFrame, requestedFps);

    const elements: Array<{
      id: string;
      element: HTMLElement;
      stable: boolean;
    }> = segments.map(({id, text}) => {
      const stable = document.querySelector<HTMLElement>(
        `[data-lyric-segment-id="${id}"]`,
      );
      const fallback = [...document.querySelectorAll<HTMLElement>('span')]
        .find((element) => element.textContent === text);
      const element = stable ?? fallback;
      if (!element) {
        throw new Error(`Missing ${lineId} segment ${id} at frame ${requestedFrame}`);
      }
      return {id, element, stable: stable !== null};
    });
    const tops: number[] = [...new Set(elements.map(({element}) =>
      Math.round(element.getBoundingClientRect().top * 1000) / 1000,
    ))].sort((left, right) => left - right);
    const rectangles = Object.fromEntries(elements.map(({id, element}) => {
      const rect = element.getBoundingClientRect();
      const roundedTop = Math.round(rect.top * 1000) / 1000;
      return [id, {
        left: rect.left,
        top: rect.top,
        width: rect.width,
        height: rect.height,
        row: tops.indexOf(roundedTop),
      }];
    }));
    return {
      stableIdentifiers: elements.every(({stable}) => stable),
      rectangles,
    };
  },
  {
    lineId: fixture.id,
    segments: fixture.segments,
    requestedFrame: frame,
    requestedFps: fps,
  },
);

const getEntryFrames = async (
  page: Awaited<ReturnType<Awaited<ReturnType<typeof openBrowser>>['newPage']>>,
  fps: number,
): Promise<readonly EntryFrames[]> => page.evaluate((requestedFps: number) => {
  const getter = (window as Window & {
    __getLyricEntryFrames?: (fps: number) => readonly EntryFrames[];
  }).__getLyricEntryFrames;
  if (!getter) throw new Error('Lyric entry-frame getter is unavailable');
  return getter(requestedFps);
}, fps);

const measurePublicLayout = async (
  page: Awaited<ReturnType<Awaited<ReturnType<typeof openBrowser>>['newPage']>>,
  frame: number,
  fps: number,
): Promise<PublicLayoutSnapshot> => page.evaluate(
  async (payload: {requestedFrame: number; requestedFps: number}) => {
    const setter = (window as Window & {
      __setLyricLayoutFrame?: (frame: number, fps: number) => Promise<void>;
    }).__setLyricLayoutFrame;
    if (!setter) throw new Error('Lyric layout setter is unavailable');
    await setter(payload.requestedFrame, payload.requestedFps);

    const lineElements = [...document.querySelectorAll<HTMLElement>(
      '[data-lyric-line-id]',
    )];
    const contentRectangles = lineElements.map((line) => {
      const content = line.firstElementChild;
      if (!(content instanceof HTMLElement)) {
        throw new Error('Rendered lyric line is missing its content element');
      }
      return content.getBoundingClientRect();
    });
    if (contentRectangles.length === 0) {
      throw new Error(`No lyric content at frame ${payload.requestedFrame}`);
    }

    const spectrum = document.querySelector<HTMLElement>(
      '[data-spectrum-rail="public"]',
    );
    const caps = [...document.querySelectorAll<SVGLineElement>(
      '[data-spectrum-impact-band]',
    )];
    const measured = [...document.querySelectorAll<SVGLineElement>(
      '[data-spectrum-measured-band]',
    )];
    const ticks = [...document.querySelectorAll<SVGTextElement>(
      '[data-spectrum-tick]',
    )];
    const lowerChrome = [...document.querySelectorAll<HTMLElement>(
      '[data-frame-chrome-slot="track-label"], [data-frame-chrome-slot="timecode"]',
    )];
    if (!spectrum || caps.length !== 64 || measured.length !== 64) {
      throw new Error('Peak spectrum fixture did not render all public bands');
    }
    if (ticks.length === 0 || lowerChrome.length !== 2) {
      throw new Error('Public ticks or lower chrome are unavailable');
    }

    const spectrumRect = spectrum.getBoundingClientRect();
    const capRectangles = caps.map((cap) => cap.getBoundingClientRect());
    const barRectangles = [...measured, ...caps].map((bar) =>
      bar.getBoundingClientRect(),
    );
    const lyricBottom = Math.max(...contentRectangles.map(({bottom}) => bottom));
    const capTop = Math.min(...capRectangles.map(({top}) => top));
    const tickBottom = Math.max(
      ...ticks.map((tick) => tick.getBoundingClientRect().bottom),
    );
    const lowerChromeTop = Math.min(
      ...lowerChrome.map((element) => element.getBoundingClientRect().top),
    );

    return {
      lineIds: lineElements.map((line) =>
        line.getAttribute('data-lyric-line-id') ?? 'unknown',
      ),
      lyricBottom,
      capTop,
      separation: capTop - lyricBottom,
      spectrumClipped: barRectangles.some(
        ({top, right, bottom, left}) =>
          top < spectrumRect.top - 0.01 ||
          right > spectrumRect.right + 0.01 ||
          bottom > spectrumRect.bottom + 0.01 ||
          left < spectrumRect.left - 0.01,
      ),
      tickBottom,
      lowerChromeTop,
    };
  },
  {requestedFrame: frame, requestedFps: fps},
);

const main = async (): Promise<void> => {
  const directory = await mkdtemp(join(tmpdir(), 'tanisea-layout-'));
  let browser: Awaited<ReturnType<typeof openBrowser>> | null = null;
  let server: Awaited<ReturnType<typeof listen>> | null = null;
  try {
    await BundlerInternals.esbuild.build({
      entryPoints: [resolve('tests/browser/lyric-layout-entry.tsx')],
      outfile: join(directory, 'bundle.js'),
      bundle: true,
      platform: 'browser',
      format: 'iife',
      jsx: 'automatic',
      define: {'process.env.NODE_ENV': '"production"'},
    });
    await writeFile(
      join(directory, 'index.html'),
      '<!doctype html><html><head><meta charset="utf-8"><style>*{box-sizing:border-box;font-synthesis:none;text-rendering:geometricPrecision}html,body,#root{margin:0;width:1080px;height:1080px;overflow:hidden}</style></head><body><div id="root"></div><script src="/bundle.js"></script></body></html>',
    );
    server = await listen(directory);
    browser = await openBrowser('chrome', {
      logLevel: 'error',
      chromiumOptions: {headless: true},
    });
    const page = await browser.newPage({
      context: () => null,
      logLevel: 'error',
      indent: false,
      pageIndex: 0,
      onBrowserLog: null,
      onLog: () => undefined,
    });
    await page.setViewport({
      width: VIEWPORT,
      height: VIEWPORT,
      deviceScaleFactor: 1,
    });
    await page.goto({url: server.url, timeout: 30_000});
    await waitUntilReady(page);

    let maximumDeltaPx = 0;
    const failures: string[] = [];
    const summaries: Array<Record<string, unknown>> = [];
    for (const fps of [60, 120]) {
      for (const fixture of fixtures) {
        const frames = framesFor(fixture, fps);
        const baseline = await measure(page, fixture, frames[0] ?? 0, fps);
        let identifiersStable = baseline.stableIdentifiers;
        for (const frame of frames.slice(1)) {
          const snapshot = await measure(page, fixture, frame, fps);
          identifiersStable = identifiersStable && snapshot.stableIdentifiers;
          for (const segment of fixture.segments) {
            const expected = baseline.rectangles[segment.id];
            const actual = snapshot.rectangles[segment.id];
            if (!expected || !actual) throw new Error(`Missing rectangle ${segment.id}`);
            for (const key of ['left', 'top', 'width', 'height'] as const) {
              const delta = Math.abs(actual[key] - expected[key]);
              maximumDeltaPx = Math.max(maximumDeltaPx, delta);
              if (delta > TOLERANCE_PX) {
                failures.push(`${fps}fps ${fixture.id} ${segment.id} frame ${frame} ${key} delta ${delta.toFixed(3)}px`);
              }
            }
            if (actual.row !== expected.row) {
              failures.push(`${fps}fps ${fixture.id} ${segment.id} frame ${frame} row ${expected.row}->${actual.row}`);
            }
          }
        }
        if (!identifiersStable) failures.push(`${fps}fps ${fixture.id} missing stable data identifiers`);
        summaries.push({fps, lineId: fixture.id, frames: frames.length, identifiersStable});
      }
    }
    const entryFrames = await getEntryFrames(page, 60);
    let publicFramesMeasured = 0;
    let worstPublicLayout: (PublicLayoutSnapshot & {frame: number}) | null = null;
    let spectrumClipped = false;
    let minimumLowerChromeClearancePx = Number.POSITIVE_INFINITY;
    for (const entry of entryFrames) {
      for (const frame of entry.frames) {
        const snapshot = await measurePublicLayout(page, frame, 60);
        publicFramesMeasured++;
        spectrumClipped = spectrumClipped || snapshot.spectrumClipped;
        minimumLowerChromeClearancePx = Math.min(
          minimumLowerChromeClearancePx,
          snapshot.lowerChromeTop - snapshot.tickBottom,
        );
        if (!worstPublicLayout || snapshot.separation < worstPublicLayout.separation) {
          worstPublicLayout = {...snapshot, frame};
        }
      }
    }
    if (!worstPublicLayout) throw new Error('No public lyric entry frames measured');
    if (worstPublicLayout.lyricBottom > MAXIMUM_LYRIC_BOTTOM_PX) {
      failures.push(
        `public lyric bottom ${worstPublicLayout.lyricBottom.toFixed(3)}px exceeds ${MAXIMUM_LYRIC_BOTTOM_PX}px at frame ${worstPublicLayout.frame} (${worstPublicLayout.lineIds.join(', ')})`,
      );
    }
    if (Math.abs(worstPublicLayout.capTop - MAXIMUM_SPECTRUM_CAP_TOP_PX) > TOLERANCE_PX) {
      failures.push(
        `peak spectrum cap top ${worstPublicLayout.capTop.toFixed(3)}px differs from ${MAXIMUM_SPECTRUM_CAP_TOP_PX}px`,
      );
    }
    if (worstPublicLayout.separation < MINIMUM_SAFE_AREA_PX) {
      failures.push(
        `public lyric/spectrum separation ${worstPublicLayout.separation.toFixed(3)}px is below ${MINIMUM_SAFE_AREA_PX}px at frame ${worstPublicLayout.frame}`,
      );
    }
    if (spectrumClipped) failures.push('peak spectrum geometry is clipped');
    if (minimumLowerChromeClearancePx <= 0) {
      failures.push(
        `lower chrome overlaps spectrum ticks by ${Math.abs(minimumLowerChromeClearancePx).toFixed(3)}px`,
      );
    }
    if (failures.length > 0) {
      throw new Error(`Lyric geometry is not stationary:\n${failures.slice(0, 30).join('\n')}`);
    }
    console.log(JSON.stringify({
      status: 'ok',
      tolerancePx: TOLERANCE_PX,
      maximumDeltaPx,
      summaries,
      publicSafeArea: {
        framesMeasured: publicFramesMeasured,
        maximumLyricBottomPx: worstPublicLayout.lyricBottom,
        spectrumCapTopPx: worstPublicLayout.capTop,
        minimumSeparationPx: worstPublicLayout.separation,
        worstFrame: worstPublicLayout.frame,
        worstLineIds: worstPublicLayout.lineIds,
        spectrumClipped,
        minimumLowerChromeClearancePx,
      },
    }, null, 2));
    await page.close();
  } finally {
    if (browser) await browser.close({silent: true});
    if (server) await server.close();
    await rm(directory, {recursive: true, force: true});
  }
};

void main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
