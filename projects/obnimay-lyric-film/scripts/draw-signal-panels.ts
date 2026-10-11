import {readFileSync,writeFileSync} from 'node:fs';
import {createCanvas,GlobalFonts} from '@napi-rs/canvas';
const root=new URL('../',import.meta.url);
GlobalFonts.registerFromPath(new URL('public/fonts/NotoSerif.ttf',root).pathname,'Botanical');
const plan=JSON.parse(readFileSync(new URL('source/acoustic-crop-plan.json',root),'utf8')).phrases as {id:string;crop:number[]}[];
const ids=process.argv.slice(2);const names=ids.length?ids:['entry','verse-a','verse-b','pre-1','chorus-1a','chorus-1b','post-1a','post-1b','pre-2','chorus-2a','chorus-2b','post-2a','post-2b','outro'];
type Word={text:string;startSeconds:number;endSeconds:number};
for(const name of names){
 const data=JSON.parse(readFileSync(new URL(`analysis/signal-${name}.json`,root),'utf8'));
 const canvas=createCanvas(1250,760),ctx=canvas.getContext('2d');ctx.fillStyle='#101418';ctx.fillRect(0,0,1250,760);ctx.font='20px Botanical';ctx.fillStyle='#e9e6df';ctx.fillText(name+' · original mix / diagnostic vocal · source seconds',65,27);
 const width=1100,height=235,left=70;
 for(const [kind,top] of [['mix',80],['vocals',435]] as const){
  const values=data[kind+'Spectrogram'] as number[];const image=ctx.createImageData(width,height);
  for(let y=0;y<height;y++)for(let x=0;x<width;x++){
   const bin=Math.floor((height-1-y)/(height-1)*95),v=(values[bin*width+x]??0)/255,at=(y*width+x)*4;
   image.data[at]=Math.round(255*Math.max(0,(v-.15)*1.3));image.data[at+1]=Math.round(255*v*v);image.data[at+2]=Math.round(160*v);image.data[at+3]=255;
  }ctx.putImageData(image,left,top);
  const rms=data[kind+'Rms'] as number[];ctx.strokeStyle='#8ccbd9';ctx.lineWidth=1.5;ctx.beginPath();
  rms.forEach((v,i)=>{const x=left+i/rms.length*width,db=20*Math.log10(Math.max(v,1e-6)),y=top+height+50-Math.max(0,Math.min(1,(db+60)/60))*45;i===0?ctx.moveTo(x,y):ctx.lineTo(x,y)});ctx.stroke();
  ctx.font='14px Botanical';ctx.fillStyle='#bdc9cc';ctx.fillText(kind,left-60,top+20);
  for(let t=Math.ceil(data.start*2)/2;t<data.end;t+=.5){const x=left+(t-data.start)/(data.end-data.start)*width;ctx.strokeStyle='#c7d6da26';ctx.beginPath();ctx.moveTo(x,top);ctx.lineTo(x,top+height+50);ctx.stroke();ctx.fillStyle='#c0cbd1';ctx.fillText(t.toFixed(1),x-11,top+height+73)}
 }
 const phrase=plan.find(p=>p.crop[0]!<=data.start+.8&&p.crop[1]!>=data.end-.8);
 if(phrase){
  const mms=JSON.parse(readFileSync(new URL(`analysis/mms-vocals/mms-${phrase.id}.json`,root),'utf8')).words as Word[];
  const whisper=JSON.parse(readFileSync(new URL(`analysis/whisper-${phrase.id}.json`,root),'utf8')).segments.flatMap((s:{words:{word:string;start:number;end:number}[]})=>s.words);
  let row=0;for(let i=0;i<mms.length;i++){
   const word=mms[i]!;if(word.startSeconds<data.start||word.startSeconds>data.end)continue;
   const x=left+(word.startSeconds-data.start)/(data.end-data.start)*width;
   ctx.strokeStyle='#79dabf';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(x,435);ctx.lineTo(x,670);ctx.stroke();ctx.fillStyle='#a5efd1';ctx.font='15px Botanical';ctx.fillText(word.text,x-3,408+(row++%2)*18);
   const other=whisper[i];if(other){const wx=left+(other.start-data.start)/(data.end-data.start)*width;ctx.strokeStyle='#de80d4';ctx.beginPath();ctx.moveTo(wx,80);ctx.lineTo(wx,315);ctx.stroke();}
  }
 }writeFileSync(new URL(`analysis/signal-${name}.png`,root),canvas.toBuffer('image/png'));
}
console.log(JSON.stringify({panels:names,scope:'Signal/model observations, not actual listening or accepted word boundaries.'}));
