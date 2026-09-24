import {createHash} from 'node:crypto';
import {readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {validateTimeline} from '../src/model.ts';
import type {Timeline} from '../src/model.ts';

const file = (path: string): Buffer => readFileSync(fileURLToPath(new URL(path, import.meta.url)));
const json = <T>(path: string): T => JSON.parse(file(path).toString('utf8')) as T;
const hash = (data: Buffer): string => createHash('sha256').update(data).digest('hex');
const media = json<{sha256: string; formatDuration: string; bytes: number; streams: Array<{codec_type: string; width?: number; height?: number; r_frame_rate?: string; sample_rate?: string}>}>('../source/media-manifest.json');
const source = file('../public/source.mp4');
if (source.length !== media.bytes || hash(source) !== media.sha256) throw Error('Locked source file changed');
const video = media.streams.find(stream => stream.codec_type === 'video');
const audio = media.streams.find(stream => stream.codec_type === 'audio');
if (video?.width !== 1920 || video.height !== 1080 || video.r_frame_rate !== '60/1' || audio?.sample_rate !== '44100') {
  throw Error('Unexpected source stream identity');
}
const timeline = json<Timeline>('../src/timeline.json');
validateTimeline(timeline);
if (timeline.sourceSha256 !== media.sha256 || Math.abs(timeline.durationSeconds - Number(media.formatDuration)) > 0.001 || timeline.status !== 'provisional-preview') {
  throw Error('Timeline clock or review status changed unexpectedly');
}
const editorial = file('../source/lyrics-editorial.txt').toString('utf8').trim().split('\n');
const mapped = timeline.lines.map(line => line.es.map(word => word.text).join(' '));
if (editorial.length !== 24 || editorial.some((line, index) => line !== mapped[index])) throw Error('Displayed Spanish differs from editorial lyric inventory');
if (timeline.lines.reduce((total, line) => total + line.es.length, 0) !== 153) throw Error('Word inventory incomplete');
const features = json<{
  sourceSha256: string; framesPerSecond: number; frameCount: number; bandCount: number;
  analysisSampleRate: number; decodedSamples: number; dataSha256: string;
}>('../public/audio-features.json');
const featureBytes = file('../public/audio-features.bin');
if (features.sourceSha256 !== media.sha256 || features.framesPerSecond !== 60 || features.bandCount !== 24 ||
    features.analysisSampleRate !== 22050 || featureBytes.length !== features.frameCount * (features.bandCount + 2) ||
    Math.abs(features.decodedSamples / features.analysisSampleRate - timeline.durationSeconds) > 0.01 ||
    hash(featureBytes) !== features.dataSha256) throw Error('Measured audio features do not match source or metadata');
const stride = features.bandCount + 2;
let clippedFlux = 0;
let clippedPressure = 0;
for (let frame = 0; frame < features.frameCount; frame++) {
  if (featureBytes[frame * stride + 1] === 255) clippedFlux++;
  if ((featureBytes[frame * stride]! / 255 - 0.82) / 0.12 >= 1) clippedPressure++;
}
if (clippedFlux / features.frameCount > 0.05 || clippedPressure / features.frameCount > 0.05) {
  throw Error('Audio-responsive display is saturated over too much of the song');
}
console.log(`Checked locked 4:31 source, 24 bilingual cues, 153 Spanish words and ${features.frameCount} feature frames`);
console.log(`Flux top clipping ${(100 * clippedFlux / features.frameCount).toFixed(2)}%; display-pressure top clipping ${(100 * clippedPressure / features.frameCount).toFixed(2)}%`);
