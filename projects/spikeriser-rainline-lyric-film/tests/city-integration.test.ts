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

test('each lyric word fits its host and camera in both layouts', () => {
  for (const format of ['landscape', 'portrait'] as const) {
    const geometry = city.cityGeometry(format);
    for (const cue of city.cityCues) {
      const host = city.cueHost(cue);
      assert(host, `${cue.id} host`);
      const box = geometry[host];
      const layout = city.lyricLayout(cue, box, format, host);
      assert.equal(layout.placements.length, cue.words.length, `${cue.id} ${format} placements`);
      for (const placement of layout.placements) {
        const word = cue.words[placement.index];
        assert(word, `${cue.id} ${format} placed word`);
        const width = (placement.word.length * 6 - 1) * layout.unit;
        const height = 7 * layout.unit;
        assert(placement.x >= box.x && placement.x + width <= box.x + box.w,
          `${cue.id} ${format} ${placement.word} overflows host horizontally`);
        assert(placement.y >= box.y && placement.y + height <= box.y + box.h,
          `${cue.id} ${format} ${placement.word} overflows host vertically`);
        const time = (word.start + word.end) / 2;
        const camera = city.cityCamera(time, format);
        const left = camera.x - geometry.w / (2 * camera.zoom);
        const right = camera.x + geometry.w / (2 * camera.zoom);
        const top = camera.y - geometry.h / (2 * camera.zoom);
        const bottom = camera.y + geometry.h / (2 * camera.zoom);
        assert(placement.x >= left && placement.x + width <= right && placement.y >= top && placement.y + height <= bottom,
          `${cue.id} ${format} ${placement.word} outside camera at ${time.toFixed(3)} s`);
      }
    }
  }
});
