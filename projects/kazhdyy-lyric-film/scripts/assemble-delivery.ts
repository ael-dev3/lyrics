import {spawnSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {readFileSync,writeFileSync,existsSync,renameSync} from 'node:fs';
import {assertProductionGate} from './production-contract.ts';
import {parseData} from '../src/schema.ts';
assertProductionGate();
const format=process.argv[2];
if(format!=='landscape'&&format!=='portrait')throw Error('Expected landscape|portrait');
const data=parseData(JSON.parse(readFileSync('src/cues.json','utf8')));
const capturePath=`evidence/production/${format}-capture.json`,capture=JSON.parse(readFileSync(capturePath,'utf8'));
const directory=`output/${format}-segments`,output:string=capture.output;
const hash=(p:string)=>createHash('sha256').update(readFileSync(p)).digest('hex');
const run=(bin:string,args:string[])=>{const result=spawnSync(bin,args,{encoding:'utf8',maxBuffer:64*1024*1024});if(result.status!==0)throw Error(bin+': '+result.stderr);return result.stdout;};
if(capture.frames!==data.frames||capture.format!==format||!existsSync(output)||hash(output)!==capture.sha256)throw Error('Capture identity mismatch');
const previousSha256=capture.sha256;
const videoPackets=(file:string)=>JSON.parse(run('ffprobe',['-v','error','-select_streams','v:0','-show_packets','-show_data_hash','sha256','-show_entries','packet=size,data_hash','-of','json',file])).packets;
const originalPackets=videoPackets(output),chunks:{file:string;first:number;last:number;durationMicroseconds:number;sha256:string;reportedDuration:string}[]=[];
let next=0;
for(const chunk of capture.chunks as {file:string;first:number;last:number}[]){
 if(!/^part-\d{2}\.mp4$/.test(chunk.file)||chunk.first!==next||chunk.last<chunk.first)throw Error('Invalid segment sequence');
 const file=`${directory}/${chunk.file}`,receipt=JSON.parse(readFileSync(file+'.json','utf8'));
 if(receipt.fingerprint!==capture.fingerprint||receipt.first!==chunk.first||receipt.last!==chunk.last||receipt.frames!==chunk.last-chunk.first+1||receipt.sha256!==hash(file))throw Error('Segment identity mismatch');
 // Derive differences of rounded GLOBAL boundaries. Rounding each duration
 // independently would accumulate microseconds across long inventories.
 const durationMicroseconds=Math.round((chunk.last+1)*1e6/data.fps)-Math.round(chunk.first*1e6/data.fps);
 const info=JSON.parse(run('ffprobe',['-v','error','-show_entries','format=duration','-of','json',file]));
 chunks.push({...chunk,durationMicroseconds,sha256:receipt.sha256,reportedDuration:info.format.duration});next=chunk.last+1;
}
if(next!==data.frames||chunks.length!==16)throw Error('Incomplete capture');
const list=`${directory}/concat-exact-clock.txt`;
writeFileSync(list,chunks.map(c=>`file '${c.file}'\nduration ${(c.durationMicroseconds/1e6).toFixed(6)}`).join('\n')+'\n');
const temporary=output.replace(/\.mp4$/,'.assembly.tmp.mp4');
run('ffmpeg',['-v','error','-y','-f','concat','-safe','0','-i',list,'-i','public/soundtrack.m4a','-map','0:v:0','-map','1:a:0','-c','copy','-tag:v','hvc1','-video_track_timescale','60000','-movflags','+faststart',temporary]);
if(JSON.stringify(videoPackets(temporary))!==JSON.stringify(originalPackets))throw Error('Encoded video packet payloads changed');
const sha256=hash(temporary),backup=output.replace(/\.mp4$/,`.pre-clock-assembly-${previousSha256.slice(0,12)}.mp4`);
if(!existsSync(backup))renameSync(output,backup);
renameSync(temporary,output);
const report={status:'assembled; full verification required',format,frames:data.frames,fps:data.fps,previousSha256,sha256,unchangedEncodedVideoPackets:originalPackets.length,assemblerSha256:hash('scripts/assemble-delivery.ts'),chunks,method:'Stream copy with explicit concat durations derived from global frame boundaries. Container-reported millisecond rounding cannot accumulate at joins. Encoded video payloads are byte-identical; original AAC is copied. Final timestamp, audio, decode and focus verification remain required.'};
writeFileSync(`evidence/production/${format}-assembly.json`,JSON.stringify(report,null,2)+'\n');
writeFileSync(capturePath,JSON.stringify({...capture,initialAssemblySha256:capture.initialAssemblySha256??previousSha256,sha256,clockAssembly:`${format}-assembly.json`},null,2)+'\n');
console.log({format,status:report.status,frames:data.frames,unchangedEncodedVideoPackets:originalPackets.length,sha256});
