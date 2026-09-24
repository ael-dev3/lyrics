import {createHash} from 'node:crypto';
import {readFileSync,existsSync,mkdirSync,writeFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {spawnSync} from 'node:child_process';
import {bundle} from '@remotion/bundler';
import {renderMedia,renderStill,selectComposition} from '@remotion/renderer';
import {previewIdentityPaths,REVISION,SONG_ID} from '../../src/identity.ts';

// Scoped owner acceptance after explicit disclosure of incomplete granular review.
// Keep the default review gate and its incomplete evidence unchanged.
const hash=(bytes:Buffer|string)=>createHash('sha256').update(bytes).digest('hex');
const read=(p:string)=>JSON.parse(readFileSync(resolve(p),'utf8'));
const acceptance=read('work/x-wide/owner-acceptance.json');
const identity=read('evidence/preview-identity.json');
if (acceptance.song!==SONG_ID || acceptance.revision!==REVISION ||
    acceptance.authorizationId!=='rainline-v4-wide-desktop-export-2026-09-24' ||
    acceptance.reviewMode!=='owner-approved-preview' || acceptance.status!=='accepted-for-production' ||
    acceptance.fullRenderAuthorized!==true || !acceptance.evidenceBasis || !acceptance.coverageLimit ||
    acceptance.previewIdentitySha256!==identity.identitySha256 ||
    identity.identitySha256!==hash(JSON.stringify(identity.hashes))) throw new Error('Current-preview scoped authorization missing');
if (JSON.stringify(Object.keys(identity.hashes).sort())!==JSON.stringify([...previewIdentityPaths].sort())) throw new Error('Preview inventory mismatch');
for (const path of previewIdentityPaths) if (hash(readFileSync(path))!==identity.hashes[path] || acceptance.hashes[path]!==identity.hashes[path]) throw new Error(`Approved input changed: ${path}`);
for (const path of ['work/x-wide/Scene.tsx','work/x-wide/entry.tsx','work/x-wide/render.ts']) if (hash(readFileSync(path))!==acceptance.rendererHashes[path]) throw new Error(`Delivery renderer changed: ${path}`);
const proof=process.argv.includes('--proof');
if(!proof&&!process.argv.includes('--production')) throw new Error('Choose --proof or --production');
const browser={browserExecutable:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',chromeMode:'chrome-for-testing' as const};
const serveUrl=await bundle({entryPoint:resolve('work/x-wide/entry.tsx'),publicDir:resolve('public')});
const inputProps={deliveryPermit:true};
const composition=await selectComposition({serveUrl,id:'Rainline-X-Wide',inputProps,...browser});
if(composition.width!==1920||composition.height!==1080||composition.fps!==30||composition.durationInFrames!==7418)throw new Error('Unexpected X composition');
if(proof){
 for(const time of [12,48.8,101,177,184]) await renderStill({serveUrl,composition,inputProps,frame:Math.round(time*30),output:resolve(`work/x-wide/proof-${time}.png`),...browser});
 console.log('X frame proofs ready');
}else{
 const folder=resolve('../../../../outputs');
 mkdirSync(folder,{recursive:true});
 const picture=resolve('work/x-wide/Rainline-X-Wide-picture.mp4'),output=resolve(folder,'Rainline-X-Wide.mp4');
 if(existsSync(picture)||existsSync(output))throw new Error('Refusing to overwrite existing export');
 let last=0;
 await renderMedia({serveUrl,composition,inputProps,...browser,outputLocation:picture,codec:'h264',pixelFormat:'yuv420p',imageFormat:'png',colorSpace:'bt709',crf:16,x264Preset:'slow',encodingMaxRate:'20M',encodingBufferSize:'40M',gopSize:60,muted:true,concurrency:8,onProgress:p=>{if(Date.now()-last>10000){last=Date.now();console.log(JSON.stringify({progress:p.progress,renderedFrames:p.renderedFrames,encodedFrames:p.encodedFrames}));}}});
 const mux=spawnSync('ffmpeg',['-hide_banner','-v','error','-i',picture,'-i',resolve('public/soundtrack.m4a'),'-map','0:v:0','-map','1:a:0','-c:v','copy','-c:a','copy','-movflags','+faststart','-n',output],{stdio:'inherit'});
 if(mux.status!==0)throw new Error('Final audio assembly failed');
 writeFileSync('work/x-wide/render-result.json',JSON.stringify({output,previewIdentitySha256:identity.identitySha256,authorizationId:acceptance.authorizationId,rendererHashes:acceptance.rendererHashes,finishedAt:new Date().toISOString()},null,2)+'\n');
 console.log(`Final export: ${output}`);
}
