import assert from 'node:assert/strict';
import {spawn, type ChildProcessWithoutNullStreams} from 'node:child_process';
import {createReadStream,readFileSync,writeFileSync,mkdirSync,renameSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {basename,dirname,resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {createCanvas,GlobalFonts,ImageData,loadImage} from '@napi-rs/canvas';
import {cueLayout,paintScene,setSceneForProof} from '../src/scene.ts';
import type {Cue,Format,Timeline,FeatureData} from '../src/model.ts';
import {checkCurrentProductionGate,type Identity} from './render-gate.ts';
import {canonical,outputFrameCount,type Manifest as SourceManifest} from './verify-final.ts';

// Compare delivered decoded pictures with the unchanged approved scene painted
// over an exact decoded original frame. The temporal focus oracle below uses
// integer n*735 samples; it does not call sourceActive or targetActive.
const FPS=60,SAMPLES_PER_FRAME=735;
const contactTimes=[16.383333,16.4,54.583333,58.383333,68,102.1,149.7,161.2,164.65,198,199.983333,201.2];
const REPRESENTATIVE_FRAME=68*60;
interface Slot {index:number;text:string;x:number;y:number;width:number;}
interface TokenMask {id:string;cue:Cue;kind:'source'|'target';index:number;points:number[];maskMode:'eroded-interior'|'opaque-chroma-cell';}
interface Check {frame:number;sourceFrame:number;meanAbsoluteRgbError:number;fractionChannelsOver24:number;glyphChecks:number;}
const root=fileURLToPath(new URL('../',import.meta.url));
const readJson=<T>(path:string):T=>JSON.parse(readFileSync(resolve(root,path),'utf8')) as T;
const hashBytes=(bytes:Uint8Array):string=>createHash('sha256').update(bytes).digest('hex');
const dimensions=(format:Format)=>({width:1080,height:format==='portrait'?1920:1080});
async function fileHash(path:string):Promise<string>{const h=createHash('sha256');for await(const b of createReadStream(path))h.update(b as Buffer);return h.digest('hex');}
async function* rawFrames(child:ChildProcessWithoutNullStreams,frameBytes:number):AsyncGenerator<Buffer>{
  let frame=Buffer.allocUnsafe(frameBytes),used=0;
  for await(const part of child.stdout){const chunk=part as Buffer;for(let offset=0;offset<chunk.length;){
    const count=Math.min(frameBytes-used,chunk.length-offset);chunk.copy(frame,used,offset,offset+count);offset+=count;used+=count;
    if(used===frameBytes){yield frame;frame=Buffer.allocUnsafe(frameBytes);used=0;}
  }}
  if(used)throw Error(`Truncated decoded raw frame: ${used} bytes`);
}
function watchChild(child:ChildProcessWithoutNullStreams,label:string):Promise<void>{
  let stderr='';child.stderr.on('data',b=>{stderr=(stderr+String(b)).slice(-6000);});
  const done=new Promise<void>((accept,reject)=>{child.once('error',reject);child.once('close',code=>code===0?accept():reject(Error(`${label} failed ${code}: ${stderr.replaceAll(root,'<project>')}`)));});
  void done.catch(()=>{});return done;
}
export function sourcePictureIndex(outputFrame:number,sourceFrames=5220):number{
  assert.ok(Number.isSafeInteger(outputFrame)&&outputFrame>=0);
  return Math.min(sourceFrames-1,Number(BigInt(outputFrame)*25n/60n));
}
export function independentFrameTime(frame:number):number{
  assert.ok(Number.isSafeInteger(frame)&&frame>=0);let t=frame/60;
  const bits=new DataView(new ArrayBuffer(8));
  // Normalize only a floating representation below the exact integer frame
  // sample/picture coordinate. No acoustic or artistic time offset is added.
  while(t*44100<frame*735||Math.floor(t*25)<Number(BigInt(frame)*25n/60n)){
    bits.setFloat64(0,t);bits.setBigUint64(0,bits.getBigUint64(0)+1n);t=bits.getFloat64(0);
  }
  return t;
}
async function independentPainter(format:Format){
  const timeline=readJson<Timeline>('public/timeline.json'),features=readJson<FeatureData>('public/audio-features.json');
  assert.equal(features.sourceSha256,timeline.sourceSha256);assert.equal(timeline.sampleRate,44100);
  assert.equal(features.analysis.frameRate.numerator,25);assert.equal(features.analysis.frameRate.denominator,1);
  assert.ok(GlobalFonts.registerFromPath(resolve(root,'public/fonts/Alegreya.ttf'),'Kamushku'),'Approved font registration failed');
  const reference=await loadImage(resolve(root,'public/material-reference.png'));
  const stones=readJson<{stones:Parameters<typeof setSceneForProof>[2]}>('public/stone-anchors.json').stones;
  setSceneForProof(timeline,features,stones,(width,height)=>{const canvas=createCanvas(width,height);return {canvas:canvas as unknown as CanvasImageSource,context:canvas.getContext('2d') as unknown as CanvasRenderingContext2D};},reference as unknown as CanvasImageSource);
  const size=dimensions(format),canvas=createCanvas(size.width,size.height),context=canvas.getContext('2d') as unknown as CanvasRenderingContext2D;
  const sourceCanvas=createCanvas(1080,1080),sc=sourceCanvas.getContext('2d');let last=-1;
  return {canvas,context,timeline,paint(bytes:Buffer,j:number,n:number):Buffer{
    assert.equal(bytes.length,1080*1080*4);
    if(j!==last){sc.putImageData(new ImageData(new Uint8ClampedArray(bytes.buffer,bytes.byteOffset,bytes.byteLength),1080,1080),0,0);last=j;}
    paintScene(context,independentFrameTime(n),format,sourceCanvas as unknown as CanvasImageSource);return canvas.data();
  }};
}
export function independentOpacity(cue:Cue,time:number):number {
  const smooth=(a:number,b:number,x:number):number=>{if(b<=a)return x>=b?1:0;const u=Math.max(0,Math.min(1,(x-a)/(b-a)));return u*u*(3-2*u);};
  if(time<cue.visibleStart || time>=cue.visibleEnd)return 0;
  const entryEnd=cue.start-.012;
  const entry=cue.visibleStart>=entryEnd?1:smooth(cue.visibleStart,entryEnd,time);
  return entry*(cue.exitMode==='vocal-handoff'?1:1-smooth(cue.fullOpacityEnd,cue.visibleEnd,time));
}
export function selectedFrames(timeline:Timeline,source:SourceManifest):number[] {
  const total=outputFrameCount(source),frames=new Set<number>([0,1,REPRESENTATIVE_FRAME,total-1,total-2,...contactTimes.map(t=>Math.round(t*60))]);
  const add=(n:number):void=>{if(Number.isSafeInteger(n)&&n>=0&&n<total)frames.add(n);};
  for(const cue of timeline.cues) {
    for(const word of cue.words) {
      const first=Math.ceil(word.startSample/735),off=Math.ceil(word.endSample/735);
      [first-1,first,off-1,off,Math.round((word.startSample+word.endSample)/1470)].forEach(add);
    }
    for(const time of [cue.visibleStart,cue.start,cue.end,cue.fullOpacityEnd,cue.visibleEnd]) {
      const n=Math.ceil(time*60);[n-1,n,n+1].forEach(add);
    }
    add(Math.round((cue.end+cue.fullOpacityEnd)*30));
  }
  // Original picture motion, framing and authored endcards are also sampled
  // outside cue boundaries. All four final held-picture frames are checked.
  for(let n=0;n<total;n+=5*60)add(n);
  for(let n=Math.ceil((source.video.frameCount-1)*60/25);n<total;n++)add(n);
  return [...frames].sort((a,b)=>a-b);
}
function masksForCue(cue:Cue,format:Format,context:CanvasRenderingContext2D):TokenMask[] {
  const layout=cueLayout(context,cue,format),size=dimensions(format);
  const mask=createCanvas(size.width,size.height),ctx=mask.getContext('2d');
  ctx.font=`500 ${layout.size}px Kamushku`;ctx.textBaseline='alphabetic';ctx.fillStyle='#ffffff';
  const result:TokenMask[]=[];
  const add=(slots:Slot[],kind:'source'|'target'):void=>{
    for(const slot of slots) {
      ctx.clearRect(0,0,size.width,size.height);ctx.fillText(slot.text,slot.x,slot.y);
      const x0=Math.max(0,Math.floor(slot.x)-2),y0=Math.max(0,Math.floor(slot.y-layout.size*1.1));
      const w=Math.min(size.width-x0,Math.ceil(slot.width)+5),h=Math.min(size.height-y0,Math.ceil(layout.size*1.45));
      const rgba=ctx.getImageData(x0,y0,w,h).data,interior:number[]=[],chromaCells:number[]=[];
      // Only opaque interior fill pixels, eroded one pixel, excluding outlines,
      // shadows, antialiasing and the color mixture at glyph boundaries.
      for(let y=1;y<h-1;y++)for(let x=1;x<w-1;x++) {
        const p=(y*w+x)*4;
        const at=((y+y0)*size.width+x+x0)*4;
        const cx=Math.floor((x+x0)/2)*2-x0,cy=Math.floor((y+y0)/2)*2-y0,cell=(cy*w+cx)*4;
        if(rgba[p+3]===255&&[cell,cell+4,cell+w*4,cell+w*4+4].every(i=>rgba[i+3]===255))chromaCells.push(at);
        if([p,p-4,p+4,p-w*4,p+w*4].every(i=>(rgba[i+3]??0)>=250))interior.push(at);
      }
      // At the approved native serif size, thin letters (such as "I", "a"
      // and "Я") can have fewer than12 eroded pixels. Require completely
      // opaque2×2 cells aligned to the delivered420chroma grid. This avoids
      // neighboring outline/background chroma; no color threshold is relaxed.
      const maskMode=interior.length>=12?'eroded-interior':'opaque-chroma-cell';
      const points=maskMode==='eroded-interior'?interior:chromaCells;
      assert.ok(points.length>=(maskMode==='eroded-interior'?12:4),`Too few solid glyph pixels: ${cue.id}/${kind}/${slot.index}`);
      const id=kind==='source'?cue.words[slot.index]!.id:cue.targets[slot.index]!.id;
      result.push({id,cue,kind,index:slot.index,points,maskMode});
    }
  };
  add(layout.source,'source');add(layout.target,'target');return result;
}
function isFocused(token:TokenMask,frame:number):boolean {
  const sample=frame*SAMPLES_PER_FRAME;
  const active=(index:number):boolean=>{
    const word=token.cue.words.find(w=>w.sourceIndex===index);assert.ok(word);
    return sample>=word.startSample&&sample<word.endSample;
  };
  if(token.kind==='source')return active(token.cue.words[token.index]!.sourceIndex);
  return token.cue.targets[token.index]!.focusSourceIndices.some(active);
}
function glyphAudit(bytes:Buffer,token:TokenMask,frame:number):{id:string;kind:string;focused:boolean;matchingFraction:number;pixels:number;maskMode:string} {
  const focus=isFocused(token,frame),chosen=focus?[224,183,151]:[236,229,219],other=focus?[236,229,219]:[224,183,151];
  let matching=0;
  for(const p of token.points) {
    let a=0,b=0;
    for(let c=0;c<3;c++) {const v=bytes[p+c]!;a+=(v-chosen[c]!)**2;b+=(v-other[c]!)**2;}
    if(Math.sqrt(a)<34&&Math.sqrt(a)+6<Math.sqrt(b))matching++;
  }
  const fraction=matching/token.points.length;
  assert.ok(fraction>=.90,`Decoded ${token.kind} focus mismatch ${token.id} at frame ${frame}: ${focus?'gold':'neutral'}, ${fraction.toFixed(3)} matching`);
  return {id:token.id,kind:token.kind,focused:focus,matchingFraction:Number(fraction.toFixed(5)),pixels:token.points.length,maskMode:token.maskMode};
}
export function decodedSceneParity(expected:Buffer,actual:Buffer):{meanAbsoluteRgbError:number;fractionChannelsOver24:number} {
  assert.equal(actual.length,expected.length);
  let sum=0,large=0,count=0;
  // Sample every fourth pixel across the full picture, including the
  // full source square, portrait atmosphere, lyric typography and stone response.
  // Glyph interior audits separately inspect every solid token fill pixel.
  for(let p=0;p<expected.length;p+=16)for(let c=0;c<3;c++) {
    const error=Math.abs(expected[p+c]!-actual[p+c]!);sum+=error;if(error>24)large++;count++;
  }
  const mae=sum/count,fraction=large/count;
  assert.ok(mae<=7&&fraction<=.04,`Decoded scene parity failed: RGB MAE ${mae.toFixed(3)}, >24 fraction ${fraction.toFixed(4)}`);
  return {meanAbsoluteRgbError:Number(mae.toFixed(5)),fractionChannelsOver24:Number(fraction.toFixed(6))};
}
function outputDecoder(path:string,frames:number[]) {
  // A long left-associated sum exceeds FFmpeg's expression recursion limit.
  // Balance the tree; the selected frame set and ownership stay unchanged.
  const expression=(rows:number[]):string=>{
    if(rows.length===1)return `eq(n\\,${rows[0]})`;
    const middle=Math.floor(rows.length/2);return `(${expression(rows.slice(0,middle))}+${expression(rows.slice(middle))})`;
  };
  const filter=`select=${expression(frames)}`;
  const child=spawn('ffmpeg',['-hide_banner','-v','error','-nostdin','-threads','2','-xerror','-err_detect','explode','-i',path,
    '-map','0:v:0','-vf',filter,'-frames:v',String(frames.length),'-fps_mode','passthrough','-f','rawvideo','-pix_fmt','rgba','pipe:1'],{stdio:['pipe','pipe','pipe']});
  child.stdin.end();return child;
}
async function verifyFormat(format:Format,path:string,current:Identity):Promise<Record<string,unknown>> {
  const outputSha256=await fileHash(path),rendererSha256=await fileHash(resolve(root,'scripts/render-production.ts'));
  const source=readJson<SourceManifest>('source/manifest.json'),painter=await independentPainter(format),size=dimensions(format);
  assert.equal(source.sha256,current.inputs['public/source.mp4']);
  assert.equal(source.audio.sampleRate,44100);assert.equal(source.video.fpsNumerator,25);assert.equal(source.video.fpsDenominator,1);
  const frames=selectedFrames(painter.timeline,source),selected=new Set(frames);
  // This independent equation does not import the production clock mapping.
  const sourceIndex=(n:number)=>sourcePictureIndex(n,source.video.frameCount);
  const sourceIndices=[...new Set(frames.map(sourceIndex))],sourceChild=outputDecoder(resolve(root,'public/source.mp4'),sourceIndices),actualChild=outputDecoder(path,frames);
  const sourceDone=watchChild(sourceChild,'Original parity decoder'),actualDone=watchChild(actualChild,'Delivered parity decoder');
  const sourceFrames=rawFrames(sourceChild,1080*1080*4),actualFrames=rawFrames(actualChild,size.width*size.height*4);
  const masks=new Map<string,TokenMask[]>(),checks:Check[]=[],tokenResults:Record<string,{kind:string;maskMode:string;pixels:number;checks:number;focusedChecks:number;neutralChecks:number;worstMatchingFraction:number}>={};
  const tailResults:{cueId:string;frame:number;time:number;opacity:number;visible:boolean}[]=[];
  const cellW=format==='landscape'?480:216,cellH=Math.round(cellW*size.height/size.width)+26;
  const contact=createCanvas(cellW*4,cellH*3),cc=contact.getContext('2d');cc.fillStyle='#111713';cc.fillRect(0,0,contact.width,contact.height);
  const contactFrames=contactTimes.map(t=>Math.round(t*60)),decodedCanvas=createCanvas(size.width,size.height),dc=decodedCanvas.getContext('2d');
  let representative:Buffer|undefined;
  let completed=0,lastReport=Date.now();const begun=Date.now();
  try {
    for(const j of sourceIndices) {
      const sourceFrame=await sourceFrames.next();if(sourceFrame.done) {await sourceDone;throw Error('Missing original selected picture');}
      const group=frames.filter(n=>sourceIndex(n)===j),last=group.at(-1)!;
      // Paint the selected source picture on its native hold, without
      // interpolation or seeks. Canonical material masks were already bound
      // independently; intermediate output frames exercise the same cache.
      const first=Math.ceil(j*60/25);
      for(let n=first;n<=last;n++) {
        const expected=painter.paint(sourceFrame.value!,j,n);
        if(!selected.has(n))continue;
        const actual=await actualFrames.next();if(actual.done) {await actualDone;throw Error('Missing delivered selected picture');}
        const comparison=decodedSceneParity(expected,actual.value!);
        const cell=contactFrames.indexOf(n);
        if(n===REPRESENTATIVE_FRAME||cell>=0) {
          const bytes=actual.value!;
          dc.putImageData(new ImageData(new Uint8ClampedArray(bytes.buffer,bytes.byteOffset,bytes.byteLength),size.width,size.height),0,0);
          if(n===REPRESENTATIVE_FRAME)representative=decodedCanvas.toBuffer('image/jpeg',95);
          if(cell>=0) {
            const snapshot=await loadImage(decodedCanvas.toBuffer('image/jpeg',94));
            const x=cell%4*cellW,y=Math.floor(cell/4)*cellH;cc.drawImage(snapshot,x,y,cellW,cellH-26);
            cc.fillStyle='#eee3cf';cc.font='14px sans-serif';cc.fillText(`${n/60}s · frame ${n}`,x+7,y+cellH-7);
          }
        }
        const time=independentFrameTime(n),cue=painter.timeline.cues.find(c=>time>=c.visibleStart&&time<c.visibleEnd);
        let glyphChecks=0;
        if(cue&&independentOpacity(cue,time)>=.999999) {
          let tokens=masks.get(cue.id);
          if(!tokens) {tokens=masksForCue(cue,format,painter.context);masks.set(cue.id,tokens);}
          for(const token of tokens) {
            const result=glyphAudit(actual.value!,token,n),prior=tokenResults[result.id]??{kind:result.kind,maskMode:result.maskMode,pixels:result.pixels,checks:0,focusedChecks:0,neutralChecks:0,worstMatchingFraction:1};
            prior.checks++;if(result.focused)prior.focusedChecks++;else prior.neutralChecks++;
            prior.worstMatchingFraction=Math.min(prior.worstMatchingFraction,result.matchingFraction);tokenResults[result.id]=prior;glyphChecks++;
          }
        }
        for(const c of painter.timeline.cues) {
          if(n===Math.ceil(c.fullOpacityEnd*60)-1||n===Math.ceil(c.visibleEnd*60)-1||n===Math.ceil(c.visibleEnd*60))
            tailResults.push({cueId:c.id,frame:n,time,opacity:Number(independentOpacity(c,time).toFixed(6)),visible:cue?.id===c.id});
        }
        checks.push({frame:n,sourceFrame:j,...comparison,glyphChecks});completed++;
        if(Date.now()-lastReport>10000) {lastReport=Date.now();console.log(JSON.stringify({phase:'decoded-scene-audit',format,completed,total:frames.length,elapsedSeconds:(lastReport-begun)/1000}));}
      }
    }
    assert.equal((await sourceFrames.next()).done,true);assert.equal((await actualFrames.next()).done,true);
    await Promise.all([sourceDone,actualDone]);
    assert.equal(completed,frames.length);
    const sourceIds=painter.timeline.cues.flatMap(c=>c.words.map(w=>w.id)),targetIds=painter.timeline.cues.flatMap(c=>c.targets.map(t=>t.id));
    for(const id of [...sourceIds,...targetIds]) {
      assert.ok(tokenResults[id],`Token omitted from decoded audit: ${id}`);
      assert.ok(tokenResults[id]!.focusedChecks>=1,`Token never checked focused: ${id}`);
      assert.ok(tokenResults[id]!.neutralChecks>=1,`Token never checked neutral: ${id}`);
    }
    assert.equal(await fileHash(path),outputSha256,'Delivered film changed during decoded audit');
    assert.equal(await fileHash(resolve(root,'scripts/render-production.ts')),rendererSha256,'Renderer changed during decoded audit');
    assert.ok(representative,'Missing exact frame4080 representative');
    mkdirSync(resolve(root,'evidence'),{recursive:true});
    writeFileSync(resolve(root,`evidence/final-${format}-68.000.jpg`),representative);
    writeFileSync(resolve(root,`evidence/final-${format}-critical-contact.jpg`),contact.toBuffer('image/jpeg',93));
    const fallbackTokens=Object.entries(tokenResults).filter(([,t])=>t.maskMode==='opaque-chroma-cell').map(([id,t])=>({id,kind:t.kind,opaquePixels:t.pixels,fullyOpaqueChromaCells:t.pixels/4}));
    return {file:basename(path),sha256:outputSha256,rendererSha256,width:size.width,height:size.height,
      sampledOutputFrames:completed,sourceFrameSamples:sourceIndices.length,sourceWords:sourceIds.length,targetTokens:targetIds.length,
      cueCount:painter.timeline.cues.length,maxMeanAbsoluteRgbError:Math.max(...checks.map(c=>c.meanAbsoluteRgbError)),
      maxFractionChannelsOver24:Math.max(...checks.map(c=>c.fractionChannelsOver24)),
      worstGlyphMatchingFraction:Math.min(...Object.values(tokenResults).map(t=>t.worstMatchingFraction)),
      thinGlyphFallback:{count:fallbackTokens.length,minimumOpaquePixels:fallbackTokens.length?Math.min(...fallbackTokens.map(t=>t.opaquePixels)):null,tokens:fallbackTokens},
      checks,tokenResults,tailResults,elapsedSeconds:(Date.now()-begun)/1000};
  } catch(error) {sourceChild.kill('SIGTERM');actualChild.kill('SIGTERM');throw error;}
}
async function main():Promise<void> {
  const option=(name:string):string|undefined=>{const i=process.argv.indexOf(name);return i<0?undefined:process.argv[i+1];};
  if(process.argv.includes('--help')) {console.log('Usage: node scripts/verify-decoded-scene.ts --landscape PATH [--portrait PATH] [--report PATH]');return;}
  checkCurrentProductionGate();
  const current=readJson<Identity>('evidence/preview-inputs.json'),identity=canonical(current);
  const evidencePaths=['source/manifest.json','evidence/preview-inputs.json','evidence/sync-review.json','evidence/production-authorization.json'];
  const evidenceHashes=Object.fromEntries(await Promise.all(evidencePaths.map(async p=>[p,await fileHash(resolve(root,p))])));
  const scriptHash=hashBytes(readFileSync(fileURLToPath(import.meta.url)));
  const rendererHash=await fileHash(resolve(root,'scripts/render-production.ts'));
  const files={landscape:option('--landscape'),portrait:option('--portrait')};
  assert.ok(files.landscape||files.portrait,'Pass at least one completed film');
  const formats:Partial<Record<Format,Record<string,unknown>>>={};
  for(const format of ['landscape','portrait'] as const) {
    const file=files[format];if(file) {
      assert.ok(!basename(file).includes('.partial.'),'Partial exports must not be decoded');
      formats[format]=await verifyFormat(format,resolve(file),current);
      assert.equal(formats[format]!.rendererSha256,rendererHash,'Mixed renderer identities in decoded audit');
    }
  }
  checkCurrentProductionGate();assert.equal(canonical(readJson<Identity>('evidence/preview-inputs.json')),identity);
  for(const p of evidencePaths)assert.equal(await fileHash(resolve(root,p)),evidenceHashes[p],`${p} changed during decoded audit`);
  assert.equal(hashBytes(readFileSync(fileURLToPath(import.meta.url))),scriptHash,'Verifier changed during audit');
  assert.equal(await fileHash(resolve(root,'scripts/render-production.ts')),rendererHash,'Renderer changed during audit');
  const complete=Boolean(formats.landscape&&formats.portrait);
  const report=resolve(option('--report')??resolve(root,complete?'evidence/decoded-scene-verification.json':`evidence/decoded-scene-${Object.keys(formats)[0]}.json`));
  const result={schema:'po-kamushku/decoded-scene-verification/v1',status:complete?'passed':'partial',revision:current.revision,
    verifiedAt:new Date().toISOString(),sourceSha256:current.inputs['public/source.mp4'],approvedInputHashes:current.inputs,
    rendererSha256:rendererHash,verifierSha256:scriptHash,gateEvidenceHashes:evidenceHashes,formats,
    methods:{picture:'Exact original frame floor(n*25/60), clamped to final picture, shared unchanged paintScene, approved native font; RGB comparisons against decoded delivered frames.',
      parityTolerance:'Mean absolute RGB error ≤7 and fraction of sampled channels differing >24 ≤4%; lossy H.264 and YUV420 chroma conversion are expected.',
      focus:'Independent sample n*735; source half-open sample events, targets use focusSourceIndices unions. All source and target tokens checked focused and neutral at fully opaque cue frames.',
      glyphs:'Opaque native glyph interiors, eroded one pixel where≥12 pixels remain; thin native serif glyphs use only fullyopaque2×2 cells aligned to the encoded420chroma grid, with at least4 pixels. ≥90% within34 RGB distance of expected fill and at least6 closer to expected than alternate fill. Token IDs and actual counts are retained; one cell has correlated pixels and relies additionally on full-scene parity and the exact independent sample oracle.',
      tails:'Every cue fullOpacityEnd/visibleEnd sampled before and after; fades verified through composited scene parity rather than opaque-palette assumption.'},
    limits:'This verifies sampled encoded scene geometry, source-picture ownership, font/palette rendering and temporal focus/visibility against the approved inputs. It does not establish acoustic correctness, listening review or bitwise browser raster parity.'};
  mkdirSync(dirname(report),{recursive:true});const temporary=report+'.tmp';writeFileSync(temporary,JSON.stringify(result,null,2)+'\n');renameSync(temporary,report);
  console.log(JSON.stringify({status:result.status,report:basename(report),formats:Object.keys(formats)}));
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url))main().catch(error=>{console.error(error instanceof Error?error.message:error);process.exitCode=1;});
