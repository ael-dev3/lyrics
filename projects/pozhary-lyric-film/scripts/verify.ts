import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {readFileSync,writeFileSync,statSync,createReadStream,openSync,readSync,closeSync} from 'node:fs';
import assert from 'node:assert/strict';
const hash=async(p:string)=>{const h=createHash('sha256');for await(const b of createReadStream(p))h.update(b);return h.digest('hex');};
type Stream={codec_type:string;codec_name:string;width?:number;height?:number;avg_frame_rate?:string;nb_read_frames?:string;pix_fmt?:string;color_space?:string;color_transfer?:string;color_primaries?:string;color_range?:string;duration?:string;sample_rate?:string;channels?:number;sample_aspect_ratio?:string;start_time?:string};
const packets=(p:string)=>JSON.parse(execFileSync('ffprobe',['-v','error','-select_streams','a:0','-show_packets','-show_entries','packet=pts_time,duration_time,data_hash','-show_data_hash','sha256','-of','json',p],{maxBuffer:8*1024*1024}).toString()) as {packets:unknown[]};
const original=packets('public/soundtrack.m4a');
const inputHashes=[];
for(const p of ['src/Film.tsx','src/cues.json','src/timing.ts','public/science.json','public/motion.json','public/vocal-envelope.json','public/soundtrack.m4a','public/artist-cover.jpg'])inputHashes.push({path:p,sha256:await hash(p)});
const timing=JSON.parse(readFileSync('evidence/timing-checks.json','utf8'));
for(const kind of (process.argv.includes('--portrait')?['TikTok']:process.argv.includes('--youtube')?['YouTube']:['YouTube','TikTok'])){
 const portrait=kind==='TikTok',file=`output/Pozhary-${kind}-${portrait?'1080x1920':'1920x1080'}-60fps.mp4`;
 const data=JSON.parse(execFileSync('ffprobe',['-v','error','-count_frames','-show_streams','-show_format','-of','json',file],{maxBuffer:1024*1024}).toString()) as {streams:Stream[];format:{duration:string}};
 const v=data.streams.find(s=>s.codec_type==='video')!,a=data.streams.find(s=>s.codec_type==='audio')!;
 assert.equal(v.width,portrait?1080:1920);assert.equal(v.height,portrait?1920:1080);assert.equal(v.avg_frame_rate,'60/1');assert.equal(Number(v.nb_read_frames),9001);
 assert.equal(v.codec_name,'h264');assert.equal(v.pix_fmt,'yuv420p');assert.equal(v.color_space,'bt709');assert.equal(v.color_primaries,'bt709');assert.equal(v.color_transfer,'bt709');assert.equal(v.color_range,'tv');assert.equal(v.sample_aspect_ratio,'1:1');
 assert.equal(a.codec_name,'aac');assert.equal(a.sample_rate,'48000');assert.equal(a.channels,2);assert.equal(Number(v.start_time),0);assert.equal(Number(a.start_time),0);
 execFileSync('ffmpeg',['-v','error','-xerror','-err_detect','explode','-i',file,'-map','0:v','-map','0:a','-f','null','-'],{stdio:'pipe'});
 assert.deepEqual(packets(file).packets,original.packets,'AAC packet/timestamp mismatch');
 assert(Math.abs(Number(v.duration)-Number(a.duration))<1/60+.002);
 const layout=JSON.parse(readFileSync(`evidence/layout-${kind}.json`,'utf8'));assert.equal(layout.checkedStates,72);assert(layout.allInsideSafeAreas&&layout.noGlyphMovementOnHighlight);
 const fd=openSync(file,'r'),atoms:{type:string;position:number}[]=[];let pos=0;const head=Buffer.alloc(16);while(pos<statSync(file).size){readSync(fd,head,0,16,pos);const type=head.toString('ascii',4,8),size32=head.readUInt32BE(0),size=size32===1?Number(head.readBigUInt64BE(8)):size32;assert(size>=8);atoms.push({type,position:pos});pos+=size;}closeSync(fd);assert(atoms.find(a=>a.type==='moov')!.position<atoms.find(a=>a.type==='mdat')!.position);
 const report={file:file.split('/').at(-1),bytes:statSync(file).size,sha256:await hash(file),video:v,audio:a,strictFullDecodePassed:true,aacPacketIdentity:true,aacPacketCount:original.packets.length,fastStart:true,durationSeconds:Number(data.format.duration),inputHashes,layoutStates:layout.checkedStates,timing,audioProcessing:'One AAC 320k encode from original Opus with -3.2 dB linear gain for headroom. No time stretching or inserted silence. Both final films stream-copy the same AAC packets.',reviewLimit:'Visual frames, model evidence and numerical checks reviewed; no claim of human/native-listener audition or ground-truth word boundaries. Bridge uses grouped echo motif.'};
 writeFileSync(`evidence/${kind.toLowerCase()}-verification.json`,JSON.stringify(report,null,2));writeFileSync(`output/Pozhary-${kind}-Verification.json`,JSON.stringify(report,null,2));console.log(JSON.stringify({kind,frames:v.nb_read_frames,bytes:report.bytes,sha256:report.sha256,aacPacketIdentity:true,strictFullDecodePassed:true}));
}
