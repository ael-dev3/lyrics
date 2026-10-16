import {PALETTE,sourceActive,targetActive,visibleCue,visibleCues,validateTimeline,parseTimeline,parseFeatures,
 type Timeline,type FeatureData,type Cue,type Format} from './model.ts';
export type {Format} from './model.ts';
type Context=CanvasRenderingContext2D;
export interface Surface {canvas:CanvasImageSource;context:Context}
export interface Slot {index:number;text:string;x:number;y:number;width:number}
export interface Layout {size:number;source:Slot[];target:Slot[];top:number;bottom:number;duet:boolean}
export interface SpectrumBar {band:number;x:number;y:number;width:number;height:number;level:number}

// Each output is one uniformly scaled view of the original frame. There is
// no reflected, repeated, blurred or synthesized background extension.
export const SOURCE_VIEWS={
 landscape:[0,194,1080,607.5],
 portrait:[168,0,607.5,1080],
} as const;
export const FIGURE_GUARD=[215,230,335,558] as const;
// A supporting graphic in a reserved reading margin. It does not pretend to
// be photographed wood; each of the 24 bars has one measured frequency band.
export const SPECTRUM={
 landscape:{center:1465,width:640,baseline:1030,maxHeight:46,barWidth:8},
 portrait:{center:540,width:720,baseline:1882,maxHeight:42,barWidth:10},
} as const;
export const SPECTRUM_TONE=PALETTE.spectrum;
export const COMPOSITION={
 landscape:{width:1920,height:1080,source:[0,0,1920,1080],reading:[1070,100,790,870]},
 portrait:{width:1080,height:1920,source:[0,0,1080,1920],reading:[64,1450,952,410]},
};
export function screenFigureGuard(format:Format){
 const v=SOURCE_VIEWS[format],scale=COMPOSITION[format].width/v[2];
 return {left:(FIGURE_GUARD[0]-v[0])*scale,top:(FIGURE_GUARD[1]-v[1])*scale,
  right:(FIGURE_GUARD[0]+FIGURE_GUARD[2]-v[0])*scale,bottom:(FIGURE_GUARD[1]+FIGURE_GUARD[3]-v[1])*scale};
}
let timeline:Timeline,features:FeatureData;
let identity:{revision:string;sourceSha256:string;timelineSha256?:string;sceneSha256?:string}|undefined;
let effectsEnabled=true,responses:number[][]=[],gates:number[]=[];
const layouts=new Map<string,Layout>();
const clamp=(v:number,a=0,b=1)=>Math.max(a,Math.min(b,v));
const smooth=(a:number,b:number,t:number)=>{const u=clamp((t-a)/(b-a));return u*u*(3-2*u)};
const font=(n:number)=>'500 '+n+'px Literata';
const shown=(w:{text:string;punctuationAfter?:string})=>w.text+(w.punctuationAfter??'');

