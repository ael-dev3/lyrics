import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {createHash} from 'node:crypto';
import {createReadStream, existsSync, mkdirSync, readFileSync, renameSync, writeFileSync} from 'node:fs';
import {open, stat} from 'node:fs/promises';
import {basename, dirname, isAbsolute, relative, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {checkCurrentProductionGate} from './render-gate.ts';

// Read-only checks operate on completed encoded files. No scene painter, capture
// command, renderer receipt, or in-memory production pixels are used as proof.
const root=resolve(fileURLToPath(new URL('..',import.meta.url)));
const FPS=60;
type Format='landscape'|'portrait';
type Json=Record<string,unknown>;
export type BlackInterval={start:number;end:number};
export type BlackScan={intervals:BlackInterval[];finalPictureBlack:boolean;boundaryEvents:number;};
interface Identity {revision:string;sourceSha256:string;inputs:Record<string,string>}
export interface Recording {
  sourceSha256:string;sourceBytes:number;sourceDuration:number;
  sourcePicture:{width:number;height:number;frameRate:{numerator:number;denominator:number};frames:number;duration:number};
  audio:{sampleRate:number;channels:number;startSeconds:number;containerDuration:number;decodedSamples:number;decodedDuration:number};
}
const SOURCE_SHA256='9563b2098827fcf2ee18e0f1b573ded5f5e147be3faf258b5f2507162690a655';
const SOURCE_ROI={x:460,y:420,width:140,height:150};
const PORTRAIT_SOURCE_OFFSET=400;
interface CommandOptions {limit?:number;collect?:boolean;stdout?:(bytes:Buffer)=>void;stderrLine?:(line:string)=>void;}
const read=<T>(path:string):T=>JSON.parse(readFileSync(resolve(root,path),'utf8')) as T;
const sha=(bytes:Uint8Array|string):string=>createHash('sha256').update(bytes).digest('hex');
const snapshot=<T>(path:string):{data:T;sha256:string}=>{const bytes=readFileSync(resolve(root,path));return {data:JSON.parse(bytes.toString('utf8')) as T,sha256:sha(bytes)};};
const clean=(value:string):string=>value.replaceAll(root,'<project>').replaceAll(dirname(root),'<checkout>').replace(/\/Users\/[^\s"']+/gu,'<local-file>');
const phase=(label:string,extra:Json={}):void=>console.log(JSON.stringify({phase:label,...extra}));
function object(value:unknown,label:string):Json {assert.ok(value&&typeof value==='object'&&!Array.isArray(value),label);return value as Json;}
function array(value:unknown,label:string):unknown[] {assert.ok(Array.isArray(value),label);return value;}
export function canonical(value:unknown):string {
  if(Array.isArray(value))return '['+value.map(canonical).join(',')+']';
  if(value&&typeof value==='object')return '{'+Object.entries(value).sort(([a],[b])=>a.localeCompare(b)).map(([key,item])=>JSON.stringify(key)+':'+canonical(item)).join(',')+'}';
  return JSON.stringify(value)??'null';
}
async function fileHash(path:string):Promise<string> {
  const hash=createHash('sha256');
  for await(const bytes of createReadStream(path))hash.update(bytes as Buffer);
  return hash.digest('hex');
}
async function command(bin:string,args:string[],label:string,options:CommandOptions={}):Promise<{stdout:Buffer;stderr:string}> {
  phase(label);
  const started=Date.now(),limit=options.limit??32*1024*1024,collect=options.collect!==false;
  return new Promise((done,fail)=>{
    const child=spawn(bin,args,{stdio:['ignore','pipe','pipe']});
    const pieces:Buffer[]=[];let size=0,errorTail='',lineTail='',settled=false;
    const ticker=setInterval(()=>phase(label,{elapsedSeconds:Math.round((Date.now()-started)/1000),status:'running'}),15000);
    const finish=(error?:Error):void=>{if(settled)return;settled=true;clearInterval(ticker);if(error)fail(error);else done({stdout:Buffer.concat(pieces),stderr:errorTail});};
    const reject=(error:unknown):void=>{child.kill('SIGTERM');finish(error instanceof Error?error:Error(String(error)));};
    child.on('error',reject);
    child.stdout.on('data',(bytes:Buffer)=>{try{
      options.stdout?.(bytes);
      if(collect){size+=bytes.length;if(size>limit)throw Error(`${label}: output exceeds ${limit} bytes`);pieces.push(bytes);}
    }catch(error){reject(error);}});
    child.stderr.on('data',(bytes:Buffer)=>{try{
      const text=bytes.toString('utf8');errorTail=(errorTail+text).slice(-16384);
      if(options.stderrLine){lineTail+=text;let end:number;while((end=lineTail.indexOf('\n'))>=0){options.stderrLine(lineTail.slice(0,end));lineTail=lineTail.slice(end+1);}if(lineTail.length>65536)throw Error(`${label}: excessive stderr line`);}
    }catch(error){reject(error);}});
    child.on('close',(code,signal)=>{try{
      if(options.stderrLine&&lineTail)options.stderrLine(lineTail);
      if(code!==0)finish(Error(`${label} failed (${code??signal}): ${clean(errorTail)}`));else finish();
    }catch(error){reject(error);}});
  });
}
async function jsonCommand(args:string[],label:string):Promise<Json> {
  return object(JSON.parse((await command('ffprobe',args,label)).stdout.toString('utf8')),label);
}
async function verifyApprovedInputs(identity:Identity):Promise<void> {
  for(const [path,expected] of Object.entries(identity.inputs)){
    assert.ok(!isAbsolute(path)&&!path.split(/[\\/]/u).includes('..'),'Approved input paths must stay within the project');
    assert.equal(await fileHash(resolve(root,path)),expected,`Changed approved input ${path}`);
  }
}
async function probe(path:string,label:string):Promise<Json> {
  return jsonCommand(['-v','error','-show_entries',
    'format=duration,size:stream=index,codec_type,codec_name,pix_fmt,width,height,sample_aspect_ratio,avg_frame_rate,r_frame_rate,time_base,start_pts,start_time,duration_ts,duration,nb_frames,sample_rate,channels,color_primaries,color_transfer,color_space,color_range',
    '-of','json',path],label);
}
function stream(probe:Json,kind:string):Json {
  const matches=array(probe.streams,'Missing streams').map(item=>object(item,'Invalid stream')).filter(item=>item.codec_type===kind);
  assert.equal(matches.length,1,`Expected exactly one ${kind} stream`);return matches[0]!;
}
function equalNumber(actual:unknown,expected:number,label:string,tolerance=0.000002):void {
  assert.ok(Number.isFinite(Number(actual))&&Math.abs(Number(actual)-expected)<=tolerance,`${label}: expected ${expected}, got ${String(actual)}`);
}
function rate(value:unknown):[number,number] {
  assert.equal(typeof value,'string','Missing rational rate');const match=/^(\d+)\/(\d+)$/u.exec(value as string);
  assert.ok(match,'Invalid rational rate');const a=Number(match[1]),b=Number(match[2]);assert.ok(a>0&&b>0);return [a,b];
}
function sourceMetadata(data:Json,recording:Recording):void {
  assert.equal(array(data.streams,'Streams').length,2);
  const v=stream(data,'video'),a=stream(data,'audio');
  assert.equal(v.width,recording.sourcePicture.width);assert.equal(v.height,recording.sourcePicture.height);
  assert.equal(v.codec_name,'h264');assert.equal(v.r_frame_rate,`${recording.sourcePicture.frameRate.numerator}/${recording.sourcePicture.frameRate.denominator}`);assert.equal(v.avg_frame_rate,`${recording.sourcePicture.frameRate.numerator}/${recording.sourcePicture.frameRate.denominator}`);
  assert.equal(Number(v.nb_frames),recording.sourcePicture.frames);assert.equal(v.sample_aspect_ratio,'1:1');
  equalNumber(v.start_time,0,'Source video start');equalNumber(v.duration,recording.sourcePicture.duration,'Source video duration');
  assert.equal(a.codec_name,'aac');assert.equal(Number(a.sample_rate),recording.audio.sampleRate);assert.equal(a.channels,recording.audio.channels);
  assert.equal(a.time_base,`1/${recording.audio.sampleRate}`);equalNumber(a.start_time,recording.audio.startSeconds,'Source audio start');
  equalNumber(a.duration,recording.audio.containerDuration,'Source AAC presentation duration');
  assert.equal(recording.audio.decodedDuration,recording.audio.decodedSamples/recording.audio.sampleRate,'Decoded duration/sample contract');
}
function outputMetadata(data:Json,format:Format,recording:Recording,frames:number,sourceProbe:Json):Json {
  assert.equal(array(data.streams,'Streams').length,2);
  const v=stream(data,'video'),a=stream(data,'audio'),original=stream(sourceProbe,'audio');
  const width=format==='landscape'?recording.sourcePicture.width:1080,height=format==='landscape'?recording.sourcePicture.height:1920;
  assert.equal(v.codec_name,'h264');assert.equal(v.width,width);assert.equal(v.height,height);
  assert.equal(v.r_frame_rate,'60/1');assert.equal(v.avg_frame_rate,'60/1');assert.equal(Number(v.nb_frames),frames);
  assert.equal(v.pix_fmt,'yuv420p');assert.equal(v.sample_aspect_ratio,'1:1');assert.equal(v.color_range,'tv');
  for(const key of ['color_primaries','color_transfer','color_space'])assert.equal(v[key],'bt709',`${format} ${key}`);
  equalNumber(v.start_time,0,`${format} video start`);equalNumber(v.duration,frames/FPS,`${format} video duration`);
  for(const key of ['codec_name','sample_rate','channels','time_base','start_pts','start_time','duration_ts','duration'])assert.equal(a[key],original[key],`${format} audio ${key}`);
  const container=object(data.format,'Missing container');equalNumber(container.duration,frames/FPS,`${format} container duration`,.001001);
  return {width,height,frames,framesPerSecond:FPS,videoDurationSeconds:Number(v.duration),audioDurationSeconds:Number(a.duration),
    videoCodec:v.codec_name,audioCodec:a.codec_name,pixelFormat:v.pix_fmt,colorRange:v.color_range,colorSpace:v.color_space,
    colorPrimaries:v.color_primaries,colorTransfer:v.color_transfer,timeBase:v.time_base,sampleAspectRatio:v.sample_aspect_ratio};
}
async function allTimestamps(path:string,frames:number,timeBase:unknown,label:string):Promise<Json> {
  const data=await jsonCommand(['-v','error','-threads','2','-select_streams','v:0','-show_frames',
    '-show_entries','frame=best_effort_timestamp,best_effort_timestamp_time','-of','json',path],label+' decoded frame timestamps');
  const rows=array(data.frames,'Missing decoded frames');assert.equal(rows.length,frames,`${label} decoded frame count`);
  let maximumTimestampErrorSeconds=0;
  const validated=validateCfrTimestamps(rows,timeBase,frames,label);
  maximumTimestampErrorSeconds=validated.maximumTimestampErrorSeconds;
  return {decodedFrames:rows.length,allFrameTimestamps:true,maximumTimestampErrorSeconds,
    method:'Every decoded frame has an integer best-effort PTS exactly equal to n/60 in the stream time base; printed seconds agree within 2 microseconds.'};
}
export function validateCfrTimestamps(rows:unknown[],timeBase:unknown,frames:number,label='Movie'): {maximumTimestampErrorSeconds:number} {
  assert.equal(rows.length,frames,`${label} decoded frame count`);
  const [numerator,denominator]=rate(timeBase);let maximumTimestampErrorSeconds=0;
  rows.forEach((item,n)=>{
    const row=object(item,'Invalid frame'),pts=Number(row.best_effort_timestamp);
    assert.ok(Number.isSafeInteger(pts),`${label} frame ${n}: missing integer PTS`);
    assert.equal(BigInt(pts)*BigInt(numerator)*60n,BigInt(n)*BigInt(denominator),`${label} frame ${n}: non-CFR PTS`);
    const error=Math.abs(Number(row.best_effort_timestamp_time)-n/FPS);
    assert.ok(Number.isFinite(error)&&error<=.000002,`${label} frame ${n}: timestamp disagreement`);
    maximumTimestampErrorSeconds=Math.max(maximumTimestampErrorSeconds,error);
  });
  return {maximumTimestampErrorSeconds};
}
export function compareAudioPackets(original:Json[],delivered:Json[],label='Movie'):void {
  assert.equal(delivered.length,original.length,`${label} AAC packet count`);
  original.forEach((packet,index)=>assert.equal(canonical(delivered[index]),canonical(packet),`${label} AAC payload/PTS/DTS/duration/size/side data changed at packet ${index}`));
}
export function outputFrameCount(recording:Recording):number {
  assert.equal(recording.audio.sampleRate,44100);assert.equal(recording.audio.decodedSamples,7796160);
  assert.equal(recording.sourcePicture.frames,4419);assert.equal(recording.sourcePicture.frameRate.numerator,25);assert.equal(recording.sourcePicture.frameRate.denominator,1);
  return Number((BigInt(recording.audio.decodedSamples)*60n+44100n-1n)/44100n);
}
async function audioPackets(path:string,label:string):Promise<{rows:Json[];inventorySha256:string;payloadSequenceSha256:string}> {
  const data=await jsonCommand(['-v','error','-select_streams','a:0','-show_packets','-show_data_hash','sha256',
    '-show_entries','packet=pts,dts,duration,size,data_hash:packet_side_data','-of','json',path],label+' AAC packet inventory');
  const rows:Json[]=array(data.packets,'Missing audio packets').map(item=>({...object(item,'Invalid packet'),side_data_list:object(item,'Invalid packet').side_data_list??[]}));assert.ok(rows.length>0);
  for(const row of rows){assert.match(String(row.data_hash),/^SHA256:[a-f0-9]{64}$/u);for(const key of ['pts','dts','duration','size'])assert.ok(Number.isSafeInteger(Number(row[key])),`Missing packet ${key}`);}
  return {rows,inventorySha256:sha(canonical(rows)),payloadSequenceSha256:sha(rows.map(row=>row.data_hash).join('\n'))};
}
async function decodedAudio(path:string,recording:Recording,label:string):Promise<Json> {
  const hash=createHash('sha256');let bytes=0;
  await command('ffmpeg',['-hide_banner','-nostats','-v','error','-nostdin','-xerror','-err_detect','explode','-threads','2',
    '-i',path,'-map','0:a:0','-vn','-c:a','pcm_f32le','-f','f32le','pipe:1'],label+' decoded PCM hash and sample count',
    {collect:false,stdout:part=>{hash.update(part);bytes+=part.length;}});
  const bytesPerSample=recording.audio.channels*4;assert.equal(bytes%bytesPerSample,0,'Incomplete interleaved float32 sample');
  const samples=bytes/bytesPerSample;assert.equal(samples,recording.audio.decodedSamples,`${label} decoded sample count`);
  return {decodedPcmF32leSha256:hash.digest('hex'),decodedSamples:samples,decodedBytes:bytes,sampleRate:recording.audio.sampleRate,
    channels:recording.audio.channels,method:'Strict original-rate audio decode to interleaved little-endian float32; bytes are hashed and counted as they stream, without resampling.'};
}
async function strictDecodeAndBlack(path:string,label:string):Promise<BlackScan> {
  const intervals:BlackInterval[]=[];let lastBoundary:'start'|'end'|undefined,boundaryEvents=0;
  await command('ffmpeg',['-hide_banner','-nostats','-v','info','-nostdin','-xerror','-err_detect','explode','-threads','2',
    '-i',path,'-map','0:v:0','-map','0:a:0','-vf','blackdetect=d=0:pix_th=0.02:pic_th=0.98,metadata=mode=print','-f','null','-'],label+' strict complete decode and black-picture check',
    {collect:false,stderrLine:line=>{const match=/black_start:([\d.]+)\s+black_end:([\d.]+)\s+black_duration:[\d.]+/u.exec(line);
      if(match){const start=Number(match[1]),end=Number(match[2]);assert.ok(end>=start);intervals.push({start,end});}
      const boundary=/lavfi\.black_(start|end)=/u.exec(line);if(boundary){lastBoundary=boundary[1] as 'start'|'end';boundaryEvents++;}}});
  assert.ok(!intervals.length||boundaryEvents>0,'Black-frame boundary metadata is required');
  // EOF logging alone is ambiguous: black_end can be either the first nonblack
  // frame or a final black frame. Per-frame metadata resolves that distinction.
  return {intervals,finalPictureBlack:lastBoundary==='start',boundaryEvents};
}
export function compareBlack(sourceScan:BlackScan,outputScan:BlackScan,recording:Recording,frames:number):Json {
  const source=sourceScan.intervals,output=outputScan.intervals;
  const [a,b]=rate(`${recording.sourcePicture.frameRate.numerator}/${recording.sourcePicture.frameRate.denominator}`),sourceFps=a/b,tolerance=1/sourceFps+1/FPS;
  const permitted=source.map(interval=>({start:interval.start,end:interval.end,
    heldThroughOutputEnd:sourceScan.finalPictureBlack&&interval.end>=recording.sourcePicture.duration-1/sourceFps-0.000002,
    allowedEnd:sourceScan.finalPictureBlack&&interval.end>=recording.sourcePicture.duration-1/sourceFps-0.000002?frames/FPS:interval.end}));
  const unexpected=output.filter(interval=>!permitted.some(original=>interval.start>=original.start-tolerance-0.000002&&interval.end<=original.allowedEnd+tolerance+0.000002));
  assert.deepEqual(unexpected,[],'New black-picture interval not present in the authored source');
  return {sourceIntervals:source,renderedIntervals:output,unexpectedIntervals:unexpected,sourceEquivalent:true,
    boundaryToleranceSeconds:tolerance,permittedSourceIntervals:permitted,sourceFinalPictureBlack:sourceScan.finalPictureBlack,
    outputFinalPictureBlack:outputScan.finalPictureBlack,sourceBoundaryEvents:sourceScan.boundaryEvents,outputBoundaryEvents:outputScan.boundaryEvents,
    method:'FFmpeg blackdetect at zero minimum duration, 2% luma threshold and 98% picture coverage. Each delivered black interval must lie within an authored source interval, allowing one native25fps plus one output60fps boundary. A source interval may extend through the required final-picture hold only when its per-frame lavfi.black_start/end metadata proves the final source picture itself is black; there is no generic ending exemption.'};
}
export function comparePicturePresence(original:number[],delivered:number[],frames:number):Json {
  assert.equal(original.length,4419,'Original protected-profile ROI frame count');
  assert.equal(delivered.length,frames,'Delivered protected-profile ROI frame count');
  let maximumMeanLumaError=0;
  delivered.forEach((value,n)=>{
    const source=original[Math.min(4418,Number(BigInt(n)*25n/60n))]!;
    assert.ok(Number.isFinite(value)&&Number.isFinite(source),'Invalid ROI luma');
    const error=Math.abs(value-source);maximumMeanLumaError=Math.max(maximumMeanLumaError,error);
    assert.ok(error<=8,`Missing or shifted protected source picture at output frame ${n}: ROI luma delta ${error}`);
  });
  return {allFramesChecked:true,frames,maximumMeanLumaError,
    sourceRoi:SOURCE_ROI,portraitSourceOffsetY:PORTRAIT_SOURCE_OFFSET,maximumPermittedMeanLumaError:8,
    method:'Every decoded output frame retains the original central shadow-profile and surrounding paper ROI, independently matched to min(4418,floor(n×25/60)). This protected ROI is outside approved lyric strip and house-window masks. A fixed 8-code limited-luma tolerance permits lossy RGB/YUV conversion; blank or displaced pictures fail even when white lyrics defeat whole-picture blackdetect. Full-scene pixel parity is checked separately.'};
}
async function picturePresence(path:string,format:Format|'source',frames:number):Promise<number[]> {
  const y=SOURCE_ROI.y+(format==='portrait'?PORTRAIT_SOURCE_OFFSET:0),rows:number[]=[];
  await command('ffmpeg',['-hide_banner','-nostats','-v','info','-nostdin','-threads','2','-xerror','-err_detect','explode','-i',path,
    '-map','0:v:0','-an','-vf',`crop=${SOURCE_ROI.width}:${SOURCE_ROI.height}:${SOURCE_ROI.x}:${y},signalstats,metadata=mode=print:key=lavfi.signalstats.YAVG`,'-f','null','-'],format+' all-frame protected-picture presence',
    {collect:false,stderrLine:line=>{const match=/lavfi\.signalstats\.YAVG=([\d.]+)/u.exec(line);if(match)rows.push(Number(match[1]));}});
  assert.equal(rows.length,frames,`${format} protected-picture ROI count`);return rows;
}
export async function fastStart(path:string):Promise<Json> {
  const bytes=(await stat(path)).size,handle=await open(path,'r'),atoms:{type:string;offset:number;size:number}[]=[];let position=0;
  try{
    while(position<bytes){
      assert.ok(position+8<=bytes,'Truncated MP4 atom header');const header=Buffer.alloc(16);
      const result=await handle.read(header,0,Math.min(16,bytes-position),position);assert.ok(result.bytesRead>=8);
      let size=header.readUInt32BE(0),minimum=8;const type=header.toString('ascii',4,8);
      if(size===1){assert.equal(result.bytesRead,16);const wide=header.readBigUInt64BE(8);assert.ok(wide<=BigInt(Number.MAX_SAFE_INTEGER));size=Number(wide);minimum=16;}
      if(size===0)size=bytes-position;
      assert.ok(size>=minimum&&position+size<=bytes,`Invalid MP4 atom ${type}`);atoms.push({type,offset:position,size});position+=size;
    }
  }finally{await handle.close();}
  assert.equal(position,bytes);const moov=atoms.filter(atom=>atom.type==='moov'),mdat=atoms.filter(atom=>atom.type==='mdat');
  assert.equal(moov.length,1);assert.ok(mdat.length>0);assert.ok(moov[0]!.offset<mdat[0]!.offset,'MP4 moov must precede media data for fast start');
  return {fastStart:true,bytes,atoms};
}

async function main():Promise<void>{
  const args=process.argv.slice(2);
  if(args.includes('--help')){console.log('Usage: node scripts/verify-final.ts [--landscape FILE] [--portrait FILE]');return;}
  process.chdir(root);checkCurrentProductionGate();
  const identitySnapshot=snapshot<Identity>('evidence/preview-inputs.json'),identity=identitySnapshot.data;
  const approvalSnapshot=snapshot<Json>('evidence/review-status.json');
  const recording=read<Recording>('source/recording.json');
  assert.equal(recording.sourceSha256,SOURCE_SHA256);assert.equal(identity.sourceSha256,SOURCE_SHA256);
  await verifyApprovedInputs(identity);
  const frames=outputFrameCount(recording),rendererSha256=await fileHash(resolve(root,'scripts/render-production.ts'));
  const verifierSha256=await fileHash(fileURLToPath(import.meta.url));
  const source=resolve(root,'public/source.mp4');assert.equal(await fileHash(source),SOURCE_SHA256);
  const sourceProbe=await probe(source,'Original metadata');sourceMetadata(sourceProbe,recording);
  const originalPackets=await audioPackets(source,'Original'),originalAudio=await decodedAudio(source,recording,'Original');
  const sourceBlack=await strictDecodeAndBlack(source,'Original');
  const originalPresence=await picturePresence(source,'source',recording.sourcePicture.frames);
  const option=(key:string)=>{const at=args.indexOf(key);return at<0?undefined:args[at+1];};
  const formats:Record<string,unknown>={};
  for(const format of ['landscape','portrait'] as Format[]){
    const filename=`Svetloe-Chuvstvo-Settlers-${format==='landscape'?'YouTube-1080x1080':'TikTok-1080x1920'}-60fps.mp4`;
    const path=resolve(root,option(`--${format}`)??`renders/${filename}`);
    assert.ok(existsSync(path),`Missing complete ${format} film`);
    const file=basename(path),receiptPath=`${path}.json`;
    assert.ok(existsSync(receiptPath),'Missing production receipt');
    const receipt=JSON.parse(readFileSync(receiptPath,'utf8')) as Json;
    const hash=await fileHash(path);
    assert.equal(receipt.sha256,hash,'Film differs from production receipt');
    assert.equal(receipt.rendererSha256,rendererSha256,'Renderer changed after production');
    assert.equal(receipt.revision,identity.revision);assert.equal(receipt.sourceSha256,identity.sourceSha256);
    assert.equal(canonical(receipt.approvedInputHashes),canonical(identity.inputs),'Render input identity changed');
    assert.equal(receipt.identitySha256,identitySnapshot.sha256);assert.equal(receipt.approvalSha256,approvalSnapshot.sha256);
    const outputProbe=await probe(path,format+' metadata');
    const metadata=outputMetadata(outputProbe,format,recording,frames,sourceProbe);
    const timestamps=await allTimestamps(path,frames,stream(outputProbe,'video').time_base,format);
    const packets=await audioPackets(path,format);compareAudioPackets(originalPackets.rows,packets.rows,format);
    const audio=await decodedAudio(path,recording,format);assert.equal(audio.decodedPcmF32leSha256,originalAudio.decodedPcmF32leSha256,`${format} original PCM changed`);
    const black=compareBlack(sourceBlack,await strictDecodeAndBlack(path,format),recording,frames);
    const presence=comparePicturePresence(originalPresence,await picturePresence(path,format,frames),frames);
    formats[format]={file,bytes:(await stat(path)).size,sha256:hash,metadata,timestamps,
      originalAac:{packetCount:packets.rows.length,packetInventorySha256:packets.inventorySha256,payloadSequenceSha256:packets.payloadSequenceSha256,exactPayloadAndClockMatch:true},
      decodedAudio:audio,blackPictures:black,protectedSourcePicture:presence,mp4:await fastStart(path),
      productionReceipt:{file:basename(receiptPath),sha256:await fileHash(receiptPath)}};
  }
  checkCurrentProductionGate();await verifyApprovedInputs(identity);
  assert.equal(await fileHash(resolve(root,'evidence/preview-inputs.json')),identitySnapshot.sha256);
  assert.equal(await fileHash(resolve(root,'evidence/review-status.json')),approvalSnapshot.sha256);
  assert.equal(await fileHash(resolve(root,'scripts/render-production.ts')),rendererSha256);
  assert.equal(await fileHash(fileURLToPath(import.meta.url)),verifierSha256);
  const result={schemaVersion:1,status:'passed',checkedAt:new Date().toISOString(),revision:identity.revision,
    sourceSha256:identity.sourceSha256,approvedInputHashes:identity.inputs,rendererSha256,verifierSha256,
    previewInputsSha256:identitySnapshot.sha256,approvalSha256:approvalSnapshot.sha256,
    scope:'Both complete encoded files independently decoded; every frame PTS and protected source-picture ROI checked, original AAC packets/priming and float32 PCM matched. Full-scene pixel comparisons are a separate report.',
    source:{videoFrames:recording.sourcePicture.frames,decodedAudio:originalAudio,
      originalAacPackets:originalPackets.rows.length,packetInventorySha256:originalPackets.inventorySha256,blackScan:sourceBlack},formats};
  const destination=resolve(root,'evidence/production-verification.json');mkdirSync(dirname(destination),{recursive:true});
  writeFileSync(destination,JSON.stringify(result,null,2)+'\n');
  console.log(JSON.stringify({status:'passed',revision:identity.revision,framesPerFilm:frames,sourceAacPackets:originalPackets.rows.length,report:relative(root,destination)}));
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url))main().catch(error=>{console.error(error instanceof Error?clean(error.message):String(error));process.exitCode=1;});
