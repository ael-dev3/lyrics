import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {readFileSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {resolve,basename} from 'node:path';
import {createApprovedPainter,rawFrames,watchChild,sourceFrameForOutput,renderClock,fileHash,root,type Recording} from './render-production.ts';
import type {Timeline,Format} from '../src/model.ts';
import {checkCurrentProductionGate} from './render-gate.ts';
process.chdir(root);checkCurrentProductionGate();
const read=(p:string)=>JSON.parse(readFileSync(p,'utf8'));
const identity=read('evidence/preview-inputs.json'),timeline=read('public/timeline.json') as Timeline;
const recording=read('source/recording.json') as Recording,clock=renderClock(recording);
const frameSet=new Set<number>([0,1,60,1950,2815,4479,9072,9903,10604,10607]);
for(const cue of timeline.cues)for(const word of cue.words){
 const first=Math.ceil(word.startSample/735),last=Math.ceil(word.endSample/735)-1,mid=Math.round((word.startSample+word.endSample)/1470);
 for(const n of [first,mid,last])if(n>=0&&n<clock.outputFrames)frameSet.add(n);
}
const frames=[...frameSet].sort((a,b)=>a-b),indices=[...new Set(frames.map(n=>sourceFrameForOutput(n,clock)))];
const selectionFor=(values:number[]):string=>values.length===1?`eq(n\\,${values[0]})`:`(${selectionFor(values.slice(0,Math.floor(values.length/2)))}+${selectionFor(values.slice(Math.floor(values.length/2)))})`;
const rendererSha256=await fileHash(resolve(root,'scripts/render-production.ts'));
const verifierSha256=await fileHash(resolve(root,'scripts/verify-decoded-scene.ts'));
const output:Record<string,unknown>={};
for(const format of ['landscape','portrait'] as Format[]){
 const filename=`Svetloe-Chuvstvo-Settlers-${format==='landscape'?'YouTube-1080x1080':'TikTok-1080x1920'}-60fps.mp4`;
 const film=resolve(root,'renders',filename),receipt=read(`renders/${filename}.json`);
 assert.equal(receipt.revision,identity.revision);assert.equal(receipt.rendererSha256,rendererSha256);
 assert.equal(receipt.sha256,await fileHash(film));
 const painter=await createApprovedPainter(format),height=format==='portrait'?1920:1080;
 const original=spawn('ffmpeg',['-hide_banner','-v','error','-nostdin','-xerror','-err_detect','explode','-threads','2','-noautorotate','-i',resolve(root,'public/source.mp4'),'-map','0:v:0','-vf',`select=${selectionFor(indices)}`,'-frames:v',String(indices.length),'-fps_mode','passthrough','-pix_fmt','rgba','-f','rawvideo','pipe:1'],{stdio:['pipe','pipe','pipe']});
 original.stdin.end();const originalDone=watchChild(original,'Original parity decoder');
 const selection=selectionFor(frames);
 const encoded=spawn('ffmpeg',['-hide_banner','-v','error','-nostdin','-xerror','-err_detect','explode','-threads','2','-i',film,
  '-map','0:v:0','-vf',`select=${selection}`,'-frames:v',String(frames.length),'-fps_mode','passthrough','-pix_fmt','rgba','-f','rawvideo','pipe:1'],{stdio:['pipe','pipe','pipe']});
 encoded.stdin.end();const encodedDone=watchChild(encoded,'Encoded parity decoder');
 const originalIterator=rawFrames(original,1080*1080*4)[Symbol.asyncIterator]();
 const encodedIterator=rawFrames(encoded,1080*height*4)[Symbol.asyncIterator]();
 const rows=[];let currentSource=-1,sourcePixels:Buffer|undefined,sourceAt=0;
 try{
  for(const [j,n] of frames.entries()){
   const native=sourceFrameForOutput(n,clock);
   if(native!==currentSource){const next=await originalIterator.next();assert.equal(next.done,false,'Missing original parity picture');sourcePixels=next.value;currentSource=indices[sourceAt++]!;assert.equal(currentSource,native);}
   const expected=painter.paint(sourcePixels!,native,n),delivered=await encodedIterator.next();assert.equal(delivered.done,false,'Missing encoded parity frame');
   const actual=delivered.value;let sum=0,maximum=0,channels=0,readingSum=0,readingChannels=0;
   // Lossy H.264/YUV pixels need bounded error, not byte equality. A 3px
   // sampling lattice includes the complete scene and protected reading area.
   for(let y=0;y<height;y+=3)for(let x=0;x<1080;x+=3){const offset=(y*1080+x)*4;for(let c=0;c<3;c++){
    const error=Math.abs(actual[offset+c]!-expected[offset+c]!);sum+=error;maximum=Math.max(maximum,error);channels++;
    if(y<(format==='portrait'?500:165)){readingSum+=error;readingChannels++;}
   }}
   const meanAbsoluteRgbError=sum/channels,readingMeanAbsoluteRgbError=readingSum/readingChannels;
   assert.ok(meanAbsoluteRgbError<5,`${format} frame${n}: complete-scene pixel disagreement ${meanAbsoluteRgbError}`);
   assert.ok(readingMeanAbsoluteRgbError<7,`${format} frame${n}: reading-area pixel disagreement ${readingMeanAbsoluteRgbError}`);
   rows.push({frame:n,sourceFrame:native,seconds:n/60,meanAbsoluteRgbError,readingMeanAbsoluteRgbError,maximumSampledChannelError:maximum});
   if(j%75===0)console.log(JSON.stringify({format,phase:'decoded-scene parity',checked:j+1,total:frames.length}));
  }
  assert.equal((await originalIterator.next()).done,true);assert.equal((await encodedIterator.next()).done,true);
  await originalDone;await encodedDone;
 }catch(error){original.kill('SIGTERM');encoded.kill('SIGTERM');const failures=await Promise.allSettled([originalDone,encodedDone]);for(const failure of failures)if(failure.status==='rejected')console.error(String(failure.reason));throw error;}
 const focusFor=(n:number)=>{const sample=n*735,cue=timeline.cues.find(c=>c.words.some(w=>sample>=w.startSample&&sample<w.endSample));return cue?{cue:cue.id,russian:cue.words.filter(w=>sample>=w.startSample&&sample<w.endSample).map(w=>w.text),english:cue.targets.filter(target=>target.focusSourceIndices.some(i=>sample>=cue.words[i]!.startSample&&sample<cue.words[i]!.endSample)).map(t=>t.text)}:null;};
 output[format]={file:basename(film),sha256:await fileHash(film),sampledFrames:rows.length,
  maximumMeanAbsoluteRgbError:Math.max(...rows.map(r=>r.meanAbsoluteRgbError)),maximumReadingMeanAbsoluteRgbError:Math.max(...rows.map(r=>r.readingMeanAbsoluteRgbError)),rows:rows.map(row=>({...row,expectedFocus:focusFor(row.frame)}))};
}
checkCurrentProductionGate();assert.equal(rendererSha256,await fileHash(resolve(root,'scripts/render-production.ts')));
writeFileSync('evidence/decoded-scene-verification.json',JSON.stringify({schemaVersion:1,status:'passed',checkedAt:new Date().toISOString(),revision:identity.revision,
 sourceSha256:identity.sourceSha256,approvedInputHashes:identity.inputs,rendererSha256,verifierSha256,
 scope:'Both actual encoded films are decoded at first/mid/last active frames of every Russian word plus representative intro/light/ending frames. Corresponding actual original source pictures feed the unchanged shared scene at n/60. A3px RGB sampling lattice checks full scene and reading-area mean error against bounded lossy-codec tolerances. Expected focus states aid review; approximate image error is not OCR or acoustic listening.',
 thresholds:{completeMeanAbsoluteRgbError:5,readingMeanAbsoluteRgbError:7,latticeStepPixels:3},selectedFrames:frames.length,formats:output},null,2)+'\n');
console.log(JSON.stringify({status:'passed',selectedFramesPerFormat:frames.length,report:'evidence/decoded-scene-verification.json'}));
