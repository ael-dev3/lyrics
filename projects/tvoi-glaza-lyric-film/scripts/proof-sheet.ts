import {readdirSync,writeFileSync} from 'node:fs';
import {createCanvas,loadImage} from '@napi-rs/canvas';
const format=process.argv[2];if(format!=='portrait'&&format!=='landscape')throw Error('format');
const directory=`evidence/final-${format}`,files=readdirSync(directory).filter(p=>/^frame-\d+\.png$/.test(p)).sort();
const width=format==='portrait'?270:480,height=format==='portrait'?480:270,columns=format==='portrait'?4:3,label=26;
const canvas=createCanvas(width*columns,(height+label)*Math.ceil(files.length/columns)),ctx=canvas.getContext('2d');ctx.fillStyle='#101820';ctx.fillRect(0,0,canvas.width,canvas.height);ctx.font='16px sans-serif';
for(let i=0;i<files.length;i++){const x=i%columns*width,y=Math.floor(i/columns)*(height+label),file=files[i]!;ctx.drawImage(await loadImage(directory+'/'+file),x,y,width,height);ctx.fillStyle='#ffffff';ctx.fillText(file.replace('.png','')+' · '+(Number(file.slice(6,11))/60).toFixed(3)+'s',x+10,y+height+18);}
writeFileSync(directory+'/contact-sheet.png',canvas.toBuffer('image/png'));console.log('Saved decoded-picture review sheet',format);
