import {PALETTE,sourceActive,targetActive,visibleCue,validateTimeline,type Timeline,type FeatureData,type Cue,type Format} from './model.ts';
export type {Format} from './model.ts';
type Context=CanvasRenderingContext2D;
interface Point{x:number;y:number}
interface StringAnchor{id:string;index:number;start:Point;end:Point;width:number;bandIndices:number[]}
interface Bead extends Point{radius:number;phase:number}
export interface MaterialPlan{sourceSha256:string;strings:StringAnchor[];handOcclusion:Point[];ring:{center:Point;angle:number;rx:number;ry:number};veilBeads:Bead[]}
export interface Surface{canvas:CanvasImageSource;context:Context}
export interface Slot{index:number;text:string;x:number;y:number;width:number}
export interface Layout{size:number;source:Slot[];target:Slot[];top:number;bottom:number}
let timeline:Timeline,features:FeatureData,plan:MaterialPlan;
let previewIdentity:{revision:string;sourceSha256:string;timelineSha256:string;sceneSha256:string}|undefined;
let factory:((width:number,height:number)=>Surface)|undefined;
let reference:CanvasImageSource|undefined;
let effectsEnabled=true;
const layouts=new Map<string,Layout>();
const backgrounds=new Map<Format,CanvasImageSource>();
let response:number[][]=[];
const clamp=(x:number,a=0,b=1)=>Math.max(a,Math.min(b,x));
const smooth=(a:number,b:number,x:number)=>{const u=clamp((x-a)/(b-a));return u*u*(3-2*u)};
const font=(size:number)=>`600 ${size}px Bridal`;
const shown=(t:{text:string;punctuationAfter?:string})=>t.text+(t.punctuationAfter?(t.punctuationAfter==='—'?' —':t.punctuationAfter):'');
const dimensions=(format:Format)=>format==='landscape'?{width:1920,height:1080,x:420,y:0}:{width:1080,height:1920,x:0,y:420};

export function cueOpacity(c:Cue,t:number):number{
 if(t<c.visibleStart||t>=c.visibleEnd)return 0;
 const revealEnd=c.start-.012;
 const entrance=revealEnd<=c.visibleStart?1:smooth(c.visibleStart,revealEnd,t);
 return entrance*(c.exitMode==='vocal-handoff'?1:1-smooth(c.fullOpacityEnd,c.visibleEnd,t));
}
export function getLines(){return timeline.cues.map(c=>({id:c.id,label:c.sourceText,start:c.start,end:c.end}))}
export function getReadingCue(t:number){return visibleCue(timeline,t)}
export function getSceneIdentity(){return {...previewIdentity,revision:timeline.revision,sourceSha256:timeline.sourceSha256,sampleRate:timeline.sampleRate}}
export function setEffectsEnabled(value:boolean){effectsEnabled=value}
export function getEffectsEnabled(){return effectsEnabled}

