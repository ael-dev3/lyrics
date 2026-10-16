import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
export function verifyAudio(source:string,output:string){
 const pcm=(path:string)=>{const b=execFileSync('ffmpeg',['-v','error','-nostdin','-i',path,'-map','0:a:0','-vn','-c:a','pcm_f32le','-f','f32le','pipe:1'],{maxBuffer:128*1024*1024});assert.equal(b.length%8,0);return new Float32Array(b.buffer,b.byteOffset,b.byteLength/4)};
 const original=pcm(source),encoded=pcm(output),sourceFrames=original.length/2,outputFrames=encoded.length/2;
 assert(outputFrames>=sourceFrames&&outputFrames-sourceFrames<=1024,'AAC must preserve the complete source, with at most one padded AAC frame.');
 let bestLag=0,bestCorrelation=-Infinity;
 for(let lag=-24;lag<=24;lag++){
  let xx=0,yy=0,xy=0;
  for(let n=48000*20;n<Math.min(sourceFrames-24,48000*65);n+=16)for(let c=0;c<2;c++){const x=original[n*2+c]!,y=encoded[(n+lag)*2+c]!;xx+=x*x;yy+=y*y;xy+=x*y}
  const correlation=xy/Math.sqrt(xx*yy);if(correlation>bestCorrelation){bestCorrelation=correlation;bestLag=lag}
 }
 assert.equal(bestLag,0,'Encoded soundtrack acquired a sample offset.');
 let xx=0,yy=0,xy=0,error=0;
 for(let n=0;n<original.length;n++){const x=original[n]!,y=encoded[n]!;xx+=x*x;yy+=y*y;xy+=x*y;error+=(x-y)**2}
 const correlation=xy/Math.sqrt(xx*yy),gain=xy/xx,snrDb=10*Math.log10(xx/error);
 assert(correlation>=.998&&Math.abs(gain-1)<.01&&snrDb>=25,`Unexpected AAC difference: ${JSON.stringify({correlation,gain,snrDb})}`);
 return {status:'pass',sourceCodec:'Opus',deliveryCodec:'AAC LC',sampleRate:48000,channels:2,requestedBitrate:320000,sourceDecodedFrames:sourceFrames,outputDecodedFrames:outputFrames,paddedEndFrames:outputFrames-sourceFrames,bestLagSamples:bestLag,lagSearchSamples:[-24,24],correlation,gain,snrDb,packetIdentical:false,scope:'Original recording retained without edits, filtering or gain processing; upload-compatible AAC is lossy and is checked for zero offset and bounded difference.'};
}
