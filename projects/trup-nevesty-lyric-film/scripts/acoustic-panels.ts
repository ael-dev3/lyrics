/** Local acoustic diagnostics, never a listening attestation or a timing vote. */
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {spawnSync} from 'node:child_process';
import {createCanvas} from '@napi-rs/canvas';
const read=(p:string)=>JSON.parse(readFileSync(p,'utf8'));
const rate=16000,step=80,N=512;
function pcm(path:string){const r=spawnSync('ffmpeg',['-v','error','-nostdin','-i',path,'-ac','1','-ar',String(rate),'-c:a','pcm_f32le','-f','f32le','pipe:1'],{maxBuffer:24*1024*1024});if(r.status!==0)throw Error(r.stderr.toString());const b=r.stdout;return Float32Array.from({length:b.length/4},(_,i)=>b.readFloatLE(i*4));}
const original=pcm('analysis/mix16.wav'),vocal=pcm('analysis/vocals16.wav');
function energy(wave:Float32Array){const prefix=new Float64Array(wave.length+1);for(let i=0;i<wave.length;i++)prefix[i+1]=prefix[i]!+wave[i]!**2;return Array.from({length:Math.ceil(wave.length/step)},(_,i)=>{const a=Math.max(0,i*step-80),b=Math.min(wave.length,i*step+80);return 10*Math.log10(Math.max(1e-12,(prefix[b]!-prefix[a]!)/(b-a)));});}
const mixDb=energy(original),vocalDb=energy(vocal);
const reverse=new Uint16Array(N);for(let i=0;i<N;i++){let a=i,b=0;for(let j=0;j<9;j++){b=(b<<1)|(a&1);a>>>=1}reverse[i]=b;}
const hann=Float64Array.from({length:N},(_,i)=>.5-.5*Math.cos(2*Math.PI*i/(N-1)));
const real=new Float64Array(N),imag=new Float64Array(N);
const spectra: number[][]=[];
for(let k=0;k<mixDb.length;k++){
 const center=k*step;
 for(let i=0;i<N;i++){const p=center+i-N/2;real[reverse[i]!]=(vocal[p]??0)*hann[i]!;imag[reverse[i]!]=0;}
 for(let length=2;length<=N;length*=2){const half=length/2,angle=-2*Math.PI/length,sr=Math.cos(angle),si=Math.sin(angle);for(let a=0;a<N;a+=length){let wr=1,wi=0;for(let j=0;j<half;j++){const x=a+j,y=x+half,tr=wr*real[y]!-wi*imag[y]!,ti=wr*imag[y]!+wi*real[y]!;real[y]=real[x]!-tr;imag[y]=imag[x]!-ti;real[x]=real[x]!+tr;imag[x]=imag[x]!+ti;const next=wr*sr-wi*si;wi=wr*si+wi*sr;wr=next;}}}
 spectra.push(Array.from({length:80},(_,j)=>{const hz=100*(7000/100)**(j/79),bin=Math.min(N/2-1,Math.round(hz*N/rate));return Math.round(10*Math.log10(Math.max(1e-12,(real[bin]!**2+imag[bin]!**2)/(N*N)))*10)/10;}));
}
mkdirSync('analysis/acoustic-panels',{recursive:true});
writeFileSync('analysis/acoustic-measurements.private.json',JSON.stringify({sourceSha256:read('source/recording.json').sourceSha256,sampleRate:rate,stepSamples:step,energyWindowSamples:160,spectralWindowSamples:N,spectrumHz:{low:100,high:7000,count:80},mixDb,vocalDb,spectra})+'\n');
const phrases=read('analysis/phrases.private.json').phrases;
for(let page=0;page<7;page++){
 const canvas=createCanvas(1500,1440),ctx=canvas.getContext('2d');ctx.fillStyle='#0b1020';ctx.fillRect(0,0,1500,1440);
 for(let n=0;n<4;n++){
  const p=phrases[page*4+n],mms=read(`analysis/mms-original/mms-${p.id}.json`).words,whisper=read(`analysis/whisper/align-${p.id}.json`).segments.flatMap((s:{words:unknown[]})=>s.words);
  const a=p.crop[0],b=p.crop[1],left=64,width=1372,top=n*360+42,height=211,x=(t:number)=>left+(t-a)/(b-a)*width;
  ctx.fillStyle='#ebedf5';ctx.font='18px sans-serif';ctx.fillText(`${p.id} · ${p.units.join(' ')} · ${a.toFixed(2)}–${b.toFixed(2)} s`,left,top-18);
  const pixels=ctx.createImageData(width,height);
  for(let column=0;column<width;column++){
   const k=Math.max(0,Math.min(spectra.length-1,Math.round((a+(b-a)*column/width)*200)));
   for(let row=0;row<height;row++){const j=Math.min(79,Math.floor((1-row/height)*80)),db=spectra[k]![j]!,v=Math.max(0,Math.min(1,(db+75)/53)),i=(row*width+column)*4;pixels.data[i]=Math.round(12+220*v*v);pixels.data[i+1]=Math.round(17+172*v);pixels.data[i+2]=Math.round(27+112*v);pixels.data[i+3]=255;}
  }
  ctx.putImageData(pixels,left,top);
  for(let t=Math.ceil(a*5)/5;t<=b;t+=.2){ctx.strokeStyle='#dde4fa28';ctx.beginPath();ctx.moveTo(x(t),top);ctx.lineTo(x(t),top+height+62);ctx.stroke();ctx.fillStyle='#9eb1c9';ctx.font='11px sans-serif';ctx.fillText(t.toFixed(1),x(t)-12,top+height+78);}
  for(const [data,color] of [[mixDb,'#a3afc899'],[vocalDb,'#f1cd82']] as const){ctx.strokeStyle=color;ctx.lineWidth=1.2;ctx.beginPath();let first=true;for(let k=Math.round(a*200);k<=Math.round(b*200);k++){const t=k/200,y=top+height+60-(Math.max(-60,Math.min(-10,data[k]!))+60);first?ctx.moveTo(x(t),y):ctx.lineTo(x(t),y);first=false;}ctx.stroke();}
  mms.forEach((w:{startSeconds:number;endSeconds:number;text:string},i:number)=>{ctx.strokeStyle='#61d9d8b0';ctx.lineWidth=1;ctx.strokeRect(x(w.startSeconds),top+5,x(w.endSeconds)-x(w.startSeconds),height-10);ctx.fillStyle='#a1eee8';ctx.font='13px sans-serif';ctx.fillText(w.text,x(w.startSeconds)+2,top+13+(i%2)*17);const estimate=whisper[i];if(estimate){ctx.strokeStyle='#ee98dc85';ctx.beginPath();ctx.moveTo(x(estimate.start),top+height+7);ctx.lineTo(x(estimate.start),top+height+53);ctx.stroke();}});
  ctx.fillStyle='#8e9bb2';ctx.font='12px sans-serif';ctx.fillText('Vocal-estimate spectrum + yellow RMS / gray original RMS · cyan physical CTC cores · pink conditioned Whisper starts',left,top+height+99);
 }
 writeFileSync(`analysis/acoustic-panels/page-${page+1}.png`,canvas.toBuffer('image/png'));
}
console.log('28 bounded acoustic panels; derived estimates, no human listening claim.');
