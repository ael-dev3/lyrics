import {execFileSync} from 'node:child_process';
import {bands} from './dsp.ts';
import {writeFileSync} from 'node:fs';
import assert from 'node:assert/strict';
const results=[];
for(const i of [0,24,40,63]){const b=bands[i]!,filter=`biquad=b0=${b.b0}:b1=0:b2=${-b.b0}:a0=1:a1=${b.a1}:a2=${b.a2}:precision=f64`;
 const raw=execFileSync('ffmpeg',['-v','error','-f','lavfi','-i',`aevalsrc=0.5*sin(2*PI*${b.center}*t):s=48000:d=4`,'-af',`${filter},areverse,${filter},areverse,atrim=start=1:end=3`,'-f','f64le','-'],{maxBuffer:3000000});const x=new Float64Array(raw.buffer,raw.byteOffset,raw.byteLength/8);const rms=10*Math.log10(x.reduce((s,v)=>s+v*v,0)/x.length),error=Math.abs(rms-(20*Math.log10(.5)-3.01029995664));assert(error<.05);results.push({band:i,centerHz:b.center,ffmpegDbfs:rms,errorDb:error});}
writeFileSync('analysis/independent-calibration.json',JSON.stringify({implementation:'FFmpeg biquad in float64, forward/backward, independent of TypeScript DSP kernel',results},null,2));console.log(results);
