import {PALETTE,sourceActive,targetActive,visibleCue,visibleCues,validateTimeline,parseTimeline,parseFeatures,type Timeline,type FeatureData,type Cue,type Format} from './model.ts';
export type {Format} from './model.ts';
type Context=CanvasRenderingContext2D;
export interface Surface {canvas:CanvasImageSource;context:Context}
export interface Slot {index:number;text:string;x:number;y:number;width:number}
export interface Layout {size:number;source:Slot[];target:Slot[];top:number;bottom:number}
interface Host {id:string;box:[number,number,number,number];kind:'knot'|'leaf'|'berry';bands:number[]}
interface Patch {canvas:CanvasImageSource;x:number;y:number;width:number;height:number;band:number;kind:Host['kind']}
export const HOSTS:Host[]=[
 {id:'upper-knot',box:[455,0,164,158],kind:'knot',bands:[0,3,6,9,12,15,18,21]},
 {id:'lower-knot',box:[456,928,163,141],kind:'knot',bands:[1,4,7,10,13,16,19,22]},
 {id:'left-leaves',box:[3,218,155,243],kind:'leaf',bands:[2,8,14]},
 {id:'right-leaves',box:[922,218,155,243],kind:'leaf',bands:[5,11,17]},
 {id:'upper-left-berry',box:[295,20,53,58],kind:'berry',bands:[20]},
 {id:'upper-right-berry',box:[734,20,55,59],kind:'berry',bands:[23]},
];
let timeline:Timeline,features:FeatureData,identity:{revision:string;sourceSha256:string;timelineSha256:string;sceneSha256:string}|undefined;
let effectsEnabled=true,patches:Patch[]=[],responses:number[][]=[];
let wide:CanvasImageSource|undefined,tall:CanvasImageSource|undefined;
const layouts=new Map<string,Layout>();
const clamp=(n:number,a=0,b=1)=>Math.max(a,Math.min(b,n));
const smooth=(a:number,b:number,t:number)=>{const u=clamp((t-a)/(b-a));return u*u*(3-2*u)};
const font=(n:number)=>`600 ${n}px Broadside`;
const shown=(t:{text:string;punctuationAfter?:string})=>t.text+(t.punctuationAfter??'');

