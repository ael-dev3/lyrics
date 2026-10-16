import {createCanvas,loadImage,GlobalFonts} from '@napi-rs/canvas';
import {mkdirSync,readFileSync,writeFileSync} from 'node:fs';
import {initializeScene,paintScene,COMPOSITION,type Surface,type Format} from '../src/scene.ts';
import {parseTimeline,parseFeatures} from '../src/model.ts';
const root=new URL('../',import.meta.url);
GlobalFonts.registerFromPath(new URL('public/fonts/Cormorant.ttf',root).pathname,'Cormorant');
const source=await loadImage(new URL('public/artwork-reference.png',root).pathname);
const t=parseTimeline(JSON.parse(readFileSync(new URL('public/timeline.json',root),'utf8'))),f=parseFeatures(JSON.parse(readFileSync(new URL('public/audio-features.json',root),'utf8')));
initializeScene(t,f,(w,h)=>{const canvas=createCanvas(w,h);return {canvas,context:canvas.getContext('2d')} as unknown as Surface},source as unknown as CanvasImageSource);
mkdirSync(new URL('review/stills/',root),{recursive:true});
for(const format of ['landscape','portrait'] as Format[])for(const time of [1.2,24.3,43.5,55.6,85.8,133,158.7,194.5,201,220]){
 const p=COMPOSITION[format],c=createCanvas(p.width,p.height);
 paintScene(c.getContext('2d') as unknown as CanvasRenderingContext2D,time,format,source as unknown as CanvasImageSource);
 writeFileSync(new URL(`review/stills/${format}-${time.toFixed(1)}.png`,root),c.toBuffer('image/png'));
}
console.log('20 shared-scene stills saved. These are preview illustrations, not encoded-film evidence.');