function prepareResponse():void{
 const hz=features.analysis.frameRate.numerator/features.analysis.frameRate.denominator;
 const prior=Array(24).fill(0) as number[];let gatePrior=0;
 responses=[];gates=[];
 for(const row of features.rows){
  const rms=-96+row[0]!*96/255,gate=smooth(-65,-35,rms);
  const raw=Array.from({length:24},(_,band)=>{
   const db=-96+row[band+2]!*96/255;
   return Math.pow(clamp((db+70)/52),1.4)*gate;
  });
  // A fixed dB transform preserves differences between quiet and loud music.
  // Five neighboring bands soften isolated spikes without repeating or
  // mirroring the spectrum. Attack/release are artistic display envelopes.
  const spatial=raw.map((_,i)=>{
   let sum=0,weight=0;
   for(let j=-2;j<=2;j++){const w=3-Math.abs(j);sum+=raw[clamp(i+j,0,23)]!*w;weight+=w}
   return sum/weight;
  });
  responses.push(spatial.map((value,i)=>{
   const seconds=value>prior[i]!?.050:.240;
   prior[i]=prior[i]!+(value-prior[i]!)*(1-Math.exp(-1/(hz*seconds)));
   return prior[i]!;
  }));
  gatePrior=Math.max(gate,gatePrior*Math.exp(-1/(hz*.180)));gates.push(gatePrior);
 }
}
export function spectrumGeometry(t:number,format:Format):{bars:SpectrumBar[];opacity:number}{
 const p=clamp(t*features.analysis.frameRate.numerator/features.analysis.frameRate.denominator,0,responses.length-1);
 const i=Math.floor(p),u=p-i,j=Math.min(i+1,responses.length-1),spec=SPECTRUM[format];
 const gate=gates[i]!*(1-u)+gates[j]!*u;
 const ending=smooth(0,.40,t)*(1-smooth(timeline.sourceDuration-1.8,timeline.sourceDuration-.08,t));
 const step=spec.width/24,left=spec.center-spec.width/2;
 const bars=responses[i]!.map((a,band)=>{
  const level=a*(1-u)+responses[j]![band]!*u,height=2+(spec.maxHeight-2)*level;
  return {band,x:left+step*(band+.5)-spec.barWidth/2,y:spec.baseline-height,width:spec.barWidth,height,level};
 });
 return {bars,opacity:.76*gate*ending};
}
function spectrum(ctx:Context,t:number,format:Format):void{
 if(!effectsEnabled)return;
 const {bars,opacity}=spectrumGeometry(t,format);if(opacity<.002)return;
 ctx.save();ctx.globalAlpha=opacity;ctx.fillStyle=SPECTRUM_TONE;
 // A tiny dark edge separates the ivory cores from dense photographic detail.
 // This is local contrast, not an emitted light or a new background panel.
 ctx.shadowColor='rgba(4,5,4,.72)';ctx.shadowBlur=1.4;ctx.shadowOffsetY=1;
 for(const bar of bars)ctx.fillRect(bar.x,bar.y,bar.width,bar.height);
 ctx.restore();
}
function readingShade(ctx:Context,format:Format,t:number):void{
 if(!visibleCues(timeline,t).length)return;
 // Broad feathered photographic exposure, not a panel or opaque matte.
 const tall=format==='portrait',guard=screenFigureGuard(format);
 ctx.save();ctx.beginPath();ctx.rect(0,0,COMPOSITION[format].width,COMPOSITION[format].height);
 ctx.rect(guard.left,guard.top,guard.right-guard.left,guard.bottom-guard.top);ctx.clip('evenodd');
 if(tall){
  const bottom=ctx.createLinearGradient(0,1390,0,1920);bottom.addColorStop(0,'rgba(4,5,4,0)');bottom.addColorStop(.4,'rgba(4,5,4,.14)');bottom.addColorStop(1,'rgba(4,5,4,.18)');
  ctx.fillStyle=bottom;ctx.fillRect(0,1390,1080,530);
 }else{
  const right=ctx.createLinearGradient(990,0,1920,0);right.addColorStop(0,'rgba(4,5,4,0)');right.addColorStop(.5,'rgba(4,5,4,.12)');right.addColorStop(1,'rgba(4,5,4,.16)');
  ctx.fillStyle=right;ctx.fillRect(990,0,930,1080);
 }
 ctx.restore();
}
export function initializeScene(t:Timeline,f:FeatureData,_factory:(w:number,h:number)=>Surface,_reference:CanvasImageSource,previewIdentity?:typeof identity):void{
 validateTimeline(t);if(t.sourceSha256!==f.sourceSha256)throw Error('Music/timing source mismatch');
 timeline=t;features=f;identity=previewIdentity;layouts.clear();prepareResponse();
}
export async function loadScene():Promise<void>{
 const json=async(path:string)=>{const r=await fetch(path,{cache:'no-store'});if(!r.ok)throw Error('Missing preview asset '+path);return r.json() as Promise<unknown>};
 const [t,f,i]=await Promise.all([json('/public/timeline.json'),json('/public/audio-features.json'),json('/public/preview-identity.json')]);
 const face=new FontFace('Literata',"url('/public/fonts/Literata.ttf')",{weight:'500'});await face.load();document.fonts.add(face);await document.fonts.ready;
 const picture=new Image();picture.src='/public/artwork-reference.png';await picture.decode();
 if(typeof i!=='object'||i===null||!['revision','sourceSha256','timelineSha256','sceneSha256'].every(k=>typeof(i as Record<string,unknown>)[k]==='string'))throw Error('Invalid loaded identity');
 const bound=i as NonNullable<typeof identity>,parsed=parseTimeline(t);if(bound.revision!==parsed.revision||bound.sourceSha256!==parsed.sourceSha256)throw Error('Stale source/timing identity');
 initializeScene(parsed,parseFeatures(f),(w,h)=>{const canvas=document.createElement('canvas');canvas.width=w;canvas.height=h;const context=canvas.getContext('2d');if(!context)throw Error('Canvas surface unavailable');return {canvas,context}},picture,bound);
}
export function setEffectsEnabled(v:boolean):void{effectsEnabled=v}
export function getEffectsEnabled():boolean{return effectsEnabled}
export function getLines(){return timeline.cues.map(c=>({id:c.id,label:c.sourceText,start:c.start,end:c.end}))}
export function getReadingCue(t:number){return visibleCue(timeline,t)}
export function getReadingCues(t:number){return visibleCues(timeline,t)}
export function getSceneIdentity(){return {...identity,revision:timeline.revision,sourceSha256:timeline.sourceSha256,sampleRate:timeline.sampleRate}}
export function cueOpacity(c:Cue,t:number):number{
 if(t<c.visibleStart||t>=c.visibleEnd)return 0;
 const entrance=t>=c.start?1:smooth(c.visibleStart,c.start,t);
 return entrance*(c.exitMode==='vocal-handoff'?1:1-smooth(c.fullOpacityEnd,c.visibleEnd,t));
}
function wrap(ctx:Context,tokens:{text:string;punctuationAfter?:string}[],size:number,width:number){
 ctx.font=font(size);const space=ctx.measureText(' ').width,items=tokens.map((w,index)=>({index,text:shown(w),width:ctx.measureText(shown(w)).width}));
 const costs=Array(items.length+1).fill(Infinity) as number[],next=Array(items.length).fill(0) as number[];costs[items.length]=0;
 for(let i=items.length-1;i>=0;i--){
  let used=0;
  for(let j=i;j<items.length;j++){
   used+=items[j]!.width+(j===i?0:space);if(used>width&&j>i)break;
   const last=j===items.length-1,ragged=(width-used)**2*(last ? .28 : 1),runt=(j===i&&items.length>3)?width*width*.42:0;
   const punctuation=/[,;:….!?]$/.test(items[j]!.text)?-.06*width*width:0,cost=ragged+runt+punctuation+costs[j+1]!;
   if(cost<costs[i]!){costs[i]=cost;next[i]=j+1}
  }
 }
 const rows:typeof items[]=[];for(let i=0;i<items.length;){const j=Math.max(i+1,next[i]!);rows.push(items.slice(i,j));i=j}return rows;
}

