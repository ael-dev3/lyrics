import {createHash} from 'node:crypto';
import {spawn, execFileSync} from 'node:child_process';
import {createReadStream, mkdirSync, statSync, writeFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';

// Records the exact identity of the locally restored official video. The media
// itself stays out of Git; every later stage (features, timing, preview, render
// gate and final verification) compares against these values.
const root = fileURLToPath(new URL('../', import.meta.url));
const source = `${root}public/source.mp4`;
export const YOUTUBE_ID = 'BnnbP7pCIvQ';

async function hashStream(command: string, args: string[]): Promise<{sha256: string; bytes: number}> {
  const child = spawn(command, args, {stdio: ['ignore', 'pipe', 'pipe']});
  const hash = createHash('sha256');
  let bytes = 0, stderr = '';
  child.stdout.on('data', (chunk: Buffer) => {hash.update(chunk); bytes += chunk.byteLength;});
  child.stderr.on('data', chunk => {stderr += String(chunk);});
  const code = await new Promise<number | null>((done, reject) => {child.once('error', reject); child.once('close', done);});
  if (code !== 0) throw Error(`${command} failed: ${stderr.slice(-2000)}`);
  return {sha256: hash.digest('hex'), bytes};
}
async function fileSha(path: string): Promise<string> {
  const hash = createHash('sha256');
  for await (const chunk of createReadStream(path)) hash.update(chunk as Buffer);
  return hash.digest('hex');
}
type Stream = Record<string, unknown> & {codec_type?: string};
const probe = JSON.parse(execFileSync('ffprobe', ['-v', 'error', '-count_packets', '-show_entries',
  'stream=index,codec_name,profile,codec_type,width,height,sample_aspect_ratio,pix_fmt,color_range,color_space,color_transfer,color_primaries,r_frame_rate,avg_frame_rate,time_base,start_pts,start_time,duration_ts,duration,nb_frames,nb_read_packets,sample_rate,channels,channel_layout,bit_rate:stream_side_data=:format=duration,size,bit_rate,format_name',
  '-of', 'json', source], {encoding: 'utf8'})) as {streams: Stream[]; format: Record<string, unknown>};
const video = probe.streams.find(s => s.codec_type === 'video'), audio = probe.streams.find(s => s.codec_type === 'audio');
if (!video || !audio || probe.streams.length !== 2) throw Error('Expected exactly one video and one audio stream');
const frames = Number(video.nb_read_packets), fps = String(video.r_frame_rate);
if (fps !== '24000/1001' || video.width !== 1920 || video.height !== 1080) throw Error('Unexpected source picture');
const lastFramePts = (frames - 1) * 1001 / 24000;
const audioPackets = await hashStream('ffmpeg', ['-v', 'error', '-nostdin', '-i', source, '-map', '0:a:0', '-c', 'copy', '-f', 'framemd5', 'pipe:1']);
const videoPackets = await hashStream('ffmpeg', ['-v', 'error', '-nostdin', '-i', source, '-map', '0:v:0', '-c', 'copy', '-f', 'framemd5', 'pipe:1']);
const pcm = await hashStream('ffmpeg', ['-v', 'error', '-nostdin', '-i', source, '-map', '0:a:0', '-f', 's16le', '-acodec', 'pcm_s16le', 'pipe:1']);
const ffmpegVersion = execFileSync('ffmpeg', ['-version'], {encoding: 'utf8'}).split('\n')[0] ?? '';
const identity = {
  schema: 'lyric-film/source-identity/v1',
  youtubeId: YOUTUBE_ID,
  sourceUrl: `https://www.youtube.com/watch?v=${YOUTUBE_ID}`,
  selectedStreams: '137+140 (H.264 1080p video, AAC-LC 44.1 kHz audio), merged without retiming by yt-dlp',
  file: 'public/source.mp4',
  bytes: statSync(source).size,
  sha256: await fileSha(source),
  container: probe.format,
  video: {...video, frames, lastFramePtsSeconds: lastFramePts, pictureEndSeconds: frames * 1001 / 24000},
  audio: {...audio, packetFramemd5Sha256: audioPackets.sha256, decodedPcmS16leSha256: pcm.sha256, decodedPcmBytes: pcm.bytes, decodedSamplesPerChannel: pcm.bytes / 4},
  videoPacketFramemd5Sha256: videoPackets.sha256,
  audioOutlastsPictureSeconds: Number(audio.duration) - frames * 1001 / 24000,
  tool: ffmpegVersion,
  notes: [
    'The source soundtrack is the only clock. Picture frame n is presented at n × 1001/24000 s; audio starts at 0.',
    'Decoded PCM identity depends on the recorded FFmpeg AAC decoder; packet framemd5 identity is decoder-independent.',
  ],
};
mkdirSync(`${root}evidence`, {recursive: true});
writeFileSync(`${root}evidence/source-identity.json`, JSON.stringify(identity, null, 2) + '\n');
console.log(JSON.stringify({sha256: identity.sha256, frames, audioSeconds: audio.duration, tail: identity.audioOutlastsPictureSeconds}));
