import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {test} from 'node:test';
import {build} from 'esbuild';
import {FPS} from '../src/config.ts';
import type {Surface} from '../src/city-choreography.ts';

type Box = {x: number; y: number; w: number; h: number};
type Format = 'landscape' | 'portrait';
type NativeLayout = {tower: Box; leftAd: Box; rightAd: Box; catSign: Box; shops: Box[]};
type Fixture = {
  landscape: NativeLayout; portrait: NativeLayout;
  trainGlassInset: Box;
  airshipGlassInsetWidthFractions: Box;
};

// This fixture is independent of the choreography code: the native writable
// glass bounds were recorded for the generated art at logical scene scale.
const fixture = JSON.parse(readFileSync(resolve('tests/native-apertures.fixture.json'), 'utf8')) as Fixture;
const bundle = await build({entryPoints: [resolve('src/city-choreography.ts')], bundle: true, platform: 'node', format: 'esm', write: false});
const bytes = bundle.outputFiles?.[0]?.contents;
assert(bytes, 'choreography bundle exists');
const city = await import(`data:text/javascript;base64,${Buffer.from(bytes).toString('base64')}`) as typeof import('../src/city-choreography.ts');

function sameBox(actual: Box, expected: Box, label: string) {
  for (const key of ['x', 'y', 'w', 'h'] as const) {
    assert(Math.abs(actual[key] - expected[key]) < 1e-6,
      `${label} ${key}: expected native ${expected[key]}, got ${actual[key]}`);
  }
}

test('fixed lyric apertures match the recorded writable glass in both city bitmaps', () => {
  for (const format of ['landscape', 'portrait'] as const) {
    const expected = fixture[format];
    const geometry = city.cityGeometry(format);
    sameBox(geometry.tower, expected.tower, `${format} civic board`);
    sameBox(geometry.leftAd, expected.leftAd, `${format} left ad`);
    sameBox(geometry.rightAd, expected.rightAd, `${format} right ad`);
    const catWindow = city.catWindow(format);
    assert(expected.tower.x + expected.tower.w <= catWindow.x - 2,
      `${format} civic lettering must leave the cat's native window clear`);
    const shops = city.shopSigns(format);
    assert.equal(shops.length, expected.shops.length, `${format} native shop count`);
    shops.forEach((shop, index) => sameBox(shop, expected.shops[index]!, `${format} shop ${index}`));
  }
});

test('all lyric surfaces use unexpanded native apertures throughout every sung frame', () => {
  let inspected = 0;
  for (const format of ['landscape', 'portrait'] as const) {
    const native = fixture[format];
    for (const cue of city.cityCues) for (const word of cue.words) {
      for (let frame = Math.ceil(word.start * FPS); frame < Math.ceil(word.end * FPS); frame++) {
        const time = frame / FPS;
        const train = city.trainPose(time, format);
        const airship = city.airshipPose(time, format);
        for (const surface of city.lyricSurfaces(cue, time, format)) {
          let expected: Box;
          const shop = /^shop-(\d+)$/.exec(surface.name);
          if (shop) {
            expected = native.shops[Number(shop[1])]!;
            assert(expected, `${format} ${cue.id} uses a native shop`);
          } else if (surface.name === 'portrait-relay' || surface.name === 'civic-response' || surface.name === 'civic-billboard') {
            expected = native.tower;
          } else if (surface.name === 'tower-neon') {
            expected = cue.id === 'CH-01' ? native.leftAd : native.rightAd;
          } else if (surface.name === 'stellar-ad') {
            expected = format === 'landscape' ? native.leftAd : native.tower;
          } else if (surface.name === 'cat-apartment-sign') {
            expected = native.catSign;
          } else if (surface.name === 'train-led') {
            const inset = fixture.trainGlassInset;
            expected = {x: train.x + inset.x, y: train.y + inset.y, w: inset.w, h: inset.h};
            assert.equal(train.visible, true, `${format} ${cue.id} train remains present`);
          } else if (surface.name === 'airship-led') {
            const inset = fixture.airshipGlassInsetWidthFractions;
            expected = {
              x: airship.x + airship.width * inset.x,
              y: airship.y + airship.width * inset.y,
              w: airship.width * inset.w,
              h: airship.width * inset.h,
            };
            assert.equal(airship.visible, true, `${format} ${cue.id} airship remains present`);
          } else {
            assert.fail(`${format} ${cue.id} uses unknown lyric surface ${surface.name}`);
          }
          sameBox(surface.box, expected, `${format} ${cue.id} ${surface.name} at ${time.toFixed(3)} s`);
          inspected++;
        }
      }
    }
  }
  assert(inspected > 1000, 'All words and their moving native apertures were inspected');
});

test('the final train line uses two intentional native-panel rows', () => {
  const cue = city.cityCues.find(item => item.id === 'V2-04');
  assert(cue, 'final train cue exists');
  for (const format of ['landscape', 'portrait'] as const) {
    const panel: Surface | undefined = city.lyricSurfaces(cue, cue.start + .01, format)[0];
    assert.deepEqual(panel?.rows, [[0, 1], [2, 3, 4]], `${format} train rows`);
  }
});
