import assert from 'node:assert/strict';
import {bands,response,measure,SR} from './dsp.ts';
import {writeFileSync} from 'node:fs';
const errors:number[]=[];
for(const b of bands){assert(Math.abs(20*Math.log10(response(b,b.center)))<.001);for(const f of [b.low,b.high])assert(Math.abs(20*Math.log10(response(b,f))+3.0103)<.001);}
for(const i of [0,10,24,40,63]){const b=bands[i]!;const pcm=new Float32Array(SR*4*2);for(let j=0;j<pcm.length/2;j++){const x=.5*Math.sin(2*Math.PI*b.center*j/SR);pcm[j*2]=x;pcm[j*2+1]=x;}
 const mono=measure(pcm,b)[120]!;const expected=20*Math.log10(.5)-3.01029995664;errors.push(Math.abs(mono-expected));assert(Math.abs(mono-expected)<.1);
 for(let j=0;j<pcm.length/2;j++)pcm[j*2+1]=-(pcm[j*2+1]??0);const anti=measure(pcm,b)[120]!;assert(Math.abs(anti-mono)<.000001);
 for(let j=0;j<pcm.length/2;j++)pcm[j*2+1]=0;const left=measure(pcm,b)[120]!;assert(Math.abs(left-mono+3.01029995664)<.0001);
}
const silence=measure(new Float32Array(SR*2),bands[0]!);assert(silence.every(x=>x===-120));
const report={distinctBands:64,edgeCalibration:'All 128 -3 dB edges within 0.001 dB',centerGain:'64 centers within 0.001 dB',sineLevelsMaxErrorDb:Math.max(...errors),antiPhasePreserved:true,oneChannelPowerDifferenceDb:3.01029995664,silencePassed:true,method:'Zero-phase forward/backward biquad; warped edge design; stereo power aggregation'};writeFileSync('analysis/calibration.json',JSON.stringify(report,null,2));console.log(report);
