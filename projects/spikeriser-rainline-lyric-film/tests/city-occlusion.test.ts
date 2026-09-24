import assert from 'node:assert/strict';
import {resolve} from 'node:path';
import {test} from 'node:test';
import {build} from 'esbuild';

// Inspect the real scene's draw calls, including its time-dependent flight groups.
const bundle = await build({entryPoints: [resolve('src/city.ts')], bundle: true, platform: 'node', format: 'esm', write: false});
const bytes = bundle.outputFiles?.[0]?.contents;
assert(bytes, 'city bundle exists');
const city = await import(`data:text/javascript;base64,${Buffer.from(bytes).toString('base64')}`) as typeof import('../src/city.ts');

type DrawCall = {image: unknown; args: unknown[]};
function traceContext(width: number, height: number) {
  const calls: DrawCall[] = [];
  const canvas = {width, height};
  const context = {
    canvas, globalAlpha: 1, fillStyle: '', imageSmoothingEnabled: false,
    save() {}, restore() {}, clearRect() {}, scale() {}, translate() {}, fillRect() {},
    drawImage(image: unknown, ...args: unknown[]) {calls.push({image, args});},
  } as unknown as CanvasRenderingContext2D;
  return {context, calls};
}

test('large lyric vehicles never paint over another active lyric host', () => {
  const hero = {} as CanvasImageSource;
  const train = {} as CanvasImageSource;
  city.setCityAirship(hero);
  city.setCityTrain(train);
  city.setCitySprites({} as CanvasImageSource);
  city.setCityBackground('landscape', {} as CanvasImageSource);
  city.setCityBackground('portrait', {} as CanvasImageSource);
  let inspected = 0;
  for (const format of ['landscape', 'portrait'] as const) {
    const g = city.cityGeometry(format);
    for (const cue of city.cityCues) for (const word of cue.words) {
      const first = Math.ceil(word.start * 60);
      const last = Math.ceil(word.end * 60) - 1;
      assert(first <= last, `${cue.id} ${word.text} has no visible 60 fps contact frame`);
      const middle = Math.max(first, Math.min(last, Math.round(((word.start + word.end) / 2) * 60)));
      for (const frame of new Set([first, middle, last])) {
        const frameTime = frame / 60;
        assert.equal(city.getCityCue(frameTime)?.id, cue.id, `${cue.id} ${word.text} frame selection`);
        const {context, calls} = traceContext(g.w, g.h);
        city.paintCity(context, frame, format);
        const heroCalls = calls.filter(call => call.image === hero && typeof call.args[2] === 'number' && call.args[2] > 300);
        const trainCalls = calls.filter(call => call.image === train && typeof call.args[2] === 'number' && call.args[2] > 300);
        assert.equal(heroCalls.length, city.cueHost(cue) === 'airship' ? 1 : 0,
          `${format} ${cue.id} ${word.text}: a large airship must belong only to its own lyric host`);
        assert.equal(trainCalls.length, city.cueHost(cue) === 'train' ? 1 : 0,
          `${format} ${cue.id} ${word.text}: a large train must belong only to its own lyric host`);
        inspected++;
      }
    }
  }
  assert(inspected >= 152, 'Every word in both formats was covered');
});

test('the long CH-04 side vowel keeps its tower unobscured through the CH-05 arrival', () => {
  const hero = {} as CanvasImageSource;
  city.setCityAirship(hero);
  city.setCityTrain({} as CanvasImageSource);
  city.setCitySprites({} as CanvasImageSource);
  city.setCityBackground('landscape', {} as CanvasImageSource);
  for (const time of [115.6, 116.0, 116.5, 116.9]) {
    const frame = Math.round(time * 60);
    assert.equal(city.getCityCue(frame / 60)?.id, 'CH-04');
    const {context, calls} = traceContext(640, 360);
    city.paintCity(context, frame, 'landscape');
    assert(!calls.some(call => call.image === hero && typeof call.args[2] === 'number' && call.args[2] > 300),
      `Hero sprite covers the tower while “side” is active at ${time} s`);
  }
});

test('camera holds a stable reading position throughout every active word', () => {
  for (const format of ['landscape', 'portrait'] as const) for (const cue of city.cityCues) {
    const reference = city.cityCamera((cue.start + cue.end) / 2, format);
    for (const word of cue.words) {
      for (const frame of [Math.ceil(word.start * 60), Math.ceil(word.end * 60) - 1]) {
        const time = frame / 60;
        assert.equal(city.getCityCue(time)?.id, cue.id, `${cue.id} ${word.text} owns frame ${frame}`);
        const camera = city.cityCamera(time, format);
        assert(Math.abs(camera.zoom - reference.zoom) < 1e-9 &&
          Math.abs(camera.x - reference.x) < 1e-9 &&
          Math.abs(camera.y - reference.y) < 1e-9,
        `${format} ${cue.id} ${word.text} camera moves during active singing at ${time.toFixed(3)} s`);
      }
    }
  }
});
