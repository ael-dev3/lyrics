import type {Format,ProductionData} from './schema.ts';
import type {Layouts} from './layout-types.ts';
import {sceneSvg,lyricSvg,spectrum,decorOpacity,readingShadeOpacity} from './scene.ts';
import {visibleCue,activeDisplaySource,activeTargets} from './focus.ts';
import {palette} from './palette.ts';
export function createPreviewPainter(host:HTMLElement,data:ProductionData,layouts:Layouts,bands:readonly number[][]){
 let lastFormat:Format|undefined,lastCue:string|undefined;
 let wordNodes:SVGTextElement[]=[],bars:SVGRectElement[]=[],decor:SVGElement[]=[];
 return {paint(frame:number,format:Format){
  const cue=visibleCue(data,frame);
  if(format!==lastFormat){host.innerHTML=sceneSvg(frame,format,data,layouts,bands);lastFormat=format;lastCue=undefined;bars=[...host.querySelectorAll<SVGRectElement>('[data-band]')];decor=[...host.querySelectorAll<SVGElement>('[data-decor]')];host.dataset.sceneRebuilds=String(Number(host.dataset.sceneRebuilds??0)+1);}
  if(cue?.id!==lastCue){const layer=host.querySelector('#lyric-layer');if(layer)layer.innerHTML=lyricSvg(frame,format,data,layouts);lastCue=cue?.id;wordNodes=[...host.querySelectorAll<SVGTextElement>('[data-word]')];}
  if(cue){const ids=new Set([...activeDisplaySource(cue,frame,data),...activeTargets(cue,frame,data)]);for(const word of wordNodes){const on=ids.has(word.dataset.word??'');if(word.dataset.active!==String(on)){word.dataset.active=String(on);word.setAttribute('fill',on?palette.active:palette.rest);}}}
  const alpha=decorOpacity(frame/data.fps);for(const el of decor)el.setAttribute('opacity',String(el.dataset.decor==='shade'?readingShadeOpacity(frame,data):alpha*(el.dataset.decor==='spectrum'?.68:1)));
  const heights=spectrum(frame,bands,format==='portrait'),base=format==='portrait'?1760:1050;for(let i=0;i<bars.length;i++){const bar=bars[i],h=heights[i]??2;if(bar){bar.setAttribute('height',String(h));bar.setAttribute('y',String(base-h));}}
 }};
}
