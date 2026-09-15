import {execFileSync,spawn} from 'node:child_process';
import {readFileSync,writeFileSync,createReadStream,statSync} from 'node:fs';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
import {FRAMES,FPS,SAMPLES,SR} from '../src/config.ts';
const probe=(path:string,args:string[])=>JSON.parse(execFileSync('ffprobe',['-v','error',...args,'-of','json',path],{encoding:'utf8',maxBuffer:24*1024*1024}));
const sha=async(path:string)=>{const hash=createHash('sha256');for await(const chunk of createReadStream(path))hash.update(chunk);return hash.digest('hex');};
const packets=(path:string)=>probe(path,['-select_streams','a:0','-show_packets','-show_data_hash','sha256','-show_entries','packet=data_hash,size,pts,dts']).packets as {size:string;data_hash:string;pts:number;dts:number}[];
const reference=packets('public/soundtrack.m4a'),reports=[];
for(const portrait of [false,true]){
 const kind=portrait?'tiktok':'youtube',path=`output/Polovinka-${portrait?'TikTok-1080x1920':'YouTube-1920x1080'}-60fps.mp4`;
 const data=probe(path,['-show_streams','-show_format']),v=data.streams.find((s:{codec_type:string})=>s.codec_type==='video'),a=data.streams.find((s:{codec_type:string})=>s.codec_type==='audio');
 assert(v&&a);assert.equal(v.width,portrait?1080:1920);assert.equal(v.height,portrait?1920:1080);assert.equal(v.r_frame_rate,'60/1');assert.equal(v.avg_frame_rate,'60/1');assert.equal(v.nb_frames,String(FRAMES));assert.equal(v.pix_fmt,'yuv420p');assert.equal(v.color_space,'bt709');assert.equal(v.color_transfer,'bt709');assert.equal(v.color_primaries,'bt709');assert.equal(v.color_range,'tv');assert.equal(a.sample_rate,'48000');assert.equal(a.channels,2);assert.equal(a.codec_name,'aac');assert.equal(Number(v.start_time),0);assert.equal(Number(a.start_time),0);assert(Math.abs(Number(a.duration)-SAMPLES/SR)<1024/SR,'Audio duration differs beyond codec padding');
 const times=probe(path,['-select_streams','v:0','-show_frames','-show_entries','frame=best_effort_timestamp_time']).frames.map((f:{best_effort_timestamp_time:string})=>Number(f.best_effort_timestamp_time)) as number[];
 assert.equal(times.length,FRAMES);let error=0;times.forEach((t,i)=>{error=Math.max(error,Math.abs(t-i/FPS));});assert(error<=1e-6);assert(Math.abs(Number(v.duration)-FRAMES/FPS)<1e-5);
 const audioPackets=packets(path);assert.deepEqual(audioPackets,reference);
 await new Promise<void>((resolve,reject)=>{const p=spawn('ffmpeg',['-v','error','-xerror','-i',path,'-map','0:v','-map','0:a','-f','null','-'],{stdio:['ignore','ignore','pipe']});let errors='';p.stderr.on('data',x=>errors+=String(x));p.once('error',reject);p.once('exit',code=>code===0&&errors.length===0?resolve():reject(Error(errors||'Decode failed '+code)));});
 const report={file:path,bytes:statSync(path).size,sha256:await sha(path),width:v.width,height:v.height,frames:FRAMES,fps:FPS,videoSeconds:Number(v.duration),audioSeconds:Number(a.duration),sourceSeconds:SAMPLES/SR,maximumFrameTimestampErrorSeconds:error,fullDecodePassed:true,lockedAudioPacketsIdentical:audioPackets.length,pixelFormat:v.pix_fmt,colorSpace:v.color_space};
 reports.push(report);writeFileSync(`evidence/${kind}-delivery-verification.json`,JSON.stringify(report,null,2));console.log('VERIFIED',report);
}
for(const [path,w,h]of [['publishing/Polovinka-YouTube-Thumbnail-1920x1080.jpg',1920,1080],['publishing/Polovinka-TikTok-Profile-1200x1600.jpg',1200,1600]] as [string,number,number][]){const p=probe(path,['-show_streams']);assert.equal(p.streams[0].width,w);assert.equal(p.streams[0].height,h);assert(statSync(path).size<2*1024*1024);}
assert(readFileSync('publishing/YouTube-title.txt','utf8').trim().length<=100);
writeFileSync('evidence/delivery-verification.json',JSON.stringify({passed:true,films:reports,coversPassed:true,lyricLanguages:['ru','en']},null,2));
