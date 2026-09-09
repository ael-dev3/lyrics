import {createHash} from 'node:crypto';
import {existsSync, mkdirSync, readFileSync, writeFileSync} from 'node:fs';
import {join, relative} from 'node:path';
import {PROJECT_ROOT} from './project-root';

const candidates = [
  join(PROJECT_ROOT, 'work', 'source', 'roi-slowdown-source.mp4'),
  join(PROJECT_ROOT, 'output', 'Roi-x-Slow-Down-Lyric-Film-1080p60.mp4'),
  join(PROJECT_ROOT, 'output', 'Roi-x-Slow-Down-Sync-Proof-120fps.mp4'),
  join(PROJECT_ROOT, 'alignment', 'roi-slowdown-dual-song-v1.json'),
  join(PROJECT_ROOT, 'work', 'source', 'roi-slowdown-source.info.json'),
  join(PROJECT_ROOT, 'work', 'release', 'roi-slowdown-release-qa.json'),
  join(PROJECT_ROOT, 'work', 'release', 'roi-slowdown-release-qa.md'),
];

const digest = (path: string): string => createHash('sha256').update(readFileSync(path)).digest('hex').toUpperCase();
const lines = candidates.filter(existsSync).map((path) => `${digest(path)}  ${relative(PROJECT_ROOT, path).replaceAll('\\', '/')}`);
const outputPath = join(PROJECT_ROOT, 'work', 'release', 'CHECKSUMS.sha256');
mkdirSync(join(PROJECT_ROOT, 'work', 'release'), {recursive: true});
writeFileSync(outputPath, `${lines.join('\n')}\n`, 'utf8');
console.log(`wrote ${outputPath}`);
