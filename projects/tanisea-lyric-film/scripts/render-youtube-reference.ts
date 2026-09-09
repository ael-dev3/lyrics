import {execFileSync} from 'node:child_process';
import {existsSync, statSync} from 'node:fs';
import {resolve} from 'node:path';
import {projectRootFromScriptDirectory} from './project-root.js';

const COMPOSITION = 'LyricFilmYouTube';
const FRAME_COUNT = 9_180;
const FPS = 60;

const root = projectRootFromScriptDirectory(__dirname);
const entryPoint = resolve(root, 'src', 'index.ts');
const outputPath = resolve(
  root,
  'output',
  'Tanisea-Lyric-Film-YouTube-1920x1080-Reference.mov',
);

if (!existsSync(entryPoint)) {
  throw new Error(`Required entry point does not exist: ${entryPoint}`);
}
if (existsSync(outputPath)) {
  throw new Error(`Refusing to overwrite existing YouTube reference: ${outputPath}`);
}

execFileSync(
  'npx',
  [
    'remotion',
    'render',
    entryPoint,
    COMPOSITION,
    outputPath,
    '--codec=prores',
    '--prores-profile=4444',
    '--pixel-format=yuv444p10le',
    '--image-format=png',
    '--color-space=bt709',
    '--concurrency=4',
    '--timeout=120000',
    '--muted',
    '--overwrite',
  ],
  {cwd: root, stdio: 'inherit'},
);

process.stdout.write(
  `${JSON.stringify(
    {
      composition: COMPOSITION,
      frameCount: FRAME_COUNT,
      fps: FPS,
      durationSeconds: FRAME_COUNT / FPS,
      width: 1_920,
      height: 1_080,
      outputPath: 'output/Tanisea-Lyric-Film-YouTube-1920x1080-Reference.mov',
      outputSizeBytes: statSync(outputPath).size,
    },
    null,
    2,
  )}\n`,
);
