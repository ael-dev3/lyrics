import {createHash} from 'node:crypto';
import {existsSync, mkdirSync, readFileSync, writeFileSync} from 'node:fs';
import {join} from 'node:path';
import {PROJECT_ROOT} from './project-root';

const staging = join(PROJECT_ROOT, 'work', 'release', 'staging');
const names = [
  'Roi-x-Slow-Down-Alignment.json',
  'Roi-x-Slow-Down-Lyric-Film-1080p60.mp4',
  'Roi-x-Slow-Down-Release-QA.json',
  'Roi-x-Slow-Down-Release-QA.md',
  'Roi-x-Slow-Down-Release-Notes.md',
  'Roi-x-Slow-Down-Source-1080p60-AI-Upscaled.mp4',
  'Roi-x-Slow-Down-Source-Metadata.json',
  'Roi-x-Slow-Down-Sync-Proof-120fps.mp4',
  'Roi-x-Slow-Down-Transcription-Evidence.zip',
  'Roi-x-Slow-Down-Workflow.zip',
];

const digest = (name: string): string => createHash('sha256').update(readFileSync(join(staging, name))).digest('hex').toUpperCase();
const missing = names.filter((name) => !existsSync(join(staging, name)));
if (missing.length > 0) throw new Error(`missing release assets: ${missing.join(', ')}`);

mkdirSync(staging, {recursive: true});
const manifest = names.map((name) => `${digest(name)}  ${name}`).join('\n') + '\n';
writeFileSync(join(staging, 'Roi-x-Slow-Down-Checksums.sha256'), manifest, 'utf8');
console.log(`wrote ${join(staging, 'Roi-x-Slow-Down-Checksums.sha256')}`);
