import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {createReadStream,existsSync,mkdirSync,readFileSync,writeFileSync,openSync,closeSync} from 'node:fs';
import {resolve} from 'node:path';
import {execFileSync,spawn,type ChildProcess} from 'node:child_process';
import {bundle} from '@remotion/bundler';
import {makeCancelSignal,renderMedia,selectComposition} from '@remotion/renderer';
import {FPS,FRAMES} from '../src/config.ts';
import {REVISION_VIEWPORTS} from '../src/viewport-config.ts';

// Capture an opaque, complete reconstruction of the lyric area, including its
// original moving backdrop. Never lay new words over old burned-in typography.
// Full-frame Film remains the independently renderable source of this viewport.
const hash=async(path:string)=>{const h=createHash('sha256');for await(const b of createReadStream(path))h.update(b);return h.digest('hex');};
const read=(path:string)=>JSON.parse(readFileSync(path,'utf8'));
const kinds=['youtube','tiktok'] as const;
type Kind=typeof kinds[number];
const chunks=Array.from({length:4},(_,i)=>({part:i+1,start:Math.floor(i*FRAMES/4),end:Math.floor((i+1)*FRAMES/4)-1}));
mkdirSync('evidence/cinematic',{recursive:true});
execFileSync('npm',['run','typecheck'],{stdio:'inherit'});
execFileSync(process.execPath,['scripts/check.ts'],{stdio:'inherit'});
const proof=read('evidence/viewport-proof.json');
assert.equal(proof.passed,true,'Independent full-frame/viewport proof must pass first');
assert.equal(proof.scale,2);
for(const input of proof.inputs)assert.equal(await hash(input.path),input.sha256,'Viewport proof is stale: '+input.path);
const geometry=[];
for(const kind of kinds){
 const viewport=REVISION_VIEWPORTS[kind],layout=read(`evidence/layout-${kind==='youtube'?'YouTube':'TikTok'}.json`);
 assert.equal(layout.checkedStates,76);assert(layout.allInsideSafeAreas&&layout.noGlyphMovementOnHighlight);
 let minimumMargin=Infinity;
 for(const row of layout.rows)for(const [x,y,w,h] of row.words){
  const margin=Math.min(x-viewport.x,y-viewport.y,viewport.x+viewport.width-x-w,viewport.y+viewport.height-y-h);
  minimumMargin=Math.min(minimumMargin,margin);assert(margin>=24,'Lyric/shadow not safely enclosed by opaque viewport');
 }
 geometry.push({kind,minimumGlyphMarginPixels:minimumMargin,requiredMarginPixels:24,closingTitleContained:true});
}
const oldFilm=readFileSync('../midnight-love/src/Film.tsx','utf8');
const expectedFilm=oldFilm.replace('!cue&&f>181*FPS','!cue&&f>188*FPS').replace('smooth(181*FPS,183*FPS,f)','smooth(188*FPS,190*FPS,f)').replace("<span style={{position:'absolute',left:0,right:0,bottom:-3,height:3,background:P.gold,opacity:active(i)?1:0}}/>",'');
assert.equal(readFileSync('src/Film.tsx','utf8'),expectedFilm,'Composition has an undeclared change beyond lyrics and the contained closing title');
const preservedPaths=['src/config.ts','src/timing.ts','src/schema.ts','public/science.json','public/motion.json','public/soundtrack.m4a','public/source-video.webm','public/SpaceGrotesk.ttf','public/CormorantGaramond-Semibold.ttf','public/CormorantGaramond-Italic.ttf'];
const preservedInputs=[];
for(const path of preservedPaths){const current=await hash(path);assert.equal(current,await hash('../midnight-love/'+path),'Changed original background/audio input '+path);preservedInputs.push({path,sha256:current});}
execFileSync(process.execPath,['scripts/record-render-inputs.ts'],{stdio:'inherit'});
const frozenHash=await hash('evidence/render-inputs.json');
const frozenInputs=read('evidence/render-inputs.json').inputs;
const verifyFrozen=async()=>{assert.equal(await hash('evidence/render-inputs.json'),frozenHash,'Frozen manifest itself changed');for(const input of frozenInputs)assert.equal(await hash(input.path),input.sha256,'Frozen render input changed: '+input.path);};
const options={method:'opaque-lyric-viewport',scale:2,fps:FPS,frames:FRAMES,totalBrowserTabs:6,tabsPerFormat:3,chunks,viewports:REVISION_VIEWPORTS,frozenInputManifestSha256:frozenHash};
writeFileSync('evidence/cinematic-render-options.json',JSON.stringify(options,null,2));
const oldMasters:{kind:Kind;path:string;sha256:string}[]=[];
for(const kind of kinds){const path=`../midnight-love/evidence/${kind}-master-lossless.mkv`;oldMasters.push({kind,path,sha256:await hash(path)});}
const preflight={passed:true,options,geometry,preservedInputs,oldMasters,viewportProofSha256:await hash('evidence/viewport-proof.json'),changeScope:'Only lyric words, active-word underline removal and closing-title timing differ; these are enclosed by the verified viewport. All other Film code and original background/motion/audio inputs match v1.0.'};
writeFileSync('evidence/cinematic-preflight.json',JSON.stringify(preflight,null,2));
const serveUrl=await bundle({entryPoint:resolve('src/index.tsx')});
const {cancelSignal,cancel}=makeCancelSignal();
const children=new Set<ChildProcess>();let stopped=false;
const stop=()=>{if(stopped)return;stopped=true;cancel();for(const child of children)child.kill('SIGTERM');};
process.once('SIGINT',stop);process.once('SIGTERM',stop);
const run=(args:string[],log:string)=>new Promise<void>((resolve,reject)=>{if(stopped){reject(Error('Cinematic render cancelled'));return;}const fd=openSync(log,'w'),child=spawn('ffmpeg',args,{stdio:['ignore',fd,fd]});closeSync(fd);children.add(child);child.once('error',e=>{children.delete(child);reject(e);});child.once('exit',code=>{children.delete(child);code===0?resolve():reject(Error('FFmpeg failed; see '+log));});});
const probe=(path:string)=>readProbe(path);
function readProbe(path:string){return JSON.parse(execFileSync('ffprobe',['-v','error','-select_streams','v:0','-count_frames','-show_entries','stream=width,height,pix_fmt,codec_name,avg_frame_rate,nb_read_frames','-of','json',path],{encoding:'utf8'})).streams[0];}
const renderFormat=async(kind:Kind)=>{
 const started=Date.now(),viewport=REVISION_VIEWPORTS[kind];
 const composition=await selectComposition({serveUrl,id:kind==='youtube'?'MidnightYouTubeViewport':'MidnightTikTokViewport'});
 const receipts=[];
 for(const chunk of chunks){
  const output=`evidence/cinematic/${kind}-part-${chunk.part}.mkv`,receiptPath=`evidence/cinematic/${kind}-part-${chunk.part}.json`;
  let receipt=existsSync(receiptPath)&&existsSync(output)?read(receiptPath):null;
  const resume=receipt?.frozenInputManifestSha256===frozenHash&&receipt.start===chunk.start&&receipt.end===chunk.end&&receipt.sha256===await hash(output);
  if(!resume){let last=0;
   await renderMedia({serveUrl,composition,cancelSignal,outputLocation:output,codec:'h264',crf:1,x264Preset:'ultrafast',pixelFormat:'yuv444p',imageFormat:'png',colorSpace:'bt709',muted:true,scale:2,concurrency:3,frameRange:[chunk.start,chunk.end],ffmpegOverride:({args})=>{const a=[...args],i=a.indexOf('-crf');if(i>=0)a[i+1]='0';return a;},onProgress:p=>{if(Date.now()-last>15000){last=Date.now();console.log(JSON.stringify({kind,part:chunk.part,rendered:p.renderedFrames,encoded:p.encodedFrames,seconds:(Date.now()-started)/1000}));}}});
   const stream=probe(output);assert.equal(Number(stream.nb_read_frames),chunk.end-chunk.start+1);assert.equal(stream.width,viewport.width*2);assert.equal(stream.height,viewport.height*2);assert.equal(stream.pix_fmt,'yuv444p');assert.equal(stream.avg_frame_rate,'60/1');
   receipt={kind,...chunk,frames:chunk.end-chunk.start+1,scale:2,output,stream,frozenInputManifestSha256:frozenHash,sha256:await hash(output)};
   writeFileSync(receiptPath,JSON.stringify(receipt,null,2));
  }else console.log(JSON.stringify({kind,part:chunk.part,resumed:true}));
  receipts.push(receipt);
 }
 await verifyFrozen();
 const concat=`evidence/cinematic/${kind}-concat.txt`;
 writeFileSync(concat,chunks.map(c=>`file '${kind}-part-${c.part}.mkv'\n`).join(''));
 const viewportMaster=`evidence/cinematic/${kind}-viewport-lossless.mkv`;
 await run(['-y','-v','warning','-f','concat','-safe','0','-i',concat,'-map','0:v:0','-c','copy',viewportMaster],`evidence/cinematic/${kind}-concat.log`);
 const output=`evidence/${kind}-master-lossless.mkv`;
 const baseMaster=oldMasters.find(m=>m.kind===kind);assert(baseMaster);assert.equal(await hash(baseMaster.path),baseMaster.sha256,'Original lossless base changed before compositing');
 const filter=`[0:v]settb=1/60,setpts=N[base];[1:v]settb=1/60,setpts=N[patch];[base][patch]overlay=x=${viewport.x*2}:y=${viewport.y*2}:format=yuv444:eof_action=endall:repeatlast=0:ts_sync_mode=nearest,trim=end_frame=${FRAMES},setpts=N/(60*TB)[v]`;
 await run(['-y','-v','warning','-threads','2','-i',`../midnight-love/evidence/${kind}-master-lossless.mkv`,'-threads','2','-i',viewportMaster,'-filter_complex_threads','2','-filter_complex',filter,'-map','[v]','-frames:v',String(FRAMES),'-an','-c:v','libx264','-threads','3','-preset','ultrafast','-crf','0','-pix_fmt','yuv444p','-color_primaries','bt709','-color_trc','bt709','-colorspace','bt709','-color_range','tv','-r','60','-fps_mode','cfr',output],`evidence/cinematic/${kind}-composite.log`);
 assert.equal(await hash(baseMaster.path),baseMaster.sha256,'Original lossless base changed during compositing');
 const stream=probe(output);assert.equal(Number(stream.nb_read_frames),FRAMES);assert.equal(stream.width,viewport.fullWidth*2);assert.equal(stream.height,viewport.fullHeight*2);assert.equal(stream.pix_fmt,'yuv444p');assert.equal(stream.avg_frame_rate,'60/1');
 const timestamps=JSON.parse(execFileSync('ffprobe',['-v','error','-select_streams','v:0','-show_frames','-show_entries','frame=best_effort_timestamp_time','-of','json',output],{encoding:'utf8',maxBuffer:4*1024*1024})).frames;
 assert.equal(timestamps.length,FRAMES);assert.equal(Number(timestamps[0].best_effort_timestamp_time),0);
 let maxTimestampErrorSeconds=0;
 for(const [frame,row] of timestamps.entries()){const error=Math.abs(Number(row.best_effort_timestamp_time)-frame/FPS);assert(error<=.000501,'Incorrect lossless master cadence at frame '+frame);maxTimestampErrorSeconds=Math.max(maxTimestampErrorSeconds,error);}
 return {kind,seconds:(Date.now()-started)/1000,chunks:receipts,viewportMaster,viewportSha256:await hash(viewportMaster),output,outputSha256:await hash(output),stream,maxTimestampErrorSeconds,losslessTimestampLimit:'Half the Matroska 1 ms timestamp tick; final MP4 is checked separately against the exact 60 fps clock.'};
};
let initialError:unknown;
const outcomes=await Promise.allSettled(kinds.map(kind=>renderFormat(kind).catch(e=>{initialError??=e;stop();throw e;})));
if(initialError!==undefined)throw initialError;
for(const result of outcomes)if(result.status==='rejected')throw result.reason;
await verifyFrozen();
assert(!stopped,'Cinematic render cancelled before completion receipt');
writeFileSync('evidence/cinematic-rebuild.json',JSON.stringify({passed:true,preflight,formats:outcomes.map(r=>r.status==='fulfilled'?r.value:null),method:'Every frame of the complete lyric viewport is independently reconstructed from the final full-frame Film at 2x. Opaque YUV444 compositing on exact integer 1/60 timestamps replaces all former typography and its backdrop. The original lossless pixels remain outside the viewport. Final delivery downsampling and AAC packet-copy are separate steps.',verificationPending:'Run cinematic decoded-pixel comparisons, delivery encoding, full media verification and final visual review before publication.'},null,2));
console.log('Both cinematic lossless masters are ready for pixel verification and delivery encoding.');
