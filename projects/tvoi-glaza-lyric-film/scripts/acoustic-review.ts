import {readFileSync,writeFileSync} from 'node:fs';
import {fft} from './signal.ts';
const bytes=readFileSync('analysis/vocals16.f32'),samples=new Float32Array(bytes.buffer,bytes.byteOffset,bytes.byteLength/4),sr=16000,hop=160,n=512,bins=80;
const count=Math.ceil(samples.length/hop),wave:number[][]=[],spec:number[][]=[];
for(let frame=0;frame<count;frame++){
 const center=frame*hop;let lo=0,hi=0;for(let i=center;i<Math.min(samples.length,center+hop);i++){const x=samples[i]??0;lo=Math.min(lo,x);hi=Math.max(hi,x);}wave.push([lo,hi].map(x=>Math.round(x*100000)/100000));
 const re=new Float64Array(n),im=new Float64Array(n);for(let i=0;i<n;i++)re[i]=(samples[center+i-n/2]??0)*(.5-.5*Math.cos(2*Math.PI*i/n));fft(re,im);
 spec.push(Array.from({length:bins},(_,i)=>{const frequency=80*(8000/80)**(i/(bins-1)),bin=Math.min(n/2,Math.round(frequency/sr*n));const db=20*Math.log10(Math.max(1e-9,Math.hypot(re[bin]??0,im[bin]??0)/(n/2)));return Math.round(255*Math.min(1,Math.max(0,(db+85)/75)));}));
}
writeFileSync('public/acoustic.json',JSON.stringify({sampleRate:sr,hop,window:n,bins,frequencyMin:80,frequencyMax:8000,wave,spec,note:'Isolated vocal-stem inspection aid; 32ms Hann window and 10ms hop. These pixels and stem artifacts do not establish word boundaries.'}));
