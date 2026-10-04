import {PALETTE, sourceActive, targetActive, visibleCue, validateTimeline, type Timeline, type FeatureData, type Cue, type Format} from './model.ts';
export type {Format} from './model.ts';
type Context=CanvasRenderingContext2D;
interface Point {x:number;y:number}
interface WindowAnchor {id:string;polygon:Point[];bands:number[]}
interface Surface {canvas:CanvasImageSource;context:Context}
interface Slot {index:number;text:string;x:number;y:number;width:number}
interface Layout {size:number;source:Slot[];target:Slot[];top:number;bottom:number}
let timeline:Timeline,features:FeatureData,windows:WindowAnchor[]=[];
let materialReference:CanvasImageSource|undefined;
let surfaceFactory:((w:number,h:number)=>Surface)|undefined;
const masks=new Map<string,{canvas:CanvasImageSource;x:number;y:number;width:number;height:number}>();
const layouts=new Map<string,Layout>();
const clamp=(v:number,a=0,b=1)=>Math.max(a,Math.min(b,v));
const smooth=(a:number,b:number,v:number)=>{const u=clamp((v-a)/(b-a));return u*u*(3-2*u)};

export function cueOpacity(c:Cue,t:number):number {
  if(t<c.visibleStart||t>=c.visibleEnd)return 0;
  const revealEnd=c.start-.012;
  return (revealEnd<=c.visibleStart?1:smooth(c.visibleStart,revealEnd,t))*(c.exitMode==='vocal-handoff'?1:1-smooth(c.fullOpacityEnd,c.visibleEnd,t));
}
export async function loadScene():Promise<void>{
  const read=async<T>(path:string):Promise<T>=>{const r=await fetch(path);if(!r.ok)throw Error(`Missing complete preview asset: ${path}`);return r.json() as Promise<T>};
  [timeline,features]=await Promise.all([read<Timeline>('/public/timeline.json'),read<FeatureData>('/public/audio-features.json')]);
  const receiving=await read<{sourceSha256:string;windows:WindowAnchor[]}>('/public/window-anchors.json');
  if(receiving.sourceSha256!==timeline.sourceSha256)throw Error('Window hosts belong to another artwork');windows=receiving.windows;
  validateTimeline(timeline);if(features.sourceSha256!==timeline.sourceSha256)throw Error('Different recording in spectrum');
  const font=new FontFace('Theatre',"url('/public/fonts/NotoSerif.ttf')",{weight:'500'});await font.load();document.fonts.add(font);await document.fonts.ready;
  materialReference=await new Promise<HTMLImageElement>((resolve,reject)=>{const image=new Image();image.onload=()=>resolve(image);image.onerror=()=>reject(Error('Original material reference unavailable'));image.src='/public/source-reference.png'});
  surfaceFactory=(w,h)=>{const canvas=document.createElement('canvas');canvas.width=w;canvas.height=h;const context=canvas.getContext('2d');if(!context)throw Error('Material surface unavailable');return {canvas,context}};
  prepareMasks(materialReference);
}
export function setSceneForProof(t:Timeline,f:FeatureData,w:WindowAnchor[],factory:(w:number,h:number)=>Surface,reference:CanvasImageSource):void {
  validateTimeline(t);timeline=t;features=f;windows=w;layouts.clear();masks.clear();surfaceFactory=factory;materialReference=reference;prepareMasks(reference);
}
export function getLines(){return timeline.cues.map(c=>({id:c.id,label:c.sourceText,start:c.start,end:c.end}))}
export function getReadingCue(t:number){return visibleCue(timeline,t)}
export function getSceneIdentity(){return {revision:timeline.revision,sampleRate:timeline.sampleRate,sourceSha256:timeline.sourceSha256}}

