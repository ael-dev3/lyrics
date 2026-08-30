import {execFileSync} from 'node:child_process';
import {existsSync, statSync} from 'node:fs';
import {resolve} from 'node:path';

const root = resolve(__dirname, '..');
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
      'scale=1080:1080',
      'flags=lanczos+accurate_rnd+full_chroma_inp+full_chroma_int',
      'in_range=tv',
      'out_range=tv',
      'in_color_matrix=bt709',
      'out_color_matrix=bt709',
    ].join(':') + ',format=yuv420p10le',
    '-c:v',
    'libx265',
    '-preset',
    'slow',
    '-crf',
    '18',
    '-x265-params',
    'colorprim=bt709:transfer=bt709:colormatrix=bt709:range=limited:repeat-headers=1',
    '-tag:v',
    'hvc1',
    '-color_primaries',
    'bt709',
    '-color_trc',
    'bt709',
    '-colorspace',
    'bt709',
    '-color_range',
    'tv',
    '-fps_mode',
    'passthrough',
    '-c:a',
    'copy',
    '-movflags',
    '+faststart',
    '-metadata',
    'title=Tanisea — I’ll Scream to the Whole World',
    '-metadata:s:v:0',
    'handler_name=Tanisea English Lyric Film vNext',
    '-metadata:s:a:0',
    'handler_name=Original soundtrack — untouched AAC',
    '-y',
    outputPath,
  ],
  {stdio: 'inherit'},
);

const size = statSync(outputPath).size;
process.stdout.write(
  `Encoded ${outputPath}\nBytes: ${size}\nMiB: ${(size / 1024 / 1024).toFixed(2)}\n`,
);
