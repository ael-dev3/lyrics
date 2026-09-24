import assert from 'node:assert/strict';
import {resolve} from 'node:path';
import {test} from 'node:test';
import {build} from 'esbuild';
import {DURATION_FRAMES, FPS} from '../src/config.ts';
import type {Placement} from '../src/city-choreography.ts';

// Inspect the real painter as well as the poses it receives. Vehicle images are
// unique markers, so their draw calls can be distinguished from background art.
const bundle = await build({entryPoints: [resolve('src/city.ts')], bundle: true, platform: 'node', format: 'esm', write: false});
const bytes = bundle.outputFiles?.[0]?.contents;
assert(bytes, 'city bundle exists');
const city = await import(`data:text/javascript;base64,${Buffer.from(bytes).toString('base64')}`) as typeof import('../src/city.ts');

type DrawCall = {image: unknown; args: number[]};
type FocusPixel = {x: number; y: number};
type SolidFill = {x: number; y: number; w: number; h: number};
function traceContext(width: number, height: number, captureFocus = false, captureLargeFills = false) {
  const calls: DrawCall[] = [];
  const focusPixels: FocusPixel[] = [];
  const solidFills: SolidFill[] = [];
  const canvas = {width, height};
  const context = {
    canvas, globalAlpha: 1, fillStyle: '', imageSmoothingEnabled: false,
    save() {}, restore() {}, clearRect() {}, scale() {}, translate() {},
    fillRect(this: {fillStyle: string; globalAlpha: number}, x: number, y: number, w: number, h: number) {
      if (captureFocus && this.fillStyle === '#fff1b4' && this.globalAlpha === 1) focusPixels.push({x, y});
      if (captureLargeFills && this.globalAlpha >= .85 && w >= 6 && h >= 5) solidFills.push({x, y, w, h});
    },
    beginPath() {}, moveTo() {}, lineTo() {}, closePath() {}, clip() {},
    drawImage(image: unknown, ...args: number[]) {calls.push({image, args});},
  } as unknown as CanvasRenderingContext2D;
  return {context, calls, focusPixels, solidFills};
}

const near = (actual: number, expected: number, label: string) =>
  assert(Math.abs(actual - expected) < 1e-6, `${label}: expected ${expected}, got ${actual}`);

test('the airship has a constant native size and occupies less than half the screen', () => {
  for (const format of ['landscape', 'portrait'] as const) {
    const geometry = city.cityGeometry(format);
    let lastVisibleFraction: number | undefined;
    let visibleFrames = 0;
    for (let frame = 0; frame < DURATION_FRAMES; frame++) {
      const time = frame / FPS;
      const pose = city.airshipPose(time, format);
      if (!pose.visible) {lastVisibleFraction = undefined; continue;}
      visibleFrames++;
      near(pose.width, format === 'landscape' ? 190 : 144, `${format} airship width at frame ${frame}`);
      near(pose.height, pose.width / 3, `${format} airship height at frame ${frame}`);
      const fraction = pose.width * city.cityCamera(time, format).zoom / geometry.w;
      assert(fraction < .5, `${format} airship fills ${(fraction * 100).toFixed(1)}% of the screen at frame ${frame}`);
      if (lastVisibleFraction !== undefined) {
        assert(Math.abs(fraction - lastVisibleFraction) < .01,
          `${format} airship changes apparent width abruptly at frame ${frame}`);
      }
      lastVisibleFraction = fraction;
    }
    assert(visibleFrames > 0, `${format} has an airship flight`);
  }
});

test('one four-car train runs on one fixed rail through every trip', () => {
  for (const format of ['landscape', 'portrait'] as const) {
    const geometry = city.cityGeometry(format);
    let visibleFrames = 0;
    for (let frame = 0; frame < DURATION_FRAMES; frame++) {
      const pose = city.trainPose(frame / FPS, format);
      near(pose.railY, geometry.railY, `${format} rail at frame ${frame}`);
      near(pose.y + pose.height * .837, geometry.railY, `${format} car contact at frame ${frame}`);
      assert.equal(pose.count, 4, `${format} car count at frame ${frame}`);
      assert(pose.spacing >= pose.width, `${format} cars overlap at frame ${frame}`);
      if (pose.visible) visibleFrames++;
    }
    assert(visibleFrames > 0, `${format} has an active train trip`);
  }
});

