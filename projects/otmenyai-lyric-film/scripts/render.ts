import {bundle} from '@remotion/bundler';
import {renderMedia,renderStill,selectComposition} from '@remotion/renderer';
import {resolve} from 'node:path';
import {writeFileSync,mkdirSync} from 'node:fs';
const still=process.argv.includes('--still'),preview=process.argv.includes('--preview');
const serveUrl=await bundle({entryPoint:resolve('src/index.tsx')}),composition=await selectComposition({serveUrl,id:'Otmenyai'});
mkdirSync('evidence',{recursive:true});
if(still){for(const t of [1.8,5.7,8.4,10.6,13.8,25,64.8,123])await renderStill({serveUrl,composition,frame:Math.round(t*60),output:resolve(`evidence/style-${t}.png`),imageFormat:'png',scale:1});}
else{let last=0;const began=Date.now();await renderMedia({composition,serveUrl,outputLocation:resolve(preview?'evidence/preview-silent.mp4':'evidence/master-lossless.mkv'),codec:'h264',crf:1,x264Preset:'ultrafast',pixelFormat:'yuv444p',imageFormat:'png',colorSpace:'bt709',muted:true,scale:preview?1:2,concurrency:6,...(preview?{frameRange:[0,899] as [number,number]}:{}),ffmpegOverride:({args})=>{const a=[...args];const i=a.indexOf('-crf');if(i>=0)a[i+1]='0';return a;},onProgress:p=>{if(Date.now()-last>10000){last=Date.now();console.log(JSON.stringify({rendered:p.renderedFrames,encoded:p.encodedFrames,seconds:(Date.now()-began)/1000}));}}});writeFileSync(preview?'evidence/preview-render.json':'evidence/render.json',JSON.stringify({seconds:(Date.now()-began)/1000,scale:preview?1:2,frames:preview?900:7827,format:'lossless H264 4:4:4 intermediate from PNG frames'},null,2));}
