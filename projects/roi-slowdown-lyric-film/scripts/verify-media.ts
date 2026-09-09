import {execFileSync} from 'node:child_process';
import {existsSync, readFileSync} from 'node:fs';
import {join} from 'node:path';
import {PROJECT_ROOT} from './project-root.js';

const ffprobe = join(PROJECT_ROOT, 'node_modules', '@remotion', 'compositor-win32-x64-msvc', 'ffprobe.exe');
const mediaPath = process.argv[2] ?? join(PROJECT_ROOT, 'output', 'Roi-x-Slow-Down-Lyric-Film-1080p60.mp4');
const requestedRate = process.argv[3];
const expectedRate = requestedRate ? (requestedRate.includes('/') ? requestedRate : `${requestedRate}/1`) : (mediaPath.toLowerCase().includes('120fps') ? '120/1' : '60/1');
const ffmpeg = execFileSync('python', ['-c', 'import imageio_ffmpeg; print(imageio_ffmpeg.get_ffmpeg_exe())'], {encoding: 'utf8'}).trim();
if (!existsSync(mediaPath)) throw new Error(`media not found: ${mediaPath}`);

const probeRaw = execFileSync(ffprobe, ['-v', 'error', '-show_streams', '-show_format', '-of', 'json', mediaPath], {encoding: 'utf8'});
const probe = JSON.parse(probeRaw) as {streams?: Array<{codec_type?: string; width?: number; height?: number; r_frame_rate?: string; duration?: string; nb_frames?: string}>; format?: {duration?: string}};
const video = probe.streams?.find((stream) => stream.codec_type === 'video');
const audio = probe.streams?.find((stream) => stream.codec_type === 'audio');
if (!video || video.width !== 1920 || video.height !== 1080 || video.r_frame_rate !== expectedRate) throw new Error(`unexpected video geometry: expected 1920x1080 at ${expectedRate}, got ${JSON.stringify(video)}`);
if (!audio) throw new Error('delivery has no audio stream');
execFileSync(ffmpeg, ['-v', 'error', '-i', mediaPath, '-map', '0:v:0', '-f', 'null', '-'], {stdio: 'pipe'});
execFileSync(ffmpeg, ['-v', 'error', '-i', mediaPath, '-map', '0:a:0', '-f', 'null', '-'], {stdio: 'pipe'});
console.log(JSON.stringify({path: mediaPath, bytes: readFileSync(mediaPath).byteLength, expectedRate, formatDuration: probe.format?.duration, video, audio, strictDecode: true}, null, 2));
