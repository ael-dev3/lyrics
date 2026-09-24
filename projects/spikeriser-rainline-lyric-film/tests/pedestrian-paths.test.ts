import assert from 'node:assert/strict';
import {resolve} from 'node:path';
import {test} from 'node:test';
import {build} from 'esbuild';
import {DURATION_FRAMES, FPS} from '../src/config.ts';

const bundle = await build({entryPoints: [resolve('src/pedestrian-paths.ts')], bundle: true, platform: 'node', format: 'esm', write: false});
const bytes = bundle.outputFiles?.[0]?.contents;
assert(bytes, 'pedestrian paths bundle exists');
const paths = await import(`data:text/javascript;base64,${Buffer.from(bytes).toString('base64')}`) as typeof import('../src/pedestrian-paths.ts');

test('every pedestrian shoe remains behind the painted curb for the full recording', () => {
  for (const format of ['landscape', 'portrait'] as const) {
    const pavement = paths.SIDEWALK[format];
    for (let frame = 0; frame < DURATION_FRAMES; frame++) {
      const time = frame / FPS;
      const pedestrians = paths.getSidewalkPedestrians(time, format);
      assert.equal(pedestrians.length, format === 'portrait' ? 7 : 9);
      for (const person of pedestrians) {
        // The renderer's shoe/shadow extends at most three native pixels below
        // footY before scaling from its 74-pixel source height.
        const shoeBottom = person.footY + 3 * person.height / 74;
        assert(shoeBottom < pavement.roadEdgeY - 1,
          `${format} walker in the roadway at ${time.toFixed(3)} s: ${shoeBottom.toFixed(2)}`);
        assert(person.footY - person.height > (format === 'portrait' ? 467 : 262),
          `${format} walker overlaps a shop lyric sign at ${time.toFixed(3)} s`);
      }
    }
  }
});
