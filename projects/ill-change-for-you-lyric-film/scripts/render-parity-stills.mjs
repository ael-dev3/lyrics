import {spawnSync} from 'node:child_process';

// Same-clock, complete-composition stills for browser comparison and
// independent post-encode QA. These include a dense cue, the corrected
// first-refrain pause/entrance, a held word, a repeat and the source tail.
export const frames = Object.freeze([2700, 3678, 3726, 6186, 7776, 9210, 10461, 11400, 11592]);
for (const [format, label] of [['landscape', 'original-4x3'], ['portrait', 'portrait-9x16']]) {
  for (const frame of frames) {
    const output = `output/qa-reference/${label}/frame-${String(frame).padStart(6, '0')}.png`;
    const result = spawnSync(process.execPath, [
      'scripts/render-production.mjs', '--still', '--format', format,
      '--start', String(frame / 60), '--output', output,
    ], {stdio: 'inherit'});
    if (result.status !== 0) throw Error(`Parity still failed: ${output}`);
  }
}
