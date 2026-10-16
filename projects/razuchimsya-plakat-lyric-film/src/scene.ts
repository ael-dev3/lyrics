import {PALETTE,sourceActive,targetActive,visibleCue,visibleCues,validateTimeline,parseTimeline,parseFeatures,type Timeline,type FeatureData,type Cue,type Format} from './model.ts';
export type {Format} from './model.ts';
type Context=CanvasRenderingContext2D;
export interface Surface {canvas:CanvasImageSource;context:Context}
export interface Slot {index:number;text:string;x:number;y:number;width:number}
export interface Layout {size:number;source:Slot[];target:Slot[];top:number;bottom:number;duet:boolean}

// A single uniform crop of the actual photograph in each composition.
// No image extension, duplication, camera shake or generated replacement.
export const SOURCE_VIEWS={landscape:[0,300,1080,607.5],portrait:[106,0,607.5,1080]} as const;
export const FIGURE_GUARD=[128,548,554,303] as const;
export const COMPOSITION={
 landscape:{width:1920,height:1080,reading:[190,26,1540,338]},
 portrait:{width:1080,height:1920,reading:[124,246,832,550]},
} as const;
export const MUSIC_LINE={
 landscape:{center:960,baseline:403,width:620,points:73,strokeWidth:3.4,maxDeviation:20},
 portrait:{center:540,baseline:880,width:650,points:73,strokeWidth:4.4,maxDeviation:26},
} as const;
const clamp=(x:number,a=0,b=1)=>Math.max(a,Math.min(b,x));
const smooth=(a:number,b:number,t:number)=>{const u=clamp((t-a)/(b-a));return u*u*(3-2*u)};
const font=(n:number)=>`600 ${n}px Cormorant`;
const shown=(w:{text:string;punctuationAfter?:string})=>w.text+(w.punctuationAfter??'');
let timeline:Timeline,features:FeatureData;
let identity:{revision:string;sourceSha256:string;timelineSha256?:string;sceneSha256?:string}|undefined;
let effectsEnabled=true,responses:number[][]=[];
const layouts=new Map<string,Layout>();
let lastVisualizer={enabled:true,points:0,kind:'continuous-line',opacity:0,peakDeviation:0};
const shades=new Map<Format,CanvasImageSource>();

