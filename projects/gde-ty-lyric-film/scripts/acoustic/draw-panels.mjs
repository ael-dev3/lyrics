import {readFileSync,writeFileSync} from 'node:fs';import {createCanvas,GlobalFonts} from '@napi-rs/canvas';
GlobalFonts.registerFromPath('public/fonts/RoomSerif.ttf','Room');
for(const name of ['intro','opening','first-chorus','held-first','answer','final-chorus','final-backing']){
 const m=JSON.parse(readFileSync('analysis/'+name+'-panel.json')),c=createCanvas(1600,800),ctx=c.getContext('2d');ctx.fillStyle='#11171e';ctx.fillRect(0,0,c.width,c.height);ctx.fillStyle='#eee';ctx.font='22px sans-serif';ctx.fillText(name+' · original and estimated vocals · 90–5000Hz · fixed −80..−15dBFS',45,28);
 for(const [j,kind] of ['mix','vocals'].entries()){
  const y=70+j*350,raw=readFileSync('analysis/'+name+'-'+kind+'-spec.f32'),a=new Float32Array(raw.buffer,raw.byteOffset,raw.byteLength/4),p=ctx.createImageData(1500,300);
  for(let i=0;i<1500*300;i++){const row=Math.floor(i/1500),v=a[(299-row)*1500+i%1500],o=i*4;p.data[o]=Math.round(15+v*238);p.data[o+1]=Math.round(19+v*v*210);p.data[o+2]=Math.round(35+Math.sqrt(v)*100);p.data[o+3]=255;}ctx.putImageData(p,60,y);
  ctx.fillStyle='#fff';ctx.font='14px sans-serif';ctx.fillText(kind,7,y+20);
  const step=m.end-m.start>15?1:.5;
  for(let t=Math.ceil(m.start/step)*step;t<m.end;t+=step){const x=60+(t-m.start)/(m.end-m.start)*1500;ctx.fillStyle='#fff3';ctx.fillRect(x,y,1,300);ctx.fillStyle='#cdd';ctx.fillText(t.toFixed(1),x-10,y+320);}
 }
 writeFileSync('analysis/'+name+'-signal.png',c.toBuffer('image/png'));
}
