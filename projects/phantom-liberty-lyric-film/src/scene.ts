import {validateTimeline,visibleCue,visibleCues,vocalTrack,tokenActive,type Timeline,type FeatureData,type Cue,type Token,type Format} from './model.ts';
export type {Format} from './model.ts';
type Context=CanvasRenderingContext2D;
type Slot={token:Token;x:number;y:number;width:number};
export type CueLayout={size:number;top:number;bottom:number;slots:Slot[]};
export const COMPOSITION={landscape:{width:1920,height:816,readingWidth:1660,leadBaseline:585,backingBaseline:690,spectrumX:300,spectrumWidth:1320,spectrumBaseline:780,travel:62},portrait:{width:1080,height:1920,readingWidth:870,leadBaseline:1080,backingBaseline:1300,spectrumX:125,spectrumWidth:830,spectrumBaseline:1570,travel:112}} as const;
export const PALETTE={rest:'#bc98a9',focus:'#fff0dc',core:'#ffb9ce',signal:'#d71957',shadow:'#13060e'} as const;
let timeline:Timeline|undefined,features:FeatureData|undefined;
const layouts=new Map<string,CueLayout>();
const clamp=(v:number):number=>Math.max(0,Math.min(1,v));
const smooth=(a:number,b:number,v:number):number=>{if(b<=a)return v>=b?1:0;const u=clamp((v-a)/(b-a));return u*u*(3-2*u);};
function requireTimeline():Timeline{if(!timeline)throw Error('Lyric scene has not loaded');return timeline;}
export function initScene(next:Timeline,measured:FeatureData):void{
 validateTimeline(next);
 if(measured.sourceSha256!==next.sourceSha256||measured.analysis.frameRate.numerator!==30000||measured.analysis.frameRate.denominator!==1001||!Array.isArray(measured.rows)||measured.rows.length!==measured.analysis.frameCount||measured.rows.some(r=>r.length!==26||r.some(v=>!Number.isInteger(v)||v<0||v>255)))throw Error('Measured audio identity or feature data is invalid');
 timeline=next;features=measured;layouts.clear();
}
export async function loadScene():Promise<void>{
 const read=async(path:string):Promise<unknown>=>{const r=await fetch(path);if(!r.ok)throw Error(`Missing complete preview input: ${path}`);return r.json();};
 const [rawTimeline,rawFeatures]=await Promise.all([read('/public/timeline.json'),read('/public/audio-features.json')]);
 // The validators above check the runtime identities, events and every row.
 initScene(rawTimeline as Timeline,rawFeatures as FeatureData);
 const font=new FontFace('PhantomGrotesk','url(/public/fonts/SpaceGrotesk.ttf)',{weight:'300 700'});
 document.fonts.add(await font.load());await document.fonts.ready;
}
export function getLines():Cue[]{return requireTimeline().cues;}
export function getReadingCue(time:number):Cue|undefined{return visibleCue(requireTimeline(),time);}
export function getReadingCues(time:number):Cue[]{return visibleCues(requireTimeline(),time);}
export function getSceneIdentity():{revision:string;sourceSha256:string;sampleRate:number}{const t=requireTimeline();return{revision:t.revision,sourceSha256:t.sourceSha256,sampleRate:t.sampleRate};}
export function cueOpacity(c:Cue,time:number):number{
 if(time<c.visibleStart||time>=c.visibleEnd)return 0;
 if(time>=c.start&&time<c.end)return 1;
 return smooth(c.visibleStart,c.start-.015,time)*(1-smooth(c.fullOpacityEnd,c.visibleEnd,time));
}
function setFont(ctx:Context,size:number):void{ctx.font=`600 ${size}px PhantomGrotesk`;}
export function layoutCue(ctx:Context,cue:Cue,format:Format):CueLayout{
 const key=`${cue.id}/${format}`,cached=layouts.get(key);if(cached)return cached;
 const p=COMPOSITION[format],backing=vocalTrack(cue)==='backing',portrait=format==='portrait';
 let size=portrait?(backing?61:77):(backing?57:76);let rows:number[][]=[];
 const lane=cue.lanes[0];if(!lane)throw Error(`Missing English reader lane ${cue.id}`);
 for(;size>=(portrait?60:55);size--){
  setFont(ctx,size);const gap=ctx.measureText(' ').width;rows=[];let row:number[]=[],w=0;
  for(const [i,token] of lane.tokens.entries()){const tw=ctx.measureText(token.text).width;if(row.length&&w+gap+tw>p.readingWidth){rows.push(row);row=[];w=0;}w+=(row.length?gap:0)+tw;row.push(i);}
  if(row.length)rows.push(row);
  if(rows.length<=(backing?2:portrait?3:2))break;
 }
 if(size<(portrait?60:55))throw Error(`Reading block cannot fit ${cue.id}/${format}`);
 const baseline=backing?p.backingBaseline:p.leadBaseline;
 // Reserve two rows for the longer backing phrase, independently of lead state.
 const lineHeight=size*1.23,top=baseline-size-(rows.length-1)*lineHeight;
 const slots:Slot[]=[];setFont(ctx,size);const gap=ctx.measureText(' ').width;
 rows.forEach((row,r)=>{const widths=row.map(i=>ctx.measureText(lane.tokens[i]!.text).width);let x=(p.width-widths.reduce((a,b)=>a+b,0)-gap*(row.length-1))/2;
  row.forEach((i,k)=>{const token=lane.tokens[i];if(!token)throw Error('Missing layout token');const width=widths[k]??0;slots.push({token,x,y:baseline-(rows.length-1-r)*lineHeight,width});x+=width+gap;});
 });
 const layout={size,top,bottom:baseline+size*.22,slots};layouts.set(key,layout);return layout;
}
function featureAt(time:number):number[]{
 if(!features)throw Error('Audio measurements have not loaded');
 const f=time*features.analysis.frameRate.numerator/features.analysis.frameRate.denominator;
 const a=Math.max(0,Math.min(features.rows.length-1,Math.floor(f))),b=Math.min(features.rows.length-1,a+1),u=clamp(f-a);
 const first=features.rows[a],next=features.rows[b];if(!first||!next)throw Error('Missing measured audio row');
 return first.map((v,i)=>v+((next[i]??v)-v)*u);
}
function measuredBands(time:number):{level:number;bands:number[]}{
 const row=featureAt(time),older=featureAt(Math.max(0,time-.060));
 const toLevel=(v:number)=>clamp((-96+v*96/255+65)/49);
 return{level:toLevel(row[0]??0),bands:Array.from({length:24},(_,i)=>.72*toLevel(row[i+2]??0)+.28*toLevel(older[i+2]??0))};
}
function drawPicture(ctx:Context,source:CanvasImageSource,format:Format):void{
 const p=COMPOSITION[format];
 if(format==='landscape'){ctx.drawImage(source,0,132,1920,816,0,0,1920,816);return;}
 // A full-height crop cuts faces and opposing characters. The complete sharp
 // edit is retained; an unreadable, dim live extension supplies atmosphere.
 ctx.fillStyle=PALETTE.shadow;ctx.fillRect(0,0,p.width,p.height);
 const sourceWidth=816*p.width/p.height;
 ctx.save();ctx.filter='blur(38px)';ctx.globalAlpha=.30;
 ctx.drawImage(source,(1920-sourceWidth)/2,132,sourceWidth,816,-40,-40,p.width+80,p.height+80);ctx.restore();
 const veil=ctx.createLinearGradient(0,0,0,p.height);veil.addColorStop(0,'rgba(19,6,14,.14)');veil.addColorStop(.45,'rgba(19,6,14,.20)');veil.addColorStop(1,'rgba(19,6,14,.46)');ctx.fillStyle=veil;ctx.fillRect(0,0,p.width,p.height);
 ctx.drawImage(source,0,132,1920,816,0,280,1080,459);
}
function drawSignal(ctx:Context,time:number,format:Format):void{
 const p=COMPOSITION[format],audio=measuredBands(time),envelope=smooth(.4,2,time)*(1-smooth(337,346,time));if(envelope<=0)return;
 const count=78,step=p.spectrumWidth/count;
 ctx.save();ctx.globalAlpha=envelope;ctx.globalCompositeOperation='screen';
 const rail=ctx.createLinearGradient(p.spectrumX,0,p.spectrumX+p.spectrumWidth,0);
 rail.addColorStop(0,'rgba(215,25,87,0)');rail.addColorStop(.15,'rgba(215,25,87,.25)');rail.addColorStop(.85,'rgba(215,25,87,.25)');rail.addColorStop(1,'rgba(215,25,87,0)');
 ctx.strokeStyle=rail;ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(p.spectrumX,p.spectrumBaseline);ctx.lineTo(p.spectrumX+p.spectrumWidth,p.spectrumBaseline);ctx.stroke();
 for(let i=0;i<count;i++){
  const pos=i*23/(count-1),a=Math.floor(pos),b=Math.min(23,a+1),u=pos-a;
  const v=(audio.bands[a]??0)+((audio.bands[b]??0)-(audio.bands[a]??0))*u;
  const edge=Math.pow(Math.sin(Math.PI*(i+.5)/count),.35);
  const height=2+p.travel*Math.pow(v,1.8)*(.28+.72*audio.level)*edge;
  const x=p.spectrumX+(i+.5)*step,y=p.spectrumBaseline-height;
  // Crimson diffusion, a pale illuminated filament, then a bounded light tail.
  ctx.strokeStyle=`rgba(215,25,87,${.12+.35*v})`;ctx.lineWidth=format==='portrait'?7:5;ctx.shadowColor=PALETTE.signal;ctx.shadowBlur=format==='portrait'?17:11;
  ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x,p.spectrumBaseline);ctx.stroke();
  ctx.shadowBlur=0;ctx.lineWidth=1.8;ctx.strokeStyle=`rgba(255,185,206,${.32+.56*v})`;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x,p.spectrumBaseline);ctx.stroke();
  const tail=ctx.createLinearGradient(0,p.spectrumBaseline,0,p.spectrumBaseline+15);tail.addColorStop(0,`rgba(215,25,87,${v*.24})`);tail.addColorStop(1,'rgba(215,25,87,0)');ctx.strokeStyle=tail;ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(x,p.spectrumBaseline);ctx.lineTo(x,p.spectrumBaseline+15);ctx.stroke();
 }ctx.restore();
}
function drawCue(ctx:Context,cue:Cue,time:number,format:Format):void{
 const layout=layoutCue(ctx,cue,format),t=requireTimeline();
 ctx.save();ctx.globalAlpha=cueOpacity(cue,time);ctx.textAlign='left';ctx.textBaseline='alphabetic';ctx.lineJoin='round';setFont(ctx,layout.size);
 for(const slot of layout.slots){const active=tokenActive(slot.token,cue.words,time,t.sampleRate);
  ctx.shadowOffsetY=1;ctx.shadowColor=active?'rgba(231,30,90,.68)':'rgba(10,2,8,.96)';ctx.shadowBlur=active?layout.size*.16:layout.size*.09;
  ctx.strokeStyle='rgba(16,4,12,.88)';ctx.lineWidth=layout.size*.045;ctx.strokeText(slot.token.text,slot.x,slot.y);
  ctx.fillStyle=active?PALETTE.focus:PALETTE.rest;ctx.fillText(slot.token.text,slot.x,slot.y);
 }ctx.restore();
}
export function paintScene(ctx:Context,time:number,format:Format,source:CanvasImageSource):void{
 const p=COMPOSITION[format];ctx.clearRect(0,0,p.width,p.height);drawPicture(ctx,source,format);
 const shade=ctx.createLinearGradient(0,format==='portrait'?800:440,0,p.height);
 shade.addColorStop(0,'rgba(14,3,10,0)');shade.addColorStop(.6,'rgba(14,3,10,.30)');shade.addColorStop(1,'rgba(14,3,10,.48)');ctx.fillStyle=shade;ctx.fillRect(0,0,p.width,p.height);
 drawSignal(ctx,time,format);
 for(const cue of getReadingCues(time))drawCue(ctx,cue,time,format);
 // Quiet introduction uses a small source-matched title, cleared before singing.
 const first=getLines().find(c=>vocalTrack(c)==='lead');
 const introOpacity=smooth(.5,2,time)*(1-smooth(Math.max(2,(first?.visibleStart??8)-1.3),first?.visibleStart??8,time));
 if(introOpacity>0){ctx.save();ctx.globalAlpha=introOpacity*.85;ctx.fillStyle=PALETTE.rest;ctx.font=`500 ${format==='portrait'?31:32}px PhantomGrotesk`;ctx.textAlign='center';ctx.fillText('PHANTOM LIBERTY',p.width/2,format==='portrait'?1305:585);ctx.restore();}
}
