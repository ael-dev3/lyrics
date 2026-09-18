import {bundle} from '@remotion/bundler';import {selectComposition,renderFrames} from '@remotion/renderer';
import {createCanvas,loadImage} from '@napi-rs/canvas';import {readFileSync,writeFileSync,mkdirSync,readdirSync} from 'node:fs';import {createHash} from 'node:crypto';import {rasterEntries} from '../src/raster-inventory.ts';
const format=process.argv[2];if(format!=='landscape'&&format!=='portrait')throw Error('Expected format');
const repair=process.argv.includes('--repair-labels');const root='output/raster-cache/'+format;const rawDir=root+(repair?'/labels-fix':'/raw');mkdirSync(rawDir,{recursive:true});const serveUrl=await bundle({entryPoint:'src/RasterCache.tsx'}),composition=await selectComposition({serveUrl,id:'cache-'+format}),started=Date.now();
await renderFrames({serveUrl,composition,inputProps:{format},onStart:()=>{},outputDir:rawDir,frameRange:repair?[1,1]:[0,rasterEntries.length-1],imageFormat:'png',scale:2,concurrency:2,onFrameUpdate:n=>{if(n%10===0)console.log(format,n+'/'+rasterEntries.length)},logLevel:'warn'});
const files=readdirSync(rawDir).filter(x=>x.endsWith('.png')).sort();if(files.length!==(repair?1:rasterEntries.length))throw Error('Cache inventory mismatch');const inventory=repair?JSON.parse(readFileSync(root+'/inventory.json','utf8')).entries:[];
for(const [i,entry] of (repair?[rasterEntries[1]!]:rasterEntries).entries()){
 const image=await loadImage(rawDir+'/'+files[i]),canvas=createCanvas(image.width,image.height),ctx=canvas.getContext('2d');ctx.drawImage(image,0,0);const pixels=ctx.getImageData(0,0,image.width,image.height).data;
 let left=image.width,right=0,top=image.height,bottom=0;for(let y=0;y<image.height;y++)for(let x=0;x<image.width;x++)if(pixels[(y*image.width+x)*4+3]){left=Math.min(left,x);right=Math.max(right,x);top=Math.min(top,y);bottom=Math.max(bottom,y);}
 if(right<left||bottom<top)throw Error('Empty layer '+entry.key);
 const w=right-left+1,h=bottom-top+1,crop=createCanvas(w,h);crop.getContext('2d').drawImage(canvas,left,top,w,h,0,0,w,h);const bytes=crop.toBuffer('image/png'),file=entry.key+'.png';writeFileSync(root+'/'+file,bytes);const item={...entry,file,x:left,y:top,width:w,height:h,sha256:createHash('sha256').update(bytes).digest('hex')};if(repair)inventory[1]=item;else inventory.push(item);
}
writeFileSync(root+'/inventory.json',JSON.stringify({format,scale:2,width:composition.width*2,height:composition.height*2,entries:inventory,elapsedSeconds:(Date.now()-started)/1000},null,2)+'\n');console.log(format,'cache complete');
