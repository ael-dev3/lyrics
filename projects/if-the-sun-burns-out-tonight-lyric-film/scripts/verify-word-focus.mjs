#!/usr/bin/env node
// Encoded-pixel checks from frozen browser geometry. Deliberately does not import
// production-scene, its paint method, or the runtime cue/highlight selector.
import {readFileSync,writeFileSync,readdirSync,createReadStream} from 'node:fs';
import {createHash} from 'node:crypto';
import {spawn} from 'node:child_process';
import {resolve,relative,isAbsolute,basename,join} from 'node:path';
import {canvasApi} from './native-env.mjs';
const {createCanvas,GlobalFonts}=canvasApi;
const safePath=path=>{const rel=relative(resolve('.'),resolve(path));return !rel.startsWith('..')&&!isAbsolute(rel)?rel:basename(path);};
const args=process.argv.slice(2),arg=(k,d)=>args.includes(k)?args[args.indexOf(k)+1]:d;
const format=arg('--format','landscape'),input=arg('--input'),proofDir=arg('--proof-dir'),fps=Number(arg('--fps','60'));
if(!['landscape','portrait'].includes(format)||(!input&&!proofDir))throw Error('Use --input MASTER or --proof-dir DIRECTORY, plus --format landscape|portrait');
const timeline=JSON.parse(readFileSync('src/timeline.json')),layout=JSON.parse(readFileSync('src/production-layout.json'));
const cues=timeline.sections.flatMap(s=>s.lines).map((line,index,all)=>{
 const prior=index?all[index-1].words.at(-1).end:0,next=all[index+1];
 return{...line,index,displayStart:Math.max(prior,line.words[0].start-.18),displayEnd:Math.min(line.words.at(-1).end+.20,next?Math.max(line.words.at(-1).end,next.words[0].start-.18):Infinity)};
});
const [width,height]=format==='portrait'?[1080,1920]:[1920,818];
const [refWidth,refHeight,fontSize,spacing,wordHeight]=layout.reference[format],scale=width/refWidth,gap=format==='portrait'?6.8203125:8.2890625;
GlobalFonts.registerFromPath(process.env.LYRIC_FONT||'output/runtime/AvenirNextCondensed-DemiBold.ttf','FocusAuditFont');
const words=new Map(),byCue=new Map();
let top=height,bottom=0;
for(const entry of layout.formats[format])for(const ci of entry.cues){
 let wi=0;const list=[];
 for(const row of entry.rows){let [y,x,...widths]=row;for(const w of widths){
  const word={...cues[ci].words[wi++],cueIndex:ci,x:x*scale,y:y*scale,width:w*scale,height:wordHeight*scale};
  words.set(word.id,word);list.push(word);top=Math.min(top,word.y);bottom=Math.max(bottom,word.y+word.height);x+=w+gap;
 }}
 if(wi!==cues[ci].words.length)throw Error('Frozen layout missing words');byCue.set(ci,list);
}
const cropTop=Math.max(0,Math.floor(top)-6),cropHeight=Math.min(height,Math.ceil(bottom)+6)-cropTop;
function sparse(points,max=384){if(points.length<=max)return points;return Array.from({length:max},(_,i)=>points[Math.floor(i*points.length/max)]);}
for(const word of words.values()){
 const ox=Math.floor(word.x)-4,oy=Math.floor(word.y)-4,w=Math.ceil(word.width)+9,h=Math.ceil(word.height)+9;
 const canvas=createCanvas(w,h),ctx=canvas.getContext('2d');
 ctx.font=`600 ${fontSize*scale}px "FocusAuditFont"`;ctx.letterSpacing=`${spacing*scale}px`;ctx.fillStyle='#fff';
 const fit=word.width/ctx.measureText(word.text).width;ctx.translate(word.x-ox,word.y-oy);ctx.scale(fit,1);ctx.fillText(word.text,0,fontSize*scale);
 const rgba=ctx.getImageData(0,0,w,h).data,core=[],control=[];
 const a=(x,y)=>rgba[(y*w+x)*4+3];
 for(let y=3;y<h-3;y++)for(let x=3;x<w-3;x++){
  if(ox+x<0||ox+x>=width||oy+y<cropTop||oy+y>=cropTop+cropHeight)continue;
  const point=[ox+x,oy+y-cropTop];
  if(a(x,y)>249&&a(x-1,y)>240&&a(x+1,y)>240&&a(x,y-1)>240&&a(x,y+1)>240)core.push(point);
  else if(a(x,y)===0&&a(x-3,y)===0&&a(x+3,y)===0&&a(x,y-3)===0&&a(x,y+3)===0)control.push(point);
 }
 word.core=sparse(core);word.control=sparse(control);word.maskCorePixels=core.length;
 if(!word.core.length)throw Error('No glyph-interior points for '+word.id);
}
const WHITE=[238,240,236],GOLD=[255,218,133],ICE=[180,225,246];
const d2=(a,b)=>(a[0]-b[0])**2+(a[1]-b[1])**2+(a[2]-b[2])**2;
function distance(rgb,kind){
 if(kind==='paper')return Math.sqrt(d2(rgb,WHITE));
 if(kind==='gold')return Math.sqrt(d2(rgb,GOLD));
 const v=ICE.map((n,i)=>n-GOLD[i]),t=Math.max(0,Math.min(1,v.reduce((s,n,i)=>s+n*(rgb[i]-GOLD[i]),0)/v.reduce((s,n)=>s+n*n,0)));
 return Math.sqrt(d2(rgb,GOLD.map((n,i)=>n+t*v[i])));
}
function ratio(frame,points,kind,dx=0,dy=0){
 let hits=0,n=0;
 for(const[x,y]of points){const xx=x+dx,yy=y+dy;if(xx<0||xx>=width||yy<0||yy>=cropHeight)continue;const k=(yy*width+xx)*3;const rgb=[frame[k],frame[k+1],frame[k+2]];hits+=distance(rgb,kind)<(kind==='paper'?39:43);n++;}
 return n?hits/n:0;
}
function metrics(frame,word,kind){
 const core=ratio(frame,word.core,kind),control=ratio(frame,word.control,kind),paper=ratio(frame,word.core,'paper'),gold=ratio(frame,word.core,'gold');
 let best=core,offset=[0,0];
 if(core<.8)for(const[dx,dy]of[[-3,0],[3,0],[0,-3],[0,3],[-3,-3],[3,3],[-3,3],[3,-3]]){const value=ratio(frame,word.core,kind,dx,dy);if(value>best){best=value;offset=[dx,dy];}}
 const contrast=core-control;
 let status='passed';
 if(core<.55)status='suspect';else if(core<.7||contrast<.10)status='ambiguous';
 if(best-core>.16&&Math.max(...offset.map(Math.abs))>2)status='suspect-geometry';
 if(kind==='gold'&&paper>.75&&gold<.3)status='wrong-active-color';
 if(kind==='paper'&&gold>.65&&paper<.3)status='unexpected-highlight';
 return{id:word.id,text:word.text,expectedColor:kind,coreMatch:+core.toFixed(4),controlMatch:+control.toFixed(4),shapeContrast:+contrast.toFixed(4),paperCore:+paper.toFixed(4),goldCore:+gold.toFixed(4),bestSearchOffset:offset,bestSearchMatch:+best.toFixed(4),samplePoints:word.core.length,status};
}
function cueAt(time){return cues.find(c=>time>=c.displayStart&&time<c.displayEnd)||null;}
function audit(frame,sample){
 const time=sample.frame/fps,cue=cueAt(time),list=cue?byCue.get(cue.index):[];
 const active=cue?cue.words.find(w=>time>=w.start&&time<w.end):null;
 const checks=list.map(w=>metrics(frame,w,active?.id===w.id?(/^(colder|freezing)$/i.test(w.text)?'frost':'gold'):'paper'));
 const ghosts=[];
 if(!cue){
  const neighbours=[...cues.filter(c=>c.displayEnd<time).slice(-1),...cues.filter(c=>c.displayStart>time).slice(0,1)];
  for(const c of neighbours){const ws=byCue.get(c.index),ms=ws.map(w=>{const p=metrics(frame,w,'paper'),g=metrics(frame,w,'gold');return p.coreMatch>=g.coreMatch?p:g;});const coherent=ms.filter(m=>m.coreMatch>.65&&m.shapeContrast>.18);if(coherent.length>=Math.max(2,Math.ceil(ws.length*.6)))ghosts.push({cueId:c.id,coherentGlyphMatches:coherent.length,wordCount:ws.length});}
 }
 return{frame:sample.frame,timeSeconds:+time.toFixed(6),reasons:sample.reasons,expectedCueId:cue?.id??null,expectedActiveWordId:active?.id??null,wordChecks:checks,unexpectedTextInCueGap:ghosts};
}
const samples=new Map();
function add(time,reason){const frame=Math.round(time*fps);if(frame<0||frame>=Math.ceil(timeline.duration*fps))return;if(!samples.has(frame))samples.set(frame,{frame,reasons:[]});samples.get(frame).reasons.push(reason);}
for(const cue of cues){
 for(const word of cue.words)add((word.start+word.end)/2,'word-midpoint:'+word.id);
 for(let i=0;i<cue.words.length-1;i++)if(cue.words[i+1].start-cue.words[i].end>2/fps)add((cue.words[i].end+cue.words[i+1].start)/2,'no-focus-word-gap:'+cue.id);
 if(cue.words[0].start-cue.displayStart>2/fps)add((cue.words[0].start+cue.displayStart)/2,'cue-leading-no-focus:'+cue.id);
 if(cue.displayEnd-cue.words.at(-1).end>2/fps)add((cue.displayEnd+cue.words.at(-1).end)/2,'cue-trailing-no-focus:'+cue.id);
}
let previous=0;for(const cue of cues){if(cue.displayStart-previous>2/fps)add((previous+cue.displayStart)/2,'empty-cue-gap');previous=cue.displayEnd;}if(timeline.duration-previous>2/fps)add((timeline.duration+previous)/2,'empty-cue-tail');
async function* decodeFrames(path,schedule,still=false){
 // A long left-associated sum exceeds libavutil's expression-depth limit.
 // Balanced branches keep hundreds of sparse samples in a single bounded decode.
 const balanced=items=>items.length===1?items[0]:`(${balanced(items.slice(0,Math.floor(items.length/2)))}+${balanced(items.slice(Math.floor(items.length/2)))})`;
 const filter=(still?'':`select=${balanced(schedule.map(s=>`eq(n\\,${s.frame})`))},`)+`crop=${width}:${cropHeight}:0:${cropTop},format=rgb24`;
 const command=['-v','error','-xerror','-i',path,'-an','-vf',filter,'-fps_mode','passthrough','-f','rawvideo','-pix_fmt','rgb24','pipe:1'];
 const proc=spawn('ffmpeg',command,{stdio:['ignore','pipe','pipe']});let err='';proc.stderr.on('data',b=>{if(err.length<12000)err+=b.toString();});
 const frameBytes=width*cropHeight*3;let buffer=Buffer.alloc(frameBytes),used=0,index=0;
 const done=new Promise((res,rej)=>{proc.on('error',rej);proc.on('close',code=>code?rej(Error(`ffmpeg${code}: ${err}`)):res());});
 for await(const block of proc.stdout){let offset=0;while(offset<block.length){const n=Math.min(block.length-offset,frameBytes-used);block.copy(buffer,used,offset,offset+n);used+=n;offset+=n;if(used===frameBytes){if(index>=schedule.length)throw Error('More decoded frames than requested');yield{bytes:buffer,sample:schedule[index++]};used=0;}}}
 await done;if(used||index!==schedule.length)throw Error(`Decoded ${index}/${schedule.length} frames; partial bytes${used}`);
}
async function fileHash(path){const h=createHash('sha256');for await(const b of createReadStream(path))h.update(b);return h.digest('hex');}
let results=[],scope='all word midpoints and cue/no-focus gaps';
if(proofDir){
 scope='available still proofs only; not a final-master all-word audit';
 for(const file of readdirSync(proofDir).filter(p=>p.startsWith(format+'-')&&p.endsWith('.png.json')).sort()){
  const receipt=JSON.parse(readFileSync(join(proofDir,file))),path=receipt.path;const schedule=[{frame:receipt.startFrame,reasons:['production-still-proof:'+file]}];
  for await(const frame of decodeFrames(path,schedule,true))results.push(audit(frame.bytes,frame.sample));
 }
}else{
 const schedule=[...samples.values()].sort((a,b)=>a.frame-b.frame);let n=0;
 for await(const frame of decodeFrames(input,schedule)){results.push(audit(frame.bytes,frame.sample));if(++n%50===0)console.error(`audited ${n}/${schedule.length} encoded frames`);}
}
const checks=results.flatMap(r=>r.wordChecks.map(w=>({...w,frame:r.frame,timeSeconds:r.timeSeconds}))),suspects=checks.filter(c=>!['passed','ambiguous'].includes(c.status)),ambiguous=checks.filter(c=>c.status==='ambiguous'),ghosts=results.filter(r=>r.unexpectedTextInCueGap.length);
const midpointIds=new Set(results.flatMap(r=>r.reasons.filter(s=>s.startsWith('word-midpoint:')).map(s=>s.split(':')[1])));
const report={schema:'encoded-word-focus-audit/v1',createdAt:new Date().toISOString(),format,scope,input:input?safePath(input):null,inputSha256:input?await fileHash(input):null,timelineSha256:await fileHash('src/timeline.json'),layoutSha256:await fileHash('src/production-layout.json'),fontSha256:await fileHash(process.env.LYRIC_FONT||'output/runtime/AvenirNextCondensed-DemiBold.ttf'),fps,lyricCrop:{x:0,y:cropTop,width,height:cropHeight},summary:{encodedFramesInspected:results.length,wordMidpointsCovered:midpointIds.size,expectedWordCount:words.size,individualGlyphChecks:checks.length,suspects:suspects.length,ambiguous:ambiguous.length,unexpectedCueGapText:ghosts.length},status:suspects.length||ghosts.length?'review-required':ambiguous.length?'passed-with-ambiguous-backgrounds':'passed',methods:['Decode actual encoded pixels at integer master frame indices; no scene.paint or runtime highlight selector imported.','Independently derive expected active words from source start/end intervals and frozen browser layout.','Rasterize color-independent glyph masks with approved font; inspect sparse eroded interior points and nearby non-glyph controls.','Check amber active glyphs, ivory inactive glyphs, and the approved amber-to-ice frost color locus. Narrow damage cuts and chroma compression are tolerated.','Search limited3-pixel offsets for possible glyph displacement; inspect neighbouring cue shapes in truly empty gaps.'],limits:['This verifies encoded word focus/color and coarse fixed glyph geometry at sampled frames, not acoustic correctness of the timeline.','It cannot certify every frame, highlight handoff, kerning detail, or arbitrary visual effects; midpoint sampling is deliberate.','The font rasterizer dependency is shared with production, although timing selection, color classification, sampling and decoded-image measurement are independent.','Warm/bright backgrounds or thin glyphs may be ambiguous; control-pixel contrast reduces but cannot eliminate confusion. Suspects require actual image inspection, not automatic timing edits.'],suspects,ambiguous,results};
const reportPath=arg('--report',`evidence/${format}-word-focus-audit.json`);writeFileSync(reportPath,JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify({report:reportPath,status:report.status,...report.summary}));
if(suspects.length||ghosts.length)process.exitCode=3;
