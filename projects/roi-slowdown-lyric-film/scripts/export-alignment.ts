import {mkdirSync, writeFileSync} from 'node:fs';
import {join} from 'node:path';
import {dualSongAlignment} from '../src/lyrics';
import {PROJECT_ROOT} from './project-root';

const outputPath = join(PROJECT_ROOT, 'alignment', 'roi-slowdown-dual-song-v1.json');
mkdirSync(join(PROJECT_ROOT, 'alignment'), {recursive: true});
writeFileSync(outputPath, `${JSON.stringify(dualSongAlignment, null, 2)}\n`, 'utf8');
console.log(`wrote ${outputPath}`);
