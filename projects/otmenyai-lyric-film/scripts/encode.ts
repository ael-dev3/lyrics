import {execFileSync} from 'node:child_process';
import {mkdirSync} from 'node:fs';

mkdirSync('../../outputs',{recursive:true});
const intermediate='evidence/master-before-color-tags.mp4';
const output='../../outputs/REDCHINAWAVE-Otmenyai-Lyric-Film-1080p60.mp4';
execFileSync('ffmpeg',[
 '-y','-hide_banner','-loglevel','warning',
 '-i','evidence/master-lossless.mkv','-i','public/soundtrack.m4a',
 '-map','0:v:0','-map','1:a:0',
 '-vf','scale=1920:1080:flags=lanczos:out_color_matrix=bt709,format=yuv420p,setsar=1',
 '-c:v','libx264','-preset','slow','-crf','14','-profile:v','high','-level:v','4.2',
 '-color_primaries','bt709','-color_trc','bt709','-colorspace','bt709','-color_range','tv',
 '-c:a','copy','-movflags','+faststart',intermediate,
],{stdio:'inherit'});
// Set H.264 VUI as well as container tags without another lossy picture encode.
execFileSync('ffmpeg',[
 '-y','-v','warning','-i',intermediate,'-map','0','-c','copy',
 '-bsf:v','h264_metadata=colour_primaries=1:transfer_characteristics=1:matrix_coefficients=1:video_full_range_flag=0',
 '-color_primaries','bt709','-color_trc','bt709','-colorspace','bt709','-color_range','tv',
 '-movflags','+faststart',output,
],{stdio:'inherit'});
console.log(output);
