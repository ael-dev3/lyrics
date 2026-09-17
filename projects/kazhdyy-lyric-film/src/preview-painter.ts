import type {ProductionData,Format} from './schema.ts';
import type {Layouts} from './layout-types.ts';
import {sceneSvg,motionAt} from './scene.ts';
import {visibleCue,activeSource,activeTargets} from './focus.ts';
import {artworkPose,clamp,smooth} from './motion.ts';
import {palette} from './palette.ts';

// Preserve image, filter and lyric nodes across frames. Rebuilding the complete SVG
// every frame made the compositor repeatedly discard the same static artwork.
export function createPreviewPainter(host:HTMLElement,data:ProductionData,layouts:Layouts,bands:number[][]){
 let format:Format|undefined,cueId:string|undefined;
 let art:Element,content:Element,title:Element,lyricLayer:Element;
 let bars:Element[]=[],ru:Element[]=[],en:Element[]=[];
 let rebuilds=0;
 const set=(node:Element,name:string,value:string)=>{if(node.getAttribute(name)!==value)node.setAttribute(name,value);};
 return {
  paint(frame:number,nextFormat:Format){
   const cue=visibleCue(data,frame),nextCue=cue?.id??'';
   if(format!==nextFormat){
    host.innerHTML=sceneSvg(frame,nextFormat,data,layouts,bands);rebuilds++;
    format=nextFormat;cueId=nextCue;
    art=host.querySelector('#art-pose')!;content=host.querySelector('#scene-content')!;title=host.querySelector('#title-layer')!;lyricLayer=host.querySelector('#lyric-layer')!;
    bars=[...host.querySelectorAll('[data-band]')];ru=[...host.querySelectorAll('[data-language="ru"] text')];en=[...host.querySelectorAll('[data-language="en"] text')];
   }else if(cueId!==nextCue){
    const incoming=new DOMParser().parseFromString(sceneSvg(frame,nextFormat,data,layouts,bands),'image/svg+xml').querySelector('#lyric-layer')!;
    lyricLayer.replaceChildren(...Array.from(incoming.childNodes).map(node=>document.importNode(node,true)));
    lyricLayer.setAttribute('data-cue',nextCue);cueId=nextCue;
    ru=[...lyricLayer.querySelectorAll('[data-language="ru"] text')];en=[...lyricLayer.querySelectorAll('[data-language="en"] text')];
   }
   const portrait=nextFormat==='portrait',t=frame/data.fps,m=motionAt(t,bands),pose=artworkPose(frame,portrait);
   set(art,'transform',`translate(${pose.x.toFixed(3)} ${pose.y.toFixed(3)}) scale(${pose.scale.toFixed(3)})`);
   set(content,'opacity',(1-smooth((t-(data.duration-2.2))/2.2)).toFixed(3));
   set(title,'opacity',(cue?0:Math.max(m.intro,m.interlude,m.outro)).toFixed(3));
   const artW=portrait?1080:910,railY=portrait?1000:1026,railX=portrait?86:64,railW=artW-railX*2;
   bars.forEach((bar,i)=>{const value=clamp(((m.values[i]??-100)+64)/55)**1.35,height=3+value*(36+72*m.chorus);set(bar,'d',`M ${(railX+i*railW/63).toFixed(3)} ${railY} v ${(-height).toFixed(3)}`);});
   if(cue){const a=activeSource(cue,frame,data),b=activeTargets(cue,frame,data);for(const [nodes,active] of [[ru,a],[en,b]] as const)for(const node of nodes)set(node,'fill',active.has(node.getAttribute('data-word')??'')?palette.vermilion:palette.ivory);}
   host.dataset.frame=String(frame);host.dataset.sceneRebuilds=String(rebuilds);
  },
 };
}
