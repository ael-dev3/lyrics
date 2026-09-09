import {execFileSync} from 'node:child_process';
import {existsSync, mkdirSync, readFileSync, writeFileSync} from 'node:fs';
import {join} from 'node:path';
import {dualSongAlignment} from '../src/lyrics';
import {PROJECT_ROOT} from './project-root';

const mode = process.argv[2] === 'proof' ? 'proof' : 'master';
const limitSeconds = process.argv[3] && Number.isFinite(Number(process.argv[3])) ? process.argv[3] : null;
const fps = mode === 'proof' ? 120 : 60;
const output = join(PROJECT_ROOT, 'output', mode === 'proof' ? 'Roi-x-Slow-Down-Sync-Proof-120fps.mp4' : 'Roi-x-Slow-Down-Lyric-Film-1080p60.mp4');
const source = join(PROJECT_ROOT, 'work', 'source', 'roi-slowdown-source.mp4');
const font = join(PROJECT_ROOT, 'public', 'SpaceGrotesk.ttf').replaceAll('\\', '/').replace(':', '\\:');
const fullFfmpeg = execFileSync('python', ['-c', 'import imageio_ffmpeg; print(imageio_ffmpeg.get_ffmpeg_exe())'], {encoding: 'utf8'}).trim();
const fullFfprobe = join(PROJECT_ROOT, 'node_modules', '@remotion', 'compositor-win32-x64-msvc', 'ffprobe.exe');

if (!existsSync(source)) throw new Error(`locked source not found: ${source}`);
mkdirSync(join(PROJECT_ROOT, 'output'), {recursive: true});
mkdirSync(join(PROJECT_ROOT, 'work'), {recursive: true});

const drawTextEscape = (value: string): string => value
  .replaceAll('\\', '\\\\')
  .replaceAll(':', '\\:')
  .replaceAll(',', '\\,')
  .replaceAll('[', '\\[')
  .replaceAll(']', '\\]')
  .replaceAll("'", '’');

const seconds = (sample: number): string => (sample / dualSongAlignment.sampleRate).toFixed(6);
const enable = (start: number, end: number): string => `between(t\\,${seconds(start)}\\,${seconds(end)})`;
const textFilter = (text: string, x: string, y: number, size: number, color: string, when?: string): string =>
  `drawtext=fontfile='${font}':text='${drawTextEscape(text)}':x=${x}:y=${y}:fontsize=${size}:fontcolor=${color}:shadowcolor=black@0.72:shadowx=2:shadowy=3${when ? `:enable='${when}'` : ''}`;

const lineFilters = dualSongAlignment.songs.flatMap((song) => song.lines.map((line) => {
  const y = song.id === 'song-1' ? 265 : 625;
  const sampleY = song.id === 'song-1' ? 353 : 713;
  const color = song.id === 'song-1' ? 'FFD59E@0.96' : 'A7E8FF@0.96';
  const labelColor = song.id === 'song-1' ? 'FFD59E@0.82' : 'A7E8FF@0.82';
  const progressWidth = song.id === 'song-1' ? 1400 : 1400;
  const interval = enable(line.startSample, line.endSample);
  return [
    textFilter(line.text, '180', y, song.id === 'song-1' ? 46 : 51, color, interval),
    `drawbox=x=180:y=${y + 78}:w=${progressWidth}:h=3:color=${labelColor}:t=fill:enable='${interval}'`,
    textFilter(`${line.id}  ·  ${line.section}  ·  ${seconds(line.startSample)}–${seconds(line.endSample)} s`, '180', sampleY, 12, `${song.id === 'song-1' ? 'FFD59E' : 'A7E8FF'}@0.72`, interval),
  ];
}).flat());

const fixedFilters = [
  `drawbox=x=34:y=34:w=1852:h=1012:color=white@0.2:t=1`,
  `drawbox=x=528:y=114:w=864:h=850:color=white@0.18:t=2`,
  textFilter('ROI × SLOW DOWN', '72', 62, 14, 'FFFFFF@0.76'),
  textFilter('SONG 1 · FRANÇAIS', '180', 132, 13, 'FFFFFF@0.7'),
  textFilter('SONG 2 · ENGLISH', '1580-text_w', 132, 13, 'FFFFFF@0.7'),
  textFilter('SONG 1  ·  ROI', '180', 205, 18, 'FFD59E@0.92'),
  textFilter('SONG 2  ·  SLOW DOWN', '180', 565, 18, 'A7E8FF@0.92'),
  textFilter('DUAL-SONG LYRIC FILM · 1080P60 · SAMPLE LOCKED', '72', 1002, 12, 'FFFFFF@0.58'),
  `drawtext=fontfile='${font}':text='%{pts\\:hms}':x=1740-text_w:y=1000:fontsize=14:fontcolor=FFFFFF@0.7:shadowcolor=black@0.72:shadowx=2:shadowy=3`,
];

if (mode === 'proof') {
  fixedFilters.push(textFilter('SYNC PROOF · DUAL SONG · 120 FPS', '72', 1018, 12, 'FFDC7D@0.95'));
}

const waveRate = fps;
const chain = [
  `[0:v]fps=${fps},scale=1920:1080:flags=lanczos,format=yuv420p[bg]`,
  `[0:a]aformat=channel_layouts=mono,asplit=2[a1][a2]`,
  `[a1]showwaves=s=1560x100:mode=line:draw=full:scale=sqrt:rate=${waveRate}:colors=FFD59E,format=rgba,colorkey=0x000000:0.08:0.0,format=yuva444p[wave1]`,
  `[a2]showwaves=s=1560x100:mode=line:draw=full:scale=sqrt:rate=${waveRate}:colors=A7E8FF,format=rgba,colorkey=0x000000:0.08:0.0,format=yuva444p[wave2]`,
  `[bg][wave1]overlay=x=180:y=415:shortest=1:format=auto[bg1]`,
  `[bg1][wave2]overlay=x=180:y=721:shortest=1:format=auto[bg2]`,
  `[bg2]${fixedFilters.concat(lineFilters).join(',')}[v]`,
].join(';');
const filterScript = join(PROJECT_ROOT, 'work', mode === 'proof' ? 'roi-slowdown-proof-filter.txt' : 'roi-slowdown-master-filter.txt');
writeFileSync(filterScript, chain, 'utf8');

const args = ['-y', '-i', source, '-filter_complex_script', filterScript, '-map', '[v]', '-map', '0:a:0', '-c:v', 'libx264', '-preset', 'slow', '-crf', mode === 'proof' ? '18' : '16', '-pix_fmt', 'yuv420p', '-r', String(fps), '-c:a', 'copy', '-movflags', '+faststart', '-shortest', ...(limitSeconds ? ['-t', limitSeconds] : []), output];
console.log(`composing ${mode} with ${fps} fps from ${dualSongAlignment.songs[0].lines.length} + ${dualSongAlignment.songs[1].lines.length} timed lines`);
execFileSync(fullFfmpeg, args, {stdio: 'inherit'});
const probe = execFileSync(fullFfprobe, ['-v', 'error', '-show_entries', 'format=duration', '-of', 'default=nw=1:nk=1', output], {encoding: 'utf8'}).trim();
console.log(`wrote ${output} (${probe} seconds)`);
