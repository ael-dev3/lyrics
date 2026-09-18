import {bundle} from '@remotion/bundler';import {getCompositions,renderStill} from '@remotion/renderer';import {loadImage,createCanvas} from '@napi-rs/canvas';import {mkdirSync,writeFileSync} from 'node:fs';import {compositor} from './raster-compose.ts';
const serveUrl=await bundle({entryPoint:'src/StillRoot.tsx'}),compositions=await getCompositions(serveUrl),results=[];mkdirSync('evidence/stills/raster-proof',{recursive:true});
for(const format of (process.argv[2]?[process.argv[2]]:['landscape','portrait']) as ('landscape'|'portrait')[]){const c=await compositor(format);for(const at of [8,46.8,103.5,170]){
 const frame=Math.round(at*60),start=performance.now(),canvas=await c.paint(frame),paintMs=performance.now()-start,output=`evidence/stills/raster-proof/${format}-${at}-cached.png`;writeFileSync(output,canvas.toBuffer('image/png'));
 const composition=compositions.find(c=>c.id===(format==='landscape'?'PreviewLandscape':'PreviewPortrait'))!,reference=`evidence/stills/raster-proof/${format}-${at}-direct.png`;
 await renderStill({serveUrl,composition:{...composition,props:{format,at}},inputProps:{format,at},output:reference,imageFormat:'png',scale:2,logLevel:'warn'});
 const image=await loadImage(reference),ref=createCanvas(image.width,image.height),ctx=ref.getContext('2d');ctx.drawImage(image,0,0);const a=canvas.getContext('2d').getImageData(0,0,canvas.width,canvas.height).data,b=ctx.getImageData(0,0,image.width,image.height).data;
 let max=0,sum=0,over4=0,over16=0;for(let p=0;p<a.length;p+=4){let m=0;for(let j=0;j<3;j++){const d=Math.abs(a[p+j]!-b[p+j]!);sum+=d;max=Math.max(max,d);m=Math.max(m,d);}if(m>4)over4++;if(m>16)over16++;}
 const pixels=canvas.width*canvas.height,result={format,at,paintMs,maxChannelDifference:max,meanChannelDifference:sum/(pixels*3),pixelsOver4:over4,pixelsOver16:over16,pixelCount:pixels};results.push(result);console.log(result);
}}
writeFileSync('evidence/'+(process.argv[2]?process.argv[2]+'-':'')+'raster-compositor-proof.json',JSON.stringify({results,scope:'2× RGBA comparison with direct approved SVG rendering. Results require assessment before adopting the optimized compositor.'},null,2)+'\n');
