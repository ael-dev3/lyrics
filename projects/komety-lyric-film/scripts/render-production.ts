import {spawn, execFileSync, type ChildProcess, type ChildProcessWithoutNullStreams} from 'node:child_process';
import {createHash} from 'node:crypto';
import {createReadStream, readFileSync, writeFileSync, mkdirSync, existsSync, renameSync, statSync, statfsSync} from 'node:fs';
import {basename, dirname, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {createCanvas, GlobalFonts, ImageData} from '@napi-rs/canvas';
import {checkCurrentProductionGate, type Identity} from './render-gate.ts';
import {paintScene, setSceneForProof} from '../src/scene.ts';
import type {FeatureData, Format, FramingSpan, Timeline} from '../src/model.ts';

export const root = fileURLToPath(new URL('../', import.meta.url));
export const OUTPUT_FPS = 60;
export interface SourceManifest {
  sha256: string;
  video: {width: number; height: number; frameRate: string; frameCount: number; durationSeconds: number; startSeconds: number; sampleAspectRatio: string};
  audio: {sampleRate: number; channels: number; startSeconds: number; decodedSamples: number; decodedDurationSeconds: number};
}
export interface RenderClock {sourceFrames: number; sourceFps: number; outputFrames: number; outputFps: number; audioSamples: number; sampleRate: number; audioEnd: number; videoEnd: number;}
export const readJson = <T>(path: string): T => JSON.parse(readFileSync(resolve(root,path),'utf8')) as T;
const sha = (bytes: Uint8Array): string => createHash('sha256').update(bytes).digest('hex');
export async function fileHash(path: string): Promise<string> {
  const hash = createHash('sha256');
  for await (const chunk of createReadStream(path)) hash.update(chunk as Buffer);
  return hash.digest('hex');
}
export function renderClock(manifest: SourceManifest): RenderClock {
  const v=manifest.video,a=manifest.audio;
  if(v.width!==1920 || v.height!==796 || v.frameRate!=='25/1' || v.startSeconds!==0 || v.sampleAspectRatio!=='1:1'
    || a.sampleRate!==44100 || a.channels!==2 || a.startSeconds!==0 || !Number.isSafeInteger(v.frameCount) || v.frameCount<1
    || !Number.isSafeInteger(a.decodedSamples) || a.decodedSamples<1) throw Error('Unexpected original source clock');
  const audioEnd=a.decodedSamples/a.sampleRate,videoEnd=v.frameCount/25;
  if(Math.abs(audioEnd-a.decodedDurationSeconds)>1e-9 || Math.abs(videoEnd-v.durationSeconds)>1e-9
    || audioEnd<videoEnd || audioEnd-videoEnd>.1) throw Error('Unexpected original audio tail');
  const outputFrames=Math.ceil(a.decodedSamples*OUTPUT_FPS/a.sampleRate);
  return {sourceFrames:v.frameCount,sourceFps:25,outputFrames,outputFps:OUTPUT_FPS,
    audioSamples:a.decodedSamples,sampleRate:a.sampleRate,audioEnd,videoEnd};
}
export function sourceFrameForOutput(frame: number, clock: RenderClock): number {
  if(!Number.isSafeInteger(frame) || frame<0 || frame>=clock.outputFrames) throw Error('Output frame outside locked duration');
  // Original picture j is held on [j/25,(j+1)/25). Integer cadence avoids
  // interpolation, accumulated drift and a seek selecting a later picture.
  return Math.min(clock.sourceFrames-1,Math.floor(frame*5/12));
}
export function sceneTimeForOutput(frame:number):number {
  if(!Number.isSafeInteger(frame)||frame<0) throw Error('Invalid scene frame');
  const sample=frame*735;let time=frame/60;
  const bits=new DataView(new ArrayBuffer(8));
  // The mathematical frame lies exactly on integer sample n*735. A rounded
  // n/60 can multiply back just below it (43.8*44100, for example), retaining
  // focus for one extra frame. Move only to the next representable float when
  // needed; this is numerical normalization, not a timing or onset offset.
  while(time*44100<sample || Math.floor(time*25)<Math.floor(frame*5/12)) {
    bits.setFloat64(0,time,false);bits.setBigUint64(0,bits.getBigUint64(0,false)+1n,false);time=bits.getFloat64(0,false);
  }
  return time;
}
export function dimensions(format: Format): {width:number;height:number} {
  return format==='landscape'?{width:1920,height:796}:{width:1080,height:1920};
}
export function createApprovedPainter(format: Format) {
  const timeline=readJson<Timeline>('public/timeline.json'),features=readJson<FeatureData>('public/audio-features.json');
  const framing=readJson<FramingSpan[]>('public/portrait-framing.json');
  if(features.sourceSha256!==timeline.sourceSha256 || features.analysis.frameRate.numerator!==25
    || features.analysis.frameRate.denominator!==1) throw Error('Features do not belong to the locked source');
  if(!GlobalFonts.registerFromPath(resolve(root,'public/fonts/CormorantGaramond-Semibold.ttf'),'Komety')) throw Error('Approved font registration failed');
  setSceneForProof(timeline,features,framing,()=>{
    const canvas=createCanvas(270,480);
    return {canvas:canvas as unknown as CanvasImageSource,context:canvas.getContext('2d') as unknown as CanvasRenderingContext2D};
  });
  const size=dimensions(format),canvas=createCanvas(size.width,size.height);
  const context=canvas.getContext('2d') as unknown as CanvasRenderingContext2D;
  const sourceCanvas=createCanvas(1920,796),sourceContext=sourceCanvas.getContext('2d');
  let priorSource=-1;
  return {canvas,context,timeline,framing,paint(bytes:Buffer,sourceFrame:number,outputFrame:number):Buffer {
    if(bytes.length!==1920*796*4) throw Error('Wrong original frame byte count');
    if(priorSource!==sourceFrame) {
      sourceContext.putImageData(new ImageData(new Uint8ClampedArray(bytes.buffer,bytes.byteOffset,bytes.byteLength),1920,796),0,0);
      priorSource=sourceFrame;
    }
    paintScene(context,sceneTimeForOutput(outputFrame),format,sourceCanvas as unknown as CanvasImageSource);
    const rendered=canvas.data();
    if(rendered.length!==size.width*size.height*4) throw Error('Wrong painted frame byte count');
    return rendered;
  }};
}
export async function* rawFrames(child: ChildProcessWithoutNullStreams,frameBytes:number):AsyncGenerator<Buffer> {
  let frame=Buffer.allocUnsafe(frameBytes),used=0;
  for await(const part of child.stdout) {
    const chunk=part as Buffer;
    for(let offset=0;offset<chunk.length;) {
      const count=Math.min(frameBytes-used,chunk.length-offset);
      chunk.copy(frame,used,offset,offset+count);offset+=count;used+=count;
      if(used===frameBytes) {yield frame;frame=Buffer.allocUnsafe(frameBytes);used=0;}
    }
  }
  if(used!==0) throw Error(`Decoder returned a truncated raw frame (${used} bytes)`);
}
export function watchChild(child:ChildProcess,label:string):Promise<void> {
  let stderr='';child.stderr?.on('data',chunk=>{stderr=(stderr+String(chunk)).slice(-6000);});
  const done=new Promise<void>((accept,reject)=>{
    child.once('error',reject);
    child.once('close',code=>code===0?accept():reject(Error(`${label} exited ${code}: ${stderr.replaceAll(root,'<project>')}`)));
  });
  // Observe immediately while stdout is consumed, avoiding an unhandled child
  // rejection if its streaming peer is still working.
  void done.catch(()=>{});return done;
}
export function startSourceDecoder(indices?:number[]):ChildProcessWithoutNullStreams {
  const filter=indices?['-vf',`select=${indices.map(n=>`eq(n\\,${n})`).join('+')}`,'-frames:v',String(indices.length)]:[];
  const child=spawn('ffmpeg',['-hide_banner','-v','error','-nostdin','-threads','2','-i',resolve(root,'public/source.mp4'),
    '-map','0:v:0',...filter,'-fps_mode','passthrough','-f','rawvideo','-pix_fmt','rgba','pipe:1'],{stdio:['pipe','pipe','pipe']});
  child.stdin.end();return child;
}
const writeFrame=(child:ChildProcessWithoutNullStreams,bytes:Buffer):Promise<void>=>
  new Promise((done,reject)=>child.stdin.write(bytes,error=>error?reject(error):done()));

async function main():Promise<void> {
  const args=process.argv.slice(2);
  if(args.includes('--help')) {
    console.log('Usage: node scripts/render-production.ts --check-gate | --plan | --production --format landscape|portrait | --still --format landscape|portrait --frame N');return;
  }
  // First operational boundary: before decode, paint, mkdir, capture or encode.
  // Diagnostic stills use exactly the same current production gate.
  checkCurrentProductionGate();
  if(args.includes('--check-gate')) {console.log('Current production gate passed; no capture or output.');return;}
  const clock=renderClock(readJson<SourceManifest>('source/manifest.json'));
  if(args.includes('--plan')) {
    console.log(JSON.stringify({...clock,sourceFrameMapping:'min(6500, floor(n*5/12))',
      finalPictureFirstOutputFrame:Math.ceil((clock.sourceFrames-1)*12/5),audioTailSeconds:clock.audioEnd-clock.videoEnd,
      cfrRemainderSeconds:clock.outputFrames/60-clock.audioEnd}));return;
  }
  const option=(name:string):string|undefined=>{const at=args.indexOf(name);return at<0?undefined:args[at+1];};
  const production=args.includes('--production'),still=args.includes('--still');
  if(production===still) throw Error('Choose exactly one of --production or --still');
  const selectedFormat=option('--format');
  if(selectedFormat!=='landscape' && selectedFormat!=='portrait') throw Error('Choose --format landscape|portrait; no implicit render');
  const format:Format=selectedFormat,size=dimensions(format),frameOption=option('--frame'),frame=Number(frameOption);
  if(production && frameOption!==undefined) throw Error('--frame is only for diagnostic stills');
  if(still && (!Number.isSafeInteger(frame)||frame<0||frame>=clock.outputFrames)) throw Error('--still requires a valid --frame N');
  const current=readJson<Identity>('evidence/preview-inputs.json');
  const rendererPath=fileURLToPath(import.meta.url),rendererSha256=sha(readFileSync(rendererPath)),originalIdentity=JSON.stringify(current);
  const verifyFrozen=():void=>{
    checkCurrentProductionGate();
    if(sha(readFileSync(rendererPath))!==rendererSha256 || JSON.stringify(readJson<Identity>('evidence/preview-inputs.json'))!==originalIdentity)
      throw Error('Production blocked: renderer or approved identity changed during export');
  };
  const sourcePath=resolve(root,'public/source.mp4');
  const probe=JSON.parse(execFileSync('ffprobe',['-v','error','-select_streams','v:0','-show_entries',
    'stream=width,height,r_frame_rate,nb_frames,start_time,duration','-of','json',sourcePath],{encoding:'utf8'})) as
    {streams:{width:number;height:number;r_frame_rate:string;nb_frames:string;start_time:string;duration:string}[]};
  const video=probe.streams[0];
  if(!video || video.width!==1920 || video.height!==796 || video.r_frame_rate!=='25/1'
    || Number(video.nb_frames)!==clock.sourceFrames || Number(video.start_time)!==0
    || Math.abs(Number(video.duration)-clock.videoEnd)>.000001) throw Error('Original picture differs from locked clock');
  const name=`KOMETY-${format}-${size.width}x${size.height}-60fps`;
  const output=resolve(root,production?`renders/${name}.mp4`:`renders/diagnostic/${name}-${String(frame).padStart(5,'0')}.png`);
  const partial=output.replace(/\.(mp4|png)$/u,'.partial.$1');
  if(existsSync(output)||existsSync(partial)) throw Error(`Output exists: ${basename(output)}; refusing overwrite`);
  const free=statfsSync(root);
  if(production && free.bavail*free.bsize<4e9) throw Error('At least 4 GB free disk space is required');
  const painter=createApprovedPainter(format);
  mkdirSync(dirname(output),{recursive:true});const begun=Date.now();
  if(still) {
    const sourceFrame=sourceFrameForOutput(frame,clock),decoder=startSourceDecoder([sourceFrame]);
    const done=watchChild(decoder,'Original still decoder');let count=0;
    try {
      for await(const bytes of rawFrames(decoder,1920*796*4)) {
        count++;painter.paint(bytes,sourceFrame,frame);writeFileSync(partial,await painter.canvas.encode('png'));
      }
      await done;if(count!==1) throw Error(`Expected one diagnostic picture, received ${count}`);
      verifyFrozen();renameSync(partial,output);
      console.log(JSON.stringify({status:'diagnostic still',file:basename(output),format,frame,sourceFrame,time:frame/60,
        revision:current.revision,rendererSha256,sha256:await fileHash(output),elapsedSeconds:(Date.now()-begun)/1000}));
    } catch(error) {decoder.kill('SIGTERM');throw error;}
    return;
  }
  const encoder=spawn('ffmpeg',['-hide_banner','-v','warning','-nostdin','-n',
    '-f','rawvideo','-pix_fmt','rgba','-s',`${size.width}x${size.height}`,'-framerate','60','-i','pipe:0',
    '-i',sourcePath,'-map','0:v:0','-map','1:a:0',
    '-vf','scale=in_range=full:out_range=tv:out_color_matrix=bt709,setsar=1,format=yuv420p,setparams=range=limited:color_primaries=bt709:color_trc=bt709:colorspace=bt709',
    '-c:v','libx264','-preset','medium','-crf','17','-threads','6','-g','120',
    '-color_range','tv','-color_primaries','bt709','-color_trc','bt709','-colorspace','bt709',
    '-video_track_timescale','60000','-frames:v',String(clock.outputFrames),'-c:a','copy',
    '-movflags','+faststart','-metadata','title=POLNALYUBVI — Кометы | Lyric Film',partial],{stdio:['pipe','pipe','pipe']});
  encoder.stdout.resume();encoder.stdin.on('error',()=>{});
  const encoded=watchChild(encoder,'Production encoder'),decoder=startSourceDecoder(),decoded=watchChild(decoder,'Original picture decoder');
  let sourceCount=0,outputCount=0,lastReport=Date.now();
  try {
    for await(const bytes of rawFrames(decoder,1920*796*4)) {
      if(sourceCount>=clock.sourceFrames) throw Error('Original decoded more pictures than locked manifest');
      while(outputCount<clock.outputFrames && sourceFrameForOutput(outputCount,clock)===sourceCount) {
        await writeFrame(encoder,painter.paint(bytes,sourceCount,outputCount));outputCount++;
      }
      sourceCount++;
      if(Date.now()-lastReport>=10000) {
        lastReport=Date.now();const elapsedSeconds=(lastReport-begun)/1000;
        console.log(JSON.stringify({format,phase:'rendering',outputFrames:outputCount,totalFrames:clock.outputFrames,
          elapsedSeconds:Number(elapsedSeconds.toFixed(1)),renderFramesPerSecond:Number((outputCount/elapsedSeconds).toFixed(2)),
          estimatedRemainingSeconds:Number((elapsedSeconds*(clock.outputFrames-outputCount)/outputCount).toFixed(1))}));
      }
    }
    await decoded;
    if(sourceCount!==clock.sourceFrames || outputCount!==clock.outputFrames) throw Error(`Incomplete render: ${sourceCount} original / ${outputCount} output frames`);
    encoder.stdin.end();await encoded;verifyFrozen();renameSync(partial,output);
    const receipt={schema:'komety/production-render/v1',status:'encoded; independent encoded-file verification pending',
      file:basename(output),format,width:size.width,height:size.height,revision:current.revision,
      sourceSha256:current.inputs['public/source.mp4'],approvedInputHashes:current.inputs,rendererSha256,
      ...clock,outputDuration:clock.outputFrames/clock.outputFps,sourceFrameMapping:'min(6500, floor(n*5/12))',
      sourcePictureCadence:'Original 25 fps decoded pictures; repeated without motion interpolation',
      finalPictureFirstOutputFrame:Math.ceil((clock.sourceFrames-1)*12/5),
      audioTailSeconds:clock.audioEnd-clock.videoEnd,cfrRemainderSeconds:clock.outputFrames/60-clock.audioEnd,
      audio:'Original AAC stream copy; no filters, trimming, reencoding or shortest truncation',
      colorConversion:'Full-range RGB to limited-range BT.709 YUV420P; BT.709 tags; square pixels',
      sceneHost:'Unchanged shared paintScene and setSceneForProof with approved static semibold font',
      sceneClock:'Mathematical n/60 normalized upward only by representable-float steps when multiplication undershoots canonical sample n*735 or the exact 25 fps analysis frame; no authored timing offset',
      rejectedInitialExport:'Initial renderer omitted primaries/transfer tags and undershot 5 exact focus boundary frames; superseded before delivery',
      sha256:await fileHash(output),bytes:statSync(output).size,elapsedSeconds:(Date.now()-begun)/1000};
    writeFileSync(`${output}.json`,JSON.stringify(receipt,null,2)+'\n');console.log(JSON.stringify(receipt));
  } catch(error) {encoder.stdin.destroy();encoder.kill('SIGTERM');decoder.kill('SIGTERM');throw error;}
}
if(process.argv[1] && resolve(process.argv[1])===fileURLToPath(import.meta.url)) {
  main().catch(error=>{console.error(error instanceof Error?error.message:error);process.exitCode=1;});
}
