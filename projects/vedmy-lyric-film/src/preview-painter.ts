import type {ProductionData,Format} from './schema.ts';
import type {Layouts} from './layout-types.ts';
import {sceneSvg,dynamics,clamp,natureAt,leafAt,spectrumPath,spectrumGeometry,motion} from './scene.ts';
import {activeDisplaySource,activeTargets,visibleCue} from './focus.ts';
import {paletteAt} from './palette.ts';
export function createPreviewPainter(host:HTMLElement,data:ProductionData,layouts:Layouts,bands:number[][]){
 let key='',rebuilds=0,words:SVGTextElement[]=[],bars:SVGPathElement[]=[],leaves:SVGUseElement[]=[],colors:SVGElement[]=[],idle:SVGTextElement|null=null,svg:SVGSVGElement|null=null;
 return {paint(frame:number,format:Format){
  const cue=visibleCue(data,frame),next=format+':'+(cue?.id??'gap');
  if(next!==key){host.innerHTML=sceneSvg(frame,format,data,layouts,bands);key=next;host.dataset.sceneRebuilds=String(++rebuilds);words=[...host.querySelectorAll<SVGTextElement>('[data-word]')];bars=[...host.querySelectorAll<SVGPathElement>('[data-band]')];leaves=[...host.querySelectorAll<SVGUseElement>('[data-leaf]')];colors=[...host.querySelectorAll<SVGElement>('[data-color]')];idle=host.querySelector('[data-idle]');svg=host.querySelector('svg');}
  const p=paletteAt(frame/data.fps),source=cue?activeDisplaySource(cue,frame,data):new Set<string>(),target=cue?activeTargets(cue,frame,data):new Set<string>();
  for(const word of words)word.setAttribute('fill',(word.dataset.language==='ru'?source:target).has(word.dataset.word??'')?p.active:p.rest);
  for(const el of colors){const k=el.dataset.color;if(k==='ink'||k==='rest'||k==='active')el.setAttribute(el.dataset.colorAttr??'fill',p[k]);}svg?.style.setProperty('--forest-ink',p.ink);svg?.setAttribute('data-palette',p.name);
  const d=dynamics(frame,format,bands),t=frame/data.fps,m=natureAt(frame,motion),rail=spectrumGeometry(format);
  bars.forEach((el,i)=>el.setAttribute('d',spectrumPath(i,d.values[i]??0,d.barMax,rail.cx,rail.y,rail.width)));
  leaves.forEach((el,i)=>{const leaf=leafAt(i,m,format);el.setAttribute('transform',leaf.transform);el.setAttribute('opacity',String(leaf.opacity));});
  idle?.setAttribute('opacity',String(cue?0:clamp(Math.min((t-2)/1.5,(27.3-t)/1.5))));
 }};
}
