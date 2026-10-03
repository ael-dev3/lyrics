import {PALETTE, sourceActive, targetActive, visibleCue, validateTimeline, type Timeline, type FeatureData, type Cue, type Format} from './model.ts';
export type {Format} from './model.ts';
type Context = CanvasRenderingContext2D;
interface Point {x:number;y:number;}
interface Stone {id:string; x:number;y:number;rx:number;ry:number;angle:number;band:number;polygon?:Point[];}
interface StonePlan {stones:Stone[];}
interface Slot {index:number;text:string;x:number;y:number;width:number;}
interface Layout {size:number;source:Slot[];target:Slot[];top:number;bottom:number;}
let timeline:Timeline, features:FeatureData, stones:Stone[]=[];
interface Surface {canvas:CanvasImageSource;context:Context;}
let surfaceFactory:((width:number,height:number)=>Surface)|undefined;
const materialMasks=new Map<string,{canvas:CanvasImageSource;x:number;y:number}>();
let materialPixels:Uint8ClampedArray|undefined;
let materialReference:CanvasImageSource|undefined;
const layouts=new Map<string,Layout>();
const clamp=(x:number,a=0,b=1)=>Math.max(a,Math.min(b,x));
const smooth=(a:number,b:number,x:number)=>{const u=clamp((x-a)/(b-a));return u*u*(3-2*u);};

export function cueOpacity(c:Cue,t:number):number {
  if(t<c.visibleStart||t>=c.visibleEnd)return 0;
  // If the previous line lasts up to this vocal, replace it at full opacity.
  // A synthetic fade would hide the first active word at its exact entrance.
  const revealEnd=c.start-.012;
  const entrance=revealEnd<=c.visibleStart?1:smooth(c.visibleStart,revealEnd,t);
  return entrance*(c.exitMode==='vocal-handoff'?1:1-smooth(c.fullOpacityEnd,c.visibleEnd,t));
}
export async function loadScene():Promise<void>{
  const read=async<T>(p:string):Promise<T>=>{const r=await fetch(p);if(!r.ok)throw Error(`Missing complete preview asset: ${p}`);return r.json() as Promise<T>;};
  const plan:StonePlan=await read('/public/stone-anchors.json');stones=plan.stones;
  [timeline,features]=await Promise.all([read<Timeline>('/public/timeline.json'),read<FeatureData>('/public/audio-features.json')]);
  validateTimeline(timeline);
  if(features.sourceSha256!==timeline.sourceSha256)throw Error('Audio features belong to another recording');
  const font=new FontFace('Kamushku',"url('/public/fonts/Alegreya.ttf')",{weight:'500'});
  await font.load();document.fonts.add(font);await document.fonts.ready;
  materialReference=await new Promise<HTMLImageElement>((resolve,reject)=>{const image=new Image();image.onload=()=>resolve(image);image.onerror=()=>reject(Error('Canonical source material reference unavailable'));image.src='/public/material-reference.png';});
  surfaceFactory=(width,height)=>{const canvas=document.createElement('canvas');canvas.width=width;canvas.height=height;const context=canvas.getContext('2d');if(!context)throw Error('Stone material canvas unavailable');return {canvas,context};};
}
export function setSceneForProof(t:Timeline,f:FeatureData,s:Stone[],factory?:(width:number,height:number)=>Surface,reference?:CanvasImageSource):void{validateTimeline(t);timeline=t;features=f;stones=s;layouts.clear();materialMasks.clear();materialPixels=undefined;materialReference=reference;surfaceFactory=factory;}
export function getLines(){return timeline.cues.map(c=>({id:c.id,label:c.sourceText,start:c.start,end:c.end}));}
export function getReadingCue(t:number){return visibleCue(timeline,t);}
export function getSceneIdentity(){return {revision:timeline.revision,sampleRate:timeline.sampleRate,sourceSha256:timeline.sourceSha256};}

function wrap(ctx:Context,tokens:{text:string}[],width:number):number[][]{
  const result:number[][]=[];let line:number[]=[];let w=0;const gap=ctx.measureText(' ').width;
  tokens.forEach((token,i)=>{const tw=ctx.measureText(token.text).width;if(line.length&&w+gap+tw>width){result.push(line);line=[];w=0;}w+=(line.length?gap:0)+tw;line.push(i);});
  if(line.length)result.push(line);return result;
}
export function cueLayout(ctx:Context,c:Cue,format:Format):Layout{
  const key=`${c.id}:${format}`;const prior=layouts.get(key);if(prior)return prior;
  const portrait=format==='portrait';const short=Math.max(c.words.length,c.targets.length)<=6;
  const displayed=c.words.map(w=>({text:w.text+(w.punctuationAfter?` ${w.punctuationAfter}`:'')}));
  let size=portrait?(short?72:65):(short?61:53),src:number[][]=[],eng:number[][]=[];
  const maxWidth=portrait?864:956;
  for(;size>=43;size--){ctx.font=`500 ${size}px Kamushku`;src=wrap(ctx,displayed,maxWidth);eng=wrap(ctx,c.targets,maxWidth);if(src.length+eng.length<=(portrait?6:4))break;}
  const leading=size*1.13,languageGap=size*.38;
  const total=(src.length+eng.length)*leading+languageGap;
  // The complete square portrait remains visible. Native lyrics occupy the
  // lower earth; portrait gives that same reading material more breathing room.
  const bottom=portrait?1645:1018;const top=bottom-total;
  const slots=(tokens:{text:string}[],rows:number[][],first:number)=>rows.flatMap((row,r)=>{
    const gap=ctx.measureText(' ').width;const widths=row.map(i=>ctx.measureText(tokens[i]!.text).width);
    let x=(1080-widths.reduce((a,b)=>a+b,0)-gap*(row.length-1))/2;
    return row.map((i,n)=>{const slot={index:i,text:tokens[i]!.text,x,y:first+r*leading,width:widths[n]!};x+=widths[n]!+gap;return slot;});
  });
  const layout={size,source:slots(displayed,src,top+size),target:slots(c.targets,eng,top+src.length*leading+languageGap+size),top,bottom};
  layouts.set(key,layout);return layout;
}

