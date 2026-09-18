import {bundle} from '@remotion/bundler';import {getCompositions,renderStill} from '@remotion/renderer';
import {createCanvas,loadImage} from '@napi-rs/canvas';import {mkdirSync,writeFileSync} from 'node:fs';
const film=await bundle({entryPoint:'src/Film.tsx'}),still=await bundle({entryPoint:'src/StillRoot.tsx'}),films=await getCompositions(film),stills=await getCompositions(still),results=[];
mkdirSync('evidence/stills/adapter',{recursive:true});
for(const format of ['landscape','portrait'] as const)for(const at of [8,46.8,103.5,170]){
 const a=films.find(c=>c.id===format)!,b=stills.find(c=>c.id===(format==='landscape'?'PreviewLandscape':'PreviewPortrait'))!,paths=[];
 for(const [kind,serveUrl,composition,frame,inputProps] of [['film',film,a,Math.round(at*60),{format}],['still',still,b,0,{format,at}]] as const){const output=`evidence/stills/adapter/${format}-${at}-${kind}.png`;await renderStill({serveUrl,composition:{...composition,props:inputProps},frame,inputProps,output,imageFormat:'png',logLevel:'warn'});paths.push(output);}
 const buffers=[];for(const path of paths){const image=await loadImage(path),canvas=createCanvas(image.width,image.height),ctx=canvas.getContext('2d');ctx.drawImage(image,0,0);buffers.push(Buffer.from(ctx.getImageData(0,0,image.width,image.height).data));}
 let differences=0;for(let i=0;i<buffers[0]!.length;i++)if(buffers[0]![i]!==buffers[1]![i])differences++;
 results.push({format,at,differentChannels:differences});if(differences)throw Error('Production adapter differs from preview');console.log(format,at,'identical');
}
writeFileSync('evidence/production-adapter-equivalence.json',JSON.stringify({status:'PASS',results,method:'Decode RGBA from native PNG stills; compare production global-frame persistent painter against the approved deterministic scene at eight selected states. Zero differing channels; not an all-frame raster or acoustic certification.'},null,2)+'\n');
