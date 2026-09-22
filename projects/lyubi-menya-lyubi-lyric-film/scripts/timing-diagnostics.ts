import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {createCanvas} from '@napi-rs/canvas';
import {fft} from './signal.ts';
const read=(p:string)=>JSON.parse(readFileSync(p,'utf8'));
const raw=readFileSync('analysis/vocals16.f32'),pcm=new Float32Array(raw.buffer,raw.byteOffset,raw.byteLength/4);
const rows=read('analysis/mms-vocals-lines.json').segments as {id:string;words:{word:string;start:number;end:number}[]}[];
const ws=[{id:'LM-001',a:4.5,b:7},{id:'LM-005',a:24.6,b:27.4},{id:'LM-016',a:92.2,b:95},{id:'LM-019',a:111,b:113.3},{id:'LM-031',a:165.9,b:168.5},{id:'LM-003',a:16.5,b:17.5},{id:'LM-026',a:138.9,b:139.8}];
const width=1400,height=260*ws.length,canvas=createCanvas(width,height),ctx=canvas.getContext('2d');
ctx.fillStyle='#101015';ctx.fillRect(0,0,width,height);ctx.font='16px sans-serif';
const ledger=[];
for(let row=0;row<ws.length;row++){
 const {id,a,b}=ws[row]!,y=row*260,x0=100,x1=1370,w=x1-x0;ctx.fillStyle='white';ctx.fillText(id+' vocal stem '+a.toFixed(2)+'–'+b.toFixed(2)+'s',10,y+22);
 const trace=[];
 for(let x=0;x<w;x++){
  const t=a+x/w*(b-a),center=Math.round(t*16000),n=512,re=new Float64Array(n),im=new Float64Array(n);let rms=0,max=0;
  for(let j=0;j<n;j++){const z=pcm[center+j-n/2]??0;rms+=z*z;max=Math.max(max,Math.abs(z));re[j]=z*(.5-.5*Math.cos(2*Math.PI*j/n));}fft(re,im);rms=Math.sqrt(rms/n);
  if(x%5===0)trace.push({time:t,rms,max});
  for(let j=0;j<110;j++){const hz=100*Math.pow(60,j/109),bin=Math.min(n/2,Math.round(hz/16000*n)),amp=20*Math.log10(Math.max(1e-9,Math.hypot(re[bin]??0,im[bin]??0)/(n/2))),v=Math.max(0,Math.min(255,(amp+80)/70*255));ctx.fillStyle=`rgb(${v},${v},${v})`;ctx.fillRect(x0+x,y+150-j,1,1);}
  ctx.fillStyle='#7fbff5';ctx.fillRect(x0+x,y+190-rms*110,1,Math.max(1,rms*220));
 }
 for(let t=Math.ceil(a*10)/10;t<=b;t+=.1){const x=x0+(t-a)/(b-a)*w;ctx.fillStyle='#999';ctx.fillRect(x,y+205,1,7);if(Math.round(t*10)%2===0)ctx.fillText(t.toFixed(1),x-14,y+230);}
 const words=rows.find(r=>r.id===id)!.words.filter(v=>v.end>a&&v.start<b);
 for(const q of words){const x=x0+(q.start-a)/(b-a)*w,z=x0+(q.end-a)/(b-a)*w;ctx.fillStyle='#ffcc66';ctx.fillRect(x,y+35,2,165);ctx.fillRect(z,y+35,2,165);ctx.fillText(q.word,Math.max(x0,x)+4,y+250);}
 ledger.push({id,start:a,end:b,trace});
}
mkdirSync('evidence/timing',{recursive:true});writeFileSync('evidence/timing/acoustic-boundaries.png',canvas.toBuffer('image/png'));writeFileSync('analysis/acoustic-window-measurements.json',JSON.stringify(ledger,null,2)+'\n');
