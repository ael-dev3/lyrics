import {execFileSync, spawnSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {closeSync, openSync, readFileSync, readSync, statSync} from 'node:fs';
import {resolve} from 'node:path';

type ProbeStream = Readonly<{
  codec_type?: string;
  codec_name?: string;
  codec_tag_string?: string;
  width?: number;
  height?: number;
  pix_fmt?: string;
  color_range?: string;
  color_space?: string;
  color_transfer?: string;
  color_primaries?: string;
  avg_frame_rate?: string;
  start_time?: string;
  duration?: string;
  nb_frames?: string;
  sample_rate?: string;
  channels?: number;
}>;

type Probe = Readonly<{
  streams?: readonly ProbeStream[];
  format?: Readonly<{duration?: string; start_time?: string; size?: string}>;
}>;

const root = resolve(__dirname, '..');
const argumentsList = process.argv.slice(2);
const platformSafe = argumentsList.includes('--platform-safe');
const explicitPath = argumentsList.find((argument) => argument !== '--platform-safe');
const deliveryPath = resolve(
  explicitPath ??
    resolve(
      root,
      'output',
      platformSafe
        ? 'Tanisea-Lyric-Film-vNext-60fps-Final.mp4'
        : 'Tanisea-Lyric-Film-vNext-60fps-Archival-Master.mp4',
    ),
);
const soundtrackPath = resolve(root, 'public', 'soundtrack.m4a');

const probe = JSON.parse(
  execFileSync(
    'ffprobe',
    [
      '-v',
      'error',
      '-show_streams',
      '-show_format',
      '-of',
      'json',
      deliveryPath,
    ],
    {encoding: 'utf8'},
  ),
) as Probe;

const video = probe.streams?.find(({codec_type}) => codec_type === 'video');
const audio = probe.streams?.find(({codec_type}) => codec_type === 'audio');

const requireValue = (condition: boolean, message: string): void => {
  if (!condition) throw new Error(message);
};

requireValue(video?.codec_name === 'hevc', `Expected HEVC, got ${video?.codec_name}`);
requireValue(video?.codec_tag_string === 'hvc1', `Expected hvc1, got ${video?.codec_tag_string}`);
requireValue(video?.width === 1080 && video.height === 1080, 'Expected 1080×1080 video');
requireValue(video?.pix_fmt === 'yuv420p10le', `Expected yuv420p10le, got ${video?.pix_fmt}`);
requireValue(video?.avg_frame_rate === '60/1', `Expected 60/1 fps, got ${video?.avg_frame_rate}`);
requireValue(video?.nb_frames === '9180', `Expected 9,180 frames, got ${video?.nb_frames}`);
requireValue(video?.color_range === 'tv', `Expected limited range, got ${video?.color_range}`);
requireValue(video?.color_space === 'bt709', `Expected BT.709 matrix, got ${video?.color_space}`);
requireValue(video?.color_transfer === 'bt709', `Expected BT.709 transfer, got ${video?.color_transfer}`);
requireValue(video?.color_primaries === 'bt709', `Expected BT.709 primaries, got ${video?.color_primaries}`);
requireValue(audio?.codec_name === 'aac', `Expected AAC, got ${audio?.codec_name}`);
requireValue(audio?.sample_rate === '44100', `Expected 44.1 kHz, got ${audio?.sample_rate}`);
requireValue(audio?.channels === 2, `Expected stereo, got ${audio?.channels} channels`);

const duration = Number(probe.format?.duration);
const startTime = Number(probe.format?.start_time);
const videoDuration = Number(video?.duration);
const videoStartTime = Number(video?.start_time);
const audioDuration = Number(audio?.duration);
const audioStartTime = Number(audio?.start_time);
requireValue(Math.abs(duration - 153) <= 0.001, `Expected 153.000 s, got ${duration}`);
requireValue(Math.abs(startTime) <= 0.001, `Expected zero start time, got ${startTime}`);
requireValue(
  Math.abs(videoDuration - 153) <= 0.001,
  `Expected 153.000 s video stream, got ${videoDuration}`,
);
requireValue(
  Math.abs(videoStartTime) <= 0.001,
  `Expected zero video start time, got ${videoStartTime}`,
);
requireValue(
  Math.abs(audioDuration - 153) <= 0.001,
  `Expected 153.000 s audio stream, got ${audioDuration}`,
);
requireValue(
  Math.abs(audioStartTime) <= 0.001,
  `Expected zero audio start time, got ${audioStartTime}`,
);

const streamHash = (path: string): string =>
  execFileSync(
    'ffmpeg',
    [
      '-v',
      'error',
      '-i',
      path,
      '-map',
      '0:a:0',
      '-c',
      'copy',
      '-f',
      'streamhash',
      '-hash',
      'sha256',
      '-',
    ],
    {encoding: 'utf8'},
  )
    .trim()
    .replace(/^\d+,a,/, '');

const sourceAudioHash = streamHash(soundtrackPath);
const deliveryAudioHash = streamHash(deliveryPath);
if (!platformSafe) {
  requireValue(
    sourceAudioHash === deliveryAudioHash,
    `AAC packet hash mismatch: ${sourceAudioHash} != ${deliveryAudioHash}`,
  );
}

let measuredLoudness: Readonly<{
  integratedLufs: number;
  truePeakDbtp: number;
}> | null = null;

if (platformSafe) {
  const measurement = spawnSync(
    'ffmpeg',
    [
      '-hide_banner',
      '-i',
      deliveryPath,
      '-map',
      '0:a:0',
      '-af',
      'loudnorm=I=-10:TP=-1:LRA=11:print_format=json',
      '-f',
      'null',
      '-',
    ],
    {encoding: 'utf8'},
  );
  requireValue(measurement.status === 0, measurement.stderr);
  const jsonBlocks = measurement.stderr.match(/\{\s*"input_i"[\s\S]*?\}/g);
  const values = JSON.parse(jsonBlocks?.at(-1) ?? '{}') as Readonly<{
    input_i?: string;
    input_tp?: string;
  }>;
  measuredLoudness = {
    integratedLufs: Number(values.input_i),
    truePeakDbtp: Number(values.input_tp),
  };
  requireValue(
    measuredLoudness.integratedLufs >= -11 &&
      measuredLoudness.integratedLufs <= -9,
    `Platform loudness is ${measuredLoudness.integratedLufs} LUFS`,
  );
  requireValue(
    measuredLoudness.truePeakDbtp <= -1,
    `Platform true peak is ${measuredLoudness.truePeakDbtp} dBTP`,
  );
}

const descriptor = openSync(deliveryPath, 'r');
const atomBuffer = Buffer.alloc(1024 * 1024);
const atomBytes = readSync(descriptor, atomBuffer, 0, atomBuffer.length, 0);
closeSync(descriptor);
const atoms = atomBuffer.subarray(0, atomBytes).toString('latin1');
const moovPosition = atoms.indexOf('moov');
const mdatPosition = atoms.indexOf('mdat');
requireValue(moovPosition >= 0, 'moov atom not found in the first MiB');
requireValue(mdatPosition < 0 || moovPosition < mdatPosition, 'moov atom is not before mdat');

execFileSync(
  'ffmpeg',
  [
    '-v',
    'error',
    '-i',
    deliveryPath,
    '-map',
    '0:v:0',
    '-map',
    '0:a:0',
    '-f',
    'null',
    '-',
  ],
  {stdio: 'inherit'},
);

const bytes = readFileSync(deliveryPath);
const checksum = createHash('sha256').update(bytes).digest('hex');
const size = statSync(deliveryPath).size;

process.stdout.write(
  `${JSON.stringify(
    {
      deliveryPath,
      bytes: size,
      mebibytes: Number((size / 1024 / 1024).toFixed(2)),
      sha256: checksum,
      durationSeconds: duration,
      videoDurationSeconds: videoDuration,
      audioDurationSeconds: audioDuration,
      frameCount: Number(video?.nb_frames),
      frameRate: video?.avg_frame_rate,
      dimensions: `${video?.width}x${video?.height}`,
      videoCodec: `${video?.codec_name}/${video?.codec_tag_string}`,
      pixelFormat: video?.pix_fmt,
      colour: {
        range: video?.color_range,
        matrix: video?.color_space,
        transfer: video?.color_transfer,
        primaries: video?.color_primaries,
      },
      audio: {
        codec: audio?.codec_name,
        sampleRate: Number(audio?.sample_rate),
        channels: audio?.channels,
        packetSha256: deliveryAudioHash,
        sourcePacketMatch: platformSafe ? false : true,
        platformSafe,
        measuredLoudness,
      },
      fastStart: true,
      fullDecode: true,
    },
    null,
    2,
  )}\n`,
);
