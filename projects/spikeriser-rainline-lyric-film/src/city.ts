import spectrum from './spectrum.json';
import {GLYPHS} from './pixel-font.ts';
import {paintSidewalkPedestrians} from './pedestrian-paths.ts';
import {cityCues,cityGeometry,cityCamera,cueHost,getCityCue,shopSigns,lyricSurfaces,surfacePlacements,trainPose,airshipPose,catWindow,type Format,type Cue,type Box} from './city-choreography.ts';
export {cityCues,cityGeometry,cityCamera,cueHost,getCityCue,lyricLayout,lyricPose,lyricSurfaces,trainPose,airshipPose} from './city-choreography.ts';
export type {Format,Cue,Word} from './city-choreography.ts';
type Ctx=CanvasRenderingContext2D;
type G=ReturnType<typeof cityGeometry>;
const backgrounds:Partial<Record<Format,CanvasImageSource>>={};
let airshipImage:CanvasImageSource|undefined,trainImage:CanvasImageSource|undefined,spriteImage:CanvasImageSource|undefined;
export function setCityBackground(format:Format,image:CanvasImageSource){backgrounds[format]=image;}
export function setCityAirship(image:CanvasImageSource){airshipImage=image;}
export function setCityTrain(image:CanvasImageSource){trainImage=image;}
export function setCitySprites(image:CanvasImageSource){spriteImage=image;}
const C={ink:'#070d22',steel:'#263758',rim:'#657ca4',teal:'#59d8ec',cyan:'#adefff',pink:'#f269c9',warm:'#edb366',cream:'#fff1b4',white:'#c7dce8',violet:'#8b78b8'};
const R=(c:Ctx,x:number,y:number,w:number,h:number,color:string,a=1)=>{c.globalAlpha=a;c.fillStyle=color;c.fillRect(Math.round(x),Math.round(y),Math.round(w),Math.round(h));c.globalAlpha=1;};
const seed=(n:number)=>{const v=Math.sin(n*127.1+311.7)*43758.5453123;return v-Math.floor(v);};
const clamp=(v:number,a=0,b=1)=>Math.max(a,Math.min(b,v));
const smooth=(v:number)=>{const x=clamp(v);return x*x*(3-2*x);};
function line(c:Ctx,x0:number,y0:number,x1:number,y1:number,color:string,size=1,a=1){
  x0=Math.round(x0);y0=Math.round(y0);x1=Math.round(x1);y1=Math.round(y1);
  const dx=Math.abs(x1-x0),sx=x0<x1?1:-1,dy=-Math.abs(y1-y0),sy=y0<y1?1:-1;let err=dx+dy;
  for(let i=0;i<2000;i++){R(c,x0,y0,size,size,color,a);if(x0===x1&&y0===y1)break;const e=2*err;if(e>=dy){err+=dy;x0+=sx;}if(e<=dx){err+=dx;y0+=sy;}}
}
function text(c:Ctx,value:string,x:number,y:number,unit:number,color:string,a=1){
  c.fillStyle=color;c.globalAlpha=a;
  for(let i=0;i<value.length;i++){const g=GLYPHS[value.toUpperCase().charAt(i)]??GLYPHS['?'];if(!g)continue;
    // Keep cells on the same fractional transform as their glass and vehicle.
    // Rounding world coordinates independently made the lettering crawl across bezels.
    for(let r=0;r<7;r++)for(let col=0;col<5;col++)if(g[r]?.charAt(col)==='1')c.fillRect(x+(i*6+col+.06)*unit,y+(r+.05)*unit,unit*.88,unit*.9);
  }
  c.globalAlpha=1;
}
function centered(c:Ctx,value:string,b:Box,u:number,color:string,a=1){u=Math.min(u,(b.w-2)/(value.length*6-1),(b.h-1)/7);text(c,value,b.x+(b.w-(value.length*6-1)*u)/2,b.y+(b.h-7*u)/2,u,color,a);}

