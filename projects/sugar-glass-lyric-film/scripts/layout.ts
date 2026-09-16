import {GlobalFonts,createCanvas} from '@napi-rs/canvas';
import {readFileSync,writeFileSync} from 'node:fs';
import {parseData} from '../src/schema.ts';
import type {Box,Layouts} from '../src/layout-types.ts';
const data=parseData(JSON.parse(readFileSync('src/cues.json','utf8')));
if(!GlobalFonts.registerFromPath('public/CormorantGaramond-Semibold.ttf','LyricSerif'))throw Error('Font load failed');
const ctx=createCanvas(1920,1920).getContext('2d');
const layouts:Layouts={landscape:{width:1920,height:1080,safeX:112,cues:{}},portrait:{width:1080,height:1920,safeX:86,cues:{}}};
for(const [format,l] of Object.entries(layouts))for(const cue of data.cues){
 const portrait=format==='portrait',backing=cue.layer==='backing',refrain=cue.section.startsWith('Refrain'),chorus=cue.section.startsWith('Chorus')||cue.section==='Post-chorus';
 const fontSize=backing?(portrait?62:64):refrain?(portrait?142:156):chorus?(portrait?108:116):(portrait?102:102),lineHeight=fontSize*1.06;
 ctx.font=`600 ${fontSize}px LyricSerif`;
 const words=cue.source,maxWidth=l.width-2*l.safeX,gap=ctx.measureText(' ').width,widths=words.map(w=>ctx.measureText(w.text).width);
 let best:number[][]=[],score=Infinity;
 const visit=(pos:number,rows:number[][])=>{if(pos===words.length){const lengths=rows.map(r=>r.reduce((n,i)=>n+(widths[i]??0),0)+gap*(r.length-1)),longest=Math.max(...lengths);const cost=rows.length*1000000+lengths.reduce((n,x)=>n+(longest-x)**2,0)+(rows.some(r=>r.length===1)&&words.length>3?350000:0);if(cost<score){score=cost;best=rows;}return;}if(rows.length>=(portrait?3:2))return;let width=0;for(let end=pos;end<words.length;end++){width+=(widths[end]??0)+(end>pos?gap:0);if(width>maxWidth)break;visit(end+1,[...rows,Array.from({length:end-pos+1},(_,j)=>pos+j)]);}};
 visit(0,[]);if(!best.length)throw Error('Cannot fit '+cue.id);
 const center=portrait?(backing?880:1165):(backing?505:730),boxes:Box[]=[];
 best.forEach((row,ri)=>{const width=row.reduce((n,i)=>n+(widths[i]??0),0)+gap*(row.length-1);let x=(l.width-width)/2;const y=center+fontSize*.30+(ri-(best.length-1)/2)*lineHeight;for(const i of row){const w=words[i];if(!w)throw Error('Missing word');boxes.push({id:w.id,text:w.text,x:Math.round(x*1000)/1000,y,width:widths[i]??0});x+=(widths[i]??0)+gap;}});
 l.cues[cue.id]={source:boxes,sourceRows:best.length,fontSize,lineHeight};
}
writeFileSync('src/layout.json',JSON.stringify(layouts,null,2)+'\n');
console.log(Object.fromEntries(Object.entries(layouts).map(([k,l])=>[k,{fontSizes:[...new Set(Object.values(l.cues).map(c=>c.fontSize))],maxRows:Math.max(...Object.values(l.cues).map(c=>c.sourceRows))}])));
