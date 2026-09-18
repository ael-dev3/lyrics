import catalogue from '../public/stars-bsc5.json' with {type:'json'};
import {geometry} from './lunar-motion.ts';
import type {Format} from './schema.ts';
export const field={ra:65,dec:0,shortAxisDegrees:54,orientation:'north up, east left',epoch:'FK5 J2000.0'} as const;
const rad=Math.PI/180,clamp=(v:number)=>Math.max(0,Math.min(1,v));
export function project(ra:number,dec:number){
 const d=dec*rad,d0=field.dec*rad,delta=(ra-field.ra)*rad,den=Math.sin(d0)*Math.sin(d)+Math.cos(d0)*Math.cos(d)*Math.cos(delta);
 if(den<=0)return null;
 return {x:-Math.cos(d)*Math.sin(delta)/den,y:-(Math.cos(d0)*Math.sin(d)-Math.sin(d0)*Math.cos(d)*Math.cos(delta))/den};
}
const cache=new Map<Format,ReturnType<typeof build>>();
function build(format:Format){
 const portrait=format==='portrait',w=portrait?1080:1920,h=portrait?1920:1080,g=geometry(portrait),scale=540/Math.tan(field.shortAxisDegrees/2*rad),lower=portrait?1100:695;
 return catalogue.flatMap(s=>{const p=project(s.ra,s.dec);if(!p)return [];const x=g.cx+p.x*scale,y=g.cy+p.y*scale;if(x<8||x>w-8||y<18||y>lower||Math.hypot(x-g.cx,y-g.cy)<g.r+62)return [];
  const flux=10**(-.4*s.mag),display=Math.pow(flux,.30),edge=clamp((lower-y)/80)*clamp((y-18)/45),opacity=Math.min(.92,.10+.70*display)*edge,radius=.45+1.45*Math.min(1.4,display);
  return [{...s,x:Number(x.toFixed(3)),y:Number(y.toFixed(3)),radius:Number(radius.toFixed(3)),opacity:Number(opacity.toFixed(4)),flux}];
 });
}
export function stars(format:Format){if(!cache.has(format))cache.set(format,build(format));return cache.get(format)!;}
export function starOpacity(hr:number,base:number,frame:number){
 // Slow, small scintillation is an artistic exposure treatment, independent of audio.
 const t=frame/60,phase=hr*2.399963229728653,signal=.62*Math.sin(t*(.48+(hr%13)*.037)+phase)+.38*Math.sin(t*(.89+(hr%7)*.061)+phase*1.7);
 return Number((base*(.94+.06*signal)).toFixed(4));
}
export function starSvg(frame:number,format:Format){return '<g id="star-field">'+stars(format).map(s=>{const r=s.radius;return `<g data-star="${s.hr}"><circle opacity="${starOpacity(s.hr,s.opacity,frame)}" cx="${s.x}" cy="${s.y}" r="${(r*5).toFixed(3)}" fill="url(#star-glow)"/><circle opacity="${starOpacity(s.hr,s.opacity,frame)}" cx="${s.x}" cy="${s.y}" r="${r}" fill="#F5F5F5"/></g>`;}).join('')+'</g>';}
