import {spawn,execFileSync,type ChildProcess,type ChildProcessWithoutNullStreams} from 'node:child_process';
import {createHash} from 'node:crypto';
import {createReadStream,readFileSync,writeFileSync,mkdirSync,existsSync,renameSync,statSync} from 'node:fs';
import {resolve,dirname,basename} from 'node:path';
import {fileURLToPath} from 'node:url';
import {createCanvas,GlobalFonts,ImageData,loadImage} from '@napi-rs/canvas';
import {checkCurrentProductionAuthorization} from './production-authorization.ts';
import {paintScene,setSceneForProof,type MaterialPlan} from '../src/scene.ts';
import type {Format,Timeline,FeatureData} from '../src/model.ts';

export const root=fileURLToPath(new URL('../',import.meta.url));
export const FPS=60;
export const read=<T>(p:string):T=>JSON.parse(readFileSync(resolve(root,p),'utf8'));
export interface Recording{sourceSha256:string;picture:{width:number;height:number;frames:number;frameRate:string;startSeconds:number;durationSeconds:number};audio:{sampleRate:number;channels:number;decodedSamples:number;decodedDurationSeconds:number;sourceClockOffsetSeconds:number}}
export function renderClock(recording:Recording){
 const p=recording.picture,a=recording.audio;
 if(p.width!==1080||p.height!==1080||p.frameRate!=='25/1'||p.startSeconds!==0||a.sampleRate!==44100||a.channels!==2||a.sourceClockOffsetSeconds!==0)throw Error('Unexpected canonical source clock.');
 const sourceEnd=p.frames/25,audioEnd=a.decodedSamples/44100;
 if(Math.abs(sourceEnd-p.durationSeconds)>1e-8||Math.abs(audioEnd-a.decodedDurationSeconds)>1e-8||audioEnd<sourceEnd||audioEnd-sourceEnd>.1)throw Error('Unexpected source extent.');
 return {sourceFrames:p.frames,outputFrames:Math.ceil(a.decodedSamples*FPS/44100),sourceEnd,audioEnd};
}
export function sourceFrameForOutput(n:number,sourceFrames:number):number{return Math.min(sourceFrames-1,Math.floor(n*5/12))}
export function dimensions(format:Format){return format==='landscape'?{width:1920,height:1080}:{width:1080,height:1920}}
export async function fileHash(p:string){const hash=createHash('sha256');for await(const bytes of createReadStream(p))hash.update(bytes as Buffer);return hash.digest('hex')}
export async function createPainter(format:Format){
 const t=read<Timeline>('public/timeline.json'),f=read<FeatureData>('public/audio-features.json'),plan=read<MaterialPlan>('public/material-anchors.json');
 if(!GlobalFonts.registerFromPath(resolve(root,'public/fonts/Alegreya.ttf'),'Bridal'))throw Error('Approved font unavailable.');
 const ref=await loadImage(resolve(root,'public/material-reference.png'));
 setSceneForProof(t,f,plan,(w,h)=>{const c=createCanvas(w,h);return {canvas:c as unknown as CanvasImageSource,context:c.getContext('2d') as unknown as CanvasRenderingContext2D}},ref as unknown as CanvasImageSource);
 const size=dimensions(format),canvas=createCanvas(size.width,size.height),context=canvas.getContext('2d') as unknown as CanvasRenderingContext2D;
 const source=createCanvas(1080,1080),sc=source.getContext('2d');
 return {canvas,context,timeline:t,paint(bytes:Buffer,n:number){
  sc.putImageData(new ImageData(new Uint8ClampedArray(bytes.buffer,bytes.byteOffset,bytes.byteLength),1080,1080),0,0);
  paintScene(context,n/FPS,format,source as unknown as CanvasImageSource);
  return canvas.data();
 }};
}
export async function* rawFrames(child:ChildProcessWithoutNullStreams,frameBytes:number):AsyncGenerator<Buffer>{
 let frame=Buffer.allocUnsafe(frameBytes),used=0;
 for await(const part of child.stdout){const bytes=part as Buffer;for(let offset=0;offset<bytes.length;){const count=Math.min(frameBytes-used,bytes.length-offset);bytes.copy(frame,used,offset,offset+count);offset+=count;used+=count;if(used===frameBytes){yield frame;frame=Buffer.allocUnsafe(frameBytes);used=0}}}
 if(used)throw Error('Truncated decoded frame.');
}
export function watchChild(child:ChildProcess,label:string):Promise<void>{
 let stderr='';child.stderr?.on('data',b=>{stderr=(stderr+String(b)).slice(-5000)});
 const promise=new Promise<void>((accept,reject)=>{child.once('error',reject);child.once('close',code=>code===0?accept():reject(Error(`${label} exited ${code}: ${stderr.replaceAll(root,'<project>')}`)))});void promise.catch(()=>{});return promise;
}
export function sourceDecoder(){const child=spawn('ffmpeg',['-v','error','-nostdin','-threads','2','-filter_threads','1','-i',resolve(root,'public/source.mp4'),'-map','0:v:0','-fps_mode','passthrough','-f','rawvideo','-pix_fmt','rgba','pipe:1'],{stdio:['pipe','pipe','pipe']});child.stdin.end();return child}