function prepareResponse():void{
 const hz=features.analysis.frameRate.numerator/features.analysis.frameRate.denominator;
 const powers=features.rows.map(row=>plan.strings.map(s=>{
  const power=s.bandIndices.reduce((sum,b)=>sum+10**((-96+row[2+b]!*96/255)/10),0);
  return 10*Math.log10(Math.max(1e-12,power));
 }));
 const ranges=plan.strings.map((_,i)=>{
  const sorted=powers.map(row=>row[i]!).filter(db=>db>-72).sort((a,b)=>a-b);
  return {low:Math.max(-62,sorted[Math.floor(sorted.length*.10)]!-4),high:Math.min(-10,sorted[Math.floor(sorted.length*.97)]!+2)};
 });
 const values=new Array<number>(6).fill(0);
 response=powers.map((row,k)=>row.map((db,i)=>{
  const range=ranges[i]!,rms=-96+features.rows[k]![0]!*96/255;
  const target=Math.pow(clamp((db-range.low)/(range.high-range.low)),1.35)*smooth(-55,-27,rms);
  const tau=target>values[i]!?.055:.18,alpha=1-Math.exp(-1/hz/tau);
  values[i]=values[i]!+(target-values[i]!)*alpha;
  return values[i]!;
 }));
}
function initialize(t:Timeline,f:FeatureData,p:MaterialPlan,make:((w:number,h:number)=>Surface)|undefined,ref:CanvasImageSource|undefined):void{
 validateTimeline(t);
 if(t.sourceSha256!==f.sourceSha256||t.sourceSha256!==p.sourceSha256)throw Error('Scene assets do not belong to the locked recording');
 if(p.strings.length!==6)throw Error('The source guitar requires six distinct material anchors');
 timeline=t;features=f;plan=p;factory=make;reference=ref;
 layouts.clear();backgrounds.clear();prepareResponse();
 // Warm both complete surfaces before the first audible word. No first-peak readback.
 if(reference&&factory){background('landscape');background('portrait');}
}
export function setSceneForProof(t:Timeline,f:FeatureData,p:MaterialPlan,make?:((w:number,h:number)=>Surface),ref?:CanvasImageSource):void{initialize(t,f,p,make,ref)}
export async function loadScene():Promise<void>{
 const read=async<T>(path:string):Promise<T>=>{const r=await fetch(path);if(!r.ok)throw Error(`Missing complete preview asset: ${path}`);return r.json() as Promise<T>};
 const [t,f,p,identity]=await Promise.all([read<Timeline>('/public/timeline.json'),read<FeatureData>('/public/audio-features.json'),read<MaterialPlan>('/public/material-anchors.json'),read<NonNullable<typeof previewIdentity>>('/public/preview-identity.json')]);
 if(identity.revision!==t.revision||identity.sourceSha256!==t.sourceSha256)throw Error('The loaded preview identity is stale.');
 previewIdentity=identity;
 const face=new FontFace('Bridal',"url('/public/fonts/Alegreya.ttf')",{weight:'600'});
 await face.load();document.fonts.add(face);await document.fonts.ready;
 const ref=await new Promise<HTMLImageElement>((resolve,reject)=>{const image=new Image();image.onload=()=>resolve(image);image.onerror=()=>reject(Error('Source material reference unavailable'));image.src='/public/material-reference.png'});
 const make=(width:number,height:number):Surface=>{const canvas=document.createElement('canvas');canvas.width=width;canvas.height=height;const context=canvas.getContext('2d');if(!context)throw Error('Material surface unavailable');return {canvas,context}};
 initialize(t,f,p,make,ref);
}

