/** Record inspected still identities. This script does not operate a browser. */
import {readFileSync,readdirSync,statSync,writeFileSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import {currentIdentity,hashFile,projectFile} from './project-identity.ts';
const identity=currentIdentity();
const proof=JSON.parse(readFileSync(projectFile('evidence/scene-proof.json'),'utf8'));
for(const key of ['revision','sourceSha256','timelineSha256','sceneSha256'] as const)if(proof[key]!==identity[key])throw Error('Stale shared-scene proof');
const files=readdirSync(projectFile('evidence/')).filter(f=>/^preview-(landscape|portrait)-[\d.]+\.jpg$/.test(f));
const screenshots=files.map(name=>{
 const p='evidence/'+name,browser=name.startsWith('browser-'),t=Number(name.match(/-([\d.]+)\.(?:png|jpg)$/)![1]);
 const probe=JSON.parse(execFileSync('ffprobe',['-v','error','-show_entries','stream=width,height,codec_name','-of','json',projectFile(p).pathname],{encoding:'utf8'}));
 const image=probe.streams[0];if(!image||!['png','mjpeg'].includes(image.codec_name))throw Error('Unexpected still encoding');
 return {image:p,timestampSeconds:t,width:image.width,height:image.height,encoding:image.codec_name==='png'?'PNG':'JPEG',bytes:statSync(projectFile(p)).size,sha256:hashFile(p),method:browser?'Actual decoded-video browser canvas, Download still control; full unmodified PNG.':'Native shared-scene proof canvas, original artwork reference decoded at 40.000 s; complete JPEG quality 88.',
  ...(browser?{sourceFrame:1385,sourcePicturePTS:55.4}:{referenceSourceFrame:1000,referenceSourcePTS:40}),
  originalSourceUrl:'https://www.youtube.com/watch?v=sCbyEiBZyEo',originalCreator:'Элли на маковом поле and the original picture/recording creators',scope:'Visual presentation at one selected time; no production render or acoustic listening certification.'};
});
const record={...identity,status:'preview only',representative:'evidence/preview-landscape-55.43.jpg',reviewedAtNativeAndReducedSize:true,screenshots,historicalBrowser:{image:'evidence/browser-landscape-55.430.png',sourceCommit:'42882833074bc688d7a01e69f40b29287b08a7b6',scope:'Original v1 browser canvas; retained as history, excluded from current-revision proof stills.'}};
writeFileSync(projectFile('evidence/preview-stills.json'),JSON.stringify(record,null,2)+'\n');
console.log(JSON.stringify({screenshots:screenshots.length,representative:record.representative}));
