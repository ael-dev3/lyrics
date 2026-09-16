import type {Format,ProductionData} from './schema.ts';
import type {Layouts} from './layout-types.ts';
import {activeSource,visibleCues} from './focus.ts';
export const palette={night:'#10171a',rest:'#e8e9e3',active:'#ffd5a9',cool:'#a9d4d2'};
const escape=(s:string)=>s.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c]??c));
const clamp=(x:number)=>Math.min(1,Math.max(0,x));
const ease=(x:number)=>{const p=clamp(x);return p*p*(3-2*p);};
// Deliberate arrangement envelopes; these do not modify the measured audio data or word events.
export const arrangement=[[0,.18],[6,.36],[29,.40],[31,.66],[43,.38],[68,.48],[78,.74],[82.3,1],[108.8,.82],[113,.22],[144.5,.38],[146.5,1],[173.8,1],[196.8,.48],[198.4,.28],[226.2,.20],[230,0]] as const;
export function intensityAt(time:number){for(let i=1;i<arrangement.length;i++){const a=arrangement[i-1]!,b=arrangement[i]!;if(time<=b[0])return a[1]+(b[1]-a[1])*ease((time-a[0])/(b[0]-a[0]));}return 0;}
export const visualizer={bands:64,dbFloor:-65,dbCeiling:-13,exponent:1.18,baseHeight:2,travel:{landscape:[38,132],portrait:[56,195]},opacity:[.60,.94],reflection:.24,arrangement,measurementTransforms:'none; bounded display transform only'};
export function spectrumHeights(frame:number,format:Format,bands:readonly number[][]){const strength=intensityAt(frame/60),range=visualizer.travel[format],travel=range[0]!+(range[1]!-range[0]!)*strength;return (bands[Math.min(frame,bands.length-1)]??[]).map(db=>2+Math.pow(clamp((db+65)/52),1.18)*travel);}
export function sceneSvg(frame:number,format:Format,data:ProductionData,layouts:Layouts,bands:readonly number[][]):string{
 const l=layouts[format],t=frame/data.fps,width=l.width,height=l.height,portrait=format==='portrait',strength=intensityAt(t);
 const lastVocal=Math.max(...data.cues.map(c=>c.endSample))/data.sampleRate;
 const intro=ease(t/.65),fade=ease((data.duration-t)/1.2),hero=intro*(1-ease((t-4.7)/1.2));
 const defs=`<defs><linearGradient id="shade" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#10171a" stop-opacity=".46"/><stop offset=".25" stop-color="#10171a" stop-opacity=".02"/><stop offset=".43" stop-color="#10171a" stop-opacity=".13"/><stop offset=".64" stop-color="#10171a" stop-opacity=".88"/><stop offset="1" stop-color="#10171a" stop-opacity=".97"/></linearGradient><linearGradient id="spectrum" x1="0" y1="0" x2="1" y2="0"><stop stop-color="#91bfc7"/><stop offset=".48" stop-color="#fce4c7"/><stop offset="1" stop-color="#e0aa84"/></linearGradient><linearGradient id="reflection" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#d2ded6" stop-opacity=".27"/><stop offset="1" stop-color="#d2ded6" stop-opacity="0"/></linearGradient><radialGradient id="bloom"><stop stop-color="#e5b88f" stop-opacity="${.045+.065*strength}"/><stop offset="1" stop-color="#e5b88f" stop-opacity="0"/></radialGradient><filter id="ink" x="-15%" y="-35%" width="130%" height="190%"><feDropShadow dx="0" dy="2" stdDeviation="4" flood-color="#050d10" flood-opacity=".9"/></filter></defs>`;
 let out=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}" style="font-family:LyricSerif;font-weight:600;font-synthesis:none">${defs}`;
 if(!portrait)out+=`<rect width="${width}" height="${height}" fill="url(#shade)"/>`;
 out+=`<ellipse cx="${width/2}" cy="${portrait?1560:1030}" rx="${width*.58}" ry="${portrait?420:280}" fill="url(#bloom)" opacity="${fade}"/>`;
 out+=`<g opacity="${intro*fade}" fill="${palette.rest}"><text x="${l.safeX}" y="${portrait?86:73}" font-size="${portrait?27:25}" letter-spacing="5">ANYA NAMI</text><text x="${l.safeX}" y="${portrait?174:142}" font-size="${portrait?84:66}" fill="${palette.active}" opacity="${1-hero}">Sugar Glass</text></g>`;
 if(hero>0)out+=`<g opacity="${hero}" text-anchor="middle" fill="${palette.rest}" filter="url(#ink)"><text x="${width/2}" y="${portrait?1100:725}" font-size="${portrait?196:230}" letter-spacing="-4">Sugar Glass</text><text x="${width/2}" y="${portrait?1160:790}" font-size="${portrait?23:24}" letter-spacing="7" fill="${palette.active}">ANYA NAMI</text></g>`;
 for(const cue of visibleCues(data,frame)){
  const positions=l.cues[cue.id];if(!positions)throw Error('Missing cue layout '+cue.id);
  const active=activeSource(cue,frame,data);
  out+=`<g data-cue="${cue.id}" data-layer="${cue.layer}" data-language="en" font-size="${positions.fontSize}" filter="url(#ink)">${positions.source.map(w=>`<text data-word="${w.id}" data-active="${active.has(w.id)}" x="${w.x}" y="${w.y}" fill="${active.has(w.id)?palette.active:palette.rest}">${escape(w.text)}</text>`).join('')}</g>`;
 }
 const heights=spectrumHeights(frame,format,bands),step=portrait?13.75:22,barWidth=portrait?7.5:11,origin=(width-(step*63+barWidth))/2,baseline=portrait?1630:1005;
 const barFade=ease((lastVocal+2.3-t)/1.4)*intro,opacity=(.60+.34*strength)*barFade;
 out+=`<g data-visualizer="spectrum" opacity="${opacity}"><g fill="url(#spectrum)">${heights.map((h,i)=>`<rect x="${origin+i*step}" y="${baseline-h}" width="${barWidth}" height="${h}" rx=".7"/>`).join('')}</g><g fill="url(#reflection)">${heights.map((h,i)=>`<rect x="${origin+i*step}" y="${baseline+5}" width="${barWidth}" height="${h*.24}"/>`).join('')}</g></g></svg>`;
 return out;
}
