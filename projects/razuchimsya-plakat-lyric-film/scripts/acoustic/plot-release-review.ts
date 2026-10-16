import fs from 'node:fs';
import {createCanvas,GlobalFonts} from '@napi-rs/canvas';
const root=new URL('../../',import.meta.url),r=(p:string)=>JSON.parse(fs.readFileSync(new URL(p,root),'utf8'));
GlobalFonts.registerFromPath(new URL('public/fonts/Cormorant.ttf',root).pathname,'Cormorant');
const sum=r('analysis/release-review-summary.json');
for(let page=0;page<Math.ceil(sum.records.length/4);page++){
 const group=sum.records.slice(page*4,page*4+4),can=createCanvas(1800,group.length*270+42),ctx=can.getContext('2d');ctx.fillStyle='#101b24';ctx.fillRect(0,0,can.width,can.height);ctx.fillStyle='#f5ede0';ctx.font='18px sans-serif';ctx.fillText('Original and estimated vocal · 64 ms window / 5 ms hop · red: old focus end · cyan: −10 dB diagnostic · gold: −20 dB diagnostic',24,25);
 for(const [row,item] of group.entries()){
  const d=r('analysis/release-review/'+item.id+'.json'),[lo,hi]=d.crop,top=50+row*270,left=195,width=1560,px=(t:number)=>left+(t-lo)/(hi-lo)*width;
  ctx.fillStyle='#f5ede0';ctx.font='600 23px Cormorant';ctx.fillText(item.word,10,top+24);ctx.font='14px sans-serif';ctx.fillText(item.id,10,top+47);ctx.fillText('Old '+item.oldEnd.toFixed(3),10,top+70);ctx.fillText('Body? '+item.body10dBThresholdCandidate,10,top+92);ctx.fillText('Tail? '+item.tail20dBThresholdCandidate,10,top+114);
  for(let track=0;track<2;track++){
   const m=d.spectrograms[track],sc=createCanvas(m[0].length,m.length),x=sc.getContext('2d'),data=x.createImageData(sc.width,sc.height);
   for(let y=0;y<sc.height;y++)for(let t=0;t<sc.width;t++){const v=m[sc.height-1-y][t]/255,i=(y*sc.width+t)*4;data.data[i]=Math.round(8+247*Math.pow(v,2.2));data.data[i+1]=Math.round(20+215*Math.pow(v,1.1));data.data[i+2]=Math.round(28+130*v);data.data[i+3]=255}
   x.putImageData(data,0,0);ctx.drawImage(sc,left,top+track*83,width,76);ctx.fillStyle='#9badb5';ctx.font='12px sans-serif';ctx.fillText(track===0?'Mix':'Vocal',left+5,top+track*83+14);
  }
  const dbY=(db:number)=>top+169+(1-Math.max(0,Math.min(1,(db+60)/55)))*62;
  for(const [key,color] of [['mixDb','#64737d'],['vocalDb','#f8ecd0']] as const){ctx.strokeStyle=color;ctx.lineWidth=1;ctx.beginPath();d.times.forEach((t:number,i:number)=>{const x=px(t),y=dbY(d[key][i]);if(i===0)ctx.moveTo(x,y);else ctx.lineTo(x,y)});ctx.stroke()}
  for(const [time,color,dash] of [[d.oldEnd,'#f16d6d',[]],[d.body10dBThresholdCandidate,'#5ee5d4',[5,3]],[d.tail20dBThresholdCandidate,'#e9c466',[2,4]]] as const){if(time===null)continue;ctx.strokeStyle=color;ctx.setLineDash([...dash]);ctx.beginPath();ctx.moveTo(px(time),top);ctx.lineTo(px(time),top+233);ctx.stroke();ctx.setLineDash([])}
  ctx.fillStyle='#b4c2c7';ctx.font='12px sans-serif';const step=hi-lo>8?1:.5;for(let t=Math.ceil(lo/step)*step;t<=hi;t+=step){ctx.fillText(t.toFixed(1),px(t)-10,top+250)}
 }
 fs.writeFileSync(new URL(`analysis/release-review-page-${String(page+1).padStart(2,'0')}.jpg`,root),can.toBuffer('image/jpeg',88));
}
console.log('Release diagnostic contact sheets saved; model/threshold markers are not accepted word endpoints.');
