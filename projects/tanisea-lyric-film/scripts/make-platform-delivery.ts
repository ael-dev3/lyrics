import {execFileSync} from 'node:child_process';
import {existsSync, statSync} from 'node:fs';
import {resolve} from 'node:path';
import {projectRootFromScriptDirectory} from './project-root.js';

const root = projectRootFromScriptDirectory(__dirname);
const archivalPath = resolve(
  process.argv[2] ??
    resolve(root, 'output', 'Tanisea-Lyric-Film-vNext-60fps-Archival-Master.mp4'),
);
const outputPath = resolve(
  process.argv[3] ??
    resolve(root, 'output', 'Tanisea-Lyric-Film-vNext-60fps-Final.mp4'),
);

if (!existsSync(archivalPath)) {
  throw new Error(`Archival master does not exist: ${archivalPath}`);
}

// The supplied audits measure roughly -6 LUFS and +2.5 dBTP. A transparent
// 4 dB attenuation targets about -10 LUFS and -1.5 dBTP before AAC, retaining
// dynamics while leaving margin for codec/platform inter-sample overs.
execFileSync(
  'ffmpeg',
  [
    '-hide_banner',
    '-i',
    archivalPath,
    '-map',
    '0:v:0',
    '-map',
    '0:a:0',
    '-c:v',
    'copy',
    '-tag:v',
    'hvc1',
    '-af',
    'volume=-4dB,atrim=start=0:end=153,asetpts=PTS-STARTPTS',
    '-c:a',
    'aac',
    '-b:a',
    '256k',
    // Bound the mux explicitly so AAC encoder padding cannot extend the
    // platform MP4 beyond the authoritative 153.000-second video timeline.
    '-t',
    '153',
    '-movflags',
    '+faststart',
    '-metadata',
    'title=Tanisea — I’ll Scream to the Whole World — Platform Delivery',
    '-metadata:s:a:0',
    'handler_name=Platform-safe soundtrack — 4 dB attenuation',
    '-y',
    outputPath,
  ],
  {stdio: 'inherit'},
);

const size = statSync(outputPath).size;
process.stdout.write(
  `Encoded ${outputPath}\nBytes: ${size}\nMiB: ${(size / 1024 / 1024).toFixed(2)}\n`,
);
