import fs from 'node:fs';
import {createCanvas,loadImage,GlobalFonts} from '@napi-rs/canvas';
import {parseTimeline,parseFeatures} from '../src/model.ts';
import {initializeScene,paintScene,COMPOSITION,type Surface} from '../src/scene.ts';
const root=new URL('../',import.meta.url),read=(p:string)=>JSON.parse(fs.readFileSync(new URL(p,root),'utf8'));
GlobalFonts.registerFromPath(new URL('public/fonts/Cormorant.ttf',root).pathname,'Cormorant');
const source=await loadImage(new URL('public/artwork-reference.png',root).pathname);
initializeScene(parseTimeline(read('public/timeline.json')),parseFeatures(read('public/audio-features.json')),(w,h)=>{const c=createCanvas(w,h);return {canvas:c,context:c.getContext('2d')} as unknown as Surface},source as unknown as CanvasImageSource);
for(const format of ['landscape','portrait'] as const)for(const time of [0,18.8,28.8,36.8,45.8,64.4,85.8,94.5,119.8,138.2,163.5,186.5,194.5]){
 const p=COMPOSITION[format],c=createCanvas(p.width,p.height);paintScene(c.getContext('2d') as unknown as CanvasRenderingContext2D,time,format,source as unknown as CanvasImageSource);
 fs.writeFileSync(new URL(`analysis/preview-${format}-${time}.jpg`,root),c.toBuffer('image/jpeg',92));
}
console.log('26 diagnostic stills; no film was encoded.');
