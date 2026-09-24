import rawCues from './word-cues.json';
import spectrum from './spectrum.json';
import {GLYPHS} from './pixel-font.ts';

export type Format = 'landscape' | 'portrait';
export type Word = {text:string; start:number; end:number; startSample?:number; endSampleExclusive?:number; requiresReview?:boolean};
export type Cue = {id:string; text:string; start:number; end:number; uncertain?:boolean; words:Word[]};
export const cityCues = rawCues as Cue[];
type Ctx = CanvasRenderingContext2D;
type Box = {x:number;y:number;w:number;h:number};
type Host = 'airship'|'tower'|'shop'|'train';
const backgrounds:Partial<Record<Format,CanvasImageSource>>={};
let airshipImage:CanvasImageSource|undefined;
let trainImage:CanvasImageSource|undefined;
let spriteImage:CanvasImageSource|undefined;
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
  for(let i=0;i<value.length;i++){const g=GLYPHS[value.toUpperCase().charAt(i)]??GLYPHS['?'];if(!g)continue;
    for(let r=0;r<7;r++)for(let col=0;col<5;col++)if(g[r]?.charAt(col)==='1')R(c,x+(i*6+col)*unit,y+r*unit,unit,unit,color,a);
  }
}
function centered(c:Ctx,value:string,b:Box,u:number,color:string,a=1){text(c,value,b.x+(b.w-(value.length*6-1)*u)/2,b.y+(b.h-7*u)/2,u,color,a);}
export function getCityCue(t:number):Cue|undefined{
  // A new line's pre-roll must never steal the previous line's held final vowel.
  const singing=cityCues.find(q=>t>=q.start&&t<q.end);if(singing)return singing;
  return cityCues.find(q=>t>=q.start-.55&&t<q.start)??cityCues.find(q=>t>=q.end&&t<q.end+.7);
}
const HOSTS:Record<string,Host>={
  'V1-01':'shop','V1-02':'tower','V1-03':'tower','V1-04':'airship','V1-05':'train','V1-06':'train',
  'V1-07':'airship','V1-08':'airship','CH-01':'airship','CH-02':'airship','CH-03':'tower','CH-04':'tower',
  'CH-05':'airship','CH-06':'airship','V2-01':'shop','V2-02':'shop','V2-03':'tower','V2-04':'train',
};
export const cueHost=(cue:Cue|undefined):Host|undefined=>cue?HOSTS[cue.id]??'airship':undefined;
function wordStart(id:string,word:string,fallback:number){return cityCues.find(q=>q.id===id)?.words.find(w=>w.text.toLowerCase().replace(/[^a-z]/g,'')===word)?.start??fallback;}
function pulse(t:number,start:number,length:number){return smooth((t-start)/.18)*(1-smooth((t-start-length)/1.1));}
function bandAt(frame:number){return spectrum.values[Math.min(spectrum.values.length-1,Math.max(0,frame))]??Array<number>(12).fill(0);}
export function cityGeometry(format:Format){
  const portrait=format==='portrait';return {portrait,w:portrait?360:640,h:portrait?640:360,
    horizon:portrait?374:195,shopY:portrait?450:245,roadY:portrait?551:315,
    tower:{x:portrait?68:231,y:portrait?300:157,w:portrait?224:177,h:portrait?41:28},
    // Airship geometry names the actual LED skin, not its entire silhouette.
    airship:{x:portrait?26:141,y:portrait?210:77,w:portrait?308:356,h:portrait?44:51},
    shop:{x:portrait?68:231,y:portrait?300:157,w:portrait?224:177,h:portrait?41:28},
    train:{x:portrait?93:233,y:portrait?308:129,w:202,h:34},
  };
}
type G=ReturnType<typeof cityGeometry>;
type WordPlacement={word:string;index:number;x:number;y:number};
const LINE_BREAKS:Record<string,number[]>={
  'V1-01':[2],'V1-02':[2],'V1-03':[2],'V1-04':[2],
  'CH-02':[3],'CH-06':[4],'V2-01':[3],'V2-02':[2],'V2-03':[2],
};
export function lyricLayout(cue:Cue,box:Box,format:Format,host:Host):{unit:number;placements:WordPlacement[];height:number}{
  const maxUnit=host==='airship'||host==='train'||format==='portrait'?2:1;
  for(let unit=maxUnit;unit>=1;unit--){
    const max=Math.floor((box.w-8)/(unit*6));
    const words=cue.text.toUpperCase().split(/\s+/);const rows:{word:string;index:number}[][]=[[]];let count=0;
    words.forEach((word,index)=>{if(count&&(LINE_BREAKS[cue.id]?.includes(index)||count+word.length+1>max)){rows.push([]);count=0;}rows[rows.length-1]?.push({word,index});count+=word.length+(count?1:0);});
    const height=rows.length*unit*9-unit*2;if(height>box.h-2&&unit>1)continue;
    const placements:WordPlacement[]=[];const startY=Math.round(box.y+(box.h-height)/2);
    rows.forEach((row,ri)=>{const chars=row.reduce((n,w)=>n+w.word.length,0)+Math.max(0,row.length-1);let x=Math.round(box.x+(box.w-chars*unit*6+unit)/2);
      row.forEach(w=>{placements.push({...w,x,y:startY+ri*unit*9});x+=(w.word.length+1)*unit*6;});});
    return {unit,placements,height};
  }
  throw new Error(`Lyric layout failed for ${cue.id}`);
}
function lyrics(c:Ctx,cue:Cue,b:Box,format:Format,host:Host,t:number){
  const layout=lyricLayout(cue,b,format,host);
  for(const p of layout.placements){const w=cue.words[p.index],active=w!==undefined&&t>=w.start&&t<w.end;
    text(c,p.word,p.x,p.y+1,layout.unit,C.ink,.8);
    if(active){text(c,p.word,p.x-1,p.y,layout.unit,C.warm,.12);text(c,p.word,p.x+1,p.y,layout.unit,C.warm,.12);}
    text(c,p.word,p.x,p.y,layout.unit,active?C.cream:C.white,active?1:.86);
  }
}

