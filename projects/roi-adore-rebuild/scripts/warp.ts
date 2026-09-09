import {readFileSync,writeFileSync} from 'node:fs';
const b=readFileSync('../vocal-analysis.f32'),pcm=new Float32Array(b.buffer,b.byteOffset,b.length/4),N=512,hop=160,sr=16000,channels=32;
const edges=Array.from({length:channels+1},(_,i)=>200*30**(i/channels));
const features:number[][]=[];
for(let f=0;f<Math.ceil(pcm.length/hop);f++){const r=new Float64Array(N),im=new Float64Array(N);for(let i=0;i<N;i++)r[i]=(pcm[f*hop+i-N/2]??0)*(.5-.5*Math.cos(2*Math.PI*i/N));for(let i=1,j=0;i<N;i++){let bit=N>>1;for(;j&bit;bit>>=1)j^=bit;j^=bit;if(i<j){const v=r[i]??0;r[i]=r[j]??0;r[j]=v;}}for(let len=2;len<=N;len*=2){const co=Math.cos(-2*Math.PI/len),si=Math.sin(-2*Math.PI/len);for(let i=0;i<N;i+=len){let wr=1,wi=0;for(let j=0;j<len/2;j++){const a=i+j,z=a+len/2,vr=(r[z]??0)*wr-(im[z]??0)*wi,vi=(r[z]??0)*wi+(im[z]??0)*wr;r[z]=(r[a]??0)-vr;im[z]=(im[a]??0)-vi;r[a]=(r[a]??0)+vr;im[a]=(im[a]??0)+vi;const w=wr*co-wi*si;wi=wr*si+wi*co;wr=w;}}}
 features.push(edges.slice(0,-1).map((lo,k)=>{let v=0;for(let j=Math.ceil(lo*N/sr);j<Math.ceil((edges[k+1]??6000)*N/sr);j++)v+=(r[j]??0)**2+(im[j]??0)**2;return Math.log(1e-7+v);}));}
writeFileSync('../vocal-features.json',JSON.stringify(features));console.log({frames:features.length});
