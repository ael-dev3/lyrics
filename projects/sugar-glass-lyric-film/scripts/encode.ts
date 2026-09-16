import {spawn} from 'node:child_process';
import {assertProductionGate} from './sync-gate.ts';
import {resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
export const run=(bin:string,args:string[])=>new Promise<void>((ok,fail)=>{const child=spawn(bin,args,{stdio:'inherit'});child.on('error',fail);child.on('close',code=>code===0?ok():fail(Error(bin+' exited '+code)));});
export async function encode(format:'landscape'|'portrait',list:string,output:string){
 assertProductionGate();const width=format==='landscape'?1920:1080,height=format==='landscape'?1080:1920;
 await run('ffmpeg',['-v','error','-stats_period','15','-stats','-y','-f','concat','-safe','0','-i',list,'-i','public/soundtrack.m4a','-map','0:v:0','-map','1:a:0','-vf',`setpts=N/(60*TB),scale=${width}:${height}:flags=lanczos,setsar=1,format=yuv420p10le`,'-c:v','libx265','-preset','medium','-crf','17','-x265-params','colorprim=bt709:transfer=bt709:colormatrix=bt709:range=limited:pools=4:frame-threads=2','-tag:v','hvc1','-colorspace','bt709','-color_trc','bt709','-color_primaries','bt709','-color_range','tv','-c:a','copy','-movflags','+faststart',output]);
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){const format=process.argv[2];if(format!=='landscape'&&format!=='portrait')throw Error('Format');const list=process.argv[3],output=process.argv[4];if(!list||!output)throw Error('Concat list and output required');await encode(format,list,output);}
