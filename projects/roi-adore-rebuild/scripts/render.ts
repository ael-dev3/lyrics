import {bundle} from '@remotion/bundler';
import {renderMedia,selectComposition} from '@remotion/renderer';
import {resolve} from 'node:path';
import {writeFileSync} from 'node:fs';
const test=process.argv.includes('--test');
const started=Date.now();
const serveUrl=await bundle({entryPoint:resolve('src/index.tsx')});
const composition=await selectComposition({serveUrl,id:'RoiAdore',inputProps:{externalArtwork:true}});
let last=0;
await renderMedia({composition,serveUrl,inputProps:{externalArtwork:true},outputLocation:resolve(test?'../reference-test-external.mp4':'../reference-4k.mp4'),codec:'h264',crf:1,x264Preset:'ultrafast',pixelFormat:'yuv444p',imageFormat:'png',colorSpace:'bt709',muted:true,scale:2,concurrency:8,...(test?{frameRange:[7440,7559] as [number,number]}:{}),
 // Lossless x264 is a private intermediate, never the public Apple playback file.
 ffmpegOverride:({args})=>{const copy=[...args];const i=copy.indexOf('-crf');if(i>=0)copy[i+1]='0';return copy;},
 onProgress:p=>{if(Date.now()-last>10000){last=Date.now();console.log(JSON.stringify({rendered:p.renderedFrames,encoded:p.encodedFrames,elapsedSeconds:(Date.now()-started)/1000}));}}
});
const result={seconds:(Date.now()-started)/1000,scale:2,codec:'x264 lossless 4:4:4',test};writeFileSync(test?'../render-test.json':'../render-final.json',JSON.stringify(result,null,2));console.log(result);