// Shop lettering is authored separately so the painted scene has legible native names.
function shopSigns(g:G){return g.portrait?[
  {x:11,y:450,w:54,h:15,name:'MONSOON',color:C.pink},{x:88,y:450,w:42,h:15,name:'LAUNDRY',color:C.teal},
  {x:152,y:450,w:48,h:15,name:'ARCADE',color:C.pink},{x:222,y:450,w:46,h:15,name:'LANTERN',color:C.warm},
  {x:293,y:450,w:49,h:15,name:'GLASS',color:C.teal},
]:[
  {x:0,y:248,w:46,h:9,name:'MONSOON',color:C.pink},{x:64,y:249,w:47,h:8,name:'LAUNDRY',color:C.teal},
  {x:134,y:252,w:17,h:6,name:'AXIS',color:C.pink},{x:178,y:248,w:55,h:9,name:'NOODLES',color:C.warm},
  {x:274,y:246,w:64,h:11,name:'LANTERN',color:C.pink},{x:375,y:249,w:36,h:8,name:'GLASS',color:C.teal},
  {x:434,y:249,w:47,h:8,name:'ARCADE',color:C.violet},{x:503,y:249,w:47,h:8,name:'YELLOW',color:C.warm},
  {x:568,y:249,w:23,h:8,name:'CAT',color:C.teal},
];}
function nativeSigns(c:Ctx,g:G,t:number,cue:Cue|undefined){
  const signs=shopSigns(g);for(const b of signs){if(b.w<26)centered(c,b.name,b,.5,b.color,.9);else centered(c,b.name,b,1,b.color,.85);}
  // Word echoes illuminate the actual business connected to the sung image.
  const associations:Record<string,number>={'neon':0,'gutter':0,'steam':g.portrait?0:3,'noodle':g.portrait?0:3,'stalls':g.portrait?0:3,'window':g.portrait?3:4,'lantern':g.portrait?3:4,'glass':g.portrait?4:5,'cat':g.portrait?4:8};
  const current=cue?.words.find(w=>t>=w.start&&t<w.end);const slot=current?associations[current.text.toLowerCase().replace(/[^a-z]/g,'')]:undefined;
  if(slot!==undefined){const b=signs[slot];if(b){R(c,b.x,b.y,b.w,b.h,C.ink,.87);centered(c,current?.text??b.name,b,b.w<26?.5:1,C.cream);}}
}
function billboards(c:Ctx,g:G,cue:Cue|undefined,t:number,bands:number[]){
  const format=g.portrait?'portrait':'landscape',b=g.tower;
  const host=cueHost(cue);
  if(cue&&(host==='tower'||host==='shop')){R(c,b.x,b.y,b.w,b.h,'#090d23',.95);lyrics(c,cue,b,format,host,t);}
  else {
    centered(c,'SPINWARD',b,g.portrait?2:2,C.pink,.72);
    // Instrumental title belongs to the central municipal sign.
    if(g.portrait)text(c,'NIGHT SERVICE / 07',b.x+62,b.y+31,.5,C.teal,.75);
  }
  // Two permanent music displays, precisely inside the empty tower sign skins.
  const panels=g.portrait?[{x:0,y:32,w:16,h:48},{x:322,y:70,w:17,h:87}]:[{x:19,y:48,w:45,h:45},{x:573,y:31,w:21,h:75}];
  panels.forEach((p,side)=>{for(let k=0;k<6;k++){
    const v=bands[k+side*6]??0;const bw=Math.max(1,Math.floor((p.w-4)/6)-1),bx=p.x+2+k*(p.w-4)/6;
    for(let row=0;row<12;row++){const yy=p.y+p.h-3-row*(p.h-6)/12;R(c,bx,yy,bw,Math.max(1,(p.h-6)/12-1),row<v?(side?C.teal:C.pink):'#1b2344',row<v?.85:.45);}
  }});
  // Low, fixed LED strip under the civic billboard follows the same measured bands.
  for(let i=0;i<12;i++)R(c,b.x+i*b.w/12,b.y+b.h+3,Math.floor(b.w/12)-2,1,(bands[i]??0)>5?C.teal:C.violet,.55);
}
function flightGroup(t:number):{start:number;end:number}|undefined{
  const flights:{start:number;end:number}[]=[];
  for(const q of cityCues.filter(c=>cueHost(c)==='airship')){const prev=flights[flights.length-1];if(prev&&q.start-prev.end<7)prev.end=q.end;else flights.push({start:q.start,end:q.end});}
  return flights.find(f=>t>f.start-3&&t<f.end+3);
}
function airship(c:Ctx,g:G,cue:Cue|undefined,t:number){
  if(!airshipImage)return;
  const flight=flightGroup(t);const active=cue&&cueHost(cue)==='airship';
  if(flight&&(!cue||active)){
    const width=g.portrait?540:624,height=width/3,x=(g.w-width)/2,y=g.portrait?146:3;
    const enter=1-smooth((t-(flight.start-3))/2.3),leave=smooth((t-(flight.end+.8))/2.2);
    const shift=enter*(g.w+width)-leave*(g.w+width);
    c.save();c.translate(Math.round(shift),0);c.drawImage(airshipImage,x,y,width,height);
    const b=g.airship;
    if(active)lyrics(c,cue,b,g.portrait?'portrait':'landscape','airship',t);
    else centered(c,'SPINWARD / NIGHT SERVICE',b,g.portrait?1:1,C.teal,.75);
    // Engine light reflected in rain; the luminous core remains part of the sprite.
    for(const px of [x+width*.23,x+width*.49,x+width*.77])for(let j=0;j<3;j++)R(c,px-3-j,y+height*.89+j*3,7+j*2,2,C.teal,(.05+.015*Math.sin(t*13))*(3-j));
    c.restore();
  } else {
    const phase=(t%30.9)/30.9;const x=g.w+145-phase*(g.w+290),y=g.portrait?174:47;const w=g.portrait?180:220;
    c.drawImage(airshipImage,Math.round(x),y,w,w/3);
    centered(c,'NIGHT SERVICE',{x:x+w*.216,y:y+w*.119,w:w*.57,h:w*.08},1,C.teal,.7);
  }
}
function trainGroup(t:number){const list=cityCues.filter(q=>cueHost(q)==='train');return list.find(q=>t>q.start-2.5&&t<q.end+2.4);}
function trainCar(c:Ctx,x:number,y:number,w:number,h:number,label:string,tail=false){
  R(c,x+4,y,w-8,h,C.ink);R(c,x,y+5,w,h-10,C.ink);R(c,x+4,y+2,w-8,h-5,C.rim);R(c,x+5,y+4,w-10,h-9,C.steel);
  R(c,x+9,y+3,w-18,1,C.teal,.9);R(c,x+7,y+h-8,w-14,2,C.pink,.8);R(c,x+7,y+h-5,w-14,2,'#152647');
  for(let k=0;k<Math.floor(w/24);k++){const xx=x+13+k*24;R(c,xx,y+6,17,h-18,C.ink);R(c,xx+1,y+7,15,h-20,k%3===0?'#56536b':'#32556f');R(c,xx+4,y+9,3,5,C.warm,.6);R(c,xx+6,y+14,5,3,C.ink);}
  for(const xx of [x+15,x+w-28]){R(c,xx,y+h-4,14,5,C.ink);R(c,xx+3,y+h-2,8,2,C.rim);}
  R(c,x+(tail?1:w-4),y+h-13,3,3,tail?C.pink:C.cream);
  if(label)text(c,label,x+12,y+h-7,.5,C.cyan,.8);
}
function trains(c:Ctx,g:G,cue:Cue|undefined,t:number){
  if(!trainImage)return;
  const stopped=trainGroup(t),active=cue&&cueHost(cue)==='train';
  if(stopped&&(!cue||active)){
    const b=g.train,enter=1-smooth((t-stopped.start+2.5)/1.9),leave=smooth((t-stopped.end-.8)/1.6),shift=-enter*(g.w+410)+leave*(g.w+410);
    c.save();c.translate(Math.round(shift),0);
    c.drawImage(trainImage,b.x-116.85,b.y-47.15,410,410/3);
    if(active)lyrics(c,cue,b,g.portrait?'portrait':'landscape','train',t);else centered(c,'AXIS / LAST SERVICE',b,1,C.cyan,.8);
    c.restore();
  }else {
    // The far rail sits below the sign; passing trains never mask a sung word.
    const speed=g.portrait?70:105,x=(t*speed)%(g.w+540)-540,y=g.horizon-6;
    for(let car=0;car<4;car++){const xx=Math.round(x+car*134);c.drawImage(trainImage,xx,y,139,139/3);centered(c,'AXIS',{x:xx+40,y:y+16,w:68,h:12},1,C.teal,.65);}
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

function person(c:Ctx,x:number,y:number,s:number,color:string,phase:number,umbrella=true){
  if(spriteImage){
    const violet=color===C.violet||color===C.pink;
    const sx=violet?162:729,sw=violet?366:358;
    c.drawImage(spriteImage,sx,646,sw,576,Math.round(x),y+Math.sin(phase*2)*.15,19*s,30*s);
    return;
  }
  c.save();c.translate(Math.round(x),Math.round(y));c.scale(s,s);
  R(c,7,7,4,4,'#c3a0a0');R(c,6,7,6,2,C.ink);R(c,5,11,8,10,C.ink);R(c,6,12,5,7,'#354055');R(c,4,14,2,6,C.ink);R(c,12,13,2,7,C.ink);
  const step=Math.floor(phase)%4;R(c,6-(step===1?1:0),21,2,6,C.ink);R(c,10+(step===3?1:0),21,2,6,C.ink);R(c,4-(step===1?1:0),26,4,1,C.rim);R(c,10,26,4,1,C.rim);
  if(umbrella){R(c,8,2,1,16,C.rim);R(c,6,0,6,1,color);R(c,3,1,12,2,color);R(c,1,3,16,2,color);R(c,-1,5,20,1,color);R(c,7,1,1,5,C.cream,.35);R(c,2,5,3,1,C.ink,.5);R(c,12,5,3,1,C.ink,.5);}
  c.restore();
}
function street(c:Ctx,g:G,t:number){
  const road=g.roadY;
  // Thin moving reflection fragments preserve the painted wet asphalt.
  for(let i=0;i<75;i++){const phase=(t*.23+seed(i*11))%1,x=seed(i*17)*g.w,y=road+phase*(g.h-road);R(c,x+Math.sin(t*1.5+i)*2,y,2+seed(i+7)*12,1,i%3?C.teal:C.pink,.03+.055*Math.sin(phase*Math.PI));}
  const taxi=wordStart('V2-02','taxi',169.56),special=t>=taxi-.5&&t<taxi+7;
  car(c,g.w+65-((t*57+120)%(g.w+130)),road+2,.85,C.warm,-1,true);
  car(c,(t*83+240)%(g.w+180)-90,road+21,1.15,'#414873',1);
  if(special){const xx=clamp((t-taxi+.5)/6.5)*(g.w+130)-70;car(c,xx,road+9,1.12,C.warm,1,true);}
  for(let i=0;i<(g.portrait?5:9);i++){const direction=i%2?1:-1,x=(seed(i+11)*g.w+t*direction*5+g.w*30)%(g.w+35)-18;person(c,x,road-25,.8,[C.teal,C.violet,C.pink,C.warm][i%4]??C.pink,t*2.3+i,true);}
  const cycle=t%30.9;
  if(spriteImage){
    if(cycle>2&&cycle<11){const x=g.w-(cycle-2)*(g.w+90)/9,y=g.h-71+Math.sin(t*5)*.35;c.drawImage(spriteImage,162,646,366,576,x,y,47,74);}
    if(cycle>17&&cycle<25){const x=(cycle-17)*(g.w+90)/8-50,y=g.h-75+Math.sin(t*5)*.35;c.drawImage(spriteImage,729,646,358,576,x,y,49,79);}
  }

}
function cat(c:Ctx,g:G,t:number){
  if(!spriteImage)return;
  const onset=wordStart('V2-03','cat',176.14),awake=pulse(t,onset,11),x=g.portrait?299:417,y=g.portrait?293:148,w=g.portrait?40:43,h=w*1.27;
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
}
function rain(c:Ctx,g:G,t:number,cue:Cue|undefined){
  const monsoon=pulse(t,wordStart('CH-02','monsoon',99.0),7),host=cueHost(cue),safe=host?g[host]:undefined;
  for(let i=0;i<(g.portrait?430:540);i++){const depth=i%5,speed=depth<2?32:depth<4?62:112,y=(seed(i*11+7)*g.h+t*speed)%(g.h+22)-12,x=(seed(i*19+31)*g.w-y*.15+t*2+g.w*10)%g.w;
    if(safe&&x>safe.x-3&&x<safe.x+safe.w+3&&y>safe.y-3&&y<safe.y+safe.h+3)continue;
    line(c,x,y,x-1,y+(depth<2?2:depth<4?4:7),depth===4?C.cyan:'#6091bb',1,(depth===4?.24:.1)+monsoon*.09);
  }
  for(let i=0;i<36;i++){const p=(t*1.4+seed(i*17))%1,x=seed(i*13)*g.w,y=g.roadY+3+seed(i*21)*(g.h-g.roadY-6);if(p<.17){R(c,x-2,y,5,1,C.teal,.3);R(c,x,y-1,1,1,C.cyan,.3);}}
}
export function cityCamera(t:number,format:Format){
  const g=cityGeometry(format);let selected:Cue|undefined;
  for(const q of cityCues){if(t>=q.start-1.8&&t<=q.end+1.6){selected=q;if(t>=q.start&&t<q.end)break;}}
  if(!selected)return {zoom:1,x:g.w/2,y:g.h/2};
  const host=cueHost(selected),catShot=selected.id==='V2-03';
  const inAmount=smooth((t-selected.start+1.8)/1.25),outAmount=1-smooth((t-selected.end-.5)/1.1),weight=inAmount*outAmount;
  let targetZoom=1,targetX=g.w/2,targetY=g.h/2;
  if(host==='tower'){targetZoom=g.portrait?1.32:catShot?2.3:2.55;targetX=catShot?(g.portrait?195:346):g.w/2;targetY=g.portrait?328:176;}
  if(host==='shop'){targetZoom=g.portrait?1.1:1.75;targetY=g.portrait?393:224;}
  if(host==='train'){targetZoom=g.portrait?1.32:2.25;targetY=g.portrait?345:165;}
  if(host==='airship'){targetZoom=g.portrait?1:1.08;targetY=g.portrait?320:164;}
  const zoom=1+(targetZoom-1)*weight;
  return {zoom,x:clamp(g.w/2+(targetX-g.w/2)*weight,g.w/2/zoom,g.w-g.w/2/zoom),y:clamp(g.h/2+(targetY-g.h/2)*weight,g.h/2/zoom,g.h-g.h/2/zoom)};
}
export function paintCity(c:Ctx,frame:number,format:Format){
  const g=cityGeometry(format),t=Math.max(0,frame/60),cue=getCityCue(t),bands=bandAt(frame),camera=cityCamera(t,format),background=backgrounds[format];
  if(!background||!airshipImage||!trainImage||!spriteImage)throw new Error('City artwork must be decoded before painting');
  c.save();c.imageSmoothingEnabled=false;c.clearRect(0,0,c.canvas.width,c.canvas.height);c.scale(c.canvas.width/g.w,c.canvas.height/g.h);
  c.translate(g.w/2,g.h/2);c.scale(camera.zoom,camera.zoom);c.translate(-camera.x,-camera.y);
  c.drawImage(background,0,0,g.w,g.h);nativeSigns(c,g,t,cue);billboards(c,g,cue,t,bands);semantics(c,g,t);cat(c,g,t);airship(c,g,cue,t);trains(c,g,cue,t);street(c,g,t);rain(c,g,t,cue);
  c.restore();
}
