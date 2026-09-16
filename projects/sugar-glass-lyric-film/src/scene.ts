import type {Format,ProductionData} from './schema.ts';
import type {Layouts,Box} from './layout-types.ts';
import {activeSource,activeTargets,visibleCues} from './focus.ts';
export const palette={night:'#11191b',rest:'#e4e8e5',active:'#ffd0ad'};
const escape=(s:string)=>s.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c]??c));
const clamp=(x:number)=>Math.min(1,Math.max(0,x));
export const visualizer={bands:64,dbFloor:-65,dbCeiling:-5,exponent:1.5,baseHeight:2,travel:{landscape:26,portrait:38},opacity:.55};
export function sceneSvg(frame:number,format:Format,data:ProductionData,layouts:Layouts,bands:readonly number[][]):string{
 const l=layouts[format],t=frame/data.fps,width=l.width,height=l.height;
 const lastVocal=Math.max(...data.cues.map(c=>c.endSample))/data.sampleRate;
 const fade=clamp((data.duration-t)/1.2),intro=clamp(t/.8),metaOpacity=fade*intro;
 const base=`<defs><linearGradient id="shade" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#10191b" stop-opacity=".66"/><stop offset=".25" stop-color="#10191b" stop-opacity=".03"/><stop offset=".43" stop-color="#10191b" stop-opacity=".12"/><stop offset=".63" stop-color="#10191b" stop-opacity=".86"/><stop offset="1" stop-color="#10191b" stop-opacity=".98"/></linearGradient><filter id="ink" x="-20%" y="-60%" width="140%" height="230%"><feDropShadow dx="0" dy="2" stdDeviation="3" flood-color="#061114" flood-opacity=".85"/></filter></defs>`;
 let out=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}" style="font-family:LyricSerif;font-weight:600;font-synthesis:none">${base}`;
 if(format==='landscape')out+=`<rect width="${width}" height="${height}" fill="url(#shade)"/>`;
 out+=`<g opacity="${metaOpacity}" fill="${palette.rest}"><text x="${l.safeX}" y="75" font-size="${format==='landscape'?24:28}" letter-spacing="5">ANYA NAMI</text><text x="${l.safeX}" y="${format==='landscape'?151:167}" font-size="${format==='landscape'?66:78}" fill="${palette.active}">Sugar Glass</text></g>`;
 for(const cue of visibleCues(data,frame)){
  const positions=l.cues[cue.id];if(!positions)throw Error('Missing cue layout '+cue.id);
  const words=(boxes:Box[],active:Set<string>,lane:string)=>`<g data-language="${lane}" font-size="${l.fontSize}" filter="url(#ink)">${boxes.map(w=>`<text data-word="${w.id}" data-active="${active.has(w.id)}" x="${w.x}" y="${w.y}" fill="${active.has(w.id)?palette.active:palette.rest}">${escape(w.text)}</text>`).join('')}</g>`;
  out+=`<g data-cue="${cue.id}" data-layer="${cue.layer}">${words(positions.source,activeSource(cue,frame,data),'en')}${words(positions.target,activeTargets(cue,frame,data),'ru')}</g>`;
 }
 const band=bands[Math.min(frame,bands.length-1)]??[],barWidth=format==='landscape'?6:8,step=format==='landscape'?12:13,origin=(width-step*63)/2;
 const barFade=clamp((lastVocal+1.5-t)/1.2)*intro;
 out+=`<g opacity="${visualizer.opacity*barFade}" fill="#b2d8d7">${band.map((db,i)=>{const h=visualizer.baseHeight+Math.pow(clamp((db-visualizer.dbFloor)/(visualizer.dbCeiling-visualizer.dbFloor)),visualizer.exponent)*visualizer.travel[format];return `<rect x="${origin+i*step}" y="${(format==='landscape'?1045:1760)-h}" width="${barWidth}" height="${h}"/>`;}).join('')}</g></svg>`;return out;
}
