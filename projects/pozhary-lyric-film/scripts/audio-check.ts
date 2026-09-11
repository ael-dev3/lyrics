import {readFileSync,writeFileSync} from 'node:fs';
import assert from 'node:assert/strict';
const read=(p:string)=>{const b=readFileSync(p);return new Float32Array(b.buffer,b.byteOffset,b.length/4);};
const source=read('analysis/audio.f32'),delivery=read('analysis/audio-delivery.f32'),sr=48000;
assert.equal(source.length,delivery.length);
const rows=[];
for(const second of [1,19,42,60,77,95,110,131,144]){
 const start=Math.round(second*sr),count=sr/2;let best=-Infinity,bestLag=0;
 for(let lag=-96;lag<=96;lag++){
  let xy=0,xx=0,yy=0;
  for(let i=0;i<count;i+=8){const a=(source[2*(start+i)]!+source[2*(start+i)+1]!)/2,b=(delivery[2*(start+i+lag)]!+delivery[2*(start+i+lag)+1]!)/2;xy+=a*b;xx+=a*a;yy+=b*b;}
  const corr=xy/Math.sqrt(xx*yy);if(corr>best){best=corr;bestLag=lag;}
 }
 rows.push({second,bestLagSamples:bestLag,bestLagMs:bestLag/sr*1000,correlation:best});assert.equal(bestLag,0,'AAC delay at '+second);assert(best>.98);
}
const report={sourceSamples:source.length/2,deliverySamples:delivery.length/2,sampleRate:sr,gainDb:-3.2,aacBitrateTarget:320000,measuredIntegratedLUFS:-10.3,measuredTruePeakDBTP:-.9,method:'Signed waveform correlation in nine 500ms windows; exhaustive integer-sample lag search ±2ms, evaluated every eighth waveform sample. AAC padding trimmed to retained source length for analysis.',rows,noMeasuredDelay:true,limits:'No additional mastering or loudness normalisation. Numerical correlation is distinct from listening review.'};writeFileSync('evidence/audio-timing-check.json',JSON.stringify(report,null,2));console.log(report);