function featureAt(t:number):number[]{
  const f=t*features.analysis.frameRate.numerator/features.analysis.frameRate.denominator;
  const a=Math.min(features.rows.length-1,Math.max(0,Math.floor(f))),b=Math.min(a+1,features.rows.length-1),u=f-a;
  return features.rows[a]!.map((v,i)=>v+(features.rows[b]![i]!-v)*u);
}
function stonePath(ctx:Context,s:Stone):void{
  ctx.beginPath();if(s.polygon?.length){ctx.moveTo(s.polygon[0]!.x,s.polygon[0]!.y);for(const p of s.polygon.slice(1))ctx.lineTo(p.x,p.y);ctx.closePath();}
  else ctx.ellipse(s.x,s.y,s.rx,s.ry,s.angle,0,Math.PI*2);
}
export function stoneResponse(s:Stone,row:number[]):number{
  // Measured band power is untouched. This bounded exposure curve is artistic
  // relighting, not an amplitude meter or a claim of frequency-colored objects.
  const db=-96+(row[2+s.band]??0)*96/255;
  const level=clamp((db+57)/34);
  const rms=-96+(row[0]??0)*96/255;
  return Math.pow(level,1.45)*(.38+.62*clamp((rms+35)/22));
}
function materialMask(s:Stone,source:CanvasImageSource):{canvas:CanvasImageSource;x:number;y:number}|undefined {
  const prior=materialMasks.get(s.id);if(prior)return prior;if(!surfaceFactory||!s.polygon)return undefined;
  if(!materialPixels){const whole=surfaceFactory(1080,1080);whole.context.drawImage(materialReference??source,0,0,1080,1080);materialPixels=whole.context.getImageData(0,0,1080,1080).data;}
  const poly=s.polygon;const x=Math.max(0,Math.floor(Math.min(...poly.map(p=>p.x)))-2),y=Math.max(0,Math.floor(Math.min(...poly.map(p=>p.y)))-2);
  const width=Math.ceil(Math.max(...poly.map(p=>p.x)))-x+3,height=Math.ceil(Math.max(...poly.map(p=>p.y)))-y+3;
  const surface=surfaceFactory(width,height);const c=surface.context;
  const pixels=c.createImageData(width,height);
  for(let py=0;py<height;py++)for(let px=0;px<width;px++){
    const xx=x+px+.5,yy=y+py+.5;let inside=false,distance=Infinity;
    for(let i=0,j=poly.length-1;i<poly.length;j=i++){
      const a=poly[i]!,b=poly[j]!;
      if((a.y>yy)!==(b.y>yy)&&xx<(b.x-a.x)*(yy-a.y)/(b.y-a.y)+a.x)inside=!inside;
      const dx=b.x-a.x,dy=b.y-a.y,u=clamp(((xx-a.x)*dx+(yy-a.y)*dy)/(dx*dx+dy*dy));
      distance=Math.min(distance,Math.hypot(xx-a.x-u*dx,yy-a.y-u*dy));
    }
    const i=(py*width+px)*4;
    const sourceIndex=((y+py)*1080+x+px)*4;
    const luminance=(materialPixels[sourceIndex]!*.2126+materialPixels[sourceIndex+1]!*.7152+materialPixels[sourceIndex+2]!*.0722)/255;
    const direction=clamp(1-((xx-s.x)/Math.max(1,s.rx)+(yy-s.y)/Math.max(1,s.ry))*.22,.4,1.2);
    // Feather inward only: no polygon rims or spill into unrelated dark soil.
    const alpha=inside?clamp(distance/7)*Math.pow(luminance,.6)*direction:0;
    pixels.data[i]=230;pixels.data[i+1]=198;pixels.data[i+2]=168;pixels.data[i+3]=Math.round(clamp(alpha)*255);
  }
  c.putImageData(pixels,0,0);const result={canvas:surface.canvas,x,y};materialMasks.set(s.id,result);return result;
}
function stonesRespond(ctx:Context,t:number,offset:number,cue:Cue|undefined,source:CanvasImageSource):void{
  const row=featureAt(t);ctx.save();ctx.translate(0,offset);
  for(const s of stones){
    const strength=stoneResponse(s,row);if(strength<.002)continue;
    // Follow existing stone geometry and preserve the source texture. No new
    // bars, moving anchors, complete ring, hard outlines or synthetic stones.
    const readingWeight=cue&&offset===0&&s.y>760?.48:1;
    const mask=materialMask(s,source);
    if(mask){ctx.save();ctx.globalCompositeOperation='screen';ctx.globalAlpha=strength*.92*readingWeight;ctx.drawImage(mask.canvas,mask.x,mask.y);ctx.restore();continue;}
    ctx.save();stonePath(ctx,s);ctx.clip();
    const light=ctx.createRadialGradient(s.x-s.rx*.48,s.y-s.ry*.62,1,s.x,s.y,Math.max(s.rx,s.ry)*1.6);
    light.addColorStop(0,`rgba(230,198,168,${strength*.46*readingWeight})`);
    light.addColorStop(.45,`rgba(167,142,116,${strength*.28*readingWeight})`);light.addColorStop(1,'rgba(130,115,99,0)');
    ctx.globalCompositeOperation='screen';ctx.fillStyle=light;ctx.fillRect(s.x-s.rx*2,s.y-s.ry*2,s.rx*4,s.ry*4);
    ctx.restore();
  }
  ctx.restore();
}
function picture(ctx:Context,source:CanvasImageSource,format:Format):number{
  if(format==='landscape'){ctx.drawImage(source,0,0,1080,1080);return 0;}
  ctx.fillStyle='#090908';ctx.fillRect(0,0,1080,1920);
  // Same real soil, dimmed and defocused beyond the principal square. Never
  // stretch the person/ring or introduce a duplicated legible subject.
  ctx.save();ctx.filter='blur(22px)';ctx.globalAlpha=.33;
  ctx.drawImage(source,0,0,1080,190,0,-50,1080,460);
  ctx.drawImage(source,0,930,1080,150,0,1210,1080,780);
  ctx.restore();
  const offset=212;ctx.drawImage(source,0,offset,1080,1080);
  for(const [a,b,reverse] of [[offset,offset+38,false],[offset+1042,offset+1080,true]] as const){
    const edge=ctx.createLinearGradient(0,a,0,b);edge.addColorStop(0,reverse?'rgba(9,9,8,0)':'rgba(9,9,8,1)');edge.addColorStop(1,reverse?'rgba(9,9,8,1)':'rgba(9,9,8,0)');ctx.fillStyle=edge;ctx.fillRect(0,a,1080,b-a);
  }
  return offset;
}
function paintWords(ctx:Context,c:Cue,layout:Layout,t:number):void{
  ctx.save();ctx.font=`500 ${layout.size}px Kamushku`;ctx.textBaseline='alphabetic';ctx.textAlign='left';
  ctx.globalAlpha=cueOpacity(c,t);ctx.lineJoin='round';
  for(const [slots,original] of [[layout.source,true],[layout.target,false]] as const){for(const slot of slots){
    const active=original?sourceActive(c.words[slot.index]!,t,timeline.sampleRate):targetActive(c.targets[slot.index]!,c.words,t,timeline.sampleRate);
    ctx.shadowColor=active?'rgba(218,163,118,.25)':'rgba(0,0,0,.6)';ctx.shadowBlur=active?8:5;ctx.shadowOffsetY=1;
    ctx.strokeStyle='rgba(8,8,7,.75)';ctx.lineWidth=2.4;ctx.strokeText(slot.text,slot.x,slot.y);
    ctx.fillStyle=active?PALETTE.focus:PALETTE.rest;ctx.fillText(slot.text,slot.x,slot.y);
  }}ctx.restore();
}
export function paintScene(ctx:Context,t:number,format:Format,source:CanvasImageSource):void{
  const height=format==='portrait'?1920:1080;ctx.clearRect(0,0,1080,height);
  // Precompute every static receiving mask before the first frame is revealed;
  // never populate new GPU readbacks at a later word or musical entrance.
  if(materialMasks.size<stones.length)for(const s of stones)materialMask(s,source);
  const offset=picture(ctx,source,format);const cue=visibleCue(timeline,t);stonesRespond(ctx,t,offset,cue,source);
  // This continuous earth shade belongs to the composition; it does not appear
  // and disappear as a lyric-shaped panel and never dims the central figure.
  const grad=ctx.createLinearGradient(0,format==='portrait'?1290:745,0,height);
  grad.addColorStop(0,'rgba(8,8,7,0)');grad.addColorStop(.52,'rgba(8,8,7,.48)');grad.addColorStop(1,'rgba(8,8,7,.18)');
  ctx.fillStyle=grad;ctx.fillRect(0,format==='portrait'?1290:745,1080,height);
  ctx.save();ctx.font='500 23px Kamushku';ctx.textAlign='center';ctx.fillStyle='#c4b6a8';ctx.globalAlpha=.66;
  ctx.fillText('SETTLERS  ·  ПО КАМУШКУ',540,format==='portrait'?147:52);ctx.restore();
  if(cue)paintWords(ctx,cue,cueLayout(ctx,cue,format),t);
}