function wrap(ctx:Context,tokens:{text:string}[],width:number):number[][] {
  const rows:number[][]=[];let row:number[]=[],w=0;const space=ctx.measureText(' ').width;
  tokens.forEach((token,i)=>{const gap=i>0&&tokens[i-1]!.text.endsWith('-')?0:space;const tw=ctx.measureText(token.text).width;if(row.length&&w+gap+tw>width){rows.push(row);row=[];w=0}w+=(row.length?gap:0)+tw;row.push(i)});if(row.length)rows.push(row);return rows;
}
export function cueLayout(ctx:Context,c:Cue,format:Format):Layout {
  const key=`${c.id}:${format}`;const cached=layouts.get(key);if(cached)return cached;
  const portrait=format==='portrait';const tokens=c.words.map(w=>({text:w.text+(w.punctuationAfter??'')}));
  let size=portrait?72:54;let src:number[][]=[],eng:number[][]=[];
  for(;size>=(portrait?66:48);size--){ctx.font=`500 ${size}px Theatre`;src=wrap(ctx,tokens,portrait?920:1010);eng=wrap(ctx,c.targets,portrait?920:1010);if(src.length+eng.length<=(portrait?4:2))break}
  if(src.length+eng.length>(portrait?4:2))throw Error(`Reading phrase too long for the source's clear screen: ${c.id}`);
  const leading=size*1.19,gap=size*.35,total=(src.length+eng.length)*leading+gap;
  // Reserve the phone's top interface area; the final row may enter only the
  // original square's still-empty upper sky, never curtains or the subject.
  const top=portrait?(590-total)/2:12;
  const make=(items:{text:string}[],rows:number[][],first:number)=>rows.flatMap((row,r)=>{
    const space=ctx.measureText(' ').width;const widths=row.map(i=>ctx.measureText(items[i]!.text).width);const gaps=row.slice(0,-1).map(i=>items[i]!.text.endsWith('-')?0:space);let x=(1080-widths.reduce((a,b)=>a+b,0)-gaps.reduce((a,b)=>a+b,0))/2;
    return row.map((i,n)=>{const v={index:i,text:items[i]!.text,x,y:first+r*leading,width:widths[n]!};x+=widths[n]!+(gaps[n]??0);return v})
  });
  const layout={size,source:make(tokens,src,top+size),target:make(c.targets,eng,top+src.length*leading+gap+size),top,bottom:top+total};layouts.set(key,layout);return layout;
}

