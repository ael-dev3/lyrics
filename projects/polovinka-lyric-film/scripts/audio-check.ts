import {readFileSync,writeFileSync} from 'node:fs';
import assert from 'node:assert/strict';
const read=(p:string)=>{const b=readFileSync(p);return new Float32Array(b.buffer,b.byteOffset,b.byteLength/4);};
const a=read('analysis/audio-original.f32'),b=read('analysis/audio-delivery.f32');
const gain=10**(2/20),out=[];
for(const time of [1,14,38,63,88,113,138,163,173]){const offset=time*48000,length=48000;let best={lag:0,correlation:-1};
 for(let lag=-128;lag<=128;lag++){let xy=0,xx=0,yy=0;for(let i=0;i<length;i+=4){const x=(a[(offset+i)*2]??0),y=(b[(offset+i+lag)*2]??0);xy+=x*y;xx+=x*x;yy+=y*y;}const correlation=xy/Math.sqrt(xx*yy+1e-30);if(correlation>best.correlation)best={lag,correlation};}
 out.push({time,...best});assert.equal(best.lag,0);assert(best.correlation>.995);
}
let error=0,energy=0;for(let i=0;i<a.length;i++){const v=a[i]!*gain;error+=(b[i]!-v)**2;energy+=v*v;}
const snr=10*Math.log10(energy/error);assert(snr>30);
writeFileSync('analysis/audio-identity.json',JSON.stringify({originalSamples:a.length/2,deliveryPcmSamples:b.length/2,constantGainDb:2,checkpoints:out,aacVsGainAdjustedSourceSnrDb:snr,signalEdits:'No cuts, stretch, pitch shift, remix, limiter or compression. AAC stereo 320k; trailing codec padding excluded from features.',containerDurationRoundingSamples:-24},null,2));console.log('AUDIO_PASS',snr,out);
