import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {readFileSync,writeFileSync,statSync,createReadStream,openSync,readSync,closeSync} from 'node:fs';
import assert from 'node:assert/strict';
import {FRAMES,FPS,SR,SAMPLE_COUNT} from '../src/config.ts';
import {parseCues} from '../src/schema.ts';
const hash=async(p:string)=>{const h=createHash('sha256');for await(const b of createReadStream(p))h.update(b);return h.digest('hex');};
type Stream={codec_type:string;codec_name:string;profile?:string;width?:number;height?:number;avg_frame_rate?:string;nb_read_frames?:string;pix_fmt?:string;color_space?:string;color_transfer?:string;color_primaries?:string;color_range?:string;duration?:string;sample_rate?:string;channels?:number;sample_aspect_ratio?:string;start_time?:string};
const packets=(p:string)=>JSON.parse(execFileSync('ffprobe',['-v','error','-select_streams','a:0','-show_packets','-show_entries','packet=pts_time,duration_time,data_hash','-show_data_hash','sha256','-of','json',p],{maxBuffer:12*1024*1024}).toString()) as {packets:unknown[]};
const original=packets('public/soundtrack.m4a'),cues=parseCues(JSON.parse(readFileSync('src/cues.json','utf8')));
const frozen:unknown=JSON.parse(readFileSync('evidence/render-inputs.json','utf8'));
assert(frozen&&typeof frozen==='object'&&'inputs' in frozen&&Array.isArray(frozen.inputs));
for(const item of frozen.inputs){assert(item&&typeof item.path==='string'&&typeof item.sha256==='string');assert.equal(await hash(item.path),item.sha256,'Render input changed: '+item.path);}
const inputHashes=[];
for(const p of ['src/Film.tsx','src/cues.json','src/timing.ts','src/config.ts','public/science.json','public/motion.json','public/soundtrack.m4a','public/source-video.webm'])inputHashes.push({path:p,sha256:await hash(p)});
const timing:unknown=JSON.parse(readFileSync('evidence/timing-checks.json','utf8'));
for(const kind of (process.argv.includes('--portrait')?['TikTok']:process.argv.includes('--youtube')?['YouTube']:['YouTube','TikTok'])){
 const portrait=kind==='TikTok',file=`output/Joyride-${kind}-${portrait?'1080x1920':'1920x1080'}-60fps.mp4`;
 const data=JSON.parse(execFileSync('ffprobe',['-v','error','-count_frames','-show_streams','-show_format','-show_frames','-show_entries','frame=media_type,best_effort_timestamp_time','-of','json',file],{maxBuffer:8*1024*1024}).toString()) as {streams:Stream[];format:{duration:string};frames:{media_type:string;best_effort_timestamp_time:string}[]};
 const v=data.streams.find(s=>s.codec_type==='video'),a=data.streams.find(s=>s.codec_type==='audio');assert(v&&a);
 assert.equal(v.width,portrait?1080:1920);assert.equal(v.height,portrait?1920:1080);assert.equal(v.avg_frame_rate,`${FPS}/1`);assert.equal(Number(v.nb_read_frames),FRAMES);
 assert.equal(v.codec_name,'h264');assert.equal(v.profile,'High');assert.equal(v.pix_fmt,'yuv420p');assert.equal(v.color_space,'bt709');assert.equal(v.color_primaries,'bt709');assert.equal(v.color_transfer,'bt709');assert.equal(v.color_range,'tv');assert.equal(v.sample_aspect_ratio,'1:1');
 const decodedVideoFrames=data.frames.filter(f=>f.media_type==='video');assert.equal(decodedVideoFrames.length,FRAMES);let maxFrameTimestampErrorSeconds=0;
 for(const [i,f] of decodedVideoFrames.entries()){const error=Math.abs(Number(f.best_effort_timestamp_time)-i/FPS);assert(Number.isFinite(error)&&error<.000001,'Non-CFR timestamp at frame '+i);maxFrameTimestampErrorSeconds=Math.max(maxFrameTimestampErrorSeconds,error);}
 assert.equal(a.codec_name,'aac');assert.equal(a.sample_rate,String(SR));assert.equal(a.channels,2);assert.equal(Number(v.start_time),0);assert.equal(Number(a.start_time),0);
 execFileSync('ffmpeg',['-v','error','-xerror','-err_detect','explode','-i',file,'-map','0:v','-map','0:a','-f','null','-'],{stdio:'pipe'});
 assert.deepEqual(packets(file).packets,original.packets,'AAC packet/timestamp mismatch');
 assert(Math.abs(Number(v.duration)-SAMPLE_COUNT/SR)<1/FPS+.002);assert(Math.abs(Number(v.duration)-Number(a.duration))<1/FPS+.002);
 const layout=JSON.parse(readFileSync(`evidence/layout-${kind}.json`,'utf8')) as {checkedStates:number;allInsideSafeAreas:boolean;noGlyphMovementOnHighlight:boolean};assert.equal(layout.checkedStates,cues.length*2);assert(layout.allInsideSafeAreas&&layout.noGlyphMovementOnHighlight);
 const fd=openSync(file,'r'),atoms:{type:string;position:number}[]=[];let pos=0;const head=Buffer.alloc(16);
 while(pos<statSync(file).size){readSync(fd,head,0,16,pos);const type=head.toString('ascii',4,8),size32=head.readUInt32BE(0),size=size32===1?Number(head.readBigUInt64BE(8)):size32;assert(size>=8);atoms.push({type,position:pos});pos+=size;}closeSync(fd);
 const moov=atoms.find(x=>x.type==='moov'),mdat=atoms.find(x=>x.type==='mdat');assert(moov&&mdat&&moov.position<mdat.position);
 const report={file:file.split('/').at(-1),bytes:statSync(file).size,sha256:await hash(file),video:v,audio:a,strictFullDecodePassed:true,constantFrameRateVerifiedForEveryFrame:true,maxFrameTimestampErrorSeconds,aacPacketIdentity:true,aacPacketCount:original.packets.length,fastStart:true,durationSeconds:Number(data.format.duration),inputHashes,layoutStates:layout.checkedStates,timing,audioProcessing:'One AAC 320k encode from original Opus with -3.8 dB fixed gain. No limiter, time stretching or inserted silence. Both films stream-copy the same AAC packets.',sourceCadence:'Original nominal 25 fps source sampled on the 60 fps timeline; added motion and word graphics rendered at 60 fps.',reviewLimit:'Model evidence, waveform observations, layout checks and selected decoded frames; no claim of human/native-listener audition or ground-truth word boundaries.'};
 writeFileSync(`evidence/${kind.toLowerCase()}-verification.json`,JSON.stringify(report,null,2));writeFileSync(`output/Joyride-${kind}-Verification.json`,JSON.stringify(report,null,2));console.log(JSON.stringify({kind,frames:v.nb_read_frames,bytes:report.bytes,sha256:report.sha256,aacPacketIdentity:true,strictFullDecodePassed:true}));
}
