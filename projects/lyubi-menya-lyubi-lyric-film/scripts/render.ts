import {readFileSync,writeFileSync,mkdirSync,existsSync,createWriteStream,renameSync,statSync} from 'node:fs';
import {spawn} from 'node:child_process';
import {assertProductionGate} from './production-gate.ts';
import {createRasterCompositor,rendererHashes,sha256} from './raster-compositor.ts';
import type {Format} from '../src/schema.ts';

// The gate is evaluated before any canvas capture, encoder or output file is started.
assertProductionGate();
const args=process.argv.slice(2),option=(key:string)=>{const at=args.indexOf(key);return at<0?undefined:args[at+1];};
const format=(option('--format')??args.find(x=>x==='landscape'||x==='portrait')) as Format;
if(!['landscape','portrait'].includes(format))throw Error('Usage: npm run render -- landscape|portrait [--diagnostic --start SECONDS --duration SECONDS]');
const diagnostic=args.includes('--diagnostic'),requestedStart=Number(option('--start')??0),requestedDuration=Number(option('--duration')??0);
if(!diagnostic&&(option('--start')!==undefined||option('--duration')!==undefined))throw Error('Partial output requires the explicit diagnostic switch');
if(diagnostic&&(!Number.isFinite(requestedDuration)||requestedDuration<=0||requestedDuration>12||!Number.isFinite(requestedStart)||requestedStart<0))throw Error('Diagnostic duration must be greater than zero and no more than 12 seconds');
if(!diagnostic){
 const proof=JSON.parse(readFileSync(`evidence/render-proof/${format}/parity.json`,'utf8'));
 if(proof.status!=='PASS'||proof.format!==format||proof.results?.length!==6||proof.inputIdentitySha256!==sha256(readFileSync('evidence/preview-identity.json'))||JSON.stringify(proof.rendererHashes)!==JSON.stringify(rendererHashes()))throw Error('Production blocked: current renderer parity proof required');
 const adoption=JSON.parse(readFileSync('evidence/render-adoption.json','utf8'));
 if(adoption.status!=='PASS'||!['landscape','portrait'].every(f=>adoption.formats?.includes(f))||typeof adoption.method!=='string'||!adoption.method.trim()||adoption.inputIdentitySha256!==sha256(readFileSync('evidence/preview-identity.json'))||JSON.stringify(adoption.rendererHashes)!==JSON.stringify(rendererHashes()))throw Error('Production blocked: current native-browser compositor adoption required');
}
const scene=await createRasterCompositor(format,2),l=scene.layouts[format],first=diagnostic?Math.round(requestedStart*scene.data.fps):0;
const frames=diagnostic?Math.round(requestedDuration*scene.data.fps):scene.data.frames;
if(frames<1||first<0||first+frames>scene.data.frames)throw Error('Requested frames are outside the recording');
const parent=diagnostic?'output/diagnostics':'output';mkdirSync(parent,{recursive:true});mkdirSync('evidence',{recursive:true});
const suffix=diagnostic?`-diagnostic-${first}-${frames}`:'';
const out=`${parent}/Lyubi-Menya-Lyubi-${format}-${l.width}x${l.height}-60fps${suffix}.mp4`,temporary=out.replace(/\.mp4$/,'.partial.mp4');
if(existsSync(out)||existsSync(temporary))throw Error('Output already exists; preserve the previous file before rerendering');
const encoderArgs=['-v','warning','-nostdin','-n','-f','rawvideo','-pix_fmt','rgba','-video_size',`${scene.width}x${scene.height}`,'-framerate',String(scene.data.fps),'-i','pipe:0'];
if(diagnostic)encoderArgs.push('-ss',String(first/scene.data.fps));
encoderArgs.push('-i','public/soundtrack.m4a','-map','0:v:0','-map','1:a:0','-vf',`scale=${l.width}:${l.height}:flags=lanczos:in_range=pc:out_range=tv:out_color_matrix=bt709,setsar=1,format=yuv420p,setparams=range=limited:color_primaries=bt709:color_trc=bt709:colorspace=bt709`,'-c:v','libx264','-preset','medium','-crf','16','-threads','4','-g','120','-pix_fmt','yuv420p','-color_range','tv','-colorspace','bt709','-color_primaries','bt709','-color_trc','bt709','-tag:v','avc1','-c:a','copy','-movflags','+faststart','-metadata','title=Гречка — Люби меня, люби | Russian + English Lyrics');
if(diagnostic)encoderArgs.push('-t',String(frames/scene.data.fps));
encoderArgs.push(temporary);
const hashAtStart=rendererHashes(),inputIdentity=JSON.parse(readFileSync('evidence/preview-identity.json','utf8'));
const tag=`${format}${suffix}`,log=createWriteStream(`evidence/render-${tag}.log`),encoder=spawn('ffmpeg',encoderArgs,{stdio:['pipe','ignore','pipe']});encoder.stderr.pipe(log);
const encoded=new Promise<void>((resolve,reject)=>{encoder.once('error',reject);encoder.once('close',code=>code===0?resolve():reject(Error(`Encoder failed with status ${code}; inspect its render log`)));});void encoded.catch(()=>{});
// Avoid an unhandled stream error if FFmpeg exits before the next awaited write.
encoder.stdin.on('error',()=>{});
const started=Date.now();let written=0;
try{
 for(let local=0;local<frames;local++){
  const global=first+local,canvas=await scene.paint(global),bytes=canvas.data();
  if(bytes.length!==scene.width*scene.height*4)throw Error('Unexpected RGBA buffer length');
  // Native canvas.data() may share a reused allocation. Its write callback must
  // complete before the next paint/data access, even when write() returns true.
  await Promise.race([new Promise<void>((resolve,reject)=>encoder.stdin.write(bytes,error=>error?reject(error):resolve())),encoded.then(()=>{throw Error('Encoder exited before all frames were written');})]);
  written++;
  if(local%300===0)console.log(JSON.stringify({format,diagnostic,written,totalFrames:frames,globalFrame:global,elapsedSeconds:(Date.now()-started)/1000,rssMiB:Math.round(process.memoryUsage().rss/1048576)}));
  if(local%120===0)globalThis.gc?.();
 }
 encoder.stdin.end();await encoded;
 assertProductionGate();
 if(JSON.stringify(hashAtStart)!==JSON.stringify(rendererHashes()))throw Error('Renderer changed during capture');
 const current=JSON.parse(readFileSync('evidence/preview-identity.json','utf8'));
 if(JSON.stringify(current)!==JSON.stringify(inputIdentity))throw Error('Preview identity changed during capture');
 renameSync(temporary,out);
 const receipt={status:'encoded; independent final-file verification pending',diagnostic,path:out,format,width:l.width,height:l.height,fps:scene.data.fps,frames:written,globalFirstFrame:first,globalExclusiveEnd:first+written,captureScale:2,captureWidth:scene.width,captureHeight:scene.height,inputIdentity,inputIdentitySha256:sha256(readFileSync('evidence/preview-identity.json')),rendererHashes:hashAtStart,encoderArguments:encoderArgs.map(x=>x===temporary?out:x),audio:diagnostic?'Short diagnostic audio seek; packet-complete preservation applies only to full production':'Original AAC stream copied with no trim, normalization, resampling or shortest option',compositor:scene.contract,cache:scene.stats(),elapsedSeconds:(Date.now()-started)/1000,outputSha256:sha256(readFileSync(out)),bytes:statSync(out).size};
 writeFileSync(`evidence/render-${tag}.json`,JSON.stringify(receipt,null,2)+'\n');console.log('Encoded '+out);
}catch(error){encoder.stdin.destroy();encoder.kill('SIGTERM');writeFileSync(`evidence/render-${tag}-failed.json`,JSON.stringify({status:'incomplete; not a delivery',written,first,frames,temporary,error:String(error)},null,2)+'\n');throw error;}