export function screenFigureGuard(format:Format){
 const v=SOURCE_VIEWS[format],scale=COMPOSITION[format].width/v[2];
 return {left:(FIGURE_GUARD[0]-v[0])*scale,top:(FIGURE_GUARD[1]-v[1])*scale,right:(FIGURE_GUARD[0]+FIGURE_GUARD[2]-v[0])*scale,bottom:(FIGURE_GUARD[1]+FIGURE_GUARD[3]-v[1])*scale};
}
function prepareResponse(){
 const hz=features.analysis.frameRate.numerator/features.analysis.frameRate.denominator;
 const prior=Array(24).fill(0) as number[];responses=[];
 for(const row of features.rows){
  const rms=-96+row[0]!*96/255,gate=smooth(-62,-27,rms);
  const raw=Array.from({length:24},(_,i)=>Math.pow(clamp((-96+row[i+2]!*96/255+61)/41),1.25)*gate);
  const spatial=raw.map((value,i)=>(value*2+raw[Math.max(0,i-1)]!+raw[Math.min(23,i+1)]!)/4);
  responses.push(spatial.map((value,i)=>{
   const tau=value>prior[i]!?.060:.280;
   prior[i]=prior[i]!+(value-prior[i]!)*(1-Math.exp(-1/(hz*tau)));return prior[i]!;
  }));
 }
}
export function visualizerGeometry(t:number,format:Format='landscape'){
 const p=clamp(t*features.analysis.frameRate.numerator/features.analysis.frameRate.denominator,0,responses.length-1),i=Math.floor(p),u=p-i,j=Math.min(i+1,responses.length-1),spec=MUSIC_LINE[format];
 const ending=1-smooth(timeline.sourceDuration-1.4,timeline.sourceDuration-.06,t);
 const rms=-96+(features.rows[i]![0]!*(1-u)+features.rows[j]![0]!*u)*96/255;
 const opacity=.88*smooth(-62,-42,rms)*ending;
 const points=Array.from({length:spec.points},(_,index)=>{
  // One authored ribbon profile, modulated by 24 measured bands. This is
  // neither an oscilloscope waveform nor a pitch trace; no idle oscillation.
  const position=index/(spec.points-1),band=position*23,lo=Math.floor(band),hi=Math.min(23,lo+1),mix=band-lo;
  const at=(b:number)=>responses[i]![b]!*(1-u)+responses[j]![b]!*u;
  const level=at(lo)*(1-mix)+at(hi)*mix;
  const deviation=-Math.sin(position*Math.PI*4)*Math.pow(Math.sin(position*Math.PI),.75)*level*spec.maxDeviation;
  return {index,bandPosition:band,x:spec.center-spec.width/2+position*spec.width,y:spec.baseline+deviation,deviation,level};
 });
 return {points,opacity};
}
export function getVisualizerState(){return {...lastVisualizer}}
function musicLine(ctx:Context,t:number,format:Format){
 const geometry=visualizerGeometry(t,format);
 lastVisualizer={enabled:effectsEnabled,kind:'continuous-line',points:effectsEnabled?geometry.points.length:0,opacity:effectsEnabled?geometry.opacity:0,peakDeviation:effectsEnabled?Math.max(...geometry.points.map(p=>Math.abs(p.deviation))):0};
 if(!effectsEnabled||geometry.opacity<.002)return;
 ctx.save();ctx.globalAlpha=geometry.opacity;ctx.strokeStyle='#ded3b7';
 // A single smooth supporting line in reserved carpet space, with fixed
 // endpoints, no duplicate rail, filled area, broad bloom or ticking bars.
 ctx.shadowColor='rgba(5,15,9,.9)';ctx.shadowBlur=2;ctx.shadowOffsetY=1;
 ctx.lineWidth=MUSIC_LINE[format].strokeWidth;ctx.lineCap='round';ctx.lineJoin='round';
 const pts=geometry.points;ctx.beginPath();ctx.moveTo(pts[0]!.x,pts[0]!.y);
 for(let i=1;i<pts.length-1;i++){const a=pts[i]!,b=pts[i+1]!;ctx.quadraticCurveTo(a.x,a.y,(a.x+b.x)/2,(a.y+b.y)/2)}
 const last=pts.at(-1)!;ctx.lineTo(last.x,last.y);ctx.stroke();
 ctx.restore();
}
function prepareShades(factory:(w:number,h:number)=>Surface){
 for(const format of ['landscape','portrait'] as const){
 const p=COMPOSITION[format],tall=format==='portrait',surface=factory(p.width,p.height),ctx=surface.context;
 // Continuous feathered exposure across the carpet, independent of cue state.
 // It ends above the subject; the subject receives no fabricated light.
 const g=ctx.createRadialGradient(p.width/2,tall?490:222,tall?75:120,p.width/2,tall?490:222,tall?660:990);
 g.addColorStop(0,'rgba(7,20,14,.58)');g.addColorStop(.45,'rgba(7,20,14,.44)');g.addColorStop(1,'rgba(7,20,14,0)');
 ctx.fillStyle=g;ctx.fillRect(0,0,p.width,p.height);
 const edge=ctx.createLinearGradient(0,tall?770:355,0,tall?925:430);
 edge.addColorStop(0,'rgba(0,0,0,1)');edge.addColorStop(1,'rgba(0,0,0,0)');
 ctx.globalCompositeOperation='destination-in';ctx.fillStyle=edge;ctx.fillRect(0,0,p.width,p.height);
 shades.set(format,surface.canvas);
 }
}
export function initializeScene(t:Timeline,f:FeatureData,factory:(w:number,h:number)=>Surface,_reference:CanvasImageSource,previewIdentity?:typeof identity){
 validateTimeline(t);if(t.sourceSha256!==f.sourceSha256)throw Error('Recording/feature mismatch');
 timeline=t;features=f;identity=previewIdentity;layouts.clear();prepareResponse();prepareShades(factory);
}
export async function loadScene(){
 const json=async(path:string)=>{const r=await fetch(path,{cache:'no-store'});if(!r.ok)throw Error('Missing preview asset '+path);return r.json() as Promise<unknown>};
 const [t,f,i]=await Promise.all([json('/public/timeline.json'),json('/public/audio-features.json'),json('/public/preview-identity.json')]);
 const face=new FontFace('Cormorant',"url('/public/fonts/Cormorant.ttf')",{weight:'600'});await face.load();document.fonts.add(face);await document.fonts.ready;
 const picture=new Image();picture.src='/public/artwork-reference.png';await picture.decode();
 if(typeof i!=='object'||i===null||!['revision','sourceSha256','timelineSha256','sceneSha256'].every(k=>typeof(i as Record<string,unknown>)[k]==='string'))throw Error('Invalid loaded identity');
 const bound=i as NonNullable<typeof identity>,parsed=parseTimeline(t);if(bound.revision!==parsed.revision||bound.sourceSha256!==parsed.sourceSha256)throw Error('Stale source/timing identity');
 initializeScene(parsed,parseFeatures(f),(w,h)=>{const canvas=document.createElement('canvas');canvas.width=w;canvas.height=h;const context=canvas.getContext('2d');if(!context)throw Error('Canvas unavailable');return {canvas,context}},picture,bound);
}
export function setEffectsEnabled(v:boolean){effectsEnabled=v}
export function getEffectsEnabled(){return effectsEnabled}
export function getLines(){return timeline.cues.map(c=>({id:c.id,label:c.sourceText,start:c.start,end:c.end}))}
export function getReadingCue(t:number){return visibleCue(timeline,t)}
export function getReadingCues(t:number){return visibleCues(timeline,t)}
export function getSceneIdentity(){return {...identity,revision:timeline.revision,sourceSha256:timeline.sourceSha256,sampleRate:timeline.sampleRate}}
export function cueOpacity(c:Cue,t:number){
 if(t<c.visibleStart||t>=c.visibleEnd)return 0;
 return (t>=c.start?1:smooth(c.visibleStart,c.start,t))*(c.exitMode==='vocal-handoff'?1:1-smooth(c.fullOpacityEnd,c.visibleEnd,t));
}
function wrap(ctx:Context,tokens:{text:string;punctuationAfter?:string}[],size:number,width:number){
 ctx.font=font(size);const space=ctx.measureText(' ').width,items=tokens.map((w,index)=>({index,text:shown(w),width:ctx.measureText(shown(w)).width}));
 const costs=Array(items.length+1).fill(Infinity) as number[],next=Array(items.length).fill(0) as number[];costs[items.length]=0;
 for(let i=items.length-1;i>=0;i--){let used=0;for(let j=i;j<items.length;j++){
  used+=items[j]!.width+(j===i?0:space);if(used>width&&j>i)break;
  const last=j===items.length-1,ragged=(width-used)**2*(last?.3:1),runt=j===i&&items.length>3?width*width*.4:0;
  const cost=ragged+runt+costs[j+1]!;if(cost<costs[i]!){costs[i]=cost;next[i]=j+1}
 }}
 const rows:typeof items[]=[];for(let i=0;i<items.length;){const j=Math.max(i+1,next[i]!);rows.push(items.slice(i,j));i=j}return rows;
}
export function layoutCue(ctx:Context,c:Cue,format:Format):Layout{
 const key=format+':'+c.id,prior=layouts.get(key);if(prior)return prior;
 const p=COMPOSITION[format],r=p.reading;let size=format==='portrait'?64:64;
 const rowsFor=(tokens:{text:string;punctuationAfter?:string}[],breaks:number[])=>{
  const stops=[0,...breaks,tokens.length];
  return stops.slice(0,-1).flatMap((start,i)=>wrap(ctx,tokens.slice(start,stops[i+1]),size,r[2]).map(row=>row.map(w=>({...w,index:w.index+start}))));
 };
 let a=rowsFor(c.words,c.sourceBreaks),b=rowsFor(c.targets,c.targetBreaks);
 while(((a.length+b.length)*size*1.15+size*.45>r[3])&&size>48){size--;a=rowsFor(c.words,c.sourceBreaks);b=rowsFor(c.targets,c.targetBreaks)}
 const step=size*1.15,gap=size*.45,total=(a.length+b.length)*step+gap,top=r[1]+(r[3]-total)/2;
 if(total>r[3])throw Error('Reading block overflow '+c.id+'/'+format);
 ctx.font=font(size);const space=ctx.measureText(' ').width;
 const place=(rows:typeof a,offset:number)=>rows.flatMap((line,row)=>{
  const length=line.reduce((n,w)=>n+w.width,0)+space*(line.length-1);let x=p.width/2-length/2;
  return line.map(w=>{const result={...w,x,y:top+offset+row*step+size};x+=w.width+space;return result});
 });
 const result={size,source:place(a,0),target:place(b,a.length*step+gap),top,bottom:top+total,duet:false};layouts.set(key,result);return result;
}
function lyrics(ctx:Context,c:Cue,t:number,format:Format){
 const opacity=cueOpacity(c,t);if(opacity<=0)return;const l=layoutCue(ctx,c,format);
 ctx.save();ctx.globalAlpha=opacity;ctx.font=font(l.size);ctx.textBaseline='alphabetic';ctx.textAlign='left';ctx.lineJoin='round';
 for(const [slots,original] of [[l.source,true],[l.target,false]] as const)for(const s of slots){
  const active=original?sourceActive(c.words[s.index]!,t,48000):targetActive(c.targets[s.index]!,c.words,t,48000);
  ctx.shadowColor='rgba(3,12,7,.94)';ctx.shadowBlur=4;ctx.shadowOffsetX=0;ctx.shadowOffsetY=2;
  ctx.lineWidth=1.4;ctx.strokeStyle='rgba(3,12,7,.72)';ctx.strokeText(s.text,s.x,s.y);
  ctx.fillStyle=active?PALETTE.focus:PALETTE.rest;ctx.fillText(s.text,s.x,s.y);
 }
 ctx.restore();
}
export function paintScene(ctx:Context,t:number,format:Format,source:CanvasImageSource){
 const p=COMPOSITION[format],v=SOURCE_VIEWS[format];ctx.save();ctx.clearRect(0,0,p.width,p.height);
 ctx.drawImage(source,v[0],v[1],v[2],v[3],0,0,p.width,p.height);ctx.drawImage(shades.get(format)!,0,0);musicLine(ctx,t,format);
 for(const c of visibleCues(timeline,t))lyrics(ctx,c,t,format);ctx.restore();
}
