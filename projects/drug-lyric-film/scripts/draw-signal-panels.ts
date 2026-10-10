import {readFileSync,writeFileSync} from 'node:fs';
import {createCanvas} from '@napi-rs/canvas';
for(const name of ['onsets','verse','love','repeats-first','repeats-last','tail']){
 const root=new URL('../analysis/',import.meta.url),p=JSON.parse(readFileSync(new URL(name+'-panel.json',root),'utf8'));
 const canvas=createCanvas(1500,560),c=canvas.getContext('2d');c.fillStyle='#11151c';c.fillRect(0,0,1500,560);
 c.fillStyle='#e4e5ea';c.font='20px sans-serif';c.fillText(`${name} · original / vocal estimate · ${p.start}–${p.end}s · STFT 64ms / hop 4ms`,20,25);
 for(const [k,kind] of ['mix','vocals'].entries()){
  const buf=readFileSync(new URL(name+'-'+kind+'-spec.f32',root)),y0=70+k*240,im=c.createImageData(p.width,p.rows);
  for(let x=0;x<p.width;x++)for(let y=0;y<p.rows;y++){
   const v=buf.readFloatLE(((p.rows-1-y)*p.width+x)*4),q=(y*p.width+x)*4;
   im.data[q]=Math.round(12+v*230);im.data[q+1]=Math.round(24+v*v*188);im.data[q+2]=Math.round(34+(1-v)*12+v*15);im.data[q+3]=255;
  }c.putImageData(im,70,y0);c.fillStyle='#c7d0de';c.font='13px sans-serif';c.fillText(kind,15,y0+15);
  const first=Math.ceil(p.start*2)/2;
  for(let t=first;t<p.end;t+=.5){const x=70+(t-p.start)/(p.end-p.start)*p.width;c.strokeStyle='#ffffff2b';c.beginPath();c.moveTo(x,y0);c.lineTo(x,y0+p.rows);c.stroke();if(Math.abs(t-Math.round(t))<.01){c.fillStyle='#c7d0de';c.fillText(t.toFixed(0),x-8,y0+p.rows+16)}}
  c.strokeStyle='#78b9b2';c.beginPath();for(let i=0;i<p[kind+'Envelope'].length;i++){const x=70+i/p[kind+'Envelope'].length*p.width,y=y0+p.rows+45-Math.min(1,p[kind+'Envelope'][i]*5)*25;if(i===0)c.moveTo(x,y);else c.lineTo(x,y)}c.stroke();
 }writeFileSync(new URL(name+'-signal.png',root),canvas.toBuffer('image/png'));
}
