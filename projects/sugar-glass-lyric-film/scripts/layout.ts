import {GlobalFonts,createCanvas} from '@napi-rs/canvas';
import {readFileSync,writeFileSync} from 'node:fs';
import {parseData} from '../src/schema.ts';
import type {Box,Layouts,CueLayout} from '../src/layout-types.ts';
const data=parseData(JSON.parse(readFileSync('src/cues.json','utf8')));
if(!GlobalFonts.registerFromPath('public/CormorantGaramond-Semibold.ttf','LyricSerif'))throw Error('Font load failed');
const ctx=createCanvas(1920,1920).getContext('2d');
const layouts:Layouts={landscape:{width:1920,height:1080,fontSize:64,lineHeight:73,safeX:120,cues:{}},portrait:{width:1080,height:1920,fontSize:72,lineHeight:84,safeX:82,cues:{}}};
for(const [format,l] of Object.entries(layouts)){
 ctx.font='600 '+l.fontSize+'px LyricSerif';
 const maxWidth=l.width-l.safeX*2,gap=ctx.measureText(' ').width;
 const fit=(words:{id:string;text:string}[],center:number)=>{
 const widths=words.map(w=>ctx.measureText(w.text).width);let best:number[][]=[];let score=Infinity;
 const visit=(pos:number,rows:number[][])=>{if(pos===words.length){const lengths=rows.map(r=>r.reduce((n,i)=>n+(widths[i]??0),0)+gap*(r.length-1));const max=Math.max(...lengths);const cost=rows.length*1000000+lengths.reduce((n,x)=>n+(max-x)**2,0)+(rows.some(r=>r.length===1)&&words.length>3?180000:0);if(cost<score){score=cost;best=rows;}return;}if(rows.length>=(format==='portrait'?3:2))return;let width=0;for(let end=pos;end<words.length;end++){width+=(widths[end]??0)+(end>pos?gap:0);if(width>maxWidth)break;visit(end+1,[...rows,Array.from({length:end-pos+1},(_,j)=>pos+j)]);}};
 visit(0,[]);if(!best.length)throw Error('Cannot fit '+words.map(w=>w.text).join(' '));
 const boxes:Box[]=[];best.forEach((row,ri)=>{const width=row.reduce((n,i)=>n+(widths[i]??0),0)+gap*(row.length-1);let x=(l.width-width)/2;const y=center+l.fontSize*.30+(ri-(best.length-1)/2)*l.lineHeight;for(const i of row){const w=words[i];if(!w)throw Error('Missing word');boxes.push({...w,x:Math.round(x*1000)/1000,y,width:widths[i]??0});x+=(widths[i]??0)+gap;}});return {boxes,rows:best.length};};
 for(const cue of data.cues){const source=fit(cue.source,format==='landscape'?(cue.layer==='backing'?535:785):(cue.layer==='backing'?780:1170)),target=fit(cue.target,format==='landscape'?(cue.layer==='backing'?640:920):(cue.layer==='backing'?930:1470));const entry:CueLayout={source:source.boxes,target:target.boxes,sourceRows:source.rows,targetRows:target.rows};l.cues[cue.id]=entry;}
}
writeFileSync('src/layout.json',JSON.stringify(layouts,null,2));
console.log(Object.fromEntries(Object.entries(layouts).map(([k,l])=>[k,{font:l.fontSize,maxSourceRows:Math.max(...Object.values(l.cues).map(c=>c.sourceRows)),maxTargetRows:Math.max(...Object.values(l.cues).map(c=>c.targetRows))}])));
