import {readFileSync, writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';

const hash = (bytes: Uint8Array) => createHash('sha256').update(bytes).digest('hex');
function record(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw Error('Expected object');
  return value as Record<string, unknown>;
}
function list(value: unknown): unknown[] {
  if (!Array.isArray(value)) throw Error('Expected array');
  return value;
}
function probe(file: string) {
  return record(JSON.parse(execFileSync('ffprobe', ['-v','error','-show_streams','-show_format','-of','json',file], {encoding:'utf8'})));
}
function packets(file: string) {
  const value = record(JSON.parse(execFileSync('ffprobe', ['-v','error','-select_streams','a:0','-show_packets','-show_data_hash','sha256','-show_entries','packet=pts,dts,duration,size,data_hash,side_data_list','-of','json',file], {encoding:'utf8', maxBuffer:32*1024*1024})));
  return list(value.packets).map(record);
}
const source = probe('public/source.mp4');
const streams = list(source.streams).map(record);
const video = streams.find(s => s.codec_type === 'video');
const audio = streams.find(s => s.codec_type === 'audio');
if (!video || !audio || audio.codec_name !== 'aac' || Number(audio.sample_rate) !== 44100 || audio.channels !== 2) throw Error('Unexpected source format');
const originalPackets = packets('public/source.mp4');
const extractedPackets = packets('public/soundtrack.m4a');
if (JSON.stringify(originalPackets) !== JSON.stringify(extractedPackets)) throw Error('Audio packet identity changed during extraction');
const pcm = readFileSync('analysis/audio-delivery.f32');
if (pcm.length % 8 !== 0) throw Error('Invalid stereo float PCM');
const count = pcm.length / 8;
const streamDuration = Number(audio.duration);
const value = {
  song: 'pero-es-locura-live', title: 'Pero es locura', artist: 'Fémina',
  edition: 'Vivo en La Oreja Negra', sourceUrl: 'https://www.youtube.com/watch?v=uvLVcEBIn-4',
  credits: {performance:'Fémina', production:'La Oreja Negra', realization:'FLAN Audiovisual', sourcePublicationDate:'2013-05-30'},
  selectedFormats: ['137','140'],
  video: {path:'public/source.mp4', sha256:hash(readFileSync('public/source.mp4')), width:video.width,height:video.height,frames:Number(video.nb_frames),frameRate:video.r_frame_rate,start:Number(video.start_time),duration:Number(video.duration)},
  audio: {path:'public/soundtrack.m4a',sha256:hash(readFileSync('public/soundtrack.m4a')),codec:audio.codec_name,sampleRate:44100,channels:2,presentedStreamDuration:streamDuration,decodedPaddedSampleCount:count,decodedPaddedDuration:count/44100,pcmSha256:hash(pcm),packetCount:originalPackets.length,packetIdentityPreserved:true,firstPacket:originalPackets[0],lastPacket:originalPackets.at(-1)},
  plannedGraphics: {fps:60,frames:Math.ceil(streamDuration*60),durationAuthority:'original audio stream duration; codec padding is not an editorial extension',sourceVideoCadencePreserved:true,ending:'Hold the final source picture through the remaining original audio; do not truncate audio.'},
  preparationStatus: {sourcePrepared:true,scope:'Source identity only; see status.json for current preview status'},
  limits: ['Technical source preparation only. No lyric or acoustic-boundary review is claimed.','Source footage and recording remain local.'],
};
writeFileSync('source/manifest.json', JSON.stringify(value,null,2)+'\n');
console.log(JSON.stringify({duration:streamDuration,frames:value.plannedGraphics.frames,packets:originalPackets.length,packetIdentityPreserved:true,decodedPaddedSamples:count}));
