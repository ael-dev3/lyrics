import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {createHash} from 'node:crypto';
import {createReadStream, existsSync, mkdirSync, readFileSync, renameSync, writeFileSync} from 'node:fs';
import {open, stat} from 'node:fs/promises';
import {basename, dirname, isAbsolute, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {enforceProductionGate, type Identity, type Review, type Approval} from './render-gate.ts';

// Read-only checks operate on completed encoded files. No scene painter, capture
// command, renderer receipt, or in-memory production pixels are used as proof.
const root=resolve(fileURLToPath(new URL('..',import.meta.url)));
const FPS=60;
type Format='landscape'|'portrait';
type Json=Record<string,unknown>;
type BlackInterval={start:number;end:number};
type BlackScan={intervals:BlackInterval[];finalPictureBlack:boolean;boundaryEvents:number;};
interface Manifest {
  project:string;sha256:string;
  video:{width:number;height:number;frameRate:string;frameCount:number;durationSeconds:number;startSeconds:number;sampleAspectRatio:string};
  audio:{sampleRate:number;channels:number;startSeconds:number;decodedSamples:number;decodedDurationSeconds:number};
}
interface CommandOptions {limit?:number;collect?:boolean;stdout?:(bytes:Buffer)=>void;stderrLine?:(line:string)=>void;}
const option=(name:string):string|undefined=>{const at=process.argv.indexOf(name);return at<0?undefined:process.argv[at+1];};
const read=<T>(path:string):T=>JSON.parse(readFileSync(resolve(root,path),'utf8')) as T;
const sha=(bytes:Uint8Array|string):string=>createHash('sha256').update(bytes).digest('hex');
const snapshot=<T>(path:string):{data:T;sha256:string}=>{const bytes=readFileSync(resolve(root,path));return {data:JSON.parse(bytes.toString('utf8')) as T,sha256:sha(bytes)};};
const clean=(value:string):string=>value.replaceAll(root,'<project>').replaceAll(dirname(root),'<checkout>');
const phase=(label:string,extra:Json={}):void=>console.log(JSON.stringify({phase:label,...extra}));
function object(value:unknown,label:string):Json {assert.ok(value&&typeof value==='object'&&!Array.isArray(value),label);return value as Json;}
function array(value:unknown,label:string):unknown[] {assert.ok(Array.isArray(value),label);return value;}
function canonical(value:unknown):string {
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
function sourceMetadata(data:Json,manifest:Manifest):void {
  assert.equal(array(data.streams,'Streams').length,2);
  const v=stream(data,'video'),a=stream(data,'audio');
  assert.equal(v.width,manifest.video.width);assert.equal(v.height,manifest.video.height);
  assert.equal(v.r_frame_rate,manifest.video.frameRate);assert.equal(v.avg_frame_rate,manifest.video.frameRate);
  assert.equal(Number(v.nb_frames),manifest.video.frameCount);assert.equal(v.sample_aspect_ratio,manifest.video.sampleAspectRatio);
  equalNumber(v.start_time,manifest.video.startSeconds,'Source video start');equalNumber(v.duration,manifest.video.durationSeconds,'Source video duration');
  assert.equal(a.codec_name,'aac');assert.equal(Number(a.sample_rate),manifest.audio.sampleRate);assert.equal(a.channels,manifest.audio.channels);
  assert.equal(a.time_base,`1/${manifest.audio.sampleRate}`);equalNumber(a.start_time,manifest.audio.startSeconds,'Source audio start');
  assert.equal(Number(a.duration_ts),manifest.audio.decodedSamples);equalNumber(a.duration,manifest.audio.decodedDurationSeconds,'Source audio duration');
}
function outputMetadata(data:Json,format:Format,manifest:Manifest,frames:number,sourceProbe:Json):Json {
  assert.equal(array(data.streams,'Streams').length,2);
  const v=stream(data,'video'),a=stream(data,'audio'),original=stream(sourceProbe,'audio');
  const width=format==='landscape'?manifest.video.width:1080,height=format==='landscape'?manifest.video.height:1920;
  assert.equal(v.codec_name,'h264');assert.equal(v.width,width);assert.equal(v.height,height);
  assert.equal(v.r_frame_rate,'60/1');assert.equal(v.avg_frame_rate,'60/1');assert.equal(Number(v.nb_frames),frames);
  assert.equal(v.pix_fmt,'yuv420p');assert.equal(v.sample_aspect_ratio,'1:1');assert.equal(v.color_range,'tv');
  for(const key of ['color_primaries','color_transfer','color_space'])assert.equal(v[key],'bt709',`${format} ${key}`);
  equalNumber(v.start_time,0,`${format} video start`);equalNumber(v.duration,frames/FPS,`${format} video duration`);
  for(const key of ['codec_name','sample_rate','channels','time_base','start_pts','start_time','duration_ts','duration'])assert.equal(a[key],original[key],`${format} audio ${key}`);
  const container=object(data.format,'Missing container');equalNumber(container.duration,frames/FPS,`${format} container duration`);
  return {width,height,frames,framesPerSecond:FPS,videoDurationSeconds:Number(v.duration),audioDurationSeconds:Number(a.duration),
    videoCodec:v.codec_name,audioCodec:a.codec_name,pixelFormat:v.pix_fmt,colorRange:v.color_range,colorSpace:v.color_space,
    colorPrimaries:v.color_primaries,colorTransfer:v.color_transfer,timeBase:v.time_base,sampleAspectRatio:v.sample_aspect_ratio};
}
async function allTimestamps(path:string,frames:number,timeBase:unknown,label:string):Promise<Json> {
  const data=await jsonCommand(['-v','error','-threads','2','-select_streams','v:0','-show_frames',
    '-show_entries','frame=best_effort_timestamp,best_effort_timestamp_time','-of','json',path],label+' decoded frame timestamps');
  const rows=array(data.frames,'Missing decoded frames');assert.equal(rows.length,frames,`${label} decoded frame count`);
  const [numerator,denominator]=rate(timeBase);let maximumTimestampErrorSeconds=0;
  rows.forEach((item,n)=>{
    const row=object(item,'Invalid frame'),pts=Number(row.best_effort_timestamp);
    assert.ok(Number.isSafeInteger(pts),`${label} frame ${n}: missing integer PTS`);
    assert.equal(pts*numerator*FPS,n*denominator,`${label} frame ${n}: non-CFR PTS`);
    const error=Math.abs(Number(row.best_effort_timestamp_time)-n/FPS);
    assert.ok(Number.isFinite(error)&&error<=0.000002,`${label} frame ${n}: timestamp disagreement`);
    maximumTimestampErrorSeconds=Math.max(maximumTimestampErrorSeconds,error);
  });
  return {decodedFrames:rows.length,allFrameTimestamps:true,maximumTimestampErrorSeconds,
    method:'Every decoded frame has an integer best-effort PTS exactly equal to n/60 in the stream time base; printed seconds agree within 2 microseconds.'};
}
async function audioPackets(path:string,label:string):Promise<{rows:Json[];inventorySha256:string;payloadSequenceSha256:string}> {
  const data=await jsonCommand(['-v','error','-select_streams','a:0','-show_packets','-show_data_hash','sha256',
    '-show_entries','packet=pts,dts,duration,size,data_hash:packet_side_data','-of','json',path],label+' original AAC packet inventory');
  const rows=array(data.packets,'Missing audio packets').map(item=>object(item,'Invalid packet'));assert.ok(rows.length>0);
  for(const row of rows){assert.match(String(row.data_hash),/^SHA256:[a-f0-9]{64}$/u);for(const key of ['pts','dts','duration','size'])assert.ok(Number.isSafeInteger(Number(row[key])),`Missing packet ${key}`);}
  return {rows,inventorySha256:sha(canonical(rows)),payloadSequenceSha256:sha(rows.map(row=>row.data_hash).join('\n'))};
}
async function decodedAudio(path:string,manifest:Manifest,label:string):Promise<Json> {
  const hash=createHash('sha256');let bytes=0;
  await command('ffmpeg',['-hide_banner','-nostats','-v','error','-nostdin','-xerror','-err_detect','explode','-threads','2',
    '-i',path,'-map','0:a:0','-vn','-c:a','pcm_f32le','-f','f32le','pipe:1'],label+' decoded PCM hash and sample count',
    {collect:false,stdout:part=>{hash.update(part);bytes+=part.length;}});
  const bytesPerSample=manifest.audio.channels*4;assert.equal(bytes%bytesPerSample,0,'Incomplete interleaved float32 sample');
  const samples=bytes/bytesPerSample;assert.equal(samples,manifest.audio.decodedSamples,`${label} decoded sample count`);
  return {decodedPcmF32leSha256:hash.digest('hex'),decodedSamples:samples,decodedBytes:bytes,sampleRate:manifest.audio.sampleRate,
    channels:manifest.audio.channels,method:'Strict original-rate audio decode to interleaved little-endian float32; bytes are hashed and counted as they stream, without resampling.'};
}
async function strictDecodeAndBlack(path:string,label:string):Promise<BlackScan> {
  const intervals:BlackInterval[]=[];let lastBoundary:'start'|'end'|undefined,boundaryEvents=0;
  await command('ffmpeg',['-hide_banner','-nostats','-v','info','-nostdin','-xerror','-err_detect','explode','-threads','2',
    '-i',path,'-map','0:v:0','-map','0:a:0','-vf','blackdetect=d=0:pix_th=0.02:pic_th=0.98,metadata=mode=print','-f','null','-'],label+' strict complete decode and source-black check',
    {collect:false,stderrLine:line=>{const match=/black_start:([\d.]+)\s+black_end:([\d.]+)\s+black_duration:[\d.]+/u.exec(line);
      if(match){const start=Number(match[1]),end=Number(match[2]);assert.ok(end>=start);intervals.push({start,end});}
      const boundary=/lavfi\.black_(start|end)=/u.exec(line);if(boundary){lastBoundary=boundary[1] as 'start'|'end';boundaryEvents++;}}});
  assert.ok(!intervals.length||boundaryEvents>0,'Black-frame boundary metadata is required');
  // EOF logging alone is ambiguous: black_end can be either the first nonblack
  // frame or a final black frame. Per-frame metadata resolves that distinction.
  return {intervals,finalPictureBlack:lastBoundary==='start',boundaryEvents};
}
function compareBlack(sourceScan:BlackScan,outputScan:BlackScan,manifest:Manifest,frames:number):Json {
  const source=sourceScan.intervals,output=outputScan.intervals;
  const [a,b]=rate(manifest.video.frameRate),sourceFps=a/b,tolerance=1/sourceFps+1/FPS;
  const permitted=source.map(interval=>({start:interval.start,end:interval.end,
    heldThroughOutputEnd:sourceScan.finalPictureBlack&&interval.end>=manifest.video.durationSeconds-1/sourceFps-0.000002,
    allowedEnd:sourceScan.finalPictureBlack&&interval.end>=manifest.video.durationSeconds-1/sourceFps-0.000002?frames/FPS:interval.end}));
  const unexpected=output.filter(interval=>!permitted.some(original=>interval.start>=original.start-tolerance-0.000002&&interval.end<=original.allowedEnd+tolerance+0.000002));
  assert.deepEqual(unexpected,[],'New black-picture interval not present in the authored source');
  return {sourceIntervals:source,renderedIntervals:output,unexpectedIntervals:unexpected,sourceEquivalent:true,
    boundaryToleranceSeconds:tolerance,permittedSourceIntervals:permitted,sourceFinalPictureBlack:sourceScan.finalPictureBlack,
    outputFinalPictureBlack:outputScan.finalPictureBlack,sourceBoundaryEvents:sourceScan.boundaryEvents,outputBoundaryEvents:outputScan.boundaryEvents,
    method:'FFmpeg blackdetect at zero minimum duration, 2% luma threshold and 98% picture coverage. Each delivered black interval must lie within an authored source interval, allowing one native25fps plus one output60fps boundary. A source interval may extend through the required final-picture hold only when its per-frame lavfi.black_start/end metadata proves the final source picture itself is black; there is no generic ending exemption.'};
}
async function fastStart(path:string):Promise<Json> {
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
async function main():Promise<void> {
  if(process.argv.includes('--help')){console.log('Usage: node scripts/verify-final.ts [--landscape PATH] [--portrait PATH] [--report PATH]\nOnly completed final MP4s are accepted. Both formats are required for status passed; a single-format report is explicitly partial. --self-test performs pure black-tail boundary checks without media operations.');return;}
  if(process.argv.includes('--self-test')){
    const manifest=read<Manifest>('source/manifest.json'),frames=Math.ceil(manifest.audio.decodedDurationSeconds*FPS);
    const ending={intervals:[{start:259,end:260}],finalPictureBlack:false,boundaryEvents:2};
    const blackTail={intervals:[{start:259,end:(frames-1)/FPS}],finalPictureBlack:true,boundaryEvents:1};
    assert.throws(()=>compareBlack(ending,blackTail,manifest,frames),/New black-picture interval/u,
      'A black penultimate source picture followed by a nonblack final picture cannot authorize a black audio-tail hold');
    const authoredBlack={...ending,finalPictureBlack:true,boundaryEvents:1};
    assert.equal(compareBlack(authoredBlack,blackTail,manifest,frames).sourceEquivalent,true,
      'An authored black final picture may remain held through the original audio tail');
    assert.throws(()=>compareBlack({intervals:[],finalPictureBlack:false,boundaryEvents:0},blackTail,manifest,frames),/New black-picture interval/u,
      'There is no unconditional ending exemption');
    console.log(JSON.stringify({status:'passed',checks:3,method:'Pure boundary fixtures; no capture, encoding, decoding or output creation'}));return;
  }
  const files:{format:Format;path:string}[]=[];
  for(const format of ['landscape','portrait'] as const){const path=option('--'+format);if(path){const full=resolve(path);assert.ok(!basename(full).includes('.partial.'),'Partial exports must not be decoded');assert.ok(existsSync(full),`Missing completed ${format} file`);files.push({format,path:full});}}
  assert.ok(files.length>0,'Pass --landscape and/or --portrait');
  const current=snapshot<Identity>('evidence/preview-inputs.json'),sourceManifest=snapshot<Manifest>('source/manifest.json'),
    review=snapshot<Review>('evidence/sync-review.json'),approval=snapshot<Approval>('evidence/production-authorization.json');
  const identity=current.data,identityText=canonical(identity),manifest=sourceManifest.data;
  enforceProductionGate(identity,review.data,approval.data);
  phase('Verifying current approved input identity');await verifyApprovedInputs(identity);
  assert.equal(identity.project,manifest.project);assert.equal(identity.inputs['public/source.mp4'],manifest.sha256);
  const frames=Math.ceil(manifest.audio.decodedDurationSeconds*FPS);assert.equal(frames,15606);assert.equal(manifest.video.frameCount,6501);assert.equal(manifest.video.frameRate,'25/1');
  const source=resolve(root,'public/source.mp4'),renderer=resolve(root,'scripts/render-production.ts'),verifier=fileURLToPath(import.meta.url);
  const frozen={rendererSha256:await fileHash(renderer),verifierSha256:await fileHash(verifier),manifestSha256:sourceManifest.sha256,
    previewIdentitySha256:current.sha256,syncReviewSha256:review.sha256,productionAuthorizationSha256:approval.sha256};
  const sourceProbe=await probe(source,'Source stream metadata');sourceMetadata(sourceProbe,manifest);
  const packets=await audioPackets(source,'Source'),pcm=await decodedAudio(source,manifest,'Source'),sourceBlack=await strictDecodeAndBlack(source,'Source');
  const formats:Partial<Record<Format,Json>>={};
  for(const {format,path} of files){
    const before=await fileHash(path),data=await probe(path,format+' stream metadata'),metadata=outputMetadata(data,format,manifest,frames,sourceProbe);
    const renderReceiptPath=path+'.json';assert.ok(existsSync(renderReceiptPath),`${format} completed production receipt is required`);
    const renderReceipt=object(JSON.parse(readFileSync(renderReceiptPath,'utf8')),'Invalid production receipt'),renderReceiptSha256=await fileHash(renderReceiptPath);
    assert.equal(renderReceipt.schema,'komety/production-render/v1');assert.equal(renderReceipt.file,basename(path));assert.equal(renderReceipt.format,format);
    assert.equal(renderReceipt.sha256,before,`${format} production receipt does not identify this output`);
    assert.equal(renderReceipt.revision,identity.revision);assert.equal(renderReceipt.sourceSha256,manifest.sha256);
    assert.equal(renderReceipt.rendererSha256,frozen.rendererSha256,`${format} output belongs to a different renderer`);
    assert.equal(canonical(renderReceipt.approvedInputHashes),canonical(identity.inputs),`${format} output belongs to different approved inputs`);
    assert.equal(renderReceipt.outputFrames,frames);assert.equal(renderReceipt.outputFps,FPS);
    const timestamps=await allTimestamps(path,frames,stream(data,'video').time_base,format);
    const delivered=await audioPackets(path,format);assert.equal(delivered.rows.length,packets.rows.length,`${format} AAC packet count`);
    for(let index=0;index<packets.rows.length;index++)assert.equal(canonical(delivered.rows[index]),canonical(packets.rows[index]),`${format} AAC payload/PTS/DTS/duration/size/side data changed at packet ${index}`);
    const audio=await decodedAudio(path,manifest,format);assert.equal(audio.decodedPcmF32leSha256,pcm.decodedPcmF32leSha256,`${format} original decoded PCM identity`);
    const black=compareBlack(sourceBlack,await strictDecodeAndBlack(path,format),manifest,frames),container=await fastStart(path);
    assert.equal(await fileHash(path),before,`${format} file changed during verification`);
    assert.equal(await fileHash(renderReceiptPath),renderReceiptSha256,`${format} production receipt changed during verification`);
    formats[format]={file:basename(path),sha256:before,...metadata,metadata,timestamps,audio,
      productionProvenance:{receiptFile:basename(renderReceiptPath),receiptSha256:renderReceiptSha256,rendererSha256:frozen.rendererSha256,
        approvedRevisionAndInputsMatch:true,scope:'The production receipt binds provenance only; technical claims are independently checked on this encoded file.'},
      aacPackets:{count:delivered.rows.length,inventorySha256:delivered.inventorySha256,payloadSequenceSha256:delivered.payloadSequenceSha256,
        originalPayloadPtsDtsDurationSizeAndSideDataIdentical:true,method:'Every original AAC packet SHA256, PTS, DTS, duration, size and complete packet side-data inventory equals the corresponding final-file packet.'},
      strictFullDecode:true,blackPicture:black,...container};
    phase(format+' technical verification passed',{frames,file:basename(path)});
  }
  phase('Rechecking frozen approval and verification inputs');await verifyApprovedInputs(identity);
  assert.equal(canonical(read<Identity>('evidence/preview-inputs.json')),identityText,'Approved identity changed during verification');
  assert.equal(await fileHash(renderer),frozen.rendererSha256,'Renderer changed during verification');assert.equal(await fileHash(verifier),frozen.verifierSha256,'Verifier changed during verification');
  for(const [path,key] of [['source/manifest.json','manifestSha256'],['evidence/preview-inputs.json','previewIdentitySha256'],['evidence/sync-review.json','syncReviewSha256'],['evidence/production-authorization.json','productionAuthorizationSha256']] as const)assert.equal(await fileHash(resolve(root,path)),frozen[key],`${path} changed during verification`);
  const receipt={schema:'komety/final-verification/v1',status:files.length===2?'passed':'partial',revision:identity.revision,project:identity.project,
    verifiedAt:new Date().toISOString(),sourceSha256:manifest.sha256,...frozen,approvedInputHashes:identity.inputs,
    source:{file:'source.mp4',sha256:manifest.sha256,videoFrames:manifest.video.frameCount,videoFramesPerSecond:25,
      videoDurationSeconds:manifest.video.durationSeconds,audio:pcm,aacPacketCount:packets.rows.length,aacPacketInventorySha256:packets.inventorySha256,
      aacPayloadSequenceSha256:packets.payloadSequenceSha256,originalAudioTailSeconds:manifest.audio.decodedDurationSeconds-manifest.video.durationSeconds},
    outputContract:{frames,framesPerSecond:FPS,videoDurationSeconds:frames/FPS,finalPicturePolicy:'Hold the last authored picture through the original audio tail; finite60fps duration rounds up by less than one frame',
      videoRemainderAfterDecodedAudioSeconds:frames/FPS-manifest.audio.decodedDurationSeconds},formats,
    limits:['Technical verification does not establish transcription, translation quality or acoustic word ownership.','Blackdetect checks new near-black intervals, not complete source-picture or glyph parity. Separate decoded scene and bilingual focus audits are required.','Final films still require inspection with sound in both formats.']};
  const report=resolve(option('--report')??resolve(root,files.length===2?'evidence/final-verification.json':`evidence/final-verification-${files[0]!.format}.json`));
  mkdirSync(dirname(report),{recursive:true});const temporary=report+'.tmp';writeFileSync(temporary,JSON.stringify(receipt,null,2)+'\n');renameSync(temporary,report);
  console.log(JSON.stringify({status:receipt.status,revision:identity.revision,report:basename(report),formats:Object.keys(formats)}));
}
main().catch(error=>{console.error(clean(error instanceof Error?error.stack??error.message:String(error)));process.exitCode=1;});
