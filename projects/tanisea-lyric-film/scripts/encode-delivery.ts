import {execFileSync} from 'node:child_process';
import {existsSync, statSync} from 'node:fs';
import {resolve} from 'node:path';
import {createArchivalDeliveryArguments} from './encode-delivery-plan.js';
import {projectRootFromScriptDirectory} from './project-root.js';

const root = projectRootFromScriptDirectory(__dirname);
const referencePath = resolve(
  process.argv[2] ??
    resolve(root, 'output', 'Tanisea-Lyric-Film-vNext-reference-2x.mov'),
);
const outputPath = resolve(
  process.argv[3] ??
    resolve(root, 'output', 'Tanisea-Lyric-Film-vNext-60fps-Archival-Master.mp4'),
);
const soundtrackPath = resolve(root, 'public', 'soundtrack.m4a');

for (const requiredPath of [referencePath, soundtrackPath]) {
  if (!existsSync(requiredPath)) {
    throw new Error(`Required input does not exist: ${requiredPath}`);
  }
}

// Keep the complete 9,180-frame visual timeline authoritative. FFmpeg's
// `-shortest` stopped four frames early at this AAC stream's final packet
// boundary even though both inputs report 153.000 seconds.

execFileSync(
  'ffmpeg',
  [...createArchivalDeliveryArguments({referencePath, soundtrackPath, outputPath})],
  {stdio: 'inherit'},
);

const size = statSync(outputPath).size;
process.stdout.write(
  `Encoded ${outputPath}\nBytes: ${size}\nMiB: ${(size / 1024 / 1024).toFixed(2)}\n`,
);