test('the city painter uses those exact vehicle poses at sung word frames', () => {
  const airshipImage = {} as CanvasImageSource;
  const trainImage = {} as CanvasImageSource;
  city.setCityAirship(airshipImage);
  city.setCityTrain(trainImage);
  city.setCitySprites({} as CanvasImageSource);
  city.setCityBackground('landscape', {} as CanvasImageSource);
  city.setCityBackground('portrait', {} as CanvasImageSource);
  let checked = 0;
  for (const format of ['landscape', 'portrait'] as const) {
    const geometry = city.cityGeometry(format);
    const frames = new Set<number>();
    for (const cue of city.cityCues) for (const word of cue.words) {
      const first = Math.ceil(word.start * FPS);
      const last = Math.ceil(word.end * FPS) - 1;
      if (first <= last) for (const frame of [first, Math.round((first + last) / 2), last]) frames.add(frame);
    }
    for (const frame of frames) {
      const time = frame / FPS;
      const {context, calls} = traceContext(geometry.w, geometry.h);
      city.paintCity(context, frame, format);

      const airship = city.airshipPose(time, format);
      const airshipDraws = calls.filter(call => call.image === airshipImage);
      assert.equal(airshipDraws.length, airship.visible ? 1 : 0, `${format} airship draw count at frame ${frame}`);
      if (airship.visible) {
        const draw = airshipDraws[0]!.args;
        assert.equal(draw.length, 4, `${format} airship is drawn at its native destination rectangle`);
        draw.forEach((value, index) => near(value, [airship.x, airship.y, airship.width, airship.height][index]!, `${format} airship draw ${index} at frame ${frame}`));
      }

      const train = city.trainPose(time, format);
      const trainDraws = calls.filter(call => call.image === trainImage);
      assert.equal(trainDraws.length, train.visible ? train.count : 0, `${format} train draw count at frame ${frame}`);
      if (train.visible) {
        trainDraws.forEach((call, index) => {
          const car = train.count - 1 - index;
          const rect = call.args.length === 4 ? call.args : call.args.slice(4);
          assert.equal(rect.length, 4, `${format} train car ${car} destination rectangle`);
          [train.x - car * train.spacing, train.y, train.width, train.height].forEach((value, i) =>
            near(rect[i]!, value, `${format} train car ${car} draw ${i} at frame ${frame}`));
        });
      }
      checked++;
    }
  }
  assert(checked >= 152, 'Sung word frames were inspected in both layouts');
});

test('the painter emits a source-timed focus color inside every sung word', () => {
  city.setCityAirship({} as CanvasImageSource);
  city.setCityTrain({} as CanvasImageSource);
  city.setCitySprites({} as CanvasImageSource);
  city.setCityBackground('landscape', {} as CanvasImageSource);
  city.setCityBackground('portrait', {} as CanvasImageSource);
  let checked = 0;
  for (const format of ['landscape', 'portrait'] as const) {
    const geometry = city.cityGeometry(format);
    for (const cue of city.cityCues) for (const [wordIndex, word] of cue.words.entries()) {
      const first = Math.ceil(word.start * FPS);
      const last = Math.ceil(word.end * FPS) - 1;
      assert(first <= last, `${cue.id} ${word.text} needs an active frame`);
      const frame = Math.floor((first + last) / 2);
      const time = frame / FPS;
      assert.equal(city.getCityCue(time)?.id, cue.id, `${cue.id} cue at focus frame`);
      const {context, focusPixels} = traceContext(geometry.w, geometry.h, true);
      city.paintCity(context, frame, format);
      const placements = city.lyricPose(cue, time, format).filter(p => p.index === wordIndex);
      assert(placements.length > 0, `${format} ${cue.id} ${word.text} has a material placement`);
      assert(focusPixels.some(pixel => placements.some(p =>
        pixel.x >= p.x - 1 && pixel.x <= p.x + p.width + 1 &&
        pixel.y >= p.y - 1 && pixel.y <= p.y + p.height + 1)),
      `${format} ${cue.id} ${word.text} has no highlighted glyph at ${time.toFixed(3)} s`);
      checked++;
    }
  }
  assert.equal(checked, 152, 'All 76 words were inspected in both layouts');
});

