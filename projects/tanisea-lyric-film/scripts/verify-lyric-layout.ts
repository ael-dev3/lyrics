import {createServer} from 'node:http';
import {mkdtemp, readFile, rm, writeFile} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join, resolve} from 'node:path';

import {BundlerInternals} from '@remotion/bundler';
import {openBrowser} from '@remotion/renderer';

const SAMPLE_RATE = 44_100;
const VIEWPORT = 1080;
const TOLERANCE_PX = 0.05;

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
      '<!doctype html><html><head><meta charset="utf-8"><style>html,body,#root{margin:0;width:1080px;height:1080px;overflow:hidden}</style></head><body><div id="root"></div><script src="/bundle.js"></script></body></html>',
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
    if (failures.length > 0) {
      throw new Error(`Lyric geometry is not stationary:\n${failures.slice(0, 30).join('\n')}`);
    }
    console.log(JSON.stringify({
      status: 'ok',
      tolerancePx: TOLERANCE_PX,
      maximumDeltaPx,
      summaries,
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
