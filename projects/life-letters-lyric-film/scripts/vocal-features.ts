import {readFileSync,writeFileSync} from 'node:fs';
const b=readFileSync('analysis/vocals16.f32');
const x=new Float32Array(b.buffer,b.byteOffset,b.byteLength/4),sr=16000,hop=80,window=400;
const frames=Math.ceil(x.length/hop),envelope:number[]=[],onsets:number[]=[];
for(let f=0;f<frames;f++){
 const c=f*hop,a=Math.max(0,c-window/2),z=Math.min(x.length,c+window/2);let power=0;
 for(let i=a;i<z;i++)power+=(x[i]??0)**2;
 envelope.push(10*Math.log10(Math.max(1e-12,power/(z-a))));
}
for(let f=3;f<frames-3;f++){
 const val=envelope[f]??-120,previous=envelope[f-3]??val;
 if(val-previous>4&&val>-35&&val>=(envelope[f+1]??val))onsets.push(f*hop/sr);
}
writeFileSync('analysis/vocal-envelope-5ms.json',JSON.stringify({sr,hop,window,unit:'dBFS RMS',envelope,onsets}));
const motion=Array.from({length:Math.ceil(x.length/sr*60)},(_,f)=>{
 const i=Math.round(f/60*sr/hop),db=envelope[i]??-100;
 return Math.round(Math.max(0,Math.min(1,(db+48)/39))*1000)/1000;
});
writeFileSync('public/vocal-motion.json',JSON.stringify(motion));
