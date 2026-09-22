import {spawnSync} from 'node:child_process';
import {readFileSync,writeFileSync,statSync,openSync,readSync,closeSync,createReadStream,mkdirSync} from 'node:fs';
import {basename} from 'node:path';
import {createHash} from 'node:crypto';
import {assertProductionGate} from './production-gate.ts';
import {parseData,array,object} from '../src/schema.ts';

// This verifier reads decoded delivery media independently of capture/render code.
const output=process.argv[2],format=process.argv[3];
if(!output||(format!=='landscape'&&format!=='portrait'))throw Error('Usage: node scripts/verify-production.ts <delivery.mp4> landscape|portrait');
const run=(bin:string,args:string[])=>{const r=spawnSync(bin,args,{encoding:'utf8',maxBuffer:64*1024*1024});if(r.error)throw r.error;if(r.status!==0)throw Error(bin+' failed: '+r.stderr);return r.stdout;};
function requireCheck(value:unknown,message:string):asserts value{if(!value)throw Error(message);}
const sha256=async(path:string)=>{const hash=createHash('sha256');for await(const part of createReadStream(path))hash.update(part);return hash.digest('hex');};
const packets=(path:string)=>array(object(JSON.parse(run('ffprobe',['-v','error','-select_streams','a:0','-show_packets','-show_data_hash','sha256','-show_entries','packet=pts,dts,duration,size,data_hash:packet_side_data=side_data_type,skip_samples,discard_padding,skip_reason,discard_reason','-of','json',path]))).packets).map(object);
function atoms(path:string){
 const size=statSync(path).size,fd=openSync(path,'r'),out:{type:string;offset:number;size:number}[]=[];let at=0;
 try{while(at<size){const header=Buffer.alloc(16),n=readSync(fd,header,0,Math.min(16,size-at),at);requireCheck(n>=8,'Truncated MP4 atom header');let bytes=header.readUInt32BE(0);const type=header.toString('ascii',4,8);if(bytes===1){requireCheck(n>=16,'Truncated 64-bit MP4 atom');const big=header.readBigUInt64BE(8);requireCheck(big<=BigInt(Number.MAX_SAFE_INTEGER),'MP4 atom exceeds safe range');bytes=Number(big);}else if(bytes===0)bytes=size-at;requireCheck(bytes>=8&&at+bytes<=size,'Invalid MP4 atom extent');out.push({type,offset:at,size:bytes});at+=bytes;}}finally{closeSync(fd);}return out;
}
const reportPath=`evidence/production/${format}-verification.json`;
const safeHash=(path:string)=>{try{return createHash('sha256').update(readFileSync(path)).digest('hex');}catch{return null;}};
const inputIdentitySha256=safeHash('evidence/preview-identity.json'),verifierSha256=safeHash('scripts/verify-production.ts');
function markFailure(stage:string,error?:unknown){mkdirSync('evidence/production',{recursive:true});writeFileSync(reportPath,JSON.stringify({status:'FAIL',stage,inputFile:basename(output!),format,inputIdentitySha256,verifierSha256,...(error?{error:String(error).replaceAll(process.cwd(),'<project>').replaceAll(output!,basename(output!))}:{})},null,2)+'\n');}
async function main(){
 assertProductionGate();
 const data=parseData(JSON.parse(readFileSync('src/cues.json','utf8'))),media=object(JSON.parse(readFileSync('source/media-manifest.json','utf8'))),source=object(media.audio);
 requireCheck(data.frames===11245&&data.fps===60&&data.sampleRate===44100&&data.sampleCount===8265152,'Frozen Lyubi timeline contract changed');
 requireCheck(source.packets===8073&&source.decodedSampleCount===data.sampleCount&&source.sha256===data.audioSha256,'Source manifest disagrees with frozen cue clock');
 requireCheck(await sha256('public/soundtrack.m4a')===data.audioSha256,'Source AAC identity changed');
 const probe=object(JSON.parse(run('ffprobe',['-v','error','-threads','4','-count_frames','-show_streams','-show_format','-show_frames','-show_entries','frame=best_effort_timestamp,best_effort_timestamp_time,media_type,nb_samples','-of','json',output!])));
 const streams=array(probe.streams).map(object),video=streams.find(s=>s.codec_type==='video'),audio=streams.find(s=>s.codec_type==='audio');
 requireCheck(streams.length===2&&video&&audio,'Expected exactly one video and one audio stream');
 requireCheck(video.codec_name==='h264'&&video.codec_tag_string==='avc1'&&video.pix_fmt==='yuv420p','Video codec/pixel format contract failed (H.264/avc1/yuv420p)');
 requireCheck(video.width===(format==='portrait'?1080:1920)&&video.height===(format==='portrait'?1920:1080),'Delivery dimensions do not match requested format');
 requireCheck(video.r_frame_rate==='60/1'&&video.avg_frame_rate==='60/1'&&Number(video.nb_read_frames)===11245,'Video cadence/frame-count contract failed');
 requireCheck(video.sample_aspect_ratio==='1:1'&&video.color_range==='tv','Square-pixel or limited-range contract failed');
 for(const key of ['color_space','color_transfer','color_primaries'])requireCheck(video[key]==='bt709','Missing or incorrect BT.709 '+key);
 requireCheck(Number(video.start_time)===0,'Video does not start at timeline zero');
 requireCheck(audio.codec_name==='aac'&&audio.sample_rate==='44100'&&audio.channels===2&&audio.time_base==='1/44100','Original AAC format/clock changed');
 requireCheck(Number(audio.start_time)===0,'Presented AAC does not start at timeline zero');
 const frames=array(probe.frames).map(object),videoFrames=frames.filter(f=>f.media_type==='video');
 requireCheck(videoFrames.length===11245,'Decoded video frame inventory mismatch');
 let maximumTimestampErrorSeconds=0;
 videoFrames.forEach((frame,index)=>{const t=Number(frame.best_effort_timestamp_time);requireCheck(Number.isFinite(t),'Missing frame presentation timestamp');const error=Math.abs(t-index/60);maximumTimestampErrorSeconds=Math.max(maximumTimestampErrorSeconds,error);requireCheck(error<=.000002,'Nonconstant or shifted video PTS at frame '+index);});
 const decodedSamples=frames.filter(f=>f.media_type==='audio').reduce((sum,f)=>sum+Number(f.nb_samples),0);
 requireCheck(decodedSamples===data.sampleCount,'Decoded AAC sample count changed: '+decodedSamples);
 const originalPackets=packets('public/soundtrack.m4a'),deliveredPackets=packets(output!);
 requireCheck(originalPackets.length===8073&&deliveredPackets.length===8073,'AAC packet inventory is not 8073');
 for(let i=0;i<originalPackets.length;i++)requireCheck(JSON.stringify(originalPackets[i])===JSON.stringify(deliveredPackets[i]),'AAC packet payload, timing, size or priming/discard side data changed at packet '+i);
 const decodedPcmSha256=run('ffmpeg',['-v','error','-threads','4','-i',output!,'-map','0:a:0','-ac','2','-ar','44100','-c:a','pcm_f32le','-f','hash','-hash','sha256','-']).trim().replace(/^SHA256=/,'');
 requireCheck(decodedPcmSha256===source.decodedPcmSha256,'Decoded original PCM identity changed');
 const inventory=atoms(output!),moov=inventory.find(a=>a.type==='moov'),mdat=inventory.find(a=>a.type==='mdat');
 requireCheck(moov&&mdat&&moov.offset<mdat.offset,'MP4 faststart absent: moov must precede mdat');
 run('ffmpeg',['-v','error','-xerror','-err_detect','explode','-threads','4','-i',output!,'-map','0:v:0','-map','0:a:0','-f','null','-']);
 const identity=object(JSON.parse(readFileSync('evidence/preview-identity.json','utf8')));
 const report={status:'PASS',inputIdentitySha256,verifierSha256,revision:identity.revision,inputFile:basename(output!),format,width:video.width,height:video.height,fps:data.fps,bytes:statSync(output!).size,sha256:await sha256(output!),video,audio,container:{...object(probe.format),filename:basename(output!)},frames:videoFrames.length,allFrameTimestamps:true,maximumTimestampErrorSeconds,aacPackets:originalPackets.length,audioIdentity:'All packet payload hashes, PTS, DTS, durations, sizes, skip samples and discard padding identical to original soundtrack',firstAacPacket:deliveredPackets[0],decodedSamples,decodedPcmSha256,strictFullDecode:true,fastStart:true,atoms:inventory,scope:'Container, complete decode, frame clock and audio identity. Does not establish visual composition quality or acoustic lyric accuracy.'};
 mkdirSync('evidence/production',{recursive:true});writeFileSync(reportPath,JSON.stringify(report,null,2)+'\n');console.log({status:report.status,format,frames:videoFrames.length,aacPackets:originalPackets.length,decodedSamples,sha256:report.sha256});
}
markFailure('verification started');
try{await main();}catch(error){markFailure('verification failed',error);throw error;}
