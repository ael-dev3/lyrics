import {readFileSync,writeFileSync} from 'node:fs';
const bytes=readFileSync('analysis/vocals.f32'),pcm=new Float32Array(bytes.buffer,bytes.byteOffset,bytes.byteLength/4),sr=48000;
const corr=(a:number,b:number,d:number,step=16)=>{let xy=0,xx=0,yy=0;for(let k=0;k<Math.round(d*sr);k+=step){const x=pcm[Math.round(a*sr)+k]??0,y=pcm[Math.round(b*sr)+k]??0;xy+=x*y;xx+=x*x;yy+=y*y;}return xy/Math.sqrt(Math.max(1e-15,xx*yy));};
const pairs=[];
for(const [line,start,duration] of [[1,12.58,2.0],[2,15.45,2.4],[3,18.3,1.9],[4,21.1,2.3],[5,23.9,2.3],[6,26.75,2.3],[7,29.5,1.9],[8,32.4,2.5]] as const){
 for(const target of [2,3]){const approximate=target===2?45.18:90.36;let best={shift:0,correlation:-1};
  for(let j=-600;j<=600;j++){const shift=approximate+j/2000,c= corr(start,start+shift,duration);if(c>best.correlation)best={shift,correlation:c};}
  const center=best.shift;for(let j=-24;j<=24;j++){const shift=center+j/sr,c=corr(start,start+shift,duration,4);if(c>best.correlation)best={shift,correlation:c};}
  pairs.push({line,target,referenceStart:start,duration,shiftSeconds:best.shift,correlation:best.correlation});
 }
}
writeFileSync('analysis/repeated-vocal-correlation.json',JSON.stringify({sampleRate:sr,method:'Signed normalized waveform cross-correlation, independently searched for each lyric phrase and each repeated chorus. Coarse ±300 ms at 0.5 ms resolution, then ±24 source samples at one-sample resolution. Separated vocals retain the source timeline. Evidence only; no automatic cue copying.',pairs},null,2));console.log(pairs);
