import {execFileSync} from 'node:child_process';
import {existsSync, statSync} from 'node:fs';
import {resolve} from 'node:path';
import {projectRootFromScriptDirectory} from './project-root.js';

const PROOF_COMPOSITION = 'LyricFilmYouTubeSyncProof';
const PROOF_FRAME_COUNT = 18_360;
const PROOF_FPS = 120;
const PROOF_TIMEOUT_MILLISECONDS = 120_000;
const PROOF_CONCURRENCY = 4;

const root = projectRootFromScriptDirectory(__dirname);
const entryPoint = resolve(root, 'src', 'index.ts');
const soundtrackPath = resolve(root, 'public', 'soundtrack.m4a');
const outputPath = resolve(
  root,
  'output',
  'Tanisea-Lyric-Film-YouTube-Sync-Proof-120fps.mp4',
);
const mutedOutputPath = resolve(
  root,
  'output',
  'Tanisea-Lyric-Film-YouTube-Sync-Proof-120fps.video-only.mp4',
);

for (const requiredPath of [entryPoint, soundtrackPath]) {
  if (!existsSync(requiredPath)) {
    throw new Error(`Required input does not exist: ${requiredPath}`);
  }
}

for (const output of [mutedOutputPath, outputPath]) {
  if (existsSync(output)) {
    throw new Error(`Refusing to overwrite existing YouTube proof output: ${output}`);
  }
}

execFileSync(
  'npx',
  [
    'remotion',
    'render',
    entryPoint,
    PROOF_COMPOSITION,
    mutedOutputPath,
    '--codec=h264',
    '--crf=12',
    '--pixel-format=yuv420p',
    '--color-space=bt709',
    `--concurrency=${PROOF_CONCURRENCY}`,
    `--timeout=${PROOF_TIMEOUT_MILLISECONDS}`,
    '--muted',
    '--overwrite',
  ],
  {cwd: root, stdio: 'inherit'},
);

execFileSync(
  'ffmpeg',
  [
    '-hide_banner',
    '-i',
    mutedOutputPath,
    '-i',
    soundtrackPath,
    '-map',
    '0:v:0',
    '-map',
    '1:a:0',
    '-c:v',
    'copy',
    '-c:a',
    'copy',
    '-tag:v',
    'avc1',
    '-movflags',
    '+faststart',
    '-n',
    outputPath,
  ],
  {cwd: root, stdio: 'inherit'},
);

process.stdout.write(
  `${JSON.stringify(
    {
      composition: PROOF_COMPOSITION,
      frameCount: PROOF_FRAME_COUNT,
      fps: PROOF_FPS,
      durationSeconds: PROOF_FRAME_COUNT / PROOF_FPS,
      outputPath: 'output/Tanisea-Lyric-Film-YouTube-Sync-Proof-120fps.mp4',
      outputSizeBytes: statSync(outputPath).size,
    },
    null,
    2,
  )}\n`,
);
