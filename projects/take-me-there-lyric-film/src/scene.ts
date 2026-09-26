import {clamp, smooth, parseFeatures, parseTimeline, cueAt, cueSlots, wordActive} from './model.ts';
import type {Cue, Features, Format, Range, Slot, Timeline} from './model.ts';
import {SHOTS, type Shot} from './shots.ts';
export type {Format} from './model.ts';
type Ctx = CanvasRenderingContext2D;
export type Box = {x:number;y:number;w:number;h:number};
type Placed = Slot & {x:number;y:number;width:number;size:number};
let timeline:Timeline|undefined, features:Features|undefined, data:DataView|undefined;
let lightCanvas:HTMLCanvasElement|undefined, lightContext:Ctx|undefined;
let emissionCanvas:HTMLCanvasElement|undefined, emissionContext:Ctx|undefined, emissionPixels:ImageData|undefined;
let emissionBloomCanvas:HTMLCanvasElement|undefined, emissionBloomContext:Ctx|undefined;
let spectrumMaskCanvas:HTMLCanvasElement|undefined, spectrumMaskContext:Ctx|undefined;
let spectrumBloomCanvas:HTMLCanvasElement|undefined, spectrumBloomContext:Ctx|undefined;
const W=1920,H=1080,MW=640,MH=360;
const normalize=(v:number,r:Range):number=>clamp((v-r.minimum)/(r.maximum-r.minimum));
async function checked(url:string):Promise<Response>{const r=await fetch(url,{cache:'no-store'});if(!r.ok)throw Error(`Could not load ${url} (${r.status})`);return r;}
export async function loadScene():Promise<void>{
 const [t,f,binary]=await Promise.all([
  checked('/public/timeline.json').then(r=>r.json() as Promise<unknown>),
  checked('/public/audio-features.json').then(r=>r.json() as Promise<unknown>),
  checked('/public/audio-features.bin').then(r=>r.arrayBuffer()),
 ]);
 const nt=parseTimeline(t),nf=parseFeatures(f,binary.byteLength);
 const hash=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',binary)),x=>x.toString(16).padStart(2,'0')).join('');
 if(hash!==nf.dataSha256)throw Error('Audio feature identity mismatch');
 const view=new DataView(binary);for(let i=0;i<binary.byteLength;i+=4)if(!Number.isFinite(view.getFloat32(i,true)))throw Error('Invalid measured feature');
 const fonts=await document.fonts.load('700 80px SpaceGrotesk');
 if(!fonts.length||!document.fonts.check('700 80px SpaceGrotesk'))throw Error('Film font unavailable');
 const layer=document.createElement('canvas');layer.width=MW;layer.height=MH;
 const ctx=layer.getContext('2d',{willReadFrequently:true});if(!ctx)throw Error('Source-light compositor unavailable');
 const emission=document.createElement('canvas');emission.width=MW;emission.height=MH;
 const ec=emission.getContext('2d');if(!ec)throw Error('Source emission compositor unavailable');
 const emissionBloom=document.createElement('canvas');emissionBloom.width=MW;emissionBloom.height=MH;
 const ebc=emissionBloom.getContext('2d');if(!ebc)throw Error('Source bloom compositor unavailable');
 const spectrumMask=document.createElement('canvas'),smc=spectrumMask.getContext('2d');
 const spectrumBloom=document.createElement('canvas'),sbc=spectrumBloom.getContext('2d');
 if(!smc||!sbc)throw Error('Spectrum bloom compositor unavailable');
 timeline=nt;features=nf;data=view;lightCanvas=layer;lightContext=ctx;emissionCanvas=emission;emissionContext=ec;emissionPixels=ec.createImageData(MW,MH);
 emissionBloomCanvas=emissionBloom;emissionBloomContext=ebc;
 spectrumMaskCanvas=spectrumMask;spectrumMaskContext=smc;spectrumBloomCanvas=spectrumBloom;spectrumBloomContext=sbc;
 placementCache=new WeakMap();
 for(const shot of SHOTS)regionMask(shot);
}
export function getLines():{id:string;label:string;start:number;end:number}[]{return timeline?.cues.map(q=>({id:q.id,label:cueSlots(q).map(s=>s.text).join(' '),start:q.start,end:q.end}))??[];}
export function shotAt(t:number):Shot{const shot=SHOTS.find(s=>t>=s.start&&t<s.end)??SHOTS.at(-1);if(!shot)throw Error('No source shot map');return shot;}
function measured(t:number):{energy:number;flux:number;bands:number[]}{
 if(!features||!data)throw Error('Features unavailable');
 const f=features,d=data,p=clamp(t*f.framesPerSecond,0,f.frameCount-1),a=Math.floor(p),b=Math.min(f.frameCount-1,a+1),v=p-a;
 const sample=(k:number):number=>{const x=d.getFloat32(a*104+k*4,true),y=d.getFloat32(b*104+k*4,true);return x+(y-x)*v;};
 return {energy:normalize(sample(0),f.displayMapping.rmsDb),flux:normalize(sample(1),f.displayMapping.flux),bands:f.displayMapping.bandsDb.map((r,i)=>normalize(sample(i+2),r))};
}
// The spectrum is fixed in screen space. Shot-dependent negative space belongs
// to the lyrics only; cuts never relocate or resize the spectrum.
function fixedSpectrum(format:Format):Box{return format==='landscape'?{x:250,y:864,w:1420,h:146}:{x:108,y:1490,w:864,h:174};}
function reserveSpectrum(host:Box,format:Format):{reading:Box;spectrum:Box}{
 const spectrum=fixedSpectrum(format),gap=format==='landscape'?34:50;
 return {reading:{...host,y:Math.min(host.y,spectrum.y-gap-host.h)},spectrum};
}
export function geometry(format:Format,shot:Shot):{w:number;h:number;crop:Box;reading:Box;spectrum:Box}{
 if(format==='landscape')return {w:W,h:H,crop:{x:0,y:0,w:W,h:H},...reserveSpectrum({x:shot.reading.x*W,y:shot.reading.y*H,w:shot.reading.w*W,h:shot.reading.h*H},format)};
 // The portrait edit crops the same decoded frame. No replacement illustration,
 // duplicate blurred picture, or invented black lyric area is introduced.
 const cropW=H*9/16,cropX=clamp(shot.portraitCenter*W-cropW/2,0,W-cropW),s=1080/cropW;
 const projected={x:(shot.reading.x*W-cropX)*s,y:shot.reading.y*H*s,w:shot.reading.w*W*s,h:shot.reading.h*H*s};
 const left=Math.max(72,projected.x),right=Math.min(1008,projected.x+projected.w);
 const usable=right-left>480;
 const upper=shot.reading.y+shot.reading.h/2<.50;
 const reading=usable?{x:left,y:clamp(projected.y,185,1430),w:right-left,h:Math.min(460,projected.h)}:{x:78,y:upper?225:1330,w:924,h:350};
 return {w:1080,h:1920,crop:{x:cropX,y:0,w:cropW,h:H},...reserveSpectrum(reading,format)};
}
let placementCache=new WeakMap<Cue,Map<string,Placed[]>>();
export function layoutCue(c:Ctx,cue:Cue,format:Format,shot:Shot=shotAt(cue.start)):Placed[]{
 const cacheKey=`${format}:${shot.id}`;
 const cached=placementCache.get(cue)?.get(cacheKey);if(cached)return cached;
 const box=geometry(format,shot).reading,slots=cueSlots(cue);
 let size=cue.kind==='hook'?(format==='landscape'?140:128):(format==='landscape'?96:99);
 const maxRows=format==='landscape'?(box.w<600?3:2):3;
 let rows:{slots:Slot[];widths:number[];width:number}[]=[];
 for(let attempt=0;attempt<110;attempt++){
  c.font=`700 ${size}px SpaceGrotesk`;const space=c.measureText(' ').width*1.05;
  rows=[{slots:[],widths:[],width:0}];
  for(const slot of slots){const width=c.measureText(slot.text.toUpperCase()).width;let row=rows.at(-1);if(!row)throw Error('No lyric row');if(row.slots.length&&row.width+space+width>box.w){row={slots:[],widths:[],width:0};rows.push(row);}row.width+=width+(row.slots.length?space:0);row.slots.push(slot);row.widths.push(width);}
  if(rows.length<=maxRows&&rows.every(r=>r.width<=box.w)&&rows.length*size*1.16<box.h)break;
  size-=1;if(size<24)throw Error(`Lyric host cannot fit ${cue.id}`);
 }
 const out:Placed[]=[],space=c.measureText(' ').width*1.05;
 for(const[r,row]of rows.entries()){
  let x=box.x+(box.w-row.width)/2;const y=box.y+box.h/2+(r-(rows.length-1)/2)*size*1.16+size*.34;
  for(const[i,slot]of row.slots.entries()){const width=row.widths[i]??0;out.push({...slot,x,y,width,size});x+=width+space;}
 }
 let cache=placementCache.get(cue);if(!cache){cache=new Map();placementCache.set(cue,cache);}cache.set(cacheKey,out);
 return out;
}
function inside(x:number,y:number,p:readonly [number,number][]):boolean{
 let result=false;for(let i=0,j=p.length-1;i<p.length;j=i++){const a=p[i],b=p[j];if(a&&b&&(a[1]>y)!==(b[1]>y)&&x<(b[0]-a[0])*(y-a[1])/(b[1]-a[1])+a[0])result=!result;}return result;
}
type SourceMask={types:Uint8Array;height:Float32Array;bands:Uint8Array};
const maskCache=new Map<string,SourceMask>();
function regionMask(shot:Shot):SourceMask{
 const cached=maskCache.get(shot.id);if(cached)return cached;
 const mask:SourceMask={types:new Uint8Array(MW*MH),height:new Float32Array(MW*MH),bands:new Uint8Array(MW*MH)};
 const regions=shot.regions.map(r=>({...r,left:Math.min(...r.polygon.map(p=>p[0])),right:Math.max(...r.polygon.map(p=>p[0])),low:Math.min(...r.polygon.map(p=>p[1])),high:Math.max(...r.polygon.map(p=>p[1]))}));
 for(let y=0;y<MH;y++)for(let x=0;x<MW;x++){
  // Preserve the source's own creator credit in the upper-right corner.
  if(x/MW>.90&&y/MH<.085)continue;
  for(const r of regions){
   const u=(x+.5)/MW,v=(y+.5)/MH;if(u<r.left||u>r.right||v<r.low||v>r.high)continue;
   if(!inside(u,v,r.polygon))continue;
   mask.types[y*MW+x]=r.kind==='windows'?1:r.kind==='stars'?2:3;
   mask.height[y*MW+x]=(r.high-v)/Math.max(.01,r.high-r.low);
   const local=clamp((u-r.left)/Math.max(.01,r.right-r.left));
   mask.bands[y*MW+x]=r.kind==='windows'?Math.min(11,Math.floor(local*12))+(r.left+r.right>1?12:0):Math.min(23,Math.floor(local*24));break;
  }
 }
 maskCache.set(shot.id,mask);return mask;
}
function environment(c:Ctx,frame:CanvasImageSource,t:number,format:Format,shot:Shot,m:ReturnType<typeof measured>):void{
 if(!lightCanvas||!lightContext||!emissionCanvas||!emissionContext||!emissionPixels||!emissionBloomCanvas||!emissionBloomContext)throw Error('Light compositor unavailable');
 const ctx=lightContext,g=geometry(format,shot),mask=regionMask(shot);
 ctx.clearRect(0,0,MW,MH);ctx.drawImage(frame,0,0,MW,MH);
 const pixels=ctx.getImageData(0,0,MW,MH),a=pixels.data,e=emissionPixels.data;
 // Broad musical bands are distributed over existing light sources. The mask
 // is rebuilt from the actual moving picture: no new windows or spectrum bars.
 const blendIn=smooth((t-shot.start)/.45),blendOut=smooth((shot.end-t)/.45);
 const cutEnvelope=Math.min(blendIn,blendOut);
 const powers=m.bands.map(v=>Math.pow(v,1.25));
 for(let i=0;i<mask.types.length;i++){
  const type=mask.types[i]??0,k=i*4;
  if(!type){a[k+3]=0;e[k+3]=0;continue;}
  const r=a[k]??0,green=a[k+1]??0,b=a[k+2]??0;
  const luminance=(r*.2126+green*.7152+b*.0722)/255;
  const threshold=type===1?.29:type===2?.43:.34;
  const detail=smooth((luminance-threshold)/.40);
  const band=mask.bands[i]??0,power=powers[band]??0;
  // Existing window floors form the actual equalizer. Frequency energy sets
  // their lit reach; the between-hit state is dimmer, not an invented bar.
  const activity=type===1?smooth((power-(mask.height[i]??0))*7+.25)*(.4+.6*m.energy):power;
  const gain=type===1?.48+activity*2.35:type===2?.85+activity*1.35:.65+activity*1.9;
  a[k]=Math.min(255,r*gain);a[k+1]=Math.min(255,green*gain);a[k+2]=Math.min(255,b*gain);
  a[k+3]=Math.round(detail*cutEnvelope*(type===1?.88:.65)*255);
  e[k]=r;e[k+1]=green;e[k+2]=b;
  e[k+3]=Math.round(detail*activity*cutEnvelope*(type===1?.94:type===2?.64:.72)*255);
 }
 ctx.putImageData(pixels,0,0);emissionContext.putImageData(emissionPixels,0,0);
 const crop=g.crop;
 // Blur once at the source-light resolution, then enlarge it with the same
 // crop. The radius converts back to the original9/13 output-pixel bloom.
 const sourceScale=g.w/(crop.w/W*MW),bloom=emissionBloomContext;
 bloom.clearRect(0,0,MW,MH);bloom.filter=`blur(${(format==='landscape'?9:13)/sourceScale}px)`;
 bloom.drawImage(emissionCanvas,0,0);bloom.filter='none';
 c.save();c.globalCompositeOperation='source-over';
 c.drawImage(lightCanvas,crop.x/W*MW,crop.y/H*MH,crop.w/W*MW,crop.h/H*MH,0,0,g.w,g.h);
 c.globalCompositeOperation='screen';c.globalAlpha=.68;
 c.drawImage(emissionCanvas,crop.x/W*MW,crop.y/H*MH,crop.w/W*MW,crop.h/H*MH,0,0,g.w,g.h);
 c.globalAlpha=.72;
 c.drawImage(emissionBloomCanvas,crop.x/W*MW,crop.y/H*MH,crop.w/W*MW,crop.h/H*MH,0,0,g.w,g.h);
 c.restore();
}
function lettering(c:Ctx,cue:Cue,t:number,format:Format,shot:Shot,energy:number):void{
 const placements=layoutCue(c,cue,format,shot),g=geometry(format,shot);
 const alpha=Math.min(smooth((t-cue.start+.22)/.18),1-smooth((t-cue.end-.06)/.24));
 const ice=shot.hue==='ice',glow=ice?'#83d3ff':'#ff89cb';
 // Long, soft picture shading belongs to the current shot, not a lyric box.
 // It is drawn independently of the current word below in paintScene.
 c.textAlign='left';c.textBaseline='alphabetic';
 for(const p of placements){
  const active=cue.words.some(w=>p.wordIds.includes(w.id)&&wordActive(w,t)),text=p.text.toUpperCase();
  c.save();c.globalAlpha=alpha;c.font=`700 ${p.size}px SpaceGrotesk`;c.lineJoin='round';
  c.shadowColor='#050818';c.shadowBlur=p.size*.07;c.lineWidth=Math.max(1.2,p.size*.022);c.strokeStyle='rgba(6,10,28,.68)';c.strokeText(text,p.x,p.y);
  c.shadowBlur=0;
  const fill=c.createLinearGradient(0,p.y-p.size,0,p.y);
  if(active){fill.addColorStop(0,'#ffffff');fill.addColorStop(.60,ice?'#b5e9ff':'#ffd1e9');fill.addColorStop(1,ice?'#79cfff':'#ff90ca');c.shadowColor=glow;c.shadowBlur=10+energy*13;}
  else{fill.addColorStop(0,'#e2e8f1');fill.addColorStop(1,'#a8bbd6');}
  c.fillStyle=fill;c.fillText(text,p.x,p.y);c.restore();
 }
 // Surface contact is used only where the shot map identifies a real receiver.
 // No duplicated readable lyric reflection is invented in the sky.
 if((shot.surface==='body'||shot.surface==='wall')&&cue.words.some(w=>wordActive(w,t))){
  const b=g.reading;c.save();c.globalCompositeOperation='screen';
  const glowFill=c.createRadialGradient(b.x+b.w/2,b.y+b.h*.7,0,b.x+b.w/2,b.y+b.h*.7,b.w*.55);
  glowFill.addColorStop(0,ice?`rgba(83,159,229,${alpha*.065})`:`rgba(223,100,168,${alpha*.065})`);glowFill.addColorStop(1,'rgba(0,0,0,0)');c.fillStyle=glowFill;c.fillRect(b.x-b.w*.1,b.y,b.w*1.2,b.h);c.restore();
 }
}
function spectrum(c:Ctx,t:number,format:Format,shot:Shot,m:ReturnType<typeof measured>):void{
 if(!spectrumMaskCanvas||!spectrumMaskContext||!spectrumBloomCanvas||!spectrumBloomContext)throw Error('Spectrum compositor unavailable');
 const box=fixedSpectrum(format),n=48,step=box.w/n,baseline=box.y+box.h;
 // Palette follows source-shot handoffs; position and dimensions remain fixed.
 // No cut-time fade or generated motion drives the measured band heights.
 const previous=SHOTS[Math.max(0,SHOTS.indexOf(shot)-1)]??shot;
 const blend=smooth((t-shot.start)/.5),pink=(previous.hue==='rose'?1:0)*(1-blend)+(shot.hue==='rose'?1:0)*blend;
 const rgb=[Math.round(104+139*pink),Math.round(187-63*pink),Math.round(244-50*pink)];
 const tint=(alpha:number):string=>`rgba(${rgb.join(',')},${alpha})`;
 const edge=Math.min(smooth(t/.15),smooth((134.8-t)/.2));
 const level=.40+.60*m.energy;
 const blur=format==='landscape'?18:21,padding=blur*3,scale=.5;
 const layerWidth=Math.ceil((box.w+padding*2)*scale),layerHeight=Math.ceil((box.h+padding*2)*scale);
 for(const layer of [spectrumMaskCanvas,spectrumBloomCanvas]){
  if(layer.width!==layerWidth||layer.height!==layerHeight){layer.width=layerWidth;layer.height=layerHeight;}
 }
 const mask=spectrumMaskContext,bloom=spectrumBloomContext;
 mask.setTransform(1,0,0,1,0,0);mask.clearRect(0,0,layerWidth,layerHeight);
 mask.setTransform(scale,0,0,scale,(padding-box.x)*scale,(padding-box.y)*scale);
 const bars=Array.from({length:n},(_,i)=>{
  const band=i/(n-1)*23,a=Math.floor(band),b=Math.min(23,a+1),fraction=band-a;
  const value=(m.bands[a]??0)*(1-fraction)+(m.bands[b]??0)*fraction;
  const power=Math.pow(value,.88)*level,height=(.018+.982*power)*box.h;
  return {power,x:box.x+(i+.5)*step,height,top:baseline-height,width:Math.max(2.5,step*.41)};
 });
 for(const bar of bars){
  const glow=mask.createLinearGradient(0,bar.top,0,baseline);
  glow.addColorStop(0,tint(.92));glow.addColorStop(.30,tint(.70));glow.addColorStop(1,tint(.035));
  mask.fillStyle=glow;mask.fillRect(bar.x-bar.width/2,bar.top,bar.width,bar.height);
 }
 bloom.clearRect(0,0,layerWidth,layerHeight);bloom.save();
 // Keep Canvas2D shadowBlur semantics; CSS blur uses a different radius.
 // Put the source offscreen and offset only its shadow back onto this layer.
 bloom.shadowColor=tint(.85);bloom.shadowBlur=blur*scale;bloom.shadowOffsetX=layerWidth*2;
 bloom.drawImage(spectrumMaskCanvas,-layerWidth*2,0);bloom.restore();
 c.save();c.globalCompositeOperation='screen';c.globalAlpha=edge;
 // Local spill merges the light with source texture. It is neither a mirrored
 // spectrum nor a claim that every shot contains a reflective surface.
 c.save();c.translate(box.x+box.w/2,baseline);c.scale(1,.075);
 const spill=c.createRadialGradient(0,0,0,0,0,box.w*.56);
 spill.addColorStop(0,tint(.065+.065*m.energy));spill.addColorStop(.68,tint(.025));spill.addColorStop(1,tint(0));
 c.fillStyle=spill;c.fillRect(-box.w*.56,-box.w*.56,box.w*1.12,box.w*1.12);c.restore();
 // One small blurred layer replaces48 independent full-output shadow passes.
 // Shafts and inner cores remain drawn at their exact original coordinates.
 c.drawImage(spectrumBloomCanvas,box.x-padding,box.y-padding,layerWidth/scale,layerHeight/scale);
 for(const {power,x,height,top,width} of bars){
  // Colored bloom surrounds narrow shafts. Bright inner cores survive normal
  // player sizes without adding an opaque panel or a hard horizontal rail.
  const glow=c.createLinearGradient(0,top,0,baseline);
  glow.addColorStop(0,tint(.92));glow.addColorStop(.30,tint(.70));glow.addColorStop(1,tint(.035));c.fillStyle=glow;
  c.fillRect(x-width/2,top,width,height);
  c.shadowBlur=0;c.globalAlpha=edge*(.60+.32*power);
  const core=c.createLinearGradient(0,top,0,baseline);core.addColorStop(0,'rgba(225,241,255,.92)');core.addColorStop(.20,tint(.9));core.addColorStop(1,tint(0));c.fillStyle=core;
  c.fillRect(x-width*.17,top,Math.max(1.2,width*.34),height);c.globalAlpha=edge;
 }
 c.restore();
}
export function paintScene(c:Ctx,time:number,format:Format,frame:CanvasImageSource):void{
 if(!timeline)throw Error('Scene is not ready');
 const t=clamp(time,0,timeline.duration),shot=shotAt(t),g=geometry(format,shot),m=measured(t),cue=cueAt(timeline,t);
 c.save();c.setTransform(c.canvas.width/g.w,0,0,c.canvas.height/g.h,0,0);c.globalAlpha=1;c.globalCompositeOperation='source-over';c.filter='none';
 c.drawImage(frame,g.crop.x,g.crop.y,g.crop.w,g.crop.h,0,0,g.w,g.h);
 environment(c,frame,t,format,shot,m);
 // Continuous feathered exposure shaping leaves the shot visible. Unlike a
 // cue panel it does not appear/disappear as each phrase changes.
 const b=g.reading;c.save();c.translate(b.x+b.w/2,b.y+b.h/2);c.scale(1,Math.max(.28,b.h/b.w));
 const shade=c.createRadialGradient(0,0,b.w*.15,0,0,b.w*.68);shade.addColorStop(0,'rgba(3,8,25,.22)');shade.addColorStop(1,'rgba(3,8,25,0)');c.fillStyle=shade;c.fillRect(-b.w*.7,-b.w*.7,b.w*1.4,b.w*1.4);c.restore();
 spectrum(c,t,format,shot,m);
 if(cue)lettering(c,cue,t,format,shot,m.energy);
 c.restore();
}
