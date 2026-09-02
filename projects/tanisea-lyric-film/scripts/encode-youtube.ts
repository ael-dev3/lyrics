import {execFileSync} from 'node:child_process';
import {existsSync, statSync} from 'node:fs';
import {resolve} from 'node:path';
import {projectRootFromScriptDirectory} from './project-root.js';

const FRAME_COUNT = 9_180;
const DURATION_SECONDS = 153;
const WIDTH = 1_920;
const HEIGHT = 1_080;

const root = projectRootFromScriptDirectory(__dirname);
const referencePath = resolve(
  root,
  'output',
  'Tanisea-Lyric-Film-YouTube-1920x1080-Reference.mov',
);
const soundtrackPath = resolve(root, 'public', 'soundtrack.m4a');
const outputPath = resolve(
  root,
  'output',
  'Tanisea-Lyric-Film-YouTube-1920x1080-Final.mp4',
);

for (const requiredPath of [referencePath, soundtrackPath]) {
  if (!existsSync(requiredPath)) {
    throw new Error(`Required input does not exist: ${requiredPath}`);
  }
}

if (existsSync(outputPath)) {
  throw new Error(`Refusing to overwrite existing YouTube delivery: ${outputPath}`);
}

execFileSync(
  'ffmpeg',
  [
    '-hide_banner',
    '-i',
    referencePath,
    '-i',
    soundtrackPath,
    '-map',
    '0:v:0',
    '-map',
    '1:a:0',
    '-vf',
    [
      `scale=${WIDTH}:${HEIGHT}`,
      'flags=lanczos+accurate_rnd+full_chroma_inp+full_chroma_int',
      'in_range=tv',
      'out_range=tv',
      'in_color_matrix=bt709',
      'out_color_matrix=bt709',
    ].join(':') + ',format=yuv420p',
    '-c:v',
    'libx264',
    '-preset',
    'slow',
    '-crf',
    '16',
    '-profile:v',
    'high',
    '-level:v',
    '4.2',
    '-g',
    '120',
    '-tag:v',
    'avc1',
    '-color_primaries',
    'bt709',
    '-color_trc',
    'bt709',
    '-colorspace',
    'bt709',
    '-color_range',
    'tv',
    '-frames:v',
    String(FRAME_COUNT),
    '-af',
    `volume=-4dB,atrim=start=0:end=${DURATION_SECONDS},asetpts=PTS-STARTPTS`,
    '-c:a',
    'aac',
    '-b:a',
    '256k',
    '-t',
    String(DURATION_SECONDS),
    '-movflags',
    '+faststart',
    '-metadata',
    'title=Tanisea & ksviety — Закричу на весь мир (Remix) — English Lyric Film',
    '-metadata:s:v:0',
    'handler_name=Tanisea English Lyric Film — YouTube 1920x1080',
    '-metadata:s:a:0',
    'handler_name=Platform-safe soundtrack — 4 dB attenuation',
    '-n',
    outputPath,
  ],
  {stdio: 'inherit'},
);

const sizeBytes = statSync(outputPath).size;
process.stdout.write(
  `${JSON.stringify(
    {
      path: 'output/Tanisea-Lyric-Film-YouTube-1920x1080-Final.mp4',
      frameCount: FRAME_COUNT,
      durationSeconds: DURATION_SECONDS,
      width: WIDTH,
      height: HEIGHT,
      sizeBytes,
    },
    null,
    2,
  )}\n`,
);
