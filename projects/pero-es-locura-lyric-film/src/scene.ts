import type {Format,ProductionData} from './schema.ts';
import type {Layouts,Box} from './layout-types.ts';
import {activeDisplaySource,activeTargets,visibleCue} from './focus.ts';
import {palette} from './palette.ts';
export const clamp=(x:number)=>Math.max(0,Math.min(1,x));
const escape=(s:string)=>s.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c]??c));
export function portraitMask(time:number){const edge=clamp((time-285.6)/1.4);return 'linear-gradient(to bottom,rgba(0,0,0,'+edge+'),black 4%,black 84%,rgba(0,0,0,'+edge+'))';}
export function decorOpacity(time:number){return clamp(time/.45)*clamp((287-time)/1.4);}
export function readingShadeOpacity(frame:number,data:ProductionData){
 const time=frame/data.fps,cue=visibleCue(data,frame);
 if(!cue)return decorOpacity(time);
 // Preserve lyric contrast after metadata fades, then clear before source credits.
 const sample=frame/data.fps*data.sampleRate,fade=.18*data.sampleRate;
 const reading=clamp((sample-cue.visibleFrom)/fade)*clamp((cue.visibleUntil-sample)/fade);
 return Math.max(decorOpacity(time),reading);
}
export function spectrum(frame:number,bands:readonly number[][],portrait:boolean){return (bands[Math.max(0,Math.min(frame,bands.length-1))]??[]).map(db=>2+clamp((db+64)/49)**1.65*(portrait?52:30));}
export function lyricSvg(frame:number,format:Format,data:ProductionData,layouts:Layouts){
 const c=visibleCue(data,frame),l=layouts[format],p=c?l.cues[c.id]:undefined;if(!c||!p)return '';
 const words=(boxes:Box[],active:Set<string>,lang:string)=>'<g data-language="'+lang+'" font-size="'+l.fontSize+'">'+boxes.map(w=>'<text data-word="'+w.id+'" data-active="'+active.has(w.id)+'" x="'+w.x+'" y="'+w.y+'" fill="'+(active.has(w.id)?palette.active:palette.rest)+'">'+escape(w.text)+'</text>').join('')+'</g>';
 return '<g data-cue="'+c.id+'" filter="url(#type-shadow)">'+words(p.es,activeDisplaySource(c,frame,data),'es')+words(p.en,activeTargets(c,frame,data),'en')+'</g>';
}
export function sceneSvg(frame:number,format:Format,data:ProductionData,layouts:Layouts,bands:readonly number[][]){
 const l=layouts[format],p=format==='portrait',w=l.width,h=l.height,t=frame/data.fps,alpha=decorOpacity(t);
 const defs='<defs><linearGradient id="shade" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="'+palette.ink+'" stop-opacity=".6"/><stop offset=".23" stop-color="'+palette.ink+'" stop-opacity="0"/><stop offset=".44" stop-color="'+palette.ink+'" stop-opacity=".04"/><stop offset=".64" stop-color="'+palette.ink+'" stop-opacity=".74"/><stop offset=".80" stop-color="'+palette.ink+'" stop-opacity=".97"/><stop offset="1" stop-color="'+palette.ink+'"/></linearGradient><filter id="type-shadow" x="-10%" y="-50%" width="120%" height="200%"><feDropShadow dx="0" dy="2" stdDeviation="2" flood-color="#000000" flood-opacity=".9"/></filter></defs>';
 const metadata='<g data-decor="metadata" opacity="'+alpha+'"><text x="'+l.safeX+'" y="'+(p?100:64)+'" font-size="'+(p?31:22)+'" letter-spacing="6" fill="'+palette.rest+'">FÉMINA</text><text x="'+l.safeX+'" y="'+(p?196:131)+'" font-size="'+(p?92:65)+'" fill="'+palette.active+'">Pero es locura</text><text x="'+l.safeX+'" y="'+(p?247:171)+'" font-size="'+(p?23:19)+'" letter-spacing="2" fill="'+palette.muted+'">VIVO EN LA OREJA NEGRA</text></g>';
 const heights=spectrum(frame,bands,p),step=p?12:11,bw=p?5:4,origin=(w-step*63-bw)/2,base=p?1760:1050;
 const bars='<g data-decor="spectrum" opacity="'+alpha*.68+'" fill="'+palette.active+'">'+heights.map((height,i)=>'<rect data-band="'+i+'" x="'+(origin+i*step)+'" y="'+(base-height)+'" width="'+bw+'" height="'+height+'"/>').join('')+'</g>';
 return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 '+w+' '+h+'" width="'+w+'" height="'+h+'" style="font-family:LiveSerif;font-weight:600;font-synthesis:none">'+defs+(p?'':'<rect data-decor="shade" width="'+w+'" height="'+h+'" fill="url(#shade)" opacity="'+readingShadeOpacity(frame,data)+'"/>')+metadata+'<g id="lyric-layer">'+lyricSvg(frame,format,data,layouts)+'</g>'+bars+'</svg>';
}
