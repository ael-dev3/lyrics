import {bundle} from '@remotion/bundler';
import {renderMedia,renderStill,selectComposition,makeCancelSignal} from '@remotion/renderer';
import {resolve} from 'node:path';
import {mkdirSync,writeFileSync} from 'node:fs';
import {FPS,FRAMES} from '../src/config.ts';
const part=Number(process.argv.find(a=>a.startsWith('--part='))?.split('=')[1]??0);
const portrait=process.argv.includes('--portrait'),still=process.argv.includes('--still'),preview=process.argv.includes('--preview'),kind=portrait?'tiktok':'youtube';
const previewStart=Number(process.argv.find(a=>a.startsWith('--start='))?.split('=')[1]??40),previewSeconds=Number(process.argv.find(a=>a.startsWith('--seconds='))?.split('=')[1]??15);
const scale=Number(process.argv.find(a=>a.startsWith('--scale='))?.split('=')[1]??(preview?1:2));
const serveUrl=await bundle({entryPoint:resolve('src/index.tsx')}),composition=await selectComposition({serveUrl,id:portrait?'MidnightTikTok':'MidnightYouTube'});
const {cancelSignal,cancel}=makeCancelSignal();process.once('SIGINT',cancel);process.once('SIGTERM',cancel);
mkdirSync('evidence',{recursive:true});
if(still){const times=(process.argv.find(a=>a.startsWith('--times='))?.split('=')[1]??'7,17,44,52,86.5,108,141,172').split(',').map(Number);for(const t of times)await renderStill({serveUrl,composition,cancelSignal,frame:Math.round(t*FPS),output:`evidence/${kind}-${t}.png`,imageFormat:'png'});}
else{
 const half=Math.ceil(FRAMES/2),range:[number,number]=preview?[Math.round(previewStart*FPS),Math.round((previewStart+previewSeconds)*FPS)-1]:part===1?[0,half-1]:part===2?[half,FRAMES-1]:[0,FRAMES-1];
 const name=preview?`preview-${previewStart}`:part?'part-'+part:'master-lossless';let last=0;const started=Date.now();
 await renderMedia({serveUrl,composition,cancelSignal,outputLocation:`evidence/${kind}-${name}.mkv`,codec:'h264',crf:1,x264Preset:'ultrafast',pixelFormat:'yuv444p',imageFormat:'png',colorSpace:'bt709',muted:true,scale,concurrency:part?3:4,frameRange:range,ffmpegOverride:({args})=>{const a=[...args],i=a.indexOf('-crf');if(i>=0)a[i+1]='0';return a;},onProgress:p=>{if(Date.now()-last>10000){last=Date.now();console.log(JSON.stringify({kind,rendered:p.renderedFrames,encoded:p.encodedFrames,seconds:(Date.now()-started)/1000}));}}});
 writeFileSync(`evidence/${kind}-${name}.json`,JSON.stringify({seconds:(Date.now()-started)/1000,scale,range,frames:range[1]-range[0]+1},null,2));
}
