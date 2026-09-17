import {bundle} from '@remotion/bundler';
import {renderMedia,selectComposition} from '@remotion/renderer';
import {mkdirSync,writeFileSync,readFileSync,existsSync,createReadStream,statfsSync,unlinkSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {spawn} from 'node:child_process';
import {resolve} from 'node:path';
import {assertProductionGate,inputHashes} from './production-contract.ts';
import {assertArtworkCache} from './artwork-cache-contract.ts';
const arg=(key:string,fallback:string)=>{const i=process.argv.indexOf(key);return i>=0?process.argv[i+1]??fallback:fallback;};
const production=process.argv.includes('--production'),diagnostic=process.argv.includes('--diagnostic');
if(production===diagnostic)throw Error('Choose one explicit production or diagnostic mode');
assertProductionGate();
const format=arg('--format','landscape');if(format!=='landscape'&&format!=='portrait')throw Error('Unknown format');
const sha=async(path:string)=>{const hash=createHash('sha256');for await(const part of createReadStream(path))hash.update(part);return hash.digest('hex');};
const write=(path:string,data:unknown)=>writeFileSync(path,JSON.stringify(data,null,2)+'\n');
const run=(args:string[])=>new Promise<void>((ok,fail)=>{const child=spawn('ffmpeg',args,{stdio:'inherit'});child.on('error',fail);child.on('close',code=>code===0?ok():fail(Error('ffmpeg exited '+code)));});
mkdirSync('evidence/production',{recursive:true});mkdirSync(`output/${format}-segments`,{recursive:true});
const began=Date.now(),fingerprint=createHash('sha256').update(JSON.stringify(inputHashes())).update('PNG-2x-ProRes4444-Lanczos-HEVC17-v1').digest('hex');
const status=(data:Record<string,unknown>)=>write(`evidence/production/${format}-status.json`,{format,updatedAt:new Date().toISOString(),elapsedSeconds:(Date.now()-began)/1000,...data});
const serveUrl=await bundle({entryPoint:resolve('src/Film.tsx')}),composition=await selectComposition({serveUrl,id:format});
const start=Number(arg('--start','71.9')),count=Number(arg('--frames','120'));
if(diagnostic&&(!Number.isFinite(start)||start<0||!Number.isSafeInteger(count)||count<1||count>1200))throw Error('Invalid diagnostic range');
const parts=production?16:1,chunks=[];
for(let i=0;i<parts;i++){
 assertProductionGate();const disk=statfsSync('.');if(disk.bavail*disk.bsize<8e9)throw Error('Insufficient free space for bounded capture');
 const first=production?Math.floor(i*composition.durationInFrames/parts):Math.round(start*60),last=production?Math.floor((i+1)*composition.durationInFrames/parts)-1:Math.min(composition.durationInFrames-1,first+count-1);
 assertArtworkCache(format,first,last);
 const stem=production?`part-${String(i+1).padStart(2,'0')}`:'diagnostic',reference=`output/${format}-segments/${stem}.mov`,encoded=`output/${format}-segments/${stem}.mp4`,receipt=encoded+'.json';
 let cached=false;if(existsSync(encoded)&&existsSync(receipt)){const r=JSON.parse(readFileSync(receipt,'utf8'));cached=r.fingerprint===fingerprint&&r.first===first&&r.last===last&&r.sha256===await sha(encoded);}
 if(!cached){let tick=0;status({phase:'Capturing',segment:i+1,segments:parts,frames:first,totalFrames:composition.durationInFrames});
  await renderMedia({serveUrl,composition,frameRange:[first,last],outputLocation:reference,codec:'prores',proResProfile:'4444',pixelFormat:'yuva444p10le',hardwareAcceleration:'if-possible',scale:2,muted:true,concurrency:3,imageFormat:'png',colorSpace:'bt709',onProgress:p=>{if(Date.now()-tick>10000){tick=Date.now();status({phase:'Capturing',segment:i+1,segments:parts,frames:first+p.renderedFrames,totalFrames:composition.durationInFrames});console.log(`${format}: ${first+p.renderedFrames}/${composition.durationInFrames}, segment ${i+1}/${parts}`);}}});
  const referenceHash=await sha(reference);status({phase:'Encoding segment',segment:i+1,segments:parts,frames:last+1,totalFrames:composition.durationInFrames});
  await run(['-v','error','-y','-i',reference,'-an','-vf',`setpts=N/(60*TB),scale=${composition.width}:${composition.height}:flags=lanczos,setsar=1,format=yuv420p10le`,'-c:v','libx265','-preset','medium','-crf','17','-x265-params','colorprim=bt709:transfer=bt709:colormatrix=bt709:range=limited:pools=4:frame-threads=2:log-level=error','-tag:v','hvc1','-colorspace','bt709','-color_trc','bt709','-color_primaries','bt709','-color_range','tv','-video_track_timescale','60000',encoded]);
  await run(['-v','error','-xerror','-err_detect','explode','-threads','4','-i',encoded,'-f','null','-']);
  write(receipt,{fingerprint,first,last,frames:last-first+1,referenceSha256:referenceHash,referencePolicy:diagnostic?'Diagnostic reference retained':'Temporary reference removed after segment encoding and strict decode; reproducible from locked inputs',sha256:await sha(encoded)});
  if(production)unlinkSync(reference); // Only this run's temporary, reproducible capture.
 }else console.log('Verified cache:',encoded);
 chunks.push({file:`${stem}.mp4`,first,last});
}
if(production){
 assertProductionGate();const directory=`output/${format}-segments`,list=directory+'/concat.txt';writeFileSync(list,chunks.map(c=>`file '${c.file}'`).join('\n')+'\n');
 const output=`output/Kazhdyy-${format}-${composition.width}x${composition.height}-60fps.mp4`;
 await run(['-v','error','-y','-f','concat','-safe','0','-i',list,'-i','public/soundtrack.m4a','-map','0:v:0','-map','1:a:0','-c','copy','-tag:v','hvc1','-video_track_timescale','60000','-movflags','+faststart',output]);
 write(`evidence/production/${format}-capture.json`,{fingerprint,format,scale:2,frames:composition.durationInFrames,chunks,output,sha256:await sha(output),elapsedSeconds:(Date.now()-began)/1000});status({phase:'Rendered; verification pending',frames:composition.durationInFrames,totalFrames:composition.durationInFrames,output});console.log(output);
}else {status({phase:'Diagnostic complete',mode:'diagnostic',frames:chunks.reduce((n,c)=>n+c.last-c.first+1,0)});console.log('Diagnostic complete:',format);}
