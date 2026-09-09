import {execFileSync} from 'node:child_process';
import {resolve} from 'node:path';
const test=process.argv.includes('--test');
const output=resolve(test?'../light-video-preview.mp4':'../../outputs/Roi-x-Adore-Lyric-Film-Rebuilt-1080p60.mp4');
// Preserve original animation colors and square framing. Downsample 2x graphics once.
const filter="[1:v]scale=1520:1520:flags=lanczos,setsar=1[art];[0:v][art]overlay=2128:304:shortest=1:format=yuv444,FADEscale=1920:1080:flags=lanczos:out_color_matrix=bt709,format=yuv420p10le,setsar=1[v]".replace('FADE',test?'':'fade=t=in:st=0:d=1.2:color=white,fade=t=out:st=376.883333:d=2.5:color=white,');
execFileSync('ffmpeg',['-y','-v','warning','-filter_complex_threads','4','-i',test?'../reference-test-external.mp4':'../reference-4k.mp4',...(test?['-ss','124']:[]),'-i','public/artwork.mp4',...(test?['-ss','124']:[]),'-i','public/soundtrack.m4a','-filter_complex',filter,'-map','[v]','-map','2:a:0','-frames:v',test?'120':'22763','-c:v','libx265','-preset','fast','-crf','16','-x265-params','colorprim=bt709:transfer=bt709:colormatrix=bt709:range=limited','-tag:v','hvc1','-color_primaries','bt709','-color_trc','bt709','-colorspace','bt709','-color_range','tv','-c:a','copy','-shortest','-movflags','+faststart','-progress','../encode-progress.txt',output],{stdio:'inherit'});
console.log(output);