test('lettering leaves the native sign glass visible without opaque panel fills', () => {
  city.setCityAirship({} as CanvasImageSource);
  city.setCityTrain({} as CanvasImageSource);
  city.setCitySprites({} as CanvasImageSource);
  city.setCityBackground('landscape', {} as CanvasImageSource);
  city.setCityBackground('portrait', {} as CanvasImageSource);
  for (const format of ['landscape', 'portrait'] as const) {
    const geometry = city.cityGeometry(format);
    for (const cue of city.cityCues) {
      const frame = Math.round((cue.start + cue.end) * FPS / 2);
      const time = frame / FPS;
      const {context, solidFills} = traceContext(geometry.w, geometry.h, false, true);
      city.paintCity(context, frame, format);
      for (const surface of city.lyricSurfaces(cue, time, format)) {
        const box = surface.box;
        assert(!solidFills.some(fill =>
          fill.x <= box.x + .5 && fill.y <= box.y + .5 &&
          fill.x + fill.w >= box.x + box.w - .5 &&
          fill.y + fill.h >= box.y + box.h - .5),
        `${format} ${cue.id} ${surface.name} has an opaque rectangular backing over native art`);
      }
    }
  }
});

test('focused glyph cells inherit subpixel motion from the train and airship', () => {
  city.setCityAirship({} as CanvasImageSource);
  city.setCityTrain({} as CanvasImageSource);
  city.setCitySprites({} as CanvasImageSource);
  city.setCityBackground('landscape', {} as CanvasImageSource);
  city.setCityBackground('portrait', {} as CanvasImageSource);
  for (const format of ['landscape', 'portrait'] as const) {
    const geometry = city.cityGeometry(format);
    for (const [id, wordIndex, frame] of [['CH-03', 0, 6360], ['CH-04', 3, 6720]] as const) {
      const cue = city.cityCues.find(item => item.id === id);
      assert(cue, `${id} cue exists`);
      const word = cue.words[wordIndex];
      assert(word && frame / FPS >= word.start && (frame + 1) / FPS < word.end, `${id} focus interval`);
      const positions: number[] = [];
      const anchors: number[] = [];
      for (const currentFrame of [frame, frame + 1]) {
        const time = currentFrame / FPS;
        const {context, focusPixels} = traceContext(geometry.w, geometry.h, true);
        city.paintCity(context, currentFrame, format);
        assert(focusPixels.length > 0, `${format} ${id} draws focused glyphs`);
        positions.push(Math.min(...focusPixels.map(pixel => pixel.x)));
        const placement: Placement | undefined = city.lyricPose(cue, time, format).find((item: Placement) => item.index === wordIndex);
        assert(placement, `${format} ${id} word placement`);
        anchors.push(placement.x);
      }
      const expected = anchors[1]! - anchors[0]!;
      const actual = positions[1]! - positions[0]!;
      assert(Math.abs(expected) > .03 && Math.abs(expected) < .5,
        `${format} ${id} needs an observable subpixel vehicle step`);
      near(actual, expected, `${format} ${id} focus follows its moving native sign`);
    }
  }
});

test('camera travel is continuous across sung words and scene cuts', () => {
  for (const format of ['landscape', 'portrait'] as const) {
    let previous = city.cityCamera(0, format);
    for (let frame = 1; frame < DURATION_FRAMES; frame++) {
      const camera = city.cityCamera(frame / FPS, format);
      assert(Math.abs(camera.zoom - previous.zoom) < .012,
        `${format} camera zoom jumps at frame ${frame}`);
      assert(Math.hypot(camera.x - previous.x, camera.y - previous.y) < 2.6,
        `${format} camera center jumps at frame ${frame}`);
      previous = camera;
    }
  }
});
