import {GlobalFonts,createCanvas} from '@napi-rs/canvas';
import {readFileSync,writeFileSync} from 'node:fs';
import {parseData} from '../src/schema.ts';
import type {Box,Layouts} from '../src/layout-types.ts';
const data=parseData(JSON.parse(readFileSync('src/cues.json','utf8')));
if(!GlobalFonts.registerFromPath('public/fonts/CormorantGaramond-Semibold.ttf','LiveSerif'))throw Error('Font load failed');
const ctx=createCanvas(1920,1920).getContext('2d');
const layouts:Layouts={landscape:{width:1920,height:1080,fontSize:64,lineHeight:78,safeX:96,cues:{}},portrait:{width:1080,height:1920,fontSize:74,lineHeight:88,safeX:86,cues:{}}};
for(const [format,l] of Object.entries(layouts)){
 ctx.font='600 '+l.fontSize+'px LiveSerif';
 const x0=format==='landscape'?110:86,maxWidth=format==='landscape'?1700:908,gap=ctx.measureText(' ').width;
 const fit=(words:{id:string;text:string;sourceIds?:string[]}[],center:number)=>{
 const widths=words.map(w=>ctx.measureText(w.text).width);let best:number[][]=[];let score=Infinity;
 const visit=(pos:number,rows:number[][])=>{if(pos===words.length){const lengths=rows.map(r=>r.reduce((n,i)=>n+(widths[i]??0),0)+gap*(r.length-1));const max=Math.max(...lengths);const cost=rows.length*1000000+lengths.reduce((n,x)=>n+(max-x)**2,0)+(rows.some(r=>r.length===1)&&words.length>3?180000:0);if(cost<score){score=cost;best=rows;}return;}if(rows.length>=3)return;let width=0;for(let end=pos;end<words.length;end++){width+=(widths[end]??0)+(end>pos?gap:0);if(width>maxWidth)break;const current=words[end]?.sourceIds,following=words[end+1]?.sourceIds;if(current&&following&&JSON.stringify(current)===JSON.stringify(following))continue;visit(end+1,[...rows,Array.from({length:end-pos+1},(_,j)=>pos+j)]);}};
 visit(0,[]);if(!best.length)throw Error('Cannot fit '+words.map(w=>w.text).join(' '));
 const boxes:Box[]=[];best.forEach((row,ri)=>{const width=row.reduce((n,i)=>n+(widths[i]??0),0)+gap*(row.length-1);let x=x0+(maxWidth-width)/2;const y=center+l.fontSize*.34+(ri-(best.length-1)/2)*l.lineHeight;for(const i of row){const w=words[i];if(!w)throw Error('Missing word');boxes.push({...w,x:Math.round(x*1000)/1000,y,width:widths[i]??0});x+=(widths[i]??0)+gap;}});return {boxes,rows:best.length};};
 for(const cue of data.cues){const es=fit(cue.es,format==='landscape'?793:1140),en=fit(cue.en,format==='landscape'?936:1460);l.cues[cue.id]={es:es.boxes,en:en.boxes,esRows:es.rows,enRows:en.rows};}
}
writeFileSync('src/layout.json',JSON.stringify(layouts,null,2)+'\n');
console.log(Object.fromEntries(Object.entries(layouts).map(([k,l])=>[k,{font:l.fontSize,maxEsRows:Math.max(...Object.values(l.cues).map(c=>c.esRows)),maxEnRows:Math.max(...Object.values(l.cues).map(c=>c.enRows))}])));