function prepareMaterial(factory:(w:number,h:number)=>Surface,reference:CanvasImageSource):void{
 const source=factory(1080,1080);source.context.drawImage(reference,0,0,1080,1080);
 const pixels=source.context.getImageData(0,0,1080,1080).data;
 patches=[];
 for(const host of HOSTS){
  const [left,top,width,height]=host.box;
  for(let sector=0;sector<host.bands.length;sector++){
   const surface=factory(width,height),image=surface.context.createImageData(width,height);
   const centerX=left+width/2,centerY=top+height/2;
   for(let yy=0;yy<height;yy++)for(let xx=0;xx<width;xx++){
    const x=left+xx,y=top+yy,p=(y*1080+x)*4,r=pixels[p]!,g=pixels[p+1]!,b=pixels[p+2]!;
    // Existing pigment only. Blank paper, black outlines and the central wolf
    // cannot acquire new lines or rectangular light fields.
    const pigment=host.kind==='leaf'?smooth(5,24,g-r)*smooth(12,36,g-b)*smooth(44,90,g):smooth(26,65,r-g)*smooth(22,75,g-b)*smooth(116,180,r);
    if(pigment<=0)continue;
    let ownership=1;
    if(host.kind==='knot'){
     const angle=Math.atan2(y-centerY,x-centerX),target=(sector+.5)*Math.PI*2/host.bands.length-Math.PI;
     const distance=Math.abs(Math.atan2(Math.sin(angle-target),Math.cos(angle-target)));
     ownership=1-smooth(.22,.70,distance);
    }else if(host.kind==='leaf'){
     const at=(yy/height)*host.bands.length,delta=Math.abs(at-(sector+.5));ownership=1-smooth(.15,.95,delta);
    }
    const edge=smooth(0,6,Math.min(xx,yy,width-1-xx,height-1-yy)),alpha=Math.round(255*pigment*ownership*edge),out=(yy*width+xx)*4;
    const ink=host.kind==='leaf'?[42,80,46]:[133,47,31];
    image.data[out]=ink[0]!;image.data[out+1]=ink[1]!;image.data[out+2]=ink[2]!;image.data[out+3]=alpha;
   }
   surface.context.putImageData(image,0,0);patches.push({canvas:surface.canvas,x:left,y:top,width,height,band:host.bands[sector]!,kind:host.kind});
  }
 }
 // A continuous facing-page field made from an actual empty paper patch.
 // No duplicate wolf, dark caption panel, generated scenery or moving grain.
 const paper=factory(280,160);paper.context.drawImage(reference,605,186,280,160,0,0,280,160);
 for(const portrait of [false,true]){
  const w=portrait?1080:1920,h=portrait?1920:1080,s=factory(w,h),ctx=s.context;
  ctx.fillStyle='#eee4bb';ctx.fillRect(0,0,w,h);
  const pattern=ctx.createPattern(paper.canvas,'repeat');if(!pattern)throw Error('Paper material missing');ctx.fillStyle=pattern;ctx.fillRect(0,0,w,h);
  const wash=portrait?ctx.createLinearGradient(0,1080,0,1920):ctx.createLinearGradient(1080,0,1920,0);
  wash.addColorStop(0,'#eee4bb00');wash.addColorStop(1,'#eee4bb55');ctx.fillStyle=wash;ctx.fillRect(0,0,w,h);
  if(portrait)tall=s.canvas;else wide=s.canvas;
 }
}
function prepareResponse():void{
 const raw=features.rows.map(row=>Array.from({length:24},(_,band)=>{
  const db=-96+row[band+2]!*96/255,rms=-96+row[0]!*96/255;
  return Math.pow(clamp((db+66)/49),1.45)*(.3+.7*smooth(-48,-20,rms));
 }));
 responses=raw.map((row,i)=>row.map((_,band)=>{
  let value=0,weights=0;for(let k=-3;k<=3;k++){const weight=Math.exp(-.5*(k/1.3)**2);value+=raw[clamp(i+k,0,raw.length-1)]![band]!*weight;weights+=weight}return value/weights;
 }));
}
export function initializeScene(t:Timeline,f:FeatureData,factory:(w:number,h:number)=>Surface,reference:CanvasImageSource,previewIdentity?:typeof identity):void{
 validateTimeline(t);if(t.sourceSha256!==f.sourceSha256)throw Error('Music/timing source mismatch');
 timeline=t;features=f;identity=previewIdentity;layouts.clear();prepareResponse();prepareMaterial(factory,reference);
}
export async function loadScene():Promise<void>{
 const json=async(path:string)=>{const r=await fetch(path,{cache:'no-store'});if(!r.ok)throw Error('Missing preview asset '+path);return r.json() as Promise<unknown>};
 const [t,f,i]=await Promise.all([json('/public/timeline.json'),json('/public/audio-features.json'),json('/public/preview-identity.json')]);
 const face=new FontFace('Broadside',"url('/public/fonts/Alegreya.ttf')",{weight:'600'});await face.load();document.fonts.add(face);await document.fonts.ready;
 const picture=new Image();picture.src='/public/artwork-reference.png';await picture.decode();
 if(typeof i!=='object'||i===null||!['revision','sourceSha256','timelineSha256','sceneSha256'].every(k=>typeof(i as Record<string,unknown>)[k]==='string'))throw Error('Invalid loaded identity');
 const bound=i as NonNullable<typeof identity>,parsed=parseTimeline(t);if(bound.revision!==parsed.revision||bound.sourceSha256!==parsed.sourceSha256)throw Error('Stale source/timing identity');
 initializeScene(parsed,parseFeatures(f),(w,h)=>{const c=document.createElement('canvas');c.width=w;c.height=h;const context=c.getContext('2d');if(!context)throw Error('Canvas surface unavailable');return {canvas:c,context}},picture,bound);
}
export function setEffectsEnabled(value:boolean):void{effectsEnabled=value}
export function getEffectsEnabled():boolean{return effectsEnabled}
export function getLines(){return timeline.cues.map(c=>({id:c.id,label:c.sourceText,start:c.start,end:c.end}))}
export function getReadingCue(t:number){return visibleCue(timeline,t)}
export function getReadingCues(t:number){return visibleCues(timeline,t)}
export function getSceneIdentity(){return {...identity,revision:timeline.revision,sourceSha256:timeline.sourceSha256,sampleRate:timeline.sampleRate}}
export function cueOpacity(c:Cue,t:number):number{
 if(t<c.visibleStart||t>=c.visibleEnd)return 0;
 const entrance=t>=c.start?1:smooth(c.visibleStart,c.start-.01,t);
 return entrance*(c.exitMode==='vocal-handoff'?1:1-smooth(c.fullOpacityEnd,c.visibleEnd,t));
}
function responseAt(t:number):number[]{
 const hz=features.analysis.frameRate.numerator/features.analysis.frameRate.denominator,p=clamp(t*hz,0,responses.length-1),a=Math.floor(p),u=p-a;
 return Array.from({length:24},(_,i)=>responses[a]![i]!*(1-u)+responses[Math.min(a+1,responses.length-1)]![i]!*u);
}
function printResponse(ctx:Context,t:number):void{
 if(!effectsEnabled)return;
 const levels=responseAt(t);ctx.save();
 for(const p of patches){
  const level=levels[p.band]!*.68+levels[(p.band+1)%24]!*.20+levels[(p.band+23)%24]!*.12;
  const alpha=p.kind==='knot'?.05+level*.88:p.kind==='leaf'?.015+level*.46:.025+level*.57;
  ctx.globalAlpha=alpha;ctx.drawImage(p.canvas,p.x,p.y,p.width,p.height);
 }
 ctx.restore();
}
function wrap(ctx:Context,tokens:{text:string;punctuationAfter?:string;focusSourceIndices?:number[]}[],size:number,width:number){
 ctx.font=font(size);const rows:{index:number;text:string;width:number}[][]=[];let row:{index:number;text:string;width:number}[]=[],used=0;const space=ctx.measureText(' ').width;
 for(let i=0;i<tokens.length;){
  const first=tokens[i]!,group=[{index:i,text:shown(first),width:ctx.measureText(shown(first)).width}];let j=i+1;
  while(first.focusSourceIndices&&j<tokens.length&&JSON.stringify(tokens[j]!.focusSourceIndices)===JSON.stringify(first.focusSourceIndices)){const next=tokens[j]!;group.push({index:j,text:shown(next),width:ctx.measureText(shown(next)).width});j++}
  const groupWidth=group.reduce((n,w)=>n+w.width,0)+space*(group.length-1);
  if(row.length&&used+space+groupWidth>width){rows.push(row);row=[];used=0}
  for(const token of group){if(row.length)used+=space;row.push(token);used+=token.width}i=j;
 }if(row.length)rows.push(row);return rows;
}
export function layoutCue(ctx:Context,c:Cue,format:Format):Layout{
 const key=format+':'+c.id,prior=layouts.get(key);if(prior)return prior;
 const portrait=format==='portrait',center=portrait?540:1485,width=portrait?900:750;let size=portrait?76:74;
 let a=wrap(ctx,c.words,size,width),b=wrap(ctx,c.targets,size,width);
 while((a.length>3||b.length>3||(a.length+b.length)*size*1.25+size*.72>(portrait?525:660))&&size>54){size--;a=wrap(ctx,c.words,size,width);b=wrap(ctx,c.targets,size,width)}
 const height=size*1.25,gap=size*.72,total=(a.length+b.length)*height+gap,top=(portrait?1415:580)-total/2;
 ctx.font=font(size);const space=ctx.measureText(' ').width;
 const place=(rows:typeof a,offset:number)=>rows.flatMap((row,line)=>{const length=row.reduce((n,s)=>n+s.width,0)+space*(row.length-1);let x=center-length/2;return row.map(s=>{const slot={...s,x,y:top+offset+line*height+size};x+=s.width+space;return slot})});
 const layout={size,source:place(a,0),target:place(b,a.length*height+gap),top,bottom:top+total};layouts.set(key,layout);return layout;
}
function words(ctx:Context,c:Cue,t:number,format:Format):void{
 const opacity=cueOpacity(c,t);if(opacity<=0)return;const l=layoutCue(ctx,c,format);ctx.save();ctx.globalAlpha=opacity;ctx.font=font(l.size);ctx.textBaseline='alphabetic';ctx.textAlign='left';
 for(const [slots,original] of [[l.source,true],[l.target,false]] as const)for(const slot of slots){
  const active=original?sourceActive(c.words[slot.index]!,t):targetActive(c.targets[slot.index]!,c.words,t);
  ctx.shadowColor='transparent';ctx.shadowBlur=0;ctx.shadowOffsetX=0;ctx.shadowOffsetY=0;ctx.fillStyle=active?PALETTE.focus:PALETTE.rest;ctx.fillText(slot.text,slot.x,slot.y);
 }ctx.restore();
}
export function paintScene(ctx:Context,t:number,format:Format,source:CanvasImageSource):void{
 if(!wide||!tall)throw Error('Unprepared paper and ornament material');
 const portrait=format==='portrait',w=portrait?1080:1920,h=portrait?1920:1080,center=portrait?540:1485;
 ctx.save();ctx.clearRect(0,0,w,h);ctx.drawImage(portrait?tall:wide,0,0,w,h);ctx.drawImage(source,0,0,1080,1080);printResponse(ctx,t);
 ctx.textAlign='center';ctx.textBaseline='alphabetic';
 if(!portrait&&t>=10.5){ctx.font=font(48);ctx.fillStyle='#3f5437';ctx.fillText('Волчья песня',center,223);ctx.font=font(27);ctx.fillStyle='#7c7357';ctx.fillText('лунный бард',center,271)}
 const reading=visibleCues(timeline,t);for(const c of reading)words(ctx,c,t,format);
 if(!reading.length&&t<11.3){
  ctx.globalAlpha=1-smooth(9.5,11.3,t);ctx.fillStyle='#2d3429';ctx.font=font(portrait?87:89);ctx.fillText('Волчья песня',center,portrait?1375:557);
  ctx.font=font(portrait?50:50);ctx.fillStyle='#852f1f';ctx.fillText('Wolf Song',center,portrait?1457:641);ctx.font=font(30);ctx.fillStyle='#6b7259';ctx.fillText('лунный бард',center,portrait?1553:734);ctx.globalAlpha=1;
 }
 if(!reading.length&&t>254){ctx.globalAlpha=smooth(254,257,t)*.65;ctx.fillStyle='#62644e';ctx.font=font(portrait?49:47);ctx.fillText('Волчья песня',center,portrait?1435:589);ctx.globalAlpha=1}
 ctx.restore();
}