async function main(){
 const approved=checkCurrentProductionAuthorization();
 const at=process.argv.indexOf('--format'),format=process.argv[at+1];
 if(at<0||(format!=='landscape'&&format!=='portrait'))throw Error('Use --format landscape|portrait.');
 const recording=read<Recording>('source/recording.json'),clock=renderClock(recording),size=dimensions(format);
 if(process.argv.includes('--plan')){console.log(JSON.stringify({...clock,...size,scope:approved.listeningGateComplete?'complete review':'current owner-approved preview'}));return}
 if(!process.argv.includes('--production'))throw Error('Explicit --production is required.');
 const rendererSha256=await fileHash(fileURLToPath(import.meta.url)),frozen=JSON.stringify(approved);
 const output=resolve(root,`renders/Trup-Nevesty-Green-Apelsin-${format==='landscape'?'YouTube':'TikTok'}-${size.width}x${size.height}-60fps.mp4`),partial=output.replace('.mp4','.partial.mp4');
 if(existsSync(output)||existsSync(partial))throw Error('Output exists; refusing overwrite.');
 const probe=JSON.parse(execFileSync('ffprobe',['-v','error','-select_streams','v:0','-show_entries','stream=width,height,nb_frames,start_time,r_frame_rate','-of','json',resolve(root,'public/source.mp4')],{encoding:'utf8'})).streams[0];
 if(probe.width!==1080||probe.height!==1080||Number(probe.nb_frames)!==clock.sourceFrames||Number(probe.start_time)!==0||probe.r_frame_rate!=='25/1')throw Error('Source video clock changed.');
 const painter=await createPainter(format);mkdirSync(dirname(output),{recursive:true});const begun=Date.now();
 const encoder=spawn('ffmpeg',['-hide_banner','-v','warning','-nostdin','-n','-f','rawvideo','-pix_fmt','rgba','-s',`${size.width}x${size.height}`,'-framerate','60','-i','pipe:0','-i',resolve(root,'public/source.mp4'),'-map','0:v:0','-map','1:a:0','-vf','scale=in_range=full:out_range=tv:out_color_matrix=bt709,setsar=1,format=yuv420p,setparams=range=limited:color_primaries=bt709:color_trc=bt709:colorspace=bt709','-c:v','libx264','-preset','medium','-crf','17','-threads','6','-g','120','-color_range','tv','-color_primaries','bt709','-color_trc','bt709','-colorspace','bt709','-video_track_timescale','60000','-frames:v',String(clock.outputFrames),'-c:a','copy','-movflags','+faststart','-metadata','title=Green Apelsin — Труп невесты | Russian & English Lyric Film',partial],{stdio:['pipe','pipe','pipe']});
 encoder.stdout.resume();encoder.stdin.on('error',()=>{});const encoded=watchChild(encoder,'Encoder'),decoder=sourceDecoder(),decoded=watchChild(decoder,'Source decoder');let input=0,n=0,last=Date.now();
 try{
  for await(const bytes of rawFrames(decoder,1080*1080*4)){
   if(input>=clock.sourceFrames)throw Error('Too many source pictures.');
   while(n<clock.outputFrames&&sourceFrameForOutput(n,clock.sourceFrames)===input){const frame=painter.paint(bytes,n);await new Promise<void>((done,reject)=>encoder.stdin.write(frame,error=>error?reject(error):done()));n++}
   input++;
   if(Date.now()-last>10000){last=Date.now();console.log(JSON.stringify({format,frames:n,total:clock.outputFrames,elapsedSeconds:Math.round((last-begun)/1000)}))}
  }
  await decoded;if(input!==clock.sourceFrames||n!==clock.outputFrames)throw Error('Incomplete picture coverage.');encoder.stdin.end();await encoded;
  if(JSON.stringify(checkCurrentProductionAuthorization())!==frozen||await fileHash(fileURLToPath(import.meta.url))!==rendererSha256)throw Error('Frozen production inputs changed.');
  renameSync(partial,output);
  const receipt={status:'encoded; independent final-file checks pending',file:basename(output),format,...size,...clock,outputFps:60,outputDurationSeconds:clock.outputFrames/60,sourcePictureMapping:'min(5130, floor(outputFrame*5/12))',sourcePicture:'All 5131 native decoded pictures, held without interpolation; last picture retained through AAC tail.',audio:'Original AAC packets copied without filtering, trimming or reencoding.',color:'Limited-range BT.709 YUV420P; square pixels.',identity:approved.identity,productionScope:approved.listeningGateComplete?'complete listening review':'owner-approved current preview; standardized listening scope not separately attested',rendererSha256,sha256:await fileHash(output),bytes:statSync(output).size,elapsedSeconds:(Date.now()-begun)/1000};
  writeFileSync(output+'.json',JSON.stringify(receipt,null,2)+'\n');console.log(JSON.stringify(receipt));
 }catch(error){encoder.stdin.destroy();encoder.kill('SIGTERM');decoder.kill('SIGTERM');throw error}
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url))main().catch(e=>{console.error(String(e));process.exitCode=1});
