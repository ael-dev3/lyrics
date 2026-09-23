import {mkdirSync,readFileSync,writeFileSync} from 'node:fs';
import {spawn,spawnSync} from 'node:child_process';
import {once} from 'node:events';
import {createScene,timeline} from './production-scene.mjs';
import {assertGate,sha} from './render-gate.mjs';
const arg=(key,fallback)=>{const i=process.argv.indexOf(key);return i<0?fallback:process.argv[i+1];};
const format=arg('--format','landscape'),still=process.argv.includes('--still'),diagnostic=process.argv.includes('--diagnostic'),production=process.argv.includes('--production');
if([still,diagnostic,production].filter(Boolean).length!==1)throw Error('Choose --still, --diagnostic or --production');
assertGate(production);
const scene=createScene(format),{width,height}=scene,fps=60,first=production?0:Math.round(Number(arg('--start','74.2'))*fps),frames=production?Math.ceil(timeline.duration*fps):Number(arg('--frames',still?'1':'120'));
if(!Number.isSafeInteger(first)||first<0||!Number.isSafeInteger(frames)||frames<1||first+frames>Math.ceil(timeline.duration*fps))throw Error('Invalid render range');
if(still&&frames!==1)throw Error('A still proof must contain one frame');
if(diagnostic&&frames>900)throw Error('Diagnostic proof is limited to 15 seconds');
const path=arg('--output',`output/If-The-Sun-Burns-Out-Tonight-${format}-${width}x${height}-60fps.${still?'png':'mp4'}`);
mkdirSync(path.slice(0,path.lastIndexOf('/')),{recursive:true});mkdirSync('evidence/production',{recursive:true});
const start=Date.now(),base='[0:v]fps=60:round=up,tpad=stop_mode=clone:stop_duration=0.1';
const trim=production?'':`,trim=start_frame=${first}:end_frame=${first+frames},setpts=PTS-STARTPTS`;
const picture=format==='landscape'?`${base}${trim},setsar=1[picture];`:`${base}${trim},split=2[bg][fg];[bg]crop=460:818:(iw-460)/2:0,scale=404:719,gblur=sigma=9.333333,crop=360:640,scale=1080:1920:flags=bilinear,lutrgb=r='val*0.68':g='val*0.68':b='val*0.68'[fill];[fg]scale=1080:460:flags=lanczos[front];[fill][front]overlay=0:326:format=auto[picture];`;
const filter=picture+'[picture][1:v]overlay=0:0:shortest=1:format=auto:alpha=straight,setsar=1,format='+(still?'rgb24':'yuv420p')+'[out]';
const encoder=['-hide_banner','-v','warning','-y','-threads','4','-filter_complex_threads','4','-i','public/source.mp4','-f','rawvideo','-pixel_format','rgba','-video_size',`${width}x${height}`,'-framerate',String(fps),'-i','pipe:0','-filter_complex',filter,'-map','[out]'];
if(production)encoder.push('-map','0:a:0','-c:a','copy');else encoder.push('-an');
if(still)encoder.push('-frames:v','1','-update','1');else encoder.push('-c:v','libx264','-preset','medium','-crf','17','-threads','6','-pix_fmt','yuv420p','-color_primaries','bt709','-color_trc','bt709','-colorspace','bt709','-color_range','tv','-video_track_timescale','60000','-frames:v',String(frames),'-movflags','+faststart');
encoder.push(path);
const child=spawn('ffmpeg',encoder,{stdio:['pipe','inherit','inherit']});let failed;child.stdin.on('error',e=>{failed=e;});const closed=once(child,'close');let tick=0;
const statusPath=`evidence/production/${format}-status.json`;
for(let frame=first;frame<first+frames;frame++){
 if(failed)throw failed;
 const canvas=scene.paint(frame/fps),data=canvas.getContext('2d').getImageData(0,0,width,height).data;
 if(!child.stdin.write(Buffer.from(data.buffer,data.byteOffset,data.byteLength)))await once(child.stdin,'drain');
 if(Date.now()-tick>10000){tick=Date.now();const status={format,phase:'compositing',frame:frame-first+1,frames,elapsedSeconds:(Date.now()-start)/1000};writeFileSync(statusPath,JSON.stringify(status,null,2)+'\n');console.log(JSON.stringify(status));}
}
child.stdin.end();const[code]=await closed;if(code!==0)throw Error('Encoder failed '+code);
const receipt={status:'encoded; independent verification pending',format,width,height,fps,startFrame:first,frames,path,sha256:sha(path),seconds:(Date.now()-start)/1000,sourceAspectRetained:format==='landscape',sourceAudioCopied:production,sourceClock:'n/60',pipeline:'Shared deterministic canvas effects and frozen browser word geometry over FFmpeg-decoded complete source video; AAC stream copy.',sourceFramePolicy:'fps=60:round=up, hold final source frame through audio tail'};
writeFileSync(path+'.json',JSON.stringify(receipt,null,2)+'\n');writeFileSync(statusPath,JSON.stringify(receipt,null,2)+'\n');console.log(JSON.stringify(receipt));
