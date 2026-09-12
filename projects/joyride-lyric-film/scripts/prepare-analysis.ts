import {execFileSync} from 'node:child_process';
import {mkdirSync} from 'node:fs';
import {SAMPLE_COUNT, SR} from '../src/config.ts';
mkdirSync('analysis',{recursive:true});
// Decode retained media only. Never regenerate or replace the locked AAC here.
for(const [source,target,channels]of [
 ['source/soundtrack.opus','analysis/audio.f32',2],
 ['source/soundtrack.opus','analysis/audio-mono.f32',1],
 ['public/soundtrack.m4a','analysis/audio-delivery.f32',2],
 ['analysis/stems/htdemucs/soundtrack/vocals.wav','analysis/vocals.f32',1],
] as const){
 execFileSync('ffmpeg',['-y','-v','error','-i',source,'-ar',String(SR),'-ac',String(channels),'-af',`aresample=${SR},atrim=end_sample=${SAMPLE_COUNT}`,'-f','f32le',target],{stdio:'inherit'});
}
console.log('Decoded source/delivery PCM for optional analysis checks; locked media unchanged.');
