import {PALETTE,sourceActive,targetActive,visibleCue,visibleCues,validateTimeline,parseTimeline,parseFeatures,type Timeline,type FeatureData,type Cue,type Format} from './model.ts';
export type {Format} from './model.ts';
type Context=CanvasRenderingContext2D;
export interface Surface {canvas:CanvasImageSource;context:Context}
export interface Slot {index:number;text:string;x:number;y:number;width:number}
export interface Layout {size:number;source:Slot[];target:Slot[];top:number;bottom:number}
interface Petal {cool:CanvasImageSource;warm:CanvasImageSource;x:number;y:number;width:number;height:number;band:number;flower:number;direction:number}
interface Flower {id:string;center:[number,number];polygon:[number,number][];bandOffset:number;weight:number}
let timeline:Timeline,features:FeatureData;
let identity:{revision:string;sourceSha256:string;timelineSha256:string;sceneSha256:string}|undefined;
let make:((w:number,h:number)=>Surface)|undefined;
let effectsEnabled=true;
let petals:Petal[]=[];
let responses:number[][]=[];
let backgroundWide:CanvasImageSource|undefined,backgroundPortrait:CanvasImageSource|undefined;
let artSurface:Surface|undefined,edgeMask:CanvasImageSource|undefined;
const layouts=new Map<string,Layout>();
const clamp=(n:number,a=0,b=1)=>Math.max(a,Math.min(b,n));
const smooth=(a:number,b:number,t:number)=>{if(b<=a)return t>=b?1:0;const x=clamp((t-a)/(b-a));return x*x*(3-2*x)};
const noise=(n:number)=>{const v=Math.sin(n*137.51+83.17)*43517.35;return v-Math.floor(v)};
const shown=(v:{text:string;punctuationAfter?:string})=>v.text+(v.punctuationAfter??'');
const font=(n:number)=>`500 ${n}px Botanical`;

