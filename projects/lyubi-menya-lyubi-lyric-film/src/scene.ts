import type {Format,ProductionData} from './schema.ts';
import type {Layouts} from './layout-types.ts';
import {activeDisplaySource,activeTargets,visibleCue} from './focus.ts';

export const palette={paper:'#f2ded8',ink:'#30252d',rest:'#30252d',active:'#a22c50',rose:'#cf7890'};
export const clamp=(x:number)=>Math.max(0,Math.min(1,x));
const escape=(s:string)=>s.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
export function dynamics(frame:number,format:Format,data:ProductionData,bands:number[][]){
 const t=frame/data.fps,current=data.cues.find(c=>t>=c.visibleFrom/data.sampleRate&&t<c.visibleUntil/data.sampleRate);
 const section=current?.section??data.cues.filter(c=>c.startSample/data.sampleRate<=t).at(-1)?.section??'Intro';
 // Instant measured attack, exponential release. Never anticipate a future audio frame.
 const raw=Array.from({length:64},(_,i)=>{let v=0;for(let back=0;back<=15;back++){const row=bands[Math.max(0,Math.min(bands.length-1,frame-back))];v=Math.max(v,clamp(((row?.[i]??-100)+68)/47)**1.35*Math.exp(-back/5));}return v;});
 const values=raw.map((_,i)=>{let total=0,weight=0;for(let j=-2;j<=2;j++){const w=3-Math.abs(j);total+=raw[Math.max(0,Math.min(63,i+j))]!*w;weight+=w;}return total/weight;});
 const tier=section==='Final chorus'?1.08:section.includes('Chorus')?.96:section==='Bridge'?.78:.63;
 return {values,barMax:(format==='portrait'?98:80)*tier,tail:clamp((data.duration-.12-t)/1.7),section};
}
export function railGeometry(format:Format){return format==='landscape'?{cx:515,y:845,width:700}:{cx:540,y:1736,width:792};}
export function ribbonPath(values:number[],max:number,format:Format){
 const g=railGeometry(format),points=values.map((v,i)=>({x:g.cx-g.width/2+g.width*i/63,y:g.y-Math.sin(i/63*Math.PI*4)*v*max*Math.sin(i/63*Math.PI)**.6}));
 let path=`M${points[0]!.x} ${g.y}`;
 for(let i=1;i<points.length-1;i++){const a=points[i]!,b=points[i+1]!;path+=`Q${a.x.toFixed(3)} ${a.y.toFixed(3)} ${((a.x+b.x)/2).toFixed(3)} ${((a.y+b.y)/2).toFixed(3)}`;}
 const last=points.at(-1)!;return path+`T${last.x} ${g.y}`;
}
export function lyricMarkup(frame:number,format:Format,data:ProductionData,layouts:Layouts){
 const cue=visibleCue(data,frame);if(!cue)return '';
 const geometry=layouts[format].cues[cue.id];if(!geometry)throw Error('Missing layout '+cue.id);
 const source=activeDisplaySource(cue,frame,data),target=activeTargets(cue,frame,data);
 return (['ru','en'] as const).flatMap(language=>geometry[language].map(w=>`<text data-word="${w.id}" data-language="${language}" x="${w.x}" y="${w.y}" fill="${(language==='ru'?source:target).has(w.id)?palette.active:palette.rest}">${escape(w.text)}</text>`)).join('');
}
export function sceneSvg(frame:number,format:Format,data:ProductionData,layouts:Layouts,bands:number[][]){
 const l=layouts[format],d=dynamics(frame,format,data,bands),p=format==='portrait';
 const art=p?{x:80,y:91,w:920}:{x:1050,y:142,w:775},center={x:art.x+art.w/2,y:art.y+art.w/2};
 const title=p?`<text x="540" y="1100" text-anchor="middle" font-size="27" letter-spacing="2.3" fill="${palette.active}">ЛЮБИ МЕНЯ, ЛЮБИ</text>`:`<g text-anchor="middle"><text x="515" y="182" font-size="26" letter-spacing="7" fill="${palette.active}">ГРЕЧКА</text><text x="515" y="254" font-size="47" letter-spacing="1.4" fill="${palette.ink}">Люби меня, люби</text></g>`;
 return `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${l.width}" height="${l.height}" viewBox="0 0 ${l.width} ${l.height}" role="img" aria-label="Гречка — Люби меня, люби; Russian and English lyric preview">
 <defs><linearGradient id="paper-tone" x2="1" y2="1"><stop stop-color="#f6e8e2"/><stop offset="1" stop-color="${palette.paper}"/></linearGradient><pattern id="paper-grain" width="11" height="13" patternUnits="userSpaceOnUse"><circle cx="2" cy="4" r=".6" fill="${palette.ink}" opacity=".045"/><circle cx="8" cy="10" r=".35" fill="${palette.active}" opacity=".06"/></pattern></defs>
 <rect width="100%" height="100%" fill="url(#paper-tone)"/><rect width="100%" height="100%" fill="url(#paper-grain)"/>
 <g data-artwork="" transform="rotate(-2 ${center.x} ${center.y})"><rect x="${art.x-14}" y="${art.y-11}" width="${art.w+39}" height="${art.w+43}" fill="${palette.ink}" opacity=".07"/><rect x="${art.x-18}" y="${art.y-18}" width="${art.w+36}" height="${art.w+36}" fill="#faeee8"/><image href="/public/artwork.png" xlink:href="/public/artwork.png" x="${art.x}" y="${art.y}" width="${art.w}" height="${art.w}"/></g>
 <g font-family="LyubiSans" font-weight="500">${title}<g data-lyrics="" font-size="${l.fontSize}" style="font-kerning:none">${lyricMarkup(frame,format,data,layouts)}</g></g>
 <g data-spectrum="" fill="none" stroke="${palette.active}" stroke-linecap="round" opacity="${.72*d.tail}"><path data-ribbon="" d="${ribbonPath(d.values,d.barMax,format)}" stroke-width="${p?4:3.1}"/></g>
 <text x="${p?540:515}" y="${p?1850:977}" text-anchor="middle" font-family="LyubiSans" font-size="${p?19:17}" letter-spacing="2.1" fill="${palette.ink}" opacity=".52">ГРЕЧКА · ЗВЁЗДЫ ТОЛЬКО НОЧЬЮ</text>
 </svg>`;
}
