import {readFileSync,writeFileSync} from 'node:fs';
import {createCanvas,GlobalFonts} from '@napi-rs/canvas';
GlobalFonts.registerFromPath('public/fonts/Lora.ttf','Lora');
const names=['first-prefix','chorus-enter','chorus-third','measure-repeat','colored-prefix','measure-duet','female-enter','love-pickup','late-bloom','duet'];
for(const name of names){
 const m=JSON.parse(readFileSync('analysis/rebuild/signals/'+name+'.json')),c=createCanvas(1300,720),x=c.getContext('2d');
 x.fillStyle='#101822';x.fillRect(0,0,1300,720);x.fillStyle='#e5e5dc';x.font='21px Lora';x.fillText(name+' · source clock · original / estimated vocals · 90–7000 Hz',45,28);
 for(const [j,kind]of ['mix','vocals'].entries()){
  const raw=readFileSync('analysis/rebuild/signals/'+name+'-'+kind+'.f32'),d=new Float32Array(raw.buffer,raw.byteOffset,raw.byteLength/4),p=x.createImageData(1200,180),top=55+j*225;
  for(let i=0;i<1200*180;i++){const row=Math.floor(i/1200),v=d[(179-row)*1200+i%1200],o=i*4;p.data[o]=Math.round(12+v*240);p.data[o+1]=Math.round(20+v*v*215);p.data[o+2]=Math.round(36+Math.sqrt(v)*95);p.data[o+3]=255}
  x.putImageData(p,60,top);x.fillStyle='#ddd';x.font='14px sans-serif';x.fillText(kind,6,top+18);
  const step=m.end-m.start>5?.5:.1;
  for(let t=Math.ceil(m.start/step)*step;t<m.end;t+=step){const left=60+(t-m.start)/(m.end-m.start)*1200;x.fillStyle='#ffffff21';x.fillRect(left,top,1,180);x.fillStyle='#cdd5d7';x.fillText(t.toFixed(2),left-14,top+199)}
 }
 for(const [j,key]of ['baseline','whisper-vocal','whisper-original','ctc-vocals'].entries()){
  const top=513+j*44;x.fillStyle=['#9bbbda','#e6c178','#e0a087','#93c5a0'][j];x.font='13px sans-serif';x.fillText(key,4,top+12);
  for(const w of m.words){const a=w[key];if(!a||a.end<m.start||a.start>m.end)continue;
   const left=60+(Math.max(a.start,m.start)-m.start)/(m.end-m.start)*1200,right=60+(Math.min(a.end,m.end)-m.start)/(m.end-m.start)*1200;
   x.globalAlpha=.25;x.fillRect(left,top,Math.max(1,right-left),28);x.globalAlpha=1;x.fillRect(left,top,1,28);
   x.font='16px Lora';x.fillText(w.text,left+3,top+19);if(a.score!==undefined&&right-left>50){x.font='11px sans-serif';x.fillText(a.score.toFixed(2),left+3,top+37)}
  }
 }
 x.fillStyle='#aeb9bf';x.font='12px sans-serif';x.fillText('Model paths and spectral evidence are observations. No listening approval or millisecond physical accuracy is claimed.',45,710);
 writeFileSync('analysis/rebuild/signals/'+name+'.png',c.toBuffer('image/png'));
}
