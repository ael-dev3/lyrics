import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {resolve,basename} from 'node:path';
import {fileURLToPath} from 'node:url';
import {createCanvas} from '@napi-rs/canvas';
import {createPainter,rawFrames,watchChild,fileHash,root,dimensions,read,renderClock,movieName,type Recording} from './render-production.ts';
import {checkCurrentProductionAuthorization} from './production-authorization.ts';
import {verifyAudio} from './verify-audio.ts';
import {layoutCue,cueOpacity} from '../src/scene.ts';
import type {Format,Cue,Timeline} from '../src/model.ts';

async function command(bin:string,args:string[],limit=64*1024*1024){
 const child=spawn(bin,args,{stdio:['ignore','pipe','pipe']}),parts:Buffer[]=[];let bytes=0,stderr='';
 child.stdout.on('data',b=>{bytes+=b.length;if(bytes>limit)child.kill();else parts.push(b)});child.stderr.on('data',b=>{stderr+=String(b)});
 await new Promise<void>((ok,fail)=>{child.once('error',fail);child.once('close',code=>code===0&&bytes<=limit?ok():fail(Error(`${bin} failed: ${stderr.slice(-3000)}`)))});
 return {stdout:Buffer.concat(parts),stderr};
}
const probe=async(path:string,args:string[])=>JSON.parse((await command('ffprobe',['-v','error',...args,'-of','json',path])).stdout.toString('utf8'));
const focus=[246,244,239],neutral=[184,184,182];
type Mask={id:string;kind:'source'|'target';index:number;cue:Cue;points:number[]};
export function masks(cue:Cue,format:Format):Mask[]{
 const size=dimensions(format),canvas=createCanvas(size.width,size.height),ctx=canvas.getContext('2d'),layout=layoutCue(ctx as unknown as CanvasRenderingContext2D,cue,format),result:Mask[]=[];
 ctx.font=`600 ${layout.size}px Cormorant`;ctx.textBaseline='alphabetic';ctx.fillStyle='#fff';
 for(const [slots,kind] of [[layout.source,'source'],[layout.target,'target']] as const)for(const s of slots){
  ctx.clearRect(0,0,size.width,size.height);ctx.fillText(s.text,s.x,s.y);
  const x0=Math.max(0,Math.floor(s.x)-2),y0=Math.max(0,Math.floor(s.y-layout.size*1.1)),w=Math.min(size.width-x0,Math.ceil(s.width)+5),h=Math.min(size.height-y0,Math.ceil(layout.size*1.45)),data=ctx.getImageData(x0,y0,w,h).data,points:number[]=[],cells:number[]=[];
  for(let y=1;y<h-1;y++)for(let x=1;x<w-1;x++){
   const p=(y*w+x)*4,global=((y+y0)*size.width+x+x0)*4;
   if([p-w*4-4,p-w*4,p-w*4+4,p-4,p,p+4,p+w*4-4,p+w*4,p+w*4+4].every(a=>data[a+3]!>=250))points.push(global);
   const cx=Math.floor((x+x0)/2)*2-x0,cy=Math.floor((y+y0)/2)*2-y0,cell=(cy*w+cx)*4;
   if([cell,cell+4,cell+w*4,cell+w*4+4].every(a=>data[a+3]===255))cells.push(global);
  }
  // Eroded 3x3 alpha plus complete aligned 2x2 cells exclude shadow and
  // 4:2:0 chroma-edge mixtures; thin letters use complete opaque cells.
  const cellSet=new Set(cells),interior=points.filter(p=>cellSet.has(p));
  const chosen=interior.length>=4?interior:cells;assert.ok(chosen.length>=4,`Empty glyph mask ${cue.id}/${kind}/${s.index}`);
  result.push({id:kind==='source'?cue.words[s.index]!.id:cue.targets[s.index]!.id,kind,index:s.index,cue,points:chosen});
 }
 return result;
}
function expectedFocus(mask:Mask,n:number,shift=0){
 const sample=n*800-shift;const active=(i:number)=>sample>=mask.cue.words[i]!.startSample&&sample<mask.cue.words[i]!.endSample;
 return mask.kind==='source'?active(mask.index):mask.cue.targets[mask.index]!.focusSourceIndices.some(active);
}
export function glyphClassification(bytes:Buffer,mask:Mask,active:boolean,opacity:number,reference:Buffer,referenceActive=active){
 const chosen=active?focus:neutral,other=active?neutral:focus,anchor=referenceActive?focus:neutral;
 let matching=0,decisive=0,nearReference=0;
 for(const p of mask.points){let a=0,b=0;for(let c=0;c<3;c++){
  const selected=reference[p+c]!+opacity*(chosen[c]!-anchor[c]!);
  const alternative=reference[p+c]!+opacity*(other[c]!-anchor[c]!);
  a+=(bytes[p+c]!-selected)**2;b+=(bytes[p+c]!-alternative)**2;
 }
  const correct=Math.sqrt(a),opposite=Math.sqrt(b);if(correct<42)nearReference++;
  if(Math.abs(correct-opposite)>=9){decisive++;if(correct<42&&correct<opposite)matching++}
 }
 const decisiveFraction=decisive/mask.points.length,referenceFraction=nearReference/mask.points.length;
 return {score:decisiveFraction>=.75&&referenceFraction>=.90?matching/decisive:0,decisiveFraction,referenceFraction};
}
export function classify(bytes:Buffer,mask:Mask,active:boolean,opacity:number,reference:Buffer,referenceActive=active){
 return glyphClassification(bytes,mask,active,opacity,reference,referenceActive).score;
}
function clearMatch(bytes:Buffer,mask:Mask,reference:Buffer){
 let matching=0;for(const p of mask.points){let d=0;for(let c=0;c<3;c++)d+=(bytes[p+c]!-reference[p+c]!)**2;if(Math.sqrt(d)<42)matching++}
 return matching/mask.points.length;
}
const balanced=(rows:number[]):string=>{if(rows.length===1)return `eq(n\\,${rows[0]})`;const m=Math.floor(rows.length/2);return `(${balanced(rows.slice(0,m))}+${balanced(rows.slice(m))})`};