export function layoutCue(ctx:Context,c:Cue,format:Format,_time=c.start):Layout{
 const duet=c.lane==='backing'||timeline.cues.some(b=>b.lane==='backing'&&b.visibleStart<c.visibleEnd&&b.visibleEnd>c.visibleStart);
 const key=format+':'+c.id,prior=layouts.get(key);if(prior)return prior;
 const tall=format==='portrait',center=tall?540:1465,width=tall?940:790;
 const regionTop=duet?(tall?(c.lane==='backing'?42:1450):(c.lane==='backing'?60:548)):(tall?1450:100);
 const regionHeight=duet?(tall?(c.lane==='backing'?325:410):420):(tall?410:870);
 let size=duet?(tall?52:52):(tall?58:66);
 let a=wrap(ctx,c.words,size,width),b=wrap(ctx,c.targets,size,width);
 const minimum=duet?34:38;
 while(((a.length+b.length)*size*1.20+size*.62>regionHeight||a.length>5||b.length>5)&&size>minimum){size--;a=wrap(ctx,c.words,size,width);b=wrap(ctx,c.targets,size,width)}
 const step=size*1.20,gap=size*.62,total=(a.length+b.length)*step+gap,top=regionTop+(regionHeight-total)/2;
 if(total>regionHeight+1)throw Error('Lyric block overflow: '+c.id+'/'+format);
 ctx.font=font(size);const space=ctx.measureText(' ').width;
 const place=(rows:typeof a,offset:number)=>rows.flatMap((line,row)=>{
  const length=line.reduce((n,w)=>n+w.width,0)+space*(line.length-1);let x=center-length/2;
  return line.map(w=>{const slot={...w,x,y:top+offset+row*step+size};x+=w.width+space;return slot});
 });
 const value={size,source:place(a,0),target:place(b,a.length*step+gap),top,bottom:top+total,duet};layouts.set(key,value);return value;
}
function lyrics(ctx:Context,c:Cue,t:number,format:Format):void{
 const opacity=cueOpacity(c,t);if(opacity<=0)return;const l=layoutCue(ctx,c,format,t);
 ctx.save();ctx.globalAlpha=opacity;ctx.font=font(l.size);ctx.textBaseline='alphabetic';ctx.textAlign='left';ctx.lineJoin='round';
 for(const [slots,original] of [[l.source,true],[l.target,false]] as const)for(const s of slots){
  const active=original?sourceActive(c.words[s.index]!,t):targetActive(c.targets[s.index]!,c.words,t);
  ctx.shadowColor='rgba(4,11,7,.96)';ctx.shadowBlur=3;ctx.shadowOffsetX=0;ctx.shadowOffsetY=2;
  ctx.lineWidth=Math.max(.9,l.size*.018);ctx.strokeStyle='rgba(4,11,7,.75)';ctx.strokeText(s.text,s.x,s.y);
  ctx.fillStyle=active?PALETTE.focus:PALETTE.rest;ctx.fillText(s.text,s.x,s.y);
 }
 ctx.restore();
}
export function paintScene(ctx:Context,t:number,format:Format,source:CanvasImageSource):void{
 const {width,height}=COMPOSITION[format],v=SOURCE_VIEWS[format];
 ctx.save();ctx.clearRect(0,0,width,height);
 // The only picture draw: one original frame, one crop, one uniform scale.
 ctx.drawImage(source,v[0],v[1],v[2],v[3],0,0,width,height);
 readingShade(ctx,format,t);spectrum(ctx,t,format);
 for(const c of visibleCues(timeline,t))lyrics(ctx,c,t,format);
 ctx.restore();
}
