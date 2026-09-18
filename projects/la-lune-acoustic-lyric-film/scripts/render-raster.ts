import {mkdirSync,writeFileSync,readFileSync,existsSync,createReadStream} from 'node:fs';
import {createHash} from 'node:crypto';
import {spawn} from 'node:child_process';
import {once} from 'node:events';
import {compositor} from './raster-compose.ts';
import {verifyCache} from './raster-contract.ts';
import {assertProductionGate,inputHashes} from './production-contract.ts';
import {parseData} from '../src/schema.ts';
const arg=(key:string,fallback:string)=>{const i=process.argv.indexOf(key);return i>=0?process.argv[i+1]??fallback:fallback;};
const production=process.argv.includes('--production'),diagnostic=process.argv.includes('--diagnostic');
if(production===diagnostic)throw Error('Choose production or diagnostic');
assertProductionGate();
const format=arg('--format','landscape');if(format!=='landscape'&&format!=='portrait')throw Error('Unknown format');
const cache=verifyCache(format),data=parseData(JSON.parse(readFileSync('src/cues.json','utf8'))),width=format==='landscape'?1920:1080,height=format==='landscape'?1080:1920;
if(production&&JSON.parse(readFileSync('evidence/raster-adoption.json','utf8')).status!=='PASS')throw Error('Raster equivalence and encoded diagnostics required');
const sha=async(path:string)=>{const hash=createHash('sha256');for await(const part of createReadStream(path))hash.update(part);return hash.digest('hex');};
const write=(path:string,value:unknown)=>writeFileSync(path,JSON.stringify(value,null,2)+'\n');
const run=(args:string[])=>new Promise<void>((ok,fail)=>{const child=spawn('ffmpeg',args,{stdio:'inherit'});child.on('error',fail);child.on('close',code=>code===0?ok():fail(Error('ffmpeg exited '+code)));});
const directory=`output/${format}-raster-segments`;mkdirSync(directory,{recursive:true});mkdirSync('evidence/production',{recursive:true});
const began=Date.now(),fingerprint=createHash('sha256').update(JSON.stringify(inputHashes())).update(JSON.stringify(cache)).update('lossless-Chromium-layers-RGBA-2x-Lanczos-HEVC17-v1').digest('hex');
const status=(values:Record<string,unknown>)=>write(`evidence/production/${format}-raster-status.json`,{format,updatedAt:new Date().toISOString(),elapsedSeconds:(Date.now()-began)/1000,...values});
const c=await compositor(format),chunks=[];
const start=Number(arg('--start','46.3')),count=Number(arg('--frames','120'));
if(diagnostic&&(!Number.isFinite(start)||start<0||!Number.isSafeInteger(count)||count<1||count>1200))throw Error('Invalid diagnostic range');
const parts=production?16:1;
for(let i=0;i<parts;i++){
 assertProductionGate();
 const first=production?Math.floor(i*data.frames/parts):Math.round(start*60),last=production?Math.floor((i+1)*data.frames/parts)-1:Math.min(data.frames-1,first+count-1),stem=production?`part-${String(i+1).padStart(2,'0')}`:'diagnostic',encoded=`${directory}/${stem}.mp4`,receipt=encoded+'.json';
 let cached=false;if(existsSync(encoded)&&existsSync(receipt)){const r=JSON.parse(readFileSync(receipt,'utf8'));cached=r.fingerprint===fingerprint&&r.first===first&&r.last===last&&r.sha256===await sha(encoded);}
 if(!cached){
  const child=spawn('ffmpeg',['-v','error','-y','-f','rawvideo','-pixel_format','rgba','-video_size',`${width*2}x${height*2}`,'-framerate','60','-i','pipe:0','-an','-vf',`scale=${width}:${height}:flags=lanczos,setsar=1,format=yuv420p10le`,'-c:v','libx265','-preset','medium','-crf','17','-x265-params','colorprim=bt709:transfer=bt709:colormatrix=bt709:range=limited:pools=4:frame-threads=2:log-level=error','-tag:v','hvc1','-colorspace','bt709','-color_trc','bt709','-color_primaries','bt709','-color_range','tv','-video_track_timescale','60000',encoded],{stdio:['pipe','inherit','inherit']});
  let writeError:Error|undefined;child.stdin.on('error',e=>{writeError=e;});const closed=once(child,'close');
  const rawHash=createHash('sha256');let tick=0;
  for(let frame=first;frame<=last;frame++){
   if(writeError)throw writeError;
   const canvas=await c.paint(frame),rgba=canvas.getContext('2d').getImageData(0,0,canvas.width,canvas.height).data,bytes=Buffer.from(rgba.buffer,rgba.byteOffset,rgba.byteLength);rawHash.update(bytes);
   if(!child.stdin.write(bytes))await once(child.stdin,'drain');
   if(Date.now()-tick>10000){tick=Date.now();status({phase:'Compositing and encoding',segment:i+1,segments:parts,frames:frame+1,totalFrames:data.frames});console.log(`${format}: ${frame+1}/${data.frames}, segment ${i+1}/${parts}`);}
  }
  child.stdin.end();const [code]=await closed;if(code!==0)throw Error('Encoder failed '+code);
  await run(['-v','error','-xerror','-err_detect','explode','-threads','4','-i',encoded,'-f','null','-']);
  write(receipt,{fingerprint,first,last,frames:last-first+1,rawRgbaSha256:rawHash.digest('hex'),referencePolicy:'2× lossless Chromium layer cache plus deterministic composition; full raw frames reproducible from locked inputs',sha256:await sha(encoded)});
 }else console.log('Verified cache:',encoded);
 chunks.push({file:stem+'.mp4',first,last});
}
if(production){
 assertProductionGate();const list=directory+'/concat.txt';writeFileSync(list,chunks.map(c=>`file '${c.file}'\nduration ${((Math.round((c.last+1)*1e6/60)-Math.round(c.first*1e6/60))/1e6).toFixed(6)}`).join('\n')+'\n');
 const output=`output/La-Lune-${format}-${width}x${height}-60fps.mp4`;
 await run(['-v','error','-y','-f','concat','-safe','0','-i',list,'-i','public/soundtrack.m4a','-map','0:v:0','-map','1:a:0','-c','copy','-tag:v','hvc1','-video_track_timescale','60000','-movflags','+faststart',output]);
 write(`evidence/production/${format}-capture.json`,{fingerprint,format,pipeline:'2× lossless Chromium layers → RGBA → single Lanczos downsample → HEVC Main10 CRF17',scale:2,frames:data.frames,chunks,cache,output,sha256:await sha(output),elapsedSeconds:(Date.now()-began)/1000});status({phase:'Rendered; verification pending',frames:data.frames,totalFrames:data.frames,output});console.log(output);
}else {status({phase:'Diagnostic complete',mode:'diagnostic',frames:chunks.reduce((n,c)=>n+c.last-c.first+1,0)});console.log('Diagnostic complete:',format);}