// Only interiors of existing carnations receive measured light. The face,
// arms, dress, small white flowers and all silhouettes remain protected.
export const FLOWERS:Flower[]=[
 {id:'upper-carnation',center:[680,262],polygon:[[554,132],[622,109],[701,124],[768,136],[810,190],[834,254],[816,329],[781,384],[710,412],[645,389],[578,343],[553,281],[538,205]],bandOffset:3,weight:.85},
 {id:'right-carnation',center:[972,167],polygon:[[865,58],[926,44],[1002,77],[1060,113],[1078,184],[1053,258],[1008,313],[954,294],[920,265],[867,255],[847,213],[858,161],[841,108]],bandOffset:11,weight:.75},
 {id:'middle-carnation',center:[821,534],polygon:[[730,448],[775,409],[838,429],[876,478],[918,458],[966,500],[999,548],[957,608],[905,649],[856,638],[821,670],[782,638],[748,596],[734,543]],bandOffset:17,weight:.8},
 {id:'lower-carnation',center:[809,740],polygon:[[746,655],[805,646],[869,676],[929,700],[956,751],[925,806],[868,828],[813,835],[752,818],[692,785],[684,728],[711,684]],bandOffset:0,weight:.92},
];
function inside(x:number,y:number,poly:[number,number][]):boolean{
 let yes=false;for(let i=0,j=poly.length-1;i<poly.length;j=i++){
  const a=poly[i]!,b=poly[j]!;
  if((a[1]>y)!==(b[1]>y)&&x<(b[0]-a[0])*(y-a[1])/(b[1]-a[1])+a[0])yes=!yes;
 }return yes;
}
function edgeDistance(x:number,y:number,poly:[number,number][]):number{
 let best=Infinity;for(let i=0;i<poly.length;i++){
  const a=poly[i]!,b=poly[(i+1)%poly.length]!,dx=b[0]-a[0],dy=b[1]-a[1];
  const u=clamp(((x-a[0])*dx+(y-a[1])*dy)/(dx*dx+dy*dy));
  best=Math.min(best,Math.hypot(x-a[0]-u*dx,y-a[1]-u*dy));
 }return best;
}
function preparePetals(reference:CanvasImageSource):void{
 if(!make)throw Error('Missing scene surface factory');
 const source=make(1080,1080);source.context.drawImage(reference,0,0,1080,1080);
 const pixels=source.context.getImageData(0,0,1080,1080).data;
 petals=[];
 for(let fi=0;fi<FLOWERS.length;fi++){
  const flower=FLOWERS[fi]!;
  const left=Math.floor(Math.min(...flower.polygon.map(p=>p[0]))),top=Math.floor(Math.min(...flower.polygon.map(p=>p[1])));
  const width=Math.ceil(Math.max(...flower.polygon.map(p=>p[0])))-left+1,height=Math.ceil(Math.max(...flower.polygon.map(p=>p[1])))-top+1;
  for(let sector=0;sector<6;sector++){
   const cool=make(width,height),warm=make(width,height);
   const blue=cool.context.createImageData(width,height),gold=warm.context.createImageData(width,height);
   const centerAngle=(sector+.5)*Math.PI/3-Math.PI;
   for(let y=top;y<top+height;y++)for(let x=left;x<left+width;x++){
    if(!inside(x,y,flower.polygon))continue;
    const at=(y*1080+x)*4,r=pixels[at]??0,g=pixels[at+1]??0,b=pixels[at+2]??0;
    const luminance=r*.2126+g*.7152+b*.0722;
    const angle=Math.atan2(y-flower.center[1],x-flower.center[0]);
    const delta=Math.atan2(Math.sin(angle-centerAngle),Math.cos(angle-centerAngle));
    const sectorMask=1-smooth(.30,.77,Math.abs(delta));
    // Texture-bound pigment: recesses, stems and warm skin cannot become a
    // rectangular glow. Every boundary feathers inward, never outward.
    const fold=smooth(43,177,luminance)*smooth(-14,17,b-r);
    const edge=smooth(0,9,edgeDistance(x,y,flower.polygon));
    const directional=.72+.28*clamp((flower.center[0]-x+flower.center[1]-y+190)/380);
    const a=Math.round(255*fold*edge*sectorMask*directional*flower.weight);
    const out=((y-top)*width+x-left)*4;
    blue.data[out]=168;blue.data[out+1]=207;blue.data[out+2]=215;blue.data[out+3]=a;
    gold.data[out]=248;gold.data[out+1]=222;gold.data[out+2]=169;gold.data[out+3]=a;
   }
   cool.context.putImageData(blue,0,0);warm.context.putImageData(gold,0,0);
   petals.push({cool:cool.canvas,warm:warm.canvas,x:left,y:top,width,height,band:(flower.bandOffset+sector*3)%24,flower:fi,direction:centerAngle});
  }
 }
 artSurface=make(1080,1080);
 const fade=make(1080,1080),gradient=fade.context.createLinearGradient(1008,0,1080,0);
 gradient.addColorStop(0,'#ffffffff');gradient.addColorStop(1,'#ffffff00');fade.context.fillStyle=gradient;fade.context.fillRect(0,0,1080,1080);edgeMask=fade.canvas;
 prepareBackdrops(reference);
}
function prepareBackdrops(reference:CanvasImageSource):void{
 if(!make)return;
 for(const portrait of [false,true]){
  const w=portrait?1080:1920,h=portrait?1920:1080,s=make(w,h),ctx=s.context;
  ctx.fillStyle='#141817';ctx.fillRect(0,0,w,h);
  // Actual empty edge and floral detail, never a generated replacement world
  // or duplicated human figure. Source grain carries into the reading space.
  if(portrait){
   ctx.globalAlpha=.13;ctx.drawImage(reference,930,420,150,660,0,880,1080,1040);
   const shade=ctx.createLinearGradient(0,980,0,1400);shade.addColorStop(0,'#14181795');shade.addColorStop(.45,'#141817e8');shade.addColorStop(1,'#141817f7');
   ctx.globalAlpha=1;ctx.fillStyle=shade;ctx.fillRect(0,980,w,h-980);
  }else{
   ctx.globalAlpha=.24;ctx.drawImage(reference,775,80,305,1000,1040,0,880,1080);
   const shade=ctx.createLinearGradient(980,0,1740,0);shade.addColorStop(0,'#14181700');shade.addColorStop(.40,'#141817d4');shade.addColorStop(1,'#141817f0');
   ctx.globalAlpha=1;ctx.fillStyle=shade;ctx.fillRect(980,0,940,1080);
  }
  // Fine scene-compatible grain is precomputed once; no shimmer, flashes or
  // texture readback on the playback path.
  const grain=make(w,h),data=grain.context.createImageData(w,h);
  for(let i=0;i<w*h;i++){const n=noise(i),p=i*4;data.data[p]=209;data.data[p+1]=211;data.data[p+2]=202;data.data[p+3]=Math.round(n*5);}
  grain.context.putImageData(data,0,0);ctx.globalAlpha=.45;ctx.drawImage(grain.canvas,0,0);ctx.globalAlpha=1;
  if(portrait)backgroundPortrait=s.canvas;else backgroundWide=s.canvas;
 }
}
function prepareResponse():void{
 const raw=features.rows.map(r=>Array.from({length:24},(_,b)=>{
  const db=-96+(r[b+2]??0)*96/255,rms=-96+(r[0]??0)*96/255;
  return Math.pow(clamp((db+64)/52),2.7)*(.25+.75*smooth(-47,-17,rms));
 }));
 responses=raw.map((r,i)=>r.map((_,b)=>{
  let total=0,sum=0;for(let j=-3;j<=3;j++){const weight=Math.exp(-.5*(j/1.25)**2);sum+=(raw[clamp(i+j,0,raw.length-1)]?.[b]??0)*weight;total+=weight;}
  return sum/total;
 }));
}
export function initializeScene(t:Timeline,f:FeatureData,factory:(w:number,h:number)=>Surface,reference:CanvasImageSource,previewIdentity?:typeof identity):void{
 validateTimeline(t);if(f.sourceSha256!==t.sourceSha256)throw Error('Source mismatch between timing and measured music');
 timeline=t;features=f;make=factory;identity=previewIdentity;layouts.clear();prepareResponse();preparePetals(reference);
}
export async function loadScene():Promise<void>{
 const json=async(p:string)=>{const r=await fetch(p,{cache:'no-store'});if(!r.ok)throw Error('Missing preview asset '+p);return r.json() as Promise<unknown>};
 const [t,f,i]=await Promise.all([json('/public/timeline.json'),json('/public/audio-features.json'),json('/public/preview-identity.json')]);
 const face=new FontFace('Botanical',"url('/public/fonts/NotoSerif.ttf')",{weight:'500'});await face.load();document.fonts.add(face);await document.fonts.ready;
 const image=new Image();image.src='/public/artwork-reference.png';await image.decode();
 if(typeof i!=='object'||i===null||!['revision','sourceSha256','timelineSha256','sceneSha256'].every(k=>typeof (i as Record<string,unknown>)[k]==='string'))throw Error('Invalid preview identity');
 const bound=i as NonNullable<typeof identity>,parsed=parseTimeline(t);
 if(bound.sourceSha256!==parsed.sourceSha256||bound.revision!==parsed.revision)throw Error('Loaded preview identity differs from its timing');
 initializeScene(parsed,parseFeatures(f),(w,h)=>{const c=document.createElement('canvas');c.width=w;c.height=h;const context=c.getContext('2d');if(!context)throw Error('No canvas surface');return {canvas:c,context}},image,bound);
}
export function getLines(){return timeline.cues.map(c=>({id:c.id,label:(c.lane==='backing'?'Echo · ':'')+c.sourceText,start:c.start,end:c.end}))}
export function getReadingCue(t:number){return visibleCue(timeline,t)}
export function getReadingCues(t:number){return visibleCues(timeline,t)}
export function getSceneIdentity(){return {...identity,revision:timeline.revision,sourceSha256:timeline.sourceSha256,sampleRate:timeline.sampleRate}}
export function setEffectsEnabled(v:boolean):void{effectsEnabled=v}
export function getEffectsEnabled():boolean{return effectsEnabled}
export function cueOpacity(c:Cue,t:number):number{
 if(t<c.visibleStart||t>=c.visibleEnd)return 0;
 const enter=t>=c.start?1:smooth(c.visibleStart,c.start-.010,t);
 return enter*(c.exitMode==='vocal-handoff'?1:1-smooth(c.fullOpacityEnd,c.visibleEnd,t));
}
function responseAt(t:number):number[]{
 const hz=features.analysis.frameRate.numerator/features.analysis.frameRate.denominator;
 const p=clamp(t*hz,0,responses.length-1),a=Math.floor(p),u=p-a;
 return Array.from({length:24},(_,b)=>(responses[a]?.[b]??0)*(1-u)+(responses[Math.min(a+1,responses.length-1)]?.[b]??0)*u);
}
function warmAt(t:number):number{
 const ranges=[[43.5,70.8],[131.5,159],[182.7,198.8]];
 return ranges.reduce((n,[a,b])=>Math.max(n,smooth(a!,a!+3.1,t)*(1-smooth(b!-.8,b!+2.0,t))),0);
}
function petalsAt(ctx:Context,t:number):void{
 if(!effectsEnabled)return;
 const bands=responseAt(t),warm=warmAt(t);
 const light=visibleCues(timeline,t).some(c=>c.words.some(w=>w.text.toLowerCase()==='свет'&&sourceActive(w,t)));
 const lit=light ? .045 : 0;
 ctx.save();ctx.globalCompositeOperation='screen';
 for(const p of petals){
  const level=(bands[p.band]??0)*.64+(bands[(p.band+1)%24]??0)*.23+(bands[(p.band+23)%24]??0)*.13;
  const alpha=.012+level*(.82+.20*warm)+lit;
  ctx.globalAlpha=alpha*(1-warm*.85);ctx.drawImage(p.cool,p.x,p.y,p.width,p.height);
  ctx.globalAlpha=alpha*warm*.92;ctx.drawImage(p.warm,p.x,p.y,p.width,p.height);
 }
 ctx.restore();
}
function wrap(ctx:Context,tokens:{text:string;punctuationAfter?:string;focusSourceIndices?:number[]}[],size:number,width:number):{index:number;text:string;width:number}[][]{
 ctx.font=font(size);const rows:{index:number;text:string;width:number}[][]=[];let row:{index:number;text:string;width:number}[]=[],used=0;
 const space=ctx.measureText(' ').width;
 for(let i=0;i<tokens.length;){
  const first=tokens[i]!,group=[{index:i,text:shown(first),width:ctx.measureText(shown(first)).width}];let j=i+1;
  while(first.focusSourceIndices&&j<tokens.length&&JSON.stringify(tokens[j]?.focusSourceIndices)===JSON.stringify(first.focusSourceIndices)){
   const token=tokens[j]!;group.push({index:j,text:shown(token),width:ctx.measureText(shown(token)).width});j++;
  }
  const groupWidth=group.reduce((n,w)=>n+w.width,0)+space*(group.length-1);
  if(row.length&&used+space+groupWidth>width){rows.push(row);row=[];used=0}
  for(const w of group){if(row.length)used+=space;row.push(w);used+=w.width}i=j;
 }if(row.length)rows.push(row);return rows;
}
export function layoutCue(ctx:Context,c:Cue,format:Format):Layout{
 const key=format+':'+c.id;const old=layouts.get(key);if(old)return old;
 const portrait=format==='portrait',center=portrait?540:1480,width=portrait?900:720;
 let size=portrait?66:62;
 if(c.lane==='backing')size=portrait?47:43;
 let a=wrap(ctx,c.words,size,width),b=wrap(ctx,c.targets,size,width);
 while((a.length>3||b.length>3||(portrait&&(a.length+b.length)*size*1.37+size*.80>445))&&size>50){size--;a=wrap(ctx,c.words,size,width);b=wrap(ctx,c.targets,size,width)}
 const height=size*1.37,gap=size*.80,total=(a.length+b.length)*height+gap;
 const centerY=c.lane==='backing'?(portrait?1670:874):(portrait?1345:548);
 const top=centerY-total/2;
 ctx.font=font(size);const space=ctx.measureText(' ').width;
 const place=(rows:typeof a,offset:number)=>rows.flatMap((row,y)=>{
  const length=row.reduce((s,w)=>s+w.width,0)+space*(row.length-1);let x=center-length/2;
  return row.map(w=>{const out={...w,x,y:top+offset+y*height+size};x+=w.width+space;return out});
 });
 const l={size,source:place(a,0),target:place(b,a.length*height+gap),top,bottom:top+total};layouts.set(key,l);return l;
}
function drawWords(ctx:Context,c:Cue,t:number,format:Format):void{
 const opacity=cueOpacity(c,t);if(opacity<=0)return;
 const l=layoutCue(ctx,c,format);
 ctx.save();ctx.globalAlpha=opacity;ctx.font=font(l.size);ctx.textBaseline='alphabetic';ctx.lineJoin='round';
 for(const [slots,original] of [[l.source,true],[l.target,false]] as const)for(const slot of slots){
  const active=original?sourceActive(c.words[slot.index]!,t):targetActive(c.targets[slot.index]!,c.words,t);
  const pigment=active?PALETTE.focus:PALETTE.rest;
  // Assign shadow for EACH glyph before outline and fill; no prior word glow
  // can leak to the next word. Active bodies remain crisp and never move.
  ctx.shadowColor='#090e0dc4';ctx.shadowBlur=2;ctx.shadowOffsetX=0;ctx.shadowOffsetY=2;
  ctx.strokeStyle='#11171665';ctx.lineWidth=1.15;ctx.strokeText(slot.text,slot.x,slot.y);
  ctx.fillStyle=pigment;ctx.fillText(slot.text,slot.x,slot.y);
 }
 ctx.restore();
}
export function paintScene(ctx:Context,t:number,format:Format,source:CanvasImageSource):void{
 if(!artSurface||!backgroundWide||!backgroundPortrait||!edgeMask)throw Error('Unprepared original picture and floral masks');
 const portrait=format==='portrait',w=portrait?1080:1920,h=portrait?1920:1080;
 ctx.save();ctx.clearRect(0,0,w,h);ctx.drawImage(portrait?backgroundPortrait:backgroundWide,0,0,w,h);
 const picture=artSurface.context;picture.clearRect(0,0,1080,1080);picture.drawImage(source,0,0,1080,1080);petalsAt(picture,t);
 if(portrait){
  ctx.drawImage(artSurface.canvas,0,0,1080,1080);
  // Continuous material fade, independent of lyrics. No cue-shaped panels.
  const join=ctx.createLinearGradient(0,996,0,1080);join.addColorStop(0,'#14181700');join.addColorStop(1,'#141817');ctx.fillStyle=join;ctx.fillRect(0,996,1080,84);
 }else{
  picture.save();picture.globalCompositeOperation='destination-in';picture.drawImage(edgeMask,0,0);picture.restore();ctx.drawImage(artSurface.canvas,0,0);
 }
 // Small editorial identity is part of the composition, outside lyric lanes.
 ctx.textAlign='center';ctx.textBaseline='alphabetic';ctx.fillStyle='#b8beb26b';ctx.font=`500 ${portrait?19:18}px ui-sans-serif, sans-serif`;
 const center=portrait?540:1480,tagY=portrait?113:190;
 if(!portrait)ctx.fillText('ЭЛЛИ НА МАКОВОМ ПОЛЕ',center,tagY);
 ctx.font=font(portrait?32:35);ctx.fillStyle='#d2d6c088';
 if(!portrait)ctx.fillText('Обнимай',center,tagY+55);
 ctx.textAlign='left';
 const reading=visibleCues(timeline,t);
 for(const c of reading)drawWords(ctx,c,t,format);
 if(!reading.length&&t<5.5){
  const alpha=1-smooth(4.2,5.5,t);ctx.globalAlpha=alpha;ctx.textAlign='center';ctx.font=font(portrait?75:85);ctx.fillStyle=PALETTE.rest;
  ctx.fillText('Обнимай',center,portrait?1320:560);ctx.font=font(portrait?37:36);ctx.fillStyle='#b4bcb0';ctx.fillText('Hold me',center,portrait?1400:640);ctx.textAlign='left';ctx.globalAlpha=1;
 }
 if(t>198.5){
  ctx.globalAlpha=smooth(198.5,199.7,t);ctx.textAlign='center';ctx.font=font(portrait?36:30);ctx.fillStyle='#c2c8b688';ctx.fillText('Обнимай',center,portrait?1350:560);ctx.globalAlpha=1;
 }
 ctx.restore();
}
