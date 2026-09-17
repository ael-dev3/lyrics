import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {createCanvas} from '@napi-rs/canvas';
import {fft} from './signal.ts';
import {parseData} from '../src/schema.ts';
const d=parseData(JSON.parse(readFileSync('src/cues.json','utf8')));
const core=parseData(JSON.parse(readFileSync('analysis/core-cues.json','utf8')));
const bytes=readFileSync('analysis/vocals16.f32');const pcm=new Float32Array(bytes.buffer,bytes.byteOffset,bytes.length/4);
const words=d.cues.flatMap(c=>c.ru).filter(w=>core.cues.flatMap(c=>c.ru).some(o=>o.id===w.id&&o.endSample!==w.endSample));
mkdirSync('evidence/release-sheets',{recursive:true});
for(let page=0;page<Math.ceil(words.length/8);page++){
 const canvas=createCanvas(1800,1200),ctx=canvas.getContext('2d');ctx.fillStyle='#101116';ctx.fillRect(0,0,1800,1200);
 words.slice(page*8,(page+1)*8).forEach((w,index)=>{
  const o=core.cues.flatMap(c=>c.ru).find(o=>o.id===w.id)!;const col=index%2,row=Math.floor(index/2),x0=col*900+30,y0=row*300+40,width=840,height=210;
  const start=Math.max(w.startSample/d.sampleRate,o.endSample/d.sampleRate-.75),end=w.endSample/d.sampleRate+.4;
  for(let x=0;x<width;x++){
   const t=start+(end-start)*x/width,center=Math.round(t*16000),n=1024,re=new Float64Array(n),im=new Float64Array(n);
   for(let i=0;i<n;i++)re[i]=(pcm[center+i-n/2]??0)*(.5-.5*Math.cos(2*Math.PI*i/n));fft(re,im);
   for(let y=0;y<height;y++){const freq=150+4200*y/height,k=Math.round(freq/16000*n),db=20*Math.log10(Math.max(1e-9,Math.hypot(re[k]??0,im[k]??0)/(n/2))),v=Math.round(255*Math.max(0,Math.min(1,(db+75)/65)));ctx.fillStyle=`rgb(${v},${v},${v})`;ctx.fillRect(x0+x,y0+height-y,1,1);}
  }
  for(const [s,color] of [[o.endSample,'#FF6454'],[w.endSample,'#83DFBD']] as const){const x=x0+(s/d.sampleRate-start)/(end-start)*width;ctx.strokeStyle=color;ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(x,y0);ctx.lineTo(x,y0+height);ctx.stroke();}
  ctx.fillStyle='#F2E9D8';ctx.font='18px sans-serif';ctx.fillText(`${w.id} ${w.text}: core ${(o.endSample/d.sampleRate).toFixed(3)} → release ${(w.endSample/d.sampleRate).toFixed(3)}`,x0,y0-12);ctx.fillText(`${start.toFixed(3)}s  ·  150–4350 Hz  ·  red: core / green: candidate  ·  ${end.toFixed(3)}s`,x0,y0+height+25);
 });
 writeFileSync(`evidence/release-sheets/page-${page+1}.png`,canvas.toBuffer('image/png'));
}
console.log(`${words.length} release extensions plotted across ${Math.ceil(words.length/8)} sheets`);
