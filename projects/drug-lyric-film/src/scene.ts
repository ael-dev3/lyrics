import {PALETTE, sourceActive, targetActive, visibleCue, visibleCues, validateTimeline, type Timeline, type FeatureData, type Cue, type Format} from './model.ts';
export type {Format} from './model.ts';
type Context = CanvasRenderingContext2D;
export interface Surface {canvas: CanvasImageSource; context: Context}
export interface Slot {index:number;text:string;x:number;y:number;width:number}
export interface Layout {size:number;source:Slot[];target:Slot[];top:number;bottom:number}
interface Building {x:number;width:number;height:number;band:number;seed:number;depth:number;roof:number}
let timeline:Timeline, features:FeatureData;
let identity:{revision:string;sourceSha256:string;timelineSha256:string;sceneSha256:string}|undefined;
let factory:((w:number,h:number)=>Surface)|undefined;
let effectsEnabled=true;
let responses:number[][]=[], wind:number[]=[];
let hairMask:CanvasImageSource|undefined;
let backdrop:CanvasImageSource|undefined;
let sourceSurface:Surface|undefined,sourceEdgeMask:CanvasImageSource|undefined;
let paletteSource:CanvasImageSource|undefined,skyRed='#e00007';
const layouts=new Map<string,Layout>();
const clamp=(v:number,a=0,b=1)=>Math.max(a,Math.min(b,v));
const smooth=(a:number,b:number,v:number)=>{const u=clamp((v-a)/(b-a));return u*u*(3-2*u)};
const shown=(s:{text:string;punctuationAfter?:string})=>s.text+(s.punctuationAfter??'');
const font=(size:number)=>`500 ${size}px Ink`;
const random=(v:number)=>{const n=Math.sin(v*127.13+39.73)*43758.5453;return n-Math.floor(n)};
export function cueOpacity(c:Cue,t:number){
 if(t<c.visibleStart||t>=c.visibleEnd)return 0;
 return (t>=c.start?1:smooth(c.visibleStart,c.start-.008,t))*(c.exitMode==='vocal-handoff'?1:1-smooth(c.fullOpacityEnd,c.visibleEnd,t));
}
export function getLines(){return timeline.cues.map(c=>({id:c.id,label:c.sourceText,start:c.start,end:c.end}))}
export function getReadingCue(t:number){return visibleCue(timeline,t)}
export function getReadingCues(t:number){return visibleCues(timeline,t)}
export function getSceneIdentity(){return {...identity,revision:timeline.revision,sourceSha256:timeline.sourceSha256,sampleRate:timeline.sampleRate}}
export function setEffectsEnabled(v:boolean){effectsEnabled=v}
export function getEffectsEnabled(){return effectsEnabled}
function prepareResponse(){
 const hz=features.analysis.frameRate.numerator/features.analysis.frameRate.denominator;
 const raw=features.rows.map(r=>Array.from({length:24},(_,b)=>{
  const db=-96+(r[b+2]??0)*96/255;
  return Math.pow(clamp((db+58)/35),1.25)*smooth(-59,-24,-96+(r[0]??0)*96/255);
 }));
 // A short symmetric display envelope avoids causal lag and reconstructs the
 // same motion after every seek. Raw power and lyric edges stay unchanged.
 responses=raw.map((r,i)=>r.map((_,b)=>{
  let sum=0,weight=0;for(let d=-2;d<=2;d++){const w=3-Math.abs(d);sum+=(raw[clamp(i+d,0,raw.length-1)]?.[b]??0)*w;weight+=w}return sum/weight;
 }));
 let integrated=0;wind=responses.map(r=>{integrated+=(.34+.36*(r[4]??0))/hz;return integrated});
}
function prepareHair(reference:CanvasImageSource){
 if(!factory)return;
 const s=factory(1080,1080);s.context.drawImage(reference,0,0);
 const data=s.context.getImageData(0,0,1080,1080),out=s.context.createImageData(1080,1080);
 // Only dark interior hair receives moving print shade. Skin, eyes, crow,
 // outer silhouette and all reading geometry remain untouched.
 for(let y=230;y<810;y++)for(let x=160;x<910;x++){
  const inside=(x>680&&x<890&&y>350&&y<770)||(x>210&&x<400&&y>340&&y<650)||(y<398&&x>340&&x<790);
  if(!inside)continue;const p=(y*1080+x)*4;
  const luma=(data.data[p]??0)*.2126+(data.data[p+1]??0)*.7152+(data.data[p+2]??0)*.0722;
  if(luma>32)continue;
  const stripe=.5+.5*Math.sin(x*.127+y*.064);
  out.data[p]=224;out.data[p+1]=15;out.data[p+2]=42;out.data[p+3]=Math.round(20*stripe);
 }
 s.context.putImageData(out,0,0);hairMask=s.canvas;
 prepareBackdrop();
 sourceSurface=factory(1080,1080);
 const edge=factory(1080,1080),fade=edge.context.createLinearGradient(1015,0,1080,0);
 fade.addColorStop(0,'#ffffffff');fade.addColorStop(1,'#ffffff00');edge.context.fillStyle=fade;edge.context.fillRect(0,0,1080,1080);sourceEdgeMask=edge.canvas;
}
function prepareBackdrop(){
 if(!factory)return;
 const background=factory(1920,1080),gr=background.context.createLinearGradient(0,280,0,740);
 gr.addColorStop(0,skyRed);gr.addColorStop(.33,'#a70010');gr.addColorStop(.72,'#280409');gr.addColorStop(1,'#09090b');
 background.context.fillStyle=gr;background.context.fillRect(0,0,1920,1080);backdrop=background.canvas;
}
export function initializeScene(t:Timeline,f:FeatureData,make:((w:number,h:number)=>Surface),reference:CanvasImageSource,previewIdentity?:typeof identity){
 validateTimeline(t);if(f.sourceSha256!==t.sourceSha256)throw Error('The feature recording differs from the lyric recording');
 timeline=t;features=f;factory=make;identity=previewIdentity;paletteSource=undefined;skyRed='#e00007';layouts.clear();prepareResponse();prepareHair(reference);
}
export async function loadScene(){
 const fetchJson=async(path:string)=>{const r=await fetch(path,{cache:'no-store'});if(!r.ok)throw Error(`Could not load ${path}`);return r.json()};
 const [t,f,i]=await Promise.all([fetchJson('/public/timeline.json'),fetchJson('/public/audio-features.json'),fetchJson('/public/preview-identity.json')]);
 const face=new FontFace('Ink',"url('/public/fonts/Oswald-Medium.ttf')",{weight:'500'});await face.load();document.fonts.add(face);await document.fonts.ready;
 const image=new Image();image.src='/public/artwork-reference.png';await image.decode();
 initializeScene(t as Timeline,f as FeatureData,(w,h)=>{const c=document.createElement('canvas');c.width=w;c.height=h;const context=c.getContext('2d');if(!context)throw Error('No canvas surface');return {canvas:c,context}},image,i);
}
function featureAt(time:number):number[]{
 const hz=features.analysis.frameRate.numerator/features.analysis.frameRate.denominator;
 const n=clamp(time*hz,0,responses.length-1),a=Math.floor(n),u=n-a;
 return Array.from({length:24},(_,b)=>(responses[a]?.[b]??0)*(1-u)+(responses[Math.min(a+1,responses.length-1)]?.[b]??0)*u);
}
function wrap(ctx:Context,tokens:{text:string;punctuationAfter?:string;focusSourceIndices?:number[]}[],size:number,width:number):{index:number;text:string;width:number}[][]{
 ctx.font=font(size);const rows:{index:number;text:string;width:number}[][]=[];let row:{index:number;text:string;width:number}[]=[],used=0;
 const gap=ctx.measureText(' ').width;
 for(let i=0;i<tokens.length;){
  const first=tokens[i]!,group=[{index:i,text:shown(first),width:ctx.measureText(shown(first)).width}];let j=i+1;
  while(first.focusSourceIndices&&j<tokens.length&&JSON.stringify(tokens[j]?.focusSourceIndices)===JSON.stringify(first.focusSourceIndices)){
   const s=tokens[j]!;group.push({index:j,text:shown(s),width:ctx.measureText(shown(s)).width});j++;
  }
  const groupWidth=group.reduce((n,s)=>n+s.width,0)+gap*(group.length-1);
  if(row.length&&used+gap+groupWidth>width){rows.push(row);row=[];used=0}
  for(const s of group){if(row.length)used+=gap;row.push(s);used+=s.width}i=j;
 }if(row.length)rows.push(row);return rows;
}
export function layoutCue(ctx:Context,c:Cue,format:Format):Layout{
 const key=format+':'+c.id;const cached=layouts.get(key);if(cached)return cached;
 const cx=format==='landscape'?1470:540,width=format==='landscape'?760:900;
 let size=format==='landscape'?54:58;
 let a=wrap(ctx,c.words,size,width),b=wrap(ctx,c.targets,size,width);
 while((a.length>3||b.length>3)&&size>46){size-=1;a=wrap(ctx,c.words,size,width);b=wrap(ctx,c.targets,size,width)}
 const lineHeight=size*1.24,gap=size*.72,total=(a.length+b.length)*lineHeight+gap;
 const centerY=format==='landscape'?570:1410;
 const top=centerY-total/2;ctx.font=font(size);const space=ctx.measureText(' ').width;
 const place=(rows:typeof a,offset:number)=>rows.flatMap((row,j)=>{const totalWidth=row.reduce((s,w)=>s+w.width,0)+space*(row.length-1);let x=cx-totalWidth/2;return row.map(w=>{const slot={...w,x,y:top+offset+j*lineHeight+size};x+=w.width+space;return slot})});
 const l={size,source:place(a,0),target:place(b,a.length*lineHeight+gap),top,bottom:top+total};layouts.set(key,l);return l;
}
function bird(ctx:Context,x:number,y:number,scale:number,phase:number,tilt:number,direction:number,flapping:number){
 ctx.save();ctx.translate(x,y);ctx.rotate(tilt);ctx.scale(direction*scale,scale);ctx.fillStyle='#09090b';
 const lift=Math.sin(phase)*.65*flapping;
 // Draw one articulated raven silhouette, including tapered individual wing
 // fingers, small head/beak and a split tail. Never mirror a spectrum curve.
 ctx.beginPath();ctx.moveTo(-3,6);ctx.lineTo(-8,17);ctx.lineTo(-1,14);ctx.lineTo(5,19);ctx.lineTo(5,5);
 ctx.bezierCurveTo(10,4,12,-1,11,-5);ctx.lineTo(17,-6);ctx.lineTo(11,-9);ctx.bezierCurveTo(8,-14,3,-11,0,-6);
 ctx.bezierCurveTo(-4,-5,-5,0,-3,6);ctx.fill();
 for(const side of [-1,1]){
  const reach=side===-1?.81:1,flap=lift*(side===-1?.72:1);
  ctx.beginPath();ctx.moveTo(side*2,1);ctx.bezierCurveTo(side*11,-9-flap*14,side*29*reach,-14-flap*23,side*39*reach,-3-flap*25);
  ctx.lineTo(side*31*reach,-1-flap*19);ctx.lineTo(side*33*reach,3-flap*13);ctx.lineTo(side*24*reach,1-flap*11);ctx.lineTo(side*23*reach,6-flap*8);ctx.lineTo(side*14,4-flap*5);ctx.bezierCurveTo(side*11,8,side*5,8,side*2,1);ctx.fill();
 }ctx.restore();
}
function migratingBirds(ctx:Context,t:number,format:Format,levels:number[]){
 const width=format==='landscape'?1920:1080;
 const u=wind[Math.min(wind.length-1,Math.floor(t*50))]??0;
 const skyHeight=format==='landscape'?255:305;
 // Each raven has its own curved route and depth. Catmull-Rom paths change
 // altitude and bank through turns; no parallel formation or flat conveyor.
 const routes:number[][][]=[
  [[1.10,.16],[.84,.44],[.59,.83],[.28,.55],[-.12,.20]],
  [[1.12,.74],[.80,.24],[.57,.14],[.35,.42],[-.14,.65]],
  [[-.14,.80],[.20,.43],[.43,.73],[.72,.39],[1.13,.16]],
 ];
 const spline=(points:number[][],p:number)=>{
  const n=p*(points.length-1),i=Math.min(points.length-2,Math.floor(n)),v=n-i;
  const a=points[Math.max(0,i-1)]!,b=points[i]!,c=points[i+1]!,d=points[Math.min(points.length-1,i+2)]!;
  return [0,1].map(k=>.5*((2*b[k]!)+(-a[k]!+c[k]!)*v+(2*a[k]!-5*b[k]!+4*c[k]!-d[k]!)*v*v+(-a[k]!+3*b[k]!-3*c[k]!+d[k]!)*v*v*v));
 };
 for(let i=0;i<3;i++){
  const p=(u*(.024+i*.007)+[.13,.68,.36][i]!)%1,route=routes[i]!;
  const at=spline(route,p),next=spline(route,Math.min(.99999,p+.003));
  const direction=i===2?1:-1,dx=(next[0]!-at[0]!)*width,dy=(next[1]!-at[1]!)*skyHeight;
  const bank=clamp(Math.atan2(dy,Math.abs(dx))*direction,-.48,.48);
  const glide=.24+.76*smooth(-.5,.35,Math.sin(t*(.37+i*.09)+i*2.1));
  const alpha=smooth(0,4,t)*(1-smooth(timeline.sourceDuration-4,timeline.sourceDuration,t));ctx.globalAlpha=alpha*[.69,.82,.94][i]!;
  bird(ctx,at[0]!*width,26+at[1]!*skyHeight,[.32,.48,.65][i]!,t*(4.7+i*.7)+i*1.7,bank,direction,glide);
 }ctx.globalAlpha=1;
 // Five drifting ink feathers occupy only the empty upper extension. Their
 // paths depend on integrated source-time wind, never an accumulated clock.
 if(format==='landscape')for(let i=0;i<5;i++){
  const p=(u*.021+i*.193)%1,x=1125+random(i+8)*710+p*18+Math.sin(p*11+i*2.1)*26+Math.sin(p*24+i)*7,y=50+p*265;
  ctx.save();ctx.translate(x,y);ctx.rotate(Math.sin(p*8+i)*.9);ctx.fillStyle='#24040b';ctx.globalAlpha=.17+.13*(levels[14]??0);
  ctx.beginPath();ctx.moveTo(0,-10);ctx.bezierCurveTo(6,-5,5,4,0,11);ctx.bezierCurveTo(-3,3,-4,-5,0,-10);ctx.fill();ctx.restore();
 }
}
function city(ctx:Context,t:number,format:Format,levels:number[]){
 const start=format==='landscape'?1040:0,extent=format==='landscape'?880:1080,h=format==='landscape'?1080:1920;
 // Architectural mass and perspective stay fixed. Three overlapping depths
 // have irregular streets, distinct roof profiles, cornices and side planes.
 // Music illuminates occupied windows, never makes the buildings into bars.
 const faces=['#361e24','#292025','#171419'],sides=['#29151b','#191419','#0d0b10'];
 for(let depth=0;depth<3;depth++){
  const base=h-[133,67,8][depth]!,unit=depth===0?29:depth===1?52:91;
  const buildings:Building[]=[];let x=start-unit*(.2+depth*.23),i=0;
  while(x<start+extent){
   const seed=depth*300+i*17,width=unit*(.71+random(seed+12)*.68);
   const height=[73,134,95][depth]!+random(seed+40)*[56,105,87][depth]!;
   buildings.push({x,width,height,band:(i*7+depth*5)%24,seed,depth,roof:Math.floor(random(seed+21)*4)});
   x+=width+2+random(seed+5)*(depth===2?17:6);i++;
  }
  for(const b of buildings){
   const top=base-b.height,side=Math.max(4,b.width*.17),front=b.width-side;
   ctx.fillStyle=faces[depth]!;ctx.fillRect(b.x,top,front,h-top);
   ctx.fillStyle=sides[depth]!;ctx.beginPath();ctx.moveTo(b.x+front,top);ctx.lineTo(b.x+b.width,top+6);ctx.lineTo(b.x+b.width,h);ctx.lineTo(b.x+front,h);ctx.fill();
   ctx.strokeStyle=depth===0?'#63313a':depth===1?'#59414a':'#3b3038';ctx.lineWidth=depth===0?.7:1;
   ctx.beginPath();ctx.moveTo(b.x,top);ctx.lineTo(b.x+front,top);ctx.lineTo(b.x+b.width,top+6);ctx.moveTo(b.x+front,top);ctx.lineTo(b.x+front,base);ctx.stroke();
   ctx.fillStyle=faces[depth]!;
   if(b.roof===0){
    ctx.fillRect(b.x+front*.21,top-9,front*.57,9);ctx.fillRect(b.x+front*.38,top-17,front*.23,8);
   }else if(b.roof===1){
    ctx.beginPath();ctx.moveTo(b.x-2,top);ctx.lineTo(b.x+front*.52,top-11-depth*3);ctx.lineTo(b.x+front+2,top);ctx.fill();
    ctx.fillRect(b.x+front*.72,top-13,4,13);
   }else if(b.roof===2){
    const tankX=b.x+front*.52,tankY=top-17-depth*5,tankWidth=Math.min(21,front*.35);
    ctx.fillRect(tankX,tankY,tankWidth,13);ctx.beginPath();ctx.moveTo(tankX-2,tankY);ctx.lineTo(tankX+tankWidth*.5,tankY-5);ctx.lineTo(tankX+tankWidth+2,tankY);ctx.fill();
    ctx.fillRect(tankX+2,tankY+13,2,top-tankY-13);ctx.fillRect(tankX+tankWidth-4,tankY+13,2,top-tankY-13);
   }else{
    ctx.fillRect(b.x+front*.35,top-23,1.4,23);ctx.fillRect(b.x+front*.35-5,top-18,11,1.3);ctx.fillRect(b.x+front*.35-3,top-13,7,1.1);
   }
   const cell=depth===0?10:depth===1?14:19,cols=Math.max(2,Math.floor((front-8)/cell)),rows=Math.max(3,Math.floor((b.height-23)/cell));
   const gap=(front-10)/cols,ww=Math.max(2.3,gap*.42),wh=depth===0?3.8:depth===1?5.6:7.5;
   const power=effectsEnabled?(.58*(levels[b.band]??0)+.27*(levels[(b.band+1)%24]??0)+.15*(levels[(b.band+23)%24]??0)):0;
   for(let row=0;row<rows;row++)for(let col=0;col<cols;col++){
    const occupancy=random(b.seed*113+row*9+col),wx=b.x+5+col*gap,wy=top+17+row*cell;
    ctx.fillStyle=depth===0?'#4f3037':'#45333c';ctx.fillRect(wx-.7,wy-.7,ww+1.4,wh+1.4);
    ctx.fillStyle='#0c0a0f';ctx.fillRect(wx,wy,ww,wh);
    if(occupancy<.29)continue;
    const light=(.10+power*.81)*(.54+occupancy*.46)*[.69,.93,.72][depth]!;
    ctx.fillStyle=`rgba(237,111,100,${light})`;ctx.fillRect(wx+.35,wy+.4,Math.max(1,ww-.7),Math.max(1,wh-.8));
    if(depth>0&&ww>4){ctx.fillStyle=sides[depth]!;ctx.fillRect(wx+ww*.5,wy,.7,wh)}
   }
   // Sparse fixed masonry and floor ledges keep the silhouette readable even
   // in a quiet interval. Their positions never follow the spectrum.
   ctx.strokeStyle=depth===0?'#42242d':'#362a33';ctx.lineWidth=.65;
   for(let row=2;row<rows;row+=3){const y=top+15+row*cell;ctx.beginPath();ctx.moveTo(b.x+2,y);ctx.lineTo(b.x+front-2,y);ctx.stroke()}
  }
 }
}
function drawWord(ctx:Context,slot:Slot,on:boolean,size:number,shadowMotion:number){
 ctx.font=font(size);ctx.textAlign='left';ctx.textBaseline='alphabetic';
 ctx.shadowColor=PALETTE.shadow;ctx.shadowBlur=0;ctx.shadowOffsetX=0;ctx.shadowOffsetY=1.3;
 ctx.lineWidth=1.1;ctx.strokeStyle='#17070b';ctx.strokeText(slot.text,slot.x,slot.y);
 if(on&&effectsEnabled){
  ctx.save();ctx.fillStyle='rgba(190,5,37,.33)';ctx.fillText(slot.text,slot.x+.9+shadowMotion*.65,slot.y+.9);ctx.restore();
 }
 ctx.shadowColor=on?'#700012':'#180609';ctx.shadowBlur=0;ctx.fillStyle=on?PALETTE.focus:PALETTE.rest;ctx.fillText(slot.text,slot.x,slot.y);
 ctx.shadowBlur=0;ctx.shadowOffsetY=0;
}
export function paintScene(ctx:Context,t:number,format:Format,video:CanvasImageSource){
 const w=format==='landscape'?1920:1080,h=format==='landscape'?1080:1920;
 if(sourceSurface){
  const p=sourceSurface.context;p.globalCompositeOperation='source-over';p.clearRect(0,0,1080,1080);p.drawImage(video,420,0,1080,1080,0,0,1080,1080);
  // Match the actual decoder's red once, using a named empty-sky material
  // patch. Browser/FFmpeg color conversion can differ slightly. The cache
  // prevents exposure chasing and repeated GPU readback during playback.
  if(paletteSource!==video){
   const patch=p.getImageData(485,85,30,30).data,mean=[0,0,0];
   for(let i=0;i<patch.length;i+=4)for(let j=0;j<3;j++)mean[j]!+=patch[i+j]!;
   skyRed=`rgb(${mean.map(n=>Math.round(n/900)).join(',')})`;paletteSource=video;prepareBackdrop();
  }
 }
 const levels=featureAt(t);ctx.save();ctx.globalAlpha=1;ctx.globalCompositeOperation='source-over';ctx.shadowBlur=0;ctx.fillStyle=skyRed;ctx.fillRect(0,0,w,h);
 const bg=ctx.createLinearGradient(0,0,0,h);bg.addColorStop(0,skyRed);bg.addColorStop(.3,skyRed);bg.addColorStop(.58,'#160609');bg.addColorStop(1,'#09090b');ctx.fillStyle=bg;ctx.fillRect(0,0,w,h);
 if(format==='landscape'&&backdrop)ctx.drawImage(backdrop,0,0);
 const imageY=format==='landscape'?0:120;
 // Crop only the source's encoded pillarboxes. The complete 1080-square
 // illustration and every original decoded picture are retained.
 if(format==='landscape'&&sourceSurface&&sourceEdgeMask){
  const p=sourceSurface.context;
  p.globalCompositeOperation='destination-in';p.drawImage(sourceEdgeMask,0,0);p.globalCompositeOperation='source-over';ctx.drawImage(sourceSurface.canvas,0,0);
 }else ctx.drawImage(video,420,0,1080,1080,0,imageY,1080,1080);
 if(effectsEnabled&&hairMask){ctx.globalAlpha=.25+.55*(levels[10]??0);ctx.drawImage(hairMask,0,imageY);ctx.globalAlpha=1}
 if(format==='portrait'){
  const seam=ctx.createLinearGradient(0,1080,0,1230);seam.addColorStop(0,'#09090b00');seam.addColorStop(1,'#13060c');ctx.fillStyle=seam;ctx.fillRect(0,1080,1080,150);
 }
 if(effectsEnabled)migratingBirds(ctx,t,format,levels);
 city(ctx,t,format,levels);
 const c=visibleCue(timeline,t);
 if(c){
  const l=layoutCue(ctx,c,format),opacity=cueOpacity(c,t);ctx.globalAlpha=opacity;
  const texture=c.words.some(s=>sourceActive(s,t)&&s.text.toLowerCase().startsWith('больного'))?Math.sin(t*6)*1.4:0;
  for(const s of l.source)drawWord(ctx,s,sourceActive(c.words[s.index]!,t),l.size,texture);
  for(const s of l.target)drawWord(ctx,s,targetActive(c.targets[s.index]!,c.words,t),l.size,texture);
  ctx.globalAlpha=1;
 }else if(t<(timeline.cues[0]?.visibleStart??0)||t>timeline.cues[timeline.cues.length-1]!.visibleEnd+1){
  const cx=format==='landscape'?1480:540,cy=format==='landscape'?570:1400;
  const opening=t<(timeline.cues[0]?.visibleStart??0);const opacity=opening?smooth(0,1.6,t)*(1-smooth(Math.max(0,timeline.cues[0]!.visibleStart-1),timeline.cues[0]!.visibleStart,t)):smooth(timeline.cues[timeline.cues.length-1]!.visibleEnd+1,timeline.cues[timeline.cues.length-1]!.visibleEnd+2.5,t)*(1-smooth(timeline.sourceDuration-2,timeline.sourceDuration,t));
  ctx.globalAlpha=opacity;ctx.textAlign='center';ctx.font=font(format==='landscape'?142:134);ctx.fillStyle=PALETTE.focus;ctx.fillText('ДРУГ',cx,cy);ctx.font=font(29);ctx.fillStyle=PALETTE.rest;ctx.fillText('REDCHINAWAVE',cx,cy+62);ctx.globalAlpha=1;
 }
 ctx.restore();
}
