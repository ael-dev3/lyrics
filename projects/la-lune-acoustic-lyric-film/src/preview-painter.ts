import type {ProductionData,Format} from './schema.ts';import type {Layouts} from './layout-types.ts';import {sceneSvg} from './scene.ts';import {geometry,lunarState,titleOpacity,spectrum,barPath} from './lunar-motion.ts';import {visibleCue,activeSource,activeTargets} from './focus.ts';import {palette} from './palette.ts';
export function createPreviewPainter(host:HTMLElement,data:ProductionData,layouts:Layouts,bands:number[][]){
 let format:Format|undefined,cueId:string|undefined,rebuilds=0;
 let content:Element,title:Element,lyric:Element,moon:Element,halo:Element,shade:Element,ripple:Element,bars:Element[]=[],fr:Element[]=[],en:Element[]=[];
 const required=(selector:string)=>{const node=host.querySelector(selector);if(!node)throw Error('Missing '+selector);return node;};
 const set=(el:Element,k:string,v:string)=>{if(el.getAttribute(k)!==v)el.setAttribute(k,v);};
 const words=()=>{fr=[...lyric.querySelectorAll('[data-language="fr"] text')];en=[...lyric.querySelectorAll('[data-language="en"] text')];};
 return {paint(frame:number,next:Format){
  const cue=visibleCue(data,frame),id=cue?.id??'';
  if(format!==next){host.innerHTML=sceneSvg(frame,next,data,layouts,bands);format=next;cueId=id;rebuilds++;content=required('#scene-content');title=required('#title-layer');lyric=required('#lyric-layer');moon=required('#moon-light');halo=required('#moon-atmosphere');shade=required('#moon-shade');ripple=required('#instrumental-ripple');bars=[...host.querySelectorAll('[data-band]')];words();}
  else if(cueId!==id){const incoming=new DOMParser().parseFromString(sceneSvg(frame,next,data,layouts,bands),'image/svg+xml').querySelector('#lyric-layer');if(!incoming)throw Error('Missing lyric layer');lyric.replaceChildren(...Array.from(incoming.childNodes).map(n=>document.importNode(n,true)));lyric.setAttribute('data-cue',id);cueId=id;words();}
  const m=lunarState(frame,data),g=geometry(next==='portrait');
  for(const [node,name,value] of [[content,'opacity',m.fade.toFixed(4)],[title,'opacity',titleOpacity(frame,data).toFixed(4)],[moon,'opacity',m.moonOpacity.toFixed(4)],[halo,'opacity',m.haloOpacity.toFixed(4)],[shade,'opacity',((1-m.reveal)*.88).toFixed(4)],[ripple,'opacity',m.ripple.opacity.toFixed(4)],[ripple,'r',(g.r+20+m.ripple.progress*38).toFixed(3)]] as const)set(node,name,value);
  spectrum(frame,bands,next==='portrait').forEach((v,i)=>{const node=bars[i];if(node)set(node,'d',barPath(i,v,next==='portrait'));});
  if(cue)for(const [nodes,active] of [[fr,activeSource(cue,frame,data)],[en,activeTargets(cue,frame,data)]] as const)for(const node of nodes)set(node,'fill',active.has(node.getAttribute('data-word')??'')?palette.accent:palette.ivory);
  host.dataset.frame=String(frame);host.dataset.sceneRebuilds=String(rebuilds);
 }};
}
