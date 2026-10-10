import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {resolve,basename} from 'node:path';
import {createCanvas,loadImage} from '@napi-rs/canvas';
import {createPainter,rawFrames,watchChild,fileHash,root,dimensions,read,renderClock,type Recording} from './render-production.ts';
import {cueLayout,cueOpacity} from '../src/scene.ts';
import type {Format,Cue,Timeline} from '../src/model.ts';

async function command(bin:string,args:string[],limit=64*1024*1024){
 const child=spawn(bin,args,{stdio:['ignore','pipe','pipe']}),parts:Buffer[]=[];let bytes=0,stderr='';
 child.stdout.on('data',b=>{bytes+=b.length;if(bytes>limit)child.kill();else parts.push(b)});child.stderr.on('data',b=>{stderr+=String(b)});
 await new Promise<void>((ok,fail)=>{child.once('error',fail);child.once('close',code=>code===0&&bytes<=limit?ok():fail(Error(`${bin} failed: ${stderr.slice(-3000)}`)))});
 return {stdout:Buffer.concat(parts),stderr};
}
const probe=async(path:string,args:string[])=>JSON.parse((await command('ffprobe',['-v','error',...args,'-of','json',path])).stdout.toString('utf8'));
const focus=[255,212,147],neutral=[220,225,229];
type Mask={id:string;kind:'source'|'target';index:number;cue:Cue;points:number[]};
function masks(cue:Cue,format:Format):Mask[]{
 const size=dimensions(format),canvas=createCanvas(size.width,size.height),ctx=canvas.getContext('2d'),layout=cueLayout(ctx as unknown as CanvasRenderingContext2D,cue,format),result:Mask[]=[];
 ctx.font=`600 ${layout.size}px Room`;ctx.textBaseline='alphabetic';ctx.fillStyle='#fff';
 for(const [slots,kind] of [[layout.source,'source'],[layout.target,'target']] as const)for(const s of slots){
  ctx.clearRect(0,0,size.width,size.height);ctx.fillText(s.text,s.x,s.y);
  const x0=Math.max(0,Math.floor(s.x)-2),y0=Math.max(0,Math.floor(s.y-layout.size*1.1)),w=Math.min(size.width-x0,Math.ceil(s.width)+5),h=Math.min(size.height-y0,Math.ceil(layout.size*1.45)),data=ctx.getImageData(x0,y0,w,h).data,points:number[]=[],cells:number[]=[];
  for(let y=1;y<h-1;y++)for(let x=1;x<w-1;x++){
   const p=(y*w+x)*4,global=((y+y0)*size.width+x+x0)*4;
   if([p,p-4,p+4,p-w*4,p+w*4].every(a=>data[a+3]!>=250))points.push(global);
   const cx=Math.floor((x+x0)/2)*2-x0,cy=Math.floor((y+y0)/2)*2-y0,cell=(cy*w+cx)*4;
   if([cell,cell+4,cell+w*4,cell+w*4+4].every(a=>data[a+3]===255))cells.push(global);
  }
  // Opaque interior alpha excludes shadow and chroma-edge mixtures.
  const chosen=points.length>=12?points:cells;assert.ok(chosen.length>=4,`Empty glyph mask ${cue.id}/${kind}/${s.index}`);
  result.push({id:kind==='source'?cue.words[s.index]!.id:cue.targets[s.index]!.id,kind,index:s.index,cue,points:chosen});
 }
 return result;
}
function expectedFocus(mask:Mask,n:number,shift=0){
 const sample=n*735-shift;const active=(i:number)=>sample>=mask.cue.words[i]!.startSample&&sample<mask.cue.words[i]!.endSample;
 return mask.kind==='source'?active(mask.index):mask.cue.targets[mask.index]!.focusSourceIndices.some(active);
}
function classify(bytes:Buffer,mask:Mask,active:boolean){
 const selected=active?focus:neutral,other=active?neutral:focus;let matching=0;
 for(const p of mask.points){let a=0,b=0;for(let c=0;c<3;c++){a+=(bytes[p+c]!-selected[c]!)**2;b+=(bytes[p+c]!-other[c]!)**2}if(Math.sqrt(a)<42&&Math.sqrt(a)+9<Math.sqrt(b))matching++}
 return matching/mask.points.length;
}
const balanced=(rows:number[]):string=>{if(rows.length===1)return `eq(n\\,${rows[0]})`;const m=Math.floor(rows.length/2);return `(${balanced(rows.slice(0,m))}+${balanced(rows.slice(m))})`};

