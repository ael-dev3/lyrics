// Selected stills only. This command never captures or encodes a full film.
import {bundle} from '@remotion/bundler';
import {getCompositions,renderStill} from '@remotion/renderer';
import {mkdirSync,writeFileSync} from 'node:fs';
const serveUrl=await bundle({entryPoint:'src/index.ts'}),compositions=await getCompositions(serveUrl);
writeFileSync('evidence/compositions.json',JSON.stringify(compositions.map(({id,width,height,fps,durationInFrames})=>({id,width,height,fps,durationInFrames})),null,2)+'\n');
mkdirSync('evidence/stills',{recursive:true});
for(const [format,at] of [['Landscape',34.55],['Landscape',94.55],['Landscape',175.6],['Portrait',94.55],['Portrait',75.5],['Landscape',117.15],['Portrait',175.6]] as const){const composition=compositions.find(c=>c.id==='Vedmy'+format);if(!composition)throw Error('Missing composition');await renderStill({serveUrl,composition,frame:Math.round(at*60),output:`evidence/stills/${format.toLowerCase()}-${at}.png`,imageFormat:'png',logLevel:'warn'});console.log(format,at);}
