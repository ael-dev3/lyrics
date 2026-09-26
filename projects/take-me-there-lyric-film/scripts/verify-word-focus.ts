import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {createHash} from 'node:crypto';
import {createReadStream, mkdirSync, readFileSync, writeFileSync} from 'node:fs';
import {basename, dirname, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {createCanvas, GlobalFonts} from '@napi-rs/canvas';
import {parseTimeline, smooth, type Cue, type Format, type Word} from '../src/model.ts';
import {layoutCue, shotAt} from '../src/scene.ts';

// Audit sparse *encoded* frame samples. The expected word state is selected
// directly from the frozen acoustic intervals; the audited RGB comes from FFmpeg
// decoding the final MP4. Shared layout gives glyph coordinates, not pixel proof.
const root = fileURLToPath(new URL('../', import.meta.url));
const timeline = parseTimeline(JSON.parse(readFileSync(resolve(root,'public/timeline.json'),'utf8')));
const FPS = 60, SCALE = .5;
type Placed = ReturnType<typeof layoutCue>[number];
type Point = {x:number;y:number;position:number};
type Mask = {core:Point[];control:Point[];slot:Placed};
type Sample = {frame:number;time:number;cue:Cue;word:Word};
type Check = {slot:string;wordIds:string[];expectedActive:boolean;medianMargin:number;medianPaletteDistance:number;controlPaletteDistance:number;coreBrightness:number;status:'passed'|'ambiguous'|'mismatch'};

function option(name:string):string|undefined{const i=process.argv.indexOf(name);return i<0?undefined:process.argv[i+1];}
function median(values:number[]):number{const sorted=[...values].sort((a,b)=>a-b),m=Math.floor(sorted.length/2);return sorted.length%2?(sorted[m]??0):((sorted[m-1]??0)+(sorted[m]??0))/2;}
async function sha(path:string):Promise<string>{const h=createHash('sha256');for await(const part of createReadStream(path))h.update(part as Buffer);return h.digest('hex');}
function alpha(cue:Cue,t:number):number{return Math.min(smooth((t-cue.start+.22)/.18),1-smooth((t-cue.end-.06)/.24));}
function sampleFor(cue:Cue,word:Word):Sample{
  const first=Math.max(0,Math.ceil(word.start*FPS-1e-8));
  const last=Math.ceil(word.end*FPS-1e-8)-1;
  assert.ok(last>=first,`No encoded focus frame for ${word.id}`);
  const center=(first+last)/2;
  let best=first,score=-Infinity;
  for(let frame=first;frame<=last;frame++){
    const t=frame/FPS,quality=alpha(cue,t)-Math.abs(frame-center)*1e-5;
    if(quality>score){score=quality;best=frame;}
  }
  const time=best/FPS;
  assert.ok(time>=word.start-1e-7&&time<word.end+1e-7,`Selected frame misses ${word.id}`);
  return {frame:best,time,cue,word};
}
function sparse<T>(values:T[],limit:number):T[]{return values.length<=limit?values:Array.from({length:limit},(_,i)=>values[Math.floor(i*values.length/limit)] as T);}
function makeMask(slot:Placed,format:Format):Mask{
  const width=format==='landscape'?960:540,height=format==='landscape'?540:960;
  const ox=Math.floor(slot.x)-7,oy=Math.floor(slot.y-slot.size)-7;
  const w=Math.ceil(slot.width)+18,h=Math.ceil(slot.size*1.25)+18;
  const layer=createCanvas(w,h),ctx=layer.getContext('2d');
  ctx.fontVariationSettings="'wght' 700";
  ctx.font=`700 ${slot.size}px SpaceGrotesk`;
  ctx.textAlign='left';ctx.textBaseline='alphabetic';ctx.fillStyle='#ffffff';
  ctx.fillText(slot.text.toUpperCase(),slot.x-ox,slot.y-oy);
  const rgba=ctx.getImageData(0,0,w,h).data;
  const a=(x:number,y:number):number=>rgba[(y*w+x)*4+3]??0;
  const core:Point[]=[],control:Point[]=[];
  const seenCore=new Set<number>(),seenControl=new Set<number>();
  for(let y=6;y<h-6;y++) for(let x=6;x<w-6;x++){
    const nx=ox+x,ny=oy+y,position=(ny-(slot.y-slot.size))/slot.size;
    if(position<.60||position>.92)continue; // Colored lower half separates active from resting gradients.
    const sx=Math.round(nx*SCALE),sy=Math.round(ny*SCALE),index=sy*width+sx;
    if(sx<1||sx>=width-1||sy<1||sy>=height-1)continue;
    if(a(x,y)>249&&a(x-2,y)>242&&a(x+2,y)>242&&a(x,y-2)>242&&a(x,y+2)>242){
      if(!seenCore.has(index)){core.push({x:sx,y:sy,position});seenCore.add(index);}
    }else if(a(x,y)===0&&a(x-5,y)===0&&a(x+5,y)===0&&a(x,y-5)===0&&a(x,y+5)===0){
      if(!seenControl.has(index)){control.push({x:sx,y:sy,position});seenControl.add(index);}
    }
  }
  assert.ok(core.length>=8,`Too few glyph-interior samples for visible slot ${slot.text}`);
  return {slot,core:sparse(core,96),control:sparse(control,96)};
}
type Rgb=readonly [number,number,number];
const white:Rgb=[255,255,255],iceMid:Rgb=[181,233,255],iceEnd:Rgb=[121,207,255];
const roseMid:Rgb=[255,209,233],roseEnd:Rgb=[255,144,202];
const restTop:Rgb=[226,232,241],restEnd:Rgb=[168,187,214];
function blend(a:Rgb,b:Rgb,t:number):Rgb{return [a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t,a[2]+(b[2]-a[2])*t];}
function target(position:number,kind:'active'|'rest',hue:'ice'|'rose'):Rgb{
  if(kind==='rest')return blend(restTop,restEnd,position);
  const middle=hue==='ice'?iceMid:roseMid,end=hue==='ice'?iceEnd:roseEnd;
  return position<.6?blend(white,middle,position/.6):blend(middle,end,(position-.6)/.4);
}
function distance(a:Rgb,b:Rgb):number{return Math.hypot(a[0]-b[0],a[1]-b[1],a[2]-b[2]);}
function rgb(frame:Buffer,width:number,p:Point):Rgb{
  const i=(p.y*width+p.x)*3;return [frame[i]??0,frame[i+1]??0,frame[i+2]??0];
}
function classify(frame:Buffer,width:number,mask:Mask,expectedActive:boolean,hue:'ice'|'rose'):Check{
  const values=mask.core.map(p=>{
    const color=rgb(frame,width,p),active=distance(color,target(p.position,'active',hue)),rest=distance(color,target(p.position,'rest',hue));
    return {margin:rest-active,best:Math.min(active,rest),brightness:(color[0]+color[1]+color[2])/3};
  });
  const margin=median(values.map(v=>v.margin)),best=median(values.map(v=>v.best)),brightness=median(values.map(v=>v.brightness));
  const control=mask.control.map(p=>{
    const color=rgb(frame,width,p);
    return Math.min(distance(color,target(p.position,'active',hue)),distance(color,target(p.position,'rest',hue)));
  });
  const controlDistance=control.length?median(control):Infinity;
  const matches=expectedActive?margin>0:margin<0;
  // A source highlight with the same palette can defeat an absolute color test.
  // Fail closed on weak margins, unreliable masks, and matching controls.
  const ambiguous=Math.abs(margin)<13||best>58||brightness<90||controlDistance<best+8;
  return {slot:mask.slot.text,wordIds:mask.slot.wordIds,expectedActive,
    medianMargin:Number(margin.toFixed(2)),medianPaletteDistance:Number(best.toFixed(2)),
    controlPaletteDistance:Number(controlDistance.toFixed(2)),coreBrightness:Number(brightness.toFixed(2)),
    status:ambiguous?'ambiguous':matches?'passed':'mismatch'};
}
function balanced(parts:string[]):string{
  assert.ok(parts.length>0);
  if(parts.length===1)return parts[0] as string;
  const middle=Math.floor(parts.length/2);
  return `(${balanced(parts.slice(0,middle))}+${balanced(parts.slice(middle))})`;
}
async function* decodedSamples(path:string,frames:number[],width:number,height:number):AsyncGenerator<Buffer>{
  const selector=balanced(frames.map(frame=>`eq(n\\,${frame})`));
  const filter=`select=${selector},scale=${width}:${height}:flags=area,format=rgb24`;
  const child=spawn('ffmpeg',['-hide_banner','-v','error','-xerror','-i',path,'-an','-vf',filter,
    '-fps_mode','passthrough','-f','rawvideo','-pix_fmt','rgb24','pipe:1'],{stdio:['ignore','pipe','pipe']});
  let failure='';child.stderr.on('data',chunk=>{failure+=String(chunk);if(failure.length>3000)failure=failure.slice(-3000);});
  const size=width*height*3;
  let frame=Buffer.allocUnsafe(size),used=0,count=0;
  for await(const chunk of child.stdout){
    const bytes=chunk as Buffer;let offset=0;
    while(offset<bytes.length){const take=Math.min(size-used,bytes.length-offset);bytes.copy(frame,used,offset,offset+take);offset+=take;used+=take;
      if(used===size){yield frame;count++;frame=Buffer.allocUnsafe(size);used=0;}
    }
  }
  const exit=child.exitCode!==null?child.exitCode:await new Promise<number|null>((done,reject)=>{child.once('error',reject);child.once('close',done);});
  assert.equal(exit,0,`Encoded-frame decode failed: ${failure.replaceAll(root,'<project>')}`);
  assert.equal(used,0,'Partial RGB frame from decoder');
  assert.equal(count,frames.length,'Decoded sample count differs from requested frame schedule');
}
async function main():Promise<void>{
  if(process.argv.includes('--help')){console.log('Usage: node scripts/verify-word-focus.ts --input FILE --format landscape|portrait [--report FILE]');return;}
  const input=option('--input'),format=option('--format');
  assert.ok(input&& (format==='landscape'||format==='portrait'),'Pass --input MP4 and --format landscape|portrait');
  const negativeControl=process.argv.includes('--negative-control');
  const output=option('--report')??resolve(root,`evidence/encoded-focus-${format}${negativeControl?'-negative-control':''}.json`);
  const width=format==='landscape'?960:540,height=format==='landscape'?540:960;
  assert.ok(GlobalFonts.registerFromPath(resolve(root,'public/fonts/SpaceGrotesk.ttf'),'SpaceGrotesk'),'Cannot load approved font');
  const measuring=createCanvas(width*2,height*2).getContext('2d');
  measuring.fontVariationSettings="'wght' 700";
  const events=timeline.cues.flatMap(cue=>cue.words.map(word=>sampleFor(cue,word)));
  assert.equal(events.length,225,'Focus event inventory changed');
  const byFrame=new Map<number,Sample[]>();
  for(const event of events){const list=byFrame.get(event.frame)??[];list.push(event);byFrame.set(event.frame,list);}
  const frames=[...byFrame.keys()].sort((a,b)=>a-b);
  const masks=new Map<string,Mask>();
  const checks:{frame:number;timeSeconds:number;cueId:string;wordId:string;activeSlot:string;wordChecks:Check[]}[]=[];
  let decoded=0;
  for await(const pixels of decodedSamples(resolve(input),frames,width,height)){
    const frame=frames[decoded++];assert.ok(frame!==undefined);
    for(const sample of byFrame.get(frame)??[]){
      const shot=shotAt(sample.time);
      const slots=layoutCue(measuring as unknown as CanvasRenderingContext2D,sample.cue,format,shot);
      assert.ok(slots.length>0);
      const activeSlots=slots.filter(slot=>slot.wordIds.includes(sample.word.id));
      assert.equal(activeSlots.length,1,`No unique display slot for ${sample.word.id}`);
      const actualIndex=slots.indexOf(activeSlots[0] as Placed);
      // Deliberately point to the next visible word in a separate diagnostic.
      // A sound checker must reject those shifted labels on the real MP4 pixels.
      const expectedIndex=negativeControl&&slots.length>1?(actualIndex+1)%slots.length:actualIndex;
      const wordChecks=slots.map(slot=>{
        const key=`${format}:${shot.id}:${sample.cue.id}:${slot.wordIds.join(',')}`;
        let mask=masks.get(key);if(!mask){mask=makeMask(slot,format);masks.set(key,mask);}
        return classify(pixels,width,mask,slots.indexOf(slot)===expectedIndex,shot.hue);
      });
      checks.push({frame,timeSeconds:Number(sample.time.toFixed(6)),cueId:sample.cue.id,
        wordId:sample.word.id,activeSlot:activeSlots[0]?.text??'',wordChecks});
    }
  }
  assert.equal(checks.length,events.length);
  const suspect=checks.filter(check=>check.wordChecks.some(word=>word.status==='mismatch'));
  const ambiguous=checks.filter(check=>check.wordChecks.some(word=>word.status==='ambiguous'));
  const report={schema:'lyric-film/encoded-word-focus/v1',song:timeline.song,revision:timeline.revision,
    format,negativeControl,inputFile:basename(input),inputSha256:await sha(resolve(input)),
    timelineSha256:await sha(resolve(root,'public/timeline.json')),
    fontSha256:await sha(resolve(root,'public/fonts/SpaceGrotesk.ttf')),
    status:negativeControl?(suspect.length?'negative-control-detected':'negative-control-failed')
      :suspect.length||ambiguous.length?'inspection-required':'passed',
    summary:{selectedWordEvents:events.length,decodedFrames:frames.length,individualSlotStates:checks.reduce((n,c)=>n+c.wordChecks.length,0),
      mismatchedEvents:suspect.length,ambiguousEvents:ambiguous.length,sharedEchoSlots:events.filter(e=>e.cue.words.length>3&&e.cue.kind==='hook'&&e.word.text.toLowerCase()==='there').length},
    method:'Select one valid native60fps frame for each of225 timed word events, preferring full cue opacity. Decode actual MP4 RGB pixels at half resolution. Use the approved font and shot-specific layout to sample eroded glyph interiors, classify active versus resting gradient colors, and inspect every other visible slot for unwanted focus. Optional negative control deliberately expects the next visible slot and must produce mismatches.',
    limits:['A shared THERE slot is correctly counted once per timed echo event, although its physical glyph is reused.','One selected frame per event does not certify every boundary frame or acoustic truth.','Color on matching bright source imagery can be ambiguous; uncertain samples require encoded-frame inspection.','The word geometry and font are shared with the production scene; decoded colors and timing-event selection are independent.'],
    suspect:suspect.slice(0,50),ambiguous:ambiguous.slice(0,50),checks};
  mkdirSync(dirname(resolve(output)),{recursive:true});writeFileSync(resolve(output),JSON.stringify(report,null,2)+'\n');
  console.log(JSON.stringify({report:basename(output),status:report.status,...report.summary}));
  if((!negativeControl&&report.status!=='passed')||(negativeControl&&report.status!=='negative-control-detected'))process.exitCode=2;
}
main().catch(error=>{console.error(error);process.exitCode=1;});
