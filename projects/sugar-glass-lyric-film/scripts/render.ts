import {bundle} from '@remotion/bundler';
import {renderMedia,renderStill,selectComposition} from '@remotion/renderer';
import {mkdirSync,writeFileSync,readFileSync,existsSync,createReadStream,statfsSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {resolve} from 'node:path';
import {assertProductionGate,inputHashes} from './sync-gate.ts';
import {encode} from './encode.ts';
const arg=(key:string,fallback:string)=>{const i=process.argv.indexOf(key);return i>=0?process.argv[i+1]??fallback:fallback;};
const production=process.argv.includes('--production'),diagnostic=process.argv.includes('--diagnostic');
if(!production&&!diagnostic)throw Error('Choose production or diagnostic mode explicitly');
assertProductionGate(); // No output creation, capture or encoding before approval verification.
const format=arg('--format','landscape');if(format!=='landscape'&&format!=='portrait')throw Error('Format');
const start=Number(arg('--start','90')),count=Number(arg('--frames','120'));
if(diagnostic&&(!Number.isFinite(start)||start<0||!Number.isSafeInteger(count)||count<1||count>1200))throw Error('Diagnostic frame range');
const sha=async(path:string)=>{const hash=createHash('sha256');for await(const part of createReadStream(path))hash.update(part);return hash.digest('hex');};
const write=(path:string,data:unknown)=>writeFileSync(path,JSON.stringify(data,null,2)+'\n');
mkdirSync('evidence/production',{recursive:true});mkdirSync('output',{recursive:true});
const began=Date.now(),fingerprint=createHash('sha256').update(JSON.stringify(inputHashes())).update('PNG-2x-ProRes4444-BT709-v1').digest('hex');
const status=(data:Record<string,unknown>)=>write(`evidence/production/${format}-status.json`,{format,updatedAt:new Date().toISOString(),elapsedSeconds:(Date.now()-began)/1000,...data});
status({phase:'Preparing capture',frames:0,totalFrames:13881});
const serveUrl=await bundle({entryPoint:resolve('src/index.ts')}),inputProps={format,production:true};
const composition=await selectComposition({serveUrl,id:format==='landscape'?'SugarGlassLandscape':'SugarGlassPortrait',inputProps});
if(process.argv.includes('--still')){await renderStill({serveUrl,composition,inputProps,frame:Math.round(start*60),scale:2,imageFormat:'png',output:`evidence/production/${format}-${start}.png`});console.log('Still saved');}
else if(diagnostic){
 const first=Math.round(start*60);let tick=0;
 await renderMedia({serveUrl,composition,inputProps,frameRange:[first,Math.min(composition.durationInFrames-1,first+count-1)],outputLocation:`evidence/production/${format}-diagnostic.mov`,codec:'prores',proResProfile:'4444',pixelFormat:'yuva444p10le',hardwareAcceleration:'if-possible',scale:2,muted:true,concurrency:3,offthreadVideoCacheSizeInBytes:512*1024*1024,imageFormat:'png',colorSpace:'bt709',onProgress:p=>{if(Date.now()-tick>10000){tick=Date.now();console.log({format,rendered:p.renderedFrames,encoded:p.encodedFrames,seconds:(Date.now()-began)/1000});}}});
 write(`evidence/production/${format}-diagnostic.json`,{fingerprint,first,count,elapsedSeconds:(Date.now()-began)/1000,sha256:await sha(`evidence/production/${format}-diagnostic.mov`)});
}else{
 const directory=`output/${format}-reference`;mkdirSync(directory,{recursive:true});const chunks=[];const parts=12;
 for(let i=0;i<parts;i++){
  assertProductionGate();const disk=statfsSync('.');if(disk.bavail*disk.bsize<18e9)throw Error('Insufficient free space for the next capture segment');
  const first=Math.floor(i*composition.durationInFrames/parts),last=Math.floor((i+1)*composition.durationInFrames/parts)-1,filename=`part-${String(i+1).padStart(2,'0')}.mov`,path=`${directory}/${filename}`,receipt=path+'.json';
  let cached=false;if(existsSync(path)&&existsSync(receipt)){const r=JSON.parse(readFileSync(receipt,'utf8'));cached=r.fingerprint===fingerprint&&r.first===first&&r.last===last&&r.sha256===await sha(path);}
  if(!cached){let tick=0;console.log(`Capturing ${format} ${i+1}/${parts}, frames ${first}–${last}`);
   await renderMedia({serveUrl,composition,inputProps,frameRange:[first,last],outputLocation:path,codec:'prores',proResProfile:'4444',pixelFormat:'yuva444p10le',hardwareAcceleration:'if-possible',scale:2,muted:true,concurrency:3,offthreadVideoCacheSizeInBytes:512*1024*1024,imageFormat:'png',colorSpace:'bt709',onProgress:p=>{if(Date.now()-tick>15000){tick=Date.now();status({phase:'Capturing',segment:i+1,segments:parts,frames:first+p.renderedFrames,totalFrames:composition.durationInFrames});console.log(`${format}: ${first+p.renderedFrames}/${composition.durationInFrames} captured; segment encoded ${p.encodedFrames}`);}}});
   write(receipt,{fingerprint,first,last,frames:last-first+1,sha256:await sha(path)});
  }else console.log('Reusing verified segment',filename);
  chunks.push({filename,first,last});
 }
 const list=`${directory}/concat.txt`;writeFileSync(list,chunks.map(c=>`file '${c.filename}'`).join('\n')+'\n');write(`${directory}/manifest.json`,{fingerprint,format,scale:2,codec:'PNG-derived ProRes 4444',frames:composition.durationInFrames,chunks});
 const output=`output/Sugar-Glass-${format}-${composition.width}x${composition.height}-60fps.mp4`;status({phase:'Encoding delivery',frames:composition.durationInFrames,totalFrames:composition.durationInFrames});
 await encode(format,list,output);write(`evidence/production/${format}-capture.json`,{fingerprint,format,scale:2,frames:composition.durationInFrames,chunks,output,sha256:await sha(output),elapsedSeconds:(Date.now()-began)/1000});status({phase:'Rendered; verification pending',frames:composition.durationInFrames,totalFrames:composition.durationInFrames,output});console.log('Rendered:',output);
}
