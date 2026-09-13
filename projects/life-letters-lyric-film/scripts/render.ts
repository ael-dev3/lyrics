import {bundle} from '@remotion/bundler';
import {renderMedia,renderStill,selectComposition} from '@remotion/renderer';
import {resolve} from 'node:path';
import {writeFileSync,mkdirSync} from 'node:fs';
import {spawnSync} from 'node:child_process';
import {FPS,FRAMES} from '../src/config.ts';
const opt=(name:string,otherwise:string)=>{const i=process.argv.indexOf(name);return i<0?otherwise:process.argv[i+1]??otherwise;};
mkdirSync('output',{recursive:true});
mkdirSync('evidence',{recursive:true});
const serveUrl=await bundle({entryPoint:resolve('src/index.tsx')});
const composition=await selectComposition({serveUrl,id:'LifeLettersPhone'});
if(process.argv.includes('--stills')){
 for(const t of opt('--times','3,16,20.7,22.2,29.5,63.8,73.5,175,229.9').split(',').map(Number)){
  await renderStill({serveUrl,composition,frame:Math.round(t*FPS),output:`evidence/landscape-${t}.png`,imageFormat:'png'});console.log('Still',t);
 }
}else{
 const full=process.argv.includes('--full'),start=full?0:Number(opt('--start','60')),duration=full?FRAMES/FPS:Number(opt('--duration','22')),scale=Number(opt('--scale','1'));
 const tag=full?'LIFE-LETTERS-RU-ES-AR-LANDSCAPE':`LANDSCAPE-PREVIEW-${start}-${start+duration}`;
 let last=0;
 await renderMedia({serveUrl,composition,frameRange:[Math.round(start*FPS),Math.round((start+duration)*FPS)-1],scale,codec:'h264',imageFormat:'png',colorSpace:'bt709',crf:17,pixelFormat:'yuv420p',muted:true,x264Preset:'fast',outputLocation:`evidence/${tag}-video.mp4`,concurrency:4,onProgress:p=>{if(Date.now()-last>10000){last=Date.now();console.log(JSON.stringify({rendered:p.renderedFrames,encoded:p.encodedFrames,elapsedSeconds:p.renderEstimatedTime/1000}));}}});
 const args=full?['-map','0:v','-map','1:a','-c','copy']:['-filter_complex',`[1:a]atrim=start=${start}:end=${start+duration},asetpts=PTS-STARTPTS[a]`,'-map','0:v','-map','[a]','-c:v','copy','-c:a','aac','-b:a','256k'];
 const mux=spawnSync('ffmpeg',['-v','error','-y','-i',`evidence/${tag}-video.mp4`,'-i','public/soundtrack.m4a',...args,'-bsf:v','h264_metadata=colour_primaries=1:transfer_characteristics=1:matrix_coefficients=1:video_full_range_flag=0','-movflags','+faststart',`output/${tag}.mp4`],{stdio:'inherit'});
 if(mux.status!==0)throw Error('Audio mux failed');
 writeFileSync(`evidence/${tag}-render.json`,JSON.stringify({start,duration,scale,full,audio:full?'Locked AAC stream copied':'Locked AAC sample-trimmed, reencoded'},null,2));
}