async function main(){
 const at=process.argv.indexOf('--format'),format=process.argv[at+1];if(at<0||(format!=='landscape'&&format!=='portrait'))throw Error('Use --format landscape|portrait.');
 const approved=checkCurrentProductionAuthorization();
 const size=dimensions(format),file=movieName(format),path=resolve(root,'renders',file),source=resolve(root,'public/source.mp4'),recording=read<Recording>('source/recording.json'),timeline=read<Timeline>('public/timeline.json'),totalFrames=renderClock(recording).outputFrames;
 const receipt=read<any>('renders/'+file+'.json');assert.deepEqual(receipt.identity,approved.identity);assert.equal(receipt.sha256,await fileHash(path),'Render receipt hash differs.');
 console.log(JSON.stringify({phase:'encoded metadata, every-frame PTS and full decode',format}));
 const meta=await probe(path,['-show_streams','-show_format']);const v=meta.streams.find((s:any)=>s.codec_type==='video'),a=meta.streams.find((s:any)=>s.codec_type==='audio');
 assert.equal(v.width,size.width);assert.equal(v.height,size.height);assert.equal(v.r_frame_rate,'60/1');assert.equal(v.pix_fmt,'yuv420p');assert.equal(v.sample_aspect_ratio,'1:1');assert.equal(v.codec_name,'h264');assert.equal(v.color_space,'bt709');assert.equal(v.color_range,'tv');assert.equal(v.color_transfer,'bt709');assert.equal(v.color_primaries,'bt709');assert.equal(v.time_base,'1/60000');assert.ok(Math.abs(Number(v.duration)-11701/60)<.000001);assert.equal(Number(v.nb_frames),11701);assert.equal(a.codec_name,'aac');assert.equal(Number(a.sample_rate),48000);assert.equal(a.channels,2);assert.equal(Number(v.start_time),0);assert.equal(Number(a.start_time),0);
 const frames=(await probe(path,['-select_streams','v:0','-show_frames','-show_entries','frame=best_effort_timestamp_time'])).frames;assert.equal(frames.length,totalFrames);for(let n=0;n<frames.length;n++)assert.ok(Math.abs(Number(frames[n].best_effort_timestamp_time)-n/60)<.000001,`PTS ${n}`);
 const decode=await command('ffmpeg',['-hide_banner','-v','info','-nostats','-xerror','-err_detect','explode','-i',path,'-map','0:v:0','-map','0:a:0','-vf','blackdetect=d=0.015:pix_th=0.03:pic_th=0.98','-f','null','-']);assert.ok(!decode.stderr.includes('black_start:'),'Unexpected black frame interval.');
 console.log(JSON.stringify({phase:'original recording / delivery AAC zero-offset and quality checks',format}));
 const audioVerification=verifyAudio(source,path);
 const painter=await createPainter(format);
 const selected=new Set<number>([0,1128,1710,2280,2700,3888,5172,5790,7188,8160,8820,9720,10560,11220,totalFrames-1]),maskMap=new Map(timeline.cues.map(c=>[c.id,masks(c,format)])),seen=new Map<string,Set<boolean>>(),controls=new Set<string>();
 for(const c of timeline.cues)for(const w of c.words){for(const n of [Math.ceil(w.startSample/800)-1,Math.ceil(w.startSample/800),Math.floor((w.startSample+w.endSample)/1600),Math.ceil(w.endSample/800)-1,Math.ceil(w.endSample/800)])if(n>=0&&n<totalFrames)selected.add(n)}
 for(let n=0;n<totalFrames;n+=12)if(!timeline.cues.some(c=>n/60>=c.visibleStart&&n/60<c.visibleEnd))selected.add(n);
 // Enumerate states that actually exist, including readable fades. A cue
 // that appears already focused and clears at vocal handoff has no neutral
 // lifetime; verify its clear/handoff pixels rather than inventing one.
 const possible=new Map<string,Map<boolean,number>>(),clearFrames=new Map<number,Mask[]>();
 for(const c of timeline.cues){
  const ms=maskMap.get(c.id)!;
  for(let n=Math.max(0,Math.floor(c.visibleStart*60));n<Math.min(totalFrames,Math.ceil(c.visibleEnd*60));n++){
   if(cueOpacity(c,n/60)<.95)continue;
   for(const m of ms){if(!possible.has(m.id))possible.set(m.id,new Map());const state=expectedFocus(m,n),states=possible.get(m.id)!;if(!states.has(state))states.set(state,n)}
  }
  for(const m of ms){const states=possible.get(m.id);assert(states,`No readable state ${m.id}`);assert(states.has(true),`No readable focused state ${m.id}`);for(const n of states.values())selected.add(n);
   if(!states.has(false))for(const n of [Math.max(0,Math.ceil(c.visibleStart*60)-1),Math.min(totalFrames-1,Math.ceil(c.visibleEnd*60))]){
    selected.add(n);if(!clearFrames.has(n))clearFrames.set(n,[]);clearFrames.get(n)!.push(m);
   }
  }
 }
 const indices=[...selected].sort((a,b)=>a-b),decoder=spawn('ffmpeg',['-v','error','-nostdin','-threads','2','-filter_threads','1','-i',path,'-vf',`select=${balanced(indices)}`,'-fps_mode','passthrough','-pix_fmt','rgba','-f','rawvideo','pipe:1'],{stdio:['pipe','pipe','pipe']});decoder.stdin.end();const done=watchChild(decoder,'Selected final decoder');let count=0,glyphChecks=0,minMatch=1,maxMae=0,maxLarge=0,gapFrames=0,maxGapMae=0,maxGapLarge=0,clearStateGlyphChecks=0,minDecisiveFraction=1,minReferenceFraction=1;
 const nativeIndices=[...new Set(indices.map(n=>Math.min(renderClock(recording).sourceFrames-1,Math.floor(n*5/12))))];
 const nativeDecoder=spawn('ffmpeg',['-v','error','-nostdin','-threads','2','-filter_threads','1','-i',source,'-vf',`select=${balanced(nativeIndices)}`,'-fps_mode','passthrough','-pix_fmt','rgba','-f','rawvideo','pipe:1'],{stdio:['pipe','pipe','pipe']});
 nativeDecoder.stdin.end();const nativeDone=watchChild(nativeDecoder,'Selected native decoder'),nativePictures=rawFrames(nativeDecoder,1080*1080*4)[Symbol.asyncIterator]();
 let reference:Buffer|undefined,nativeFrame=-1,nativeCount=0;
 console.log(JSON.stringify({phase:'decoded bilingual focus and shared-scene comparison',format,selectedFrames:indices.length}));
 for await(const bytes of rawFrames(decoder,size.width*size.height*4)){
  const n=indices[count];assert.notEqual(n,undefined);const time=n!/60,cues=timeline.cues.filter(c=>time>=c.visibleStart&&time<c.visibleEnd);
  const wanted=Math.min(renderClock(recording).sourceFrames-1,Math.floor(n!*5/12));
  if(wanted!==nativeFrame){const next=await nativePictures.next();assert.equal(next.done,false);assert.equal(nativeIndices[nativeCount],wanted);reference=next.value;nativeFrame=wanted;nativeCount++;}
  assert.ok(reference);const expected=painter.paint(reference,n!);let sum=0,large=0,total=0;
  for(let p=0;p<bytes.length;p+=16)for(let j=0;j<3;j++){const e=Math.abs(bytes[p+j]!-expected[p+j]!);sum+=e;total++;if(e>24)large++}
  const mae=sum/total,fraction=large/total;assert.ok(mae<=7&&fraction<=.04,`Scene mismatch ${n}: ${mae}/${fraction}`);maxMae=Math.max(mae,maxMae);maxLarge=Math.max(fraction,maxLarge);
  if(cues.length===0){
   const x0=format==='landscape'?155:115,y0=format==='landscape'?26:1430,x1=format==='landscape'?1765:965,y1=format==='landscape'?328:1770;
   let gapSum=0,gapLarge=0,gapTotal=0;
   for(let y=y0;y<y1;y+=2)for(let x=x0;x<x1;x+=2)for(let ch=0;ch<3;ch++){const p=(y*size.width+x)*4+ch,e=Math.abs(bytes[p]!-expected[p]!);gapSum+=e;gapTotal++;if(e>24)gapLarge++}
   const mae=gapSum/gapTotal,large=gapLarge/gapTotal;assert.ok(mae<=3&&large<=.001,`Unexpected encoded reading-area detail in known gap at ${n}: ${mae}/${large}`);
   gapFrames++;maxGapMae=Math.max(maxGapMae,mae);maxGapLarge=Math.max(maxGapLarge,large);
  }
  for(const c of cues){const opacity=cueOpacity(c,time);if(opacity<.95)continue;for(const m of maskMap.get(c.id)!){
   const active=expectedFocus(m,n!),details=glyphClassification(bytes,m,active,opacity,expected),fraction=details.score;
   minDecisiveFraction=Math.min(minDecisiveFraction,details.decisiveFraction);minReferenceFraction=Math.min(minReferenceFraction,details.referenceFraction);
   assert.ok(fraction>=.90,`Decoded focus ${m.id} at ${n}: ${active?'pearl focus':'stone neutral'} ${fraction}`);minMatch=Math.min(minMatch,fraction);glyphChecks++;
   if(!seen.has(m.id))seen.set(m.id,new Set());seen.get(m.id)!.add(active);
   if(c.words.some(w=>n===Math.ceil(w.startSample/800))&&active&&!expectedFocus(m,n!,4800)){
    assert.ok(classify(bytes,m,false,opacity,expected,true)<.90,`Delayed timing control escaped ${m.id}`);controls.add(m.id);
   }
  }}
  for(const m of clearFrames.get(n!)??[]){assert.ok(clearMatch(bytes,m,expected)>=.90,`Cleared/handoff glyph pixels differ ${m.id} at ${n}`);clearStateGlyphChecks++}
  count++;if(count%200===0)console.log(JSON.stringify({format,verifiedSelectedFrames:count,total:indices.length}));
 }
 await done;assert.equal(count,indices.length);const nativeEnd=await nativePictures.next();assert.equal(nativeEnd.done,true);await nativeDone;assert.equal(nativeCount,nativeIndices.length);assert.ok(gapFrames>50);
 for(const [id,states] of possible)for(const state of states.keys())assert.ok(seen.get(id)?.has(state),`Missing visible focus-state evidence ${id}/${state}`);
 assert.ok(controls.size>=timeline.cues.length,'Insufficient deliberately delayed timing controls.');
 const result={status:'pass',verifierSha256:await fileHash(resolve(root,'scripts/verify-final.ts')),file,sha256:await fileHash(path),format,width:size.width,height:size.height,frames:frames.length,fps:60,videoDurationSeconds:Number(v.duration),audioDurationSeconds:Number(a.duration),audioVerification,everyFramePtsVerified:true,fullStrictDecode:true,blackIntervals:[],selectedSceneFrames:count,glyphStateChecks:glyphChecks,sourceAndTargetTokensVerified:possible.size,tokensSeenFocusedAndNeutral:[...possible.values()].filter(x=>x.has(false)).length,continuousFocusTokens:[...possible].filter(([,states])=>!states.has(false)).map(([id])=>id),clearStateGlyphChecks,allVisibleTokenFocusStatesCovered:true,deliberatelyDelayedTimingControls:controls.size,minimumMatchingGlyphFraction:minMatch,minimumDecisiveGlyphFraction:minDecisiveFraction,minimumNearReferenceGlyphFraction:minReferenceFraction,classificationMethod:'At least 75% of chroma-aware eroded glyph samples must be decisive; at least 90% of decisive samples must favor the expected focus and 90% of all samples must match the painted reference. Word colors are tested from 95% line opacity; complete selected-scene comparisons cover fades.',maximumSceneMeanAbsoluteRgbError:maxMae,maximumSceneFractionChannelsOver24:maxLarge,sampledReadingGapFrames:gapFrames,maximumGapReadingAreaMeanAbsoluteRgbError:maxGapMae,maximumGapReadingAreaFractionChannelsOver24:maxGapLarge,sceneComparisonReference:'Exact original decoded source picture min(4873, floor(outputFrame*5/12)) for every selected encoded output frame. All 4874 native pictures are decoded in production; the final real picture covers the complete source audio tail.',nativeSourceComparisonPictures:nativeCount,listeningGateComplete:approved.listeningGateComplete,sourceSha256:recording.sourceSha256,revision:approved.identity.revision,timelineSha256:approved.identity.timelineSha256,sceneSha256:approved.identity.sceneSha256,producerAdapters:receipt.adapters,limits:'Encoded technical checks verify selected timing display and preserved audio; they do not certify millisecond acoustic perception or a complete listening attestation.'};
 assert.deepEqual(checkCurrentProductionAuthorization().identity,approved.identity,'Frozen identity changed during final verification.');
 mkdirSync(resolve(root,'evidence'),{recursive:true});writeFileSync(resolve(root,`evidence/final-${format}-verification.json`),JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify(result));
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url))main().catch(e=>{console.error(String(e));process.exitCode=1});
