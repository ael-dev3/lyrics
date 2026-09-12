import {readFileSync, writeFileSync, statSync, readdirSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import {hashFile} from './record-render-inputs.ts';
import {SR, SAMPLE_COUNT, FPS, FRAMES, TRACK} from '../src/config.ts';

// Read only a fixed metadata allowlist. Raw downloader metadata contains expiring
// transport URLs and belongs outside Git and production archives.
const original = JSON.parse(readFileSync('source/original.info.json', 'utf8'));
const probe = JSON.parse(execFileSync('ffprobe', ['-v','error','-show_streams','-show_format','-of','json','source/original.mkv'], {encoding:'utf8'}));
const files = [
 'source/original.mkv','source/soundtrack.opus','source/original.en-orig.json3',
 'public/source-video.webm','public/source-frame.png','public/soundtrack.m4a',
 'public/science.json','public/motion.json',
 ...readdirSync('public').filter(p=>/\.(ttf|txt)$/.test(p)).map(p=>'public/'+p),
 'analysis/stems/htdemucs/soundtrack/vocals.wav','analysis/stems/htdemucs/soundtrack/no_vocals.wav',
 'analysis/audio16.wav','analysis/vocals16.wav','analysis/bands-dbfs.f32',
];
const entries=[];
for(const path of files) entries.push({path,bytes:statSync(path).size,sha256:await hashFile(path)});
writeFileSync('source.json',JSON.stringify({
 title:original.title,artist:original.channel,sourceUrl:original.webpage_url,sourceId:original.id,
 sourceUploadDate:'2025-11-14',sourceChannelUrl:original.channel_url,productionRelease:TRACK.release,
 streams:probe.streams.map((s:Record<string,unknown>)=>Object.fromEntries(['codec_type','codec_name','width','height','pix_fmt','r_frame_rate','avg_frame_rate','sample_rate','channels','color_space','color_primaries','color_transfer','color_range','start_time'].filter(k=>s[k]!==undefined).map(k=>[k,s[k]]))),
 decodedAudio:{sampleRate:SR,stereoSamples:SAMPLE_COUNT,durationSeconds:SAMPLE_COUNT/SR},
 delivery:{fps:FPS,frames:FRAMES,videoDurationSeconds:FRAMES/FPS,sourceCadence:'Preserved nominal 25 fps; new graphics rendered at 60 fps; no optical-flow interpolation.',audio:'Original full mix, fixed -3.8 dB, one AAC 320k stereo 48 kHz encode; AAC packet copy in both films.',measured:{integratedLUFS:-11.20,truePeakDBTP:-1.94,loudnessRangeLU:2.10}},
 lyricAuthority:'User-supplied English text: 395 words in 44 original lines; 70 display cues and 323 word/short-group focuses.',
 originalCredits:'CREDITS-SOURCE.md',software:'SOFTWARE.md',
 rights:'Original song, lyrics, recording, performance, footage and source-derived cover imagery remain third-party works. The scoped repository CC BY 4.0 grant does not relicense them.',
 privacy:'Sanitized source record. Raw downloader metadata, temporary media URLs, machine paths, caches, model weights and private logs are not published.',
 files:entries,
},null,2));
console.log({manifestFiles:entries.length});
