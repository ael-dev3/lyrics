import {writeFileSync} from 'node:fs';
const w=3840,h=2160,b=Buffer.alloc(w*h*3);
for(let y=0;y<h;y++)for(let x=0;x<w;x++){const v=Math.round(255*(.09+.3*(x/w)**2));const p=(y*w+x)*3;b[p]=v;b[p+1]=v;b[p+2]=v;}
writeFileSync('public/shading.ppm',Buffer.concat([Buffer.from(`P6\n${w} ${h}\n255\n`),b]));
