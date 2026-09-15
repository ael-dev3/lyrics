import {bundle} from '@remotion/bundler';
import {renderMedia,renderStill,selectComposition} from '@remotion/renderer';
import {mkdirSync,writeFileSync,readFileSync,existsSync,createReadStream} from 'node:fs';
import {createHash} from 'node:crypto';
import {resolve} from 'node:path';
import {spawn} from 'node:child_process';
import {assertSyncGate,inputHashes} from './sync-gate.ts';
const arg=(key:string,fallback:string)=>{const i=process.argv.indexOf(key);return i>=0?process.argv[i+1]??fallback:fallback;};
const production=process.argv.includes('--production'),diagnostic=process.argv.includes('--diagnostic');
if(!production&&!diagnostic)throw Error('Choose production or diagnostic mode explicitly');
if(production)assertSyncGate();
const format=arg('--format','landscape');if(!['landscape','portrait'].includes(format))throw Error('Format');
const start=Number(arg('--start','40')),duration=Number(arg('--duration','12'));
if(diagnostic&&(!Number.isFinite(start)||start<0||!Number.isFinite(duration)||duration<=0||duration>20))throw Error('Diagnostic clips are restricted to 20 seconds');
const run=(bin:string,args:string[])=>new Promise<void>((ok,fail)=>{const p=spawn(bin,args,{stdio:'inherit'});p.on('error',fail);p.on('exit',code=>code===0?ok():fail(Error(bin+' exited '+code)));});
const sha=async(path:string)=>{const hash=createHash('sha256');for await(const part of createReadStream(path))hash.update(part);return hash.digest('hex');};
mkdirSync('evidence/previews',{recursive:true});mkdirSync('output',{recursive:true});
const serveUrl=await bundle({entryPoint:resolve('src/index.ts')});
const composition=await selectComposition({serveUrl,id:format==='landscape'?'TvoiGlazaLandscape':'TvoiGlazaPortrait'});
if(process.argv.includes('--still')){
 await renderStill({serveUrl,composition,frame:Math.round(start*60),output:`evidence/previews/${format}-${start}.png`,imageFormat:'png',scale:Number(arg('--scale','1'))});console.log('Diagnostic still saved');
}else{
 const tag=production?`Tvoi-Glaza-${format}`:`SYNC-DRAFT-${format}-${start}`;
 const fingerprint=createHash('sha256').update(JSON.stringify(inputHashes())).update('PNG-2x-ProRes4444-BT709-v1').digest('hex');
 let videoInput:string[];
 if(production){
  const directory=`evidence/previews/${tag}-reference`;mkdirSync(directory,{recursive:true});const chunks=[];
  for(let i=0;i<8;i++){
   const first=Math.floor(i*composition.durationInFrames/8),last=Math.floor((i+1)*composition.durationInFrames/8)-1;
   const filename=`part-${String(i+1).padStart(2,'0')}.mov`,path=`${directory}/${filename}`,record=`${path}.json`;let cached=false;
   if(existsSync(path)&&existsSync(record)){const saved=JSON.parse(readFileSync(record,'utf8'));cached=saved.fingerprint===fingerprint&&saved.first===first&&saved.last===last&&saved.sha256===await sha(path);}
   if(!cached){
    console.log(`Starting ${format} reference ${i+1}/8, global frames ${first}–${last}`);let tick=0;
    await renderMedia({serveUrl,composition,frameRange:[first,last],outputLocation:path,imageFormat:'png',colorSpace:'bt709',codec:'prores',proResProfile:'4444',pixelFormat:'yuva444p10le',hardwareAcceleration:'if-possible',scale:2,muted:true,concurrency:3,offthreadVideoCacheSizeInBytes:512*1024*1024,onProgress:p=>{if(Date.now()-tick>10000){tick=Date.now();console.log(`Chunk ${i+1}: rendered ${p.renderedFrames}, encoded ${p.encodedFrames}`);}}});
    writeFileSync(record,JSON.stringify({fingerprint,first,last,frames:last-first+1,sha256:await sha(path)},null,2));
   }else console.log(`Verified cached reference ${i+1}/8`);
   chunks.push({filename,first,last});
  }
  const list=`${directory}/concat.txt`;writeFileSync(list,chunks.map(c=>`file '${c.filename}'`).join('\n')+'\n');
  writeFileSync(`${directory}/manifest.json`,JSON.stringify({fingerprint,format,scale:2,codec:'PNG-derived ProRes 4444',chunks},null,2));
  videoInput=['-f','concat','-safe','0','-i',list];
 }else{
  const raw=`evidence/previews/${tag}-silent.mp4`;let tick=0;
  await renderMedia({serveUrl,composition,frameRange:[Math.round(start*60),Math.min(composition.durationInFrames-1,Math.round((start+duration)*60)-1)],outputLocation:raw,imageFormat:'png',colorSpace:'bt709',codec:'h264',pixelFormat:'yuv420p',crf:17,x264Preset:'fast',muted:true,concurrency:3,offthreadVideoCacheSizeInBytes:512*1024*1024,onProgress:p=>{if(Date.now()-tick>10000){tick=Date.now();console.log('Frames',p.renderedFrames,p.encodedFrames);}}});
  videoInput=['-i',raw];
 }
 const output=production?`output/${tag}.mp4`:`evidence/previews/${tag}.mp4`;
 const audio=production?['-map','0:v','-map','1:a','-vf',`setpts=N/(60*TB),scale=${composition.width}:${composition.height}:flags=lanczos,setsar=1,format=yuv420p10le`,'-c:v','libx265','-preset','medium','-crf','17','-x265-params','colorprim=bt709:transfer=bt709:colormatrix=bt709:range=limited','-tag:v','hvc1','-colorspace','bt709','-color_trc','bt709','-color_primaries','bt709','-color_range','tv','-c:a','copy']:['-filter_complex',`[1:a]atrim=start=${start}:end=${start+duration},asetpts=PTS-STARTPTS[a]`,'-map','0:v','-map','[a]','-c:v','copy','-c:a','aac','-b:a','192k'];
 console.log('Encoding delivery',output);
 await run('ffmpeg',['-v','error','-stats_period','10','-stats','-y',...videoInput,'-i','public/soundtrack.m4a',...audio,'-movflags','+faststart',output]);
 writeFileSync(`evidence/previews/${tag}.json`,JSON.stringify({status:production?'production':'diagnostic',start:production?0:start,duration:production?composition.durationInFrames/60:duration,format,hashes:inputHashes()},null,2));
 if(production){await run('node',['scripts/verify-production.ts',output]);await run('node',['scripts/audit-decoded-focus.ts',output,format]);}
 console.log('Complete:',output);
}
