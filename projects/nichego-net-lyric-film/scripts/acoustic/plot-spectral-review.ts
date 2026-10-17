import fs from 'node:fs';
import {createCanvas,GlobalFonts} from '@napi-rs/canvas';
const root=new URL('../../',import.meta.url),read=(p:string)=>JSON.parse(fs.readFileSync(new URL(p,root),'utf8'));
GlobalFonts.registerFromPath(new URL('public/fonts/Cormorant.ttf',root).pathname,'Cormorant');
const ed=read('source/editorial.json');
for(let page=0;page<Math.ceil(ed.phrases.length/4);page++){
 const group=ed.phrases.slice(page*4,page*4+4),can=createCanvas(1800,group.length*320+42),ctx=can.getContext('2d');ctx.fillStyle='#101820';ctx.fillRect(0,0,can.width,can.height);ctx.fillStyle='#eee8df';ctx.font='18px sans-serif';ctx.fillText('Original / estimated vocal · 64 ms Hann, 5 ms view hop · cyan: MMS character cores; magenta: attention boundaries (not accepted)',20,25);
 for(const [row,p] of group.entries()){
  const d=read('analysis/spectral-review/'+p.id+'.json'),m=read('analysis/mms-vocals/mms-'+p.id+'.json'),[lo,hi]=d.crop,top=52+row*320,left=75,width=1685,px=(t:number)=>left+(t-lo)/(hi-lo)*width;
  ctx.fillStyle='#eee8df';ctx.font='600 21px Cormorant';ctx.fillText(p.id+'  '+p.units.join(' '),left,top);
  for(let track=0;track<2;track++){
   const matrix=d.spectrograms[track],sc=createCanvas(matrix[0].length,matrix.length),x=sc.getContext('2d'),data=x.createImageData(sc.width,sc.height);
   for(let y=0;y<sc.height;y++)for(let n=0;n<sc.width;n++){const v=matrix[sc.height-1-y][n]/255,i=(y*sc.width+n)*4;data.data[i]=Math.round(8+247*v*v);data.data[i+1]=Math.round(15+220*v);data.data[i+2]=Math.round(26+145*v);data.data[i+3]=255}
   x.putImageData(data,0,0);ctx.drawImage(sc,left,top+18+track*89,width,82);ctx.fillStyle='#c7ced5';ctx.font='13px sans-serif';ctx.fillText(track?'Vocal':'Mix',5,top+50+track*89);
  }
  const py=(db:number)=>top+202+(1-Math.max(0,Math.min(1,(db+65)/60)))*52;
  for(const [key,color] of [['mixDb','#59717e'],['vocalDb','#ead6ad']] as const){ctx.strokeStyle=color;ctx.beginPath();d.times.forEach((t:number,i:number)=>i?ctx.lineTo(px(t),py(d[key][i])):ctx.moveTo(px(t),py(d[key][i])));ctx.stroke()}
  for(const [i,w] of m.words.entries()){
   ctx.strokeStyle='#5ce0da';ctx.setLineDash([]);ctx.beginPath();ctx.moveTo(px(w.startSeconds),top+16);ctx.lineTo(px(w.startSeconds),top+255);ctx.stroke();ctx.setLineDash([2,4]);ctx.beginPath();ctx.moveTo(px(w.endSeconds),top+16);ctx.lineTo(px(w.endSeconds),top+255);ctx.stroke();ctx.setLineDash([]);
   ctx.fillStyle='#5ce0da';ctx.font='13px sans-serif';ctx.fillText(i+':'+w.text+' '+w.startSeconds.toFixed(2)+'–'+w.endSeconds.toFixed(2),left+i*205,top+276+(i>=8?18:0));
  }
  ctx.fillStyle='#b1b8c0';ctx.font='12px sans-serif';for(let t=Math.ceil(lo*2)/2;t<=hi;t+=.5)ctx.fillText(t.toFixed(1),px(t)-12,top+200);
 }
 fs.writeFileSync(new URL('analysis/spectral-review-page-'+String(page+1).padStart(2,'0')+'.jpg',root),can.toBuffer('image/jpeg',88));
}
console.log('Spectral contact sheets ready');
