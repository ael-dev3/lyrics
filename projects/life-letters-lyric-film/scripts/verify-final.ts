import {spawnSync} from 'node:child_process';
import {readFileSync,writeFileSync,statSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {FPS,FRAMES,WIDTH,HEIGHT} from '../src/config.ts';
const file='output/LIFE-LETTERS-RU-ES-AR-LANDSCAPE.mp4';
function call(program:string,args:string[],maxBuffer=24*1024*1024){const r=spawnSync(program,args,{encoding:'utf8',maxBuffer});if(r.status!==0)throw Error(program+': '+r.stderr);return r.stdout;}
const probe=JSON.parse(call('ffprobe',['-v','error','-show_streams','-show_format','-of','json',file]));
const video=probe.streams.find((s:{codec_type:string})=>s.codec_type==='video'),audio=probe.streams.find((s:{codec_type:string})=>s.codec_type==='audio');
if(video.width!==WIDTH||video.height!==HEIGHT||video.r_frame_rate!==`${FPS}/1`||Number(video.nb_frames)!==FRAMES||video.pix_fmt!=='yuv420p'||video.color_space!=='bt709'||video.color_primaries!=='bt709'||video.color_transfer!=='bt709'||audio.sample_rate!=='48000')throw Error('Delivery specification mismatch');
const lockedAudio=JSON.parse(call('ffprobe',['-v','error','-select_streams','a:0','-show_entries','stream=start_time,time_base,duration_ts','-of','json','public/soundtrack.m4a'])).streams[0];
if(Number(audio.start_time)!==0||Number(video.start_time)!==0||audio.time_base!==lockedAudio.time_base||audio.duration_ts!==lockedAudio.duration_ts)throw Error('Audio/video timeline offset or duration mismatch');
const frames=JSON.parse(call('ffprobe',['-v','error','-select_streams','v:0','-show_entries','frame=best_effort_timestamp_time','-of','json',file])).frames as {best_effort_timestamp_time:string}[];
if(frames.length!==FRAMES)throw Error('Decoded frame count mismatch');
let maxFrameTimingError=0;
for(const [i,f] of frames.entries()){const error=Math.abs(Number(f.best_effort_timestamp_time)-i/FPS);maxFrameTimingError=Math.max(error,maxFrameTimingError);if(error>2e-6)throw Error('Frame cadence discrepancy at '+i);}
const streamHash=(p:string,decode:boolean)=>call('ffmpeg',['-v','error','-i',p,'-map','0:a:0','-c:a',decode?'pcm_f32le':'copy','-f','hash','-hash','sha256','-']).trim();
const identity={lockedEncoded:streamHash('public/soundtrack.m4a',false),deliveredEncoded:streamHash(file,false),lockedDecoded:streamHash('public/soundtrack.m4a',true),deliveredDecoded:streamHash(file,true)};
if(identity.lockedEncoded!==identity.deliveredEncoded||identity.lockedDecoded!==identity.deliveredDecoded)throw Error('Final audio changed or shifted');
writeFileSync('evidence/audio-identity.json',JSON.stringify({...identity,encodedBitIdentical:true,decodedSampleIdentical:true,audioStartTime:Number(audio.start_time),videoStartTime:Number(video.start_time),audioDurationSamples:audio.duration_ts,meaning:'Same decoded samples in the same order, including first sample: no reencoding, offset or drift relative to locked soundtrack.'},null,2));
const bytes=readFileSync(file);const atoms:{type:string,offset:number,size:number}[]=[];
for(let i=0;i+8<=bytes.length;){let size=bytes.readUInt32BE(i);const type=bytes.toString('ascii',i+4,i+8);if(size===1)size=Number(bytes.readBigUInt64BE(i+8));if(size===0)size=bytes.length-i;atoms.push({type,offset:i,size});if(size<8)throw Error('Invalid MP4 atom');i+=size;}
if((atoms.find(a=>a.type==='moov')?.offset??Infinity)>(atoms.find(a=>a.type==='mdat')?.offset??0))throw Error('MP4 is not fast-start');
const digest=createHash('sha256').update(bytes).digest('hex');
writeFileSync('evidence/delivery-sha256.json',JSON.stringify({file,sha256:digest,bytes:statSync(file).size},null,2));
writeFileSync('output/LIFE-LETTERS-RU-ES-AR-LANDSCAPE.sha256',digest+'  LIFE-LETTERS-RU-ES-AR-LANDSCAPE.mp4\n');
writeFileSync('evidence/final-qa.json',JSON.stringify({file,probe,decodedFrames:frames.length,maxFrameTimingErrorSeconds:maxFrameTimingError,fullVideoFrameDecode:true,audioEncodedAndDecodedIdentity:true,fastStart:true,atoms,dimensions:[WIDTH,HEIGHT],fps:FPS,visualReview:'Final encoded mobile-sized stills must be reviewed after this verification; native live lyric geometry was checked during rendering.',limitations:'Automated acoustic timing and Spanish-oriented pronunciation are not a claim of native-listener ground truth.'},null,2));
console.log({file,megabytes:statSync(file).size/1e6,frames:frames.length,maxFrameTimingError,encodedAudio:'identical',decodedAudio:'identical',fastStart:true,colorSpace:video.color_space});
