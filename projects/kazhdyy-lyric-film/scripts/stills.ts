import {bundle} from '@remotion/bundler';
import {getCompositions,renderStill} from '@remotion/renderer';
import {mkdirSync} from 'node:fs';
const serveUrl=await bundle({entryPoint:'src/StillRoot.tsx'});
const compositions=await getCompositions(serveUrl);
mkdirSync('evidence/stills',{recursive:true});
for(const [format,at] of [['portrait',18.55],['portrait',18.58],['portrait',18.62],['landscape',55.72],['landscape',72.2],['landscape',121.1],['portrait',55.72],['portrait',73.15],['portrait',121.1],['landscape',8],['portrait',8],['landscape',187.93],['landscape',43.75],['landscape',73.2833333333],['portrait',73.2833333333],['portrait',185.7333333333]] as const){
 const composition=compositions.find(c=>c.id===(format==='landscape'?'PreviewLandscape':'PreviewPortrait'));
 if(!composition)throw Error('Missing one-frame composition');
 await renderStill({serveUrl,composition:{...composition,props:{format,at}},inputProps:{format,at},output:`evidence/stills/${format}-${at}.png`,imageFormat:'png',logLevel:'warn'});
 console.log(format,at);
}
