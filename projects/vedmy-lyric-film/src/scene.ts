import type {ProductionData,Format} from './schema.ts';
import type {Layouts} from './layout-types.ts';
import {activeDisplaySource,activeTargets,visibleCue} from './focus.ts';
import {paletteAt,leafColors} from './palette.ts';
import {natureAt,leafAt,leafSymbols,spectrumPath} from './nature.ts';
import motion from '../public/nature-motion.json' with {type:'json'};
export {natureAt,leafAt,spectrumPath,motion};
export const escape=(s:string)=>s.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('"','&quot;');
export const clamp=(x:number)=>Math.max(0,Math.min(1,x));
const smooth=(x:number)=>{x=clamp(x);return x*x*(3-2*x);};
export const sectionStrength=(t:number)=>1+.28*smooth((t-89)/1.2)*smooth((103-t)/1.2)+.32*smooth((t-133)/1.2)*smooth((147-t)/1.2)+.46*smooth((t-171.35)/1.2)*smooth((194-t)/1.8);
export function spectrum(frame:number,bands:number[][]){return (bands[Math.min(bands.length-1,Math.max(0,frame))]??Array<number>(64).fill(-100)).map(db=>clamp((db+68)/54)**1.55);}
export function dynamics(frame:number,format:Format,bands:number[][]){const t=frame/60,values=spectrum(frame,bands),strength=sectionStrength(t),mean=values.reduce((a,b)=>a+b,0)/64;return {values,strength,mean,barMax:(format==='portrait'?48:40)*strength};}
export const spectrumGeometry=(format:Format)=>({cx:format==='portrait'?540:1470,y:format==='portrait'?1700:915,width:format==='portrait'?660:650});
export function sceneSvg(frame:number,format:Format,data:ProductionData,layouts:Layouts,bands:number[][],assetPrefix='/public/'){
 const l=layouts[format],portrait=format==='portrait',time=frame/data.fps,cue=visibleCue(data,frame),lay=cue?l.cues[cue.id]:undefined;
 const p=paletteAt(time),m=natureAt(frame,motion),d=dynamics(frame,format,bands),rail=spectrumGeometry(format),cx=rail.cx;
 const ru=cue?activeDisplaySource(cue,frame,data):new Set<string>(),en=cue?activeTargets(cue,frame,data):new Set<string>();
 const words=(lang:'ru'|'en')=>(lay?.[lang]??[]).map(w=>`<text data-word="${w.id}" data-language="${lang}" x="${w.x}" y="${w.y}" fill="${(lang==='ru'?ru:en).has(w.id)?p.active:p.rest}">${escape(w.text)}</text>`).join('');
 const leaves=Array.from({length:28},(_,i)=>{const leaf=leafAt(i,m,format);return `<use data-leaf="${i}" href="#${i%3===0?'oak':'birch'}-leaf" color="${leafColors[i%leafColors.length]}" transform="${leaf.transform}" opacity="${leaf.opacity}"/>`;}).join('');
 const bars=d.values.map((v,i)=>`<path data-band="${i}" d="${spectrumPath(i,v,d.barMax,rail.cx,rail.y,rail.width)}"/>`).join('');
 const idleOpacity=cue?0:clamp(Math.min((time-2)/1.5,(27.3-time)/1.5));
 return `<svg xmlns="http://www.w3.org/2000/svg" width="${l.width}" height="${l.height}" viewBox="0 0 ${l.width} ${l.height}" style="--forest-ink:${p.ink}" data-palette="${p.name}" role="img" aria-label="BALKON — Ведьмы. A steady woodland scene, falling leaves and Russian–English lyrics.">
 <defs>${leafSymbols}<linearGradient id="edge"><stop data-color="ink" data-color-attr="stop-color" stop-color="${p.ink}" stop-opacity="0"/><stop offset="1" data-color="ink" data-color-attr="stop-color" stop-color="${p.ink}"/></linearGradient><linearGradient id="foot" x2="0" y2="1"><stop data-color="ink" data-color-attr="stop-color" stop-color="${p.ink}" stop-opacity="0"/><stop offset="1" data-color="ink" data-color-attr="stop-color" stop-color="${p.ink}"/></linearGradient><radialGradient id="mist"><stop data-color="active" data-color-attr="stop-color" stop-color="${p.active}"/><stop offset="1" data-color="ink" data-color-attr="stop-color" stop-color="${p.ink}" stop-opacity="0"/></radialGradient></defs>
 <rect width="100%" height="100%" data-color="ink" fill="${p.ink}"/>
 <image data-artwork="true" href="${assetPrefix}artwork.png" x="0" y="${portrait?150:0}" width="1080" height="1080" preserveAspectRatio="xMidYMid meet"/>
 <rect x="0" y="${portrait?150:0}" width="1080" height="1080" data-color="ink" fill="${p.ink}" opacity=".16"/>
 ${portrait?`<rect x="0" y="855" width="1080" height="380" fill="url(#foot)"/><rect x="0" y="150" width="1080" height="100" fill="url(#foot)" transform="translate(0 400) scale(1 -1)"/>`:`<rect x="820" y="0" width="265" height="1080" fill="url(#edge)"/><rect x="0" y="865" width="1080" height="215" fill="url(#foot)"/>`}
 <g data-color="active" data-color-attr="color" color="${p.active}">${leaves}</g>
 <g text-anchor="middle" data-color="rest" fill="${p.rest}" font-family="EmberSerif" font-weight="600"><text x="${cx}" y="${portrait?58:174}" font-family="Arial,sans-serif" font-size="${portrait?20:19}" letter-spacing="8">BALKON</text><text x="${cx}" y="${portrait?123:270}" font-size="${portrait?67:86}" letter-spacing="${portrait?8:10}">ВЕДЬМЫ</text>
 <text data-idle="true" x="${cx}" y="${portrait?1310:590}" font-size="${portrait?52:48}" opacity="${idleOpacity}" letter-spacing="4">WITCHES</text></g>
 <g font-family="EmberSerif" font-weight="600" font-size="${l.fontSize}">${words('ru')}${words('en')}</g>
 <g data-color="active" fill="${p.active}" opacity=".77">${bars}</g>
 <text x="${cx}" y="${portrait?1804:1010}" text-anchor="middle" font-family="Arial,sans-serif" font-size="${portrait?16:14}" letter-spacing="4" data-color="rest" fill="${p.rest}" opacity=".55">BALKON · 2021</text></svg>`;
}
