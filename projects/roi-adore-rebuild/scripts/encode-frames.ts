import {execFileSync,spawn} from 'node:child_process';
import {readFileSync,writeFileSync,existsSync} from 'node:fs';
import {resolve} from 'node:path';
const test=process.argv.includes('--test'),stream=process.argv.includes('--stream');
const meta=(stream&&!test?{start:0,end:22762,frameCount:22763,pattern:resolve('../frames-v3/element-%05d.png')}:JSON.parse(readFileSync(test?'../frames-v3-preview.json':'../frames-v3-complete.json','utf8'))) as {start:number;end:number;pattern:string;frameCount:number};
const w=2160,h=2160,mask=Buffer.alloc(w*h);for(let y=0;y<h;y++)for(let x=0;x<w;x++){const q=Math.min(1,x/400);mask[y*w+x]=Math.round(255*q*q*(3-2*q));}writeFileSync('public/hero-alpha.pgm',Buffer.concat([Buffer.from(`P5\n${w} ${h}\n255\n`),mask]));
const delay=test?'':'tpad=start_duration=0.033333333:start_mode=clone,';
const filter=`[1:v]${delay}split=2[bg][hero];[bg]scale=1920:1920:flags=lanczos,crop=1920:1080:0:300,gblur=sigma=10,scale=3840:2160:flags=lanczos,setsar=1[b];[hero]scale=2160:2160:flags=lanczos,setsar=1,format=rgba[h];[3:v]format=gray[mask];[h][mask]alphamerge[soft];[b][soft]overlay=1680:0:format=auto[art];[art][0:v]overlay=0:0:shortest=1:format=auto,${test?'':'fade=t=in:st=0:d=1.2:color=white,fade=t=out:st=376.883333:d=2.5:color=white,'}scale=1920:1080:flags=lanczos:out_color_matrix=bt709,format=yuv420p10le,setsar=1[v]`;
const output=resolve(test?'../../outputs/Roi-x-Adore-Immersive-Review.mp4':'../../outputs/Roi-x-Adore-Lyric-Film-Rebuilt-1080p60.mp4');
const args=['-y','-v','warning','-filter_complex_threads','4',...(stream?['-f','image2pipe','-framerate','60','-vcodec','png','-i','pipe:0']:['-framerate','60','-start_number',String(meta.start),'-i',meta.pattern]),...(test?['-ss',String((meta.start-2)/60)]:[]),'-i','public/artwork.mp4',...(test?['-ss',String(meta.start/60)]:[]),'-i','public/soundtrack.m4a','-i','public/hero-alpha.pgm','-filter_complex',filter,'-map','[v]','-map','2:a:0','-frames:v',String(meta.frameCount),...(test?['-t',String(meta.frameCount/60)]:[]),'-c:v','libx265','-preset','fast','-crf','16','-x265-params','colorprim=bt709:transfer=bt709:colormatrix=bt709:range=limited','-tag:v','hvc1','-color_primaries','bt709','-color_trc','bt709','-colorspace','bt709','-color_range','tv','-c:a','copy','-shortest','-movflags','+faststart','-progress','../encode-v3-progress.txt',output];
if(!stream)execFileSync('ffmpeg',args,{stdio:'inherit'});
else {
 const child=spawn('ffmpeg',args,{stdio:['pipe','inherit','inherit']});let failed:Error|undefined;
 const done=new Promise<void>((resolve,reject)=>{child.on('error',reject);child.on('close',code=>code===0?resolve():reject(new Error('Encoder exited '+code)));});done.catch(e=>{failed=e as Error;});child.stdin.on('error',e=>{failed=e;});
 for(let f=meta.start;f<=meta.end;f++){const path=meta.pattern.replace(/%0(\d+)d/,(_,n:string)=>String(f).padStart(Number(n),'0'));while(!existsSync(path)||(!test&&!existsSync(resolve('../frames-v3/ready/'+f)))){if(failed)throw failed;if(existsSync('../frames-v3-failed.txt'))throw Error(readFileSync('../frames-v3-failed.txt','utf8'));await new Promise(r=>setTimeout(r,200));}if(failed)throw failed;const bytes=readFileSync(path);if(!child.stdin.write(bytes))await Promise.race([new Promise<void>(r=>child.stdin.once('drain',r)),done.then(()=>{throw Error('Encoder ended before all frames');})]);}
 child.stdin.end();await done;
}
console.log(output);
