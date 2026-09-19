import {bundle} from '@remotion/bundler';
import {getCompositions,renderStill} from '@remotion/renderer';
import {mkdirSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
// Diagnostic stills only: no production video capture or encoding.
const requested=process.argv.slice(2).map(Number);
const moments=requested.length?requested:[2.35,161/60,198.75,264,286.9,289.6,292];
if(moments.some(at=>!Number.isFinite(at)||at<0||at>294))throw Error('Invalid diagnostic time');
mkdirSync('public/diagnostic-frames',{recursive:true});
mkdirSync('evidence/stills',{recursive:true});
for(const at of moments)execFileSync('ffmpeg',['-hide_banner','-loglevel','error','-y','-ss',String(at),'-i','public/source.mp4','-frames:v','1','public/diagnostic-frames/'+at+'.png']);
const serveUrl=await bundle({entryPoint:'src/StillRoot.tsx'}),comps=await getCompositions(serveUrl);
for(const format of ['landscape','portrait'] as const)for(const at of moments){
 const composition=comps.find(c=>c.id===(format==='landscape'?'PreviewLandscape':'PreviewPortrait'));
 if(!composition)throw Error('Missing diagnostic composition');
 await renderStill({serveUrl,composition:{...composition,props:{format,at}},inputProps:{format,at},output:`evidence/stills/v3-${format}-${Math.round(at*60)}.png`,imageFormat:'png',logLevel:'warn'});
 console.log(format,at);
}
