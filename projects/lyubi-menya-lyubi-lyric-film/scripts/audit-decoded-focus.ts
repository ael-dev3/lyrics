import {spawn} from 'node:child_process';
import {readFileSync,writeFileSync,createReadStream,mkdirSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {basename} from 'node:path';
import {GlobalFonts,createCanvas,loadImage} from '@napi-rs/canvas';
import {assertProductionGate} from './production-gate.ts';
import {parseData} from '../src/schema.ts';
import type {Cue,Format,SourceWord} from '../src/schema.ts';
import type {Layouts} from '../src/layout-types.ts';

// Expected states below come directly from the frozen source intervals and semantic
// relations. The renderer/preview focus helpers are intentionally not imported.
const path=process.argv[2],format=process.argv[3] as Format;
if(!path||!['landscape','portrait'].includes(format))throw Error('Usage: node scripts/audit-decoded-focus.ts file.mp4 landscape|portrait [--diagnostic --start-frame=N --expected-frames=N --expected-offset=N]');
const diagnostic=process.argv.includes('--diagnostic');
const option=(name:string,fallback:number)=>{const value=process.argv.find(a=>a.startsWith('--'+name+'='));const n=value?Number(value.split('=')[1]):fallback;if(!Number.isSafeInteger(n))throw Error('Invalid '+name);return n;};
const startFrame=option('start-frame',0),expectedOffset=option('expected-offset',0);
if(!diagnostic&&(startFrame!==0||expectedOffset!==0))throw Error('Frame-offset options are restricted to diagnostic clips');
const suffix=diagnostic?`-diagnostic-${startFrame}-${expectedOffset}`:'';
const reportPath=`evidence/production/${format}-focus-audit${suffix}.json`;
const safeHash=(path:string)=>{try{return createHash('sha256').update(readFileSync(path)).digest('hex');}catch{return null;}};
const inputIdentitySha256=safeHash('evidence/preview-identity.json'),verifierSha256=safeHash('scripts/audit-decoded-focus.ts');
mkdirSync('evidence/production',{recursive:true});writeFileSync(reportPath,JSON.stringify({status:'FAIL',stage:'audit started',inputFile:basename(path),format,inputIdentitySha256,verifierSha256},null,2)+'\n');
assertProductionGate();
const data=parseData(JSON.parse(readFileSync('src/cues.json','utf8'))),layouts:Layouts=JSON.parse(readFileSync('src/layout.json','utf8')),layout=layouts[format],expectedFrames=option('expected-frames',diagnostic?0:data.frames);
if(!diagnostic&&expectedFrames!==11245)throw Error('Full-delivery frame contract changed');
const auditScriptSha256=createHash('sha256').update(readFileSync('scripts/audit-decoded-focus.ts')).digest('hex');
const reviewIdentity=JSON.parse(readFileSync('evidence/preview-identity.json','utf8')) as {revision:string};
let negativeOffsetSensitivity:Record<string,unknown>|null=null;
if(!diagnostic){const proofStart=format==='landscape'?1860:1260,base=`evidence/production/${format}-focus-audit-diagnostic-${proofStart}-`;const positive=JSON.parse(readFileSync(base+'0.json','utf8')) as Record<string,unknown>,negative=JSON.parse(readFileSync(base+'30.json','utf8')) as Record<string,unknown>;if(positive.status!=='PASS'||negative.status!=='FAIL'||Number(negative.mismatchCount)===0||positive.auditScriptSha256!==auditScriptSha256||negative.auditScriptSha256!==auditScriptSha256||positive.revision!==reviewIdentity.revision||negative.revision!==reviewIdentity.revision||positive.inputIdentitySha256!==inputIdentitySha256||negative.inputIdentitySha256!==inputIdentitySha256||positive.inputSha256!==negative.inputSha256||positive.decodedFrames!==negative.decodedFrames)throw Error('Run current positive and +30-frame diagnostic controls before the full focus audit');negativeOffsetSensitivity={checked:true,offsetFrames:30,detectedMismatches:negative.mismatchCount,diagnosticInputSha256:negative.inputSha256};}
const activeColor=[162,44,80],idleColor=[48,37,45]; // Frozen rose-paper preview v2 palette.
if(!GlobalFonts.registerFromPath('public/fonts/Oswald-Medium.ttf','LyubiAudit'))throw Error('Frozen font failed to load');
const absoluteMasks=new Map<string,{x:number;y:number}[]>();
for(const cue of data.cues)for(const word of [...layout.cues[cue.id]!.ru,...layout.cues[cue.id]!.en]){
 const scale=2,x0=Math.floor(word.x)-4,y0=Math.floor(word.y-layout.fontSize*1.4)-4,width=Math.ceil(word.width)+10,height=Math.ceil(layout.fontSize*1.8)+10;
 const canvas=createCanvas(width*scale,height*scale),ctx=canvas.getContext('2d');ctx.scale(scale,scale);ctx.font=`500 ${layout.fontSize}px LyubiAudit`;ctx.fontKerning='none';ctx.fillStyle='white';ctx.fillText(word.text,word.x-x0,word.y-y0);
 const pixels=ctx.getImageData(0,0,canvas.width,canvas.height).data;
 const inside=(x:number,y:number)=>{if(x<0||x>=width||y<0||y>=height)return false;for(let yy=0;yy<scale;yy++)for(let xx=0;xx<scale;xx++)if(pixels[(((y*scale+yy)*canvas.width+x*scale+xx)*4)+3]!<254)return false;return true;};
 const points:{x:number;y:number}[]=[];
 for(let y=1;y<height-1;y++)for(let x=1;x<width-1;x++)if(inside(x,y)&&inside(x-1,y)&&inside(x+1,y)&&inside(x,y-1)&&inside(x,y+1))points.push({x:x0+x,y:y0+y});
 if(points.length<8)throw Error('Insufficient eroded glyph interior: '+word.id);
 const count=Math.min(48,points.length);absoluteMasks.set(word.id,Array.from({length:count},(_,i)=>points[Math.floor((i+.5)*points.length/count)]!));
}
const points=[...absoluteMasks.values()].flat(),minX=Math.min(...points.map(p=>p.x))-2,minY=Math.min(...points.map(p=>p.y))-2,maxX=Math.max(...points.map(p=>p.x))+2,maxY=Math.max(...points.map(p=>p.y))+2;
const crop={x:minX,y:minY,width:maxX-minX+1,height:maxY-minY+1},artSize=64,stride=crop.width+artSize;
const masks=new Map([...absoluteMasks].map(([id,points])=>[id,points.map(p=>((p.y-crop.y)*stride+p.x-crop.x)*3)]));
const gapPoints=[...new Set([...masks.values()].flatMap(points=>points.filter((_,i)=>i%6===0)))];
const art=format==='portrait'?{x:80,y:91,w:920}:{x:1050,y:142,w:775};
const artCrop={x:Math.round(art.x+art.w*.12),y:Math.round(art.y+art.w*.12),size:Math.round(art.w*.76)};
// Independently project the original artwork into its frozen, static placement.
const referenceCanvas=createCanvas(layout.width,layout.height),refCtx=referenceCanvas.getContext('2d'),image=await loadImage('public/artwork.png');
refCtx.translate(art.x+art.w/2,art.y+art.w/2);refCtx.rotate(-2*Math.PI/180);refCtx.drawImage(image,-art.w/2,-art.w/2,art.w,art.w);
const thumb=createCanvas(artSize,artSize),thumbCtx=thumb.getContext('2d');thumbCtx.drawImage(referenceCanvas,artCrop.x,artCrop.y,artCrop.size,artCrop.size,0,0,artSize,artSize);const reference=thumbCtx.getImageData(0,0,artSize,artSize).data;
function expected(cue:Cue,frame:number){
 const acoustic=new Set(cue.ru.filter((word:SourceWord)=>frame>=Math.round(word.startSample/data.sampleRate*data.fps)&&frame<Math.round(word.endSample/data.sampleRate*data.fps)).map(w=>w.id));
 const source=new Set(acoustic);let changed=true;while(changed){changed=false;for(const target of cue.en){const ids=target.focusSourceIds??target.sourceIds;if(ids.some(id=>source.has(id)))for(const id of ids)if(!source.has(id)){source.add(id);changed=true;}}}
 const target=cue.en.filter(w=>(w.focusSourceIds??w.sourceIds).some(id=>acoustic.has(id))).map(w=>w.id);return new Set([...source,...target]);
}
const filter=`[0:v:0]split=2[ti][ai];[ti]crop=${crop.width}:${crop.height}:${crop.x}:${crop.y}:exact=1,format=rgb24[txt];[ai]crop=${artCrop.size}:${artCrop.size}:${artCrop.x}:${artCrop.y}:exact=1,scale=${artSize}:${artSize}:flags=area,format=rgb24,pad=${artSize}:${crop.height}:0:0:black[art];[txt][art]hstack=inputs=2[out]`;
const child=spawn('ffmpeg',['-v','error','-threads','4','-filter_complex_threads','2','-i',path,'-filter_complex',filter,'-map','[out]','-an','-pix_fmt','rgb24','-fps_mode','passthrough','-f','rawvideo','pipe:1']);
let stderr='';child.stderr.on('data',chunk=>stderr+=chunk);const closed=new Promise<number|null>((resolve,reject)=>{child.on('close',resolve);child.on('error',reject);});
const buffer=Buffer.allocUnsafe(stride*crop.height*3);let filled=0,frame=0,wordStates=0,ambiguous=0,mismatchCount=0,gapContaminationFrames=0,pictureMismatchFrames=0,maxPictureMae=0,totalPictureMae=0;
const mismatches:Record<string,unknown>[]=[],ambiguities:Record<string,unknown>[]=[],seenCues=new Set<string>(),seenStates=new Map<string,Set<boolean>>();
const colorDistance=(a:number[],b:number[])=>Math.hypot(...a.map((v,i)=>v-b[i]!));
const processFrame=()=>{
 const expectedFrame=startFrame+frame+expectedOffset,sample=Math.round(expectedFrame/data.fps*data.sampleRate),cue=data.cues.find(c=>sample>=c.visibleFrom&&sample<c.visibleUntil);
 if(cue){seenCues.add(cue.id);const on=expected(cue,expectedFrame);for(const word of [...cue.ru,...cue.en]){
  const mask=masks.get(word.id)!;const color=[0,1,2].map(channel=>{const values=mask.map(p=>buffer[p+channel]!).sort((a,b)=>a-b);return values[Math.floor(values.length/2)]!;});
  const activeDistance=colorDistance(color,activeColor),idleDistance=colorDistance(color,idleColor),margin=Math.abs(activeDistance-idleDistance),wanted=on.has(word.id);
  if(Math.min(activeDistance,idleDistance)>38||margin<28){ambiguous++;if(ambiguities.length<60)ambiguities.push({frame:expectedFrame,word:word.id,color,activeDistance,idleDistance});continue;}
  const got=activeDistance<idleDistance;if(got!==wanted){mismatchCount++;if(mismatches.length<100)mismatches.push({frame:expectedFrame,word:word.id,expected:wanted,observed:got,color,margin});}
  const states=seenStates.get(word.id)??new Set<boolean>();states.add(wanted);seenStates.set(word.id,states);wordStates++;
 }}else{let colored=0;for(const p of gapPoints){const color=[buffer[p]!,buffer[p+1]!,buffer[p+2]!];if(Math.min(colorDistance(color,activeColor),colorDistance(color,idleColor))<35)colored++;}if(colored>3)gapContaminationFrames++;}
 let error=0;for(let y=0;y<artSize;y++)for(let x=0;x<artSize;x++){const p=(y*stride+crop.width+x)*3,q=(y*artSize+x)*4;for(let c=0;c<3;c++)error+=Math.abs(buffer[p+c]!-reference[q+c]!);}const mae=error/(artSize*artSize*3);maxPictureMae=Math.max(maxPictureMae,mae);totalPictureMae+=mae;if(mae>16)pictureMismatchFrames++;
 frame++;
};
for await(const chunk of child.stdout){let at=0;while(at<chunk.length){const count=Math.min(buffer.length-filled,chunk.length-at);chunk.copy(buffer,filled,at,at+count);filled+=count;at+=count;if(filled===buffer.length){processFrame();filled=0;}}}
const code=await closed;if(code!==0||filled)throw Error('Incomplete video decode: '+stderr);
const allWords=data.cues.flatMap(c=>[...c.ru,...c.en]).map(w=>w.id),missingCues=data.cues.filter(c=>!seenCues.has(c.id)).map(c=>c.id),missingWordStates=allWords.filter(id=>seenStates.get(id)?.size!==2);
const frameCountOk=expectedFrames>0?frame===expectedFrames:frame>0,completeCoverage=diagnostic||(missingCues.length===0&&missingWordStates.length===0),passed=frameCountOk&&completeCoverage&&!mismatchCount&&!ambiguous&&!gapContaminationFrames&&!pictureMismatchFrames;
const hash=createHash('sha256');for await(const part of createReadStream(path))hash.update(part);
const identity=reviewIdentity;const inputSha256=hash.digest('hex');
const report={status:passed?'PASS':'FAIL',inputIdentitySha256,verifierSha256,revision:identity.revision,inputFile:basename(path),inputSha256,sha256:inputSha256,auditScriptSha256,negativeOffsetSensitivity,format,diagnostic,startFrame,expectedOffset,decodedFrames:frame,expectedFrames,frameCountOk,wordStates,ambiguous,mismatchCount,gapContaminationFrames,seenCueCount:seenCues.size,expectedCueCount:data.cues.length,missingCues,missingWordStates,mismatchExamples:mismatches.slice(0,6),ambiguousExamples:ambiguities.slice(0,6),artwork:{checkedFrames:frame,crop:artCrop,thumbnailSize:artSize,maximumMeanAbsoluteRgbError:maxPictureMae,meanAbsoluteRgbError:totalPictureMae/Math.max(1,frame),mismatchFrames:pictureMismatchFrames,threshold:16,sourceSha256:createHash('sha256').update(readFileSync('public/artwork.png')).digest('hex')},method:'Every decoded frame: compare eroded glyph-interior median colors with frozen active/rest colors; derive Russian and English expected states directly from sample-indexed source events and semantic relations, without renderer focus code. Reject ambiguous pixels; inspect empty lyric intervals for stale ink. Compare central 76% artwork thumbnail against independently projected original artwork on every frame. This establishes encoded display states and source-picture presence, not acoustic alignment truth or complete visual quality.'};
writeFileSync(reportPath,JSON.stringify(report,null,2)+'\n');
console.log({status:report.status,format,frames:frame,wordStates,ambiguous,mismatchCount,gapContaminationFrames,seenCueCount:seenCues.size,pictureMismatchFrames,maxPictureMae,missingWordStates:missingWordStates.length,mismatches:mismatches.slice(0,3),ambiguities:ambiguities.slice(0,3)});if(!passed)process.exitCode=1;
