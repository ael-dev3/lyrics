import {readFileSync,writeFileSync} from 'node:fs';
function read(path:string){const b=readFileSync(path);return new Float32Array(b.buffer,b.byteOffset,b.length/4);}
function fft(r:Float64Array,i:Float64Array,inverse=false){const n=r.length;for(let a=1,b=0;a<n;a++){let bit=n>>1;for(;b&bit;bit>>=1)b^=bit;b^=bit;if(a<b){let t=r[a]??0;r[a]=r[b]??0;r[b]=t;t=i[a]??0;i[a]=i[b]??0;i[b]=t;}}
for(let len=2;len<=n;len*=2){const angle=(inverse?2:-2)*Math.PI/len,cr=Math.cos(angle),ci=Math.sin(angle);for(let a=0;a<n;a+=len){let wr=1,wi=0;for(let b=0;b<len/2;b++){const x=a+b,y=x+len/2,vr=(r[y]??0)*wr-(i[y]??0)*wi,vi=(r[y]??0)*wi+(i[y]??0)*wr;r[y]=(r[x]??0)-vr;i[y]=(i[x]??0)-vi;r[x]=(r[x]??0)+vr;i[x]=(i[x]??0)+vi;const next=wr*cr-wi*ci;wi=wr*ci+wi*cr;wr=next;}}}if(inverse)for(let a=0;a<n;a++){r[a]=(r[a]??0)/n;i[a]=(i[a]??0)/n;}}
const mix=read('../mix-2k.f32'),ref=read(`../${process.argv[2]??'adore'}-2k.f32`),rate=2000;
const start=Number(process.argv[3]??22.8),seconds=Number(process.argv[4]??2.5),length=Math.round(seconds*rate);
let n=1;while(n<mix.length+length)n*=2;
const ar=new Float64Array(n),ai=new Float64Array(n),br=new Float64Array(n),bi=new Float64Array(n),power=new Float64Array(mix.length+1);let bp=0;
for(let k=0;k<mix.length;k++){ar[k]=mix[k]??0;power[k+1]=(power[k]??0)+(mix[k]??0)**2;}
for(let k=0;k<length;k++){const v=ref[Math.round(start*rate)+k]??0;br[length-1-k]=v;bp+=v*v;}
fft(ar,ai);fft(br,bi);for(let k=0;k<n;k++){const r=(ar[k]??0)*(br[k]??0)-(ai[k]??0)*(bi[k]??0),im=(ar[k]??0)*(bi[k]??0)+(ai[k]??0)*(br[k]??0);ar[k]=r;ai[k]=im;}fft(ar,ai,true);
const candidates:{time:number;score:number;shift:number}[]=[];
for(let k=0;k<mix.length-length;k++){const corr=Math.abs(ar[k+length-1]??0)/Math.sqrt(bp*((power[k+length]??0)-(power[k]??0))+1e-12);if(corr>.08)candidates.push({time:k/rate,score:corr,shift:k/rate-start});}
candidates.sort((a,b)=>b.score-a.score);const selected:typeof candidates=[];for(const c of candidates)if(selected.every(s=>Math.abs(s.time-c.time)>seconds))selected.push(c);
console.log(selected.slice(0,25));writeFileSync(`../correlation-${process.argv[2]}-${start}.json`,JSON.stringify(selected));
