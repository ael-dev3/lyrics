import assert from 'node:assert/strict';
import {spawn, type ChildProcessWithoutNullStreams} from 'node:child_process';
import {createReadStream,readFileSync,writeFileSync,mkdirSync,renameSync,existsSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {basename,dirname,resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {createCanvas,GlobalFonts,ImageData,loadImage} from '@napi-rs/canvas';
import {layoutCue,layoutCarry,paintScene,initScene} from '../src/scene.ts';
import type {Cue,Format,Timeline,FeatureData,Lane,Word,Token} from '../src/model.ts';
import {checkProductionGate,type Identity} from './render-gate.ts';
import {canonical,outputFrameCount,type Manifest as SourceManifest} from './verify-final.ts';

// The decoded film is the evidence. The temporal oracle uses integer n*735;
// it never calls sourceActive/tokenActive or the production time helper.
const FPS=60,SAMPLES_PER_FRAME=735;
const contactTimes=[20,51.8,87.8,112,159,191,205.15,210,214.3,217,222,243];
const REPRESENTATIVE_FRAME=Math.round(51.8*60);
interface TokenMask {id:string;cue:Cue;language:Lane['language'];token:Token;words:Word[];points:number[];maskMode:'eroded-interior'|'opaque-chroma-cell';}
interface Check {frame:number;sourceFrame:number;meanAbsoluteRgbError:number;fractionChannelsOver24:number;glyphChecks:number;visibleCueIds:string[];}
const root=fileURLToPath(new URL('../',import.meta.url));
const readJson=<T>(path:string):T=>JSON.parse(readFileSync(resolve(root,path),'utf8')) as T;
const hashBytes=(bytes:Uint8Array):string=>createHash('sha256').update(bytes).digest('hex');
const dimensions=(format:Format)=>({width:format==='landscape'?1920:1080,height:format==='portrait'?1920:1080});
async function fileHash(path:string):Promise<string>{const h=createHash('sha256');for await(const b of createReadStream(path))h.update(b as Buffer);return h.digest('hex');}
async function* rawFrames(child:ChildProcessWithoutNullStreams,frameBytes:number):AsyncGenerator<Buffer>{
 let frame=Buffer.allocUnsafe(frameBytes),used=0;
 for await(const part of child.stdout){const chunk=part as Buffer;for(let offset=0;offset<chunk.length;){
  const count=Math.min(frameBytes-used,chunk.length-offset);chunk.copy(frame,used,offset,offset+count);offset+=count;used+=count;
  if(used===frameBytes){yield frame;frame=Buffer.allocUnsafe(frameBytes);used=0;}
 }}if(used)throw Error(`Truncated decoded raw frame: ${used} bytes`);
}
function watchChild(child:ChildProcessWithoutNullStreams,label:string):Promise<void>{
 let stderr='';child.stderr.on('data',b=>{stderr=(stderr+String(b)).slice(-6000);});
 const done=new Promise<void>((accept,reject)=>{child.once('error',reject);child.once('close',code=>code===0?accept():reject(Error(`${label} failed ${code}: ${stderr.replaceAll(root,'<project>')}`)));});
 void done.catch(()=>{});return done;
}
export function sourcePictureIndex(outputFrame:number,sourceFrames=6376):number{
 assert.ok(Number.isSafeInteger(outputFrame)&&outputFrame>=0);
 return Math.min(sourceFrames-1,Number(BigInt(outputFrame)*25n/60n));
}
export function independentFrameTime(frame:number):number{
 assert.ok(Number.isSafeInteger(frame)&&frame>=0);let t=frame/60;
 const bits=new DataView(new ArrayBuffer(8));
 while(t*44100<frame*735||Math.floor(t*25)<Number(BigInt(frame)*25n/60n)){
  bits.setFloat64(0,t);bits.setBigUint64(0,bits.getBigUint64(0)+1n);t=bits.getFloat64(0);
 }return t;
}
async function independentPainter(format:Format){
 const timeline=readJson<Timeline>('public/timeline.json'),features=readJson<FeatureData>('public/audio-features.json');
 assert.equal(features.sourceSha256,timeline.sourceSha256);assert.equal(timeline.sampleRate,44100);
 assert.equal(features.analysis.frameRate.numerator,25);assert.equal(features.analysis.frameRate.denominator,1);
 assert.ok(GlobalFonts.registerFromPath(resolve(root,'public/fonts/NotoSerif.ttf'),'PrizrakSerif'),'Approved Latin/Cyrillic font registration failed');
 assert.ok(GlobalFonts.registerFromPath(resolve(root,'public/fonts/NotoSerifJP.ttf'),'PrizrakJP'),'Approved Japanese font registration failed');
 initScene(timeline,features);
 const size=dimensions(format),canvas=createCanvas(size.width,size.height),context=canvas.getContext('2d') as unknown as CanvasRenderingContext2D;
 const sourceCanvas=createCanvas(1920,1080),sc=sourceCanvas.getContext('2d');let last=-1;
 return {canvas,context,timeline,paint(bytes:Buffer,j:number,n:number):Buffer{
  assert.equal(bytes.length,1920*1080*4);
  if(j!==last){sc.putImageData(new ImageData(new Uint8ClampedArray(bytes.buffer,bytes.byteOffset,bytes.byteLength),1920,1080),0,0);last=j;}
  paintScene(context,independentFrameTime(n),format,sourceCanvas as unknown as CanvasImageSource);return canvas.data();
 }};
}
export function independentOpacity(cue:Cue,time:number):number {
 const smooth=(a:number,b:number,x:number):number=>{if(b<=a)return x>=b?1:0;const u=Math.max(0,Math.min(1,(x-a)/(b-a)));return u*u*(3-2*u);};
 if(time<cue.visibleStart||time>=cue.visibleEnd)return 0;
 if(time>=cue.start&&time<cue.end)return 1;
 const entryEnd=cue.start-.012,entry=entryEnd<=cue.visibleStart?1:smooth(cue.visibleStart,entryEnd,time);
 return entry*(cue.visibleEnd<=cue.fullOpacityEnd?1:1-smooth(cue.fullOpacityEnd,cue.visibleEnd,time));
}
export function selectedFrames(timeline:Timeline,source:SourceManifest):number[] {
 const total=outputFrameCount(source),frames=new Set<number>([0,1,REPRESENTATIVE_FRAME,total-1,total-2,...contactTimes.map(t=>Math.round(t*60))]);
 const add=(n:number):void=>{if(Number.isSafeInteger(n)&&n>=0&&n<total)frames.add(n);};
 for(const cue of timeline.cues){
  for(const word of [...cue.words,...(cue.carry?.words??[])]){
   const first=Math.ceil(word.startSample/735),off=Math.ceil(word.endSample/735);
   [first-1,first,first+1,off-1,off,Math.round((word.startSample+word.endSample)/1470)].forEach(add);
  }
  for(const time of [cue.visibleStart,cue.start-.012,cue.start,cue.end,cue.fullOpacityEnd,cue.visibleEnd,cue.carry?.visibleEnd].filter((x):x is number=>x!==undefined)){
   const n=Math.ceil(time*60);[n-1,n,n+1].forEach(add);
  }add(Math.round((cue.end+cue.fullOpacityEnd)*30));
 }
 for(let n=0;n<total;n+=5*60)add(n);
 for(let n=Math.ceil((source.video.frameCount-1)*60/25);n<total;n++)add(n);
 return [...frames].sort((a,b)=>a-b);
}
function masksForCue(cue:Cue,format:Format,context:CanvasRenderingContext2D,carry=false):TokenMask[] {
 const layout=carry?layoutCarry(context,cue,format):layoutCue(context,cue,format);assert.ok(layout);
 const words=carry?cue.carry!.words:cue.words,size=dimensions(format);
 const mask=createCanvas(size.width,size.height),ctx=mask.getContext('2d'),result:TokenMask[]=[];
 ctx.textBaseline='alphabetic';ctx.fillStyle='#ffffff';
 for(const lane of layout.lanes){
  ctx.font=`${lane.language==='ja'?600:500} ${layout.size}px ${lane.language==='ja'?'PrizrakJP':'PrizrakSerif'}`;
  for(const slot of lane.slots){
   ctx.clearRect(0,0,size.width,size.height);ctx.fillText(slot.text,slot.x,slot.y);
   const x0=Math.max(0,Math.floor(slot.x)-2),y0=Math.max(0,Math.floor(slot.y-layout.size*1.1));
   const w=Math.min(size.width-x0,Math.ceil(slot.width)+5),h=Math.min(size.height-y0,Math.ceil(layout.size*1.45));
   const rgba=ctx.getImageData(x0,y0,w,h).data,interior:number[]=[],chromaCells:number[]=[];
   // Exclude outlines, shadows and antialiasing. Sparse serifs use only opaque
   // 2x2 cells aligned to the encoded420 chroma grid; color tolerances stay fixed.
   for(let y=1;y<h-1;y++)for(let x=1;x<w-1;x++){
    const p=(y*w+x)*4,at=((y+y0)*size.width+x+x0)*4;
    const cx=Math.floor((x+x0)/2)*2-x0,cy=Math.floor((y+y0)/2)*2-y0,cell=(cy*w+cx)*4;
    if(rgba[p+3]===255&&[cell,cell+4,cell+w*4,cell+w*4+4].every(i=>rgba[i+3]===255))chromaCells.push(at);
    if([p,p-4,p+4,p-w*4,p+w*4].every(i=>(rgba[i+3]??0)>=250))interior.push(at);
   }
   const maskMode=interior.length>=12?'eroded-interior':'opaque-chroma-cell',points=maskMode==='eroded-interior'?interior:chromaCells;
   assert.ok(points.length>=(maskMode==='eroded-interior'?12:4),`Too few solid glyph pixels: ${cue.id}/${lane.language}/${slot.index}`);
   result.push({id:carry?`${cue.id}/carry/${slot.id}`:slot.id,cue,language:lane.language,token:slot.token,words,points,maskMode});
  }
 }return result;
}
function isFocused(mask:TokenMask,frame:number):boolean {
 const sample=frame*SAMPLES_PER_FRAME;
 return mask.token.sourceIndices.some(i=>{const word=mask.words[i];assert.ok(word);return sample>=word.startSample&&sample<word.endSample;});
}
function glyphAudit(bytes:Buffer,token:TokenMask,frame:number){
 const focus=isFocused(token,frame),chosen=focus?[245,255,233]:[163,182,172],other=focus?[163,182,172]:[245,255,233];let matching=0;
 for(const p of token.points){let a=0,b=0;for(let c=0;c<3;c++){const v=bytes[p+c]!;a+=(v-chosen[c]!)**2;b+=(v-other[c]!)**2;}if(Math.sqrt(a)<34&&Math.sqrt(a)+6<Math.sqrt(b))matching++;}
 const fraction=matching/token.points.length;
 assert.ok(fraction>=.90,`Decoded ${token.language} focus mismatch ${token.id} at frame ${frame}: ${focus?'focused':'neutral'}, ${fraction.toFixed(3)} matching`);
 return {id:token.id,language:token.language,focused:focus,matchingFraction:Number(fraction.toFixed(5)),pixels:token.points.length,maskMode:token.maskMode};
}
export function decodedSceneParity(expected:Buffer,actual:Buffer){
 assert.equal(actual.length,expected.length);let sum=0,large=0,count=0;
 for(let p=0;p<expected.length;p+=16)for(let c=0;c<3;c++){const error=Math.abs(expected[p+c]!-actual[p+c]!);sum+=error;if(error>24)large++;count++;}
 const mae=sum/count,fraction=large/count;assert.ok(mae<=7&&fraction<=.04,`Decoded scene parity failed: RGB MAE ${mae.toFixed(3)}, >24 fraction ${fraction.toFixed(4)}`);
 return {meanAbsoluteRgbError:Number(mae.toFixed(5)),fractionChannelsOver24:Number(fraction.toFixed(6))};
}
function outputDecoder(path:string,frames:number[]){
 const expression=(rows:number[]):string=>{if(rows.length===1)return `eq(n\\,${rows[0]})`;const middle=Math.floor(rows.length/2);return `(${expression(rows.slice(0,middle))}+${expression(rows.slice(middle))})`;};
 const child=spawn('ffmpeg',['-hide_banner','-v','error','-nostdin','-threads','2','-xerror','-err_detect','explode','-noautorotate','-i',path,'-map','0:v:0','-vf',`select=${expression(frames)}`,'-frames:v',String(frames.length),'-fps_mode','passthrough','-f','rawvideo','-pix_fmt','rgba','pipe:1'],{stdio:['pipe','pipe','pipe']});
 child.stdin.end();return child;
}
async function verifyFormat(format:Format,path:string,current:Identity):Promise<Record<string,unknown>> {
 const outputSha256=await fileHash(path),rendererSha256=await fileHash(resolve(root,'scripts/render-production.ts'));
 const source=readJson<SourceManifest>('source/production-clock.json'),painter=await independentPainter(format),size=dimensions(format);
 assert.equal(source.sha256,current.inputHashes['public/source.mp4']);assert.equal(source.video.frameCount,6376);
 assert.equal(source.audio.sampleRate,44100);assert.equal(source.video.fpsNumerator,25);assert.equal(source.video.fpsDenominator,1);
 const frames=selectedFrames(painter.timeline,source),sourceIndices=[...new Set(frames.map(n=>sourcePictureIndex(n,source.video.frameCount)))];
 const sourceChild=outputDecoder(resolve(root,'public/source.mp4'),sourceIndices),actualChild=outputDecoder(path,frames);
 const sourceDone=watchChild(sourceChild,'Original parity decoder'),actualDone=watchChild(actualChild,'Delivered parity decoder');
 const originals=rawFrames(sourceChild,1920*1080*4),actuals=rawFrames(actualChild,size.width*size.height*4);
 const masks=new Map<string,TokenMask[]>(),checks:Check[]=[],tokenResults:Record<string,{language:string;maskMode:string;pixels:number;checks:number;focusedChecks:number;neutralChecks:number;worstMatchingFraction:number}>={};
 const tailResults:{cueId:string;frame:number;time:number;opacity:number;visible:boolean}[]=[];
 const cellW=format==='landscape'?480:216,cellH=Math.round(cellW*size.height/size.width)+26;
 const contact=createCanvas(cellW*4,cellH*3),cc=contact.getContext('2d');cc.fillStyle='#080e12';cc.fillRect(0,0,contact.width,contact.height);
 const contactFrames=contactTimes.map(t=>Math.round(t*60)),decodedCanvas=createCanvas(size.width,size.height),dc=decodedCanvas.getContext('2d');
 let representative:Buffer|undefined,completed=0,lastReport=Date.now(),overlapFrames=0;const begun=Date.now();
 try{
  for(const j of sourceIndices){
   const original=await originals.next();if(original.done){await sourceDone;throw Error('Missing original selected picture');}
   for(const n of frames.filter(n=>sourcePictureIndex(n,source.video.frameCount)===j)){
    const expected=painter.paint(original.value,j,n),actual=await actuals.next();if(actual.done){await actualDone;throw Error('Missing delivered selected picture');}
    const comparison=decodedSceneParity(expected,actual.value),cell=contactFrames.indexOf(n);
    if(n===REPRESENTATIVE_FRAME||cell>=0){
     const bytes=actual.value;dc.putImageData(new ImageData(new Uint8ClampedArray(bytes.buffer,bytes.byteOffset,bytes.byteLength),size.width,size.height),0,0);
     if(n===REPRESENTATIVE_FRAME)representative=decodedCanvas.toBuffer('image/jpeg',95);
     if(cell>=0){const snapshot=await loadImage(decodedCanvas.toBuffer('image/jpeg',94)),x=cell%4*cellW,y=Math.floor(cell/4)*cellH;cc.drawImage(snapshot,x,y,cellW,cellH-26);cc.fillStyle='#f5ffe9';cc.font='14px sans-serif';cc.fillText(`${n/60}s · frame ${n}`,x+7,y+cellH-7);}
    }
    const time=independentFrameTime(n),visible=painter.timeline.cues.filter(c=>time>=c.visibleStart&&time<c.visibleEnd);let glyphChecks=0;
    if(visible.length>1)overlapFrames++;
    for(const cue of visible){
     const audit=(carry=false)=>{
      const key=cue.id+(carry?':carry':'');let tokens=masks.get(key);if(!tokens){tokens=masksForCue(cue,format,painter.context,carry);masks.set(key,tokens);}
      for(const token of tokens){const result=glyphAudit(actual.value,token,n),prior=tokenResults[result.id]??{language:result.language,maskMode:result.maskMode,pixels:result.pixels,checks:0,focusedChecks:0,neutralChecks:0,worstMatchingFraction:1};prior.checks++;if(result.focused)prior.focusedChecks++;else prior.neutralChecks++;prior.worstMatchingFraction=Math.min(prior.worstMatchingFraction,result.matchingFraction);tokenResults[result.id]=prior;glyphChecks++;}
     };
     if(independentOpacity(cue,time)>=.999999)audit();
     if(cue.carry&&time>=cue.start&&time<cue.carry.visibleEnd)audit(true);
    }
    for(const cue of painter.timeline.cues)if(n===Math.ceil(cue.fullOpacityEnd*60)-1||n===Math.ceil(cue.visibleEnd*60)-1||n===Math.ceil(cue.visibleEnd*60))tailResults.push({cueId:cue.id,frame:n,time,opacity:Number(independentOpacity(cue,time).toFixed(6)),visible:visible.some(c=>c.id===cue.id)});
    checks.push({frame:n,sourceFrame:j,...comparison,glyphChecks,visibleCueIds:visible.map(c=>c.id)});completed++;
    if(Date.now()-lastReport>10000){lastReport=Date.now();console.log(JSON.stringify({phase:'decoded-scene-audit',format,completed,total:frames.length,elapsedSeconds:(lastReport-begun)/1000}));}
   }
  }
  assert.equal((await originals.next()).done,true);assert.equal((await actuals.next()).done,true);await Promise.all([sourceDone,actualDone]);assert.equal(completed,frames.length);
  const tokens=painter.timeline.cues.flatMap(c=>c.lanes.flatMap(l=>l.tokens));assert.equal(new Set(tokens.map(t=>t.id)).size,tokens.length,'Stable token IDs must be unique');
  for(const token of tokens){assert.ok(tokenResults[token.id],`Token omitted from decoded audit: ${token.id}`);assert.ok(tokenResults[token.id]!.focusedChecks>=1,`Token never checked focused: ${token.id}`);assert.ok(tokenResults[token.id]!.neutralChecks>=1,`Token never checked neutral: ${token.id}`);}
  assert.ok(overlapFrames>0,'Independent simultaneous vocal blocks were not decoded');
  assert.equal(await fileHash(path),outputSha256,'Delivered film changed during decoded audit');assert.equal(await fileHash(resolve(root,'scripts/render-production.ts')),rendererSha256,'Renderer changed during decoded audit');assert.ok(representative,'Missing exact representative frame');
  mkdirSync(resolve(root,'evidence'),{recursive:true});writeFileSync(resolve(root,`evidence/final-${format}-51.800.jpg`),representative);writeFileSync(resolve(root,`evidence/final-${format}-critical-contact.jpg`),contact.toBuffer('image/jpeg',93));
  const fallback=Object.entries(tokenResults).filter(([,t])=>t.maskMode==='opaque-chroma-cell').map(([id,t])=>({id,language:t.language,opaquePixels:t.pixels}));
  return {file:basename(path),sha256:outputSha256,rendererSha256,width:size.width,height:size.height,sampledOutputFrames:completed,sourceFrameSamples:sourceIndices.length,sourceEvents:painter.timeline.cues.flatMap(c=>c.words).length,allLanguageTokens:tokens.length,cueCount:painter.timeline.cues.length,simultaneousVocalFrames:overlapFrames,maxMeanAbsoluteRgbError:Math.max(...checks.map(c=>c.meanAbsoluteRgbError)),maxFractionChannelsOver24:Math.max(...checks.map(c=>c.fractionChannelsOver24)),worstGlyphMatchingFraction:Math.min(...Object.values(tokenResults).map(t=>t.worstMatchingFraction)),thinGlyphFallback:{count:fallback.length,tokens:fallback},checks,tokenResults,tailResults,elapsedSeconds:(Date.now()-begun)/1000};
 }catch(error){sourceChild.kill('SIGTERM');actualChild.kill('SIGTERM');throw error;}
}
async function main():Promise<void>{
 const option=(name:string):string|undefined=>{const i=process.argv.indexOf(name);return i<0?undefined:process.argv[i+1];};
 if(process.argv.includes('--help')){console.log('Usage: node scripts/verify-decoded-scene.ts [--landscape PATH] [--portrait PATH] [--report PATH]');return;}
 checkProductionGate();const current=readJson<Identity>('evidence/preview-inputs.json'),identity=canonical(current);
 const evidencePaths=['source/production-clock.json','evidence/preview-inputs.json','evidence/sync-review.json','evidence/production-authorization.json'];
 const evidenceHashes=Object.fromEntries(await Promise.all(evidencePaths.map(async p=>[p,await fileHash(resolve(root,p))])));
 const scriptHash=hashBytes(readFileSync(fileURLToPath(import.meta.url))),rendererHash=await fileHash(resolve(root,'scripts/render-production.ts'));
 const files={landscape:option('--landscape'),portrait:option('--portrait')};assert.ok(files.landscape||files.portrait,'Pass at least one completed film');
 const formats:Partial<Record<Format,Record<string,unknown>>>={};
 for(const format of ['landscape','portrait'] as const){const file=files[format];if(file){assert.ok(!basename(file).includes('.partial.'),'Partial exports must not be decoded');assert.ok(existsSync(resolve(file)),'Missing completed film');formats[format]=await verifyFormat(format,resolve(file),current);assert.equal(formats[format]!.rendererSha256,rendererHash,'Mixed renderer identities in decoded audit');}}
 checkProductionGate();assert.equal(canonical(readJson<Identity>('evidence/preview-inputs.json')),identity);
 for(const p of evidencePaths)assert.equal(await fileHash(resolve(root,p)),evidenceHashes[p],`${p} changed during decoded audit`);
 assert.equal(hashBytes(readFileSync(fileURLToPath(import.meta.url))),scriptHash,'Verifier changed during audit');assert.equal(await fileHash(resolve(root,'scripts/render-production.ts')),rendererHash,'Renderer changed during audit');
 const complete=Boolean(formats.landscape&&formats.portrait),report=resolve(option('--report')??resolve(root,complete?'evidence/decoded-scene-verification.json':`evidence/decoded-scene-${Object.keys(formats)[0]}.json`));
 const result={schema:'prizrak/decoded-scene-verification/v1',status:complete?'passed':'partial',revision:current.revision,verifiedAt:new Date().toISOString(),sourceSha256:current.inputHashes['public/source.mp4'],approvedInputHashes:current.inputHashes,rendererSha256:rendererHash,verifierSha256:scriptHash,gateEvidenceHashes:evidenceHashes,formats,methods:{picture:'Exact original decoded frame min(6375,floor(n*25/60)); shared unchanged paintScene/initScene; pinned Latin/Cyrillic500 and Japanese600 fonts; full RGB comparisons with decoded delivered frames.',parityTolerance:'Mean absolute RGB error ≤7 and fraction of sampled channels differing >24 ≤4%; H.264/YUV420 conversion is lossy.',focus:'Independent integer sample n*735. Every language uses half-open source intervals and semantic unions. All423 current language tokens must be checked focused and neutral at fully opaque cue frames; both simultaneous vocal blocks are audited independently.',glyphs:'Opaque native glyph interiors, eroded one pixel when at least12 remain; sparse glyphs use opaque2x2 cells aligned to420chroma with at least4 pixels. At least90% must lie within34 RGB distance of expected fill and at least6 closer than the alternate. Sparse cell pixels are correlated and rely additionally on full-scene parity and the integer-sample oracle.',tails:'All cue fullOpacityEnd/visibleEnd boundaries sampled before/after. Fade states are verified through scene parity; palette assumptions apply only to fully opaque text.'},limits:'Checks sampled encoded picture ownership, layout, fonts, palette, simultaneous semantic focus and cue lifetime. Does not establish acoustic correctness, listening approval, bitwise browser raster parity, or complete source-picture parity at every frame.'};
 mkdirSync(dirname(report),{recursive:true});const temporary=report+'.tmp';writeFileSync(temporary,JSON.stringify(result,null,2)+'\n');renameSync(temporary,report);console.log(JSON.stringify({status:result.status,report:basename(report),formats:Object.keys(formats)}));
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url))main().catch(error=>{console.error(error instanceof Error?error.message:error);process.exitCode=1;});
