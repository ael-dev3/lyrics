import type {Format,ProductionData} from './schema.ts';
import type {Layouts,Box} from './layout-types.ts';
import {activeSource,activeTargets,visibleCue} from './focus.ts';
export const palette={night:'#0b1422',rest:'#b8c8d8',active:'#ffe3a0'};
const escape=(s:string)=>s.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c]??c));
const clamp=(x:number)=>Math.min(1,Math.max(0,x));
export function sceneSvg(frame:number,format:Format,data:ProductionData,layouts:Layouts,bands:readonly number[][]):string{
 const l=layouts[format],t=frame/data.fps,c=visibleCue(data,frame),positions=c?l.cues[c.id]:undefined;
 const metaOpacity=clamp((161-t)/1.2),width=l.width,height=l.height;
 const top=80,titleSize=format==='landscape'?62:74;
 const base=`<defs><linearGradient id="shade" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#07111d" stop-opacity=".65"/><stop offset=".28" stop-color="#07111d" stop-opacity="0"/><stop offset=".48" stop-color="#07111d" stop-opacity=".18"/><stop offset=".67" stop-color="#07111d" stop-opacity=".80"/><stop offset="1" stop-color="#07111d" stop-opacity=".96"/></linearGradient><filter id="ink" x="-20%" y="-60%" width="140%" height="230%"><feDropShadow dx="0" dy="2" stdDeviation="4" flood-color="#000713" flood-opacity=".85"/></filter></defs>`;
 let out=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}" style="font-family:LyricSerif;font-weight:600;font-synthesis:none">${base}`;
 if(format==='landscape')out+=`<rect width="${width}" height="${height}" fill="url(#shade)" opacity="${metaOpacity}"/>`;
 out+=`<g opacity="${metaOpacity}" fill="${palette.rest}"><text x="${l.safeX}" y="${top}" font-size="${format==='landscape'?24:28}" letter-spacing="5">POLNALYUBVI</text><text x="${l.safeX}" y="${top+titleSize+12}" font-size="${titleSize}" fill="${palette.active}">Твои глаза</text></g>`;
 if(c&&positions){const liveRu=activeSource(c,frame,data),liveEn=activeTargets(c,frame,data);
 const words=(boxes:Box[],active:Set<string>,lane:string)=>`<g data-language="${lane}" font-size="${l.fontSize}" filter="url(#ink)">${boxes.map(w=>`<text data-word="${w.id}" data-active="${active.has(w.id)}" x="${w.x}" y="${w.y}" fill="${active.has(w.id)?palette.active:palette.rest}">${escape(w.text)}</text>`).join('')}</g>`;
 out+=`<g data-cue="${c.id}">${words(positions.ru,liveRu,'ru')}${words(positions.en,liveEn,'en')}</g>`;}
 const band=bands[Math.min(frame,bands.length-1)]??[],barWidth=format==='landscape'?6:8,step=format==='landscape'?12:13,origin=(width-step*63)/2;
 out+=`<g opacity="${.6*metaOpacity}" fill="${palette.active}">${band.map((db,i)=>{const h=2+Math.pow(clamp((db+65)/60),1.5)*(format==='landscape'?22:40);return `<rect x="${origin+i*step}" y="${(format==='landscape'?1053:1660)-h}" width="${barWidth}" height="${h}"/>`;}).join('')}</g></svg>`;return out;
}
