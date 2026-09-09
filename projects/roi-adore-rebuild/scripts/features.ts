import {readFileSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
const bytes=readFileSync(process.argv[2]??'../analysis.f32');
const pcm=new Float32Array(bytes.buffer,bytes.byteOffset,bytes.length/4);
const sr=48000, fps=60, n=4096, bands=64;
const count=Math.floor(pcm.length/2), frames=Math.ceil(count/sr*fps);
const edges=Array.from({length:bands+1},(_,i)=>20*(20000/20)**(i/bands));
const out:number[][]=[];
const real=new Float64Array(n),imag=new Float64Array(n);
for(let frame=0;frame<frames;frame++){
 const center=Math.round(frame*sr/fps); let rms=0;
 for(let i=0;i<n;i++){const p=center+i-n/2; const l=pcm[p*2]??0,r=pcm[p*2+1]??0;real[i]=(l+r)*.5*(.5-.5*Math.cos(2*Math.PI*i/n));imag[i]=0;rms+=(l*l+r*r)/(2*n);}
 for(let i=1,j=0;i<n;i++){let bit=n>>1;for(;j&bit;bit>>=1)j^=bit;j^=bit;if(i<j){const a=real[i]??0;real[i]=real[j]??0;real[j]=a;}}
 for(let len=2;len<=n;len<<=1){const a=-2*Math.PI/len;for(let i=0;i<n;i+=len){for(let j=0;j<len/2;j++){const c=Math.cos(a*j),s=Math.sin(a*j),k=i+j+len/2;const vr=(real[k]??0)*c-(imag[k]??0)*s,vi=(real[k]??0)*s+(imag[k]??0)*c;real[k]=(real[i+j]??0)-vr;imag[k]=(imag[i+j]??0)-vi;real[i+j]=(real[i+j]??0)+vr;imag[i+j]=(imag[i+j]??0)+vi;}}}
 const vals=edges.slice(0,-1).map((lo,b)=>{const hi=edges[b+1]??20000;let power=0,weight=0;for(let k=Math.max(1,Math.floor(lo*n/sr));k<=Math.ceil(hi*n/sr);k++){const hz=k*sr/n,w=Math.max(0,Math.min(hz+sr/n/2,hi)-Math.max(hz-sr/n/2,lo))/(sr/n);power+=w*((real[k]??0)**2+(imag[k]??0)**2);weight+=w;} const db=10*Math.log10(power/Math.max(weight,1e-9)/n**2+1e-12);return Math.round(Math.max(0,Math.min(1,(db+75)/55))*255);});
 out.push([...vals,Math.round(Math.min(1,Math.sqrt(rms)*4)*255)]);
}
// These are artistic controls, not calibrated scientific readouts.
const smoothed=out.map((row,f)=>row.map((_,b)=>Math.round([-2,-1,0,1,2].reduce((s,d,i)=>s+(out[Math.max(0,Math.min(frames-1,f+d))]?.[b]??0)*([1,2,3,2,1][i]??0),0)/9)));
writeFileSync(process.argv[3]??'public/features.json',JSON.stringify(smoothed));
writeFileSync('public/features-manifest.json',JSON.stringify({sr,fps,frames,sampleCount:count,fft:n,window:'periodic Hann',edges,stereo:'RMS uses both channels; artistic spectrum uses stereo sum',purpose:'artistic, normalized visual response',sourcePcmSha256:createHash('sha256').update(bytes).digest('hex')},null,2));
console.log({frames,duration:count/sr});
