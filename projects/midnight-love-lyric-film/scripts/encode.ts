import {execFileSync} from 'node:child_process';
import {mkdirSync} from 'node:fs';
const portrait=process.argv.includes('--portrait'),kind=portrait?'tiktok':'youtube';
mkdirSync('output',{recursive:true});
const output=`output/Midnight-Love-${portrait?'TikTok-1080x1920':'YouTube-1920x1080'}-60fps.mp4`;
execFileSync('ffmpeg',[
 '-y','-hide_banner','-loglevel','warning','-i',`evidence/${kind}-master-lossless.mkv`,'-i','public/soundtrack.m4a',
 '-map','0:v:0','-map','1:a:0','-vf',`scale=${portrait?'1080:1920':'1920:1080'}:flags=lanczos:out_color_matrix=bt709,format=yuv420p,setsar=1`,
 '-c:v','libx264','-preset','slow','-crf','14','-profile:v','high','-level:v','4.2',
 '-color_primaries','bt709','-color_trc','bt709','-colorspace','bt709','-color_range','tv',
 '-c:a','copy','-movflags','+faststart','-progress',`evidence/${kind}-encode-progress.txt`,`evidence/${kind}-before-color-tags.mp4`,
],{stdio:'inherit'});
execFileSync('ffmpeg',['-y','-v','warning','-i',`evidence/${kind}-before-color-tags.mp4`,'-map','0','-c','copy','-bsf:v','h264_metadata=colour_primaries=1:transfer_characteristics=1:matrix_coefficients=1:video_full_range_flag=0','-color_primaries','bt709','-color_trc','bt709','-colorspace','bt709','-color_range','tv','-movflags','+faststart',output],{stdio:'inherit'});
console.log(output);
