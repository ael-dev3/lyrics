import {createCanvas,loadImage,Path2D} from '@napi-rs/canvas';import {readFileSync} from 'node:fs';
import {parseData} from '../src/schema.ts';import type {Format} from '../src/schema.ts';import {palette} from '../src/palette.ts';import {lunarState,titleOpacity,geometry,spectrum,barPath} from '../src/lunar-motion.ts';import {visibleCue,activeSource} from '../src/focus.ts';
const data=parseData(JSON.parse(readFileSync('src/cues.json','utf8'))),bands=JSON.parse(readFileSync('public/science.json','utf8')) as number[][];
type Item={key:string;file:string;x:number;y:number};
export async function compositor(format:Format){
 const root='output/raster-cache/'+format,inventory=JSON.parse(readFileSync(root+'/inventory.json','utf8')) as {width:number;height:number;entries:Item[]},canvas=createCanvas(inventory.width,inventory.height),out=createCanvas(inventory.width,inventory.height),ctx=canvas.getContext('2d'),target=out.getContext('2d'),images=new Map<string,Awaited<ReturnType<typeof loadImage>>>();
 const staticKeys=['stars','labels','moon-light','moon-atmosphere','moon-shade','title-layer'];for(const key of staticKeys){const item=inventory.entries.find(e=>e.key===key)!;images.set(key,await loadImage(root+'/'+item.file));}
 async function layer(key:string,opacity:number){if(opacity===0)return;const item=inventory.entries.find(e=>e.key===key)!;if(!item)throw Error('Missing cached state '+key);if(!images.has(key)){for(const k of images.keys())if(!staticKeys.includes(k))images.delete(k);images.set(key,await loadImage(root+'/'+item.file));}ctx.globalAlpha=opacity;ctx.drawImage(images.get(key)!,item.x,item.y);}
 return {canvas:out,async paint(frame:number){ctx.clearRect(0,0,canvas.width,canvas.height);const m=lunarState(frame,data),rounded=(n:number)=>Number(n.toFixed(4));
  await layer('stars',1);await layer('moon-atmosphere',rounded(m.haloOpacity));await layer('moon-light',rounded(m.moonOpacity));await layer('moon-shade',rounded((1-m.reveal)*.88));
  ctx.save();ctx.scale(2,2);ctx.strokeStyle=palette.halo;ctx.lineWidth=format==='portrait'?2.8:2.2;ctx.globalAlpha=.63;spectrum(frame,bands,format==='portrait').forEach((v,i)=>ctx.stroke(new Path2D(barPath(i,v,format==='portrait'))));
  const g=geometry(format==='portrait');ctx.globalAlpha=rounded(m.ripple.opacity);ctx.lineWidth=2;ctx.beginPath();ctx.arc(g.cx,g.cy,Number((g.r+20+m.ripple.progress*38).toFixed(3)),0,Math.PI*2);ctx.stroke();ctx.restore();
  await layer('labels',1);await layer('title-layer',rounded(titleOpacity(frame,data)));const cue=visibleCue(data,frame);if(cue)await layer(cue.id+'-'+([...activeSource(cue,frame,data)][0]||'idle'),1);
  target.globalAlpha=1;target.fillStyle=palette.ink;target.fillRect(0,0,out.width,out.height);target.globalAlpha=rounded(m.fade);target.drawImage(canvas,0,0);return out;
 }};
}
