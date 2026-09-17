import {readFileSync} from 'node:fs';
export function pcm(path:string,stride=1):Float64Array{
 const b=readFileSync(path),x=new Float32Array(b.buffer,b.byteOffset,b.byteLength/4);
 return Float64Array.from({length:Math.ceil(x.length/stride)},(_,i)=>x[i*stride]??0);
}
export function fft(real:Float64Array,imag:Float64Array,inverse=false):void{
 const n=real.length;if(n!==imag.length||(n&(n-1))!==0)throw Error('FFT length must be a power of two');
 for(let i=1,j=0;i<n;i++){let bit=n>>1;for(;j&bit;bit>>=1)j^=bit;j^=bit;if(i<j){const a=real[i]??0,b=imag[i]??0;real[i]=real[j]??0;imag[i]=imag[j]??0;real[j]=a;imag[j]=b;}}
 for(let length=2;length<=n;length*=2){const angle=(inverse?2:-2)*Math.PI/length,wr=Math.cos(angle),wi=Math.sin(angle);for(let i=0;i<n;i+=length){let cr=1,ci=0;for(let j=0;j<length/2;j++){const a=i+j,b=a+length/2,br=real[b]??0,bi=imag[b]??0,tr=cr*br-ci*bi,ti=cr*bi+ci*br,ar=real[a]??0,ai=imag[a]??0;real[a]=ar+tr;imag[a]=ai+ti;real[b]=ar-tr;imag[b]=ai-ti;const next=cr*wr-ci*wi;ci=cr*wi+ci*wr;cr=next;}}}
 if(inverse)for(let i=0;i<n;i++){real[i]=(real[i]??0)/n;imag[i]=(imag[i]??0)/n;}
}
export function correlate(template:Float64Array,search:Float64Array):Float64Array{
 const count=search.length-template.length+1;if(count<=0)throw Error('Search is shorter than template');
 const n=2**Math.ceil(Math.log2(search.length+template.length)),ar=new Float64Array(n),ai=new Float64Array(n),br=new Float64Array(n),bi=new Float64Array(n);
 const mean=template.reduce((a,b)=>a+b,0)/template.length;let energy=0;
 template.forEach((v,i)=>{ar[i]=v-mean;energy+=(v-mean)**2;});br.set(search);fft(ar,ai);fft(br,bi);
 for(let i=0;i<n;i++){const rr=ar[i]??0,ri=ai[i]??0,sr=br[i]??0,si=bi[i]??0;br[i]=sr*rr+si*ri;bi[i]=si*rr-sr*ri;}
 fft(br,bi,true);const prefix=new Float64Array(search.length+1),sum=new Float64Array(search.length+1);
 search.forEach((v,i)=>{prefix[i+1]=(prefix[i]??0)+v*v;sum[i+1]=(sum[i]??0)+v;});
 return Float64Array.from({length:count},(_,i)=>{const total=(sum[i+template.length]??0)-(sum[i]??0),e=(prefix[i+template.length]??0)-(prefix[i]??0)-total*total/template.length;return (br[i]??0)/Math.sqrt(Math.max(1e-16,e*energy));});
}
export function peaks(scores:Float64Array,sr:number,offset:number,count=8,minGap=.3){
 const s=scores.slice(),out:{time:number;score:number}[]=[];
 for(let i=0;i<count;i++){let k=0;for(let j=1;j<s.length;j++)if(Math.abs(s[j]??0)>Math.abs(s[k]??0))k=j;out.push({time:offset+k/sr,score:s[k]??0});s.fill(0,Math.max(0,k-Math.round(minGap*sr)),Math.min(s.length,k+Math.round(minGap*sr)));}
 return out;
}
export function shape(x:Float64Array,sample:number,sr:number):number[]{
 const n=1024,re=new Float64Array(n),im=new Float64Array(n);
 for(let i=0;i<n;i++)re[i]=(x[sample+i-n/2]??0)*(.5-.5*Math.cos(2*Math.PI*i/(n-1)));
 fft(re,im);for(let i=0;i<n;i++){re[i]=Math.log(1e-9+Math.hypot(re[i]??0,im[i]??0));im[i]=0;}
 fft(re,im,true);for(let i=18;i<n-17;i++){re[i]=0;im[i]=0;}fft(re,im);
 const values=Array.from({length:40},(_,i)=>re[Math.round((300+3500*i/39)/sr*n)]??0),mean=values.reduce((a,b)=>a+b,0)/values.length;
 const norm=Math.sqrt(values.reduce((a,b)=>a+(b-mean)**2,0));return values.map(v=>(v-mean)/Math.max(1e-6,norm));
}
export function cosine(a:readonly number[],b:readonly number[]){return a.reduce((sum,v,i)=>sum+v*(b[i]??0),0);}