async function main(){
 const at=process.argv.indexOf('--format'),format=process.argv[at+1];if(at<0||(format!=='landscape'&&format!=='portrait'))throw Error('Use --format landscape|portrait.');
 const size=dimensions(format),file=`Gde-Ty-Elli-Lampabikt-${format==='landscape'?'YouTube':'TikTok'}-${size.width}x${size.height}-60fps.mp4`,path=resolve(root,'renders',file),source=resolve(root,'public/source.mp4'),recording=read<Recording>('source/recording.json'),timeline=read<Timeline>('public/timeline.json'),totalFrames=renderClock(recording).outputFrames;
 console.log(JSON.stringify({phase:'encoded metadata, every-frame PTS and full decode',format}));
 const meta=await probe(path,['-show_streams','-show_format']);const v=meta.streams.find((s:any)=>s.codec_type==='video'),a=meta.streams.find((s:any)=>s.codec_type==='audio');
 assert.equal(v.width,size.width);assert.equal(v.height,size.height);assert.equal(v.r_frame_rate,'60/1');assert.equal(v.pix_fmt,'yuv420p');assert.equal(v.sample_aspect_ratio,'1:1');assert.equal(v.codec_name,'h264');assert.equal(v.color_space,'bt709');assert.equal(v.color_range,'tv');assert.equal(a.codec_name,'aac');assert.equal(Number(a.sample_rate),44100);assert.equal(a.channels,2);assert.equal(Number(v.start_time),0);assert.equal(Number(a.start_time),0);
 const frames=(await probe(path,['-select_streams','v:0','-show_frames','-show_entries','frame=best_effort_timestamp_time'])).frames;assert.equal(frames.length,totalFrames);for(let n=0;n<frames.length;n++)assert.ok(Math.abs(Number(frames[n].best_effort_timestamp_time)-n/60)<.000001,`PTS ${n}`);
 const decode=await command('ffmpeg',['-hide_banner','-v','info','-nostats','-xerror','-err_detect','explode','-i',path,'-map','0:v:0','-map','0:a:0','-vf','blackdetect=d=0.015:pix_th=0.03:pic_th=0.98','-f','null','-']);assert.ok(!decode.stderr.includes('black_start:'),'Unexpected black frame interval.');
 console.log(JSON.stringify({phase:'original audio packet and decoded PCM identity',format}));
 const packetArgs=['-select_streams','a:0','-show_packets','-show_data_hash','sha256','-show_entries','packet=pts,dts,duration,size,data_hash,side_data_list'];
 const originalPackets=(await probe(source,packetArgs)).packets,outputPackets=(await probe(path,packetArgs)).packets;assert.deepEqual(outputPackets,originalPackets,'AAC packet bytes or timestamps changed.');
 const sourcePcm=(await command('ffmpeg',['-v','error','-i',source,'-map','0:a:0','-vn','-acodec','pcm_f32le','-f','hash','-hash','sha256','-'])).stdout.toString().trim();
 const outputPcm=(await command('ffmpeg',['-v','error','-i',path,'-map','0:a:0','-vn','-acodec','pcm_f32le','-f','hash','-hash','sha256','-'])).stdout.toString().trim();assert.equal(outputPcm,sourcePcm,'Decoded source audio differs.');
 const painter=await createPainter(format),ref=await loadImage(resolve(root,'public/material-reference.png')),refCanvas=createCanvas(1080,1080);refCanvas.getContext('2d').drawImage(ref,0,0);const reference=refCanvas.data();
 const selected=new Set<number>([0,240,1497,5694,9564,11076,12030,totalFrames-1]),maskMap=new Map(timeline.cues.map(c=>[c.id,masks(c,format)])),seen=new Map<string,Set<boolean>>(),controls=new Set<string>();
 for(const c of timeline.cues)for(const w of c.words){for(const n of [Math.ceil(w.startSample/735)-1,Math.ceil(w.startSample/735),Math.floor((w.startSample+w.endSample)/1470),Math.ceil(w.endSample/735)-1,Math.ceil(w.endSample/735)])if(n>=0&&n<totalFrames)selected.add(n)}
 const indices=[...selected].sort((a,b)=>a-b),decoder=spawn('ffmpeg',['-v','error','-nostdin','-threads','2','-filter_threads','1','-i',path,'-vf',`select=${balanced(indices)}`,'-fps_mode','passthrough','-pix_fmt','rgba','-f','rawvideo','pipe:1'],{stdio:['pipe','pipe','pipe']});decoder.stdin.end();const done=watchChild(decoder,'Selected final decoder');let count=0,glyphChecks=0,minMatch=1,maxMae=0,maxLarge=0;
 console.log(JSON.stringify({phase:'decoded bilingual focus and shared-scene comparison',format,selectedFrames:indices.length}));
 for await(const bytes of rawFrames(decoder,size.width*size.height*4)){
  const n=indices[count];assert.notEqual(n,undefined);const time=n!/60,cues=timeline.cues.filter(c=>time>=c.visibleStart&&time<c.visibleEnd),expected=painter.paint(reference,n!);let sum=0,large=0,total=0;
  for(let p=0;p<bytes.length;p+=16)for(let j=0;j<3;j++){const e=Math.abs(bytes[p+j]!-expected[p+j]!);sum+=e;total++;if(e>24)large++}
  const mae=sum/total,fraction=large/total;assert.ok(mae<=7&&fraction<=.04,`Scene mismatch ${n}: ${mae}/${fraction}`);maxMae=Math.max(mae,maxMae);maxLarge=Math.max(fraction,maxLarge);
  for(const c of cues)if(cueOpacity(c,time)>=.999){for(const m of maskMap.get(c.id)!){const active=expectedFocus(m,n!),fraction=classify(bytes,m,active);assert.ok(fraction>=.90,`Decoded focus ${m.id} at ${n}: ${active?'gold':'neutral'} ${fraction}`);minMatch=Math.min(minMatch,fraction);glyphChecks++;if(!seen.has(m.id))seen.set(m.id,new Set());seen.get(m.id)!.add(active);
   if(n===Math.ceil(c.words[0]!.startSample/735)&&active&&!expectedFocus(m,n!,4410)){assert.ok(classify(bytes,m,false)<.90,`Delayed timing control escaped ${m.id}`);controls.add(m.id)}
  }}
  count++;if(count%200===0)console.log(JSON.stringify({format,verifiedSelectedFrames:count,total:indices.length}));
 }
 await done;assert.equal(count,indices.length);
 for(const c of timeline.cues)for(const token of [...c.words,...c.targets])assert.equal(seen.get(token.id)?.size,2,`Missing active/neutral evidence ${token.id}`);
 assert.ok(controls.size>=40,'Insufficient deliberately delayed timing controls.');
 const result={status:'pass',file,sha256:await fileHash(path),format,width:size.width,height:size.height,frames:frames.length,fps:60,videoDurationSeconds:Number(v.duration),audioDurationSeconds:Number(a.duration),sourceAudioPackets:originalPackets.length,audioPacketsIdentical:true,decodedPcmHash:outputPcm,decodedPcmIdentical:true,everyFramePtsVerified:true,fullStrictDecode:true,blackIntervals:[],selectedSceneFrames:count,glyphStateChecks:glyphChecks,allSourceAndTargetTokensSeenFocusedAndNeutral:timeline.cues.reduce((n,c)=>n+c.words.length+c.targets.length,0),deliberatelyDelayedTimingControls:controls.size,minimumMatchingGlyphFraction:minMatch,maximumSceneMeanAbsoluteRgbError:maxMae,maximumSceneFractionChannelsOver24:maxLarge,sceneComparisonReference:'Canonical held photograph; all 5,025 original frames were studied and decoded. Scene matching permits small original compression variations.',sourceSha256:recording.sourceSha256,timelineSha256:read<any>('public/preview-identity.json').timelineSha256,sceneSha256:read<any>('public/preview-identity.json').sceneSha256,limits:'Encoded technical checks verify selected timing display and preserved audio; they do not certify millisecond acoustic perception or a complete listening attestation.'};
 mkdirSync(resolve(root,'evidence'),{recursive:true});writeFileSync(resolve(root,`evidence/final-${format}-verification.json`),JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify(result));
}
main().catch(e=>{console.error(String(e));process.exitCode=1});
