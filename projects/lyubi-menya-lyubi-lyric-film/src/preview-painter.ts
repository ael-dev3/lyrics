import type {ProductionData,Format} from './schema.ts';
import type {Layouts} from './layout-types.ts';
import {sceneSvg,dynamics,ribbonPath,palette,lyricMarkup} from './scene.ts';
import {activeDisplaySource,activeTargets,visibleCue} from './focus.ts';
export function createPreviewPainter(host:HTMLElement,data:ProductionData,layouts:Layouts,bands:number[][]){
 let shell='',key='',rebuilds=0,words:SVGTextElement[]=[],ribbon:SVGPathElement|null=null,spectrum:SVGGElement|null=null,lyrics:SVGGElement|null=null;
 return {paint(frame:number,format:Format){
  const cue=visibleCue(data,frame),next=format+':'+(cue?.id??'gap');
  if(format!==shell){host.innerHTML=sceneSvg(frame,format,data,layouts,bands);shell=format;key='';host.dataset.sceneRebuilds=String(++rebuilds);ribbon=host.querySelector('[data-ribbon]');spectrum=host.querySelector('[data-spectrum]');lyrics=host.querySelector('[data-lyrics]');host.dataset.artworkReady='false';const picture=host.querySelector('image');picture?.addEventListener('load',()=>{host.dataset.artworkReady='true';});picture?.addEventListener('error',()=>{host.dataset.artworkReady='false';host.dataset.artworkError='Original artwork failed to load';});}
  if(next!==key){if(lyrics)lyrics.innerHTML=lyricMarkup(frame,format,data,layouts);key=next;words=[...host.querySelectorAll<SVGTextElement>('[data-word]')];}
  const source=cue?activeDisplaySource(cue,frame,data):new Set<string>(),target=cue?activeTargets(cue,frame,data):new Set<string>();
  for(const word of words)word.setAttribute('fill',(word.dataset.language==='ru'?source:target).has(word.dataset.word??'')?palette.active:palette.rest);
  const d=dynamics(frame,format,data,bands);ribbon?.setAttribute('d',ribbonPath(d.values,d.barMax,format));spectrum?.setAttribute('opacity',String(.72*d.tail));
  host.dataset.frame=String(frame);host.dataset.section=d.section;
 }};
}
