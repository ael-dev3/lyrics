import {readFileSync,writeFileSync} from 'node:fs';
const bytes=readFileSync('analysis/vocals.f32'),pcm=new Float32Array(bytes.buffer,bytes.byteOffset,bytes.byteLength/4),sr=16000;
const correlation=(a:number,b:number,duration:number,step=4)=>{let xy=0,xx=0,yy=0;const count=Math.round(duration*sr);for(let k=0;k<count;k+=step){const x=pcm[Math.round(a*sr)+k]??0,y=pcm[Math.round(b*sr)+k]??0;xy+=x*y;xx+=x*x;yy+=y*y;}return xy/Math.sqrt(Math.max(1e-15,xx*yy));};
const pairs=[];
for(const [id,start,duration] of [['midnight',42.1,4.8],['silver',50.1,4.5],['light1',57.05,1.4],['blind',58.9,2.3],['light2',65.1,1.5],['mine',66.85,3.5]] as const){
 let best={shift:0,correlation:-1};for(let k=0;k<=600;k++){const shift=48.2+k/1000,c=correlation(start,start+shift,duration,4);if(c>best.correlation)best={shift,correlation:c};}
 pairs.push({id,referenceStart:start,duration,shiftSeconds:best.shift,correlation:best.correlation});
}
writeFileSync('analysis/repeated-vocal-correlation.json',JSON.stringify({method:'Independent signed normalized waveform-correlation search per phrase, 48.2–48.8 s at 1 ms resolution; isolated vocal stem sampled every fourth sample. Supporting evidence, not an automatic cue-copy rule.',pairs},null,2));console.log(pairs);
