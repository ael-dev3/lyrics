import {bundle} from '@remotion/bundler';
import {renderMedia,selectComposition,makeCancelSignal} from '@remotion/renderer';
import {resolve} from 'node:path';
import {mkdirSync,writeFileSync,readFileSync,createReadStream,openSync,closeSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {spawn,execFileSync,type ChildProcess} from 'node:child_process';
import assert from 'node:assert/strict';
import {FPS,FRAMES} from '../src/config.ts';
import {parseCues} from '../src/schema.ts';
import {displayWindow} from '../src/timing.ts';
const patches=[{id:'focus',start:33*FPS,end:39*FPS-1},{id:'onset',start:77*FPS,end:84*FPS-1},{id:'ending',start:150*FPS,end:FRAMES-1}];
const options={scale:2,totalConcurrency:6,tabsPerFormat:3,patches};
mkdirSync('evidence',{recursive:true});
execFileSync('npm',['run','typecheck'],{stdio:'inherit'});
execFileSync(process.execPath,['scripts/check.ts'],{stdio:'inherit'});
const cues=parseCues(JSON.parse(readFileSync('src/cues.json','utf8'))),oldCues=parseCues(JSON.parse(readFileSync('../midnight-love/src/cues.json','utf8')));
for(const kind of ['YouTube','TikTok']){const audit:unknown=JSON.parse(readFileSync(`evidence/layout-${kind}.json`,'utf8'));assert(audit&&typeof audit==='object'&&'allInsideSafeAreas' in audit&&audit.allInsideSafeAreas===true&&'checkedStates' in audit&&audit.checkedStates===cues.length*2);}
const smooth=(a:number,b:number,x:number)=>{const q=Math.min(1,Math.max(0,(x-a)/Math.max(.0001,b-a)));return q*q*(3-2*q);};
const lyricState=(data:typeof cues,f:number)=>{const sample=f*800,index=data.findIndex((c,i)=>{const d=displayWindow(c,data[i-1],data[i+1]);return sample>=d.start&&sample<d.end;});const c=data[index];if(!c)return null;const d=displayWindow(c,data[index-1],data[index+1]);return {index,words:c.words.map(w=>w.text),opacity:smooth(d.start,d.settled,sample)*(1-smooth(c.endSample,d.end,sample)),active:c.words.map((_,i)=>c.groups.some(g=>g.includes(i)&&f>=Math.round(Math.min(...g.map(j=>c.words[j]?.startSample??0))/800)&&f<Math.round(Math.max(...g.map(j=>c.words[j]?.endSample??0))/800)))};};
let preservedStates=0;
for(let f=0;f<FRAMES;f++)if(!patches.some(p=>f>=p.start&&f<=p.end)){assert.deepEqual(lyricState(cues,f),lyricState(oldCues,f),'Uncovered presentation change atframe'+f);preservedStates++;}
const oldFilm=readFileSync('../midnight-love/src/Film.tsx','utf8'),newFilm=readFileSync('src/Film.tsx','utf8');
assert.equal(newFilm,oldFilm.replace('!cue&&f>181*FPS','!cue&&f>188*FPS').replace('smooth(181*FPS,183*FPS,f)','smooth(188*FPS,190*FPS,f)'),'Unexpected composition change outside the ending');
const originalInputs:unknown=JSON.parse(readFileSync('../midnight-love/evidence/render-inputs.json','utf8'));
assert(originalInputs&&typeof originalInputs==='object'&&'inputs' in originalInputs&&Array.isArray(originalInputs.inputs));
const hash=async(p:string)=>{const h=createHash('sha256');for await(const b of createReadStream(p))h.update(b);return h.digest('hex');};
for(const p of originalInputs.inputs){assert(p&&typeof p.path==='string'&&typeof p.sha256==='string');if(['src/Film.tsx','src/cues.json','package-lock.json'].includes(p.path))continue;assert.equal(await hash(p.path),p.sha256,'Changed preserved input '+p.path);}
execFileSync(process.execPath,['scripts/record-render-inputs.ts'],{stdio:'inherit'});
const oldLosslessMasterSha256={youtube:await hash('../midnight-love/evidence/youtube-master-lossless.mkv'),tiktok:await hash('../midnight-love/evidence/tiktok-master-lossless.mkv')};
const serveUrl=await bundle({entryPoint:resolve('src/index.tsx')}),{cancelSignal,cancel}=makeCancelSignal();
const children=new Set<ChildProcess>();let stopped=false;
const stop=()=>{if(stopped)return;stopped=true;cancel();for(const child of children)child.kill('SIGTERM');};
process.once('SIGINT',stop);process.once('SIGTERM',stop);
const run=(args:string[],log:string)=>new Promise<void>((resolve,reject)=>{if(stopped){reject(Error('Revision cancelled'));return;}const fd=openSync(log,'w'),child=spawn('ffmpeg',args,{stdio:['ignore',fd,fd]});closeSync(fd);children.add(child);child.once('error',e=>{children.delete(child);reject(e);});child.once('exit',code=>{children.delete(child);code===0?resolve():reject(Error('FFmpeg failed; see '+log));});});
const renderFormat=async(kind:string)=>{
 const composition=await selectComposition({serveUrl,id:kind==='tiktok'?'MidnightTikTok':'MidnightYouTube'}),started=Date.now();
 for(const p of patches){let last=0;
  await renderMedia({serveUrl,composition,cancelSignal,outputLocation:`evidence/${kind}-${p.id}-lossless.mkv`,codec:'h264',crf:1,x264Preset:'ultrafast',pixelFormat:'yuv444p',imageFormat:'png',colorSpace:'bt709',muted:true,scale:2,concurrency:3,frameRange:[p.start,p.end],ffmpegOverride:({args})=>{const a=[...args],i=a.indexOf('-crf');if(i>=0)a[i+1]='0';return a;},onProgress:pct=>{if(Date.now()-last>15000){last=Date.now();console.log(JSON.stringify({kind,patch:p.id,rendered:pct.renderedFrames,encoded:pct.encodedFrames,seconds:(Date.now()-started)/1000}));}}});
 }
 // All three streams use exact 1/60 timestamps before framesync. Opaque,
 // same-size yuv444 patches replace only their declared global frame ranges.
 const filter='[0:v]settb=1/60,setpts=N[base];[1:v]settb=1/60,setpts=N+1980[p1];[2:v]settb=1/60,setpts=N+4620[p2];[base][p1]overlay=x=0:y=0:format=yuv444:eof_action=pass:repeatlast=0:ts_sync_mode=nearest:enable=gte(t\\,33)*lt(t\\,39)[a];[a][p2]overlay=x=0:y=0:format=yuv444:eof_action=pass:repeatlast=0:ts_sync_mode=nearest:enable=gte(t\\,77)*lt(t\\,84)[b];[b]trim=end_frame=9000,setpts=N/(60*TB)[v]';
 await run(['-y','-v','warning','-threads','2','-i',`../midnight-love/evidence/${kind}-master-lossless.mkv`,'-threads','2','-i',`evidence/${kind}-focus-lossless.mkv`,'-threads','2','-i',`evidence/${kind}-onset-lossless.mkv`,'-filter_complex_threads','2','-filter_complex',filter,'-map','[v]','-frames:v','9000','-an','-c:v','libx264','-threads','3','-preset','ultrafast','-crf','0','-pix_fmt','yuv444p','-color_primaries','bt709','-color_trc','bt709','-colorspace','bt709','-color_range','tv','-r','60','-fps_mode','passthrough',`evidence/${kind}-prefix-lossless.mkv`],`evidence/${kind}-prefix-merge.log`);
 writeFileSync(`evidence/${kind}-revision-concat.txt`,`file '${kind}-prefix-lossless.mkv'\nfile '${kind}-ending-lossless.mkv'\n`);
 await run(['-y','-v','warning','-f','concat','-safe','0','-i',`evidence/${kind}-revision-concat.txt`,'-map','0:v:0','-c','copy',`evidence/${kind}-master-lossless.mkv`],`evidence/${kind}-revision-concat.log`);
 return {kind,frames:FRAMES,rerenderedFrames:patches.reduce((n,p)=>n+p.end-p.start+1,0),seconds:(Date.now()-started)/1000};
};
const outcomes=await Promise.allSettled(['youtube','tiktok'].map(kind=>renderFormat(kind).catch(error=>{stop();throw error;})));
for(const result of outcomes)if(result.status==='rejected')throw result.reason;
const frozen:unknown=JSON.parse(readFileSync('evidence/render-inputs.json','utf8'));assert(frozen&&typeof frozen==='object'&&'inputs' in frozen&&Array.isArray(frozen.inputs));for(const p of frozen.inputs){assert(p&&typeof p.path==='string'&&typeof p.sha256==='string');assert.equal(await hash(p.path),p.sha256,'Frozen input changed during render: '+p.path);}
writeFileSync('evidence/revision-rebuild.json',JSON.stringify({previousRelease:'midnight-love-v1.0.0',fps:FPS,options,preservedFrameStates:preservedStates,oldLosslessMasterSha256,outcomes:outcomes.map(o=>o.status==='fulfilled'?o.value:null),method:'Render corrected33–39s,77–84s and150s–end at2x using global frame numbers. Opaque same-format patches replace two earlier windows on the old lossless master with exact1/60 timestamp synchronization. Concatenate the corrected lossless prefix and ending before one final delivery downsample/encode. Sourceaudio,sourcefootage,measuredfeatures and all undeclared presentation states are unchanged.'},null,2));
console.log('Corrected lossless masters are ready.');
