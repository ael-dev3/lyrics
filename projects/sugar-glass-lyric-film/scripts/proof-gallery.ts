import {readFileSync,writeFileSync} from 'node:fs';
import {createCanvas,loadImage} from '@napi-rs/canvas';
const format=process.argv[2];if(format!=='landscape'&&format!=='portrait')throw Error('Expected format');
const root=`evidence/final-${format}`,frames:number[]=JSON.parse(readFileSync(root+'/frames.json','utf8')).frames;
const w=format==='landscape'?480:250,h=format==='landscape'?270:444,columns=format==='landscape'?4:5,perPage=format==='landscape'?16:15;
for(let start=0,page=1;start<frames.length;start+=perPage,page++){
 const group=frames.slice(start,start+perPage),canvas=createCanvas(columns*w,Math.ceil(group.length/columns)*(h+28)),ctx=canvas.getContext('2d');
 ctx.fillStyle='#10171a';ctx.fillRect(0,0,canvas.width,canvas.height);
 for(let i=0;i<group.length;i++){const frame=group[i]!,x=(i%columns)*w,y=Math.floor(i/columns)*(h+28);const picture=await loadImage(`${root}/frame-${String(frame).padStart(5,'0')}.png`);ctx.drawImage(picture,x,y,w,h);ctx.fillStyle='#e8e9e3';ctx.font='14px sans-serif';ctx.fillText(`${format} · frame ${frame} · ${(frame/60).toFixed(3)} s`,x+8,y+h+19);}
 writeFileSync(`${root}/sheet-${page}.jpg`,canvas.toBuffer('image/jpeg',90));
}
console.log(format,'proof sheets prepared');
