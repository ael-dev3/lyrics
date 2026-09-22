import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {createCanvas,GlobalFonts,loadImage} from '@napi-rs/canvas';
import {sceneSvg} from '../src/scene.ts';
import {parseData} from '../src/schema.ts';
import type {Layouts} from '../src/layout-types.ts';
const data=parseData(JSON.parse(readFileSync('src/cues.json','utf8')));
const layouts=JSON.parse(readFileSync('src/layout.json','utf8')) as Layouts;
const science=JSON.parse(readFileSync('public/science.json','utf8'));
GlobalFonts.registerFromPath('public/fonts/Oswald-Medium.ttf','LyubiSans');
const art='data:image/png;base64,'+readFileSync('public/artwork.png').toString('base64');
mkdirSync('evidence/preview',{recursive:true});
for(const format of ['landscape','portrait'] as const){
 const svg=sceneSvg(1992,format,data,layouts,science).replaceAll('/public/artwork.png',art);

 const l=layouts[format],canvas=createCanvas(l.width,l.height),ctx=canvas.getContext('2d');
 ctx.drawImage(await loadImage(Buffer.from(svg)),0,0);
 // The SVG rasterizer omits embedded raster images. Place the unchanged PNG
 // at the scene's exact fixed geometry; these are reference stills, not browser captures.
 const a=format==='portrait'?{x:80,y:91,w:920}:{x:1050,y:142,w:775};
 ctx.save();ctx.translate(a.x+a.w/2,a.y+a.w/2);ctx.rotate(-2*Math.PI/180);
 ctx.drawImage(await loadImage('public/artwork.png'),-a.w/2,-a.w/2,a.w,a.w);ctx.restore();
 writeFileSync(`evidence/preview/${format}-33-2.png`,canvas.toBuffer('image/png'));
}