function inside(poly:Point[],x:number,y:number):{inside:boolean;distance:number}{
  let yes=false,distance=Infinity;
  for(let i=0,j=poly.length-1;i<poly.length;j=i++){
    const a=poly[i]!,b=poly[j]!;if((a.y>y)!==(b.y>y)&&x<(b.x-a.x)*(y-a.y)/(b.y-a.y)+a.x)yes=!yes;
    const dx=b.x-a.x,dy=b.y-a.y,u=clamp(((x-a.x)*dx+(y-a.y)*dy)/(dx*dx+dy*dy));distance=Math.min(distance,Math.hypot(x-a.x-u*dx,y-a.y-u*dy));
  }return {inside:yes,distance};
}
function prepareMasks(reference:CanvasImageSource):void {
  if(!surfaceFactory)return;
  const whole=surfaceFactory(1080,1080);whole.context.drawImage(reference,0,0,1080,1080);const original=whole.context.getImageData(0,0,1080,1080).data;
  for(const w of windows){
    const x=Math.floor(Math.min(...w.polygon.map(p=>p.x))),y=Math.floor(Math.min(...w.polygon.map(p=>p.y)));
    const width=Math.ceil(Math.max(...w.polygon.map(p=>p.x)))-x+1,height=Math.ceil(Math.max(...w.polygon.map(p=>p.y)))-y+1;
    const surface=surfaceFactory(width,height),pixels=surface.context.createImageData(width,height);
    for(let yy=0;yy<height;yy++)for(let xx=0;xx<width;xx++){
      const shape=inside(w.polygon,x+xx+.5,y+yy+.5),i=(yy*width+xx)*4,j=((y+yy)*1080+x+xx)*4;
      const lum=(original[j]!*.2126+original[j+1]!*.7152+original[j+2]!*.0722)/255;
      // Inward feather and luminance preserve the paper frames, mullions and grain.
      const alpha=shape.inside?clamp(shape.distance/3)*smooth(.30,.64,lum):0;
      pixels.data[i]=242;pixels.data[i+1]=203;pixels.data[i+2]=137;pixels.data[i+3]=Math.round(alpha*255);
    }
    surface.context.putImageData(pixels,0,0);masks.set(w.id,{canvas:surface.canvas,x,y,width,height});
  }
}
export function featureAt(t:number):number[]{
  const frame=clamp(t*features.analysis.frameRate.numerator/features.analysis.frameRate.denominator,0,features.rows.length-1);
  const a=Math.floor(frame),b=Math.min(a+1,features.rows.length-1),u=frame-a;return features.rows[a]!.map((v,i)=>v+(features.rows[b]![i]!-v)*u);
}
export function windowResponse(w:WindowAnchor,row:number[]):number {
  const powers=w.bands.map(b=>10**((-96+(row[b+2]??0)*96/255)/10));
  const db=10*Math.log10(Math.max(1e-12,powers.reduce((a,b)=>a+b,0)));
  return Math.pow(clamp((db+50)/34),1.25);
}
function illuminate(ctx:Context,t:number,offset:number):void {
  const row=featureAt(t);ctx.save();ctx.translate(0,offset);
  for(const w of windows){const mask=masks.get(w.id);if(!mask)throw Error(`Missing source window mask: ${w.id}`);const energy=windowResponse(w,row);
    // Each real opening is a measured light cell. No free-floating bar or mirrored rail.
    ctx.save();ctx.globalCompositeOperation='multiply';ctx.globalAlpha=.36*(1-energy);ctx.drawImage(mask.canvas,mask.x,mask.y);ctx.restore();
    ctx.save();ctx.globalCompositeOperation='screen';ctx.globalAlpha=.95*energy;ctx.drawImage(mask.canvas,mask.x,mask.y);ctx.restore();
    // No blurred outer emission: the black paper frames and mullions remain intact.
  }ctx.restore();
}
function picture(ctx:Context,source:CanvasImageSource,format:Format):number {
  if(format==='landscape'){ctx.drawImage(source,0,0,1080,1080);return 0}
  // Continue only empty source sky/floor outside the unchanged square. No second figure.
  // Reflect only unoccupied edge material so the adjacent source edge matches.
  ctx.save();ctx.translate(0,400);ctx.scale(1,-1);ctx.drawImage(source,0,0,1080,150,0,0,1080,400);ctx.restore();
  ctx.fillStyle='#312e29';ctx.fillRect(0,1480,1080,440);
  ctx.save();ctx.filter='blur(22px)';ctx.translate(0,1920);ctx.scale(1,-1);ctx.drawImage(source,0,995,1080,85,-30,-30,1140,500);ctx.restore();
  ctx.drawImage(source,0,400,1080,1080);return 400;
}
function paintWords(ctx:Context,c:Cue,layout:Layout,t:number):void {
  ctx.save();ctx.font=`500 ${layout.size}px Theatre`;ctx.textAlign='left';ctx.textBaseline='alphabetic';ctx.globalAlpha=cueOpacity(c,t);
  for(const [slots,original] of [[layout.source,true],[layout.target,false]] as const)for(const slot of slots){
    const active=original?sourceActive(c.words[slot.index]!,t,timeline.sampleRate):targetActive(c.targets[slot.index]!,c.words,t,timeline.sampleRate);
    // Pigment changes; baseline, size and spacing never bounce. Both lanes match.
    ctx.shadowBlur=0;ctx.shadowOffsetX=0;ctx.shadowOffsetY=0;ctx.shadowColor='transparent';ctx.fillStyle=active?PALETTE.focus:PALETTE.rest;ctx.fillText(slot.text,slot.x,slot.y);
  }ctx.restore();
}
export function paintScene(ctx:Context,t:number,format:Format,source:CanvasImageSource):void {
  ctx.clearRect(0,0,1080,format==='portrait'?1920:1080);const offset=picture(ctx,source,format);illuminate(ctx,t,offset);
  const cue=visibleCue(timeline,t);if(cue)paintWords(ctx,cue,cueLayout(ctx,cue,format),t);
}
