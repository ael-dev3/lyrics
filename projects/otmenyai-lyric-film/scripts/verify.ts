import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {readFileSync,writeFileSync,statSync,createReadStream,existsSync} from 'node:fs';
import assert from 'node:assert/strict';
const file='../../outputs/REDCHINAWAVE-Otmenyai-Lyric-Film-1080p60.mp4';
const hash=async(p:string)=>{const h=createHash('sha256');for await(const b of createReadStream(p))h.update(b);return h.digest('hex');};
const data=JSON.parse(execFileSync('ffprobe',['-v','error','-count_frames','-show_streams','-show_format','-of','json',file],{maxBuffer:1024*1024}).toString()) as {streams:{codec_type:string;codec_name:string;width?:number;height?:number;avg_frame_rate?:string;nb_read_frames?:string;pix_fmt?:string;color_space?:string;color_transfer?:string;color_primaries?:string;duration?:string;sample_rate?:string;channels?:number}[];format:{duration:string}};
const v=data.streams.find(s=>s.codec_type==='video')!,a=data.streams.find(s=>s.codec_type==='audio')!;
assert.equal(v.width,1920);assert.equal(v.height,1080);assert.equal(v.avg_frame_rate,'60/1');assert.equal(Number(v.nb_read_frames),7827);assert.equal(v.codec_name,'h264');assert.equal(v.pix_fmt,'yuv420p');assert.equal(v.color_space,'bt709');assert.equal(v.color_primaries,'bt709');assert.equal(v.color_transfer,'bt709');assert.equal(a.codec_name,'aac');assert.equal(a.sample_rate,'48000');assert.equal(a.channels,2);
execFileSync('ffmpeg',['-v','error','-xerror','-err_detect','explode','-i',file,'-map','0:v','-map','0:a','-f','null','-'],{stdio:'pipe'});
const packets=(p:string)=>JSON.parse(execFileSync('ffprobe',['-v','error','-select_streams','a:0','-show_packets','-show_entries','packet=pts_time,duration_time,data_hash','-show_data_hash','sha256','-of','json',p],{maxBuffer:8*1024*1024}).toString()) as {packets:{pts_time:string;duration_time:string;data_hash:string}[]};
const reference=packets('public/soundtrack.m4a'),delivered=packets(file);assert.deepEqual(delivered.packets,reference.packets,'AAC packet timing or contents changed');
if(!existsSync('analysis/aac-decoded.f32'))execFileSync('ffmpeg',['-y','-v','error','-i','public/soundtrack.m4a','-f','f32le','-ac','2','-ar','48000','analysis/aac-decoded.f32']);
const sourceBytes=readFileSync('../prygay-source/analysis.f32'),lockedBytes=readFileSync('analysis/aac-decoded.f32');
const source=new Float32Array(sourceBytes.buffer,sourceBytes.byteOffset,sourceBytes.length/4),locked=new Float32Array(lockedBytes.buffer,lockedBytes.byteOffset,lockedBytes.length/4);
let bestLag=0,bestCorrelation=-Infinity;
for(let lag=-1024;lag<=1024;lag++){
 let xy=0,xx=0,yy=0;for(let s=48000;s<48000*12;s+=96){const x=source[s*2]??0,y=locked[(s+lag)*2]??0;xy+=x*y;xx+=x*x;yy+=y*y;}
 const r=xy/Math.sqrt(xx*yy);if(r>bestCorrelation){bestCorrelation=r;bestLag=lag;}
}
assert(Math.abs(bestLag)<=4,'Unexpected AAC time shift');assert(bestCorrelation>.95,'AAC differs unexpectedly from source');
assert(Math.abs(Number(v.duration)-Number(a.duration))<1/60+.002);
const report={file:file.split('/').at(-1),bytes:statSync(file).size,sha256:await hash(file),video:v,audio:a,strictFullDecodePassed:true,aacPacketIdentity:true,aacPacketCount:reference.packets.length,sourceToAacAlignment:{lagSamples:bestLag,correlation:bestCorrelation,method:'normalized waveform correlation, 1–12 seconds, sample stride96, searched ±1024 samples; not a lyric-boundary metric'},durationSeconds:Number(data.format.duration),timing:JSON.parse(readFileSync('evidence/timing-checks.json','utf8')),layout:JSON.parse(readFileSync('evidence/layout-checks.json','utf8')).checkedStates};
writeFileSync('evidence/delivery-verification.json',JSON.stringify(report,null,2));writeFileSync('../../outputs/REDCHINAWAVE-Otmenyai-Verification.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));