function wordStart(id:string,word:string,fallback:number){return cityCues.find(q=>q.id===id)?.words.find(w=>w.text.toLowerCase().replace(/[^a-z]/g,'')===word)?.start??fallback;}
function pulse(t:number,start:number,length:number){return smooth((t-start)/.18)*(1-smooth((t-start-length)/1.1));}
function bandAt(frame:number){return spectrum.values[Math.min(spectrum.values.length-1,Math.max(0,frame))]??Array<number>(12).fill(0);}
function signage(c:Ctx,g:G,t:number,cue:Cue|undefined,bands:number[]){
 const format=g.portrait?'portrait':'landscape';
 const surfaces=cue?lyricSurfaces(cue,t,format):[],occupied=(b:Box)=>surfaces.some(s=>s.box.x<b.x+b.w&&s.box.x+s.box.w>b.x&&s.box.y<b.y+b.h&&s.box.y+s.box.h>b.y);
 for(const [i,b] of shopSigns(format).entries())if(!surfaces.some(s=>s.name===`shop-${i}`))centered(c,b.name,b,1,b.color,.72);
 if(!occupied(g.tower))centered(c,'SPINWARD',g.tower,2,C.pink,.58);
 const panels=g.portrait?[{x:0,y:32,w:16,h:48},{x:322,y:70,w:17,h:87}]:[{x:19,y:48,w:45,h:45},{x:573,y:31,w:21,h:75}];
 panels.forEach((p,side)=>{if(occupied(p))return;for(let k=0;k<6;k++){const v=bands[k+side*6]??0,bw=Math.max(1,Math.floor((p.w-4)/6)-1),bx=p.x+2+k*(p.w-4)/6;
 for(let row=0;row<12;row++)R(c,bx,p.y+p.h-3-row*(p.h-6)/12,bw,Math.max(1,(p.h-6)/12-1),row<v?(side?C.teal:C.pink):'#1b2344',row<v?.78:.4);}});
 for(let i=0;i<12;i++)R(c,g.tower.x+i*g.tower.w/12,g.tower.y+g.tower.h+3,Math.floor(g.tower.w/12)-2,1,(bands[i]??0)>5?C.teal:C.violet,.55);
}
function airship(c:Ctx,g:G,t:number){
 if(!airshipImage)return;const p=airshipPose(t,g.portrait?'portrait':'landscape');if(!p.visible)return;
 c.drawImage(airshipImage,p.x,p.y,p.width,p.height);if(cueHost(getCityCue(t))!=='airship')centered(c,'NIGHT SERVICE',p.box,1,C.teal,.7);
}
function trains(c:Ctx,g:G,t:number){
 if(!trainImage)return;const p=trainPose(t,g.portrait?'portrait':'landscape');if(!p.visible)return;
 for(let i=p.count-1;i>=0;i--){const x=p.x-i*p.spacing;
  if(i===0)c.drawImage(trainImage,x,p.y,p.width,p.height);else c.drawImage(trainImage,0,0,1820,724,x,p.y,p.width,p.height);
  const b=i===0?p.box:{x:x+72,y:p.y+18,w:115,h:11.5};
  if(i>0||cueHost(getCityCue(t))!=='train')centered(c,i===0?'AXIS / NIGHT LINE':'AXIS',b,1,C.teal,.6);
  if(i>0){R(c,x+p.width-1,g.railY-7,p.spacing-p.width+3,3,'#26324c');R(c,x+p.width,g.railY-5,p.spacing-p.width+2,1,C.teal,.3);}
 }
 // The existing viaduct foreground beam places the wheels on a real continuous rail.
 R(c,0,g.railY,g.w,1,'#495b77',.55);
}
function lyricSigns(c:Ctx,g:G,q:Cue|undefined,t:number){
 if(!q)return;const format=g.portrait?'portrait':'landscape';
 const emission=smooth((t-q.start+.55)/.35)*(1-smooth((t-q.end-.2)/.7));
 for(const surface of lyricSurfaces(q,t,format)){
  const b=surface.box;
  const tint=surface.name.startsWith('shop-')?shopSigns(format)[Number(surface.name.slice(5))]?.color??C.teal:surface.name==='train-led'?C.teal:surface.name==='cat-apartment-sign'?C.warm:C.pink;
  // Only light the native glass. Its texture, frame and reflection remain the original art.
  c.save();c.beginPath();c.moveTo(b.x,b.y);c.lineTo(b.x+b.w,b.y);c.lineTo(b.x+b.w,b.y+b.h);c.lineTo(b.x,b.y+b.h);c.closePath();c.clip();
  for(const p of surfacePlacements(q,surface)){const word=q.words[p.index],active=!!word&&t>=word.start&&t<word.end,col=active?C.cream:tint;
   c.shadowColor=active?C.warm:tint;c.shadowBlur=p.unit*.9;
   if(p.vertical){for(let i=0;i<p.word.length;i++)text(c,p.word[i]!,p.x,p.y+i*8*p.unit,p.unit,col,(active?1:.82)*emission);}
   else text(c,p.word,p.x,p.y,p.unit,col,(active?1:.86)*emission);
  }
  c.restore();
 }
}
function car(c:Ctx,x:number,y:number,s:number,color:string,direction:number,taxi=false){
  if(!spriteImage)return;
  c.save();c.translate(Math.round(x),Math.round(y));c.scale(s*direction,s);
  const w=53,h=24;
  for(let j=0;j<6;j++)R(c,3-j,24+j*2,w-8+j*2,1,taxi?C.warm:C.teal,.11-j*.014);
  c.drawImage(spriteImage,27,201,589,277,0,-4,w,h);
  // Passing violet cars are variations in glass/body reflection, not new sprites.
  if(!taxi){c.globalCompositeOperation='source-atop';R(c,3,7,40,6,color,.12);c.globalCompositeOperation='source-over';}
  for(let j=0;j<5;j++)R(c,53+j*3,7-j,4,4+j*2,C.cream,.065-j*.01);
  c.restore();
}
function street(c:Ctx,g:G,t:number){
 if(!spriteImage)return;const road=g.roadY;
 for(let i=0;i<110;i++){const phase=(t*.36+seed(i*11))%1,x=seed(i*17)*g.w,y=road+phase*(g.h-road);R(c,x+Math.sin(t*2+i)*2,y,2+seed(i+7)*15,1,i%3?C.teal:C.pink,.04+.09*Math.sin(phase*Math.PI));}
 const taxi=wordStart('V2-02','taxi',169.56),special=t>=taxi-.5&&t<taxi+7;
 car(c,g.w+65-((t*43+120)%(g.w+130)),road+2,.85,C.warm,-1,true);
 car(c,(t*58+240)%(g.w+180)-90,road+21,1.15,'#414873',1);
 if(special){const xx=clamp((t-taxi+.5)/6.5)*(g.w+130)-70;car(c,xx,road+9,1.12,C.warm,1,true);}
 paintSidewalkPedestrians(c,spriteImage,t,g.portrait?'portrait':'landscape');
}
function cat(c:Ctx,g:G,t:number){
  if(!spriteImage)return;
  const onset=wordStart('V2-03','cat',176.14),awake=pulse(t,onset,11),{x,y,w,h}=catWindow(g.portrait?'portrait':'landscape');
  c.drawImage(spriteImage,713,35,446,567,x,y,w,h);
  // The apartment shutter rises on the sung CAT, revealing the resident.
  const shutter=(1-awake)*h*.515;
  if(shutter>.5){R(c,x+w*.302,y+h*.196,w*.452,shutter,'#27314a',.98);for(let j=1;j<shutter;j+=2)R(c,x+w*.302,y+h*.196+j,w*.452,.6,C.rim,.6);}
  // Light turns on with CAT; eyelids blink, then the sill's sign warms on YELLOW.
  R(c,x+w*.30,y+h*.30,w*.49,h*.42,C.warm,awake*.08);
  const ex=x+w*.612,ey=y+h*.602;
  if(awake>.1&&Math.sin((t-onset)*2.8)>.92){R(c,ex,ey,w*.071,1,C.ink,.85);}
  if(awake>.1){R(c,ex,ey,w*.025,.5,C.cream,.8);R(c,ex+w*.05,ey,w*.025,.5,C.cream,.8);}
  const yellow=pulse(t,wordStart('V2-03','yellow',177.56),4);R(c,x+w*.24,y+h*.76,w*.55,.6,C.cream,yellow*.6);
}
function semantics(c:Ctx,g:G,t:number){
  const steam=wordStart('V2-01','steam',163.78),density=.35+pulse(t,steam,8)*.65;
  const sx=g.portrait?41:201,sy=g.portrait?497:283;
  for(let i=0;i<11;i++){const phase=(t*.33+i*.147)%1,xx=sx+Math.sin(t*.8+i)*4+(i%3)*4,yy=sy-phase*42;
    R(c,xx,yy,4+(i%3)*2,2,C.cream,(1-phase)*density*.15);R(c,xx-2,yy-3,4,3,C.white,(1-phase)*density*.09);}
  const neon=pulse(t,wordStart('V1-01','bleeding',48.33),4);
  for(let i=0;i<15;i++)R(c,30+i*3,g.roadY+3+(i%3)*3,7,1,C.pink,neon*.15);
  const lights=pulse(t,wordStart('V1-03','window',60.0),5);
  for(let i=0;i<18;i++){const x=g.portrait?45+(i%5)*67:77+(i%9)*57,y=g.portrait?247+Math.floor(i/5)*26:115+Math.floor(i/9)*22;R(c,x,y,2,3,C.cream,lights*.35);}
  const stars=pulse(t,wordStart('V1-07','stars',80.60),9),cx=g.w*.5,cy=g.portrait?106:57;
  for(let i=0;i<60;i++){const a=i*2.399+t*(.008+stars*.1),r=8+seed(i+4)*(g.portrait?94:121);const x=cx+Math.cos(a)*r,y=cy+Math.sin(a)*r*.53;R(c,x,y,1,1,i%7?C.cyan:C.cream,.12+stars*.5);}
  const falling=wordStart('CH-06','falling',124.546),fall=pulse(t,falling,6);
  for(let i=0;i<32;i++){const dt=Math.max(0,t-falling-seed(i)*1.8),y=(g.portrait?135:15)+dt*dt*8;R(c,seed(i*3+91)*g.w,y,1,3+(i%3),i%2?C.warm:C.pink,fall*.7);}
  const flash=wordStart('CH-03','lightning',105.46),dt=t-flash;
  const ambient=(t%30.9>21&&t%30.9<21.1)?.04:0;
  if(dt>=0&&dt<.7){const a=(1-dt/.7)*.8;const p=[[g.w*.66,0],[g.w*.61,24],[g.w*.65,24],[g.w*.58,57],[g.w*.62,55],[g.w*.55,93]];
    for(let i=1;i<p.length;i++){const u=p[i-1],v=p[i];if(u&&v)line(c,u[0]??0,u[1]??0,v[0]??0,v[1]??0,C.cyan,2,a);}R(c,0,0,g.w,g.h,C.cyan,a*.055);
  }else if(ambient)R(c,0,0,g.w,g.h,C.cyan,ambient);
}function flyingTraffic(c:Ctx,g:G,t:number){
 // Clip distant traffic to the open sky canyon so buildings remain foreground occluders.
 c.save();c.beginPath();
 if(g.portrait){c.moveTo(70,25);c.lineTo(290,25);c.lineTo(284,278);c.lineTo(88,278);}else{c.moveTo(88,18);c.lineTo(559,18);c.lineTo(534,148);c.lineTo(110,148);}c.closePath();c.clip();
 for(let i=0;i<5;i++){const direction=i%2?1:-1,speed=36+i*9,period=(g.w+110)/speed+5,cycle=(t+i*7.13)%period,x=direction===1?cycle*speed-55:g.w+55-cycle*speed,y=(g.portrait?62:25)+i*(g.portrait?40:24),scale=i<2?.55:i<4?.8:1;
  c.save();c.translate(x,y+Math.sin(t*.65+i)*.7);c.scale(direction*scale,scale);
  // The detailed taxi body becomes a hover conversion with wheel-free crop and lift nacelles.
  if(spriteImage)c.drawImage(spriteImage,27,201,589,210,0,0,32,11.4);
  R(c,3,10,26,2,'#1b233d');R(c,4,10,6,1,'#728498');R(c,23,10,6,1,'#728498');R(c,5,12,5,1,C.teal,.9);R(c,23,12,5,1,C.teal,.9);R(c,30,7,2,1,C.cream,.8);
  for(let k=0;k<5;k++){R(c,-3-k*5,9,5,1,i%2?C.pink:C.teal,.28-k*.045);R(c,4-k,13+k*2,8+k*2,1,C.teal,.07-k*.01);}c.restore();
 }
 c.restore();
}
function rain(c:Ctx,g:G,t:number,cue:Cue|undefined,near=false){
 const monsoon=pulse(t,wordStart('CH-02','monsoon',99.0),8),format=g.portrait?'portrait':'landscape',safe=cue?lyricSurfaces(cue,t,format).map(s=>s.box):[];
 const count=near?(g.portrait?270:360):(g.portrait?780:1050);
 for(let i=0;i<count;i++){const id=i+(near?2300:0),depth=near?3+i%2:i%3,speed=near?140+depth*21:65+depth*21,y=(seed(id*11+7)*g.h+t*speed)%(g.h+30)-18,x=(seed(id*19+31)*g.w-y*.19+t*4+g.w*20)%g.w;
  if(safe.some(b=>x>b.x-2&&x<b.x+b.w+2&&y>b.y-2&&y<b.y+b.h+3))continue;
  const length=near?9+(i%5):3+depth*2;line(c,x,y,x-2-(near?1:0),y+length,near?C.cyan:'#719bc0',1,(near?.19:.09)+depth*.035+monsoon*.06);
 }
 if(near)for(let i=0;i<95;i++){const p=(t*2.7+seed(i*17))%1,x=seed(i*13)*g.w,y=g.roadY+2+seed(i*21)*(g.h-g.roadY-4);if(p<.24){const r=1+p*15;R(c,x-r,y,r*2,1,C.teal,(.24-p)*1.1);R(c,x,y-1-p*8,1,1,C.cyan,(.24-p)*1.6);}}
}
export function paintCity(c:Ctx,frame:number,format:Format){
 const g=cityGeometry(format),t=Math.max(0,frame/60),cue=getCityCue(t),bands=bandAt(frame),camera=cityCamera(t,format),background=backgrounds[format];
 if(!background||!airshipImage||!trainImage||!spriteImage)throw new Error('City artwork must be decoded before painting');
 c.save();c.imageSmoothingEnabled=false;c.clearRect(0,0,c.canvas.width,c.canvas.height);c.scale(c.canvas.width/g.w,c.canvas.height/g.h);
 c.translate(g.w/2,g.h/2);c.scale(camera.zoom,camera.zoom);c.translate(-camera.x,-camera.y);
 c.drawImage(background,0,0,g.w,g.h);flyingTraffic(c,g,t);rain(c,g,t,cue,false);signage(c,g,t,cue,bands);semantics(c,g,t);airship(c,g,t);cat(c,g,t);trains(c,g,t);street(c,g,t);lyricSigns(c,g,cue,t);rain(c,g,t,cue,true);
 c.restore();
}
