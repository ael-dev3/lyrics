import {bundle} from '@remotion/bundler';
import {renderMedia,renderStill,selectComposition,makeCancelSignal} from '@remotion/renderer';
import {resolve} from 'node:path';
import {mkdirSync,writeFileSync} from 'node:fs';
const part=Number(process.argv.find(a=>a.startsWith('--part='))?.split('=')[1]??0);
const portrait=process.argv.includes('--portrait'),still=process.argv.includes('--still'),preview=process.argv.includes('--preview'),kind=portrait?'tiktok':'youtube';
const serveUrl=await bundle({entryPoint:resolve('src/index.tsx')}),composition=await selectComposition({serveUrl,id:portrait?'PozharyTikTok':'PozharyYouTube'});
const {cancelSignal,cancel}=makeCancelSignal();process.once('SIGINT',cancel);process.once('SIGTERM',cancel);
mkdirSync('evidence',{recursive:true});
if(still){for(const t of [1.0,7.5,16.2,29,43.6,59.3,94.3,104,126.5])await renderStill({serveUrl,composition,cancelSignal,frame:Math.round(t*60),output:`evidence/${kind}-${t}.png`,imageFormat:'png'});}
else{let last=0;const started=Date.now();await renderMedia({serveUrl,composition,cancelSignal,outputLocation:`evidence/${kind}-${preview?'preview':part?'part-'+part:'master-lossless'}.mkv`,codec:'h264',crf:1,x264Preset:'ultrafast',pixelFormat:'yuv444p',imageFormat:'png',colorSpace:'bt709',muted:true,scale:preview?1:2,concurrency:part?3:6,...(part?{frameRange:(part===1?[0,4499]:[4500,9000]) as [number,number]}:{}),...(preview?{frameRange:[36*60,51*60-1] as [number,number]}:{}),ffmpegOverride:({args})=>{const a=[...args],i=a.indexOf('-crf');if(i>=0)a[i+1]='0';return a;},onProgress:p=>{if(Date.now()-last>10000){last=Date.now();console.log(JSON.stringify({kind,rendered:p.renderedFrames,encoded:p.encodedFrames,seconds:(Date.now()-started)/1000}));}}});writeFileSync(`evidence/${kind}-${preview?'preview':part?'part-'+part:'render'}.json`,JSON.stringify({seconds:(Date.now()-started)/1000,scale:preview?1:2,frames:preview?900:part===1?4500:part===2?4501:9001},null,2));}