function wrap(ctx:Context,tokens:{text:string;punctuationAfter?:string}[],width:number):number[][]{
 const greedy:number[][]=[];let row:number[]=[],used=0;const gap=ctx.measureText(' ').width;
 const widths=tokens.map(t=>ctx.measureText(shown(t)).width);
 tokens.forEach((_,i)=>{const w=widths[i]!;if(row.length&&used+gap+w>width){greedy.push(row);row=[];used=0}used+=(row.length?gap:0)+w;row.push(i)});
 if(row.length)greedy.push(row);
 if(greedy.length<2)return greedy;
 // Balance complete reserved lines. A lone trailing pronoun is distracting,
 // and greedy wrapping leaves the bottom of a bilingual block optically weak.
 const count=greedy.length,ideal=(widths.reduce((a,b)=>a+b,0)+gap*(tokens.length-count))/count;
 const memo=new Map<string,{cost:number;rows:number[][]}>();
 const solve=(first:number,remaining:number):{cost:number;rows:number[][]}=>{
  if(remaining===0)return first===tokens.length?{cost:0,rows:[]}:{cost:Infinity,rows:[]};
  const key=`${first}:${remaining}`,cached=memo.get(key);if(cached)return cached;
  let best={cost:Infinity,rows:[] as number[][]},length=0;
  for(let last=first;last<tokens.length;last++){
   length+=widths[last]!+(last>first?gap:0);if(length>width)break;
   const tail=solve(last+1,remaining-1);if(!Number.isFinite(tail.cost))continue;
   const lone=last===first?width*width*.9:0;
   const stranded=/^(the|a|an|to|of|in|for|with|and|as|my|your|по|на|в|во|и|от|за)$/iu.test(tokens[last]!.text)?width*width*.15:0;
   const phraseEnd=/[,;!?…]$/u.test(shown(tokens[last]!))?-width*width*.025:0;
   const cost=tail.cost+(length-ideal)**2+lone+stranded+phraseEnd;
   if(cost<best.cost)best={cost,rows:[Array.from({length:last-first+1},(_,i)=>first+i),...tail.rows]};
  }
  memo.set(key,best);return best;
 };
 return solve(0,count).rows;
}
export function cueLayout(ctx:Context,c:Cue,format:Format):Layout{
 const key=`${c.id}:${format}`,cached=layouts.get(key);if(cached)return cached;
 const portrait=format==='portrait',d=dimensions(format),maxWidth=portrait?908:1476;
 let size=portrait?72:64,src:number[][]=[],eng:number[][]=[];
 for(;size>=54;size--){ctx.font=font(size);src=wrap(ctx,c.words,maxWidth);eng=wrap(ctx,c.targets,maxWidth);if(src.length+eng.length<=(portrait?5:4))break}
 const leading=size*1.12,gap=size*.46,total=(src.length+eng.length)*leading+gap;
 const center=portrait?694:280,top=center-total/2,bottom=top+total;
 const slots=(tokens:{text:string;punctuationAfter?:string}[],rows:number[][],first:number):Slot[]=>rows.flatMap((row,r)=>{
  const gap=ctx.measureText(' ').width,widths=row.map(i=>ctx.measureText(shown(tokens[i]!)).width);
  let x=(d.width-widths.reduce((a,b)=>a+b,0)-gap*(row.length-1))/2;
  return row.map((i,n)=>{const slot={index:i,text:shown(tokens[i]!),x,y:first+r*leading,width:widths[n]!};x+=widths[n]!+gap;return slot});
 });
 const result={size,source:slots(c.words,src,top+size),target:slots(c.targets,eng,top+src.length*leading+gap+size),top,bottom};
 layouts.set(key,result);return result;
}

