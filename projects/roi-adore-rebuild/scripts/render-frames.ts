import {bundle} from '@remotion/bundler';
import {renderFrames,selectComposition} from '@remotion/renderer';
import {resolve} from 'node:path';
import {writeFileSync,mkdirSync} from 'node:fs';
const test=process.argv.includes('--test'),start=test?7440:0,end=test?8039:22762,out=resolve(test?'../frames-v3-preview':'../frames-v3');mkdirSync(out,{recursive:true});mkdirSync(out+'/ready',{recursive:true});
process.on('uncaughtException',e=>{writeFileSync('../frames-v3-failed.txt',String(e));process.exit(1);});
const serveUrl=await bundle({entryPoint:resolve('src/index.tsx')}),composition=await selectComposition({serveUrl,id:'RoiAdore',inputProps:{externalArtwork:true}}),began=Date.now();let last=0;
const result=await renderFrames({serveUrl,composition,inputProps:{externalArtwork:true},outputDir:out,imageFormat:'png',scale:2,muted:true,concurrency:8,frameRange:[start,end],onStart:info=>console.log(info),onFrameUpdate:(count,index)=>{writeFileSync(out+'/ready/'+index,'');if(Date.now()-last>10000){last=Date.now();console.log(JSON.stringify({rendered:count,total:end-start+1,seconds:(Date.now()-began)/1000}));}}});
writeFileSync(test?'../frames-v3-preview.json':'../frames-v3-complete.json',JSON.stringify({start,end,frameCount:result.frameCount,pattern:result.assetsInfo.imageSequenceName,scale:2,format:'lossless RGBA PNG',test,seconds:(Date.now()-began)/1000},null,2));console.log('FRAMES_COMPLETE');
