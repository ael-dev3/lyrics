import assert from 'node:assert/strict';
import {resolve} from 'node:path';
import {test} from 'node:test';
import {build} from 'esbuild';

// Bundle the same city module used by the browser and Remotion, including its JSON data.
const bundle = await build({entryPoints: [resolve('src/city.ts')], bundle: true, platform: 'node', format: 'esm', write: false});
const bytes = bundle.outputFiles?.[0]?.contents;
assert(bytes, 'city bundle exists');
const city = await import(`data:text/javascript;base64,${Buffer.from(bytes).toString('base64')}`) as typeof import('../src/city.ts');

test('every timed word remains assigned to its performed cue', () => {
  for (const cue of city.cityCues) {
    assert.equal(cue.words.length, cue.text.trim().split(/\s+/).length, `${cue.id} word inventory`);
    for (const word of cue.words) {
      assert(word.start >= cue.start && word.end <= cue.end && word.end > word.start, `${cue.id} ${word.text} timing`);
      const times = [word.start + .001, (word.start + word.end) / 2, word.end - .001];
      for (const time of times) {
        assert.equal(city.getCityCue(time)?.id, cue.id, `${cue.id} ${word.text} at ${time.toFixed(3)} s`);
      }
    }
  }
});

test('every active word fits its moving surface and the camera on every 60 fps frame', () => {
  let checked = 0;
  for (const format of ['landscape', 'portrait'] as const) {
    const geometry = city.cityGeometry(format);
    for (const cue of city.cityCues) {
      const host = city.cueHost(cue);
      assert(host, `${cue.id} host`);
      for (const [wordIndex, word] of cue.words.entries()) {
        const first = Math.ceil(word.start * 60);
        const last = Math.ceil(word.end * 60) - 1;
        assert(first <= last, `${cue.id} ${word.text} has no visible 60 fps focus frame`);
        for (let frame = first; frame <= last; frame++) {
          const time = frame / 60;
          assert.equal(city.getCityCue(time)?.id, cue.id, `${cue.id} ${word.text} loses its cue at ${time.toFixed(3)} s`);
          if (host === 'train') assert(city.trainPose(time, format).visible, `${cue.id} ${word.text} loses the track train`);
          if (host === 'airship') assert(city.airshipPose(time, format).visible, `${cue.id} ${word.text} loses the airship`);
          const placements = city.lyricPose(cue, time, format);
          const camera = city.cityCamera(time, format);
          const left = camera.x - geometry.w / (2 * camera.zoom);
          const right = camera.x + geometry.w / (2 * camera.zoom);
          const top = camera.y - geometry.h / (2 * camera.zoom);
          const bottom = camera.y + geometry.h / (2 * camera.zoom);
          let visible = false;
          for (const placement of placements) {
            assert(placement.width > 0 && placement.height > 0 && placement.unit > 0, `${cue.id} ${placement.word} invalid glyph geometry`);
            assert(placement.x >= placement.surface.x - 1e-6 && placement.x + placement.width <= placement.surface.x + placement.surface.w + 1e-6 &&
              placement.y >= placement.surface.y - 1e-6 && placement.y + placement.height <= placement.surface.y + placement.surface.h + 1e-6,
            `${format} ${cue.id} ${placement.word} overflows its ${host} surface at ${time.toFixed(3)} s`);
            if (placement.index === wordIndex && placement.x >= left - 1e-6 && placement.x + placement.width <= right + 1e-6 &&
              placement.y >= top - 1e-6 && placement.y + placement.height <= bottom + 1e-6) visible = true;
          }
          assert(visible, `${format} ${cue.id} ${word.text} has no fully visible placement at ${time.toFixed(3)} s`);
          checked++;
        }
      }
    }
  }
  assert(checked >= 152, 'Every word was checked in both layouts');
});
