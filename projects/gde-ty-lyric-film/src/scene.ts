import {PALETTE,sourceActive,targetActive,visibleCue,visibleCues,validateTimeline,type Timeline,type FeatureData,type Cue,type Format} from './model.ts';
export type {Format} from './model.ts';
type Context=CanvasRenderingContext2D;
interface Point{x:number;y:number}
interface Key extends Point{id:string;width:number;height:number;bandIndices:number[]}
export interface MaterialPlan{sourceSha256:string;chandelier:{bounds:{x:number;y:number;width:number;height:number};rows:{y:number;left:number;right:number}[];clusters:number;bulbs:Point[]};keys:Key[]}
export interface Surface{canvas:CanvasImageSource;context:Context}
export interface Slot{index:number;text:string;x:number;y:number;width:number}
export interface Layout{size:number;source:Slot[];target:Slot[];top:number;bottom:number}
let timeline:Timeline,features:FeatureData,plan:MaterialPlan;
let previewIdentity:{revision:string;sourceSha256:string;timelineSha256:string;sceneSha256:string}|undefined;
let factory:((w:number,h:number)=>Surface)|undefined,reference:CanvasImageSource|undefined;
let effectsEnabled=true,response:number[][]=[];
const layouts=new Map<string,Layout>(),backgrounds=new Map<Format,CanvasImageSource>(),seams=new Map<Format,CanvasImageSource>();
let crystals:CanvasImageSource[]=[],keyMasks:CanvasImageSource[]=[],glints:{x:number;y:number;cluster:number;strength:number}[]=[];
const clamp=(v:number,a=0,b=1)=>Math.max(a,Math.min(b,v));
const smooth=(a:number,b:number,x:number)=>{const u=clamp((x-a)/(b-a));return u*u*(3-2*u)};
const font=(size:number)=>`600 ${size}px Room`;
const shown=(token:{text:string;punctuationAfter?:string})=>token.text+(token.punctuationAfter??'');
const dimensions=(format:Format)=>format==='landscape'?{width:1920,height:1080,x:0,y:0}:{width:1080,height:1920,x:0,y:0};
export function cueOpacity(c:Cue,t:number){if(t<c.visibleStart||t>=c.visibleEnd)return 0;const entrance=smooth(c.visibleStart,c.start-.008,t);return (t>=c.start?1:entrance)*(c.exitMode==='vocal-handoff'?1:1-smooth(c.fullOpacityEnd,c.visibleEnd,t));}
export function getLines(){return timeline.cues.map(c=>({id:c.id,label:`${c.voice} · ${c.sourceText}`,start:c.start,end:c.end}))}
export function getReadingCue(t:number){return visibleCue(timeline,t)}
export function getReadingCues(t:number){return visibleCues(timeline,t)}
export function getSceneIdentity(){return {...previewIdentity,revision:timeline.revision,sourceSha256:timeline.sourceSha256,sampleRate:timeline.sampleRate}}
export function setEffectsEnabled(v:boolean){effectsEnabled=v}
export function getEffectsEnabled(){return effectsEnabled}
function prepareResponse():void{
 const hz=features.analysis.frameRate.numerator/features.analysis.frameRate.denominator;
 const groups=Array.from({length:plan.chandelier.clusters},(_,i)=>[Math.floor(i/plan.chandelier.clusters*24),Math.min(23,Math.floor(i/plan.chandelier.clusters*24)+1)]).concat(plan.keys.map(k=>k.bandIndices));
 const powers=features.rows.map(row=>groups.map(bands=>10*Math.log10(Math.max(1e-12,bands.reduce((sum,b)=>sum+10**((-96+row[b+2]!*96/255)/10),0)/bands.length))));
 const ranges=groups.map((_,i)=>{const values=powers.map(r=>r[i]!).filter(v=>v>-73).sort((a,b)=>a-b);return {low:Math.max(-68,values[Math.floor(values.length*.08)]!-4),high:Math.max(-48,values[Math.floor(values.length*.98)]!+1)}});
 const previous=groups.map(()=>0);
 // Precomputed causal envelopes make arbitrary seeks, repeated paused paints and
 // future frame rendering agree. State never accumulates from browser wall time.
 response=powers.map((row,k)=>row.map((db,i)=>{const r=ranges[i]!,rms=-96+features.rows[k]![0]!*96/255,target=Math.pow(clamp((db-r.low)/(r.high-r.low)),1.12)*smooth(-61,-32,rms),tau=target>previous[i]!?.065:.28,alpha=1-Math.exp(-1/hz/tau);previous[i]=previous[i]!+(target-previous[i]!)*alpha;return previous[i]!}));
}
function edgeAt(y:number){const rows=plan.chandelier.rows;let i=0;while(i<rows.length-2&&rows[i+1]!.y<y)i++;const a=rows[i]!,b=rows[i+1]!,u=clamp((y-a.y)/(b.y-a.y));return {left:a.left+(b.left-a.left)*u,right:a.right+(b.right-a.right)*u}}
function prepareMasks():void{
 crystals=[];keyMasks=[];glints=[];if(!factory||!reference)return;
 const probe=factory(1080,1080);probe.context.drawImage(reference,0,0);const pixels=probe.context.getImageData(0,0,1080,1080).data;
 const box=plan.chandelier.bounds;
 for(let c=0;c<plan.chandelier.clusters;c++){
  const s=factory(box.width,box.height),image=s.context.createImageData(box.width,box.height);const candidates:{x:number;y:number;strength:number}[]=[];
  for(let y=0;y<box.height;y++)for(let x=0;x<box.width;x++){
   const px=x+box.x,py=y+box.y,edge=edgeAt(py),u=(px-edge.left)/(edge.right-edge.left);
   if(u<0||u>=1||Math.min(plan.chandelier.clusters-1,Math.floor(u*plan.chandelier.clusters))!==c)continue;
   const p=(py*1080+px)*4,luma=pixels[p]!*.2126+pixels[p+1]!*.7152+pixels[p+2]!*.0722;
   const warm=clamp((pixels[p]!-pixels[p+2]!+24)/60),weight=smooth(47,171,luma)*(.35+warm*.65),q=(y*box.width+x)*4;
   // Mask comes from real source facets, not a geometric filled cone. Dark
   // hardware remains dark. Warm source crystal texture survives the response.
   image.data[q]=255;image.data[q+1]=225;image.data[q+2]=180;image.data[q+3]=Math.round(weight*255);
   if(luma>150&&py>55&&py<150&&x%3===0&&y%3===0)candidates.push({x:px,y:py,strength:weight});
  }
  s.context.putImageData(image,0,0);crystals.push(s.canvas);
  candidates.sort((a,b)=>b.strength-a.strength);
  const selected:{x:number;y:number;strength:number}[]=[];
  for(const p of candidates){if(selected.length>=3)break;if(selected.every(q=>Math.hypot(p.x-q.x,p.y-q.y)>16))selected.push(p)}
  glints.push(...selected.map(p=>({...p,cluster:c})));
 }
 for(const key of plan.keys){const s=factory(Math.ceil(key.width),Math.ceil(key.height)),image=s.context.createImageData(Math.ceil(key.width),Math.ceil(key.height));for(let y=0;y<image.height;y++)for(let x=0;x<image.width;x++){const p=(Math.floor(key.y+y)*1080+Math.floor(key.x+x))*4,luma=pixels[p]!*.2126+pixels[p+1]!*.7152+pixels[p+2]!*.0722,q=(y*image.width+x)*4;image.data[q]=255;image.data[q+1]=223;image.data[q+2]=180;image.data[q+3]=Math.round(smooth(51,128,luma)*140)}s.context.putImageData(image,0,0);keyMasks.push(s.canvas)}
}
function initialize(t:Timeline,f:FeatureData,p:MaterialPlan,make:((w:number,h:number)=>Surface)|undefined,ref:CanvasImageSource|undefined){validateTimeline(t);if(t.sourceSha256!==f.sourceSha256||t.sourceSha256!==p.sourceSha256)throw Error('Recording/scene mismatch');timeline=t;features=f;plan=p;factory=make;reference=ref;layouts.clear();backgrounds.clear();seams.clear();prepareResponse();prepareMasks();if(reference&&factory){background('landscape');background('portrait');seam('landscape');seam('portrait')}}
export function setSceneForProof(t:Timeline,f:FeatureData,p:MaterialPlan,make?:((w:number,h:number)=>Surface),ref?:CanvasImageSource){initialize(t,f,p,make,ref)}
export async function loadScene(){const read=async<T>(p:string):Promise<T>=>{const r=await fetch(p);if(!r.ok)throw Error(`Missing preview asset: ${p}`);return r.json() as Promise<T>};const [t,f,p,id]=await Promise.all([read<Timeline>('/public/timeline.json'),read<FeatureData>('/public/audio-features.json'),read<MaterialPlan>('/public/material-anchors.json'),read<NonNullable<typeof previewIdentity>>('/public/preview-identity.json')]);if(id.revision!==t.revision||id.sourceSha256!==t.sourceSha256)throw Error('Stale preview identity');previewIdentity=id;const face=new FontFace('Room',"url('/public/fonts/RoomSerif.ttf')",{weight:'600'});await face.load();document.fonts.add(face);await document.fonts.ready;const ref=await new Promise<HTMLImageElement>((resolve,reject)=>{const image=new Image();image.onload=()=>resolve(image);image.onerror=()=>reject(Error('Original material reference unavailable'));image.src='/public/material-reference.png'});const make=(w:number,h:number):Surface=>{const canvas=document.createElement('canvas');canvas.width=w;canvas.height=h;const ctx=canvas.getContext('2d');if(!ctx)throw Error('Material surface unavailable');return {canvas,context:ctx}};initialize(t,f,p,make,ref)}
function wrap(ctx:Context,tokens:{text:string;punctuationAfter?:string}[],width:number):number[][]{
 const gap=ctx.measureText(' ').width,widths=tokens.map(t=>ctx.measureText(shown(t)).width);let row:number[]=[],used=0;const greedy:number[][]=[];tokens.forEach((_,i)=>{const w=widths[i]!;if(row.length&&used+gap+w>width){greedy.push(row);row=[];used=0}used+=(row.length?gap:0)+w;row.push(i)});if(row.length)greedy.push(row);if(greedy.length<2)return greedy;
 const count=greedy.length,ideal=(widths.reduce((a,b)=>a+b,0)+gap*(tokens.length-count))/count,memo=new Map<string,{cost:number;rows:number[][]}>();
 const solve=(first:number,left:number):{cost:number;rows:number[][]}=>{if(left===0)return {cost:first===tokens.length?0:Infinity,rows:[]};const key=`${first}:${left}`,known=memo.get(key);if(known)return known;let best={cost:Infinity,rows:[] as number[][]},length=0;for(let end=first;end<tokens.length;end++){length+=widths[end]!+(end>first?gap:0);if(length>width)break;const tail=solve(end+1,left-1);if(!Number.isFinite(tail.cost))continue;const lone=end===first?width*width*.7:0,stranded=/^(the|a|an|to|of|in|for|with|and|my|your|по|на|в|во|и|от|за)$/iu.test(tokens[end]!.text)?width*width*.14:0,pause=/[,;!?…]$/u.test(shown(tokens[end]!))?-width*width*.018:0,cost=tail.cost+(length-ideal)**2+lone+stranded+pause;if(cost<best.cost)best={cost,rows:[Array.from({length:end-first+1},(_,i)=>first+i),...tail.rows]}}memo.set(key,best);return best};return solve(0,count).rows;
}
export function cueLayout(ctx:Context,c:Cue,format:Format):Layout{
 const key=`${c.id}:${format}`,known=layouts.get(key);if(known)return known;
 const portrait=format==='portrait',width=portrait?912:716,centerX=portrait?540:1494;
 const overlapRegion=c.start>=153;let size=portrait?68:57,source:number[][]=[],target:number[][]=[];
 for(;size>=48;size--){ctx.font=font(size);source=wrap(ctx,c.words,width);target=wrap(ctx,c.targets,width);if(source.length+target.length<=(portrait?5:5))break}
 const leading=size*1.13,gap=size*.52,total=(source.length+target.length)*leading+gap;
 const center=portrait?(overlapRegion?(c.lane==='backing'?1617:1325):1457):(overlapRegion?(c.lane==='backing'?788:421):520),top=center-total/2;
 const slots=(tokens:{text:string;punctuationAfter?:string}[],rows:number[][],first:number):Slot[]=>rows.flatMap((row,r)=>{const space=ctx.measureText(' ').width,widths=row.map(i=>ctx.measureText(shown(tokens[i]!)).width);let x=centerX-(widths.reduce((a,b)=>a+b,0)+space*(row.length-1))/2;return row.map((index,i)=>{const s={index,text:shown(tokens[index]!),x,y:first+r*leading,width:widths[i]!};x+=widths[i]!+space;return s})});
 const layout={size,source:slots(c.words,source,top+size),target:slots(c.targets,target,top+source.length*leading+gap+size),top,bottom:top+total};layouts.set(key,layout);return layout;
}
function background(format:Format):CanvasImageSource|undefined{
 const cached=backgrounds.get(format);if(cached)return cached;if(!factory||!reference)return;
 const d=dimensions(format),surface=factory(d.width,d.height),ctx=surface.context,probe=factory(1080,1080);probe.context.drawImage(reference,0,0);const pixels=probe.context.getImageData(0,0,1080,1080).data;
 const sample=(left:number,top:number)=>{const rgb=[0,0,0];let count=0;for(let y=top;y<top+70;y+=3)for(let x=left;x<left+70;x+=3){const i=(y*1080+x)*4;for(let c=0;c<3;c++)rgb[c]=rgb[c]!+pixels[i+c]!;count++}return rgb.map(v=>Math.round(v/count))};
 const a=sample(879,190),b=sample(963,304),gradient=ctx.createLinearGradient(1080,0,d.width,d.height);gradient.addColorStop(0,`rgb(${a.join(',')})`);gradient.addColorStop(1,`rgb(${b.map(v=>Math.round(v*.79)).join(',')})`);ctx.fillStyle=gradient;ctx.fillRect(0,0,d.width,d.height);
 const grain=factory(130,130);grain.context.drawImage(reference,836,170,130,130,0,0,130,130);const pattern=ctx.createPattern(grain.canvas,'repeat');if(pattern){ctx.save();ctx.globalAlpha=.075;ctx.fillStyle=pattern;ctx.fillRect(0,0,d.width,d.height);ctx.restore()}
 backgrounds.set(format,surface.canvas);return surface.canvas;
}
function seam(format:Format):CanvasImageSource|undefined{
 const cached=seams.get(format);if(cached)return cached;const wall=background(format),d=dimensions(format);
 if(factory&&wall){const overlay=factory(d.width,d.height),s=overlay.context;s.drawImage(wall,0,0);s.globalCompositeOperation='destination-in';const gradient=format==='landscape'?s.createLinearGradient(918,0,1080,0):s.createLinearGradient(0,930,0,1080);gradient.addColorStop(0,'rgba(0,0,0,0)');gradient.addColorStop(.28,'rgba(0,0,0,.025)');gradient.addColorStop(.66,'rgba(0,0,0,.34)');gradient.addColorStop(1,'rgba(0,0,0,1)');s.fillStyle=gradient;if(format==='landscape')s.fillRect(918,0,d.width-918,d.height);else s.fillRect(0,930,d.width,d.height-930);seams.set(format,overlay.canvas);return overlay.canvas;}
}
function paintPicture(ctx:Context,source:CanvasImageSource,format:Format){
 const d=dimensions(format);ctx.fillStyle='#454e5b';ctx.fillRect(0,0,d.width,d.height);const wall=background(format);if(wall)ctx.drawImage(wall,0,0);ctx.drawImage(source,0,0,1080,1080);const overlay=seam(format);if(overlay)ctx.drawImage(overlay,0,0);
}
export function materialResponseAt(t:number){const f=clamp(t*features.analysis.frameRate.numerator/features.analysis.frameRate.denominator,0,response.length-1),i=Math.floor(f),u=f-i;return response[i]!.map((v,b)=>v+(response[Math.min(response.length-1,i+1)]![b]!-v)*u)}
function paintChandelier(ctx:Context,levels:number[]){
 const n=plan.chandelier.clusters,mean=levels.slice(0,n).reduce((a,b)=>a+b,0)/n,box=plan.chandelier.bounds;
 // Broad bounded illumination surrounds the real source light, never the face.
 const atmosphere=ctx.createRadialGradient(535,58,18,535,58,200);atmosphere.addColorStop(0,`rgba(255,207,142,${mean*.19})`);atmosphere.addColorStop(.47,`rgba(254,195,123,${mean*.065})`);atmosphere.addColorStop(1,'rgba(254,195,123,0)');ctx.fillStyle=atmosphere;ctx.fillRect(305,0,466,218);
 for(let i=0;i<crystals.length;i++){ctx.save();ctx.globalAlpha=Math.pow(levels[i]!,1.13)*.78;ctx.drawImage(crystals[i]!,box.x,box.y);ctx.restore()}
 for(const p of plan.chandelier.bulbs){const r=9+mean*14,g=ctx.createRadialGradient(p.x,p.y,0,p.x,p.y,r);g.addColorStop(0,`rgba(255,245,222,${mean*.78})`);g.addColorStop(.17,`rgba(255,221,174,${mean*.47})`);g.addColorStop(1,'rgba(255,204,142,0)');ctx.fillStyle=g;ctx.beginPath();ctx.arc(p.x,p.y,r,0,Math.PI*2);ctx.fill()}
 for(const p of glints){const v=levels[p.cluster]!*p.strength;if(v<.22)continue;ctx.save();ctx.globalAlpha=(v-.22)*.48;ctx.strokeStyle='#fff3d7';ctx.lineWidth=.7;ctx.beginPath();ctx.moveTo(p.x-2.2,p.y);ctx.lineTo(p.x+2.2,p.y);ctx.moveTo(p.x,p.y-2.7);ctx.lineTo(p.x,p.y+2.7);ctx.stroke();ctx.restore()}
}
function paintKeys(ctx:Context,levels:number[]){for(let i=0;i<plan.keys.length;i++){const k=plan.keys[i]!,v=levels[plan.chandelier.clusters+i]!;ctx.save();ctx.globalAlpha=v*.75;const mask=keyMasks[i];if(mask)ctx.drawImage(mask,k.x,k.y);ctx.restore()}}
function paintWords(ctx:Context,c:Cue,t:number,format:Format){const l=cueLayout(ctx,c,format);ctx.save();ctx.globalAlpha=cueOpacity(c,t);ctx.font=font(l.size);ctx.textAlign='left';ctx.textBaseline='alphabetic';for(const [slots,ru] of [[l.source,true],[l.target,false]] as const)for(const s of slots){const active=ru?sourceActive(c.words[s.index]!,t,timeline.sampleRate):targetActive(c.targets[s.index]!,c.words,t,timeline.sampleRate);ctx.save();ctx.fillStyle=active?PALETTE.focus:PALETTE.rest;ctx.shadowColor=PALETTE.shadow;ctx.shadowBlur=2.6;ctx.shadowOffsetY=1.5;ctx.fillText(s.text,s.x,s.y);ctx.restore()}ctx.restore()}
function title(ctx:Context,t:number,format:Format){const portrait=format==='portrait',alpha=smooth(.1,1,t)*(1-smooth(11.5,14.25,t));if(alpha<=0)return;ctx.save();ctx.globalAlpha=alpha;ctx.textAlign='center';ctx.fillStyle=PALETTE.rest;ctx.font=font(portrait?91:87);const x=portrait?540:1494,y=portrait?1236:305;ctx.fillText('где ты?',x,y);ctx.font=font(portrait?36:32);ctx.fillText('элли на маковом поле · лампабикт',x,y+56);ctx.restore()}
export function paintScene(ctx:Context,t:number,format:Format,source:CanvasImageSource){const d=dimensions(format);ctx.save();ctx.setTransform(1,0,0,1,0,0);ctx.globalAlpha=1;ctx.globalCompositeOperation='source-over';ctx.clearRect(0,0,d.width,d.height);paintPicture(ctx,source,format);if(effectsEnabled){const levels=materialResponseAt(t);paintChandelier(ctx,levels);paintKeys(ctx,levels)}title(ctx,t,format);for(const cue of visibleCues(timeline,t))paintWords(ctx,cue,t,format);ctx.restore()}
