import {readFileSync} from 'node:fs';
import {join} from 'node:path';
import {dualSongAlignment} from '../src/lyrics';
import {SAMPLE_RATE, SOURCE_DURATION_SECONDS} from '../src/timing';
import {PROJECT_ROOT} from './project-root';

const fail = (message: string): never => {
  throw new Error(`alignment validation failed: ${message}`);
};

for (const song of dualSongAlignment.songs) {
  let previousEnd = 0;
  for (const line of song.lines) {
    if (!Number.isInteger(line.startSample) || !Number.isInteger(line.endSample)) fail(`${line.id} samples must be integers`);
    if (line.startSample < 0 || line.endSample <= line.startSample) fail(`${line.id} interval is invalid`);
    if (line.endSample / SAMPLE_RATE > SOURCE_DURATION_SECONDS + 0.1) fail(`${line.id} exceeds source duration`);
    if (line.startSample < previousEnd) fail(`${line.id} overlaps an earlier line in ${song.id}`);
    previousEnd = line.endSample;
    for (const word of line.words) {
      if (word.startSample < line.startSample || word.endSample > line.endSample || word.endSample <= word.startSample) fail(`${word.id} is outside ${line.id}`);
    }
  }
}

const manifestPath = join(PROJECT_ROOT, 'alignment', 'roi-slowdown-dual-song-v1.json');
const manifest = JSON.parse(readFileSync(manifestPath, 'utf8')) as {sourceSha256?: string; songs?: unknown[]};
if (manifest.sourceSha256 !== dualSongAlignment.sourceSha256) fail('exported manifest is not bound to the locked source hash');
if (!Array.isArray(manifest.songs) || manifest.songs.length !== 2) fail('exported manifest must contain two song lanes');
console.log(`validated ${dualSongAlignment.songs[0].lines.length} Song 1 lines and ${dualSongAlignment.songs[1].lines.length} Song 2 lines at ${SAMPLE_RATE} Hz`);