function background(format:Format):CanvasImageSource|undefined{
 const prior=backgrounds.get(format);if(prior)return prior;if(!factory||!reference)return undefined;
 const d=dimensions(format),surface=factory(d.width,d.height),ctx=surface.context;
 // Extend source edge colors without duplicating the hand, ring, or guitar.
 // This is a soft continuation of the painting, not a crop of its focal subject.
 const probe=factory(1080,1080);probe.context.drawImage(reference,0,0);const pixels=probe.context.getImageData(0,0,1080,1080).data;
 const sample=(x:number,y:number,rx:number,ry:number)=>{
  const color=[0,0,0];let n=0;
  for(let b=Math.max(0,y-ry);b<Math.min(1080,y+ry);b+=5)for(let a=Math.max(0,x-rx);a<Math.min(1080,x+rx);a+=5){const i=(b*1080+a)*4;for(let c=0;c<3;c++)color[c]=color[c]!+pixels[i+c]!;n++;}
  return `rgb(${color.map(v=>Math.round(v/n)).join(',')})`;
 };
 // Average broad source patches before extending them. Directly stretching
 // thin edge strips turns painted beads/strings into distracting scan lines.
 if(format==='landscape'){
  for(const [sourceX,destX] of [[60,0],[1020,1480]] as const){
   const grad=ctx.createLinearGradient(0,0,0,1080);
   for(let i=0;i<=12;i++)grad.addColorStop(i/12,sample(sourceX,Math.round(i/12*1079),60,96));
   ctx.fillStyle=grad;ctx.fillRect(destX,0,440,1080);
  }
 }else{
  for(const [sourceY,destY] of [[55,0],[1025,1480]] as const){
   const grad=ctx.createLinearGradient(0,0,1080,0);
   for(let i=0;i<=8;i++)grad.addColorStop(i/8,sample(Math.round(i/8*1079),sourceY,150,55));
   ctx.fillStyle=grad;ctx.fillRect(0,destY,1080,440);
  }
 }
 const wash=ctx.createLinearGradient(0,0,0,d.height);wash.addColorStop(0,'rgba(7,16,28,.38)');wash.addColorStop(.48,'rgba(7,16,28,.12)');wash.addColorStop(1,'rgba(7,16,28,.24)');ctx.fillStyle=wash;ctx.fillRect(0,0,d.width,d.height);
 backgrounds.set(format,surface.canvas);return surface.canvas;
}
function paintPicture(ctx:Context,source:CanvasImageSource,format:Format):void{
 const d=dimensions(format);ctx.fillStyle='#525b68';ctx.fillRect(0,0,d.width,d.height);
 const ambient=background(format);if(ambient)ctx.drawImage(ambient,0,0);
 ctx.drawImage(source,d.x,d.y,1080,1080);
 // Stable, feathered exposure for reading. No cue-shaped panel or black gutter.
 const shade=ctx.createLinearGradient(0,d.y+30,0,d.y+554);
 shade.addColorStop(0,'rgba(7,16,28,.10)');shade.addColorStop(.25,'rgba(7,16,28,.58)');shade.addColorStop(.72,'rgba(7,16,28,.53)');shade.addColorStop(1,'rgba(7,16,28,0)');
 ctx.fillStyle=shade;ctx.fillRect(0,d.y+30,d.width,524);
}
export function stringResponseAt(t:number):number[]{
 const f=clamp(t*features.analysis.frameRate.numerator/features.analysis.frameRate.denominator,0,response.length-1),i=Math.floor(f),u=f-i;
 return response[i]!.map((v,b)=>v+((response[Math.min(response.length-1,i+1)]![b]??v)-v)*u);
}
function polygon(ctx:Context,points:Point[]):void{points.forEach((p,i)=>i?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y));ctx.closePath()}
export function stringPoint(s:StringAnchor,u:number,t:number,strength:number):Point{
 const envelope=Math.sin(Math.PI*u);
 const oscillation=Math.sin(u*Math.PI*6-t*(10.6+s.index*.61))*.76+Math.sin(u*Math.PI*10+t*(7.4+s.index*.37))*.24;
 return {x:s.start.x+(s.end.x-s.start.x)*u,y:s.start.y+(s.end.y-s.start.y)*u+envelope*oscillation*(.30+strength*8.1)};
}
function paintStrings(ctx:Context,t:number,levels:number[]):void{
 ctx.save();ctx.beginPath();ctx.rect(0,0,1080,1080);polygon(ctx,plan.handOcclusion);ctx.clip('evenodd');
 // The original chalk strings stay underneath. Thin, textured companion strokes
 // read as their vibration. No independent spectrum rail is introduced.
 for(const s of plan.strings){
  const level=levels[s.index]!,opacity=.09+level*.52;
  ctx.lineCap='round';ctx.lineJoin='round';
  ctx.beginPath();for(let n=0;n<=108;n++){const p=stringPoint(s,n/108,t,level);n?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y)}
  ctx.strokeStyle=`rgba(229,205,166,${opacity*.19})`;ctx.lineWidth=8+level*4;ctx.stroke();
  for(let n=0;n<72;n++){
   const u=n/72,v=(n+.91)/72,a=stringPoint(s,u,t,level),b=stringPoint(s,v,t,level);
   ctx.strokeStyle=`rgba(241,225,197,${opacity*(.70+.30*((n*19+s.index*7)%13)/12)})`;ctx.lineWidth=s.width*(.36+.25*((n*11+s.index*3)%9)/8);
   ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.stroke();
  }
 }
 ctx.restore();
}
function paintVeil(ctx:Context,t:number,level:number):void{
 for(const p of plan.veilBeads){
  const shimmer=.5+.5*Math.sin(t*.71+p.phase),r=p.radius*(1.9+level*.24);
  const gradient=ctx.createRadialGradient(p.x,p.y,0,p.x,p.y,r);
  gradient.addColorStop(0,`rgba(242,239,226,${.10+shimmer*.14+level*.025})`);gradient.addColorStop(1,'rgba(242,239,226,0)');
  ctx.fillStyle=gradient;ctx.beginPath();ctx.arc(p.x,p.y,r,0,Math.PI*2);ctx.fill();
 }
}
function paintRing(ctx:Context,t:number,level:number,c:Cue|undefined):void{
 const ring=plan.ring;
 const semantic=c?.words.some(w=>sourceActive(w,t,timeline.sampleRate)&&/^(колечко|обручальное)$/iu.test(w.text))?1:0;
 const drift=(Math.sin(t*.51)+1)/2,shine=.055+level*.055+semantic*.13;
 ctx.save();ctx.translate(ring.center.x,ring.center.y);ctx.rotate(ring.angle);ctx.beginPath();ctx.ellipse(0,0,ring.rx,ring.ry,0,0,Math.PI*2);ctx.clip();
 const x=-ring.rx+2*ring.rx*drift,glint=ctx.createLinearGradient(x-15,-12,x+15,12);
 glint.addColorStop(0,'rgba(245,217,160,0)');glint.addColorStop(.43,`rgba(245,217,160,${shine})`);glint.addColorStop(.53,`rgba(255,244,214,${shine*1.6})`);glint.addColorStop(1,'rgba(245,217,160,0)');
 ctx.fillStyle=glint;ctx.fillRect(-ring.rx,-ring.ry,ring.rx*2,ring.ry*2);ctx.restore();
}
function paintWords(ctx:Context,c:Cue,layout:Layout,t:number):void{
 ctx.save();ctx.font=font(layout.size);ctx.textBaseline='alphabetic';ctx.textAlign='left';ctx.globalAlpha=cueOpacity(c,t);
 for(const [slots,source] of [[layout.source,true],[layout.target,false]] as const)for(const slot of slots){
  const active=source?sourceActive(c.words[slot.index]!,t,timeline.sampleRate):targetActive(c.targets[slot.index]!,c.words,t,timeline.sampleRate);
  // Each glyph owns its shadow. A previous active word cannot contaminate a
  // following neutral word, and both languages use identical focus treatment.
  ctx.save();ctx.fillStyle=active?PALETTE.focus:PALETTE.rest;ctx.shadowColor=PALETTE.shadow;ctx.shadowBlur=3.8;ctx.shadowOffsetY=1.4;ctx.fillText(slot.text,slot.x,slot.y);ctx.restore();
 }
 ctx.restore();
}
function openingTitle(ctx:Context,t:number,format:Format):void{
 const opacity=smooth(.5,2,t)*(1-smooth(7.2,9.4,t));if(opacity<=0)return;
 const d=dimensions(format),y=format==='portrait'?688:281;
 ctx.save();ctx.globalAlpha=opacity;ctx.textAlign='center';ctx.fillStyle=PALETTE.rest;ctx.font=font(format==='portrait'?82:88);ctx.shadowColor=PALETTE.shadow;ctx.shadowBlur=5;ctx.fillText('Труп невесты',d.width/2,y);
 ctx.font=font(format==='portrait'?36:32);ctx.fillStyle='#d3c3a7';ctx.fillText('Green Apelsin',d.width/2,y+59);ctx.restore();
}
export function paintScene(ctx:Context,t:number,format:Format,source:CanvasImageSource):void{
 const d=dimensions(format);ctx.save();ctx.globalAlpha=1;ctx.globalCompositeOperation='source-over';ctx.setTransform(1,0,0,1,0,0);ctx.clearRect(0,0,d.width,d.height);
 paintPicture(ctx,source,format);
 const cue=visibleCue(timeline,t),levels=stringResponseAt(t),mean=levels.reduce((a,b)=>a+b,0)/6;
 if(effectsEnabled){ctx.save();ctx.translate(d.x,d.y);paintStrings(ctx,t,levels);paintVeil(ctx,t,mean);paintRing(ctx,t,mean,cue);ctx.restore();}
 if(cue)paintWords(ctx,cue,cueLayout(ctx,cue,format),t);else openingTitle(ctx,t,format);
 ctx.restore();
}
