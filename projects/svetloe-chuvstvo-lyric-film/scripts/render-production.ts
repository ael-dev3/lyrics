import {spawn,execFileSync,type ChildProcess,type ChildProcessWithoutNullStreams} from 'node:child_process';
import {createHash} from 'node:crypto';
import {createReadStream,readFileSync,writeFileSync,mkdirSync,existsSync,renameSync,statSync,statfsSync} from 'node:fs';
import {basename,dirname,resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {createCanvas,GlobalFonts,ImageData,loadImage} from '@napi-rs/canvas';
import {checkCurrentProductionGate} from './render-gate.ts';
import {paintScene,setSceneForProof} from '../src/scene.ts';
import type {FeatureData,Format,Timeline} from '../src/model.ts';

export const root=fileURLToPath(new URL('../',import.meta.url));
export const OUTPUT_FPS=60;
export interface Recording {
  sourceSha256:string;
  sourceDuration:number;
  sourcePicture:{width:number;height:number;frameRate:{numerator:number;denominator:number};frames:number;duration:number};
  audio:{sampleRate:number;channels:number;startSeconds:number;containerDuration:number;decodedSamples:number;decodedDuration:number};
}
export interface RenderClock {
  sourceFrames:number;sourceFps:number;outputFrames:number;outputFps:number;
  audioSamples:number;sampleRate:number;audioEnd:number;videoEnd:number;
}
interface PreviewIdentity {revision:string;sourceSha256:string;inputs:Record<string,string>}
interface WindowAnchor {id:string;polygon:{x:number;y:number}[];bands:number[]}
export const readJson=<T>(path:string):T=>JSON.parse(readFileSync(resolve(root,path),'utf8')) as T;
const sha=(bytes:Uint8Array):string=>createHash('sha256').update(bytes).digest('hex');
export async function fileHash(path:string):Promise<string> {
  const hash=createHash('sha256');
  for await(const chunk of createReadStream(path))hash.update(chunk as Buffer);
  return hash.digest('hex');
}
export function renderClock(recording:Recording):RenderClock {
  const v=recording.sourcePicture,a=recording.audio;
  if(v.width!==1080||v.height!==1080||v.frameRate.numerator!==25||v.frameRate.denominator!==1||v.frames!==4419
    ||a.sampleRate!==44100||a.channels!==2||a.startSeconds!==0||a.decodedSamples!==7796160)
    throw Error('Unexpected locked original source clock');
  const audioEnd=a.decodedSamples/a.sampleRate,videoEnd=v.frames/25;
  if(Math.abs(audioEnd-a.decodedDuration)>1e-9||Math.abs(videoEnd-v.duration)>1e-9
    ||audioEnd<videoEnd||audioEnd-videoEnd>.1||Math.abs(a.containerDuration-recording.sourceDuration)>1e-9
    ||a.containerDuration<videoEnd||a.containerDuration>audioEnd)throw Error('Unexpected original audio tail');
  return {sourceFrames:v.frames,sourceFps:25,outputFrames:Math.ceil(a.decodedSamples*OUTPUT_FPS/a.sampleRate),
    outputFps:OUTPUT_FPS,audioSamples:a.decodedSamples,sampleRate:a.sampleRate,audioEnd,videoEnd};
}
export function sourceFrameForOutput(frame:number,clock:RenderClock):number {
  if(!Number.isSafeInteger(frame)||frame<0||frame>=clock.outputFrames)throw Error('Output frame outside locked duration');
  // Picture j is held on [j/25,(j+1)/25). The exact 25/60 integer ratio
  // prevents a seek or accumulated floating-point drift choosing a later frame.
  return Math.min(clock.sourceFrames-1,Math.floor(frame*5/12));
}
export function sceneTimeForOutput(frame:number):number {
  if(!Number.isSafeInteger(frame)||frame<0)throw Error('Invalid scene frame');
  // Each output PTS belongs to sample n*735 on the unchanged source clock.
  // model.ts already repairs only machine-precision integer-boundary error.
  return frame*735/44100;
}
export function dimensions(format:Format):{width:number;height:number} {
  return {width:1080,height:format==='landscape'?1080:1920};
}
export async function createApprovedPainter(format:Format) {
  const timeline=readJson<Timeline>('public/timeline.json'),features=readJson<FeatureData>('public/audio-features.json');
  const anchors=readJson<{sourceSha256:string;windows:WindowAnchor[]}>('public/window-anchors.json');
  if(features.sourceSha256!==timeline.sourceSha256||anchors.sourceSha256!==timeline.sourceSha256
    ||features.analysis.frameRate.numerator!==25||features.analysis.frameRate.denominator!==1
    ||features.analysis.frameCount!==4420||features.rows.length!==4420||anchors.windows.length!==10)
    throw Error('Features or window hosts differ from the approved original source');
  if(!GlobalFonts.registerFromPath(resolve(root,'public/fonts/NotoSerif.ttf'),'Theatre'))throw Error('Approved Noto Serif font registration failed');
  const reference=await loadImage(resolve(root,'public/source-reference.png'));
  if(reference.width!==1080||reference.height!==1080)throw Error('Unexpected original material reference dimensions');
  const factory=(width:number,height:number)=>{
    const canvas=createCanvas(width,height);
    return {canvas:canvas as unknown as CanvasImageSource,context:canvas.getContext('2d') as unknown as CanvasRenderingContext2D};
  };
  // The exact approved PNG supplies only luminance/material masks. Each movie
  // picture below is the actual decoded source frame, including compression drift.
  setSceneForProof(timeline,features,anchors.windows,factory,reference as unknown as CanvasImageSource);
  const size=dimensions(format),canvas=createCanvas(size.width,size.height),context=canvas.getContext('2d') as unknown as CanvasRenderingContext2D;
  const sourceCanvas=createCanvas(1080,1080),sourceContext=sourceCanvas.getContext('2d');
  let priorSource=-1;
  return {canvas,context,timeline,paint(bytes:Buffer,sourceFrame:number,outputFrame:number):Buffer {
    if(bytes.length!==1080*1080*4||!Number.isSafeInteger(sourceFrame)||sourceFrame<0||sourceFrame>=4419)throw Error('Invalid original decoded picture');
    if(priorSource!==sourceFrame) {
      sourceContext.putImageData(new ImageData(new Uint8ClampedArray(bytes.buffer,bytes.byteOffset,bytes.byteLength),1080,1080),0,0);
      priorSource=sourceFrame;
    }
    paintScene(context,sceneTimeForOutput(outputFrame),format,sourceCanvas as unknown as CanvasImageSource);
    const rendered=canvas.data();
    if(rendered.length!==size.width*size.height*4)throw Error('Wrong painted frame byte count');
    return rendered;
  }};
}
export async function* rawFrames(child:ChildProcessWithoutNullStreams,frameBytes:number):AsyncGenerator<Buffer> {
  if(!Number.isSafeInteger(frameBytes)||frameBytes<=0)throw Error('Invalid raw frame size');
  let frame=Buffer.allocUnsafe(frameBytes),used=0;
  for await(const part of child.stdout) {
    const chunk=part as Buffer;
    for(let offset=0;offset<chunk.length;) {
      const count=Math.min(frameBytes-used,chunk.length-offset);
      chunk.copy(frame,used,offset,offset+count);offset+=count;used+=count;
      if(used===frameBytes){yield frame;frame=Buffer.allocUnsafe(frameBytes);used=0;}
    }
  }
  if(used!==0)throw Error(`Decoder returned a truncated raw frame (${used} bytes)`);
}
export function watchChild(child:ChildProcess,label:string):Promise<void> {
  let stderr='';child.stderr?.on('data',chunk=>{stderr=(stderr+String(chunk)).slice(-6000);});
  const done=new Promise<void>((accept,reject)=>{
    child.once('error',reject);
    child.once('close',code=>code===0?accept():reject(Error(`${label} exited ${code}: ${stderr.replaceAll(root,'<project>')}`)));
  });
  // Observe errors immediately even while a streaming peer is still working.
  void done.catch(()=>{});return done;
}
export function startSourceDecoder(indices?:number[]):ChildProcessWithoutNullStreams {
  if(indices&&(!indices.length||indices.some((frame,i)=>!Number.isSafeInteger(frame)||frame<0||frame>=4419||(i>0&&frame<=indices[i-1]!))))
    throw Error('Diagnostic source frames must be unique, ordered and in range');
  const filter=indices?['-vf',`select=${indices.map(n=>`eq(n\\,${n})`).join('+')}`,'-frames:v',String(indices.length)]:[];
  const decoder=spawn('ffmpeg',['-hide_banner','-v','error','-nostdin','-xerror','-err_detect','explode','-threads','2','-noautorotate',
    '-i',resolve(root,'public/source.mp4'),'-map','0:v:0',...filter,'-fps_mode','passthrough','-f','rawvideo','-pix_fmt','rgba','pipe:1'],{stdio:['pipe','pipe','pipe']});
  decoder.stdin.end();return decoder;
}
const writeFrame=(encoder:ChildProcessWithoutNullStreams,bytes:Buffer):Promise<void>=>
  new Promise((done,reject)=>encoder.stdin.write(bytes,error=>error?reject(error):done()));
function verifySource(recording:Recording,clock:RenderClock):void {
  const probe=JSON.parse(execFileSync('ffprobe',['-v','error','-show_entries',
    'stream=codec_type,codec_name,width,height,r_frame_rate,avg_frame_rate,sample_aspect_ratio,nb_frames,start_time,duration,sample_rate,channels',
    '-of','json',resolve(root,'public/source.mp4')],{encoding:'utf8'})) as {streams:Record<string,unknown>[]};
  const video=probe.streams.find(s=>s.codec_type==='video'),audio=probe.streams.find(s=>s.codec_type==='audio');
  if(!video||video.width!==1080||video.height!==1080||video.r_frame_rate!=='25/1'||video.avg_frame_rate!=='25/1'
    ||video.sample_aspect_ratio!=='1:1'||Number(video.nb_frames)!==clock.sourceFrames||Number(video.start_time)!==0
    ||Math.abs(Number(video.duration)-clock.videoEnd)>.000001||!audio||audio.codec_name!=='aac'||Number(audio.sample_rate)!==44100
    ||audio.channels!==2||Number(audio.start_time)!==0||Math.abs(Number(audio.duration)-recording.audio.containerDuration)>.000001)
    throw Error('Original video/audio streams differ from the locked clock');
}

async function main():Promise<void> {
  const args=process.argv.slice(2);
  if(args.includes('--help')) {
    console.log('Usage: node scripts/render-production.ts --check-gate | --plan | --production [--format landscape|portrait|both] | --still --format landscape|portrait --frame N');return;
  }
  // First operational boundary: no decoder, painter, mkdir or encoder before
  // the current eleven-asset complete-preview and synchronization gate passes.
  process.chdir(root);checkCurrentProductionGate();
  if(args.includes('--check-gate')){console.log('Current production gate passed; no capture or output.');return;}
  const recording=readJson<Recording>('source/recording.json'),clock=renderClock(recording);
  const identity=readJson<PreviewIdentity>('evidence/preview-inputs.json');
  if(recording.sourceSha256!==identity.inputs['public/source.mp4']||recording.sourceSha256!==identity.sourceSha256)
    throw Error('Production clock belongs to another source');
  if(args.includes('--plan')) {
    console.log(JSON.stringify({...clock,sourceFrameMapping:'min(4418, floor(n*5/12))',
      finalPictureFirstOutputFrame:Math.ceil((clock.sourceFrames-1)*12/5),audioTailSeconds:clock.audioEnd-clock.videoEnd,
      cfrRemainderSeconds:clock.outputFrames/60-clock.audioEnd,formats:{landscape:dimensions('landscape'),portrait:dimensions('portrait')}}));return;
  }
  const option=(name:string):string|undefined=>{const at=args.indexOf(name);return at<0?undefined:args[at+1];};
  const production=args.includes('--production'),still=args.includes('--still');
  if(production===still)throw Error('Choose exactly one of --production or --still');
  const selectedFormat=option('--format')??(production?'both':undefined);
  if(selectedFormat!=='landscape'&&selectedFormat!=='portrait'&&!(production&&selectedFormat==='both'))throw Error('Choose --format landscape|portrait, or both for production');
  const formats:Format[]=selectedFormat==='both'?['landscape','portrait']:[selectedFormat as Format];
  const frameOption=option('--frame'),frame=Number(frameOption);
  if(production&&frameOption!==undefined)throw Error('--frame is only for diagnostic stills');
  if(still&&(!Number.isSafeInteger(frame)||frame<0||frame>=clock.outputFrames))throw Error('--still requires a valid --frame N');
  const rendererPath=fileURLToPath(import.meta.url),rendererSha256=sha(readFileSync(rendererPath));
  const recordingSha256=sha(readFileSync(resolve(root,'source/recording.json')));
  const approvalSha256=sha(readFileSync(resolve(root,'evidence/review-status.json'))),identitySha256=sha(readFileSync(resolve(root,'evidence/preview-inputs.json')));
  const verifyFrozen=():void=>{
    checkCurrentProductionGate();
    if(sha(readFileSync(rendererPath))!==rendererSha256||sha(readFileSync(resolve(root,'source/recording.json')))!==recordingSha256
      ||sha(readFileSync(resolve(root,'evidence/preview-inputs.json')))!==identitySha256||sha(readFileSync(resolve(root,'evidence/review-status.json')))!==approvalSha256)
      throw Error('Production blocked: renderer, source clock or approved identity changed during export');
  };
  verifySource(recording,clock);
  const free=statfsSync(root);
  if(production&&free.bavail*free.bsize<4e9)throw Error('At least 4 GB free disk space is required');
  for(const format of formats) {
    verifyFrozen();const size=dimensions(format);
    const name=`Svetloe-Chuvstvo-Settlers-${format==='landscape'?'YouTube':'TikTok'}-${size.width}x${size.height}-60fps`;
    const output=resolve(root,production?`renders/${name}.mp4`:`renders/diagnostic/${name}-${String(frame).padStart(5,'0')}.png`);
    const partial=output.replace(/\.(mp4|png)$/u,'.partial.$1');
    if(existsSync(output)||existsSync(partial)||existsSync(`${output}.json`))throw Error(`Output exists: ${basename(output)}; refusing overwrite`);
    const painter=await createApprovedPainter(format);
    mkdirSync(dirname(output),{recursive:true});const begun=Date.now();
    if(still) {
      const sourceFrame=sourceFrameForOutput(frame,clock),decoder=startSourceDecoder([sourceFrame]),decoded=watchChild(decoder,'Original still decoder');let count=0;
      try {
        for await(const bytes of rawFrames(decoder,1080*1080*4)) {
          count++;painter.paint(bytes,sourceFrame,frame);writeFileSync(partial,await painter.canvas.encode('png'));
        }
        await decoded;if(count!==1)throw Error(`Expected one diagnostic picture, received ${count}`);
        verifyFrozen();renameSync(partial,output);
        console.log(JSON.stringify({status:'diagnostic still',file:basename(output),format,frame,sourceFrame,time:sceneTimeForOutput(frame),
          revision:identity.revision,rendererSha256,sha256:await fileHash(output),elapsedSeconds:(Date.now()-begun)/1000}));
      }catch(error){decoder.kill('SIGTERM');throw error;}
      continue;
    }
    const encoder=spawn('ffmpeg',['-hide_banner','-v','warning','-nostdin','-n','-f','rawvideo','-pix_fmt','rgba',
      '-s',`${size.width}x${size.height}`,'-framerate','60','-i','pipe:0','-i',resolve(root,'public/source.mp4'),
      '-map','0:v:0','-map','1:a:0',
      '-vf','scale=in_range=full:out_range=tv:out_color_matrix=bt709,setsar=1,format=yuv420p,setparams=range=limited:color_primaries=bt709:color_trc=bt709:colorspace=bt709',
      '-c:v','libx264','-preset','medium','-crf','17','-threads','6','-g','120',
      '-color_range','tv','-color_primaries','bt709','-color_trc','bt709','-colorspace','bt709','-video_track_timescale','60000',
      '-frames:v',String(clock.outputFrames),'-c:a','copy','-movflags','+faststart',
      '-metadata','title=Settlers — Светлое чувство | Synchronized Lyric Film',partial],{stdio:['pipe','pipe','pipe']});
    encoder.stdout.resume();encoder.stdin.on('error',()=>{});
    const encoded=watchChild(encoder,'Production encoder'),decoder=startSourceDecoder(),decoded=watchChild(decoder,'Original picture decoder');
    let sourceCount=0,outputCount=0,lastReport=Date.now();
    try {
      for await(const bytes of rawFrames(decoder,1080*1080*4)) {
        if(sourceCount>=clock.sourceFrames)throw Error('Original decoded more pictures than locked manifest');
        while(outputCount<clock.outputFrames&&sourceFrameForOutput(outputCount,clock)===sourceCount) {
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
      if(sourceCount!==clock.sourceFrames||outputCount!==clock.outputFrames)throw Error(`Incomplete render: ${sourceCount} original / ${outputCount} output frames`);
      encoder.stdin.end();await encoded;verifyFrozen();renameSync(partial,output);
      const receipt={schema:'svetloe-chuvstvo/production-render/v1',status:'encoded; independent encoded-file verification pending',file:basename(output),format,
        width:size.width,height:size.height,revision:identity.revision,sourceSha256:identity.sourceSha256,
        approvedInputHashes:identity.inputs,rendererSha256,recordingSha256,identitySha256,approvalSha256,...clock,
        audioPresentationDuration:recording.audio.containerDuration,outputDuration:clock.outputFrames/60,
        sourceFrameMapping:'min(4418, floor(n*5/12))',sourcePictureCadence:'Every original 25 fps picture decoded and repeated without interpolation',
        finalPictureFirstOutputFrame:Math.ceil((clock.sourceFrames-1)*12/5),audioTailSeconds:clock.audioEnd-clock.videoEnd,
        cfrRemainderSeconds:clock.outputFrames/60-clock.audioEnd,
        audio:'Original AAC stream copy; no filters, trimming, reencoding or shortest truncation',
        colorConversion:'Full-range RGB to limited-range BT.709 YUV420P; BT.709 tags; square pixels',
        sceneHost:'Unchanged shared paintScene/setSceneForProof; approved NotoSerif500 Theatre; exact reference PNG material masks; each main picture is the actual decoded original1080×1080 frame',
        sceneClock:'Each output PTS n/60 belongs to source sample n*735; unchanged model.ts boundary repair; no authored timing offset',
        sha256:await fileHash(output),bytes:statSync(output).size,elapsedSeconds:(Date.now()-begun)/1000};
      writeFileSync(`${output}.json`,JSON.stringify(receipt,null,2)+'\n');console.log(JSON.stringify(receipt));
    }catch(error){encoder.stdin.destroy();encoder.kill('SIGTERM');decoder.kill('SIGTERM');throw error;}
  }
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)) {
  main().catch(error=>{console.error(error instanceof Error?error.message:error);process.exitCode=1;});
}
